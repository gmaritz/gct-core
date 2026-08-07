import { PricingPolicyOutcome } from "./pricing-policy-outcome";
import { PricingPolicyPriority } from "./pricing-policy-priority";
import { PricingStrategy } from "./pricing-strategy";
export interface PricingPolicyResult {
    readonly policyName: string;
    readonly outcome: PricingPolicyOutcome;
    readonly priority: PricingPolicyPriority;
    readonly selectedStrategy?: PricingStrategy;
    readonly warnings: ReadonlyArray<string>;
    readonly errors: ReadonlyArray<string>;
    readonly metadata: {
        readonly evaluatedAt: Date;
        readonly version: string;
        readonly source: string;
    };
}
export declare function createPricingPolicyResult(input: {
    readonly policyName: string;
    readonly outcome: PricingPolicyOutcome;
    readonly priority: PricingPolicyPriority;
    readonly selectedStrategy?: PricingStrategy;
    readonly warnings?: ReadonlyArray<string>;
    readonly errors?: ReadonlyArray<string>;
    readonly metadata: {
        readonly evaluatedAt: Date;
        readonly version: string;
        readonly source: string;
    };
}): PricingPolicyResult;
//# sourceMappingURL=pricing-policy-result.d.ts.map