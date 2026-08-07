import { PricingValidationErrorCode } from "./pricing-validation-error-code";
import { PricingValidationStage } from "./pricing-validation-stage";

export interface PricingValidationError {
  readonly code: PricingValidationErrorCode;
  readonly stage: PricingValidationStage;
  readonly message: string;
  readonly critical: boolean;
}

export function createPricingValidationError(error: PricingValidationError): PricingValidationError {
  return Object.freeze({
    code: error.code,
    stage: error.stage,
    message: error.message,
    critical: error.critical,
  });
}
