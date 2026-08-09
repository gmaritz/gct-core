import { Invoice } from "../../aggregate";
import { InvoiceStatus } from "../../models";
import { InvoiceOperation } from "../../policies";
import {
  createInvoiceEngineError,
  createInvoiceOperationExecution,
  InvoiceEngineErrorCode,
  InvoiceExecutionContext,
  InvoiceFinancialImpact,
  InvoiceOperationExecution,
} from "../models";
import { InvoiceOperationHandler } from "./invoice-operation-handler";
import { ensurePresent, resolveMetadata, toInvoiceComposition } from "./operation-support";

export class InvoiceIssueOperation implements InvoiceOperationHandler {
  public readonly operation = InvoiceOperation.ISSUE;

  public execute(context: InvoiceExecutionContext): InvoiceOperationExecution {
    const invoice = ensurePresent(context.invoice, "Invoice is required for issue operation.");

    if (invoice.status !== InvoiceStatus.DRAFT) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.INVALID_OPERATION,
            message: `Invoice in status '${invoice.status}' cannot be issued.`,
          }),
        ],
      });
    }

    const issued = Invoice.restore({
      ...toInvoiceComposition(invoice),
      status: InvoiceStatus.ISSUED,
      metadata: resolveMetadata(invoice.metadata),
    });

    const financialImpact: InvoiceFinancialImpact = {
      currency: issued.financialObligation.currency,
      totalObligation: issued.financialObligation.totalAmount,
      previousAmountPaid: invoice.amountPaid,
      newAmountPaid: issued.amountPaid,
      previousBalanceDue: invoice.balanceDue,
      newBalanceDue: issued.balanceDue,
      previousRefundableAmount: invoice.refundableAmount,
      newRefundableAmount: issued.refundableAmount,
    };

    return createInvoiceOperationExecution({
      success: true,
      invoice: issued,
      financialImpact,
    });
  }
}
