import { PricingPolicyOutcome } from "./pricing-policy-outcome";
import { PricingPolicyPriority } from "./pricing-policy-priority";
import { createPricingStrategy, PricingStrategy } from "./pricing-strategy";

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

export function createPricingPolicyResult(input: {
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
}): PricingPolicyResult {
  return Object.freeze({
    policyName: input.policyName,
    outcome: input.outcome,
    priority: input.priority,
    selectedStrategy: input.selectedStrategy ? createPricingStrategy(input.selectedStrategy) : undefined,
    warnings: Object.freeze([...(input.warnings ?? [])]),
    errors: Object.freeze([...(input.errors ?? [])]),
    metadata: Object.freeze({
      evaluatedAt: new Date(input.metadata.evaluatedAt.getTime()),
      version: input.metadata.version,
      source: input.metadata.source,
    }),
  });
}
