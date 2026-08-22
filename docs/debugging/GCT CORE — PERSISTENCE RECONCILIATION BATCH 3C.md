# GCT CORE — PERSISTENCE RECONCILIATION BATCH 3C
## Focused Reservation Persistence Model Specification

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B3C-RESERVATION |
| Title | Reservation Persistence Model |
| Project | GCT Core |
| Type | Focused Implementation Specification |
| Status | Implementation Ready |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Predecessor | PERSISTENCE-B3B-RESERVATION-REVIEW |
| Dependencies | APP-004, APP-005, APP-008, PERSISTENCE-B2A |
| Scope | Reservation physical persistence model |
| Current Lint Warnings | 11 |
| Reservation Warnings | 4 |
| Target | Establish canonical Reservation persistence representation |

---

## 2. Purpose

Implement the canonical physical persistence model required to represent the accepted GCT Reservation aggregate and APP-004 accommodation reservation snapshot.

The implementation MUST reconcile the existing Prisma `Booking` and `Reservation` structures with the active Reservation application model.

The implementation MUST:

- preserve the existing Reservation domain boundary;
- preserve APP-004 accommodation snapshot semantics;
- preserve APP-005 pricing ownership;
- preserve APP-008 supplier boundaries;
- use the accepted Traveller persistence model;
- establish explicit physical persistence for the missing Reservation concepts;
- remove the four Reservation persistence `no-explicit-any` warnings once the physical model is established.

This specification MUST NOT redesign unrelated bounded contexts.

---

## 3. Governing Process

Follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

Required workflow:

Specification
→ Architect Review/Approval
→ Copilot Implementation
→ Focused Tests + Regression
→ Copilot Verification Report
→ Architect Acceptance
→ User Commit

Copilot MUST NOT create a commit.

If implementation exposes a contradiction that cannot be resolved within this specification, STOP and report it.

---

## 4. Source-of-Truth Findings

The preceding read-only Batch 3B review established:

- Prisma `Booking` is the closest existing commercial physical root.
- Prisma `Reservation` is an operational/supplier child.
- Neither currently represents the complete GCT Reservation state.
- `Booking.bookingNumber` is the candidate physical reservation number.
- `Booking.totalAmount` and currency are candidates for the final GCT price.
- No direct Reservation-to-Traveller relationship currently exists.
- No canonical Prisma Journey model exists.
- Accommodation snapshot persistence is not currently represented.
- Package stops are not currently represented.
- Room-level occupancy and child ages are not currently represented.
- Selected property/room/rate history is not currently represented.
- Supplier pricing is not currently represented.
- Supplier reservation reference/status is only partially represented.
- Per-stop booking state is not currently represented.

These findings are authoritative for this specification.

---

## 5. Physical Reservation Root

The existing Prisma `Booking` model SHALL be used as the physical commercial root for the GCT Reservation persistence model.

The physical Booking root is responsible for the Reservation-level concepts already represented by it, including:

- physical identity;
- booking/reservation number;
- customer relationship;
- booking dates;
- final commercial amount;
- currency;
- commercial booking status;
- itinerary/package relationship where applicable.

The domain Reservation remains the canonical domain aggregate.

The Prisma Booking record is its physical persistence root.

---

## 6. Reservation Operational Child

The existing Prisma `Reservation` model SHALL remain the operational/supplier reservation representation associated with the Booking.

It SHALL continue to represent concepts including:

- `bookingId`;
- `bookingItemId`;
- `supplierId`;
- supplier reservation reference;
- supplier reservation status;
- reservation timestamps.

These fields MUST NOT be repurposed to represent GCT Reservation concepts that belong to Booking.

---

## 7. Reservation Identity

The implementation MUST establish the explicit mapping:

Domain Reservation identity
→ Booking identity

and:

Booking identity
→ Domain Reservation identity.

The existing Booking identity MUST be used where it is the canonical physical identity.

Do not use:

- supplier reservation reference;
- supplier booking reference;
- booking item ID;

as the GCT Reservation identity.

---

## 8. Reservation Number

The implementation MUST establish:

Domain Reservation number
→ `Booking.bookingNumber`

and:

`Booking.bookingNumber`
→ Domain Reservation number.

If the active application Reservation contract does not currently expose the number directly, the persistence/application mapping MUST preserve the value without introducing a second physical reservation-number field.

Do not substitute supplier references for the GCT reservation number.

---

## 9. Traveller Relationship

The physical Reservation model MUST establish an explicit relationship between the Booking/Reservation boundary and the canonical Traveller.

The accepted Traveller model remains authoritative.

The implementation MUST NOT:

- duplicate Traveller information;
- duplicate Customer email;
- create a new Traveller model;
- alter the Traveller aggregate;
- alter the Customer model.

The relationship MUST resolve the actual Traveller identity required by the Reservation application model.

If the current schema cannot support the relationship without an additional architectural decision, STOP and report:

**BLOCKED — RESERVATION/TRAVELLER RELATIONSHIP MODEL**

---

## 10. Journey Relationship

Journey persistence remains a separate architectural dependency.

The implementation MUST NOT create a Prisma Journey model.

The implementation MUST inspect the existing Booking/Itinerary/Package relationships and use an existing canonical representation only if it can be demonstrated to represent the active Journey identity.

If no safe representation exists:

- do not invent one;
- preserve the current supported application behaviour;
- report:

**DEPENDENCY — JOURNEY PERSISTENCE MODEL**

Journey persistence is not to be implemented as part of this batch.

---

## 11. GCT Reservation Lifecycle

The physical Booking status SHALL represent the GCT Reservation lifecycle only where the existing status semantics are confirmed to be equivalent.

The active GCT lifecycle includes:

- `CREATED`;
- `QUOTED`;
- `CONFIRMED`;
- `AMENDED`;
- `CANCELLED`;
- `COMPLETED`.

Supplier operational status MUST remain separate.

If the current Booking status cannot safely represent the GCT lifecycle, add the minimum GCT lifecycle persistence representation required by this specification.

Do not repurpose `Reservation.reservationStatusId` as the GCT lifecycle if it represents supplier state.

---

## 12. Supplier Operational State

The existing Prisma `Reservation` model SHALL remain the physical home for supplier operational state where applicable.

Preserve:

- supplier identity;
- supplier reservation reference;
- supplier status;
- reserved timestamp;
- confirmed timestamp;
- cancelled timestamp.

Supplier state MUST remain distinct from GCT Reservation lifecycle.

---

## 13. Final GCT Package Price

The final GCT package price SHALL use the existing Booking financial representation where:

- `Booking.totalAmount`;
- associated currency;

represent the accepted APP-005 final commercial price.

The implementation MUST establish this mapping explicitly.

The final GCT price MUST NOT be replaced by supplier accommodation pricing.

---

## 14. Supplier Accommodation Price

Supplier accommodation pricing MUST be persisted separately from the final GCT package price.

The persistence representation MUST preserve:

- supplier amount;
- supplier currency;
- pricing basis.

Do not calculate or transform supplier pricing during persistence.

If no existing physical structure can safely represent this information, create the minimum Reservation-owned persistence structure required by this specification.

---

## 15. Accommodation Reservation Stop

Create a Reservation-owned physical representation for accommodation stops.

Each stop MUST be associated with the physical Booking/Reservation root.

Each stop MUST preserve:

- stop identity;
- stop order;
- accommodation selection;
- stay dates;
- booking state.

Multiple stops MUST be supported.

Do not flatten stops into the Booking root.

---

## 16. Accommodation Property Snapshot

Each accommodation stop MUST preserve the selected property/accommodation information required to reconstruct the accepted APP-004 snapshot.

The physical representation MUST retain sufficient historical information to identify the selected property even if the live accommodation catalogue subsequently changes.

Existing catalogue relationships MAY be retained as references.

The Reservation snapshot MUST NOT depend exclusively on future live catalogue state.

---

## 17. Room Selection

Each accommodation stop MUST support one or more selected rooms.

Each room selection MUST preserve:

- selected room identity/reference;
- selected rate identity/reference;
- occupancy.

Room selection MUST remain distinguishable from the property selection.

---

## 18. Rate Selection

The selected rate MUST be persisted independently from the selected room.

The physical representation MUST preserve the opaque supplier/provider rate reference required for:

- historical reconstruction;
- revalidation;
- booking continuity.

Do not interpret supplier rate references.

---

## 19. Multi-Room Occupancy

The physical model MUST support multiple rooms per accommodation stop.

Each room MUST preserve:

- adult count;
- child count;
- child ages.

Do not collapse multiple rooms into one total occupancy.

Do not store only a Booking-level traveller count where that would lose room-level information.

---

## 20. Child Ages

Child ages MUST be preserved exactly as supplied by the accepted accommodation selection.

Multiple child ages MUST be supported per room.

Do not derive or recalculate ages during persistence.

---

## 21. Stay Dates

Each accommodation stop MUST preserve:

- check-in;
- check-out.

The stop-level dates MUST remain independent of any Booking-level travel dates.

---

## 22. Provider Identity

The accommodation reservation representation MUST preserve provider identity using the existing provider/supplier identity model where available.

Provider identity MUST remain provider-neutral.

Do not add Hotelbeds-specific fields.

---

## 23. Supplier Selection References

The physical snapshot MUST preserve opaque references required by APP-004 and APP-008, including where applicable:

- property/accommodation reference;
- room reference;
- rate reference;
- supplier item reference;
- supplier booking reference.

Do not transform or interpret these values in persistence.

---

## 24. Immutable Snapshot

The accommodation selection information SHALL be persisted as Reservation snapshot data.

The snapshot MUST preserve the selected state at the time of pricing/reservation.

Subsequent supplier or catalogue changes MUST NOT overwrite the historical selection data.

At minimum, the snapshot preserves:

- property;
- room;
- rate;
- stay dates;
- occupancy;
- child ages;
- supplier price;
- currency;
- pricing basis;
- provider references.

---

## 25. Booking State

The accommodation reservation representation MUST preserve operational booking state independently from the immutable selection snapshot.

It MUST support:

- pending;
- revalidation required;
- validated;
- booking attempted;
- confirmed;
- failed;
- unknown.

A failed or unknown booking MUST NOT be represented as confirmed.

---

## 26. Per-Stop Booking State

Booking state MUST be associated with the relevant accommodation stop.

For multi-stop Reservations:

- each stop can have its own booking state;
- each stop can have its own supplier booking reference;
- one stop's failure MUST NOT overwrite another stop's state.

---

## 27. Supplier Booking Reference

The supplier booking reference MUST be stored against the relevant operational booking representation.

Where booking is per accommodation stop, the reference MUST remain associated with that stop.

Do not use supplier booking reference as the GCT Reservation identity.

---

## 28. Snapshot and Operational Separation

The physical model SHALL conceptually separate:

### Reservation Snapshot

- property;
- room;
- rate;
- dates;
- occupancy;
- child ages;
- supplier price;
- pricing basis;
- selection references.

### Operational Booking State

- provider;
- supplier booking reference;
- booking state;
- confirmation;
- failure;
- timestamps.

Do not allow operational updates to overwrite immutable selection information.

---

## 29. Physical Model

The resulting physical model SHALL conceptually support:

Booking

→ Reservation Accommodation Stop[]

→ Reservation Accommodation Room[]

→ Room Occupancy / Child Ages

and:

Reservation Accommodation Stop

→ Supplier Booking State

The existing Prisma `Reservation` record remains associated with the relevant Booking/BookingItem and represents supplier operational state where appropriate.

Exact Prisma naming MUST follow project naming conventions.

---

## 30. Existing Model Reuse

Reuse existing structures where their semantics match the accepted Reservation model.

The implementation SHALL reuse where applicable:

- `Booking` as commercial root;
- `Booking.bookingNumber`;
- `Booking.totalAmount`;
- Booking currency;
- existing BookingItem relationships;
- `Reservation.supplierId`;
- `Reservation.reservationReference`;
- `Reservation.reservationStatusId`;
- existing reservation timestamps;
- existing supplier relationship.

Do not duplicate these concepts.

---

## 31. New Persistence Structures

The implementation SHALL introduce only the minimum new structures required for concepts that do not currently have a physical representation.

The new structures MUST cover, as required:

- accommodation stop;
- selected property snapshot;
- selected room;
- selected rate;
- room occupancy;
- child ages;
- supplier pricing;
- pricing basis;
- per-stop booking state;
- per-stop supplier references.

Do not create unrelated persistence structures.

---

## 32. Traveller Persistence

Use the canonical Traveller persistence model already accepted under PERSISTENCE-B2A.

Do not modify:

- Traveller aggregate;
- TravellerPreferences;
- Customer relationship;
- Traveller mapper;
- Traveller repository.

Any new Reservation relationship MUST reference the canonical Traveller identity.

---

## 33. Journey Persistence

Journey remains outside this batch.

Do not create:

- Prisma Journey;
- Journey repository;
- Journey schema;
- Reservation-to-Journey foreign key requiring a new Journey model.

Use an existing physical Journey/Itinerary representation only if its equivalence to the active application Journey is established.

Otherwise report the dependency.

---

## 34. Reservation Mapper

After the physical model is established, the Reservation mapper MUST be explicitly typed.

It MUST map:

Domain Reservation
→ Reservation persistence representation

and:

Reservation persistence representation
→ Domain Reservation.

The mapper MUST preserve all supported Reservation state.

No `any` is permitted.

---

## 35. Persistence Representation

Where the physical query shape differs from the domain model, define an infrastructure-level typed persistence representation.

It MUST correspond to the actual query shape.

It MUST NOT:

- expose Prisma types to the domain;
- reproduce unrelated database fields;
- use `any`;
- use `Record<string, any>`.

---

## 36. Prisma Query Types

Repository queries MUST explicitly load the relations required by the mapper.

Use generated Prisma payload/include types corresponding to the actual query.

Do not type relation-rich queries as the base Prisma model.

---

## 37. Reservation Repository

`ReservationPrismaRepository` remains the implementation of:

`IReservationRepository`

The public repository contract MUST remain domain/application oriented.

Do not expose Prisma or persistence DTO types through the repository interface.

---

## 38. Save Behaviour

Reservation save MUST persist the canonical Reservation state through the physical Booking root and related structures.

It MUST preserve:

- identity;
- reservation number;
- Traveller relationship;
- supported Journey representation;
- lifecycle;
- final GCT price;
- accommodation snapshots;
- supplier pricing;
- booking state;
- supplier references.

---

## 39. Retrieval Behaviour

Reservation retrieval MUST reconstruct:

- Reservation identity;
- reservation number;
- lifecycle;
- Traveller identity;
- supported Journey reference;
- final GCT price;
- accommodation stops;
- rooms;
- occupancy;
- child ages;
- supplier pricing;
- provider;
- supplier references;
- booking state.

If a required field cannot be reconstructed, report the exact persistence gap.

---

## 40. Update Behaviour

Updates MUST NOT:

- overwrite immutable accommodation snapshot data unnecessarily;
- overwrite another accommodation stop;
- change Traveller identity;
- change Customer ownership;
- recalculate pricing;
- invoke suppliers.

Only explicitly supported Reservation changes may be persisted.

---

## 41. Prisma Schema Changes

Prisma schema changes are authorised only for the Reservation persistence structures defined by this specification.

Permitted scope:

- Reservation accommodation stop structure;
- Reservation accommodation room structure;
- occupancy/child-age structure;
- supplier pricing representation;
- per-stop booking state/reference;
- required Reservation-to-Traveller relationship.

Not permitted:

- Customer redesign;
- Traveller redesign;
- Journey model;
- Payment redesign;
- Invoice redesign;
- unrelated schema cleanup.

---

## 42. Database Migration

A migration MAY be generated if required by the Prisma schema changes.

A migration MUST NOT be applied to the database during this implementation unless separately authorised.

The completion report MUST explicitly state:

- migration generated: YES/NO;
- migration applied: NO.

---

## 43. Tests

Focused tests MUST cover:

### Reservation Root

- identity;
- reservation number;
- lifecycle;
- final GCT price.

### Traveller

- Reservation-to-Traveller relationship.

### Accommodation Stops

- one stop;
- multiple stops;
- stop ordering.

### Accommodation Selection

- property;
- room;
- rate;
- provider;
- opaque references.

### Occupancy

- adults;
- children;
- child ages;
- multiple rooms.

### Pricing

- supplier amount;
- supplier currency;
- pricing basis;
- separation from final GCT price.

### Booking State

- pending;
- revalidation;
- validated;
- confirmed;
- failed;
- unknown;
- per-stop outcomes.

### Mapping

- domain → persistence;
- persistence → domain;
- round-trip preservation.

---

## 44. Regression

Run:

`npm test -- --runInBand`

The report MUST provide exact:

- suites;
- tests;
- failures;
- skipped;
- exit status.

---

## 45. Build

Run:

`npm run build`

The build MUST pass.

---

## 46. Prisma Validation

Run:

`npx prisma validate`

If the schema is changed, regenerate the Prisma client.

Do not apply the database migration.

---

## 47. Lint

Run:

`npm run lint`

The four Reservation persistence `no-explicit-any` warnings MUST be removed.

Expected warning progression:

**11 → 7**

Do not modify the remaining Journey or PrismaService warnings.

Do not change ESLint configuration.

Do not add suppressions.

---

## 48. TypeScript

All changed Reservation persistence files MUST pass TypeScript/language-service validation.

No new:

- `any`;
- `@ts-ignore`;
- `@ts-expect-error`;
- unsafe type assertion used to bypass the physical model;

may be introduced.

---

## 49. Scope

### In Scope

- Reservation physical persistence model;
- Booking/Reservation reconciliation;
- Reservation-to-Traveller relationship;
- accommodation stop persistence;
- room/occupancy persistence;
- child-age persistence;
- supplier pricing persistence;
- provider/reference persistence;
- per-stop booking state;
- Reservation mapper typing;
- Reservation repository typing;
- focused tests;
- minimum Prisma schema changes required by the model.

### Out of Scope

- Journey persistence implementation;
- PrismaService;
- Traveller redesign;
- Customer redesign;
- Payment;
- PayFast;
- Accounting;
- QuickBooks;
- Invoice generation;
- Hotelbeds integration;
- frontend;
- unrelated lint warnings.

---

## 50. Blocking Conditions

STOP and report if:

### BLOCKED — RESERVATION ROOT

Booking cannot safely represent the active Reservation persistence root.

### BLOCKED — TRAVELLER RELATIONSHIP

The required Reservation-to-Traveller relationship cannot be established without redesigning Traveller or Customer.

### BLOCKED — JOURNEY

Reservation persistence cannot proceed without inventing a Journey model.

### BLOCKED — SNAPSHOT

The required APP-004 snapshot cannot be represented without an additional architectural decision.

### BLOCKED — PRICING

Final GCT price and supplier price cannot be separated safely.

### BLOCKED — BOOKING STATE

Per-stop provider-neutral booking state cannot be represented safely.

In all blocking cases:

- stop;
- report the exact contradiction;
- do not invent an architecture;
- do not create a commit.

---

## 51. Acceptance Criteria

### AC-01

Booking is established as the physical commercial Reservation root.

### AC-02

Reservation identity is explicitly mapped.

### AC-03

Reservation number is explicitly mapped to the canonical Booking number.

### AC-04

Reservation has an explicit relationship to the canonical Traveller.

### AC-05

No new Journey persistence model is introduced.

### AC-06

GCT lifecycle remains distinct from supplier operational state.

### AC-07

Final GCT package price is persisted separately from supplier pricing.

### AC-08

Supplier price, currency and pricing basis are preserved.

### AC-09

Multiple accommodation stops are independently persisted and ordered.

### AC-10

Selected property, room and rate are preserved.

### AC-11

Multiple rooms are supported.

### AC-12

Room-level adult/child occupancy is preserved.

### AC-13

Child ages are preserved.

### AC-14

Stay dates are preserved per accommodation stop.

### AC-15

Provider and supplier references remain opaque and provider-neutral.

### AC-16

Per-stop booking state is preserved.

### AC-17

Failed and unknown bookings are never represented as confirmed.

### AC-18

Immutable snapshot information is not overwritten by operational booking updates.

### AC-19

Reservation mapper contains no `any`.

### AC-20

Reservation repository row mapping contains no `any`.

### AC-21

Prisma types do not enter the domain.

### AC-22

Focused Reservation persistence tests pass.

### AC-23

Full Jest regression passes.

### AC-24

Build passes.

### AC-25

Prisma validation passes.

### AC-26

Lint has 0 errors and the four Reservation warnings are removed.

### AC-27

No unrelated warnings are modified.

### AC-28

No database migration is applied.

### AC-29

No commit is created by Copilot.

---

## 52. Final Copilot Report

Return:

### Implementation Status

- completed / partially completed / blocked

### Physical Model

State:

- physical Reservation root;
- Reservation identity;
- reservation number;
- Traveller relationship;
- Journey handling;
- accommodation stop structure;
- room/occupancy structure;
- supplier pricing;
- final GCT pricing;
- provider/references;
- booking state.

### Prisma Changes

Report:

- models added;
- models modified;
- fields added;
- relationships added;
- Prisma client regenerated;
- migration generated;
- migration applied.

### Files Changed

List all:

- production files;
- test files;
- Prisma files;
- generated artifacts.

### Warning Reduction

Report:

- baseline;
- final;
- warnings removed;
- remaining `no-explicit-any`;
- other warnings.

### Verification

Report:

- focused tests;
- full Jest regression;
- build;
- Prisma generation;
- Prisma validation;
- lint;
- TypeScript/language-service.

### Scope Audit

Confirm:

- Traveller modified: NO;
- Customer modified: NO;
- Journey persistence modified: NO;
- PrismaService modified: NO;
- Reservation persistence modified: YES;
- Prisma schema modified: YES/NO;
- database modified: NO;
- API modified: NO;
- provider integrations modified: NO;
- ESLint configuration modified: NO;
- suppressions added: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- commit created: NO.

### Exceptions

List any unresolved dependency or blocking condition.

---

## 53. Completion Boundary

This batch ends when the Reservation physical persistence model and its immediate mapper/repository representation are implemented and verified.

Do not proceed to:

- Journey persistence;
- PrismaService remediation;
- remaining `no-explicit-any` warnings.

After the Copilot verification report:

Architect Acceptance
→ User Commit

Copilot MUST NOT create the commit.