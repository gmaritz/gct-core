# SPEC-030 — Reservation Persistence Reconciliation & Implementation

## Document Control

| Field | Value |
|---|---|
| Document ID | SPEC-030 |
| Title | Reservation Persistence Reconciliation & Implementation |
| Version | 1.1 |
| Status | Draft — Architect Review Required |
| Classification | Implementation Specification |
| Owner | GCT Core System Architecture |
| Project | GCT Core |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS.md |
| Architecture | ARCH-000 |
| Semantic Decision | ADR-001 — Booking, Reservation and Supplier Booking Semantics |
| Logical Model | SPEC-026 v2.0 |
| Physical Model | SPEC-027 v2.0 |
| Prisma Model | SPEC-028 v2.0 |
| Repository Architecture | SPEC-029 v2.0 |
| Supersedes | SPEC-030 — Application Layer Architecture |

---

# 1. Purpose

This specification defines the focused implementation required to reconcile the current Reservation persistence implementation with the approved canonical architecture.

The objective is to replace the previous B3L persistence interpretation with the reconciled model:

- Booking = commercial transaction;
- Reservation = canonical GCT Aggregate Root;
- Booking Item = Reservation fulfilment component;
- Supplier Booking = external supplier fulfilment record;
- Go Cape internal fulfilment = Operations fulfilment.

This is a persistence implementation iteration.

It does not redesign GCT Core.

It does not reopen the architectural decisions established by SPEC-026, SPEC-027, SPEC-028 or SPEC-029.

---

# 2. Governing Process

This specification SHALL be implemented under:

`GOV-DEV-001-DEVELOPMENT-PROCESS.md`

The mandatory workflow is:

Specification  
→ Architect Review / Approval  
→ Implementation by Copilot  
→ Focused Tests + Full Regression  
→ Copilot Implementation Report  
→ Architect Acceptance  
→ User Commit

Copilot SHALL explicitly follow GOV-DEV-001.

No implementation shall begin until this specification has been approved.

Any implementation prompt supplied to Copilot SHALL explicitly identify:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

as the governing development process.

---

# 3. Architectural Baseline

The following decisions are approved and SHALL NOT be reopened during this implementation:

- Reservation is the Aggregate Root.
- Booking is the commercial transaction.
- Reservation is not a child of Booking.
- Booking Items are Reservation fulfilment components.
- Supplier Bookings are external fulfilment records.
- Supplier availability is not Reservation lifecycle state.
- Reservation may exist before Supplier Bookings exist.
- Reservation lifecycle is:
  - CREATED
  - QUOTED
  - CONFIRMED
  - AMENDED
  - CANCELLED
  - COMPLETED
- Reservation has a distinct business `reservationNumber`.
- Reservation has explicit Customer identity.
- Reservation has explicit booking start/end dates.
- Reservation preserves historical snapshots.
- Payment remains a separate Financial Aggregate.
- Operations resources remain separate aggregates.

These decisions are established by ADR-001 and SPEC-026 through SPEC-029.

Copilot SHALL implement these decisions and SHALL NOT reinterpret them.

---

# 4. Current Implementation Baseline

The current repository contains the B3L Reservation persistence implementation.

Known B3L implementation characteristics include:

- canonical Reservation state persisted through the Prisma Booking root;
- Reservation JSON/snapshot fields on Booking;
- Reservation lifecycle persisted on Booking;
- payment snapshot persistence;
- supplier references/state on Booking;
- Reservation persistence repository implementation;
- Reservation repository tests.

The B3L implementation was an implementation state, not the final architectural persistence model.

SPEC-030 SHALL reconcile this implementation against the approved SPEC-027 and SPEC-028 models.

The current repository SHALL be treated as the implementation baseline for this work.

Copilot SHALL inspect the actual repository before making changes.

---

# 5. Scope

## 5.1 In Scope

Copilot SHALL implement only the changes required to:

1. establish the canonical Prisma Reservation persistence root;
2. align `ReservationRepository` with the canonical Reservation Aggregate;
3. persist Reservation-owned state through the Reservation boundary;
4. persist Booking Item fulfilment state;
5. represent Supplier Booking distinctly from Reservation;
6. preserve historical snapshots;
7. preserve Reservation lifecycle;
8. preserve Reservation business identity;
9. preserve Reservation Customer identity and dates;
10. implement complete Reservation round-trip reconstruction;
11. remove the obsolete Booking-as-Reservation persistence mechanism;
12. reconcile the existing supplier-oriented Reservation persistence structure into Supplier Booking where appropriate;
13. update directly affected mappers;
14. update directly affected tests;
15. update directly affected generated artifacts according to repository convention;
16. create only the database migration changes explicitly required by the reconciled physical model.

## 5.2 Out of Scope

Copilot SHALL NOT:

- redesign Booking;
- redesign Customer;
- redesign Journey;
- create a new Journey persistence model;
- implement supplier API calls;
- change Hotelbeds contracts;
- change PayFast integration;
- change QuickBooks integration;
- redesign payment;
- redesign Operations;
- redesign APIs;
- perform unrelated lint remediation;
- refactor unrelated repositories;
- implement future Reservation capabilities.

---

# 6. Required Persistence Boundary

The implementation SHALL establish:

    Reservation
        ├── Booking Items
        │     └── Supplier Bookings
        ├── Reservation snapshots
        ├── Pricing Snapshot
        ├── Payment Snapshot
        ├── Supplier references/state
        ├── Timeline
        └── Metadata

Booking remains the originating commercial transaction.

If an explicit Booking relationship is required by SPEC-028, it SHALL be retained as an association.

It SHALL NOT imply that Booking owns Reservation.

---

# 7. Canonical Prisma Reservation Root

The implementation SHALL establish the Prisma model representing the canonical GCT Reservation Aggregate as the physical persistence root defined by SPEC-028.

The canonical Prisma Reservation model SHALL contain the Reservation identity and Reservation-owned persistence state defined by SPEC-028.

It SHALL NOT be implemented by storing the Reservation Aggregate as JSON fields on `Booking`.

The following B3L Booking fields SHALL therefore no longer constitute the canonical source of Reservation state:

- Reservation lifecycle;
- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- Pricing snapshot;
- Payment snapshot;
- Reservation supplier references/state;
- Reservation timeline;
- Reservation metadata.

If equivalent fields remain temporarily for data migration compatibility, they SHALL NOT be treated as authoritative after the implementation is complete.

Copilot SHALL report any such temporary compatibility state explicitly.

---

# 8. Booking Relationship

Booking SHALL remain the commercial transaction.

The implementation SHALL NOT store the canonical Reservation Aggregate as a collection of Reservation JSON fields on Booking.

Where SPEC-028 requires an association between Booking and Reservation, that association SHALL be represented explicitly.

The relationship SHALL mean:

> this Reservation originated from this Booking transaction.

It SHALL NOT mean:

> this Booking owns this Reservation Aggregate.

The Reservation remains independently identifiable and lifecycle-managed.

---

# 9. Reservation Identity

The implementation SHALL preserve:

`Reservation.id`

as the technical identity.

It SHALL preserve:

`Reservation.reservationNumber`

as the business identity.

`reservationNumber` SHALL be unique.

The implementation SHALL NOT derive the reservation number from:

- Booking number;
- database identity;
- supplier reference;
- supplier confirmation number.

---

# 10. Reservation Customer Identity

The canonical Reservation SHALL persist explicit:

`customerId`

as defined by SPEC-028.

Customer identity SHALL NOT be inferred from:

- Traveller email;
- Traveller name;
- Booking contact information;
- supplier records.

The Reservation Customer relationship SHALL be enforced through the approved Prisma relationship.

---

# 11. Reservation Dates

The canonical Reservation SHALL explicitly persist:

- `bookingStartDate`;
- `bookingEndDate`.

These represent the Reservation travel period.

They SHALL NOT be reconstructed solely from Booking Items, Supplier Bookings or accommodation records.

---

# 12. Reservation Lifecycle

The implementation SHALL persist and reconstruct:

- `CREATED`
- `QUOTED`
- `CONFIRMED`
- `AMENDED`
- `CANCELLED`
- `COMPLETED`

Lifecycle mapping SHALL be explicit.

Invalid lifecycle values SHALL fail rather than silently defaulting.

Supplier lifecycle values SHALL NOT be mapped directly to the GCT Reservation lifecycle.

Supplier availability SHALL NOT be persisted as Reservation lifecycle state.

---

# 13. Booking Item Persistence

Each Reservation Booking Item SHALL be persisted as the Reservation fulfilment component defined by SPEC-028.

A Booking Item SHALL:

- belong to one Reservation;
- retain its Booking association where defined;
- retain its Product association where defined;
- support Supplier Booking fulfilment;
- support internal Go Cape fulfilment where applicable.

Booking Items SHALL be persisted as part of Reservation persistence.

No independent Booking Item repository shall be introduced.

---

# 14. Supplier Booking — Existing Structure Reconciliation

The current repository contains a historical Prisma `Reservation` concept that was used to represent supplier-side reservation information.

That historical concept is semantically a Supplier Booking rather than the canonical GCT Reservation.

Copilot SHALL inspect the current implementation and determine whether the existing supplier-oriented Prisma structure can be reconciled directly into the approved `SupplierBooking` model defined by SPEC-028.

Where the existing structure already contains supplier booking information, Copilot SHALL preserve and reuse that data structure where it is compatible with SPEC-028.

Copilot SHALL NOT create a second supplier booking concept merely because the historical model is named `Reservation`.

The target semantic mapping is:

    Historical supplier Reservation
        ↓
    SupplierBooking

and:

    Canonical GCT Reservation
        ↓
    Reservation

The names SHALL reflect the corrected business semantics after implementation.

If existing consumers prevent safe reconciliation within this iteration, Copilot SHALL report those consumers and the exact conflict.

Copilot SHALL NOT silently maintain two competing Supplier Booking models.

---

# 15. Supplier Booking Persistence

`SupplierBooking` represents an external supplier booking made by Go Cape Tours to fulfil a Reservation Booking Item.

It SHALL retain the information defined by SPEC-028, including where applicable:

- Supplier identity;
- Supplier Product identity;
- supplier reference;
- supplier state;
- requested timestamp;
- confirmed timestamp;
- cancellation information;
- supplier operational references.

Supplier Booking SHALL NOT be persisted as the canonical Reservation.

A Booking Item MAY have:

- zero Supplier Bookings;
- one Supplier Booking;
- multiple Supplier Bookings where substitution or rebooking requires it.

The physical model SHALL support this cardinality.

---

# 16. Internal Go Cape Fulfilment

Where a Booking Item is fulfilled directly by Go Cape, the implementation SHALL retain the existing Operations boundary.

It SHALL NOT manufacture a Supplier Booking merely to represent Go Cape fulfilment.

Existing Operations models remain responsible for:

- vehicles;
- drivers;
- guides;
- resource assignments.

Only directly required Reservation references may be changed.

No Operations redesign is authorised.

---

# 17. Historical Snapshots

The implementation SHALL preserve historical Reservation snapshots.

At minimum:

- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- PricingSnapshot;
- PaymentSnapshot.

The implementation SHALL not replace snapshots with live master-record lookups.

The representation SHALL follow SPEC-028.

Copilot SHALL use the approved structures already defined by SPEC-028 and SHALL NOT invent new snapshot structures.

If the current Prisma schema does not contain sufficient structure to implement an approved snapshot without inventing an architectural decision, Copilot SHALL stop and report the decision gap.

---

# 18. Traveller Snapshot

Traveller master data remains associated with Customer.

Traveller snapshots belong to Reservation.

The implementation SHALL:

- persist the approved snapshot structure;
- preserve required ordering;
- preserve required snapshot metadata;
- reconstruct the snapshot independently of current Traveller master data.

The repository SHALL NOT substitute the current Traveller master record for historical Reservation state.

---

# 19. Journey Snapshot

The Reservation Journey snapshot is Reservation-owned historical state.

The implementation SHALL persist the approved snapshot structure defined by SPEC-028.

It SHALL NOT require a live Journey Aggregate merely to reconstruct the Reservation snapshot unless an approved specification explicitly establishes such a dependency.

The implementation SHALL NOT create a new Journey Prisma model as part of this iteration.

If the current implementation cannot persist the approved Journey snapshot without inventing a new Journey persistence architecture, Copilot SHALL stop and report the decision gap.

---

# 20. Accommodation Snapshots

Accommodation snapshots SHALL preserve the historical accommodation state required by the Reservation contract.

Where applicable this includes:

- property;
- room;
- rate;
- package;
- package stop;
- stay dates;
- occupancy;
- child ages;
- supplier/provider reference;
- supplier price;
- currency;
- pricing basis;
- booking state/reference.

The implementation SHALL reconstruct the snapshot without depending on current mutable supplier or catalogue state.

No accommodation persistence redesign is authorised.

---

# 21. Pricing Snapshot

PricingSnapshot remains Reservation-owned historical state.

The implementation SHALL preserve the approved pricing structure, including where applicable:

- currency;
- total price;
- taxes;
- discounts;
- fees;
- supplier pricing information.

The repository SHALL NOT recalculate historical Reservation pricing during retrieval.

---

# 22. Payment Snapshot

PaymentSnapshot remains Reservation-owned historical state.

The implementation SHALL preserve the approved snapshot structure.

The repository SHALL NOT:

- call PayFast;
- retrieve live payment status;
- modify the Payment Aggregate;
- calculate refunds.

Payment remains a separate Financial Aggregate.

---

# 23. Supplier References and State

Reservation-level supplier references/state SHALL remain distinct from:

- Reservation identity;
- Reservation lifecycle;
- Supplier Booking identity.

The implementation SHALL persist only the supplier information required by the canonical Reservation contract.

Supplier availability SHALL remain outside Reservation lifecycle.

Supplier substitution SHALL remain an operational fulfilment decision and SHALL NOT require Reservation cancellation merely because one supplier is unavailable.

---

# 24. Reservation Repository

The canonical repository SHALL be:

`ReservationRepository`

The concrete infrastructure implementation SHALL follow the repository naming convention established by the current source tree and SPEC-029.

The repository SHALL support:

- `save`;
- `findById`;
- `findByReservationNumber` where defined by the accepted contract.

The repository SHALL return the complete Reservation Aggregate.

It SHALL NOT return a Supplier Booking as a Reservation.

---

# 25. Persistence Context

Where required by the accepted Reservation contract, `ReservationPersistenceContext` SHALL supply persistence-neutral information not owned directly by the Reservation domain object.

It SHALL remain minimal.

It SHALL NOT contain:

- Prisma types;
- database records;
- SQL;
- provider-specific objects.

No additional context fields may be invented.

If implementation requires additional context not defined by the approved specifications, Copilot SHALL stop and report the decision gap.

---

# 26. Mapping

The implementation SHALL maintain explicit mapping between:

    Domain Reservation
        ↕
    Reservation Persistence Representation

Mapping SHALL include all approved Reservation state.

Prisma types SHALL remain inside infrastructure.

Mappers SHALL not contain business rules.

Directly affected existing Reservation mappers SHALL be updated.

Unrelated mapper cleanup is out of scope.

---

# 27. Prisma Isolation

Prisma SHALL remain infrastructure-only.

The following SHALL NOT appear in domain/application repository contracts:

- `PrismaClient`;
- Prisma transaction clients;
- Prisma query types;
- Prisma create/update types;
- Prisma model types.

Infrastructure MAY use generated Prisma types internally.

---

# 28. Canonical Prisma Repository

The concrete Reservation implementation SHALL implement `ReservationRepository`.

It SHALL use the authoritative Prisma Client lifecycle established by the infrastructure architecture.

It SHALL NOT expose Prisma-specific methods through the domain repository interface.

---

# 29. Transaction Boundary

Reservation persistence involving multiple physical records SHALL be atomic.

The implementation SHALL use the established Prisma transaction mechanism.

The transaction SHALL cover the Reservation persistence graph.

It SHALL NOT include:

- Hotelbeds calls;
- PayFast calls;
- QuickBooks calls;
- email delivery;
- external supplier HTTP calls;
- unrelated Aggregate Roots.

---

# 30. Save Behaviour

For a new Reservation, persistence SHALL:

1. create the Reservation root;
2. persist required Reservation-owned state;
3. persist required Booking Item state;
4. persist required Supplier Booking state;
5. persist required snapshot state;
6. commit atomically.

For an existing Reservation, persistence SHALL:

1. identify the existing Reservation;
2. persist the changed aggregate state;
3. preserve required historical state;
4. preserve required fulfilment state;
5. commit atomically.

The exact Prisma update strategy SHALL remain an implementation concern.

---

# 31. Complete Aggregate Reconstruction

Reservation retrieval SHALL reconstruct the complete Reservation Aggregate required by the accepted application contract.

Required reconstruction includes, where applicable:

- technical identity;
- reservation number;
- lifecycle;
- Customer identity;
- booking dates;
- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- PricingSnapshot;
- PaymentSnapshot;
- Booking Items;
- Supplier Booking state;
- supplier references;
- Reservation timeline;
- Reservation metadata.

Partial reconstruction SHALL NOT be returned as a successful complete Reservation.

---

# 32. Round-Trip Integrity

The repository SHALL support:

    Reservation
        ↓ save
    Persistence
        ↓ retrieve
    Reservation

The reconstructed Reservation SHALL preserve all business state required by the canonical contract.

Round-trip tests SHALL verify:

- identity;
- reservation number;
- lifecycle;
- Customer identity;
- dates;
- snapshots;
- pricing;
- payment snapshot;
- Booking Items;
- Supplier Booking state;
- timeline;
- metadata.

---

# 33. Conflict Handling

Persistence SHALL fail explicitly on:

- duplicate Reservation number;
- duplicate technical identity;
- invalid required relationship;
- invalid lifecycle mapping;
- Supplier Booking persistence conflict;
- optimistic concurrency conflict where applicable.

The repository SHALL NOT silently overwrite an existing Reservation.

Prisma-specific errors SHALL be translated at the infrastructure boundary.

---

# 34. Optimistic Concurrency

Where the approved physical model defines Reservation versioning, the repository SHALL use it.

A stale update SHALL fail rather than overwrite a newer Reservation.

The exact Prisma predicate and version implementation SHALL follow SPEC-028.

No alternative concurrency mechanism SHALL be introduced.

---

# 35. Lookup by Reservation Number

Where supported by the repository contract:

`findByReservationNumber(...)`

SHALL:

- use the unique Reservation business identifier;
- return the complete Reservation Aggregate;
- return `null` when no Reservation exists;
- never return a Supplier Booking as a Reservation.

---

# 36. Lookup by Technical Identity

`findById(...)` SHALL:

- use the Reservation technical identity;
- retrieve the complete Reservation persistence graph;
- reconstruct the canonical Reservation Aggregate;
- return `null` when no Reservation exists.

It SHALL NOT use a historical supplier Reservation record as a substitute.

---

# 37. Delete Semantics

Reservation cancellation SHALL NOT be implemented as physical deletion.

Cancellation is:

`Reservation.status = CANCELLED`

If legacy repository interfaces expose Reservation deletion, that operation SHALL be removed or isolated unless an approved business requirement explicitly requires physical deletion.

Normal Reservation lifecycle management SHALL use state transitions.

---

# 38. Data Migration and Safety

A database migration SHALL be created only where required to bring the physical schema into alignment with SPEC-028.

If a migration is required:

1. Copilot SHALL inspect the current schema and migration history.
2. Copilot SHALL identify existing affected data.
3. The migration SHALL preserve valid existing data.
4. The migration SHALL not silently discard Reservation or Supplier Booking history.
5. Destructive operations SHALL NOT be introduced merely to simplify implementation.
6. The migration SHALL be generated through Prisma Migrate.
7. The migration SHALL be included in the implementation report.

Copilot SHALL NOT assume that obsolete B3L fields may simply be dropped.

If existing data cannot be mapped safely into the reconciled model, Copilot SHALL stop and report:

- affected data;
- affected tables/fields;
- the mapping problem;
- the decision required.

No migration strategy may be invented during implementation.

---

# 39. B3L Booking Fields

The following B3L concepts currently associated with Booking require reconciliation:

- Reservation lifecycle;
- Journey snapshot;
- Traveller snapshots;
- Accommodation snapshots;
- Pricing snapshot;
- Payment snapshot;
- Reservation supplier references;
- Reservation timeline;
- Reservation metadata.

The final implementation SHALL persist these according to the canonical Reservation boundary.

Copilot SHALL NOT duplicate the same Reservation state on both Booking and Reservation as two authoritative sources.

If temporary compatibility fields are technically unavoidable, they SHALL:

- not be treated as authoritative;
- be documented in the implementation report;
- have a clear migration/removal path;
- not create a permanent dual-source model.

---

# 40. Existing Supplier Reservation Reconciliation

The historical Prisma `Reservation` structure used for supplier-side reservation information SHALL be reconciled into the approved Supplier Booking concept.

Copilot SHALL inspect:

- current model definition;
- repository implementation;
- repository tests;
- application consumers;
- imports/exports;
- migration history;
- existing database relationships.

Where the existing structure is compatible with SPEC-028, it SHALL be reused and renamed/re-mapped as required.

Where the existing structure cannot be safely reused, Copilot SHALL identify the exact incompatibility.

Copilot SHALL NOT:

- create a second competing supplier reservation model;
- silently discard supplier references;
- reinterpret supplier records as canonical Reservation records.

---

# 41. Prisma Client Ownership

The implementation SHALL use the repository's authoritative Prisma Client lifecycle.

Copilot SHALL not create:

- a second Prisma singleton;
- a repository-specific Prisma client;
- a competing Prisma service.

Only directly affected Prisma lifecycle code may be changed.

---

# 42. Testing Requirements

Focused tests SHALL be added or updated for:

1. Reservation creation.
2. Reservation retrieval by ID.
3. Reservation retrieval by reservation number.
4. Reservation lifecycle round trip.
5. Reservation number uniqueness.
6. Customer relationship.
7. Booking date persistence.
8. Traveller snapshot round trip.
9. Journey snapshot round trip.
10. Accommodation snapshot round trip.
11. PricingSnapshot round trip.
12. PaymentSnapshot round trip.
13. Booking Item round trip.
14. Supplier Booking round trip.
15. Reservation without Supplier Booking.
16. Multiple Supplier Bookings where supported.
17. Persistence transaction rollback.
18. Conflict handling.
19. Optimistic concurrency where applicable.
20. Verification that Booking is not the source of truth for Reservation state.

Tests SHALL not call external suppliers.

---

# 43. Verification Sequence

After implementation Copilot SHALL run the required verification sequence:

    npx prisma generate

    npx prisma validate

    Focused Reservation persistence tests

    npm run build

    npm test -- --runInBand

    npm run lint

The full Jest regression SHALL be executed.

The implementation report SHALL state the exact results.

Existing unrelated lint warnings SHALL not become remediation scope.

No new blocking lint errors SHALL be introduced.

---

# 44. Implementation Inspection Requirements

Before changing code, Copilot SHALL inspect:

- current `schema.prisma`;
- current Prisma migration history;
- current Reservation model;
- current Booking model;
- current Booking Item model;
- current supplier-oriented Reservation structure;
- current Reservation repository;
- current Prisma Reservation repository;
- Reservation persistence mapper(s);
- Reservation repository tests;
- relevant domain Reservation contract;
- relevant application service contract;
- current exports/imports.

This inspection is required to avoid replacing or duplicating existing accepted implementation without evidence.

---

# 45. Scope Constraints

Copilot SHALL NOT:

- move Reservation back under Booking;
- create a Booking-owned Reservation JSON persistence model;
- treat Supplier Booking as Reservation;
- create a Journey Prisma model;
- invent Reservation fields;
- invent Supplier Booking lifecycle rules;
- change accepted Reservation business behaviour;
- modify supplier APIs;
- modify payment APIs;
- modify QuickBooks;
- modify unrelated repositories;
- perform unrelated lint cleanup;
- perform unrelated schema cleanup;
- introduce speculative abstractions;
- redesign the database outside the affected persistence boundary.

---

# 46. Decision-Gap Rule

If the current repository cannot implement this specification without inventing:

- a business rule;
- aggregate ownership;
- lifecycle;
- field;
- relationship;
- migration mapping;
- snapshot structure;
- concurrency rule;
- data transformation;

Copilot SHALL stop and report the exact decision gap.

The report SHALL identify:

1. the affected file/model;
2. the existing implementation;
3. the approved specification requirement;
4. the conflict;
5. the architectural decision required.

Copilot SHALL NOT resolve the conflict independently.

---

# 47. Acceptance Criteria

The implementation is acceptable only when:

- [ ] Reservation is the canonical persistence Aggregate Root.
- [ ] Booking remains the commercial transaction.
- [ ] Booking does not own Reservation.
- [ ] Reservation has independent technical identity.
- [ ] Reservation number is persisted and unique.
- [ ] Customer identity is explicit.
- [ ] Booking start/end dates are explicitly persisted.
- [ ] Canonical Reservation lifecycle is persisted and reconstructed.
- [ ] Historical snapshots round-trip correctly.
- [ ] Booking Items are persisted through Reservation.
- [ ] Supplier Bookings are distinct from Reservation.
- [ ] Existing supplier-oriented Reservation persistence is reconciled into Supplier Booking where applicable.
- [ ] Reservation can exist before Supplier Booking fulfilment.
- [ ] Internal Go Cape fulfilment remains separate from Supplier Booking.
- [ ] Prisma remains infrastructure-only.
- [ ] ReservationRepository remains persistence-neutral.
- [ ] Complete Reservation round-trip reconstruction works.
- [ ] Booking is not the authoritative source of Reservation state.
- [ ] Duplicate Reservation numbers are rejected.
- [ ] Transaction rollback is verified.
- [ ] Existing accepted Reservation behaviour remains intact.
- [ ] Historical Reservation and Supplier Booking data is preserved where safely mappable.
- [ ] No destructive migration is introduced without explicit specification support.
- [ ] No new Journey persistence architecture is introduced.
- [ ] No unrelated architecture is changed.
- [ ] `npx prisma generate` passes.
- [ ] `npx prisma validate` passes.
- [ ] Focused tests pass.
- [ ] Full Jest regression passes.
- [ ] Build passes.
- [ ] No new blocking lint errors exist.
- [ ] No external supplier APIs were called.
- [ ] No unresolved architectural decision was hidden in implementation.

---

# 48. Definition of Done

SPEC-030 implementation is complete when:

1. The approved Reservation persistence architecture is implemented.
2. The B3L Booking-as-Reservation persistence workaround is reconciled.
3. The canonical Prisma Reservation root is established.
4. The historical supplier-oriented Reservation structure is reconciled into Supplier Booking.
5. Reservation round-trip persistence is verified.
6. Reservation-owned snapshots are preserved.
7. Booking Items and Supplier Bookings are correctly reconstructed.
8. Focused tests pass.
9. Full regression passes.
10. Build passes.
11. Prisma generation and validation pass.
12. No new blocking lint errors exist.
13. Any required migration is safe and documented.
14. No external supplier APIs were called.
15. No architectural decision was invented during implementation.
16. Copilot provides the complete implementation report.
17. The architect accepts the implementation.

After acceptance, the user performs the commit.

ChatGPT supplies the commit message only after acceptance.

---

# 49. Copilot Implementation Report

Upon completion Copilot SHALL report:

### Implementation

- files changed;
- files added;
- files removed;
- Prisma models changed;
- repository changes;
- mapper changes;
- test changes;
- migrations created, if any.

### Verification

- focused test result;
- full Jest result;
- build result;
- Prisma generate result;
- Prisma validate result;
- lint result.

### Data Safety

- migrations created;
- destructive operations, if any;
- existing data considerations;
- confirmation that no data was silently discarded.

### Scope

- confirmation that no external supplier APIs were called;
- confirmation that no unrelated architecture was changed;
- confirmation that no unrelated lint remediation was performed.

### Decision Gaps

- explicit statement of any unresolved decision gap;
- or explicit confirmation that no decision gap was encountered.

The report SHALL be sufficient for the architect to perform acceptance assessment.

---

# 50. Traceability

| Authority | Purpose |
|---|---|
| GOV-DEV-001 | Governing development workflow |
| ADR-001 | Booking / Reservation / Supplier Booking semantics |
| SPEC-026 v2.0 | Canonical logical model |
| SPEC-027 v2.0 | Canonical physical model |
| SPEC-028 v2.0 | Canonical Prisma model |
| SPEC-029 v2.0 | Repository & persistence architecture |
| APP-004.1 | Reservation Aggregate |
| 3K-C | Canonical Reservation contract |

---

# 51. Superseded Implementation Assumptions

The following historical implementation assumptions are superseded:

1. Booking is the persistence owner of Reservation.
2. Reservation state may be stored primarily on Booking.
3. The historical supplier-oriented Prisma Reservation represents the canonical GCT Reservation.
4. Supplier status may substitute for GCT Reservation lifecycle.
5. Supplier reference may substitute for Reservation identity.
6. Reservation history may be reconstructed from current master data.
7. Obsolete B3L fields may be dropped without a data-safety assessment.
8. A missing physical structure may be invented during implementation.

These assumptions SHALL NOT be carried into the implementation.

---

# 52. Preserved Architecture

The following remain unchanged:

- GCT Core architecture;
- domain Aggregate boundaries;
- Reservation Aggregate;
- Reservation lifecycle;
- Booking commercial transaction;
- Customer model;
- Supplier architecture;
- Financial architecture;
- Operations architecture;
- accepted Reservation application contract;
- PostgreSQL;
- Prisma;
- repository abstraction;
- application/infrastructure separation;
- external provider boundaries.

This implementation reconciles the existing persistence implementation with the approved architecture.

It does not restart or redesign GCT Core.

---

# 53. Next Stage

After SPEC-030 v1.1 is architect-approved:

1. Copilot receives the approved implementation specification.
2. Copilot inspects the current repository.
3. Copilot implements only the approved scope.
4. Copilot runs focused tests.
5. Copilot runs full regression.
6. Copilot runs build, Prisma generation, Prisma validation and lint.
7. Copilot provides the implementation report.
8. ChatGPT performs acceptance assessment against:
   - SPEC-030;
   - SPEC-029;
   - SPEC-028;
   - SPEC-027;
   - SPEC-026;
   - ADR-001;
   - GOV-DEV-001.
9. If accepted, the user performs the commit.
10. ChatGPT supplies only the commit message when requested.

---

# End of Specification

**Document:** SPEC-030 — Reservation Persistence Reconciliation & Implementation

**Version:** 1.1

**Status:** Draft — Architect Review Required

**Next Stage:** Architect Approval → Copilot Implementation