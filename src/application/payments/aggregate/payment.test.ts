import { Payment, PaymentComposition, PaymentStatus } from "@application/payments/aggregate";

function createComposition(): PaymentComposition {
  return {
    identity: {
      id: "payment-001",
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
    paymentMethod: "CARD",
    status: PaymentStatus.PENDING_AUTHORIZATION,
    authorizationSnapshot: {
      snapshotId: "auth-snap-001",
      capturedAt: new Date("2026-08-07T10:03:00.000Z"),
      version: "1.0.0",
      authorizationId: "auth-9001",
      authorizedAt: new Date("2026-08-07T10:03:30.000Z"),
      amount: 46300,
      currency: "ZAR",
      providerReference: "AUTH-REF-9001",
      status: "APPROVED",
    },
    captureSnapshot: {
      snapshotId: "capture-snap-001",
      capturedAt: new Date("2026-08-07T10:04:00.000Z"),
      version: "1.0.0",
      captureId: "capture-9001",
      amount: 46300,
      currency: "ZAR",
      providerReference: "CAP-REF-9001",
      status: "CAPTURED",
    },
    settlementSnapshot: {
      snapshotId: "settlement-snap-001",
      capturedAt: new Date("2026-08-08T10:04:00.000Z"),
      version: "1.0.0",
      settlementId: "settlement-9001",
      settledAt: new Date("2026-08-08T10:05:00.000Z"),
      amount: 46300,
      currency: "ZAR",
      providerReference: "SET-REF-9001",
      status: "SETTLED",
    },
    refunds: [
      {
        snapshotId: "refund-snap-001",
        capturedAt: new Date("2026-08-09T10:04:00.000Z"),
        version: "1.0.0",
        refundId: "refund-9001",
        requestedAt: new Date("2026-08-09T10:10:00.000Z"),
        refundedAt: new Date("2026-08-09T12:00:00.000Z"),
        amount: 500,
        currency: "ZAR",
        reason: "Customer change",
        status: "REFUNDED",
      },
    ],
    timeline: [
      {
        snapshotId: "timeline-snap-001",
        capturedAt: new Date("2026-08-07T10:00:00.000Z"),
        version: "1.0.0",
        milestone: "Created",
        occurredAt: new Date("2026-08-07T10:00:00.000Z"),
      },
      {
        snapshotId: "timeline-snap-002",
        capturedAt: new Date("2026-08-07T10:04:00.000Z"),
        version: "1.0.0",
        milestone: "Captured",
        occurredAt: new Date("2026-08-07T10:04:00.000Z"),
      },
    ],
    metadata: {
      createdAt: new Date("2026-08-07T10:00:00.000Z"),
      updatedAt: new Date("2026-08-09T12:00:00.000Z"),
      version: "1.0.0",
      source: "APP-006.1",
    },
  };
}

describe("Payment aggregate", () => {
  it("supports valid aggregate creation", () => {
    const payment = Payment.create(createComposition());

    expect(payment.identity.id).toBe("payment-001");
    expect(payment.reservationSnapshot.reservationId).toBe("reservation-9001");
    expect(payment.pricingSnapshot.total).toBe(46300);
    expect(payment.status).toBe(PaymentStatus.PENDING_AUTHORIZATION);
  });

  it("supports aggregate restoration", () => {
    const payment = Payment.restore(createComposition());

    expect(payment.identity.id).toBe("payment-001");
    expect(payment.quoteSnapshot?.quotationNumber).toBe("Q-9001");
  });

  it("fails when identifier is missing", () => {
    const composition = createComposition();

    expect(() =>
      Payment.create({
        ...composition,
        identity: {
          id: " ",
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
        paymentMethod: "",
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
    expect(Object.isFrozen(payment.identity)).toBe(true);
    expect(Object.isFrozen(payment.reservationSnapshot)).toBe(true);
    expect(Object.isFrozen(payment.pricingSnapshot)).toBe(true);
    expect(Object.isFrozen(payment.refunds)).toBe(true);
    expect(Object.isFrozen(payment.timeline)).toBe(true);
    expect(Object.isFrozen(payment.metadata)).toBe(true);
  });

  it("uses defensive copying for input mutation and cloned dates", () => {
    const composition = createComposition();
    const payment = Payment.create(composition);
    const mutableIdentity = composition.identity as { id: string };
    const mutableReservation = composition.reservationSnapshot as { reservationId: string };
    const mutableRefunds = (composition.refunds ?? []) as unknown as Array<{
      snapshotId: string;
      capturedAt: Date;
      version: string;
      refundId: string;
      requestedAt: Date;
      refundedAt?: Date;
      amount: number;
      currency: string;
      reason: string;
      status: string;
    }>;

    mutableIdentity.id = "payment-mutated";
    mutableReservation.reservationId = "reservation-mutated";
    mutableRefunds[0] = {
      snapshotId: "refund-mutated",
      capturedAt: new Date("2027-01-01T00:00:00.000Z"),
      version: "1.0.0",
      refundId: "refund-mutated",
      requestedAt: new Date("2027-01-01T00:00:00.000Z"),
      amount: 1,
      currency: "ZAR",
      reason: "Mutation",
      status: "PENDING",
    };
    composition.metadata.createdAt.setFullYear(2030);

    expect(payment.identity.id).toBe("payment-001");
    expect(payment.reservationSnapshot.reservationId).toBe("reservation-9001");
    expect(payment.refunds[0]?.refundId).toBe("refund-9001");
    expect(payment.metadata.createdAt.getFullYear()).toBe(2026);
  });

  it("exposes readonly aggregate contracts", () => {
    const payment: Payment = Payment.create(createComposition());

    expect(payment.currency).toBe("ZAR");
  });
});
