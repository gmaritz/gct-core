import { Reservation, ReservationStatus } from "../reservations/aggregate";
import { PaymentAttempt } from "./payment-attempt";
import { PaymentStatus } from "./models";
import { transitionReservationFromVerifiedPayFastNotification } from "./verified-payfast-notification-transition";

function createReservation(overrides: Partial<Reservation> = {}): Reservation {
  const now = new Date("2026-11-05T00:00:00.000Z");
  return Reservation.create({
    identity: { id: "reservation-1" },
    reservationNumber: "RES-1",
    status: ReservationStatus.CREATED,
    journeySnapshot: { snapshotId: "journey-1", capturedAt: now, version: "1", journeyId: "journey-1", title: "Journey" },
    travellerSnapshots: [{ snapshotId: "traveller-1", capturedAt: now, version: "1", travellerId: "traveller-1", fullName: "Ari" }],
    pricingSnapshot: { snapshotId: "pricing-1", capturedAt: now, version: "1", currency: "ZAR", totalPrice: 200, taxes: 0, discounts: 0, fees: 0 },
    paymentSnapshot: { snapshotId: "payment-1", capturedAt: now, version: "1", paymentStatus: "CREATED", amountReceived: 0, balanceOutstanding: 200 },
    metadata: { createdAt: now, updatedAt: now, version: "1" },
    ...overrides,
  });
}

const attempt: PaymentAttempt = {
  attemptId: "attempt-1",
  idempotencyKey: "request-1",
  paymentId: "payment-reservation-1",
  reservationId: "reservation-1",
  paymentReference: "gct-reference-1",
  provider: "PAYFAST",
  environment: "SANDBOX",
  amount: 200,
  currency: "ZAR",
  status: PaymentStatus.AUTHORIZATION_REQUESTED,
  createdAt: new Date("2026-11-05T00:00:00.000Z"),
  updatedAt: new Date("2026-11-05T00:00:00.000Z"),
};

describe("verified PayFast notification Reservation transition", () => {
  it("maps COMPLETE to completed payment, full received amount, and zero balance", () => {
    const result = transitionReservationFromVerifiedPayFastNotification(
      createReservation(), attempt, "COMPLETE", "200.00", new Date("2026-11-05T01:00:00.000Z"),
    );

    expect(result.paymentSnapshot).toMatchObject({
      paymentStatus: PaymentStatus.COMPLETED,
      amountReceived: 200,
      balanceOutstanding: 0,
    });
    expect(result.status).toBe(ReservationStatus.CREATED);
  });

  it("maps CANCELLED without crediting or clearing the outstanding balance", () => {
    const original = createReservation();
    const result = transitionReservationFromVerifiedPayFastNotification(original, attempt, "CANCELLED", "200.00");

    expect(result.paymentSnapshot).toMatchObject({
      paymentStatus: PaymentStatus.CREATED,
      amountReceived: 0,
      balanceOutstanding: 200,
    });
    expect(result.paymentSnapshot?.amountReceived).toBe(original.paymentSnapshot?.amountReceived);
    expect(result.paymentSnapshot?.balanceOutstanding).toBe(original.paymentSnapshot?.balanceOutstanding);
  });

  it("rejects stale attempt state, wrong Payment identity, and mismatched amount", () => {
    expect(() => transitionReservationFromVerifiedPayFastNotification(
      createReservation(), { ...attempt, status: PaymentStatus.COMPLETED }, "COMPLETE", "200.00",
    )).toThrow("not awaiting");
    expect(() => transitionReservationFromVerifiedPayFastNotification(
      createReservation(), { ...attempt, paymentId: "payment-other" }, "COMPLETE", "200.00",
    )).toThrow("canonical Payment identity");
    expect(() => transitionReservationFromVerifiedPayFastNotification(
      createReservation(), { ...attempt, amount: 199.99 }, "COMPLETE", "200.00",
    )).toThrow("gross amount");
  });

  it("rejects a cancelled Reservation", () => {
    expect(() => transitionReservationFromVerifiedPayFastNotification(
      createReservation({ status: ReservationStatus.CANCELLED }), attempt, "COMPLETE", "200.00",
    )).toThrow("Cancelled Reservation");
  });

  it("supports a partial successful attempt while preserving the cumulative total", () => {
    const reservation = createReservation({
      paymentSnapshot: {
        ...createReservation().paymentSnapshot!,
        paymentStatus: "CAPTURED",
        amountReceived: 100,
        balanceOutstanding: 100,
      },
    });
    const result = transitionReservationFromVerifiedPayFastNotification(
      reservation,
      { ...attempt, amount: 50 },
      "COMPLETE",
      "50.00",
    );

    expect(result.paymentSnapshot).toMatchObject({
      paymentStatus: "PARTIAL",
      amountReceived: 150,
      balanceOutstanding: 50,
    });
    expect(result.paymentSnapshot!.amountReceived + result.paymentSnapshot!.balanceOutstanding).toBe(200);
  });

  it("rejects an inconsistent existing snapshot and an amount exceeding balance", () => {
    const inconsistent = createReservation({
      paymentSnapshot: { ...createReservation().paymentSnapshot!, amountReceived: 50, balanceOutstanding: 200 },
    });
    expect(() => transitionReservationFromVerifiedPayFastNotification(inconsistent, attempt, "COMPLETE", "50.00"))
      .toThrow("cumulative payment invariant");

    const outstanding100 = createReservation({
      paymentSnapshot: { ...createReservation().paymentSnapshot!, amountReceived: 100, balanceOutstanding: 100 },
    });
    expect(() => transitionReservationFromVerifiedPayFastNotification(outstanding100, attempt, "COMPLETE", "200.00"))
      .toThrow("exceeds the outstanding");
  });
});
