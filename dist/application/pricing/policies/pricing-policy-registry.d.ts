import { PricingPolicy } from "./pricing-policy";
import { PricingPolicyContext, PricingPolicyPriority, PricingPolicyResult } from "./models";
export interface RegisteredPricingPolicy {
    readonly name: string;
    readonly priority: PricingPolicyPriority;
    readonly policy: PricingPolicy<PricingPolicyContext, PricingPolicyResult>;
}
export declare class PricingPolicyRegistry {
    private readonly policies;
    private registrationSequence;
    register(name: string, policy: PricingPolicy<PricingPolicyContext, PricingPolicyResult>, priority?: PricingPolicyPriority): void;
    unregister(name: string): boolean;
    resolve(name: string): RegisteredPricingPolicy | undefined;
    resolveAll(): ReadonlyArray<RegisteredPricingPolicy>;
}
//# sourceMappingURL=pricing-policy-registry.d.ts.map