-- PERSISTENCE-B3L: canonical Reservation physical persistence on Booking root
ALTER TABLE "booking"
  ADD COLUMN "reservationLifecycleCode" TEXT,
  ADD COLUMN "journeySnapshot" JSONB,
  ADD COLUMN "travellerSnapshots" JSONB,
  ADD COLUMN "accommodationSnapshots" JSONB,
  ADD COLUMN "pricingSnapshot" JSONB,
  ADD COLUMN "paymentSnapshot" JSONB,
  ADD COLUMN "supplierReferences" JSONB,
  ADD COLUMN "reservationTimeline" JSONB,
  ADD COLUMN "reservationMetadata" JSONB;

CREATE INDEX "booking_reservationLifecycleCode_idx" ON "booking"("reservationLifecycleCode");
