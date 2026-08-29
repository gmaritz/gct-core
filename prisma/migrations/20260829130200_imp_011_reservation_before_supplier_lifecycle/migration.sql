-- IMP-011: supplier lifecycle timestamps are unavailable before fulfilment begins.
ALTER TABLE "reservation"
  ALTER COLUMN "reservedAt" DROP NOT NULL,
  ALTER COLUMN "confirmedAt" DROP NOT NULL,
  ALTER COLUMN "cancelledAt" DROP NOT NULL;