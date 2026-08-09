"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceIntegrationMapper = void 0;
const models_1 = require("./models");
class InvoiceIntegrationMapper {
    mapInvoice(invoice, operation) {
        return (0, models_1.createInvoiceExternalIntegrationRequest)({
            operation,
            invoiceId: invoice.identity.id,
            issueDate: invoice.metadata.createdAt,
            dueDate: invoice.dueDate,
            status: invoice.status,
            customer: {
                customerId: invoice.customerReference.customerId,
                travellerId: invoice.customerReference.travellerId,
            },
            reservationReference: invoice.reservationReference.reservationId,
            currency: invoice.financialObligation.currency,
            totalAmount: invoice.financialObligation.totalAmount,
            paymentState: {
                amountPaid: invoice.amountPaid,
                balanceDue: invoice.balanceDue,
                refundableAmount: invoice.refundableAmount,
            },
            cancellationState: invoice.cancellationSnapshot
                ? {
                    cancellationDate: invoice.cancellationSnapshot.cancellationDate,
                    cancellationCharge: invoice.cancellationSnapshot.cancellationCharge,
                    refundableAmount: invoice.cancellationSnapshot.refundableAmount,
                }
                : undefined,
            externalReferences: invoice.externalReferences,
        });
    }
}
exports.InvoiceIntegrationMapper = InvoiceIntegrationMapper;
//# sourceMappingURL=invoice-integration-mapper.js.map