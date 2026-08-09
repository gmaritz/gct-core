"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicePresentationMapper = void 0;
const models_1 = require("./models");
function formatMoney(amount, currency) {
    return `${currency} ${amount.toFixed(2)}`;
}
function formatDate(value) {
    return value.toISOString().slice(0, 10);
}
function toStatusLabel(status) {
    return status
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}
function customerDisplay(invoice) {
    if (invoice.customerReference.customerId) {
        return invoice.customerReference.customerId;
    }
    if (invoice.customerReference.travellerId) {
        return invoice.customerReference.travellerId;
    }
    return "Unknown customer";
}
function resolveIssueDate(invoice) {
    return invoice.metadata.createdAt;
}
class InvoicePresentationMapper {
    mapInvoice(invoice) {
        const currency = invoice.financialObligation.currency;
        const detail = (0, models_1.createInvoicePresentationModel)({
            invoiceId: invoice.identity.id,
            status: invoice.status,
            statusLabel: toStatusLabel(invoice.status),
            reservationReference: invoice.reservationReference.reservationId,
            customerReference: {
                customerId: invoice.customerReference.customerId,
                travellerId: invoice.customerReference.travellerId,
                display: customerDisplay(invoice),
            },
            quoteReference: {
                quoteId: invoice.quoteReference.quoteId,
                quoteVersion: invoice.quoteReference.quoteVersion,
            },
            pricing: {
                snapshotId: invoice.pricingSnapshot.snapshotId,
                pricingId: invoice.pricingSnapshot.pricingId,
                capturedAt: invoice.pricingSnapshot.capturedAt,
                capturedAtDisplay: formatDate(invoice.pricingSnapshot.capturedAt),
                version: invoice.pricingSnapshot.version,
                totalAmount: invoice.pricingSnapshot.totalAmount,
                totalAmountDisplay: formatMoney(invoice.pricingSnapshot.totalAmount, invoice.pricingSnapshot.currency),
                currency: invoice.pricingSnapshot.currency,
            },
            financial: {
                totalObligation: invoice.financialObligation.totalAmount,
                totalObligationDisplay: formatMoney(invoice.financialObligation.totalAmount, currency),
                amountPaid: invoice.amountPaid,
                amountPaidDisplay: formatMoney(invoice.amountPaid, currency),
                balanceDue: invoice.balanceDue,
                balanceDueDisplay: formatMoney(invoice.balanceDue, currency),
                refundableAmount: invoice.refundableAmount,
                refundableAmountDisplay: formatMoney(invoice.refundableAmount, currency),
                currency,
            },
            dueDate: invoice.dueDate,
            dueDateDisplay: invoice.dueDate ? formatDate(invoice.dueDate) : undefined,
            deposit: invoice.depositRequirement
                ? {
                    type: invoice.depositRequirement.type,
                    value: invoice.depositRequirement.value,
                    valueDisplay: invoice.depositRequirement.type === "PERCENTAGE"
                        ? `${invoice.depositRequirement.value.toFixed(2)}%`
                        : formatMoney(invoice.depositRequirement.value, currency),
                }
                : undefined,
            payments: invoice.paymentAllocations.map((payment) => (0, models_1.createInvoicePaymentPresentationModel)({
                paymentId: payment.paymentId,
                allocatedAmount: payment.allocatedAmount,
                allocatedAmountDisplay: formatMoney(payment.allocatedAmount, currency),
                allocatedAt: payment.allocatedAt,
                allocatedAtDisplay: formatDate(payment.allocatedAt),
                externalReference: payment.externalReference,
            })),
            adjustments: invoice.adjustments.map((adjustment) => (0, models_1.createInvoiceAdjustmentPresentationModel)({
                id: adjustment.id,
                type: adjustment.type,
                amount: adjustment.amount,
                amountDisplay: formatMoney(adjustment.amount, currency),
                reason: adjustment.reason,
                appliedAt: adjustment.appliedAt,
                appliedAtDisplay: formatDate(adjustment.appliedAt),
            })),
            cancellation: invoice.cancellationSnapshot
                ? (0, models_1.createInvoiceCancellationPresentationModel)({
                    policyReference: invoice.cancellationSnapshot.policyReference,
                    policyVersion: invoice.cancellationSnapshot.policyVersion,
                    cancellationDate: invoice.cancellationSnapshot.cancellationDate,
                    cancellationDateDisplay: formatDate(invoice.cancellationSnapshot.cancellationDate),
                    cancellationCharge: invoice.cancellationSnapshot.cancellationCharge,
                    cancellationChargeDisplay: formatMoney(invoice.cancellationSnapshot.cancellationCharge, currency),
                    refundableAmount: invoice.cancellationSnapshot.refundableAmount,
                    refundableAmountDisplay: formatMoney(invoice.cancellationSnapshot.refundableAmount, currency),
                })
                : undefined,
            externalReferences: invoice.externalReferences.map((reference) => ({
                system: reference.system,
                reference: reference.reference,
            })),
            metadata: {
                createdAt: invoice.metadata.createdAt,
                createdAtDisplay: formatDate(invoice.metadata.createdAt),
                updatedAt: invoice.metadata.updatedAt,
                updatedAtDisplay: formatDate(invoice.metadata.updatedAt),
                version: invoice.metadata.version,
            },
        });
        const issueDate = resolveIssueDate(invoice);
        const summary = (0, models_1.createInvoiceSummaryPresentationModel)({
            invoiceId: invoice.identity.id,
            reservationReference: invoice.reservationReference.reservationId,
            customerDisplay: customerDisplay(invoice),
            status: invoice.status,
            statusLabel: toStatusLabel(invoice.status),
            issueDate,
            issueDateDisplay: formatDate(issueDate),
            dueDate: invoice.dueDate,
            dueDateDisplay: invoice.dueDate ? formatDate(invoice.dueDate) : undefined,
            total: invoice.financialObligation.totalAmount,
            totalDisplay: formatMoney(invoice.financialObligation.totalAmount, currency),
            amountPaid: invoice.amountPaid,
            amountPaidDisplay: formatMoney(invoice.amountPaid, currency),
            balanceDue: invoice.balanceDue,
            balanceDueDisplay: formatMoney(invoice.balanceDue, currency),
            currency,
        });
        return Object.freeze({
            invoice: detail,
            summary,
        });
    }
    mapEngineResult(engineResult, target) {
        const financialImpact = engineResult.financialImpact
            ? {
                currency: engineResult.financialImpact.currency,
                totalObligation: engineResult.financialImpact.totalObligation,
                totalObligationDisplay: formatMoney(engineResult.financialImpact.totalObligation, engineResult.financialImpact.currency),
                previousAmountPaid: engineResult.financialImpact.previousAmountPaid,
                previousAmountPaidDisplay: formatMoney(engineResult.financialImpact.previousAmountPaid, engineResult.financialImpact.currency),
                newAmountPaid: engineResult.financialImpact.newAmountPaid,
                newAmountPaidDisplay: formatMoney(engineResult.financialImpact.newAmountPaid, engineResult.financialImpact.currency),
                previousBalanceDue: engineResult.financialImpact.previousBalanceDue,
                previousBalanceDueDisplay: formatMoney(engineResult.financialImpact.previousBalanceDue, engineResult.financialImpact.currency),
                newBalanceDue: engineResult.financialImpact.newBalanceDue,
                newBalanceDueDisplay: formatMoney(engineResult.financialImpact.newBalanceDue, engineResult.financialImpact.currency),
                previousRefundableAmount: engineResult.financialImpact.previousRefundableAmount,
                previousRefundableAmountDisplay: formatMoney(engineResult.financialImpact.previousRefundableAmount, engineResult.financialImpact.currency),
                newRefundableAmount: engineResult.financialImpact.newRefundableAmount,
                newRefundableAmountDisplay: formatMoney(engineResult.financialImpact.newRefundableAmount, engineResult.financialImpact.currency),
            }
            : undefined;
        return (0, models_1.createInvoiceEnginePresentationModel)({
            operation: engineResult.operation,
            outcome: engineResult.outcome,
            policyOutcome: engineResult.policyEvaluation.outcome,
            requiredActions: engineResult.policyEvaluation.requiredActions,
            warnings: engineResult.warnings,
            errors: engineResult.errors.map((error) => error.message),
            financialImpact,
            metadata: {
                completedAt: engineResult.metadata.completedAt,
                completedAtDisplay: formatDate(engineResult.metadata.completedAt),
                requestId: engineResult.metadata.requestId,
                source: engineResult.metadata.source,
                version: engineResult.metadata.version,
                stages: engineResult.metadata.stages,
                target,
            },
        });
    }
}
exports.InvoicePresentationMapper = InvoicePresentationMapper;
//# sourceMappingURL=invoice-presentation-mapper.js.map