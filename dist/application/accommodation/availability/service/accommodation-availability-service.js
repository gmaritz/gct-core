"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAccommodationAvailabilityService = void 0;
const capabilities_1 = require("../../capabilities");
const catalogue_1 = require("../../catalogue");
const client_1 = require("../../providers/hotelbeds/client");
function hasAvailabilityExecution(provider) {
    return (typeof provider?.executeAvailabilityRequests === "function" &&
        typeof provider?.mapAvailabilityResponse === "function");
}
function createUnavailableResult(provider) {
    return Object.freeze({
        kind: "NO_AVAILABILITY",
        available: false,
        metadata: Object.freeze({
            provider,
            generatedAt: new Date(),
            version: "1.0.0",
        }),
    });
}
function toCandidateSelection(criteria) {
    return {
        hotelCodes: criteria.hotelCodes ?? [],
        destinationCode: criteria.destinationCode,
        zoneCode: criteria.zoneCode,
        starGrading: criteria.starGrading,
    };
}
class DefaultAccommodationAvailabilityService {
    constructor(providerRegistry, catalogueService = new catalogue_1.HotelCatalogueService({
        findActive: async () => [],
        upsert: async () => undefined,
        deactivateMissing: async () => undefined,
    }), requestBuilder = new client_1.HotelbedsAvailabilityRequestBuilder()) {
        this.providerRegistry = providerRegistry;
        this.catalogueService = catalogueService;
        this.requestBuilder = requestBuilder;
    }
    async execute(query) {
        const { criteria } = query;
        const candidateSelection = await this.catalogueService.select(toCandidateSelection(criteria));
        if (candidateSelection.hotelCodes.length === 0) {
            const provider = this.providerRegistry.resolveAll()[0]?.providerId ?? "hotelbeds";
            return createUnavailableResult(provider);
        }
        const requests = this.requestBuilder.build(criteria, candidateSelection.hotelCodes.map((hotelCode) => ({ hotelCode })));
        if (requests.length === 0) {
            const provider = this.providerRegistry.resolveAll()[0]?.providerId ?? "hotelbeds";
            return createUnavailableResult(provider);
        }
        const providers = this.providerRegistry.findProviders(capabilities_1.AccommodationProviderCapabilityType.AVAILABILITY);
        const provider = providers[0] ?? this.providerRegistry.resolveAll().find(hasAvailabilityExecution);
        if (!provider || !hasAvailabilityExecution(provider)) {
            throw new Error("No accommodation availability provider is registered");
        }
        const executionResult = await provider.executeAvailabilityRequests(requests);
        const mappingResult = provider.mapAvailabilityResponse(executionResult.responses);
        if (mappingResult.kind === "NO_AVAILABILITY") {
            return Object.freeze({
                kind: "NO_AVAILABILITY",
                available: false,
                metadata: Object.freeze({
                    provider: "hotelbeds",
                    generatedAt: new Date(),
                    version: "1.0.0",
                }),
            });
        }
        return Object.freeze({
            ...mappingResult.result,
            results: mappingResult.results ?? [mappingResult.result],
        });
    }
}
exports.DefaultAccommodationAvailabilityService = DefaultAccommodationAvailabilityService;
//# sourceMappingURL=accommodation-availability-service.js.map