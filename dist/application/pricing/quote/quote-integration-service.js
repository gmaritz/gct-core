"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteIntegrationService = void 0;
const models_1 = require("./models");
class QuoteIntegrationService {
    constructor(pricingEngine, quoteFactory) {
        this.pricingEngine = pricingEngine;
        this.quoteFactory = quoteFactory;
    }
    async execute(request) {
        const pricingEngineResult = await this.pricingEngine.execute(request.pricingEngineRequest);
        if (!pricingEngineResult.successful || !pricingEngineResult.pricing) {
            return (0, models_1.createQuoteResult)({
                successful: false,
                warnings: pricingEngineResult.warnings,
                metadata: this.createMetadata(pricingEngineResult, request),
            });
        }
        const context = (0, models_1.createQuoteContext)({
            pricingEngineResult,
            travellerSummary: request.travellerSummary,
            journeySummary: request.journeySummary,
            quotationMetadata: request.quotationMetadata,
            requestId: request.requestId,
            source: request.source,
        });
        const output = this.quoteFactory.create(context);
        return (0, models_1.createQuoteResult)({
            successful: true,
            quote: output.quote,
            quoteReference: output.quoteReference,
            lifecycle: output.lifecycle,
            warnings: pricingEngineResult.warnings,
            metadata: this.createMetadata(pricingEngineResult, request),
        });
    }
    createMetadata(pricingEngineResult, request) {
        return {
            generatedAt: new Date(),
            version: "1.0.0",
            requestId: request.requestId ?? pricingEngineResult.metadata.requestId,
            source: request.source ?? "QuoteIntegrationService",
        };
    }
}
exports.QuoteIntegrationService = QuoteIntegrationService;
//# sourceMappingURL=quote-integration-service.js.map