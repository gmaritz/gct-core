ALTER TABLE "payment_attempt"
  ADD COLUMN "providerNotificationHash" TEXT,
  ADD COLUMN "notificationReceivedAt" TIMESTAMP(3);
