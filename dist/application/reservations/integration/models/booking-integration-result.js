"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingIntegrationResult = createBookingIntegrationResult;
function createBookingIntegrationResult(input) {
    return Object.freeze({
        successful: input.successful,
        providerIdentifier: input.providerIdentifier,
        providerBookingReference: input.providerBookingReference ?? null,
        reservationStatus: input.reservationStatus,
        errors: Object.freeze([...(input.errors ?? [])]),
        warnings: Object.freeze([...(input.warnings ?? [])]),
        metadata: Object.freeze({
            generatedAt: new Date(input.metadata.generatedAt.getTime()),
            version: input.metadata.version,
            requestId: input.metadata.requestId,
            correlationId: input.metadata.correlationId,
            operation: input.metadata.operation,
        }),
    });
}
//# sourceMappingURL=booking-integration-result.js.map