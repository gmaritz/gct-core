import { Invoice } from "../aggregate";
import {
  createInvoiceExternalIntegrationRequest,
  InvoiceExternalIntegrationRequest,
  InvoiceIntegrationOperation,
} from "./models";

export class InvoiceIntegrationMapper {
  public mapInvoice(
    invoice: Invoice,
    operation: InvoiceIntegrationOperation,
  ): InvoiceExternalIntegrationRequest {
    return createInvoiceExternalIntegrationRequest({
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
