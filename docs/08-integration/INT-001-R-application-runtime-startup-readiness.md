# INT-001-R — Application Runtime Startup Readiness

**Status:** Implementation Specification  
**Workstream:** Integration / Runtime Readiness  
**Related:** INT-001  
**Governance:** `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

## 1. Objective

Correct the existing GCT Core development/runtime startup configuration so that the application can be launched through the existing `npm run dev` entry point and correctly resolve the repository's existing TypeScript path aliases at runtime.

The immediate blocker is:

`Error: Cannot find module '@application/mappers'`

The repository already contains the application entry point and the referenced mapper module. The issue is runtime resolution of the existing TypeScript path aliases.

This is a **runtime configuration correction only**.

## 2. Current Architecture

Preserve the existing startup architecture:

**`npm run dev` → `ts-node src/index.ts` → `bootstrapApplication()` → Express application → HTTP server**

Preserve the existing production architecture:

**`npm run build` → `dist/index.js` → `npm start`**

The repository already defines TypeScript path aliases including:

- `@domain/*`
- `@application/*`
- `@infrastructure/*`
- `@interfaces/*`
- `@shared/*`

The existing source module:

`src/application/mappers/index.ts`

must remain in its current architectural location.

Do not replace path aliases throughout the source tree.

## 3. Required Correction

Identify and implement the **minimum appropriate runtime configuration** required for `ts-node` to resolve the existing TypeScript `paths` aliases when executing `src/index.ts`.

Use the project's existing dependency/configuration conventions where possible.

The solution must:

- allow `npm run dev` to start successfully;
- resolve `@application/*` and the other existing aliases consistently;
- preserve the current `src/index.ts` entry point;
- preserve the current Express/bootstrap architecture;
- preserve the existing TypeScript compiler configuration;
- preserve Jest alias resolution;
- avoid changing application imports unnecessarily.

Do not hard-code a single alias such as `@application/mappers` as a special case.

The runtime solution must support the existing alias structure.

## 4. Dependency Discipline

Before adding a dependency, inspect the current `package.json`, lockfile and existing configuration.

If an existing installed dependency already provides the required runtime alias resolution, use it.

If a small additional runtime dependency is genuinely required, add only the minimum dependency necessary and document why it is required.

Do not introduce a framework or runtime abstraction.

Do not upgrade unrelated dependencies.

## 5. Development Runtime

After the correction:

`npm run dev`

must successfully:

1. load `src/index.ts`;
2. initialise the application;
3. resolve existing aliased imports;
4. initialise the existing application/bootstrap components;
5. start the Express HTTP server;
6. expose the existing UI routes.

Verify the application can be reached through the existing development URL/port.

Do not change the application's route structure.

## 6. Production Runtime Compatibility

The correction must not break the existing compiled production path.

Verify:

`npm run build`

continues to pass.

Where practical, verify the generated application can be started using the existing:

`npm start`

mechanism.

Do not redesign the production build or introduce a second application entry point.

## 7. Browser Smoke Test

Once `npm run dev` starts successfully, perform a basic browser smoke test.

Verify at minimum:

- application homepage/discover route loads;
- CSS loads;
- JavaScript loads where applicable;
- existing journey card links resolve;
- Journey Detail route loads;
- Accommodation Selection route loads;
- Quote route loads.

This is not the INT-001 end-to-end verification. Its purpose is to establish that the application is genuinely runnable.

Record:

- development URL;
- HTTP/application startup result;
- browser result;
- console errors, if any;
- failed resource requests, if any.

## 8. Test Suite Investigation

While completing runtime verification, establish the authoritative current test count.

Run:

`npm test`

and report:

- total test suites;
- total tests;
- passed;
- failed;
- skipped/pending, if any.

Compare the result with the previously reported project baseline of:

**117 suites / 768 tests**

If the current repository legitimately contains a different test count, explain why.

Investigate test discovery/configuration only as necessary to explain the difference.

Do not modify or remove tests merely to reproduce an historical count.

Do not change Jest configuration unless a genuine defect in test discovery is identified.

## 9. Automated Verification

After implementation run:

1. `npm test`
2. `npm run type-check`
3. `npm run build`
4. `npm run lint`
5. `git diff --check`

Report exact results.

Distinguish pre-existing lint warnings from newly introduced warnings/errors.

## 10. Scope Constraints

Do not:

- change `src/index.ts` architecture unless strictly required by runtime alias resolution;
- move application modules;
- replace TypeScript path aliases with relative imports throughout the repository;
- modify pricing logic;
- modify Hotelbeds integration;
- modify reservation logic;
- modify payment;
- modify Prisma/schema;
- redesign the frontend;
- introduce production photography;
- add unrelated dependencies;
- perform unrelated refactoring;
- alter business behaviour.

If the runtime issue cannot be resolved without an architectural change, **stop and report the required change rather than implementing it silently**.

## 11. Expected Result

The development application must become genuinely runnable:

**`npm run dev`**

→ `src/index.ts`

→ `bootstrapApplication()`

→ Express

→ HTTP server

→ browser-accessible GCT Core UI

with existing aliases such as:

`@application/mappers`

resolving successfully at runtime.

The correction must not alter application-layer behaviour.

## 12. Deliverables

Provide an implementation and verification report containing:

- root cause of the runtime failure;
- files changed;
- dependencies changed, if any;
- exact runtime configuration correction;
- confirmation that existing aliases remain intact;
- `npm run dev` result;
- browser smoke-test result;
- browser console/resource results;
- authoritative `npm test` result;
- explanation of any difference from the historical 117/768 baseline;
- type-check result;
- build result;
- production `npm start` result if verified;
- lint result;
- `git diff --check` result;
- confirmation that application architecture remains unchanged;
- confirmation that no Hotelbeds/pricing/reservation/payment functionality was modified;
- confirmation that no production photography was introduced;
- confirmation that no unrelated scope expansion occurred;
- confirmation that Copilot did not commit or push;
- any unresolved issues.

## 13. Acceptance Criteria

INT-001-R is ready for Architect Acceptance when:

- the root cause of the `@application/mappers` runtime failure is identified;
- the minimum runtime correction is implemented;
- `npm run dev` starts successfully;
- existing TypeScript aliases resolve at runtime;
- the existing application entry point remains in use;
- the Express/bootstrap architecture remains unchanged;
- the browser can load the application;
- basic UI routes load successfully;
- no unexpected browser console/resource errors remain;
- the authoritative current test count is established and explained;
- `npm test` passes;
- type-check passes;
- build passes;
- lint passes;
- `git diff --check` passes;
- no unrelated application functionality is changed.

**Copilot must not commit or push.**

**Proposed commit message after Architect Acceptance:**

`fix(runtime): enable application startup with path aliases`