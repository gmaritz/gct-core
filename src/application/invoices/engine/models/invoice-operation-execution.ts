import { Invoice } from "../../aggregate";
import { InvoiceFinancialImpact } from "./invoice-engine-result";
import { InvoiceEngineError, createInvoiceEngineError } from "./invoice-engine-error";

export interface InvoiceOperationExecution {
  readonly success: boolean;
  readonly invoice?: Invoice;
  readonly financialImpact?: InvoiceFinancialImpact;
  readonly errors: ReadonlyArray<InvoiceEngineError>;
  readonly warnings: ReadonlyArray<string>;
}

export function createInvoiceOperationExecution(input: {
  readonly success: boolean;
  readonly invoice?: Invoice;
  readonly financialImpact?: InvoiceFinancialImpact;
  readonly errors?: ReadonlyArray<InvoiceEngineError>;
  readonly warnings?: ReadonlyArray<string>;
}): InvoiceOperationExecution {
  return Object.freeze({
    success: input.success,
    invoice: input.invoice,
    financialImpact: input.financialImpact
      ? Object.freeze({
          currency: input.financialImpact.currency,
          totalObligation: input.financialImpact.totalObligation,
          previousAmountPaid: input.financialImpact.previousAmountPaid,
          newAmountPaid: input.financialImpact.newAmountPaid,
          previousBalanceDue: input.financialImpact.previousBalanceDue,
          newBalanceDue: input.financialImpact.newBalanceDue,
          previousRefundableAmount: input.financialImpact.previousRefundableAmount,
          newRefundableAmount: input.financialImpact.newRefundableAmount,
        })
      : undefined,
    errors: Object.freeze([...(input.errors ?? []).map(createInvoiceEngineError)]),
    warnings: Object.freeze([...(input.warnings ?? [])]),
  });
}
