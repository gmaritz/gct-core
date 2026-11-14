"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAllowedDevelopmentIngressRoute = isAllowedDevelopmentIngressRoute;
exports.createDevelopmentIngressMiddleware = createDevelopmentIngressMiddleware;
const crypto_1 = require("crypto");
const net_1 = require("net");
const payfast_itn_security_1 = require("../../../infrastructure/payments/payfast/payfast-itn-security");
const journey = "/ui/journeys/[A-Za-z0-9-]{1,128}";
const getJourney = new RegExp(`^${journey}(?:/(?:accommodation|quote|guest-information|review|payment|payment/return|payment/cancel|confirmation))?$`);
const postJourney = new RegExp(`^${journey}/(?:select|accommodation|guest-information|review|payment)$`);
const assets = new Set([
    "/css/app.css",
    ...["reset", "tokens", "typography"].map((name) => `/css/base/${name}.css`),
    ...["container", "site", "header", "footer"].map((name) => `/css/layouts/${name}.css`),
    ...["navigation", "journey-card", "homepage-showcase", "button", "card", "forms", "feedback", "price-display", "action-group"].map((name) => `/css/components/${name}.css`),
    ...["placeholder", "journey-detail", "accommodation-selection", "journey-quote", "guest-information", "reservation-review", "payment-experience", "booking-confirmation"].map((name) => `/css/pages/${name}.css`),
    "/css/utilities/helpers.css",
    "/js/components/navigation.js", "/js/components/homepage-showcase.js", "/js/app.js",
    "/js/cape-winelands-booking.js", "/js/cape-winelands-accommodation.js",
    "/images/favicon.ico", "/images/hero/hero-cape-town-1600x900.webp",
    "/images/journeys/cape-winelands-1600x900.webp", "/images/journeys/atlantic-seaboard-1600x900.webp",
    "/images/journeys/franschhoek-valley-1600x900.webp",
]);
function isAllowedDevelopmentIngressRoute(method, rawUrl) {
    const path = rawUrl.split("?", 1)[0];
    if (method === "GET")
        return path === "/ui/placeholder" || getJourney.test(path) || assets.has(path);
    if (method === "POST")
        return path === "/api/v1/payfast/itn" || postJourney.test(path);
    return false;
}
function singleRawHeader(request, name) {
    const values = [];
    for (let i = 0; i < request.rawHeaders.length; i += 2) {
        if (request.rawHeaders[i]?.toLowerCase() === name)
            values.push(request.rawHeaders[i + 1] ?? "");
    }
    return values.length === 1 ? values[0] : undefined;
}
function createDevelopmentIngressMiddleware(config) {
    return (request, response, next) => {
        if (!isAllowedDevelopmentIngressRoute(request.method, request.originalUrl)) {
            response.status(404).type("text/plain").send("Not found.");
            return;
        }
        if (request.method !== "POST" || request.originalUrl.split("?", 1)[0] !== "/api/v1/payfast/itn") {
            next();
            return;
        }
        const peer = (request.socket.remoteAddress ?? "").toLowerCase().replace(/^::ffff:/, "");
        const credential = singleRawHeader(request, "x-gct-ingress-token");
        const source = singleRawHeader(request, "x-gct-itn-source-ip");
        if (peer !== config.peerAddress
            || !credential || !/^[a-f0-9]{64}$/.test(credential)
            || !(0, crypto_1.timingSafeEqual)(Buffer.from(credential), Buffer.from(config.credential))
            || !source || (0, net_1.isIP)(source) === 0 || !(0, payfast_itn_security_1.isPayFastItnSourceAddress)(source)) {
            response.status(403).type("text/plain").send("Payment notification ingress is not permitted.");
            return;
        }
        request.developmentPayFastSource = source;
        next();
    };
}
//# sourceMappingURL=development-ingress.middleware.js.map