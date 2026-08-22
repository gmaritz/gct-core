# GCT CORE — PERSISTENCE RECONCILIATION BATCH B3K-R
## Reservation Application Path Ownership Review

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B3K-R-RESERVATION |
| Title | Reservation Application Path Ownership Review |
| Project | GCT Core |
| Type | Read-Only Architecture / Ownership Review |
| Status | Review Only |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Predecessor | PERSISTENCE-B3K-RESERVATION |
| Current Lint Baseline | 11 warnings |
| Implementation Authorised | NO |

---

# 2. Purpose

Determine which Reservation application implementation is the canonical production path.

The B3K implementation report identified two Reservation paths:

1. the legacy persistence-wired Reservation path under `domain/services`;
2. the newer Reservation contract under `application/reservations`.

Before B3K can be accepted and before B3L physical persistence work begins, the project MUST establish which path is authoritative.

This review SHALL determine:

- canonical Reservation aggregate;
- canonical Reservation creation flow;
- canonical application service;
- canonical repository contract;
- canonical persistence path;
- status of the newer `application/reservations` module;
- status of the legacy `domain/services` path;
- whether two competing Reservation contracts exist;
- whether B3K was implemented against the correct path.

---

# 3. Governing Process

Follow:

`GOV-DEV-001-DEVELOPMENT-PROCESS`

Required sequence:

Read-only investigation
→ Ownership findings
→ Architectural decision
→ Corrected/focused specification if required
→ Architect Approval
→ Copilot Implementation
→ Verification
→ Acceptance
→ User Commit

This review MUST NOT modify implementation.

---

# 4. Read-Only Restrictions

This review MUST NOT:

- modify source files;
- modify tests;
- modify repository interfaces;
- modify domain contracts;
- modify application contracts;
- modify Prisma schema;
- generate migrations;
- modify the database;
- modify configuration;
- modify ESLint configuration;
- remove warnings;
- create commits.

The B3K implementation already present in the worktree MUST NOT be altered.

---

# 5. Reservation Implementations To Compare

The review MUST explicitly investigate both paths identified by the B3K implementation report.

### Path A — Legacy Persistence-Wired Path

Investigate:

- Reservation aggregate under `domain/services`;
- Reservation application/service flow associated with this path;
- `CreateReservationCommand`;
- `CreateReservationService`;
- `IReservationRepository`;
- `ReservationPrismaRepository`;
- existing Reservation tests;
- existing application consumers.

### Path B — Newer Application Reservations Path

Investigate:

- `application/reservations`;
- Reservation aggregate/contracts located there;
- create/use cases;
- DTOs;
- commands;
- services;
- repository dependencies;
- tests;
- imports and consumers.

Do not assume either path is canonical because of its directory name.

---

# 6. Canonicality Criteria

A Reservation path SHALL be considered canonical only where evidence establishes that it is the authoritative implementation for the current GCT Core application.

Assess each path against:

1. production consumers;
2. application service usage;
3. domain ownership;
4. repository ownership;
5. API usage;
6. test coverage;
7. dependency direction;
8. persistence integration;
9. current architecture;
10. whether another Reservation implementation supersedes it.

Do not use file age or directory naming as the sole basis for the decision.

---

# 7. Reservation Aggregate Ownership

For each Reservation aggregate implementation determine:

- file path;
- class/type name;
- package/module;
- imports;
- consumers;
- repository relationship;
- application service relationship;
- test coverage.

Determine whether the two paths use:

- the same aggregate;
- separate aggregates;
- duplicate representations;
- transitional representations.

### Required Classification

For each path choose:

- `CANONICAL`
- `ACTIVE SECONDARY`
- `TRANSITIONAL`
- `LEGACY`
- `UNUSED`
- `DUPLICATE / CONFLICTING`
- `UNRESOLVED`

---

# 8. Creation Flow Ownership

Inspect every active Reservation creation flow.

For each flow document:

- command;
- service/use case;
- builder/factory;
- aggregate;
- repository;
- consumers;
- tests.

Determine which flow is actually used by current application code.

Specifically establish whether:

`CreateReservationService`

under the B3K implementation is the canonical Reservation creation path.

Also establish whether the newer `application/reservations` flow is:

- actively invoked;
- indirectly invoked;
- tested only;
- exported only;
- unused;
- transitional.

---

# 9. Application Service Ownership

Determine the authoritative application service responsible for Reservation creation.

The canonical service MUST be identified from actual consumers.

Document:

- service path;
- command path;
- aggregate path;
- repository path;
- production callers.

If both paths have services, determine whether one delegates to the other.

If neither can be established as canonical, report:

`BLOCKED — RESERVATION APPLICATION OWNER`

---

# 10. Repository Ownership

Inspect all Reservation repository interfaces and implementations.

Determine:

- canonical repository interface;
- canonical Prisma repository;
- legacy repository interfaces;
- duplicate repository implementations;
- application consumers.

Specifically establish whether:

`IReservationRepository`

modified by B3K is the repository used by the canonical Reservation application flow.

Do not modify any repository.

---

# 11. Persistence Wiring

For each Reservation path determine whether it is persistence-wired.

Document:

| Path | Domain | Application | Repository | Prisma | Production Consumer |
|---|---|---|---|---|---|
| Legacy/domain-services | TBD | TBD | TBD | TBD | TBD |
| application/reservations | TBD | TBD | TBD | TBD | TBD |

The review MUST distinguish:

- fully persistence-wired;
- partially wired;
- persistence-independent;
- unused.

---

# 12. B3K Implementation Alignment

Review the actual B3K changes already present in the worktree.

Determine which Reservation path they modify.

Specifically inspect:

- Reservation aggregate changes;
- reservation-number generator;
- CreateReservationCommand;
- CreateReservationService;
- repository contract;
- Prisma repository;
- focused tests.

Determine whether these changes belong to the canonical Reservation path.

### Required Result

Choose:

- `B3K CORRECTLY TARGETED CANONICAL PATH`
- `B3K TARGETED ACTIVE SECONDARY PATH`
- `B3K TARGETED LEGACY PATH`
- `B3K SPANS MULTIPLE PATHS`
- `UNRESOLVED`

---

# 13. Reservation Contract Comparison

If two active Reservation contracts exist, compare:

- identity;
- reservation number;
- lifecycle;
- Traveller snapshots;
- Journey snapshot;
- accommodation snapshots;
- pricing;
- supplier references;
- timeline;
- metadata.

Produce:

| Contract | Legacy Path | Newer Path | Relationship |
|---|---|---|---|
| Identity | TBD | TBD | TBD |
| Reservation number | TBD | TBD | TBD |
| Lifecycle | TBD | TBD | TBD |
| Traveller snapshots | TBD | TBD | TBD |
| Journey snapshot | TBD | TBD | TBD |
| Accommodation | TBD | TBD | TBD |
| Pricing | TBD | TBD | TBD |
| Supplier state | TBD | TBD | TBD |
| Timeline | TBD | TBD | TBD |

Do not reconcile the contracts during this review.

Only identify differences.

---

# 14. API Ownership

Inspect Reservation API presenters/controllers/routes and determine which Reservation contract they consume.

Determine:

- whether API responses originate from the legacy path;
- whether API responses originate from `application/reservations`;
- whether both are exposed;
- whether either path is currently externally active.

If no API exists for either path, state that explicitly.

Do not modify API contracts.

---

# 15. Test Ownership

Inspect Reservation tests and determine which implementation they exercise.

Classify tests as:

- canonical production-flow tests;
- unit tests of unused modules;
- legacy tests;
- transitional tests;
- duplicate tests.

Do not change tests.

Test existence alone MUST NOT establish production canonicality.

---

# 16. Import / Consumer Evidence

Search the complete source tree for consumers of:

- Reservation aggregate;
- CreateReservationCommand;
- CreateReservationService;
- `IReservationRepository`;
- `ReservationPrismaRepository`;
- `application/reservations`;
- legacy Reservation modules.

Determine actual dependency direction.

Production consumers have greater authority than isolated exports or unit tests.

---

# 17. Build Evidence

Determine whether both Reservation paths are compiled into the production build.

Compilation alone does NOT establish canonicality.

If one path is compiled but has no production consumers, classify it accordingly.

---

# 18. Export Evidence

Inspect relevant barrel exports.

Determine whether either path is:

- publicly exported;
- internally exported;
- exported but unused;
- not exported.

Exports are supporting evidence only and MUST NOT override production consumer evidence.

---

# 19. Persistence Boundary Evidence

Determine where the application currently crosses into persistence.

For the canonical Reservation path document:

`Application`
→ `Repository`
→ `Prisma`

If the newer `application/reservations` path stops before repository persistence, explicitly document that boundary.

Do not wire it during this review.

---

# 20. Domain Boundary Evidence

Determine which Reservation aggregate is actually treated as the domain authority by current production code.

The canonical domain contract MUST NOT be selected solely because it is newer.

Use:

- consumers;
- services;
- repository;
- API;
- tests;
- dependency structure.

---

# 21. Duplicate Contract Assessment

If both Reservation paths contain materially different contracts, determine whether they represent:

- deliberate layering;
- migration in progress;
- duplicate implementation;
- abandoned implementation;
- incompatible architectures.

If they are incompatible, report:

`BLOCKED — COMPETING RESERVATION CONTRACTS`

Do not merge them during this review.

---

# 22. Canonical Path Decision

The review MUST produce one of:

### `CANONICAL — LEGACY PERSISTENCE-WIRED PATH`

The legacy path is confirmed as the current production authority.

### `CANONICAL — APPLICATION/RESERVATIONS PATH`

The newer path is confirmed as the current production authority.

### `CANONICAL — CONSOLIDATED PATH`

The two paths are intentionally complementary and form one coherent architecture.

### `BLOCKED — COMPETING PATHS`

The codebase contains unresolved competing Reservation architectures.

### `BLOCKED — INSUFFICIENT EVIDENCE`

The canonical path cannot be established from source evidence.

---

# 23. B3K Acceptance Decision

Based on the canonical-path decision, classify B3K as:

- `ACCEPTABLE AS IMPLEMENTED`
- `ACCEPTABLE WITH SCOPE NOTE`
- `REQUIRES CORRECTION`
- `MUST BE REVERTED`
- `BLOCKED PENDING ARCHITECTURAL DECISION`

The review MUST explain the decision.

No code changes are authorised to correct B3K during this review.

---

# 24. B3K Contract Changes

Determine which B3K changes are:

- canonical;
- reusable;
- legacy-only;
- potentially transferable;
- architecturally invalid.

Specifically assess:

- reservation number generator;
- Reservation number property;
- Customer context;
- Booking dates;
- persistence context;
- repository signature;
- Prisma repository validation.

---

# 25. Follow-Up Recommendation

The review MUST recommend the smallest next architectural step.

Possible outcomes:

### Outcome A

B3K is correctly targeted.

Next:

`B3K Acceptance`
→ `B3L Physical Persistence Specification`

### Outcome B

B3K targeted a secondary/transitional path.

Next:

focused correction specification.

### Outcome C

Two competing Reservation architectures exist.

Next:

Reservation architecture consolidation decision.

### Outcome D

Canonical path is the newer application module.

Next:

focused application-to-persistence wiring specification.

---

# 26. No Implementation Recommendation

This review MUST NOT recommend simply copying B3K changes from one path into another.

If the newer path is canonical, determine the required architectural transition first.

Do not assume structural equivalence between the two Reservation contracts.

---

# 27. Scope

## In Scope

- Reservation path ownership;
- aggregate ownership;
- application service ownership;
- repository ownership;
- persistence wiring;
- production consumers;
- API consumers;
- test ownership;
- B3K alignment;
- canonical-path decision.

## Out of Scope

- source modification;
- contract modification;
- Prisma changes;
- database changes;
- migrations;
- lint remediation;
- Reservation consolidation implementation;
- API changes;
- Hotelbeds;
- PayFast;
- frontend.

---

# 28. Verification

Because this is read-only:

- no implementation tests are required;
- no build changes are expected;
- no Prisma changes are expected;
- no lint changes are expected.

The current baseline SHOULD remain:

- Build: passing;
- Prisma validation: passing;
- Lint: 0 errors, 11 warnings.

Any unexpected modification MUST be reported.

---

# 29. Required Copilot Report

Copilot MUST return:

## Executive Decision

State the canonical Reservation application path.

## Path A

Report:

- aggregate;
- service;
- command;
- repository;
- Prisma wiring;
- consumers;
- tests;
- status.

## Path B

Report the same information.

## Contract Comparison

Identify material differences between the two Reservation contracts.

## B3K Alignment

State whether B3K targeted the canonical path.

## Repository Ownership

Identify the canonical repository interface and implementation.

## Production Usage

List the actual production consumers supporting the canonicality decision.

## Canonicality Classification

Choose one outcome from Section 22.

## B3K Acceptance Classification

Choose one outcome from Section 23.

## Recommended Next Step

Provide the smallest safe next architectural step.

## Scope Audit

Confirm:

- source files modified: 0;
- test files modified: 0;
- Prisma modified: NO;
- database modified: NO;
- migrations: NO;
- configuration modified: NO;
- lint configuration modified: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- commit created: NO.

---

# 30. Completion Boundary

B3K-R ends when the canonical Reservation application path has been established or the competing paths have been formally classified as unresolved.

No implementation proceeds from this document.

The next specification SHALL be determined from the ownership finding.

---

# 31. Final Status

**READ-ONLY RESERVATION APPLICATION PATH OWNERSHIP REVIEW**

Implementation is NOT authorised.

Required progression:

B3K-R Review
→ Canonical Path Decision
→ Focused Correction or B3L Specification
→ Architect Approval
→ Copilot Implementation
→ Verification
→ Architect Acceptance
→ User Commit