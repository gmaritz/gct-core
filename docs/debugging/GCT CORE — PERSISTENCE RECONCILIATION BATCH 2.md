# GCT CORE — PERSISTENCE RECONCILIATION BATCH 2
## Traveller Persistence Contract

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B2-TRAVELLER |
| Title | Traveller Persistence Contract |
| Project | GCT Core |
| Type | Focused Implementation Specification |
| Status | Implementation Ready |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Scope | Traveller persistence contract and mapping |
| Current Lint Warnings | 14 |
| Target Warnings | 11 |
| Targeted Warnings | 3 Traveller persistence warnings |

---

## 2. Purpose

Establish the canonical persistence contract for the Traveller aggregate and reconcile:

- Traveller domain representation;
- Traveller persistence representation;
- Prisma Traveller representation;
- Traveller repository;
- Traveller mapper;
- accepted TravellerPreferences contract.

The objective is to remove the three Traveller-related no-explicit-any warnings through correct persistence typing rather than suppression or unsafe casting.

This specification MUST NOT redesign the Traveller domain model.

It MUST NOT use the existing legacy mapper as the source of truth.

---

## 3. Governing Process

Follow:

docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md

Required workflow:

Specification
→ Implementation
→ Focused Tests + Regression
→ Copilot Report
→ Architect Acceptance
→ User Commit

Do not create a commit.

---

## 4. Architectural Boundary

The persistence direction is:

Domain Traveller
→ ITravellerRepository
→ TravellerPrismaRepository
→ Traveller persistence representation
→ Prisma

Prisma types MUST remain inside the infrastructure/persistence boundary.

The domain MUST NOT depend on:

- Prisma;
- Prisma generated types;
- database-specific JSON types;
- persistence DTOs.

---

## 5. Existing Canonical Traveller Contract

The existing Traveller domain model and accepted Traveller implementation remain authoritative for domain behaviour.

The accepted preferences contract is:

TravellerPreferences = Record<string, unknown>

This contract represents an intentionally open-ended Traveller preference property bag.

It MUST NOT be replaced with any.

It MUST NOT be changed into a fixed preference schema as part of this iteration.

---

## 6. Current Persistence Problem

The read-only reconciliation identified that the existing Traveller persistence implementation does not align cleanly with the current Prisma model.

The legacy mapper expects concepts including:

- email;
- preferences;
- first name;
- last name;
- timestamps.

The current Prisma Traveller representation does not contain a direct preferences field and does not necessarily place email ownership on Traveller.

The implementation MUST reconcile these differences explicitly.

Do not simply rename Prisma fields to satisfy the mapper.

---

## 7. Required Persistence Decision

Before modifying the mapper, inspect the current:

- domain Traveller;
- Prisma schema;
- repository;
- mapper;
- related Customer model;
- application consumers.

Determine the correct persistent representation of Traveller.

The implementation MUST establish:

1. Traveller identity;
2. relationship to Customer;
3. canonical name representation;
4. email ownership;
5. preference persistence representation;
6. timestamp representation;
7. domain reconstruction.

The chosen representation must be supported by the established GCT Core architecture.

Do not invent unrelated Traveller fields.

---

## 8. Traveller Identity

Preserve the canonical Traveller identity.

Determine whether the Prisma Traveller primary key can represent the domain Traveller identity directly.

If mapping is required, implement it explicitly in the persistence mapper.

Do not change the domain identity merely to match Prisma.

---

## 9. Customer Relationship

Inspect the current Customer/Traveller relationship in the Prisma schema and existing domain/application models.

Determine whether:

- Traveller belongs to Customer;
- Traveller references Customer;
- Customer identity is required to reconstruct Traveller;
- the relationship is persistence-only.

Preserve the existing approved relationship.

Do not introduce a new Customer aggregate.

Do not redesign Customer persistence.

---

## 10. Email Ownership

Determine the authoritative owner of Traveller email.

The implementation must establish whether email belongs to:

- Traveller;
- Customer;
- another already-approved entity.

Do not duplicate email merely to satisfy the legacy mapper.

If the mapper currently reads email from the wrong persistence object, correct the mapper to the canonical source.

Do not modify unrelated Customer persistence.

---

## 11. Name Representation

Preserve the canonical Traveller name representation.

If Prisma stores first and last name separately, explicitly map between:

Domain Traveller

and

Prisma Traveller fields.

Do not introduce alternative naming conventions.

Do not alter the public Traveller API contract.

---

## 12. Traveller Preferences

The accepted domain representation remains:

TravellerPreferences = Record<string, unknown>

The persistence representation MUST be explicitly established.

Determine whether the existing approved physical data model supports an appropriate JSON-compatible representation.

If the current Prisma schema already provides an appropriate field, use the existing representation.

If the current Prisma schema does not provide an appropriate persistence field, do NOT automatically add one.

If a Prisma schema change is required to persist TravellerPreferences and that change is not already established by the approved physical data model:

STOP and report:

BLOCKED — PERSISTENCE MODEL DECISION REQUIRED

Do not modify the Prisma schema under this iteration without an approved persistence-model decision.

---

## 13. Preference Type Safety

The implementation MUST NOT use:

- any;
- Record<string, any>;
- unsafe casts;
- double casts;
- ESLint suppression.

The domain contract remains:

Record<string, unknown>

Any required persistence conversion must remain inside the persistence boundary.

Prisma JSON-specific types must not leak into the domain.

---

## 14. Timestamp Mapping

Inspect the existing domain Traveller timestamp representation and Prisma timestamp fields.

Preserve:

- created timestamp;
- updated timestamp;

where these are part of the established Traveller representation.

Do not introduce new lifecycle timestamps.

Do not change timestamp semantics.

---

## 15. Persistence Representation

If a dedicated persistence type is required, define it inside the persistence/infrastructure boundary.

It must represent the actual stored Traveller data.

It must not become a domain type.

Use generated Prisma types where they accurately represent the persistence boundary.

Do not create a redundant persistence abstraction merely for stylistic reasons.

---

## 16. Prisma Type Usage

Where the Prisma Traveller model accurately represents stored data, use generated Prisma types.

Do not use any for:

- Prisma Traveller input;
- Prisma Traveller output;
- mapper input;
- mapper output.

Do not modify generated Prisma source.

---

## 17. Repository Contract

ITravellerRepository MUST remain unchanged.

TravellerPrismaRepository MUST continue to implement it.

The repository MUST expose domain-level objects.

It MUST NOT expose:

- Prisma models;
- Prisma generated types;
- persistence DTOs.

Prisma types may be used internally by the repository implementation.

---

## 18. Repository Ownership

The previous Repository Ownership Reconciliation established:

traveller-prisma.repository.ts
→ TravellerPrismaRepository
→ ITravellerRepository

Do not change this ownership.

Do not modify Journey or Reservation repository ownership.

---

## 19. Mapper Responsibility

The Traveller mapper is responsible for:

Persistence → Domain

and:

Domain → Persistence

The mapper MUST NOT:

- access Prisma directly;
- perform database operations;
- contain business rules;
- resolve unrelated Customer data;
- contain supplier-specific logic.

---

## 20. Existing Behaviour Preservation

Preserve existing Traveller behaviour.

Do not change:

- Traveller construction semantics;
- Traveller validation;
- Traveller events;
- repository method semantics;
- public API behaviour;
- domain equality;
- domain identity.

Only persistence typing and required persistence mapping are in scope.

---

## 21. Repository Methods

Inspect and preserve all existing ITravellerRepository methods.

Do not:

- add repository methods;
- remove repository methods;
- redesign repository abstractions.

If an existing repository method cannot operate against the reconciled persistence representation without changing the repository contract:

STOP and report the dependency.

---

## 22. Schema Boundary

Do not modify the Prisma schema unless the current approved physical data model explicitly requires a missing Traveller persistence field.

If schema modification is required but not already defined by the approved persistence model:

STOP and report:

BLOCKED — PERSISTENCE MODEL DECISION REQUIRED

Do not:

- create migrations;
- apply migrations;
- modify the database;
- add speculative fields.

---

## 23. Tests

Inspect existing Traveller tests.

Focused tests MUST cover the persistence boundary where applicable:

1. persistence-to-domain mapping;
2. domain-to-persistence mapping;
3. preference preservation;
4. optional fields;
5. email ownership mapping;
6. Customer relationship mapping;
7. timestamps;
8. repository compatibility.

Do not rewrite unrelated Traveller tests.

Do not add Reservation or Journey tests.

---

## 24. Preference Round-Trip

If TravellerPreferences is persisted using a JSON-compatible representation, verify that:

Record<string, unknown>

survives:

domain
→ persistence
→ retrieval
→ domain

without introducing any.

Supported JSON-compatible values must remain intact.

Do not introduce arbitrary runtime transformations.

---

## 25. Validation

The mapper MUST preserve existing domain validation.

Persistence mapping MUST NOT bypass Traveller validation.

If invalid persistence data is encountered, use the existing domain/persistence error conventions.

Do not introduce a new global error-handling mechanism.

---

## 26. Nullability

Respect the actual Prisma nullability.

Do not use:

- non-null assertions merely to satisfy TypeScript;
- arbitrary defaults;
- arbitrary empty strings;
- arbitrary empty preference objects.

Where a field is optional, preserve the existing domain semantics.

---

## 27. Type Safety

The final Traveller persistence implementation MUST compile without:

- any;
- unsafe casts;
- lint suppression.

The three targeted Traveller no-explicit-any warnings MUST be removed.

No other persistence warnings need to be addressed.

---

## 28. Explicitly Out of Scope

Do NOT address:

- Reservation persistence;
- Journey persistence;
- PrismaService;
- Prisma client lifecycle;
- repository ownership;
- Reservation schema;
- Journey schema;
- Customer redesign;
- API presenters;
- frontend;
- payment;
- invoices;
- accommodation;
- Hotelbeds;
- PayFast;
- unrelated no-explicit-any warnings;
- general lint cleanup.

---

## 29. Acceptance Criteria

### AC-01 — Canonical Traveller

The existing Traveller domain model remains unchanged.

### AC-02 — Preferences

TravellerPreferences remains:

Record<string, unknown>

and is persisted without any.

### AC-03 — Persistence Contract

The Traveller persistence representation is explicitly typed.

### AC-04 — Prisma Boundary

Prisma types remain inside persistence/infrastructure.

### AC-05 — Repository Boundary

ITravellerRepository remains unchanged and domain-oriented.

### AC-06 — Repository Ownership

TravellerPrismaRepository remains the canonical Traveller repository implementation.

### AC-07 — Mapper

Traveller persistence mapping is explicitly typed in both directions.

### AC-08 — Email

Email is mapped from its canonical persistence owner without duplication or invented fields.

### AC-09 — Customer Relationship

Existing Customer/Traveller relationship semantics are preserved.

### AC-10 — Preferences Round-Trip

Supported preference values survive persistence round-trip.

### AC-11 — No Unsafe Typing

No any, unsafe cast or lint suppression is introduced.

### AC-12 — Schema

No unapproved Prisma schema redesign is introduced.

### AC-13 — Regression

Full Jest regression passes.

### AC-14 — Build

Build passes.

### AC-15 — Prisma

npx prisma validate passes.

### AC-16 — Lint

The three targeted Traveller warnings are removed.

Expected:

14 → 11 warnings.

### AC-17 — Scope

Reservation, Journey and PrismaService remain untouched.

---

## 30. Verification Requirements

### 30.1 Focused Traveller Tests

Run the relevant Traveller domain, mapper and repository tests.

Report:

- suites;
- tests;
- passed;
- failed.

### 30.2 Full Regression

Run:

npm test -- --runInBand

Report:

- suites passed;
- suites failed;
- tests passed;
- tests failed;
- skipped;
- exit status.

### 30.3 Build

Run:

npm run build

Report the result.

### 30.4 Prisma Validation

Run:

npx prisma validate

Do not:

- migrate;
- push;
- reset;
- seed;
- modify the database.

### 30.5 Lint

Run:

npm run lint

Report:

- errors;
- warnings;
- baseline;
- final;
- warnings removed;
- remaining no-explicit-any warnings.

Expected target:

11 warnings.

### 30.6 TypeScript / Language Service

Check all changed Traveller persistence files.

Report any errors.

---

## 31. Warning Accounting

Baseline:

14 warnings.

Target:

11 warnings.

Targeted:

3 Traveller persistence warnings.

Do not remediate unrelated warnings.

If the final warning count differs:

- report the exact difference;
- identify the cause;
- do not fix unrelated warnings.

---

## 32. Scope Audit

Before completion confirm:

- Traveller persistence contract implemented;
- Traveller mapper typed;
- Traveller repository typed where required;
- TravellerPreferences preserved;
- no Reservation changes;
- no Journey changes;
- no PrismaService changes;
- no repository ownership changes;
- no API changes;
- no provider changes;
- no unrelated lint remediation;
- no lint suppressions;
- no database changes.

---

## 33. Final Copilot Report

Return:

### Implementation Status

- completed / partially completed / blocked

### Traveller Persistence Decision

State:

- canonical persistence representation;
- preference representation;
- email ownership;
- Customer relationship;
- whether a schema change was required.

### Files Changed

List every changed source/test/Prisma file.

### Warning Reduction

- baseline: 14;
- final;
- warnings removed;
- remaining no-explicit-any;
- other warnings.

### Verification

- focused Traveller tests;
- full Jest regression;
- build;
- Prisma validation;
- lint;
- TypeScript/language-service.

### Scope Audit

Confirm:

- Reservation modified: NO;
- Journey modified: NO;
- PrismaService modified: NO;
- repository ownership modified: NO;
- API modified: NO;
- Prisma schema modified: YES/NO;
- database modified: NO;
- ESLint configuration modified: NO;
- TypeScript configuration modified: NO;
- suppressions added: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- commit created: NO.

### Exceptions

List any unresolved persistence/schema issue.

---

## 34. Completion Boundary

This iteration ends with the Traveller persistence contract.

Do not proceed to:

- Reservation persistence;
- Journey persistence;
- PrismaService;
- remaining no-explicit-any warnings.

Those require subsequent controlled specifications.

If the Traveller persistence contract cannot be implemented without an unapproved Prisma schema decision, stop and report:

BLOCKED — PERSISTENCE MODEL DECISION REQUIRED

Do not make the schema decision implicitly.

After the Copilot report, the implementation will be reviewed for architect acceptance.

The user performs the commit after acceptance.