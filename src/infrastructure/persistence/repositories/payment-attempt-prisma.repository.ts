import { PrismaClient } from "@prisma/client";
import {
  CreatePaymentAttemptInput,
  PaymentAttempt,
  PaymentAttemptRepository,
} from "@application/payments";
import { PaymentStatus } from "@application/payments/models";
import { getPrismaClient } from "../../../bootstrap/prisma";

type PaymentAttemptRecord = {
  id: string;
  idempotencyKey: string;
  paymentId: string;
  reservationId: string;
  paymentReference: string;
  provider: string;
  environment: string;
  amount: { toString(): string } | number;
  currency: string;
  status: string;
  providerTransactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  providerInitiatedAt: Date | null;
  providerRespondedAt: Date | null;
};

function fromRecord(record: PaymentAttemptRecord): PaymentAttempt {
  return Object.freeze({
    attemptId: record.id,
    idempotencyKey: record.idempotencyKey,
    paymentId: record.paymentId,
    reservationId: record.reservationId,
    paymentReference: record.paymentReference,
    provider: record.provider as PaymentAttempt["provider"],
    environment: record.environment as PaymentAttempt["environment"],
    amount: Number(record.amount),
    currency: record.currency,
    status: record.status as PaymentStatus,
    providerTransactionId: record.providerTransactionId ?? undefined,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    providerInitiatedAt: record.providerInitiatedAt ? new Date(record.providerInitiatedAt) : undefined,
    providerRespondedAt: record.providerRespondedAt ? new Date(record.providerRespondedAt) : undefined,
  });
}

export class PaymentAttemptPrismaRepository implements PaymentAttemptRepository {
  public constructor(private readonly prisma: PrismaClient = getPrismaClient()) {}

  public async createOrFind(input: CreatePaymentAttemptInput): Promise<PaymentAttempt> {
    if (!input.idempotencyKey.trim() || !input.paymentReference.trim() || !input.paymentId.trim() || !input.reservationId.trim()) {
      throw new Error("Payment attempt identities are required.");
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0 || input.currency !== "ZAR") {
      throw new Error("PayFast payment attempts require a positive ZAR amount.");
    }
    let record: unknown;
    try {
      record = await this.prisma.paymentAttempt.upsert({
        where: { idempotencyKey: input.idempotencyKey },
        create: {
          idempotencyKey: input.idempotencyKey,
          paymentId: input.paymentId,
          reservationId: input.reservationId,
          paymentReference: input.paymentReference,
          provider: input.provider,
          environment: input.environment,
          amount: input.amount,
          currency: input.currency,
          status: input.status,
        },
        update: {},
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
      record = await this.prisma.paymentAttempt.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
      if (!record) throw error;
    }
    const attempt = fromRecord(record as unknown as PaymentAttemptRecord);
    if (
      attempt.paymentId !== input.paymentId
      || attempt.reservationId !== input.reservationId
      || attempt.provider !== input.provider
      || attempt.environment !== input.environment
      || attempt.amount !== input.amount
      || attempt.currency !== input.currency
    ) {
      throw new Error("Payment attempt idempotency key is already associated with another initiation.");
    }
    return attempt;
  }

  public async claimInitiation(paymentReference: string): Promise<boolean> {
    const result = await this.prisma.paymentAttempt.updateMany({
      where: {
        paymentReference,
        status: { in: [PaymentStatus.CREATED, PaymentStatus.AUTHORIZATION_FAILED] },
      },
      data: {
        status: PaymentStatus.AUTHORIZATION_REQUESTED,
        providerInitiatedAt: new Date(),
      },
    });
    return result.count === 1;
  }

  public async findByPaymentReference(paymentReference: string): Promise<PaymentAttempt | null> {
    const record = await this.prisma.paymentAttempt.findUnique({ where: { paymentReference } });
    return record ? fromRecord(record as unknown as PaymentAttemptRecord) : null;
  }

  public async updateStatus(
    paymentReference: string,
    status: PaymentStatus,
    providerInitiatedAt?: Date,
    providerRespondedAt?: Date,
  ): Promise<PaymentAttempt> {
    const record = await this.prisma.paymentAttempt.update({
      where: { paymentReference },
      data: {
        status,
        ...(providerInitiatedAt ? { providerInitiatedAt } : {}),
        ...(providerRespondedAt ? { providerRespondedAt } : {}),
      },
    });
    return fromRecord(record as unknown as PaymentAttemptRecord);
  }

  public async associateProviderTransaction(
    paymentReference: string,
    providerTransactionId: string,
  ): Promise<PaymentAttempt> {
    const normalizedTransactionId = providerTransactionId.trim();
    if (!normalizedTransactionId) throw new Error("Provider transaction identifier is required.");
    let updated: { readonly count: number };
    try {
      updated = await this.prisma.paymentAttempt.updateMany({
        where: {
          paymentReference,
          OR: [
            { providerTransactionId: null },
            { providerTransactionId: normalizedTransactionId },
          ],
        },
        data: { providerTransactionId: normalizedTransactionId, providerRespondedAt: new Date() },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new Error("Provider transaction identifier is already associated with another payment attempt.");
      }
      throw error;
    }
    if (updated.count !== 1) {
      throw new Error("Payment attempt is missing or already correlated to another provider transaction.");
    }
    const record = await this.prisma.paymentAttempt.findUnique({ where: { paymentReference } });
    if (!record) throw new Error("Payment attempt was not found after provider correlation.");
    return fromRecord(record as unknown as PaymentAttemptRecord);
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error
    && (error as { readonly code?: unknown }).code === "P2002";
}
