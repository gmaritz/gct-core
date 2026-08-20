"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationCancellationService = void 0;
const capabilities_1 = require("../../capabilities");
function hasCancellation(provider) {
    return typeof provider.cancelAccommodation === "function";
}
function validate(request) {
    if (!request.reservationId.trim())
        throw new Error("Cancellation reservation identity is required.");
    if (!request.provider.trim())
        throw new Error("Cancellation provider is required.");
    if (!request.supplierBookingReference.trim())
        throw new Error("Supplier booking reference is required.");
    if (!request.idempotencyKey.trim())
        throw new Error("Cancellation idempotency key is required.");
    if (request.reservationStatus === "CANCELLED")
        return;
    if (request.reservationStatus !== "CONFIRMED")
        throw new Error("Only confirmed accommodation bookings can be cancelled.");
}
class AccommodationCancellationService {
    constructor(providerRegistry) {
        this.providerRegistry = providerRegistry;
    }
    async execute(request) {
        validate(request);
        if (request.reservationStatus === "CANCELLED") {
            return Object.freeze({
                successful: true,
                status: "ALREADY_CANCELLED",
                reservationId: request.reservationId,
                provider: request.provider,
                supplierBookingReference: request.supplierBookingReference,
                packageStopId: request.packageStopId,
                errors: Object.freeze([]),
                warnings: Object.freeze(["Accommodation booking was already cancelled."]),
            });
        }
        const provider = this.providerRegistry
            .findProviders(capabilities_1.AccommodationProviderCapabilityType.CANCELLATION)
            .find((candidate) => hasCancellation(candidate));
        if (!provider)
            throw new Error(`No accommodation cancellation provider is registered for ${request.provider}.`);
        if (provider.providerId !== request.provider) {
            throw new Error("Cancellation provider does not match the confirmed booking provider.");
        }
        return provider.cancelAccommodation(request);
    }
}
exports.AccommodationCancellationService = AccommodationCancellationService;
//# sourceMappingURL=accommodation-cancellation-service.js.map