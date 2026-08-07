import { AuthorizationRecord, createAuthorizationRecord } from "../authorization";
import { CaptureRecord, createCaptureRecord } from "../capture";
import { PaymentReference, createPaymentReference } from "../identity";
import { PaymentInstrument, PaymentMethod, createPaymentInstrument } from "../method";
import { RefundRecord, createRefundRecord } from "../refund";
import { createSettlementRecord, SettlementRecord } from "../settlement";
import { PaymentStatus } from "./payment-status";

export interface PaymentReservationSnapshot {
  readonly snapshotId: string;
  readonly capturedAt: Date;
  readonly version: string;
  readonly reservationId: string;
  readonly reservationReference: string;
}

export interface PaymentQuoteSnapshot {
  readonly snapshotId: string;
  readonly capturedAt: Date;
  readonly version: string;
  readonly quoteId: string;
  readonly quotationNumber: string;
  readonly expiresAt: Date;
}

export interface PaymentPricingSnapshot {
  readonly snapshotId: string;
  readonly capturedAt: Date;
  readonly version: string;
  readonly pricingId: string;
  readonly subtotal: number;
  readonly taxes: number;
  readonly discounts: number;
  readonly fees: number;
  readonly total: number;
  readonly currency: string;
}

export interface PaymentState {
  readonly reference: PaymentReference;
  readonly reservationSnapshot: PaymentReservationSnapshot;
  readonly quoteSnapshot?: PaymentQuoteSnapshot;
  readonly pricingSnapshot: PaymentPricingSnapshot;
  readonly paymentAmount: number;
  readonly currency: string;
  readonly paymentMethod: PaymentMethod;
  readonly paymentInstrument?: PaymentInstrument;
  readonly status: PaymentStatus;
  readonly authorization?: AuthorizationRecord;
  readonly capture?: CaptureRecord;
  readonly settlement?: SettlementRecord;
  readonly refunds: ReadonlyArray<RefundRecord>;
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

function freezeQuoteSnapshot(snapshot: PaymentQuoteSnapshot): PaymentQuoteSnapshot {
  return Object.freeze({
    snapshotId: snapshot.snapshotId,
    capturedAt: cloneDate(snapshot.capturedAt),
    version: snapshot.version,
    quoteId: snapshot.quoteId,
    quotationNumber: snapshot.quotationNumber,
    expiresAt: cloneDate(snapshot.expiresAt),
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

export function createPaymentState(state: PaymentState): PaymentState {
  return Object.freeze({
    reference: createPaymentReference(state.reference),
    reservationSnapshot: freezeReservationSnapshot(state.reservationSnapshot),
    quoteSnapshot: state.quoteSnapshot ? freezeQuoteSnapshot(state.quoteSnapshot) : undefined,
    pricingSnapshot: freezePricingSnapshot(state.pricingSnapshot),
    paymentAmount: state.paymentAmount,
    currency: state.currency,
    paymentMethod: state.paymentMethod,
    paymentInstrument: state.paymentInstrument ? createPaymentInstrument(state.paymentInstrument) : undefined,
    status: state.status,
    authorization: state.authorization ? createAuthorizationRecord(state.authorization) : undefined,
    capture: state.capture ? createCaptureRecord(state.capture) : undefined,
    settlement: state.settlement ? createSettlementRecord(state.settlement) : undefined,
    refunds: Object.freeze((state.refunds ?? []).map(createRefundRecord)),
  });
}
