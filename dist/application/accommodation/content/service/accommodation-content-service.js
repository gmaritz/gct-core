"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationContentService = void 0;
const capabilities_1 = require("../../capabilities");
const validation_1 = require("../validation");
function hasContentMethod(provider) {
    return typeof provider?.content === "function";
}
function createRequest(query) {
    return Object.freeze({
        identifier: query.identifier,
        context: query.context,
    });
}
class AccommodationContentService {
    constructor(providerRegistry, validator = new validation_1.AccommodationContentValidator()) {
        this.providerRegistry = providerRegistry;
        this.validator = validator;
    }
    async execute(query) {
        const request = createRequest(query);
        const validationResult = this.validator.validate(request);
        if (!validationResult.valid) {
            throw new Error(`Accommodation content validation failed: ${validationResult.errors
                .map((error) => error.code)
                .join(", ")}`);
        }
        const providers = this.providerRegistry.findProviders(capabilities_1.AccommodationProviderCapabilityType.CONTENT);
        const providerResults = await Promise.allSettled(providers.map(async (provider) => {
            if (!hasContentMethod(provider)) {
                throw new Error(`Provider does not implement content retrieval: ${provider.providerId}`);
            }
            return provider.content(request.identifier);
        }));
        const successfulResults = providerResults
            .filter((providerResult) => providerResult.status === "fulfilled")
            .map((providerResult) => providerResult.value);
        if (successfulResults.length === 0) {
            throw new Error("No accommodation content providers returned content");
        }
        return successfulResults[0];
    }
    async getContent(query) {
        return this.execute(query);
    }
    async content(query) {
        return this.execute(query);
    }
}
exports.AccommodationContentService = AccommodationContentService;
//# sourceMappingURL=accommodation-content-service.js.map