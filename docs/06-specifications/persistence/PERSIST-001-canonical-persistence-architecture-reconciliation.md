# PERSIST-001 — Canonical Persistence Architecture Reconciliation

## Document Control

| Field | Value |
|---|---|
| Document ID | PERSIST-001 |
| Title | Canonical Persistence Architecture Reconciliation |
| Version | 1.0 |
| Status | Verified |
| Classification | Normative Persistence Implementation Specification |
| Owner | GCT Core Architecture |
| Governing Process | GOV-DEV-001 — GCT Core Development Process Governance |
| Related Specifications | SPEC-026, SPEC-027, SPEC-028, SPEC-029, SPEC-030 |
| Purpose | Reconcile the physical persistence implementation with the accepted canonical Reservation architecture |

---

# 1. Purpose

PERSIST-001 resolves the persistence architecture inconsistency identified during the read-only lint/semantic and persistence architecture reviews.

The current repository contains:

- the canonical application Reservation contract;
- a canonical Reservation Prisma repository implementation;
- a legacy Reservation persistence repository;
- legacy Reservation state still stored on Booking;
- a Prisma Reservation model currently representing supplier-operational state;
- two Prisma client lifecycle patterns;
- duplicate Reservation reconstruction mechanisms.

The objective is to establish one coherent physical persistence implementation of the already-approved Reservation architecture.

This specification does not redesign the GCT Core domain model.

---

# 2. Scope

## 2.1 In Scope

This iteration covers:

- canonical Reservation physical persistence;
- Reservation repository authority;
- legacy Reservation repository disposition;
- legacy Reservation mapper disposition;
- Booking Reservation-state disposition;
- Booking compatibility fallback;
- supplier fulfilment persistence boundary;
- Prisma client lifecycle authority;
- canonical persistence mapping;
- concrete Reservation repository composition;
- required Prisma schema/migration changes;
- focused persistence tests;
- directly related lint warnings.

## 2.2 Out of Scope

This iteration SHALL NOT include:

- frontend implementation;
- API redesign;
- supplier API changes;
- Hotelbeds changes;
- PayFast changes;
- QuickBooks changes;
- Booking commercial-process redesign;
- Reservation domain redesign;
- Journey redesign;
- Pricing redesign;
- payment redesign;
- unrelated mapper cleanup;
- unrelated lint remediation;
- new dependency-injection frameworks;
- platform baseline extraction;
- new tourism-platform architecture.

---

# 3. Architecture Alignment

PERSIST-001 SHALL preserve the accepted architecture established by:

- ARCH-000 — Architecture Manifest;
- SPEC-026 — Canonical Logical Data Model;
- SPEC-027 — Canonical Physical Data Model;
- SPEC-028 — Canonical Prisma Data Model;
- SPEC-029 — Repository / Persistence Architecture;
- SPEC-030 — Reservation Persistence Reconciliation and Implementation;
- GOV-DEV-001 — Development Process Governance.

Where historical persistence structures conflict with the current canonical model, the current accepted Reservation architecture takes precedence.

This iteration exists to bring the physical implementation into alignment with that architecture.

---

# 4. Canonical Business Semantics

## 4.1 Booking

Booking is the commercial transaction/process initiated by the customer.

Booking is NOT the Reservation Aggregate Root.

## 4.2 Reservation

Reservation is the canonical GCT Aggregate Root representing what Go Cape Tours must fulfil.

The canonical lifecycle is:

- CREATED
- QUOTED
- CONFIRMED
- AMENDED
- CANCELLED
- COMPLETED

## 4.3 Reservation Fulfilment

Reservation fulfilment may consist of:

- Go Cape internal fulfilment;
- Booking Items;
- supplier fulfilment;
- accommodation fulfilment;
- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- PricingSnapshot;
- PaymentSnapshot;
- supplier references/state;
- timeline;
- metadata.

Supplier fulfilment is subordinate to Reservation.

Supplier availability is not Reservation lifecycle state.

---

# 5. Canonical Physical Reservation Root

The Prisma `Reservation` model SHALL become the authoritative physical persistence root for the canonical GCT Reservation Aggregate.

The physical Reservation model SHALL represent GCT's Reservation and SHALL NOT represent an external supplier reservation.

The canonical physical model SHALL support the existing application Reservation contract, including:

- technical identity;
- reservationNumber;
- customerId;
- lifecycle;
- bookingStartDate;
- bookingEndDate;
- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- PricingSnapshot;
- PaymentSnapshot;
- supplier references/state;
- timeline;
- metadata.

No new domain concept may be introduced solely to satisfy persistence implementation.

---

# 6. Reservation Identity

The physical Reservation model SHALL preserve two distinct identities:

1. technical persistence identity;
2. business `reservationNumber`.

`reservationNumber` SHALL be unique.

The technical identity SHALL NOT be used as the business reservation number.

The existing application Reservation contract remains authoritative for Reservation identity semantics.

---

# 7. Supplier Fulfilment Reconciliation

The current Prisma `Reservation` model contains supplier-operational information including:

- booking association;
- booking-item association;
- supplier identity;
- supplier reservation reference;
- supplier reservation status;
- supplier reservation timestamps.

This information SHALL no longer define the meaning of the canonical GCT Reservation.

It SHALL be represented as Reservation-owned supplier fulfilment state.

The implementation SHALL preserve existing supplier fulfilment information.

Where the current physical structure can be safely retained as a child/fulfilment representation, it SHOULD be reused rather than replaced unnecessarily.

If physical restructuring is required, only the minimum structure necessary to preserve the existing supplier fulfilment contract SHALL be introduced.

No supplier API contract changes are permitted.

---

# 8. Booking Reservation State

The following Booking fields are legacy Reservation-root state:

- `reservationLifecycleCode`
- `journeySnapshot`
- `travellerSnapshots`
- `accommodationSnapshots`
- `pricingSnapshot`
- `paymentSnapshot`
- `supplierReferences`
- `reservationTimeline`
- `reservationMetadata`

These fields SHALL cease to be an authoritative source of Reservation state.

They SHALL NOT be written by the canonical Reservation repository.

Before removing or repurposing them, the implementation SHALL establish whether existing data requires preservation.

No destructive data loss is permitted.

If existing legacy data requires compatibility handling, that handling SHALL remain isolated from the canonical write path.

---

# 9. Booking Compatibility Fallback

The canonical Reservation repository MAY retain a legacy Booking read fallback only where it is required for historical persisted data.

If retained, the fallback SHALL satisfy all of the following:

- canonical Reservation lookup is always attempted first;
- fallback is read-only;
- fallback does not write Reservation state to Booking;
- fallback does not create a canonical Reservation;
- fallback does not modify Reservation state;
- fallback cannot become the normal authoritative persistence path;
- fallback is explicitly isolated as legacy compatibility behaviour;
- focused tests demonstrate the fallback behaviour.

The fallback SHALL NOT be used to compensate for an incomplete canonical physical Reservation model.

If the fallback cannot satisfy these conditions safely, it SHALL be removed from the canonical repository path.

---

# 10. Reservation Repository Authority

`CanonicalReservationPrismaRepository` SHALL be the sole concrete repository implementation for the canonical application Reservation repository contract.

The canonical application Reservation service SHALL depend on the persistence-neutral repository interface.

`ReservationPrismaRepository` SHALL NOT remain an alternative runtime Reservation implementation.

The legacy repository SHALL either:

- be removed when repository evidence proves it is unused; or
- remain isolated outside the canonical runtime path where required for controlled legacy compatibility.

It SHALL NOT remain a competing Reservation persistence authority.

---

# 11. Reservation Reconstruction

There SHALL be one canonical Reservation persistence-to-domain reconstruction path.

`canonical-reservation-prisma.repository.ts` SHALL own canonical reconstruction.

`ReservationMapper` SHALL NOT remain a second canonical Reservation reconstruction mechanism.

If `ReservationMapper` has no required runtime consumer after reconciliation, it SHALL be removed.

If a legacy compatibility consumer requires it, it SHALL remain outside the canonical persistence path and SHALL NOT be used to reconstruct the canonical Reservation during normal runtime.

---

# 12. Persistence Mapping Ownership

Persistence mapping SHALL remain behind the infrastructure persistence boundary.

The canonical Reservation persistence implementation SHALL use explicit persistence types.

Application-layer code SHALL NOT depend directly on Prisma persistence models.

The implementation SHALL not introduce Prisma types into domain or application contracts.

Existing mapper locations SHALL only be changed where required to establish the canonical persistence boundary.

Unrelated Journey mapper restructuring is out of scope.

---

# 13. Prisma Client Lifecycle

`bootstrap/prisma.ts` SHALL be the authoritative application Prisma lifecycle.

The canonical Reservation persistence implementation SHALL use the typed Prisma client established by this lifecycle.

`PrismaService` SHALL NOT remain a second production Prisma lifecycle.

If `PrismaService` has no production runtime consumer, it SHALL be removed from the canonical persistence path.

If test injection requires a shared Prisma client abstraction, the implementation SHALL use the existing typed Prisma client contract rather than an `any`-typed client holder.

No new dependency-injection framework is permitted.

---

# 14. Runtime Repository Composition

The canonical Reservation runtime composition SHALL be:

Reservation application service
→ persistence-neutral ReservationRepository
→ CanonicalReservationPrismaRepository
→ authoritative typed Prisma client
→ canonical Reservation physical model.

The implementation SHALL establish the concrete repository composition using the repository's existing dependency-injection/composition conventions.

The application service SHALL NOT construct the concrete repository internally where constructor injection is already established.

---

# 15. Schema Reconciliation

The Prisma schema SHALL be reconciled so that the canonical Reservation physical model supports the established Reservation application contract.

The schema SHALL no longer represent the Prisma `Reservation` model primarily as an external supplier reservation.

The schema SHALL preserve supplier fulfilment information required by the current application.

The implementation SHALL not introduce duplicate canonical Reservation state in both Booking and Reservation.

The legacy Booking Reservation fields SHALL not remain authoritative.

---

# 16. Migration and Data Safety

Any physical schema change required by this specification SHALL be represented by a Prisma migration.

Before removing or repurposing existing fields:

- determine whether existing data exists;
- preserve data that remains required;
- migrate data where required;
- verify the resulting structure;
- avoid destructive operations unless data preservation is established.

No production database state may be modified manually.

No unrelated schema cleanup is permitted.

---

# 17. Canonical Persistence Contract

The canonical Reservation persistence implementation SHALL preserve:

### Save

- Reservation identity;
- reservationNumber;
- lifecycle;
- customerId;
- booking dates;
- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- PricingSnapshot;
- PaymentSnapshot;
- supplier references/state;
- timeline;
- metadata.

### Retrieval

The repository SHALL reconstruct the complete canonical Reservation aggregate from the authoritative physical persistence model.

Supported existing repository lookups SHALL remain available:

- by technical identity;
- by reservationNumber;
- by traveller;
- by journey.

No new lookup capability is required.

---

# 18. Transactional Behaviour

Reservation persistence SHALL remain transactional.

A failed canonical Reservation save SHALL NOT leave a partially persisted Reservation state.

Existing transactional behaviour established by SPEC-030 SHALL be preserved.

Supplier fulfilment persistence associated with the Reservation SHALL remain consistent with the transaction boundary defined by the existing repository contract.

Do not introduce distributed transaction behaviour for external supplier APIs.

---

# 19. Tests

Focused tests SHALL cover at minimum:

1. canonical Reservation save;
2. lookup by technical identity;
3. lookup by reservationNumber;
4. lookup by traveller where currently supported;
5. lookup by journey where currently supported;
6. complete Reservation round-trip reconstruction;
7. lifecycle preservation;
8. reservationNumber uniqueness;
9. transactional rollback/failure behaviour;
10. canonical Reservation state is not written to Booking;
11. canonical repository does not depend on the legacy Reservation repository;
12. Booking fallback behaviour if retained;
13. preservation of supplier fulfilment information.

Tests SHALL use the existing repository testing conventions.

No live supplier APIs are permitted.

---

# 20. Verification

Copilot SHALL run:

- focused Reservation persistence tests;
- `npx prisma generate`;
- `npx prisma validate`;
- `npm run build`;
- `npm test -- --runInBand`;
- `npm run lint`.

The implementation report SHALL state:

- files changed;
- focused tests;
- focused test results;
- full regression results;
- build result;
- Prisma validation result;
- lint errors;
- lint warnings;
- migration changes;
- retained compatibility structures;
- any decision gaps.

---

# 21. Acceptance Criteria

PERSIST-001 is acceptable only when all of the following are true:

### Reservation authority

- Prisma Reservation is the canonical physical Reservation root;
- CanonicalReservationPrismaRepository is the sole canonical Reservation repository implementation;
- Booking is not authoritative for Reservation state;
- the legacy Reservation repository is no longer an alternative runtime authority.

### Physical model

- canonical Reservation persistence matches the accepted Reservation contract;
- supplier-operational data is subordinate to Reservation;
- duplicate canonical Reservation state is not maintained in Booking.

### Compatibility

- any retained Booking fallback is read-only and explicitly isolated;
- fallback cannot become a normal canonical persistence path;
- fallback behaviour is tested if retained.

### Infrastructure

- one authoritative Prisma client lifecycle exists;
- canonical Reservation persistence uses the typed Prisma client;
- the untyped PrismaService is not part of the canonical runtime path.

### Mapping

- one canonical Reservation reconstruction path exists;
- canonical persistence mapping is explicitly typed;
- domain/application contracts remain persistence-neutral.

### Data safety

- required migration exists;
- existing required data is preserved;
- no destructive data loss is introduced.

### Verification

- focused tests pass;
- full regression passes;
- build passes;
- Prisma validation passes;
- no new blocking lint errors are introduced.

Existing unrelated lint warnings may remain.

---

# 22. Scope Protection

Copilot SHALL NOT:

- redesign Booking;
- redesign Reservation domain behaviour;
- redesign Journey;
- redesign Pricing;
- redesign Payment;
- modify supplier APIs;
- modify Hotelbeds contracts;
- modify PayFast contracts;
- implement frontend capabilities;
- implement the tourism-platform baseline;
- fix unrelated lint warnings;
- refactor unrelated repositories;
- introduce speculative abstractions;
- remove historical data without evidence;
- implement future iterations.

If a new architectural problem is discovered outside this scope, stop and report it as a decision gap.

---

# 23. Decision-Gap Rule

If implementation cannot satisfy this specification without making an architectural decision not supported by the accepted project documentation or repository evidence:

STOP.

Report:

- the exact decision gap;
- affected component;
- current behaviour;
- applicable specification requirement;
- why implementation cannot safely continue.

Do not invent a solution.

---

# 24. Expected Result

The resulting persistence architecture SHALL be:

Customer Booking
→ Canonical GCT Reservation
→ Reservation fulfilment components
→ Canonical Reservation persistence
→ Typed Prisma client
→ Canonical Reservation physical model

Supplier fulfilment SHALL remain subordinate to the Reservation and SHALL NOT define the meaning of the canonical Reservation entity.

Historical Booking-root Reservation state SHALL cease to be authoritative.

There SHALL be one canonical Reservation persistence path.

There SHALL be one authoritative application Prisma lifecycle.

There SHALL be one canonical Reservation reconstruction path.

---

# 25. Related Documents

- GOV-DEV-001 — GCT Core Development Process Governance
- ARCH-000 — Architecture Manifest
- SPEC-000 — Engineering Specification Standard
- SPEC-026 — Canonical Logical Data Model
- SPEC-027 — Canonical Physical Data Model
- SPEC-028 — Canonical Prisma Data Model
- SPEC-029 — Repository / Persistence Architecture
- SPEC-030 — Reservation Persistence Reconciliation and Implementation

Relevant implementation areas:

- `canonical-reservation-prisma.repository.ts`
- `canonical-reservation-prisma.repository.test.ts`
- `reservation-prisma.repository.ts`
- `reservation.mapper.ts`
- `journey.mapper.ts`
- `journey-prisma.repository.ts`
- `prisma.service.ts`
- `bootstrap/prisma.ts`
- `prisma/schema.prisma`
- relevant Prisma migrations

---

# 26. Status

**Draft — Architect Review Required**

No implementation may begin until PERSIST-001 has completed the Architect Review stage defined by GOV-DEV-001.