# GCT CORE — PERSISTENCE RECONCILIATION BATCH 3K-C
## Reservation Contract Consolidation Implementation Specification

## Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B3K-C |
| Title | Reservation Contract Consolidation Implementation Specification |
| Project | GCT Core |
| Status | Pending Architect Approval |
| Type | Focused Implementation Specification |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Predecessor | PERSISTENCE-B3K-A |
| Review Basis | PERSISTENCE-B3K-R |
| Downstream | PERSISTENCE-B3L |

---

# 1. Purpose

Consolidate the two existing Reservation application paths into one canonical Reservation application contract.

The accepted 3K-A architectural decision is:

**OPTION C — CONSOLIDATED CANONICAL PATH**

The newer `application/reservations` contract becomes the semantic source of truth.

The existing legacy persistence path contributes only validated persistence-boundary concepts that are compatible with the canonical contract.

This iteration establishes the canonical application contract and persistence boundary required before physical Reservation persistence is specified.

---

# 2. Architectural Boundary

3K-C SHALL establish:

- one canonical Reservation aggregate;
- one canonical Reservation lifecycle;
- one canonical Reservation number;
- one canonical Reservation creation flow;
- one canonical repository boundary;
- one canonical persistence context;
- one canonical Traveller snapshot contract;
- one canonical Journey snapshot contract;
- one canonical accommodation snapshot contract;
- one canonical pricing contract;
- one canonical supplier-state contract.

3K-C SHALL NOT implement physical Prisma persistence.

---

# 3. Canonical Reservation Contract

The `application/reservations` Reservation aggregate SHALL become the canonical Reservation aggregate.

It is the semantic source of truth for:

- technical identity;
- Reservation number;
- lifecycle;
- Traveller snapshots;
- Journey snapshot;
- accommodation snapshots;
- pricing;
- supplier references and state;
- timeline;
- metadata.

The legacy Reservation aggregate SHALL cease to be an independent canonical contract.

---

# 4. Canonical Lifecycle

The canonical GCT Reservation lifecycle SHALL be:

- `CREATED`
- `QUOTED`
- `CONFIRMED`
- `AMENDED`
- `CANCELLED`
- `COMPLETED`

The legacy `PENDING` lifecycle SHALL NOT remain as a competing Reservation lifecycle.

Booking status remains a separate physical/commercial concept.

Supplier operational status remains separate from the GCT Reservation lifecycle.

3K-C SHALL NOT introduce a Prisma lifecycle field.

---

# 5. Reservation Identity

`ReservationIdentity.id` SHALL remain the technical Reservation identity.

It MUST remain distinct from the business Reservation number.

No existing identity-generation behaviour shall be replaced unless required to establish the canonical aggregate.

---

# 6. Reservation Number

The canonical Reservation contract SHALL contain:

`reservationNumber`

The value SHALL:

- be generated during Reservation creation;
- be immutable after creation;
- be returned during retrieval;
- be available to Reservation lookup;
- remain distinct from `ReservationIdentity.id`.

The existing B3K generation convention MAY be retained only if Copilot confirms that it represents an established project convention.

The reported convention is:

`RES-<last 6 timestamp digits>-<4-char token>`

If no established convention exists, STOP with:

`BLOCKED — RESERVATION NUMBER GENERATION CONVENTION`

Do not invent a replacement convention during 3K-C.

Physical mapping to `Booking.bookingNumber` belongs to B3L.

---

# 7. Canonical Reservation Service

The canonical application service SHALL be:

`application/reservations/service/reservation-service.ts`

It SHALL remain responsible for:

1. request validation;
2. policy validation;
3. Reservation construction;
4. Reservation identity;
5. Reservation number;
6. Reservation lifecycle;
7. Traveller snapshots;
8. Journey snapshot;
9. accommodation snapshots;
10. pricing;
11. supplier references/state where applicable;
12. timeline and metadata.

The legacy `CreateReservationService` SHALL NOT remain an independent canonical creation flow.

---

# 8. Canonical Reservation Builder

The existing canonical Reservation builder SHALL remain responsible for constructing the canonical Reservation aggregate.

It MUST preserve the existing semantic model.

The builder MUST NOT depend on:

- Prisma;
- Prisma-generated types;
- database records;
- HTTP;
- Hotelbeds;
- PayFast.

Where Reservation number is required by the canonical aggregate, it SHALL be supplied through the approved application contract.

---

# 9. Canonical Repository Boundary

Introduce or adapt one persistence-neutral Reservation repository interface for the canonical Reservation aggregate.

The repository boundary SHALL support, where required by the existing application contract:

- save;
- find by technical identity;
- find by Reservation number;
- find by Traveller;
- find by Journey.

Only queries that remain semantically valid for the canonical aggregate SHALL be retained.

The repository interface MUST NOT expose:

- Prisma types;
- Prisma models;
- Booking database types;
- database-specific status types.

---

# 10. Persistence Context

The B3K `ReservationPersistenceContext` concept SHALL be retained and adapted to the canonical Reservation flow.

It SHALL contain only persistence-boundary information not owned by the Reservation aggregate.

Required context values are:

- `customerId`;
- `bookingStartDate`;
- `bookingEndDate`.

`bookingStatus` MAY be included only if an authoritative existing application source is confirmed.

The context MUST NOT contain:

- Prisma clients;
- Prisma models;
- database records;
- duplicate Reservation state.

---

# 11. Customer Context

Customer identity SHALL enter the canonical Reservation creation flow explicitly.

Rules:

- `customerId` SHALL be explicit;
- no implicit Customer creation;
- no Customer creation as a side effect;
- no Customer inference from Traveller email;
- no Customer inference from Traveller identity;
- no Customer schema redesign.

If the canonical flow cannot provide Customer identity from an existing authoritative application source, STOP with:

`BLOCKED — CUSTOMER CONTEXT`

---

# 12. Booking Dates

The canonical Reservation flow SHALL provide:

- `bookingStartDate`;
- `bookingEndDate`.

The implementation SHALL reuse an existing authoritative travel-period source where its semantics match Booking dates.

The implementation MUST NOT derive Booking dates from arbitrary persistence child records.

If no authoritative source exists, STOP with:

`BLOCKED — BOOKING DATE SOURCE`

---

# 13. Traveller Snapshots

The `application/reservations` Traveller snapshot collection SHALL remain canonical.

It SHALL preserve:

- ordered collection semantics;
- snapshot contents;
- Reservation ownership;
- historical immutability.

Traveller snapshots MUST NOT be replaced by live:

- Traveller foreign keys;
- Customer foreign keys;
- BookingContact records.

No Traveller Prisma changes are permitted.

---

# 14. Journey Snapshot

The canonical Journey representation SHALL remain the Reservation-owned immutable Journey snapshot.

3K-C SHALL NOT:

- create a Prisma Journey model;
- create a Reservation-to-Journey foreign key;
- replace the snapshot with Package;
- replace the snapshot with Itinerary;
- introduce Journey persistence.

Physical Journey representation remains a later persistence decision.

---

# 15. Accommodation Snapshots

The canonical accommodation snapshot collection SHALL remain authoritative.

The implementation SHALL preserve the existing semantics for:

- accommodation stops;
- stop ordering;
- property selection;
- room selection;
- rate selection;
- stay dates;
- occupancy;
- child ages;
- supplier pricing;
- provider;
- supplier references;
- supplier booking state.

3K-C SHALL NOT create the physical accommodation persistence structures.

---

# 16. Pricing

The canonical Reservation pricing contract SHALL be `PricingSnapshot`.

The final GCT commercial amount SHALL remain:

`PricingSnapshot.totalPrice`

The authoritative currency SHALL remain:

`PricingSnapshot.currency`

Supplier accommodation pricing SHALL remain separate from final GCT pricing.

The legacy `Money`-only Reservation representation SHALL NOT become the canonical pricing contract.

---

# 17. Supplier State

The canonical Reservation contract SHALL retain the newer supplier reference/state model.

Supplier state MUST remain separate from:

- GCT Reservation lifecycle;
- immutable accommodation selection;
- final GCT pricing.

No Hotelbeds calls are permitted.

No supplier integration behaviour is implemented by 3K-C.

---

# 18. Timeline and Metadata

The canonical Reservation contract SHALL retain the newer timeline and metadata model.

The legacy basic timestamp representation MUST NOT replace the canonical timeline/metadata contract.

3K-C SHALL NOT introduce new business events solely to support persistence.

---

# 19. Canonical Presentation

Reservation presentation SHALL expose the explicit canonical:

`reservationNumber`

The following behaviour is prohibited as the canonical business-number implementation:

`reservationNumber = identity.id`

Presentation mapping SHALL consume the explicit Reservation number.

No new Reservation endpoint is introduced.

---

# 20. Legacy Path Treatment

The legacy `domain/services` Reservation path is no longer authoritative.

Copilot SHALL determine the smallest safe treatment of the existing implementation:

- adapt callers to the canonical contract;
- delegate to the canonical service;
- retain temporarily as a compatibility adapter;
- retire code proven to be unused.

Do not delete legacy code solely because it is non-canonical.

If a production dependency prevents safe treatment within this iteration, STOP with:

`BLOCKED — LEGACY CONSUMER`

---

# 21. Legacy Creation Service

The legacy `CreateReservationService` SHALL NOT remain an independent source of Reservation business semantics.

Where existing consumers require it, the implementation SHALL prefer:

- delegation to the canonical service; or
- a narrow compatibility adapter.

It MUST NOT maintain a separate:

- lifecycle;
- Reservation number;
- aggregate construction model;
- persistence contract.

---

# 22. Legacy Repository

The existing `IReservationRepository` and `ReservationPrismaRepository` MAY provide reusable infrastructure patterns.

They MUST NOT automatically become the repository implementation for the canonical aggregate.

Copilot SHALL adapt or replace the repository boundary only where required to support the canonical `application/reservations` contract.

Physical Prisma mapping remains outside this iteration.

---

# 23. B3K Existing Changes

The existing B3K implementation SHALL be treated as candidate transferable work.

Potentially reusable:

- Reservation number generator;
- explicit Reservation number;
- Customer persistence context;
- Booking date context;
- persistence-neutral repository context.

Copilot SHALL reassess each change against the canonical application/reservations contract.

Do not blindly copy the B3K implementation.

Do not accept B3K as complete until its applicable changes exist on the canonical path.

---

# 24. Repository/Application Dependency

The canonical dependency SHALL remain:

Reservation application service
→ Reservation repository interface
→ persistence implementation

The application service MUST NOT depend directly on:

- `PrismaClient`;
- `ReservationPrismaRepository`;
- Prisma Booking;
- Prisma database records.

The repository interface remains persistence-neutral.

---

# 25. Domain Dependency Rules

The canonical Reservation domain/application contract MUST NOT depend on:

- Prisma;
- database entities;
- Express;
- HTTP;
- Hotelbeds;
- PayFast.

The persistence context is an application boundary contract and MUST remain database-neutral.

---

# 26. Compatibility Requirements

Existing accepted Reservation behaviour SHALL be preserved unless directly superseded by the canonical 3K-A decisions.

The following are deliberate contract changes:

- six-state lifecycle becomes authoritative;
- explicit Reservation number becomes authoritative;
- newer snapshot-oriented Reservation model becomes authoritative;
- legacy `PENDING` lifecycle ceases to be canonical.

Do not introduce unrelated behaviour changes.

---

# 27. Tests

Focused tests SHALL cover the canonical path.

## Aggregate

Verify:

- creation;
- identity;
- Reservation number;
- lifecycle;
- Traveller snapshots;
- Journey snapshot;
- accommodation snapshots;
- pricing;
- supplier state;
- timeline;
- metadata.

## Application Service

Verify:

- validation;
- policy execution;
- aggregate construction;
- Reservation number;
- Customer context;
- Booking dates;
- repository interaction.

## Repository Boundary

Verify:

- save contract;
- retrieval contract;
- persistence-context propagation.

## Presentation

Verify:

- explicit Reservation number;
- no identity-derived business number.

## Compatibility

Where a legacy adapter remains, verify that it delegates/adapts to the canonical contract without preserving conflicting lifecycle semantics.

---

# 28. Prisma and Database Scope

3K-C SHALL NOT modify:

- Prisma schema;
- Prisma models;
- migrations;
- database state;
- seed data;
- physical Reservation structures;
- Booking structures;
- accommodation persistence structures;
- Journey persistence structures.

`npx prisma validate` MAY be run as normal verification.

---

# 29. API Scope

3K-C SHALL NOT:

- add Reservation routes;
- add Reservation controllers;
- modify route composition;
- introduce new endpoints.

The current absence of a Reservation runtime endpoint remains a known architectural state.

Future API work SHALL consume the canonical Reservation application contract.

---

# 30. Lint Scope

Current baseline:

- 0 errors;
- 11 warnings.

3K-C is NOT a general lint-remediation iteration.

Do not:

- modify ESLint configuration;
- add suppressions;
- remediate unrelated warnings;
- refactor unrelated code.

Only warnings directly caused by the consolidation may be addressed.

---

# 31. Scope

## In Scope

- canonical Reservation aggregate;
- canonical lifecycle;
- explicit Reservation number;
- canonical Reservation service;
- canonical Reservation builder;
- repository abstraction;
- ReservationPersistenceContext;
- Customer context;
- Booking dates;
- Traveller snapshots;
- Journey snapshot;
- accommodation snapshots;
- PricingSnapshot;
- supplier state;
- timeline;
- metadata;
- presentation mapping;
- legacy-path adaptation;
- B3K change transfer;
- focused tests.

## Out of Scope

- Prisma schema;
- Prisma migrations;
- database;
- physical Reservation model;
- physical accommodation snapshot model;
- Journey persistence;
- Customer redesign;
- Traveller redesign;
- Reservation API endpoints;
- Hotelbeds calls;
- PayFast calls;
- Invoice;
- frontend;
- unrelated lint remediation.

---

# 32. Blocking Conditions

STOP implementation and report if:

### BLOCKED — CANONICAL AGGREGATE

The `application/reservations` aggregate cannot represent the accepted Reservation semantics.

### BLOCKED — LIFECYCLE

The six-state Reservation lifecycle cannot be established as the single canonical lifecycle.

### BLOCKED — RESERVATION NUMBER

No approved Reservation-number generation convention exists.

### BLOCKED — CUSTOMER CONTEXT

Customer identity cannot be supplied through an authoritative application source.

### BLOCKED — BOOKING DATE SOURCE

No authoritative source exists for Booking start/end dates.

### BLOCKED — REPOSITORY

A persistence-neutral repository boundary cannot be established without Prisma leakage.

### BLOCKED — LEGACY CONSUMER

An active consumer requires the legacy contract and cannot be safely adapted within scope.

### BLOCKED — CONTRACT LOSS

Consolidation would lose established Reservation semantics.

Do not invent workarounds.

---

# 33. Verification

Copilot SHALL run focused tests first.

Then run the standard project verification:

- `npm run build`
- `npm test -- --runInBand`
- `npx prisma validate`
- `npm run lint`

TypeScript/language-service validation SHALL also be performed as appropriate.

No Hotelbeds calls.

No PayFast calls.

No database migration.

Expected lint baseline:

0 errors, 11 warnings, unless a warning is directly caused by this consolidation.

---

# 34. Acceptance Criteria

- [ ] `application/reservations` is the semantic Reservation source of truth.
- [ ] One Reservation aggregate is canonical.
- [ ] Six-state Reservation lifecycle is canonical.
- [ ] Legacy `PENDING` lifecycle is no longer independently canonical.
- [ ] Explicit Reservation number exists.
- [ ] Reservation number is distinct from technical identity.
- [ ] Approved numbering convention is reused.
- [ ] Canonical Reservation creation flow is established.
- [ ] Canonical repository abstraction is established.
- [ ] Persistence context is persistence-neutral.
- [ ] Customer context is explicit.
- [ ] Booking dates are explicit.
- [ ] Traveller snapshots remain canonical.
- [ ] Journey snapshot remains canonical.
- [ ] Accommodation snapshot semantics remain canonical.
- [ ] PricingSnapshot remains canonical.
- [ ] Supplier state remains distinct from GCT lifecycle.
- [ ] Timeline and metadata remain canonical.
- [ ] Legacy path is no longer independently authoritative.
- [ ] Legacy callers are adapted, delegated, or explicitly classified.
- [ ] Presentation uses explicit Reservation number.
- [ ] No Prisma schema changes occur.
- [ ] No database changes occur.
- [ ] No API endpoints are introduced.
- [ ] Focused tests pass.
- [ ] Full Jest regression passes.
- [ ] Build passes.
- [ ] Prisma validation passes.
- [ ] No unrelated lint remediation occurs.
- [ ] No Hotelbeds calls occur.
- [ ] No PayFast calls occur.
- [ ] No commit is created by Copilot.

---

# 35. Copilot Implementation Report

Copilot SHALL report:

## Implementation Status

`completed`, `partially completed`, or `blocked`.

## Canonical Contract

Report:

- aggregate;
- lifecycle;
- Reservation number;
- Traveller snapshots;
- Journey snapshot;
- accommodation snapshots;
- pricing;
- supplier state;
- timeline;
- metadata.

## Application Flow

Report:

- command;
- canonical service;
- builder;
- validation/policy pipeline;
- repository boundary.

## Legacy Path

Report:

- aggregate treatment;
- service treatment;
- repository treatment;
- remaining consumers;
- delegation/adaptation/retirement status.

## B3K Transfer

Report which B3K changes were:

- retained;
- adapted;
- rejected;
- deferred.

## Presentation

Report Reservation number mapping.

## Files Changed

List every production and test file changed.

Confirm:

- Prisma schema unchanged;
- migrations unchanged;
- database unchanged.

## Verification

Report exact results for:

- focused tests;
- full Jest regression;
- build;
- Prisma validation;
- lint;
- TypeScript/language-service check.

## Scope Audit

Confirm:

- Prisma schema modified: NO;
- migrations generated/applied: NO;
- database modified: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- API endpoints added: NO;
- unrelated lint remediation: NO;
- commit created: NO.

## Exceptions

List every unresolved issue or deviation from this specification.

---

# 36. Completion Boundary

3K-C is complete when:

1. one canonical Reservation aggregate exists;
2. one canonical lifecycle exists;
3. one explicit Reservation number contract exists;
4. one canonical creation flow exists;
5. one canonical repository boundary exists;
6. the persistence context is established;
7. the legacy path no longer competes with the canonical contract;
8. the canonical contract is stable enough for physical persistence modelling.

3K-C SHALL NOT implement physical Reservation persistence.

After 3K-C acceptance, the next iteration SHALL be:

`PERSISTENCE-B3L-RESERVATION`

B3L SHALL define the physical Reservation persistence model against this consolidated canonical contract.

---

# 37. Final Status

**PENDING ARCHITECT APPROVAL**

Required workflow:

Specification
→ Architect Review
→ Copilot Implementation
→ Focused Tests + Regression
→ Copilot Report
→ Architect Acceptance
→ User Commit
→ PERSISTENCE-B3L