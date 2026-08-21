# GCT CORE — READ-ONLY PERSISTENCE MODEL RECONCILIATION REVIEW

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | REVIEW-PERSISTENCE-RECONCILIATION |
| Title | Persistence Model Reconciliation Review |
| Project | GCT Core |
| Type | Read-Only Architectural Review |
| Status | Review Instruction |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Scope | Traveller, Reservation, Journey and Prisma persistence |
| Current Lint Warnings | 14 |
| Objective | Establish the correct persistence remediation sequence |

---

## 2. Purpose

Perform a READ-ONLY reconciliation of the current persistence implementation against the established GCT Core domain, application and physical data model.

The previous PrismaService typing attempt was correctly blocked because typing the Prisma client exposed existing repository/schema incompatibilities.

This review must now determine the correct persistence architecture before another implementation specification is written.

The review MUST answer:

1. What is the canonical persistence representation of Traveller?
2. What is the canonical persistence representation of Reservation?
3. Is Journey a persistent aggregate or an application/package composition concept?
4. Which existing Prisma models are authoritative?
5. Which repository implementations are legacy or inconsistent?
6. Which persistence contracts are missing?
7. What must be implemented before the remaining 14 lint warnings can safely reach zero?
8. What is the correct dependency order for the remaining remediation iterations?

This is a READ-ONLY task.

---

## 3. Governing Process

Follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

This is the authoritative GCT Core development process.

The governing implementation workflow is:

SPECIFICATION
→ ARCHITECT REVIEW
→ IMPLEMENTATION
→ FOCUSED TESTS + REGRESSION
→ COPILOT IMPLEMENTATION REPORT
→ ARCHITECT ACCEPTANCE
→ COMMIT

This task is an architectural exception/review required because a genuine persistence architecture conflict was discovered.

No implementation is authorised by this document.

---

## 4. Strict Read-Only Boundary

DO NOT:

- modify source code;
- modify tests;
- modify Prisma schema;
- modify Prisma configuration;
- modify ESLint configuration;
- modify TypeScript configuration;
- modify specifications;
- modify documentation;
- modify `.env`;
- create migrations;
- apply migrations;
- modify database state;
- generate persistent test data;
- replace any `any`;
- add types;
- add suppressions;
- refactor repositories;
- rename repository files;
- create new models;
- create new persistence contracts;
- create a commit;
- reset or revert Git history.

Inspection commands are permitted.

The repository must remain unchanged by the review.

---

## 5. Authoritative Sources

Use the actual repository and the established GCT Core documentation.

At minimum inspect:

- `GOV-DEV-001-DEVELOPMENT-PROCESS`
- `SPEC-001` canonical domain model
- `SPEC-002` canonical physical data model
- `BUS-001` business capability model
- `BUS-002` business entity model
- `BUS-003` business process model
- APP-003 Journey specifications
- APP-004 Reservation specifications
- relevant Traveller specifications
- current Prisma schema
- current repository interfaces
- current persistence repositories
- current persistence mappers
- `bootstrap/prisma.ts`
- `prisma.service.ts`

Do not treat `roadmap.md` as authoritative.

Do not treat legacy repository implementation as authoritative where it conflicts with approved architecture.

Do not invent missing requirements.

---

## 6. Current Lint Baseline

The accepted lint state is:

- lint errors: 0
- lint warnings: 14
- all remaining warnings: `@typescript-eslint/no-explicit-any`

The warnings belong to persistence/infrastructure areas.

Do not change the warning count.

The purpose of this review is to determine how those warnings can eventually be remediated safely.

---

## 7. Complete Warning Inventory

Run:

`npm run lint`

Capture every remaining `@typescript-eslint/no-explicit-any` warning.

For every warning record:

- file;
- line;
- containing class/function;
- layer;
- capability;
- persistence role;
- current purpose of `any`;
- likely intended type;
- architectural dependency;
- risk classification;
- proposed future remediation batch.

Every one of the 14 warnings MUST appear in the report.

---

## 8. Persistence Architecture Principle

Use the established canonical physical data model as the authority.

Persistence must represent approved domain concepts.

Do not infer the canonical persistence model solely from:

- legacy repository code;
- existing Prisma tables;
- existing mapper assumptions.

Where the domain and current Prisma schema disagree, identify the discrepancy rather than choosing one arbitrarily.

The review must distinguish:

CANONICAL DOMAIN MODEL

from:

CURRENT PERSISTENCE IMPLEMENTATION

from:

CURRENT PRISMA SCHEMA

---

## 9. Traveller Reconciliation

Inspect:

- Traveller aggregate;
- `TravellerPreferences`;
- Traveller domain events;
- Traveller DTOs;
- Traveller repository interface;
- Traveller Prisma repository;
- Traveller mapper;
- Prisma `Traveller` model;
- related Customer model and relationships.

Determine:

### 9.1 Identity

What is the canonical persistent identity of Traveller?

### 9.2 Customer Relationship

Determine whether Traveller is:

- independent;
- owned by Customer;
- linked to Customer;
- or represented through another approved relationship.

Do not guess.

### 9.3 Email

Determine whether email belongs to:

- Traveller;
- Customer;
- another approved entity.

Compare domain, application and Prisma representations.

### 9.4 Preferences

Determine how the accepted:

`TravellerPreferences`

contract should be persisted.

The current domain representation is:

`Record<string, unknown>`

Determine whether persistence should use:

- JSON;
- structured fields;
- related records;
- another approved representation.

Do not implement the choice.

### 9.5 Traveller Mapping

Determine whether existing mapper input/output types are valid.

Identify every field that is:

- domain-only;
- persistence-only;
- missing from one side;
- incorrectly named;
- incorrectly typed.

### 9.6 Traveller Conclusion

Classify the Traveller persistence boundary as:

- READY FOR TYPING;
- CONTRACT GAP;
- ARCHITECTURAL GAP.

Explain why.

---

## 10. Reservation Reconciliation

Inspect:

- Reservation aggregate;
- Reservation domain events;
- Reservation DTOs;
- Reservation repository interface;
- Reservation persistence repository;
- Reservation mapper;
- current Prisma `Reservation`;
- related Prisma models;
- APP-004 accommodation snapshot/handoff implementation.

Determine:

### 10.1 Identity

Identify the canonical Reservation identity and reservation number/reference.

### 10.2 Traveller Relationship

Determine the canonical relationship between Reservation and Traveller.

### 10.3 Journey Relationship

Determine whether Reservation persists a Journey reference.

Do not assume that the existence of `journeyId` in a legacy repository proves that Journey must be persistent.

### 10.4 Lifecycle

Identify the canonical reservation lifecycle state and how it should be persisted.

### 10.5 Financial State

Determine how:

- final GCT package price;
- supplier price;
- currency;
- pricing basis

should be represented.

Do not collapse supplier price and final GCT price.

### 10.6 Accommodation Snapshot

Determine how the accepted APP-004 accommodation snapshot should be persisted, including where applicable:

- package identity;
- stop identity;
- stop order;
- accommodation;
- room;
- rate;
- provider;
- opaque supplier reference;
- stay dates;
- occupancy;
- child ages;
- supplier price;
- supplier currency;
- pricing basis;
- booking state/reference.

Determine whether these belong:

- directly on Reservation;
- in reservation child records;
- in a snapshot structure;
- or another approved representation.

Do not implement the answer.

### 10.7 Reservation Conclusion

Classify the Reservation persistence boundary as:

- READY FOR TYPING;
- CONTRACT GAP;
- ARCHITECTURAL GAP.

Explain why.

---

## 11. Journey Reconciliation

This is the highest-priority architectural question.

Inspect:

- Journey aggregate;
- Journey repository interface;
- Journey persistence repository;
- Journey mapper;
- APP-003 Journey/package composition;
- package-stop model;
- current Prisma schema;
- current application consumers.

Determine:

### 11.1 Persistent Aggregate Question

Is Journey currently intended to be a persistent aggregate?

Answer:

YES / NO / UNRESOLVED

Support the answer with repository/document evidence.

### 11.2 Current Prisma State

Determine whether a Prisma `Journey` model exists.

If it does not exist, do NOT create one.

Determine whether the absence is:

- an incomplete schema;
- obsolete repository infrastructure;
- intentional architecture.

### 11.3 Current Application Role

Determine whether the current Journey model is primarily:

- persistent business entity;
- package composition;
- journey planning state;
- transient application model;
- another defined concept.

### 11.4 Accommodation Composition

Consider the accepted APP-003 Journey composition model:

Property
→ Room
→ Rate

with:

- package-stop context;
- occupancy;
- supplier/provider identity;
- pricing projection;
- reservation projection.

Determine whether these Journey structures are intended to be persisted.

### 11.5 Journey Repository

Determine whether the existing Journey repository is:

- required;
- incomplete;
- obsolete;
- incorrectly implemented;
- incorrectly named;
- incorrectly exported.

### 11.6 Journey Conclusion

Classify the Journey persistence boundary as:

- PERSISTENCE REQUIRED;
- PERSISTENCE NOT REQUIRED;
- ARCHITECTURAL DECISION REQUIRED.

Do not create a Prisma Journey model during this review.

---

## 12. Repository Ownership Reconciliation

Inspect:

- repository interfaces;
- repository implementations;
- repository filenames;
- class names;
- barrel exports;
- dependency injection/registration;
- application consumers.

Pay particular attention to any mismatch between:

- Journey repository filename/class;
- Reservation repository filename/class;
- exported repository name.

Determine whether the existing repository implementation has crossed ownership boundaries.

Do not rename or fix anything.

Classify each inconsistency as:

- cosmetic;
- type-level;
- architectural;
- blocking.

---

## 13. Prisma Schema Reconciliation

Inspect the complete relevant Prisma schema.

For Traveller, Reservation and Journey determine:

- model existence;
- field names;
- field types;
- required/optional status;
- relationships;
- indexes;
- foreign keys;
- JSON fields;
- lifecycle fields.

Compare each model against:

- canonical domain model;
- application contracts;
- repository expectations.

Produce a discrepancy list.

Do not modify the schema.

---

## 14. PrismaService Reconciliation

Inspect:

- `prisma.service.ts`;
- `bootstrap/prisma.ts`;
- all imports/references to `PrismaService`.

Determine:

- whether `PrismaService` is still required;
- whether it duplicates the bootstrap lifecycle;
- whether it can safely be retained and typed;
- whether it should eventually be retired;
- which repository dependencies prevent immediate resolution.

Do not modify the service.

The previous Batch 1 implementation attempt demonstrated that typing it exposes underlying repository/schema mismatches. Treat that as confirmed evidence.

---

## 15. Persistence Boundary Assessment

For every persistence contract identify whether it follows:

Domain
→ Repository Interface
→ Persistence Repository
→ Mapper
→ Prisma

Flag any occurrence where:

- Prisma types leak into domain;
- persistence DTOs leak into domain;
- supplier types leak into persistence;
- application DTOs are being used as persistence models;
- `any` is masking an architectural boundary.

Do not correct the issue.

---

## 16. Risk Classification

Assign each warning one primary classification:

### A — Mechanical

An existing canonical type can safely replace `any`.

### B — Local Contract

A small persistence type or mapper correction is required.

### C — Cross-Layer Contract

Repository or mapper contracts require coordinated changes.

### D — Architectural

The persistence model itself is unresolved.

### E — Dependent

The warning cannot safely be resolved until another persistence decision is completed.

Do not force a low-risk classification onto an architectural gap.

---

## 17. Dependency Analysis

Construct the actual dependency chain between:

- Traveller persistence;
- Reservation persistence;
- Journey persistence;
- repository contracts;
- mappers;
- Prisma models;
- PrismaService.

Identify which item must be resolved first.

Do not assume the previous proposed order is correct.

---

## 18. Remediation Batch Plan

Create one authoritative remediation sequence.

For each proposed batch state:

- batch number;
- purpose;
- warnings affected;
- files affected;
- dependency;
- risk;
- whether a focused specification is required;
- expected outcome.

The sequence must minimise rework.

Do not combine unrelated architectural decisions into one large iteration.

---

## 19. Specification Requirement

For each proposed batch classify:

NO SPECIFICATION REQUIRED

or:

FOCUSED SPECIFICATION REQUIRED

A focused specification is required whenever the batch changes:

- persistence contracts;
- repository contracts;
- Prisma schema;
- aggregate persistence;
- canonical persistence DTOs;
- cross-layer architecture.

Do not write those specifications during this review.

---

## 20. Zero-Warning Path

Determine the actual path from:

14 warnings

to:

0 warnings

without:

- suppressing lint;
- using `any`;
- weakening TypeScript;
- leaking Prisma types into domain;
- inventing unsupported persistence models;
- creating unnecessary database structures;
- changing accepted application contracts without justification.

Provide the expected warning reduction only where it is supported by the proposed dependency sequence.

Do not guarantee a numerical reduction for a batch if the model reconciliation may change the warning locations.

---

## 21. Frontend Readiness

Determine whether any identified persistence issue is a blocker to the agreed frontend gate.

The project gate remains:

Backend capability completion
→ Lint remediation
→ Accepted zero-warning state
→ Final frontend-readiness review
→ Frontend implementation

Do not begin frontend implementation.

Do not modify frontend code.

---

## 22. Required Read-Only Verification

Run:

`npm run lint`

Run:

`npm run build`

Run:

`npx prisma validate`

These commands are verification only.

Do not modify the repository to make them pass.

Do not run:

- migrations;
- `prisma db push`;
- database reset;
- database writes.

The existing Jest regression may be inspected/run if useful, but this is not an implementation iteration and no test changes are permitted.

---

## 23. Final Scope Audit

Before reporting completion confirm:

- source files modified: 0;
- test files modified: 0;
- Prisma schema modified: 0;
- specifications modified: 0;
- documentation modified: 0;
- configuration modified: 0;
- `.env` modified: 0;
- database modified: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- Git reset/revert: NO;
- commit created: NO.

If any command unexpectedly modifies a file, report it immediately and stop.

---

## 24. Required Final Report

Return exactly:

# GCT CORE — PERSISTENCE MODEL RECONCILIATION REPORT

## 1. Review Status

Choose:

READ-ONLY COMPLETE

or:

BLOCKED

## 2. Governance

Confirm:

GOV-DEV-001-DEVELOPMENT-PROCESS followed.

## 3. Current Baseline

Report:

- lint errors;
- lint warnings;
- remaining `no-explicit-any`;
- build;
- Prisma validation.

## 4. Warning Inventory

Use:

| # | File | Line | Layer | Capability | Persistence Role | Risk | Dependency |
|---|---|---|---|---|---|---|---|

Every remaining warning must appear.

## 5. Traveller Reconciliation

Report:

- canonical domain representation;
- current persistence representation;
- Prisma representation;
- discrepancies;
- persistence decision;
- specification required: YES/NO.

## 6. Reservation Reconciliation

Report:

- canonical domain representation;
- current persistence representation;
- Prisma representation;
- accommodation snapshot persistence assessment;
- discrepancies;
- persistence decision;
- specification required: YES/NO.

## 7. Journey Reconciliation

Report:

- current domain role;
- current application role;
- repository role;
- Prisma model existence;
- whether Journey should be persistent;
- unresolved architectural decision, if any;
- specification required: YES/NO.

## 8. Repository Ownership

Report all ownership/name/export inconsistencies.

## 9. PrismaService

Report:

- current ownership;
- relationship to bootstrap Prisma;
- whether it can safely be typed now;
- dependency preventing resolution, if any.

## 10. Risk Distribution

Report counts for:

- Mechanical;
- Local Contract;
- Cross-Layer Contract;
- Architectural;
- Dependent.

## 11. Dependency Graph

Provide the actual dependency sequence.

## 12. Remediation Plan

Provide one ordered batch sequence.

For each batch include:

- purpose;
- warning count;
- affected area;
- risk;
- dependency;
- specification required;
- expected result.

## 13. Zero-Warning Path

Explain the path from 14 warnings to 0.

## 14. Frontend Gate

State whether the persistence issues block frontend readiness.

## 15. Recommended Next Action

Provide exactly ONE next action.

## 16. Scope Confirmation

Confirm:

Source files modified: 0
Test files modified: 0
Prisma files modified: 0
Specification files modified: 0
Configuration modified: 0
Database modified: NO
Hotelbeds calls: 0
PayFast calls: 0
Commit created: NO

## 17. Final Conclusion

State whether the repository is ready for the next focused persistence specification.

Do not implement anything.

---

## 25. Final Instruction

This is a READ-ONLY architectural reconciliation review.

Do not fix the 14 warnings.

Do not create or modify Prisma models.

Do not modify repositories.

Do not modify mappers.

Do not type PrismaService.

Do not create specifications.

Do not modify roadmap.md.

Do not commit.

The only deliverable is the evidence-based persistence reconciliation report and one authoritative dependency/remediation sequence.

Stop after the report.