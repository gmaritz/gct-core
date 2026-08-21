# GCT CORE — PERSISTENCE RECONCILIATION BATCH 2A
## Focused Traveller Persistence Model Specification

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B2A-TRAVELLER-MODEL |
| Title | Traveller Persistence Model |
| Project | GCT Core |
| Type | Focused Persistence Model Specification |
| Status | Implementation Ready |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Scope | Traveller and Customer persistence relationship |
| Related Lint Batch | Batch 2 — Traveller Persistence Contract |
| Current Lint Warnings | 14 |
| Downstream Target | Unblock 3 Traveller persistence warnings |

---

## 2. Purpose

Define the canonical persistence model for the Traveller aggregate so that the existing domain Traveller can be represented correctly by the current GCT Core persistence architecture.

This specification resolves the persistence decisions that blocked PERSISTENCE-B2-TRAVELLER:

1. Traveller ownership and Customer relationship;
2. authoritative email ownership;
3. persistence representation of TravellerPreferences;
4. mapping between domain Traveller and Traveller/Customer persistence;
5. correct ownership of email-based Traveller lookup.

This specification establishes the model only.

The subsequent implementation specification will apply the model to the Traveller mapper and repository and remove the three targeted no-explicit-any warnings.

---

## 3. Governing Process

Follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

Required workflow:

Specification
→ Architect Review/Approval
→ Copilot Implementation
→ Focused Tests + Regression
→ Copilot Verification Report
→ Architect Acceptance
→ User Commit

No commit is created by Copilot.

The implementation must remain within this specification.

---

## 4. Architectural Boundary

The canonical persistence direction remains:

Domain Traveller
→ ITravellerRepository
→ TravellerPrismaRepository
→ Persistence Model
→ Prisma

The domain model MUST remain independent of Prisma.

The persistence model exists to represent the approved domain model in the physical data layer.

Prisma generated types remain infrastructure concerns.

---

## 5. Current Blocking Evidence

The current Prisma representation does not directly correspond to the existing Traveller domain/repository contract.

Confirmed mismatches include:

- Prisma Traveller requires `customerId`;
- the current Traveller aggregate does not expose `customerId`;
- email is represented by Customer rather than Traveller;
- Prisma Traveller has no preferences JSON field;
- `TravellerPrismaRepository.findByEmail()` currently expects email on Traveller;
- the existing mapper expects email and preferences on the Traveller persistence representation.

These differences MUST be resolved by an explicit persistence model rather than by adding arbitrary fields or unsafe typing.

---

## 6. Canonical Traveller Ownership

Traveller remains a distinct domain entity/aggregate within the GCT Core domain model.

Traveller MUST remain associated with a Customer through the existing Customer relationship represented by the persistence model.

The persistence relationship MUST NOT be interpreted as making Customer the domain owner of Traveller.

The distinction is:

- Customer identifies the commercial/customer relationship;
- Traveller represents the person participating in a journey/reservation;
- Traveller persistence references Customer where required by the physical model.

The domain Traveller does not need to expose `customerId` solely because Prisma requires the relationship.

---

## 7. Customer Relationship

The Prisma Traveller `customerId` relationship is authoritative for persistence.

The persistence model MUST retain the Customer relationship.

The Traveller domain object MUST NOT be expanded merely to expose the Prisma foreign key.

The mapper is responsible for translating:

Domain Traveller

to:

Traveller persistence representation with Customer relationship.

Where the domain Traveller is reconstructed from persistence, the Customer relationship must be available to the persistence layer without introducing Prisma-specific fields into the domain object.

---

## 8. Customer Relationship Requirement

A persisted Traveller MUST have a valid Customer relationship where the Prisma schema requires `customerId`.

The persistence implementation MUST NOT:

- invent a Customer;
- create a Customer implicitly;
- use a dummy Customer ID;
- use a zero/empty identifier;
- bypass the foreign-key relationship.

If a Traveller is persisted without an available Customer relationship, the operation must fail through the existing application/persistence error mechanism.

Do not introduce a new Customer creation workflow in this specification.

---

## 9. Email Ownership

Email is owned by Customer in the current physical model.

Therefore:

**Customer is the authoritative persistence source for Traveller email.**

Traveller persistence MUST NOT duplicate email merely to satisfy the legacy Traveller mapper.

The Traveller domain may continue to expose the email information required by its existing contract, but the persistence layer must obtain that value through the Customer relationship.

---

## 10. Email Lookup

The existing:

`ITravellerRepository.findByEmail()`

contract must remain unchanged for this specification.

Its implementation MUST resolve the Traveller through the authoritative Customer email relationship.

Conceptually:

Traveller Repository
→ Customer relationship
→ Customer.email
→ associated Traveller

The implementation MUST NOT query a nonexistent:

`Traveller.email`

field.

No repository contract redesign is required.

No Customer repository is introduced.

No new public query method is introduced.

---

## 11. Email Lookup Semantics

`findByEmail()` MUST:

1. locate the Customer using the authoritative email field;
2. resolve the associated Traveller persistence record;
3. map the resulting persistence representation into the domain Traveller;
4. return the existing repository result type.

If no matching Traveller is found, preserve the existing repository not-found semantics.

Email comparison behaviour must follow the existing Prisma/database semantics.

Do not introduce new email normalization rules in this specification.

---

## 12. Traveller Preferences

The accepted domain contract remains:

`TravellerPreferences = Record<string, unknown>`

This contract MUST NOT be changed.

Traveller preferences are part of the Traveller domain representation but are currently not represented by a dedicated Prisma Traveller column.

The persistence model therefore requires an explicit persistence representation.

---

## 13. Preference Persistence Representation

Traveller preferences MUST be persisted as a JSON-compatible property bag associated with the Traveller.

The preferred physical representation is a Prisma JSON field on the Traveller persistence model.

The field MUST represent:

`TravellerPreferences`

without introducing a fixed preference schema.

The persistence representation must support JSON-compatible:

- strings;
- numbers;
- booleans;
- null values;
- arrays;
- nested objects.

The domain remains:

`Record<string, unknown>`

Prisma-specific JSON types MUST remain inside persistence infrastructure.

---

## 14. Prisma Schema Requirement

The current Prisma Traveller model does not contain the required preferences field.

Therefore this specification authorises the following narrowly scoped Prisma model extension:

Add a nullable JSON-compatible Traveller preferences field.

The field represents the Traveller preference property bag.

The field MUST be optional at the database level to preserve compatibility with existing Traveller records.

No migration is to be generated or applied as part of this specification unless normal implementation workflow explicitly requires generation after schema approval.

No unrelated Prisma model changes are permitted.

---

## 15. Preference Nullability

The persistence representation may be null for existing records that predate preference persistence.

When reconstructing the domain Traveller:

- null/missing persistence preferences must map to the existing domain default semantics;
- the mapper must not return null where the domain contract requires `TravellerPreferences`;
- the mapper must not introduce `any`.

The exact existing Traveller construction/default behaviour must be preserved.

Do not invent a new preference default.

---

## 16. Preference Type Boundary

The type boundary is:

Domain:

`Record<string, unknown>`

Persistence:

Prisma-compatible JSON representation.

Conversion MUST occur inside the persistence mapper.

The domain MUST NOT import:

- Prisma `JsonValue`;
- Prisma `InputJsonValue`;
- Prisma generated model types.

No lint suppression is permitted.

---

## 17. Traveller Persistence Representation

The canonical persistence representation MUST contain the information required to reconstruct the current domain Traveller without introducing persistence-only fields into the domain.

At minimum the persistence mapping must account for:

- Traveller identity;
- Traveller name;
- Customer relationship;
- Customer-owned email;
- Traveller preferences;
- created timestamp;
- updated timestamp;
- existing Traveller-specific persistence attributes already represented by the approved Prisma model.

Do not remove existing approved Traveller persistence attributes.

Do not add unrelated attributes.

---

## 18. Domain-to-Persistence Mapping

The mapper MUST translate the existing Traveller aggregate into the persistence representation.

The mapping must:

- preserve Traveller identity;
- preserve name;
- associate the correct Customer;
- persist preferences;
- preserve timestamps where applicable;
- preserve existing Traveller fields;
- avoid Prisma-specific types outside infrastructure.

The mapper MUST NOT create or mutate a Customer as a side effect unless the existing repository architecture already explicitly requires that behaviour.

---

## 19. Persistence-to-Domain Mapping

The mapper MUST reconstruct the existing Traveller domain representation from persistence.

The mapping must:

- reconstruct the Traveller identity;
- reconstruct name;
- obtain email from the authoritative Customer relationship;
- reconstruct preferences;
- preserve existing optional field semantics;
- preserve timestamps;
- preserve existing domain validation.

No new domain properties may be introduced solely to accommodate Prisma.

---

## 20. Customer Loading

Where Traveller reconstruction requires Customer-owned email, the persistence implementation may load the required Customer relationship as part of the Traveller query.

The Customer relationship is an infrastructure concern.

Do not introduce:

- Customer domain aggregate loading into Traveller;
- new Customer repository dependencies;
- domain-level persistence navigation.

The domain Traveller receives only the data required by its existing contract.

---

## 21. Repository Contract

`ITravellerRepository` MUST remain unchanged.

The following method remains valid:

`findByEmail()`

Its implementation changes only in how the persistence lookup resolves the authoritative Customer email.

No new repository methods are required.

No repository interface changes are permitted.

---

## 22. Traveller Repository Ownership

The previously accepted repository ownership remains:

`traveller-prisma.repository.ts`

→ `TravellerPrismaRepository`

→ `ITravellerRepository`

Do not modify Journey or Reservation repositories.

Do not modify repository barrel ownership.

---

## 23. Prisma Traveller Model

The Prisma Traveller model may be extended only for the approved preferences JSON field required by this specification.

Existing fields and relationships remain unchanged.

In particular:

- `customerId` remains required;
- Customer relationship remains intact;
- existing Traveller fields remain intact;
- no duplicate email field is introduced.

---

## 24. No Customer Schema Redesign

The Customer Prisma model is not redesigned.

Do not:

- rename Customer fields;
- add duplicate email fields;
- change Customer identity;
- change Customer relationships;
- change Customer lifecycle.

Customer email remains the authoritative email persistence field.

---

## 25. No Domain Model Redesign

Do not modify the Traveller aggregate merely to expose:

- customerId;
- Prisma JSON types;
- persistence-only fields.

Do not add Customer persistence concepts to the domain Traveller unless the existing approved domain model already requires them.

---

## 26. Migration Safety

The new preferences field MUST be nullable/optional for existing records.

Existing Traveller records must remain readable after the schema extension.

No existing Traveller data may be destroyed or transformed automatically.

No migration may:

- delete Traveller records;
- delete Customer records;
- alter existing identifiers;
- rewrite existing email values.

---

## 27. Data Integrity

The persistence implementation MUST preserve:

- Traveller identity;
- Customer relationship;
- Customer email;
- Traveller preferences;
- existing Traveller fields.

A Traveller record without a valid required Customer relationship must not be silently persisted.

---

## 28. Testing Requirements

Focused tests MUST cover:

### Persistence Mapping

- domain → persistence;
- persistence → domain.

### Customer Relationship

- valid Customer association;
- required Customer relationship;
- Customer email retrieval.

### Email Lookup

- matching Customer email returns Traveller;
- non-matching email returns existing not-found result;
- Traveller email is not queried directly.

### Preferences

- empty/default preferences;
- populated preferences;
- nested JSON-compatible preferences;
- null/legacy persistence value;
- round-trip preservation.

### Existing Behaviour

- Traveller identity;
- name;
- timestamps;
- existing Traveller-specific fields.

---

## 29. Prisma Validation

After implementation:

`npx prisma validate`

MUST pass.

No database connection or migration execution is required for acceptance unless explicitly required by the repository's normal implementation process.

---

## 30. Lint Objective

This model specification enables the subsequent Traveller persistence implementation to remove the three Traveller-related:

`@typescript-eslint/no-explicit-any`

warnings.

Expected downstream warning transition:

**14 → 11**

No other lint warnings are to be addressed as part of the Traveller implementation.

---

## 31. Build and Regression

The downstream implementation MUST verify:

- focused Traveller tests;
- full Jest regression;
- TypeScript build;
- Prisma validation;
- lint.

Existing baseline:

- 84 suites;
- 684 tests;
- 0 failures;
- 14 lint warnings.

No regression may be accepted solely because the new Traveller tests pass.

---

## 32. Explicitly Out of Scope

This specification MUST NOT address:

- Reservation persistence;
- Journey persistence;
- PrismaService;
- Prisma client lifecycle;
- repository ownership;
- API presenters;
- frontend;
- pricing;
- payment;
- invoices;
- accommodation;
- Hotelbeds;
- PayFast;
- unrelated lint warnings;
- Customer domain redesign;
- Customer repository redesign.

---

## 33. Acceptance Criteria

### AC-01 — Traveller Ownership

Traveller remains a distinct domain entity/aggregate.

### AC-02 — Customer Relationship

Persistence retains the required Customer relationship without adding customerId to the domain Traveller solely for persistence.

### AC-03 — Email Authority

Customer.email is the authoritative persisted email source.

### AC-04 — Email Lookup

Traveller repository email lookup resolves through Customer rather than a nonexistent Traveller.email field.

### AC-05 — Preferences

TravellerPreferences remains:

`Record<string, unknown>`

### AC-06 — Preference Persistence

Traveller preferences have an explicit JSON-compatible persistence representation.

### AC-07 — Schema Safety

Only the approved Traveller preferences field may be added to the Prisma model.

### AC-08 — Domain Isolation

No Prisma types enter the domain.

### AC-09 — Repository Contract

ITravellerRepository remains unchanged.

### AC-10 — Mapper

Traveller persistence mapping is explicitly typed in both directions.

### AC-11 — Existing Behaviour

Existing Traveller behaviour remains unchanged.

### AC-12 — Data Safety

Existing Traveller records remain readable.

### AC-13 — Tests

Focused Traveller persistence tests pass.

### AC-14 — Regression

Full Jest regression passes.

### AC-15 — Build

Build passes.

### AC-16 — Prisma

Prisma validation passes.

### AC-17 — Lint

The downstream implementation removes the three Traveller persistence no-explicit-any warnings.

### AC-18 — Scope

Reservation, Journey and PrismaService remain untouched.

---

## 34. Downstream Implementation Specification Boundary

This document establishes the persistence model.

The subsequent implementation MUST apply this model to:

- Prisma Traveller representation;
- Traveller mapper;
- Traveller repository;
- relevant focused tests.

The implementation MUST NOT reinterpret or expand this model.

If implementation reveals a contradiction with an authoritative existing GCT Core document, STOP and report the contradiction rather than silently changing the model.

---

## 35. Verification Report

Copilot's final implementation report MUST include:

### Implementation Status

- completed / partially completed / blocked

### Persistence Model

State:

- Traveller ownership;
- Customer relationship;
- email authority;
- preferences representation;
- Prisma changes.

### Files Changed

List all source, test and Prisma files.

### Verification

Report:

- focused tests;
- full Jest regression;
- build;
- Prisma validation;
- lint;
- TypeScript/language-service.

### Warning Reduction

Report:

- baseline;
- final;
- warnings removed;
- remaining no-explicit-any.

### Scope Audit

Confirm:

- Reservation modified: NO;
- Journey modified: NO;
- PrismaService modified: NO;
- repository ownership modified: NO;
- Customer redesign: NO;
- Prisma schema modified: YES/NO;
- database modified: NO;
- ESLint configuration modified: NO;
- TypeScript configuration modified: NO;
- suppressions added: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- commit created: NO.

### Exceptions

List any unresolved issue preventing completion.

---

## 36. Completion Boundary

This specification ends at the Traveller persistence model.

After approval, Copilot may implement only the Traveller persistence changes defined here.

Do not proceed to:

- Reservation persistence;
- Journey persistence;
- PrismaService;
- remaining persistence lint warnings.

If the approved model cannot be implemented without an additional architectural decision:

STOP and report:

**BLOCKED — ADDITIONAL PERSISTENCE MODEL DECISION REQUIRED**

Do not make the additional decision implicitly.

After implementation and verification, the result will be reviewed for architect acceptance.

The user performs the commit after acceptance.