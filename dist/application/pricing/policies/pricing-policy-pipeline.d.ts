import { PricingPolicyContext, PricingPolicyOutcome, PricingPolicyPriority, PricingPolicyResult, PricingStrategySet } from "./models";
import { PricingPolicyRegistry } from "./pricing-policy-registry";
export interface PricingPolicyEvaluation {
    readonly permitted: boolean;
    readonly outcome: PricingPolicyOutcome;
    readonly priority: PricingPolicyPriority;
    readonly strategySet: PricingStrategySet;
    readonly policyResults: ReadonlyArray<PricingPolicyResult>;
    readonly errors: ReadonlyArray<string>;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: {
        readonly evaluatedAt: Date;
        readonly version: string;
        readonly source: string;
    };
}
export declare class PricingPolicyPipeline {
    private readonly registry;
    constructor(registry?: PricingPolicyRegistry);
    evaluate(context: PricingPolicyContext): PricingPolicyEvaluation;
}
//# sourceMappingURL=pricing-policy-pipeline.d.ts.map