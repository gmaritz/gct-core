"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAccommodationDiscoveryEngine = void 0;
const capabilities_1 = require("../capabilities");
const validation_1 = require("./validation");
function createMetadata() {
    return {
        generatedAt: new Date(),
        version: "1.0.0",
    };
}
class DefaultAccommodationDiscoveryEngine {
    constructor(providerRegistry, queryValidator = new validation_1.AccommodationQueryValidator()) {
        this.providerRegistry = providerRegistry;
        this.queryValidator = queryValidator;
    }
    async search(query) {
        const validationResult = this.queryValidator.validate(query);
        if (!validationResult.valid) {
            throw new Error(`Accommodation query validation failed: ${validationResult.errors
                .map((error) => error.code)
                .join(", ")}`);
        }
        const providers = this.providerRegistry.findProviders(capabilities_1.AccommodationProviderCapabilityType.SEARCH);
        const providerResults = await Promise.allSettled(providers.map(async (provider) => provider.search(query.criteria)));
        const accommodations = providerResults.flatMap((providerResult) => providerResult.status === "fulfilled" ? providerResult.value.accommodations : []);
        return {
            accommodations,
            metadata: createMetadata(),
        };
    }
}
exports.DefaultAccommodationDiscoveryEngine = DefaultAccommodationDiscoveryEngine;
//# sourceMappingURL=accommodation-discovery-engine.js.map