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

export class PaymentAttemptNotFoundError extends Error {
  public constructor() {
    super("Payment attempt was not found.");
    this.name = "PaymentAttemptNotFoundError";
  }
}

export class PaymentAttemptNotificationConflictError extends Error {
  public constructor(message = "Payment notification conflicts with the persisted attempt.") {
    super(message);
    this.name = "PaymentAttemptNotificationConflictError";
  }
}

export interface PaymentAttemptRepository {
  createOrFind(input: CreatePaymentAttemptInput): Promise<PaymentAttempt>;
  claimInitiation(paymentReference: string): Promise<boolean>;
  findByPaymentReference(paymentReference: string): Promise<PaymentAttempt | null>;
  updateStatus(
    paymentReference: string,
    status: PaymentStatus,
    providerInitiatedAt?: Date,
    providerRespondedAt?: Date,
  ): Promise<PaymentAttempt>;
  associateProviderTransaction(paymentReference: string, providerTransactionId: string): Promise<PaymentAttempt>;
  applyVerifiedPayFastNotification(
    input: ApplyVerifiedPayFastNotificationInput,
  ): Promise<PaymentNotificationApplyResult>;
}
