import { InvoiceEngineOutcome } from "../../engine";
import { InvoiceOperation } from "../../policies";
import { InvoicePolicyOutcome, InvoiceRequiredAction } from "../../policies";
import { InvoicePresentationTarget } from "./invoice-presentation-context";

export interface InvoiceEnginePresentationModel {
  readonly operation: InvoiceOperation;
  readonly outcome: InvoiceEngineOutcome;
  readonly policyOutcome: InvoicePolicyOutcome;
  readonly requiredActions: ReadonlyArray<InvoiceRequiredAction>;
  readonly warnings: ReadonlyArray<string>;
  readonly errors: ReadonlyArray<string>;
  readonly financialImpact?: {
    readonly currency: string;
    readonly totalObligation: number;
    readonly totalObligationDisplay: string;
    readonly previousAmountPaid: number;
    readonly previousAmountPaidDisplay: string;
    readonly newAmountPaid: number;
    readonly newAmountPaidDisplay: string;
    readonly previousBalanceDue: number;
    readonly previousBalanceDueDisplay: string;
    readonly newBalanceDue: number;
    readonly newBalanceDueDisplay: string;
    readonly previousRefundableAmount: number;
    readonly previousRefundableAmountDisplay: string;
    readonly newRefundableAmount: number;
    readonly newRefundableAmountDisplay: string;
  };
  readonly metadata: {
    readonly completedAt: Date;
    readonly completedAtDisplay: string;
    readonly requestId: string;
    readonly source: string;
    readonly version: string;
    readonly stages: ReadonlyArray<string>;
    readonly target: InvoicePresentationTarget;
  };
}

function freezeFinancialImpact(
  input: InvoiceEnginePresentationModel["financialImpact"],
): InvoiceEnginePresentationModel["financialImpact"] {
  if (!input) {
    return undefined;
  }

  return Object.freeze({
    currency: input.currency,
    totalObligation: input.totalObligation,
    totalObligationDisplay: input.totalObligationDisplay,
    previousAmountPaid: input.previousAmountPaid,
    previousAmountPaidDisplay: input.previousAmountPaidDisplay,
    newAmountPaid: input.newAmountPaid,
    newAmountPaidDisplay: input.newAmountPaidDisplay,
    previousBalanceDue: input.previousBalanceDue,
    previousBalanceDueDisplay: input.previousBalanceDueDisplay,
    newBalanceDue: input.newBalanceDue,
    newBalanceDueDisplay: input.newBalanceDueDisplay,
    previousRefundableAmount: input.previousRefundableAmount,
    previousRefundableAmountDisplay: input.previousRefundableAmountDisplay,
    newRefundableAmount: input.newRefundableAmount,
    newRefundableAmountDisplay: input.newRefundableAmountDisplay,
  });
}

export function createInvoiceEnginePresentationModel(
  model: InvoiceEnginePresentationModel,
): InvoiceEnginePresentationModel {
  return Object.freeze({
    operation: model.operation,
    outcome: model.outcome,
    policyOutcome: model.policyOutcome,
    requiredActions: Object.freeze([...(model.requiredActions ?? [])]),
    warnings: Object.freeze([...(model.warnings ?? [])]),
    errors: Object.freeze([...(model.errors ?? [])]),
    financialImpact: freezeFinancialImpact(model.financialImpact),
    metadata: Object.freeze({
      completedAt: new Date(model.metadata.completedAt.getTime()),
      completedAtDisplay: model.metadata.completedAtDisplay,
      requestId: model.metadata.requestId,
      source: model.metadata.source,
      version: model.metadata.version,
      stages: Object.freeze([...(model.metadata.stages ?? [])]),
      target: model.metadata.target,
    }),
  });
}
