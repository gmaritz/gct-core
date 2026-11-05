import { PaymentAttempt, PaymentAttemptRepository, PaymentStatus } from "@application/payments";
import { Reservation, ReservationStatus } from "@application/reservations/aggregate";
import { ReservationRepository } from "@application/reservations/repository";
import { PayFastIntegrationConfig, PayFastEnvironment } from "./index";
import { createPayFastItnSignature, PayFastItnServerValidator } from "./payfast-itn-security";
import { PayFastItnProcessor } from "./payfast-itn-processor";

const config: PayFastIntegrationConfig = {
  environment: PayFastEnvironment.SANDBOX,
  merchantId: "10000100",
  merchantKey: "merchant-key",
  passphrase: "test passphrase",
  paymentProcessUrl: "https://sandbox.payfast.co.za/eng/process",
  apiBaseUrl: "https://api.payfast.co.za",
  paymentQueryUrl: "https://api.payfast.co.za/process/query",
  refundQueryUrl: "https://api.payfast.co.za/refunds/query",
  refundUrl: "https://api.payfast.co.za/refunds",
  returnUrl: "https://merchant.example.test/return",
  cancelUrl: "https://merchant.example.test/cancel",
  notifyUrl: "https://merchant.example.test/notify",
  timeoutMs: 10000,
};

function createFields(status = "COMPLETE", gross = "200.00", itemName = "ITN test item"): ReadonlyArray<{ name: string; value: string }> {
  return [
    { name: "merchant_id", value: "10000100" },
    { name: "m_payment_id", value: "gct-reference-1" },
    { name: "pf_payment_id", value: "123456789" },
    { name: "payment_status", value: status },
    { name: "item_name", value: itemName },
    { name: "amount_gross", value: gross },
  ];
}

function signedBody(status = "COMPLETE", gross = "200.00", itemName = "ITN test item"): Buffer {
  const fields = createFields(status, gross, itemName);
  return signedFields(fields);
}

function signedFields(fields: ReadonlyArray<{ name: string; value: string }>): Buffer {
  const signature = createPayFastItnSignature(fields, config.passphrase);
  return Buffer.from(`${fields.map(({ name, value }) => `${encodeURIComponent(name)}=${encodeURIComponent(value)}`).join("&")}&signature=${signature}`);
}

function createAttempt(overrides: Partial<PaymentAttempt> = {}): PaymentAttempt {
  const now = new Date("2026-11-05T00:00:00Z");
  return {
    attemptId: "attempt-1",
    idempotencyKey: "payment-1",
    paymentId: "payment-reservation-1",
    reservationId: "reservation-1",
    paymentReference: "gct-reference-1",
    provider: "PAYFAST",
    environment: "SANDBOX",
    amount: 200,
    currency: "ZAR",
    status: PaymentStatus.AUTHORIZATION_REQUESTED,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createReservation(overrides: Partial<Reservation> = {}): Reservation {
  const now = new Date("2026-11-05T00:00:00Z");
  return Reservation.create({
    identity: { id: "reservation-1" },
    reservationNumber: "RES-1",
    status: ReservationStatus.CREATED,
    journeySnapshot: { snapshotId: "journey-1", capturedAt: now, version: "1", journeyId: "journey-1", title: "Journey" },
    travellerSnapshots: [{ snapshotId: "traveller-1", capturedAt: now, version: "1", travellerId: "traveller-1", fullName: "Ari" }],
    pricingSnapshot: { snapshotId: "price-1", capturedAt: now, version: "1", currency: "ZAR", totalPrice: 200, taxes: 0, discounts: 0, fees: 0 },
    paymentSnapshot: { snapshotId: "payment-1", capturedAt: now, version: "1", paymentStatus: "CREATED", amountReceived: 0, balanceOutstanding: 200 },
    metadata: { createdAt: now, updatedAt: now, version: "1" },
    ...overrides,
  });
}

interface ProcessorTestHarness {
  readonly paymentAttemptRepository: jest.Mocked<Pick<PaymentAttemptRepository, "findByPaymentReference" | "applyVerifiedPayFastNotification">>;
  readonly reservationRepository: jest.Mocked<Pick<ReservationRepository, "findById">>;
  readonly serverValidator: jest.Mocked<PayFastItnServerValidator>;
  readonly processor: PayFastItnProcessor;
}

function createHarness(options: {
  readonly attempt?: PaymentAttempt | null;
  readonly reservation?: Reservation | null;
  readonly serverValid?: boolean;
} = {}): ProcessorTestHarness {
  const attempt = options.attempt === undefined ? createAttempt() : options.attempt;
  const reservation = options.reservation === undefined ? createReservation() : options.reservation;
  const paymentAttemptRepository: jest.Mocked<Pick<PaymentAttemptRepository, "findByPaymentReference" | "applyVerifiedPayFastNotification">> = {
    findByPaymentReference: jest.fn().mockResolvedValue(attempt),
    applyVerifiedPayFastNotification: jest.fn().mockResolvedValue("APPLIED"),
  };
  const reservationRepository: jest.Mocked<Pick<ReservationRepository, "findById">> = {
    findById: jest.fn().mockResolvedValue(reservation),
  };
  const serverValidator: jest.Mocked<PayFastItnServerValidator> = {
    validate: jest.fn().mockResolvedValue(options.serverValid ?? true),
  };
  return {
    paymentAttemptRepository,
    reservationRepository,
    serverValidator,
    processor: new PayFastItnProcessor(
      config,
      paymentAttemptRepository as never,
      reservationRepository as never,
      serverValidator,
    ),
  };
}

describe("PayFastItnProcessor", () => {
  it("applies a validated COMPLETE notification to the attempt and Reservation snapshot", async () => {
    const harness = createHarness();
    const result = await harness.processor.process(signedBody(), "197.97.145.144");

    expect(result).toEqual({ status: "APPLIED", paymentReference: "gct-reference-1" });
    expect(harness.serverValidator.validate).toHaveBeenCalledWith(expect.any(Buffer), "SANDBOX");
    expect(harness.paymentAttemptRepository.applyVerifiedPayFastNotification).toHaveBeenCalledWith(expect.objectContaining({
      paymentReference: "gct-reference-1",
      reservationId: "reservation-1",
      providerTransactionId: "123456789",
      providerStatus: "COMPLETE",
      paymentStatus: PaymentStatus.COMPLETED,
      expectedPaymentSnapshot: expect.objectContaining({ paymentStatus: "CREATED", amountReceived: 0, balanceOutstanding: 200 }),
      nextPaymentSnapshot: expect.objectContaining({ paymentStatus: "COMPLETED", amountReceived: 200, balanceOutstanding: 0 }),
    }));
  });

  it("records CANCELLED without crediting the Reservation", async () => {
    const harness = createHarness();
    await harness.processor.process(signedBody("CANCELLED"), "197.97.145.144");

    expect(harness.paymentAttemptRepository.applyVerifiedPayFastNotification).toHaveBeenCalledWith(expect.objectContaining({
      paymentStatus: PaymentStatus.CANCELLED,
      nextPaymentSnapshot: expect.objectContaining({ paymentStatus: "CREATED", amountReceived: 0, balanceOutstanding: 200 }),
    }));
  });

  it("rejects an untrusted source before signature, server validation, or persistence", async () => {
    const harness = createHarness();
    await expect(harness.processor.process(signedBody(), "203.0.113.20")).rejects.toMatchObject({ statusCode: 403 });
    expect(harness.serverValidator.validate).not.toHaveBeenCalled();
    expect(harness.paymentAttemptRepository.findByPaymentReference).not.toHaveBeenCalled();
  });

  it("rejects an invalid signature before server validation", async () => {
    const harness = createHarness();
    const invalid = Buffer.from(`${signedBody().toString()}x`);
    await expect(harness.processor.process(invalid, "197.97.145.144")).rejects.toMatchObject({ statusCode: 403 });
    expect(harness.serverValidator.validate).not.toHaveBeenCalled();
    expect(harness.paymentAttemptRepository.applyVerifiedPayFastNotification).not.toHaveBeenCalled();
  });

  it("does not correlate or update state when server-to-server validation is not VALID", async () => {
    const harness = createHarness({ serverValid: false });
    await expect(harness.processor.process(signedBody(), "197.97.145.144")).rejects.toMatchObject({ statusCode: 403 });
    expect(harness.paymentAttemptRepository.findByPaymentReference).not.toHaveBeenCalled();
  });

  it("fails retryably when server-to-server validation is unavailable", async () => {
    const harness = createHarness();
    harness.serverValidator.validate.mockRejectedValue(new Error("timeout"));

    await expect(harness.processor.process(signedBody(), "197.97.145.144"))
      .rejects.toMatchObject({ statusCode: 503 });
    expect(harness.paymentAttemptRepository.findByPaymentReference).not.toHaveBeenCalled();
    expect(harness.paymentAttemptRepository.applyVerifiedPayFastNotification).not.toHaveBeenCalled();
  });

  it("rejects missing required fields before PaymentAttempt lookup", async () => {
    const harness = createHarness();
    const incompleteFields = createFields().filter(({ name }) => name !== "amount_gross");

    await expect(harness.processor.process(signedFields(incompleteFields), "197.97.145.144"))
      .rejects.toMatchObject({ statusCode: 400 });
    expect(harness.paymentAttemptRepository.findByPaymentReference).not.toHaveBeenCalled();
  });

  it("rejects wrong merchant, unknown attempt, wrong environment, unsupported status and amount mismatch", async () => {
    const wrongMerchantFields = createFields();
    const wrongMerchant = Buffer.from(`merchant_id=10000000&${wrongMerchantFields.slice(1).map(({ name, value }) => `${name}=${encodeURIComponent(value)}`).join("&")}&signature=${createPayFastItnSignature([{ name: "merchant_id", value: "10000000" }, ...wrongMerchantFields.slice(1)], config.passphrase)}`);
    const wrongMerchantHarness = createHarness();
    await expect(wrongMerchantHarness.processor.process(wrongMerchant, "197.97.145.144")).rejects.toMatchObject({ statusCode: 403 });
    expect(wrongMerchantHarness.paymentAttemptRepository.findByPaymentReference).not.toHaveBeenCalled();

    const missingAttempt = createHarness({ attempt: null });
    await expect(missingAttempt.processor.process(signedBody(), "197.97.145.144")).rejects.toThrow("Payment attempt was not found");

    const wrongEnvironment = createHarness({ attempt: createAttempt({ environment: "LIVE" }) });
    await expect(wrongEnvironment.processor.process(signedBody(), "197.97.145.144")).rejects.toThrow("environment");

    const unknownStatus = createHarness();
    await expect(unknownStatus.processor.process(signedBody("PENDING"), "197.97.145.144")).rejects.toMatchObject({ statusCode: 400 });

    const wrongAmount = createHarness();
    await expect(wrongAmount.processor.process(signedBody("COMPLETE", "200.01"), "197.97.145.144")).rejects.toThrow("amount does not match");
    expect(wrongAmount.paymentAttemptRepository.applyVerifiedPayFastNotification).not.toHaveBeenCalled();
  });

  it("rejects an attempt whose Payment identity does not belong to the Reservation", async () => {
    const harness = createHarness({ attempt: createAttempt({ paymentId: "payment-another-reservation" }) });
    await expect(harness.processor.process(signedBody(), "197.97.145.144"))
      .rejects.toThrow("canonical Payment identity");
    expect(harness.paymentAttemptRepository.applyVerifiedPayFastNotification).not.toHaveBeenCalled();
  });

  it("recognizes exact duplicate notification and rejects conflicting notification hash", async () => {
    const exactBody = signedBody();
    const attempt = createAttempt({
      status: PaymentStatus.COMPLETED,
      providerTransactionId: "123456789",
      providerNotificationHash: (await import("./payfast-itn-security")).hashPayFastItnBody(exactBody),
    });
    const duplicate = createHarness({ attempt });
    await expect(duplicate.processor.process(exactBody, "197.97.145.144"))
      .resolves.toEqual({ status: "DUPLICATE", paymentReference: "gct-reference-1" });
    expect(duplicate.paymentAttemptRepository.applyVerifiedPayFastNotification).not.toHaveBeenCalled();

    const conflict = createHarness({ attempt });
    await expect(conflict.processor.process(signedBody("COMPLETE", "200.00", "Conflicting item"), "197.97.145.144"))
      .rejects.toThrow("conflicting notification");
    expect(conflict.paymentAttemptRepository.applyVerifiedPayFastNotification).not.toHaveBeenCalled();
    expect(attempt.providerTransactionId).toBe("123456789");
    expect(attempt.providerNotificationHash).toBe((await import("./payfast-itn-security")).hashPayFastItnBody(exactBody));
    expect(conflict.reservationRepository.findById).not.toHaveBeenCalled();
  });

  it("rejects COMPLETE followed by CANCELLED without applying a second transition", async () => {
    const completeBody = signedBody();
    const attempt = createAttempt({
      status: PaymentStatus.COMPLETED,
      providerTransactionId: "123456789",
      providerNotificationHash: (await import("./payfast-itn-security")).hashPayFastItnBody(completeBody),
    });
    const reservation = createReservation({
      paymentSnapshot: {
        ...createReservation().paymentSnapshot!,
        paymentStatus: PaymentStatus.COMPLETED,
        amountReceived: 200,
        balanceOutstanding: 0,
      },
    });
    const harness = createHarness({ attempt, reservation });

    await expect(harness.processor.process(signedBody("CANCELLED"), "197.97.145.144"))
      .rejects.toThrow("not awaiting");
    expect(harness.paymentAttemptRepository.applyVerifiedPayFastNotification).not.toHaveBeenCalled();
    expect(reservation.paymentSnapshot).toMatchObject({ paymentStatus: PaymentStatus.COMPLETED, amountReceived: 200, balanceOutstanding: 0 });
    expect(attempt.providerTransactionId).toBe("123456789");
  });

  it("rejects the same transaction ID when the reported gross amount differs", async () => {
    const storedHash = "b".repeat(64);
    const attempt = createAttempt({ providerTransactionId: "123456789", providerNotificationHash: storedHash });
    const reservation = createReservation();
    const harness = createHarness({ attempt, reservation });
    await expect(harness.processor.process(signedBody("COMPLETE", "200.01"), "197.97.145.144"))
      .rejects.toThrow("amount does not match");
    expect(harness.paymentAttemptRepository.applyVerifiedPayFastNotification).not.toHaveBeenCalled();
    expect(harness.paymentAttemptRepository.findByPaymentReference).toHaveBeenCalledTimes(1);
    expect(attempt).toMatchObject({ status: PaymentStatus.AUTHORIZATION_REQUESTED, providerTransactionId: "123456789", providerNotificationHash: storedHash });
    expect(reservation.paymentSnapshot).toMatchObject({ paymentStatus: "CREATED", amountReceived: 0, balanceOutstanding: 200 });
  });

  it("rejects a different PayFast transaction ID for an already completed GCT payment reference", async () => {
    const bodyForStoredTransaction = signedBody();
    const attempt = createAttempt({
      status: PaymentStatus.COMPLETED,
      providerTransactionId: "123456789",
      providerNotificationHash: (await import("./payfast-itn-security")).hashPayFastItnBody(bodyForStoredTransaction),
    });
    const harness = createHarness({ attempt });
    const fields = [...createFields()];
    fields[2]!.value = "987654321";
    const conflictingBody = signedFields(fields);

    await expect(harness.processor.process(conflictingBody, "197.97.145.144"))
      .rejects.toThrow("conflicting notification");
    expect(harness.paymentAttemptRepository.applyVerifiedPayFastNotification).not.toHaveBeenCalled();
    expect(attempt.providerTransactionId).toBe("123456789");
    expect(attempt.providerNotificationHash).toBe((await import("./payfast-itn-security")).hashPayFastItnBody(bodyForStoredTransaction));
    expect(harness.reservationRepository.findById).not.toHaveBeenCalled();
  });

  it("rejects a delayed conflicting payload after successful completion", async () => {
    const successfulBody = signedBody();
    const attempt = createAttempt({
      status: PaymentStatus.COMPLETED,
      providerTransactionId: "123456789",
      providerNotificationHash: (await import("./payfast-itn-security")).hashPayFastItnBody(successfulBody),
    });
    const harness = createHarness({ attempt });

    await expect(harness.processor.process(signedBody("COMPLETE", "200.00", "different item"), "197.97.145.144"))
      .rejects.toThrow("conflicting notification");
    expect(harness.paymentAttemptRepository.applyVerifiedPayFastNotification).not.toHaveBeenCalled();
    expect(attempt.status).toBe(PaymentStatus.COMPLETED);
    expect(attempt.providerTransactionId).toBe("123456789");
    expect(attempt.providerNotificationHash).toBe((await import("./payfast-itn-security")).hashPayFastItnBody(successfulBody));
    expect(harness.reservationRepository.findById).not.toHaveBeenCalled();
  });
});
