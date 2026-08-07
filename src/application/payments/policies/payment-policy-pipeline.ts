import {
  createPaymentPolicyResult,
  PaymentPolicyOutcome,
  PaymentPolicyPriority,
  PaymentPolicyResult,
  PaymentPolicyContext,
  PaymentRequiredAction,
} from "./models";
import { PaymentPolicyRegistry } from "./payment-policy-registry";

function normalizeResult(result: PaymentPolicyResult): PaymentPolicyResult {
  return createPaymentPolicyResult({
    policyName: result.policyName,
    outcome: result.outcome,
    priority: result.priority,
    requiredActions: result.requiredActions,
    warnings: result.warnings,
    metadata: result.metadata,
  });
}

function aggregatePriority(results: ReadonlyArray<PaymentPolicyResult>): PaymentPolicyPriority {
  if (results.some((result) => result.priority === PaymentPolicyPriority.CRITICAL)) {
    return PaymentPolicyPriority.CRITICAL;
  }
  if (results.some((result) => result.priority === PaymentPolicyPriority.HIGH)) {
    return PaymentPolicyPriority.HIGH;
  }
  if (results.some((result) => result.priority === PaymentPolicyPriority.NORMAL)) {
    return PaymentPolicyPriority.NORMAL;
  }

  return PaymentPolicyPriority.LOW;
}

function aggregateOutcome(results: ReadonlyArray<PaymentPolicyResult>): PaymentPolicyOutcome {
  if (results.some((result) => result.outcome === PaymentPolicyOutcome.DENY)) {
    return PaymentPolicyOutcome.DENY;
  }

  if (results.some((result) => result.outcome === PaymentPolicyOutcome.REQUIRE_ACTION)) {
    return PaymentPolicyOutcome.REQUIRE_ACTION;
  }

  return PaymentPolicyOutcome.ALLOW;
}

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

export class PaymentPolicyPipeline {
  public constructor(private readonly registry: PaymentPolicyRegistry = new PaymentPolicyRegistry()) {}

  public evaluate(context: PaymentPolicyContext): PaymentPolicyEvaluation {
    const results: PaymentPolicyResult[] = [];

    for (const registration of this.registry.resolveAll()) {
      const evaluation = normalizeResult(registration.policy.evaluate(context));
      results.push(evaluation);

      if (evaluation.outcome === PaymentPolicyOutcome.DENY) {
        break;
      }
    }

    const warnings = results.flatMap((result) => result.warnings);
    const requiredActions = results.flatMap((result) => result.requiredActions);

    return Object.freeze({
      permitted: !results.some((result) => result.outcome === PaymentPolicyOutcome.DENY),
      outcome: aggregateOutcome(results),
      priority: aggregatePriority(results),
      requiredActions: Object.freeze(requiredActions),
      policyResults: Object.freeze(results),
      warnings: Object.freeze(warnings),
      metadata: Object.freeze({
        evaluatedAt: new Date(),
        version: "1.0.0",
        source: "PaymentPolicyPipeline",
      }),
    });
  }
}
