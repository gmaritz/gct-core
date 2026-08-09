"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceRefundOperation = void 0;
const aggregate_1 = require("../../aggregate");
const policies_1 = require("../../policies");
const calculations_1 = require("../calculations");
const models_1 = require("../models");
const operation_support_1 = require("./operation-support");
class InvoiceRefundOperation {
    constructor(calculator = new calculations_1.InvoiceFinancialCalculator()) {
        this.calculator = calculator;
        this.operation = policies_1.InvoiceOperation.REFUND;
    }
    execute(context) {
        const invoice = (0, operation_support_1.ensurePresent)(context.invoice, "Invoice is required for refund operation.");
        if (context.operationInput?.operation !== policies_1.InvoiceOperation.REFUND) {
            return (0, models_1.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_1.createInvoiceEngineError)({
                        code: models_1.InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
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
        }
        catch (error) {
            return (0, models_1.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_1.createInvoiceEngineError)({
                        code: models_1.InvoiceEngineErrorCode.CALCULATION_ERROR,
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
        const restored = aggregate_1.Invoice.restore({
            ...(0, operation_support_1.toInvoiceComposition)(invoice),
            amountPaid: refundedState.amountPaid,
            balanceDue: refundedState.balanceDue,
            refundableAmount: refundedState.refundableAmount,
            adjustments,
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
        return (0, models_1.createInvoiceOperationExecution)({
            success: true,
            invoice: restored,
            financialImpact,
            warnings: ["External refund execution is required outside InvoiceEngine."],
        });
    }
}
exports.InvoiceRefundOperation = InvoiceRefundOperation;
//# sourceMappingURL=invoice-refund-operation.js.map