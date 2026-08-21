# GCT CORE — PERSISTENCE RECONCILIATION BATCH 2B
## Traveller Creation → Customer Association Contract

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B2B-TRAVELLER-CUSTOMER |
| Title | Traveller Creation → Customer Association Contract |
| Project | GCT Core |
| Type | Focused Application/Persistence Contract Specification |
| Status | Implementation Ready |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Scope | Customer association during Traveller creation |
| Dependency | PERSISTENCE-B2A-TRAVELLER-MODEL |
| Current Lint Warnings | 14 |
| Immediate Objective | Supply the Customer relationship required by Traveller persistence |

---

## 2. Purpose

Establish how Customer identity enters the Traveller creation and persistence flow.

The previous Traveller persistence-model implementation was correctly blocked because:

- Prisma Traveller requires `customerId`;
- Customer owns email;
- CreateTravellerCommand does not contain Customer identity;
- CreateTravellerService creates Traveller without Customer context;
- ITravellerRepository.save() accepts only Traveller;
- Traveller does not contain Customer identity.

This specification resolves that application/persistence boundary.

It does not implement the Traveller persistence model itself.

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

## 4. Architectural Principle

Customer and Traveller remain distinct business concepts.

Customer represents the customer relationship.

Traveller represents the person participating in the travel experience.

The physical persistence relationship between Customer and Traveller MUST NOT automatically force Customer persistence identity into the Traveller domain aggregate.

The application layer is responsible for supplying the required Customer context to the persistence operation.

---

## 5. Required Decision

The canonical creation flow MUST support:

Create Traveller
+
Customer context
→
Traveller persistence with required customerId

Customer identity MUST therefore enter the application workflow before Traveller persistence.

The implementation MUST NOT invent a Customer association.

---

## 6. Customer Context Source

The application creation flow MUST accept an explicit Customer identity.

The preferred contract is to extend the existing `CreateTravellerCommand` with the canonical Customer identifier already used by the GCT Core Customer persistence model.

The command therefore becomes conceptually:

- customerId;
- firstName;
- lastName;
- email.

The exact identifier type MUST match the existing Customer domain/application contract.

Do not create a new Customer identifier type solely for this specification.

---

## 7. Why Customer Identity Belongs in the Command

Traveller creation is not persistence-independent once the physical model requires a Customer relationship.

The application command represents the caller's intent to create a Traveller.

If the Traveller must belong to a Customer, that association is part of the creation context.

Therefore Customer identity MUST be supplied explicitly rather than inferred from:

- email;
- name;
- an arbitrary database lookup;
- an implicit current user;
- a generated Customer.

---

## 8. Email Is Not the Customer Identifier

Email MUST NOT be used as a substitute for Customer identity.

The application MUST NOT:

- derive customerId from email without an explicit Customer resolution contract;
- assume email uniquely identifies a Customer;
- create a Customer when email is unknown;
- use email as a foreign key.

Customer identity remains authoritative.

Email remains Customer-owned at the persistence layer.

---

## 9. CreateTravellerCommand

Update the application command to carry the required Customer identity.

The command MUST:

- require customerId;
- retain firstName;
- retain lastName;
- retain email;
- preserve existing validation behaviour.

Do not remove existing command fields.

Do not introduce unrelated Traveller properties.

---

## 10. CreateTravellerService

The service MUST receive the Customer identity from the command.

The service MUST validate that the Customer context is present before attempting Traveller persistence.

The service MUST NOT:

- invent a Customer;
- create a Customer implicitly;
- query Customer by email as a hidden side effect;
- use a dummy Customer ID;
- bypass the required relationship.

---

## 11. Traveller Domain Aggregate

Do not add `customerId` to the Traveller aggregate solely to satisfy Prisma persistence.

The Customer relationship remains an application/persistence concern unless the existing approved domain model explicitly establishes it as part of the Traveller domain identity.

The service therefore retains Customer context separately from the domain Traveller object.

Conceptually:

Application command
→ Customer context + Traveller data
→ Traveller domain object
→ persistence operation with Customer context

---

## 12. Repository Contract Decision

The current:

`ITravellerRepository.save(Traveller)`

contract does not contain Customer context.

The persistence operation nevertheless requires `customerId`.

The repository contract MUST therefore be extended in the smallest possible way to carry the required Customer association.

Preferred contract:

`save(traveller, context)`

where the context contains the canonical Customer identity.

The context MUST be a small application/persistence-neutral value type.

Do not expose Prisma types.

---

## 13. Persistence Context Type

If a dedicated context type is required, define a small domain/application-neutral contract containing only:

- customerId.

Do not add:

- email;
- Customer name;
- Prisma objects;
- database records;
- unrelated Traveller fields.

The context exists solely because the persistence model requires the Customer relationship while the Traveller domain does not own that identity.

---

## 14. Repository Responsibility

`TravellerPrismaRepository.save()` MUST:

1. receive the Traveller;
2. receive the explicit Customer context;
3. persist the required Customer relationship;
4. persist Traveller data;
5. preserve existing repository behaviour.

The repository MUST NOT discover the Customer by email.

The repository MUST NOT create a Customer.

The repository MUST NOT silently substitute another Customer.

---

## 15. Existing Traveller Lookup

Existing Traveller lookup methods must retain their current contract unless the Customer association requires a minimal signature adjustment.

In particular:

`findByEmail()`

continues to resolve email through the authoritative Customer relationship established by PERSISTENCE-B2A.

Do not redesign Traveller lookup as part of this specification.

---

## 16. Customer Existence

The required Customer must exist before Traveller persistence.

The Traveller creation flow MUST NOT implicitly create Customer records.

If the supplied Customer identity does not exist, the operation MUST fail using the existing application error-handling convention.

Do not create a new Customer creation workflow.

---

## 17. Customer Ownership

This specification does not transfer ownership of Traveller to Customer at the domain level.

It establishes only the required persistence association:

Customer
→ Traveller

The existing business distinction remains intact.

---

## 18. Existing CreateTraveller Behaviour

Preserve existing Traveller creation behaviour:

- first name;
- last name;
- email;
- Traveller validation;
- Traveller identity generation;
- Traveller domain events;
- repository lifecycle.

Only the Customer association is added to the creation context.

---

## 19. Email Validation

Existing email validation MUST remain unchanged.

Do not add Customer lookup behaviour to email validation.

Do not alter EmailAddress semantics.

Do not introduce additional normalization rules.

---

## 20. Customer Validation

The application layer MUST validate that customerId is supplied.

Where the existing application architecture has a Customer repository/service available, it may validate Customer existence through that established boundary.

Do not create a new Customer repository solely for this specification.

If no existing Customer validation boundary exists, the repository may rely on the database foreign-key constraint and translate the failure using the existing persistence error convention.

Do not silently ignore foreign-key failure.

---

## 21. Persistence Error Handling

A missing Customer association MUST NOT result in:

- null customerId;
- empty customerId;
- arbitrary fallback;
- dummy Customer.

The existing application/persistence error convention MUST be preserved.

Do not introduce a new global exception hierarchy.

---

## 22. Traveller Repository Interface

The updated `ITravellerRepository` MUST remain domain/application oriented.

It MUST NOT accept:

- Prisma types;
- Prisma models;
- database-specific JSON;
- raw database rows.

The Customer context must be represented using the canonical application/domain identifier type.

---

## 23. Existing Repository Consumers

Search all consumers of:

`ITravellerRepository.save()`

Update only the callers that must now supply Customer context.

Every Traveller creation path MUST supply the Customer identity.

Do not modify unrelated repository consumers.

---

## 24. Tests

Focused tests MUST cover:

### Command

- customerId is required;
- existing Traveller fields remain valid.

### Service

- valid Customer context creates Traveller;
- missing Customer context is rejected;
- existing Traveller validation remains intact.

### Repository

- customerId is passed to persistence;
- Customer relationship is preserved;
- no Customer is implicitly created.

### Error Handling

- invalid/missing Customer is handled using the existing error convention.

### Existing Behaviour

- Traveller creation still produces the same domain result;
- existing events remain correct.

---

## 25. No Customer Creation

This specification MUST NOT implement Customer creation.

If the business flow eventually requires:

Customer creation
→ Traveller creation

that is a separate capability and must be specified independently.

For this iteration, Customer is an existing required context.

---

## 26. No Customer Redesign

Do not modify:

- Customer aggregate;
- Customer domain events;
- Customer Prisma model;
- Customer repository;
- Customer API;
- Customer lifecycle.

Only consume the existing Customer identity contract.

---

## 27. No Traveller Persistence Implementation

Do not implement:

- Traveller Prisma preferences field;
- Traveller mapper typing;
- Traveller JSON conversion;
- Traveller email persistence mapping;
- remaining Traveller lint warnings.

Those are downstream of this contract.

This specification only ensures that the required Customer context exists.

---

## 28. No Reservation or Journey Changes

Do not modify:

- Reservation;
- Journey;
- Reservation persistence;
- Journey persistence;
- PrismaService;
- repository ownership.

These remain subsequent controlled iterations.

---

## 29. API Boundary

Do not expose Prisma Customer types through the API.

If CreateTravellerCommand is already an application-facing contract, customerId may be represented using the established application identifier type.

Do not redesign API presenters.

Do not introduce frontend changes.

---

## 30. Security Boundary

Customer identity supplied to Traveller creation must be treated as an explicit business/application input.

Do not infer Customer identity from untrusted Traveller email.

Any existing authorization/ownership mechanism must remain responsible for determining whether the caller may create a Traveller for the supplied Customer.

Do not introduce a new authorization framework in this iteration.

---

## 31. Persistence Sequence

The resulting creation flow MUST be:

1. Receive CreateTravellerCommand.
2. Validate required Customer identity.
3. Validate existing Traveller fields.
4. Create the Traveller domain object.
5. Pass Traveller and Customer context to the repository.
6. Persist the Traveller with the required Customer relationship.
7. Return the existing Traveller application result.

No implicit Customer creation is permitted.

---

## 32. Acceptance Criteria

### AC-01 — Explicit Customer Context

CreateTravellerCommand requires customerId.

### AC-02 — Existing Fields

firstName, lastName and email remain supported.

### AC-03 — Domain Isolation

Traveller does not acquire customerId solely because Prisma requires it.

### AC-04 — Service Propagation

CreateTravellerService passes Customer context to persistence.

### AC-05 — Repository Contract

ITravellerRepository can receive the required Customer context without Prisma dependencies.

### AC-06 — Persistence Association

Traveller persistence receives the explicit customerId.

### AC-07 — No Inference

Customer identity is not inferred from email.

### AC-08 — No Implicit Creation

Traveller creation never creates a Customer implicitly.

### AC-09 — Existing Behaviour

Existing Traveller creation behaviour remains unchanged apart from the explicit Customer association.

### AC-10 — Error Handling

Missing/invalid Customer context fails through the established error mechanism.

### AC-11 — Tests

Focused Traveller creation/persistence tests pass.

### AC-12 — Regression

Full Jest regression passes.

### AC-13 — Build

Build passes.

### AC-14 — Prisma

Prisma validation passes.

### AC-15 — Scope

No Reservation, Journey or PrismaService changes are introduced.

---

## 33. Lint Relationship

This specification does not directly target lint warnings.

Its purpose is to unblock PERSISTENCE-B2A.

After implementation, the Traveller persistence-model implementation may proceed and should then target the original three Traveller persistence warnings.

The expected overall warning target remains:

14 → 11

No unrelated warnings may be remediated.

---

## 34. Verification Requirements

### Focused Tests

Run all tests covering:

- CreateTravellerCommand;
- CreateTravellerService;
- Traveller repository;
- Traveller persistence boundary.

Report exact suite and test counts.

### Full Regression

Run:

npm test -- --runInBand

Report exact:

- suites;
- tests;
- failures;
- skipped;
- exit status.

### Build

Run:

npm run build

### Prisma

Run:

npx prisma validate

Do not run migrations or modify the database.

### Lint

Run:

npm run lint

Report:

- errors;
- warnings;
- baseline;
- final.

The warning count is not expected to change solely from this contract.

---

## 35. Scope Audit

Before completion confirm:

- CreateTravellerCommand modified only for Customer context;
- CreateTravellerService modified only for Customer propagation;
- ITravellerRepository modified only as required for Customer context;
- relevant Traveller creation callers updated;
- no Customer schema changes;
- no Customer creation workflow;
- no Traveller Prisma schema changes;
- no Traveller mapper changes;
- no Reservation changes;
- no Journey changes;
- no PrismaService changes;
- no repository ownership changes;
- no lint configuration changes;
- no suppressions;
- no database changes;
- no Hotelbeds calls;
- no PayFast calls;
- no commit created.

---

## 36. Final Copilot Report

Return:

### Implementation Status

- completed / partially completed / blocked

### Customer Association Decision

State:

- where customerId enters the flow;
- whether it is part of CreateTravellerCommand;
- how it reaches persistence;
- whether Traveller domain changed;
- how Customer existence is handled.

### Contract Changes

List:

- command changes;
- service changes;
- repository contract changes;
- caller changes.

### Files Changed

List every changed source/test file.

### Verification

Report:

- focused tests;
- full Jest regression;
- build;
- Prisma validation;
- lint;
- TypeScript/language-service.

### Warning State

Report:

- baseline;
- final;
- warnings removed;
- remaining no-explicit-any.

### Scope Audit

Confirm:

- Customer schema modified: NO;
- Customer domain modified: NO;
- Traveller Prisma schema modified: NO;
- Traveller mapper modified: NO;
- Reservation modified: NO;
- Journey modified: NO;
- PrismaService modified: NO;
- repository ownership modified: NO;
- database modified: NO;
- ESLint configuration modified: NO;
- suppressions added: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- commit created: NO.

### Exceptions

List any issue requiring another architectural decision.

---

## 37. Completion Boundary

This iteration ends once the Customer association contract is implemented and verified.

Do not proceed to:

- Traveller persistence model implementation;
- Traveller lint remediation;
- Reservation persistence;
- Journey persistence;
- PrismaService.

If the implementation reveals that Customer identity cannot be supplied without redesigning an existing Customer or Traveller business contract, STOP and report:

BLOCKED — CUSTOMER/TRAVELLER DOMAIN CONTRACT DECISION REQUIRED

Do not make that decision implicitly.

After the Copilot implementation report, the result will be reviewed for architect acceptance.

The user performs the commit after acceptance.