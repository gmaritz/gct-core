# GCT CORE — PERSISTENCE RECONCILIATION BATCH 3F
## Reservation Physical Persistence Contract

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B3F-RESERVATION |
| Title | Reservation Physical Persistence Contract |
| Project | GCT Core |
| Type | Focused Implementation Specification |
| Status | Implementation Ready |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Predecessor | PERSISTENCE-B3E-RESERVATION |
| Capability | APP-004 Reservation |
| Dependencies | APP-004, APP-005, APP-008, PERSISTENCE-B2A |
| Current Lint Warnings | 11 |
| Target | Remove the 4 Reservation persistence warnings |

---

## 2. Purpose

Define the exact physical persistence contract required to persist the active APP-004 Reservation aggregate without requiring Copilot to invent persistence architecture.

This specification resolves the four blockers identified by Batch 3E:

1. Traveller persistence;
2. accommodation snapshot persistence;
3. Journey snapshot persistence;
4. GCT Reservation lifecycle persistence.

The implementation MUST preserve the existing domain model and MUST NOT redesign unrelated capabilities.

---

## 3. Governing Process

Follow:

`GOV-DEV-001-DEVELOPMENT-PROCESS`

Required workflow:

Specification
→ Architect Review
→ Copilot Implementation
→ Focused Tests + Regression
→ Copilot Report
→ Architect Acceptance
→ User Commit

Copilot MUST NOT create a commit.

If implementation reveals a contradiction with an accepted contract, STOP and report it.

---

# 4. Canonical Physical Root

Prisma `Booking` SHALL be the physical commercial root of the APP-004 Reservation.

The existing Prisma `Reservation` SHALL remain the operational supplier-reservation record.

The physical relationship is:

Booking
→ Reservation accommodation snapshots
→ supplier booking state

The Prisma `Reservation` record MUST NOT be treated as the complete GCT Reservation aggregate.

---

# 5. Reservation Identity

The canonical mappings are:

- Domain Reservation identity → `Booking.id`
- Domain Reservation number → `Booking.bookingNumber`

These mappings are authoritative for this persistence contract.

Do not introduce another physical Reservation identity or reservation-number field.

Do not use:

- `BookingItem.id`;
- supplier reservation reference;
- supplier booking reference;

as the GCT Reservation identity.

---

# 6. Traveller Persistence Decision

The active Reservation aggregate contains Traveller snapshots rather than a required persistent Traveller aggregate relationship.

Therefore this batch SHALL NOT create a Booking → Traveller foreign key.

The Reservation physical model SHALL persist the Traveller snapshot owned by the Reservation.

The snapshot MUST preserve the complete active Reservation Traveller representation required to reconstruct the aggregate.

The persistence representation SHALL be a typed JSON snapshot owned by the Reservation root.

Conceptual field:

`Booking.travellerSnapshot`

Type:

`Json`

The infrastructure layer MUST define a typed persistence representation for the JSON payload.

Do not:

- use `BookingContact` as Traveller persistence;
- duplicate a Customer relationship;
- modify Traveller;
- modify Customer;
- create an implicit Traveller;
- replace the snapshot with a Traveller foreign key.

---

# 7. Journey Persistence Decision

The active Reservation aggregate contains a Journey snapshot.

No Prisma Journey model currently exists.

This batch SHALL therefore persist the Journey snapshot directly with the Reservation rather than introducing a Journey aggregate table.

Conceptual field:

`Booking.journeySnapshot`

Type:

`Json`

The infrastructure layer MUST define a typed persistence representation matching the active Reservation Journey snapshot.

The snapshot MUST preserve the Journey information required to reconstruct the Reservation aggregate.

Do not:

- create a Prisma Journey model;
- create a Journey repository;
- create a Journey foreign key;
- infer Journey identity from Package, Itinerary or PackageProduct.

Journey remains an immutable Reservation snapshot in this persistence boundary.

---

# 8. Reservation Lifecycle

The GCT Reservation lifecycle SHALL NOT reuse the existing Booking status because the current physical status set does not represent the complete domain lifecycle.

The physical Booking root SHALL receive a dedicated Reservation lifecycle field.

Conceptual field:

`reservationStatus`

Type:

Prisma enum.

Required values:

- `CREATED`
- `QUOTED`
- `CONFIRMED`
- `AMENDED`
- `CANCELLED`
- `COMPLETED`

The existing Booking status remains a separate commercial/legacy status.

Supplier Reservation status remains separate again.

The three concepts MUST NOT be conflated.

---

# 9. Final GCT Price

The final GCT commercial price SHALL use the existing Booking financial representation:

- `Booking.totalAmount`;
- `Booking.currencyId`.

This is the canonical physical representation of the final GCT Reservation price.

Do not create a duplicate GCT total unless the existing Booking representation cannot preserve the required APP-005 Money semantics.

Supplier pricing MUST never overwrite the final GCT price.

---

# 10. Accommodation Snapshot Root

Each Reservation SHALL support zero or more accommodation snapshots.

Introduce a Reservation-owned physical structure conceptually named:

`ReservationAccommodationStop`

Each stop MUST belong to one Booking.

Required fields:

- `id`
- `bookingId`
- `packageId` where available from the active snapshot
- `packageStopId`
- `stopOrder`
- `propertySnapshot`
- `checkIn`
- `checkOut`
- `supplierAmount`
- `supplierCurrencyId`
- `pricingBasis`
- `bookingState`
- `provider`
- `supplierBookingReference`
- `createdAt`
- `updatedAt`

Stop order MUST be unique within the Booking.

---

# 11. Property Snapshot

`propertySnapshot` SHALL preserve the selected accommodation property as it existed when the Reservation was created.

Type:

`Json`

The typed persistence representation MUST preserve the property identity and descriptive information required by the active APP-004 snapshot.

Catalogue references MAY also be stored separately where useful.

Historical Reservation reconstruction MUST NOT depend exclusively on the current accommodation catalogue.

---

# 12. Room Snapshot

Each `ReservationAccommodationStop` SHALL have one or more room records.

Conceptual structure:

`ReservationAccommodationRoom`

Required fields:

- `id`
- `stopId`
- `roomSnapshot`
- `rateSnapshot`
- `roomReference`
- `rateReference`
- `adults`
- `children`
- `childAges`
- `createdAt`
- `updatedAt`

`roomSnapshot` and `rateSnapshot` SHALL be typed JSON persistence snapshots.

Supplier room/rate references SHALL remain opaque strings.

---

# 13. Occupancy

Occupancy SHALL be stored at room level.

Required fields:

- `adults`
- `children`
- `childAges`

Rules:

- `adults` is a non-negative integer consistent with the canonical accommodation contract;
- `children` is a non-negative integer;
- `childAges.length === children`;
- when `children = 0`, `childAges` is empty.

Do not replace room occupancy with a Booking-level guest count.

---

# 14. Supplier Pricing

Each accommodation stop SHALL preserve supplier pricing separately from the final GCT price.

Required fields:

- `supplierAmount`
- `supplierCurrencyId`
- `pricingBasis`

`supplierAmount` represents the supplier price at the point of Reservation creation/revalidation.

`pricingBasis` SHALL preserve the canonical pricing-basis value supplied by the accommodation pricing contract.

No pricing calculation occurs inside persistence.

---

# 15. Provider and Supplier References

Each accommodation stop SHALL preserve:

- provider;
- supplier booking reference;
- opaque supplier references required by the APP-004 accommodation snapshot.

Room/rate/property references SHALL remain supplier-neutral and opaque.

No Hotelbeds-specific database field or domain type may be introduced.

The existing supplier/provider identity model SHALL be reused where applicable.

---

# 16. Supplier Booking State

Supplier booking state SHALL belong to the accommodation stop.

Required state values:

- `PENDING`
- `REVALIDATION_REQUIRED`
- `VALIDATED`
- `BOOKING_ATTEMPTED`
- `CONFIRMED`
- `FAILED`
- `UNKNOWN`

The physical state MUST be separate from:

- GCT Reservation lifecycle;
- immutable accommodation selection.

A failed or unknown supplier result MUST NOT be represented as confirmed.

---

# 17. Per-Stop Booking Continuity

Each accommodation stop SHALL independently preserve:

- provider;
- supplier booking reference;
- supplier booking state;
- operational timestamps.

One stop MUST NOT overwrite another stop's supplier state.

Multiple accommodation stops are therefore independently recoverable.

---

# 18. Snapshot Immutability

The following information is Reservation snapshot data and MUST NOT be overwritten by ordinary supplier-state updates:

- property snapshot;
- room snapshot;
- rate snapshot;
- room reference;
- rate reference;
- occupancy;
- child ages;
- stay dates;
- supplier price;
- supplier currency;
- pricing basis.

Supplier booking state and supplier booking reference MAY change through the approved booking workflow.

---

# 19. Traveller Snapshot Immutability

The Reservation Traveller snapshot SHALL be preserved as part of the Reservation historical state.

Changes to the independent Traveller aggregate MUST NOT retroactively alter a persisted Reservation Traveller snapshot.

The Reservation mapper MUST reconstruct the snapshot from the Reservation persistence record.

---

# 20. Journey Snapshot Immutability

The Reservation Journey snapshot SHALL be preserved as part of the Reservation historical state.

Changes to packages, itineraries or future Journey structures MUST NOT retroactively alter the persisted Reservation Journey snapshot.

The Reservation mapper MUST reconstruct the Journey snapshot from the Reservation persistence record.

---

# 21. Existing Prisma Reservation

The existing Prisma `Reservation` model remains the supplier operational child.

Continue to use it for existing concepts such as:

- `bookingId`;
- `bookingItemId`;
- `supplierId`;
- supplier reservation reference;
- supplier reservation status;
- reserved timestamp;
- confirmed timestamp;
- cancelled timestamp.

Do not migrate these concepts into the new snapshot structures unless required to preserve the canonical state.

---

# 22. Booking Item

Existing `BookingItem` relationships MAY continue to identify the commercial product/package associated with the Booking.

`BookingItem` MUST NOT be used as the accommodation snapshot itself.

The new Reservation accommodation stop structure owns the selected accommodation state.

---

# 23. Persistence Type Boundary

The infrastructure layer SHALL define explicit persistence types for:

- Traveller snapshot;
- Journey snapshot;
- Property snapshot;
- Room snapshot;
- Rate snapshot;
- Reservation query payload.

These types MUST be separate from the domain aggregate types.

Prisma-generated types SHOULD be used for relational query payloads where appropriate.

No `any` is permitted.

---

# 24. Reservation Mapper

`reservation.mapper.ts` SHALL map:

Domain Reservation
→ physical persistence representation

and:

physical persistence representation
→ Domain Reservation.

The mapper MUST reconstruct:

- identity;
- reservation number;
- lifecycle;
- Traveller snapshot;
- Journey snapshot;
- final GCT price;
- accommodation stops;
- room selections;
- occupancy;
- child ages;
- supplier pricing;
- supplier references;
- booking state;
- timeline data already represented by the domain.

No Prisma types may leak into the domain.

---

# 25. Reservation Repository

`ReservationPrismaRepository` SHALL remain the implementation of `IReservationRepository`.

Its public interface remains persistence-neutral.

The repository SHALL use explicit Prisma query payload types matching its actual relation graph.

The repository MUST NOT expose:

- Prisma models;
- Prisma query payloads;
- persistence DTOs;

through the domain/application contract.

---

# 26. Save Behaviour

Saving a Reservation SHALL persist:

1. Booking root;
2. Reservation lifecycle;
3. Traveller snapshot;
4. Journey snapshot;
5. final GCT price;
6. accommodation stops;
7. room snapshots;
8. occupancy;
9. child ages;
10. supplier pricing;
11. provider/reference information;
12. supplier booking state.

Existing operational Reservation records SHALL remain associated with the Booking.

Persistence MUST NOT call Hotelbeds or PayFast.

---

# 27. Retrieval Behaviour

Retrieval SHALL reconstruct the accepted Reservation aggregate without requiring live supplier or catalogue calls.

The mapper MUST be able to reconstruct:

- Reservation identity;
- reservation number;
- lifecycle;
- Traveller snapshot;
- Journey snapshot;
- final GCT price;
- all accommodation stops;
- all rooms;
- occupancy;
- child ages;
- supplier pricing;
- provider;
- supplier references;
- booking state.

If any required aggregate state cannot be reconstructed from the persistence model, STOP and report it.

---

# 28. Update Behaviour

Updates MUST preserve immutable snapshots.

Supplier booking operations MAY update:

- booking state;
- supplier booking reference;
- operational timestamps.

They MUST NOT silently overwrite:

- selected property;
- selected room;
- selected rate;
- occupancy;
- child ages;
- historical supplier pricing.

---

# 29. Prisma Schema Scope

Permitted changes are limited to the Reservation persistence contract:

- Booking Reservation lifecycle field;
- Booking Traveller snapshot field;
- Booking Journey snapshot field;
- Reservation accommodation stop;
- Reservation room;
- required snapshot JSON fields;
- supplier pricing;
- pricing basis;
- provider/reference information;
- per-stop booking state.

Do NOT modify:

- Traveller model;
- Customer model;
- Journey model;
- Payment model;
- Invoice model;
- Hotelbeds provider schema;
- PayFast schema;
- unrelated Prisma models.

---

# 30. Database Safety

Schema changes MAY be implemented and Prisma client regenerated.

Run:

`npx prisma validate`

A migration MAY be generated for review.

A database migration MUST NOT be applied during this iteration.

The Copilot report MUST explicitly state:

- migration generated: YES/NO;
- migration applied: NO.

---

# 31. Tests

Focused tests MUST cover:

### Root

- identity;
- reservation number;
- lifecycle;
- final GCT price.

### Traveller

- snapshot persistence;
- snapshot reconstruction;
- snapshot independence from Traveller changes.

### Journey

- snapshot persistence;
- snapshot reconstruction;
- no Journey Prisma model required.

### Accommodation

- one stop;
- multiple stops;
- stop ordering;
- property snapshot;
- room snapshot;
- rate snapshot;
- stay dates.

### Occupancy

- multiple rooms;
- adults;
- children;
- child ages.

### Pricing

- supplier amount;
- supplier currency;
- pricing basis;
- separation from GCT price.

### Supplier State

- provider;
- supplier reference;
- pending;
- validated;
- confirmed;
- failed;
- unknown;
- independent state per stop.

### Mapping

- domain → persistence;
- persistence → domain;
- round-trip preservation.

---

# 32. Verification

Copilot MUST run:

- focused Reservation tests;
- full Jest regression;
- `npm run build`;
- `npx prisma validate`;
- `npm run lint`;
- TypeScript/language-service validation.

External supplier calls are NOT required.

Expected lint result:

**11 → 7 warnings**

The four Reservation warnings are the only lint warnings in scope.

---

# 33. Scope

## In Scope

- Booking Reservation persistence contract;
- Reservation lifecycle persistence;
- Traveller snapshot persistence;
- Journey snapshot persistence;
- accommodation stop persistence;
- property/room/rate snapshots;
- room occupancy;
- child ages;
- supplier pricing;
- provider/reference persistence;
- per-stop booking state;
- Reservation mapper;
- Reservation repository;
- required Prisma schema changes;
- focused tests.

## Out of Scope

- Traveller redesign;
- Customer redesign;
- Prisma Journey model;
- Journey repository;
- PrismaService;
- Payment;
- PayFast;
- Invoice;
- QuickBooks;
- Hotelbeds calls;
- frontend;
- unrelated lint remediation.

---

# 34. Blocking Conditions

STOP and report if:

### BLOCKED — DOMAIN MISMATCH

The specified physical model cannot reconstruct the active Reservation aggregate.

### BLOCKED — SNAPSHOT CONTRACT

The actual Traveller, Journey or accommodation snapshot fields differ materially from the accepted application contracts.

### BLOCKED — LIFECYCLE

The Reservation lifecycle cannot be represented independently of existing Booking status.

### BLOCKED — PRICING

Final GCT price and supplier price cannot be represented independently.

### BLOCKED — SUPPLIER STATE

Per-stop supplier state cannot be represented without violating provider-neutral architecture.

Do not invent alternative persistence architecture.

---

# 35. Acceptance Criteria

- [ ] Booking is the physical Reservation root.
- [ ] `Booking.id` maps to Reservation identity.
- [ ] `Booking.bookingNumber` maps to Reservation number.
- [ ] Traveller is persisted as an immutable Reservation snapshot.
- [ ] Journey is persisted as an immutable Reservation snapshot.
- [ ] No Prisma Journey model is introduced.
- [ ] GCT lifecycle has its own physical status representation.
- [ ] Existing Booking status remains separate.
- [ ] Final GCT amount/currency is preserved.
- [ ] Supplier price/currency/pricing basis are separate.
- [ ] Multiple accommodation stops are supported.
- [ ] Stop order is preserved.
- [ ] Property snapshot is preserved.
- [ ] Room snapshot is preserved.
- [ ] Rate snapshot is preserved.
- [ ] Multiple rooms are supported.
- [ ] Room-level occupancy is preserved.
- [ ] Child ages are preserved.
- [ ] Stay dates are preserved.
- [ ] Provider and supplier references remain opaque.
- [ ] Supplier booking state is preserved per stop.
- [ ] Snapshot data is protected from operational updates.
- [ ] Reservation mapper contains no `any`.
- [ ] Reservation repository contains no `any`.
- [ ] Prisma types do not leak into domain/application contracts.
- [ ] Focused tests pass.
- [ ] Full Jest regression passes.
- [ ] Build passes.
- [ ] Prisma validation passes.
- [ ] Lint has 0 errors and 7 remaining warnings.
- [ ] No unrelated warnings are changed.
- [ ] No database migration is applied.
- [ ] No commit is created by Copilot.

---

# 36. Copilot Report

Copilot MUST return:

## Implementation Status

- completed / partially completed / blocked

## Physical Model

Report:

- Booking root;
- Reservation identity;
- reservation number;
- Traveller snapshot;
- Journey snapshot;
- lifecycle;
- accommodation stop structure;
- room structure;
- occupancy;
- pricing;
- supplier state.

## Prisma Changes

Report:

- models added;
- models modified;
- fields added;
- relationships added;
- Prisma client regenerated;
- migration generated;
- migration applied.

## Files Changed

List all production, test and Prisma files.

## Warning Reduction

Report:

- baseline;
- final;
- warnings removed;
- remaining `no-explicit-any`;
- other warnings.

## Verification

Report exact:

- focused tests;
- full Jest;
- build;
- Prisma validation;
- lint;
- TypeScript/language-service.

## Scope Audit

Confirm:

- Traveller modified: NO;
- Customer modified: NO;
- Journey model modified/created: NO;
- PrismaService modified: NO;
- Reservation persistence modified: YES;
- Prisma schema modified: YES/NO;
- database modified: NO;
- API modified: NO;
- providers modified: NO;
- ESLint configuration modified: NO;
- suppressions added: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- commit created: NO.

## Exceptions

List unresolved issues, if any.

---

# 37. Completion Boundary

Batch 3F ends when the defined Reservation physical persistence contract is implemented and verified.

Do not proceed to:

- Journey persistence implementation;
- PrismaService remediation;
- remaining lint warnings;
- frontend implementation.

After the Copilot report:

Architect Acceptance
→ User Commit

Copilot MUST NOT create the commit.