import { Payment } from "../../aggregate";
import { PaymentPolicyEvaluation } from "../../policies";
import { PaymentProcessingResult } from "../../processing";
import { PaymentValidationResult } from "../../validation";
import { PaymentEngineContext, PaymentEngineContextMetadata } from "./payment-engine-context";
export interface PaymentExecutionContext {
    readonly paymentRequest: PaymentEngineContext["paymentRequest"];
    readonly validationResult?: PaymentValidationResult;
    readonly policyEvaluation?: PaymentPolicyEvaluation;
    readonly processingResult?: PaymentProcessingResult;
    readonly paymentAggregate?: Payment | null;
    readonly metadata: PaymentEngineContextMetadata;
}
export declare function createPaymentExecutionContext(engineContext: PaymentEngineContext): PaymentExecutionContext;
export declare function withExecutionValidationResult(context: PaymentExecutionContext, validationResult: PaymentValidationResult): PaymentExecutionContext;
export declare function withExecutionPolicyEvaluation(context: PaymentExecutionContext, policyEvaluation: PaymentPolicyEvaluation): PaymentExecutionContext;
export declare function withExecutionProcessingResult(context: PaymentExecutionContext, processingResult: PaymentProcessingResult): PaymentExecutionContext;
export declare function withExecutionPaymentAggregate(context: PaymentExecutionContext, paymentAggregate: Payment): PaymentExecutionContext;
//# sourceMappingURL=payment-execution-context.d.ts.map