import {
  AuthorizationStatus,
  CaptureStatus,
  PaymentEventType,
  PaymentMethod,
  PaymentStatus,
  RefundStatus,
  SettlementStatus,
} from "@application/payments/models";
import { Payment, PaymentComposition } from "@application/payments/aggregate";

function createComposition(): PaymentComposition {
  return {
    reference: {
      paymentId: "payment-001",
      reservationId: "reservation-9001",
      quotationNumber: "Q-9001",
    },
    transactionReference: {
      transactionId: "txn-9001",
      providerCorrelationId: "corr-9001",
      customerReference: "cust-9001",
    },
    reservationSnapshot: {
      snapshotId: "reservation-snap-001",
      capturedAt: new Date("2026-08-07T10:00:00.000Z"),
      version: "1.0.0",
      reservationId: "reservation-9001",
      reservationReference: "RES-9001",
    },
    quoteSnapshot: {
      snapshotId: "quote-snap-001",
      capturedAt: new Date("2026-08-07T10:01:00.000Z"),
      version: "1.0.0",
      quoteId: "quote-9001",
      quotationNumber: "Q-9001",
      expiresAt: new Date("2026-08-14T10:01:00.000Z"),
    },
    pricingSnapshot: {
      snapshotId: "pricing-snap-001",
      capturedAt: new Date("2026-08-07T10:02:00.000Z"),
      version: "1.0.0",
      pricingId: "pricing-9001",
      subtotal: 42000,
      taxes: 4800,
      discounts: 1000,
      fees: 500,
      total: 46300,
      currency: "ZAR",
    },
    paymentAmount: 46300,
    currency: "ZAR",
    paymentMethod: PaymentMethod.CARD,
    paymentInstrument: {
      instrumentType: "CARD",
      maskedIdentifier: "**** **** **** 1001",
      holderName: "Ari Jacobs",
      expiryMonth: 8,
      expiryYear: 2028,
    },
    status: PaymentStatus.AUTHORIZATION_REQUESTED,
    authorization: {
      authorizationId: "auth-9001",
      authorizedAt: new Date("2026-08-07T10:03:30.000Z"),
      amount: 46300,
      currency: "ZAR",
      providerReference: {
        providerIdentifier: "gateway-a",
        reference: "AUTH-REF-9001",
        correlationId: "corr-9001",
      },
      status: AuthorizationStatus.APPROVED,
    },
    capture: {
      captureId: "capture-9001",
      capturedAt: new Date("2026-08-07T10:04:00.000Z"),
      amount: 46300,
      currency: "ZAR",
      providerReference: {
        providerIdentifier: "gateway-a",
        reference: "CAP-REF-9001",
      },
      status: CaptureStatus.CAPTURED,
    },
    settlement: {
      reference: {
        settlementId: "settlement-9001",
        batchReference: "batch-9001",
        providerReference: {
          providerIdentifier: "gateway-a",
          reference: "SET-REF-9001",
        },
      },
      settledAt: new Date("2026-08-08T10:05:00.000Z"),
      amount: 46300,
      currency: "ZAR",
      status: SettlementStatus.SETTLED,
    },
    refunds: [
      {
        refundId: "refund-9001",
        requestedAt: new Date("2026-08-09T10:10:00.000Z"),
        refundedAt: new Date("2026-08-09T12:00:00.000Z"),
        amount: 500,
        currency: "ZAR",
        reason: "Customer change",
        status: RefundStatus.REFUNDED,
        providerReference: {
          providerIdentifier: "gateway-a",
          reference: "REFUND-REF-9001",
        },
      },
    ],
    timeline: [
      {
        eventType: PaymentEventType.PAYMENT_CREATED,
        occurredAt: new Date("2026-08-07T10:00:00.000Z"),
      },
      {
        eventType: PaymentEventType.CAPTURE_COMPLETED,
        occurredAt: new Date("2026-08-07T10:04:00.000Z"),
      },
    ],
    metadata: {
      createdAt: new Date("2026-08-07T10:00:00.000Z"),
      updatedAt: new Date("2026-08-09T12:00:00.000Z"),
      version: "1.0.0",
      source: "APP-006.2",
      audit: {
        correlationId: "corr-9001",
        requestId: "request-9001",
      },
    },
  };
}

describe("Payment aggregate", () => {
  it("supports valid aggregate creation", () => {
    const payment = Payment.create(createComposition());

    expect(payment.reference.paymentId).toBe("payment-001");
    expect(payment.reservationSnapshot.reservationId).toBe("reservation-9001");
    expect(payment.pricingSnapshot.total).toBe(46300);
    expect(payment.status).toBe(PaymentStatus.AUTHORIZATION_REQUESTED);
  });

  it("supports aggregate restoration", () => {
    const payment = Payment.restore(createComposition());

    expect(payment.reference.paymentId).toBe("payment-001");
    expect(payment.quoteSnapshot?.quotationNumber).toBe("Q-9001");
  });

  it("fails when identifier is missing", () => {
    const composition = createComposition();

    expect(() =>
      Payment.create({
        ...composition,
        reference: {
          ...composition.reference,
          paymentId: " ",
        },
      }),
    ).toThrow("Payment identity is required.");
  });

  it("fails when reservation snapshot is missing", () => {
    const composition = createComposition();

    expect(() =>
      Payment.create({
        ...composition,
        reservationSnapshot: undefined as unknown as PaymentComposition["reservationSnapshot"],
      }),
    ).toThrow("Reservation snapshot is required.");
  });

  it("fails when pricing snapshot is missing", () => {
    const composition = createComposition();

    expect(() =>
      Payment.create({
        ...composition,
        pricingSnapshot: undefined as unknown as PaymentComposition["pricingSnapshot"],
      }),
    ).toThrow("Pricing snapshot is required.");
  });

  it("fails when payment method is missing", () => {
    const composition = createComposition();

    expect(() =>
      Payment.create({
        ...composition,
        paymentMethod: undefined as unknown as PaymentComposition["paymentMethod"],
      }),
    ).toThrow("Payment method is required.");
  });

  it("fails when status is missing", () => {
    const composition = createComposition();

    expect(() =>
      Payment.create({
        ...composition,
        status: undefined as unknown as PaymentComposition["status"],
      }),
    ).toThrow("Payment status is required.");
  });

  it("enforces frozen snapshots and collections", () => {
    const payment = Payment.create(createComposition());

    expect(Object.isFrozen(payment)).toBe(true);
    expect(Object.isFrozen(payment.reference)).toBe(true);
    expect(Object.isFrozen(payment.reservationSnapshot)).toBe(true);
    expect(Object.isFrozen(payment.pricingSnapshot)).toBe(true);
    expect(Object.isFrozen(payment.refunds)).toBe(true);
    expect(Object.isFrozen(payment.timeline)).toBe(true);
    expect(Object.isFrozen(payment.metadata)).toBe(true);
  });

  it("uses defensive copying for input mutation and cloned dates", () => {
    const composition = createComposition();
    const payment = Payment.create(composition);
    const mutableReference = composition.reference as { paymentId: string };
    const mutableReservation = composition.reservationSnapshot as { reservationId: string };
    const mutableRefunds = (composition.refunds ?? []) as unknown as Array<{
      refundId: string;
      requestedAt: Date;
      amount: number;
      currency: string;
      reason: string;
      status: RefundStatus;
      providerReference: {
        providerIdentifier: string;
        reference: string;
      };
    }>;

    mutableReference.paymentId = "payment-mutated";
    mutableReservation.reservationId = "reservation-mutated";
    mutableRefunds[0] = {
      refundId: "refund-mutated",
      requestedAt: new Date("2027-01-01T00:00:00.000Z"),
      amount: 1,
      currency: "ZAR",
      reason: "Mutation",
      status: RefundStatus.REQUESTED,
      providerReference: {
        providerIdentifier: "gateway-a",
        reference: "mutated",
      },
    };
    composition.metadata.createdAt.setFullYear(2030);

    expect(payment.reference.paymentId).toBe("payment-001");
    expect(payment.reservationSnapshot.reservationId).toBe("reservation-9001");
    expect(payment.refunds[0]?.refundId).toBe("refund-9001");
    expect(payment.metadata.createdAt.getFullYear()).toBe(2026);
  });

  it("exposes readonly aggregate contracts", () => {
    const payment: Payment = Payment.create(createComposition());

    expect(payment.currency).toBe("ZAR");
  });
});
