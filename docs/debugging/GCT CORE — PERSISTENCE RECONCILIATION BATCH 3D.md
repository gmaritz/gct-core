# GCT CORE — PERSISTENCE RECONCILIATION BATCH 3D
## Read-Only Reservation Physical Model Decision Review

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B3D-RESERVATION-REVIEW |
| Title | Reservation Physical Model Decision Review |
| Project | GCT Core |
| Type | Read-Only Architecture / Decision Review |
| Status | Review Only |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Predecessor | PERSISTENCE-B3C-RESERVATION |
| Current Lint Warnings | 11 |
| Reservation Warnings | 4 |
| Implementation Authorised | NO |

---

## 2. Purpose

This review exists because Batch 3C was correctly blocked.

The current domain Reservation model and Prisma persistence model do not yet establish a sufficiently explicit physical representation for the accepted Reservation state.

The purpose of this review is to resolve the specific physical-model decisions that prevented Batch 3C implementation.

This document is:

- read-only;
- architectural;
- decision-oriented.

It MUST NOT modify source code, tests, Prisma schema, database, configuration, or generated artifacts.

---

## 3. Governing Process

This review follows:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

The required sequence is:

Read-only investigation
→ Decision findings
→ Physical model decision
→ Focused implementation specification
→ Copilot implementation

No implementation may begin from this document.

---

## 4. Predecessor Findings

Batch 3C was blocked for four primary reasons:

1. Reservation root mismatch.
2. Traveller relationship gap.
3. Accommodation snapshot persistence gap.
4. Journey persistence dependency.

These are the only primary decision areas for this review.

Do not reopen already accepted Traveller persistence decisions unless evidence shows a direct contradiction.

---

# 5. Decision Area 1 — Reservation Physical Root

## 5.1 Question

Determine what physical persistence structure represents the GCT Reservation aggregate.

The current candidate is Prisma `Booking`.

The review MUST establish whether `Booking` can serve as the physical Reservation root without incorrectly forcing Booking-specific fields into the domain Reservation aggregate.

---

## 5.2 Required Investigation

Inspect:

- domain `Reservation`;
- Reservation creation/application services;
- Reservation repository contract;
- Reservation mapper;
- Prisma `Booking`;
- Prisma `BookingItem`;
- Prisma `Reservation`;
- existing booking lifecycle/status structures.

Determine:

- which fields identify the GCT Reservation;
- which fields identify a commercial booking;
- which fields belong to supplier operational reservations;
- which fields are already represented by related structures.

---

## 5.3 Root Decision Criteria

The physical root MUST:

- uniquely identify the GCT Reservation;
- support reservation number;
- support GCT commercial lifecycle;
- support final GCT commercial price;
- support Traveller association;
- support package/itinerary association where required;
- support related accommodation reservation state.

The domain model MUST NOT be expanded merely to mirror Prisma.

---

## 5.4 Required Outcome

Classify the Booking root as one of:

- **CONFIRMED ROOT**
- **ROOT WITH EXTENSION**
- **UNSUITABLE ROOT**
- **DECISION BLOCKED**

If `Booking` is confirmed as root, identify which existing Booking fields correspond to the Reservation contract.

If Booking requires an extension, identify the exact missing concept.

Do not implement the extension.

---

# 6. Decision Area 2 — Reservation Identity and Number

## 6.1 Question

Determine how the physical Reservation root represents:

- domain Reservation identity;
- GCT reservation number.

---

## 6.2 Required Investigation

Inspect:

- Reservation aggregate identity;
- Reservation creation;
- existing Reservation number usage;
- Prisma `Booking.id`;
- Prisma `Booking.bookingNumber`;
- application/API references to reservation number.

Determine whether:

`Booking.id`

is the physical representation of the domain Reservation identity.

Determine whether:

`Booking.bookingNumber`

is the canonical GCT reservation number.

---

## 6.3 Decision Criteria

Do not create a second physical reservation number if the existing Booking number is already canonical.

Do not use:

- supplier reservation reference;
- supplier booking reference;
- BookingItem ID;

as the GCT Reservation number.

---

## 6.4 Required Outcome

Classify:

- Reservation identity: **RESOLVED / GAP / BLOCKED**
- Reservation number: **RESOLVED / GAP / BLOCKED**

---

# 7. Decision Area 3 — Traveller Relationship

## 7.1 Question

Determine how a persisted GCT Reservation references the canonical Traveller.

Traveller persistence itself is already established.

The unresolved issue is specifically the Reservation relationship.

---

## 7.2 Required Investigation

Inspect:

- Prisma Customer;
- Prisma Traveller;
- Prisma Booking;
- Prisma BookingContact;
- Reservation domain;
- Traveller domain;
- Reservation application services;
- existing repository contracts.

Determine whether:

- Booking can directly reference Traveller;
- an existing relationship provides the required identity;
- BookingContact is merely contact information;
- an intermediate relationship is required.

---

## 7.3 Required Decision

The review MUST determine whether the physical relationship should conceptually be:

`Reservation → Traveller`

or:

`Reservation → existing intermediate structure → Traveller`

or another already-existing canonical relationship.

BookingContact MUST NOT automatically be treated as the Traveller aggregate.

---

## 7.4 Constraints

Do not:

- redesign Customer;
- redesign Traveller;
- move email ownership;
- duplicate Traveller information;
- create implicit Customers;
- create implicit Travellers.

---

## 7.5 Required Outcome

Classify the relationship as:

- **DIRECT RELATIONSHIP**
- **EXISTING INTERMEDIATE RELATIONSHIP**
- **EXTENSION REQUIRED**
- **BLOCKED**

---

# 8. Decision Area 4 — Accommodation Snapshot Root

## 8.1 Question

Determine the physical representation required for the APP-004 accommodation reservation snapshot.

The snapshot must preserve historical Reservation state rather than depending exclusively on mutable accommodation catalogue data.

---

## 8.2 Required Concepts

The review MUST determine physical ownership for:

- accommodation stop;
- stop order;
- property;
- room;
- rate;
- stay dates;
- occupancy;
- child ages;
- provider;
- supplier references;
- supplier price;
- currency;
- pricing basis;
- booking state.

---

## 8.3 Existing Structure Investigation

Inspect the current Prisma structures relating to:

- Booking;
- BookingItem;
- Accommodation;
- Hotel;
- Room;
- Rate;
- supplier/provider;
- availability;
- pricing;
- booking state.

Determine which existing structures represent:

- catalogue data;
- transaction data;
- historical snapshot data;
- supplier operational state.

---

## 8.4 Snapshot Principle

The Reservation MUST retain enough information to reconstruct the selected accommodation state as it existed when the Reservation was created/priced.

The review MUST distinguish:

**Catalogue reference**

from:

**Reservation snapshot**

from:

**Supplier booking state**.

---

## 8.5 Required Outcome

Classify each required concept as:

- **EXISTING STRUCTURE**
- **EXISTING STRUCTURE CAN BE EXTENDED**
- **NEW RESERVATION STRUCTURE REQUIRED**
- **DEPENDENCY**
- **BLOCKED**

No schema changes are authorised during this review.

---

# 9. Decision Area 5 — Accommodation Stops

## 9.1 Question

Determine how multiple accommodation stops are physically represented.

APP-004 supports package journeys containing multiple accommodation stops.

---

## 9.2 Required Properties

Each stop must conceptually preserve:

- stop identity;
- stop order;
- accommodation selection;
- stay dates;
- associated booking state.

---

## 9.3 Required Investigation

Determine whether the current Booking/BookingItem model already represents an ordered set of accommodation stops.

If BookingItem can represent this safely, establish the semantic mapping.

If not, determine whether a Reservation-owned accommodation-stop structure is required.

---

## 9.4 Required Outcome

Classify:

- **REUSE BOOKING ITEM**
- **EXTEND EXISTING STRUCTURE**
- **NEW STOP STRUCTURE REQUIRED**
- **BLOCKED**

---

# 10. Decision Area 6 — Property, Room and Rate

## 10.1 Question

Determine how the physical model preserves:

Property
→ Room
→ Rate

for the selected Reservation.

---

## 10.2 Required Investigation

Inspect existing catalogue structures and determine whether they can safely be referenced by historical Reservation records.

The review MUST determine what information must be copied into the Reservation snapshot rather than referenced.

---

## 10.3 Historical Integrity

The Reservation MUST NOT become dependent on a future catalogue state to determine what the customer selected.

At minimum, the review must establish preservation requirements for:

- property identity/name/reference;
- room identity/name/reference;
- rate identity/reference;
- provider/supplier references.

---

## 10.4 Required Outcome

For each of Property, Room and Rate classify:

- **REFERENCE SUFFICIENT**
- **SNAPSHOT REQUIRED**
- **REFERENCE + SNAPSHOT REQUIRED**
- **BLOCKED**

---

# 11. Decision Area 7 — Multi-Room Occupancy

## 11.1 Question

Determine how the physical model preserves multiple rooms and room-level occupancy.

---

## 11.2 Required Information

Each room must conceptually preserve:

- adults;
- children;
- child ages.

---

## 11.3 Required Investigation

Determine whether the current physical model can represent:

- multiple rooms;
- room-level occupancy;
- multiple child ages.

Do not assume a Booking-level participant count is sufficient.

---

## 11.4 Required Outcome

Classify:

- **EXISTING STRUCTURE**
- **EXTENSION REQUIRED**
- **NEW STRUCTURE REQUIRED**
- **BLOCKED**

---

# 12. Decision Area 8 — Supplier Pricing

## 12.1 Question

Determine where supplier accommodation pricing is physically persisted.

---

## 12.2 Required Information

Preserve:

- supplier amount;
- supplier currency;
- pricing basis.

---

## 12.3 Separation Requirement

Supplier price MUST remain distinct from:

**Final GCT package price.**

The review must identify whether the current schema already contains an appropriate supplier-price representation.

---

## 12.4 Required Outcome

Classify:

- **EXISTING STRUCTURE**
- **EXTENSION REQUIRED**
- **NEW STRUCTURE REQUIRED**
- **BLOCKED**

---

# 13. Decision Area 9 — Final GCT Price

## 13.1 Question

Determine where the final GCT commercial Reservation price is physically persisted.

---

## 13.2 Required Investigation

Inspect:

- Booking amount;
- Booking currency;
- pricing structures;
- Reservation domain price;
- APP-005 output.

Determine whether:

`Booking.totalAmount`

and its currency representation are the canonical physical representation.

---

## 13.3 Required Outcome

Classify:

- **BOOKING PRICE IS CANONICAL**
- **BOOKING PRICE REQUIRES EXTENSION**
- **SEPARATE RESERVATION PRICE REQUIRED**
- **BLOCKED**

---

# 14. Decision Area 10 — Provider and Supplier References

## 14.1 Question

Determine where provider-neutral supplier references are physically retained.

---

## 14.2 Required References

Where applicable:

- provider identity;
- property reference;
- room reference;
- rate reference;
- supplier item reference;
- supplier booking reference.

---

## 14.3 Constraints

References MUST remain opaque.

The persistence model MUST NOT become Hotelbeds-specific.

---

## 14.4 Required Outcome

Determine which existing structures can preserve these references and identify any gaps.

---

# 15. Decision Area 11 — Per-Stop Booking State

## 15.1 Question

Determine how supplier booking state is associated with individual accommodation stops.

---

## 15.2 Required States

The physical model must be capable of distinguishing, where applicable:

- pending;
- revalidation required;
- validated;
- booking attempted;
- confirmed;
- failed;
- unknown.

---

## 15.3 Multi-Stop Requirement

For a Reservation with multiple accommodation stops:

- each stop must have independently recoverable booking state;
- each stop may have its own supplier booking reference;
- one stop's state must not overwrite another.

---

## 15.4 Required Outcome

Classify:

- **EXISTING RESERVATION STRUCTURE SUFFICIENT**
- **BOOKING ITEM SUFFICIENT**
- **EXTENSION REQUIRED**
- **NEW STOP BOOKING STRUCTURE REQUIRED**
- **BLOCKED**

---

# 16. Decision Area 12 — Journey

## 16.1 Question

Determine how the Reservation's required Journey identity/snapshot is physically represented.

---

## 16.2 Constraints

The review MUST NOT create:

- Prisma Journey model;
- Journey repository;
- Journey migration.

---

## 16.3 Investigation

Inspect:

- Booking;
- BookingItem;
- Itinerary;
- package structures;
- existing journey references.

Determine whether an existing physical relationship is already semantically equivalent to the required Journey representation.

---

## 16.4 Required Outcome

Classify:

- **EXISTING REPRESENTATION SUFFICIENT**
- **EXISTING REPRESENTATION CAN BE EXTENDED**
- **JOURNEY PERSISTENCE DEPENDENCY**
- **BLOCKED**

---

# 17. Physical Ownership Matrix

The completed review MUST produce this matrix from actual source/schema evidence:

| Concept | Domain Owner | Candidate Physical Owner | Decision |
|---|---|---|---|
| Reservation identity | Reservation | Booking | TBD |
| Reservation number | Reservation | Booking.bookingNumber | TBD |
| Traveller | Traveller | Booking / relationship | TBD |
| Journey | Journey | Booking / Itinerary | TBD |
| GCT lifecycle | Reservation | Booking status | TBD |
| Final GCT price | Pricing / Reservation | Booking amount | TBD |
| Accommodation stop | Reservation | BookingItem / new structure | TBD |
| Property | Accommodation selection | Catalogue + snapshot | TBD |
| Room | Accommodation selection | Catalogue + snapshot | TBD |
| Rate | Accommodation selection | Catalogue + snapshot | TBD |
| Occupancy | Accommodation selection | BookingItem / room structure | TBD |
| Child ages | Accommodation selection | Room structure | TBD |
| Supplier price | Accommodation snapshot | Reservation structure | TBD |
| Provider | Supplier boundary | Existing supplier relation | TBD |
| Supplier reference | Supplier boundary | Reservation / stop | TBD |
| Booking state | Reservation / supplier booking | Reservation / stop | TBD |

No `TBD` values may remain in the final decision report unless explicitly classified as a dependency or block.

---

# 18. Domain-to-Physical Mapping

The review MUST produce a conceptual mapping showing:

**Domain Reservation**

→ physical Reservation root

→ accommodation stops

→ accommodation room selections

→ occupancy

→ supplier booking state

and identify all unresolved relationships.

The mapping must distinguish:

- domain concepts;
- physical structures;
- external catalogue references;
- historical snapshot data.

---

# 19. Snapshot Versus Catalogue

The review MUST explicitly determine which fields are:

### Reference Data

Values that may safely reference a canonical catalogue.

### Snapshot Data

Values that must be retained on the Reservation for historical integrity.

### Operational Data

Values that may change during supplier booking lifecycle.

This classification is required before schema design.

---

# 20. Snapshot Versus Supplier State

The review MUST explicitly separate:

**Selection Snapshot**

from:

**Supplier Operational State**.

The snapshot includes selected accommodation and pricing information.

Supplier state includes booking attempts, confirmation, failure and supplier references.

The physical design must not allow supplier-state updates to destroy historical selection data.

---

# 21. Existing Schema Reuse

The architectural preference is:

1. reuse existing structure where semantically correct;
2. extend existing structure where appropriate;
3. create a new Reservation-owned structure only where necessary;
4. identify another bounded-context dependency where appropriate.

Do not create duplicate business concepts.

---

# 22. New Model Threshold

A new physical model is justified only where:

- no existing structure represents the concept;
- the concept has independent identity/lifecycle;
- forcing it into an existing model would lose information or violate ownership.

The review must explain why a new model is required rather than simply stating that a field is missing.

---

# 23. Domain Model Protection

The review MUST NOT recommend expanding the domain Reservation merely to mirror missing Prisma fields.

The physical model exists to persist the domain model.

It is not the authority for redefining the domain model.

---

# 24. Persistence Boundary

The eventual architecture MUST preserve:

Domain
→ Application
→ Repository Interface
→ Infrastructure Repository
→ Prisma

Prisma-specific structures MUST remain in infrastructure.

The domain MUST remain provider-neutral and persistence-neutral.

---

# 25. Mapper Dependency

The four Reservation `no-explicit-any` warnings are downstream of the unresolved physical model.

The review must identify what physical model decision is required before:

- mapper persistence types;
- mapper query types;
- repository payload types;

can be safely established.

No lint remediation is performed during this review.

---

# 26. Repository Dependency

The review must identify which repository query shapes are required to reconstruct the Reservation.

It must determine which relations need to be loaded.

Do not change repository queries during this review.

---

# 27. PrismaService Dependency

PrismaService is outside this review.

The review MUST NOT attempt to resolve the remaining PrismaService `no-explicit-any` warnings.

---

# 28. Traveller Dependency

Traveller persistence is considered resolved.

The review MUST use the accepted Traveller persistence model as a dependency.

Only the Reservation relationship to Traveller remains under review.

---

# 29. Read-Only Restrictions

During this review:

- source files MUST NOT be modified;
- tests MUST NOT be modified;
- Prisma schema MUST NOT be modified;
- migrations MUST NOT be generated;
- database MUST NOT be modified;
- configuration MUST NOT be modified;
- lint configuration MUST NOT be modified;
- generated artifacts MUST NOT be intentionally changed.

---

# 30. Required Verification

The review MAY inspect existing verification evidence.

It MUST NOT perform implementation work merely to obtain a passing result.

The review should confirm the current baseline:

- Jest: current repository baseline;
- Build: current repository baseline;
- Prisma validation: current repository baseline;
- Lint: 0 errors, 11 warnings.

No warning reduction is expected.

---

# 31. Required Decision Report

The completed review MUST contain:

## A. Executive Decision

One concise statement describing whether the Reservation physical model can now be defined.

## B. Reservation Root Decision

State whether Booking is:

- confirmed;
- confirmed with extension;
- unsuitable;
- blocked.

## C. Identity Decision

State physical representations for:

- Reservation identity;
- reservation number.

## D. Traveller Decision

State the canonical physical relationship.

## E. Accommodation Decision

State the physical ownership of:

- stops;
- property;
- room;
- rate;
- occupancy;
- child ages.

## F. Pricing Decision

State:

- final GCT price;
- supplier price;
- pricing basis.

## G. Supplier State Decision

State:

- provider;
- supplier references;
- booking state;
- per-stop state.

## H. Journey Decision

State whether an existing physical representation is sufficient or Journey remains a dependency.

## I. Physical Model

Provide the resulting conceptual persistence structure.

## J. Remaining Dependencies

List only unresolved decisions.

---

# 32. Decision Classification

Every required concept MUST be classified as exactly one of:

- **RESOLVED**
- **REUSE**
- **EXTENSION REQUIRED**
- **NEW MODEL REQUIRED**
- **DEPENDENCY**
- **BLOCKED**

---

# 33. Successful Review Outcome

The review is successful only if it establishes enough information to write a focused implementation specification without requiring Copilot to invent persistence architecture.

The intended outcome is:

**PHYSICAL MODEL DECISION ESTABLISHED**

If achieved, the next document will be:

**PERSISTENCE-B3E — Focused Reservation Physical Model Implementation Specification**

---

# 34. Unsuccessful Review Outcome

If any primary decision remains unresolved, the review MUST identify:

- the exact unresolved concept;
- why current evidence is insufficient;
- which architectural decision is required;
- which implementation work remains blocked.

Do not produce an implementation specification until those decisions are resolved.

---

# 35. Completion Boundary

This document ends at the physical-model decision.

It does NOT authorise:

- Prisma schema changes;
- Reservation mapper changes;
- Reservation repository changes;
- tests;
- lint remediation;
- migrations;
- database changes;
- Journey implementation.

The next implementation specification may only be produced after the physical-model decisions are accepted.

---

# 36. Final Status

**READ-ONLY ARCHITECTURAL DECISION REVIEW**

No implementation is authorised.

Required progression:

3D Read-Only Physical Model Decision Review
→ Accepted Physical Model
→ 3E Focused Implementation Specification
→ Architect Approval
→ Copilot Implementation
→ Verification
→ Architect Acceptance
→ User Commit