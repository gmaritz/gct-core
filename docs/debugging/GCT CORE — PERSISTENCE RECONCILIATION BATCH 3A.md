# GCT CORE — PERSISTENCE RECONCILIATION BATCH 3A
## Focused Reservation Persistence Model Specification

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B3A-RESERVATION |
| Title | Reservation Persistence Model |
| Project | GCT Core |
| Type | Focused Implementation Specification |
| Status | Implementation Ready |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Dependencies | APP-004, APP-005, APP-006, PERSISTENCE-B2A, PERSISTENCE-B2B |
| Scope | Reservation persistence mapping and typing |
| Current Lint Warnings | 11 |
| Target | Remove the four Reservation persistence warnings |

---

## 2. Purpose

Implement the canonical persistence mapping for the GCT Reservation aggregate and reconcile it with the existing Prisma booking/reservation representation.

The implementation MUST:

- preserve the existing Reservation domain model;
- preserve APP-004 reservation and accommodation state;
- preserve the Traveller persistence decisions already accepted;
- explicitly type the Reservation mapper and repository;
- remove the four Reservation `no-explicit-any` warnings;
- avoid introducing unrelated persistence architecture.

This specification does not redesign the Reservation domain.

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

If an architectural contradiction is discovered that cannot be resolved within this specification, STOP and report it.

---

## 4. Architectural Boundary

Reservation remains a GCT domain concept.

The persistence boundary is:

Reservation
→ IReservationRepository
→ ReservationPrismaRepository
→ Prisma persistence representation

Prisma-specific types MUST remain inside infrastructure.

Supplier-specific DTOs and transport behaviour MUST remain inside APP-008.

---

## 5. Established Reservation Ownership

APP-004 owns:

- Reservation construction;
- reservation lifecycle;
- accommodation reservation snapshots;
- accommodation booking orchestration;
- reservation persistence.

APP-005 owns pricing.

APP-006 owns payment.

APP-007 owns accounting/invoicing.

APP-008 owns supplier booking and supplier-specific integration.

These boundaries MUST NOT be changed by this implementation.

---

## 6. Reservation Identity

The existing domain Reservation identity remains authoritative.

The persistence mapper MUST explicitly map the domain Reservation identity to the physical persistence identity.

Do not replace the domain identity with:

- supplier booking ID;
- supplier reservation reference;
- booking item ID.

If the existing Prisma `id` represents the physical Reservation identity, map it explicitly.

Do not introduce a new identity model.

---

## 7. Reservation Number

The domain Reservation contains a reservation number.

The implementation MUST preserve this value through persistence.

If the current physical Reservation representation does not contain a direct reservation-number field, the implementation MUST use an already-approved existing representation only where its equivalence is established.

Do not silently substitute:

- bookingId;
- bookingItemId;
- supplier reservation reference.

If no safe representation exists, STOP and report:

**BLOCKED — RESERVATION NUMBER PERSISTENCE REPRESENTATION REQUIRED**

---

## 8. Traveller Relationship

Reservation persistence MUST use the canonical Traveller identity established by:

- PERSISTENCE-B2A;
- PERSISTENCE-B2B.

Do not duplicate Traveller data inside Reservation persistence.

Do not persist:

- Traveller email;
- Customer email;
- Customer fields.

Where the existing Prisma model already provides the required relationship, use it.

Do not redesign Traveller persistence.

---

## 9. Journey Relationship

The current persistence model does not establish a Prisma Journey model.

Therefore this implementation MUST NOT:

- create a Prisma Journey model;
- create a new Reservation → Journey foreign key;
- invent a Journey persistence structure.

Where the existing Reservation persistence representation already supports Journey identity, preserve it.

If the domain Journey identity cannot be safely persisted using an existing approved representation, report the limitation without introducing a new Journey model.

---

## 10. Reservation Lifecycle

The GCT Reservation lifecycle is distinct from supplier booking state.

The implementation MUST preserve the existing domain Reservation status.

Do not assume Prisma `reservationStatusId` is equivalent to the domain lifecycle status without evidence from the existing canonical model.

If the physical status represents supplier state, keep it separate.

Do not redesign the status model.

---

## 11. Supplier Booking State

Reservation persistence MUST preserve the supplier booking information required by APP-004 and APP-008, including where already represented:

- provider identity;
- supplier booking reference;
- supplier booking item reference;
- supplier booking status;
- relevant booking timestamps.

Supplier information MUST remain provider-neutral.

Do not persist Hotelbeds DTOs.

---

## 12. Final GCT Package Price

The final GCT package price established by APP-005 MUST remain distinct from supplier pricing.

Reservation persistence MUST preserve the final GCT commercial price required by the Reservation aggregate.

Do not:

- replace it with supplier price;
- recalculate it during persistence;
- derive it from supplier prices.

Use the existing `Money` representation and established currency semantics.

---

## 13. Supplier Accommodation Price

Where APP-004 accommodation snapshots contain supplier pricing, preserve:

- supplier amount;
- supplier currency;
- pricing basis.

Supplier price MUST remain separate from final GCT package price.

Do not perform pricing calculations during persistence.

---

## 14. Accommodation Reservation Snapshot

The accepted APP-004 snapshot contains accommodation reservation state.

The persistence implementation MUST preserve the snapshot information required by the accepted Reservation model, including:

- package identity;
- stop identity;
- stop order;
- accommodation/property identity;
- selected room;
- selected rate;
- provider;
- opaque supplier references;
- stay dates;
- room occupancy;
- child ages;
- supplier price;
- supplier currency;
- pricing basis;
- booking state;
- supplier booking reference where available.

---

## 15. Snapshot Persistence Representation

Before modifying the Prisma schema, inspect the current schema for an existing approved persistence structure capable of representing the APP-004 snapshot.

If an existing suitable structure exists, use it.

Do not create a duplicate representation.

If no suitable structure exists, STOP and report:

**BLOCKED — ACCOMMODATION SNAPSHOT PERSISTENCE MODEL REQUIRED**

Do not invent a new schema model during this implementation.

---

## 16. Multiple Accommodation Stops

The persistence representation MUST preserve multiple accommodation stops independently.

Each stop MUST retain:

- stop identity;
- stop order;
- accommodation information;
- stay dates;
- selected room/rate;
- provider/reference information;
- booking state.

Do not flatten multiple stops into one record.

Do not overwrite one stop with another.

---

## 17. Multiple Rooms

The persistence representation MUST preserve multiple room selections.

Each room occupancy MUST retain:

- adults;
- children;
- child ages.

Do not reduce multiple rooms to a single aggregate guest count.

---

## 18. Supplier Reference Continuity

Opaque supplier references MUST remain intact through:

APP-003
→ APP-005
→ APP-004
→ APP-008

Reservation persistence MUST NOT reinterpret supplier references.

Do not introduce supplier-specific parsing.

---

## 19. Reservation Mapper

The Reservation mapper MUST explicitly type:

Domain → Persistence

and:

Persistence → Domain.

The mapper MUST NOT:

- use `any`;
- access Prisma directly;
- perform database operations;
- call suppliers;
- calculate prices;
- create Customers;
- create Travellers;
- create Journeys.

---

## 20. Persistence Representation

If the current mapper lacks an appropriate typed persistence representation, introduce a small infrastructure-level type corresponding to the actual persistence/query shape.

The type MUST represent actual stored/query data.

Do not simply copy the domain Reservation interface.

Do not create a broad generic persistence type.

Do not use:

`Record<string, any>`

---

## 21. Prisma Generated Types

Use Prisma-generated types where they accurately describe the actual query shape.

Where repository queries include related data, use the appropriate generated Prisma payload/include type.

The type MUST match the actual query.

Do not use the base Prisma Reservation type if the mapper receives a richer relation payload.

---

## 22. Repository Contract

`IReservationRepository` remains the canonical domain/application repository contract.

Do not expose:

- Prisma models;
- Prisma generated types;
- persistence row types;
- supplier DTOs.

The repository contract MUST remain domain-oriented.

Only the minimum typing necessary to represent the established persistence behaviour may be changed.

---

## 23. Repository Ownership

The canonical ownership remains:

`reservation-prisma.repository.ts`

→ `ReservationPrismaRepository`

→ `IReservationRepository`

Do not modify repository ownership.

Do not rename unrelated repository files.

---

## 24. Repository Save

Reservation save MUST preserve the existing domain Reservation state supported by the persistence model.

At minimum, preserve:

- Reservation identity;
- reservation number;
- lifecycle state;
- final GCT price;
- existing Traveller relationship;
- existing Journey representation;
- accommodation state;
- supplier booking references;
- timestamps.

Do not introduce unrelated writes.

---

## 25. Repository Update

Existing update behaviour MUST remain intact.

Do not:

- recreate supplier bookings;
- recalculate pricing;
- alter Customer associations;
- alter Traveller identity;
- alter Journey identity;
- overwrite unrelated accommodation stops.

Persist only the Reservation state represented by the established repository operation.

---

## 26. Repository Retrieval

Reservation retrieval MUST load all related persistence information required by the mapper.

Where the domain requires related information, the query MUST explicitly request it.

Do not rely on implicit Prisma relations.

Do not load unrelated data solely for convenience.

---

## 27. Reservation Round Trip

Where the persistence representation supports the complete Reservation state:

Domain Reservation
→ Persistence
→ Domain Reservation

MUST preserve the canonical Reservation information.

Any intentionally non-persistent domain information MUST already be established by the existing model.

Do not silently discard Reservation state.

---

## 28. Traveller Persistence Boundary

The Reservation implementation MUST use the canonical Traveller persistence relationship.

Do not modify:

- Traveller aggregate;
- Traveller preferences;
- Customer association;
- Traveller mapper.

Those are already accepted.

---

## 29. Journey Boundary

The Reservation implementation MUST NOT solve Journey persistence.

If Journey identity is not physically representable in the existing Reservation persistence model, report it as a dependency.

Do not introduce:

- Journey Prisma model;
- Journey foreign key;
- Journey repository;
- Journey schema changes.

---

## 30. Financial Boundary

Do not introduce accounting or payment persistence.

Reservation may preserve the final commercial price required by its domain contract.

Do not add:

- invoice fields;
- QuickBooks fields;
- PayFast fields;
- payment transaction data.

APP-006 and APP-007 remain separate capabilities.

---

## 31. Supplier Boundary

Do not introduce:

- Hotelbeds DTOs;
- Hotelbeds authentication;
- Hotelbeds transport;
- Hotelbeds retry logic;
- Hotelbeds-specific persistence types.

The Reservation persistence representation remains provider-neutral.

---

## 32. Type Safety

The four Reservation persistence `no-explicit-any` warnings MUST be removed.

No new:

- `any`;
- unsafe type assertions;
- lint suppressions;
- `@ts-ignore`;
- `@ts-expect-error`;

may be introduced.

If an `any` cannot be safely removed without an architectural decision:

STOP and report the exact dependency.

---

## 33. Focused Tests

Add or update tests covering:

### Identity

- Reservation identity;
- reservation number.

### Lifecycle

- status;
- confirmation;
- cancellation;
- timestamps.

### Pricing

- final GCT package price;
- supplier price;
- currency;
- pricing basis.

### Traveller

- canonical Traveller relationship.

### Accommodation

- one stop;
- multiple stops;
- stop order;
- one room;
- multiple rooms;
- child ages;
- room/rate references;
- provider/reference continuity.

### Supplier State

- supplier booking reference;
- supplier booking state.

### Mapping

- domain → persistence;
- persistence → domain.

---

## 34. Test Isolation

Tests MUST NOT make:

- Hotelbeds calls;
- PayFast calls;
- external supplier calls.

Use mocks/test doubles consistent with the existing test architecture.

---

## 35. Prisma Schema Changes

A Prisma schema change is NOT automatically authorised.

If the existing schema cannot represent a required Reservation concept, STOP and report the gap.

Do not add speculative columns or models.

Do not introduce a Journey model.

Do not redesign the existing booking model.

---

## 36. Acceptance Criteria

### AC-01 — Reservation Identity

Reservation identity is explicitly and safely persisted.

### AC-02 — Reservation Number

Reservation number has an established persistence representation.

### AC-03 — Traveller

Canonical Traveller identity is preserved.

### AC-04 — Journey

No speculative Journey persistence model is introduced.

### AC-05 — Lifecycle

GCT Reservation lifecycle remains distinct from supplier booking state.

### AC-06 — Supplier State

Supplier booking references and state remain traceable.

### AC-07 — Final Price

Final GCT package price remains distinct from supplier price.

### AC-08 — Supplier Price

Supplier amount, currency and pricing basis remain preserved.

### AC-09 — Accommodation Snapshot

Accepted APP-004 snapshot information remains persistable/reconstructable.

### AC-10 — Multiple Stops

Multiple accommodation stops remain independent and ordered.

### AC-11 — Multiple Rooms

Multi-room occupancy and child ages remain preserved.

### AC-12 — Mapper

Reservation mapper is explicitly typed in both directions.

### AC-13 — Repository

Reservation repository persistence/query rows are explicitly typed.

### AC-14 — Domain Isolation

Prisma types do not enter the domain or repository contract.

### AC-15 — Supplier Isolation

Supplier DTOs do not enter Reservation persistence.

### AC-16 — Tests

Focused Reservation persistence tests pass.

### AC-17 — Regression

Full Jest regression passes.

### AC-18 — Build

Build passes.

### AC-19 — Prisma

Prisma validation passes.

### AC-20 — Lint

The four targeted Reservation warnings are removed.

Expected warning progression:

11 → 7

### AC-21 — Scope

Traveller, Customer, Journey persistence and PrismaService remain untouched.

---

## 37. Verification Requirements

### Focused Tests

Run the relevant Reservation mapper/repository/persistence tests.

Report exact:

- suites;
- tests;
- failures.

### Full Regression

Run:

`npm test -- --runInBand`

Report:

- suites;
- tests;
- failures;
- skipped;
- exit status.

### Build

Run:

`npm run build`

### Prisma

Run:

`npx prisma validate`

Do not apply migrations or modify the database unless separately authorised by an approved schema decision.

### Lint

Run:

`npm run lint`

Report:

- errors;
- warnings;
- baseline;
- final;
- warnings removed;
- remaining `no-explicit-any`.

Expected target:

7 warnings.

### TypeScript

Run the TypeScript/language-service check against all changed Reservation persistence files.

---

## 38. Scope Audit

Copilot MUST confirm:

- Reservation domain modified only if strictly required: YES/NO;
- Reservation mapper modified: YES;
- Reservation repository modified: YES;
- Reservation tests modified: YES;
- Traveller modified: NO;
- Customer modified: NO;
- Journey persistence modified: NO;
- PrismaService modified: NO;
- Prisma schema modified: YES/NO;
- database modified: NO;
- API modified: NO;
- provider integrations modified: NO;
- ESLint configuration modified: NO;
- TypeScript configuration modified: NO;
- suppressions added: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- commit created: NO.

---

## 39. Blocking Conditions

STOP and report if any of the following is discovered:

**BLOCKED — RESERVATION IDENTITY MODEL REQUIRED**

if Reservation identity cannot be represented safely.

**BLOCKED — RESERVATION NUMBER PERSISTENCE REPRESENTATION REQUIRED**

if reservation number cannot be represented safely.

**BLOCKED — ACCOMMODATION SNAPSHOT PERSISTENCE MODEL REQUIRED**

if no approved physical structure can represent APP-004 snapshots.

**BLOCKED — JOURNEY PERSISTENCE MODEL REQUIRED**

if Reservation implementation requires a new Journey persistence model.

**BLOCKED — RESERVATION FINANCIAL PERSISTENCE MODEL REQUIRED**

if final GCT package price cannot be represented without an additional schema decision.

Do not make any of these architectural decisions implicitly.

---

## 40. Final Copilot Report

Return:

### Implementation Status

- completed / partially completed / blocked

### Persistence Model

State:

- Reservation identity;
- reservation number;
- Traveller relationship;
- Journey handling;
- GCT lifecycle;
- supplier booking state;
- final GCT price;
- supplier price;
- accommodation snapshot representation.

### Files Changed

List every changed:

- production file;
- test file;
- Prisma file;
- generated artifact, where applicable.

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
- Prisma validation;
- lint;
- TypeScript/language-service.

### Scope Audit

Confirm:

- Traveller modified: NO;
- Customer modified: NO;
- Journey persistence modified: NO;
- PrismaService modified: NO;
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

List any unresolved issue preventing completion.

---

## 41. Completion Boundary

This implementation ends with the Reservation persistence work defined above.

Do not proceed to:

- Journey persistence;
- PrismaService typing;
- remaining `no-explicit-any` remediation.

If an architectural contradiction is discovered, stop and report it.

Do not silently expand the scope.

After the Copilot implementation report, the result will be reviewed for Architect Acceptance.

The user performs the commit after acceptance.