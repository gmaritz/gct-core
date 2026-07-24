-- CreateTable
CREATE TABLE "language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_status" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "booking_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_status" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "quote_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_status" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "reservation_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "supplier_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_status" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "payment_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund_status" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "refund_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_status" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "invoice_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary_status" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "itinerary_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_status" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "assignment_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_status" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "schedule_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_status" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "execution_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "document_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "notification_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "package_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "tour_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accommodation_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "accommodation_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "customer_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_note_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "booking_note_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_note_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "operational_note_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "media_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accommodation_category" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "accommodation_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trailer_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "trailer_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synchronisation_job_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "synchronisation_job_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synchronisation_job_status" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "synchronisation_job_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batch_status" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "import_batch_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_adjustment_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "financial_adjustment_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "reconciliation_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation_status" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "reconciliation_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "customerNumber" TEXT NOT NULL,
    "customerTypeId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "companyName" TEXT,
    "email" TEXT NOT NULL,
    "mobileNumber" TEXT,
    "preferredLanguageId" TEXT,
    "preferredCurrencyId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traveller" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "title" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATE,
    "countryId" TEXT,
    "passportNumber" TEXT,
    "passportExpiry" DATE,
    "dietaryRequirements" TEXT,
    "mobilityRequirements" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "traveller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "quoteNumber" TEXT NOT NULL,
    "quoteDate" DATE NOT NULL,
    "validUntil" DATE NOT NULL,
    "totalAmount" DECIMAL(19,4) NOT NULL,
    "currencyId" TEXT NOT NULL,
    "quoteStatusId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "bookingDate" DATE NOT NULL,
    "travelDate" DATE NOT NULL,
    "returnDate" DATE,
    "bookingStatusId" TEXT NOT NULL,
    "totalAmount" DECIMAL(19,4) NOT NULL,
    "currencyId" TEXT NOT NULL,
    "specialRequests" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_item" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(19,4) NOT NULL,
    "totalPrice" DECIMAL(19,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "booking_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_contact" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT,
    "mobileNumber" TEXT,
    "relationship" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "booking_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_note" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "bookingNoteTypeId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "booking_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "bookingItemId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "reservationReference" TEXT,
    "reservationStatusId" TEXT NOT NULL,
    "reservedAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_type" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "product_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_category" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "product_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "productTypeId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "duration" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_product_category" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "product_product_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tourTypeId" TEXT,
    "privateOnly" BOOLEAN NOT NULL DEFAULT true,
    "minimumGuests" INTEGER,
    "maximumGuests" INTEGER,
    "pickupIncluded" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "durationMinutes" INTEGER,
    "minimumAge" INTEGER,
    "weatherDependent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accommodation" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "accommodationTypeId" TEXT,
    "supplierCode" TEXT,
    "accommodationCategoryId" TEXT,
    "starRating" DECIMAL(65,30),
    "checkInTime" TEXT,
    "checkOutTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "accommodation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "packageTypeId" TEXT,
    "numberOfDays" INTEGER,
    "numberOfNights" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_product" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "displayOrder" INTEGER,
    "optional" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "package_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "mediaTypeId" TEXT NOT NULL,
    "title" TEXT,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "altText" TEXT,
    "displayOrder" INTEGER,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier" (
    "id" TEXT NOT NULL,
    "supplierCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "supplierTypeId" TEXT NOT NULL,
    "apiProvider" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sandboxEnabled" BOOLEAN NOT NULL DEFAULT true,
    "productionEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_agreement" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "agreementReference" TEXT,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "commissionPercent" DECIMAL(65,30),
    "currencyId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "supplier_agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_product" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "supplierProductCode" TEXT NOT NULL,
    "supplierProductName" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastSynchronizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "supplier_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability" (
    "id" TEXT NOT NULL,
    "supplierProductId" TEXT NOT NULL,
    "availableFrom" DATE NOT NULL,
    "availableTo" DATE NOT NULL,
    "allocation" INTEGER,
    "available" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate" (
    "id" TEXT NOT NULL,
    "supplierProductId" TEXT NOT NULL,
    "rateCode" TEXT,
    "currencyId" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "validFrom" DATE NOT NULL,
    "validTo" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer" (
    "id" TEXT NOT NULL,
    "supplierProductId" TEXT NOT NULL,
    "offerCode" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "validFrom" DATE NOT NULL,
    "validTo" DATE NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "season" (
    "id" TEXT NOT NULL,
    "supplierProductId" TEXT NOT NULL,
    "seasonCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "synchronisation_job" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "jobTypeId" TEXT NOT NULL,
    "jobStatusId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "recordsProcessed" INTEGER,
    "recordsFailed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "synchronisation_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batch" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "batchReference" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "recordsImported" INTEGER NOT NULL,
    "recordsRejected" INTEGER NOT NULL,
    "importBatchStatusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "import_batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mapping_rule" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "supplierField" TEXT NOT NULL,
    "internalField" TEXT NOT NULL,
    "transformationRule" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "mapping_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,
    "decimalPlaces" INTEGER NOT NULL DEFAULT 2,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rate" (
    "id" TEXT NOT NULL,
    "fromCurrencyId" TEXT NOT NULL,
    "toCurrencyId" TEXT NOT NULL,
    "exchangeRate" DECIMAL(65,30) NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "exchange_rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rate" (
    "id" TEXT NOT NULL,
    "taxCode" TEXT NOT NULL,
    "description" TEXT,
    "percentage" DECIMAL(65,30) NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "tax_rate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_method" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "payment_method_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "paymentReference" TEXT NOT NULL,
    "transactionReference" TEXT,
    "amount" DECIMAL(19,4) NOT NULL,
    "currencyId" TEXT NOT NULL,
    "paymentStatusId" TEXT NOT NULL,
    "paymentDate" DATE NOT NULL,
    "receivedAt" TIMESTAMP(3),
    "gatewayResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocation" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "allocatedAmount" DECIMAL(19,4) NOT NULL,
    "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "payment_allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "refundReference" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "refundReason" TEXT,
    "refundedAt" TIMESTAMP(3) NOT NULL,
    "refundStatusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_adjustment" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "adjustmentTypeId" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "reason" TEXT,
    "adjustedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "financial_adjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" DATE NOT NULL,
    "dueDate" DATE,
    "subtotal" DECIMAL(19,4) NOT NULL,
    "taxAmount" DECIMAL(19,4) NOT NULL,
    "totalAmount" DECIMAL(19,4) NOT NULL,
    "invoiceStatusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_note" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "creditNoteNumber" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "reason" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "credit_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_reconciliation" (
    "id" TEXT NOT NULL,
    "reconciliationDate" DATE NOT NULL,
    "reconciliationTypeId" TEXT NOT NULL,
    "reconciliationStatusId" TEXT NOT NULL,
    "processedRecords" INTEGER NOT NULL,
    "discrepancies" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "financial_reconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "itineraryNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "itineraryStatusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "itinerary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary_day" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "travelDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "itinerary_day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itinerary_item" (
    "id" TEXT NOT NULL,
    "itineraryDayId" TEXT NOT NULL,
    "productId" TEXT,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "sequence" INTEGER NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "itinerary_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "manufacturer" TEXT,
    "model" TEXT,
    "seatingCapacity" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver" (
    "id" TEXT NOT NULL,
    "employeeNumber" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "mobileNumber" TEXT,
    "driversLicence" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide" (
    "id" TEXT NOT NULL,
    "employeeNumber" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "languages" JSONB,
    "guideRegistration" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "guide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trailer" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "description" TEXT NOT NULL,
    "trailerTypeId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "trailer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_assignment" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "guideId" TEXT,
    "trailerId" TEXT,
    "assignedFrom" TIMESTAMP(3) NOT NULL,
    "assignedTo" TIMESTAMP(3),
    "assignmentStatusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "resource_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_schedule" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledFinish" TIMESTAMP(3) NOT NULL,
    "scheduleStatusId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "operational_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tour_execution" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "executionStatusId" TEXT NOT NULL,
    "kilometresTravelled" DECIMAL(65,30),
    "customerFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "tour_execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_note" (
    "id" TEXT NOT NULL,
    "itineraryId" TEXT NOT NULL,
    "operationalNoteTypeId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "operational_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_user" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "platform_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" TEXT NOT NULL,
    "permissionCode" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "documentTypeId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_template" (
    "id" TEXT NOT NULL,
    "templateCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templatePath" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "document_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationTypeId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_template" (
    "id" TEXT NOT NULL,
    "templateCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subjectTemplate" TEXT NOT NULL,
    "bodyTemplate" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "notification_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_event" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "workflowType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "workflow_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_record" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "audit_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_endpoint" (
    "id" TEXT NOT NULL,
    "endpointCode" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "authenticationType" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "timeoutSeconds" INTEGER NOT NULL DEFAULT 30,
    "retryCount" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "integration_endpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configuration" (
    "id" TEXT NOT NULL,
    "configurationKey" TEXT NOT NULL,
    "configurationValue" TEXT NOT NULL,
    "category" TEXT,
    "encrypted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "system_configuration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "language_code_key" ON "language"("code");

-- CreateIndex
CREATE INDEX "language_code_idx" ON "language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "country_code_key" ON "country"("code");

-- CreateIndex
CREATE INDEX "country_code_idx" ON "country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "booking_status_code_key" ON "booking_status"("code");

-- CreateIndex
CREATE INDEX "booking_status_code_idx" ON "booking_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "quote_status_code_key" ON "quote_status"("code");

-- CreateIndex
CREATE INDEX "quote_status_code_idx" ON "quote_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_status_code_key" ON "reservation_status"("code");

-- CreateIndex
CREATE INDEX "reservation_status_code_idx" ON "reservation_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_type_code_key" ON "supplier_type"("code");

-- CreateIndex
CREATE INDEX "supplier_type_code_idx" ON "supplier_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "payment_status_code_key" ON "payment_status"("code");

-- CreateIndex
CREATE INDEX "payment_status_code_idx" ON "payment_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "refund_status_code_key" ON "refund_status"("code");

-- CreateIndex
CREATE INDEX "refund_status_code_idx" ON "refund_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_status_code_key" ON "invoice_status"("code");

-- CreateIndex
CREATE INDEX "invoice_status_code_idx" ON "invoice_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "itinerary_status_code_key" ON "itinerary_status"("code");

-- CreateIndex
CREATE INDEX "itinerary_status_code_idx" ON "itinerary_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_status_code_key" ON "assignment_status"("code");

-- CreateIndex
CREATE INDEX "assignment_status_code_idx" ON "assignment_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_status_code_key" ON "schedule_status"("code");

-- CreateIndex
CREATE INDEX "schedule_status_code_idx" ON "schedule_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "execution_status_code_key" ON "execution_status"("code");

-- CreateIndex
CREATE INDEX "execution_status_code_idx" ON "execution_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "document_type_code_key" ON "document_type"("code");

-- CreateIndex
CREATE INDEX "document_type_code_idx" ON "document_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "notification_type_code_key" ON "notification_type"("code");

-- CreateIndex
CREATE INDEX "notification_type_code_idx" ON "notification_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "package_type_code_key" ON "package_type"("code");

-- CreateIndex
CREATE INDEX "package_type_code_idx" ON "package_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tour_type_code_key" ON "tour_type"("code");

-- CreateIndex
CREATE INDEX "tour_type_code_idx" ON "tour_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "accommodation_type_code_key" ON "accommodation_type"("code");

-- CreateIndex
CREATE INDEX "accommodation_type_code_idx" ON "accommodation_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "customer_type_code_key" ON "customer_type"("code");

-- CreateIndex
CREATE INDEX "customer_type_code_idx" ON "customer_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "booking_note_type_code_key" ON "booking_note_type"("code");

-- CreateIndex
CREATE INDEX "booking_note_type_code_idx" ON "booking_note_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "operational_note_type_code_key" ON "operational_note_type"("code");

-- CreateIndex
CREATE INDEX "operational_note_type_code_idx" ON "operational_note_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "media_type_code_key" ON "media_type"("code");

-- CreateIndex
CREATE INDEX "media_type_code_idx" ON "media_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "accommodation_category_code_key" ON "accommodation_category"("code");

-- CreateIndex
CREATE INDEX "accommodation_category_code_idx" ON "accommodation_category"("code");

-- CreateIndex
CREATE UNIQUE INDEX "trailer_type_code_key" ON "trailer_type"("code");

-- CreateIndex
CREATE INDEX "trailer_type_code_idx" ON "trailer_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "synchronisation_job_type_code_key" ON "synchronisation_job_type"("code");

-- CreateIndex
CREATE INDEX "synchronisation_job_type_code_idx" ON "synchronisation_job_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "synchronisation_job_status_code_key" ON "synchronisation_job_status"("code");

-- CreateIndex
CREATE INDEX "synchronisation_job_status_code_idx" ON "synchronisation_job_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "import_batch_status_code_key" ON "import_batch_status"("code");

-- CreateIndex
CREATE INDEX "import_batch_status_code_idx" ON "import_batch_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "financial_adjustment_type_code_key" ON "financial_adjustment_type"("code");

-- CreateIndex
CREATE INDEX "financial_adjustment_type_code_idx" ON "financial_adjustment_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "reconciliation_type_code_key" ON "reconciliation_type"("code");

-- CreateIndex
CREATE INDEX "reconciliation_type_code_idx" ON "reconciliation_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "reconciliation_status_code_key" ON "reconciliation_status"("code");

-- CreateIndex
CREATE INDEX "reconciliation_status_code_idx" ON "reconciliation_status"("code");

-- CreateIndex
CREATE UNIQUE INDEX "customer_customerNumber_key" ON "customer"("customerNumber");

-- CreateIndex
CREATE INDEX "customer_email_idx" ON "customer"("email");

-- CreateIndex
CREATE INDEX "customer_customerNumber_idx" ON "customer"("customerNumber");

-- CreateIndex
CREATE INDEX "customer_customerTypeId_idx" ON "customer"("customerTypeId");

-- CreateIndex
CREATE INDEX "customer_preferredLanguageId_idx" ON "customer"("preferredLanguageId");

-- CreateIndex
CREATE INDEX "customer_preferredCurrencyId_idx" ON "customer"("preferredCurrencyId");

-- CreateIndex
CREATE INDEX "traveller_customerId_idx" ON "traveller"("customerId");

-- CreateIndex
CREATE INDEX "traveller_countryId_idx" ON "traveller"("countryId");

-- CreateIndex
CREATE UNIQUE INDEX "quote_quoteNumber_key" ON "quote"("quoteNumber");

-- CreateIndex
CREATE INDEX "quote_customerId_idx" ON "quote"("customerId");

-- CreateIndex
CREATE INDEX "quote_currencyId_idx" ON "quote"("currencyId");

-- CreateIndex
CREATE INDEX "quote_quoteStatusId_idx" ON "quote"("quoteStatusId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_bookingNumber_key" ON "booking"("bookingNumber");

-- CreateIndex
CREATE INDEX "booking_customerId_idx" ON "booking"("customerId");

-- CreateIndex
CREATE INDEX "booking_travelDate_idx" ON "booking"("travelDate");

-- CreateIndex
CREATE INDEX "booking_bookingStatusId_idx" ON "booking"("bookingStatusId");

-- CreateIndex
CREATE INDEX "booking_currencyId_idx" ON "booking"("currencyId");

-- CreateIndex
CREATE INDEX "booking_item_bookingId_idx" ON "booking_item"("bookingId");

-- CreateIndex
CREATE INDEX "booking_item_productId_idx" ON "booking_item"("productId");

-- CreateIndex
CREATE INDEX "booking_contact_bookingId_idx" ON "booking_contact"("bookingId");

-- CreateIndex
CREATE INDEX "booking_note_bookingId_idx" ON "booking_note"("bookingId");

-- CreateIndex
CREATE INDEX "booking_note_bookingNoteTypeId_idx" ON "booking_note"("bookingNoteTypeId");

-- CreateIndex
CREATE INDEX "reservation_bookingId_idx" ON "reservation"("bookingId");

-- CreateIndex
CREATE INDEX "reservation_bookingItemId_idx" ON "reservation"("bookingItemId");

-- CreateIndex
CREATE INDEX "reservation_supplierId_idx" ON "reservation"("supplierId");

-- CreateIndex
CREATE INDEX "reservation_reservationStatusId_idx" ON "reservation"("reservationStatusId");

-- CreateIndex
CREATE UNIQUE INDEX "product_type_code_key" ON "product_type"("code");

-- CreateIndex
CREATE INDEX "product_type_code_idx" ON "product_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "destination_code_key" ON "destination"("code");

-- CreateIndex
CREATE UNIQUE INDEX "destination_slug_key" ON "destination"("slug");

-- CreateIndex
CREATE INDEX "destination_slug_idx" ON "destination"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "product_category_code_key" ON "product_category"("code");

-- CreateIndex
CREATE UNIQUE INDEX "product_productCode_key" ON "product"("productCode");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");

-- CreateIndex
CREATE INDEX "product_productTypeId_idx" ON "product"("productTypeId");

-- CreateIndex
CREATE INDEX "product_destinationId_idx" ON "product"("destinationId");

-- CreateIndex
CREATE INDEX "product_slug_idx" ON "product"("slug");

-- CreateIndex
CREATE INDEX "product_product_category_productId_idx" ON "product_product_category"("productId");

-- CreateIndex
CREATE INDEX "product_product_category_categoryId_idx" ON "product_product_category"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "product_product_category_productId_categoryId_key" ON "product_product_category"("productId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "tour_productId_key" ON "tour"("productId");

-- CreateIndex
CREATE INDEX "tour_tourTypeId_idx" ON "tour"("tourTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "activity_productId_key" ON "activity"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "accommodation_productId_key" ON "accommodation"("productId");

-- CreateIndex
CREATE INDEX "accommodation_supplierCode_idx" ON "accommodation"("supplierCode");

-- CreateIndex
CREATE INDEX "accommodation_accommodationTypeId_idx" ON "accommodation"("accommodationTypeId");

-- CreateIndex
CREATE INDEX "accommodation_accommodationCategoryId_idx" ON "accommodation"("accommodationCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "package_productId_key" ON "package"("productId");

-- CreateIndex
CREATE INDEX "package_packageTypeId_idx" ON "package"("packageTypeId");

-- CreateIndex
CREATE INDEX "package_product_packageId_idx" ON "package_product"("packageId");

-- CreateIndex
CREATE INDEX "package_product_productId_idx" ON "package_product"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "package_product_packageId_productId_key" ON "package_product"("packageId", "productId");

-- CreateIndex
CREATE INDEX "media_productId_idx" ON "media"("productId");

-- CreateIndex
CREATE INDEX "media_mediaTypeId_idx" ON "media"("mediaTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_supplierCode_key" ON "supplier"("supplierCode");

-- CreateIndex
CREATE INDEX "supplier_supplierCode_idx" ON "supplier"("supplierCode");

-- CreateIndex
CREATE INDEX "supplier_supplierTypeId_idx" ON "supplier"("supplierTypeId");

-- CreateIndex
CREATE INDEX "supplier_agreement_supplierId_idx" ON "supplier_agreement"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_agreement_currencyId_idx" ON "supplier_agreement"("currencyId");

-- CreateIndex
CREATE INDEX "supplier_product_supplierId_idx" ON "supplier_product"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_product_productId_idx" ON "supplier_product"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_product_supplierId_supplierProductCode_key" ON "supplier_product"("supplierId", "supplierProductCode");

-- CreateIndex
CREATE INDEX "availability_supplierProductId_idx" ON "availability"("supplierProductId");

-- CreateIndex
CREATE INDEX "availability_availableFrom_idx" ON "availability"("availableFrom");

-- CreateIndex
CREATE INDEX "rate_supplierProductId_idx" ON "rate"("supplierProductId");

-- CreateIndex
CREATE INDEX "rate_currencyId_idx" ON "rate"("currencyId");

-- CreateIndex
CREATE INDEX "rate_validFrom_idx" ON "rate"("validFrom");

-- CreateIndex
CREATE INDEX "offer_supplierProductId_idx" ON "offer"("supplierProductId");

-- CreateIndex
CREATE INDEX "season_supplierProductId_idx" ON "season"("supplierProductId");

-- CreateIndex
CREATE INDEX "synchronisation_job_supplierId_idx" ON "synchronisation_job"("supplierId");

-- CreateIndex
CREATE INDEX "synchronisation_job_jobTypeId_idx" ON "synchronisation_job"("jobTypeId");

-- CreateIndex
CREATE INDEX "synchronisation_job_jobStatusId_idx" ON "synchronisation_job"("jobStatusId");

-- CreateIndex
CREATE UNIQUE INDEX "import_batch_batchReference_key" ON "import_batch"("batchReference");

-- CreateIndex
CREATE INDEX "import_batch_supplierId_idx" ON "import_batch"("supplierId");

-- CreateIndex
CREATE INDEX "import_batch_importBatchStatusId_idx" ON "import_batch"("importBatchStatusId");

-- CreateIndex
CREATE INDEX "mapping_rule_supplierId_idx" ON "mapping_rule"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "currency_code_key" ON "currency"("code");

-- CreateIndex
CREATE INDEX "currency_code_idx" ON "currency"("code");

-- CreateIndex
CREATE INDEX "exchange_rate_fromCurrencyId_idx" ON "exchange_rate"("fromCurrencyId");

-- CreateIndex
CREATE INDEX "exchange_rate_toCurrencyId_idx" ON "exchange_rate"("toCurrencyId");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rate_fromCurrencyId_toCurrencyId_effectiveDate_key" ON "exchange_rate"("fromCurrencyId", "toCurrencyId", "effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "tax_rate_taxCode_key" ON "tax_rate"("taxCode");

-- CreateIndex
CREATE INDEX "tax_rate_taxCode_idx" ON "tax_rate"("taxCode");

-- CreateIndex
CREATE UNIQUE INDEX "payment_method_code_key" ON "payment_method"("code");

-- CreateIndex
CREATE UNIQUE INDEX "payment_paymentReference_key" ON "payment"("paymentReference");

-- CreateIndex
CREATE INDEX "payment_bookingId_idx" ON "payment"("bookingId");

-- CreateIndex
CREATE INDEX "payment_paymentMethodId_idx" ON "payment"("paymentMethodId");

-- CreateIndex
CREATE INDEX "payment_currencyId_idx" ON "payment"("currencyId");

-- CreateIndex
CREATE INDEX "payment_paymentStatusId_idx" ON "payment"("paymentStatusId");

-- CreateIndex
CREATE INDEX "payment_paymentDate_idx" ON "payment"("paymentDate");

-- CreateIndex
CREATE INDEX "payment_allocation_paymentId_idx" ON "payment_allocation"("paymentId");

-- CreateIndex
CREATE INDEX "payment_allocation_invoiceId_idx" ON "payment_allocation"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_allocation_paymentId_invoiceId_key" ON "payment_allocation"("paymentId", "invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "refund_refundReference_key" ON "refund"("refundReference");

-- CreateIndex
CREATE INDEX "refund_paymentId_idx" ON "refund"("paymentId");

-- CreateIndex
CREATE INDEX "refund_refundStatusId_idx" ON "refund"("refundStatusId");

-- CreateIndex
CREATE INDEX "financial_adjustment_paymentId_idx" ON "financial_adjustment"("paymentId");

-- CreateIndex
CREATE INDEX "financial_adjustment_adjustmentTypeId_idx" ON "financial_adjustment"("adjustmentTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_invoiceNumber_key" ON "invoice"("invoiceNumber");

-- CreateIndex
CREATE INDEX "invoice_bookingId_idx" ON "invoice"("bookingId");

-- CreateIndex
CREATE INDEX "invoice_invoiceStatusId_idx" ON "invoice"("invoiceStatusId");

-- CreateIndex
CREATE UNIQUE INDEX "credit_note_creditNoteNumber_key" ON "credit_note"("creditNoteNumber");

-- CreateIndex
CREATE INDEX "credit_note_invoiceId_idx" ON "credit_note"("invoiceId");

-- CreateIndex
CREATE INDEX "financial_reconciliation_reconciliationDate_idx" ON "financial_reconciliation"("reconciliationDate");

-- CreateIndex
CREATE INDEX "financial_reconciliation_reconciliationTypeId_idx" ON "financial_reconciliation"("reconciliationTypeId");

-- CreateIndex
CREATE INDEX "financial_reconciliation_reconciliationStatusId_idx" ON "financial_reconciliation"("reconciliationStatusId");

-- CreateIndex
CREATE UNIQUE INDEX "itinerary_bookingId_key" ON "itinerary"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "itinerary_itineraryNumber_key" ON "itinerary"("itineraryNumber");

-- CreateIndex
CREATE INDEX "itinerary_bookingId_idx" ON "itinerary"("bookingId");

-- CreateIndex
CREATE INDEX "itinerary_itineraryStatusId_idx" ON "itinerary"("itineraryStatusId");

-- CreateIndex
CREATE INDEX "itinerary_day_itineraryId_idx" ON "itinerary_day"("itineraryId");

-- CreateIndex
CREATE UNIQUE INDEX "itinerary_day_itineraryId_dayNumber_key" ON "itinerary_day"("itineraryId", "dayNumber");

-- CreateIndex
CREATE INDEX "itinerary_item_itineraryDayId_idx" ON "itinerary_item"("itineraryDayId");

-- CreateIndex
CREATE INDEX "itinerary_item_productId_idx" ON "itinerary_item"("productId");

-- CreateIndex
CREATE INDEX "itinerary_item_sequence_idx" ON "itinerary_item"("sequence");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_registrationNumber_key" ON "vehicle"("registrationNumber");

-- CreateIndex
CREATE INDEX "vehicle_registrationNumber_idx" ON "vehicle"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "driver_employeeNumber_key" ON "driver"("employeeNumber");

-- CreateIndex
CREATE INDEX "driver_employeeNumber_idx" ON "driver"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "guide_employeeNumber_key" ON "guide"("employeeNumber");

-- CreateIndex
CREATE INDEX "guide_employeeNumber_idx" ON "guide"("employeeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "trailer_registrationNumber_key" ON "trailer"("registrationNumber");

-- CreateIndex
CREATE INDEX "trailer_trailerTypeId_idx" ON "trailer"("trailerTypeId");

-- CreateIndex
CREATE INDEX "resource_assignment_itineraryId_idx" ON "resource_assignment"("itineraryId");

-- CreateIndex
CREATE INDEX "resource_assignment_vehicleId_idx" ON "resource_assignment"("vehicleId");

-- CreateIndex
CREATE INDEX "resource_assignment_driverId_idx" ON "resource_assignment"("driverId");

-- CreateIndex
CREATE INDEX "resource_assignment_guideId_idx" ON "resource_assignment"("guideId");

-- CreateIndex
CREATE INDEX "resource_assignment_trailerId_idx" ON "resource_assignment"("trailerId");

-- CreateIndex
CREATE INDEX "resource_assignment_assignmentStatusId_idx" ON "resource_assignment"("assignmentStatusId");

-- CreateIndex
CREATE INDEX "operational_schedule_itineraryId_idx" ON "operational_schedule"("itineraryId");

-- CreateIndex
CREATE INDEX "operational_schedule_scheduledStart_idx" ON "operational_schedule"("scheduledStart");

-- CreateIndex
CREATE INDEX "operational_schedule_scheduleStatusId_idx" ON "operational_schedule"("scheduleStatusId");

-- CreateIndex
CREATE INDEX "tour_execution_itineraryId_idx" ON "tour_execution"("itineraryId");

-- CreateIndex
CREATE INDEX "tour_execution_executionStatusId_idx" ON "tour_execution"("executionStatusId");

-- CreateIndex
CREATE INDEX "operational_note_itineraryId_idx" ON "operational_note"("itineraryId");

-- CreateIndex
CREATE INDEX "operational_note_operationalNoteTypeId_idx" ON "operational_note"("operationalNoteTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "platform_user_username_key" ON "platform_user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "platform_user_email_key" ON "platform_user"("email");

-- CreateIndex
CREATE INDEX "platform_user_username_idx" ON "platform_user"("username");

-- CreateIndex
CREATE INDEX "platform_user_email_idx" ON "platform_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "role_roleCode_key" ON "role"("roleCode");

-- CreateIndex
CREATE INDEX "role_roleCode_idx" ON "role"("roleCode");

-- CreateIndex
CREATE UNIQUE INDEX "permission_permissionCode_key" ON "permission"("permissionCode");

-- CreateIndex
CREATE INDEX "permission_permissionCode_idx" ON "permission"("permissionCode");

-- CreateIndex
CREATE INDEX "user_role_userId_idx" ON "user_role"("userId");

-- CreateIndex
CREATE INDEX "user_role_roleId_idx" ON "user_role"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_role_userId_roleId_key" ON "user_role"("userId", "roleId");

-- CreateIndex
CREATE INDEX "role_permission_roleId_idx" ON "role_permission"("roleId");

-- CreateIndex
CREATE INDEX "role_permission_permissionId_idx" ON "role_permission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "role_permission_roleId_permissionId_key" ON "role_permission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "document_userId_idx" ON "document"("userId");

-- CreateIndex
CREATE INDEX "document_documentTypeId_idx" ON "document"("documentTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "document_template_templateCode_key" ON "document_template"("templateCode");

-- CreateIndex
CREATE INDEX "notification_userId_idx" ON "notification"("userId");

-- CreateIndex
CREATE INDEX "notification_notificationTypeId_idx" ON "notification"("notificationTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_template_templateCode_key" ON "notification_template"("templateCode");

-- CreateIndex
CREATE INDEX "workflow_event_userId_idx" ON "workflow_event"("userId");

-- CreateIndex
CREATE INDEX "workflow_event_entityType_entityId_idx" ON "workflow_event"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "workflow_event_workflowType_idx" ON "workflow_event"("workflowType");

-- CreateIndex
CREATE INDEX "audit_record_userId_idx" ON "audit_record"("userId");

-- CreateIndex
CREATE INDEX "audit_record_entityType_entityId_idx" ON "audit_record"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_record_createdAt_idx" ON "audit_record"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "integration_endpoint_endpointCode_key" ON "integration_endpoint"("endpointCode");

-- CreateIndex
CREATE INDEX "integration_endpoint_provider_idx" ON "integration_endpoint"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "system_configuration_configurationKey_key" ON "system_configuration"("configurationKey");

-- CreateIndex
CREATE INDEX "system_configuration_category_idx" ON "system_configuration"("category");

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_customerTypeId_fkey" FOREIGN KEY ("customerTypeId") REFERENCES "customer_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_preferredLanguageId_fkey" FOREIGN KEY ("preferredLanguageId") REFERENCES "language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_preferredCurrencyId_fkey" FOREIGN KEY ("preferredCurrencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traveller" ADD CONSTRAINT "traveller_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traveller" ADD CONSTRAINT "traveller_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_quoteStatusId_fkey" FOREIGN KEY ("quoteStatusId") REFERENCES "quote_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_bookingStatusId_fkey" FOREIGN KEY ("bookingStatusId") REFERENCES "booking_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_item" ADD CONSTRAINT "booking_item_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_item" ADD CONSTRAINT "booking_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_contact" ADD CONSTRAINT "booking_contact_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_note" ADD CONSTRAINT "booking_note_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_note" ADD CONSTRAINT "booking_note_bookingNoteTypeId_fkey" FOREIGN KEY ("bookingNoteTypeId") REFERENCES "booking_note_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_bookingItemId_fkey" FOREIGN KEY ("bookingItemId") REFERENCES "booking_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_reservationStatusId_fkey" FOREIGN KEY ("reservationStatusId") REFERENCES "reservation_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "product_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_product_category" ADD CONSTRAINT "product_product_category_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_product_category" ADD CONSTRAINT "product_product_category_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour" ADD CONSTRAINT "tour_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour" ADD CONSTRAINT "tour_tourTypeId_fkey" FOREIGN KEY ("tourTypeId") REFERENCES "tour_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation" ADD CONSTRAINT "accommodation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation" ADD CONSTRAINT "accommodation_accommodationTypeId_fkey" FOREIGN KEY ("accommodationTypeId") REFERENCES "accommodation_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation" ADD CONSTRAINT "accommodation_accommodationCategoryId_fkey" FOREIGN KEY ("accommodationCategoryId") REFERENCES "accommodation_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package" ADD CONSTRAINT "package_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package" ADD CONSTRAINT "package_packageTypeId_fkey" FOREIGN KEY ("packageTypeId") REFERENCES "package_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_product" ADD CONSTRAINT "package_product_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_product" ADD CONSTRAINT "package_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_mediaTypeId_fkey" FOREIGN KEY ("mediaTypeId") REFERENCES "media_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_supplierTypeId_fkey" FOREIGN KEY ("supplierTypeId") REFERENCES "supplier_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_agreement" ADD CONSTRAINT "supplier_agreement_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_agreement" ADD CONSTRAINT "supplier_agreement_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_product" ADD CONSTRAINT "supplier_product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_product" ADD CONSTRAINT "supplier_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_supplierProductId_fkey" FOREIGN KEY ("supplierProductId") REFERENCES "supplier_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate" ADD CONSTRAINT "rate_supplierProductId_fkey" FOREIGN KEY ("supplierProductId") REFERENCES "supplier_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate" ADD CONSTRAINT "rate_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer" ADD CONSTRAINT "offer_supplierProductId_fkey" FOREIGN KEY ("supplierProductId") REFERENCES "supplier_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "season" ADD CONSTRAINT "season_supplierProductId_fkey" FOREIGN KEY ("supplierProductId") REFERENCES "supplier_product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synchronisation_job" ADD CONSTRAINT "synchronisation_job_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synchronisation_job" ADD CONSTRAINT "synchronisation_job_jobTypeId_fkey" FOREIGN KEY ("jobTypeId") REFERENCES "synchronisation_job_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "synchronisation_job" ADD CONSTRAINT "synchronisation_job_jobStatusId_fkey" FOREIGN KEY ("jobStatusId") REFERENCES "synchronisation_job_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batch" ADD CONSTRAINT "import_batch_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batch" ADD CONSTRAINT "import_batch_importBatchStatusId_fkey" FOREIGN KEY ("importBatchStatusId") REFERENCES "import_batch_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mapping_rule" ADD CONSTRAINT "mapping_rule_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rate" ADD CONSTRAINT "exchange_rate_fromCurrencyId_fkey" FOREIGN KEY ("fromCurrencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rate" ADD CONSTRAINT "exchange_rate_toCurrencyId_fkey" FOREIGN KEY ("toCurrencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_method"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_paymentStatusId_fkey" FOREIGN KEY ("paymentStatusId") REFERENCES "payment_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocation" ADD CONSTRAINT "payment_allocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocation" ADD CONSTRAINT "payment_allocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund" ADD CONSTRAINT "refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund" ADD CONSTRAINT "refund_refundStatusId_fkey" FOREIGN KEY ("refundStatusId") REFERENCES "refund_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_adjustment" ADD CONSTRAINT "financial_adjustment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_adjustment" ADD CONSTRAINT "financial_adjustment_adjustmentTypeId_fkey" FOREIGN KEY ("adjustmentTypeId") REFERENCES "financial_adjustment_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_invoiceStatusId_fkey" FOREIGN KEY ("invoiceStatusId") REFERENCES "invoice_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_note" ADD CONSTRAINT "credit_note_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_reconciliation" ADD CONSTRAINT "financial_reconciliation_reconciliationTypeId_fkey" FOREIGN KEY ("reconciliationTypeId") REFERENCES "reconciliation_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_reconciliation" ADD CONSTRAINT "financial_reconciliation_reconciliationStatusId_fkey" FOREIGN KEY ("reconciliationStatusId") REFERENCES "reconciliation_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary" ADD CONSTRAINT "itinerary_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary" ADD CONSTRAINT "itinerary_itineraryStatusId_fkey" FOREIGN KEY ("itineraryStatusId") REFERENCES "itinerary_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_day" ADD CONSTRAINT "itinerary_day_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itinerary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_item" ADD CONSTRAINT "itinerary_item_itineraryDayId_fkey" FOREIGN KEY ("itineraryDayId") REFERENCES "itinerary_day"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itinerary_item" ADD CONSTRAINT "itinerary_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trailer" ADD CONSTRAINT "trailer_trailerTypeId_fkey" FOREIGN KEY ("trailerTypeId") REFERENCES "trailer_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_assignment" ADD CONSTRAINT "resource_assignment_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itinerary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_assignment" ADD CONSTRAINT "resource_assignment_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_assignment" ADD CONSTRAINT "resource_assignment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_assignment" ADD CONSTRAINT "resource_assignment_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "guide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_assignment" ADD CONSTRAINT "resource_assignment_trailerId_fkey" FOREIGN KEY ("trailerId") REFERENCES "trailer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_assignment" ADD CONSTRAINT "resource_assignment_assignmentStatusId_fkey" FOREIGN KEY ("assignmentStatusId") REFERENCES "assignment_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_schedule" ADD CONSTRAINT "operational_schedule_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itinerary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_schedule" ADD CONSTRAINT "operational_schedule_scheduleStatusId_fkey" FOREIGN KEY ("scheduleStatusId") REFERENCES "schedule_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_execution" ADD CONSTRAINT "tour_execution_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itinerary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour_execution" ADD CONSTRAINT "tour_execution_executionStatusId_fkey" FOREIGN KEY ("executionStatusId") REFERENCES "execution_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_note" ADD CONSTRAINT "operational_note_itineraryId_fkey" FOREIGN KEY ("itineraryId") REFERENCES "itinerary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_note" ADD CONSTRAINT "operational_note_operationalNoteTypeId_fkey" FOREIGN KEY ("operationalNoteTypeId") REFERENCES "operational_note_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES "platform_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "platform_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "document_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "platform_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_notificationTypeId_fkey" FOREIGN KEY ("notificationTypeId") REFERENCES "notification_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_event" ADD CONSTRAINT "workflow_event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "platform_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_record" ADD CONSTRAINT "audit_record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "platform_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
