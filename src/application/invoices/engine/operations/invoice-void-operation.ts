import { Invoice } from "../../aggregate";
import { InvoiceStatus } from "../../models";
import { InvoiceOperation } from "../../policies";
import {
  createInvoiceOperationExecution,
  InvoiceExecutionContext,
  InvoiceFinancialImpact,
  InvoiceOperationExecution,
} from "../models";
import { InvoiceOperationHandler } from "./invoice-operation-handler";
import { ensurePresent, resolveMetadata, toInvoiceComposition } from "./operation-support";

export class InvoiceVoidOperation implements InvoiceOperationHandler {
  public readonly operation = InvoiceOperation.VOID;

  public execute(context: InvoiceExecutionContext): InvoiceOperationExecution {
    const invoice = ensurePresent(context.invoice, "Invoice is required for void operation.");

    const restored = Invoice.restore({
      ...toInvoiceComposition(invoice),
      status: InvoiceStatus.VOID,
      metadata: resolveMetadata(invoice.metadata),
    });

    const financialImpact: InvoiceFinancialImpact = {
      currency: restored.financialObligation.currency,
      totalObligation: restored.financialObligation.totalAmount,
      previousAmountPaid: invoice.amountPaid,
      newAmountPaid: restored.amountPaid,
      previousBalanceDue: invoice.balanceDue,
      newBalanceDue: restored.balanceDue,
      previousRefundableAmount: invoice.refundableAmount,
      newRefundableAmount: restored.refundableAmount,
    };

    return createInvoiceOperationExecution({
      success: true,
      invoice: restored,
      financialImpact,
    });
  }
}
