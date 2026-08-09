"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialIntegrityValidator = void 0;
const models_1 = require("../models");
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
}
function isValidDate(value) {
    return value instanceof Date && Number.isFinite(value.getTime());
}
class FinancialIntegrityValidator {
    validate(request) {
        const errors = [];
        const invoice = request.invoice;
        const obligation = request.financialObligation ?? invoice?.financialObligation;
        if (!obligation || !isFiniteNumber(obligation.totalAmount) || obligation.totalAmount < 0) {
            errors.push((0, models_1.createInvoiceValidationError)({
                stage: models_1.InvoiceValidationStage.FINANCIAL_INTEGRITY,
                code: models_1.InvoiceValidationErrorCode.INVALID_TOTAL_AMOUNT,
                message: "Invoice total amount is invalid.",
                severity: "CRITICAL",
            }));
        }
        if (invoice) {
            if (!isFiniteNumber(invoice.amountPaid) || invoice.amountPaid < 0) {
                errors.push((0, models_1.createInvoiceValidationError)({
                    stage: models_1.InvoiceValidationStage.FINANCIAL_INTEGRITY,
                    code: models_1.InvoiceValidationErrorCode.INVALID_AMOUNT_PAID,
                    message: "Invoice amount paid is invalid.",
                    severity: "CRITICAL",
                }));
            }
            if (!isFiniteNumber(invoice.balanceDue) || invoice.balanceDue < 0) {
                errors.push((0, models_1.createInvoiceValidationError)({
                    stage: models_1.InvoiceValidationStage.FINANCIAL_INTEGRITY,
                    code: models_1.InvoiceValidationErrorCode.INVALID_BALANCE_DUE,
                    message: "Invoice balance due is invalid.",
                    severity: "CRITICAL",
                }));
            }
            if (!isFiniteNumber(invoice.refundableAmount) || invoice.refundableAmount < 0) {
                errors.push((0, models_1.createInvoiceValidationError)({
                    stage: models_1.InvoiceValidationStage.FINANCIAL_INTEGRITY,
                    code: models_1.InvoiceValidationErrorCode.INVALID_REFUNDABLE_AMOUNT,
                    message: "Invoice refundable amount is invalid.",
                    severity: "CRITICAL",
                }));
            }
            if (invoice.depositRequirement) {
                const deposit = invoice.depositRequirement;
                const isValidType = deposit.type === "FIXED" || deposit.type === "PERCENTAGE";
                const isValidValue = isFiniteNumber(deposit.value) && deposit.value >= 0;
                const percentageWithinRange = deposit.type !== "PERCENTAGE" || deposit.value <= 100;
                if (!isValidType || !isValidValue || !percentageWithinRange) {
                    errors.push((0, models_1.createInvoiceValidationError)({
                        stage: models_1.InvoiceValidationStage.FINANCIAL_INTEGRITY,
                        code: models_1.InvoiceValidationErrorCode.INVALID_DEPOSIT_REQUIREMENT,
                        message: "Invoice deposit requirement is invalid.",
                        severity: "CRITICAL",
                    }));
                }
            }
            let paymentAllocationTotal = 0;
            for (const allocation of invoice.paymentAllocations) {
                const allocationInvalid = isBlank(allocation.paymentId)
                    || !isFiniteNumber(allocation.allocatedAmount)
                    || allocation.allocatedAmount <= 0
                    || !isValidDate(allocation.allocatedAt)
                    || (typeof allocation.externalReference === "string" && allocation.externalReference.trim().length === 0);
                if (allocationInvalid) {
                    errors.push((0, models_1.createInvoiceValidationError)({
                        stage: models_1.InvoiceValidationStage.FINANCIAL_INTEGRITY,
                        code: models_1.InvoiceValidationErrorCode.INVALID_PAYMENT_ALLOCATION,
                        message: "Invoice payment allocation is invalid.",
                        severity: "CRITICAL",
                    }));
                }
                else {
                    paymentAllocationTotal += allocation.allocatedAmount;
                }
            }
            if (invoice.paymentAllocations.length > 0 && isFiniteNumber(invoice.amountPaid) && paymentAllocationTotal !== invoice.amountPaid) {
                errors.push((0, models_1.createInvoiceValidationError)({
                    stage: models_1.InvoiceValidationStage.FINANCIAL_INTEGRITY,
                    code: models_1.InvoiceValidationErrorCode.PAYMENT_ALLOCATION_TOTAL_MISMATCH,
                    message: "Invoice payment allocations are inconsistent with amount paid.",
                    severity: "CRITICAL",
                }));
            }
            for (const adjustment of invoice.adjustments) {
                const invalidAdjustment = isBlank(adjustment.id)
                    || isBlank(adjustment.type)
                    || !isFiniteNumber(adjustment.amount)
                    || isBlank(adjustment.reason)
                    || !isValidDate(adjustment.appliedAt);
                if (invalidAdjustment) {
                    errors.push((0, models_1.createInvoiceValidationError)({
                        stage: models_1.InvoiceValidationStage.FINANCIAL_INTEGRITY,
                        code: models_1.InvoiceValidationErrorCode.INVALID_ADJUSTMENT,
                        message: "Invoice adjustment is invalid.",
                        severity: "CRITICAL",
                    }));
                }
            }
            if (invoice.cancellationSnapshot) {
                const snapshot = invoice.cancellationSnapshot;
                const invalidSnapshot = isBlank(snapshot.policyReference)
                    || (typeof snapshot.policyVersion === "string" && snapshot.policyVersion.trim().length === 0)
                    || (typeof snapshot.effectiveFrom !== "undefined" && !isValidDate(snapshot.effectiveFrom))
                    || (typeof snapshot.effectiveTo !== "undefined" && !isValidDate(snapshot.effectiveTo))
                    || !isValidDate(snapshot.cancellationDate)
                    || !isFiniteNumber(snapshot.cancellationCharge)
                    || snapshot.cancellationCharge < 0
                    || !isFiniteNumber(snapshot.refundableAmount)
                    || snapshot.refundableAmount < 0;
                if (invalidSnapshot) {
                    errors.push((0, models_1.createInvoiceValidationError)({
                        stage: models_1.InvoiceValidationStage.FINANCIAL_INTEGRITY,
                        code: models_1.InvoiceValidationErrorCode.INVALID_CANCELLATION_SNAPSHOT,
                        message: "Invoice cancellation snapshot is invalid.",
                        severity: "CRITICAL",
                    }));
                }
            }
            if (typeof invoice.dueDate !== "undefined" && !isValidDate(invoice.dueDate)) {
                errors.push((0, models_1.createInvoiceValidationError)({
                    stage: models_1.InvoiceValidationStage.FINANCIAL_INTEGRITY,
                    code: models_1.InvoiceValidationErrorCode.INVALID_DUE_DATE,
                    message: "Invoice due date is invalid.",
                    severity: "CRITICAL",
                }));
            }
            for (const reference of invoice.externalReferences) {
                if (isBlank(reference.system) || isBlank(reference.reference)) {
                    errors.push((0, models_1.createInvoiceValidationError)({
                        stage: models_1.InvoiceValidationStage.FINANCIAL_INTEGRITY,
                        code: models_1.InvoiceValidationErrorCode.INVALID_EXTERNAL_REFERENCE,
                        message: "Invoice external reference is invalid.",
                        severity: "CRITICAL",
                    }));
                }
            }
            const metadata = invoice.metadata;
            const invalidMetadata = isBlank(metadata.version)
                || !isValidDate(metadata.createdAt)
                || !isValidDate(metadata.updatedAt);
            if (invalidMetadata) {
                errors.push((0, models_1.createInvoiceValidationError)({
                    stage: models_1.InvoiceValidationStage.FINANCIAL_INTEGRITY,
                    code: models_1.InvoiceValidationErrorCode.INVALID_METADATA,
                    message: "Invoice metadata is invalid.",
                    severity: "CRITICAL",
                }));
            }
        }
        return (0, models_1.createInvoiceValidationResult)({
            stage: models_1.InvoiceValidationStage.FINANCIAL_INTEGRITY,
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "FinancialIntegrityValidator",
            },
        });
    }
}
exports.FinancialIntegrityValidator = FinancialIntegrityValidator;
//# sourceMappingURL=financial-integrity-validator.js.map