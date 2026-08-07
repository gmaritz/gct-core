import { PaymentPolicy } from "./contracts";
import { PaymentPolicyContext, PaymentPolicyPriority, PaymentPolicyResult } from "./models";
export interface RegisteredPaymentPolicy {
    readonly name: string;
    readonly priority: PaymentPolicyPriority;
    readonly policy: PaymentPolicy<PaymentPolicyContext, PaymentPolicyResult>;
}
export declare class PaymentPolicyRegistry {
    private readonly policies;
    private registrationSequence;
    register(name: string, policy: PaymentPolicy<PaymentPolicyContext, PaymentPolicyResult>, priority?: PaymentPolicyPriority): void;
    unregister(name: string): boolean;
    resolve(name: string): RegisteredPaymentPolicy | undefined;
    resolveAll(): ReadonlyArray<RegisteredPaymentPolicy>;
}
//# sourceMappingURL=payment-policy-registry.d.ts.map