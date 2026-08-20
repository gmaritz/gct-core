# GCT Core — APP-008 Next Capability Determination

## Status

READ-ONLY INVESTIGATION

## Purpose

Determine the correct next GCT Core accommodation capability following the completed and committed:

- APP-008.3 — Accommodation Availability
- APP-008.4 — Accommodation CheckRate / Revalidation
- APP-008.5 — Accommodation Booking
- APP-008.6 — Accommodation Cancellation
- APP-008.7 — Accommodation Booking Modification
- APP-008.8 — Accommodation Booking Details / Retrieval

This is a read-only architecture and roadmap investigation.

DO NOT implement anything.

DO NOT modify source files.

DO NOT modify tests.

DO NOT modify documentation.

DO NOT create commits.

DO NOT call Hotelbeds.

DO NOT modify the database.

DO NOT modify Prisma.

The objective is to determine the next capability from the existing GCT Core business architecture, application specifications, implementation roadmap, and current implementation.

Do not invent an APP-008.9 capability merely because another Hotelbeds API operation exists.

---

# 1. GOVERNING PROCESS

Read and follow:

docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md

This document is the single source of truth for the GCT Core development process.

The current workflow is:

SPECIFICATION
→ IMPLEMENTATION
→ FOCUSED TESTS + REGRESSION
→ COPILOT IMPLEMENTATION REPORT
→ ARCHITECT ACCEPTANCE
→ COMMIT
→ NEXT SPECIFICATION

No separate routine architect-review gate is required after specification. Architectural review is part of the architect's work when preparing the specification.

Specifications are normally 700 lines or fewer and are supplied as one complete Markdown document in one copyable block. :contentReference[oaicite:2]{index=2}

This investigation is not an implementation iteration.

---

# 2. DOCUMENTATION TO REVIEW

Before reaching a recommendation, inspect the authoritative project documentation.

## 2.1 Business Architecture

Review:

docs/01-business/01-project-vision.md
docs/01-business/02-business-model.md
docs/01-business/03-product-catalogue.md
docs/01-business/04-customer-journey.md
docs/01-business/05-booking-lifecycle.md
docs/01-business/06-supplier-model.md
docs/01-business/07-revenue-model.md
docs/01-business/08-business-rules.md

docs/01-business/BUS-001-business-capability-model-v2.0.0.md
docs/01-business/BUS-002-business-entity-model.md
docs/01-business/BUS-003-business-process-model.md

## 2.2 Foundations and Architecture

Review:

docs/02-foundations/01-platform-principles.md

docs/03-domain-model/03-business-capabilities.md

docs/04-software-architecture/04–api-contracts.md
docs/04-software-architecture/07-integration-architecture.md
docs/04-software-architecture/ARCH-000-architecture-manifest.md

## 2.3 Engineering Specifications

Review:

docs/06-specification/engineering/SPEC-003-canonical-api-model.md
docs/06-specification/engineering/SPEC-006-canonical-integration-model
docs/06-specification/engineering/SPEC-017-canonical-capability-model.md
docs/06-specification/engineering/SPEC-037-api-architecture-standards.md
docs/06-specification/engineering/SPEC-049-enterprise-architecture-index-traceability-matrix.md

docs/06-specification/implementation/IMP-001-enterprise-implementation-roadmap.md

If the repository uses a different actual path, use the repository's authoritative location and report the discrepancy.

## 2.4 Application Capabilities

Inspect the APP-001 through APP-007 capability specifications.

Inspect the complete APP-008 documentation currently present.

Inspect the accepted specifications and implementation state for:

APP-008.3
APP-008.4
APP-008.5
APP-008.6
APP-008.7
APP-008.8

## 2.5 Hotelbeds

Review:

docs/08-integration/hotelbeds/HBX-001-certification-readiness.md

Also inspect the current Hotelbeds provider capabilities and implementation.

---

# 3. CURRENT ACCEPTED APP-008 BASELINE

Treat the following committed capabilities as accepted architectural and behavioural contracts:

APP-008.3
Accommodation Availability

→

APP-008.4
Accommodation CheckRate / Revalidation

→

APP-008.5
Accommodation Booking

→

APP-008.6
Accommodation Cancellation

→

APP-008.7
Accommodation Booking Modification

→

APP-008.8
Accommodation Booking Details / Retrieval

Do not redesign these accepted iterations during this investigation.

GOV-DEV-001 requires accepted iterations to remain the baseline for subsequent iterations unless a genuine defect is discovered. :contentReference[oaicite:3]{index=3}

---

# 4. BUSINESS CONTEXT

Preserve the actual GCT business model.

Go Cape Tours sells private multi-day packages.

Packages may contain approximately 3–10 days and multiple accommodation stops.

At each stop:

- GCT selects approximately six to ten approved properties;
- availability is searched against those approved properties;
- the client can select the property;
- the client can select the room;
- the client can select the rate;
- the supplier accommodation price becomes an input to GCT package pricing;
- GCT owns the final package price.

GCT is not searching for a generic "best available rate".

The accommodation supplier provides accommodation availability and commercial accommodation data.

GCT owns package pricing, including its own pricing rules and sliding-scale pricing.

The architecture must support multiple accommodation suppliers in future.

Hotelbeds MUST NOT become the canonical business model.

---

# 5. CURRENT PACKAGE ACCOMMODATION FLOW

Assess the current implementation against the intended business flow:

Package
→ Package Stop
→ GCT Approved Properties
→ Live Accommodation Availability
→ Client Property Selection
→ Client Room Selection
→ Client Rate Selection
→ GCT Package Pricing
→ Revalidation
→ Accommodation Booking
→ Reservation
→ Modification / Cancellation
→ Current Supplier Booking State

Determine whether an important business capability is still missing.

Do not assume that every missing Hotelbeds API operation represents a missing GCT capability.

---

# 6. DETERMINE THE NEXT CAPABILITY

Determine the next capability that should be specified after APP-008.8.

The recommendation MUST come from the existing GCT architecture and roadmap.

Do not automatically choose APP-008.9.

Investigate whether the next capability should be:

- booking confirmation or voucher/document handling;
- booking reconciliation;
- supplier booking synchronisation;
- operational booking status;
- booking history;
- package accommodation selection;
- package-level accommodation coordination;
- another formally defined application capability;
- or no new APP-008 capability yet.

The correct answer may be that the next capability belongs outside APP-008.

---

# 7. BUSINESS OWNERSHIP

For every plausible candidate, determine its correct ownership.

Check whether it belongs to:

- APP-004 Reservation;
- APP-005 Pricing;
- Journey;
- Package;
- Communications;
- Documents;
- Operations;
- Supplier Integration;
- another existing capability.

Do not create duplicate functionality under APP-008.

The supplier integration layer should provide supplier operations required by GCT capabilities, not become a generic Hotelbeds API wrapper.

---

# 8. APP-008 OWNERSHIP TEST

A capability belongs under APP-008 only when its primary responsibility is accommodation supplier interaction.

Examples that are likely APP-008 concerns:

- accommodation availability;
- accommodation revalidation;
- accommodation booking;
- accommodation cancellation;
- accommodation booking modification;
- accommodation booking retrieval.

Examples that may belong elsewhere:

- GCT package pricing;
- package selection;
- customer communications;
- voucher presentation;
- reservation lifecycle;
- package-level reconciliation;
- accounting;
- customer-facing documents.

Determine ownership from the existing architecture rather than assumption.

---

# 9. HOTELBEDS API DISCIPLINE

Hotelbeds is the current supplier, not the canonical architecture.

Do not recommend a new capability simply because Hotelbeds exposes another API endpoint.

For every candidate Hotelbeds operation, determine:

1. Is there a genuine GCT business requirement?
2. Is the operation required by an existing GCT capability?
3. Does the operation belong under APP-008?
4. Does an existing application capability already own the business responsibility?
5. Would the operation be required by another future capability instead?

Supplier API capabilities are implementation inputs.

GCT business capabilities are the architectural authority.

---

# 10. MULTI-SUPPLIER REQUIREMENT

The next capability must remain compatible with:

Supplier A
+
Supplier B
+
Future Supplier C

The canonical contract must not depend on Hotelbeds-specific concepts.

Provider-specific behaviour belongs behind the provider abstraction and adapter.

If a proposed capability cannot reasonably remain supplier-neutral, identify why.

---

# 11. CURRENT IMPLEMENTATION INSPECTION

Inspect the current source tree for:

- AccommodationProvider;
- provider registry/capabilities;
- APP-008 application services;
- APP-004 reservation services;
- APP-005 pricing services;
- package/journey composition;
- communications;
- documents;
- supplier adapters;
- Hotelbeds client;
- Hotelbeds request/response mapping;
- current persistence/repositories.

Determine what is already implemented.

Do not modify anything.

---

# 12. ROADMAP INSPECTION

Inspect IMP-001 and the application roadmap.

Determine whether a formally defined next capability already exists.

Also inspect existing APP-008 specifications for references to:

- subsequent iterations;
- future capabilities;
- voucher/document requirements;
- reconciliation;
- booking synchronisation;
- supplier verification;
- certification.

Do not treat historical draft documents as authoritative when a newer accepted specification exists.

---

# 13. CERTIFICATION BOUNDARY

Review HBX-001.

Determine whether any proposed capability is:

- normal application development;
- supplier integration development;
- certification preparation;
- certification itself.

GOV-DEV-001 states that certification is separate from normal feature development. Hotelbeds calls must not be introduced into normal automated iteration verification. :contentReference[oaicite:4]{index=4}

Do not turn the next capability into a certification exercise.

---

# 14. CANDIDATE EVALUATION

For every credible candidate, evaluate:

| Candidate | Business Need | Existing Owner | APP-008 Appropriate | Evidence |
|---|---|---|---|---|

The evidence must identify the actual documentation or implementation basis.

Do not manufacture candidates merely to fill the table.

---

# 15. NEXT CAPABILITY DECISION

Choose exactly one outcome.

## Outcome A — Formally Defined

Use when an authoritative application specification or roadmap already defines the next capability.

Report:

NEXT CAPABILITY: APP-XXX — <name>
STATUS: FORMALLY DEFINED

## Outcome B — Architecturally Warranted

Use when no formal specification exists but the business and architecture clearly establish the capability.

Report:

NEXT CAPABILITY: APP-XXX — <name>
STATUS: ARCHITECTURALLY WARRANTED — SPECIFICATION REQUIRED

## Outcome C — No APP-008 Capability Yet

Use when the next requirement belongs elsewhere or no further APP-008 capability is currently justified.

Report:

NEXT CAPABILITY: NOT AN APP-008 ITERATION
STATUS: NEXT CAPABILITY BELONGS TO <CAPABILITY>

## Outcome D — Roadmap Decision Required

Use only when the authoritative documentation does not provide enough information to determine the next capability.

Report:

NEXT CAPABILITY: NOT YET DEFINED
STATUS: ROADMAP DECISION REQUIRED

Do not invent an identifier.

---

# 16. REQUIRED REPORT

Return one concise Markdown report using exactly this structure.

# APP-008 Next Capability Determination Report

## 1. Review Status

State:

READ-ONLY REVIEW COMPLETE

or:

REVIEW INCOMPLETE

## 2. Documentation Reviewed

List only the authoritative documents actually inspected.

## 3. Current APP-008 Lifecycle

Show the completed sequence:

APP-008.3
↓
APP-008.4
↓
APP-008.5
↓
APP-008.6
↓
APP-008.7
↓
APP-008.8

Briefly state the responsibility of each.

## 4. Business Lifecycle Assessment

Assess:

Package
→ Stop
→ Property
→ Room
→ Rate
→ Pricing
→ Revalidation
→ Booking
→ Reservation
→ Modification / Cancellation
→ Current Supplier State

State what remains missing, if anything.

## 5. Candidate Capabilities

Provide the candidate assessment table.

## 6. Recommended Next Capability

State exactly one recommendation.

Include:

- identifier if justified;
- capability name;
- business purpose;
- owning capability;
- reason it is next;
- dependencies.

## 7. Supplier-Neutrality Assessment

Explain:

- canonical responsibility;
- provider responsibility;
- adapter responsibility;
- Hotelbeds-specific concerns;
- future supplier compatibility.

## 8. Existing Capability Duplication Check

State whether the recommendation duplicates any existing capability.

## 9. Implementation Readiness

State whether a formal specification can now be written.

If yes, identify the principal implementation boundaries.

If no, identify the exact missing architectural/business decision.

## 10. Certification Relationship

State whether the proposed capability is:

- development functionality;
- certification functionality;
- both;
- neither.

## 11. Scope Confirmation

Confirm:

Source files modified: 0
Test files modified: 0
Specification files modified: 0
Database modified: NO
Prisma modified: NO
Hotelbeds calls: 0
Git reset/revert: NO
Commit created: NO

## 12. Final Recommendation

Choose exactly one:

PROCEED TO NEXT SPECIFICATION

or:

ROADMAP DECISION REQUIRED

---

# 17. FINAL INSTRUCTION

This is a READ-ONLY investigation.

Do not:

- implement anything;
- modify source code;
- modify tests;
- modify specifications;
- modify documentation;
- call Hotelbeds;
- modify Prisma;
- modify the database;
- reset or revert Git;
- create a commit;
- redesign accepted APP-008.3–APP-008.8 capabilities;
- create a new governance gate;
- perform a pre-commit audit.

Use the existing GCT Core documentation and current implementation as the authority.

Use Copilot's implementation knowledge to determine what is technically and architecturally appropriate.

Do not assume the next capability is APP-008.9.

Do not assume the next capability is a Hotelbeds API operation.

The objective is to determine the correct next GCT Core capability so that the architect can produce its formal implementation specification in the next iteration.