import { InvoicePolicyOutcome } from "./invoice-policy-outcome";
import { InvoicePolicyPriority } from "./invoice-policy-priority";
import { InvoiceRequiredAction } from "./invoice-required-action";

export interface InvoicePolicyResultMetadata {
  readonly evaluatedAt: Date;
  readonly version: string;
  readonly source: string;
}

export interface InvoicePolicyResult {
  readonly policyName: string;
  readonly outcome: InvoicePolicyOutcome;
  readonly priority: InvoicePolicyPriority;
  readonly requiredActions: ReadonlyArray<InvoiceRequiredAction>;
  readonly errors: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
  readonly observations: ReadonlyArray<string>;
  readonly metadata: InvoicePolicyResultMetadata;
}

export interface InvoicePolicyEvaluation {
  readonly permitted: boolean;
  readonly outcome: InvoicePolicyOutcome;
  readonly priority: InvoicePolicyPriority;
  readonly requiredActions: ReadonlyArray<InvoiceRequiredAction>;
  readonly errors: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
  readonly observations: ReadonlyArray<string>;
  readonly policyResults: ReadonlyArray<InvoicePolicyResult>;
  readonly metadata: InvoicePolicyResultMetadata;
}

export function createInvoicePolicyResult(input: {
  readonly policyName: string;
  readonly outcome: InvoicePolicyOutcome;
  readonly priority: InvoicePolicyPriority;
  readonly requiredActions?: ReadonlyArray<InvoiceRequiredAction>;
  readonly errors?: ReadonlyArray<string>;
  readonly warnings?: ReadonlyArray<string>;
  readonly observations?: ReadonlyArray<string>;
  readonly metadata: InvoicePolicyResultMetadata;
}): InvoicePolicyResult {
  return Object.freeze({
    policyName: input.policyName,
    outcome: input.outcome,
    priority: input.priority,
    requiredActions: Object.freeze([...(input.requiredActions ?? [])]),
    errors: Object.freeze([...(input.errors ?? [])]),
    warnings: Object.freeze([...(input.warnings ?? [])]),
    observations: Object.freeze([...(input.observations ?? [])]),
    metadata: Object.freeze({
      evaluatedAt: new Date(input.metadata.evaluatedAt.getTime()),
      version: input.metadata.version,
      source: input.metadata.source,
    }),
  });
}