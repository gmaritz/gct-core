# GCT CORE — PERSISTENCE RECONCILIATION BATCH 1
## Repository Ownership Reconciliation

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B1-REPOSITORY-OWNERSHIP |
| Title | Repository Ownership Reconciliation |
| Project | GCT Core |
| Type | Focused Implementation Specification |
| Status | Implementation Ready |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Scope | Persistence repository ownership, naming and exports |
| Current Lint Warnings | 14 |
| Direct Lint Target | None |
| Primary Objective | Establish correct Journey/Reservation repository ownership |

---

## 2. Purpose

Reconcile the current Journey and Reservation persistence repository implementations so that:

- repository filenames;
- repository class names;
- repository exports;
- repository interfaces;
- application consumers;

all represent the same canonical ownership.

The read-only persistence reconciliation identified the following inconsistencies:

- `journey-prisma.repository.ts` defines `ReservationPrismaRepository`;
- `reservation-prisma.repository.ts` defines `JourneyPrismaRepository`;
- the repository barrel exports these implementations under the opposite ownership;
- the implementations also contain persistence assumptions that belong to the opposite aggregate.

This specification resolves the **repository ownership inconsistency only**.

It does not resolve the underlying Prisma schema/model mismatches.

---

## 3. Governance

Follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

The governing workflow is:

Specification
→ Implementation
→ Focused Tests + Regression
→ Copilot Report
→ Architect Acceptance
→ User Commit

Do not create a commit.

This specification is intentionally narrow and must remain implementation-focused.

---

## 4. Current Architecture

The domain repository boundaries are already established as:

- `IJourneyRepository` — Journey aggregate persistence boundary;
- `IReservationRepository` — Reservation aggregate persistence boundary;
- `ITravellerRepository` — Traveller aggregate persistence boundary.

These interfaces must remain domain-oriented and must not acquire Prisma dependencies.

The persistence implementation must preserve:

Domain Repository Interface
→ Prisma Repository Implementation
→ Prisma / Persistence Infrastructure

---

## 5. Required Ownership

The canonical ownership MUST be:

### Journey

`journey-prisma.repository.ts`

must define:

`JourneyPrismaRepository`

and implement:

`IJourneyRepository`

### Reservation

`reservation-prisma.repository.ts`

must define:

`ReservationPrismaRepository`

and implement:

`IReservationRepository`

### Traveller

`traveller-prisma.repository.ts`

must continue to define:

`TravellerPrismaRepository`

and implement:

`ITravellerRepository`

Do not alter Traveller persistence behaviour in this iteration.

---

## 6. Repository Barrel

Inspect the existing repository barrel/index exports.

The exports MUST correspond to the actual implementation ownership:

- Journey export → `JourneyPrismaRepository`;
- Reservation export → `ReservationPrismaRepository`;
- Traveller export → `TravellerPrismaRepository`.

There must be no crossed exports.

The barrel must not export a class under a filename that represents another aggregate.

---

## 7. Application Consumers

Search the complete repository for all imports and consumers of:

- `JourneyPrismaRepository`;
- `ReservationPrismaRepository`;
- `TravellerPrismaRepository`.

Confirm that each consumer receives the repository implementation corresponding to its domain repository interface.

Do not modify application behaviour.

Do not introduce a new dependency-injection framework.

Do not change repository interfaces.

If a consumer is incorrectly wired because of the existing naming/export mismatch, correct only the wiring required to restore the canonical ownership.

---

## 8. Journey Repository Scope

The Journey repository implementation must contain Journey repository responsibilities only.

It may continue to contain its existing Journey persistence methods where those methods already exist.

Do not redesign those methods.

Do not add a Prisma Journey model.

Do not remove existing Journey repository methods merely because the current Prisma schema cannot support them.

If the implementation references a nonexistent Prisma `Journey` model, leave that underlying issue for the later Journey persistence specification.

The purpose of this batch is to make it clear that those methods belong to Journey persistence.

---

## 9. Reservation Repository Scope

The Reservation repository implementation must contain Reservation repository responsibilities only.

It may retain its existing Reservation persistence methods.

Do not redesign Reservation persistence.

Do not add fields to the Prisma Reservation model.

Do not change Reservation snapshot persistence.

Do not resolve the current Reservation/Prisma schema mismatch.

Those issues belong to the later Reservation Persistence Contract specification.

---

## 10. No Persistence Model Changes

This iteration MUST NOT modify the persistence model.

Do not:

- add Prisma models;
- remove Prisma models;
- add Prisma fields;
- remove Prisma fields;
- modify relationships;
- modify indexes;
- modify enums;
- modify migrations;
- modify database structure.

The current Prisma schema remains unchanged.

---

## 11. No Repository Contract Changes

Do not modify:

- `IJourneyRepository`;
- `IReservationRepository`;
- `ITravellerRepository`;
- shared repository abstractions.

The repository interfaces are not the target of this iteration.

If an interface mismatch is discovered, report it rather than redesigning the interface.

---

## 12. No Mapper Changes

Do not modify:

- `journey.mapper.ts`;
- `reservation.mapper.ts`;
- `traveller.mapper.ts`.

The current mapper `any` warnings are intentionally preserved.

Repository ownership must be corrected independently of mapper typing.

---

## 13. No PrismaService Changes

Do not modify:

`prisma.service.ts`

Do not modify:

`bootstrap/prisma.ts`

Do not attempt to type or retire PrismaService in this iteration.

The previous Batch 1 attempt demonstrated that PrismaService typing exposes downstream persistence incompatibilities.

Prisma lifecycle ownership will be addressed later.

---

## 14. No Domain Changes

Do not modify:

- Journey aggregate;
- Reservation aggregate;
- Traveller aggregate;
- domain events;
- value objects;
- domain repository interfaces.

Repository ownership must be corrected entirely within the infrastructure boundary and necessary consumer wiring.

---

## 15. No Application Behaviour Changes

Do not change:

- Journey creation;
- Reservation lifecycle;
- Traveller behaviour;
- booking orchestration;
- accommodation functionality;
- pricing;
- payment;
- invoice functionality.

This is an infrastructure ownership correction.

---

## 16. Naming Rules

Use the established naming convention:

`<aggregate>-prisma.repository.ts`

with:

`<Aggregate>PrismaRepository`

Examples:

- `journey-prisma.repository.ts` → `JourneyPrismaRepository`
- `reservation-prisma.repository.ts` → `ReservationPrismaRepository`
- `traveller-prisma.repository.ts` → `TravellerPrismaRepository`

Do not introduce alternative naming conventions.

---

## 17. File/Class Consistency

For every affected repository verify:

1. filename;
2. class name;
3. implemented repository interface;
4. exported symbol;
5. barrel export;
6. application consumer.

All six must represent the same aggregate.

---

## 18. Repository Method Ownership

Where the current implementations are crossed, move or correct ownership only where required.

The final structure must satisfy:

### Journey Repository

Contains only Journey repository methods.

### Reservation Repository

Contains only Reservation repository methods.

### Traveller Repository

Remains unchanged except for any import/export correction required by the ownership reconciliation.

Do not rewrite method implementations.

Do not change persistence queries except where a change is strictly required because code is currently located under the wrong repository class.

---

## 19. Legacy Code Handling

Do not preserve crossed ownership through aliases.

Do not create:

- duplicate repository classes;
- compatibility aliases with misleading names;
- wrapper classes solely to preserve incorrect ownership;
- deprecated duplicate exports.

The objective is one canonical implementation per repository ownership boundary.

---

## 20. Imports and Exports

After the ownership correction:

- all imports must resolve to the correct implementation;
- all exports must resolve to the correct implementation;
- no circular import should be introduced;
- no unused repository export should remain solely because of the previous crossed naming.

Do not restructure unrelated modules.

---

## 21. Tests

Inspect existing repository tests and integration tests.

Update only tests whose imports or repository ownership references are affected by the reconciliation.

Do not change business assertions.

Do not add persistence-model tests.

Do not add Prisma schema tests.

Do not add tests for the unresolved Journey/Reservation persistence mismatches.

The purpose of testing is to prove ownership/wiring correctness.

---

## 22. Expected Test Coverage

At minimum verify:

### Journey

The Journey repository implementation can be imported under its canonical name and satisfies the expected repository interface.

### Reservation

The Reservation repository implementation can be imported under its canonical name and satisfies the expected repository interface.

### Traveller

Existing Traveller repository imports remain valid.

### Barrel

All three canonical repository exports resolve correctly.

If existing repository tests already cover these conditions, reuse them rather than creating redundant tests.

---

## 23. Lint Expectation

This batch is not primarily a lint-remediation batch.

The expected warning count may remain:

**14**

Do not attempt to remove the existing `any` warnings.

If a warning changes solely because ownership correction changes file/class location, report the exact effect.

Do not fix the warning as part of this iteration unless the ownership correction makes its existing type safe without introducing a separate typing change.

---

## 24. TypeScript Safety

Run:

`npx tsc --noEmit`

or the repository's established equivalent.

The ownership correction must compile as far as the current persistence model permits.

If the known Prisma mismatches prevent compilation:

STOP.

Do not fix those mismatches.

Report them as downstream dependencies for the next persistence specifications.

---

## 25. Verification

Run:

### Focused repository tests

Run the tests relevant to:

- Journey repository;
- Reservation repository;
- Traveller repository;
- repository exports/wiring.

### Full regression

Run:

`npm test -- --runInBand`

Report exact:

- suites passed;
- suites failed;
- tests passed;
- tests failed;
- skipped;
- exit status.

### Build

Run:

`npm run build`

### Prisma

Run:

`npx prisma validate`

No migrations or database operations are permitted.

### Lint

Run:

`npm run lint`

Report:

- errors;
- warnings;
- remaining `no-explicit-any`.

The expected baseline remains 14 unless repository ownership changes affect the warning locations.

---

## 26. Scope Audit

Before completion verify:

- Journey repository filename corrected;
- Journey repository class ownership corrected;
- Reservation repository filename corrected;
- Reservation repository class ownership corrected;
- repository barrel exports corrected;
- application consumers corrected where necessary;
- no domain changes;
- no repository interface changes;
- no mapper changes;
- no Prisma schema changes;
- no PrismaService changes;
- no database changes;
- no unrelated lint remediation.

---

## 27. Acceptance Criteria

### AC-01 — Journey Ownership

`journey-prisma.repository.ts` defines and exports `JourneyPrismaRepository`.

### AC-02 — Journey Interface

`JourneyPrismaRepository` implements `IJourneyRepository`.

### AC-03 — Reservation Ownership

`reservation-prisma.repository.ts` defines and exports `ReservationPrismaRepository`.

### AC-04 — Reservation Interface

`ReservationPrismaRepository` implements `IReservationRepository`.

### AC-05 — Traveller Ownership

`traveller-prisma.repository.ts` defines and exports `TravellerPrismaRepository`.

### AC-06 — Barrel Exports

Repository barrel exports correspond to canonical implementation ownership.

### AC-07 — No Crossed Classes

No Journey file defines the Reservation repository and no Reservation file defines the Journey repository.

### AC-08 — Consumer Wiring

Existing consumers resolve the canonical repository implementation.

### AC-09 — No Persistence Redesign

No Prisma model or schema changes are introduced.

### AC-10 — No Contract Redesign

Domain repository interfaces remain unchanged.

### AC-11 — Regression

Full Jest regression passes.

### AC-12 — Build

Build passes.

### AC-13 — Prisma

Prisma validation passes.

### AC-14 — Scope

No unrelated persistence or lint remediation is performed.

---

## 28. Final Copilot Report

Return:

### Implementation Status

- completed / partially completed / blocked

### Repository Ownership

Report the final:

- Journey filename/class/interface;
- Reservation filename/class/interface;
- Traveller filename/class/interface;
- repository barrel exports;
- affected application consumers.

### Files Changed

List every changed source/test file.

### Warning State

- baseline: 14;
- final;
- warnings removed;
- remaining `no-explicit-any`;
- other warnings.

### Verification

- focused repository tests;
- full Jest regression;
- build;
- Prisma validation;
- lint;
- TypeScript check.

### Scope Audit

Confirm:

- domain files modified: NO;
- repository interfaces modified: NO;
- mapper files modified: NO;
- Prisma schema modified: NO;
- PrismaService modified: NO;
- database modified: NO;
- API modified: NO;
- provider integrations modified: NO;
- ESLint configuration modified: NO;
- suppressions added: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- commit created: NO.

### Exceptions

List any known Prisma/repository mismatch that prevented full verification.

---

## 29. Completion Boundary

This iteration ends after repository ownership reconciliation.

Do not proceed to:

- Traveller persistence contract;
- Reservation persistence contract;
- Journey persistence model;
- PrismaService ownership;
- mapper typing;
- remaining `no-explicit-any` remediation.

Those are subsequent controlled iterations.

Do not create a commit.

After the Copilot implementation report, the result will be reviewed for architect acceptance.

The user performs the commit after acceptance.