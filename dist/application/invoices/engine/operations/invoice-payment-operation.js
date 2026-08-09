"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicePaymentOperation = void 0;
const aggregate_1 = require("../../aggregate");
const models_1 = require("../../models");
const policies_1 = require("../../policies");
const calculations_1 = require("../calculations");
const models_2 = require("../models");
const operation_support_1 = require("./operation-support");
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
class InvoicePaymentOperation {
    constructor(calculator = new calculations_1.InvoiceFinancialCalculator()) {
        this.calculator = calculator;
        this.operation = policies_1.InvoiceOperation.ACCEPT_PAYMENT;
    }
    execute(context) {
        const invoice = (0, operation_support_1.ensurePresent)(context.invoice, "Invoice is required for payment operation.");
        if (context.operationInput?.operation !== policies_1.InvoiceOperation.ACCEPT_PAYMENT) {
            return (0, models_2.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_2.createInvoiceEngineError)({
                        code: models_2.InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
                        message: "Invoice payment operation input is required.",
                    }),
                ],
            });
        }
        const input = context.operationInput;
        if (isBlank(input.paymentId)) {
            return (0, models_2.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_2.createInvoiceEngineError)({
                        code: models_2.InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
                        message: "Payment identifier is required.",
                    }),
                ],
            });
        }
        if (!Number.isFinite(input.amount) || input.amount <= 0) {
            return (0, models_2.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_2.createInvoiceEngineError)({
                        code: models_2.InvoiceEngineErrorCode.INVALID_OPERATION_INPUT,
                        message: "Payment amount must be greater than zero.",
                    }),
                ],
            });
        }
        if (input.currency !== invoice.financialObligation.currency) {
            return (0, models_2.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_2.createInvoiceEngineError)({
                        code: models_2.InvoiceEngineErrorCode.CURRENCY_MISMATCH,
                        message: "Payment currency must match invoice currency.",
                    }),
                ],
            });
        }
        if (invoice.paymentAllocations.some((allocation) => allocation.paymentId === input.paymentId)) {
            return (0, models_2.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_2.createInvoiceEngineError)({
                        code: models_2.InvoiceEngineErrorCode.DUPLICATE_PAYMENT_ALLOCATION,
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
        }
        catch (error) {
            return (0, models_2.createInvoiceOperationExecution)({
                success: false,
                errors: [
                    (0, models_2.createInvoiceEngineError)({
                        code: models_2.InvoiceEngineErrorCode.CALCULATION_ERROR,
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
        const status = financialState.status === models_1.InvoiceStatus.PARTIALLY_PAID && invoice.status === models_1.InvoiceStatus.OVERDUE
            ? models_1.InvoiceStatus.OVERDUE
            : financialState.status;
        const restored = aggregate_1.Invoice.restore({
            ...(0, operation_support_1.toInvoiceComposition)(invoice),
            status,
            paymentAllocations,
            amountPaid: financialState.amountPaid,
            balanceDue: financialState.balanceDue,
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
            warnings: invoice.status === models_1.InvoiceStatus.OVERDUE
                ? ["Payment applied to overdue invoice."]
                : [],
        });
    }
}
exports.InvoicePaymentOperation = InvoicePaymentOperation;
//# sourceMappingURL=invoice-payment-operation.js.map