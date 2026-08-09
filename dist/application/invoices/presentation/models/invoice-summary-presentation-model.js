"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceSummaryPresentationModel = createInvoiceSummaryPresentationModel;
function createInvoiceSummaryPresentationModel(model) {
    return Object.freeze({
        invoiceId: model.invoiceId,
        reservationReference: model.reservationReference,
        customerDisplay: model.customerDisplay,
        status: model.status,
        statusLabel: model.statusLabel,
        issueDate: new Date(model.issueDate.getTime()),
        issueDateDisplay: model.issueDateDisplay,
        dueDate: typeof model.dueDate === "undefined" ? undefined : new Date(model.dueDate.getTime()),
        dueDateDisplay: model.dueDateDisplay,
        total: model.total,
        totalDisplay: model.totalDisplay,
        amountPaid: model.amountPaid,
        amountPaidDisplay: model.amountPaidDisplay,
        balanceDue: model.balanceDue,
        balanceDueDisplay: model.balanceDueDisplay,
        currency: model.currency,
    });
}
//# sourceMappingURL=invoice-summary-presentation-model.js.map