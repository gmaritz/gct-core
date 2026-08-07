import {
  createPaymentMetadata,
  createPaymentState,
  PaymentMetadata,
  PaymentMethod,
  PaymentPricingSnapshot,
  PaymentReservationSnapshot,
  PaymentState,
} from "../../models";

export interface PaymentProcessingMetadata extends PaymentMetadata {
  readonly correlationId?: string;
}

export interface PaymentProcessingContext {
  readonly paymentSnapshot: PaymentState;
  readonly reservationSnapshot: PaymentReservationSnapshot;
  readonly pricingSnapshot: PaymentPricingSnapshot;
  readonly paymentMethod: PaymentMethod;
  readonly processingMetadata: PaymentProcessingMetadata;
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function freezeReservationSnapshot(snapshot: PaymentReservationSnapshot): PaymentReservationSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    reservationId: snapshot.reservationId,
    reservationReference: snapshot.reservationReference,
  });
}

function freezePricingSnapshot(snapshot: PaymentPricingSnapshot): PaymentPricingSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    pricingId: snapshot.pricingId,
    subtotal: snapshot.subtotal,
    taxes: snapshot.taxes,
    discounts: snapshot.discounts,
    fees: snapshot.fees,
    total: snapshot.total,
    currency: snapshot.currency,
  });
}

export function createPaymentProcessingContext(context: PaymentProcessingContext): PaymentProcessingContext {
  return Object.freeze({
    paymentSnapshot: createPaymentState(context.paymentSnapshot),
    reservationSnapshot: freezeReservationSnapshot(context.reservationSnapshot),
    pricingSnapshot: freezePricingSnapshot(context.pricingSnapshot),
    paymentMethod: context.paymentMethod,
    processingMetadata: Object.freeze({
      ...createPaymentMetadata(context.processingMetadata),
      correlationId: context.processingMetadata.correlationId,
    }),
  });
}
