import { PaymentStatus } from "./models";
import { PaymentSnapshot, ReservationMetadata } from "../reservations/models";
export type PaymentAttemptProvider = "PAYFAST";
export type PaymentAttemptEnvironment = "SANDBOX" | "LIVE";
export interface PaymentAttempt {
    readonly attemptId: string;
    readonly idempotencyKey: string;
    readonly paymentId: string;
    readonly reservationId: string;
    readonly paymentReference: string;
    readonly provider: PaymentAttemptProvider;
    readonly environment: PaymentAttemptEnvironment;
    readonly amount: number;
    readonly currency: string;
    readonly status: PaymentStatus;
    readonly providerTransactionId?: string;
    readonly providerNotificationHash?: string;
    readonly notificationReceivedAt?: Date;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly providerInitiatedAt?: Date;
    readonly providerRespondedAt?: Date;
}
export interface CreatePaymentAttemptInput {
    readonly idempotencyKey: string;
    readonly paymentId: string;
    readonly reservationId: string;
    readonly paymentReference: string;
    readonly provider: PaymentAttemptProvider;
    readonly environment: PaymentAttemptEnvironment;
    readonly amount: number;
    readonly currency: string;
    readonly status: PaymentStatus;
}
export type VerifiedPayFastStatus = "COMPLETE" | "CANCELLED";
export type PaymentNotificationApplyResult = "APPLIED" | "DUPLICATE";
export interface ApplyVerifiedPayFastNotificationInput {
    readonly paymentReference: string;
    readonly reservationId: string;
    readonly providerTransactionId: string;
    readonly notificationHash: string;
    readonly providerStatus: VerifiedPayFastStatus;
    readonly paymentStatus: PaymentStatus.COMPLETED | PaymentStatus.CANCELLED;
    readonly expectedPaymentSnapshot: PaymentSnapshot;
    readonly nextPaymentSnapshot: PaymentSnapshot;
    readonly nextReservationMetadata: ReservationMetadata;
}
export declare class PaymentAttemptNotFoundError extends Error {
    constructor();
}
export declare class PaymentAttemptNotificationConflictError extends Error {
    constructor(message?: string);
}
export interface PaymentAttemptRepository {
    createOrFind(input: CreatePaymentAttemptInput): Promise<PaymentAttempt>;
    claimInitiation(paymentReference: string): Promise<boolean>;
    findByPaymentReference(paymentReference: string): Promise<PaymentAttempt | null>;
    updateStatus(paymentReference: string, status: PaymentStatus, providerInitiatedAt?: Date, providerRespondedAt?: Date): Promise<PaymentAttempt>;
    associateProviderTransaction(paymentReference: string, providerTransactionId: string): Promise<PaymentAttempt>;
    applyVerifiedPayFastNotification(input: ApplyVerifiedPayFastNotificationInput): Promise<PaymentNotificationApplyResult>;
}
//# sourceMappingURL=payment-attempt.d.ts.map