import {
  createPricingPolicyResult,
  createPricingStrategySet,
  PricingPolicyContext,
  PricingPolicyOutcome,
  PricingPolicyPriority,
  PricingPolicyResult,
  PricingStrategySet,
} from "./models";
import { PricingPolicyRegistry } from "./pricing-policy-registry";

function normalizeResult(result: PricingPolicyResult): PricingPolicyResult {
  return createPricingPolicyResult({
    policyName: result.policyName,
    outcome: result.outcome,
    priority: result.priority,
    selectedStrategy: result.selectedStrategy,
    warnings: result.warnings,
    errors: result.errors,
    metadata: result.metadata,
  });
}

function aggregatePriority(results: ReadonlyArray<PricingPolicyResult>): PricingPolicyPriority {
  if (results.some((result) => result.priority === PricingPolicyPriority.CRITICAL)) {
    return PricingPolicyPriority.CRITICAL;
  }
  if (results.some((result) => result.priority === PricingPolicyPriority.HIGH)) {
    return PricingPolicyPriority.HIGH;
  }
  if (results.some((result) => result.priority === PricingPolicyPriority.NORMAL)) {
    return PricingPolicyPriority.NORMAL;
  }

  return PricingPolicyPriority.LOW;
}

function aggregateOutcome(results: ReadonlyArray<PricingPolicyResult>): PricingPolicyOutcome {
  if (results.some((result) => result.outcome === PricingPolicyOutcome.DENY)) {
    return PricingPolicyOutcome.DENY;
  }

  if (results.some((result) => result.outcome === PricingPolicyOutcome.WARNING)) {
    return PricingPolicyOutcome.WARNING;
  }

  if (results.some((result) => result.outcome === PricingPolicyOutcome.APPLY)) {
    return PricingPolicyOutcome.APPLY;
  }

  return PricingPolicyOutcome.IGNORE;
}

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

export class PricingPolicyPipeline {
  public constructor(private readonly registry: PricingPolicyRegistry = new PricingPolicyRegistry()) {}

  public evaluate(context: PricingPolicyContext): PricingPolicyEvaluation {
    const results: PricingPolicyResult[] = [];

    for (const registration of this.registry.resolveAll()) {
      const evaluation = normalizeResult(registration.policy.evaluate(context));
      results.push(evaluation);

      if (
        evaluation.outcome === PricingPolicyOutcome.DENY &&
        evaluation.priority === PricingPolicyPriority.CRITICAL
      ) {
        break;
      }
    }

    const warnings = results.flatMap((result) => result.warnings);
    const errors = results.flatMap((result) => result.errors);
    const strategySet = createPricingStrategySet({
      strategies: results
        .filter((result) => typeof result.selectedStrategy !== "undefined")
        .map((result) => result.selectedStrategy!),
      warnings,
      metadata: {
        generatedAt: new Date(),
        version: "1.0.0",
        source: "PricingPolicyPipeline",
      },
    });

    return Object.freeze({
      permitted: !results.some((result) => result.outcome === PricingPolicyOutcome.DENY),
      outcome: aggregateOutcome(results),
      priority: aggregatePriority(results),
      strategySet,
      policyResults: Object.freeze(results),
      errors: Object.freeze(errors),
      warnings: Object.freeze(warnings),
      metadata: Object.freeze({
        evaluatedAt: new Date(),
        version: "1.0.0",
        source: "PricingPolicyPipeline",
      }),
    });
  }
}
