"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingEngine = void 0;
const aggregate_1 = require("../aggregate");
const calculators_1 = require("../calculators");
const policies_1 = require("../policies");
const models_1 = require("./models");
function ensurePresent(value, message) {
    if (value === null || typeof value === "undefined") {
        throw new Error(message);
    }
    return value;
}
function resolveTravellerCount(request) {
    if (typeof request.travellerCount === "number" && request.travellerCount > 0) {
        return request.travellerCount;
    }
    const inferred = (request.pricingRequest.breakdown?.lineItems ?? []).reduce((count, item) => count + item.quantity, 0);
    return inferred > 0 ? inferred : 1;
}
function createInitialCalculationContext(request, strategySet) {
    return (0, calculators_1.createPricingCalculationContext)({
        pricingRequest: request.pricingRequest,
        pricingStrategySet: strategySet,
        currentPricingBreakdown: ensurePresent(request.pricingRequest.breakdown, "Pricing breakdown is required."),
        calculatedTotals: ensurePresent(request.pricingRequest.totals, "Pricing totals are required."),
        currency: ensurePresent(request.pricingRequest.currency, "Pricing currency is required."),
        warnings: Object.freeze([...(strategySet.warnings ?? [])]),
        calculationMetadata: {
            calculatedAt: new Date(),
            version: "1.0.0",
            source: "PricingEngine",
        },
    });
}
function createPricingComposition(request, calculationResult, requestId) {
    const summary = ensurePresent(request.pricingRequest.summary, "Pricing summary is required.");
    const taxes = ensurePresent(request.pricingRequest.taxes, "Pricing taxes are required.");
    const currency = ensurePresent(request.pricingRequest.currency, "Pricing currency is required.");
    const now = new Date();
    return {
        identity: {
            id: `pricing-${requestId}`,
        },
        summary,
        breakdown: calculationResult.breakdown,
        taxes,
        fees: Object.freeze([...(request.pricingRequest.fees ?? [])]),
        discounts: Object.freeze([...(request.pricingRequest.discounts ?? [])]),
        markups: Object.freeze([...(request.pricingRequest.markups ?? [])]),
        commissions: Object.freeze([...(request.pricingRequest.commissions ?? [])]),
        totals: calculationResult.totals,
        currency,
        metadata: {
            createdAt: now,
            updatedAt: now,
            version: "1.0.0",
            source: "PricingEngine",
        },
    };
}
function collectValidationWarnings(validationErrors) {
    return validationErrors.map((error) => error.message);
}
function toResultMetadata(stages, requestId) {
    return {
        completedAt: new Date(),
        version: "1.0.0",
        requestId,
        stages: Object.freeze([...(stages ?? [])]),
    };
}
class PricingEngine {
    constructor(validationPipeline, policyPipeline, calculatorPipeline) {
        this.validationPipeline = validationPipeline;
        this.policyPipeline = policyPipeline;
        this.calculatorPipeline = calculatorPipeline;
    }
    async execute(request) {
        const initialContext = (0, models_1.createPricingEngineContext)(request);
        const validationResult = this.validationPipeline.execute(initialContext.pricingRequest);
        const validationContext = (0, models_1.withEngineValidationResult)(initialContext, validationResult);
        if (!validationResult.valid) {
            return (0, models_1.createPricingEngineResult)({
                successful: false,
                pricing: null,
                warnings: Object.freeze([
                    ...validationResult.warnings,
                    ...collectValidationWarnings(validationResult.errors),
                ]),
                metadata: toResultMetadata(validationContext.metadata.stages, validationContext.metadata.requestId),
            });
        }
        const policyEvaluation = this.policyPipeline.evaluate((0, policies_1.createPricingPolicyContext)({
            pricingRequest: initialContext.pricingRequest,
            journeySummary: {
                journeyId: initialContext.pricingRequest.summary?.productId ?? validationContext.metadata.requestId,
                productType: initialContext.pricingRequest.summary?.productType ?? "UNSPECIFIED",
                destination: request.destination,
            },
            travellerInformation: {
                travellerCount: resolveTravellerCount(request),
                residentCountry: request.residentCountry,
            },
            commercialMetadata: Object.freeze({ ...(request.commercialMetadata ?? {}) }),
            market: request.market ?? "UNSPECIFIED",
            salesChannel: request.salesChannel ?? "UNSPECIFIED",
            bookingDate: request.bookingDate ? new Date(request.bookingDate.getTime()) : new Date(),
        }));
        const policyContext = (0, models_1.withEnginePolicyEvaluation)(validationContext, policyEvaluation);
        if (!policyEvaluation.permitted) {
            return (0, models_1.createPricingEngineResult)({
                successful: false,
                pricing: null,
                warnings: Object.freeze([...policyEvaluation.warnings, ...policyEvaluation.errors]),
                metadata: toResultMetadata(policyContext.metadata.stages, policyContext.metadata.requestId),
            });
        }
        const initialCalculationContext = createInitialCalculationContext(request, policyEvaluation.strategySet);
        const calculationContext = (0, models_1.withEngineCalculationContext)(policyContext, initialCalculationContext);
        const calculationResult = this.calculatorPipeline.execute(initialCalculationContext);
        const pricing = aggregate_1.Pricing.create(createPricingComposition(request, calculationResult, calculationContext.metadata.requestId));
        const completedContext = (0, models_1.withEnginePricingAggregate)(calculationContext, pricing);
        return (0, models_1.createPricingEngineResult)({
            successful: true,
            pricing,
            warnings: Object.freeze([
                ...validationResult.warnings,
                ...policyEvaluation.warnings,
                ...calculationResult.warnings,
            ]),
            metadata: toResultMetadata(completedContext.metadata.stages, completedContext.metadata.requestId),
        });
    }
}
exports.PricingEngine = PricingEngine;
//# sourceMappingURL=pricing-engine.js.map