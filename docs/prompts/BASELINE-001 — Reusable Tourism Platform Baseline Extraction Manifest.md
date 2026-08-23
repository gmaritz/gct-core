# BASELINE-001 — Reusable Tourism Platform Baseline Extraction Manifest

## Document Control

| Field | Value |
|---|---|
| Document ID | BASELINE-001 |
| Title | Reusable Tourism Platform Baseline Extraction Manifest |
| Version | 1.0 |
| Status | Draft — Architect Review Required |
| Classification | Normative Implementation Specification |
| Owner | Platform Architecture |
| Parent Authority | ARCH-000 — Architecture Manifest |
| Governing Standard | GOV-DEV-001 — GCT Core Development Process Governance |
| Repository | GCT Core |
| Purpose | Define the evidence-based reusable platform baseline boundary before extraction |
| Implementation Mode | Read-only assessment and manifest generation |
| Scope | GCT Core reusable platform foundation |

---

# 1. Purpose

BASELINE-001 defines the read-only assessment required to establish the reusable technical baseline of GCT Core for future tourism platforms.

The objective is to identify precisely:

- what should be reused;
- what should be parameterised;
- what is Go Cape Tours-specific;
- what is historical or superseded;
- what is transitional or compatibility-only;
- what requires further architectural review.

This specification does not create or extract the baseline.

It produces the authoritative evidence and manifest required for a subsequent baseline extraction implementation specification.

---

# 2. Architectural Context

GCT Core has reached:

**BASELINE READY WITH EXCLUSIONS**

The current authoritative architecture is:

GOV-DEV-001 → ARCH-000 → SPEC-000 → ADR-001 → SPEC-026 → SPEC-027 → SPEC-028 → SPEC-029 → SPEC-030 → PERSIST-001 → verified implementation.

The following are established architectural contracts:

- Booking is the commercial transaction/process.
- Reservation is the canonical aggregate representing what Go Cape must fulfil.
- Supplier fulfilment is subordinate Reservation-owned state.
- Go Cape availability and external supplier availability contribute to fulfilment.
- Booking is not the authoritative Reservation persistence root.
- Canonical Reservation persistence is owned by the Reservation persistence boundary.
- The current frontend foundation is Express/EJS based.
- Existing accepted architecture must not be redesigned during baseline extraction.

This iteration does not reopen these decisions.

---

# 3. Objective

The implementation objective is to inspect the current repository and produce a complete baseline extraction manifest.

The assessment SHALL identify the reusable platform boundary without modifying the repository.

The resulting manifest SHALL be sufficiently precise that a subsequent implementation specification can instruct Copilot exactly what to extract.

---

# 4. Governing Sources

Copilot SHALL review the current repository versions of:

- GOV-DEV-001 — Development Process Governance
- SPEC-000 — Engineering Specification Standard
- GOV-001 — Engineering Document Catalogue
- ENG-002 — Verification Standard
- ARCH-000 — Architecture Manifest
- ADR-000 — Architecture Decision Record Standard
- ADR-001 — Booking, Reservation and Supplier Booking Semantics
- SPEC-026 v2.0
- SPEC-027 v2.0
- SPEC-028 v2.0
- SPEC-029 v2.0
- SPEC-030 v2.0
- PERSIST-001
- relevant frontend architecture documentation
- relevant IMP documentation
- SPEC-049 — Enterprise Architecture Index / Traceability Matrix

Repository implementation is evidence for implementation alignment.

No external architectural assumptions SHALL override repository evidence.

---

# 5. Read-Only Boundary

This iteration SHALL NOT:

- create files;
- modify files;
- rename files;
- delete files;
- move files;
- copy files;
- modify source code;
- modify tests;
- modify Prisma schema;
- modify migrations;
- modify configuration;
- change document statuses;
- change document versions;
- fix lint;
- upgrade dependencies;
- create a baseline;
- create a commit.

If a defect or ambiguity is discovered, it SHALL be reported rather than corrected.

---

# 6. Git Baseline

Before assessment, inspect the repository Git state.

Verify:

- current branch;
- working-tree status;
- recent relevant commits;
- commit containing the completed documentation authority/status reconciliation.

Determine whether uncommitted changes remain.

Uncommitted changes SHALL be identified and SHALL NOT automatically be considered part of the reusable baseline.

No Git changes SHALL be made.

---

# 7. Baseline Classification

Every significant candidate component SHALL receive exactly one classification:

| Classification | Meaning |
|---|---|
| BASELINE-INCLUDE | Stable reusable platform foundation |
| BASELINE-INCLUDE-PARAMETERISED | Reusable foundation requiring platform-specific configuration |
| BASELINE-EXCLUDE-GCT | Go Cape Tours-specific implementation |
| BASELINE-EXCLUDE-HISTORICAL | Historical or superseded material |
| BASELINE-EXCLUDE-TRANSITIONAL | Legacy or compatibility implementation unsuitable as the future architectural pattern |
| REVIEW-REQUIRED | Evidence is insufficient for safe classification |

Classification SHALL be evidence-based.

---

# 8. Governance Baseline

Assess the reusable value of:

- development governance;
- specification standards;
- verification standards;
- architecture standards;
- ADR standards;
- document catalogue;
- lifecycle conventions;
- implementation workflow;
- testing workflow.

Identify:

- reusable governance;
- GCT-specific governance;
- historical governance;
- parameterised governance.

Governance documents SHALL NOT be modified.

---

# 9. Architecture Baseline

Assess reusable architectural foundations including:

- project structure;
- Clean Architecture boundaries;
- domain/application/infrastructure separation;
- dependency direction;
- bounded-context conventions;
- aggregate conventions;
- entity conventions;
- value-object conventions;
- domain services;
- domain events;
- repository abstractions;
- application services;
- infrastructure boundaries;
- bootstrap conventions;
- ADR conventions;
- architecture manifests.

GCT-specific business architecture SHALL be separated from reusable platform architecture.

No architectural redesign is permitted.

---

# 10. Domain Baseline

Assess the reusability of domain concepts including:

- Traveller;
- Reservation;
- Booking;
- Journey;
- supplier fulfilment;
- availability;
- lifecycle/state concepts;
- value objects;
- domain events;
- domain exceptions.

For each component determine whether it is:

- reusable;
- parameterised;
- GCT-specific;
- historical;
- transitional.

The established Booking/Reservation semantics SHALL be preserved.

No domain model changes are permitted.

---

# 11. Application Baseline

Assess reusable application-layer foundations including:

- application services;
- use-case structure;
- repository contracts;
- application DTOs;
- commands and queries where present;
- application error handling;
- dependency injection;
- service composition;
- domain/application separation.

GCT-specific business use cases SHALL be excluded.

---

# 12. Persistence Baseline

Assess the current persistence architecture against:

- SPEC-027 v2.0;
- SPEC-028 v2.0;
- SPEC-029 v2.0;
- SPEC-030 v2.0;
- PERSIST-001;
- Prisma schema;
- canonical Reservation repository;
- typed Prisma bootstrap lifecycle.

Explicitly classify:

- CanonicalReservationPrismaRepository;
- typed bootstrap Prisma client;
- SupplierReference persistence;
- Reservation persistence;
- Booking compatibility fallback;
- PrismaService;
- legacy repositories;
- legacy mappers;
- historical Booking-root persistence structures.

The assessment SHALL distinguish canonical architecture from transitional compatibility code.

No persistence changes are permitted.

---

# 13. Frontend Baseline

Assess the current frontend foundation including:

- Express;
- EJS;
- /ui route namespace;
- frontend routes;
- controllers;
- shared layouts;
- partials;
- static assets;
- View Models;
- View Model providers;
- frontend architecture documentation;
- relevant IMP specifications.

Identify:

### Reusable

Technical frontend architecture and presentation infrastructure.

### Parameterised

Platform identity, branding, navigation, theme, content and catalogue configuration.

### GCT-specific

Go Cape Tours content, imagery, merchandising, catalogue and unfinished customer journeys.

No frontend framework migration or frontend redesign is permitted.

---

# 14. Infrastructure Baseline

Assess reusable infrastructure including:

- application bootstrap;
- database connectivity;
- logging;
- error handling;
- configuration loading;
- dependency injection;
- runtime conventions;
- health checks;
- build scripts;
- environment handling.

Exclude:

- GCT-specific infrastructure;
- provider-specific configuration;
- production credentials;
- certificates;
- private keys;
- environment-specific deployment material.

---

# 15. Testing Baseline

Assess reusable:

- Jest configuration;
- test structure;
- test utilities;
- fixture conventions;
- regression conventions;
- build verification;
- Prisma validation;
- lint conventions.

Determine which testing infrastructure future tourism platforms should inherit.

Do not modify tests or tooling.

---

# 16. Development Tooling Baseline

Assess:

- TypeScript configuration;
- package configuration;
- npm scripts;
- ESLint;
- Jest;
- Prisma;
- build tooling;
- repository tooling.

Do not upgrade dependencies or correct tooling during this iteration.

Existing lint warnings SHALL be assessed only for baseline contamination risk.

---

# 17. Security Baseline

Perform a read-only security contamination assessment.

Identify categories including:

- .env files;
- API credentials;
- certificates;
- private keys;
- provider credentials;
- secrets;
- environment-specific security files.

Secret values SHALL NEVER be printed in the report.

Only filenames, paths and classifications may be reported.

Security-sensitive material SHALL normally be classified as excluded unless it is clearly reusable non-secret security infrastructure.

---

# 18. GCT-Specific Exclusions

Explicitly assess known GCT-specific material including:

- Go Cape Tours branding;
- GCT domains;
- homepage content;
- tour catalogue;
- pricing;
- commercial rules;
- operational rules;
- Hotelbeds implementation/configuration;
- PayFast;
- QuickBooks;
- supplier configuration;
- seed data;
- certificates;
- private keys;
- environment-specific configuration;
- GCT-specific email/content.

These components SHALL NOT be included in the reusable baseline.

---

# 19. Transitional Architecture

Explicitly assess:

- PrismaService;
- legacy Reservation repository;
- legacy Reservation mapper;
- Journey/Traveller legacy persistence patterns;
- Booking compatibility fallback;
- historical Booking persistence columns;
- historical migrations;
- other compatibility code.

Determine whether each should be:

- included;
- parameterised;
- excluded as transitional;
- retained only in GCT Core.

The existence of an implementation in GCT Core SHALL NOT by itself establish that it belongs in the reusable baseline.

---

# 20. Historical Documentation

Identify:

- superseded specifications;
- historical architecture;
- historical implementation specifications;
- obsolete documents;
- historical migrations or documentation.

Historical material SHALL remain in GCT Core unless governed otherwise.

Historical material SHALL NOT be copied into the reusable baseline unless explicitly classified as reusable.

---

# 21. Baseline Dependency Analysis

For every proposed BASELINE-INCLUDE component, determine whether it depends on:

- GCT-specific implementation;
- transitional implementation;
- excluded configuration;
- unresolved architecture;
- provider-specific behaviour.

If the dependency cannot be cleanly parameterised, classify the component:

REVIEW-REQUIRED

Hidden GCT dependencies SHALL NOT be accepted into the baseline.

---

# 22. Baseline Component Manifest

Produce the following manifest:

| Component | Repository Path | Category | Classification | Evidence | Parameterisation / Exclusion Notes |
|---|---|---|---|---|---|

Exact repository paths SHALL be used wherever practical.

Mixed directories SHALL be decomposed where necessary rather than classified wholesale.

---

# 23. Baseline Exclusion Manifest

Produce:

| Component | Repository Path | Classification | Reason |
|---|---|---|---|

The exclusion manifest SHALL include:

- GCT-specific implementation;
- provider integrations;
- provider configuration;
- security-sensitive files;
- GCT data;
- historical documentation;
- superseded architecture;
- transitional compatibility implementation;
- environment-specific configuration.

---

# 24. Parameterisation Manifest

Produce:

| Component | Current GCT Dependency | Future Platform Parameter | Baseline Treatment |
|---|---|---|---|

Consider:

- platform identity;
- application name;
- brand;
- database configuration;
- domain;
- email;
- payment provider;
- accommodation provider;
- supplier configuration;
- frontend theme;
- catalogue;
- tourism-specific business configuration.

Credentials and secret values SHALL NOT be included.

---

# 25. Proposed Baseline Boundary

Produce a conceptual baseline structure based on repository evidence.

The structure SHALL identify the reusable boundary without creating it.

The proposed structure should cover, where supported:

- governance;
- architecture;
- domain;
- application;
- infrastructure;
- persistence;
- frontend;
- testing;
- configuration;
- documentation.

The structure SHALL NOT become a new architecture proposal.

It is an extraction boundary only.

---

# 26. Baseline Contamination Assessment

Assess specifically for:

- hard-coded GCT names;
- GCT domains;
- GCT branding;
- provider identifiers;
- provider credentials;
- certificates;
- private keys;
- GCT seed data;
- GCT business rules;
- GCT email/content;
- historical specifications;
- obsolete architecture;
- hidden GCT dependencies.

Report findings only.

Do not correct them.

---

# 27. Baseline Quality Gate

Determine whether the repository is sufficiently understood for a subsequent baseline extraction implementation specification.

The result SHALL be one of:

### EXTRACTION SPECIFICATION READY

The reusable baseline boundary is sufficiently defined and can proceed to formal implementation specification.

### EXTRACTION READY WITH DECISION GAPS

The baseline is substantially defined but specific decisions must be resolved first.

### EXTRACTION BLOCKED

The evidence is insufficient to safely define the reusable baseline.

Expected GCT-specific exclusions SHALL NOT constitute a blocker.

---

# 28. Required Output

Copilot SHALL return exactly the following report sections:

## 28.1 Review Status

COMPLETE

or

BLOCKED — REVIEW ACCESS ISSUE

## 28.2 Governing Standards Reviewed

List the standards and authoritative documents reviewed.

## 28.3 Git / Baseline State

Report:

- working-tree state;
- relevant baseline commit;
- uncommitted changes;
- whether those changes affect extraction.

## 28.4 Baseline Principle

State the distinction between:

- reusable platform foundation;
- GCT-specific implementation;
- historical material;
- transitional material.

## 28.5 Reusable Baseline Manifest

Provide the complete component manifest.

## 28.6 Baseline Exclusion Manifest

Provide the complete exclusion manifest.

## 28.7 Parameterisation Manifest

Provide the complete parameterisation manifest.

## 28.8 Dependency Risks

List reusable components with excluded or unresolved dependencies.

## 28.9 Security / Credential Exclusions

List sensitive file categories/paths only.

Never expose secret values.

## 28.10 Transitional Architecture Assessment

Explicitly report treatment of:

- PrismaService;
- legacy repositories/mappers;
- Booking compatibility;
- historical persistence structures.

## 28.11 Frontend Baseline

Identify:

- reusable frontend foundation;
- parameterised frontend components;
- GCT-specific frontend content to exclude.

## 28.12 Documentation Baseline

Identify documentation families to:

- include;
- parameterise;
- exclude;
- retain only in GCT Core.

## 28.13 Proposed Baseline Boundary

Provide the conceptual extraction structure.

## 28.14 Baseline Quality Gate

State whether the baseline can now proceed to a formal extraction implementation specification.

## 28.15 Decision Gaps

State:

None

or list the exact unresolved decisions.

## 28.16 Overall Classification

State exactly one:

EXTRACTION SPECIFICATION READY

EXTRACTION READY WITH DECISION GAPS

EXTRACTION BLOCKED

## 28.17 Recommended Next Step

Recommend ONE next action only.

---

# 29. Acceptance Criteria

This read-only specification is complete when:

1. The current governance authority is verified.
2. The committed baseline state is identified.
3. Reusable platform components are explicitly classified.
4. GCT-specific components are explicitly excluded.
5. Parameterised components are identified.
6. Transitional architecture is explicitly classified.
7. Historical documentation is distinguished from reusable documentation.
8. Security-sensitive material is identified without exposing secrets.
9. Dependencies between reusable and excluded components are assessed.
10. A conceptual baseline boundary is produced.
11. No repository modifications are made.
12. The final classification clearly states whether a formal extraction implementation specification can now be produced.

---

# 30. Scope Boundary

This iteration SHALL NOT:

- extract the baseline;
- create the baseline directory;
- copy repository files;
- modify repository files;
- clean GCT-specific code;
- remove secrets;
- refactor transitional code;
- fix lint;
- upgrade dependencies;
- redesign architecture;
- create new architecture;
- create a commit.

Any requirement discovered beyond this boundary SHALL become a future iteration or decision gap.

---

# 31. Final Instruction

Perform the assessment read-only.

Use repository evidence.

Do not make changes.

Produce the complete baseline extraction manifest and classification.

Stop after the report.

The expected next step, if the quality gate passes, is a separate implementation specification for the actual reusable tourism-platform baseline extraction.