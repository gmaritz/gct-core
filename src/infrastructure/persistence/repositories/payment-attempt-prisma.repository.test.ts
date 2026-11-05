import { PrismaClient } from "@prisma/client";
import { CreatePaymentAttemptInput, PaymentStatus } from "@application/payments";
import { PaymentGatewayResult, PaymentProviderContext, PaymentProviderOperation } from "@application/payments/integration";
import { PaymentAttemptPrismaRepository } from "./payment-attempt-prisma.repository";

function createRecord(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "attempt-1",
    idempotencyKey: "request-1",
    paymentId: "payment-1",
    reservationId: "reservation-1",
    paymentReference: "gct-pay-1",
    provider: "PAYFAST",
    environment: "SANDBOX",
    amount: { toString: (): string => "64990.09" },
    currency: "ZAR",
    status: "CREATED",
    providerTransactionId: null,
    createdAt: new Date("2026-11-05T10:00:00Z"),
    updatedAt: new Date("2026-11-05T10:00:00Z"),
    providerInitiatedAt: null,
    providerRespondedAt: null,
    ...overrides,
  };
}

describe("PaymentAttemptPrismaRepository", () => {
  it("creates idempotently and reconstructs authoritative attempt values", async () => {
    const record = createRecord();
    const upsert = jest.fn().mockResolvedValue(record);
    const repository = new PaymentAttemptPrismaRepository({
      paymentAttempt: { upsert },
    } as unknown as PrismaClient);

    const result = await repository.createOrFind({
      idempotencyKey: "request-1",
      paymentId: "payment-1",
      reservationId: "reservation-1",
      paymentReference: "gct-pay-1",
      provider: "PAYFAST",
      environment: "SANDBOX",
      amount: 64990.09,
      currency: "ZAR",
      status: PaymentStatus.CREATED,
    });

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { idempotencyKey: "request-1" },
      update: {},
      create: expect.objectContaining({ reservationId: "reservation-1", paymentReference: "gct-pay-1" }),
    }));
    expect(result).toMatchObject({
      attemptId: "attempt-1",
      paymentId: "payment-1",
      reservationId: "reservation-1",
      paymentReference: "gct-pay-1",
      provider: "PAYFAST",
      environment: "SANDBOX",
      amount: 64990.09,
      currency: "ZAR",
      status: "CREATED",
    });
  });

  it("looks up by GCT reference and records provider transaction correlation", async () => {
    const record = createRecord({ providerTransactionId: "pf-transaction-1" });
    const findUnique = jest.fn().mockResolvedValue(record);
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const repository = new PaymentAttemptPrismaRepository({
      paymentAttempt: { findUnique, updateMany },
    } as unknown as PrismaClient);

    const result = await repository.associateProviderTransaction("gct-pay-1", " pf-transaction-1 ");
    const lookup = await repository.findByPaymentReference("gct-pay-1");

    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { paymentReference: "gct-pay-1", OR: [{ providerTransactionId: null }, { providerTransactionId: "pf-transaction-1" }] },
    }));
    expect(result.providerTransactionId).toBe("pf-transaction-1");
    expect(lookup?.paymentReference).toBe("gct-pay-1");
  });

  it("rejects correlation attempts that would overwrite another provider transaction", async () => {
    const repository = new PaymentAttemptPrismaRepository({
      paymentAttempt: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    } as unknown as PrismaClient);

    await expect(repository.associateProviderTransaction("gct-pay-1", "pf-transaction-2"))
      .rejects.toThrow("already correlated to another provider transaction");
  });

  it("rejects an idempotency key already bound to different payment context", async () => {
    const repository = new PaymentAttemptPrismaRepository({
      paymentAttempt: { upsert: jest.fn().mockResolvedValue(createRecord({ reservationId: "another-reservation" })) },
    } as unknown as PrismaClient);

    await expect(repository.createOrFind({
      idempotencyKey: "request-1",
      paymentId: "payment-1",
      reservationId: "reservation-1",
      paymentReference: "new-reference",
      provider: "PAYFAST",
      environment: "SANDBOX",
      amount: 64990.09,
      currency: "ZAR",
      status: PaymentStatus.CREATED,
    })).rejects.toThrow("already associated with another initiation");
  });

  it("rejects reuse of an idempotency key with a different amount", async () => {
    const repository = new PaymentAttemptPrismaRepository({
      paymentAttempt: { upsert: jest.fn().mockResolvedValue(createRecord()) },
    } as unknown as PrismaClient);

    await expect(repository.createOrFind({
      idempotencyKey: "request-1",
      paymentId: "payment-1",
      reservationId: "reservation-1",
      paymentReference: "new-reference",
      provider: "PAYFAST",
      environment: "SANDBOX",
      amount: 70000,
      currency: "ZAR",
      status: PaymentStatus.CREATED,
    })).rejects.toThrow("already associated with another initiation");
  });

  it("rejects reuse of an idempotency key with a different currency", async () => {
    const repository = new PaymentAttemptPrismaRepository({
      paymentAttempt: { upsert: jest.fn().mockResolvedValue(createRecord({ currency: "USD" })) },
    } as unknown as PrismaClient);

    await expect(repository.createOrFind({
      idempotencyKey: "request-1",
      paymentId: "payment-1",
      reservationId: "reservation-1",
      paymentReference: "new-reference",
      provider: "PAYFAST",
      environment: "SANDBOX",
      amount: 64990.09,
      currency: "ZAR",
      status: PaymentStatus.CREATED,
    })).rejects.toThrow("already associated with another initiation");
  });

  it("claims only attempts in CREATED or AUTHORIZATION_FAILED state", async () => {
    const updateMany = jest.fn().mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    const repository = new PaymentAttemptPrismaRepository({
      paymentAttempt: { updateMany },
    } as unknown as PrismaClient);

    await expect(repository.claimInitiation("gct-pay-1")).resolves.toBe(true);
    await expect(repository.claimInitiation("gct-pay-1")).resolves.toBe(false);
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        paymentReference: "gct-pay-1",
        status: { in: [PaymentStatus.CREATED, PaymentStatus.AUTHORIZATION_FAILED] },
      },
      data: { status: PaymentStatus.AUTHORIZATION_REQUESTED, providerInitiatedAt: expect.any(Date) },
    }));
  });

  it("translates provider transaction uniqueness conflicts", async () => {
    const uniqueConflict = Object.assign(new Error("unique"), { code: "P2002" });
    const repository = new PaymentAttemptPrismaRepository({
      paymentAttempt: { updateMany: jest.fn().mockRejectedValue(uniqueConflict) },
    } as unknown as PrismaClient);

    await expect(repository.associateProviderTransaction("gct-pay-1", "pf-shared"))
      .rejects.toThrow("already associated with another payment attempt");
  });
});

const databaseConcurrencyDescribe = process.env.PAYMENT_ATTEMPT_DATABASE_INTEGRATION === "true" ? describe : describe.skip;

databaseConcurrencyDescribe("PaymentAttemptPrismaRepository PostgreSQL concurrency", () => {
  it("creates one attempt, grants one initiation claim, and rejects duplicate transaction correlation", async () => {
    const { randomUUID } = await import("crypto");
    const { getPrismaClient } = await import("../../../bootstrap/prisma");
    const prisma = getPrismaClient();
    const repository = new PaymentAttemptPrismaRepository(prisma);
    const suffix = randomUUID();
    const reservationId = `pay-attempt-test-${suffix}`;
    const idempotencyKey = `pay-attempt-key-${suffix}`;
    const serviceKey = `pay-attempt-service-${suffix}`;
    const secondKey = `pay-attempt-key-second-${suffix}`;
    const firstReference = `gct-attempt-${suffix}-1`;
    const secondReference = `gct-attempt-${suffix}-2`;
    const transactionId = `pf-transaction-${suffix}`;

    await prisma.reservation.create({ data: { id: reservationId } });
    try {
      const createInput = (key: string, reference: string): CreatePaymentAttemptInput => ({
        idempotencyKey: key,
        paymentId: `payment-${reservationId}`,
        reservationId,
        paymentReference: reference,
        provider: "PAYFAST" as const,
        environment: "SANDBOX" as const,
        amount: 64990.09,
        currency: "ZAR",
        status: PaymentStatus.CREATED,
      });
      const attempts = await Promise.all(Array.from({ length: 8 }, (_, index) =>
        repository.createOrFind(createInput(idempotencyKey, `${firstReference}-${index}`)),
      ));
      expect(new Set(attempts.map((attempt) => attempt.attemptId)).size).toBe(1);
      expect(new Set(attempts.map((attempt) => attempt.paymentReference)).size).toBe(1);

      const claims = await Promise.all(Array.from({ length: 8 }, () => repository.claimInitiation(attempts[0]!.paymentReference)));
      expect(claims.filter(Boolean)).toHaveLength(1);

      const { DefaultPaymentInitiationService } = await import("@application/payments");
      const paymentId = `payment-${reservationId}`;
      const gatewayExecute = jest.fn(async (context: PaymentProviderContext): Promise<PaymentGatewayResult> => ({
        success: true,
        providerReference: context.gatewayRequest.providerReference,
        transactionReference: null,
        authorizationStatus: null,
        captureStatus: null,
        settlementStatus: null,
        paymentStatus: PaymentStatus.CREATED,
        hostedPaymentAction: {
          method: "POST" as const,
          action: "https://sandbox.payfast.co.za/eng/process",
          fields: { m_payment_id: context.gatewayRequest.providerReference.reference },
        },
        warnings: [],
        metadata: {
          completedAt: new Date(),
          version: "1.0.0",
          requestId: serviceKey,
          source: "test",
          operation: PaymentProviderOperation.AUTHORIZE,
        },
      }));
      const service = new DefaultPaymentInitiationService(
        {
          execute: async () => ({
            success: true,
            payment: {
              reference: { paymentId, reservationId },
              reservationSnapshot: { reservationReference: "RES-CONCURRENT" },
              paymentAmount: 64990.09,
              currency: "ZAR",
              paymentMethod: "CARD",
              status: PaymentStatus.CREATED,
            },
            validationResult: { errors: [], warnings: [] },
            metadata: { requestId: serviceKey, source: "test", pending: false },
          }),
        } as never,
        { execute: gatewayExecute } as never,
        repository,
        "SANDBOX",
      );
      const initiationRequest = {
        reservationId,
        engineRequest: {
          requestId: serviceKey,
          paymentRequest: { reservationSnapshot: { reservationId }, status: PaymentStatus.CREATED },
        },
        providerReference: { providerIdentifier: "payfast", reference: paymentId },
      };
      const initiationResults = await Promise.all(Array.from({ length: 8 }, () =>
        service.initiatePayment(initiationRequest as never),
      ));
      expect(gatewayExecute).toHaveBeenCalledTimes(1);
      expect(initiationResults.filter((result) => result.hostedPaymentAction)).toHaveLength(1);
      expect(initiationResults.filter((result) => result.status === "PENDING")).toHaveLength(8);

      const secondAttempt = await repository.createOrFind(createInput(secondKey, secondReference));
      const associations = await Promise.allSettled([
        repository.associateProviderTransaction(attempts[0]!.paymentReference, transactionId),
        repository.associateProviderTransaction(secondAttempt.paymentReference, transactionId),
      ]);
      expect(associations.filter((result) => result.status === "fulfilled")).toHaveLength(1);
      expect(associations.filter((result) => result.status === "rejected")).toHaveLength(1);

      const correlated = await prisma.paymentAttempt.findUnique({ where: { providerTransactionId: transactionId } });
      expect(correlated?.reservationId).toBe(reservationId);
      expect([attempts[0]!.paymentReference, secondAttempt.paymentReference]).toContain(correlated?.paymentReference);
    } finally {
      await prisma.paymentAttempt.deleteMany({ where: { idempotencyKey: { in: [idempotencyKey, serviceKey, secondKey] } } });
      await prisma.reservation.delete({ where: { id: reservationId } });
    }
  });
});
