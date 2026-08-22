# GCT CORE — PERSISTENCE RECONCILIATION BATCH 3K
## Reservation Application Persistence Contract

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B3K-RESERVATION |
| Title | Reservation Application Persistence Contract |
| Project | GCT Core |
| Type | Focused Implementation Specification |
| Status | Pending Architect Approval |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Predecessor | PERSISTENCE-B3J-RESERVATION-REVIEW |
| Downstream | PERSISTENCE-B3L-RESERVATION |
| Implementation Target | Reservation application/persistence boundary |

---

# 2. Purpose

Implement the minimum application-contract extensions required to make the active Reservation contract capable of supplying the information required by the existing Prisma Booking commercial root.

This iteration resolves only the application/persistence contract gaps identified by 3J.

It does NOT implement the physical Reservation persistence model.

---

# 3. Architectural Decisions

The following decisions are authoritative for this iteration.

### 3.1 Reservation Identity

The existing `ReservationIdentity.id` remains the technical Reservation identity.

Do not replace it.

### 3.2 Reservation Number

A separate immutable business Reservation number SHALL be introduced into the Reservation application contract.

It SHALL map later to:

`Booking.bookingNumber`

The physical persistence implementation belongs to B3L.

### 3.3 Customer

Customer identity SHALL enter Reservation creation explicitly.

Do not infer Customer identity from:

- Traveller email;
- Traveller ID;
- BookingContact.

### 3.4 Booking Dates

Reservation application context SHALL explicitly provide Booking start and end dates.

Do not require persistence to derive Booking dates from child records.

### 3.5 GCT Lifecycle

The existing domain `ReservationStatus` remains authoritative:

- `CREATED`
- `QUOTED`
- `CONFIRMED`
- `AMENDED`
- `CANCELLED`
- `COMPLETED`

This iteration SHALL expose the lifecycle required by persistence.

It does NOT implement the physical lifecycle field.

### 3.6 Booking Status

Existing Booking status remains separate.

Do not map Booking status onto `ReservationStatus`.

B3K SHALL provide only the context required for the existing Booking status semantics if the application currently has an authoritative source.

If no authoritative source exists, STOP and report the gap rather than inventing one.

---

# 4. Reservation Number Contract

## 4.1 Domain/Application Property

Add:

`reservationNumber`

to the active Reservation contract at the appropriate domain/application boundary.

The property SHALL:

- be a string;
- be required after Reservation creation;
- be immutable;
- be returned by Reservation retrieval;
- be returned by Reservation creation;
- be available to `findByReservationNumber()`.

## 4.2 Generation

Reservation number generation SHALL occur in the application layer.

The implementation MUST reuse an existing approved reservation-number generator/convention if one exists.

Before implementation:

1. inspect the repository for an existing reservation-number generator or convention;
2. reuse it if present;
3. if none exists, STOP.

Do NOT invent a new numbering format during this iteration.

Required block:

`BLOCKED — RESERVATION NUMBER GENERATION CONVENTION`

if no approved convention exists.

## 4.3 Persistence Boundary

B3K only establishes the application contract.

Mapping to:

`Booking.bookingNumber`

is implemented in B3L.

---

# 5. Reservation Creation Contract

The active Reservation creation flow SHALL provide the following information:

- Traveller input;
- Journey input;
- Reservation pricing;
- Reservation currency;
- Reservation number;
- Customer identity;
- Booking start date;
- Booking end date;
- Reservation lifecycle.

Existing Reservation creation behaviour MUST remain compatible.

Do not require Prisma-specific information in the create command.

---

# 6. Customer Context

Reservation creation SHALL require explicit Customer identity.

The preferred application representation is:

`customerId`

This value SHALL be validated before Reservation persistence.

Rules:

- Customer must already exist;
- no implicit Customer creation;
- no Customer lookup through Traveller email;
- no Customer redesign;
- no Customer aggregate changes unless required solely to expose an already-existing identity contract.

If the current application does not have an authoritative Customer source, STOP and report:

`BLOCKED — CUSTOMER IDENTITY SOURCE`

---

# 7. Reservation Persistence Context

Introduce a persistence-neutral application boundary object:

`ReservationPersistenceContext`

It SHALL contain Booking-specific values not owned by the Reservation aggregate.

Required fields:

- `customerId`
- `bookingStartDate`
- `bookingEndDate`
- `bookingStatus` or equivalent existing Booking context, only if an authoritative application source exists

The context MUST NOT contain:

- Prisma types;
- Prisma client;
- database models;
- repository implementation details.

The context MUST NOT duplicate the Reservation aggregate.

---

# 8. Persistence Context Ownership

`ReservationPersistenceContext` belongs at the application → repository boundary.

The domain Reservation remains independent of:

- Customer foreign keys;
- Booking status IDs;
- Currency IDs;
- Prisma models;
- database identifiers.

The persistence context provides infrastructure-required information without contaminating the domain model.

---

# 9. Repository Contract

Extend `IReservationRepository` only as required to accept the persistence context.

The resulting conceptual contract SHALL support:

`save(reservation, persistenceContext)`

The exact TypeScript signature SHALL follow existing repository conventions.

The repository interface MUST remain persistence-neutral.

No Prisma type may appear in:

- `IReservationRepository`;
- Reservation domain objects;
- application commands;
- application DTOs.

---

# 10. Create Semantics

Reservation creation SHALL establish, before repository persistence:

1. Reservation technical identity;
2. Reservation number;
3. Customer identity;
4. Booking start date;
5. Booking end date;
6. Reservation lifecycle;
7. final GCT pricing;
8. Traveller snapshots;
9. Journey snapshot;
10. accommodation snapshots.

The repository receives:

- the Reservation aggregate;
- the persistence context.

The repository MUST NOT invent any missing business value.

---

# 11. Update Semantics

The persistence context SHALL remain available to Reservation update operations where Booking persistence requires it.

Updates MUST preserve:

- Reservation technical identity;
- Reservation number;
- Customer identity;
- Booking dates;
- domain lifecycle;
- Traveller snapshots;
- Journey snapshot;
- pricing;
- accommodation snapshots.

Supplier operational changes remain outside this iteration.

---

# 12. Retrieval Contract

Reservation retrieval MUST return the Reservation application contract including:

- technical identity;
- reservation number;
- lifecycle;
- Traveller snapshots;
- Journey snapshot;
- pricing;
- accommodation snapshots;
- supplier references;
- timeline;
- metadata.

B3K does not implement the physical query graph.

B3L SHALL consume this contract.

---

# 13. Traveller Snapshot Contract

The existing:

`travellerSnapshots: ReadonlyArray<TravellerSnapshot>`

contract SHALL remain unchanged.

B3K MUST NOT replace it with:

- Traveller foreign keys;
- Customer references;
- BookingContact;
- a single Traveller snapshot.

The collection remains Reservation-owned historical state.

No Traveller schema changes are permitted.

---

# 14. Journey Snapshot Contract

The existing singular Journey snapshot SHALL remain unchanged.

B3K MUST NOT introduce:

- Prisma Journey;
- Journey foreign key;
- Journey repository.

The physical representation is a B3L concern.

---

# 15. Pricing Contract

The existing PricingSnapshot remains authoritative.

Final GCT amount:

`PricingSnapshot.totalPrice`

Final GCT currency:

`PricingSnapshot.currency`

B3K SHALL NOT introduce duplicate pricing fields into Reservation.

The physical mapping to Booking belongs to B3L.

---

# 16. Booking Status Contract

B3K SHALL inspect the existing Booking status/application context.

If an authoritative application source exists:

- expose the required context through `ReservationPersistenceContext`.

If no authoritative source exists:

STOP.

Do not:

- invent a Booking status;
- derive Booking status from ReservationStatus without an approved rule;
- modify Prisma Booking status;
- collapse Booking status into Reservation lifecycle.

---

# 17. Lifecycle Contract

The domain Reservation lifecycle remains authoritative.

B3K SHALL ensure the application contract exposes the lifecycle required by persistence.

No physical lifecycle enum is introduced here.

No Booking status mapping is implemented here.

B3L will consume the authoritative Reservation lifecycle and define its physical representation.

---

# 18. Booking Dates

The Reservation application contract SHALL expose:

- `bookingStartDate`;
- `bookingEndDate`.

The values MUST have an authoritative application source.

Candidate sources MAY include:

- Reservation creation query;
- Journey construction;
- existing travel-period value object.

The implementation MUST identify the actual existing source.

Persistence MUST NOT derive dates from arbitrary accommodation rows.

If no authoritative source exists:

`BLOCKED — BOOKING DATE SOURCE`

---

# 19. Existing Reservation Query

The current Reservation creation query contains:

- `checkInDate`;
- `checkOutDate`.

Where these represent the GCT Reservation travel period, the implementation SHOULD reuse them as the source for:

- `bookingStartDate`;
- `bookingEndDate`.

Do not duplicate date concepts unnecessarily.

If their semantics differ from Booking-level dates, STOP and report the semantic difference.

---

# 20. Reservation Service

Update the Reservation application service only as required to supply the new contract values.

The service SHALL:

- establish reservation number;
- establish Customer context;
- establish Booking dates;
- construct persistence context;
- pass the context to the repository.

Do not move Prisma concerns into the service.

Do not introduce unrelated application refactoring.

---

# 21. Reservation Builder

The Reservation Builder SHALL continue constructing the domain aggregate.

It MAY receive the reservation number if the accepted domain contract requires it.

It MUST NOT receive:

- Prisma Booking;
- Customer database records;
- Booking status IDs;
- Currency IDs.

The Builder remains domain/application construction logic.

---

# 22. Reservation DTOs

Update Reservation application DTOs only where required to expose the approved Reservation number contract.

The DTO representation MUST remain application-neutral.

Do not expose:

- Prisma IDs;
- Booking status IDs;
- Currency database IDs;
- persistence context objects.

---

# 23. API Behaviour

If the existing Reservation API exposes the Reservation aggregate, the reservation number SHALL be included where the active API contract represents Reservation identity/business identity.

Do not introduce a new endpoint.

Do not change unrelated response structures.

If adding the field would constitute an unapproved external API contract change, STOP and report:

`BLOCKED — API CONTRACT IMPACT`

---

# 24. Repository Save Compatibility

Existing consumers of:

`save(Reservation)`

MUST be updated only where necessary to supply the new persistence context.

The implementation MUST identify all active callers.

No consumer should construct Prisma-specific persistence data.

---

# 25. Tests

Focused tests SHALL cover:

### Reservation Number

- generation;
- presence after creation;
- immutability;
- retrieval exposure.

### Customer

- Customer ID supplied;
- missing Customer ID rejected;
- no implicit Customer creation.

### Booking Dates

- start date supplied;
- end date supplied;
- invalid/missing dates rejected where the existing contract requires validation.

### Persistence Context

- context contains required values;
- context is passed to repository;
- Prisma types do not appear in application tests.

### Lifecycle

- existing Reservation lifecycle remains unchanged;
- lifecycle is available to persistence;
- Booking status is not substituted for Reservation lifecycle.

### Regression

Existing Reservation tests MUST continue to pass.

---

# 26. Scope

## In Scope

- Reservation number application/domain contract;
- reservation-number generation using an existing convention;
- Customer persistence context;
- Booking date context;
- ReservationPersistenceContext;
- repository contract extension;
- Reservation service integration;
- Reservation DTO adjustment where required;
- focused tests.

## Out of Scope

- Prisma schema changes;
- Prisma migrations;
- Reservation physical persistence;
- Booking lifecycle database field;
- Traveller schema changes;
- Customer schema changes;
- Journey schema/model;
- accommodation persistence structures;
- Reservation mapper persistence implementation;
- supplier booking-state model;
- Hotelbeds calls;
- PayFast;
- Invoice;
- frontend;
- unrelated lint remediation.

---

# 27. Blocking Conditions

STOP and report if:

### BLOCKED — RESERVATION NUMBER

No existing approved reservation-number convention exists.

### BLOCKED — CUSTOMER

No authoritative Customer identity can be supplied by the active application flow.

### BLOCKED — BOOKING DATES

No authoritative source exists for Booking start/end dates.

### BLOCKED — BOOKING STATUS

No authoritative source exists for existing Booking status and it cannot safely remain infrastructure-derived.

### BLOCKED — API CONTRACT

The Reservation number requires an external API change that has not been architecturally approved.

Do not invent workarounds.

---

# 28. Verification

Copilot SHALL run:

- focused Reservation tests;
- full Jest regression;
- `npm run build`;
- `npx prisma validate`;
- `npm run lint`;
- TypeScript/language-service validation.

No Hotelbeds calls are permitted.

No PayFast calls are permitted.

No database migration is permitted.

Expected lint baseline remains:

**0 errors, 11 warnings**

No unrelated lint remediation is in scope.

---

# 29. Acceptance Criteria

- [ ] Reservation technical identity remains unchanged.
- [ ] Reservation number is an explicit application/domain contract value.
- [ ] Reservation number uses an existing approved generation convention.
- [ ] Reservation number is immutable.
- [ ] Reservation number is available for retrieval.
- [ ] Customer identity is explicitly supplied.
- [ ] Customer identity is represented without Prisma types.
- [ ] No implicit Customer creation occurs.
- [ ] Booking start date has an authoritative source.
- [ ] Booking end date has an authoritative source.
- [ ] `ReservationPersistenceContext` exists at the application/repository boundary.
- [ ] Persistence context contains only approved Booking-specific context.
- [ ] Reservation domain remains free of Prisma-specific fields.
- [ ] Repository contract accepts required persistence context.
- [ ] Reservation lifecycle remains authoritative.
- [ ] Booking status remains separate.
- [ ] Traveller snapshot collection remains unchanged.
- [ ] Journey snapshot remains unchanged.
- [ ] PricingSnapshot remains authoritative.
- [ ] Existing Reservation behaviour remains compatible.
- [ ] Focused tests pass.
- [ ] Full Jest regression passes.
- [ ] Build passes.
- [ ] Prisma validation passes.
- [ ] Lint has no new errors.
- [ ] No unrelated warnings are remediated.
- [ ] No database migration is performed.
- [ ] No Hotelbeds or PayFast calls occur.
- [ ] No commit is created by Copilot.

---

# 30. Required Copilot Report

Copilot SHALL report:

## Implementation Status

`completed`, `partially completed`, or `blocked`.

## Reservation Contract

Report:

- reservation number;
- generation source;
- Customer context;
- Booking dates;
- lifecycle.

## Persistence Context

Report:

- exact fields;
- ownership;
- repository usage.

## Repository

Report:

- interface changes;
- callers updated;
- application/persistence boundary.

## DTO/API

Report any Reservation number exposure changes.

## Tests

Report:

- focused suites;
- focused tests;
- full Jest results.

## Verification

Report:

- build;
- Prisma validation;
- lint;
- TypeScript/language-service.

## Scope Audit

Confirm:

- Prisma schema modified: NO;
- database modified: NO;
- migrations generated/applied: NO;
- Traveller modified: NO;
- Customer model modified: NO;
- Journey modified: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- unrelated lint remediation: NO;
- commit created: NO.

## Exceptions

List unresolved issues or deviations from this specification.

---

# 31. Completion Boundary

B3K is complete when the application/persistence contract supplies every Booking-specific value required by B3L without introducing persistence-specific concerns into the domain.

B3K does NOT implement physical Reservation persistence.

After B3K acceptance, the next specification SHALL be:

`PERSISTENCE-B3L-RESERVATION`

B3L will define the exact Prisma physical model, mapper, repository query graph and round-trip persistence implementation.

---

# 32. Final Status

**PENDING ARCHITECT APPROVAL**

Required workflow:

B3K Specification
→ Architect Review
→ Copilot Implementation
→ Focused Tests + Regression
→ Copilot Report
→ Architect Acceptance
→ User Commit
→ B3L Specification