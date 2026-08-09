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

export class InvoiceCancellationOperation implements InvoiceOperationHandler {
  public readonly operation = InvoiceOperation.CANCEL;

  public constructor(private readonly calculator: InvoiceFinancialCalculator = new InvoiceFinancialCalculator()) {}

  public execute(context: InvoiceExecutionContext): InvoiceOperationExecution {
    const invoice = ensurePresent(context.invoice, "Invoice is required for cancellation operation.");

    if (context.operationInput?.operation !== InvoiceOperation.CANCEL) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
            message: "Invoice cancellation operation input is required.",
          }),
        ],
      });
    }

    const input = context.operationInput;

    if (isBlank(input.policyReference)) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
            message: "Cancellation policy reference is required.",
          }),
        ],
      });
    }

    if (!Number.isFinite(input.cancellationCharge) || input.cancellationCharge < 0) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
            message: "Cancellation charge must be zero or greater.",
          }),
        ],
      });
    }

    let cancellationState;
    try {
      cancellationState = this.calculator.calculateCancellationState({
        amountPaid: invoice.amountPaid,
        cancellationCharge: input.cancellationCharge,
      });
    } catch (error) {
      return createInvoiceOperationExecution({
        success: false,
        errors: [
          createInvoiceEngineError({
            code: InvoiceEngineErrorCode.CALCULATION_ERROR,
            message: error instanceof Error ? error.message : "Invoice cancellation calculation failed.",
          }),
        ],
      });
    }

    const cancellationSnapshot = {
      policyReference: input.policyReference,
      policyVersion: input.policyVersion,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      cancellationDate: input.cancellationDate,
      cancellationCharge: input.cancellationCharge,
      refundableAmount: cancellationState.refundableAmount,
    };

    const adjustmentId = input.adjustmentId
      ?? `adj-cancel-${invoice.identity.id}-${input.cancellationDate.toISOString()}`;

    const adjustments = Object.freeze([
      ...invoice.adjustments,
      {
        id: adjustmentId,
        type: "CANCELLATION_CHARGE",
        amount: input.cancellationCharge,
        reason: input.reason ?? "Cancellation charge applied.",
        appliedAt: input.cancellationDate,
      },
    ]);

    const restored = Invoice.restore({
      ...toInvoiceComposition(invoice),
      status: InvoiceStatus.CANCELLED,
      cancellationSnapshot,
      adjustments,
      balanceDue: cancellationState.balanceDue,
      refundableAmount: cancellationState.refundableAmount,
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
