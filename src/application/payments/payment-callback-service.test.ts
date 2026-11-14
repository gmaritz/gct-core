import { PaymentAttempt, PaymentAttemptRepository } from "./payment-attempt";
import { PaymentAttemptCallbackResolver } from "./payment-callback-service";
import { PaymentContextResolver, PaymentInitiationRequest } from "./payment-initiation-service";
import { PaymentStatus } from "./models";

const journeyId = "journey-callback-test";
const paymentReference = "gct-callback-test";
const context: PaymentInitiationRequest = {
  journeyId,
  reservationId: "reservation-1",
  reservationPaymentSnapshot: {
    snapshotId: "payment-snapshot-1",
    capturedAt: new Date("2026-08-01T00:00:00.000Z"),
    version: "1.0.0",
    paymentStatus: "PENDING",
    amountReceived: 0,
    balanceOutstanding: 100,
  },
  engineRequest: {
    paymentRequest: { reference: { paymentId: "payment-1", reservationId: "reservation-1" } },
  },
  providerReference: { providerIdentifier: "payfast", reference: "payment-1" },
};

function createAttempt(overrides: Partial<PaymentAttempt> = {}): PaymentAttempt {
  const now = new Date("2026-08-01T00:00:00.000Z");
  return {
    attemptId: "attempt-1",
    idempotencyKey: "idempotency-1",
    paymentId: "payment-1",
    reservationId: "reservation-1",
    paymentReference,
    provider: "PAYFAST",
    environment: "SANDBOX",
    amount: 100,
    currency: "ZAR",
    status: PaymentStatus.CREATED,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("PaymentAttemptCallbackResolver", () => {
  const resolveJourney = jest.fn();
  const findByPaymentReference = jest.fn();
  let resolver: PaymentAttemptCallbackResolver;

  beforeEach(() => {
    jest.clearAllMocks();
    resolveJourney.mockResolvedValue(context);
    findByPaymentReference.mockResolvedValue(createAttempt());
    resolver = new PaymentAttemptCallbackResolver(
      { resolveForJourney: resolveJourney } as PaymentContextResolver,
      { findByPaymentReference } as Pick<PaymentAttemptRepository, "findByPaymentReference">,
      "SANDBOX",
    );
  });

  it.each(Object.values(PaymentStatus))("resolves the selected attempt in %s status", async (status) => {
    findByPaymentReference.mockResolvedValue(createAttempt({ status }));

    await expect(resolver.resolve(journeyId, paymentReference)).resolves.toEqual({
      context,
      attempt: createAttempt({ status }),
    });
  });

  it("rejects missing and malformed references without querying attempts", async () => {
    await expect(resolver.resolve(journeyId, "")).resolves.toBeNull();
    await expect(resolver.resolve("../journey", paymentReference)).resolves.toBeNull();
    expect(findByPaymentReference).not.toHaveBeenCalled();
  });

  it("rejects unmatched references", async () => {
    findByPaymentReference.mockResolvedValue(null);
    await expect(resolver.resolve(journeyId, paymentReference)).resolves.toBeNull();
  });

  it.each([
    ["reservation", { reservationId: "reservation-other" }],
    ["payment", { paymentId: "payment-other" }],
    ["provider", { provider: "OTHER" }],
    ["environment", { environment: "LIVE" }],
  ])("rejects a %s mismatch", async (_label, mismatch) => {
    findByPaymentReference.mockResolvedValue(createAttempt(mismatch as Partial<PaymentAttempt>));
    await expect(resolver.resolve(journeyId, paymentReference)).resolves.toBeNull();
  });

  it("rejects a journey resolver response for a different journey", async () => {
    resolveJourney.mockResolvedValue({ ...context, journeyId: "journey-other" });
    await expect(resolver.resolve(journeyId, paymentReference)).resolves.toBeNull();
    expect(findByPaymentReference).not.toHaveBeenCalled();
  });

  it("can be repeated without mutating payment state", async () => {
    await expect(resolver.resolve(journeyId, paymentReference)).resolves.toBeTruthy();
    await expect(resolver.resolve(journeyId, paymentReference)).resolves.toBeTruthy();
    expect(findByPaymentReference).toHaveBeenCalledTimes(2);
    expect(findByPaymentReference.mock.calls).toEqual([[paymentReference], [paymentReference]]);
  });
});
