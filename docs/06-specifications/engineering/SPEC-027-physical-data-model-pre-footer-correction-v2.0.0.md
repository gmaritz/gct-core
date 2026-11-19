# SPEC-027 — Physical Data Model

## Document Control

| Field | Value |
|---|---|
| Document ID | SPEC-027 |
| Title | Physical Data Model |
| Version | 2.0 |
| Status | Approved |
| Classification | Internal |
| Owner | GCT Core System Architecture |
| Project | GCT Core |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS.md |
| Architectural Authority | ARCH-000 |
| Logical Model | SPEC-026 v2.0 |
| Related Decision | ADR-001 — Booking, Reservation and Supplier Booking Semantics |
| Downstream Specification | SPEC-028 — Prisma Data Model |

---

# Revision History

| Version | Date | Author | Description |
|---|---|---|---|
| 2.0 | 2026-08-22 | GCT Core System Architecture | Reconciled physical model following ADR-001 and SPEC-026 v2.0 |
| 1.0 | Previous | Enterprise Architecture | Original physical data model |

---

# 1. Purpose

This specification defines the canonical physical PostgreSQL data model for GCT Core.

It translates the canonical logical model defined by SPEC-026 v2.0 into a relational persistence model.

This revision specifically reconciles:

- Booking;
- Reservation;
- Booking Item;
- Supplier Booking;
- Go Cape internal fulfilment.

The physical model SHALL preserve the canonical Reservation Aggregate Root established by APP-004.1 and 3K-C.

This specification is the physical persistence authority for SPEC-028.

---

# 2. Governing Process

This specification is produced under:

`GOV-DEV-001-DEVELOPMENT-PROCESS.md`

It is an architecture/specification artefact and does not authorise implementation.

The implementation workflow remains:

Specification
→ Architect Review / Approval
→ Implementation by Copilot
→ Focused Tests + Regression
→ Copilot Report
→ Architect Acceptance
→ User Commit

No physical implementation shall begin against this revision until architect approval has been given.

---

# 3. Scope

## 3.1 Included

This specification defines:

- PostgreSQL physical design;
- table ownership;
- primary keys;
- foreign keys;
- relationship cardinality;
- constraints;
- indexes;
- audit columns;
- soft deletion;
- physical naming;
- Reservation persistence boundary;
- Booking persistence;
- Booking Item persistence;
- Supplier Booking persistence;
- internal fulfilment references;
- cross-domain persistence relationships.

## 3.2 Excluded

This specification does not define:

- Prisma syntax;
- Prisma migrations;
- SQL migration scripts;
- API contracts;
- application services;
- provider payloads;
- supplier API implementation;
- payment-provider implementation;
- QuickBooks integration.

Those concerns belong to downstream specifications or implementation iterations.

---

# 4. Physical Design Principles

## 4.1 PostgreSQL

PostgreSQL is the authoritative relational database.

All transactional GCT Core business persistence SHALL use PostgreSQL unless an approved architecture explicitly defines otherwise.

---

## 4.2 Relational Integrity

Business relationships SHALL be represented through relational foreign keys.

Referential integrity SHALL be enforced by the database.

Application code SHALL NOT be the sole mechanism enforcing required relationships.

---

## 4.3 Normalisation

Transactional data SHALL use 3NF as the default.

Denormalisation requires an explicit technical justification.

Historical snapshots may use structured JSON/JSONB only where the canonical application contract explicitly defines snapshot semantics and relational decomposition would incorrectly imply live ownership.

Snapshot JSON SHALL NOT be used to compensate for an unclear aggregate model.

---

## 4.4 Surrogate Keys

Business tables SHALL use UUID surrogate primary keys.

Natural/business identifiers may additionally be unique.

Examples:

- reservation number;
- booking number;
- supplier reference.

Natural identifiers SHALL NOT replace technical primary keys.

---

## 4.5 Audit Columns

Transactional and master tables SHALL use the established audit convention:

- `created_at`
- `updated_at`
- `created_by`
- `updated_by`

Where applicable:

- `deleted_at`
- `deleted_by`

The exact nullability and database types SHALL follow the existing repository conventions.

---

## 4.6 Soft Delete

Business records that support deletion SHALL normally use:

- `deleted_at`;
- `deleted_by`.

Historical Reservation state SHALL NOT be physically deleted as part of normal lifecycle processing.

Cancellation is a business lifecycle state, not deletion.

---

## 4.7 Immutable Historical State

The following Reservation-owned information SHALL remain reconstructable after subsequent changes to live source data:

- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- PricingSnapshot;
- PaymentSnapshot;
- Reservation timeline;
- Reservation metadata.

The physical model SHALL NOT replace historical snapshots with foreign-key-only references to mutable master records.

---

# 5. Naming Standards

## 5.1 Tables

Tables SHALL use singular lowercase snake_case.

Examples:

- `customer`
- `reservation`
- `booking_item`
- `supplier_booking`

---

## 5.2 Columns

Columns SHALL use lowercase snake_case.

Examples:

- `reservation_number`
- `booking_item_id`
- `supplier_reference`

---

## 5.3 Primary Keys

Primary keys SHALL be named:

`id`

---

## 5.4 Foreign Keys

Foreign keys SHALL use:

`<referenced_entity>_id`

Examples:

- `customer_id`
- `reservation_id`
- `booking_item_id`
- `supplier_id`

---

## 5.5 Indexes

Indexes SHALL use the repository's established naming convention and identify the table and indexed columns.

---

# 6. Standard Transactional Table Structure

Where applicable, transactional tables SHALL contain:

| Column | Purpose |
|---|---|
| `id` | UUID technical identity |
| `created_at` | Creation timestamp |
| `updated_at` | Last modification timestamp |
| `created_by` | Creating actor |
| `updated_by` | Updating actor |
| `deleted_at` | Soft-delete timestamp |
| `deleted_by` | Soft-delete actor |
| `version` | Optimistic/version control where required |

Not every table requires every optional column.

---

# 7. Commercial Domain Physical Model

## 7.1 Customer

### Table

`customer`

### Purpose

Stores canonical customer identity.

### Key

`id`

### Relationships

- Customer → Traveller: 1:N
- Customer → Quote: 1:N
- Customer → Reservation: 1:N

### Core fields

- `id`
- customer identity fields established by the canonical model
- customer type where applicable
- audit fields
- soft-delete fields where applicable

Customer remains the master source for customer identity.

---

# 8. Traveller

### Table

`traveller`

### Purpose

Stores mutable customer-associated Traveller master information.

### Key

`id`

### Foreign Key

`customer_id → customer.id`

### Relationship

Customer 1:N Traveller.

Traveller master data SHALL NOT be used as the sole source for historical Reservation Traveller state.

---

# 9. Quote

### Table

`quote`

### Purpose

Stores the commercial offer preceding the client's booking transaction.

### Key

`id`

### Foreign Keys

- `customer_id → customer.id`
- `currency_id → currency.id`
- `quote_status_id → quote_status.id`

### Business identifier

`quote_number` SHALL be unique.

Quote does not own Reservation.

---

# 10. Booking

### Table

`booking`

### Purpose

Stores the commercial transaction initiated by the client.

Booking represents the transaction/process through which the client secures the Go Cape experience.

Booking SHALL NOT be the Aggregate Root parent of Reservation.

### Key

`id`

### Core fields

- `id`
- `customer_id`
- `booking_number`
- `booking_date`
- commercial transaction dates where required
- `booking_status_id`
- commercial amount where required
- `currency_id`
- transaction-specific notes
- audit/version fields

### Foreign Keys

- `customer_id → customer.id`
- `booking_status_id → booking_status.id`
- `currency_id → currency.id`

### Relationships

- Customer 1:N Booking
- Booking 1:N Booking Item
- Booking 1:N Booking Contact
- Booking 1:N Booking Note

Booking MAY provide the originating transaction reference for Reservation, but SHALL NOT own Reservation as an aggregate child.

---

# 11. Booking Item

### Table

`booking_item`

### Purpose

Represents an individual component required to fulfil a Reservation.

### Key

`id`

### Foreign Keys

- `booking_id → booking.id` where the booking transaction association is retained
- `reservation_id → reservation.id`
- `product_id → product.id` where a catalogue product applies

### Core fields

- `id`
- `booking_id` where applicable
- `reservation_id`
- `product_id` where applicable
- quantity
- agreed price fields where applicable
- component-specific fulfilment state where required
- audit fields

### Relationship

Reservation 1:N Booking Item.

A Booking Item SHALL be associated with exactly one Reservation.

A Booking Item MAY additionally retain the originating Booking reference.

The physical model SHALL NOT require Reservation to be a child of Booking.

---

# 12. Booking Contact

### Table

`booking_contact`

### Purpose

Stores commercial contact information associated with the originating Booking transaction.

### Foreign Key

`booking_id → booking.id`

Booking Contact remains associated with Booking unless later application architecture explicitly transfers ownership.

---

# 13. Booking Note

### Table

`booking_note`

### Purpose

Stores notes associated with the Booking transaction.

### Foreign Keys

- `booking_id → booking.id`
- note type reference where applicable

Booking Notes remain distinct from Reservation Timeline and Reservation Metadata.

---

# 14. Reservation

## 14.1 Table

`reservation`

## 14.2 Purpose

The `reservation` table SHALL represent the canonical GCT Reservation Aggregate Root.

It SHALL NOT represent an external supplier booking.

This is the primary semantic correction from SPEC-027 v1.0.

---

## 14.3 Identity

The table SHALL contain:

- `id` — technical UUID identity;
- `reservation_number` — explicit business identifier.

`reservation_number` SHALL be unique.

Technical identity and reservation number SHALL remain distinct.

---

## 14.4 Core Reservation Fields

The physical Reservation root SHALL support the canonical Reservation contract, including:

- `id`
- `reservation_number`
- `customer_id`
- Reservation lifecycle state
- `booking_id` where an originating Booking reference is retained
- `booking_start_date`
- `booking_end_date`
- historical snapshot state
- supplier references/state
- timeline
- metadata
- audit/version fields

The exact physical representation of each snapshot SHALL be established consistently with this specification and SPEC-028.

---

## 14.5 Reservation Lifecycle

The physical model SHALL support:

- `CREATED`
- `QUOTED`
- `CONFIRMED`
- `AMENDED`
- `CANCELLED`
- `COMPLETED`

The physical representation SHALL not substitute supplier lifecycle codes for GCT Reservation lifecycle.

---

## 14.6 Reservation Customer Relationship

Reservation SHALL reference:

`customer_id → customer.id`

Reservation customer identity SHALL be explicit.

Customer identity SHALL NOT be inferred from Traveller snapshots.

---

## 14.7 Reservation Dates

Reservation SHALL persist:

- `booking_start_date`
- `booking_end_date`

These represent the canonical Reservation travel period.

They SHALL NOT be derived solely from individual supplier or accommodation records.

---

# 15. Reservation Snapshot Persistence

Reservation-owned historical snapshots SHALL remain associated with the Reservation.

The physical model SHALL support:

- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- PricingSnapshot;
- PaymentSnapshot.

Snapshots SHALL be historically reconstructable.

They SHALL NOT become live master records.

Where JSONB is used, the structure SHALL follow the canonical application contract and SHALL be validated by the application boundary.

Where relational child tables are required by an approved canonical contract, relational persistence SHALL be used instead.

SPEC-028 SHALL define the exact Prisma representation.

---

# 16. Supplier Booking

## 16.1 Canonical Physical Meaning

The historical physical `reservation` concept in SPEC-027 v1.0 represented an external supplier reservation.

That concept SHALL now be represented as:

`Supplier Booking`

The exact physical table name SHALL be confirmed during the SPEC-028 reconciliation, but the semantic model is fixed by SPEC-026 v2.0 and ADR-001.

---

## 16.2 Supplier Booking Purpose

A Supplier Booking records an external booking made by Go Cape to fulfil a Reservation Booking Item.

It may contain:

- technical identity;
- `booking_item_id`;
- `supplier_id`;
- `supplier_product_id` where applicable;
- supplier reference;
- supplier booking state;
- requested/reserved/confirmed timestamps;
- cancellation information where required;
- supplier-specific operational reference data.

---

## 16.3 Supplier Booking Relationship

The logical relationship is:

`Reservation → Booking Item → Supplier Booking`

A Supplier Booking SHALL NOT become the canonical Reservation.

---

## 16.4 Supplier Booking Cardinality

A Booking Item MAY have:

- zero Supplier Bookings;
- one Supplier Booking;
- multiple Supplier Bookings where substitution, rebooking or component fulfilment requires it.

The physical model SHALL not enforce a one-to-one Reservation/Supplier Booking relationship.

---

# 17. Internal Go Cape Fulfilment

A Booking Item MAY be fulfilled directly by Go Cape.

Internal fulfilment may reference:

- Vehicle;
- Driver;
- Guide;
- other operational resources.

These resources remain independent Operations aggregates.

The physical model SHALL not force internal fulfilment through a Supplier Booking record.

---

# 18. Catalogue Domain

The existing Catalogue physical model remains governed by the established logical model.

Core tables include:

- `product`
- `product_type`
- `product_category`
- `product_product_category`
- `destination`
- `tour`
- `activity`
- `accommodation`
- `package`
- `package_product`
- `media`

Catalogue records describe current sellable products.

They SHALL NOT replace historical Reservation snapshots.

---

# 19. Supplier Domain

Core tables include:

- `supplier`
- `supplier_agreement`
- `supplier_product`
- `availability`
- `rate`
- `offer`
- `season`
- `synchronisation_job`
- `import_batch`
- `mapping_rule`

These tables represent supplier master, catalogue, availability and integration state.

Supplier availability is not Reservation lifecycle state.

---

# 20. Financial Domain

Core tables include:

- `currency`
- `exchange_rate`
- `tax_rate`
- `payment_method`
- `payment`
- `payment_allocation`
- `refund`
- `financial_adjustment`
- `invoice`
- `credit_note`
- `financial_reconciliation`

Payment remains a separate Financial aggregate.

Reservation may retain a PaymentSnapshot representing historical Reservation state.

The Payment aggregate and PaymentSnapshot SHALL NOT be treated as the same physical business object.

---

# 21. Operations Domain

Core tables include:

- `itinerary`
- `itinerary_day`
- `itinerary_item`
- `vehicle`
- `driver`
- `guide`
- `trailer`
- `resource_assignment`
- `operational_schedule`
- `tour_execution`
- `operational_note`

Operations resources remain independent aggregates.

Resource Assignment provides operational fulfilment for Reservation-related work without becoming Reservation ownership.

---

# 22. Platform Domain

Core tables include:

- `user`
- `role`
- `permission`
- `user_role`
- `role_permission`
- `document`
- `document_template`
- `notification`
- `notification_template`
- `workflow_event`
- `audit_record`
- `integration_endpoint`
- `system_configuration`

Platform tables remain outside Commercial aggregate ownership.

---

# 23. Global Relationship Model

The canonical physical relationship is:

    Customer
        │
        ├── Traveller
        ├── Quote
        └── Reservation
                  │
                  ├── Booking Items
                  │      │
                  │      ├── Product
                  │      │
                  │      ├── Supplier Booking
                  │      │        └── Supplier
                  │      │
                  │      └── Go Cape Fulfilment
                  │               └── Resource Assignment
                  │
                  ├── Reservation Snapshots
                  ├── Pricing Snapshot
                  ├── Payment Snapshot
                  ├── Supplier References
                  ├── Timeline
                  └── Metadata

Booking remains the originating commercial transaction and may reference the Reservation through the established application/persistence relationship.

---

# 24. Cross-Domain Foreign Key Rules

Cross-domain foreign keys SHALL:

- reference Aggregate Root technical identities;
- preserve aggregate autonomy;
- avoid ownership of another domain's child entity;
- use restrictive delete behaviour for business records;
- avoid cascading deletion across aggregate boundaries.

Examples:

- `reservation.customer_id → customer.id`
- `reservation.booking_id → booking.id` where retained
- `booking_item.product_id → product.id`
- `supplier_booking.supplier_id → supplier.id`
- `supplier_booking.supplier_product_id → supplier_product.id`
- `payment.customer_id → customer.id`
- `itinerary.reservation_id → reservation.id` where established by the Operations architecture.

Exact relationships SHALL remain consistent with the approved logical model.

---

# 25. Referential Integrity

The database SHALL enforce:

- primary key integrity;
- foreign key integrity;
- unique business identifiers;
- required relationship cardinality;
- appropriate nullability;
- valid reference values.

A Reservation SHALL NOT be physically persisted with a missing required Customer relationship.

A Booking Item SHALL NOT exist without its required Reservation relationship.

A Supplier Booking SHALL NOT exist without its required Booking Item relationship.

---

# 26. Delete Behaviour

Normal business lifecycle transitions SHALL NOT be implemented through physical deletion.

Examples:

- Reservation cancellation → `CANCELLED`
- Payment correction → compensating financial record
- Supplier cancellation → supplier booking state
- Booking amendment → Reservation amendment

Physical deletion SHALL be restricted to data that is explicitly authorised for permanent deletion.

---

# 27. Cascade Rules

Default behaviour across business aggregates SHALL be restrictive.

`ON DELETE CASCADE` SHALL NOT be used to silently delete business aggregates.

Reservation-owned persistence components may use controlled cascading only where:

- ownership is unambiguous;
- deletion cannot violate historical requirements;
- the behaviour is consistent with the Reservation aggregate lifecycle.

Supplier records SHALL NOT be deleted automatically because a Reservation is cancelled.

---

# 28. Nullability

A field SHALL be nullable only when the business lifecycle permits its absence.

Examples:

- Supplier Booking reference may initially be absent.
- Supplier confirmation timestamp may be absent until confirmed.
- Reservation cancellation timestamp may be absent until cancellation.
- Accommodation data may be absent for Day Tours.
- Supplier Booking may be absent while Reservation fulfilment is pending.

Nullability SHALL represent legitimate lifecycle state, not implementation convenience.

---

# 29. Business Identifier Rules

The following identifiers SHALL be unique within their defined business scope:

- `reservation_number`;
- `booking_number`;
- `quote_number`;
- supplier references where uniqueness is explicitly guaranteed by the supplier and scope.

Technical UUIDs remain the primary keys.

---

# 30. Reservation Uniqueness

`reservation_number` SHALL have a database-level unique constraint.

A duplicate reservation number SHALL result in a persistence conflict.

The application SHALL NOT silently replace an existing Reservation because of a reservation-number collision.

---

# 31. Indexing Strategy

At minimum, indexes SHALL support:

### Reservation

- primary key;
- unique reservation number;
- customer;
- lifecycle state;
- booking reference where used;
- travel start/end dates.

### Booking

- primary key;
- unique booking number;
- customer;
- booking status;
- booking date;
- travel date.

### Booking Item

- booking;
- reservation;
- product.

### Supplier Booking

- booking item;
- supplier;
- supplier product where applicable;
- supplier reference;
- supplier booking state.

Additional indexes SHALL be introduced only where supported by query requirements.

---

# 32. JSON / JSONB Policy

JSONB MAY be used for canonical historical snapshots where the application contract requires preservation of structured historical state.

JSONB SHALL NOT be used:

- to avoid defining an aggregate boundary;
- to hide unresolved relationships;
- to duplicate master data unnecessarily;
- to replace relational foreign keys for ordinary transactional relationships.

The canonical Reservation root SHALL not be represented merely as arbitrary JSON attached to Booking.

This specifically prohibits the B3L pattern of making Booking a surrogate physical Reservation aggregate through a collection of Reservation JSON fields.

---

# 33. Transaction Integrity

Persistence operations that create or modify a Reservation SHALL maintain aggregate consistency transactionally.

Where Reservation-owned persistence consists of multiple physical records, the complete Reservation persistence operation SHALL succeed or fail atomically.

Supplier API calls SHALL NOT be part of the database transaction.

External supplier fulfilment remains an application/process concern.

---

# 34. Concurrency

The physical model SHALL support optimistic concurrency where required by the existing repository conventions.

Reservation updates SHALL protect against overwriting a newer Reservation version.

The exact concurrency mechanism SHALL be defined by SPEC-028 and the repository persistence architecture.

---

# 35. Audit and History

Reservation audit information SHALL be retained according to the established audit architecture.

Reservation lifecycle changes SHALL be represented in the Reservation Timeline where required by the canonical application contract.

Supplier operational changes SHALL remain distinguishable from GCT Reservation lifecycle events.

---

# 36. Performance and Partitioning

The physical model SHALL initially use conventional PostgreSQL relational storage.

Partitioning SHALL NOT be introduced speculatively.

Partitioning may be considered later for:

- high-volume audit data;
- workflow events;
- supplier synchronisation records;
- other demonstrably high-growth tables.

Reservation SHALL not be partitioned without an established workload requirement.

---

# 37. Data Retention

Reservation historical information SHALL be retained according to established business and legal retention requirements.

Cancellation and completion do not imply deletion.

Supplier operational history SHALL remain available for the period required by operational and commercial requirements.

Exact retention periods remain governed by the applicable governance and compliance documentation.

---

# 38. Security

The physical model SHALL:

- protect customer and Traveller information;
- restrict access to payment information;
- avoid storing provider secrets;
- avoid storing supplier authentication credentials in business tables;
- use existing database access controls;
- preserve auditability.

Sensitive data SHALL not be exposed through unrestricted reporting structures.

---

# 39. Domain Physical Model Summary

| Domain | Primary Tables |
|---|---|
| Commercial | customer, traveller, quote, booking, booking_item, booking_contact, booking_note, reservation, supplier_booking |
| Catalogue | product, product_type, product_category, product_product_category, destination, tour, activity, accommodation, package, package_product, media |
| Supplier | supplier, supplier_agreement, supplier_product, availability, rate, offer, season, synchronisation_job, import_batch, mapping_rule |
| Financial | currency, exchange_rate, tax_rate, payment_method, payment, payment_allocation, refund, financial_adjustment, invoice, credit_note, financial_reconciliation |
| Operations | itinerary, itinerary_day, itinerary_item, vehicle, driver, guide, trailer, resource_assignment, operational_schedule, tour_execution, operational_note |
| Platform | user, role, permission, user_role, role_permission, document, document_template, notification, notification_template, workflow_event, audit_record, integration_endpoint, system_configuration |

The exact physical columns SHALL remain aligned with SPEC-026 and the current canonical application contracts.

---

# 40. Reconciliation of Historical Reservation Table

The historical SPEC-027 v1.0 `reservation` table represented:

- booking item;
- supplier product;
- supplier reference;
- supplier reservation status;
- reserved timestamp;
- confirmation timestamp.

That structure describes a Supplier Booking, not the canonical GCT Reservation.

Therefore:

> The historical `reservation` structure SHALL NOT be assumed to be the canonical Reservation table in the reconciled physical model.

Before implementation, SPEC-028 SHALL determine whether the existing physical structure is:

- renamed;
- repurposed;
- retained under a supplier-booking concept;
- migrated into a new structure;
- or otherwise mapped.

No such implementation decision is made by SPEC-027 alone.

---

# 41. Current Prisma Implication

The current repository contains a `Booking` model carrying fields such as:

- `reservationLifecycleCode`;
- `journeySnapshot`;
- `travellerSnapshots`;
- `accommodationSnapshots`;
- `pricingSnapshot`;
- `paymentSnapshot`;
- `supplierReferences`;
- `reservationTimeline`;
- `reservationMetadata`.

These fields SHALL NOT be treated as the final physical architecture.

They were introduced during B3L and represent an implementation attempt to persist the canonical Reservation through the historical Booking root.

This specification does not approve that arrangement.

SPEC-028 SHALL reconcile the current Prisma model against this physical model before further Reservation persistence implementation.

---

# 42. Migration Constraints

Any future migration resulting from this specification SHALL:

- preserve existing production data where required;
- avoid destructive migration without explicit approval;
- distinguish canonical Reservation data from historical Supplier Booking data;
- preserve supplier references;
- preserve customer references;
- preserve Booking Items;
- preserve Reservation historical snapshots where already persisted;
- avoid silent semantic conversion.

If existing data cannot be mapped safely, implementation SHALL stop and identify the decision gap.

---

# 43. Physical Model Acceptance Criteria

SPEC-027 v2.0 is ready for architect approval when:

- [ ] PostgreSQL remains the authoritative relational store.
- [ ] Reservation is the canonical physical Aggregate Root.
- [ ] Booking is not the parent aggregate of Reservation.
- [ ] Booking remains the commercial transaction concept.
- [ ] Booking Items represent Reservation fulfilment components.
- [ ] Supplier Bookings represent external fulfilment.
- [ ] Internal Go Cape fulfilment is representable.
- [ ] Reservation can exist before Supplier Bookings exist.
- [ ] Supplier state is separate from Reservation lifecycle.
- [ ] Reservation supports its canonical lifecycle.
- [ ] Reservation number is a distinct unique business identifier.
- [ ] Reservation customer identity is explicit.
- [ ] Reservation dates are explicitly persisted.
- [ ] Historical snapshots remain reconstructable.
- [ ] Day Tours do not require accommodation persistence.
- [ ] Package Tours can persist accommodation components.
- [ ] Financial Payment remains a separate aggregate.
- [ ] Operations resources remain separate aggregates.
- [ ] Cross-domain foreign keys preserve aggregate boundaries.
- [ ] The historical `reservation` supplier concept is not confused with GCT Reservation.
- [ ] JSONB is not used to make Booking impersonate Reservation.
- [ ] No unrelated physical architecture is redesigned.
- [ ] SPEC-026 v2.0 is preserved as the logical authority.
- [ ] ADR-001 is preserved as the semantic authority.

---

# 44. Traceability

| Authority | Relationship |
|---|---|
| GOV-DEV-001 | Development process |
| ARCH-000 | Architecture authority |
| ADR-001 | Booking/Reservation/Supplier Booking semantics |
| SPEC-026 v2.0 | Canonical logical data model |
| APP-004 | Reservation capability |
| APP-004.1 | Reservation Aggregate |
| 3K-C | Canonical Reservation contract |
| SPEC-028 | Prisma physical implementation |
| SPEC-029 | Repository persistence architecture |

---

# 45. Superseded Physical Decisions

The following SPEC-027 v1.0 assumptions are superseded:

1. `reservation` represents the canonical GCT Reservation.
2. `reservation` is owned beneath `booking_item`.
3. `reservation` is fundamentally a supplier reservation.
4. Booking is the physical parent of the canonical Reservation.
5. Supplier reservation state defines the Reservation persistence boundary.

The historical physical structures are not automatically deleted or renamed.

Their migration/reconciliation is a downstream implementation decision.

---

# 46. Preserved Physical Architecture

The following remain preserved unless explicitly changed by a later approved specification:

- PostgreSQL;
- UUID technical identities;
- relational foreign keys;
- 3NF as the default;
- audit columns;
- soft deletion;
- domain separation;
- Catalogue tables;
- Supplier tables;
- Financial tables;
- Operations tables;
- Platform tables;
- existing reference-data architecture;
- existing index and integrity principles.

Only the physical Booking/Reservation/Supplier Booking boundary is materially reconciled by this revision.

---

# 47. Next Specification

After SPEC-027 v2.0 approval:

1. Reconcile SPEC-028 — Prisma Data Model.
2. Align Prisma models to the corrected physical Reservation boundary.
3. Resolve the current Booking JSON Reservation fields.
4. Determine the correct Prisma representation of Supplier Booking.
5. Confirm Booking Item relationships.
6. Confirm migration requirements.
7. Reconcile SPEC-029 — Repository & Persistence Architecture.
8. Only then revise the Reservation persistence implementation specification.

No implementation is authorised by SPEC-027 alone.

---

# End of Specification

**Document:** SPEC-027 — Physical Data Model

**Version:** 2.0

**Status:** Draft — Architect Review Required

**Next Specification:** SPEC-028 — Prisma Data Model