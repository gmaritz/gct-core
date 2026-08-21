# GCT CORE — LINT REMEDIATION BATCH C
## Traveller Preference Contract

### 1. Purpose

Replace the seven remaining `@typescript-eslint/no-explicit-any` usages associated with Traveller preferences by establishing one canonical, supplier-neutral `TravellerPreferences` contract.

The contract must be shared consistently across:

- Traveller aggregate;
- Traveller domain event;
- Traveller application DTO.

This is a focused domain/application typing correction.

It is NOT a redesign of Traveller.

---

## 2. Governance

Follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

This is the single source of truth for the GCT Core development workflow.

Workflow:

Specification
→ Implementation
→ Verification
→ ChatGPT Acceptance
→ User Commit

Do not create a commit.

Future specifications must remain within the GOV-DEV-001 approximately 700-line limit.

---

## 3. Current Baseline

Accepted lint state:

- Errors: 0
- Warnings: 24
- All remaining warnings: `@typescript-eslint/no-explicit-any`
- Jest: 84 suites / 684 tests passed
- Build: passed
- Prisma validation: passed

Batch C addresses exactly seven warnings.

Expected target:

**24 → 17 warnings**

---

## 4. Current Warning Scope

The seven warnings identified by the read-only assessment are:

### `traveller.dto.ts`

One warning involving the Traveller preferences field.

### `traveller.aggregate.ts`

Five warnings involving:

- aggregate preference state;
- constructor preferences;
- restore input;
- preference getter;
- preference update input.

### `traveller.event.ts`

One warning involving the domain-event preference payload.

These warnings represent one conceptual contract and MUST be resolved using one canonical preference type rather than independent local replacements.

---

## 5. Canonical Contract

Introduce a named:

`TravellerPreferences`

type.

The type represents Traveller preference data within the GCT Core domain.

The same canonical type MUST be used across:

- Traveller aggregate state;
- Traveller aggregate constructor;
- Traveller aggregate restore path;
- Traveller aggregate preference getter;
- Traveller aggregate preference update;
- Traveller domain event preference payload;
- Traveller application DTO preferences.

Do not create separate structurally similar preference types for each layer.

---

## 6. Determine the Existing Preference Shape First

Before implementing the type:

1. Inspect the current Traveller aggregate.
2. Inspect the Traveller DTO.
3. Inspect the Traveller domain event.
4. Inspect all existing Traveller preference consumers.
5. Inspect existing tests.
6. Inspect business/domain documentation for Traveller preferences.
7. Search the repository for existing preference fields or related named types.

Preserve the existing runtime representation and supported fields.

Do not invent new business preferences.

Do not remove existing preference fields.

Do not add new preference functionality.

If the existing repository does not define a formal preference schema, derive the narrowest contract from the existing implementation and tests.

---

## 7. Contract Location

Place `TravellerPreferences` in the appropriate existing domain/shared type location according to repository conventions.

The contract is a domain concept.

The preferred dependency direction is:

Domain/shared canonical type
→ Traveller aggregate
→ Domain event
→ Application DTO

Do not define the canonical domain type inside the application DTO.

Do not make the domain depend on an application-layer type.

Do not duplicate the type across layers.

---

## 8. Type Design

The replacement must preserve the existing semantics.

If the current preference object is genuinely an open-ended property bag and the repository provides no authoritative fixed property set, use the narrowest appropriate representation consistent with the existing model.

A possible representation is:

`Record<string, unknown>`

but do NOT automatically use this if the existing domain semantics establish a more specific preference structure.

The goal is not merely to replace:

`any`

with:

`Record<string, unknown>`

The goal is to establish a meaningful canonical `TravellerPreferences` contract.

If a named interface/type with explicit properties is supported by existing code and documentation, prefer that.

If preferences are intentionally extensible, preserve that extensibility explicitly.

---

## 9. Aggregate Integration

Update the Traveller aggregate so the canonical `TravellerPreferences` type is used for:

- internal preference state;
- constructor input;
- restoration input;
- preference getter;
- preference update method.

Preserve:

- constructor behaviour;
- validation;
- event generation;
- preference mutation semantics;
- restore semantics;
- getter semantics.

Do not change aggregate lifecycle behaviour.

Do not introduce new validation unless existing code already implies it.

Do not change event behaviour.

---

## 10. Domain Event Integration

Update the Traveller domain event preference payload to use:

`TravellerPreferences`

Preserve:

- event name;
- event structure;
- event payload fields;
- event construction;
- event semantics.

Do not redesign the event.

Do not change event versioning.

Do not introduce serialization changes unless required solely by the new explicit type.

---

## 11. Application DTO Integration

Update the Traveller application DTO to use the same:

`TravellerPreferences`

type.

Preserve:

- DTO shape;
- property name;
- optionality;
- existing caller behaviour.

Do not introduce application-specific preference semantics.

Do not create a second DTO-only preference type.

---

## 12. Immutability and Aliasing

Inspect how preference objects are currently stored and returned.

Do not introduce behavioural changes merely for typing.

If the existing implementation already treats preferences as immutable, preserve that behaviour.

If the existing implementation exposes the same object reference, do not silently introduce cloning or freezing in this batch.

Immutability changes are outside scope.

---

## 13. Serialization

Do not redesign preference serialization.

The resulting `TravellerPreferences` type must remain compatible with the existing domain-event and DTO representations.

Do not introduce custom serialization.

Do not add JSON transformation logic.

---

## 14. Persistence Boundary

Do not modify Prisma or Traveller persistence in Batch C.

The read-only assessment identified separate Traveller persistence `any` warnings.

Those belong to the later persistence remediation batch.

If the new `TravellerPreferences` type exposes a persistence mismatch:

STOP.

Do not solve the persistence issue here.

Report it as a dependency for the later persistence batch.

---

## 15. API Boundary

Do not modify Traveller presenters in Batch C.

Traveller API response typing was completed in Batch B.

If the new preference type causes a presenter compilation issue, preserve the existing presenter contract and report the issue rather than expanding scope.

---

## 16. Behavioural Compatibility

The implementation MUST preserve:

- existing Traveller creation;
- existing Traveller restoration;
- existing Traveller preference updates;
- existing Traveller preference retrieval;
- existing Traveller domain events;
- existing DTO behaviour;
- existing tests.

No business behaviour should change.

---

## 17. No Type Loopholes

Do NOT use:

- `any`;
- `unknown` merely to suppress the lint warning;
- `eslint-disable`;
- `eslint-disable-next-line`;
- broad casts;
- unsafe double casts;
- `as any`;
- lint configuration changes.

Do not weaken the lint rule.

---

## 18. Tests

Inspect existing Traveller tests and update only those tests that require type corrections because of the new canonical preference type.

Do not redesign test scenarios.

Add tests only if necessary to demonstrate that the existing preference behaviour remains intact.

At minimum verify:

- Traveller creation with preferences;
- Traveller preference retrieval;
- Traveller preference update;
- Traveller restoration;
- Traveller preference domain event;
- DTO compatibility.

Do not create unrelated tests.

---

## 19. Out of Scope

Do NOT address:

- remaining `no-explicit-any` warnings outside Traveller preferences;
- ValueObject typing;
- Prisma service typing;
- Journey persistence typing;
- Reservation persistence typing;
- Traveller repository typing;
- API presenter typing;
- test-only warnings;
- `no-console`;
- any other lint rule.

Do not redesign Traveller.

Do not redesign the domain event model.

Do not modify Prisma.

Do not modify API contracts.

---

## 20. Architectural Safety

If the existing Traveller preference representation is ambiguous enough that a canonical contract cannot be established without inventing business semantics:

STOP.

Do not guess.

Report:

- the ambiguity;
- the affected files;
- the existing representations;
- the documentation evidence;
- the decision required.

Do not proceed to unrelated lint remediation.

---

## 21. Verification

After implementation run:

### Lint

`npm run lint`

Report:

- final warning count;
- warning reduction;
- remaining `no-explicit-any`.

Expected target:

**17 warnings**

### Focused Traveller Tests

Run the relevant Traveller/domain/application tests.

Report exact results.

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

### Prisma

Run:

`npx prisma validate`

### TypeScript

Perform the final language-service/TypeScript check on all changed files.

---

## 22. Warning Accounting

Starting baseline:

**24 warnings**

Expected Batch C reduction:

**7 warnings**

Expected remaining:

**17 warnings**

All remaining warnings should remain:

`@typescript-eslint/no-explicit-any`

If the result differs, explain precisely why.

---

## 23. Scope Audit

Before completion confirm:

- Traveller preference type added/updated only where required;
- Traveller aggregate changes limited to preference typing;
- Traveller event changes limited to preference typing;
- Traveller DTO changes limited to preference typing;
- no persistence changes;
- no API presenter changes;
- no provider changes;
- no Prisma changes;
- no lint configuration changes;
- no unrelated lint remediation.

---

## 24. Final Report

Return:

### Implementation Status

- completed / partially completed / blocked

### Canonical Type

State:

- name;
- location;
- representation;
- why it matches the existing Traveller preference semantics.

### Files Changed

List every changed file.

### Warning Reduction

- baseline: 24
- final:
- warnings removed:
- remaining `no-explicit-any`:
- other warnings:

### Verification

- focused Traveller tests:
- full Jest regression:
- build:
- Prisma validation:
- lint:
- TypeScript/language-service:

### Scope Audit

Confirm:

- domain behaviour changed: NO
- event semantics changed: NO
- DTO behaviour changed: NO
- persistence changed: NO
- API response shape changed: NO
- Prisma changed: NO
- ESLint configuration changed: NO
- suppressions added: NO
- Hotelbeds calls: 0
- PayFast calls: 0
- commit created: NO

### Exceptions

List any unresolved Traveller preference typing issue and explain why it could not safely be resolved.

---

## 25. Completion Rule

Batch C is complete only when:

- all seven Traveller preference `any` warnings are resolved safely; OR
- a genuine domain-contract ambiguity prevents safe implementation and is reported.

Do not proceed to Batch D.

Do not address the remaining 17 warnings.

Do not create a commit.

Follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

throughout implementation and verification.