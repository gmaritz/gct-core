# GCT CORE — PERSISTENCE RECONCILIATION BATCH 3E
## Focused Reservation Physical Model Specification

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B3E-RESERVATION |
| Title | Reservation Physical Model |
| Project | GCT Core |
| Type | Focused Implementation Specification |
| Status | Implementation Ready |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Predecessor | PERSISTENCE-B3D-RESERVATION-REVIEW |
| Dependencies | APP-004, APP-005, APP-008, PERSISTENCE-B2A |
| Current Lint Warnings | 11 |
| Target | Remove the 4 Reservation persistence no-explicit-any warnings |

---

## 2. Purpose

Implement the accepted Reservation physical persistence model established by the 3D read-only review.

The implementation MUST:

- use Prisma `Booking` as the physical commercial Reservation root;
- preserve the accepted Traveller persistence model;
- introduce the minimum Reservation-owned accommodation snapshot structures;
- preserve final GCT price separately from supplier pricing;
- preserve per-stop supplier booking state;
- keep Journey persistence outside this batch;
- provide typed persistence representations for the Reservation mapper and repository.

This specification MUST NOT redesign the Reservation domain or unrelated bounded contexts.

---

## 3. Governing Process

Follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

Required sequence:

Specification
→ Architect Review
→ Copilot Implementation
→ Focused Tests + Regression
→ Copilot Report
→ Architect Acceptance
→ User Commit

Copilot MUST NOT create a commit.

If a blocking architectural contradiction is discovered, STOP and report it.

---

## 4. Canonical Physical Model

Prisma `Booking` SHALL be the physical commercial Reservation root.

The physical structure SHALL conceptually support:

- Booking identity and reservation number;
- Customer relationship;
- Traveller relationship;
- final GCT amount and currency;
- GCT commercial lifecycle;
- accommodation stops.

Each accommodation stop SHALL support:

- stop identity and order;
- property snapshot/reference;
- stay dates;
- room selections;
- supplier pricing;
- supplier booking state.

Each room SHALL support:

- room snapshot/reference;
- rate snapshot/reference;
- adults;
- children;
- child ages.

The existing Prisma `Reservation` SHALL remain the operational supplier reservation record.

It MUST NOT be treated as the complete GCT Reservation snapshot.

---

## 5. Reservation Identity

Canonical mappings:

- Domain Reservation identity → `Booking.id`
- Domain Reservation number → `Booking.bookingNumber`

Do NOT use:

- `BookingItem.id`;
- supplier reservation reference;
- supplier booking reference;

as the GCT Reservation identity or reservation number.

Do not introduce a duplicate reservation-number field.

---

## 6. GCT Lifecycle

`Booking` SHALL represent the GCT Reservation lifecycle where the existing Booking status semantics support the required lifecycle.

The implementation MUST explicitly verify the mapping between the active Reservation lifecycle and Booking status.

Supplier operational status MUST remain separate.

If Booking status cannot safely represent the GCT lifecycle, STOP and report:

`BLOCKED — BOOKING STATUS LIFECYCLE MAPPING`

Do not repurpose supplier status.

---

## 7. Final GCT Price

The canonical physical representation of the final GCT package price is:

- `Booking.totalAmount`;
- associated Booking currency.

The implementation MUST preserve amount and currency.

The GCT total MUST NOT be replaced or recalculated from supplier accommodation pricing.

---

## 8. Traveller Relationship

An explicit Booking/Reservation-to-Traveller relationship MUST be established.

The accepted Traveller persistence model remains authoritative.

Do NOT:

- modify the Traveller aggregate;
- modify Customer;
- modify TravellerPreferences;
- duplicate Traveller email;
- use `BookingContact` as the Traveller aggregate.

Use an explicit relationship or association structure.

If this cannot be implemented without redesigning Traveller or Customer, STOP and report:

`BLOCKED — RESERVATION/TRAVELLER RELATIONSHIP`

---

## 9. Accommodation Stop

Introduce a Reservation-owned physical accommodation-stop representation.

Each stop MUST have:

- unique identity;
- Booking association;
- deterministic order;
- accommodation/property selection;
- stay dates;
- supplier pricing;
- booking state.

Multiple stops MUST be supported.

Do not flatten accommodation stops into Booking.

---

## 10. Property Snapshot

The selected property MUST use a reference plus sufficient historical snapshot information to preserve the Reservation selection.

The Reservation MUST remain reconstructable if the live accommodation catalogue changes.

Reuse existing accommodation/property references where appropriate.

Do not duplicate the entire accommodation catalogue.

---

## 11. Room and Rate Selection

Each accommodation stop MUST support one or more room selections.

Each room MUST preserve:

- room reference;
- room snapshot information required for historical reconstruction;
- selected rate reference;
- rate snapshot information required for historical reconstruction;
- adult count;
- child count;
- child ages.

The selected rate MUST remain distinguishable from the selected room.

Supplier/provider rate references MUST remain opaque.

---

## 12. Occupancy and Child Ages

Room-level occupancy MUST preserve:

- adults;
- children;
- child ages.

Multiple rooms MUST be independently identifiable.

Multiple child ages MUST be supported per room.

Do not reduce occupancy to a single Booking-level participant count.

Child ages MUST be preserved as supplied and MUST NOT be recalculated during persistence.

---

## 13. Stay Dates

Each accommodation stop MUST preserve:

- check-in;
- check-out.

Stop-level dates MUST remain independent of Booking-level travel dates.

---

## 14. Supplier Pricing

Each accommodation stop MUST preserve supplier pricing separately from the final GCT price.

Persist:

- supplier amount;
- supplier currency;
- pricing basis.

Supplier pricing MUST NOT be used as the GCT Reservation total.

Persistence MUST NOT perform pricing calculations.

---

## 15. Provider and Supplier References

Provider identity SHALL reuse the existing supplier/provider model where semantically correct.

The physical model MUST support, where applicable:

- property reference;
- room reference;
- rate reference;
- supplier item reference;
- supplier booking reference.

References MUST remain opaque and provider-neutral.

No Hotelbeds-specific fields or types may be introduced.

---

## 16. Supplier Booking State

Supplier booking state MUST be separate from immutable accommodation selection data.

The physical model MUST support:

- pending;
- revalidation required;
- validated;
- booking attempted;
- confirmed;
- failed;
- unknown.

Failed and unknown states MUST remain distinguishable from confirmed.

Booking state MUST belong to the relevant accommodation stop.

For multiple stops:

- each stop may have independent booking state;
- each stop may have an independent supplier booking reference;
- one stop's failure MUST NOT overwrite another stop's state.

---

## 17. Immutable Reservation Snapshot

The accommodation selection MUST be retained as Reservation snapshot data.

At minimum it MUST preserve:

- property;
- room;
- rate;
- stay dates;
- occupancy;
- child ages;
- supplier amount;
- supplier currency;
- pricing basis;
- provider/reference data.

Later catalogue changes MUST NOT destroy historical Reservation selection data.

Operational booking updates MUST NOT overwrite immutable selection data.

---

## 18. Existing Prisma Structures

Reuse existing structures where their semantics are correct, including:

- `Booking`;
- `BookingItem`;
- `Reservation`;
- existing Supplier/Provider structures;
- existing Currency structures;
- existing accommodation/catalogue references.

Do not duplicate existing business concepts.

`BookingContact` MUST NOT substitute for the Traveller relationship.

---

## 19. New Persistence Structures

The implementation MAY introduce the minimum Reservation-owned structures required for:

- accommodation stops;
- room selections;
- occupancy;
- child ages;
- historical property/room/rate snapshot information;
- supplier pricing;
- pricing basis;
- provider/reference information;
- per-stop supplier booking state.

Names MUST follow existing project conventions.

No unrelated schema redesign is permitted.

---

## 20. Reservation Repository

`ReservationPrismaRepository` remains the infrastructure implementation of `IReservationRepository`.

The public repository contract MUST remain domain/application oriented.

Do not expose Prisma models or persistence DTOs through the repository interface.

Repository queries MUST explicitly load all relations required by the mapper.

---

## 21. Reservation Mapper

The Reservation mapper MUST become explicitly typed for:

- domain → persistence;
- persistence → domain.

No `any` is permitted.

Where Prisma query payloads differ from the domain model, define infrastructure-level persistence types corresponding to the actual query shape.

Do not introduce:

- `any`;
- `Record<string, any>`;
- `@ts-ignore`;
- `@ts-expect-error`;
- unsafe casts used only to bypass the physical model.

Prisma-generated payload types SHOULD be used where appropriate.

---

## 22. Save and Retrieval Behaviour

Saving MUST preserve:

- Reservation identity;
- reservation number;
- Traveller relationship;
- GCT lifecycle;
- final GCT amount/currency;
- accommodation stops;
- rooms;
- occupancy;
- child ages;
- supplier pricing;
- supplier references;
- booking state.

Retrieval MUST reconstruct the same supported state.

If required Reservation state cannot be reconstructed, STOP and report the persistence gap.

Updates MUST NOT:

- overwrite unrelated accommodation stops;
- destroy immutable snapshot data;
- change Traveller identity;
- change Customer ownership;
- recalculate pricing;
- invoke suppliers.

---

## 23. Journey Boundary

Journey persistence is explicitly OUT OF SCOPE.

Do NOT:

- create a Prisma Journey model;
- create a Journey foreign key;
- modify Journey persistence;
- create a Journey repository.

Existing Booking/Itinerary/package references may be preserved only where already supported.

If Reservation persistence requires a new Journey structure, STOP and report:

`DEPENDENCY — JOURNEY PERSISTENCE MODEL`

---

## 24. Traveller Boundary

Traveller persistence is already accepted.

Do NOT modify:

- Traveller aggregate;
- Customer;
- TravellerPreferences;
- Traveller mapper;
- Traveller repository.

Only the Reservation relationship to the accepted Traveller model is in scope.

---

## 25. Prisma Schema Scope

Permitted schema changes are limited to:

- Booking-to-Traveller relationship;
- Reservation accommodation stops;
- room selections;
- occupancy and child ages;
- historical property/room/rate snapshot information;
- supplier pricing;
- pricing basis;
- provider/reference information;
- per-stop supplier booking state.

Do NOT modify:

- Customer;
- Traveller structure;
- Journey;
- Payment;
- Invoice;
- unrelated supplier structures.

---

## 26. Migration and Database Safety

If schema changes are required:

- update Prisma schema;
- regenerate Prisma client;
- run `npx prisma validate`.

A migration MAY be generated for review if required by the schema change.

A database migration MUST NOT be applied during this iteration.

The report MUST state whether a migration was generated and confirm that none was applied.

---

## 27. Tests

Focused tests MUST cover:

### Reservation

- identity;
- reservation number;
- lifecycle;
- final GCT price.

### Traveller

- Booking/Reservation-to-Traveller relationship.

### Accommodation

- one stop;
- multiple stops;
- stop ordering;
- property;
- room;
- rate;
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
- separation from GCT total.

### Supplier State

- provider;
- supplier references;
- confirmed;
- failed;
- unknown;
- per-stop state.

### Mapping

- domain → persistence;
- persistence → domain;
- round-trip preservation.

---

## 28. Verification

Copilot MUST run:

- focused Reservation tests;
- `npm test -- --runInBand`;
- `npm run build`;
- `npx prisma validate`;
- `npm run lint`;
- relevant TypeScript/language-service checks.

No external Hotelbeds or PayFast calls are required.

---

## 29. Lint Target

Current repository baseline:

**11 warnings**

Reservation persistence warnings:

**4**

Expected result:

**7 warnings**

Only the four Reservation persistence `no-explicit-any` warnings are in scope.

Do NOT modify:

- Journey warnings;
- PrismaService warnings;
- ESLint configuration;
- unrelated files.

Do not add suppressions.

---

## 30. Scope

### In Scope

- Reservation physical persistence model;
- Booking/Reservation reconciliation;
- Booking-to-Traveller relationship;
- accommodation stop persistence;
- property/room/rate snapshot;
- room occupancy;
- child ages;
- supplier pricing;
- supplier references;
- per-stop booking state;
- Reservation mapper typing;
- Reservation repository typing;
- focused tests;
- minimum Prisma schema changes required by this model.

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
- unrelated lint remediation.

---

## 31. Blocking Conditions

STOP and report if:

### BLOCKED — BOOKING STATUS

The GCT lifecycle cannot safely map to the existing Booking status.

### BLOCKED — TRAVELLER

The Traveller relationship requires redesign of Traveller or Customer.

### BLOCKED — SNAPSHOT

The required accommodation snapshot cannot be represented safely.

### BLOCKED — JOURNEY

Reservation persistence requires a new Journey persistence model.

### BLOCKED — PRICE

Final GCT price and supplier price cannot be physically separated.

### BLOCKED — BOOKING STATE

Per-stop supplier state cannot be represented safely.

Do not invent architecture to bypass a blocking condition.

---

## 32. Acceptance Criteria

- [ ] `Booking` is the physical commercial Reservation root.
- [ ] `Booking.id` represents Reservation identity.
- [ ] `Booking.bookingNumber` represents the GCT reservation number.
- [ ] Reservation has an explicit canonical Traveller relationship.
- [ ] GCT lifecycle is distinct from supplier operational state.
- [ ] Final GCT amount/currency is preserved.
- [ ] Supplier price/currency/pricing basis are preserved separately.
- [ ] Multiple accommodation stops are supported.
- [ ] Stop ordering is preserved.
- [ ] Property, room and rate selection are preserved.
- [ ] Multiple rooms are supported.
- [ ] Adult/child occupancy is preserved per room.
- [ ] Child ages are preserved.
- [ ] Stay dates are preserved per stop.
- [ ] Provider and supplier references remain opaque and provider-neutral.
- [ ] Supplier booking state is preserved per stop.
- [ ] Immutable selection data is protected from operational updates.
- [ ] Reservation mapper contains no `any`.
- [ ] Reservation repository persistence rows contain no `any`.
- [ ] Prisma types do not leak into domain/application contracts.
- [ ] Focused tests pass.
- [ ] Full Jest regression passes.
- [ ] Build passes.
- [ ] Prisma validation passes.
- [ ] Lint has 0 errors and 7 remaining warnings.
- [ ] No unrelated warnings are modified.
- [ ] No database migration is applied.
- [ ] Copilot creates no commit.

---

## 33. Copilot Implementation Report

Copilot MUST report:

### Implementation Status

- completed / partially completed / blocked

### Physical Model

Summarise:

- Reservation root;
- identity;
- reservation number;
- Traveller relationship;
- accommodation structures;
- pricing;
- supplier state;
- Journey handling.

### Prisma Changes

Report:

- models added;
- models modified;
- relationships added;
- fields added;
- Prisma client regenerated;
- migration generated;
- migration applied.

### Files Changed

List all production and test files changed.

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
- full Jest;
- build;
- Prisma validation;
- lint;
- TypeScript/language-service.

### Scope Confirmation

Confirm:

- Traveller modified: NO;
- Customer modified: NO;
- Journey modified: NO;
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

### Exceptions

List unresolved issues or dependencies, if any.

---

## 34. Completion Boundary

This iteration ends when the Reservation physical persistence model and immediate mapper/repository typing are implemented and verified.

Do NOT proceed to:

- Journey persistence;
- PrismaService remediation;
- remaining `no-explicit-any` warnings;
- frontend implementation.

After the Copilot report, the implementation follows the normal GOV-DEV-001 process:

Copilot Report
→ Architect Acceptance
→ User Commit

Copilot MUST NOT create the commit.