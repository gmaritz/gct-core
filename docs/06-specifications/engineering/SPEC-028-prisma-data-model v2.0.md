# SPEC-028 — Prisma Data Model

## Document Control

| Field | Value |
|---|---|
| Document ID | SPEC-028 |
| Title | Prisma Data Model |
| Version | 2.0 |
| Status | Draft — Architect Review Required |
| Classification | Implementation Specification |
| Owner | GCT Core System Architecture |
| Project | GCT Core |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS.md |
| Architectural Authority | ARCH-000 |
| Semantic Decision | ADR-001 — Booking, Reservation and Supplier Booking Semantics |
| Logical Model | SPEC-026 v2.0 |
| Physical Model | SPEC-027 v2.0 |
| Downstream | SPEC-029 — Repository & Persistence Architecture |

---

# 1. Purpose

This specification defines the canonical Prisma implementation of the PostgreSQL physical data model defined by SPEC-027 v2.0.

Prisma SHALL be a faithful implementation of:

    SPEC-026
        ↓
    SPEC-027
        ↓
    SPEC-028
        ↓
    PostgreSQL

SPEC-028 SHALL NOT introduce business concepts, aggregate boundaries or persistence structures that are not supported by SPEC-026 and SPEC-027.

The primary reconciliation in this revision is the distinction between:

- Booking;
- Reservation;
- Booking Item;
- Supplier Booking;
- Go Cape internal fulfilment.

---

# 2. Governing Process

This specification is produced under:

`GOV-DEV-001-DEVELOPMENT-PROCESS.md`

The specification is the implementation contract for the Prisma model.

Implementation SHALL NOT begin until this specification has been architecturally approved.

The implementation workflow remains:

Specification
→ Architect Review / Approval
→ Implementation by Copilot
→ Focused Tests + Regression
→ Copilot Report
→ Architect Acceptance
→ User Commit

Any Copilot implementation/verification prompt associated with this specification SHALL explicitly reference and instruct Copilot to follow `GOV-DEV-001-DEVELOPMENT-PROCESS.md`.

---

# 3. Scope

## 3.1 Included

This specification defines:

- Prisma datasource;
- Prisma Client generator;
- global Prisma conventions;
- model naming;
- field naming;
- UUIDs;
- timestamps;
- audit fields;
- relationships;
- indexes;
- unique constraints;
- referential actions;
- lookup/reference models;
- Reservation persistence;
- Booking persistence;
- Booking Item persistence;
- Supplier Booking persistence;
- snapshot persistence;
- cross-domain relationships;
- migration requirements;
- Prisma validation requirements.

## 3.2 Excluded

This specification does not define:

- application services;
- API endpoints;
- DTOs;
- domain behaviour;
- supplier API calls;
- supplier credentials;
- payment-provider implementation;
- QuickBooks integration;
- repository implementation;
- production database deployment;
- speculative schema optimisation.

---

# 4. Authoritative Sources

Prisma SHALL follow the following authority order:

1. ADR-001 — Booking, Reservation and Supplier Booking Semantics
2. SPEC-026 v2.0 — Canonical Logical Data Model
3. SPEC-027 v2.0 — Physical Data Model
4. Existing accepted application contracts
5. Existing repository conventions where they do not conflict with the above

A historical Prisma model SHALL NOT override an approved architectural decision.

Where the current Prisma schema conflicts with SPEC-027 v2.0, the schema SHALL be corrected rather than the specification silently changed.

---

# 5. Prisma Architecture

## 5.1 Datasource

The database provider SHALL be PostgreSQL.

The datasource SHALL obtain its connection string from the existing environment configuration.

Credentials SHALL NOT be committed to source control.

## 5.2 Generator

The repository SHALL continue using the established Prisma Client generator and output conventions.

No new generator SHALL be introduced by this iteration.

## 5.3 Schema

The canonical Prisma schema SHALL remain the repository's authoritative Prisma representation of SPEC-027.

The schema SHALL remain logically organised by domain.

---

# 6. Global Prisma Standards

## 6.1 Model Naming

Prisma models SHALL use PascalCase.

Examples:

    Customer
    Booking
    Reservation
    BookingItem
    SupplierBooking

## 6.2 Field Naming

Prisma fields SHALL use camelCase.

Examples:

    customerId
    reservationNumber
    bookingStartDate
    createdAt

## 6.3 Database Naming

Database tables and columns SHALL use the physical snake_case naming defined by SPEC-027.

Prisma SHALL use:

    @@map("table_name")

and:

    @map("column_name")

where required.

## 6.4 Primary Keys

Business models SHALL use UUID technical identities.

Canonical pattern:

    id String @id @default(uuid())

Technical identity SHALL remain distinct from business identifiers.

## 6.5 Timestamps

Timestamp fields SHALL use Prisma `DateTime`.

Existing repository conventions for PostgreSQL timestamp precision and timezone handling SHALL be preserved.

Application timestamps SHALL remain UTC.

## 6.6 Monetary Values

Monetary values SHALL use Prisma `Decimal`.

Floating-point types SHALL NOT be used for money.

## 6.7 Relationships

All relationships SHALL be explicitly declared.

Implicit many-to-many relationships SHALL NOT be used.

## 6.8 Many-to-Many

Many-to-many relationships SHALL use explicit junction models.

## 6.9 Indexes

Indexes SHALL implement the requirements defined by SPEC-027.

No speculative indexes SHALL be introduced.

## 6.10 Unique Constraints

Business identifiers requiring uniqueness SHALL use Prisma unique constraints.

At minimum:

    Reservation.reservationNumber
    Booking.bookingNumber
    Quote.quoteNumber

shall remain unique where defined by the physical model.

---

# 7. Audit Standards

Transactional models SHALL use the established repository audit convention.

Where applicable:

    createdAt
    updatedAt
    createdBy
    updatedBy

Soft-delete models may additionally contain:

    deletedAt
    deletedBy

The implementation SHALL preserve existing repository conventions for models where audit fields already exist.

No unrelated audit redesign is authorised.

---

# 8. Referential Actions

Cross-aggregate business relationships SHALL default to restrictive delete behaviour.

Prisma SHALL NOT introduce cascading deletion across independent aggregates.

Reservation cancellation SHALL be represented by lifecycle state, not deletion.

Reservation-owned child persistence may use controlled cascading only where the child is unequivocally aggregate-owned and historical requirements permit it.

Supplier records SHALL NOT be deleted automatically because a Reservation is cancelled.

---

# 9. Commercial Prisma Models

The Commercial domain SHALL contain the following canonical models:

    Customer
    Traveller
    Quote
    Booking
    BookingItem
    BookingContact
    BookingNote
    Reservation

The aggregate boundary is:

    Customer
    Traveller

    Quote

    Reservation
        ├── BookingItem
        ├── BookingContact
        ├── BookingNote
        ├── Traveller snapshots
        ├── Journey snapshot
        ├── Accommodation snapshots
        ├── Pricing snapshot
        ├── Payment snapshot
        ├── Supplier references/state
        ├── Timeline
        └── Metadata

Booking is the commercial transaction/process.

Booking SHALL NOT own Reservation as a child aggregate.

---

# 10. Customer Model

Prisma model:

    Customer

The model SHALL implement the Customer physical table defined by SPEC-027.

Required relationships:

    Customer → Traveller[]
    Customer → Quote[]
    Customer → Booking[]
    Customer → Reservation[]

Customer remains the authoritative master identity.

Traveller master data remains associated with Customer.

---

# 11. Traveller Model

Prisma model:

    Traveller

The model SHALL implement the Traveller physical table defined by SPEC-027.

Required relationship:

    Traveller → Customer

Traveller is mutable master data.

Historical Reservation Traveller information SHALL NOT be reconstructed solely from this model.

---

# 12. Quote Model

Prisma model:

    Quote

Required relationships SHALL include the relationships defined by SPEC-027, including Customer and applicable financial/reference relationships.

`quoteNumber` SHALL remain unique.

Quote does not own Reservation.

---

# 13. Booking Model

Prisma model:

    Booking

Booking represents the commercial transaction/process initiated by the client.

It SHALL NOT contain the canonical Reservation aggregate state merely because historical B3L implementation placed Reservation JSON fields on Booking.

The Booking model SHALL contain only fields defined by SPEC-027 for the Booking transaction.

Booking MAY reference Reservation where the physical model requires an originating transaction relationship.

The relationship SHALL NOT imply aggregate ownership.

Required relationships:

    Booking → Customer
    Booking → BookingItem[]
    Booking → BookingContact[]
    Booking → BookingNote[]

Where an explicit Reservation relationship is retained:

    Booking → Reservation

it SHALL be treated as an association between two concepts, not a parent/child aggregate boundary.

---

# 14. Booking Item Model

Prisma model:

    BookingItem

Required relationships:

    BookingItem → Reservation
    BookingItem → Booking where applicable
    BookingItem → Product where applicable
    BookingItem → SupplierBooking[]

A Booking Item SHALL belong to exactly one Reservation.

A Booking Item MAY retain the originating Booking transaction reference.

A Booking Item SHALL NOT become an Aggregate Root.

---

# 15. Booking Contact Model

Prisma model:

    BookingContact

The model SHALL implement the physical Booking Contact entity.

It remains associated with the originating Booking transaction unless a later approved specification changes its ownership.

---

# 16. Booking Note Model

Prisma model:

    BookingNote

Booking Notes SHALL remain distinct from:

- Reservation Timeline;
- Reservation Metadata;
- Operational Notes.

The model SHALL remain associated with Booking according to SPEC-027.

---

# 17. Reservation Model

## 17.1 Canonical Meaning

Prisma model:

    Reservation

This is the canonical GCT Reservation Aggregate Root.

It SHALL NOT represent a Supplier Booking.

It SHALL NOT be implemented as a child entity of Booking.

## 17.2 Required Identity

The model SHALL contain:

    id
    reservationNumber

`reservationNumber` SHALL be unique.

Technical `id` and business `reservationNumber` SHALL remain distinct.

## 17.3 Required Reservation State

The model SHALL support:

    reservation lifecycle
    customerId
    bookingStartDate
    bookingEndDate

and all Reservation-owned persistence required by SPEC-027.

## 17.4 Required Relationships

The Reservation model SHALL support relationships required for:

    Customer
    Booking Items
    Traveller snapshots
    Journey snapshot
    Accommodation snapshots
    Pricing snapshot
    Payment snapshot
    Supplier references/state
    Timeline
    Metadata

Exact physical relationships SHALL follow SPEC-027.

## 17.5 Reservation Lifecycle

The Prisma representation SHALL support exactly the canonical GCT lifecycle:

    CREATED
    QUOTED
    CONFIRMED
    AMENDED
    CANCELLED
    COMPLETED

Supplier-specific status codes SHALL NOT be substituted for these values.

---

# 18. Reservation Snapshots

Reservation-owned historical snapshots SHALL remain associated with Reservation.

The implementation SHALL support:

- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- Pricing snapshot;
- Payment snapshot.

Snapshots SHALL preserve historical Reservation state.

They SHALL NOT become live master entities.

The physical representation SHALL follow SPEC-027.

If SPEC-027 defines a JSON/JSONB snapshot, Prisma SHALL represent it using the appropriate `Json` type.

If SPEC-027 defines a relational child structure, Prisma SHALL represent the relational structure.

Copilot SHALL NOT convert one representation to the other without an approved specification change.

---

# 19. Supplier Booking Model

Prisma model:

    SupplierBooking

This model replaces the historical semantic interpretation of the physical `Reservation` supplier record.

SupplierBooking represents an external booking made by Go Cape to fulfil a Reservation Booking Item.

Required relationships:

    SupplierBooking → BookingItem
    SupplierBooking → Supplier
    SupplierBooking → SupplierProduct where applicable

It SHALL support supplier reference and supplier operational state defined by SPEC-027.

SupplierBooking SHALL NOT contain the GCT Reservation lifecycle.

---

# 20. Supplier Booking Cardinality

The Prisma relationship SHALL permit:

    BookingItem → zero SupplierBookings

and:

    BookingItem → one or more SupplierBookings

where rebooking, substitution or other fulfilment requirements make this necessary.

The schema SHALL NOT enforce a one-to-one Reservation/SupplierBooking relationship.

---

# 21. Internal Go Cape Fulfilment

Internal fulfilment SHALL NOT be forced through SupplierBooking.

Where a Booking Item is fulfilled using Go Cape resources, the existing Operations model SHALL provide the resource allocation.

Relevant models include:

    ResourceAssignment
    Vehicle
    Driver
    Guide
    Trailer

These remain independent aggregates.

---

# 22. Catalogue Prisma Models

The Catalogue domain SHALL implement the physical models defined by SPEC-027:

    ProductType
    Destination
    ProductCategory
    Product
    ProductProductCategory
    Tour
    Activity
    Accommodation
    Package
    PackageProduct
    Media

The Prisma models SHALL faithfully represent SPEC-027.

Catalogue records SHALL NOT replace Reservation snapshots.

---

# 23. Supplier Prisma Models

The Supplier domain SHALL implement:

    Supplier
    SupplierAgreement
    SupplierProduct
    Availability
    Rate
    Offer
    Season
    SynchronisationJob
    ImportBatch
    MappingRule
    SupplierBooking

SupplierBooking is the Reservation fulfilment concept.

Supplier availability and supplier product state SHALL remain separate from Reservation lifecycle.

---

# 24. Financial Prisma Models

The Financial domain SHALL implement:

    Currency
    ExchangeRate
    TaxRate
    PaymentMethod
    Payment
    PaymentAllocation
    Refund
    FinancialAdjustment
    Invoice
    CreditNote
    FinancialReconciliation

Payment remains a separate aggregate.

Reservation PaymentSnapshot remains historical Reservation state.

The Prisma model SHALL preserve this distinction.

---

# 25. Operations Prisma Models

The Operations domain SHALL implement:

    Itinerary
    ItineraryDay
    ItineraryItem
    Vehicle
    Driver
    Guide
    Trailer
    ResourceAssignment
    OperationalSchedule
    TourExecution
    OperationalNote

Operations resources SHALL remain independent aggregates.

ResourceAssignment SHALL NOT transfer ownership of Vehicle, Driver or Guide to Reservation.

---

# 26. Platform Prisma Models

The Platform domain SHALL implement:

    User
    Role
    Permission
    UserRole
    RolePermission
    Document
    DocumentTemplate
    Notification
    NotificationTemplate
    WorkflowEvent
    AuditRecord
    IntegrationEndpoint
    SystemConfiguration

Platform models SHALL remain outside Commercial aggregate ownership.

---

# 27. Cross-Domain Relationships

Cross-domain relationships SHALL reference Aggregate Root identities.

Approved relationship examples include:

    Reservation → Customer
    Reservation → Product
    Reservation → SupplierProduct
    Reservation → Payment
    Reservation → Itinerary

and:

    BookingItem → Product
    SupplierBooking → Supplier
    SupplierBooking → SupplierProduct

Direct cross-domain ownership of child entities is prohibited.

---

# 28. Aggregate Boundary Rules

The Prisma schema SHALL preserve the following Aggregate Roots:

### Commercial

    Customer
    Quote
    Reservation

### Catalogue

    Product

### Supplier

    Supplier
    SupplierProduct

### Financial

    Payment
    Invoice

### Operations

    Itinerary
    Vehicle
    Driver
    Guide
    Trailer

### Platform

    User
    Role
    Document
    Notification
    IntegrationEndpoint
    SystemConfiguration
    WorkflowEvent
    AuditRecord

`Booking` is a transaction/process concept and SHALL NOT become the parent Aggregate Root of Reservation.

---

# 29. Reservation and Booking Relationship

The Prisma schema SHALL preserve the semantic distinction:

    Booking
        = commercial transaction

    Reservation
        = durable GCT business aggregate

If both models contain a reference to the other, the relationship SHALL be treated as an explicit business association.

It SHALL NOT be implemented as:

    Booking
        owns
            Reservation

The Reservation remains independently identifiable and independently lifecycle-managed.

---

# 30. JSON / JSONB Rules

Prisma `Json` SHALL be used only for structures explicitly defined as structured JSON/JSONB by SPEC-027.

The following principles are mandatory:

- JSON SHALL NOT hide an aggregate boundary.
- JSON SHALL NOT replace ordinary relational relationships.
- JSON SHALL NOT be used to make Booking impersonate Reservation.
- Historical snapshots MAY use JSON where specified.
- JSON structures SHALL remain reconstructable by the application contract.
- No provider-specific payload SHALL become an uncontrolled canonical domain structure.

---

# 31. Enum and Lookup Strategy

The Prisma implementation SHALL follow SPEC-027's lookup-table strategy.

Business states that require relational ownership, querying or extension SHALL remain lookup/reference models.

The Reservation lifecycle SHALL not be represented by supplier status codes.

Where the existing repository already uses canonical lookup models, those models SHALL be preserved.

No new Prisma enum shall be introduced solely for convenience.

---

# 32. Indexes

Prisma indexes SHALL implement SPEC-027.

At minimum, the schema SHALL support efficient lookup by:

### Reservation

    id
    reservationNumber
    customerId
    lifecycle
    bookingId where applicable
    bookingStartDate
    bookingEndDate

### Booking

    id
    bookingNumber
    customerId
    booking status
    booking date

### Booking Item

    bookingId where applicable
    reservationId
    productId

### Supplier Booking

    bookingItemId
    supplierId
    supplierProductId where applicable
    supplierReference
    supplier state

No speculative indexes SHALL be introduced.

---

# 33. Migration Requirements

All schema changes SHALL use Prisma Migrate.

The implementation SHALL:

1. update `schema.prisma`;
2. generate the appropriate migration;
3. validate the schema;
4. execute focused persistence tests;
5. execute full regression;
6. report migration and validation results.

Direct database modifications are prohibited.

Production database changes are outside this iteration unless explicitly authorised by the approved implementation specification.

---

# 34. Existing B3L Prisma State

The current repository contains Booking fields introduced during B3L for canonical Reservation JSON state.

These fields include concepts corresponding to:

- Reservation lifecycle;
- Journey snapshot;
- Traveller snapshots;
- Accommodation snapshots;
- Pricing snapshot;
- Payment snapshot;
- Supplier references;
- Reservation timeline;
- Reservation metadata.

Those fields SHALL NOT automatically become the final Prisma architecture.

SPEC-028 v2.0 requires Copilot to reconcile them against SPEC-027 v2.0.

If an existing field is no longer required because Reservation has its own canonical physical model, it SHALL be removed or migrated only as explicitly specified by the implementation specification derived from this document.

No data-destructive action shall be inferred.

---

# 35. Historical Reservation Model

The existing Prisma `Reservation` model historically represents supplier-side reservation information.

SPEC-028 SHALL NOT silently reinterpret that model as the canonical GCT Reservation.

The implementation must distinguish:

    Reservation
        = GCT commercial/fulfilment aggregate

from:

    SupplierBooking
        = external supplier fulfilment booking

If the existing Prisma model name conflicts with this semantic distinction, the required rename or migration SHALL be explicitly addressed during implementation.

Copilot SHALL NOT make an independent semantic decision.

---

# 36. Data Integrity

The Prisma model SHALL enforce:

- primary key integrity;
- unique reservation numbers;
- unique booking numbers;
- required Customer relationships;
- required Reservation relationships for Booking Items;
- required Supplier relationships for Supplier Bookings;
- valid relational ownership;
- appropriate nullability.

A persistence conflict SHALL fail rather than silently overwrite an existing business record.

---

# 37. Nullability

Nullable Prisma fields SHALL correspond to legitimate business lifecycle conditions.

Examples:

- SupplierBooking may not yet exist.
- Supplier confirmation may not yet exist.
- Reservation cancellation information may not yet exist.
- Accommodation may not exist for a Day Tour.
- Supplier reference may be absent before supplier fulfilment.

Nullability SHALL NOT be used to avoid modelling a required relationship.

---

# 38. Soft Delete

Business lifecycle transitions SHALL not be implemented through Prisma deletion.

Examples:

    Reservation → CANCELLED

not:

    prisma.reservation.delete()

Supplier cancellation is supplier state.

Reservation cancellation is Reservation lifecycle state.

Soft deletion SHALL follow the existing repository convention where applicable.

---

# 39. Concurrency

Reservation persistence SHALL support the existing repository's concurrency/versioning convention.

The Prisma model SHALL expose the required version field where defined by SPEC-027.

Copilot SHALL NOT introduce a new concurrency strategy during this iteration.

---

# 40. Security

The Prisma schema SHALL:

- preserve existing access-control assumptions;
- avoid storing provider credentials;
- avoid storing API secrets;
- protect customer and Traveller data;
- preserve payment-data boundaries;
- preserve auditability.

No new authentication or authorisation model is introduced by SPEC-028.

---

# 41. Seed Data

Only reference data explicitly defined as seedable by the existing repository conventions SHALL be seeded.

Seed data SHALL be:

- deterministic;
- idempotent;
- version controlled.

This iteration SHALL NOT introduce unrelated seed data.

---

# 42. Schema Organisation

The canonical Prisma schema SHALL remain organised logically by domain.

Recommended ordering:

    Platform/shared infrastructure
    Commercial
    Catalogue
    Supplier
    Financial
    Operations

The exact file organisation SHALL follow the current repository's Prisma tooling and shall not require speculative schema splitting.

---

# 43. Implementation Constraints

Copilot SHALL:

- inspect the current `schema.prisma` before modification;
- compare current Prisma models against SPEC-027 v2.0;
- preserve unrelated existing models;
- modify only models required by this reconciliation;
- preserve existing valid fields and relationships;
- remove obsolete Reservation-on-Booking structures only where supported by the approved physical model;
- avoid unrelated schema refactoring;
- avoid unrelated migration cleanup;
- avoid introducing future application capabilities.

Copilot SHALL NOT:

- invent fields not supported by SPEC-026 or SPEC-027;
- invent a new aggregate;
- make Booking the Reservation aggregate;
- use JSON to bypass the corrected physical model;
- rename the historical Prisma Reservation model without explicit implementation direction;
- perform production database changes;
- call external suppliers.

---

# 44. Decision-Gap Rule

Implementation SHALL stop and report a decision gap if the current Prisma schema cannot implement SPEC-027 v2.0 without inventing:

- a new business entity;
- a new aggregate boundary;
- a new lifecycle;
- a new business identifier;
- a new cross-domain ownership relationship;
- destructive data transformation;
- a new persistence architecture.

Copilot SHALL report the exact conflict.

Copilot SHALL NOT resolve an architectural conflict independently.

---

# 45. Prisma Validation

The following SHALL pass after implementation:

    npx prisma generate
    npx prisma validate

The generated Prisma Client SHALL compile successfully through the normal project build.

---

# 46. Testing Requirements

The implementation specification derived from SPEC-028 SHALL include focused Prisma tests covering:

- schema validity;
- Reservation persistence;
- Booking relationship;
- Booking Item relationship;
- Supplier Booking relationship;
- Reservation number uniqueness;
- Reservation lifecycle persistence;
- snapshot persistence;
- nullability of pending fulfilment;
- internal fulfilment relationships where applicable;
- round-trip Reservation reconstruction where the repository layer is included.

External supplier APIs SHALL NOT be called.

---

# 47. Acceptance Criteria

SPEC-028 v2.0 is ready for architecture approval when:

- [ ] Prisma remains a faithful implementation of SPEC-027 v2.0.
- [ ] PostgreSQL remains the datasource.
- [ ] Prisma Client uses the established repository configuration.
- [ ] UUID identity conventions are preserved.
- [ ] Naming conventions are preserved.
- [ ] Audit conventions are preserved.
- [ ] Reservation is the canonical Prisma Reservation model.
- [ ] Reservation is not a child aggregate of Booking.
- [ ] Booking represents the commercial transaction.
- [ ] Booking Items belong to Reservation.
- [ ] SupplierBooking represents external fulfilment.
- [ ] SupplierBooking is not the canonical Reservation.
- [ ] Internal Go Cape fulfilment remains possible.
- [ ] Reservation may exist before SupplierBookings.
- [ ] Supplier lifecycle remains separate from Reservation lifecycle.
- [ ] Reservation lifecycle supports all six canonical states.
- [ ] Reservation number is unique.
- [ ] Reservation snapshots remain historically reconstructable.
- [ ] Payment remains a separate Financial aggregate.
- [ ] Operations resources remain separate aggregates.
- [ ] Cross-domain relationships reference Aggregate Roots.
- [ ] Existing B3L Booking JSON does not define the final architecture.
- [ ] Historical supplier Reservation semantics are not silently retained as canonical Reservation semantics.
- [ ] No unrelated schema redesign is introduced.
- [ ] Prisma migration is the only supported schema migration mechanism.
- [ ] `npx prisma generate` passes.
- [ ] `npx prisma validate` passes.

---

# 48. Traceability

| Authority | Relationship |
|---|---|
| GOV-DEV-001 | Governing development process |
| ARCH-000 | Architecture authority |
| ADR-001 | Booking/Reservation/Supplier Booking semantics |
| SPEC-026 v2.0 | Canonical logical model |
| SPEC-027 v2.0 | Canonical physical model |
| APP-004 | Reservation capability |
| APP-004.1 | Reservation Aggregate |
| 3K-C | Canonical Reservation contract |
| SPEC-029 | Repository persistence architecture |

---

# 49. Superseded Prisma Decisions

The following assumptions from SPEC-028 v1.0 are superseded:

1. Booking is the parent Aggregate Root of Reservation.
2. Reservation is a supporting child entity of Booking.
3. The Prisma `Reservation` model represents the canonical GCT Reservation without distinguishing supplier fulfilment.
4. Canonical Reservation state may be physically attached to Booking as a substitute for a Reservation persistence root.

The historical Prisma implementation remains subject to migration/reconciliation.

No historical data is to be discarded merely because a model is superseded.

---

# 50. Preserved Prisma Architecture

The following remain unchanged unless explicitly required by SPEC-027:

- PostgreSQL datasource;
- Prisma Client;
- UUID technical identities;
- snake_case database mapping;
- camelCase Prisma fields;
- explicit relations;
- explicit junction models;
- Decimal monetary fields;
- relational foreign keys;
- lookup/reference strategy;
- Prisma Migrate;
- existing audit conventions;
- existing domain model structure;
- existing Catalogue models;
- existing Supplier models;
- existing Financial models;
- existing Operations models;
- existing Platform models.

Only the Booking/Reservation/SupplierBooking persistence boundary is materially reconciled.

---

# 51. Downstream Dependency

After SPEC-028 v2.0 approval:

1. SPEC-029 — Repository & Persistence Architecture SHALL be reconciled.
2. Repository ownership SHALL be aligned with Reservation as Aggregate Root.
3. `ReservationRepository` SHALL remain persistence-neutral.
4. Prisma implementation details SHALL remain inside infrastructure.
5. The canonical Reservation persistence graph SHALL be defined.
6. Only then may a revised Reservation persistence implementation specification be produced.

No new Reservation persistence implementation SHALL be authorised before SPEC-029 is reconciled and approved.

---

# 52. Definition of Done

SPEC-028 reconciliation is complete when:

- the Prisma model reflects SPEC-027 v2.0;
- the Booking/Reservation semantic collision is removed;
- SupplierBooking is represented distinctly from Reservation;
- the current B3L Prisma workaround is no longer treated as the architectural baseline;
- Prisma validation passes;
- no unrelated schema changes are introduced;
- no architectural decision gaps remain;
- SPEC-029 can be written unambiguously from the resulting Prisma model.

---

# End of Specification

**Document:** SPEC-028 — Prisma Data Model

**Version:** 2.0

**Status:** Draft — Architect Review Required

**Next Specification:** SPEC-029 — Repository & Persistence Architecture