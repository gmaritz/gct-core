# GCT CORE — PERSISTENCE RECONCILIATION BATCH 3B
## Read-Only Reservation Persistence Model Design Review

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B3B-RESERVATION-REVIEW |
| Title | Reservation Persistence Model Design Review |
| Project | GCT Core |
| Type | Read-Only Architecture / Dependency Review |
| Status | Review Only |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Predecessor | PERSISTENCE-B3A-RESERVATION |
| Current Lint Warnings | 11 |
| Immediate Objective | Determine the canonical physical Reservation persistence model |
| Implementation Authorised | NO |

---

## 2. Review Purpose

This review is required because the previous Reservation persistence implementation attempt was correctly blocked.

The current Prisma Reservation model does not provide an adequate direct representation of the accepted GCT Reservation aggregate and APP-004 accommodation reservation snapshot.

The purpose of this review is to determine how the existing physical persistence model can represent the accepted Reservation model.

This is a **read-only review**.

No source, test, Prisma schema, configuration, database, or generated artifact may be modified as part of this review.

---

## 3. Governing Process

This review follows:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

The review sequence is:

Read-only inspection
→ Findings
→ Dependency identification
→ Persistence model recommendation
→ Architectural decision
→ Focused implementation specification

This document does NOT authorise implementation.

---

## 4. Review Inputs

The review MUST consider the existing canonical GCT Core sources relevant to Reservation persistence, including:

- Reservation domain model;
- Reservation aggregate;
- Reservation repository contract;
- Reservation mapper;
- Reservation Prisma repository;
- current Prisma schema;
- Traveller persistence model;
- accepted APP-004 handoff model;
- accepted APP-004 accommodation booking orchestration;
- APP-005 pricing model;
- APP-008 booking boundary.

The current source tree and Prisma schema are authoritative for the physical implementation state.

---

## 5. Known Blocking Evidence

The previous Batch 3A verification established that the current Prisma Reservation model does not directly represent:

- Reservation number;
- direct Traveller identity;
- Journey identity;
- final GCT package price;
- supplier price;
- supplier currency;
- pricing basis;
- APP-004 accommodation snapshots;
- package stops;
- selected property;
- selected room;
- selected rate;
- multi-room occupancy;
- child ages;
- provider-neutral booking references;
- provider-neutral booking state.

There is currently no approved persistence structure capable of representing the complete APP-004 snapshot hierarchy.

These findings are the starting point for this review.

---

# 6. Review Question

The primary question is:

> What is the smallest canonical persistence model that can represent the accepted GCT Reservation aggregate and APP-004 accommodation reservation state while preserving the existing domain and bounded-context architecture?

The review must answer this without prematurely designing implementation details.

---

# 7. Reservation Domain Perspective

The Reservation aggregate represents the GCT reservation and its lifecycle.

It is not merely a supplier booking record.

The review must therefore distinguish:

**GCT Reservation**

from:

**Supplier Booking**

and from:

**Accommodation Reservation Snapshot**

These concepts may be physically related but must not be treated as automatically identical.

---

# 8. Current Prisma Perspective

The existing Prisma Reservation representation is oriented around booking/supplier concepts.

Known fields include concepts such as:

- booking identity;
- booking item identity;
- supplier identity;
- reservation reference;
- reservation status;
- reservation timestamps.

The review must determine what these fields actually represent in the current schema.

Do not assume that similarly named fields are semantically equivalent to domain fields.

---

# 9. Identity Review

Determine the canonical physical representation for:

### GCT Reservation Identity

What physical record identifies the GCT Reservation?

### Reservation Number

Where is the externally meaningful GCT reservation number persisted?

### Supplier Booking Identity

Where is supplier booking identity persisted?

### Supplier Reservation Reference

Where is the provider/supplier reservation reference persisted?

The review must explicitly distinguish these identities.

---

# 10. Traveller Relationship Review

The accepted Traveller persistence model establishes:

- Traveller as a distinct domain concept;
- Customer relationship at persistence level;
- Customer-owned email;
- canonical Traveller identity.

The Reservation persistence model must determine how the Reservation references that canonical Traveller.

Review:

- existing Prisma relationships;
- existing foreign keys;
- existing booking relationships;
- whether Traveller identity is directly represented;
- whether an intermediate structure already provides the relationship.

Do not create a new Traveller model during this review.

---

# 11. Journey Relationship Review

The current implementation does not have an established Prisma Journey model.

The review must determine whether the existing physical model contains another valid representation of Journey identity.

Possible existing representations must be investigated before any new model is considered.

The review MUST NOT assume that a new Journey table is required.

The review MUST NOT create one.

If no physical representation exists, record this as a separate Journey persistence dependency.

---

# 12. Reservation Lifecycle Review

Determine how the physical model represents the GCT Reservation lifecycle.

Compare:

- domain Reservation status;
- physical reservation status;
- supplier booking status;
- booking item status.

Determine whether these are:

- the same concept;
- separate concepts;
- related concepts.

The review must identify whether a single existing physical status can safely represent the domain lifecycle.

Do not decide by field name alone.

---

# 13. Commercial Price Review

APP-005 establishes the final GCT package price.

The review must identify where the current physical model can persist:

- final GCT amount;
- final GCT currency;
- applicable pricing context.

The review must distinguish this from supplier accommodation pricing.

If no existing physical representation exists, record the gap.

Do not design the schema during this review.

---

# 14. Supplier Price Review

The accepted APP-004 snapshot preserves supplier accommodation pricing.

The review must identify whether the current physical model can preserve:

- supplier amount;
- supplier currency;
- pricing basis.

Determine whether these values already exist elsewhere in the current persistence model.

Do not duplicate an existing canonical financial representation.

---

# 15. Accommodation Snapshot Review

The accepted APP-004 Reservation snapshot must preserve accommodation selection and booking state.

The review must inspect existing persistence structures for representations of:

- accommodation/property;
- room;
- rate;
- provider;
- supplier references;
- stay dates;
- occupancy;
- child ages;
- pricing;
- booking state.

Determine whether an existing model can represent this information without loss.

---

# 16. Package Stop Review

APP-004 supports multiple accommodation stops.

The review must determine whether the current persistence model already has a concept corresponding to:

**Reservation Accommodation Stop**

The review must establish whether existing structures support:

- stop identity;
- stop order;
- association with Reservation;
- accommodation selection.

Do not flatten stops into the Reservation root.

---

# 17. Multi-Room Review

The review must determine whether the existing persistence model can represent multiple room selections.

It must investigate whether the current schema can preserve:

- room grouping;
- adult count;
- child count;
- child ages.

The review must explicitly identify any loss of information caused by the current physical model.

---

# 18. Property → Room → Rate Review

The accepted APP-004 model preserves the selection chain:

**Property**
→ **Room**
→ **Rate**

The review must determine how that chain is currently represented physically.

The following must remain distinguishable:

- selected property;
- selected room;
- selected rate.

Do not reduce these to a single accommodation identifier.

---

# 19. Provider Review

The physical model must support provider-neutral accommodation booking state.

Review whether the current schema can preserve:

- provider identity;
- provider reference;
- supplier accommodation reference;
- supplier room/rate reference;
- supplier booking reference.

Do not introduce Hotelbeds-specific columns.

---

# 20. Booking State Review

APP-004 orchestration supports supplier booking outcomes including:

- pending;
- revalidation;
- validated;
- booking attempted;
- confirmed;
- failed;
- unknown.

The review must determine where these states can be persisted.

The distinction between:

**GCT Reservation lifecycle**

and:

**Accommodation/Supplier booking state**

must be preserved.

---

# 21. Snapshot Versus Operational State

The review must distinguish immutable selection information from mutable booking state.

### Selection/Snapshot Information

Examples:

- selected property;
- room;
- rate;
- occupancy;
- stay dates;
- supplier price at selection/pricing time.

### Operational Booking Information

Examples:

- booking attempt;
- supplier booking reference;
- booking state;
- confirmation;
- failure;
- revalidation result.

Determine whether the existing persistence model already separates these concepts.

---

# 22. Immutability Review

APP-004 established immutable preservation of accommodation selection data within the Reservation aggregate.

The review must determine how this immutable snapshot can be represented physically.

It must avoid a design where later supplier updates overwrite historical selection/pricing information that is required for Reservation integrity.

---

# 23. Supplier Revalidation Review

APP-004 preserves references required for downstream revalidation.

The review must determine where those references can be persisted so that a later APP-008.4 revalidation can identify the correct supplier/rate context.

Do not introduce supplier-specific behaviour into Reservation persistence.

---

# 24. Booking Result Review

APP-008.5 produces booking results.

The review must determine how the Reservation persistence model can retain:

- booking success;
- supplier booking reference;
- booking failure;
- unknown booking state;
- per-stop result.

The physical representation must not falsely represent failed or unknown bookings as confirmed.

---

# 25. Per-Stop Booking Review

APP-004 orchestration supports per-stop booking outcomes.

The review must determine whether the current persistence model can associate a booking outcome with the correct accommodation stop.

If the current model only represents one booking outcome for an entire Reservation, record the limitation.

Do not silently discard per-stop state.

---

# 26. Pricing Boundary Review

The review must preserve the ownership boundaries:

APP-005
→ pricing calculation

APP-004
→ Reservation snapshot and final reservation state

APP-008
→ supplier booking

Persistence
→ durable representation

The review must not move pricing calculations into persistence.

---

# 27. Payment Boundary Review

APP-006 owns payment integration.

The Reservation persistence model must not become a PayFast persistence model.

Review only whether the existing Reservation persistence contains a legitimate Reservation-level payment state.

Do not introduce PayFast-specific fields.

---

# 28. Accounting Boundary Review

APP-007 is currently planned to stop at payment confirmation, with invoices manually issued through the existing QuickBooks process.

Reservation persistence must not introduce invoice or QuickBooks structures as part of this review.

The review should only identify whether existing Reservation financial data is sufficient for the accepted downstream process.

---

# 29. Existing Schema Reuse

The first architectural preference is:

**Reuse existing canonical persistence structures where semantically correct.**

The review should identify:

- structures that can be reused directly;
- structures that can be related;
- structures that require extension;
- structures that are semantically incompatible.

Do not create duplicate models where an existing canonical model already represents the same business concept.

---

# 30. Schema Extension Versus New Model

The review must classify each required missing concept as one of:

### Existing Structure

Already represented correctly.

### Existing Structure Extension

Existing model can represent the concept with a small, coherent extension.

### New Persistence Structure

No existing model represents the concept correctly.

### External Dependency

The concept cannot be resolved until another bounded context/model is defined.

This classification is a review outcome, not an implementation instruction.

---

# 31. Required Persistence Model Shape

The review should determine whether the eventual physical model conceptually requires:

**Reservation**

with related:

**Accommodation Reservation / Stop**

with related:

**Room / Selection**

and/or:

**Booking State**

The exact physical naming is intentionally not predetermined.

The model must be derived from the existing schema and accepted domain contracts.

---

# 32. Reservation Root Review

Determine which physical structure should be treated as the persistence root corresponding to the GCT Reservation aggregate.

The review must explain:

- why it represents the Reservation;
- which fields belong to it;
- which related structures belong beneath it;
- which existing booking structures remain supplier-oriented.

---

# 33. Aggregate Boundary Review

The physical model should support the Reservation aggregate boundary without requiring the domain aggregate to become persistence-aware.

Determine which data belongs to:

- Reservation root;
- Reservation accommodation snapshot;
- supplier booking state;
- related Traveller;
- related Journey.

---

# 34. Data Ownership Matrix

The review MUST produce a conceptual ownership matrix covering at least:

| Concept | Domain Owner | Current Physical Owner | Gap |
|---|---|---|---|
| Reservation identity | Reservation | To be determined | Review |
| Reservation number | Reservation | To be determined | Review |
| Traveller | Traveller | To be determined | Review |
| Journey | Journey | To be determined | Review |
| GCT price | Reservation/Pricing | To be determined | Review |
| Supplier price | Accommodation/Reservation snapshot | To be determined | Review |
| Accommodation stop | Reservation | To be determined | Review |
| Property | Accommodation selection | To be determined | Review |
| Room | Accommodation selection | To be determined | Review |
| Rate | Accommodation selection | To be determined | Review |
| Occupancy | Accommodation selection | To be determined | Review |
| Child ages | Accommodation selection | To be determined | Review |
| Provider | Supplier boundary | To be determined | Review |
| Supplier reference | Supplier boundary | To be determined | Review |
| Booking state | Reservation/Booking | To be determined | Review |

The table must be completed from actual repository/schema evidence.

---

# 35. Mapper Dependency

The current Reservation mapper contains `any` because its expected persistence representation does not align cleanly with the current Prisma model.

The review must establish the correct persistence representation before any mapper typing is attempted.

The mapper warning is therefore classified as:

**Downstream dependency**

not:

**Immediate mechanical lint task**.

---

# 36. Repository Dependency

The current Reservation repository contains row assumptions that do not match the Prisma Reservation model.

The review must identify the actual query shape and relationships.

The repository warning is therefore also classified as:

**Downstream dependency**

until the physical model is established.

---

# 37. No Implementation During Review

The review MUST NOT:

- edit source files;
- edit tests;
- edit Prisma schema;
- generate migrations;
- change repository contracts;
- change domain objects;
- change mapper code;
- remove lint warnings;
- create persistence models.

The review produces decisions and findings only.

---

# 38. No Schema Decision by Assumption

The review must not conclude:

"Add a JSON field"

or:

"Create a ReservationAccommodation table"

solely because the existing model lacks fields.

Any proposed physical model must be justified against:

- current schema;
- existing domain model;
- APP-004;
- APP-005;
- APP-008;
- existing persistence ownership.

---

# 39. Read-Only Verification

The review should verify the current state through:

- source inspection;
- Prisma schema inspection;
- repository inspection;
- mapper inspection;
- existing Reservation tests;
- existing APP-004 tests where relevant.

No implementation changes are permitted.

---

# 40. Required Review Findings

The completed review MUST explicitly answer:

1. What is the canonical physical Reservation root?
2. Where should Reservation number live?
3. How is Traveller related?
4. How is Journey currently represented, if at all?
5. Where should final GCT price live?
6. Where should supplier price/currency/basis live?
7. Where should accommodation stops live?
8. How are multiple rooms represented?
9. Where are child ages represented?
10. Where are property/room/rate selections represented?
11. Where are provider and supplier references represented?
12. Where is booking state represented?
13. Which existing models can be reused?
14. Which models require extension?
15. Which concepts require a new persistence structure?
16. Which dependencies must be resolved by Journey persistence?
17. Can the Reservation mapper be safely typed after the model decision?
18. Can the Reservation repository be safely typed after the model decision?

---

# 41. Decision Classification

Each finding MUST be classified as:

- **RESOLVED** — existing model is sufficient;
- **REUSE** — existing structure can represent the concept;
- **EXTENSION** — existing structure requires an approved extension;
- **NEW MODEL REQUIRED** — no existing suitable structure exists;
- **DEPENDENCY** — another bounded context/model decision is required;
- **BLOCKED** — insufficient information for a safe decision.

---

# 42. Expected Outcome

The review should result in one of two outcomes.

### Outcome A — Model Identified

The existing schema plus a small number of clearly justified extensions can represent the accepted Reservation model.

Proceed to:

**Focused Reservation Persistence Model Specification**

### Outcome B — Model Still Undetermined

One or more concepts require another architectural decision.

Remain read-only and identify the exact decision required.

Do not proceed to implementation.

---

# 43. Warning Roadmap

Current:

**11 warnings**

Reservation persistence:

**4 warnings**

The expected downstream target is:

**11 → 7**

This is NOT an implementation target for this review.

The review must not manipulate lint warnings.

The warning count is simply used to track the dependency that motivated the review.

---

# 44. Relationship to Journey

Journey persistence remains an independent concern.

The Reservation review may identify Journey as a dependency.

It MUST NOT resolve Journey persistence implicitly.

If Journey persistence is required before Reservation can be completed, report:

**DEPENDENCY — JOURNEY PERSISTENCE MODEL**

---

# 45. Relationship to Traveller

Traveller persistence is already accepted.

The Reservation review MUST use the canonical Traveller model.

It MUST NOT reopen:

- Customer association;
- Traveller preferences;
- Traveller email ownership;
- Traveller repository ownership.

---

# 46. Relationship to APP-004

APP-004 is the primary source for the Reservation accommodation snapshot requirements.

The review must preserve its established concepts:

- multi-stop;
- multi-room;
- occupancy;
- child ages;
- property;
- room;
- rate;
- provider;
- supplier references;
- supplier pricing;
- booking state.

Do not simplify these concepts merely to fit the current Prisma schema.

---

# 47. Relationship to APP-005

APP-005 is authoritative for pricing ownership.

The review must preserve the distinction between:

- final GCT package price;
- supplier accommodation price.

Do not merge them.

---

# 48. Relationship to APP-008

APP-008 is authoritative for supplier booking operations.

The review must determine which supplier booking results need persistence at the Reservation boundary.

Supplier-specific implementation remains outside this review.

---

# 49. Recommended Review Deliverable

The final read-only review should contain:

## A. Executive Finding

One concise statement of whether the current physical model is sufficient.

## B. Current Physical Model

Summary of relevant Prisma structures.

## C. Domain-to-Persistence Comparison

Concept-by-concept reconciliation.

## D. Ownership Matrix

Domain owner versus physical owner.

## E. Gap Classification

RESOLVED / REUSE / EXTENSION / NEW MODEL REQUIRED / DEPENDENCY / BLOCKED.

## F. Recommended Canonical Model

Conceptual model only.

## G. Remaining Architectural Decisions

Only unresolved decisions.

## H. Next Step

Whether a focused implementation specification can now be produced.

---

# 50. Review Completion Boundary

This document ends at the architectural review.

It does NOT authorise:

- Prisma schema changes;
- Reservation mapper changes;
- Reservation repository changes;
- test changes;
- lint remediation;
- migrations;
- database changes;
- Journey implementation.

Only after the review is accepted should a separate focused Reservation Persistence Model Specification be produced.

---

# 51. Final Review Status

**READ-ONLY REVIEW**

No implementation is authorised.

The intended sequence remains:

Read-only Reservation Persistence Model Design Review
→ Architectural Decision
→ Focused Reservation Persistence Model Specification
→ Copilot Implementation
→ Verification
→ Architect Acceptance
→ User Commit

The review must not skip directly from this document to implementation.
