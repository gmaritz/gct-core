# APP-011 — Customer Resolution for Anonymous Bookings

## Document Control

| Field | Value |
|---|---|
| Document ID | APP-011 |
| Title | Customer Resolution for Anonymous Bookings |
| Version | 1.0 |
| Status | Approved for Implementation |
| Classification | Application Implementation Specification |
| Owner | GCT Core System Architecture |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS.md |
| Architectural Authority | ARCH-000 |
| Dependency | SPEC-030, IMP-007 |
| Enables | IMP-011 |

---

# 1. Purpose

Establish the smallest application and persistence boundary required to resolve or create an authoritative `Customer.id` for an anonymous MVP booking.

The capability SHALL support:

`Validated Guest Information → Customer Resolution → Customer.id → Canonical Reservation`

The capability SHALL NOT implement customer authentication or a generic identity-management framework.

---

# 2. Governing Development Process

Implementation MUST follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

GOV-DEV-001 is the single source of truth for the development workflow.

The workflow is:

Specification → Implementation → Focused Tests + Regression → Implementation Report → Architect Acceptance → User Commit

Copilot SHALL NOT commit or push.

---

# 3. Architectural Decision

GCT Core MVP SHALL support anonymous customer bookings.

A validated booking customer SHALL be resolved or created through an explicit application boundary before canonical Reservation creation.

The authoritative ownership relationship remains:

`Reservation → Customer.id`

Email or any other contact value SHALL NOT be used directly as `customerId`.

The Customer record SHALL provide durable identity/ownership.

Reservation guest/contact snapshots SHALL remain independently preserved and SHALL NOT be replaced by mutable Customer data.

---

# 4. Customer Resolution Contract

Introduce the smallest application-level contract required for anonymous booking resolution.

Conceptually:

`CustomerResolutionService.resolveOrCreate(input) → { customerId }`

The input SHALL contain validated customer information sufficient for the approved identity rule and Customer creation.

At minimum, this includes:

- email;
- first name;
- last name;
- optional phone.

The service SHALL return only the authoritative Customer identity required by Reservation construction.

It SHALL NOT return a Prisma model.

---

# 5. Customer Identity Rule

The MVP Customer lookup identity SHALL be based on normalized email.

Email SHALL become an authoritative unique Customer identity key.

The persistence model SHALL therefore enforce uniqueness at the database level.

The implementation SHALL:

- normalize email consistently before lookup/create;
- use the same normalized representation for persistence;
- perform lookup against the normalized unique value;
- never rely solely on application-level lookup-before-create.

Do not use email as a Reservation `customerId`.

Do not introduce multiple competing Customer identity keys.

Do not implement authentication.

---

# 6. Customer Schema

Update the Prisma Customer model as required to enforce the approved identity rule.

The existing canonical Customer UUID `id` SHALL remain the primary identity.

The existing Customer model fields SHALL be preserved unless a minimal change is required by this specification.

The email field SHALL have a database-enforced unique constraint.

Do not remove or repurpose existing Customer fields unrelated to this capability.

---

# 7. Customer Type

Customer creation requires `customerTypeId`.

Define and use the approved Customer Type representing an anonymous MVP booking customer.

The implementation SHALL NOT:

- invent a Customer Type ID;
- use a random/default UUID;
- overload an unrelated Customer Type;
- make `customerTypeId` optional.

The authoritative Customer Type SHALL be represented through the existing CustomerType model/persistence structure.

Where the repository currently has no suitable seeded Customer Type, provide the minimum authoritative seed/data mechanism required to guarantee its availability in supported environments.

The chosen Customer Type and its semantic meaning SHALL be documented in the implementation report.

---

# 8. Customer Persistence Boundary

Create the smallest reusable Customer persistence boundary required for:

- lookup by normalized unique email;
- Customer creation;
- returning authoritative Customer identity.

Prefer an application/domain repository interface with a Prisma infrastructure implementation, consistent with existing architecture.

The application layer SHALL NOT access Prisma directly.

The persistence implementation SHALL preserve the existing Customer primary key and relationships.

---

# 9. Resolve-or-Create Behaviour

The service SHALL perform:

1. validate/receive already validated customer input;
2. normalize email;
3. look up Customer by normalized email;
4. return existing `Customer.id` when found;
5. otherwise create a Customer using the authoritative anonymous MVP Customer Type;
6. return the newly created `Customer.id`.

Existing Customer records SHALL NOT be duplicated merely because the customer is making another reservation.

The Customer record SHALL represent customer identity, while each Reservation retains its own immutable booking snapshots.

---

# 10. Concurrent Creation

Lookup-before-create alone is insufficient.

Database uniqueness SHALL be the final concurrency authority.

The implementation SHALL safely handle two concurrent requests attempting to resolve/create the same normalized email.

Acceptable behaviour is:

- one request creates the Customer;
- the competing request detects the unique conflict and resolves the now-existing Customer;
- both operations return the same authoritative `Customer.id`.

The implementation SHALL NOT:

- create duplicate Customers;
- return an arbitrary Customer;
- use email as the Customer ID;
- suppress a unique conflict without resolving the Customer.

Use the smallest transaction/error-handling mechanism consistent with the existing persistence architecture.

Do not introduce distributed locking or a generic concurrency framework.

---

# 11. Customer Data Ownership

The implementation SHALL distinguish:

### Customer

Durable customer identity and contact information required by the Customer model.

### Reservation / Guest Snapshot

Booking-specific historical information captured for that Reservation.

The Reservation SHALL continue to preserve immutable booking information even if the Customer record changes later.

The Customer Resolution capability SHALL NOT mutate historical Reservation snapshots.

---

# 12. Guest Information Integration Boundary

IMP-007 already provides validated customer/contact information.

Customer Resolution SHALL be invoked only after Guest Information validation.

The intended boundary is:

`Guest Information → Customer Resolution → ReservationService`

The Customer Resolution service SHALL NOT duplicate Guest Information validation.

It MAY perform the minimum identity normalization required for its persistence contract.

---

# 13. Reservation Integration

The resulting `customerId` SHALL be supplied to the existing canonical Reservation construction/application path.

The implementation SHALL use the existing:

- Reservation Aggregate;
- ReservationBuilder;
- ReservationService;
- `ReservationRepository`.

SPEC-030 SHALL remain authoritative for Reservation persistence.

No Reservation persistence redesign is permitted.

No change to the Reservation ownership relationship is permitted.

---

# 14. Transaction and Failure Behaviour

Customer creation SHALL be handled safely when the subsequent Reservation operation fails.

The implementation SHALL follow the existing application/persistence transaction boundaries.

Do not introduce unnecessary distributed transactions.

If Customer creation and Reservation persistence cannot safely share the same transaction boundary, the implementation report SHALL explicitly document the resulting behaviour.

Customer Resolution SHALL never return a Customer ID that does not exist.

---

# 15. Validation

The Customer Resolution boundary SHALL reject invalid input according to the existing Customer/application validation conventions.

At minimum:

- email SHALL be present;
- email SHALL be normalized;
- first name SHALL be present where required by Customer creation;
- last name SHALL be present where required by Customer creation;
- optional phone SHALL remain optional.

Do not duplicate the complete Guest Information validation model.

---

# 16. Tests

Focused tests SHALL cover:

## 16.1 Lookup

- existing Customer is found by normalized email;
- existing Customer ID is returned;
- a second booking does not create a duplicate Customer.

## 16.2 Creation

- new Customer is created when no matching email exists;
- authoritative Customer Type is assigned;
- generated Customer UUID is returned;
- required Customer fields are populated.

## 16.3 Normalization

- email lookup is performed using normalized email;
- equivalent email representations resolve consistently according to the chosen normalization rule.

## 16.4 Uniqueness

- database uniqueness is enforced;
- duplicate creation cannot result in two Customers for the same normalized email.

## 16.5 Concurrent Resolution

Test the application behaviour when two resolution attempts target the same previously unknown email.

Verify that both ultimately resolve to one authoritative Customer identity.

The test MAY use a controlled repository/database test rather than a real production-concurrency environment.

## 16.6 Failure

Verify:

- invalid input;
- missing Customer Type;
- persistence failure;
- unique-conflict recovery;
- unresolved Customer cannot produce a Reservation customer ID.

## 16.7 Reservation Integration

Verify that the resolved `customerId` can be passed into the existing Reservation construction path.

Verify that Reservation guest/contact snapshots remain independent of the Customer record.

---

# 17. Migration

A Prisma migration SHALL be created for any required Customer schema change.

The migration SHALL:

- add the required unique email constraint safely;
- preserve existing Customer records;
- fail safely if existing duplicate emails prevent the constraint from being applied.

Do NOT silently delete, merge, or arbitrarily select between duplicate existing Customers.

If existing data contains duplicate email values and the migration cannot safely establish uniqueness, implementation SHALL stop and report the exact data conflict rather than invent a merge policy.

The migration SHALL NOT be applied automatically as part of implementation unless the established development process explicitly requires it.

---

# 18. Existing Data

Before applying the uniqueness migration, inspect existing Customer data for duplicate email values.

If duplicates exist:

1. report the count and nature of the conflict;
2. do not delete records;
3. do not merge Customers;
4. do not arbitrarily designate a winner;
5. stop at the migration/data-reconciliation boundary.

A separate approved data-reconciliation decision SHALL be required.

If no conflicting records exist, the migration may safely establish the unique constraint.

---

# 19. Scope

Included:

- Customer application contract;
- Customer lookup/create service;
- Customer repository boundary;
- normalized email identity;
- unique email persistence constraint;
- anonymous MVP Customer Type;
- concurrency-safe resolve/create behaviour;
- focused tests;
- required Prisma migration;
- integration point before canonical Reservation creation.

Excluded:

- authentication;
- login;
- registration UI;
- password management;
- account management;
- customer profiles;
- CRM;
- marketing preferences;
- communications;
- AI;
- payment changes;
- supplier changes;
- Reservation architecture redesign;
- generic identity-management framework;
- unrelated Customer refactoring;
- unrelated lint remediation.

---

# 20. Lint Baseline

Maintain the established baseline:

**0 errors, 10 pre-existing warnings.**

This implementation SHALL introduce:

**0 new warnings.**

Do not weaken lint rules or suppress warnings.

---

# 21. Decision-Gap Rule

The architectural direction is already decided:

**Option 2 — Customer lookup/creation boundary.**

Do not reconsider authenticated-only or guest-customer ownership models.

Implementation SHALL stop only if a genuine contradiction is discovered concerning:

- Customer identity;
- Customer Type;
- existing Customer data;
- database uniqueness;
- Reservation ownership;
- transaction/concurrency safety.

If such a contradiction exists, report:

1. affected boundary;
2. current implementation/data;
3. governing requirement;
4. exact contradiction;
5. minimum decision required.

Do not invent a workaround.

---

# 22. Verification

Run focused Customer Resolution tests first.

Then run:

`npm run type-check`

`npm test -- --runInBand`

`npx prisma generate`

`npx prisma validate`

`npm run build`

`npm run lint`

Full regression SHALL be run unless an environmental failure prevents it.

Report exact suite/test counts and results.

No commit or push SHALL be performed by Copilot.

---

# 23. Implementation Report

The report SHALL contain:

## Status

`IMPLEMENTED`, `PARTIAL`, or `BLOCKED`.

## Customer Identity

State the authoritative identity rule and normalization behaviour.

## Customer Type

Identify the anonymous MVP Customer Type and how its availability is guaranteed.

## Application Boundary

Identify the Customer Resolution service and contract.

## Persistence

Identify the Customer repository and Prisma implementation.

## Concurrency

Explain how duplicate/concurrent Customer creation is handled.

## Reservation Integration

Explain how the resulting Customer ID reaches canonical Reservation construction.

## Data Ownership

Confirm that Customer identity and Reservation guest snapshots remain separate.

## Migration

Report the Customer schema migration and any existing-data considerations.

## Tests

Report focused tests and full regression counts.

## Verification

Report:

- type-check;
- tests;
- Prisma generate;
- Prisma validate;
- build;
- lint.

## Lint

Report final warning count and whether any new warnings were introduced.

## Decision Gaps

State:

`No unresolved decision gap.`

or provide the exact contradiction.

## Scope

Confirm:

- no authentication;
- no payment changes;
- no supplier changes;
- no AI;
- no workflow framework;
- no unrelated refactoring;
- no commit;
- no push.

---

# 24. Acceptance Criteria

The capability SHALL be accepted when:

- [ ] anonymous MVP customer information can be resolved to an authoritative Customer ID;
- [ ] normalized email is the approved unique lookup identity;
- [ ] database uniqueness is enforced;
- [ ] existing Customers are reused;
- [ ] new Customers receive the authoritative anonymous Customer Type;
- [ ] no Customer IDs are invented or derived from email;
- [ ] concurrent creation cannot produce duplicate Customers;
- [ ] unique-conflict recovery resolves the existing Customer;
- [ ] Customer persistence is behind an application/repository boundary;
- [ ] Prisma is not accessed directly from application/frontend code;
- [ ] validated IMP-007 information can invoke Customer Resolution;
- [ ] resolved `customerId` can be supplied to canonical Reservation construction;
- [ ] Reservation guest/contact snapshots remain independently preserved;
- [ ] existing Customer records are preserved;
- [ ] no unsafe duplicate-data migration is performed;
- [ ] focused tests pass;
- [ ] full regression passes;
- [ ] type-check passes;
- [ ] Prisma generate passes;
- [ ] Prisma validation passes;
- [ ] build passes;
- [ ] lint passes with 0 errors and no new warnings.

---

# 25. Traceability

| Authority | Purpose |
|---|---|
| GOV-DEV-001 | Governing development process |
| ARCH-000 | Architectural authority |
| SPEC-030 | Canonical Reservation ownership and persistence |
| IMP-007 | Validated Guest Information source |
| IMP-011 | Customer Journey Integration dependency |

---

# 26. Downstream Integration

After acceptance, IMP-011 SHALL use:

`Validated Guest Information`
→ `Customer Resolution`
→ `Customer.id`
→ `Canonical Reservation`
→ `Payment`
→ `Confirmation`

Customer Resolution SHALL remain an independent reusable application capability.

IMP-011 SHALL NOT duplicate Customer lookup/create logic.

---

# 27. Scope Discipline

This specification establishes only the minimum Customer identity capability required for anonymous MVP reservations.

It SHALL NOT become a general customer-management implementation.

No authentication or account-management functionality is required for MVP.

No AI capability is introduced.

No payment or supplier architecture is changed.

No unrelated technical debt is addressed.

---

# End of Specification

**Document:** APP-XXX — Customer Resolution for Anonymous Bookings

**Version:** 1.0

**Status:** Approved for Implementation

**Governing Process:** GOV-DEV-001-DEVELOPMENT-PROCESS.md

**Next Stage:** Copilot Implementation