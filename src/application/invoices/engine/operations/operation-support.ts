import { Invoice, InvoiceComposition } from "../../aggregate";
import { InvoiceMetadata } from "../../models";

export function ensurePresent<T>(value: T | null | undefined, message: string): T {
  if (value === null || typeof value === "undefined") {
    throw new Error(message);
  }

  return value;
}

export function resolveMetadata(metadata: InvoiceMetadata): InvoiceMetadata {
  const now = new Date();

  return {
    createdAt: new Date(metadata.createdAt.getTime()),
    updatedAt: now,
    version: metadata.version,
  };
}

export function toInvoiceComposition(invoice: Invoice): InvoiceComposition {
  return {
    identity: invoice.identity,
    reservationReference: invoice.reservationReference,
    customerReference: invoice.customerReference,
    quoteReference: invoice.quoteReference,
    pricingSnapshot: invoice.pricingSnapshot,
    status: invoice.status,
    financialObligation: invoice.financialObligation,
    depositRequirement: invoice.depositRequirement,
    paymentAllocations: invoice.paymentAllocations,
    amountPaid: invoice.amountPaid,
    balanceDue: invoice.balanceDue,
    dueDate: invoice.dueDate,
    adjustments: invoice.adjustments,
    cancellationSnapshot: invoice.cancellationSnapshot,
    refundableAmount: invoice.refundableAmount,
    externalReferences: invoice.externalReferences,
    metadata: invoice.metadata,
  };
}
