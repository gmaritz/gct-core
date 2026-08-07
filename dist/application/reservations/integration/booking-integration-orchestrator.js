"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingIntegrationOrchestrator = void 0;
const models_1 = require("./models");
function resolveOperation(gateway, context) {
    switch (context.bookingRequest.operation) {
        case "CREATE":
            return gateway.createBooking(context);
        case "AMEND":
            return gateway.amendBooking(context);
        case "CANCEL":
            return gateway.cancelBooking(context);
        case "STATUS":
            return gateway.retrieveBookingStatus(context);
        default:
            return Promise.resolve({
                successful: false,
                providerIdentifier: context.providerSelection.providerId,
                reservationStatus: context.reservation.status,
                errors: ["Unsupported booking operation."],
            });
    }
}
function toReservationStatus(response, fallbackStatus) {
    return response.reservationStatus ?? fallbackStatus;
}
class BookingIntegrationOrchestrator {
    constructor(gateway) {
        this.gateway = gateway;
    }
    async execute(request) {
        const context = (0, models_1.createBookingIntegrationContext)(request);
        const response = await resolveOperation(this.gateway, context);
        return (0, models_1.createBookingIntegrationResult)({
            successful: response.successful,
            providerIdentifier: response.providerIdentifier || context.providerSelection.providerId,
            providerBookingReference: response.providerBookingReference,
            reservationStatus: toReservationStatus(response, context.reservation.status),
            errors: response.errors,
            warnings: response.warnings,
            metadata: {
                generatedAt: new Date(),
                version: "1.0.0",
                requestId: context.correlation.requestId,
                correlationId: context.correlation.correlationId,
                operation: context.bookingRequest.operation,
            },
        });
    }
}
exports.BookingIntegrationOrchestrator = BookingIntegrationOrchestrator;
//# sourceMappingURL=booking-integration-orchestrator.js.map