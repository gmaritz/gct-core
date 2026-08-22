# GCT CORE — PERSISTENCE RECONCILIATION BATCH 3J
## Read-Only Reservation Application Contract Review

## 1. Document Control

| Field | Value |
|---|---|
| Document ID | PERSISTENCE-B3J-RESERVATION-REVIEW |
| Title | Reservation Application Contract Review |
| Project | GCT Core |
| Type | Read-Only Architecture / Contract Review |
| Status | Review Only |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS |
| Predecessor | PERSISTENCE-B3I-RESERVATION |
| Current Lint Baseline | 11 warnings |
| Implementation Authorised | NO |

---

# 2. Purpose

Determine whether the active Reservation domain and application contracts are sufficiently defined to support a safe persistence implementation.

This review exists because Batch 3I identified unresolved application-contract dependencies.

The review SHALL establish what the current code actually defines for:

1. Reservation identity;
2. Reservation number;
3. Reservation creation;
4. Customer context;
5. Journey context;
6. Reservation dates;
7. pricing;
8. lifecycle;
9. Traveller snapshots;
10. accommodation snapshots;
11. supplier state;
12. repository save/retrieval;
13. Reservation round-trip requirements.

This document MUST NOT redesign those contracts.

---

# 3. Governing Process

Follow:

`GOV-DEV-001-DEVELOPMENT-PROCESS`

Required sequence:

Read-only investigation
→ Contract findings
→ Architectural decision
→ Focused specification
→ Architect approval
→ Copilot implementation

This review MUST NOT modify:

- domain source;
- application source;
- repository interfaces;
- tests;
- Prisma schema;
- migrations;
- database;
- configuration;
- lint configuration.

No implementation is authorised.

---

# 4. Review Principle

The active codebase is the source of truth for this review.

The review MUST distinguish between:

- explicitly implemented contract;
- inferred behaviour;
- persistence requirement;
- missing contract.

Do not treat a desired future design as an existing contract.

Do not assume that an existing Prisma model represents the Reservation domain simply because its name appears related.

---

# 5. Reservation Aggregate

Inspect the active Reservation aggregate and document exactly:

- identity;
- properties;
- value objects;
- lifecycle/status;
- Traveller snapshots;
- Journey snapshot;
- accommodation snapshots;
- pricing;
- payment information;
- supplier references;
- timeline;
- metadata.

Determine which information is actually represented by the aggregate.

Do not add or remove fields during this review.

---

# 6. Reservation Identity

Determine:

1. Type of Reservation identity.
2. Where it is generated.
3. Whether it is based on request identity.
4. Whether it is immutable.
5. Whether it is exposed through the application contract.
6. Whether it is intended to be the persistent Booking identity.

Explicitly distinguish:

- technical identity;
- business reservation number.

### Required Classification

Choose:

- `TECHNICAL IDENTITY ONLY`
- `TECHNICAL + BUSINESS IDENTITY`
- `BUSINESS NUMBER EXISTS`
- `CONTRACT GAP`

---

# 7. Reservation Number

Inspect:

- Reservation aggregate;
- Reservation commands;
- Reservation DTOs;
- Reservation services;
- Reservation builder/factory;
- presenters;
- repository interfaces;
- tests;
- existing Booking number usage.

Determine whether a Reservation number currently exists anywhere in the active application contract.

Do not introduce one.

### Required Finding

State:

- whether a Reservation number exists;
- where it originates;
- whether it is generated;
- whether it is returned;
- whether it is persisted;
- whether `Booking.bookingNumber` is currently mapped to it.

If none exists:

`CONTRACT GAP — RESERVATION NUMBER`

---

# 8. Reservation Creation Contract

Inspect the active Reservation creation flow.

Document the actual input fields of:

- CreateReservationCommand;
- application service;
- builder/factory;
- Reservation constructor/factory.

Determine which values are available at creation time.

At minimum investigate:

- traveller;
- journey;
- amount;
- currency;
- Customer;
- dates;
- package/itinerary;
- lifecycle;
- reservation number.

Do not infer missing fields from Prisma.

---

# 9. Customer Context

Determine how Customer identity enters the Reservation workflow.

Inspect:

- create command;
- application service;
- customer services;
- Reservation repository;
- existing Customer relationships.

Determine whether the active Reservation application contract provides:

`customerId`

If not, classify:

`CONTRACT GAP — CUSTOMER CONTEXT`

Do not introduce Customer creation or association during this review.

---

# 10. Journey Context

Determine what the Reservation creation flow actually receives for Journey.

Inspect:

- journey ID;
- Journey snapshot;
- Journey application service;
- Reservation builder;
- package/itinerary relationships.

Determine:

- whether Journey is passed as an identity;
- whether Journey is resolved before Reservation creation;
- whether the Reservation stores a snapshot;
- what information is available to persistence.

Do not assume that Prisma Package or Itinerary represents Journey.

---

# 11. Reservation Dates

Determine where Reservation travel dates originate.

Inspect:

- Reservation creation command;
- Journey snapshot;
- accommodation snapshots;
- package/itinerary;
- date value objects;
- application services.

Determine whether the application contract explicitly supplies:

- start date;
- end date.

If dates exist only inside another snapshot, document that fact.

Do not create Booking dates during this review.

---

# 12. Pricing Contract

Inspect the active Reservation pricing contract.

Determine the authoritative sources for:

- total GCT amount;
- currency;
- supplier price;
- supplier currency;
- pricing basis.

Determine whether final GCT pricing is already represented in Reservation.

Determine whether the physical Booking amount can be mapped without changing the domain contract.

---

# 13. Lifecycle Contract

Inspect:

- ReservationStatus;
- Reservation lifecycle methods;
- Reservation services;
- commands;
- events;
- Booking status;
- operational supplier Reservation status.

Document the actual Reservation lifecycle.

Determine whether the active application contract explicitly maps domain lifecycle to a physical status.

Do not invent a Prisma lifecycle enum.

---

# 14. Lifecycle Ownership

Explicitly distinguish:

### GCT Reservation Lifecycle

The business lifecycle governing the Reservation aggregate.

### Booking Status

The existing physical/commercial Booking status.

### Supplier Reservation Status

The operational state of a supplier reservation.

Determine whether the application currently defines mappings between these concepts.

If no mapping exists:

`CONTRACT GAP — LIFECYCLE PERSISTENCE MAPPING`

---

# 15. Traveller Contract

Inspect the actual Reservation Traveller representation.

Confirm:

- `travellerSnapshots[]` cardinality;
- ordering;
- snapshot fields;
- ownership;
- creation;
- amendment;
- reconstruction.

Determine whether the application contract contains:

- Traveller identity;
- Customer identity;
- snapshot-only data;
- both.

Do not replace snapshots with relational references.

---

# 16. Traveller Snapshot Lifecycle

Determine:

1. when snapshots are captured;
2. whether snapshots are immutable;
3. whether multiple snapshots are supported;
4. whether ordering is meaningful;
5. how amendments affect snapshots;
6. what information is required to reconstruct them.

The physical model MUST follow the active application contract.

---

# 17. Journey Snapshot Contract

Inspect the actual Journey snapshot.

Determine:

- whether it is singular;
- required fields;
- identity information;
- dates;
- package information;
- itinerary information;
- ordering;
- amendment behaviour.

Determine whether the Reservation aggregate can be reconstructed entirely from its stored Journey snapshot.

Do not introduce a Journey persistence model.

---

# 18. Accommodation Snapshot Contract

Inspect the actual active accommodation representation.

Determine whether Reservation contains:

- accommodation stops;
- stop order;
- property;
- property snapshot;
- room;
- room snapshot;
- rate;
- rate snapshot;
- stay dates;
- occupancy;
- child ages;
- supplier pricing;
- provider;
- supplier references;
- booking state.

Document the actual field names and cardinalities.

Do not create new physical structures during this review.

---

# 19. Supplier State Contract

Determine the actual supplier-related information represented by Reservation.

Distinguish:

- supplier selection;
- supplier reference;
- supplier price;
- supplier booking state;
- supplier operational Reservation.

Determine whether supplier state is:

- Reservation-level;
- accommodation-stop-level;
- both.

Do not modify provider integrations.

---

# 20. Reservation Repository Contract

Inspect `IReservationRepository`.

Document the actual signatures for:

- save;
- findById;
- findByReservationNumber;
- findByTravelerId;
- findByJourneyId;
- other active methods.

Determine whether the repository currently accepts any persistence context.

Do not change the interface.

---

# 21. Save Contract

Determine exactly what the current:

`save(Reservation)`

contract provides to infrastructure.

Create a matrix:

| Required Physical Value | Available From Reservation | Available Elsewhere | Missing |
|---|---|---|---|
| Booking identity | TBD | TBD | TBD |
| Reservation number | TBD | TBD | TBD |
| Customer ID | TBD | TBD | TBD |
| Booking status | TBD | TBD | TBD |
| Booking dates | TBD | TBD | TBD |
| Currency | TBD | TBD | TBD |
| Final amount | TBD | TBD | TBD |
| Lifecycle | TBD | TBD | TBD |
| Traveller snapshots | TBD | TBD | TBD |
| Journey snapshot | TBD | TBD | TBD |
| Accommodation | TBD | TBD | TBD |
| Supplier state | TBD | TBD | TBD |

Every `TBD` MUST be resolved from source evidence or classified as a contract gap.

---

# 22. Retrieval Contract

Inspect the active repository and application retrieval flows.

Determine the actual expected result of:

- `findById`;
- `findByReservationNumber`;
- other Reservation queries.

Determine whether the current application expects a complete Reservation aggregate.

Identify every field required to reconstruct the aggregate.

---

# 23. Round-Trip Contract

Determine whether the active application/test suite establishes:

`Reservation`
→ save
→ retrieve
→ `Reservation`

as a required invariant.

Inspect existing tests for:

- identity;
- lifecycle;
- Traveller snapshots;
- Journey;
- pricing;
- accommodation;
- supplier state;
- metadata.

Do not create new tests during this review.

---

# 24. Domain/Application/Persistence Boundary

Classify each required physical value as:

- `DOMAIN OWNED`
- `APPLICATION OWNED`
- `PERSISTENCE CONTEXT`
- `PERSISTENCE DERIVED`
- `INFRASTRUCTURE ONLY`
- `CONTRACT GAP`

The review MUST NOT move values between these boundaries.

---

# 25. Booking Alignment Review

Inspect the existing Prisma `Booking` model.

Determine whether each required Booking field has an authoritative application source.

At minimum:

- `id`;
- `bookingNumber`;
- `customerId`;
- `bookingStatusId`;
- `currencyId`;
- booking dates;
- `totalAmount`;
- package/itinerary relationship.

For each field identify:

- current source;
- semantic meaning;
- application availability;
- mapping status.

Do not modify Prisma.

---

# 26. Booking Semantic Compatibility

Determine whether Prisma `Booking` is semantically compatible with the active GCT Reservation concept.

The review MUST answer:

1. Does Booking represent the commercial GCT Reservation?
2. Is Booking identity compatible with Reservation identity?
3. Is Booking number a GCT Reservation number?
4. Is Booking Customer ownership compatible?
5. Is Booking status compatible or separate?
6. Are Booking dates compatible?
7. Is Booking amount the GCT final amount?

Do not assume compatibility.

---

# 27. Application Contract Gaps

Identify all missing application-level contracts.

Each gap MUST state:

- missing concept;
- current location;
- required owner;
- reason it is required;
- whether it affects create;
- whether it affects update;
- whether it affects retrieval.

Do not resolve gaps in this review.

---

# 28. Required Decision Matrix

Produce:

| Concept | Active Contract | Physical Requirement | Result |
|---|---|---|---|
| Reservation identity | Actual source | Booking identity | RESOLVED / GAP |
| Reservation number | Actual source | Booking number | RESOLVED / GAP |
| Customer | Actual source | Booking customer | RESOLVED / GAP |
| Booking dates | Actual source | Booking dates | RESOLVED / GAP |
| Booking status | Actual source | Booking status | RESOLVED / GAP |
| GCT lifecycle | Actual source | Physical lifecycle | RESOLVED / GAP |
| Currency | Actual source | Booking currency | RESOLVED / GAP |
| Final amount | Actual source | Booking amount | RESOLVED / GAP |
| Traveller snapshots | Actual source | Snapshot persistence | RESOLVED / GAP |
| Journey snapshot | Actual source | Snapshot persistence | RESOLVED / GAP |
| Accommodation | Actual source | Physical structures | RESOLVED / GAP |
| Supplier state | Actual source | Operational state | RESOLVED / GAP |
| Save context | Actual source | Repository context | RESOLVED / GAP |
| Retrieval | Actual source | Complete graph | RESOLVED / GAP |

---

# 29. Required Recommendations

After completing the read-only evidence review, provide recommendations for each unresolved contract.

Recommendations MUST distinguish:

- existing contract should be reused;
- application contract extension required;
- domain contract extension required;
- repository contract extension required;
- physical model dependency;
- architecture decision required.

Do not implement the recommendation.

---

# 30. Critical Architectural Question

The review MUST explicitly answer:

**Is the existing Prisma `Booking` model actually the correct physical root for the active GCT Reservation aggregate?**

Possible outcomes:

- `YES — SEMANTICALLY ALIGNED`
- `YES — WITH CONTRACT EXTENSIONS`
- `PARTIALLY ALIGNED`
- `NO — DIFFERENT BUSINESS CONCEPT`
- `UNRESOLVED`

Evidence MUST be provided.

---

# 31. Required Copilot Recommendation

Copilot SHALL provide a recommendation on the safest architecture based on the actual codebase.

The recommendation MUST address:

1. Reservation identity;
2. Reservation number;
3. Customer context;
4. Booking dates;
5. Booking status;
6. GCT lifecycle;
7. Traveller snapshots;
8. Journey snapshot;
9. accommodation snapshots;
10. persistence context;
11. repository contract;
12. Booking physical-root suitability.

The recommendation is advisory only.

It does NOT authorise implementation.

---

# 32. Read-Only Restrictions

This review MUST NOT:

- modify domain code;
- modify application code;
- modify repository interfaces;
- modify tests;
- modify Prisma schema;
- generate migrations;
- modify database;
- modify configuration;
- change ESLint;
- remove lint warnings;
- create commits.

---

# 33. Verification

No implementation verification is required.

The existing baseline SHOULD remain:

- Build: passing;
- Prisma validation: passing;
- Lint: 0 errors, 11 warnings;
- no source changes.

Any unexpected source modification MUST be reported.

---

# 34. Required Final Report

Copilot MUST return:

## Executive Decision

State whether the active Reservation application contract is sufficiently defined.

## Reservation Contract

Report:

- identity;
- reservation number;
- creation inputs;
- Customer;
- dates;
- pricing;
- lifecycle.

## Snapshot Contract

Report:

- Traveller snapshots;
- Journey snapshot;
- accommodation snapshots;
- supplier state.

## Repository Contract

Report actual save/retrieval signatures and limitations.

## Booking Compatibility

State whether Prisma Booking is semantically aligned with Reservation.

## Contract Gap Matrix

Provide the completed matrix from Section 28.

## Recommendations

Provide a recommendation for every unresolved gap.

## Proposed Next Step

Recommend the smallest next architectural step.

---

# 35. Successful Outcome

The review succeeds when we have an evidence-based answer to:

**What does the active GCT Reservation application contract actually require, and what must change before persistence can safely implement it?**

The result does NOT need to eliminate all gaps.

It must make every gap explicit and assign it to the correct architectural owner.

---

# 36. Completion Boundary

3J ends with the read-only findings and recommendations.

It does NOT authorise:

- contract implementation;
- domain changes;
- application changes;
- repository changes;
- Prisma changes;
- migrations;
- database changes;
- lint remediation.

The next document SHALL be determined from the 3J findings.

---

# 37. Final Status

**READ-ONLY RESERVATION APPLICATION CONTRACT REVIEW**

Implementation is NOT authorised.

Required progression:

3J Read-Only Application Contract Review
→ Architectural Findings / Recommendation
→ Focused Contract or Model Specification
→ Architect Approval
→ Implementation
→ Verification
→ Acceptance
→ User Commit