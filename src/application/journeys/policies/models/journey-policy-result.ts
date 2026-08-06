import { JourneyPolicyOutcome } from "./journey-policy-outcome";
import { JourneyPolicyPriority } from "./journey-policy-priority";

export interface JourneyPolicyResult {
  readonly outcome: JourneyPolicyOutcome;
  readonly priority: JourneyPolicyPriority;
  readonly messages: ReadonlyArray<string>;
}

export function createJourneyPolicyResult(
  outcome: JourneyPolicyOutcome,
  priority: JourneyPolicyPriority,
  messages: ReadonlyArray<string>,
): JourneyPolicyResult {
  return Object.freeze({
    outcome,
    priority,
    messages: Object.freeze([...messages]),
  });
}