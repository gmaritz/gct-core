-- PERSIST-001: add the canonical Reservation persistence contract without removing legacy data.
ALTER TABLE "reservation"
  ADD COLUMN "reservationNumber" TEXT,
  ADD COLUMN "customerId" TEXT,
  ADD COLUMN "bookingStartDate" DATE,
  ADD COLUMN "bookingEndDate" DATE,
  ADD COLUMN "reservationLifecycleCode" TEXT,
  ADD COLUMN "journeySnapshot" JSONB,
  ADD COLUMN "travellerSnapshots" JSONB,
  ADD COLUMN "accommodationSnapshots" JSONB,
  ADD COLUMN "pricingSnapshot" JSONB,
  ADD COLUMN "paymentSnapshot" JSONB,
  ADD COLUMN "supplierReferences" JSONB,
  ADD COLUMN "reservationTimeline" JSONB,
  ADD COLUMN "reservationMetadata" JSONB;

CREATE UNIQUE INDEX "reservation_reservationNumber_key"
  ON "reservation"("reservationNumber");

CREATE INDEX "reservation_customerId_idx"
  ON "reservation"("customerId");

CREATE INDEX "reservation_reservationLifecycleCode_idx"
  ON "reservation"("reservationLifecycleCode");

ALTER TABLE "reservation"
  ADD CONSTRAINT "reservation_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "customer"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
