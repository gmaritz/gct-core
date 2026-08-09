"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceExternalIntegrationRequest = createInvoiceExternalIntegrationRequest;
const models_1 = require("../../models");
function freezeCancellationState(cancellationState) {
    if (!cancellationState) {
        return undefined;
    }
    return Object.freeze({
        cancellationDate: new Date(cancellationState.cancellationDate.getTime()),
        cancellationCharge: cancellationState.cancellationCharge,
        refundableAmount: cancellationState.refundableAmount,
    });
}
function createInvoiceExternalIntegrationRequest(request) {
    return Object.freeze({
        operation: request.operation,
        invoiceId: request.invoiceId,
        issueDate: new Date(request.issueDate.getTime()),
        dueDate: typeof request.dueDate === "undefined" ? undefined : new Date(request.dueDate.getTime()),
        status: request.status,
        customer: Object.freeze({
            customerId: request.customer.customerId,
            travellerId: request.customer.travellerId,
        }),
        reservationReference: request.reservationReference,
        currency: request.currency,
        totalAmount: request.totalAmount,
        paymentState: Object.freeze({
            amountPaid: request.paymentState.amountPaid,
            balanceDue: request.paymentState.balanceDue,
            refundableAmount: request.paymentState.refundableAmount,
        }),
        cancellationState: freezeCancellationState(request.cancellationState),
        externalReferences: Object.freeze(request.externalReferences.map(models_1.createInvoiceExternalReference)),
    });
}
//# sourceMappingURL=invoice-external-integration-request.js.map