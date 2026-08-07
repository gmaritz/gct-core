import { PaymentPolicyOutcome } from "./payment-policy-outcome";
import { PaymentPolicyPriority } from "./payment-policy-priority";
import { PaymentRequiredAction } from "./payment-required-action";

export interface PaymentPolicyResult {
  readonly policyName: string;
  readonly outcome: PaymentPolicyOutcome;
  readonly priority: PaymentPolicyPriority;
  readonly requiredActions: ReadonlyArray<PaymentRequiredAction>;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: {
    readonly evaluatedAt: Date;
    readonly version: string;
    readonly source: string;
  };
}

export function createPaymentPolicyResult(input: {
  readonly policyName: string;
  readonly outcome: PaymentPolicyOutcome;
  readonly priority: PaymentPolicyPriority;
  readonly requiredActions?: ReadonlyArray<PaymentRequiredAction>;
  readonly warnings?: ReadonlyArray<string>;
  readonly metadata: {
    readonly evaluatedAt: Date;
    readonly version: string;
    readonly source: string;
  };
}): PaymentPolicyResult {
  return Object.freeze({
    policyName: input.policyName,
    outcome: input.outcome,
    priority: input.priority,
    requiredActions: Object.freeze([...(input.requiredActions ?? [])]),
    warnings: Object.freeze([...(input.warnings ?? [])]),
    metadata: Object.freeze({
      evaluatedAt: new Date(input.metadata.evaluatedAt.getTime()),
      version: input.metadata.version,
      source: input.metadata.source,
    }),
  });
}
