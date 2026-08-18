CREATE TABLE "hotel_catalogue_entry" (
    "id" TEXT NOT NULL,
    "hotelCode" TEXT NOT NULL,
    "starGrading" INTEGER NOT NULL,
    "destinationCode" TEXT NOT NULL,
    "zoneCode" TEXT NOT NULL,
    "zoneName" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hotel_catalogue_entry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "hotel_catalogue_entry_hotelCode_key" ON "hotel_catalogue_entry"("hotelCode");
CREATE INDEX "hotel_catalogue_entry_destinationCode_idx" ON "hotel_catalogue_entry"("destinationCode");
CREATE INDEX "hotel_catalogue_entry_zoneCode_idx" ON "hotel_catalogue_entry"("zoneCode");
CREATE INDEX "hotel_catalogue_entry_starGrading_idx" ON "hotel_catalogue_entry"("starGrading");
CREATE INDEX "hotel_catalogue_entry_destinationCode_zoneCode_idx" ON "hotel_catalogue_entry"("destinationCode", "zoneCode");
CREATE INDEX "hotel_catalogue_entry_destinationCode_zoneCode_starGrading_idx" ON "hotel_catalogue_entry"("destinationCode", "zoneCode", "starGrading");

DELETE FROM "hotel_content" WHERE "provider" = 'hotelbeds';