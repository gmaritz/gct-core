# GCT CORE — PERSISTENCE RECONCILIATION BATCH 3K-A
## Reservation Authority & Contract Consolidation Decision

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B3K-A-RESERVATION |
| Title | Reservation Authority & Contract Consolidation Decision |
| Project | GCT Core |
| Type | Focused Architectural Decision Specification |
| Status | Pending Architect Approval |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Predecessor | PERSISTENCE-B3K-R-RESERVATION |
| Affected Iteration | B3K |
| Downstream | B3K correction / B3L Reservation Persistence |

---

# 2. Purpose

Resolve the competing Reservation application paths identified by B3K-R before further Reservation persistence implementation proceeds.

The decision SHALL establish:

1. canonical Reservation aggregate;
2. canonical Reservation lifecycle;
3. canonical Reservation creation flow;
4. canonical repository boundary;
5. canonical Reservation number contract;
6. treatment of the legacy path;
7. treatment of the newer `application/reservations` path;
8. treatment of the existing B3K implementation;
9. migration/consolidation boundary;
10. conditions required before B3L may proceed.

This iteration MUST NOT implement the consolidation.

---

# 3. Evidence Basis

B3K-R established:

- no Reservation runtime endpoint is currently wired;
- no production composition-root evidence establishes a Reservation runtime owner;
- two materially different Reservation contracts exist;
- the legacy path is persistence-capable;
- the newer `application/reservations` path is persistence-independent;
- the two paths have different lifecycle contracts;
- B3K was implemented against the legacy path;
- the newer path derives reservation number from identity;
- both paths are exported.

Therefore neither path may be declared canonical solely because it is:

- newer;
- persistence-wired;
- exported;
- better tested;
- located in a preferred directory.

---

# 4. Architectural Principle

GCT Core SHALL have exactly one canonical Reservation application contract.

There MUST NOT be two competing Reservation aggregates with independent:

- lifecycle definitions;
- reservation-number semantics;
- creation flows;
- repository contracts;
- persistence ownership.

A transitional implementation MAY exist temporarily, but its transitional status MUST be explicit.

---

# 5. Canonical Reservation Aggregate

The canonical Reservation aggregate SHALL be the aggregate that represents the complete GCT Reservation business contract.

The canonical aggregate MUST support the established Reservation concepts:

- technical identity;
- business reservation number;
- GCT lifecycle;
- Traveller snapshots;
- Journey snapshot;
- accommodation snapshots;
- pricing;
- supplier references/state;
- timeline;
- metadata.

The canonical aggregate MUST be selected based on semantic completeness and existing architecture, not directory age.

---

# 6. Canonical Lifecycle

The canonical Reservation lifecycle SHALL be:

- `CREATED`
- `QUOTED`
- `CONFIRMED`
- `AMENDED`
- `CANCELLED`
- `COMPLETED`

This lifecycle represents the GCT Reservation business lifecycle.

Legacy lifecycle values such as:

- `PENDING`

MUST NOT remain as an independent competing Reservation lifecycle.

Booking status and supplier operational status remain separate concepts.

---

# 7. Canonical Reservation Number

The canonical Reservation contract SHALL contain an explicit:

`reservationNumber`

It is a business identifier separate from:

`ReservationIdentity.id`

The canonical contract SHALL establish:

- ownership;
- generation;
- immutability;
- creation;
- retrieval;
- presentation;
- future persistence mapping.

The existing approved numbering convention SHALL be reused where one exists.

No competing reservation-number derivation from technical identity is permitted.

---

# 8. Canonical Creation Flow

Exactly one Reservation creation flow SHALL be authoritative.

The canonical flow SHALL:

1. accept the approved Reservation creation contract;
2. construct the canonical Reservation aggregate;
3. establish the reservation number;
4. establish Customer context;
5. establish required Booking dates;
6. establish lifecycle;
7. establish Traveller snapshots;
8. establish Journey snapshot;
9. establish pricing;
10. establish accommodation state;
11. persist through the canonical repository boundary when persistence is connected.

A second independent creation flow MUST NOT remain architecturally authoritative.

---

# 9. Canonical Repository Boundary

The canonical Reservation application flow SHALL depend on one persistence-neutral repository contract.

The repository boundary SHALL:

- accept the canonical Reservation aggregate;
- accept required persistence context;
- expose Reservation retrieval operations;
- remain independent of Prisma;
- prevent persistence models from entering the domain.

The Prisma repository SHALL implement this canonical repository boundary.

---

# 10. Canonical Persistence Context

The canonical application/persistence boundary SHALL use the concept established by B3K:

`ReservationPersistenceContext`

The final field set SHALL be determined against the canonical Reservation creation flow.

At minimum it SHALL support required persistence-only context such as:

- Customer identity;
- Booking dates;
- existing Booking status context where authoritative.

It MUST NOT contain Prisma types.

It MUST NOT become a duplicate Reservation aggregate.

---

# 11. Path A — Legacy Domain/Services Path

Current characteristics:

- persistence-capable;
- contains the B3K changes;
- has Reservation repository integration;
- has Reservation Prisma repository;
- has a legacy lifecycle;
- no proven runtime production ownership.

Classification from B3K-R:

`ACTIVE SECONDARY`

Decision:

The legacy path SHALL NOT remain an independent canonical Reservation architecture.

Its final treatment depends on whether its implementation can be safely aligned with the canonical contract.

---

# 12. Path B — Application/Reservations Path

Current characteristics:

- newer Reservation contract;
- richer lifecycle;
- snapshot-oriented structure;
- orchestration/pipeline architecture;
- no repository persistence boundary;
- no proven runtime production ownership.

Classification from B3K-R:

`TRANSITIONAL`

Decision:

The newer path SHALL NOT automatically become canonical merely because it is newer.

Its contract SHALL be evaluated against the canonical Reservation requirements defined by this decision.

---

# 13. Consolidation Decision

The two Reservation paths SHALL be consolidated into one canonical architecture.

The consolidation SHALL NOT be performed by simply copying one implementation into the other.

Before implementation, determine:

- which aggregate contains the required canonical contract;
- which service architecture should survive;
- which repository boundary should survive;
- which lifecycle should survive;
- which Reservation number contract should survive.

The result MUST be one canonical Reservation contract.

---

# 14. Canonical Path Selection Criteria

The architect SHALL select the canonical path using:

1. semantic completeness;
2. compatibility with established domain model;
3. compatibility with accepted GCT business lifecycle;
4. compatibility with existing Traveller/Journey/accommodation snapshots;
5. persistence boundary suitability;
6. application architecture;
7. migration feasibility;
8. minimum disruption to accepted architecture.

Runtime absence does not make either path canonical by default.

---

# 15. Legacy Path Treatment

If the legacy path is NOT selected as canonical:

- classify it as transitional/legacy;
- preserve it only as required for migration;
- do not add new Reservation features to it;
- do not extend its lifecycle independently;
- do not extend its persistence model independently;
- define its retirement/adaptation boundary in the next implementation specification.

If the legacy path IS selected:

- align its lifecycle with the canonical lifecycle;
- align its Reservation number contract;
- align it with the canonical Reservation application service;
- retain only the persistence architecture that remains semantically valid.

---

# 16. Newer Path Treatment

If the `application/reservations` path IS selected as canonical:

- its lifecycle becomes authoritative;
- its Reservation number becomes explicit;
- its repository boundary becomes canonical;
- its persistence context becomes canonical;
- the legacy path becomes transitional;
- B3K changes are reassessed against it.

If it is NOT selected:

- classify it as transitional/unused;
- prevent further independent contract evolution;
- define its retirement or consolidation boundary.

---

# 17. B3K Treatment

The current B3K implementation SHALL NOT be accepted as final until this authority decision is resolved.

Current classification:

`B3K BLOCKED PENDING ARCHITECTURAL DECISION`

After this decision:

### If B3K targeted the canonical path

Retain the applicable B3K changes and proceed to acceptance subject to specification compliance.

### If B3K targeted a non-canonical path

Do not blindly copy the changes.

Create a focused correction specification against the selected canonical path.

### If consolidation requires both paths

Create one focused consolidation iteration before B3L.

---

# 18. Reservation Number Presentation

The canonical Reservation presenter/API contract SHALL expose the explicit business reservation number.

The following pattern is prohibited as the canonical business number:

`reservationNumber = identity.id`

Technical identity and business reservation number MUST remain distinct.

No API implementation is authorised by this decision.

---

# 19. Lifecycle Consolidation

The canonical lifecycle SHALL replace competing lifecycle definitions.

The canonical application contract MUST NOT expose:

- `PENDING` as a competing GCT lifecycle;
- a second ReservationStatus enum;
- separate lifecycle semantics for different Reservation modules.

Booking status remains separate.

Supplier Reservation status remains separate.

---

# 20. Runtime API Boundary

B3K-R established that no Reservation runtime endpoint is currently wired.

This decision does NOT require API implementation.

The absence of a runtime endpoint SHALL NOT be used to justify maintaining two Reservation architectures.

A future Reservation API implementation MUST consume the canonical Reservation application contract.

---

# 21. Persistence Consequence

B3L SHALL NOT begin until:

1. canonical Reservation aggregate is selected;
2. canonical lifecycle is selected;
3. canonical Reservation number contract is selected;
4. canonical creation service is selected;
5. canonical repository boundary is selected;
6. B3K status is resolved.

B3L then defines the physical Prisma representation of the accepted canonical contract.

---

# 22. Required Consolidation Boundary

The next implementation specification SHALL define only the changes required to establish the canonical Reservation path.

It SHALL NOT simultaneously implement:

- complete Reservation persistence;
- Prisma accommodation structures;
- Journey persistence;
- supplier booking integration;
- API endpoints;
- unrelated lint remediation.

Those remain separate iterations.

---

# 23. Architectural Decision Outcomes

The architect SHALL select exactly one:

### OPTION A — LEGACY PATH CANONICAL

The existing domain/services path becomes canonical.

The newer application/reservations path becomes transitional.

### OPTION B — APPLICATION/RESERVATIONS CANONICAL

The newer path becomes canonical.

The legacy domain/services path becomes transitional.

### OPTION C — CONSOLIDATED CANONICAL PATH

Elements of both paths are retained, but a single explicitly defined Reservation contract and application flow becomes canonical.

This option requires a focused consolidation specification.

### OPTION D — BLOCKED

Available only if the existing evidence is insufficient to select a canonical architecture.

If selected, no implementation proceeds.

---

# 24. Acceptance Criteria

This decision is complete when:

- [ ] One canonical Reservation aggregate is identified.
- [ ] One canonical Reservation lifecycle is identified.
- [ ] One canonical Reservation number contract is identified.
- [ ] One canonical Reservation creation flow is identified.
- [ ] One canonical repository boundary is identified.
- [ ] Legacy path treatment is defined.
- [ ] Newer path treatment is defined.
- [ ] B3K treatment is defined.
- [ ] Reservation API future ownership is defined.
- [ ] B3L dependency is explicit.
- [ ] No implementation is performed as part of this decision.

---

# 25. Copilot Review Requirement

Copilot SHALL perform a read-only review against this decision.

Copilot SHALL report:

## Path A

- aggregate;
- lifecycle;
- creation flow;
- repository;
- persistence wiring;
- production consumers.

## Path B

- aggregate;
- lifecycle;
- creation flow;
- repository;
- persistence wiring;
- production consumers.

## Contract Comparison

Identify material differences.

## Recommendation

Recommend:

- Option A;
- Option B;
- Option C;
- or Option D.

The recommendation MUST be evidence-based.

Copilot MUST NOT modify files.

---

# 26. Scope Audit

The review/decision SHALL confirm:

- source files modified: 0;
- test files modified: 0;
- Prisma modified: NO;
- database modified: NO;
- migrations: NO;
- configuration modified: NO;
- lint configuration modified: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- B3K implementation modified: NO;
- commit created: NO.

---

# 27. Completion Boundary

3K-A ends when the Reservation authority decision is explicitly accepted.

It does NOT implement the consolidation.

After acceptance:

### Option A

Proceed to a focused correction specification for the legacy canonical path.

### Option B

Proceed to a focused migration/consolidation specification for `application/reservations`.

### Option C

Proceed to a focused consolidation specification.

Only after the canonical application contract is established may B3L define physical Reservation persistence.

---

# 28. Final Status

**PENDING ARCHITECT APPROVAL**

Required sequence:

3K-A Authority Decision
→ Architect Approval
→ Canonical Path Consolidation/Correction Specification
→ Implementation
→ Verification
→ Acceptance
→ Commit
→ B3L Reservation Physical Persistence Specification