import {
  createInvoicePolicyResult,
  InvoicePolicyContext,
  InvoicePolicyEvaluation,
  InvoicePolicyOutcome,
  InvoicePolicyPriority,
  InvoicePolicyResult,
  InvoiceRequiredAction,
} from "./models";
import { InvoicePolicyRegistry } from "./registry";

function normalizeResult(result: InvoicePolicyResult): InvoicePolicyResult {
  return createInvoicePolicyResult({
    policyName: result.policyName,
    outcome: result.outcome,
    priority: result.priority,
    requiredActions: result.requiredActions,
    errors: result.errors,
    warnings: result.warnings,
    observations: result.observations,
    metadata: result.metadata,
  });
}

function aggregatePriority(results: ReadonlyArray<InvoicePolicyResult>): InvoicePolicyPriority {
  if (results.some((result) => result.priority === InvoicePolicyPriority.CRITICAL)) {
    return InvoicePolicyPriority.CRITICAL;
  }
  if (results.some((result) => result.priority === InvoicePolicyPriority.HIGH)) {
    return InvoicePolicyPriority.HIGH;
  }
  if (results.some((result) => result.priority === InvoicePolicyPriority.NORMAL)) {
    return InvoicePolicyPriority.NORMAL;
  }

  return InvoicePolicyPriority.LOW;
}

function aggregateOutcome(results: ReadonlyArray<InvoicePolicyResult>): InvoicePolicyOutcome {
  if (results.some((result) => result.outcome === InvoicePolicyOutcome.DENY)) {
    return InvoicePolicyOutcome.DENY;
  }
  if (results.some((result) => result.outcome === InvoicePolicyOutcome.REQUIRE_ACTION)) {
    return InvoicePolicyOutcome.REQUIRE_ACTION;
  }
  if (results.some((result) => result.outcome === InvoicePolicyOutcome.WARNING)) {
    return InvoicePolicyOutcome.WARNING;
  }
  if (results.some((result) => result.outcome === InvoicePolicyOutcome.ALLOW)) {
    return InvoicePolicyOutcome.ALLOW;
  }

  return InvoicePolicyOutcome.IGNORE;
}

export class InvoicePolicyPipeline {
  public constructor(private readonly registry: InvoicePolicyRegistry = new InvoicePolicyRegistry()) {}

  public evaluate(context: InvoicePolicyContext): InvoicePolicyEvaluation {
    if (!context.validationResult.success) {
      const dependencyResult = createInvoicePolicyResult({
        policyName: "InvoiceValidationDependencyPolicy",
        outcome: InvoicePolicyOutcome.DENY,
        priority: InvoicePolicyPriority.CRITICAL,
        errors: ["Invoice policy evaluation requires a successful validation result."],
        observations: ["Policy evaluation aborted because invoice validation failed."],
        metadata: {
          evaluatedAt: new Date(),
          version: "1.0.0",
          source: "InvoicePolicyPipeline",
        },
      });

      return this.aggregate([dependencyResult]);
    }

    const results: InvoicePolicyResult[] = [];

    for (const registration of this.registry.resolveAll()) {
      const evaluation = normalizeResult(registration.policy.evaluate(context));
      results.push(evaluation);

      if (evaluation.outcome === InvoicePolicyOutcome.DENY && evaluation.priority === InvoicePolicyPriority.CRITICAL) {
        break;
      }
    }

    return this.aggregate(results);
  }

  private aggregate(results: ReadonlyArray<InvoicePolicyResult>): InvoicePolicyEvaluation {
    const outcome = aggregateOutcome(results);
    const requiredActions = Object.freeze(results.flatMap((result) => result.requiredActions)) as ReadonlyArray<InvoiceRequiredAction>;
    const errors = Object.freeze(results.flatMap((result) => result.errors));
    const warnings = Object.freeze(results.flatMap((result) => result.warnings));
    const observations = Object.freeze(results.flatMap((result) => result.observations));

    return Object.freeze({
      permitted: !(outcome === InvoicePolicyOutcome.DENY || outcome === InvoicePolicyOutcome.REQUIRE_ACTION),
      outcome,
      priority: aggregatePriority(results),
      requiredActions,
      errors,
      warnings,
      observations,
      policyResults: Object.freeze([...results]),
      metadata: Object.freeze({
        evaluatedAt: new Date(),
        version: "1.0.0",
        source: "InvoicePolicyPipeline",
      }),
    });
  }
}