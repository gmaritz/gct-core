import { PaymentPolicyOutcome, PaymentPolicyPriority, PaymentPolicyResult, PaymentPolicyContext, PaymentRequiredAction } from "./models";
import { PaymentPolicyRegistry } from "./payment-policy-registry";
export interface PaymentPolicyEvaluation {
    readonly permitted: boolean;
    readonly outcome: PaymentPolicyOutcome;
    readonly priority: PaymentPolicyPriority;
    readonly requiredActions: ReadonlyArray<PaymentRequiredAction>;
    readonly policyResults: ReadonlyArray<PaymentPolicyResult>;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: {
        readonly evaluatedAt: Date;
        readonly version: string;
        readonly source: string;
    };
}
export declare class PaymentPolicyPipeline {
    private readonly registry;
    constructor(registry?: PaymentPolicyRegistry);
    evaluate(context: PaymentPolicyContext): PaymentPolicyEvaluation;
}
//# sourceMappingURL=payment-policy-pipeline.d.ts.map