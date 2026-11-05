import { PrismaClient } from "@prisma/client";
import { ApplyVerifiedPayFastNotificationInput, CreatePaymentAttemptInput, PaymentAttempt, PaymentAttemptRepository } from "@application/payments";
import { PaymentStatus } from "@application/payments/models";
export declare class PaymentAttemptPrismaRepository implements PaymentAttemptRepository {
    private readonly prisma;
    constructor(prisma?: PrismaClient);
    createOrFind(input: CreatePaymentAttemptInput): Promise<PaymentAttempt>;
    claimInitiation(paymentReference: string): Promise<boolean>;
    findByPaymentReference(paymentReference: string): Promise<PaymentAttempt | null>;
    updateStatus(paymentReference: string, status: PaymentStatus, providerInitiatedAt?: Date, providerRespondedAt?: Date): Promise<PaymentAttempt>;
    associateProviderTransaction(paymentReference: string, providerTransactionId: string): Promise<PaymentAttempt>;
    applyVerifiedPayFastNotification(input: ApplyVerifiedPayFastNotificationInput): Promise<"APPLIED" | "DUPLICATE">;
}
//# sourceMappingURL=payment-attempt-prisma.repository.d.ts.map