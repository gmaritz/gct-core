# APP-004 — End-to-End Accommodation Booking Orchestration

## Document Control

| Field | Value |
|---|---|
| Document ID | APP-004 |
| Title | End-to-End Accommodation Booking Orchestration |
| Version | 1.0.0 |
| Status | Implementation Specification |
| Capability | APP-004 Reservation |
| Related Capabilities | APP-003 Journey, APP-005 Pricing, APP-008 Accommodation |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS.md |
| Scope | Connect the existing accepted accommodation selection, pricing, reservation, revalidation and booking implementations into the production runtime flow |

## 1. Purpose

This specification addresses the implementation gap identified by the read-only end-to-end dependency review.

The existing capabilities and canonical contracts are considered architecturally sufficient. The missing work is production orchestration.

The required production flow is:

APP-003
Package Accommodation Selection

↓

APP-005
Accommodation-to-Package Pricing

↓

APP-004
Reservation Construction

↓

APP-008.4
Revalidation where required

↓

APP-008.5
Accommodation Booking

↓

APP-004
Reservation Update and Persistence

The implementation SHALL connect these existing capabilities without redesigning their accepted contracts.

## 2. Business Objective

A GCT private package may contain multiple accommodation stops.

For each stop the client selects:

- accommodation/property;
- room;
- rate;
- occupancy.

The selected accommodation contributes to the GCT package price.

When the package is ready for booking, the system must:

1. preserve the client's complete selections;
2. preserve the final GCT package price;
3. create the reservation;
4. revalidate selected rates where required;
5. book the accommodation with the correct supplier;
6. associate each supplier booking with the correct reservation and package stop;
7. persist the resulting booking state.

The system SHALL support multiple accommodation stops and multiple suppliers.

## 3. Governing Architecture

The existing capability ownership remains unchanged.

### APP-003 — Journey

Owns:

- package journey composition;
- package-stop context;
- accommodation selection;
- Property → Room → Rate selection;
- selected occupancy.

### APP-005 — Pricing

Owns:

- accommodation pricing inputs;
- package pricing;
- GCT pricing rules;
- final customer-facing package price.

### APP-004 — Reservation

Owns:

- reservation construction;
- reservation snapshots;
- booking orchestration;
- reservation state;
- persistence of reservation state.

### APP-008 — Accommodation Supplier Operations

Owns:

- availability;
- revalidation;
- supplier booking;
- cancellation;
- modification;
- booking retrieval.

No ownership boundaries SHALL be changed by this iteration.

## 4. Existing Accepted Contracts

The implementation SHALL use the existing accepted implementations and contracts for:

- APP-003 accommodation selection;
- APP-005 accommodation pricing;
- APP-004 reservation handoff;
- APP-008.4 revalidation;
- APP-008.5 booking.

Copilot SHALL inspect the current implementation before making changes.

Do not create duplicate contracts where an accepted contract already exists.

## 5. Required Runtime Flow

The production runtime SHALL implement the following logical sequence:

1. Receive the selected package/journey accommodation information.
2. Construct the APP-005 accommodation pricing inputs.
3. Execute the existing APP-005 pricing flow.
4. Obtain the final GCT package price.
5. Construct the APP-004 reservation and accommodation snapshots.
6. For each selected accommodation stop, determine whether revalidation is required.
7. Revalidate `RECHECK` selections through APP-008.4.
8. Use the validated offer for booking.
9. Book through APP-008.5 using the provider-neutral booking contract.
10. Associate the result with the correct reservation and package stop.
11. Persist the resulting reservation/supplier state using the existing APP-004 persistence boundary.

The actual service and class structure SHALL be determined by Copilot based on the existing architecture.

## 6. APP-003 → APP-005

The implementation SHALL connect the existing APP-003 selection output to the existing APP-005 pricing input flow.

The following information SHALL remain available:

- package identity;
- package stop identity;
- stop order where applicable;
- accommodation;
- room;
- rate;
- provider;
- opaque supplier reference;
- stay dates;
- occupancy;
- child ages;
- supplier accommodation amount;
- supplier currency;
- pricing basis.

The implementation SHALL not reconstruct selection information from supplier DTOs.

## 7. Multi-Stop Packages

The production flow SHALL support an ordered collection of accommodation stops.

Example:

Stop 1 → Property A → Room A → Rate A

Stop 2 → Property B → Room B → Rate B

Stop 3 → Property C → Room C → Rate C

Each stop SHALL remain independently identifiable.

The same property MAY occur at multiple stops.

Stop identity SHALL prevent selections, prices, guests or bookings from being merged incorrectly.

The implementation SHALL not assume that a package contains only one accommodation stop.

## 8. APP-005 Pricing

The existing APP-005 pricing architecture remains authoritative.

The implementation SHALL:

- create accommodation pricing inputs from the selected accommodation data;
- execute the existing pricing engine;
- preserve the final GCT package price;
- preserve supplier accommodation pricing separately.

APP-004 SHALL consume the final GCT package price.

APP-004 SHALL NOT recalculate GCT package pricing.

Supplier accommodation price SHALL NOT replace the final customer-facing package price.

## 9. APP-005 → APP-004

The priced package SHALL provide sufficient information to construct the APP-004 reservation.

The reservation SHALL retain, where applicable:

- package identity;
- stop identity;
- accommodation;
- room;
- rate;
- provider;
- supplier reference;
- stay dates;
- occupancy;
- child ages;
- supplier price;
- currency;
- pricing basis;
- final GCT package price.

The existing APP-004 accommodation snapshot contract SHALL be used.

Do not create a second accommodation snapshot model.

## 10. Reservation Construction

The reservation SHALL be created from the priced package and selected accommodation information.

The reservation SHALL preserve the client's selected transaction state independently from subsequent supplier changes.

Supplier revalidation or booking results SHALL NOT silently replace the original customer selection.

The existing APP-004 Reservation aggregate and persistence architecture SHALL remain authoritative.

## 11. Multi-Room Occupancy

The complete runtime flow SHALL preserve independent occupancy for each selected room group.

Each room group SHALL preserve:

- adults;
- children;
- child ages.

The implementation SHALL not reduce multi-room occupancy to:

- a single room count;
- one aggregate guest group;
- one global occupancy structure.

## 12. Guest Association

Accommodation booking requests SHALL associate guests with the correct room and stop.

The implementation SHALL NOT send one global package guest collection independently to every accommodation booking request.

The required logical structure is:

Package Stop
→ Accommodation
→ Room
→ Guests

Guest allocation SHALL remain consistent with the selected occupancy.

Child ages SHALL remain consistent with the relevant room occupancy.

Copilot SHALL determine the appropriate implementation using the existing Journey, Reservation and Booking contracts.

## 13. Supplier Provider Continuity

Each accommodation selection SHALL retain its provider identity and opaque supplier reference.

The booking operation SHALL use the provider associated with that selection.

The implementation SHALL NOT assume that all accommodation stops use the same supplier.

Example:

Stop 1 → Supplier A

Stop 2 → Supplier B

Stop 3 → Supplier A

Provider identity SHALL remain associated with each individual stop.

## 14. RECHECK Flow

When a selected rate requires revalidation, the runtime flow SHALL be:

Reservation Selection

↓

APP-008.4 Revalidation

↓

Validated Offer

↓

APP-008.5 Booking

A `RECHECK` selection SHALL NOT proceed directly to booking.

The existing `AccommodationRateRevalidationService` SHALL be used.

The implementation SHALL not duplicate CheckRate logic inside APP-004.

## 15. BOOKABLE Flow

When a selected rate is already `BOOKABLE`, the runtime flow MAY proceed directly to APP-008.5.

The existing APP-008.5 booking service SHALL be used.

APP-004 SHALL construct or obtain the existing canonical `AccommodationBookingRequest`.

APP-004 SHALL not construct Hotelbeds-specific requests.

## 16. Revalidated Offer Continuity

When APP-008.4 returns a valid revalidated offer, the booking operation SHALL use the validated supplier offer.

Where the accepted revalidation contract provides updated information, the implementation SHALL preserve the relevant:

- supplier reference;
- supplier price;
- currency;
- occupancy;
- board;
- payment conditions;
- packaging conditions;
- cancellation conditions;
- tax information.

The implementation SHALL follow the existing APP-008.4 contract rather than inventing new revalidation semantics.

## 17. Booking Request

The APP-008.5 booking request SHALL be constructed through the existing canonical booking contract.

It SHALL contain the information required by that contract, including where applicable:

- provider;
- supplier offer reference;
- stay dates;
- holder;
- room-associated guests;
- occupancy;
- idempotency key.

The implementation SHALL not expose or interpret Hotelbeds-specific fields outside APP-008.

## 18. Booking Result

A successful accommodation booking SHALL return sufficient information to APP-004 to update the reservation.

At minimum, where supplied by APP-008.5, preserve:

- provider;
- supplier booking reference;
- confirmation reference;
- supplier booking state;
- supplier price;
- relevant stop/accommodation association.

The booking result SHALL be associated with the correct package stop.

## 19. Booking Result Association

For a multi-stop package, booking results SHALL remain independently associated.

Example:

Reservation

- Stop 1 → Supplier Booking A
- Stop 2 → Supplier Booking B
- Stop 3 → Supplier Booking C

The implementation SHALL not store one global supplier booking reference when multiple independent accommodation bookings exist.

The existing APP-004 reservation model SHALL be used where possible.

If the existing persistence boundary cannot represent an already-established canonical requirement, Copilot SHALL report the specific limitation rather than inventing a parallel persistence architecture.

## 20. UNKNOWN Booking Outcome

An `UNKNOWN` supplier booking result SHALL NOT be treated as confirmed.

The reservation SHALL remain in an appropriate unresolved state using the existing APP-004 lifecycle.

The implementation SHALL NOT automatically:

- cancel the booking;
- retry the booking;
- create a second booking.

APP-008.8 remains responsible for retrieving the supplier's current booking state.

## 21. FAILED Booking Outcome

A failed booking SHALL not be represented as a confirmed accommodation booking.

The existing APP-004 reservation lifecycle SHALL determine the appropriate reservation state.

Do not invent new failure-state semantics unless required by the existing canonical contracts.

## 22. Persistence

The existing APP-004 reservation persistence mechanism SHALL remain authoritative.

The implementation SHALL ensure that the complete accommodation snapshot and resulting supplier booking information can reach the existing persistence boundary.

At minimum, the persisted state must support the established downstream accommodation operations:

- cancellation;
- modification;
- booking-details retrieval.

No new database architecture is part of this iteration.

No Prisma schema changes are expected.

If Copilot identifies a genuine existing persistence contract incompatibility, it SHALL stop and report the issue rather than redesigning the database.

## 23. Supplier Isolation

APP-003, APP-005 and APP-004 SHALL remain supplier-neutral.

They SHALL NOT contain:

- Hotelbeds DTO imports;
- Hotelbeds endpoint paths;
- Hotelbeds authentication;
- Hotelbeds response envelopes;
- Hotelbeds `rateKey` interpretation;
- Hotelbeds-specific status handling.

Hotelbeds-specific behaviour remains inside APP-008.

## 24. Multiple Suppliers

The production orchestration SHALL select the correct provider for every accommodation stop.

Provider selection SHALL be based on the canonical provider/reference information already established by APP-008.

A future accommodation supplier SHALL be able to participate without changing:

- Journey contracts;
- Pricing contracts;
- Reservation contracts;
- package pricing rules.

## 25. Idempotency

The existing APP-008.5 booking idempotency requirement SHALL be respected.

The implementation SHALL provide an appropriate idempotency key to each supplier booking operation.

For multiple accommodation stops, idempotency SHALL prevent accidental duplication of an individual supplier booking.

Do not create a separate idempotency persistence architecture.

## 26. Error Handling

The implementation SHALL preserve existing canonical error/outcome semantics.

It SHALL NOT convert:

- unavailable;
- failed;
- unknown

into successful bookings.

Supplier errors SHALL remain behind the APP-008 provider boundary.

APP-004 SHALL react to canonical outcomes rather than Hotelbeds-specific error structures.

## 27. Atomicity and Partial Booking

A multi-stop package may involve multiple independent supplier booking operations.

The implementation SHALL NOT assume that all supplier bookings succeed atomically.

If one stop succeeds and another fails or becomes unknown:

- already-established supplier results SHALL not be falsely discarded;
- unsuccessful stops SHALL not be represented as confirmed;
- the reservation SHALL preserve sufficient state for operational resolution.

Copilot SHALL use the existing APP-004 reservation lifecycle and canonical outcome model to determine the appropriate implementation.

Do not introduce distributed transactions.

Do not introduce automatic rollback through supplier cancellation unless explicitly supported by existing business rules.

## 28. Existing Capability Protection

The following SHALL remain unchanged unless a direct integration defect makes a minimal compatible correction necessary:

- APP-003 accommodation selection contracts;
- APP-005 pricing engine and pricing rules;
- APP-008.4 revalidation semantics;
- APP-008.5 booking semantics;
- Hotelbeds DTOs;
- Hotelbeds transport;
- provider capability architecture;
- supplier-neutral references;
- GCT pricing ownership;
- APP-004 reservation ownership.

The objective is orchestration, not redesign.

## 29. Required Implementation Work

Copilot SHALL:

1. Inspect the existing APP-003 implementation.
2. Inspect the existing APP-005 implementation.
3. Inspect the existing APP-004 implementation.
4. Inspect the existing APP-008.4 and APP-008.5 implementations.
5. Trace the actual runtime call graph.
6. Connect the existing APP-003 selection to APP-005 pricing.
7. Connect the priced package to APP-004 reservation creation.
8. Connect APP-004 to APP-008.4 when revalidation is required.
9. Connect APP-004 to APP-008.5 for booking.
10. Return booking results to APP-004.
11. Persist the resulting reservation state through the existing boundary.
12. Preserve multi-stop identity.
13. Preserve multi-room occupancy.
14. Correctly partition guests by stop and room.
15. Preserve provider identity and opaque references.
16. Preserve final GCT package pricing separately from supplier accommodation pricing.

Copilot SHALL use its implementation expertise to determine the appropriate classes, services, orchestration boundaries and adapters within the established architecture.

## 30. Implementation Decision Authority

This specification defines the required business outcome, architectural boundaries and invariants.

Copilot is responsible for normal implementation decisions, including:

- service composition;
- dependency injection;
- method placement;
- orchestration structure;
- mapping implementation;
- test structure;
- compatible refactoring required to connect existing contracts.

Do not wait for additional architectural approval for ordinary implementation decisions.

If a genuine contradiction with an accepted architecture or canonical specification is discovered, stop and report it.

## 31. Out of Scope

This iteration SHALL NOT implement:

- new availability functionality;
- new revalidation functionality;
- new booking-provider functionality;
- cancellation;
- booking modification;
- booking retrieval;
- payment;
- refunds;
- invoices;
- vouchers;
- communications;
- supplier reconciliation;
- new accommodation suppliers;
- database redesign;
- Prisma redesign;
- broad lint-warning remediation;
- unrelated refactoring;
- Hotelbeds certification activity.

## 32. Required Tests

Focused tests SHALL verify at minimum:

1. APP-003 selection reaches APP-005 pricing.
2. Accommodation pricing inputs are generated from the selected accommodation.
3. Final GCT package price reaches APP-004.
4. One-stop accommodation reservation flow.
5. Multiple accommodation stops.
6. Same property at different stops.
7. Selected room preservation.
8. Selected rate preservation.
9. Multi-room occupancy preservation.
10. Child-age preservation.
11. Correct guest association by room.
12. Correct guest association by stop.
13. Multiple suppliers across stops.
14. BOOKABLE selection reaches APP-008.5.
15. RECHECK selection invokes APP-008.4 before booking.
16. Revalidated offer reaches booking.
17. Supplier reference continuity.
18. Booking result returns to APP-004.
19. Supplier booking reference is associated with the correct stop.
20. Confirmation reference is preserved where provided.
21. UNKNOWN booking outcome is not confirmed.
22. FAILED booking outcome is not confirmed.
23. Existing reservation persistence receives the accommodation state.
24. Existing cancellation/modification/retrieval prerequisites remain available.
25. Existing APP-003, APP-005, APP-004 and APP-008 tests remain green.

## 33. Verification

After implementation Copilot SHALL run:

- focused APP-004 orchestration tests;
- relevant APP-003 tests;
- relevant APP-005 tests;
- relevant APP-008.4 tests;
- relevant APP-008.5 tests;
- full Jest regression;
- `npm run build`;
- `npx prisma validate`;
- `npm run lint`.

No live Hotelbeds calls SHALL be made.

No database changes SHALL be made.

No Prisma schema changes SHALL be made unless an already-established canonical contract demonstrably requires one and Copilot reports the issue before proceeding.

Existing lint warnings SHALL be reported.

Unrelated lint warnings SHALL not be remediated during this iteration.

## 34. Acceptance Criteria

### AC-01 — Production Integration

The complete production path exists:

APP-003
→ APP-005
→ APP-004
→ APP-008.4 where required
→ APP-008.5
→ APP-004.

### AC-02 — Selection Integrity

Property → Room → Rate remains intact through the complete flow.

### AC-03 — Multi-Stop Integrity

Multiple package stops remain independently addressable.

### AC-04 — Multi-Room Integrity

Independent room occupancy and child ages survive through booking.

### AC-05 — Guest Integrity

Guests are associated with the correct room and package stop.

### AC-06 — Pricing Integrity

Supplier accommodation pricing remains separate from the final GCT package price.

### AC-07 — Reservation Integrity

APP-004 receives and preserves the complete accommodation reservation snapshot.

### AC-08 — RECHECK Integrity

RECHECK selections are revalidated before booking.

### AC-09 — BOOKABLE Integrity

BOOKABLE selections can proceed directly to booking.

### AC-10 — Supplier Integrity

The correct provider and opaque supplier reference are used for every accommodation stop.

### AC-11 — Booking Result Integrity

Supplier booking results return to the correct reservation and stop.

### AC-12 — Unknown Outcome Safety

UNKNOWN supplier outcomes are never treated as confirmed.

### AC-13 — Persistence

The resulting reservation state reaches the existing APP-004 persistence boundary.

### AC-14 — Supplier Isolation

Hotelbeds-specific implementation remains inside APP-008.

### AC-15 — Existing Capability Stability

Accepted APP-003, APP-005, APP-004 and APP-008 behaviour remains intact.

### AC-16 — Regression

Focused and full regression tests pass.

### AC-17 — Build

Production build passes.

### AC-18 — Prisma

Prisma validation passes.

### AC-19 — Lint

Lint completes with zero errors.

## 35. Definition of Done

The iteration is complete when:

- the actual production orchestration exists;
- APP-003 selection reaches APP-005;
- APP-005 pricing reaches APP-004;
- APP-004 reaches APP-008.4 when required;
- APP-004 reaches APP-008.5 for booking;
- booking results return to APP-004;
- multi-stop information remains correct;
- multi-room occupancy remains correct;
- guests are correctly partitioned by stop and room;
- supplier references remain traceable;
- final GCT package price remains authoritative;
- reservation state is persisted through the existing boundary;
- unknown and failed outcomes remain safe;
- supplier isolation remains intact;
- focused tests pass;
- full regression passes;
- build passes;
- Prisma validation passes;
- lint has zero errors.

## 36. Copilot Implementation Report

After implementation, Copilot SHALL report:

- implementation status;
- files changed;
- production call path implemented;
- key implementation decisions;
- focused test results;
- full regression result;
- build result;
- Prisma validation result;
- lint errors;
- lint warnings compared with the existing 160-warning baseline;
- database changes;
- Prisma changes;
- Hotelbeds calls;
- remaining limitations;
- any architectural or specification conflict discovered.

Copilot SHALL NOT create a commit.

The user performs the commit only after acceptance.

## 37. Final Constraint

This iteration exists because the read-only review found that the architecture and specifications are already sufficient but the production orchestration is incomplete.

Therefore:

**Implement the missing integration.**

Do not redesign the architecture.

Do not create another accommodation supplier capability.

Do not create parallel contracts.

Do not create parallel persistence.

Do not move supplier responsibilities into APP-004.

Use Copilot's implementation expertise to determine the cleanest implementation within these boundaries.