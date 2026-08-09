"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceCancellationOperation = void 0;
const aggregate_1 = require("../../aggregate");
const models_1 = require("../../models");
const policies_1 = require("../../policies");
const calculations_1 = require("../calculations");
const models_2 = require("../models");
const operation_support_1 = require("./operation-support");
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
class InvoiceCancellationOperation {
    constructor(calculator = new calculations_1.InvoiceFinancialCalculator()) {
        this.calculator = calculator;
        this.operation = policies_1.InvoiceOperation.CANCEL;
    }
    execute(context) {
        const invoice = (0, operation_support_1.ensurePresent)(context.invoice, "Invoice is required for cancellation operation.");
        if (context.operationInput?.operation !== policies_1.InvoiceOperation.CANCEL) {
            return (0, models_2.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_2.createInvoiceEngineError)({
                        code: models_2.InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
                        message: "Invoice cancellation operation input is required.",
                    }),
                ],
            });
        }
        const input = context.operationInput;
        if (isBlank(input.policyReference)) {
            return (0, models_2.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_2.createInvoiceEngineError)({
                        code: models_2.InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
                        message: "Cancellation policy reference is required.",
                    }),
                ],
            });
        }
        if (!Number.isFinite(input.cancellationCharge) || input.cancellationCharge < 0) {
            return (0, models_2.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_2.createInvoiceEngineError)({
                        code: models_2.InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
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
        }
        catch (error) {
            return (0, models_2.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_2.createInvoiceEngineError)({
                        code: models_2.InvoiceEngineErrorCode.CALCULATION_ERROR,
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
        const restored = aggregate_1.Invoice.restore({
            ...(0, operation_support_1.toInvoiceComposition)(invoice),
            status: models_1.InvoiceStatus.CANCELLED,
            cancellationSnapshot,
            adjustments,
            balanceDue: cancellationState.balanceDue,
            refundableAmount: cancellationState.refundableAmount,
            metadata: (0, operation_support_1.resolveMetadata)(invoice.metadata),
        });
        const financialImpact = {
            currency: restored.financialObligation.currency,
            totalObligation: restored.financialObligation.totalAmount,
            previousAmountPaid: invoice.amountPaid,
            newAmountPaid: restored.amountPaid,
            previousBalanceDue: invoice.balanceDue,
            newBalanceDue: restored.balanceDue,
            previousRefundableAmount: invoice.refundableAmount,
            newRefundableAmount: restored.refundableAmount,
        };
        return (0, models_2.createInvoiceOperationExecution)({
            success: true,
            invoice: restored,
            financialImpact,
        });
    }
}
exports.InvoiceCancellationOperation = InvoiceCancellationOperation;
//# sourceMappingURL=invoice-cancellation-operation.js.map