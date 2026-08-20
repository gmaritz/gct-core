# APP-004 — Pricing-to-Reservation / Accommodation Reservation Handoff

## Document Control

| Field | Value |
|---|---|
| Document ID | APP-004 |
| Title | Pricing-to-Reservation / Accommodation Reservation Handoff |
| Version | 1.0.0 |
| Status | Implementation Specification |
| Capability | APP-004 Reservation |
| Related Capabilities | APP-003 Journey, APP-005 Pricing, APP-008 Accommodation |
| Governing Process | GOV-DEV-001 |
| Scope | Connect priced package accommodation selections to reservation and supplier booking |

## 1. Purpose

This iteration completes the missing application handoff between the existing APP-005 priced package and APP-004 reservation processing.

The required flow is:

APP-003 Selection
→ APP-005 Package Pricing
→ APP-004 Reservation
→ APP-008 Revalidation where required
→ APP-008 Accommodation Booking

APP-004 SHALL preserve the complete customer-selected accommodation context within the reservation lifecycle.

APP-004 SHALL NOT create a parallel accommodation booking model or supplier integration.

## 2. Business Requirement

A GCT package may contain multiple accommodation stops.

At each applicable stop the client selects:

- accommodation property;
- room;
- rate;
- occupancy.

APP-005 incorporates the selected accommodation prices into the GCT package price.

Once the package is ready for reservation, APP-004 SHALL preserve the customer's selected accommodation configuration and provide the information required to complete supplier booking.

The reservation SHALL remain the authoritative representation of what the customer selected.

## 3. Architectural Boundary

### APP-003 Journey

APP-003 owns:

- package-stop composition;
- accommodation selection;
- Property → Room → Rate selection;
- occupancy;
- selection validation;
- selection projection.

### APP-005 Pricing

APP-005 owns:

- package pricing;
- accommodation pricing inputs;
- pricing components;
- GCT commercial rules;
- final package price.

### APP-004 Reservation

APP-004 owns:

- reservation creation;
- reservation validation;
- reservation accommodation snapshots;
- reservation lifecycle;
- reservation booking orchestration;
- persistence through existing reservation infrastructure.

### APP-008 Accommodation

APP-008 owns:

- accommodation revalidation;
- accommodation booking;
- accommodation cancellation;
- accommodation modification;
- booking details retrieval;
- supplier/provider operations.

APP-004 SHALL NOT:

- call Hotelbeds directly;
- construct Hotelbeds requests;
- interpret Hotelbeds DTOs;
- own supplier credentials;
- implement supplier-specific business logic;
- duplicate APP-008 booking services.

## 4. Scope

### In Scope

- priced-package-to-reservation handoff;
- complete accommodation reservation snapshot;
- multiple accommodation stops;
- selected property, room and rate;
- multi-room occupancy;
- child ages;
- supplier/provider identity;
- opaque supplier references;
- supplier accommodation price;
- pricing basis;
- stay dates;
- reservation-to-APP-008 booking handoff;
- RECHECK gating through APP-008.4;
- booking-result association with the reservation;
- focused tests;
- regression verification.

### Out of Scope

- APP-003 redesign;
- APP-005 pricing-rule changes;
- APP-008 supplier-operation redesign;
- Hotelbeds API changes;
- cancellation implementation;
- booking modification;
- booking-details implementation;
- payment;
- voucher/document generation;
- supplier reconciliation;
- new reservation persistence architecture;
- new database tables unless required by an already established APP-004 persistence contract;
- unrelated technical-debt cleanup.

## 5. Reservation Input

APP-004 SHALL consume the existing priced package representation produced by APP-005.

The reservation input SHALL provide sufficient information to construct:

- package identity;
- package stops;
- final GCT package price;
- selected accommodation per applicable stop;
- occupancy;
- supplier/provider context;
- supplier-neutral references.

The implementation SHALL use existing APP-004 reservation input contracts where possible.

Do not introduce a second reservation request model if the existing canonical contract can be extended safely.

## 6. Package-Level Reservation Context

The reservation SHALL retain the package identity associated with the priced package.

Where the existing reservation model supports package references, those existing fields SHALL remain authoritative.

The reservation SHALL preserve the relationship between the package and its accommodation stops.

A reservation containing multiple accommodation stops SHALL NOT collapse those stops into one accommodation record.

## 7. Accommodation Reservation Snapshot

The current accommodation snapshot is insufficient because it contains only shallow information such as:

- accommodation ID;
- property name;
- room type;
- meal basis;
- check-in;
- check-out.

The snapshot SHALL be extended minimally to preserve the complete selected accommodation context.

At minimum it SHALL preserve:

- package stop identity;
- stop order where required;
- accommodation identity;
- property name;
- selected room;
- selected rate;
- supplier/provider identity;
- supplier-neutral accommodation reference where available;
- supplier-neutral room reference where available;
- supplier-neutral rate/offer reference;
- occupancy;
- child ages;
- stay dates;
- supplier accommodation price;
- currency;
- pricing basis;
- board/meal basis;
- booking conditions required for downstream booking continuity.

The snapshot SHALL represent what the customer selected.

## 8. Snapshot Immutability

Once the reservation snapshot is created, it SHALL represent the selection at the time of reservation creation.

Subsequent supplier changes SHALL NOT silently rewrite the original customer selection snapshot.

Where revalidation produces updated supplier information before booking, the established APP-004/APP-008 booking flow SHALL determine how the current booking input is updated while preserving the original selection/audit information according to existing reservation conventions.

Do not create a second reservation snapshot architecture.

## 9. Multi-Stop Reservations

A reservation SHALL support multiple accommodation stops.

Conceptually:

Reservation
→ Stop 1 Accommodation Snapshot
→ Stop 2 Accommodation Snapshot
→ Stop 3 Accommodation Snapshot

Each snapshot SHALL retain its own:

- stop identity;
- dates;
- accommodation;
- room;
- rate;
- occupancy;
- supplier information;
- supplier price.

The same property MAY appear at multiple stops.

Each occurrence SHALL remain independently addressable.

Accommodation identity alone SHALL NOT be used as the unique key for a reservation accommodation snapshot.

## 10. Multi-Room Occupancy

The reservation snapshot SHALL preserve ordered room occupancy.

Each room group SHALL retain:

- adults;
- children;
- child ages.

Example:

Room 1
→ 2 adults
→ 1 child
→ child age 8

Room 2
→ 2 adults

The reservation SHALL NOT reduce this information to a scalar room count.

The occupancy stored in the reservation SHALL correspond to the selected accommodation option used for pricing and booking.

## 11. Property → Room → Rate Relationship

The reservation SHALL preserve the selected hierarchy:

Accommodation
→ Room
→ Rate

The selected rate SHALL remain associated with its selected room.

A reservation SHALL NOT store a rate independently of its room where doing so would lose selection context.

The snapshot SHALL contain sufficient information to identify the exact selected offer.

## 12. Supplier Reference Preservation

Supplier references SHALL remain opaque.

APP-004 MAY store canonical supplier references supplied by APP-008.

APP-004 SHALL NOT interpret supplier references.

Hotelbeds `rateKey` SHALL NOT become a semantic APP-004 field.

The provider identity SHALL remain associated with the supplier reference.

The reservation SHALL retain the selected supplier reference required for downstream booking and revalidation.

## 13. Supplier Price Preservation

The reservation accommodation snapshot SHALL preserve the supplier accommodation price used as an input to GCT pricing.

The snapshot SHALL retain:

- amount;
- currency;
- pricing basis.

The supplier amount SHALL remain distinct from:

- GCT package price;
- customer selling price;
- package markup;
- commission;
- discounts.

APP-004 SHALL not recalculate GCT package pricing.

## 14. Final Package Price

The reservation SHALL receive the final GCT package price produced by APP-005.

APP-004 SHALL preserve the existing package pricing representation.

APP-004 SHALL NOT:

- calculate accommodation markup;
- calculate package markup;
- recalculate sliding-scale pricing;
- replace the GCT package price with supplier accommodation prices.

The final package price remains owned by APP-005.

## 15. Pricing Traceability

The reservation SHALL retain enough information to relate the selected accommodation to the pricing input that contributed to the package price.

At minimum, the reservation accommodation snapshot SHALL preserve:

- stop;
- property;
- room;
- rate;
- supplier/provider;
- supplier reference;
- supplier amount;
- currency;
- pricing basis.

This ensures that the reservation can establish what accommodation selection contributed to the priced package.

## 16. Reservation Validation

Before creating the reservation, APP-004 SHALL validate that the priced package contains valid accommodation selections.

At minimum validate:

- package identity;
- required package stops;
- selected accommodation where required;
- selected room;
- selected rate;
- stay dates;
- occupancy;
- supplier/provider context where required;
- supplier reference where required;
- required pricing information.

Invalid or incomplete accommodation selections SHALL NOT produce a valid reservation.

Use existing APP-004 validation and error conventions.

Do not introduce supplier-specific validation errors.

## 17. Accommodation Selection Completeness

A package requiring accommodation at a stop SHALL have a valid accommodation selection before reservation creation.

The following states SHALL remain distinguishable:

- accommodation not selected;
- accommodation selection invalid;
- accommodation selected and bookable;
- accommodation selected and requiring revalidation;
- accommodation selected and ready for booking.

APP-004 SHALL NOT automatically substitute another property, room or rate.

## 18. Revalidation Requirement

A selected accommodation rate marked as requiring revalidation SHALL NOT proceed directly to supplier booking.

The required flow is:

Selected RECHECK Rate
→ APP-008.4 Revalidation
→ Revalidated Result
→ Reservation / Booking Input
→ APP-008.5 Booking

APP-004 SHALL orchestrate this through the existing APP-008 supplier-neutral revalidation contract.

APP-004 SHALL NOT implement supplier-specific CheckRate logic.

## 19. BOOKABLE Accommodation

A selected `BOOKABLE` accommodation rate MAY proceed to booking through the established APP-008 booking service, subject to existing APP-004 validation and booking rules.

The flow is:

Reservation
→ APP-008.5 Accommodation Booking

APP-004 SHALL provide the canonical booking request required by APP-008.5.

## 20. Booking Request Construction

APP-004 SHALL construct the canonical accommodation booking request from the reservation accommodation snapshot.

The booking request SHALL preserve the information required by APP-008.5, including:

- selected supplier/provider;
- supplier-neutral offer reference;
- stay dates;
- occupancy;
- room-associated guests;
- booking holder;
- idempotency key;
- any other required canonical booking information already established by APP-008.5.

APP-004 SHALL not construct a Hotelbeds request.

The Hotelbeds adapter remains responsible for translating the canonical request into the supplier request.

## 21. Guest Association

Where the accommodation booking contract requires room-associated guests, APP-004 SHALL map reservation guest information to the selected room groups.

The mapping SHALL preserve the relationship between:

Room
→ Guests

Multi-room bookings SHALL NOT produce one unassociated global guest list when room association is required by the canonical booking contract.

Child occupancy information SHALL remain consistent with the selected accommodation occupancy.

## 22. Booking Holder

The reservation SHALL provide the booking holder information required by APP-008.5.

The booking holder SHALL be derived from the established reservation/customer model.

Do not introduce a second guest or holder identity model.

## 23. Idempotency

APP-004 SHALL use the existing booking idempotency mechanism when invoking APP-008.5.

A retry of the same logical booking operation SHALL NOT intentionally create a second supplier booking.

Do not create a new persistence-based idempotency mechanism.

If the existing APP-004 contract does not provide the required idempotency key, make the smallest compatible extension and report it.

## 24. Booking Result

APP-004 SHALL associate the APP-008.5 booking result with the correct reservation and accommodation stop.

The booking result SHALL preserve, where supplied:

- supplier booking reference;
- confirmation reference;
- supplier price;
- booking state;
- provider.

The supplier booking result SHALL not overwrite the original selection snapshot without following existing APP-004 lifecycle rules.

## 25. Booking Failure

Supplier booking failures SHALL use the established APP-008 canonical outcomes.

APP-004 SHALL distinguish, as supported by the existing contracts:

- successful booking;
- failed booking;
- unknown booking outcome.

An unknown supplier outcome SHALL NOT be treated as a successful booking.

APP-004 SHALL use existing booking-details/retrieval capabilities where the established lifecycle requires resolution of an unknown outcome.

Do not introduce automatic cancellation/rebooking behaviour.

## 26. Reservation State

The reservation lifecycle state SHALL remain owned by APP-004.

APP-008 supplier states SHALL be translated through the existing application contracts.

APP-004 SHALL not expose Hotelbeds-specific state values.

Where a supplier booking is confirmed, APP-004 SHALL associate the confirmed supplier booking information with the relevant reservation/accommodation record according to existing reservation lifecycle conventions.

## 27. Persistence

Use the existing APP-004 reservation persistence mechanism.

Do not create a parallel accommodation reservation repository.

If the current snapshot schema can be extended without a database migration, prefer that approach.

If a database or Prisma change is genuinely required to persist the canonical snapshot fields, stop and report the requirement before inventing a new persistence architecture.

A schema migration is not prohibited by this specification, but it must be demonstrably required by the existing canonical reservation persistence design.

## 28. Existing APP-004 Contracts

Inspect the current APP-004:

- reservation aggregate;
- reservation input;
- accommodation snapshot;
- booking gateway;
- booking integration orchestrator;
- reservation repository;
- persistence mapper.

Reuse existing contracts wherever their semantics are sufficient.

Extend rather than duplicate.

Do not create parallel reservation concepts merely to accommodate APP-003.

## 29. APP-005 Relationship

APP-005 remains the source of:

- final package price;
- accommodation pricing inputs;
- pricing components;
- pricing traceability.

APP-004 SHALL consume the priced package.

APP-004 SHALL NOT reconstruct package pricing from raw accommodation prices.

The reservation SHALL retain the final GCT package price and the accommodation supplier-price information required for traceability.

## 30. APP-003 Relationship

APP-003 remains the source of:

- package stop selection;
- accommodation selection;
- room selection;
- rate selection;
- occupancy.

APP-004 SHALL consume the established APP-003 output as represented through the priced package.

APP-004 SHALL not reimplement Journey selection logic.

## 31. APP-008 Relationship

APP-008 remains the supplier-operation boundary.

The application flow SHALL be:

APP-003
→ APP-005
→ APP-004
→ APP-008

APP-004 MAY orchestrate APP-008 services through their canonical provider-neutral contracts.

APP-004 SHALL NOT:

- import Hotelbeds DTOs;
- import Hotelbeds request models;
- access Hotelbeds credentials;
- construct Hotelbeds endpoints;
- interpret Hotelbeds response envelopes.

## 32. Multiple Suppliers

The reservation model SHALL remain supplier-neutral.

A package MAY contain accommodation bookings from different suppliers.

Example:

Stop 1 → Supplier A
Stop 2 → Supplier B
Stop 3 → Supplier A

Provider identity SHALL remain associated with each accommodation booking.

Supplier references SHALL remain opaque.

The reservation model SHALL not contain supplier-specific fields.

## 33. Cancellation and Modification Continuity

This iteration SHALL preserve the information required for existing APP-008.6 and APP-008.7 operations.

The reservation accommodation snapshot SHALL retain the supplier booking reference once booking succeeds.

Cancellation and modification remain separate APP-008 capabilities.

APP-004 SHALL not implement their supplier operations in this iteration.

## 34. Booking Details Continuity

APP-008.8 remains responsible for retrieving current supplier booking details.

The reservation SHALL retain sufficient provider and booking-reference information to allow current supplier state to be retrieved.

APP-004 SHALL not implement supplier booking-details retrieval itself.

## 35. No-Availability and Supplier Failure

A package SHALL not reach successful reservation creation from:

- `NO_AVAILABILITY`;
- failed availability;
- invalid selection;
- missing rate;
- missing price.

Supplier availability failures SHALL remain failures.

APP-004 SHALL not fabricate an accommodation selection or zero-price accommodation component.

## 36. Reservation Snapshot vs Current Supplier State

The reservation snapshot represents the GCT/customer transaction context.

The supplier current state represents the external supplier's current booking state.

These SHALL remain conceptually distinct.

APP-008.8 may report current supplier state.

It SHALL NOT silently rewrite the historical reservation selection snapshot.

## 37. Compatibility

Existing APP-004 consumers SHALL continue to operate where they do not provide accommodation package selections.

The implementation SHALL be additive or minimally compatible.

Do not break unrelated reservation workflows.

If existing consumers rely on the shallow `AccommodationSnapshot`, retain compatible projections where possible while extending the canonical snapshot.

## 38. Required Tests

Focused tests SHALL cover at least:

1. priced package creates a valid reservation input;
2. selected accommodation is preserved;
3. package stop identity is preserved;
4. stop order is preserved where applicable;
5. selected room is preserved;
6. selected rate is preserved;
7. provider identity is preserved;
8. opaque supplier reference is preserved;
9. supplier accommodation amount is preserved;
10. supplier currency is preserved;
11. pricing basis is preserved;
12. final GCT package price is preserved;
13. multi-stop accommodation snapshots are preserved;
14. same property at different stops remains distinct;
15. multi-room occupancy is preserved;
16. child ages are preserved;
17. room-associated guests are preserved;
18. BOOKABLE accommodation can reach APP-008.5;
19. RECHECK accommodation is gated through APP-008.4;
20. missing accommodation selection is rejected;
21. missing room/rate is rejected;
22. missing supplier reference is rejected where required;
23. unknown booking outcome is not treated as confirmed;
24. booking confirmation is associated with the correct reservation/stop;
25. supplier booking reference is preserved after successful booking;
26. multiple suppliers can coexist across package stops;
27. existing APP-004 reservation behaviour remains unchanged;
28. cancellation/modification continuity retains required supplier booking information.

## 39. Verification

Copilot SHALL run:

- focused APP-004 accommodation/reservation tests;
- relevant APP-003 pricing/selection tests;
- relevant APP-005 pricing tests;
- relevant APP-008 booking/revalidation tests;
- full Jest regression;
- `npm run build`;
- `npx prisma validate`;
- `npm run lint`.

No live Hotelbeds calls SHALL be made during automated verification.

Any database or Prisma change SHALL be explicitly reported.

Existing lint warnings SHALL be reported but SHALL NOT trigger unrelated remediation.

## 40. Acceptance Criteria

### AC-01 — Priced Package Input

APP-004 accepts the existing APP-005 priced package.

### AC-02 — Complete Accommodation Snapshot

The reservation preserves Property → Room → Rate selection.

### AC-03 — Stop Context

Each accommodation selection remains associated with its package stop.

### AC-04 — Multi-Stop

Multiple accommodation stops can be preserved independently.

### AC-05 — Multi-Room

Independent room occupancy and child ages are preserved.

### AC-06 — Supplier Continuity

Provider and opaque supplier references are preserved.

### AC-07 — Supplier Price

Supplier accommodation amount, currency and pricing basis are preserved.

### AC-08 — GCT Price

The final GCT package price is preserved separately from supplier accommodation pricing.

### AC-09 — Booking Request

APP-004 can construct the canonical APP-008.5 booking request.

### AC-10 — RECHECK

A RECHECK-required rate cannot bypass APP-008.4 revalidation.

### AC-11 — BOOKABLE

A BOOKABLE rate can proceed through the existing APP-008.5 booking service.

### AC-12 — Booking Result

Successful supplier booking information is associated with the correct reservation and stop.

### AC-13 — Unknown Outcome

An unknown supplier outcome is not treated as confirmed.

### AC-14 — Supplier Neutrality

No Hotelbeds-specific contract enters APP-004.

### AC-15 — Multiple Suppliers

Different suppliers can be represented across accommodation stops.

### AC-16 — Lifecycle Continuity

Successful booking retains the information required by APP-008.6, APP-008.7 and APP-008.8.

### AC-17 — Existing Behaviour

Existing APP-004 reservation workflows remain compatible.

### AC-18 — Regression

Focused tests, full regression, build, Prisma validation and lint complete successfully.

## 41. Implementation Constraints

1. Use the existing APP-004 reservation architecture.
2. Consume the existing APP-005 priced package.
3. Consume the existing APP-003 selection information through the established pricing/reservation flow.
4. Use the existing APP-008 provider-neutral booking and revalidation contracts.
5. Do not create a second reservation model.
6. Do not create a second accommodation booking service.
7. Do not call Hotelbeds directly from APP-004.
8. Do not expose Hotelbeds DTOs.
9. Do not redesign APP-005 pricing.
10. Do not redesign APP-008 booking/revalidation.
11. Do not implement cancellation or modification.
12. Do not implement booking-details retrieval.
13. Do not implement Documents/Voucher.
14. Do not implement Payment.
15. Do not refactor unrelated technical debt.
16. Do not fix unrelated lint warnings.
17. Preserve existing APP-004 consumers.
18. Prefer minimal compatible extensions over replacement of existing contracts.

## 42. Definition of Done

This iteration is complete when:

- APP-005 priced package information reaches APP-004;
- the complete accommodation selection is preserved;
- multiple package stops remain independent;
- multi-room occupancy and child ages are preserved;
- supplier references and supplier pricing are preserved;
- the final GCT package price remains distinct;
- RECHECK rates are revalidated before booking;
- BOOKABLE rates can reach APP-008.5;
- successful supplier booking information is associated with the reservation;
- unknown supplier outcomes remain unresolved rather than falsely confirmed;
- existing cancellation, modification and booking-details continuity is preserved;
- focused tests pass;
- full regression passes;
- build passes;
- Prisma validation passes;
- lint has zero errors;
- no unrelated functionality has been changed.

## 43. Final Instruction to Copilot

Implement APP-004 Pricing-to-Reservation / Accommodation Reservation Handoff exactly as specified above.

Before changing code:

1. Read GOV-DEV-001.
2. Read the authoritative APP-003, APP-004, APP-005 and APP-008 specifications.
3. Inspect the existing APP-004 reservation aggregate and snapshot implementation.
4. Inspect the existing APP-004 booking integration orchestrator and BookingGateway.
5. Inspect the APP-005 priced-package output produced by the preceding implementation.
6. Inspect the APP-008.4 and APP-008.5 canonical revalidation and booking contracts.
7. Trace the actual current callers and persistence boundaries.

Use your implementation expertise to determine the smallest compatible implementation required to make the existing architecture operational.

Do not wait for another architecture-review stage.

If an implementation detail is not explicitly specified, make the smallest compatible decision consistent with the existing repository architecture and authoritative documentation.

If a genuine architectural contradiction prevents implementation, stop before redesigning the architecture and report it.

After implementation:

- run focused tests;
- run relevant cross-capability tests;
- run full Jest regression;
- run build;
- run Prisma validation;
- run lint;
- inspect edited files for language-service errors.

Provide the standard Copilot implementation report containing:

- files changed;
- implementation summary;
- tests added;
- focused test results;
- full regression result;
- build result;
- Prisma validation result;
- lint result;
- warning count compared with the current 157-warning baseline;
- database/Prisma changes;
- Hotelbeds calls;
- any implementation decisions made within the specification boundaries;
- any limitations or follow-up items.

Do not create a commit.