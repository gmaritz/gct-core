"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultAccommodationDiscoveryEngine = void 0;
const capabilities_1 = require("../capabilities");
function createMetadata() {
    return {
        generatedAt: new Date(),
        version: "1.0.0",
    };
}
class DefaultAccommodationDiscoveryEngine {
    constructor(providerRegistry) {
        this.providerRegistry = providerRegistry;
    }
    async search(query) {
        const providers = this.providerRegistry.findProviders(capabilities_1.AccommodationProviderCapabilityType.SEARCH);
        const providerResults = await Promise.allSettled(providers.map(async (provider) => provider.search(query.criteria)));
        const accommodations = providerResults.flatMap((providerResult) => providerResult.status === "fulfilled" ? providerResult.value.accommodations : []);
        void query;
        return {
            accommodations,
            metadata: createMetadata(),
        };
    }
}
exports.DefaultAccommodationDiscoveryEngine = DefaultAccommodationDiscoveryEngine;
//# sourceMappingURL=accommodation-discovery-engine.js.map