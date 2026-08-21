# GCT CORE — READ-ONLY PERSISTENCE NO-EXPLICIT-ANY
## Dependency, Risk and Remediation Review

## 1. Purpose

Perform a READ-ONLY dependency and architectural risk assessment of all remaining:

`@typescript-eslint/no-explicit-any`

warnings associated with persistence, repositories, mappers, and Prisma infrastructure.

This assessment follows the accepted lint remediation sequence:

Batch A — Test-only `any`
Batch B — API presenter response types
Batch C — Traveller preference contract
Batch D — Generic ValueObject typing

Current remaining lint debt:

**14 warnings**

The purpose of this review is to determine:

1. exactly where the 14 warnings occur;
2. which persistence boundary each belongs to;
3. whether an existing canonical type already exists;
4. whether the warning can be safely remediated mechanically;
5. whether a domain/application/persistence contract is missing;
6. whether the warnings can be grouped into safe implementation batches;
7. whether a focused specification is required before remediation;
8. the dependency order required to reach zero warnings.

This is an assessment only.

---

## 2. Governing Process

Follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

This is the single source of truth for the GCT Core development process.

The workflow remains:

Specification
→ Implementation
→ Testing / Verification
→ Copilot Report
→ Architect Acceptance
→ User Commit

This task is READ-ONLY.

Do not implement anything.

Do not create a specification.

Do not modify existing specifications.

Do not modify roadmap.md.

Do not create a commit.

---

## 3. Strict Read-Only Rules

DO NOT:

- modify source files;
- modify tests;
- modify specifications;
- modify documentation;
- modify Prisma schema;
- modify Prisma configuration;
- modify ESLint configuration;
- modify TypeScript configuration;
- modify `.env`;
- generate migrations;
- generate database changes;
- run database writes;
- add types;
- replace `any`;
- add `eslint-disable`;
- add `eslint-disable-next-line`;
- refactor code;
- reset or revert Git history;
- create temporary tracked files;
- create a commit.

Commands used for inspection, linting, type checking and tests must not alter repository source/configuration state.

If a normal build generates existing repository artifacts, report that fact rather than treating it as an implementation change.

---

## 4. Current Baseline

Accepted current state:

- lint errors: 0
- lint warnings: 14
- all remaining warnings: `@typescript-eslint/no-explicit-any`
- Jest: 84 suites / 684 tests passed
- build: passed
- Prisma validation: passed
- TypeScript/language-service checks: passed

The 14 warnings are the remaining persistence/infrastructure group.

Do not assume their exact distribution before inspecting the repository.

---

## 5. Complete Warning Inventory

Run:

`npm run lint`

Capture every remaining `@typescript-eslint/no-explicit-any` warning.

Every warning MUST be included in the assessment.

For each occurrence record:

- number;
- file;
- line;
- containing class/function;
- architectural layer;
- capability;
- persistence role;
- current purpose of `any`;
- likely intended type;
- risk;
- dependencies;
- recommended remediation batch.

Do not omit warnings because they appear related.

---

## 6. Persistence Scope

Inspect all remaining warnings associated with:

- repository interfaces;
- repository implementations;
- persistence mappers;
- Prisma services;
- Prisma records;
- domain-to-persistence mapping;
- persistence-to-domain mapping;
- database result handling;
- Journey persistence;
- Reservation persistence;
- Traveller persistence.

Also inspect adjacent types where they materially affect the warning.

Do not expand the review into unrelated warnings.

---

## 7. Architectural Layers

Classify every warning as one or more of:

- Domain
- Application
- Persistence
- Infrastructure
- Prisma
- Repository
- Mapper
- Shared/Core

Identify the primary owner.

---

## 8. Capability Classification

Where applicable classify each warning against:

- APP-003 Journey
- APP-004 Reservation
- APP-005 Pricing
- APP-006 Payment
- APP-007 Invoice
- APP-008 Accommodation
- shared/core
- persistence infrastructure

Do not infer ownership solely from filenames.

Inspect actual imports, interfaces and dependencies.

---

## 9. Repository Boundary Analysis

For every repository-related `any`, determine:

1. Is the repository interface already strongly typed?
2. Does the implementation match the interface?
3. Is `any` masking a mismatch between domain and persistence models?
4. Is there an existing canonical domain type?
5. Is there an existing Prisma-generated type?
6. Is a mapper already responsible for conversion?
7. Does the `any` cross the repository boundary?
8. Would replacing it require changing a repository contract?

Do not change the repository.

---

## 10. Mapper Analysis

For every mapper-related `any`, determine:

- source type;
- destination type;
- mapping direction;
- whether both types already exist;
- whether the mapper is correctly positioned;
- whether `any` represents an incomplete persistence model;
- whether the mapper is carrying domain data not represented in Prisma.

Explicitly distinguish:

Domain
→ Persistence

from:

Persistence
→ Domain

Do not create new mapping types during this review.

---

## 11. Journey Persistence Assessment

This is a critical area.

Inspect the existing Journey persistence implementation and determine whether:

- a canonical Journey persistence model exists;
- Prisma represents the complete Journey aggregate;
- Journey accommodation selections are persisted;
- package-stop information is persisted;
- Property → Room → Rate selection is persisted;
- multi-stop information is represented;
- pricing/reservation handoff information is represented;
- the existing repository contract can represent the current Journey model.

Determine whether the previously identified Journey persistence-model limitation is still present.

Do not solve it.

If the persistence model is incomplete, clearly state:

- what is missing;
- which warning(s) depend on it;
- why mechanical typing would be unsafe;
- what architectural decision/specification would be required.

---

## 12. Reservation Persistence Assessment

Inspect Reservation persistence and determine whether:

- the Reservation aggregate has a canonical persistence representation;
- accommodation snapshots are fully represented;
- package-stop identity is represented;
- room/rate references are represented;
- provider identity is represented;
- supplier price/currency/basis are represented;
- occupancy and child ages are represented;
- booking references are represented;
- lifecycle state is represented.

Determine whether the remaining `any` warnings can safely use:

- domain types;
- Prisma types;
- explicit persistence DTOs;
- existing mapper contracts.

Do not change the implementation.

---

## 13. Traveller Persistence Assessment

Inspect Traveller persistence and determine whether:

- `TravellerPreferences` can be persisted using the newly established canonical type;
- Prisma represents the preference structure;
- repository contracts are typed;
- mapper input/output types exist;
- the new `TravellerPreferences = Record<string, unknown>` introduces any persistence typing considerations.

Do not change persistence.

Do not modify Prisma.

Identify whether the existing canonical preference type is sufficient for persistence typing.

---

## 14. Prisma Service Assessment

For every `any` in Prisma service/infrastructure code determine:

- whether Prisma already provides a generated type;
- whether the operation returns a known Prisma model;
- whether a transaction/client type exists;
- whether generic Prisma arguments are being used;
- whether `any` masks dynamic model access;
- whether replacing it would require a generic repository abstraction.

Do not change Prisma code.

Do not generate Prisma clients.

Do not modify schema.

---

## 15. Domain Boundary Analysis

Determine whether any remaining `any` is leaking persistence concerns into the domain.

Pay particular attention to:

- domain aggregates;
- domain entities;
- value objects;
- repository interfaces.

The preferred direction is:

Domain
→ Repository abstraction
→ Persistence implementation
→ Prisma

Persistence-specific types must not leak into domain models merely to eliminate lint warnings.

If such leakage exists, classify it as an architectural risk.

---

## 16. Canonical Type Reuse

For every warning determine whether an existing canonical type is available.

Potential sources include:

- domain entity;
- value object;
- application contract;
- repository interface;
- Prisma generated type;
- persistence DTO;
- existing mapper type.

Do not create new types.

The assessment must distinguish:

**Existing type can safely be reused**

from:

**No appropriate type currently exists.**

---

## 17. Risk Classification

Assign exactly one primary classification to each warning.

### A — SAFE MECHANICAL

Existing type clearly represents the data and can replace `any` without contract changes.

### B — LOW RISK

Existing types are sufficient but a small local persistence/mapping adjustment may be required.

### C — MEDIUM RISK

The replacement affects repository, mapper, Prisma or persistence contracts.

### D — HIGH RISK / ARCHITECTURAL

The `any` exposes a missing or inconsistent domain/persistence model.

Examples:

- incomplete Journey persistence model;
- missing accommodation snapshot persistence structure;
- repository contract mismatch;
- Prisma schema cannot represent the current domain state.

### E — DEPENDENT

The warning cannot safely be resolved until another capability/model is completed.

For example:

Journey persistence typing depending on a canonical Journey persistence model.

Do not force a category if the evidence does not support it.

---

## 18. Dependency Graph

Create a dependency graph showing:

- each warning;
- prerequisite types/models;
- dependent warnings;
- proposed remediation order.

Example structure:

Canonical domain type
→ Persistence contract
→ Mapper
→ Repository
→ Prisma implementation

Use the actual repository dependencies.

Do not invent dependencies.

---

## 19. Batch Design

Based on the assessment, propose the smallest safe remediation sequence.

Potential categories may include:

- safe local mapper typing;
- repository contract typing;
- Prisma service typing;
- Traveller persistence typing;
- Reservation persistence typing;
- Journey persistence typing.

Do not assume these are the correct batches.

Determine the actual grouping from repository evidence.

For each proposed batch state:

- batch name;
- warning count;
- affected files;
- capability;
- risk;
- dependencies;
- whether a focused specification is required;
- verification required;
- whether the batch can proceed independently.

---

## 20. Specification Requirement

For every proposed remediation batch classify:

### NO SPECIFICATION REQUIRED

Use only where the type replacement is mechanical and clearly bounded.

### FOCUSED SPECIFICATION REQUIRED

Use where the change affects:

- domain/persistence contracts;
- repository interfaces;
- Prisma representation;
- canonical persistence DTOs;
- cross-capability state;
- missing Journey/Reservation persistence models.

Do not write the specification.

Only determine whether one is required.

---

## 21. Zero-Warning Feasibility

Assess whether all 14 warnings can be removed without:

- weakening ESLint;
- using suppressions;
- changing runtime behaviour;
- leaking Prisma types into domain code;
- introducing supplier-specific types;
- breaking repository contracts;
- redesigning unrelated capabilities.

State:

- achievable now;
- achievable after prerequisite modelling;
- or blocked by an architectural decision.

If blocked, identify exactly what decision is required.

---

## 22. Frontend Readiness Relationship

The current project gate remains:

Backend implementation
→ Lint remediation
→ Zero-warning / accepted lint state
→ Final frontend-readiness review
→ Frontend implementation

Determine whether any persistence warning represents a blocker to frontend readiness.

Do not start frontend work.

Do not modify UI code.

---

## 23. Recommended Remediation Sequence

Provide one authoritative sequence.

The sequence must identify:

1. first safe batch;
2. subsequent dependent batches;
3. architectural prerequisites;
4. final batch;
5. expected warning count after each batch.

Do not provide multiple competing roadmaps.

---

## 24. Final Report Format

Return exactly:

# GCT CORE — READ-ONLY PERSISTENCE NO-EXPLICIT-ANY DEPENDENCY REVIEW

## 1. Review Status

READ-ONLY COMPLETE / BLOCKED

## 2. Governance Basis

State that the review followed:

`GOV-DEV-001-DEVELOPMENT-PROCESS.md`

## 3. Current Baseline

- lint errors;
- lint warnings;
- Jest baseline;
- build;
- Prisma validation.

## 4. Complete 14-Warning Inventory

Use:

| # | File | Line | Layer | Capability | Persistence Role | Current `any` Purpose | Likely Type | Risk | Dependency |

Every warning must appear.

## 5. Layer Distribution

Provide counts by layer.

## 6. Capability Distribution

Provide counts by capability.

## 7. Risk Distribution

Provide counts by risk category.

## 8. Repository Boundary Analysis

Summarize repository contract risks.

## 9. Mapper Analysis

Summarize mapper dependencies.

## 10. Journey Persistence Assessment

State whether the Journey persistence-model limitation remains and which warnings depend on it.

## 11. Reservation Persistence Assessment

State whether the current Reservation persistence model is sufficient.

## 12. Traveller Persistence Assessment

State whether the new `TravellerPreferences` contract is persistence-ready.

## 13. Prisma Service Assessment

State whether existing Prisma types can safely replace the remaining `any` usages.

## 14. Domain Boundary Assessment

Identify any persistence/domain leakage.

## 15. Dependency Graph

Show the actual dependency order.

## 16. Remediation Batch Plan

For each batch:

- name;
- warning count;
- files;
- risk;
- dependencies;
- specification requirement;
- verification.

## 17. Specification Requirements

Identify which batches need focused specifications and why.

## 18. Zero-Warning Feasibility

State whether zero warnings is achievable and under what prerequisites.

## 19. Frontend Gate

State the relationship between these warnings and frontend readiness.

## 20. Recommended Next Action

Provide exactly ONE next action.

## 21. Scope Confirmation

Confirm:

- source files modified: 0
- test files modified: 0
- specification files modified: 0
- documentation modified: 0
- Prisma schema modified: NO
- Prisma generated client intentionally changed: NO
- ESLint configuration modified: NO
- TypeScript configuration modified: NO
- `.env` modified: NO
- database modified: NO
- Hotelbeds calls: 0
- PayFast calls: 0
- Git reset/revert: NO
- commit created: NO

---

## 25. Final Rule

READ-ONLY ONLY.

Do not replace any `any`.

Do not modify source code.

Do not modify tests.

Do not modify specifications.

Do not modify Prisma.

Do not modify configuration.

Do not add suppressions.

Do not create a commit.

Do not begin remediation.

The only deliverable is the risk-ranked dependency assessment and one authoritative remediation sequence for the remaining 14 `no-explicit-any` warnings.

Follow `GOV-DEV-001-DEVELOPMENT-PROCESS.md` throughout the assessment.