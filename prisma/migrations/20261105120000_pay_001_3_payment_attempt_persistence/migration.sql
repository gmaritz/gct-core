CREATE TABLE "payment_attempt" (
  "id" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "reservationId" TEXT NOT NULL,
  "paymentReference" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "environment" TEXT NOT NULL,
  "amount" DECIMAL(19,4) NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "status" TEXT NOT NULL,
  "providerTransactionId" TEXT,
  "providerInitiatedAt" TIMESTAMP(3),
  "providerRespondedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "payment_attempt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "payment_attempt_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "payment_attempt_idempotencyKey_key" ON "payment_attempt"("idempotencyKey");
CREATE UNIQUE INDEX "payment_attempt_paymentReference_key" ON "payment_attempt"("paymentReference");
CREATE UNIQUE INDEX "payment_attempt_providerTransactionId_key" ON "payment_attempt"("providerTransactionId");
CREATE INDEX "payment_attempt_reservationId_idx" ON "payment_attempt"("reservationId");
CREATE INDEX "payment_attempt_paymentId_idx" ON "payment_attempt"("paymentId");
CREATE INDEX "payment_attempt_provider_environment_status_idx" ON "payment_attempt"("provider", "environment", "status");
