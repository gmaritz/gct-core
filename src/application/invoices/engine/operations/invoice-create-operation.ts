import { Invoice } from "../../aggregate";
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

export class InvoiceCreateOperation implements InvoiceOperationHandler {
  public readonly operation = InvoiceOperation.CREATE;

  public execute(context: InvoiceExecutionContext): InvoiceOperationExecution {
    if (context.operationInput?.operation !== InvoiceOperation.CREATE) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
            message: "Invoice create operation input is required.",
          }),
        ],
      });
    }

    const created = Invoice.create(context.operationInput.composition);

    const financialImpact: InvoiceFinancialImpact = {
      currency: created.financialObligation.currency,
      totalObligation: created.financialObligation.totalAmount,
      previousAmountPaid: 0,
      newAmountPaid: created.amountPaid,
      previousBalanceDue: created.financialObligation.totalAmount,
      newBalanceDue: created.balanceDue,
      previousRefundableAmount: 0,
      newRefundableAmount: created.refundableAmount,
    };

    return createInvoiceOperationExecution({
      success: true,
      invoice: created,
      financialImpact,
    });
  }
}
