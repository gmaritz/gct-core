-- SPEC-030: add Reservation-owned fulfilment relationships without removing legacy supplier data.
ALTER TABLE "booking_item"
  ADD COLUMN "reservationId" TEXT;

CREATE INDEX "booking_item_reservationId_idx"
  ON "booking_item"("reservationId");

ALTER TABLE "booking_item"
  ADD CONSTRAINT "booking_item_reservationId_fkey"
  FOREIGN KEY ("reservationId") REFERENCES "reservation"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "supplier_booking" (
  "id" TEXT NOT NULL,
  "bookingItemId" TEXT NOT NULL,
  "supplierId" TEXT NOT NULL,
  "supplierProductId" TEXT,
  "supplierReference" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "requestedAt" TIMESTAMP(3),
  "confirmedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "supplier_booking_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "supplier_booking_bookingItemId_idx" ON "supplier_booking"("bookingItemId");
CREATE INDEX "supplier_booking_supplierId_idx" ON "supplier_booking"("supplierId");
CREATE INDEX "supplier_booking_supplierProductId_idx" ON "supplier_booking"("supplierProductId");

ALTER TABLE "supplier_booking"
  ADD CONSTRAINT "supplier_booking_bookingItemId_fkey"
  FOREIGN KEY ("bookingItemId") REFERENCES "booking_item"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "supplier_booking"
  ADD CONSTRAINT "supplier_booking_supplierId_fkey"
  FOREIGN KEY ("supplierId") REFERENCES "supplier"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "supplier_booking"
  ADD CONSTRAINT "supplier_booking_supplierProductId_fkey"
  FOREIGN KEY ("supplierProductId") REFERENCES "supplier_product"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Preserve legacy supplier fulfilment where the existing references are complete.
UPDATE "booking_item" AS bi
SET "reservationId" = r."id"
FROM "reservation" AS r
WHERE r."bookingItemId" = bi."id"
  AND r."bookingItemId" IS NOT NULL
  AND bi."reservationId" IS NULL;

INSERT INTO "supplier_booking" (
  "id",
  "bookingItemId",
  "supplierId",
  "supplierReference",
  "status",
  "requestedAt",
  "confirmedAt",
  "cancelledAt",
  "createdAt",
  "updatedAt"
)
SELECT
  CONCAT(r."id", '-legacy-supplier'),
  r."bookingItemId",
  r."supplierId",
  COALESCE(r."reservationReference", CONCAT(r."id", '-legacy')),
  COALESCE(r."reservationStatusId", 'UNKNOWN'),
  r."reservedAt",
  r."confirmedAt",
  r."cancelledAt",
  COALESCE(r."createdAt", CURRENT_TIMESTAMP),
  COALESCE(r."updatedAt", CURRENT_TIMESTAMP)
FROM "reservation" AS r
WHERE r."bookingItemId" IS NOT NULL
  AND r."supplierId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "supplier_booking" AS sb
    WHERE sb."id" = CONCAT(r."id", '-legacy-supplier')
  );