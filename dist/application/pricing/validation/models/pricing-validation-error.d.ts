import { PricingValidationErrorCode } from "./pricing-validation-error-code";
import { PricingValidationStage } from "./pricing-validation-stage";
export interface PricingValidationError {
    readonly code: PricingValidationErrorCode;
    readonly stage: PricingValidationStage;
    readonly message: string;
    readonly critical: boolean;
}
export declare function createPricingValidationError(error: PricingValidationError): PricingValidationError;
//# sourceMappingURL=pricing-validation-error.d.ts.map