import { PricingValidationError } from "./pricing-validation-error";
import { PricingValidationStage } from "./pricing-validation-stage";
export interface PricingValidationResultMetadata {
    readonly validatedAt: Date;
    readonly version: string;
    readonly source: string;
}
export interface PricingValidationResult {
    readonly valid: boolean;
    readonly stage: PricingValidationStage;
    readonly errors: ReadonlyArray<PricingValidationError>;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: PricingValidationResultMetadata;
}
export declare function createPricingValidationResult(input: {
    readonly stage: PricingValidationStage;
    readonly errors?: ReadonlyArray<PricingValidationError>;
    readonly warnings?: ReadonlyArray<string>;
    readonly metadata: PricingValidationResultMetadata;
}): PricingValidationResult;
//# sourceMappingURL=pricing-validation-result.d.ts.map