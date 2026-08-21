# GCT CORE — LINT REMEDIATION BATCH D
## Generic ValueObject Typing

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | LINT-BATCH-D |
| Title | Generic ValueObject Typing |
| Project | GCT Core |
| Type | Implementation Specification |
| Status | Implementation Ready |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Scope | Shared Domain ValueObject typing |
| Lint Rule | @typescript-eslint/no-explicit-any |
| Current Warning Baseline | 17 |
| Target Reduction | 3 |
| Expected Remaining Warnings | 14 |

---

## 2. Purpose

Remediate the three remaining `@typescript-eslint/no-explicit-any` warnings in the shared `ValueObject` base abstraction.

Establish a type-safe generic `ValueObject<TProps>` contract while preserving the existing behaviour and semantics of all concrete value objects.

This is a focused shared-domain typing correction.

It is not a redesign of the value-object architecture.

---

## 3. Governing Process

Follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

The governing workflow is:

Specification
→ Implementation
→ Focused Tests + Regression
→ Copilot Report
→ Architect Acceptance
→ User Commit

The user performs the commit.

Do not create a commit during this iteration.

The implementation specification must remain lean and implementation-focused.

---

## 4. Current Baseline

The previously accepted lint remediation state is:

- lint errors: 0
- lint warnings: 17
- all remaining warnings: `@typescript-eslint/no-explicit-any`
- Jest: 84 suites / 684 tests passed
- build: passed
- Prisma validation: passed

The three warnings addressed by this iteration are all associated with the shared `ValueObject` base abstraction.

Expected result:

- baseline: 17 warnings
- targeted reduction: 3 warnings
- expected final total: 14 warnings

No other lint warnings are to be addressed.

---

## 5. Scope

### 5.1 In Scope

This iteration includes:

1. Generic typing of the shared `ValueObject` base abstraction.
2. Replacement of the three targeted `any` usages in that abstraction.
3. Updating concrete value objects only where required to supply the generic property type.
4. Preserving existing value-object behaviour.
5. Updating affected tests only where required by the type change.
6. Verification through focused tests and full regression.

### 5.2 Out of Scope

Do not address:

- Journey persistence warnings;
- Reservation persistence warnings;
- Traveller persistence warnings;
- Prisma service warnings;
- API warnings;
- provider warnings;
- remaining `no-explicit-any` warnings;
- any other lint rule;
- Prisma schema;
- database state;
- API contracts;
- application services;
- provider integrations;
- Hotelbeds;
- PayFast;
- unrelated refactoring.

Do not modify the remaining 14 warnings.

---

## 6. Existing ValueObject Boundary

The shared `ValueObject` abstraction is a domain-level construct.

It must remain independent of:

- application layer;
- API layer;
- infrastructure;
- persistence;
- Prisma;
- Hotelbeds;
- PayFast.

The dependency direction must remain:

Domain ValueObject
→ Concrete Domain ValueObject

No infrastructure or application dependency may be introduced into the base abstraction.

---

## 7. Required Generic Contract

Convert the shared base abstraction from untyped property storage to a generic property type.

The intended contract is conceptually:

`ValueObject<TProps>`

where `TProps` represents the concrete property structure of the value object.

The implementation must preserve the repository's existing class structure, visibility, methods and behaviour.

The generic type must flow through:

- stored properties;
- constructor input;
- property/value getter.

Do not blindly reproduce a new implementation if the existing `ValueObject` contains additional behaviour.

Adapt the generic typing to the actual existing implementation.

---

## 8. Property Storage

The base property storage must use `TProps`.

The implementation must preserve:

- existing property visibility;
- existing readonly semantics;
- existing construction behaviour;
- existing access behaviour.

Do not introduce:

- cloning;
- freezing;
- new validation;
- new mutation rules.

The objective is type safety only.

---

## 9. Constructor

The `ValueObject` constructor must accept the generic property type.

Existing constructor behaviour must remain unchanged.

The constructor must not:

- transform the properties;
- validate new conditions;
- clone the object;
- change object ownership;
- introduce runtime behaviour.

Only the static type contract is being corrected.

---

## 10. Value / Property Getter

If the existing abstraction exposes its stored properties through a getter, that getter must expose `TProps` rather than `any`.

Preserve:

- getter name;
- visibility;
- return behaviour;
- object identity;
- existing consumers.

Do not introduce serialization or transformation.

---

## 11. Equality Behaviour

If the existing `ValueObject` implements equality or comparison behaviour, preserve it exactly.

Do not redesign equality.

Do not change:

- equality semantics;
- comparison strategy;
- property comparison;
- serialization-based comparison;
- method names;
- method visibility.

If TypeScript requires a generic adjustment inside equality logic, make only the minimum change required to preserve the existing implementation.

---

## 12. Concrete Value Objects

Inspect all concrete value objects that extend the shared base abstraction.

At minimum verify:

- `Money`;
- `EmailAddress`;
- `DateRange`.

Also inspect any additional concrete value objects discovered through repository search.

Where a concrete value object already has an explicit property type, use it as `TProps`.

Where no named property type exists, define the smallest appropriate local/domain type required to preserve the existing structure.

Do not introduce unnecessary abstractions.

Do not change the business meaning of any value object.

---

## 13. Concrete Property Types

Each concrete value object must retain its existing property structure.

Examples of appropriate typing include:

- existing named property interface;
- existing type alias;
- a narrowly defined property structure where none currently exists.

Do not replace a concrete property structure with:

- `any`;
- `unknown`;
- `Record<string, unknown>` merely to suppress lint;
- an unrestricted index signature;
- broad casts.

The generic base should preserve useful compile-time information.

---

## 14. Public Compatibility

Preserve all existing public and protected contracts unless a type annotation is strictly required to establish the generic relationship.

Do not change:

- exported class names;
- constructor semantics;
- method names;
- method visibility;
- getter names;
- import paths;
- public API shape.

Do not introduce a breaking API change.

---

## 15. Existing Tests

Inspect existing value-object tests before modifying them.

Existing tests must continue to verify the established behaviour, including where applicable:

- construction;
- value access;
- equality;
- validation;
- domain-specific behaviour.

Only modify tests if the generic type change causes a genuine compile-time requirement.

Do not change test scenarios merely to accommodate lint.

Do not add unrelated tests.

---

## 16. Domain Behaviour Preservation

The following must remain unchanged:

- validation rules;
- domain invariants;
- construction behaviour;
- equality;
- value access;
- error behaviour;
- event behaviour, where applicable;
- serialization behaviour;
- object lifecycle.

This iteration is a typing correction, not a behavioural change.

---

## 17. No Type Loopholes

Do not use any of the following to resolve the warnings:

- `any`;
- `as any`;
- `unknown` solely to bypass typing;
- unsafe double casts;
- `eslint-disable`;
- `eslint-disable-next-line`;
- lint configuration changes;
- TypeScript configuration changes.

The resulting abstraction must be genuinely type-safe.

---

## 18. Generated Artifacts

Follow the repository's existing generated-artifact convention.

If the normal build produces corresponding declaration or compiled artifacts for changed TypeScript source files, allow the established build process to produce them.

Do not create a separate generated-artifact process.

Do not manually alter generated artifacts unless required by the established repository convention.

---

## 19. Architectural Safety

If the existing `ValueObject` implementation cannot safely become generic without changing established semantics:

Stop on that issue.

Do not redesign the abstraction.

Report:

- affected member;
- TypeScript constraint;
- existing behaviour;
- reason the generic contract cannot safely be introduced;
- architectural decision required.

Do not continue into persistence or other lint remediation.

---

## 20. Verification Requirements

Copilot must perform the normal verification required by GOV-DEV-001.

### 20.1 Focused Tests

Run all relevant value-object tests.

Report:

- suites;
- tests;
- passed;
- failed.

### 20.2 Full Regression

Run:

`npm test -- --runInBand`

Report the exact:

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

### 20.4 Prisma

Run:

`npx prisma validate`

Report the result.

No migration or database modification is permitted.

### 20.5 Lint

Run:

`npm run lint`

Report:

- errors;
- warnings;
- final warning count;
- remaining `no-explicit-any` count.

Expected result:

14 warnings.

### 20.6 TypeScript / Language Service

Perform a final TypeScript/language-service check on the changed ValueObject source and concrete value-object files.

Report any errors.

---

## 21. Warning Accounting

Starting baseline:

17 warnings.

Targeted warnings:

3 `@typescript-eslint/no-explicit-any` warnings in the shared ValueObject abstraction.

Expected final state:

14 warnings.

All remaining warnings must be pre-existing `no-explicit-any` warnings belonging to later remediation batches.

If the final count differs from 14:

- identify the difference;
- explain the cause;
- do not remediate unrelated warnings.

---

## 22. Scope Audit

Before reporting completion, confirm:

- ValueObject base changed only for generic typing;
- concrete value objects changed only where required by the generic contract;
- no domain behaviour changed;
- no application behaviour changed;
- no API changes;
- no persistence changes;
- no Prisma changes;
- no provider changes;
- no lint configuration changes;
- no TypeScript configuration changes;
- no lint suppressions;
- no unrelated `any` remediation.

---

## 23. Acceptance Criteria

Batch D is complete when all of the following are true:

### AC-01 — Generic Base

The shared `ValueObject` abstraction is generically typed using `TProps`.

### AC-02 — Property Storage

The stored property value uses `TProps` rather than `any`.

### AC-03 — Constructor

The constructor accepts the appropriate `TProps` type.

### AC-04 — Getter

The property/value getter exposes `TProps` where applicable.

### AC-05 — Concrete Objects

Existing concrete value objects provide appropriate property types.

### AC-06 — Behaviour

Existing value-object behaviour is unchanged.

### AC-07 — Equality

Existing equality semantics remain unchanged.

### AC-08 — No Loopholes

No `any`, lint suppression, configuration change or unsafe cast is introduced to resolve the warnings.

### AC-09 — Regression

The full Jest regression suite passes.

### AC-10 — Build

The TypeScript build passes.

### AC-11 — Prisma

Prisma validation passes.

### AC-12 — Lint

The three targeted warnings are removed and the expected warning baseline becomes 14, unless a documented repository-specific exception is discovered.

### AC-13 — Scope

No persistence, API, provider, database or unrelated lint changes are introduced.

---

## 24. Copilot Final Report

Return the following information:

### Implementation Status

- completed / partially completed / blocked

### Generic Contract

- generic base type;
- location;
- concrete value-object types supplied as `TProps`;
- confirmation that existing semantics are preserved.

### Files Changed

List every changed source/test file.

### Warning Reduction

- baseline: 17;
- final total;
- warnings removed;
- remaining `no-explicit-any`;
- other warnings.

### Verification

- focused value-object tests;
- full Jest regression;
- build;
- Prisma validation;
- lint;
- TypeScript/language-service check.

### Scope Confirmation

Confirm:

- domain behaviour changed: NO;
- persistence changed: NO;
- API changed: NO;
- Prisma changed: NO;
- ESLint configuration changed: NO;
- TypeScript configuration changed: NO;
- suppressions added: NO;
- Hotelbeds calls: 0;
- PayFast calls: 0;
- database modified: NO;
- commit created: NO.

### Exceptions

List any unresolved ValueObject typing issue and explain why it could not safely be resolved.

---

## 25. Completion Boundary

This iteration addresses only the three shared `ValueObject` warnings.

Do not proceed to the remaining persistence warnings.

Do not modify:

- Journey persistence;
- Reservation persistence;
- Traveller persistence;
- Prisma service;
- any other remaining `no-explicit-any`.

Do not create a commit.

After the Copilot report, the implementation will be reviewed for architect acceptance under GOV-DEV-001.

Upon acceptance, the user will perform the commit.