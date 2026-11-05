"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentAttemptPrismaRepository = void 0;
const models_1 = require("@application/payments/models");
const prisma_1 = require("../../../bootstrap/prisma");
function fromRecord(record) {
    return Object.freeze({
        attemptId: record.id,
        idempotencyKey: record.idempotencyKey,
        paymentId: record.paymentId,
        reservationId: record.reservationId,
        paymentReference: record.paymentReference,
        provider: record.provider,
        environment: record.environment,
        amount: Number(record.amount),
        currency: record.currency,
        status: record.status,
        providerTransactionId: record.providerTransactionId ?? undefined,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
        providerInitiatedAt: record.providerInitiatedAt ? new Date(record.providerInitiatedAt) : undefined,
        providerRespondedAt: record.providerRespondedAt ? new Date(record.providerRespondedAt) : undefined,
    });
}
class PaymentAttemptPrismaRepository {
    constructor(prisma = (0, prisma_1.getPrismaClient)()) {
        this.prisma = prisma;
    }
    async createOrFind(input) {
        if (!input.idempotencyKey.trim() || !input.paymentReference.trim() || !input.paymentId.trim() || !input.reservationId.trim()) {
            throw new Error("Payment attempt identities are required.");
        }
        if (!Number.isFinite(input.amount) || input.amount <= 0 || input.currency !== "ZAR") {
            throw new Error("PayFast payment attempts require a positive ZAR amount.");
        }
        let record;
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
        }
        catch (error) {
            if (!isUniqueConstraintError(error))
                throw error;
            record = await this.prisma.paymentAttempt.findUnique({ where: { idempotencyKey: input.idempotencyKey } });
            if (!record)
                throw error;
        }
        const attempt = fromRecord(record);
        if (attempt.paymentId !== input.paymentId
            || attempt.reservationId !== input.reservationId
            || attempt.provider !== input.provider
            || attempt.environment !== input.environment
            || attempt.amount !== input.amount
            || attempt.currency !== input.currency) {
            throw new Error("Payment attempt idempotency key is already associated with another initiation.");
        }
        return attempt;
    }
    async claimInitiation(paymentReference) {
        const result = await this.prisma.paymentAttempt.updateMany({
            where: {
                paymentReference,
                status: { in: [models_1.PaymentStatus.CREATED, models_1.PaymentStatus.AUTHORIZATION_FAILED] },
            },
            data: {
                status: models_1.PaymentStatus.AUTHORIZATION_REQUESTED,
                providerInitiatedAt: new Date(),
            },
        });
        return result.count === 1;
    }
    async findByPaymentReference(paymentReference) {
        const record = await this.prisma.paymentAttempt.findUnique({ where: { paymentReference } });
        return record ? fromRecord(record) : null;
    }
    async updateStatus(paymentReference, status, providerInitiatedAt, providerRespondedAt) {
        const record = await this.prisma.paymentAttempt.update({
            where: { paymentReference },
            data: {
                status,
                ...(providerInitiatedAt ? { providerInitiatedAt } : {}),
                ...(providerRespondedAt ? { providerRespondedAt } : {}),
            },
        });
        return fromRecord(record);
    }
    async associateProviderTransaction(paymentReference, providerTransactionId) {
        const normalizedTransactionId = providerTransactionId.trim();
        if (!normalizedTransactionId)
            throw new Error("Provider transaction identifier is required.");
        let updated;
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
        }
        catch (error) {
            if (isUniqueConstraintError(error)) {
                throw new Error("Provider transaction identifier is already associated with another payment attempt.");
            }
            throw error;
        }
        if (updated.count !== 1) {
            throw new Error("Payment attempt is missing or already correlated to another provider transaction.");
        }
        const record = await this.prisma.paymentAttempt.findUnique({ where: { paymentReference } });
        if (!record)
            throw new Error("Payment attempt was not found after provider correlation.");
        return fromRecord(record);
    }
}
exports.PaymentAttemptPrismaRepository = PaymentAttemptPrismaRepository;
function isUniqueConstraintError(error) {
    return typeof error === "object" && error !== null && "code" in error
        && error.code === "P2002";
}
//# sourceMappingURL=payment-attempt-prisma.repository.js.map