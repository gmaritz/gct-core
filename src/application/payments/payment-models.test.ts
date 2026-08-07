import {
  AuthorizationStatus,
  CaptureStatus,
  createAuthorizationRecord,
  createCaptureRecord,
  createPaymentEvent,
  createPaymentMetadata,
  createPaymentReference,
  createPaymentTimeline,
  createRefundRecord,
  createSettlementRecord,
  createTransactionReference,
  PaymentEventType,
  PaymentMethod,
  PaymentStatus,
  RefundStatus,
  SettlementStatus,
} from "@application/payments/models";
import { Payment } from "@application/payments/aggregate";

function createProviderReference() {
  return {
    providerIdentifier: "gateway-a",
    reference: "ref-1001",
    correlationId: "corr-1001",
  };
}

describe("Payment model library", () => {
  it("creates immutable identity references", () => {
    const paymentReference = createPaymentReference({
      paymentId: "payment-1001",
      reservationId: "reservation-1001",
      quotationNumber: "Q-1001",
    });

    const transactionReference = createTransactionReference({
      transactionId: "txn-1001",
      providerCorrelationId: "corr-1001",
      customerReference: "cust-1001",
    });

    expect(paymentReference.paymentId).toBe("payment-1001");
    expect(transactionReference.transactionId).toBe("txn-1001");
    expect(Object.isFrozen(paymentReference)).toBe(true);
    expect(Object.isFrozen(transactionReference)).toBe(true);
  });

  it("creates immutable authorization records", () => {
    const record = createAuthorizationRecord({
      authorizationId: "auth-1001",
      authorizedAt: new Date("2026-08-07T10:03:00.000Z"),
      amount: 46300,
      currency: "ZAR",
      providerReference: createProviderReference(),
      status: AuthorizationStatus.APPROVED,
    });

    expect(record.status).toBe(AuthorizationStatus.APPROVED);
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record.providerReference)).toBe(true);
  });

  it("creates immutable capture records", () => {
    const record = createCaptureRecord({
      captureId: "capture-1001",
      capturedAt: new Date("2026-08-07T10:04:00.000Z"),
      amount: 46300,
      currency: "ZAR",
      providerReference: createProviderReference(),
      status: CaptureStatus.CAPTURED,
    });

    expect(record.status).toBe(CaptureStatus.CAPTURED);
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record.providerReference)).toBe(true);
  });

  it("creates immutable settlement records", () => {
    const record = createSettlementRecord({
      reference: {
        settlementId: "settle-1001",
        batchReference: "batch-1001",
        providerReference: createProviderReference(),
      },
      settledAt: new Date("2026-08-08T10:04:00.000Z"),
      amount: 46300,
      currency: "ZAR",
      status: SettlementStatus.SETTLED,
    });

    expect(record.status).toBe(SettlementStatus.SETTLED);
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record.reference)).toBe(true);
    expect(Object.isFrozen(record.reference.providerReference)).toBe(true);
  });

  it("creates immutable refund records", () => {
    const record = createRefundRecord({
      refundId: "refund-1001",
      requestedAt: new Date("2026-08-09T10:04:00.000Z"),
      refundedAt: new Date("2026-08-09T11:00:00.000Z"),
      amount: 500,
      currency: "ZAR",
      reason: "Customer change",
      status: RefundStatus.REFUNDED,
      providerReference: createProviderReference(),
    });

    expect(record.status).toBe(RefundStatus.REFUNDED);
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record.providerReference)).toBe(true);
  });

  it("creates immutable timeline events and timelines", () => {
    const event = createPaymentEvent({
      eventType: PaymentEventType.PAYMENT_CREATED,
      occurredAt: new Date("2026-08-07T10:00:00.000Z"),
      note: "Payment initiated",
      transactionReference: {
        transactionId: "txn-1001",
      },
    });

    const timeline = createPaymentTimeline([event]);

    expect(event.eventType).toBe(PaymentEventType.PAYMENT_CREATED);
    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(timeline)).toBe(true);
    expect(Object.isFrozen(timeline[0])).toBe(true);
  });

  it("creates immutable metadata with cloned dates", () => {
    const input = {
      createdAt: new Date("2026-08-07T10:00:00.000Z"),
      updatedAt: new Date("2026-08-07T10:10:00.000Z"),
      version: "1.0.0",
      source: "APP-006.2",
      audit: {
        correlationId: "corr-1001",
      },
    };

    const metadata = createPaymentMetadata(input);
    input.createdAt.setFullYear(2030);

    expect(metadata.createdAt.getFullYear()).toBe(2026);
    expect(Object.isFrozen(metadata)).toBe(true);
    expect(Object.isFrozen(metadata.audit)).toBe(true);
  });

  it("supports aggregate compatibility using canonical model contracts", () => {
    const payment = Payment.create({
      reference: {
        paymentId: "payment-2001",
        reservationId: "reservation-2001",
      },
      reservationSnapshot: {
        snapshotId: "res-snap-2001",
        capturedAt: new Date("2026-08-07T10:00:00.000Z"),
        version: "1.0.0",
        reservationId: "reservation-2001",
        reservationReference: "RES-2001",
      },
      pricingSnapshot: {
        snapshotId: "pricing-snap-2001",
        capturedAt: new Date("2026-08-07T10:01:00.000Z"),
        version: "1.0.0",
        pricingId: "pricing-2001",
        subtotal: 10000,
        taxes: 1500,
        discounts: 300,
        fees: 100,
        total: 11300,
        currency: "ZAR",
      },
      paymentAmount: 11300,
      currency: "ZAR",
      paymentMethod: PaymentMethod.CARD,
      status: PaymentStatus.CREATED,
      refunds: [],
      timeline: [],
      metadata: {
        createdAt: new Date("2026-08-07T10:00:00.000Z"),
        updatedAt: new Date("2026-08-07T10:00:00.000Z"),
        version: "1.0.0",
        source: "test",
      },
    });

    expect(payment.reference.paymentId).toBe("payment-2001");
    expect(payment.pricingSnapshot.total).toBe(11300);
  });
});
