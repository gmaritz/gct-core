import {
  PaymentMetadata,
  PaymentMethod,
  PaymentPricingSnapshot,
  PaymentReservationSnapshot,
} from "../../models";
import { PaymentValidationRequest } from "../../validation";

export interface PaymentPolicyContext {
  readonly reservationSnapshot: PaymentReservationSnapshot;
  readonly pricingSnapshot: PaymentPricingSnapshot;
  readonly paymentRequest: PaymentValidationRequest;
  readonly paymentMethod: PaymentMethod;
  readonly paymentMetadata: PaymentMetadata;
}

export function createPaymentPolicyContext(context: PaymentPolicyContext): PaymentPolicyContext {
  return Object.freeze({
    reservationSnapshot: Object.freeze({
      snapshotId: context.reservationSnapshot.snapshotId,
      capturedAt: new Date(context.reservationSnapshot.capturedAt.getTime()),
      version: context.reservationSnapshot.version,
      reservationId: context.reservationSnapshot.reservationId,
      reservationReference: context.reservationSnapshot.reservationReference,
    }),
    pricingSnapshot: Object.freeze({
      snapshotId: context.pricingSnapshot.snapshotId,
      capturedAt: new Date(context.pricingSnapshot.capturedAt.getTime()),
      version: context.pricingSnapshot.version,
      pricingId: context.pricingSnapshot.pricingId,
      subtotal: context.pricingSnapshot.subtotal,
      taxes: context.pricingSnapshot.taxes,
      discounts: context.pricingSnapshot.discounts,
      fees: context.pricingSnapshot.fees,
      total: context.pricingSnapshot.total,
      currency: context.pricingSnapshot.currency,
    }),
    paymentRequest: context.paymentRequest,
    paymentMethod: context.paymentMethod,
    paymentMetadata: Object.freeze({
      createdAt: new Date(context.paymentMetadata.createdAt.getTime()),
      updatedAt: new Date(context.paymentMetadata.updatedAt.getTime()),
      version: context.paymentMetadata.version,
      source: context.paymentMetadata.source,
      audit: context.paymentMetadata.audit
        ? Object.freeze({
            correlationId: context.paymentMetadata.audit.correlationId,
            requestId: context.paymentMetadata.audit.requestId,
            traceId: context.paymentMetadata.audit.traceId,
            createdBy: context.paymentMetadata.audit.createdBy,
            updatedBy: context.paymentMetadata.audit.updatedBy,
          })
        : undefined,
    }),
  });
}
