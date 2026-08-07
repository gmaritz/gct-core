import { ReservationPolicyOutcome, ReservationPolicyPriority, ReservationPolicyResult, createReservationPolicyResult } from "./models";
import { ReservationPolicyContext } from "./models";
import { ReservationPolicyRegistry } from "./reservation-policy-registry";

function normalizeResult(result: ReservationPolicyResult): ReservationPolicyResult {
  return createReservationPolicyResult({
    permitted: result.permitted,
    outcome: result.outcome,
    priority: result.priority,
    errors: result.errors,
    warnings: result.warnings,
    observations: result.observations,
    metadata: result.metadata,
  });
}

function aggregateOutcome(results: ReadonlyArray<ReservationPolicyResult>): ReservationPolicyOutcome {
  if (results.some((result) => result.outcome === ReservationPolicyOutcome.DENY)) {
    return ReservationPolicyOutcome.DENY;
  }

  if (results.some((result) => result.outcome === ReservationPolicyOutcome.WARNING)) {
    return ReservationPolicyOutcome.WARNING;
  }

  if (results.some((result) => result.outcome === ReservationPolicyOutcome.ALLOW)) {
    return ReservationPolicyOutcome.ALLOW;
  }

  return ReservationPolicyOutcome.IGNORE;
}

export class ReservationPolicyPipeline {
  public constructor(private readonly registry: ReservationPolicyRegistry = new ReservationPolicyRegistry()) {}

  public evaluate(context: ReservationPolicyContext): ReservationPolicyResult {
    const results: ReservationPolicyResult[] = [];

    for (const registration of this.registry.resolveAll()) {
      const evaluation = normalizeResult(registration.policy.evaluate(context));
      results.push(evaluation);

      if (evaluation.outcome === ReservationPolicyOutcome.DENY && evaluation.priority === ReservationPolicyPriority.CRITICAL) {
        break;
      }
    }

    const errors = results.flatMap((result) => result.errors);
    const warnings = results.flatMap((result) => result.warnings);
    const observations = results.flatMap((result) => result.observations);
    const permitted = !results.some((result) => result.outcome === ReservationPolicyOutcome.DENY);

    return createReservationPolicyResult({
      permitted,
      outcome: aggregateOutcome(results),
      priority: results.reduce<ReservationPolicyPriority>((current, result) => {
        if (current === ReservationPolicyPriority.CRITICAL || result.priority === ReservationPolicyPriority.CRITICAL) {
          return ReservationPolicyPriority.CRITICAL;
        }
        if (current === ReservationPolicyPriority.HIGH || result.priority === ReservationPolicyPriority.HIGH) {
          return ReservationPolicyPriority.HIGH;
        }
        if (current === ReservationPolicyPriority.NORMAL || result.priority === ReservationPolicyPriority.NORMAL) {
          return ReservationPolicyPriority.NORMAL;
        }
        return ReservationPolicyPriority.LOW;
      }, ReservationPolicyPriority.LOW),
      errors,
      warnings,
      observations,
      metadata: {
        evaluatedAt: new Date(),
        version: "1.0.0",
        source: "ReservationPolicyPipeline",
      },
    });
  }
}
