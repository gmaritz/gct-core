# SPEC-028 – Prisma Data Model

# Part 1 – Prisma Architecture & Project Standards

## Document Information

| Property | Value |
|----------|-------|
| Specification ID | SPEC-028 |
| Title | Prisma Data Model |
| Project | Go Cape Tours (GCT Core) |
| Status | Draft |
| Owner | Platform Engineering |
| Depends On | SPEC-026 – Canonical Logical Data Model |
| Depends On | SPEC-027 – Physical Data Model |

---

# Revision History

| Version | Date | Author | Description |
|----------|------|--------|-------------|
| 0.1 | Initial Draft | Platform Engineering | Prisma Architecture & Project Standards |

---

# Purpose

This specification defines the complete Prisma implementation of the Go Cape Tours Physical Data Model.

Where SPEC-027 defines **what the PostgreSQL database shall contain**, SPEC-028 defines **how that database shall be implemented using Prisma ORM**.

This specification is considered the **authoritative implementation layer** between the application and PostgreSQL.

---

# Scope

This specification includes:

- Prisma project architecture
- datasource configuration
- generator configuration
- global modelling conventions
- field conventions
- relationship conventions
- indexing conventions
- audit conventions
- UUID standards
- naming standards
- migration strategy
- implementation patterns
- domain model implementation

---

# Objectives

The Prisma implementation shall:

- remain a one-to-one implementation of SPEC-027
- preserve Domain Driven Design boundaries
- preserve aggregate ownership
- support PostgreSQL natively
- maximise maintainability
- simplify migrations
- support future platform growth

---

# Related Specifications

| Specification | Relationship |
|--------------|--------------|
| SPEC-026 | Canonical Logical Data Model |
| SPEC-027 | Physical Data Model |
| SPEC-029 | Repository & Persistence Architecture *(planned)* |

---

# 1. Prisma Design Principles

The Prisma schema shall be designed according to the following principles.

## Single Source of Truth

Prisma models shall directly represent the Physical Data Model.

No model shall exist without a corresponding physical entity.

---

## Domain Driven Design

Models shall remain grouped by domain.

Domains shall never become intermixed.

Aggregate boundaries shall remain unchanged.

---

## Explicit Relationships

All relationships shall be explicitly defined.

Implicit relationships are prohibited.

Example

```prisma
customer Customer
```

rather than relying on inferred behaviour.

---

## Predictability

Every model shall follow identical conventions.

Developers should be able to recognise any model immediately.

---

## Consistency

Every entity shall:

- follow identical naming
- follow identical auditing
- follow identical indexing
- follow identical UUID usage

---

# 2. Prisma Project Structure

Recommended project structure

```text
prisma/

├── schema.prisma
├── seed.ts
├── migrations/
│
├── seeds/
│   ├── currencies.ts
│   ├── destinations.ts
│   ├── permissions.ts
│   └── roles.ts
│
└── README.md
```

Future expansion may separate domain models into multiple Prisma schema files if supported by the selected Prisma version and tooling.

The canonical schema shall remain logically organised by domain.

---

# 3. Datasource Configuration

The platform shall use PostgreSQL.

Example

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Requirements

- provider shall be PostgreSQL
- connection string supplied via environment variables
- credentials shall never be committed to source control

---

# 4. Generator Configuration

Prisma Client shall be generated automatically.

Example

```prisma
generator client {
  provider = "prisma-client-js"
}
```

Future generators (ER diagrams, documentation, validation tools) may be added as required.

---

# 5. Global Model Conventions

Every model shall:

- use singular names
- represent one business entity
- correspond to one database table
- define explicit relationships
- define indexes
- define constraints
- include audit fields where applicable

Example

```prisma
model Customer {

}
```

Never

```prisma
model Customers {

}
```

---

# 6. Naming Standards

## Models

PascalCase

```text
Customer

Booking

SupplierProduct

WorkflowEvent
```

---

## Fields

camelCase

```text
customerId

createdAt

updatedAt

travelDate

bookingStatus
```

---

## Database Mapping

Database objects shall remain snake_case using Prisma mapping attributes.

Example

```prisma
@@map("supplier_product")
```

Field example

```prisma
customerId @map("customer_id")
```

This preserves:

Application

```text
customerId
```

Database

```text
customer_id
```

---

# 7. Primary Key Standard

Every Aggregate Root shall use:

```prisma
id String
```

with

```prisma
@id
@default(uuid())
```

Example

```prisma
id String @id @default(uuid())
```

UUIDs shall never change.

---

# 8. Audit Standard

Every business entity shall include

```prisma
createdAt

updatedAt

createdBy

updatedBy
```

Where soft deletion is supported

```prisma
deletedAt

deletedBy
```

Example

```prisma
createdAt DateTime @default(now())

updatedAt DateTime @updatedAt
```

---

# 9. Date & Time Standard

All timestamps shall use

```prisma
DateTime
```

backed by PostgreSQL

```text
TIMESTAMP WITH TIME ZONE
```

All values shall be stored in UTC.

---

# 10. Monetary Standard

Currency values shall use

```prisma
Decimal
```

Example

```prisma
sellingPrice Decimal

commission Decimal

paymentAmount Decimal
```

Floating-point types shall never be used for monetary values.

---

# 11. Boolean Standard

Boolean fields shall default where appropriate.

Examples

```prisma
active Boolean @default(true)

confirmed Boolean @default(false)

processed Boolean @default(false)
```

Field names shall remain positive.

---

# 12. String Standard

Short text

```prisma
String
```

Long descriptions

```prisma
String
```

mapped to PostgreSQL TEXT where appropriate.

Examples

```prisma
description

notes

comments

summary
```

---

# 13. Relationship Standards

All relationships shall be explicitly defined.

Example

```prisma
customer Customer
```

and

```prisma
customerId String
```

using

```prisma
@relation(...)
```

Implicit relation fields are prohibited.

---

# 14. One-to-Many Standard

Example

Customer

↓

Bookings

```prisma
bookings Booking[]
```

Booking

↓

Customer

```prisma
customer Customer
```

---

# 15. Many-to-Many Standard

Many-to-many relationships shall always use explicit junction models.

Example

```text
Package

↓

PackageProduct

↓

Product
```

Implicit many-to-many relations shall not be used.

---

# 16. Index Standards

Indexes shall mirror SPEC-027.

Example

```prisma
@@index([customerId])
```

Composite

```prisma
@@index([supplierId, supplierProductCode])
```

Unique

```prisma
@@unique([bookingNumber])
```

---

# 17. Constraint Standards

Business uniqueness shall use

```prisma
@@unique()
```

Composite uniqueness

```prisma
@@unique([supplierId, supplierProductCode])
```

Primary Keys

```prisma
@id
```

Composite Primary Keys shall not be used.

---

# 18. Mapping Standards

Prisma mappings shall preserve legacy database naming where required.

Examples

```prisma
@@map("supplier_product")
```

```prisma
@map("supplier_code")
```

Mappings shall be used only where necessary to maintain consistency with the Physical Data Model.

---

# 19. Enum Strategy

The platform shall favour lookup tables over Prisma enums.

Examples

Preferred

```text
BookingStatus

PaymentStatus

ReservationStatus
```

implemented as relational lookup entities.

Prisma enums shall only be introduced where values are immutable and application-wide.

---

# 20. Migration Principles

All schema changes shall use Prisma Migrate.

Direct database modifications are prohibited.

Migration lifecycle

```text
Schema Change

↓

Prisma Schema

↓

Migration

↓

Review

↓

Testing

↓

Deployment
```

Migration history shall remain under source control.

---

# 21. Seed Data Principles

Reference data shall be seeded automatically.

Examples

- currencies
- permissions
- roles
- destinations
- tax rates
- product types

Seed data shall be:

- repeatable
- idempotent
- version controlled

---

# 22. Compliance Rules

1. Every Prisma model shall represent exactly one physical entity.

2. Every Aggregate Root shall use UUID Primary Keys.

3. Every relationship shall be explicitly declared.

4. Every many-to-many relationship shall use an explicit junction model.

5. Audit fields shall follow the global standard.

6. Naming conventions shall remain consistent across all models.

7. Database naming shall be preserved using Prisma mapping attributes.

8. Monetary values shall use `Decimal`.

9. Prisma Migrate shall be the only supported schema migration mechanism.

10. The Prisma schema shall remain a faithful implementation of SPEC-027 without introducing additional business rules.

---

# SPEC-028 – Prisma Data Model

# Part 2 – Commercial Domain Models

## Purpose

This section defines the complete Prisma implementation of the **Commercial Domain**.

The Commercial Domain is responsible for managing the complete customer booking lifecycle, from initial quotation through reservation and booking management.

The models defined herein are a direct implementation of the entities specified in:

- SPEC-026 – Canonical Logical Data Model
- SPEC-027 – Physical Data Model

No additional business entities shall be introduced at the Prisma layer.

---

# Commercial Domain Overview

## Aggregate Roots

The Commercial Domain contains the following Aggregate Roots:

```text
Customer

Traveller

Quote

Booking
```

Supporting entities:

```text
Booking Item

Booking Contact

Booking Note

Reservation
```

Relationship overview

```text
Customer
│
├──────── Traveller
│
├──────── Quote
│
└──────── Booking
             │
             ├──────── Booking Item
             │              │
             │              └──────── Reservation
             │
             ├──────── Booking Contact
             │
             └──────── Booking Note
```

---

# 1. Customer

## Purpose

Represents an individual or organisation purchasing travel products and services.

Customer is an Aggregate Root.

---

## Prisma Model

```prisma
model Customer {

  id                String      @id @default(uuid())

  customerNumber    String      @unique
  customerTypeId    String

  firstName         String?
  lastName          String?

  companyName       String?

  email             String
  mobileNumber      String?

  preferredLanguage String?
  preferredCurrency String?

  active            Boolean     @default(true)

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  createdBy         String?
  updatedBy         String?

  deletedAt         DateTime?
  deletedBy         String?

  travellers        Traveller[]
  quotes            Quote[]
  bookings          Booking[]

  @@index([email])
  @@index([customerNumber])

  @@map("customer")
}
```

---

## Business Rules

Customer shall:

- own Bookings
- own Quotes
- own Travellers
- remain independent of Supplier entities

Customer deletion shall be logical (soft delete).

---

# 2. Traveller

## Purpose

Represents an individual traveller participating in one or more bookings.

Traveller is an Aggregate Root.

---

## Prisma Model

```prisma
model Traveller {

  id                 String      @id @default(uuid())

  customerId         String

  title              String?

  firstName          String

  lastName           String

  dateOfBirth        DateTime?

  nationality         String?

  passportNumber     String?

  passportExpiry     DateTime?

  dietaryRequirements String?

  mobilityRequirements String?

  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt

  createdBy          String?
  updatedBy          String?

  deletedAt          DateTime?
  deletedBy          String?

  customer           Customer @relation(fields: [customerId], references: [id])

  @@index([customerId])

  @@map("traveller")
}
```

---

## Business Rules

Traveller:

- belongs to exactly one Customer
- may participate in multiple bookings through future booking-traveller relationships
- stores traveller-specific information only

---

# 3. Quote

## Purpose

Represents a commercial quotation before confirmation into a Booking.

Quote is an Aggregate Root.

---

## Prisma Model

```prisma
model Quote {

  id                 String      @id @default(uuid())

  customerId         String

  quoteNumber        String      @unique

  quoteDate          DateTime

  validUntil         DateTime

  totalAmount        Decimal

  currencyCode       String

  status             String

  notes              String?

  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt

  createdBy          String?
  updatedBy          String?

  deletedAt          DateTime?
  deletedBy          String?

  customer           Customer @relation(fields: [customerId], references: [id])

  @@index([customerId])
  @@index([status])

  @@map("quote")
}
```

---

## Business Rules

Quote:

- belongs to one Customer
- may expire
- may later become a Booking
- remains immutable after acceptance

---

# 4. Booking

## Purpose

Represents a confirmed customer purchase.

Booking is the primary Commercial Aggregate Root.

---

## Prisma Model

```prisma
model Booking {

  id                 String      @id @default(uuid())

  customerId         String

  bookingNumber      String      @unique

  bookingDate        DateTime

  travelDate         DateTime

  returnDate         DateTime?

  bookingStatus      String

  totalAmount        Decimal

  currencyCode       String

  specialRequests    String?

  internalNotes      String?

  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt

  createdBy          String?
  updatedBy          String?

  deletedAt          DateTime?
  deletedBy          String?

  customer           Customer      @relation(fields: [customerId], references: [id])

  bookingItems       BookingItem[]
  bookingContacts    BookingContact[]
  bookingNotes       BookingNote[]
  reservations       Reservation[]

  @@index([customerId])
  @@index([travelDate])
  @@index([bookingStatus])

  @@map("booking")
}
```

---

## Business Rules

Booking:

- belongs to one Customer
- owns Booking Items
- owns Booking Contacts
- owns Booking Notes
- owns Reservations
- owns the commercial transaction

---

# 5. Booking Item

## Purpose

Represents a single product purchased within a Booking.

---

## Prisma Model

```prisma
model BookingItem {

  id                String      @id @default(uuid())

  bookingId         String

  productId         String

  quantity          Int

  unitPrice         Decimal

  totalPrice        Decimal

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  booking           Booking @relation(fields: [bookingId], references: [id])

  @@index([bookingId])
  @@index([productId])

  @@map("booking_item")
}
```

---

## Business Rules

Booking Item:

- belongs to exactly one Booking
- references exactly one Product
- stores commercial pricing at the time of booking

---

# 6. Booking Contact

## Purpose

Represents contact information specific to a Booking.

---

## Prisma Model

```prisma
model BookingContact {

  id                 String      @id @default(uuid())

  bookingId          String

  contactName        String

  email              String?

  mobileNumber       String?

  relationship       String?

  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt

  booking            Booking @relation(fields: [bookingId], references: [id])

  @@index([bookingId])

  @@map("booking_contact")
}
```

---

## Business Rules

Booking Contact:

- belongs to one Booking
- may differ from Customer contact details
- supports emergency contacts where required

---

# 7. Booking Note

## Purpose

Stores operational or commercial notes relating to a Booking.

---

## Prisma Model

```prisma
model BookingNote {

  id                String      @id @default(uuid())

  bookingId         String

  noteType          String

  note              String

  createdAt         DateTime    @default(now())

  createdBy         String?

  booking           Booking @relation(fields: [bookingId], references: [id])

  @@index([bookingId])

  @@map("booking_note")
}
```

---

## Business Rules

Booking Notes:

- are immutable after creation
- provide complete historical traceability
- support operational communication

---

# 8. Reservation

## Purpose

Represents an external supplier reservation created from a Booking Item.

Reservations provide the linkage between Commercial and Supplier domains.

---

## Prisma Model

```prisma
model Reservation {

  id                   String      @id @default(uuid())

  bookingId            String

  bookingItemId        String

  supplierId           String

  reservationReference String?

  reservationStatus    String

  reservedAt           DateTime

  confirmedAt          DateTime?

  cancelledAt          DateTime?

  createdAt            DateTime    @default(now())
  updatedAt            DateTime    @updatedAt

  booking              Booking     @relation(fields: [bookingId], references: [id])

  bookingItem          BookingItem @relation(fields: [bookingItemId], references: [id])

  @@index([bookingId])
  @@index([bookingItemId])
  @@index([supplierId])
  @@index([reservationStatus])

  @@map("reservation")
}
```

---

## Business Rules

Reservation:

- belongs to one Booking
- belongs to one Booking Item
- references one Supplier
- stores external reservation identifiers
- manages supplier reservation lifecycle

---

# 9. Commercial Domain Compliance Rules

1. Customer, Traveller, Quote and Booking shall remain Aggregate Roots.

2. Every model shall use UUID Primary Keys.

3. Every relationship shall be explicitly declared.

4. Booking shall remain the owner of all commercial child entities.

5. Reservations shall form the integration boundary between the Commercial and Supplier domains.

6. All pricing shall be stored as immutable `Decimal` values at the time of booking.

7. All business identifiers (`customerNumber`, `quoteNumber`, `bookingNumber`) shall be unique.

8. Audit fields shall comply with the global Prisma standards defined in Part 1.

9. Soft deletion shall be supported for Aggregate Roots.

10. The Commercial Domain shall remain fully aligned with SPEC-026 and SPEC-027.

---

# SPEC-028 – Prisma Data Model

# Part 3 – Catalogue Domain Models

## Purpose

This section defines the complete Prisma implementation of the **Catalogue Domain**.

The Catalogue Domain is the commercial heart of the Go Cape Tours platform and defines every sellable product made available to customers.

It provides the foundation for:

- Product presentation
- Package construction
- Hotel integrations
- Wine tours
- Activities
- Private tours
- Accommodation
- Future product expansion

The Catalogue Domain is intentionally independent of pricing, supplier inventory and operational scheduling.

---

# Catalogue Domain Overview

## Aggregate Roots

The Catalogue Domain contains the following Aggregate Roots.

```text
Product

Destination

Product Type
```

Supporting entities

```text
Product Category

ProductProductCategory

Tour

Activity

Accommodation

Package

PackageProduct

Media
```

Relationship overview

```text
Destination
        │
        │
        ▼
Product Type
        │
        ▼
     Product
        │
 ┌──────┼──────────────┐
 │      │              │
 ▼      ▼              ▼
Tour Activity Accommodation
        │
        ▼
      Package
        │
        ▼
 PackageProduct
        │
        ▼
      Product
```

---

# 1. ProductType

## Purpose

Defines the high-level classification of products.

Examples

```text
Tour

Activity

Accommodation

Package
```

ProductType is an Aggregate Root.

---

## Prisma Model

```prisma
model ProductType {

  id              String     @id @default(uuid())

  code            String     @unique

  name            String

  description     String?

  active          Boolean    @default(true)

  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  products        Product[]

  @@index([code])

  @@map("product_type")
}
```

---

# 2. Destination

## Purpose

Represents a geographical destination used throughout the catalogue.

Examples

```text
Cape Town

Stellenbosch

Franschhoek

Hermanus

Garden Route
```

Destination is an Aggregate Root.

---

## Prisma Model

```prisma
model Destination {

  id              String     @id @default(uuid())

  code            String     @unique

  name            String

  slug            String     @unique

  description     String?

  latitude        Decimal?

  longitude       Decimal?

  active          Boolean    @default(true)

  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  products        Product[]

  @@index([slug])

  @@map("destination")
}
```

---

# 3. ProductCategory

## Purpose

Provides secondary categorisation for products.

Examples

```text
Wine

Adventure

Wildlife

Culture

Luxury

Family

Private Tour
```

---

## Prisma Model

```prisma
model ProductCategory {

  id              String     @id @default(uuid())

  code            String     @unique

  name            String

  description     String?

  active          Boolean    @default(true)

  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  productLinks    ProductProductCategory[]

  @@map("product_category")
}
```

---

# 4. Product

## Purpose

Represents every sellable catalogue item.

Product is the central Aggregate Root of the Catalogue Domain.

Every commercial booking references a Product.

---

## Prisma Model

```prisma
model Product {

  id                 String      @id @default(uuid())

  productCode        String      @unique

  productTypeId      String

  destinationId      String

  name               String

  slug               String      @unique

  shortDescription   String?

  description        String?

  duration           String?

  active             Boolean     @default(true)

  featured           Boolean     @default(false)

  seoTitle           String?

  seoDescription     String?

  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt

  productType        ProductType @relation(fields: [productTypeId], references: [id])

  destination        Destination @relation(fields: [destinationId], references: [id])

  categories         ProductProductCategory[]

  media              Media[]

  packageProducts    PackageProduct[]

  tour               Tour?

  activity           Activity?

  accommodation      Accommodation?

  @@index([productTypeId])
  @@index([destinationId])
  @@index([slug])

  @@map("product")
}
```

---

## Business Rules

Product

- represents a commercial product
- owns SEO metadata
- owns media
- belongs to one Product Type
- belongs to one Destination

---

# 5. ProductProductCategory

## Purpose

Explicit junction entity supporting Product categorisation.

---

## Prisma Model

```prisma
model ProductProductCategory {

  id                String     @id @default(uuid())

  productId         String

  categoryId        String

  product           Product @relation(fields: [productId], references: [id])

  category          ProductCategory @relation(fields: [categoryId], references: [id])

  @@unique([productId, categoryId])

  @@index([productId])

  @@index([categoryId])

  @@map("product_product_category")
}
```

---

# 6. Tour

## Purpose

Stores attributes unique to tour products.

---

## Prisma Model

```prisma
model Tour {

  id                String     @id @default(uuid())

  productId         String     @unique

  privateOnly       Boolean    @default(true)

  minimumGuests     Int?

  maximumGuests     Int?

  pickupIncluded    Boolean    @default(true)

  product           Product @relation(fields: [productId], references: [id])

  @@map("tour")
}
```

---

# 7. Activity

## Purpose

Stores attributes specific to activities.

Examples

Wine tasting

Kayaking

Shark Cage Diving

Helicopter Flight

---

## Prisma Model

```prisma
model Activity {

  id                String     @id @default(uuid())

  productId         String     @unique

  durationMinutes   Int?

  minimumAge        Int?

  weatherDependent  Boolean @default(false)

  product           Product @relation(fields: [productId], references: [id])

  @@map("activity")
}
```

---

# 8. Accommodation

## Purpose

Represents accommodation products.

Accommodation integrates directly with supplier inventory (Hotelbeds and future suppliers).

---

## Prisma Model

```prisma
model Accommodation {

  id                  String      @id @default(uuid())

  productId           String      @unique

  supplierCode        String?

  hotelCategory       String?

  starRating          Decimal?

  checkInTime         String?

  checkOutTime        String?

  product             Product @relation(fields: [productId], references: [id])

  @@index([supplierCode])

  @@map("accommodation")
}
```

---

## Business Rules

Accommodation

- extends Product
- links to supplier inventory
- owns accommodation-specific attributes only

---

# 9. Package

## Purpose

Represents a packaged experience containing multiple Products.

---

## Prisma Model

```prisma
model Package {

  id                  String     @id @default(uuid())

  productId           String     @unique

  numberOfDays        Int?

  numberOfNights      Int?

  featured            Boolean @default(false)

  product             Product @relation(fields: [productId], references: [id])

  products            PackageProduct[]

  @@map("package")
}
```

---

# 10. PackageProduct

## Purpose

Represents Products contained within a Package.

---

## Prisma Model

```prisma
model PackageProduct {

  id                  String     @id @default(uuid())

  packageId           String

  productId           String

  displayOrder        Int?

  optional            Boolean @default(false)

  package             Package @relation(fields: [packageId], references: [id])

  product             Product @relation(fields: [productId], references: [id])

  @@unique([packageId, productId])

  @@index([packageId])

  @@index([productId])

  @@map("package_product")
}
```

---

# 11. Media

## Purpose

Stores media associated with Products.

Supports

- Images
- Hero Images
- Videos
- Brochures
- Documents

---

## Prisma Model

```prisma
model Media {

  id                  String     @id @default(uuid())

  productId           String

  mediaType           String

  title               String?

  url                 String

  thumbnailUrl        String?

  altText             String?

  displayOrder        Int?

  featured            Boolean @default(false)

  createdAt           DateTime @default(now())

  product             Product @relation(fields: [productId], references: [id])

  @@index([productId])

  @@index([mediaType])

  @@map("media")
}
```

---

# 12. Catalogue Domain Compliance Rules

1. Product shall remain the central Aggregate Root of the Catalogue Domain.

2. Product Type and Destination shall remain independent Aggregate Roots.

3. Every sellable offering shall inherit from Product through a one-to-one extension model.

4. Packages shall be composed using explicit `PackageProduct` relationships.

5. Product categorisation shall use explicit junction entities.

6. Media shall always belong to a Product.

7. Accommodation shall contain supplier-specific metadata only; live pricing and availability belong to the Supplier Domain.

8. SEO metadata shall remain part of the Product Aggregate.

9. All catalogue entities shall follow the global Prisma standards defined in Part 1.

10. The Catalogue Domain shall remain technology-independent and fully aligned with SPEC-026 and SPEC-027.

---

# SPEC-028 – Prisma Data Model

# Part 4 – Supplier Domain Models

## Purpose

This section defines the Prisma implementation of the **Supplier Domain**.

The Supplier Domain provides the abstraction layer between the Go Cape Tours platform and external suppliers.

Its responsibilities include:

- supplier management
- supplier catalogue mapping
- live availability
- live pricing
- promotions and offers
- synchronisation
- imports
- supplier configuration

The Commercial and Catalogue domains shall never communicate directly with external supplier APIs. All supplier integrations shall pass through this domain.

---

# Supplier Domain Overview

## Aggregate Roots

The Supplier Domain contains the following Aggregate Roots.

```text
Supplier

SupplierProduct
```

Supporting entities

```text
SupplierAgreement

Availability

Rate

Offer

Season

SynchronisationJob

ImportBatch

MappingRule
```

Relationship overview

```text
Supplier
     │
     ├──────── Supplier Agreement
     │
     ├──────── Supplier Product
     │             │
     │             ├──────── Availability
     │             │
     │             ├──────── Rate
     │             │
     │             ├──────── Offer
     │             │
     │             └──────── Season
     │
     ├──────── Synchronisation Job
     │
     ├──────── Import Batch
     │
     └──────── Mapping Rule
```

---

# 1. Supplier

## Purpose

Represents an external travel supplier integrated with the platform.

Examples

```text
Hotelbeds

Tourplan

Viator

Future Direct Hotel API

Future Activity Supplier
```

Supplier is an Aggregate Root.

---

## Prisma Model

```prisma
model Supplier {

  id                  String     @id @default(uuid())

  supplierCode        String     @unique

  name                String

  supplierType        String

  apiProvider         String?

  active              Boolean    @default(true)

  sandboxEnabled      Boolean    @default(true)

  productionEnabled   Boolean    @default(false)

  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  createdBy           String?
  updatedBy           String?

  agreements          SupplierAgreement[]
  products            SupplierProduct[]
  synchronisationJobs SynchronisationJob[]
  importBatches       ImportBatch[]
  mappingRules        MappingRule[]

  @@index([supplierCode])
  @@index([supplierType])

  @@map("supplier")
}
```

---

## Business Rules

Supplier:

- represents one external integration partner
- owns supplier configuration
- owns synchronisation processes
- owns supplier products

---

# 2. SupplierAgreement

## Purpose

Represents the commercial agreement with a supplier.

---

## Prisma Model

```prisma
model SupplierAgreement {

  id                  String     @id @default(uuid())

  supplierId          String

  agreementReference  String?

  effectiveFrom       DateTime

  effectiveTo         DateTime?

  commissionPercent   Decimal?

  currencyCode        String

  active              Boolean    @default(true)

  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  supplier            Supplier @relation(fields: [supplierId], references: [id])

  @@index([supplierId])

  @@map("supplier_agreement")
}
```

---

# 3. SupplierProduct

## Purpose

Represents a supplier-specific product mapped to an internal Product.

SupplierProduct is an Aggregate Root.

---

## Prisma Model

```prisma
model SupplierProduct {

  id                    String      @id @default(uuid())

  supplierId            String

  productId             String

  supplierProductCode   String

  supplierProductName   String

  active                Boolean     @default(true)

  lastSynchronizedAt    DateTime?

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  supplier              Supplier @relation(fields: [supplierId], references: [id])

  product               Product @relation(fields: [productId], references: [id])

  availability          Availability[]
  rates                 Rate[]
  offers                Offer[]
  seasons               Season[]

  @@unique([supplierId, supplierProductCode])

  @@index([supplierId])
  @@index([productId])

  @@map("supplier_product")
}
```

---

## Business Rules

Supplier Product

- links supplier inventory to internal catalogue
- owns supplier availability
- owns supplier rates
- owns supplier promotions
- belongs to exactly one Supplier

---

# 4. Availability

## Purpose

Stores supplier availability information.

Availability shall always be considered transient operational data.

---

## Prisma Model

```prisma
model Availability {

  id                   String      @id @default(uuid())

  supplierProductId    String

  availableFrom        DateTime

  availableTo          DateTime

  allocation           Int?

  available            Boolean

  updatedAt            DateTime    @updatedAt

  supplierProduct      SupplierProduct @relation(fields: [supplierProductId], references: [id])

  @@index([supplierProductId])

  @@index([availableFrom])

  @@map("availability")
}
```

---

# 5. Rate

## Purpose

Stores supplier pricing.

Rates are supplier-controlled and may change frequently.

---

## Prisma Model

```prisma
model Rate {

  id                   String      @id @default(uuid())

  supplierProductId    String

  rateCode             String?

  currencyCode         String

  amount               Decimal

  validFrom            DateTime

  validTo              DateTime

  createdAt            DateTime    @default(now())
  updatedAt            DateTime    @updatedAt

  supplierProduct      SupplierProduct @relation(fields: [supplierProductId], references: [id])

  @@index([supplierProductId])

  @@index([validFrom])

  @@map("rate")
}
```

---

# 6. Offer

## Purpose

Represents supplier promotions.

Examples

```text
Early Bird

Stay 3 Pay 2

Long Stay

Seasonal Discount
```

---

## Prisma Model

```prisma
model Offer {

  id                   String      @id @default(uuid())

  supplierProductId    String

  offerCode            String?

  title                String

  description          String?

  validFrom            DateTime

  validTo              DateTime

  active               Boolean @default(true)

  supplierProduct      SupplierProduct @relation(fields: [supplierProductId], references: [id])

  @@index([supplierProductId])

  @@map("offer")
}
```

---

# 7. Season

## Purpose

Represents supplier-defined pricing seasons.

---

## Prisma Model

```prisma
model Season {

  id                   String      @id @default(uuid())

  supplierProductId    String

  seasonCode           String

  name                 String

  startDate            DateTime

  endDate              DateTime

  supplierProduct      SupplierProduct @relation(fields: [supplierProductId], references: [id])

  @@index([supplierProductId])

  @@map("season")
}
```

---

# 8. SynchronisationJob

## Purpose

Represents scheduled synchronisation processes.

Examples

```text
Hotel Import

Availability Sync

Rate Sync

Content Refresh
```

---

## Prisma Model

```prisma
model SynchronisationJob {

  id                  String      @id @default(uuid())

  supplierId          String

  jobType             String

  status              String

  startedAt           DateTime?

  completedAt         DateTime?

  recordsProcessed    Int?

  recordsFailed       Int?

  createdAt           DateTime    @default(now())

  supplier            Supplier @relation(fields: [supplierId], references: [id])

  @@index([supplierId])

  @@index([jobType])

  @@index([status])

  @@map("synchronisation_job")
}
```

---

# 9. ImportBatch

## Purpose

Represents a supplier import execution.

Supports full auditing and recovery.

---

## Prisma Model

```prisma
model ImportBatch {

  id                  String      @id @default(uuid())

  supplierId          String

  batchReference      String      @unique

  startedAt           DateTime

  completedAt         DateTime?

  recordsImported     Int

  recordsRejected     Int

  status              String

  supplier            Supplier @relation(fields: [supplierId], references: [id])

  @@index([supplierId])

  @@index([status])

  @@map("import_batch")
}
```

---

# 10. MappingRule

## Purpose

Defines mapping rules between supplier attributes and internal catalogue fields.

Supports multiple suppliers without changing business logic.

---

## Prisma Model

```prisma
model MappingRule {

  id                    String      @id @default(uuid())

  supplierId            String

  supplierField         String

  internalField         String

  transformationRule    String?

  active                Boolean @default(true)

  supplier              Supplier @relation(fields: [supplierId], references: [id])

  @@index([supplierId])

  @@map("mapping_rule")
}
```

---

# 11. Supplier Domain Compliance Rules

1. Supplier and SupplierProduct shall remain the only Aggregate Roots.

2. Commercial and Catalogue domains shall never communicate directly with supplier APIs.

3. Every SupplierProduct shall map one supplier product to one internal Product.

4. Supplier pricing shall be isolated within the Supplier Domain.

5. Availability shall never become the source of truth for bookings; confirmed reservations belong to the Commercial Domain.

6. Supplier synchronisation shall be fully auditable through SynchronisationJob and ImportBatch entities.

7. MappingRule shall isolate supplier-specific field transformations from business logic.

8. Supplier integrations shall remain provider-agnostic, allowing new suppliers to be added without changes to the Commercial or Catalogue domains.

9. All supplier entities shall conform to the global Prisma standards established in Part 1.

10. The Supplier Domain shall remain fully aligned with SPEC-026 and SPEC-027.

---

# SPEC-028 – Prisma Data Model

# Part 5 – Financial Domain Models

## Purpose

This section defines the Prisma implementation of the **Financial Domain**.

The Financial Domain is responsible for managing all monetary transactions throughout the Go Cape Tours platform.

Its responsibilities include:

- currencies
- exchange rates
- taxation
- payments
- payment allocation
- invoices
- credit notes
- refunds
- financial adjustments
- reconciliation

The Financial Domain shall remain independent of supplier-specific financial implementations while providing a consistent commercial accounting model for the platform.

---

# Financial Domain Overview

## Aggregate Roots

The Financial Domain contains the following Aggregate Roots.

```text
Currency

Payment

Invoice
```

Supporting entities

```text
ExchangeRate

TaxRate

PaymentMethod

PaymentAllocation

Refund

FinancialAdjustment

CreditNote

FinancialReconciliation
```

Relationship overview

```text
Currency
     │
     ├──────── Exchange Rate
     │
     └──────── Tax Rate

Booking
     │
     ▼
 Invoice
     │
     ▼
 Payment
     │
     ├──────── Payment Allocation
     │
     ├──────── Refund
     │
     └──────── Financial Adjustment

Invoice
     │
     ▼
Credit Note

Financial Reconciliation
```

---

# 1. Currency

## Purpose

Represents an ISO 4217 currency supported by the platform.

Currency is an Aggregate Root.

---

## Prisma Model

```prisma
model Currency {

  id              String     @id @default(uuid())

  code            String     @unique

  name            String

  symbol          String?

  decimalPlaces   Int        @default(2)

  active          Boolean    @default(true)

  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  exchangeRates   ExchangeRate[]

  @@index([code])

  @@map("currency")
}
```

---

## Business Rules

Currency:

- shall use ISO 4217 codes
- shall be reusable across all domains
- shall never be duplicated

---

# 2. ExchangeRate

## Purpose

Stores exchange rates between currencies.

---

## Prisma Model

```prisma
model ExchangeRate {

  id                 String     @id @default(uuid())

  fromCurrencyId     String

  toCurrencyId       String

  exchangeRate       Decimal

  effectiveDate      DateTime

  createdAt          DateTime   @default(now())

  fromCurrency       Currency @relation("ExchangeRateFrom", fields: [fromCurrencyId], references: [id])

  toCurrency         Currency @relation("ExchangeRateTo", fields: [toCurrencyId], references: [id])

  @@unique([fromCurrencyId, toCurrencyId, effectiveDate])

  @@map("exchange_rate")
}
```

---

# 3. TaxRate

## Purpose

Represents taxation rules applicable to bookings and invoices.

---

## Prisma Model

```prisma
model TaxRate {

  id                String     @id @default(uuid())

  taxCode           String     @unique

  description       String?

  percentage        Decimal

  effectiveFrom     DateTime

  effectiveTo       DateTime?

  active            Boolean @default(true)

  createdAt         DateTime @default(now())

  @@index([taxCode])

  @@map("tax_rate")
}
```

---

# 4. PaymentMethod

## Purpose

Represents supported payment methods.

Examples

```text
Credit Card

EFT

PayGate

PayFast

Stripe

Apple Pay

Google Pay
```

---

## Prisma Model

```prisma
model PaymentMethod {

  id                String     @id @default(uuid())

  code              String     @unique

  name              String

  provider          String?

  active            Boolean @default(true)

  payments          Payment[]

  @@map("payment_method")
}
```

---

# 5. Payment

## Purpose

Represents a customer payment.

Payment is an Aggregate Root.

---

## Prisma Model

```prisma
model Payment {

  id                    String      @id @default(uuid())

  bookingId             String

  paymentMethodId       String

  paymentReference      String      @unique

  transactionReference  String?

  amount                Decimal

  currencyCode          String

  paymentStatus         String

  paymentDate           DateTime

  receivedAt            DateTime?

  gatewayResponse       Json?

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  booking               Booking @relation(fields: [bookingId], references: [id])

  paymentMethod         PaymentMethod @relation(fields: [paymentMethodId], references: [id])

  allocations           PaymentAllocation[]

  refunds              Refund[]

  adjustments          FinancialAdjustment[]

  @@index([bookingId])

  @@index([paymentStatus])

  @@index([paymentDate])

  @@map("payment")
}
```

---

## Business Rules

Payment:

- belongs to one Booking
- references one Payment Method
- may have multiple allocations
- may have multiple refunds
- is immutable after successful settlement

---

# 6. PaymentAllocation

## Purpose

Represents allocation of a payment to one or more invoices.

---

## Prisma Model

```prisma
model PaymentAllocation {

  id                  String      @id @default(uuid())

  paymentId           String

  invoiceId           String

  allocatedAmount     Decimal

  allocatedAt         DateTime    @default(now())

  payment             Payment @relation(fields: [paymentId], references: [id])

  invoice             Invoice @relation(fields: [invoiceId], references: [id])

  @@unique([paymentId, invoiceId])

  @@map("payment_allocation")
}
```

---

# 7. Refund

## Purpose

Represents a customer refund.

---

## Prisma Model

```prisma
model Refund {

  id                  String      @id @default(uuid())

  paymentId           String

  refundReference     String      @unique

  amount              Decimal

  refundReason        String?

  refundedAt          DateTime

  status              String

  payment             Payment @relation(fields: [paymentId], references: [id])

  @@index([paymentId])

  @@map("refund")
}
```

---

# 8. FinancialAdjustment

## Purpose

Represents manual financial adjustments.

Examples

```text
Goodwill Credit

Manual Correction

Rounding Difference

Supplier Adjustment
```

---

## Prisma Model

```prisma
model FinancialAdjustment {

  id                    String      @id @default(uuid())

  paymentId             String

  adjustmentType        String

  amount                Decimal

  reason                String?

  adjustedAt            DateTime

  payment               Payment @relation(fields: [paymentId], references: [id])

  @@index([paymentId])

  @@map("financial_adjustment")
}
```

---

# 9. Invoice

## Purpose

Represents a commercial invoice issued to a customer.

Invoice is an Aggregate Root.

---

## Prisma Model

```prisma
model Invoice {

  id                   String      @id @default(uuid())

  bookingId            String

  invoiceNumber        String      @unique

  invoiceDate          DateTime

  dueDate              DateTime?

  subtotal             Decimal

  taxAmount            Decimal

  totalAmount          Decimal

  invoiceStatus        String

  createdAt            DateTime    @default(now())
  updatedAt            DateTime    @updatedAt

  booking              Booking @relation(fields: [bookingId], references: [id])

  allocations          PaymentAllocation[]

  creditNotes          CreditNote[]

  @@index([bookingId])

  @@index([invoiceStatus])

  @@map("invoice")
}
```

---

# 10. CreditNote

## Purpose

Represents a reduction or cancellation of an Invoice.

---

## Prisma Model

```prisma
model CreditNote {

  id                   String      @id @default(uuid())

  invoiceId            String

  creditNoteNumber     String      @unique

  amount               Decimal

  reason               String?

  issuedAt             DateTime

  invoice              Invoice @relation(fields: [invoiceId], references: [id])

  @@index([invoiceId])

  @@map("credit_note")
}
```

---

# 11. FinancialReconciliation

## Purpose

Represents reconciliation of financial activity.

Supports:

- payment reconciliation
- supplier reconciliation
- accounting reconciliation
- month-end closing

---

## Prisma Model

```prisma
model FinancialReconciliation {

  id                  String      @id @default(uuid())

  reconciliationDate  DateTime

  reconciliationType  String

  status              String

  processedRecords    Int

  discrepancies       Int

  notes               String?

  createdAt           DateTime    @default(now())

  @@index([reconciliationDate])

  @@index([status])

  @@map("financial_reconciliation")
}
```

---

# 12. Financial Domain Compliance Rules

1. Currency, Payment and Invoice shall remain the Aggregate Roots of the Financial Domain.

2. All monetary values shall use Prisma `Decimal`.

3. Currency codes shall conform to ISO 4217.

4. Payments shall always reference a Booking and a Payment Method.

5. Payment allocations shall provide a complete audit trail between payments and invoices.

6. Refunds shall never modify the original payment; they shall be recorded as separate financial events.

7. Credit Notes shall never modify the original invoice; they shall provide an auditable financial adjustment.

8. Exchange rates shall be versioned by effective date.

9. Financial reconciliation shall remain independent of payment processing and provide a complete audit history.

10. All Financial Domain models shall comply with the global Prisma standards established in Part 1 and remain fully aligned with SPEC-026 and SPEC-027.

---

# SPEC-028 – Prisma Data Model

# Part 6 – Operations Domain Models

## Purpose

This section defines the Prisma implementation of the **Operations Domain**.

The Operations Domain is responsible for planning, scheduling, allocating and executing the services sold by the Commercial Domain.

Unlike the Commercial Domain, which manages the customer's purchase, the Operations Domain manages **how that purchase is delivered**.

This domain is intentionally independent from supplier integrations and financial processing.

---

# Operations Domain Overview

## Aggregate Roots

The Operations Domain contains the following Aggregate Roots.

```text
Itinerary

Vehicle

Driver

Guide

Trailer
```

Supporting entities

```text
ItineraryDay

ItineraryItem

ResourceAssignment

OperationalSchedule

TourExecution

OperationalNote
```

Relationship overview

```text
Booking
    │
    ▼
Itinerary
    │
    ├──────── Itinerary Day
    │              │
    │              ▼
    │        Itinerary Item
    │
    ├──────── Resource Assignment
    │
    ├──────── Operational Schedule
    │
    ├──────── Tour Execution
    │
    └──────── Operational Note

Vehicle

Driver

Guide

Trailer
        │
        └──────── Resource Assignment
```

---

# 1. Itinerary

## Purpose

Represents the operational itinerary created for a confirmed booking.

Itinerary is an Aggregate Root.

---

## Prisma Model

```prisma
model Itinerary {

  id                 String      @id @default(uuid())

  bookingId          String       @unique

  itineraryNumber    String       @unique

  title              String

  startDate          DateTime

  endDate            DateTime

  status             String

  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  createdBy          String?
  updatedBy          String?

  booking            Booking @relation(fields: [bookingId], references: [id])

  days               ItineraryDay[]

  assignments        ResourceAssignment[]

  schedules          OperationalSchedule[]

  executions         TourExecution[]

  notes              OperationalNote[]

  @@index([bookingId])
  @@index([status])

  @@map("itinerary")
}
```

---

## Business Rules

An Itinerary:

- belongs to one Booking
- owns itinerary planning
- owns operational execution records
- remains the operational source of truth

---

# 2. ItineraryDay

## Purpose

Represents one day within an itinerary.

---

## Prisma Model

```prisma
model ItineraryDay {

  id                String      @id @default(uuid())

  itineraryId       String

  dayNumber         Int

  title             String?

  description       String?

  travelDate        DateTime

  itinerary         Itinerary @relation(fields: [itineraryId], references: [id])

  items             ItineraryItem[]

  @@unique([itineraryId, dayNumber])

  @@index([itineraryId])

  @@map("itinerary_day")
}
```

---

# 3. ItineraryItem

## Purpose

Represents an activity, accommodation, transfer or event scheduled within an itinerary day.

---

## Prisma Model

```prisma
model ItineraryItem {

  id                 String      @id @default(uuid())

  itineraryDayId     String

  productId          String?

  startTime          DateTime?

  endTime            DateTime?

  sequence           Int

  description        String?

  location           String?

  itineraryDay       ItineraryDay @relation(fields: [itineraryDayId], references: [id])

  @@index([itineraryDayId])

  @@index([sequence])

  @@map("itinerary_item")
}
```

---

# 4. Vehicle

## Purpose

Represents a vehicle available for tour operations.

Vehicle is an Aggregate Root.

---

## Prisma Model

```prisma
model Vehicle {

  id                  String      @id @default(uuid())

  registrationNumber  String      @unique

  description         String

  manufacturer        String?

  model               String?

  seatingCapacity     Int

  active              Boolean     @default(true)

  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt

  assignments         ResourceAssignment[]

  @@index([registrationNumber])

  @@map("vehicle")
}
```

---

## Business Rules

Vehicle:

- remains an independent Aggregate Root
- is assigned through ResourceAssignment
- is never owned by an Itinerary

---

# 5. Driver

## Purpose

Represents a driver employed or contracted by Go Cape Tours.

Driver is an Aggregate Root.

---

## Prisma Model

```prisma
model Driver {

  id                 String      @id @default(uuid())

  employeeNumber     String?     @unique

  firstName          String

  lastName           String

  mobileNumber       String?

  driversLicence     String?

  active             Boolean     @default(true)

  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt

  assignments        ResourceAssignment[]

  @@index([employeeNumber])

  @@map("driver")
}
```

---

# 6. Guide

## Purpose

Represents a tour guide.

Guide is an Aggregate Root.

---

## Prisma Model

```prisma
model Guide {

  id                 String      @id @default(uuid())

  employeeNumber     String?     @unique

  firstName          String

  lastName           String

  languages          Json?

  guideRegistration  String?

  active             Boolean     @default(true)

  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt

  assignments        ResourceAssignment[]

  @@index([employeeNumber])

  @@map("guide")
}
```

---

# 7. Trailer

## Purpose

Represents a trailer available for operational use.

Trailer is an Aggregate Root.

---

## Prisma Model

```prisma
model Trailer {

  id                    String      @id @default(uuid())

  registrationNumber    String?     @unique

  description           String

  trailerType           String?

  active                Boolean     @default(true)

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  assignments           ResourceAssignment[]

  @@map("trailer")
}
```

---

# 8. ResourceAssignment

## Purpose

Represents the allocation of operational resources to an itinerary.

---

## Prisma Model

```prisma
model ResourceAssignment {

  id                 String      @id @default(uuid())

  itineraryId        String

  vehicleId          String?

  driverId           String?

  guideId            String?

  trailerId          String?

  assignedFrom       DateTime

  assignedTo         DateTime?

  assignmentStatus   String

  itinerary          Itinerary @relation(fields: [itineraryId], references: [id])

  vehicle            Vehicle? @relation(fields: [vehicleId], references: [id])

  driver             Driver? @relation(fields: [driverId], references: [id])

  guide              Guide? @relation(fields: [guideId], references: [id])

  trailer            Trailer? @relation(fields: [trailerId], references: [id])

  @@index([itineraryId])

  @@index([assignmentStatus])

  @@map("resource_assignment")
}
```

---

## Business Rules

Resources remain independent Aggregate Roots.

Assignments provide the operational relationship.

---

# 9. OperationalSchedule

## Purpose

Represents operational scheduling for itinerary execution.

---

## Prisma Model

```prisma
model OperationalSchedule {

  id                 String      @id @default(uuid())

  itineraryId        String

  scheduledStart     DateTime

  scheduledFinish    DateTime

  scheduleStatus     String

  itinerary          Itinerary @relation(fields: [itineraryId], references: [id])

  @@index([itineraryId])

  @@index([scheduledStart])

  @@map("operational_schedule")
}
```

---

# 10. TourExecution

## Purpose

Represents the actual execution of an itinerary.

Supports operational tracking and post-tour reporting.

---

## Prisma Model

```prisma
model TourExecution {

  id                  String      @id @default(uuid())

  itineraryId         String

  startedAt           DateTime?

  completedAt         DateTime?

  executionStatus     String

  kilometresTravelled Decimal?

  customerFeedback    String?

  itinerary           Itinerary @relation(fields: [itineraryId], references: [id])

  @@index([itineraryId])

  @@index([executionStatus])

  @@map("tour_execution")
}
```

---

# 11. OperationalNote

## Purpose

Represents operational notes recorded during planning or execution.

---

## Prisma Model

```prisma
model OperationalNote {

  id                 String      @id @default(uuid())

  itineraryId        String

  noteType           String

  note               String

  createdAt          DateTime    @default(now())

  createdBy          String?

  itinerary          Itinerary @relation(fields: [itineraryId], references: [id])

  @@index([itineraryId])

  @@map("operational_note")
}
```

---

# 12. Operations Domain Compliance Rules

1. Itinerary, Vehicle, Driver, Guide and Trailer shall remain independent Aggregate Roots.

2. ResourceAssignment shall be the only mechanism used to allocate operational resources.

3. Operational resources shall never be owned directly by an Itinerary.

4. Every Itinerary shall belong to exactly one Booking.

5. Every ItineraryDay shall belong to exactly one Itinerary.

6. Every ItineraryItem shall belong to exactly one ItineraryDay.

7. Operational scheduling and execution shall remain separate concepts.

8. Operational notes shall provide an immutable audit history of operational decisions and events.

9. All Operations Domain models shall comply with the global Prisma standards established in Part 1.

10. The Operations Domain shall remain fully aligned with SPEC-026 and SPEC-027, preserving the aggregate boundaries approved in the Canonical Logical Data Model.

---

# SPEC-028 – Prisma Data Model

# Part 7 – Platform Domain Models

## Purpose

This section defines the Prisma implementation of the **Platform Domain**.

The Platform Domain provides the shared platform capabilities required by every business domain while remaining independent of the Commercial, Catalogue, Supplier, Financial and Operations domains.

Its responsibilities include:

- authentication
- authorization
- document management
- notifications
- workflow events
- auditing
- integration endpoint configuration
- platform configuration

These capabilities are infrastructure services that support the platform without owning business processes.

---

# Platform Domain Overview

## Aggregate Roots

The Platform Domain contains the following Aggregate Roots.

```text
User

Role

Document

Notification

WorkflowEvent

AuditRecord

IntegrationEndpoint

SystemConfiguration
```

Supporting entities

```text
Permission

UserRole

RolePermission

DocumentTemplate

NotificationTemplate
```

Relationship overview

```text
User
 │
 ├──────── UserRole
 │             │
 │             ▼
 │            Role
 │             │
 │             ▼
 │      RolePermission
 │             │
 │             ▼
 │        Permission
 │
 ├──────── Document
 │              │
 │              ▼
 │      DocumentTemplate
 │
 ├──────── Notification
 │              │
 │              ▼
 │    NotificationTemplate
 │
 ├──────── WorkflowEvent
 │
 └──────── AuditRecord

IntegrationEndpoint

SystemConfiguration
```

---

# 1. User

## Purpose

Represents a platform user.

A User may represent:

- administrator
- reservations consultant
- operations staff
- finance staff
- marketing staff
- API/service account

User is an Aggregate Root.

---

## Prisma Model

```prisma
model User {

  id                    String      @id @default(uuid())

  username              String      @unique

  email                 String      @unique

  firstName             String

  lastName              String

  passwordHash          String

  active                Boolean     @default(true)

  lastLoginAt           DateTime?

  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  roles                 UserRole[]

  documents             Document[]

  notifications         Notification[]

  workflowEvents        WorkflowEvent[]

  auditRecords          AuditRecord[]

  @@index([username])

  @@index([email])

  @@map("platform_user")
}
```

---

## Business Rules

User:

- authenticates into the platform
- owns security identity
- may hold multiple Roles
- shall never contain business permissions directly

---

# 2. Role

## Purpose

Represents a platform security role.

Role is an Aggregate Root.

---

## Prisma Model

```prisma
model Role {

  id                 String      @id @default(uuid())

  roleCode           String      @unique

  name               String

  description        String?

  active             Boolean     @default(true)

  createdAt          DateTime    @default(now())

  users              UserRole[]

  permissions        RolePermission[]

  @@index([roleCode])

  @@map("role")
}
```

---

# 3. Permission

## Purpose

Represents a discrete platform permission.

Examples

```text
BOOKING_CREATE

BOOKING_UPDATE

PAYMENT_APPROVE

USER_MANAGE

SUPPLIER_SYNC
```

---

## Prisma Model

```prisma
model Permission {

  id                  String      @id @default(uuid())

  permissionCode      String      @unique

  description         String?

  roles               RolePermission[]

  @@index([permissionCode])

  @@map("permission")
}
```

---

# 4. UserRole

## Purpose

Explicit junction between Users and Roles.

---

## Prisma Model

```prisma
model UserRole {

  id                String      @id @default(uuid())

  userId            String

  roleId            String

  assignedAt        DateTime    @default(now())

  user              User @relation(fields: [userId], references: [id])

  role              Role @relation(fields: [roleId], references: [id])

  @@unique([userId, roleId])

  @@map("user_role")
}
```

---

# 5. RolePermission

## Purpose

Explicit junction between Roles and Permissions.

---

## Prisma Model

```prisma
model RolePermission {

  id                String      @id @default(uuid())

  roleId            String

  permissionId      String

  role              Role @relation(fields: [roleId], references: [id])

  permission        Permission @relation(fields: [permissionId], references: [id])

  @@unique([roleId, permissionId])

  @@map("role_permission")
}
```

---

# 6. Document

## Purpose

Represents metadata for platform documents.

Examples

```text
Invoices

Travel Documents

Vouchers

Terms & Conditions

Supplier Contracts

Customer Attachments
```

Document content shall be stored in external object storage. The database stores metadata only.

Document is an Aggregate Root.

---

## Prisma Model

```prisma
model Document {

  id                  String      @id @default(uuid())

  userId              String?

  documentType        String

  fileName            String

  storageKey          String

  mimeType            String

  fileSize            Int

  uploadedAt          DateTime    @default(now())

  user                User? @relation(fields: [userId], references: [id])

  @@index([documentType])

  @@map("document")
}
```

---

# 7. DocumentTemplate

## Purpose

Represents reusable document templates.

---

## Prisma Model

```prisma
model DocumentTemplate {

  id                  String      @id @default(uuid())

  templateCode        String      @unique

  name                String

  templatePath        String

  active              Boolean     @default(true)

  @@map("document_template")
}
```

---

# 8. Notification

## Purpose

Represents a platform notification.

Notification is an Aggregate Root.

---

## Prisma Model

```prisma
model Notification {

  id                  String      @id @default(uuid())

  userId              String

  notificationType    String

  subject             String

  message             String

  readAt              DateTime?

  createdAt           DateTime    @default(now())

  user                User @relation(fields: [userId], references: [id])

  @@index([userId])

  @@index([notificationType])

  @@map("notification")
}
```

---

# 9. NotificationTemplate

## Purpose

Represents reusable notification templates.

---

## Prisma Model

```prisma
model NotificationTemplate {

  id                  String      @id @default(uuid())

  templateCode        String      @unique

  name                String

  subjectTemplate     String

  bodyTemplate        String

  active              Boolean @default(true)

  @@map("notification_template")
}
```

---

# 10. WorkflowEvent

## Purpose

Represents workflow events generated throughout the platform.

WorkflowEvent is an Aggregate Root.

---

## Prisma Model

```prisma
model WorkflowEvent {

  id                  String      @id @default(uuid())

  userId              String?

  workflowType        String

  entityType          String

  entityId            String

  eventType           String

  occurredAt          DateTime    @default(now())

  payload             Json?

  user                User? @relation(fields: [userId], references: [id])

  @@index([entityType, entityId])

  @@index([workflowType])

  @@map("workflow_event")
}
```

---

# 11. AuditRecord

## Purpose

Represents immutable platform audit events.

AuditRecord is an Aggregate Root.

---

## Prisma Model

```prisma
model AuditRecord {

  id                  String      @id @default(uuid())

  userId              String?

  entityType          String

  entityId            String

  action              String

  oldValues           Json?

  newValues           Json?

  ipAddress           String?

  createdAt           DateTime    @default(now())

  user                User? @relation(fields: [userId], references: [id])

  @@index([entityType, entityId])

  @@index([createdAt])

  @@map("audit_record")
}
```

---

# 12. IntegrationEndpoint

## Purpose

Represents configuration for external integrations.

IntegrationEndpoint is an Aggregate Root.

---

## Prisma Model

```prisma
model IntegrationEndpoint {

  id                  String      @id @default(uuid())

  endpointCode        String      @unique

  provider            String

  baseUrl             String

  authenticationType  String

  active              Boolean     @default(true)

  timeoutSeconds      Int          @default(30)

  retryCount          Int          @default(3)

  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt

  @@index([provider])

  @@map("integration_endpoint")
}
```

---

# 13. SystemConfiguration

## Purpose

Represents configurable platform settings.

SystemConfiguration is an Aggregate Root.

---

## Prisma Model

```prisma
model SystemConfiguration {

  id                  String      @id @default(uuid())

  configurationKey    String      @unique

  configurationValue  String

  category            String?

  encrypted           Boolean     @default(false)

  updatedAt           DateTime    @updatedAt

  @@index([category])

  @@map("system_configuration")
}
```

---

# 14. Platform Domain Compliance Rules

1. User, Role, Document, Notification, WorkflowEvent, AuditRecord, IntegrationEndpoint and SystemConfiguration shall remain the Aggregate Roots of the Platform Domain.

2. Authentication shall be based on Users; authorization shall be based exclusively on Roles and Permissions.

3. Direct User-to-Permission relationships are prohibited.

4. Many-to-many relationships shall use explicit junction models (`UserRole` and `RolePermission`).

5. Documents shall store metadata only; binary content shall reside in external object storage.

6. Audit records shall be immutable and retained for the platform's audit policy.

7. Workflow events shall represent business and technical events without becoming the source of truth for business entities.

8. IntegrationEndpoint shall centralize external system configuration and shall not contain secrets; sensitive credentials shall be managed through secure secret storage.

9. SystemConfiguration shall contain non-sensitive runtime configuration and comply with the platform's configuration management policies.

10. All Platform Domain models shall comply with the global Prisma standards established in Part 1 and remain fully aligned with SPEC-026 and SPEC-027.

---

# SPEC-028 – Prisma Data Model

# Part 8 – Cross-Domain Relationships & Shared Prisma Standards

## Purpose

This section defines the global implementation standards governing relationships between Prisma models across all business domains.

While Parts 2–7 define individual domain models, this section ensures those models interact consistently, predictably and in accordance with the Domain-Driven Design principles established in SPEC-026 and the Physical Data Model defined in SPEC-027.

This section is mandatory for all future Prisma development.

---

# 1. Cross-Domain Relationship Principles

The Prisma model shall preserve the architectural boundaries defined by the domain model.

Relationships shall be:

- explicit
- directional
- aggregate-safe
- predictable
- implementation independent

No relationship shall violate Aggregate ownership.

---

## Relationship Hierarchy

```text
Commercial
        │
        ├──────── Catalogue
        │
        ├──────── Supplier
        │
        ├──────── Financial
        │
        ├──────── Operations
        │
        ▼
Platform
```

Platform services support every domain but never own business entities.

---

# 2. Aggregate Boundary Rules

Each Aggregate Root owns its internal entities.

External aggregates shall only reference the Aggregate Root.

Example

Correct

```text
Booking
      │
      ▼
Customer
```

Incorrect

```text
Booking
      │
      ▼
Traveller
```

Traveller belongs to the Customer Aggregate and shall never become an externally referenced Aggregate Root.

---

## Approved Aggregate Roots

### Commercial

- Customer
- Quote
- Booking

### Catalogue

- Product
- ProductType
- Destination

### Supplier

- Supplier
- SupplierProduct

### Financial

- Currency
- Payment
- Invoice

### Operations

- Itinerary
- Vehicle
- Driver
- Guide
- Trailer

### Platform

- User
- Role
- Document
- Notification
- WorkflowEvent
- AuditRecord
- IntegrationEndpoint
- SystemConfiguration

---

# 3. Cross-Domain Relationship Matrix

| Source Domain | Target Domain | Allowed |
|---------------|---------------|---------|
| Commercial | Catalogue | Yes |
| Commercial | Supplier | Via SupplierProduct only |
| Commercial | Financial | Yes |
| Commercial | Operations | Yes |
| Commercial | Platform | User references only |
| Catalogue | Supplier | Yes |
| Catalogue | Financial | No |
| Catalogue | Operations | No |
| Supplier | Catalogue | Yes |
| Supplier | Financial | No |
| Supplier | Operations | No |
| Financial | Commercial | Yes |
| Operations | Commercial | Yes |
| Platform | All Domains | Infrastructure support only |

---

# 4. Prisma Relation Standards

Every relationship shall be explicitly defined.

Example

```prisma
booking Customer @relation(
    fields: [customerId],
    references: [id]
)
```

Implicit relationships are prohibited.

---

# 5. Relation Naming Standards

Bidirectional relationships shall use meaningful names.

Preferred examples

```text
customer.bookings

booking.customer

booking.items

item.booking

supplier.products

product.supplierProducts
```

Avoid generic names such as:

```text
records

children

objects

list
```

---

# 6. Referential Action Standards

The platform shall use explicit referential actions for all relationships.

## Delete Policy

| Relationship | Action |
|-------------|--------|
| Aggregate Root → Child | Restrict |
| Lookup → Business Entity | Restrict |
| Junction Table | Cascade |
| Audit Records | Restrict |
| Workflow Events | Restrict |
| Documents | Restrict |

No implicit database defaults shall be relied upon.

---

## Example

```prisma
customer Customer
    @relation(
        fields: [customerId],
        references: [id],
        onDelete: Restrict,
        onUpdate: Cascade
    )
```

---

# 7. Cascade Standards

Cascade Delete shall only be permitted for explicit junction entities.

Examples

```text
UserRole

RolePermission

ProductProductCategory

PackageProduct
```

Business entities shall never cascade delete across aggregate boundaries.

---

# 8. Optional Relationship Policy

Optional relationships shall be used only where business rules allow missing associations.

Examples

Allowed

```text
Guide Assignment

Trailer Assignment

Supplier Code

Completed Date
```

Not Allowed

```text
Booking Customer

Invoice Booking

Payment Booking

Product Type
```

Mandatory business relationships shall never be nullable.

---

# 9. JSON Usage Standards

JSON fields shall be reserved for flexible or externally sourced structures.

Approved examples

```text
Gateway Responses

Supplier Payloads

Workflow Payloads

Audit Snapshots

Language Collections
```

JSON shall not replace relational modelling.

---

# 10. Decimal Standards

All monetary values shall use Prisma `Decimal`.

Examples

```text
Booking Total

Payment Amount

Invoice Total

Tax Amount

Exchange Rate

Supplier Rate
```

Floating-point types (`Float`) shall never be used for financial calculations.

---

# 11. Enum Strategy

Lookup tables are preferred over Prisma enums.

Approved lookup entities include:

- Currency
- TaxRate
- ProductType
- ProductCategory

Prisma enums may be used only for stable technical values with negligible change frequency.

---

# 12. Auditing Standards

Every Aggregate Root shall include the standard audit fields.

```prisma
createdAt DateTime @default(now())

updatedAt DateTime @updatedAt
```

Where ownership tracking is required, models shall also include:

```prisma
createdBy String?

updatedBy String?

deletedAt DateTime?

deletedBy String?
```

Audit consistency shall be maintained across all domains.

---

# 13. Soft Delete Policy

Business entities shall use soft deletion.

Example

```prisma
deletedAt DateTime?

deletedBy String?
```

Physical deletion shall be restricted to:

- seed data
- migration corrections
- temporary staging tables

---

# 14. Shared Indexing Standards

Minimum indexing requirements:

Primary Keys

```text
id
```

Business Identifiers

```text
bookingNumber

invoiceNumber

productCode

supplierCode

username
```

Foreign Keys

```text
bookingId

customerId

supplierId

productId
```

Operational Dates

```text
travelDate

paymentDate

scheduledStart
```

Composite indexes shall be created only where supported by documented query patterns.

---

# 15. Schema Organization Standards

The Prisma schema shall remain logically grouped by domain.

Recommended order:

```text
Datasource

Generator

Commercial

Catalogue

Supplier

Financial

Operations

Platform

Shared Views (future)

Comments

Extensions
```

Models shall not be ordered alphabetically.

They shall be ordered according to architectural dependencies.

---

# 16. File Organization Standards

For larger implementations, the logical ownership of models shall follow the domain structure.

```text
prisma/

    schema.prisma

    domains/

        commercial/

        catalogue/

        supplier/

        financial/

        operations/

        platform/

    migrations/

    seed.ts
```

Where Prisma requires a single generated schema, domain-specific source files may be combined during the build process.

---

# 17. Cross-Domain Implementation Rules

1. Every relationship shall be explicitly defined with `@relation`.

2. Aggregate boundaries shall never be violated.

3. External domains shall reference Aggregate Roots only.

4. Junction entities shall be used for all many-to-many relationships.

5. Referential actions shall be explicitly declared.

6. Cascade delete shall be limited to junction entities.

7. Monetary values shall always use `Decimal`.

8. Flexible external payloads shall use `Json`.

9. Audit fields shall remain consistent across every Aggregate Root.

10. Soft deletion shall be used for business entities.

11. Models shall be grouped by domain rather than alphabetically.

12. The Prisma implementation shall remain fully traceable to SPEC-026 and SPEC-027.

---

# 18. Specification Completion Statement

With the completion of Parts 1 through 8, the Prisma Data Model now provides:

- Global Prisma architecture
- Project conventions
- Domain-specific models
- Cross-domain relationship rules
- Referential integrity standards
- Shared implementation conventions
- Schema organization guidelines
- Production-ready modelling principles

This specification forms the authoritative implementation blueprint for the Go Cape Tours persistence layer.

---