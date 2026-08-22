# GCT CORE — PERSISTENCE-B3L
# Reservation Physical Persistence Specification

## Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B3L |
| Title | Reservation Physical Persistence Specification |
| Version | 0.1.0 |
| Status | Draft — Architect Review Required |
| Classification | Implementation Specification |
| Owner | GCT Core System Architecture |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS.md |
| Capability | APP-004 Reservation |
| Predecessor | 3K-C — Reservation Contract Consolidation |
| Primary Persistence Standard | SPEC-002 — Canonical Physical Data Model |

---

## Revision History

| Version | Date | Author | Summary |
|---|---|---|---|
| 0.1.0 | 2026-08-22 | GCT Core System Architect | Initial Reservation physical persistence specification |

---

# 1. Purpose

PERSISTENCE-B3L defines the physical persistence implementation required to persist and reconstruct the accepted canonical APP-004 Reservation aggregate established by 3K-C.

The specification translates the accepted application Reservation contract into a persistence boundary while preserving:

- the canonical Reservation aggregate;
- the canonical Reservation lifecycle;
- the distinction between technical identity and business reservation number;
- immutable Reservation snapshots;
- supplier operational state;
- Booking/customer context;
- persistence-neutral repository boundaries;
- complete aggregate round-trip reconstruction.

This specification is an implementation contract.

It SHALL NOT redesign the Reservation domain model or reopen accepted 3K-C decisions.

---

# 2. Governing Development Process

This specification is produced under `GOV-DEV-001-DEVELOPMENT-PROCESS.md`.

The mandatory workflow is:

1. Specification
2. Architect Review / Approval
3. Implementation by Copilot
4. Focused tests + full regression
5. Copilot implementation report
6. Architect acceptance
7. User commit
8. Next iteration

No implementation may begin until this specification has been reviewed and approved.

Copilot SHALL:

- implement only this iteration;
- preserve accepted 3K-C behaviour;
- follow this specification;
- avoid unrelated refactoring;
- avoid unrelated lint remediation;
- avoid future capability implementation;
- report focused tests, regression, build, Prisma and lint results.

A separate pre-commit audit is not part of the workflow.

---

# 3. Scope

## 3.1 In Scope

This iteration covers physical persistence for the canonical Reservation aggregate, including:

- Booking/commercial-root alignment;
- Reservation business number persistence;
- Customer identity persistence context;
- Booking start/end dates;
- canonical Reservation lifecycle;
- Traveller snapshots;
- Journey snapshot;
- accommodation snapshots;
- pricing snapshot;
- supplier references and supplier state;
- timeline;
- metadata;
- Reservation persistence context;
- repository save;
- repository retrieval;
- domain-to-persistence mapping;
- persistence-to-domain reconstruction;
- transactional aggregate persistence;
- required Prisma schema changes;
- focused persistence tests.

## 3.2 Out of Scope

This iteration SHALL NOT implement:

- HTTP/API endpoints;
- Reservation runtime composition not already established by 3K-C;
- payment processing;
- invoice processing;
- customer communications;
- voucher/document generation;
- new supplier integrations;
- Hotelbeds API calls;
- supplier certification;
- Journey persistence as a separate aggregate;
- Traveller persistence redesign;
- unrelated Prisma model remediation;
- unrelated lint cleanup;
- database administration or production data changes.

---

# 4. Architectural Position

The canonical application aggregate is:

`application/reservations/Reservation`

The physical commercial root SHALL align with the existing Prisma `Booking` concept.

The existing Prisma `Reservation` concept SHALL remain an operational/supplier reservation representation and SHALL NOT replace the canonical GCT Reservation aggregate.

The physical persistence model SHALL therefore distinguish:

- GCT Reservation commercial state;
- Reservation-owned immutable snapshots;
- supplier operational state;
- existing catalogue/reference data;
- technical persistence identity.

The persistence layer SHALL reconstruct one canonical application `Reservation` from its complete physical persistence graph.

The physical model SHALL NOT require a live Journey aggregate to reconstruct a Reservation.

---

# 5. Existing Accepted Contract

3K-C established the following canonical Reservation contract.

## 5.1 Lifecycle

The authoritative Reservation lifecycle is:

- `CREATED`
- `QUOTED`
- `CONFIRMED`
- `AMENDED`
- `CANCELLED`
- `COMPLETED`

Physical Booking status and supplier Reservation status SHALL NOT be treated as equivalent to this lifecycle unless an explicit mapping defined by this specification is applied.

## 5.2 Identity

Reservation has:

- technical identity;
- explicit business `reservationNumber`.

The business reservation number is distinct from technical identity.

The reservation number SHALL be immutable after creation.

## 5.3 Reservation State

The persisted aggregate SHALL support:

- Reservation identity;
- reservation number;
- customer identity;
- booking dates;
- lifecycle state;
- ordered Traveller snapshots;
- one Journey snapshot;
- accommodation snapshots;
- PricingSnapshot;
- supplier references/state;
- timeline;
- metadata.

---

# 6. Physical Root

## 6.1 Booking

The existing Prisma `Booking` model SHALL remain the physical commercial root for Reservation persistence.

Existing Booking concepts SHALL be reused where they represent the accepted Reservation contract, including:

- Booking identity;
- booking number where mapped to the canonical reservation number;
- Customer relationship;
- booking/travel dates;
- final commercial amount;
- currency;
- Booking status where physically required.

The implementation SHALL NOT create a second commercial Booking root.

## 6.2 Reservation Identity

The physical representation SHALL preserve both:

1. technical Booking identity;
2. canonical business `reservationNumber`.

The implementation SHALL NOT assume that technical Booking identity is the business reservation number.

Where the existing Booking business-number field is used for `reservationNumber`, the mapping SHALL be explicit and tested.

The implementation SHALL NOT silently generate a second competing reservation-number value.

---

# 7. Reservation Persistence Context

The repository persistence boundary established by 3K-C SHALL be retained.

The repository save operation SHALL receive:

- the canonical `Reservation`;
- `ReservationPersistenceContext`.

`ReservationPersistenceContext` SHALL provide persistence-owned Booking context that is not part of the Reservation domain aggregate.

At minimum, the context SHALL support:

- Customer identity;
- Booking-level start date;
- Booking-level end date;
- Booking/commercial-root identity where required by the existing application contract.

The implementation SHALL use the existing 3K-C context contract.

It SHALL NOT infer Customer identity from Traveller email.

It SHALL NOT derive Booking dates from an arbitrary accommodation snapshot when explicit Booking dates are available.

---

# 8. Reservation Lifecycle Persistence

The physical persistence model SHALL preserve every canonical lifecycle value:

| Canonical State | Must Persist |
|---|---|
| CREATED | Yes |
| QUOTED | Yes |
| CONFIRMED | Yes |
| AMENDED | Yes |
| CANCELLED | Yes |
| COMPLETED | Yes |

The implementation SHALL provide an explicit mapping between the application lifecycle and the physical lifecycle representation.

The existing Booking status SHALL NOT be assumed to represent the complete GCT lifecycle.

Supplier operational status SHALL remain separate.

Unknown or unsupported lifecycle values SHALL fail closed rather than being silently converted to another state.

---

# 9. Traveller Snapshot Persistence

Traveller snapshots are Reservation-owned historical state.

The physical model SHALL persist the ordered collection of Traveller snapshots.

The persistence representation SHALL preserve the accepted snapshot contract, including where present:

- snapshot identity;
- snapshot timestamp;
- snapshot version;
- Traveller identity;
- full name;
- email;
- phone;
- nationality;
- traveller type;
- date of birth.

The persisted snapshot SHALL NOT be implemented as a live dependency on mutable Traveller data.

A later Traveller change SHALL NOT alter a historical Reservation snapshot.

The physical model SHALL preserve snapshot ordering.

The implementation SHALL NOT replace the snapshot with a simple foreign-key relationship to the current Traveller record.

---

# 10. Journey Snapshot Persistence

The Reservation SHALL persist its required singular Journey snapshot.

The physical model SHALL preserve the accepted snapshot contract, including:

- snapshot identity;
- snapshot timestamp;
- snapshot version;
- Journey identity;
- title;
- destination where present;
- duration where present;
- accommodation summary;
- experience summary;
- start/end dates where present;
- summary where present.

A dedicated Prisma Journey aggregate/model SHALL NOT be introduced by this iteration.

The snapshot SHALL be Reservation-owned historical state.

Reservation reconstruction SHALL NOT require querying a live Journey aggregate.

---

# 11. Accommodation Snapshot Persistence

The Reservation-owned accommodation snapshot collection SHALL be persisted independently from mutable accommodation catalogue state.

Each persisted accommodation snapshot SHALL preserve the accepted 3K-C contract, including:

- package identity;
- package-stop identity;
- stop order;
- selected property;
- selected room;
- selected rate;
- provider identity;
- opaque supplier references;
- stay dates;
- room occupancy;
- child ages;
- supplier price;
- supplier currency;
- pricing basis where present.

The physical representation SHALL support:

- zero or more accommodation snapshots;
- multiple package stops;
- multiple rooms;
- stop-specific dates;
- room-specific occupancy;
- room-specific child ages.

Stops SHALL NOT be flattened into Booking scalar fields.

Room selections SHALL NOT be replaced by a single Booking-level room or guest count.

The persisted snapshot SHALL remain independent of subsequent catalogue changes.

---

# 12. Supplier References and Supplier State

Supplier state SHALL remain distinct from immutable accommodation snapshot data.

The physical model SHALL support supplier operational information required to reconstruct the Reservation, including:

- provider identity;
- opaque supplier references;
- supplier booking state;
- supplier confirmation information where present;
- stop-level association where applicable.

Supplier references SHALL remain provider-neutral.

Hotelbeds-specific field names SHALL NOT become canonical Reservation field names.

The existing Prisma `Reservation` operational/supplier structure SHALL be reused where its semantics match the accepted contract.

Where it does not contain sufficient information, Reservation-owned persistence structures SHALL be extended rather than overloading unrelated Booking fields.

Supplier state SHALL NOT redefine the GCT Reservation lifecycle.

---

# 13. Pricing Snapshot Persistence

The canonical `PricingSnapshot` SHALL be persisted as Reservation-owned historical commercial state.

It SHALL preserve the accepted pricing contract, including:

- currency;
- total price;
- taxes;
- discounts;
- fees.

The persisted pricing snapshot SHALL represent the commercial price associated with the Reservation at the relevant lifecycle point.

Supplier accommodation prices SHALL remain separate from the final GCT commercial pricing snapshot.

The implementation SHALL NOT reconstruct historical Reservation pricing from current catalogue or supplier rates.

---

# 14. Timeline Persistence

Reservation timeline entries SHALL be persisted as Reservation-owned state.

The physical model SHALL preserve the information required by the existing timeline contract, including:

- event/state occurrence;
- timestamp;
- relevant lifecycle transition information;
- metadata already defined by the accepted application contract.

Timeline entries SHALL remain ordered by their canonical timestamp/ordering semantics.

The implementation SHALL NOT invent additional business timeline events.

---

# 15. Metadata Persistence

Reservation metadata SHALL be persisted as Reservation-owned state.

The physical representation SHALL preserve the accepted metadata contract without introducing new business semantics.

Metadata SHALL remain subordinate to the Reservation aggregate.

Metadata SHALL NOT be used as a substitute for:

- lifecycle state;
- reservation number;
- Customer identity;
- Booking dates;
- pricing;
- supplier state;
- snapshots.

---

# 16. Aggregate Ownership

The physical model SHALL preserve Reservation ownership.

The following are Reservation-owned persistence state:

- Traveller snapshots;
- Journey snapshot;
- accommodation snapshots;
- pricing snapshot;
- supplier references/state owned by Reservation;
- timeline;
- metadata.

These structures SHALL NOT become independently managed business aggregates.

The application Reservation repository SHALL remain the persistence boundary.

Cross-aggregate reference data SHALL remain references and SHALL NOT be copied into Reservation-owned state unless the accepted snapshot contract explicitly requires it.

---

# 17. Physical Relationship Rules

The physical relationship graph SHALL support the following reconstruction:

`Booking`
→ Reservation-owned canonical state
→ Traveller snapshots
→ Journey snapshot
→ Accommodation snapshots
→ Pricing snapshot
→ Supplier state
→ Timeline
→ Metadata

The repository SHALL retrieve the complete Reservation graph required by the application aggregate.

Partial retrieval SHALL NOT silently return an incomplete Reservation.

The physical model SHALL preserve one-to-many relationships where the canonical contract contains collections.

The physical model SHALL preserve singular relationships where the canonical contract contains singular snapshots.

---

# 18. Persistence Transaction Boundary

Saving a Reservation SHALL be transactional across the Reservation-owned persistence graph.

A successful save SHALL persist all required Reservation state atomically.

A failure during child persistence SHALL NOT leave a partially persisted Reservation graph.

The implementation SHALL use the repository/infrastructure transaction mechanism already established by the project.

The implementation SHALL NOT introduce a second transaction abstraction solely for this iteration.

---

# 19. Create / Update Behaviour

## 19.1 Create

Creating a Reservation SHALL persist:

- Booking/commercial-root state;
- Reservation lifecycle;
- reservation number;
- Customer context;
- Booking dates;
- all supplied snapshots;
- PricingSnapshot;
- supplier state;
- timeline;
- metadata.

## 19.2 Update

Updating a Reservation SHALL preserve aggregate ownership and lifecycle semantics.

Snapshot state SHALL be treated as historical Reservation state.

An amendment SHALL update the canonical Reservation according to the accepted application contract rather than mutating unrelated catalogue records.

## 19.3 Replacement of Owned Collections

When the accepted repository contract requires replacement of Reservation-owned snapshot collections, the implementation SHALL replace the Reservation-owned persistence state atomically within the same transaction.

The implementation SHALL NOT leave orphaned snapshot records.

---

# 20. Retrieval / Reconstruction

Repository retrieval SHALL reconstruct a canonical application `Reservation`.

The reconstruction SHALL preserve:

- technical identity;
- reservation number;
- lifecycle;
- Customer context supplied by persistence;
- Booking dates;
- Traveller snapshot order and values;
- Journey snapshot;
- accommodation snapshot order and values;
- PricingSnapshot;
- supplier references/state;
- timeline;
- metadata.

Round-trip behaviour SHALL satisfy:

`Reservation → persist → retrieve → Reservation`

without material loss of accepted Reservation state.

The retrieved object SHALL remain a valid canonical Reservation aggregate.

---

# 21. Mapper Requirements

The Reservation mapper SHALL be aligned to the physical persistence model defined by this specification.

The mapper SHALL:

- use explicit persistence types;
- map domain state to persistence state;
- map persistence state back to the canonical Reservation;
- avoid `any`;
- preserve nullability semantics;
- preserve collection ordering;
- preserve snapshot values;
- preserve lifecycle values;
- preserve technical identity and business reservation number separately.

The mapper SHALL NOT use the legacy flat persistence shape where it conflicts with the accepted 3K-C contract.

Prisma-generated types MAY be used inside infrastructure/application persistence mapping where appropriate.

Prisma-specific types SHALL NOT leak into the domain layer.

---

# 22. Repository Requirements

The canonical persistence implementation SHALL implement the existing persistence-neutral `ReservationRepository`.

The implementation SHALL:

- save the complete Reservation persistence graph;
- retrieve the complete graph;
- preserve repository abstraction;
- use the existing Prisma infrastructure;
- remain infrastructure-specific;
- not expose Prisma types through the repository interface.

The repository SHALL NOT become an application service.

The repository SHALL NOT contain business lifecycle rules that belong to the Reservation aggregate or application service.

---

# 23. Existing Legacy Reservation Infrastructure

Existing legacy Reservation persistence infrastructure SHALL NOT be preserved merely for compatibility if it conflicts with the accepted 3K-C contract.

The canonical repository path SHALL be aligned to the accepted Reservation contract.

Legacy consumers that remain outside the active runtime Reservation composition SHALL NOT be expanded as part of this iteration.

If an existing legacy consumer prevents implementation of the canonical repository contract, Copilot SHALL report the specific conflict rather than redesigning the canonical contract.

---

# 24. Prisma Schema Requirements

The Prisma schema SHALL be extended only where required to represent the accepted Reservation persistence contract.

Schema changes SHALL:

- preserve existing unrelated models;
- preserve existing relationships;
- avoid duplicate commercial roots;
- preserve Booking as the commercial root;
- preserve supplier Reservation as operational state;
- introduce only Reservation-owned structures required by this specification;
- enforce required relationships;
- enforce appropriate uniqueness;
- enforce appropriate nullability;
- preserve collection ownership;
- support transactional persistence.

The implementation SHALL use the repository's established naming, timestamp, identifier, relation and indexing conventions.

Copilot SHALL inspect the existing Prisma schema before modifying it.

Copilot SHALL NOT invent duplicate versions of existing models.

---

# 25. Database Migration Safety

Because this iteration changes the physical persistence model, Prisma schema migration work is within scope only for the schema changes explicitly required by this specification.

Copilot SHALL:

- modify the Prisma schema only as required;
- validate the schema;
- generate the required migration artefact according to the established repository convention;
- test the resulting persistence model.

Copilot SHALL NOT:

- modify production database state;
- seed persistent production data;
- alter unrelated tables;
- perform unrelated migrations.

Any migration requiring destructive data transformation not directly supported by the existing repository state SHALL stop implementation and be reported as a decision gap.

---

# 26. Validation Rules

The persistence layer SHALL reject or fail safely when:

- reservation number is missing where required;
- required Customer context is missing;
- required Booking dates are missing;
- lifecycle state is invalid;
- required snapshot data cannot be reconstructed;
- supplier state contains an invalid provider-neutral reference structure;
- persistence graph is incomplete;
- technical identity conflicts with an existing record;
- unique business reservation number constraints are violated.

The repository SHALL NOT silently fabricate missing business data.

---

# 27. Error Handling

Persistence errors SHALL remain infrastructure errors and SHALL NOT be silently converted into successful Reservation results.

The implementation SHALL preserve existing application error-handling conventions.

The implementation SHALL distinguish, where existing conventions support it:

- not found;
- persistence validation failure;
- uniqueness/conflict failure;
- transaction failure;
- reconstruction failure.

No new global error hierarchy SHALL be introduced by this iteration.

---

# 28. Security

The implementation SHALL:

- preserve existing database access controls;
- avoid logging Traveller snapshot contents;
- avoid logging customer-sensitive data;
- avoid logging supplier credentials or authentication data;
- avoid exposing Prisma persistence structures outside infrastructure;
- preserve existing configuration and secret-handling mechanisms.

No new authentication or authorization mechanism is introduced by this specification.

---

# 29. Testing Requirements

Focused tests SHALL cover the Reservation persistence boundary.

At minimum:

1. create Reservation persistence;
2. retrieve Reservation persistence;
3. technical identity preservation;
4. reservation number preservation;
5. lifecycle preservation for all six canonical states;
6. Customer context persistence;
7. Booking start/end dates;
8. ordered Traveller snapshots;
9. Journey snapshot;
10. multiple accommodation snapshots;
11. multiple rooms where represented by the accepted contract;
12. child ages;
13. supplier references/state;
14. PricingSnapshot;
15. timeline;
16. metadata;
17. transaction rollback on persistence failure;
18. complete round-trip reconstruction;
19. missing required persistence context;
20. invalid lifecycle mapping;
21. reservation-number uniqueness/conflict;
22. absence of data loss during reconstruction.

Tests SHALL use controlled test data and mocks where appropriate.

Hotelbeds and other external supplier APIs SHALL NOT be called by automated persistence tests.

---

# 30. Verification Requirements

After implementation Copilot SHALL run:

- focused Reservation persistence tests;
- `npm run build`;
- `npm test -- --runInBand`;
- `npx prisma validate`;
- `npm run lint`.

The full Jest suite SHALL be run after focused tests.

Existing lint warnings SHALL NOT be remediated unless directly introduced by this iteration.

A new blocking lint error SHALL be treated as an implementation defect.

The Copilot report SHALL include:

- implementation status;
- files changed;
- Prisma schema changes;
- migration changes;
- focused tests;
- focused test result;
- full regression result;
- build result;
- Prisma result;
- lint result;
- relevant warnings/errors;
- scope confirmation;
- any implementation or architecture issue.

---

# 31. Acceptance Criteria

PERSISTENCE-B3L is acceptable only when all of the following are true:

### Contract

- [ ] Canonical application Reservation remains unchanged.
- [ ] 3K-C contract is preserved.
- [ ] Reservation number remains distinct from technical identity.
- [ ] ReservationPersistenceContext is consumed as established.

### Physical Model

- [ ] Booking remains the commercial physical root.
- [ ] Supplier Reservation remains operational/supplier state.
- [ ] Reservation-owned snapshots are physically persisted.
- [ ] No live Journey persistence dependency is introduced.
- [ ] Snapshot ownership is explicit.
- [ ] Multiple accommodation stops are supported.
- [ ] Multiple rooms and child ages are preserved where present.
- [ ] PricingSnapshot is preserved.
- [ ] Timeline and metadata are preserved.

### Repository

- [ ] ReservationRepository remains persistence-neutral.
- [ ] Save persists the complete Reservation graph transactionally.
- [ ] Retrieval reconstructs the complete Reservation aggregate.
- [ ] No Prisma types leak through the repository interface.

### Mapping

- [ ] Domain-to-persistence mapping is explicit.
- [ ] Persistence-to-domain mapping is explicit.
- [ ] No `any` is introduced at the Reservation persistence boundary.
- [ ] Legacy flat Reservation mapping no longer defines the canonical persistence contract.

### Database

- [ ] Prisma schema validates.
- [ ] Required migration artefacts are generated according to repository convention.
- [ ] No unrelated schema changes are introduced.
- [ ] No production database changes are performed.

### Verification

- [ ] Focused Reservation persistence tests pass.
- [ ] Full Jest regression passes, or unrelated pre-existing failures are identified and classified.
- [ ] Build passes.
- [ ] Prisma validation passes.
- [ ] No new blocking lint errors exist.
- [ ] No architectural violation remains.

---

# 32. Implementation Sequence

Copilot SHALL implement this iteration in the following order:

1. Inspect the current 3K-C Reservation application contract and repository boundary.
2. Inspect the current Prisma Booking and Reservation structures and established schema conventions.
3. Implement the physical Reservation-owned persistence structures required by this specification.
4. Align Booking/commercial-root mapping.
5. Implement lifecycle mapping.
6. Implement ReservationPersistenceContext mapping.
7. Implement snapshot persistence.
8. Implement supplier state persistence.
9. Implement timeline and metadata persistence.
10. Implement complete transactional repository save.
11. Implement complete repository retrieval.
12. Replace incompatible legacy Reservation mapper assumptions with the canonical persistence mapping.
13. Add focused persistence tests.
14. Run focused verification.
15. Run full regression, build, Prisma validation and lint.
16. Produce the Copilot implementation report.

If the current repository contains a structure that materially conflicts with this specification and cannot be resolved without a new architectural decision, Copilot SHALL stop at that point and report the decision gap.

Copilot SHALL NOT invent a replacement architecture.

---

# 33. Explicit Scope Boundaries

This iteration SHALL NOT:

- create Reservation HTTP routes;
- create Reservation controllers;
- create API DTOs;
- change Reservation business lifecycle;
- change PricingSnapshot semantics;
- change Traveller snapshot semantics;
- change Journey snapshot semantics;
- add Hotelbeds calls;
- modify Hotelbeds contracts;
- implement payment;
- implement invoice;
- implement voucher/document generation;
- implement customer communication;
- introduce Journey persistence;
- redesign Traveller persistence;
- clean unrelated lint warnings;
- refactor unrelated repositories;
- introduce speculative abstractions.

Any newly discovered requirement belongs to a future iteration unless it is necessary to satisfy this specification.

---

# 34. Architectural Constraints

The following are mandatory architectural constraints:

1. `application/reservations/Reservation` remains canonical.
2. `ReservationRepository` remains persistence-neutral.
3. `ReservationPersistenceContext` remains the boundary for persistence-owned Booking context.
4. Booking remains the physical commercial root.
5. Supplier Reservation remains operational supplier state.
6. Reservation snapshots are immutable historical state.
7. Live catalogue data does not reconstruct historical Reservation snapshots.
8. Live Journey persistence is not required for Reservation reconstruction.
9. Supplier-specific fields remain behind provider-neutral contracts.
10. Prisma remains an infrastructure concern.
11. Domain code SHALL NOT depend on Prisma.
12. No parallel Reservation aggregate is introduced.
13. No second commercial Booking root is introduced.

---

# 35. Decision-Gap Rule

The following conditions SHALL stop implementation and return the iteration to architect review:

- the existing 3K-C `ReservationPersistenceContext` contract cannot be located or does not match the approved context described by 3K-C;
- Booking cannot support the established commercial-root mapping without changing an accepted business contract;
- reservation number ownership conflicts with an accepted 3K-C decision;
- the required physical representation would require redefining the Reservation aggregate;
- an existing schema constraint requires destructive migration;
- an existing accepted architecture requires a second commercial root;
- the required snapshot fields cannot be established from the accepted 3K-C contract;
- supplier state cannot be separated from the canonical GCT Reservation lifecycle without a new domain decision.

In these circumstances Copilot SHALL NOT make the decision independently.

---

# 36. Definition of Done

PERSISTENCE-B3L is DONE when:

- the approved physical persistence model is implemented;
- the canonical Reservation can be saved;
- the canonical Reservation can be retrieved;
- the complete aggregate survives a persistence round trip;
- snapshots remain historical and Reservation-owned;
- supplier state remains distinct from GCT lifecycle state;
- focused tests pass;
- full regression passes or known unrelated failures are understood;
- build passes;
- Prisma validation passes;
- no new blocking lint errors exist;
- no architectural violation remains;
- Copilot has supplied the required implementation report;
- the architect has formally accepted the implementation.

After architect acceptance, the user performs the commit.

---

# 37. Traceability

| Authority | Relationship |
|---|---|
| GOV-DEV-001 | Governing development workflow |
| ARCH-000 | Platform architecture authority |
| SPEC-000 | Engineering specification standard |
| SPEC-001 | Canonical domain model |
| SPEC-002 | Canonical physical data model |
| APP-004 | Reservation capability ownership |
| 3K-C | Canonical Reservation application contract |
| ReservationRepository | Persistence-neutral repository boundary |
| ReservationPersistenceContext | Persistence-owned Booking context |
| Prisma Booking | Physical commercial root |
| Prisma Reservation | Supplier/operational persistence state |

---

# 38. Architect Review Status

**STATUS: DRAFT — ARCHITECT REVIEW REQUIRED**

Implementation is **NOT AUTHORIZED** by this document alone.

Implementation may begin only after architect review confirms that:

- the physical boundary is correct;
- the specification is consistent with 3K-C;
- no unresolved architectural decision gap remains;
- the scope is sufficiently narrow;
- the Prisma changes are supported by the established architecture.

Upon approval, this document becomes the implementation contract for PERSISTENCE-B3L.

---

# 39. Governance Confirmation

This specification follows `GOV-DEV-001-DEVELOPMENT-PROCESS.md`.

The intended progression is:

**Specification**
→ **Architect Review / Approval**
→ **Copilot Implementation**
→ **Focused Tests + Full Regression**
→ **Copilot Report**
→ **Architect Acceptance**
→ **User Commit**

No implementation, commit, or additional pre-commit governance stage is authorised by this document.