import { Payment } from "../../aggregate";
import { PaymentPolicyEvaluation } from "../../policies";
import { PaymentProcessingResult } from "../../processing";
import { PaymentValidationResult } from "../../validation";
export interface PaymentEngineResult {
    readonly success: boolean;
    readonly payment: Payment | null;
    readonly validationResult: PaymentValidationResult;
    readonly policyEvaluation?: PaymentPolicyEvaluation;
    readonly processingResult?: PaymentProcessingResult;
    readonly metadata: {
        readonly completedAt: Date;
        readonly version: string;
        readonly requestId: string;
        readonly source: string;
        readonly stages: ReadonlyArray<string>;
        readonly pending: boolean;
    };
}
export declare function createPaymentEngineResult(input: {
    readonly success: boolean;
    readonly payment?: Payment | null;
    readonly validationResult: PaymentValidationResult;
    readonly policyEvaluation?: PaymentPolicyEvaluation;
    readonly processingResult?: PaymentProcessingResult;
    readonly metadata: {
        readonly completedAt: Date;
        readonly version: string;
        readonly requestId: string;
        readonly source: string;
        readonly stages: ReadonlyArray<string>;
        readonly pending: boolean;
    };
}): PaymentEngineResult;
//# sourceMappingURL=payment-engine-result.d.ts.map