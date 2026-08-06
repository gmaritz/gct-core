import {
  JourneyPolicyOutcome,
  JourneyPolicyPriority,
  JourneyPolicyResult,
} from "../models";
import { JourneyPolicyRegistry } from "../registry";
import { JourneyCompositionPolicyContext } from "../models";
import { createJourneyPolicyResult } from "../models";

function normalizeResult(result: JourneyPolicyResult): JourneyPolicyResult {
  return createJourneyPolicyResult(result.outcome, result.priority, result.messages);
}

export class JourneyPolicyPipeline {
  public constructor(private readonly registry: JourneyPolicyRegistry = new JourneyPolicyRegistry()) {}

  public evaluate(context: JourneyCompositionPolicyContext): ReadonlyArray<JourneyPolicyResult> {
    const results: JourneyPolicyResult[] = [];

    for (const registration of this.registry.resolveAll()) {
      const evaluation = normalizeResult(registration.policy.evaluate(context));
      results.push(evaluation);

      if (
        evaluation.outcome === JourneyPolicyOutcome.DENY
        && evaluation.priority === JourneyPolicyPriority.CRITICAL
      ) {
        break;
      }
    }

    return Object.freeze(results);
  }
}