"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceFinancialCalculator = void 0;
const models_1 = require("../../models");
function ensureFinite(value, message) {
    if (!Number.isFinite(value)) {
        throw new Error(message);
    }
}
function ensureNonNegative(value, message) {
    ensureFinite(value, message);
    if (value < 0) {
        throw new Error(message);
    }
}
class InvoiceFinancialCalculator {
    calculateDepositAmount(totalAmount, requirement) {
        ensureNonNegative(totalAmount, "Invoice total amount is invalid for deposit calculation.");
        if (!requirement) {
            return 0;
        }
        ensureNonNegative(requirement.value, "Invoice deposit requirement is invalid.");
        if (requirement.type === "FIXED") {
            return requirement.value;
        }
        if (requirement.type === "PERCENTAGE") {
            return (totalAmount * requirement.value) / 100;
        }
        throw new Error("Invoice deposit requirement type is invalid.");
    }
    applyPayment(input) {
        ensureNonNegative(input.totalObligation, "Invoice total obligation is invalid.");
        ensureNonNegative(input.previousAmountPaid, "Invoice amount paid is invalid.");
        ensureNonNegative(input.paymentAmount, "Invoice payment amount is invalid.");
        const nextAmountPaid = input.previousAmountPaid + input.paymentAmount;
        if (nextAmountPaid > input.totalObligation) {
            throw new Error("Invoice payment exceeds total obligation.");
        }
        const nextBalanceDue = input.totalObligation - nextAmountPaid;
        const nextStatus = nextBalanceDue === 0
            ? models_1.InvoiceStatus.PAID
            : input.previousStatus === models_1.InvoiceStatus.OVERDUE
                ? models_1.InvoiceStatus.OVERDUE
                : models_1.InvoiceStatus.PARTIALLY_PAID;
        return Object.freeze({
            amountPaid: nextAmountPaid,
            balanceDue: nextBalanceDue,
            status: nextStatus,
        });
    }
    calculateCancellationState(input) {
        ensureNonNegative(input.amountPaid, "Invoice amount paid is invalid for cancellation calculation.");
        ensureNonNegative(input.cancellationCharge, "Invoice cancellation charge is invalid.");
        const balanceDue = Math.max(0, input.cancellationCharge - input.amountPaid);
        const refundableAmount = Math.max(0, input.amountPaid - input.cancellationCharge);
        return Object.freeze({
            balanceDue,
            refundableAmount,
        });
    }
    applyRefund(input) {
        ensureNonNegative(input.totalObligation, "Invoice total obligation is invalid for refund calculation.");
        ensureNonNegative(input.amountPaid, "Invoice amount paid is invalid for refund calculation.");
        ensureNonNegative(input.refundableAmount, "Invoice refundable amount is invalid for refund calculation.");
        ensureNonNegative(input.refundAmount, "Invoice refund amount is invalid.");
        if (input.refundAmount === 0) {
            throw new Error("Invoice refund amount must be greater than zero.");
        }
        if (input.refundAmount > input.refundableAmount) {
            throw new Error("Invoice refund amount exceeds refundable amount.");
        }
        if (input.refundAmount > input.amountPaid) {
            throw new Error("Invoice refund amount exceeds amount paid.");
        }
        const amountPaid = input.amountPaid - input.refundAmount;
        const balanceDue = Math.max(0, input.totalObligation - amountPaid);
        const refundableAmount = input.refundableAmount - input.refundAmount;
        return Object.freeze({
            amountPaid,
            balanceDue,
            refundableAmount,
        });
    }
}
exports.InvoiceFinancialCalculator = InvoiceFinancialCalculator;
//# sourceMappingURL=invoice-financial-calculator.js.map