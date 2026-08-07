import { PaymentValidationErrorCode } from "./payment-validation-error-code";
import { PaymentValidationStage } from "./payment-validation-stage";
export type PaymentValidationSeverity = "CRITICAL" | "WARNING";
export interface PaymentValidationError {
    readonly stage: PaymentValidationStage;
    readonly code: PaymentValidationErrorCode;
    readonly message: string;
    readonly severity: PaymentValidationSeverity;
}
export declare function createPaymentValidationError(error: PaymentValidationError): PaymentValidationError;
//# sourceMappingURL=payment-validation-error.d.ts.map