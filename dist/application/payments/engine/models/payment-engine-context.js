"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentEngineContext = createPaymentEngineContext;
exports.withEngineStage = withEngineStage;
function cloneDate(value) {
    return new Date(value.getTime());
}
function deriveRequestId(request) {
    if (request.requestId && request.requestId.trim().length > 0) {
        return request.requestId.trim();
    }
    if (request.paymentRequest.reference?.paymentId) {
        return request.paymentRequest.reference.paymentId;
    }
    if (request.paymentRequest.gatewayContext?.requestId) {
        return request.paymentRequest.gatewayContext.requestId;
    }
    return "payment-request";
}
function createPaymentEngineContext(request) {
    return Object.freeze({
        paymentRequest: request.paymentRequest,
        metadata: Object.freeze({
            startedAt: new Date(),
            version: "1.0.0",
            requestId: deriveRequestId(request),
            source: request.source ?? "PaymentEngine",
            stages: Object.freeze(["CONTEXT"]),
        }),
    });
}
function withEngineStage(metadata, stage) {
    return Object.freeze({
        startedAt: cloneDate(metadata.startedAt),
        version: metadata.version,
        requestId: metadata.requestId,
        source: metadata.source,
        stages: Object.freeze([...metadata.stages, stage]),
    });
}
//# sourceMappingURL=payment-engine-context.js.map