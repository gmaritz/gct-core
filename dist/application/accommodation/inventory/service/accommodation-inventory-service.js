"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationInventoryService = void 0;
const capabilities_1 = require("../../capabilities");
const validation_1 = require("../validation");
function hasAvailabilityMethod(provider) {
    return typeof provider?.availability === "function";
}
function createRequest(query) {
    return Object.freeze({
        identifier: query.identifier,
        checkInDate: query.checkInDate,
        checkOutDate: query.checkOutDate,
        adults: query.adults,
        children: query.children,
        rooms: query.rooms,
        context: query.context,
    });
}
function cloneAccommodation(accommodation) {
    return Object.freeze({
        identity: Object.freeze({ ...accommodation.identity }),
        category: accommodation.category,
        location: Object.freeze({ ...accommodation.location }),
        rating: Object.freeze({ ...accommodation.rating }),
        images: Object.freeze(accommodation.images.map((image) => Object.freeze({ ...image }))),
        amenities: Object.freeze([...accommodation.amenities]),
        policies: Object.freeze(accommodation.policies.map((policy) => Object.freeze({ ...policy }))),
        contacts: Object.freeze(accommodation.contacts.map((contact) => Object.freeze({ ...contact }))),
        providerReference: Object.freeze({ ...accommodation.providerReference }),
    });
}
function cloneMetadata(metadata) {
    return Object.freeze({
        provider: metadata.provider,
        generatedAt: new Date(metadata.generatedAt),
        version: metadata.version,
    });
}
function freezeAvailabilityResult(result) {
    return Object.freeze({
        accommodation: cloneAccommodation(result.accommodation),
        available: result.available,
        metadata: cloneMetadata(result.metadata),
    });
}
class AccommodationInventoryService {
    constructor(providerRegistry, validator = new validation_1.AccommodationInventoryValidator()) {
        this.providerRegistry = providerRegistry;
        this.validator = validator;
    }
    async execute(query) {
        const request = createRequest(query);
        const validationResult = this.validator.validate(request);
        if (!validationResult.valid) {
            throw new Error(`Accommodation inventory validation failed: ${validationResult.errors
                .map((error) => error.code)
                .join(", ")}`);
        }
        const providers = this.providerRegistry.findProviders(capabilities_1.AccommodationProviderCapabilityType.AVAILABILITY);
        const providerResults = await Promise.allSettled(providers.map(async (provider) => {
            if (!hasAvailabilityMethod(provider)) {
                throw new Error(`Provider does not implement inventory retrieval: ${provider.providerId}`);
            }
            return provider.availability(request);
        }));
        const successfulResults = providerResults
            .filter((providerResult) => providerResult.status === "fulfilled")
            .map((providerResult) => providerResult.value);
        if (successfulResults.length === 0) {
            throw new Error("No accommodation inventory providers returned availability");
        }
        return freezeAvailabilityResult(successfulResults[0]);
    }
}
exports.AccommodationInventoryService = AccommodationInventoryService;
//# sourceMappingURL=accommodation-inventory-service.js.map