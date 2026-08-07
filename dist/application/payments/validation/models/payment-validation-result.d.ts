import { PaymentValidationError } from "./payment-validation-error";
import { PaymentValidationStage } from "./payment-validation-stage";
export interface PaymentValidationResultMetadata {
    readonly validatedAt: Date;
    readonly version: string;
    readonly source: string;
}
export interface PaymentValidationResult {
    readonly success: boolean;
    readonly stage: PaymentValidationStage;
    readonly errors: ReadonlyArray<PaymentValidationError>;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: PaymentValidationResultMetadata;
}
export declare function createPaymentValidationResult(input: {
    readonly stage: PaymentValidationStage;
    readonly errors?: ReadonlyArray<PaymentValidationError>;
    readonly warnings?: ReadonlyArray<string>;
    readonly metadata: PaymentValidationResultMetadata;
}): PaymentValidationResult;
//# sourceMappingURL=payment-validation-result.d.ts.map