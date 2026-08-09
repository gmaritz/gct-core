"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoicePresentationModel = createInvoicePresentationModel;
const invoice_adjustment_presentation_model_1 = require("./invoice-adjustment-presentation-model");
const invoice_cancellation_presentation_model_1 = require("./invoice-cancellation-presentation-model");
const invoice_payment_presentation_model_1 = require("./invoice-payment-presentation-model");
function freezeDeposit(deposit) {
    if (!deposit) {
        return undefined;
    }
    return Object.freeze({
        type: deposit.type,
        value: deposit.value,
        valueDisplay: deposit.valueDisplay,
    });
}
function freezeExternalReferences(references) {
    return Object.freeze(references.map((reference) => Object.freeze({
        system: reference.system,
        reference: reference.reference,
    })));
}
function createInvoicePresentationModel(model) {
    return Object.freeze({
        invoiceId: model.invoiceId,
        status: model.status,
        statusLabel: model.statusLabel,
        reservationReference: model.reservationReference,
        customerReference: Object.freeze({
            customerId: model.customerReference.customerId,
            travellerId: model.customerReference.travellerId,
            display: model.customerReference.display,
        }),
        quoteReference: Object.freeze({
            quoteId: model.quoteReference.quoteId,
            quoteVersion: model.quoteReference.quoteVersion,
        }),
        pricing: Object.freeze({
            snapshotId: model.pricing.snapshotId,
            pricingId: model.pricing.pricingId,
            capturedAt: new Date(model.pricing.capturedAt.getTime()),
            capturedAtDisplay: model.pricing.capturedAtDisplay,
            version: model.pricing.version,
            totalAmount: model.pricing.totalAmount,
            totalAmountDisplay: model.pricing.totalAmountDisplay,
            currency: model.pricing.currency,
        }),
        financial: Object.freeze({
            totalObligation: model.financial.totalObligation,
            totalObligationDisplay: model.financial.totalObligationDisplay,
            amountPaid: model.financial.amountPaid,
            amountPaidDisplay: model.financial.amountPaidDisplay,
            balanceDue: model.financial.balanceDue,
            balanceDueDisplay: model.financial.balanceDueDisplay,
            refundableAmount: model.financial.refundableAmount,
            refundableAmountDisplay: model.financial.refundableAmountDisplay,
            currency: model.financial.currency,
        }),
        dueDate: typeof model.dueDate === "undefined" ? undefined : new Date(model.dueDate.getTime()),
        dueDateDisplay: model.dueDateDisplay,
        deposit: freezeDeposit(model.deposit),
        payments: Object.freeze(model.payments.map(invoice_payment_presentation_model_1.createInvoicePaymentPresentationModel)),
        adjustments: Object.freeze(model.adjustments.map(invoice_adjustment_presentation_model_1.createInvoiceAdjustmentPresentationModel)),
        cancellation: model.cancellation
            ? (0, invoice_cancellation_presentation_model_1.createInvoiceCancellationPresentationModel)(model.cancellation)
            : undefined,
        externalReferences: freezeExternalReferences(model.externalReferences),
        metadata: Object.freeze({
            createdAt: new Date(model.metadata.createdAt.getTime()),
            createdAtDisplay: model.metadata.createdAtDisplay,
            updatedAt: new Date(model.metadata.updatedAt.getTime()),
            updatedAtDisplay: model.metadata.updatedAtDisplay,
            version: model.metadata.version,
        }),
    });
}
//# sourceMappingURL=invoice-presentation-model.js.map