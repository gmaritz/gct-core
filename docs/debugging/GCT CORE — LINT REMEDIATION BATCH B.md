# GCT CORE — LINT REMEDIATION BATCH B
## API Presenter Response Types

### 1. Purpose

Remediate the six remaining `@typescript-eslint/no-explicit-any` warnings in the API presenter layer by replacing untyped serialized response objects with explicit response types.

This is a focused typing and API-contract clarification task.

It MUST NOT become an API redesign.

### 2. Governance

Follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

This document is the single source of truth for the development workflow.

Workflow:

Specification
→ Implementation
→ Verification
→ ChatGPT Acceptance
→ User Commit

Do not create a commit.

### 3. Current Baseline

Accepted lint state:

- Errors: 0
- Warnings: 30
- All remaining warnings: `@typescript-eslint/no-explicit-any`
- Jest: 84 suites / 684 tests passed
- Build: passed
- Prisma validation: passed

Batch B addresses exactly six warnings.

Target:

**30 → 24 warnings**

### 4. Scope

The six warnings are in:

- `journey.presenter.ts`
- `reservation.presenter.ts`
- `traveller.presenter.ts`

The warnings represent serialized API response objects and response lists.

The required conceptual response types are:

- `JourneyJSONResponse`
- `ReservationJSONResponse`
- `TravellerJSONResponse`

and their corresponding arrays.

### 5. Required Outcome

Replace the six `any` usages with explicit response typing.

The presenters must expose explicit serialized response shapes.

Do not change the underlying domain aggregates.

Do not change application services.

Do not change persistence.

Do not change Prisma.

Do not change API routes or endpoint semantics.

Do not change response field names unless existing code proves that a field is incorrectly represented and the change is unavoidable for typing.

### 6. API Contract Principle

The presenter is the boundary between the internal application/domain representation and the serialized API representation.

The response type belongs at the API/presentation boundary.

Do not expose domain aggregate types as API response contracts merely to remove `any`.

Do not introduce supplier-specific types.

Do not expose Hotelbeds or PayFast types.

### 7. Existing Contract First

Before creating a new response type:

1. Inspect the existing presenter implementation.
2. Inspect existing API contracts/documentation.
3. Inspect route/controller consumers.
4. Inspect existing tests.
5. Reuse an existing canonical response type if one already exists.

Only create a named response type where the repository does not already provide one.

Do not duplicate an existing type.

### 8. Journey Presenter

For `journey.presenter.ts`:

- define/use `JourneyJSONResponse`;
- ensure `present()` returns that type;
- ensure collection/list presentation returns `JourneyJSONResponse[]`;
- preserve the existing serialized shape exactly.

Do not add fields.

Do not remove fields.

Do not change field naming.

Do not change journey business behaviour.

### 9. Reservation Presenter

For `reservation.presenter.ts`:

- define/use `ReservationJSONResponse`;
- ensure `present()` returns that type;
- ensure collection/list presentation returns `ReservationJSONResponse[]`;
- preserve the existing serialized shape exactly.

Do not modify reservation lifecycle behaviour.

Do not modify reservation persistence.

Do not modify accommodation snapshots.

Do not modify booking orchestration.

### 10. Traveller Presenter

For `traveller.presenter.ts`:

- define/use `TravellerJSONResponse`;
- ensure `present()` returns that type;
- ensure collection/list presentation returns `TravellerJSONResponse[]`;
- preserve the existing serialized shape exactly.

Do not redesign Traveller preferences in this batch.

The Traveller preference `any` warnings elsewhere belong to the later Traveller preference contract batch.

### 11. Type Location

Place response types in the existing API/presentation contract location if one exists.

Follow the repository's established folder and naming conventions.

Do not create a new architectural layer.

Do not move unrelated files.

If the repository already has a canonical API contract location, use it.

### 12. Compatibility

The implementation must preserve:

- existing API response shape;
- existing field names;
- existing serialization;
- existing null/undefined behaviour;
- existing list behaviour;
- existing tests.

This batch must be behaviourally neutral.

### 13. Type Strictness

Do not use:

- `any`;
- `unknown` merely to silence the lint rule;
- broad index signatures unless the existing API response genuinely requires one;
- `eslint-disable`;
- `eslint-disable-next-line`;
- lint configuration changes.

Prefer explicit property types derived from the existing serialized output.

Where a property is intentionally dynamic, use the narrowest justified type based on existing application contracts.

Do not invent semantics.

### 14. API Contract Boundary

The resulting response types should represent the serialized API contract, not the internal domain model.

This distinction must be maintained:

Domain model
→ Presenter
→ API response contract

Do not reverse this dependency.

### 15. Tests

Update existing presenter/API tests only where required to validate the new explicit response types.

Do not change test scenarios merely to accommodate the typing.

Add tests only if an existing response shape is not already covered.

Do not modify unrelated tests.

### 16. Out of Scope

Do NOT address:

- Traveller preference `any` warnings;
- ValueObject `any` warnings;
- Prisma service typing;
- Journey persistence typing;
- Reservation persistence typing;
- Traveller persistence typing;
- test-only `any` warnings;
- `no-console`;
- explicit return types;
- any other lint rule.

Do not perform architectural refactoring.

### 17. Safety Check

If defining the response type reveals an actual API contract ambiguity:

STOP on that specific presenter.

Do not guess.

Report:

- presenter;
- ambiguous field;
- current behaviour;
- existing documentation/tests;
- why the type cannot safely be determined.

Do not expand the batch into API redesign.

### 18. Verification

After implementation run:

#### Lint

`npm run lint`

Report:

- final warning count;
- warning reduction;
- remaining `no-explicit-any`.

Expected target:

**24 warnings**

#### Focused tests

Run the relevant presenter/API tests.

Report exact results.

#### Full regression

Run:

`npm test -- --runInBand`

Report:

- suites passed;
- suites failed;
- tests passed;
- tests failed;
- skipped;
- exit status.

#### Build

Run:

`npm run build`

#### Prisma

Run:

`npx prisma validate`

#### TypeScript

Run the final language-service/TypeScript check on changed files.

### 19. Warning Accounting

Starting baseline:

**30 warnings**

Expected Batch B reduction:

**6 warnings**

Expected remaining:

**24 warnings**

All remaining warnings should be `@typescript-eslint/no-explicit-any`.

If the result differs, explain precisely why.

### 20. Scope Audit

Before completion confirm:

- only API presenter/response-contract files were changed;
- no domain files changed;
- no application service behaviour changed;
- no persistence files changed;
- no provider files changed;
- no Prisma changes;
- no configuration changes;
- no lint suppressions;
- no unrelated warning remediation.

### 21. Final Report

Return:

#### Implementation Status

- completed / partially completed / blocked

#### Files Changed

List every changed file.

#### API Response Types

List:

- Journey response type;
- Reservation response type;
- Traveller response type;
- where each type is defined.

#### Warning Reduction

- baseline: 30
- final:
- warnings removed:
- remaining `no-explicit-any`:
- other warnings:

#### Verification

- focused tests:
- full Jest regression:
- build:
- Prisma validation:
- lint:
- TypeScript/language-service:

#### Scope Audit

Confirm:

- production behaviour changed: NO
- API response shape changed: NO
- domain contracts changed: NO
- persistence changed: NO
- Prisma changed: NO
- ESLint configuration changed: NO
- suppressions added: NO
- Hotelbeds calls: 0
- PayFast calls: 0
- commit created: NO

#### Exceptions

List any presenter that could not safely be typed and explain why.

### 22. Completion Rule

This batch is complete only when:

- all six targeted `any` warnings are resolved, OR
- an explicit architectural/API ambiguity prevents safe completion and is reported.

Do not proceed to the Traveller preference batch.

Do not address the remaining 24 warnings.

Do not create a commit.

Follow `GOV-DEV-001-DEVELOPMENT-PROCESS.md` throughout.