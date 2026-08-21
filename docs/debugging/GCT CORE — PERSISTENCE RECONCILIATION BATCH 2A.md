# GCT CORE — PERSISTENCE RECONCILIATION BATCH 2A
## Traveller Persistence Model Implementation

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B2A-TRAVELLER-MODEL |
| Title | Traveller Persistence Model Implementation |
| Project | GCT Core |
| Type | Focused Implementation Specification |
| Status | Implementation Ready |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Dependency | PERSISTENCE-B2B-TRAVELLER-CUSTOMER |
| Scope | Traveller persistence mapping and repository |
| Current Lint Warnings | 14 |
| Target Lint Warnings | 11 |
| Targeted Warnings | 3 Traveller persistence warnings |

---

## 2. Purpose

Implement the Traveller persistence model established by the read-only persistence reconciliation and the completed Customer Association Contract.

The implementation MUST reconcile:

- Traveller domain representation;
- Customer persistence relationship;
- Customer-owned email;
- Traveller preferences;
- Prisma Traveller representation;
- Traveller mapper;
- Traveller repository.

The immediate objective is to remove the three Traveller persistence `no-explicit-any` warnings through correct typing.

This specification MUST NOT redesign the Traveller domain model.

---

## 3. Governing Process

Follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

Required workflow:

Specification
→ Implementation
→ Focused Tests + Regression
→ Copilot Report
→ Architect Acceptance
→ User Commit

Do not create a commit.

---

## 4. Established Decisions

The following decisions have already been established and MUST be treated as authoritative for this implementation.

### 4.1 Traveller Domain

The existing Traveller aggregate remains unchanged.

Do not add `customerId` to the Traveller aggregate solely for persistence.

### 4.2 Customer Association

Customer identity now enters Traveller creation explicitly through:

`CreateTravellerCommand.customerId`

The completed B2B implementation introduced:

`TravellerPersistenceContext`

to carry the Customer association into persistence without introducing Prisma types into the domain.

### 4.3 Customer Ownership

Customer remains a distinct business concept.

Traveller persistence requires the existing Customer relationship.

### 4.4 Email

Customer is the authoritative persistence owner of email.

Traveller persistence MUST NOT introduce a duplicate email field.

### 4.5 Preferences

The accepted domain contract remains:

`TravellerPreferences = Record<string, unknown>`

Preferences are an open-ended property bag.

---

## 5. Persistence Boundary

The persistence flow MUST remain:

Domain Traveller
→ ITravellerRepository
→ TravellerPrismaRepository
→ Prisma

Prisma types MUST remain inside infrastructure/persistence.

The domain MUST NOT import:

- Prisma generated types;
- Prisma JSON types;
- persistence DTOs;
- database-specific types.

---

## 6. Traveller Prisma Model

The Prisma Traveller model currently requires:

`customerId`

This relationship MUST remain required.

The implementation MUST use the Customer identity supplied through `TravellerPersistenceContext`.

Do not:

- make customerId nullable;
- invent a Customer;
- use a dummy Customer ID;
- derive customerId from email;
- bypass the foreign-key relationship.

---

## 7. Customer Relationship Persistence

`TravellerPrismaRepository.save()` MUST use the supplied:

`TravellerPersistenceContext.customerId`

when persisting a Traveller.

The Customer association MUST be explicit.

No implicit Customer creation is permitted.

No Customer lookup by email is required for save.

---

## 8. Traveller Persistence Context

The existing persistence-neutral:

`TravellerPersistenceContext`

MUST remain the mechanism for carrying Customer identity to persistence.

It MUST contain only the required Customer association information.

It MUST NOT contain:

- Prisma objects;
- Prisma generated types;
- Customer database rows;
- email;
- unrelated Traveller properties.

The context is infrastructure/application boundary data, not part of the Traveller aggregate.

---

## 9. Traveller Repository Contract

Preserve the completed B2B repository contract.

`ITravellerRepository.save()` MUST accept the Traveller and the required persistence context according to the established implementation.

The repository MUST remain domain/application oriented.

It MUST NOT expose Prisma models or Prisma generated types.

Existing update-save compatibility MUST be preserved where already established by B2B.

---

## 10. Email Lookup

Customer owns email in persistence.

`TravellerPrismaRepository.findByEmail()` MUST NOT query:

`Traveller.email`

because that field does not exist on the canonical Prisma Traveller model.

Instead, the repository MUST resolve the Traveller through the Customer relationship and the authoritative Customer email.

The existing repository method contract MUST remain unchanged.

---

## 11. Email Lookup Semantics

The implementation MUST:

1. locate the Customer using the authoritative Customer email;
2. resolve the associated Traveller;
3. map the persistence representation into the domain Traveller;
4. return the existing repository result.

If no matching Traveller is found, preserve the existing not-found semantics.

Do not introduce new email normalization behaviour.

Do not create a Customer during lookup.

---

## 12. Traveller Preferences Persistence

The domain representation remains:

`Record<string, unknown>`

The Prisma Traveller model MUST gain a nullable JSON-compatible preferences field.

The field represents the Traveller preference property bag.

The field MUST be optional/nullable to preserve compatibility with existing Traveller records.

No fixed preference schema is introduced.

---

## 13. Prisma Schema Change

A narrowly scoped Prisma schema change is authorised:

Add a nullable JSON-compatible preferences field to the Traveller model.

No other Prisma model changes are permitted.

Do not modify:

- Customer;
- Reservation;
- Journey;
- unrelated Traveller fields;
- relationships;
- indexes;
- enums.

Do not redesign the physical data model.

---

## 14. Migration Boundary

The implementation may update the Prisma schema as required by this specification.

Do not apply database migrations unless explicitly required by the normal project implementation workflow.

Do not:

- reset the database;
- delete data;
- alter existing identifiers;
- rewrite existing Customer relationships;
- modify existing email data.

The new preferences field must remain nullable for existing records.

---

## 15. Preference Type Boundary

The domain contract remains:

`Record<string, unknown>`

The persistence boundary may use Prisma's generated JSON-compatible types internally.

Prisma JSON types MUST NOT enter:

- domain entities;
- domain value objects;
- repository interfaces;
- application commands.

No `any` is permitted.

No unsafe casts are permitted.

No ESLint suppression is permitted.

---

## 16. Preference Mapping

The Traveller mapper MUST explicitly convert between:

Domain TravellerPreferences

and:

Prisma-compatible JSON persistence.

The mapper MUST preserve supported JSON-compatible values, including:

- strings;
- numbers;
- booleans;
- null;
- arrays;
- nested objects.

Do not arbitrarily transform preference values.

---

## 17. Legacy Null Preferences

Existing Traveller records may contain no preferences value.

When reconstructing the domain Traveller:

- null/missing preferences MUST map to the existing Traveller default semantics;
- the domain MUST continue to expose the established `TravellerPreferences` contract;
- no null preference value may leak into a field that expects `Record<string, unknown>`.

Do not invent a new domain default.

Use the existing Traveller construction semantics.

---

## 18. Traveller Persistence Mapping

The mapper MUST explicitly type both directions:

### Persistence → Domain

Map:

- Traveller identity;
- first name;
- last name;
- Customer-owned email;
- preferences;
- existing Traveller fields;
- timestamps.

### Domain → Persistence

Map:

- Traveller identity;
- first name;
- last name;
- preferences;
- existing Traveller fields;
- required Customer relationship from `TravellerPersistenceContext`;
- timestamps where applicable.

The mapper MUST NOT perform database operations.

---

## 19. Email Mapping

Email MUST be obtained from the Customer persistence relation.

Do not add:

`email`

to the Prisma Traveller model.

Do not duplicate Customer.email into Traveller persistence.

When mapping persistence to domain, the mapper may consume the loaded Customer relation as required.

The resulting domain Traveller continues to use its existing email representation.

---

## 20. Prisma Query Requirements

Traveller queries that reconstruct the domain Traveller MUST load the Customer relationship required to obtain email.

This applies to:

- `findById`;
- `findByEmail`;
- other existing Traveller retrieval operations where the domain requires email.

Do not introduce unnecessary Customer data loading.

Load only the relationship/data required by the existing Traveller contract.

---

## 21. Traveller Identity

Preserve the existing Traveller identity mapping.

Do not change:

- domain identity type;
- identifier generation;
- identifier semantics.

If Prisma uses the same identifier, map directly.

If conversion is required, isolate it inside the mapper.

---

## 22. Traveller Name

Preserve the existing first-name/last-name mapping.

Do not change:

- field names in the domain;
- public API shape;
- name validation;
- name semantics.

The mapper is responsible for translating persistence fields to the existing domain representation.

---

## 23. Timestamps

Preserve the existing Traveller timestamp semantics.

Where the Prisma model contains:

- created timestamp;
- updated timestamp;

the mapper MUST preserve them according to the existing domain contract.

Do not introduce new lifecycle timestamps.

---

## 24. Existing Traveller Fields

All existing approved Traveller persistence fields MUST remain supported.

Do not remove or repurpose existing fields as part of this implementation.

If a current Prisma field has no corresponding domain property, preserve it according to the existing persistence model rather than exposing it in the domain.

---

## 25. Repository Methods

Preserve all existing `ITravellerRepository` methods.

Do not:

- add unrelated methods;
- remove methods;
- redesign repository abstractions.

The only lookup behaviour requiring correction is email resolution through Customer.

---

## 26. Repository Ownership

The previously accepted ownership remains:

`traveller-prisma.repository.ts`
→ `TravellerPrismaRepository`
→ `ITravellerRepository`

Do not modify:

- Journey repository;
- Reservation repository;
- repository barrel ownership.

---

## 27. Domain Isolation

Do not modify the Traveller aggregate to accommodate:

- customerId;
- Prisma JSON;
- Prisma relations;
- persistence-only fields.

The completed B2B Customer association contract intentionally keeps Customer context outside the Traveller aggregate.

Preserve that architecture.

---

## 28. Application Contract

The completed B2B changes remain authoritative:

- `CreateTravellerCommand.customerId` is required;
- `CreateTravellerService` supplies Customer context;
- `TravellerPersistenceContext` carries Customer identity;
- repository persistence receives the context.

Do not redesign these contracts during B2A.

---

## 29. Tests — Mapping

Add or update focused tests for:

### Domain → Persistence

Verify:

- identity;
- name;
- preferences;
- Customer context;
- timestamps;
- existing fields.

### Persistence → Domain

Verify:

- identity;
- name;
- Customer email;
- preferences;
- timestamps;
- existing fields.

---

## 30. Tests — Customer Association

Verify:

- valid customerId is persisted;
- Customer relationship is preserved;
- missing Customer relationship cannot silently persist;
- no Customer is implicitly created.

The tests MUST use the established B2B persistence context.

---

## 31. Tests — Email Lookup

Verify:

- valid Customer email resolves the associated Traveller;
- unknown email returns existing not-found result;
- Traveller.email is never queried;
- Customer relation is used as the authoritative email source.

---

## 32. Tests — Preferences

Verify:

- empty/default preferences;
- populated preferences;
- nested objects;
- arrays;
- boolean values;
- numeric values;
- null-compatible values where supported;
- persistence round-trip;
- legacy null preferences.

No test may use `any` merely to simplify fixture construction.

---

## 33. Persistence Error Handling

Preserve existing persistence error conventions.

Do not introduce a new global exception framework.

A missing Customer relationship or invalid persistence state must not be silently converted into:

- null;
- empty identifier;
- dummy Customer;
- fabricated Traveller data.

---

## 34. Type Safety

The three targeted Traveller persistence `no-explicit-any` warnings MUST be removed.

The implementation MUST NOT introduce:

- new `any`;
- `Record<string, any>`;
- unsafe casts;
- non-null assertions solely to satisfy TypeScript;
- lint suppressions.

If a type cannot be safely established from the canonical persistence model:

STOP and report the issue.

---

## 35. Out of Scope

The following MUST NOT be changed:

- Reservation persistence;
- Journey persistence;
- PrismaService;
- Prisma client lifecycle;
- repository ownership;
- Customer domain model;
- Customer Prisma model;
- Customer repository;
- API presenters;
- frontend;
- pricing;
- payment;
- invoices;
- accommodation;
- Hotelbeds;
- PayFast;
- unrelated lint warnings.

---

## 36. Acceptance Criteria

### AC-01 — Customer Association

Traveller persistence uses the explicit Customer context established by B2B.

### AC-02 — Required Customer

Prisma Traveller.customerId remains required.

### AC-03 — No Implicit Customer

No Customer is created or inferred during Traveller persistence.

### AC-04 — Email Ownership

Customer.email remains the authoritative persisted email.

### AC-05 — Email Lookup

Traveller lookup by email resolves through Customer.

### AC-06 — No Duplicate Email

No email field is added to Prisma Traveller.

### AC-07 — Preferences

TravellerPreferences remains:

`Record<string, unknown>`

### AC-08 — Preferences Persistence

Traveller preferences are represented by the approved nullable JSON-compatible Traveller field.

### AC-09 — Mapper

Traveller persistence mapping is explicitly typed in both directions.

### AC-10 — Domain Isolation

No Prisma types enter the domain or repository interface.

### AC-11 — Repository Contract

The completed B2B repository contract remains intact.

### AC-12 — Repository Ownership

Traveller repository ownership remains canonical.

### AC-13 — Existing Behaviour

Traveller creation and retrieval semantics remain unchanged except for the corrected persistence relationship.

### AC-14 — Tests

Focused Traveller persistence tests pass.

### AC-15 — Regression

Full Jest regression passes.

### AC-16 — Build

Build passes.

### AC-17 — Prisma

Prisma validation passes.

### AC-18 — Lint

Warnings reduce from:

14 → 11

with the three targeted Traveller persistence warnings removed.

### AC-19 — Scope

Reservation, Journey and PrismaService remain untouched.

---

## 37. Verification Requirements

### Focused Tests

Run the relevant Traveller:

- mapper tests;
- repository tests;
- persistence tests;
- creation/persistence integration tests.

Report exact suite and test counts.

### Full Regression

Run:

`npm test -- --runInBand`

Report:

- suites passed;
- suites failed;
- tests passed;
- tests failed;
- skipped;
- exit status.

### Build

Run:

`npm run build`

### Prisma Validation

Run:

`npx prisma validate`

Do not:

- reset the database;
- push schema changes to an uncontrolled database;
- apply destructive migrations.

### Lint

Run:

`npm run lint`

Report:

- errors;
- warnings;
- baseline;
- final;
- warnings removed;
- remaining no-explicit-any.

Expected final warning count:

11.

### TypeScript / Language Service

Check all changed Traveller persistence files.

Report any errors.

---

## 38. Warning Accounting

Baseline:

14 warnings.

Target:

11 warnings.

Targeted:

3 Traveller persistence warnings.

No unrelated warnings may be remediated.

If the final count differs:

1. report the exact difference;
2. identify which warning changed;
3. explain why;
4. do not expand scope to fix unrelated warnings.

---

## 39. Scope Audit

Before completion confirm:

- Traveller Prisma preferences field added: YES, if required by the approved model;
- Customer relationship preserved;
- Customer email remains authoritative;
- Traveller mapper updated;
- Traveller repository updated;
- Traveller creation context from B2B preserved;
- no Customer schema redesign;
- no Customer domain redesign;
- no Reservation changes;
- no Journey changes;
- no PrismaService changes;
- no repository ownership changes;
- no API changes;
- no provider changes;
- no unrelated lint remediation;
- no suppressions;
- no database changes unless explicitly authorised by the normal migration workflow;
- no Hotelbeds calls;
- no PayFast calls;
- no commit created.

---

## 40. Final Copilot Report

Return:

### Implementation Status

- completed / partially completed / blocked

### Persistence Model Implemented

State:

- Traveller identity mapping;
- Customer relationship;
- email ownership;
- preferences representation;
- Prisma schema change.

### Files Changed

List every changed source, test and Prisma file.

### Warning Reduction

Report:

- baseline;
- final;
- warnings removed;
- remaining no-explicit-any;
- other warnings.

### Verification

Report:

- focused Traveller tests;
- full Jest regression;
- build;
- Prisma validation;
- lint;
- TypeScript/language-service.

### Scope Audit

Confirm:

- Customer domain modified: NO;
- Customer Prisma model modified: NO;
- Traveller domain modified: NO;
- Reservation modified: NO;
- Journey modified: NO;
- PrismaService modified: NO;
- repository ownership modified: NO;
- API modified: NO;
- database modified: YES/NO;
- ESLint configuration modified: NO;
- TypeScript configuration modified: NO;
- suppressions added: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- commit created: NO.

### Exceptions

List any unresolved issue preventing completion.

---

## 41. Completion Boundary

This iteration ends after Traveller persistence mapping and verification.

Do not proceed to:

- Reservation persistence;
- Journey persistence;
- PrismaService;
- remaining persistence warnings.

If implementation reveals that the approved model is insufficient, STOP and report:

**BLOCKED — ADDITIONAL TRAVELLER PERSISTENCE MODEL DECISION REQUIRED**

Do not make an additional architectural decision implicitly.

After the Copilot implementation report, the result will be reviewed for architect acceptance.

The user performs the commit after acceptance.