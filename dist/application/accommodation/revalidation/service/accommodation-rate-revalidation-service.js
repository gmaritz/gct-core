"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationRateRevalidationService = void 0;
const capabilities_1 = require("../../capabilities");
function hasRevalidation(provider) {
    return typeof provider?.revalidate === "function";
}
function freezeRequest(request) {
    return Object.freeze({
        ...request,
        stayPeriod: Object.freeze({ ...request.stayPeriod }),
        occupancy: Object.freeze({
            rooms: Object.freeze(request.occupancy.rooms.map((room) => Object.freeze({
                adults: room.adults,
                children: room.children,
                childAges: Object.freeze([...room.childAges]),
            }))),
        }),
    });
}
class AccommodationRateRevalidationService {
    constructor(providerRegistry) {
        this.providerRegistry = providerRegistry;
    }
    async execute(request) {
        const frozenRequest = freezeRequest(request);
        if (frozenRequest.providerReference.provider !== request.rate.reference.provider) {
            throw new Error("Revalidation provider reference does not match the selected rate.");
        }
        if (request.rate.status === "BOOKABLE") {
            return Object.freeze({
                status: "VALID",
                accommodation: request.accommodation,
                room: request.room,
                previousRate: request.rate,
                currentRate: request.rate,
                packageStopId: request.packageStopId,
                provider: request.providerReference.provider,
            });
        }
        if (request.rate.status !== "RECHECK_REQUIRED") {
            throw new Error("Only BOOKABLE and RECHECK_REQUIRED rates can be revalidated.");
        }
        const provider = this.providerRegistry
            .findProviders(capabilities_1.AccommodationProviderCapabilityType.REVALIDATION)
            .find((candidate) => hasRevalidation(candidate));
        if (!provider) {
            throw new Error("No accommodation rate revalidation provider is registered.");
        }
        return provider.revalidate(frozenRequest);
    }
}
exports.AccommodationRateRevalidationService = AccommodationRateRevalidationService;
//# sourceMappingURL=accommodation-rate-revalidation-service.js.map