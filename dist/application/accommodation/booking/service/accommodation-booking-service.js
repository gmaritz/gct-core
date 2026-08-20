"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationBookingService = void 0;
const capabilities_1 = require("../../capabilities");
function hasBooking(provider) {
    return typeof provider?.book === "function";
}
function validateRequest(request) {
    if (!request.providerReference.opaqueReference.trim())
        throw new Error("Booking supplier reference is required.");
    if (!request.idempotencyKey.trim())
        throw new Error("Booking idempotency key is required.");
    if (request.rate.status === "RECHECK_REQUIRED" && request.validatedRate?.status !== "BOOKABLE") {
        throw new Error("RECHECK rate requires a successful revalidation result before booking.");
    }
    if (request.rate.status !== "BOOKABLE" && request.rate.status !== "RECHECK_REQUIRED") {
        throw new Error("Selected rate is not bookable.");
    }
    if (request.stayPeriod.checkIn >= request.stayPeriod.checkOut)
        throw new Error("Invalid booking stay period.");
    if (request.occupancy.rooms.length === 0)
        throw new Error("Booking occupancy requires at least one room.");
    if (request.guests.some((guest) => guest.roomIndex < 0 || guest.roomIndex >= request.occupancy.rooms.length)) {
        throw new Error("Booking guest room association is invalid.");
    }
    if (request.guests.some((guest) => guest.type === "CHILD" && (guest.age === undefined || guest.age < 0))) {
        throw new Error("Child booking guests require a valid age.");
    }
}
class AccommodationBookingService {
    constructor(providerRegistry) {
        this.providerRegistry = providerRegistry;
    }
    async execute(request) {
        validateRequest(request);
        const provider = this.providerRegistry
            .findProviders(capabilities_1.AccommodationProviderCapabilityType.BOOKING)
            .find((candidate) => hasBooking(candidate));
        if (!provider)
            throw new Error("No accommodation booking provider is registered.");
        return provider.book(request);
    }
}
exports.AccommodationBookingService = AccommodationBookingService;
//# sourceMappingURL=accommodation-booking-service.js.map