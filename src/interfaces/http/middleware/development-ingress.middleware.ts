import { timingSafeEqual } from "crypto";
import { isIP } from "net";
import { NextFunction, Request, Response } from "express";
import { DevelopmentIngressConfig } from "../../../config/development-ingress.config";
import { isPayFastItnSourceAddress } from "../../../infrastructure/payments/payfast/payfast-itn-security";

declare module "express-serve-static-core" {
	interface Request {
		developmentPayFastSource?: string;
	}
}

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

export function isAllowedDevelopmentIngressRoute(method: string, rawUrl: string): boolean {
	const path = rawUrl.split("?", 1)[0]!;
	if (method === "GET") return path === "/ui/placeholder" || getJourney.test(path) || assets.has(path);
	if (method === "POST") return path === "/api/v1/payfast/itn" || postJourney.test(path);
	return false;
}

function singleRawHeader(request: Request, name: string): string | undefined {
	const values: string[] = [];
	for (let i = 0; i < request.rawHeaders.length; i += 2) {
		if (request.rawHeaders[i]?.toLowerCase() === name) values.push(request.rawHeaders[i + 1] ?? "");
	}
	return values.length === 1 ? values[0] : undefined;
}

export function createDevelopmentIngressMiddleware(config: DevelopmentIngressConfig) {
	return (request: Request, response: Response, next: NextFunction): void => {
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
		if (
			peer !== config.peerAddress
			|| !credential || !/^[a-f0-9]{64}$/.test(credential)
			|| !timingSafeEqual(Buffer.from(credential), Buffer.from(config.credential))
			|| !source || isIP(source) === 0 || !isPayFastItnSourceAddress(source)
		) {
			response.status(403).type("text/plain").send("Payment notification ingress is not permitted.");
			return;
		}
		request.developmentPayFastSource = source;
		next();
	};
}
