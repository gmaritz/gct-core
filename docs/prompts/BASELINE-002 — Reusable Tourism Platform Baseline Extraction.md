# BASELINE-002 — REUSABLE TOURISM PLATFORM BASELINE EXTRACTION

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | BASELINE-002 |
| Title | Reusable Tourism Platform Baseline Extraction |
| Version | 2.0 |
| Status | Specification |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS.md |
| Predecessor | BASELINE-001 — Reusable Tourism Platform Baseline Extraction Manifest |
| Source Repository | D:\DEVELOPMENT\gct-core |
| Baseline Destination | D:\DEVELOPMENT\tourism-platform-baseline |

---

## 2. Purpose

BASELINE-002 defines the extraction of the reusable tourism-platform foundation from GCT Core.

The objective is to create an independent, reusable baseline for future tourism platforms while preserving the approved GCT Core architecture and excluding Go Cape Tours-specific implementation, provider-specific implementation, secrets, historical material, and transitional compatibility code.

This is an extraction iteration.

It is not an architecture redesign, domain redesign, persistence redesign, or frontend redesign.

---

## 3. Governing Process

All implementation SHALL follow:

GOV-DEV-001-DEVELOPMENT-PROCESS.md

The mandatory workflow is:

STAGE 1 — SPECIFICATION
STAGE 2 — IMPLEMENTATION
STAGE 3 — FOCUSED TESTS + REGRESSION
STAGE 4 — COPILOT IMPLEMENTATION REPORT
STAGE 5 — ARCHITECT ACCEPTANCE
STAGE 6 — COMMIT

Copilot SHALL NOT create the commit.

The user performs the commit after architect acceptance.

---

## 4. Source and Destination

### 4.1 Source

The source repository is:

D:\DEVELOPMENT\gct-core

The source represents the current GCT Core implementation and remains unchanged by the extraction except where explicitly required to preserve normal repository operation.

### 4.2 Destination

The reusable baseline SHALL be extracted to:

D:\DEVELOPMENT\tourism-platform-baseline

The destination is a sibling directory of GCT Core.

The intended structure is:

D:\DEVELOPMENT\
    gct-core\
    tourism-platform-baseline\

The destination SHALL be independent of the GCT Core repository.

---

## 5. Baseline Authority

BASELINE-001 is the authoritative extraction manifest.

The following classifications SHALL be used:

| Classification | Treatment |
|---|---|
| BASELINE-INCLUDE | Extract |
| BASELINE-INCLUDE-PARAMETERISED | Extract and parameterise |
| BASELINE-EXCLUDE-GCT | Exclude |
| BASELINE-EXCLUDE-HISTORICAL | Exclude |
| BASELINE-EXCLUDE-TRANSITIONAL | Exclude |
| REVIEW-REQUIRED | Stop and report a decision gap |

Do not reinterpret the BASELINE-001 classifications without identifying a genuine contradiction.

---

## 6. Approved Architecture Boundary

The extraction SHALL preserve the approved architecture and semantic decisions established by:

- ARCH-000;
- ADR-001;
- SPEC-026 v2.0;
- SPEC-027 v2.0;
- SPEC-028 v2.0;
- SPEC-029 v2.0;
- SPEC-030 v2.0;
- PERSIST-001.

The reusable baseline SHALL preserve:

- Clean Architecture dependency direction;
- domain/application/infrastructure separation;
- aggregate ownership;
- repository abstractions;
- canonical Reservation persistence;
- Reservation-owned supplier fulfilment;
- typed Prisma bootstrap lifecycle;
- Express/EJS frontend foundation;
- established testing and verification conventions.

Do not redesign these boundaries during extraction.

---

## 7. Reusable Governance and Documentation

Extract reusable governance and engineering documentation identified by BASELINE-001, including applicable:

- architecture standards;
- development process governance;
- engineering specification standards;
- engineering document catalogue;
- verification standards;
- approved architecture decisions;
- canonical reusable architecture specifications.

The following SHALL NOT be extracted:

- GCT-specific commercial documentation;
- GCT operational documentation;
- GCT-specific provider documentation;
- historical implementation notes;
- debugging archives;
- superseded architecture;
- transitional migration records.

Historical documentation remains in GCT Core.

---

## 8. Reusable Architecture Foundation

Extract reusable architecture patterns for:

- Clean Architecture;
- dependency direction;
- domain/application/infrastructure boundaries;
- aggregate roots;
- value objects;
- domain services;
- domain events;
- repository abstractions;
- application services;
- infrastructure boundaries;
- dependency injection;
- application bootstrap.

GCT-specific business capabilities SHALL NOT be extracted unless explicitly classified as reusable by BASELINE-001.

---

## 9. Reusable Domain Foundation

Extract reusable domain patterns identified by BASELINE-001, including where applicable:

- Reservation aggregate semantics;
- Booking/Reservation separation;
- Reservation lifecycle;
- supplier fulfilment ownership;
- supplier snapshot/reference patterns;
- reusable value-object patterns;
- aggregate lifecycle conventions.

GCT-specific catalogue, pricing, operational rules, and seed data SHALL be excluded.

Future tourism platforms SHALL be able to adapt business terminology and domain-specific content without inheriting GCT-specific product implementation.

---

## 10. Reusable Application Foundation

Extract reusable application-layer patterns including:

- application services;
- repository contracts;
- persistence-neutral interfaces;
- use-case boundaries;
- dependency injection;
- domain/application separation;
- reusable application error handling.

Exclude GCT-specific customer journeys, commercial workflows, and operational use cases.

---

## 11. Canonical Persistence Foundation

The reusable persistence target SHALL be the approved canonical persistence architecture.

Include:

- canonical Reservation repository contract;
- canonical Reservation repository implementation pattern;
- Reservation persistence context;
- typed Prisma bootstrap lifecycle;
- canonical Reservation reconstruction;
- Reservation-owned supplier fulfilment state;
- persistence-neutral application contracts;
- applicable Prisma conventions.

Exclude:

- legacy Reservation repository;
- legacy Reservation mapper;
- legacy persistence mapper patterns;
- PrismaService transitional lifecycle;
- Booking compatibility fallback;
- historical Booking-root persistence architecture;
- historical persistence structures not required by the canonical model.

The Booking compatibility fallback is a GCT historical compatibility mechanism and SHALL NOT become part of the reusable baseline abstraction.

The current canonical Reservation path is the reusable target identified by BASELINE-001. :contentReference[oaicite:2]{index=2}

---

## 12. Supplier Boundary

Only provider-neutral supplier architecture SHALL be extracted.

Exclude:

- Hotelbeds implementation;
- Hotelbeds configuration;
- Hotelbeds credentials;
- Hotelbeds certificates;
- Hotelbeds destination data;
- provider-specific API settings;
- provider-specific production configuration.

PayFast and QuickBooks integrations are likewise GCT-specific and SHALL be excluded.

No provider-specific dependency SHALL be required by the reusable baseline.

---

## 13. Frontend Foundation

The reusable frontend foundation SHALL preserve the existing Express/EJS architecture.

Include:

- Express frontend integration;
- UI route conventions;
- frontend controller boundary;
- View Model pattern;
- View Model provider pattern;
- EJS layout infrastructure;
- EJS partial infrastructure;
- reusable static asset structure.

Do not introduce React, Next.js, Vue, Angular, or another frontend framework.

GCT-specific frontend content SHALL be excluded or parameterised, including:

- Go Cape Tours branding;
- GCT imagery;
- homepage content;
- merchandising;
- catalogue content;
- pricing;
- destination content;
- unfinished GCT-specific customer journeys.

BASELINE-001 identifies the frontend framework as reusable but its GCT presentation content as parameterised or excluded. :contentReference[oaicite:3]{index=3}

---

## 14. Testing and Tooling Foundation

Extract reusable testing and tooling conventions identified by BASELINE-001, including:

- TypeScript;
- Jest;
- Prisma;
- ESLint;
- build configuration;
- test configuration;
- regression conventions;
- Prisma validation conventions.

Do not introduce a new framework.

Do not upgrade dependencies unless directly required for the extraction.

Do not perform unrelated lint remediation.

Existing lint warnings are technical debt unless the extraction introduces a new blocking error. This follows GOV-DEV-001. :contentReference[oaicite:4]{index=4}

---

## 15. Configuration and Parameterisation

The baseline SHALL extract reusable configuration structure but SHALL parameterise platform-specific values.

Parameterise:

- platform name;
- application identity;
- package/repository identity;
- branding;
- frontend identity;
- database configuration;
- environment configuration;
- navigation;
- catalogue;
- deployment identity;
- domain-specific terminology where required.

The following SHALL remain excluded:

- passwords;
- API keys;
- access tokens;
- provider credentials;
- private keys;
- certificates;
- secret-bearing environment files;
- production credentials.

BASELINE-001 explicitly identifies these as exclusion requirements. :contentReference[oaicite:5]{index=5}

---

## 16. GCT-Specific Exclusions

The following SHALL NOT be extracted:

| Component | Classification |
|---|---|
| Hotelbeds integration | BASELINE-EXCLUDE-GCT |
| PayFast integration | BASELINE-EXCLUDE-GCT |
| QuickBooks workflow | BASELINE-EXCLUDE-GCT |
| Go Cape Tours branding/content | BASELINE-EXCLUDE-GCT |
| GCT catalogue and merchandising | BASELINE-EXCLUDE-GCT |
| GCT supplier configuration | BASELINE-EXCLUDE-GCT |
| GCT production/environment configuration | BASELINE-EXCLUDE-GCT |
| GCT-specific seed data | BASELINE-EXCLUDE-GCT |

These exclusions are established by BASELINE-001. :contentReference[oaicite:6]{index=6}

---

## 17. Historical and Transitional Exclusions

The following SHALL remain in GCT Core but SHALL NOT be copied into the reusable baseline:

### Historical

- superseded specifications;
- historical Booking-root persistence structures;
- historical migration artefacts not required by the canonical baseline;
- historical implementation documentation.

### Transitional

- PrismaService;
- legacy repositories;
- legacy mappers;
- Booking compatibility fallback;
- other compatibility mechanisms whose purpose is preservation of historical GCT state.

BASELINE-001 explicitly classifies these components as historical or transitional rather than reusable platform architecture. :contentReference[oaicite:7]{index=7}

---

## 18. File-Level Extraction

Use BASELINE-001 to determine the file/component boundary.

Do not blindly copy complete directories where reusable and excluded material are mixed.

For mixed directories:

1. identify reusable files;
2. identify parameterised files;
3. identify GCT-specific files;
4. identify historical files;
5. identify transitional files;
6. extract only the permitted components.

If a reusable component cannot be separated without redesigning the architecture:

BLOCKED — DECISION GAP

Do not invent an abstraction to force extraction.

---

## 19. Destination Handling

The destination is now explicitly established:

D:\DEVELOPMENT\tourism-platform-baseline

If the directory does not exist, Copilot SHALL create it.

If it already exists:

- inspect its contents;
- do not delete existing content;
- do not blindly overwrite existing files;
- identify any conflict with BASELINE-002.

If existing content creates an unavoidable extraction conflict:

BLOCKED — DECISION GAP

Do not resolve the conflict destructively.

---

## 20. Baseline Independence

The extracted baseline SHALL NOT require:

D:\DEVELOPMENT\gct-core

to exist after extraction.

The baseline SHALL not contain unintended imports, paths, configuration, package dependencies, or runtime assumptions that require GCT Core.

Where a dependency cannot be removed without redesign:

report the dependency as a decision gap.

---

## 21. GCT Core Preservation

Do not modify GCT Core merely to simplify extraction.

Do not:

- delete GCT-specific files;
- delete historical files;
- remove compatibility code;
- redesign existing architecture;
- change business rules;
- alter supplier integrations;
- perform unrelated refactoring;
- clean unrelated technical debt.

The GCT Core implementation remains the source system.

---

## 22. Verification Requirements

After extraction, Copilot SHALL perform the normal verification required by GOV-DEV-001.

At minimum:

- focused tests appropriate to the extraction;
- full regression;
- npm run build;
- npm test -- --runInBand;
- npx prisma validate;
- npm run lint.

The extraction SHALL also be checked for:

- unresolved GCT-only dependencies;
- provider-specific dependencies;
- secrets;
- private keys;
- certificates;
- unintended source-repository dependencies;
- broken package/configuration references.

No external supplier API calls are required.

---

## 23. Regression and Existing Warnings

GOV-DEV-001 requires full regression after implementation.

Existing warnings SHALL be distinguished from new implementation defects.

Do not expand BASELINE-002 into a general lint-cleanup iteration.

A new lint error introduced by the extraction SHALL be treated as an implementation defect.

Existing unrelated warnings may remain and SHALL be reported. :contentReference[oaicite:8]{index=8}

---

## 24. Scope Discipline

Copilot SHALL:

- implement only BASELINE-002;
- follow this specification;
- preserve existing architecture;
- preserve existing GCT Core behaviour;
- add only tests required by this extraction;
- fix defects directly caused by this extraction.

Copilot SHALL NOT:

- implement future tourism-platform features;
- redesign architecture;
- redesign persistence;
- redesign the frontend;
- perform unrelated refactoring;
- upgrade dependencies without requirement;
- clean unrelated technical debt;
- introduce speculative abstractions.

This follows the scope discipline in GOV-DEV-001. :contentReference[oaicite:9]{index=9}

---

## 25. Implementation Report

Copilot SHALL return the standard implementation report containing:

### Implementation Status

COMPLETE

or:

BLOCKED — DECISION GAP

### Files / Components Changed

Exact list.

### Baseline Destination

Confirm:

D:\DEVELOPMENT\tourism-platform-baseline

### Included Components

List reusable components extracted.

### Parameterised Components

List components requiring future platform-specific configuration.

### Excluded Components

List GCT-specific, historical, transitional, and security-sensitive exclusions.

### Dependency Verification

Confirm whether the baseline is independent of GCT Core.

### Security Verification

Confirm that no credentials, tokens, private keys, certificates, or secret-bearing environment files were extracted.

### Focused Tests

Report exact focused test results.

### Full Regression

Report exact suite and test results.

### Build

Report exact result.

### Prisma

Report exact validation result.

### Lint

Report errors and warnings.

### Scope Confirmation

Confirm no unrelated work was performed.

### Decision Gaps

State None or list the exact unresolved issue.

### Commit Status

State:

No commit created.

---

## 26. Acceptance Criteria

BASELINE-002 is complete when:

- the reusable baseline is extracted to D:\DEVELOPMENT\tourism-platform-baseline;
- the destination is independent of GCT Core;
- reusable architecture is preserved;
- GCT-specific implementation is excluded;
- provider-specific implementation is excluded;
- secrets and security-sensitive material are excluded;
- historical material is excluded;
- transitional implementation is excluded;
- platform-specific values are parameterised;
- no unintended GCT dependency remains;
- focused tests pass;
- full regression passes or known unrelated failures are understood;
- build passes;
- Prisma validation passes;
- no new blocking lint errors exist;
- no architectural violation remains;
- Copilot provides the implementation report;
- Copilot does not commit.

---

## 27. Copilot Instruction

Before implementation, read and follow:

GOV-DEV-001-DEVELOPMENT-PROCESS.md

Implement BASELINE-002 v2.0 exactly as specified.

Use BASELINE-001 as the authoritative reusable-baseline manifest.

Extract the reusable tourism-platform baseline from:

D:\DEVELOPMENT\gct-core

to:

D:\DEVELOPMENT\tourism-platform-baseline

Do not create BASELINE-003.

Do not create an additional process gate.

Do not redesign the architecture.

Do not implement future capabilities.

Do not copy GCT-specific integrations, secrets, certificates, private keys, historical documentation, or transitional compatibility implementation.

Create the destination directory if required.

Inspect existing destination content before overwriting anything.

Run the required focused tests, full regression, build, Prisma validation, and lint verification.

Return the complete implementation report.

Do not commit.

---

## 28. Stage 1 Specification Completion

This document constitutes:

STAGE 1 — SPECIFICATION

under:

GOV-DEV-001-DEVELOPMENT-PROCESS.md

After this specification is accepted as the implementation contract, the next activity is:

STAGE 2 — IMPLEMENTATION

Copilot then performs the implementation, followed by the remaining mandatory GOV-DEV-001 stages.

No additional pre-implementation governance stage is introduced.

---

## 29. Specification Conclusion

BASELINE-002 v2.0 establishes the implementation boundary for extracting the reusable tourism-platform foundation from GCT Core.

The reusable baseline destination is:

D:\DEVELOPMENT\tourism-platform-baseline

The baseline SHALL preserve the approved architecture while removing GCT-specific, provider-specific, historical, transitional, and security-sensitive material.

The resulting baseline is intended to provide the reusable technical foundation for future tourism-platform implementations.