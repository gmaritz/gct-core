import { Invoice } from "../../aggregate";
import { InvoiceOperation } from "../../policies";
import { InvoiceFinancialCalculator } from "../calculations";
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

export class InvoiceRefundOperation implements InvoiceOperationHandler {
  public readonly operation = InvoiceOperation.REFUND;

  public constructor(private readonly calculator: InvoiceFinancialCalculator = new InvoiceFinancialCalculator()) {}

  public execute(context: InvoiceExecutionContext): InvoiceOperationExecution {
    const invoice = ensurePresent(context.invoice, "Invoice is required for refund operation.");

    if (context.operationInput?.operation !== InvoiceOperation.REFUND) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
            message: "Invoice refund operation input is required.",
          }),
        ],
      });
    }

    const input = context.operationInput;

    let refundedState;
    try {
      refundedState = this.calculator.applyRefund({
        totalObligation: invoice.financialObligation.totalAmount,
        amountPaid: invoice.amountPaid,
        refundableAmount: invoice.refundableAmount,
        refundAmount: input.amount,
      });
    } catch (error) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.CALCULATION_ERROR,
            message: error instanceof Error ? error.message : "Invoice refund calculation failed.",
          }),
        ],
      });
    }

    const refundedAt = input.refundedAt ?? new Date();
    const adjustmentId = input.adjustmentId
      ?? `adj-refund-${invoice.identity.id}-${refundedAt.toISOString()}`;

    const adjustments = Object.freeze([
      ...invoice.adjustments,
      {
        id: adjustmentId,
        type: "REFUND",
        amount: -input.amount,
        reason: input.reason ?? "Refund processed for invoice.",
        appliedAt: refundedAt,
      },
    ]);

    const restored = Invoice.restore({
      ...toInvoiceComposition(invoice),
      amountPaid: refundedState.amountPaid,
      balanceDue: refundedState.balanceDue,
      refundableAmount: refundedState.refundableAmount,
      adjustments,
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
      warnings: ["External refund execution is required outside InvoiceEngine."],
    });
  }
}
