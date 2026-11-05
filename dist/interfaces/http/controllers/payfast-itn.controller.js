"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePayFastItnPeerAddress = resolvePayFastItnPeerAddress;
exports.receivePayFastItn = receivePayFastItn;
const payments_1 = require("../../../application/payments");
const payfast_itn_factory_1 = require("../../../infrastructure/payments/payfast/payfast-itn-factory");
const payfast_itn_security_1 = require("../../../infrastructure/payments/payfast/payfast-itn-security");
const logging_1 = require("../../../bootstrap/logging");
function requestCorrelationId(request) {
    return request.requestId ?? "unknown";
}
function resolvePayFastItnPeerAddress(request, trustedProxyAddresses = []) {
    const peerAddress = request.socket.remoteAddress ?? "";
    const normalizedPeer = peerAddress.toLowerCase().replace(/^::ffff:/, "");
    const trustedPeers = new Set(trustedProxyAddresses.map((address) => address.trim().toLowerCase().replace(/^::ffff:/, "")));
    if (!trustedPeers.has(normalizedPeer))
        return peerAddress;
    const forwardedFor = request.header("X-Forwarded-For")?.trim();
    if (!forwardedFor || forwardedFor.includes(","))
        return "";
    return forwardedFor;
}
async function receivePayFastItn(request, response) {
    if (!request.is("application/x-www-form-urlencoded")) {
        (0, logging_1.getLogger)().warn("payfast_itn_rejected", { requestId: requestCorrelationId(request), outcome: "content_type" });
        response.status(415).type("text/plain").send("Unsupported notification format.");
        return;
    }
    if (!Buffer.isBuffer(request.body)) {
        (0, logging_1.getLogger)().warn("payfast_itn_rejected", { requestId: requestCorrelationId(request), outcome: "body_format" });
        response.status(400).type("text/plain").send("Malformed payment notification.");
        return;
    }
    try {
        const trustedProxyAddresses = process.env.PAYFAST_ITN_TRUSTED_PROXY_IPS?.split(",").map((address) => address.trim()).filter(Boolean) ?? [];
        await (0, payfast_itn_factory_1.createPayFastItnProcessor)().process(request.body, resolvePayFastItnPeerAddress(request, trustedProxyAddresses));
        (0, logging_1.getLogger)().info("payfast_itn_processed", { requestId: requestCorrelationId(request), outcome: "accepted" });
        response.status(200).type("text/plain").send("OK");
    }
    catch (error) {
        if (error instanceof payfast_itn_security_1.PayFastItnRequestError) {
            (0, logging_1.getLogger)().warn("payfast_itn_rejected", { requestId: requestCorrelationId(request), outcome: `validation_${error.statusCode}` });
            response.status(error.statusCode).type("text/plain").send(error.message);
            return;
        }
        if (error instanceof payments_1.PaymentAttemptNotFoundError) {
            (0, logging_1.getLogger)().warn("payfast_itn_rejected", { requestId: requestCorrelationId(request), outcome: "unmatched_attempt" });
            response.status(404).type("text/plain").send("Payment notification could not be correlated.");
            return;
        }
        if (error instanceof payments_1.PaymentAttemptNotificationConflictError) {
            (0, logging_1.getLogger)().warn("payfast_itn_rejected", { requestId: requestCorrelationId(request), outcome: "state_conflict" });
            response.status(409).type("text/plain").send("Payment notification conflicts with the current payment state.");
            return;
        }
        (0, logging_1.getLogger)().error("payfast_itn_processing_failed", { requestId: requestCorrelationId(request), outcome: "transient_failure" });
        response.status(503).type("text/plain").send("Payment notification processing is temporarily unavailable.");
    }
}
//# sourceMappingURL=payfast-itn.controller.js.map