import { PaymentStatus } from "./models";

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
}
