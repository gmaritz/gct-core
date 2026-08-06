"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationRateService = void 0;
const capabilities_1 = require("../../capabilities");
const validation_1 = require("../validation");
function hasRatesMethod(provider) {
    return typeof provider?.rates === "function";
}
function cloneRate(rate) {
    return Object.freeze({ ...rate });
}
function cloneMetadata(metadata) {
    return Object.freeze({
        provider: metadata.provider,
        generatedAt: new Date(metadata.generatedAt),
        version: metadata.version,
    });
}
function freezeRateResult(result) {
    return Object.freeze({
        accommodationId: result.accommodationId,
        stayPeriod: Object.freeze({ ...result.stayPeriod }),
        occupancy: Object.freeze({ ...result.occupancy }),
        selectionStrategy: result.selectionStrategy,
        rates: Object.freeze(result.rates.map(cloneRate)),
        metadata: cloneMetadata(result.metadata),
    });
}
function createAggregatedMetadata() {
    return Object.freeze({
        generatedAt: new Date(),
        version: "1.0.0",
    });
}
class AccommodationRateService {
    constructor(providerRegistry, validator = new validation_1.AccommodationRateValidator()) {
        this.providerRegistry = providerRegistry;
        this.validator = validator;
    }
    async execute(query) {
        const validationResult = this.validator.validate(query);
        if (!validationResult.valid) {
            throw new Error(`Accommodation rate validation failed: ${validationResult.errors
                .map((error) => error.code)
                .join(", ")}`);
        }
        const providers = this.providerRegistry.findProviders(capabilities_1.AccommodationProviderCapabilityType.RATES);
        const providerResults = await Promise.allSettled(providers.map(async (provider) => {
            if (!hasRatesMethod(provider)) {
                throw new Error(`Provider does not implement rate retrieval: ${provider.providerId}`);
            }
            return provider.rates(query);
        }));
        const successfulResults = providerResults
            .filter((providerResult) => providerResult.status === "fulfilled")
            .map((providerResult) => providerResult.value);
        if (successfulResults.length === 0) {
            throw new Error("No accommodation rate providers returned rates");
        }
        const aggregatedRates = successfulResults.flatMap((rateResult) => rateResult.rates);
        const aggregatedResult = {
            accommodationId: query.identifier,
            stayPeriod: query.stayPeriod,
            occupancy: query.occupancy,
            selectionStrategy: query.selectionStrategy,
            rates: aggregatedRates,
            metadata: createAggregatedMetadata(),
        };
        return freezeRateResult(aggregatedResult);
    }
}
exports.AccommodationRateService = AccommodationRateService;
//# sourceMappingURL=accommodation-rate-service.js.map