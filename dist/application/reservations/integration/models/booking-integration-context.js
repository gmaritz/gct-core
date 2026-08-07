"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingIntegrationContext = createBookingIntegrationContext;
function cloneDate(value) {
    return new Date(value.getTime());
}
function freezeBookingRequest(request) {
    return Object.freeze({
        operation: request.operation,
        reservationId: request.reservationId,
        payload: request.payload ? Object.freeze({ ...request.payload }) : undefined,
    });
}
function freezeProviderSelection(selection) {
    return Object.freeze({
        providerId: selection.providerId,
        channel: selection.channel,
    });
}
function freezeCorrelation(correlation) {
    return Object.freeze({
        requestId: correlation.requestId,
        correlationId: correlation.correlationId,
        traceId: correlation.traceId,
    });
}
function createBookingIntegrationContext(request) {
    return Object.freeze({
        reservation: request.reservation,
        bookingRequest: freezeBookingRequest(request.bookingRequest),
        providerSelection: freezeProviderSelection(request.providerSelection),
        correlation: freezeCorrelation(request.correlation),
        metadata: Object.freeze({
            createdAt: cloneDate(new Date()),
            version: "1.0.0",
            source: request.metadata?.source ?? "APP-004.8",
        }),
    });
}
//# sourceMappingURL=booking-integration-context.js.map