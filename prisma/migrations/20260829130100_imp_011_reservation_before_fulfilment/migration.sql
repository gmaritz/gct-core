-- IMP-011: legacy fulfilment associations are optional until booking fulfilment exists.
ALTER TABLE "reservation"
  ALTER COLUMN "bookingItemId" DROP NOT NULL,
  ALTER COLUMN "supplierId" DROP NOT NULL,
  ALTER COLUMN "reservationReference" DROP NOT NULL,
  ALTER COLUMN "reservationStatusId" DROP NOT NULL;