"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationBookingDetailsService = void 0;
const capabilities_1 = require("../../capabilities");
function hasDetails(provider) {
    return typeof provider.getBookingDetails === "function";
}
class AccommodationBookingDetailsService {
    constructor(providerRegistry) {
        this.providerRegistry = providerRegistry;
    }
    async execute(request) {
        if (!request.provider.trim())
            throw new Error("Booking details provider is required.");
        if (!request.supplierBookingReference.trim())
            throw new Error("Supplier booking reference is required.");
        const provider = this.providerRegistry
            .findProviders(capabilities_1.AccommodationProviderCapabilityType.BOOKING_DETAILS)
            .find((candidate) => hasDetails(candidate));
        if (!provider) {
            return Object.freeze({
                successful: false,
                status: "FAILED",
                reservationId: request.reservationId,
                provider: request.provider,
                supplierBookingReference: request.supplierBookingReference,
                rooms: Object.freeze([]),
                packageStopId: request.packageStopId,
                errors: Object.freeze([{ code: "UNSUPPORTED", message: "Booking details are not supported by the original provider." }]),
                warnings: Object.freeze([]),
            });
        }
        if (provider.providerId !== request.provider)
            throw new Error("Booking details provider does not match the original booking provider.");
        return provider.getBookingDetails(request);
    }
}
exports.AccommodationBookingDetailsService = AccommodationBookingDetailsService;
//# sourceMappingURL=accommodation-booking-details-service.js.map