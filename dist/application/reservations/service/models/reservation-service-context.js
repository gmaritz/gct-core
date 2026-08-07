"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservationServiceContext = createReservationServiceContext;
exports.withValidationResult = withValidationResult;
exports.withPolicyResult = withPolicyResult;
exports.withBuilderResult = withBuilderResult;
function cloneDate(value) {
    return new Date(value.getTime());
}
function createReservationServiceContext(request) {
    return Object.freeze({
        reservationRequest: request,
        metadata: Object.freeze({
            createdAt: new Date(),
            version: "1.0.0",
            requestId: request.query.requestId,
        }),
    });
}
function withValidationResult(context, validationResult) {
    return Object.freeze({
        ...context,
        validationResult,
        metadata: Object.freeze({
            createdAt: cloneDate(context.metadata.createdAt),
            version: context.metadata.version,
            requestId: context.metadata.requestId,
        }),
    });
}
function withPolicyResult(context, policyResult) {
    return Object.freeze({
        ...context,
        policyResult,
        metadata: Object.freeze({
            createdAt: cloneDate(context.metadata.createdAt),
            version: context.metadata.version,
            requestId: context.metadata.requestId,
        }),
    });
}
function withBuilderResult(context, builderResult) {
    return Object.freeze({
        ...context,
        builderResult,
        reservation: builderResult.reservation,
        metadata: Object.freeze({
            createdAt: cloneDate(context.metadata.createdAt),
            version: context.metadata.version,
            requestId: context.metadata.requestId,
        }),
    });
}
//# sourceMappingURL=reservation-service-context.js.map