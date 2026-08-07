import { PaymentPolicyOutcome } from "./payment-policy-outcome";
import { PaymentPolicyPriority } from "./payment-policy-priority";
import { PaymentRequiredAction } from "./payment-required-action";
export interface PaymentPolicyResult {
    readonly policyName: string;
    readonly outcome: PaymentPolicyOutcome;
    readonly priority: PaymentPolicyPriority;
    readonly requiredActions: ReadonlyArray<PaymentRequiredAction>;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: {
        readonly evaluatedAt: Date;
        readonly version: string;
        readonly source: string;
    };
}
export declare function createPaymentPolicyResult(input: {
    readonly policyName: string;
    readonly outcome: PaymentPolicyOutcome;
    readonly priority: PaymentPolicyPriority;
    readonly requiredActions?: ReadonlyArray<PaymentRequiredAction>;
    readonly warnings?: ReadonlyArray<string>;
    readonly metadata: {
        readonly evaluatedAt: Date;
        readonly version: string;
        readonly source: string;
    };
}): PaymentPolicyResult;
//# sourceMappingURL=payment-policy-result.d.ts.map