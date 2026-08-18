-- CreateTable
CREATE TABLE "hotel_content" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerHotelCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hotel_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_content_sync_state" (
    "id" TEXT NOT NULL,
    "syncKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hotel_content_sync_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hotel_content_provider_providerHotelCode_key" ON "hotel_content"("provider", "providerHotelCode");

-- CreateIndex
CREATE INDEX "hotel_content_provider_idx" ON "hotel_content"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "hotel_content_sync_state_syncKey_key" ON "hotel_content_sync_state"("syncKey");
