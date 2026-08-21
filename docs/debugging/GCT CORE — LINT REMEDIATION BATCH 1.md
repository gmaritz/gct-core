# GCT CORE — LINT REMEDIATION BATCH 1
## Prisma Service Ownership and Typed Client Lifecycle

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | LINT-PERSISTENCE-B1 |
| Title | Prisma Service Ownership and Typed Client Lifecycle |
| Project | GCT Core |
| Type | Focused Implementation Specification |
| Status | Implementation Ready |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Scope | Legacy PrismaService ownership and typing |
| Lint Rule | @typescript-eslint/no-explicit-any |
| Current Warning Baseline | 14 |
| Target Reduction | 3 |
| Expected Remaining Warnings | 11 |

---

## 2. Purpose

Resolve the three remaining `@typescript-eslint/no-explicit-any` warnings in the legacy `PrismaService` while establishing a clear and type-safe Prisma client ownership boundary.

The repository currently contains:

1. an existing typed Prisma lifecycle implementation under `bootstrap/prisma.ts`; and
2. a legacy `PrismaService` used by the existing Journey, Reservation and Traveller persistence implementations.

The purpose of this iteration is to determine and implement the correct ownership relationship between these two mechanisms.

This is not a persistence-model redesign.

This specification MUST NOT attempt to resolve the remaining Journey, Reservation or Traveller persistence `any` warnings.

---

## 3. Governing Process

Follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

This is the single source of truth for the GCT Core development workflow.

The required workflow is:

Specification
→ Implementation
→ Focused Tests + Regression
→ Copilot Report
→ Architect Acceptance
→ User Commit

Do not create a commit.

Keep implementation within this specification's scope.

---

## 4. Current Baseline

The accepted persistence lint assessment established:

- lint errors: 0
- lint warnings: 14
- all remaining warnings: `@typescript-eslint/no-explicit-any`
- Jest baseline: 84 suites / 684 tests passed
- build: passed
- Prisma validation: passed

The three warnings addressed here are in:

`prisma.service.ts`

Expected result:

- baseline: 14 warnings
- targeted reduction: 3 warnings
- expected final total: 11 warnings

---

## 5. Current Prisma Ownership Situation

The repository contains a typed Prisma lifecycle implementation in:

`bootstrap/prisma.ts`

The existing bootstrap implementation uses the generated:

`PrismaClient`

type and provides typed client lifecycle operations.

The repository also contains a legacy:

`PrismaService`

which currently contains three `any` usages associated with:

- stored Prisma client;
- client getter;
- client setter.

The read-only assessment found that the legacy service is referenced by the legacy Journey, Reservation and Traveller repository implementations.

The implementation must therefore verify actual usage before deciding whether the legacy service can be removed or should remain as a compatibility abstraction.

---

## 6. Required Decision

Determine the correct Prisma client ownership model from the existing repository.

The implementation must establish ONE clear model:

### Option A — Retain PrismaService

Retain the service because its existing repository consumers require it.

In this case:

- type the service using the generated `PrismaClient`;
- preserve its current lifecycle semantics;
- ensure it does not create a second independent Prisma lifecycle;
- delegate to or consistently use the existing typed Prisma client lifecycle where appropriate.

### Option B — Retire PrismaService

Retire the legacy service only if repository inspection proves that it can safely be removed or replaced without changing persistence behaviour.

If retiring it:

- update all actual consumers to use the existing typed Prisma lifecycle;
- remove the obsolete service only if repository conventions permit;
- do not redesign the repositories;
- do not solve their remaining `any` warnings in this iteration.

The implementation must choose the option supported by repository evidence.

Do not preserve duplicate abstractions merely to avoid making a decision.

---

## 7. Mandatory Repository Inspection

Before modifying `PrismaService`, inspect:

- `bootstrap/prisma.ts`;
- `prisma.service.ts`;
- every import/reference to `PrismaService`;
- every repository that currently consumes it;
- application bootstrap/initialization;
- test setup involving Prisma.

Confirm:

- how the client is created;
- how it is accessed;
- how it is connected;
- how it is disconnected;
- whether there is more than one Prisma client instance;
- whether the legacy service is actually required.

Do not infer usage from filenames alone.

---

## 8. Typed Client Requirement

If `PrismaService` is retained, its client must use the generated:

`PrismaClient`

type.

The three targeted `any` usages must therefore be replaced with appropriate Prisma client typing.

The service must expose the correct type through:

- internal client storage;
- getter;
- setter, if the setter remains part of the service contract.

Do not use:

- `any`;
- `unknown` merely to satisfy lint;
- broad casts;
- unsafe double casts;
- lint suppression.

---

## 9. Lifecycle Semantics

Preserve the existing lifecycle semantics.

The implementation must not introduce:

- multiple independent Prisma clients;
- duplicate connection management;
- new connection pools;
- new shutdown mechanisms;
- database writes;
- migrations;
- schema changes.

If the existing `PrismaService` currently creates or manages a client independently from `bootstrap/prisma.ts`, determine whether that behaviour is intentional.

If it is not intentional, consolidate ownership using the smallest safe change.

---

## 10. Singleton / Instance Behaviour

The repository must continue to use a coherent Prisma client lifecycle.

Do not introduce a second singleton.

Do not create a new global client.

Do not change test isolation unnecessarily.

Where the existing bootstrap client is already the canonical client, prefer reusing that lifecycle rather than creating another client.

---

## 11. Repository Compatibility

The existing repositories that depend on `PrismaService` must continue to compile.

Do not resolve their remaining typing problems in this batch.

The following warnings remain explicitly out of scope:

- Journey mapper warnings;
- Reservation mapper warnings;
- Traveller mapper warnings;
- Journey repository warnings;
- Reservation repository warnings;
- Traveller repository warnings.

If typing `PrismaService` causes those existing warnings to become TypeScript errors, do not solve them here.

Report the affected repository and error as a dependency for the subsequent persistence batches.

---

## 12. Prisma Schema

Do not modify the Prisma schema.

Do not add:

- models;
- fields;
- relations;
- indexes;
- enums.

Do not create or apply migrations.

Do not change database structure.

---

## 13. Generated Prisma Client

Use the existing generated Prisma client type.

Do not redesign Prisma generation.

Do not modify generated client source.

If the normal build or Prisma validation produces existing generated artifacts, follow the repository's normal convention and report them.

Do not manually modify generated artifacts.

---

## 14. Application and Domain Boundaries

Do not introduce Prisma types into:

- domain aggregates;
- domain entities;
- value objects;
- domain events;
- domain repository interfaces.

Prisma remains an infrastructure/persistence concern.

The intended dependency direction remains:

Domain
→ Repository Interface
→ Persistence Implementation
→ Prisma

---

## 15. Error Handling

Preserve existing Prisma lifecycle error handling.

Do not redesign:

- connection errors;
- disconnect behaviour;
- startup failures;
- shutdown behaviour.

If the existing implementation has no explicit error handling, do not introduce a new policy merely for this lint task.

---

## 16. Tests

Inspect existing tests involving:

- Prisma service;
- application bootstrap;
- repository initialization;
- persistence infrastructure.

Update tests only if required by the ownership/typing change.

Do not change business assertions.

Do not add unrelated tests.

If no direct PrismaService tests exist, add only the minimum focused coverage required to demonstrate the chosen ownership/lifecycle contract.

---

## 17. Out of Scope

Do NOT address:

- Journey persistence model;
- Reservation persistence model;
- Traveller persistence model;
- repository ownership/name inconsistencies;
- mapper contracts;
- Prisma schema;
- database model changes;
- remaining `no-explicit-any` warnings;
- API;
- domain;
- provider integrations;
- Hotelbeds;
- PayFast;
- frontend.

Do not rename or restructure the Journey/Reservation repositories in this iteration unless strictly necessary to remove an actual PrismaService dependency. If such a change appears necessary, stop and report it rather than expanding scope.

---

## 18. Architectural Safety

If repository inspection reveals that `PrismaService` retirement would require redesigning repository contracts or persistence models:

STOP.

Do not attempt that redesign in this batch.

Instead retain the service and type it safely, unless doing so is itself impossible without a broader architectural decision.

Report:

- affected consumer;
- required architectural decision;
- reason;
- recommended follow-up batch.

---

## 19. Acceptance Criteria

### AC-01 — Ownership

There is one clearly identified Prisma client ownership/lifecycle model.

### AC-02 — Type Safety

The three targeted `PrismaService` `any` usages are removed.

### AC-03 — PrismaClient

Where `PrismaService` remains, its client is typed using the generated `PrismaClient`.

### AC-04 — Lifecycle

Existing connection and disconnection semantics are preserved.

### AC-05 — No Duplicate Client

The implementation does not introduce an unnecessary second Prisma client lifecycle.

### AC-06 — Repository Compatibility

Existing PrismaService consumers remain compatible without resolving unrelated persistence warnings.

### AC-07 — Domain Isolation

Prisma types do not leak into domain contracts.

### AC-08 — No Schema Change

No Prisma schema or database changes are made.

### AC-09 — Regression

The full Jest regression suite passes.

### AC-10 — Build

The TypeScript build passes.

### AC-11 — Prisma

`npx prisma validate` passes.

### AC-12 — Lint

The three targeted warnings are removed.

Expected warning count:

14 → 11

### AC-13 — Scope

No unrelated `no-explicit-any` warnings are addressed.

---

## 20. Verification Requirements

Run the following after implementation.

### 20.1 Focused Tests

Run relevant Prisma service/bootstrap/persistence tests.

Report exact:

- suites;
- tests;
- passed;
- failed.

### 20.2 Full Regression

Run:

`npm test -- --runInBand`

Report:

- suites passed;
- suites failed;
- tests passed;
- tests failed;
- skipped;
- exit status.

### 20.3 Build

Run:

`npm run build`

Report the result.

### 20.4 Prisma Validation

Run:

`npx prisma validate`

Do not:

- migrate;
- push;
- reset;
- seed;
- modify the database.

### 20.5 Lint

Run:

`npm run lint`

Report:

- errors;
- warnings;
- baseline;
- final warning count;
- warnings removed;
- remaining `no-explicit-any`.

Expected target:

11 warnings.

### 20.6 TypeScript / Language Service

Perform a final TypeScript/language-service check on all changed Prisma lifecycle files.

Report any errors.

---

## 21. Warning Accounting

Starting baseline:

14 warnings.

Targeted warnings:

3 `no-explicit-any` warnings in `PrismaService`.

Expected final state:

11 warnings.

All remaining warnings must belong to the previously identified persistence/model batches.

If the warning count differs:

- report the exact difference;
- identify the cause;
- do not fix unrelated warnings.

---

## 22. Scope Audit

Before completion confirm:

- Prisma client ownership clarified;
- PrismaService retained or retired based on repository evidence;
- targeted three warnings resolved;
- no Journey persistence changes;
- no Reservation persistence changes;
- no Traveller persistence changes;
- no mapper changes except where unavoidable for compilation;
- no Prisma schema changes;
- no database changes;
- no API changes;
- no domain contract changes;
- no provider changes;
- no lint configuration changes;
- no suppressions;
- no unrelated warning remediation.

---

## 23. Final Copilot Report

Return:

### Implementation Status

- completed / partially completed / blocked

### Prisma Ownership Decision

State:

- retained or retired;
- why;
- actual consumers inspected;
- how the canonical Prisma client lifecycle is now represented.

### Files Changed

List every changed source/test file.

### Warning Reduction

- baseline: 14;
- final total;
- warnings removed;
- remaining `no-explicit-any`;
- other warnings.

### Verification

- focused tests;
- full Jest regression;
- build;
- Prisma validation;
- lint;
- TypeScript/language-service.

### Scope Audit

Confirm:

- Prisma schema changed: NO;
- database changed: NO;
- Journey persistence changed: NO;
- Reservation persistence changed: NO;
- Traveller persistence changed: NO;
- API changed: NO;
- domain contracts changed: NO;
- ESLint configuration changed: NO;
- TypeScript configuration changed: NO;
- suppressions added: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- commit created: NO.

### Exceptions

List any repository or lifecycle issue that prevented full completion.

---

## 24. Completion Boundary

This iteration addresses only:

**Prisma Service Ownership and Typed Client Lifecycle**

and the three associated `no-explicit-any` warnings.

Do not proceed to:

- Traveller persistence;
- Reservation persistence;
- Journey persistence;
- mapper typing;
- repository row typing.

Those remain subsequent controlled batches.

Do not create a commit.

After the Copilot verification report, the implementation will be reviewed for architect acceptance under GOV-DEV-001.

Upon acceptance, the user will perform the commit.