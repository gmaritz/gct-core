import { Invoice } from "../../aggregate";
import { InvoiceStatus } from "../../models";
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

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

export class InvoicePaymentOperation implements InvoiceOperationHandler {
  public readonly operation = InvoiceOperation.ACCEPT_PAYMENT;

  public constructor(private readonly calculator: InvoiceFinancialCalculator = new InvoiceFinancialCalculator()) {}

  public execute(context: InvoiceExecutionContext): InvoiceOperationExecution {
    const invoice = ensurePresent(context.invoice, "Invoice is required for payment operation.");

    if (context.operationInput?.operation !== InvoiceOperation.ACCEPT_PAYMENT) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
            message: "Invoice payment operation input is required.",
          }),
        ],
      });
    }

    const input = context.operationInput;

    if (isBlank(input.paymentId)) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
            message: "Payment identifier is required.",
          }),
        ],
      });
    }

    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
            message: "Payment amount must be greater than zero.",
          }),
        ],
      });
    }

    if (input.currency !== invoice.financialObligation.currency) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.CURRENCY_MISMATCH,
            message: "Payment currency must match invoice currency.",
          }),
        ],
      });
    }

    if (invoice.paymentAllocations.some((allocation) => allocation.paymentId === input.paymentId)) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.DUPLICATE_PAYMENT_ALLOCATION,
            message: "Payment allocation already exists for supplied payment identifier.",
          }),
        ],
      });
    }

    let financialState;
    try {
      financialState = this.calculator.applyPayment({
        totalObligation: invoice.financialObligation.totalAmount,
        previousAmountPaid: invoice.amountPaid,
        paymentAmount: input.amount,
        previousStatus: invoice.status,
      });
    } catch (error) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.CALCULATION_ERROR,
            message: error instanceof Error ? error.message : "Invoice payment calculation failed.",
          }),
        ],
      });
    }

    const allocatedAt = input.allocatedAt ?? new Date();
    const paymentAllocations = Object.freeze([
      ...invoice.paymentAllocations,
      {
        paymentId: input.paymentId,
        allocatedAmount: input.amount,
        allocatedAt,
        externalReference: input.externalReference,
      },
    ]);

    const status =
      financialState.status === InvoiceStatus.PARTIALLY_PAID && invoice.status === InvoiceStatus.OVERDUE
        ? InvoiceStatus.OVERDUE
        : financialState.status;

    const restored = Invoice.restore({
      ...toInvoiceComposition(invoice),
      status,
      paymentAllocations,
      amountPaid: financialState.amountPaid,
      balanceDue: financialState.balanceDue,
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
      warnings:
        invoice.status === InvoiceStatus.OVERDUE
          ? ["Payment applied to overdue invoice."]
          : [],
    });
  }
}
