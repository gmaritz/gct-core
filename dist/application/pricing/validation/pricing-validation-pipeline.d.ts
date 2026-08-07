import { PricingValidationResult } from "./models";
import { CommercialValidator } from "./commercial-validator";
import { PricingIntegrityValidator } from "./pricing-integrity-validator";
import { PricingRequestValidator, PricingValidationRequest } from "./pricing-request-validator";
import { QuoteReadinessValidator } from "./quote-readiness-validator";
export interface PricingValidationPipelineDependencies {
    readonly requestValidator: PricingRequestValidator;
    readonly commercialValidator: CommercialValidator;
    readonly integrityValidator: PricingIntegrityValidator;
    readonly quoteReadinessValidator: QuoteReadinessValidator;
}
export declare class PricingValidationPipeline {
    private readonly dependencies;
    constructor(dependencies: PricingValidationPipelineDependencies);
    execute(request: PricingValidationRequest): PricingValidationResult;
    private hasCriticalErrors;
    private aggregateResults;
}
//# sourceMappingURL=pricing-validation-pipeline.d.ts.map