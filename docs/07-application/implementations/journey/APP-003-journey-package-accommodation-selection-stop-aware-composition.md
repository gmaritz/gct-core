# APP-003 — Journey / Package Accommodation Selection & Stop-Aware Composition

## Document Control

| Field | Value |
|---|---|
| Document ID | APP-003 |
| Title | Journey / Package Accommodation Selection & Stop-Aware Composition |
| Version | 1.0.0 |
| Status | Implementation Specification |
| Classification | Normative Application Specification |
| Owner | Platform Engineering |
| Domain | Journey / Package |
| Related Capabilities | APP-002 Accommodation, APP-005 Pricing, APP-004 Reservation, APP-008 Accommodation Supplier Operations |
| Governing Process | GOV-DEV-001 |
| Implementation Target | GCT Core |

## 1. Purpose

APP-003 completes the missing GCT package accommodation composition flow.

The capability SHALL preserve the client's accommodation choice at each package stop from availability through package pricing and reservation.

The required selection hierarchy is:

Package
→ Package Stop
→ Accommodation
→ Room
→ Rate

APP-003 SHALL consume the established APP-008 accommodation contracts and SHALL NOT redesign or duplicate APP-008 supplier operations.

The capability SHALL support GCT's private multi-day packages, including packages containing approximately 3–10 days and multiple accommodation stops.

## 2. Business Requirement

For each package stop:

1. GCT defines the approved accommodation properties.
2. APP-008 provides live availability.
3. The client may select an accommodation property.
4. The client may select a room option.
5. The client may select a rate option.
6. The selected accommodation option becomes an input to GCT package pricing.
7. The selected accommodation option is preserved for reservation and future supplier operations.

GCT owns the final package price.

The supplier accommodation price SHALL NOT become the GCT package price.

The architecture SHALL support multiple accommodation suppliers.

## 3. Architectural Boundary

APP-003 owns:

- package-stop accommodation composition;
- association of accommodation options with the correct package stop;
- client accommodation selection;
- preservation of selected accommodation, room and rate;
- projection of the selected accommodation into pricing;
- projection of the selected accommodation into reservation.

APP-008 owns:

- accommodation availability;
- revalidation;
- booking;
- cancellation;
- modification;
- booking-details retrieval;
- supplier/provider interaction.

APP-005 owns:

- accommodation pricing input;
- package pricing;
- pricing rules;
- markups;
- commissions;
- discounts;
- taxes and final customer pricing.

APP-004 owns:

- reservation lifecycle;
- reservation snapshots;
- reservation persistence;
- booking lifecycle integration.

APP-003 SHALL NOT:

- call Hotelbeds directly;
- construct Hotelbeds requests;
- interpret Hotelbeds DTOs;
- own supplier credentials;
- perform CheckRate;
- perform accommodation booking;
- perform accommodation cancellation;
- perform accommodation modification;
- persist a parallel reservation;
- calculate the final package price.

## 4. Canonical Package Stop Context

Each accommodation selection SHALL be associated with a specific package stop.

A package stop SHALL provide sufficient context to identify:

- package;
- stop;
- stop order;
- arrival/check-in date;
- departure/check-out date;
- approved accommodation candidates.

The stop identity MUST remain attached to the accommodation selection throughout the package workflow.

An accommodation selected for Stop 1 MUST NOT be interchangeable with an accommodation selected for Stop 2 merely because the accommodation identifier is identical.

## 5. Accommodation Availability Consumption

APP-003 SHALL consume the established APP-008 canonical availability result.

The expected hierarchy is:

Accommodation Availability Search Result
→ Accommodation
→ Availability Options
→ Room Options
→ Rate Options

APP-003 SHALL NOT flatten the result to:

- accommodation ID/name only;
- one global rate;
- one room;
- supplier-specific JSON.

All client-selectable room and rate options required by the established APP-008 contract SHALL remain available to the package composition layer.

## 6. Package Accommodation Option

APP-003 SHALL represent each selectable accommodation option in stop context.

A package accommodation option SHALL contain, directly or through referenced canonical structures:

- package stop identity;
- accommodation identity and display information;
- supplier/provider identity where required for continuity;
- available room options;
- available rate options through their owning room;
- requested occupancy;
- relevant supplier-neutral pricing information;
- supplier-neutral room reference;
- supplier-neutral rate/booking reference.

The option SHALL retain the relationship:

Accommodation
→ Room
→ Rate

A rate SHALL never become detached from its owning room.

## 7. Client Selection

The client SHALL be able to select independently:

1. accommodation property;
2. room option;
3. rate option.

The selection SHALL identify the complete selectable path:

Package Stop
→ Accommodation
→ Room
→ Rate

The selected rate SHALL be associated with the selected room.

A rate from another room SHALL NOT be accepted as a valid selection.

A selection for one package stop SHALL NOT be silently applied to another stop.

## 8. Multi-Room Occupancy

APP-003 SHALL preserve the established multi-room occupancy model from APP-008.

Occupancy SHALL support ordered room groups containing:

- adults;
- children;
- child ages.

Different rooms MAY have different occupancy.

The implementation SHALL NOT reintroduce the historical one-room restriction.

The package selection SHALL preserve the occupancy used to obtain the selected accommodation option.

APP-003 SHALL NOT collapse multiple room groups into a scalar room count when doing so would lose room-specific occupancy.

## 9. Selection Validation

A client accommodation selection SHALL be valid only when:

1. the package stop exists;
2. the selected accommodation belongs to the availability result for that stop;
3. the selected room belongs to the selected accommodation;
4. the selected rate belongs to the selected room;
5. the selected rate is available for the requested occupancy;
6. required supplier reference information is present;
7. required pricing information is present;
8. the selected option has not been replaced or invalidated by the application flow.

Invalid selections SHALL produce a canonical application validation error.

APP-003 SHALL NOT silently substitute another accommodation, room or rate.

## 10. Supplier References

APP-003 SHALL preserve supplier-neutral references supplied by APP-008.

Hotelbeds `rateKey` and other supplier-specific fields SHALL NOT become APP-003 canonical field names.

Supplier references SHALL be treated as opaque.

APP-003 SHALL preserve provider identity where required to maintain booking continuity.

APP-003 SHALL NOT interpret supplier references.

## 11. Pricing Handoff

The selected accommodation option SHALL be projected into APP-005 as an accommodation pricing input.

The pricing input SHALL preserve at least:

- package stop identity;
- selected accommodation;
- selected room;
- selected rate;
- occupancy;
- supplier/provider identity where required;
- supplier-neutral booking reference;
- supplier accommodation price;
- currency;
- pricing basis;
- applicable accommodation commercial conditions required by APP-005.

The supplier price is an input to GCT pricing.

The final customer package price remains owned by APP-005.

APP-003 SHALL NOT calculate:

- package markup;
- sliding-scale pricing;
- commission;
- discount;
- final customer price.

## 12. Reservation Handoff

The selected accommodation option SHALL be projected into APP-004 reservation processing.

The reservation handoff SHALL preserve:

- package identity;
- package stop identity;
- stop order;
- stay dates;
- selected accommodation;
- selected room;
- selected rate;
- selected occupancy;
- supplier/provider identity;
- supplier-neutral booking reference;
- applicable supplier pricing;
- booking conditions required for the reservation snapshot.

APP-004 remains responsible for creating and persisting the reservation.

APP-003 SHALL NOT create a parallel reservation or booking persistence model.

## 13. Revalidation Continuity

The selection SHALL retain sufficient information for APP-004 and APP-008 to perform revalidation before booking where required.

APP-003 SHALL NOT perform revalidation itself.

For a `RECHECK` rate:

Selected Rate
→ APP-008 Revalidation
→ Updated Supplier Result
→ Reservation / Booking

For a `BOOKABLE` rate, the established APP-008 booking workflow remains authoritative.

If revalidation changes price or commercial conditions, APP-005 SHALL remain responsible for determining the resulting GCT package price.

## 14. Stop-Level Selection Collection

A package containing multiple accommodation stops SHALL maintain an ordered collection of stop-specific accommodation selections.

Each selection SHALL retain its own stop identity.

Example conceptual flow:

Package
→ Stop 1
→ Selected Property / Room / Rate

→ Stop 2
→ Selected Property / Room / Rate

→ Stop 3
→ Selected Property / Room / Rate

Selections SHALL NOT be represented as one package-wide accommodation object.

A package MAY contain different properties, room types and rates at different stops.

## 15. Partial Selection

A package MAY be in an accommodation-selection state where some stops have selections and others do not.

The implementation SHALL distinguish:

- no selection;
- valid selection;
- invalid selection;
- selection requiring revalidation;
- completed accommodation selection.

A package SHALL NOT be considered accommodation-selection complete until every accommodation-required stop has a valid selection.

The exact package completion status SHALL remain owned by the existing Journey/Package lifecycle model.

## 16. Availability Failure Handling

APP-003 SHALL preserve the distinction between:

- no available accommodation;
- supplier failure;
- unavailable room/rate;
- invalid client selection.

APP-003 SHALL NOT fabricate an accommodation when APP-008 returns `NO_AVAILABILITY`.

A stop with no available accommodation SHALL remain explicitly unavailable.

APP-003 SHALL not convert supplier failure into successful accommodation selection.

## 17. Existing Implementation Migration

The current shallow accommodation composition represented approximately:

`accommodationId` + `name`

This SHALL be replaced or extended so that package composition preserves the complete selected accommodation context.

The implementation SHALL NOT retain the shallow representation as the authoritative accommodation selection.

Existing consumers that only require accommodation display information MAY continue receiving a projection containing identity/name, provided the underlying canonical selection retains the complete Property → Room → Rate structure.

## 18. APP-002 Relationship

APP-002 remains the accommodation capability and source of canonical accommodation identity/content.

APP-003 SHALL consume accommodation identity/content without duplicating the accommodation domain model.

Static accommodation information SHALL remain separate from dynamic room/rate availability.

## 19. APP-008 Relationship

APP-003 consumes APP-008.

The dependency is:

APP-008
→ Availability / Revalidation / Booking / Cancellation / Modification / Details

APP-003
→ Package Stop Accommodation Selection

APP-005
→ Package Pricing

APP-004
→ Reservation

APP-003 SHALL NOT bypass APP-008 and communicate directly with Hotelbeds or another supplier.

## 20. Multiple Supplier Compatibility

The selection model SHALL be provider-neutral.

Two suppliers MAY provide offers for the same accommodation.

The implementation SHALL NOT merge supplier offers merely because accommodation identity matches.

Provider identity and supplier-neutral offer/reference context SHALL remain available where required to distinguish the offers.

The selected supplier SHALL remain associated with the selected rate through the downstream pricing and reservation handoffs.

## 21. Scope

### In Scope

- package-stop accommodation option composition;
- stop-specific accommodation availability association;
- client property selection;
- client room selection;
- client rate selection;
- multi-room occupancy preservation;
- selection validation;
- supplier-neutral reference preservation;
- APP-005 pricing projection;
- APP-004 reservation projection;
- revalidation continuity;
- migration from shallow accommodation composition;
- focused automated tests;
- regression tests.

### Out of Scope

- APP-008 supplier operations;
- Hotelbeds API calls;
- supplier authentication;
- CheckRate implementation;
- accommodation booking;
- accommodation cancellation;
- accommodation modification;
- booking-details retrieval;
- final GCT package pricing calculation;
- payment;
- reservation persistence implementation;
- voucher/document generation;
- supplier reconciliation;
- operational administration;
- unrelated Journey refactoring.

## 22. Implementation Constraints

1. Preserve accepted APP-008.3–APP-008.8 behaviour.
2. Do not redesign APP-008 contracts.
3. Do not introduce Hotelbeds DTOs into APP-003.
4. Do not call Hotelbeds from APP-003.
5. Do not introduce a second reservation model.
6. Do not introduce package pricing logic into Journey.
7. Do not discard room/rate relationships.
8. Do not reduce multi-room occupancy to one room.
9. Do not fabricate unavailable accommodation.
10. Do not implement future capabilities.
11. Do not refactor unrelated technical debt.
12. Preserve existing Journey behaviour outside the accommodation-selection change.
13. Maintain compatibility with future accommodation suppliers.
14. Do not introduce database or Prisma changes unless an existing canonical persistence contract explicitly requires them for this iteration.

## 23. Required Tests

Focused tests SHALL cover at least:

1. package stop receives accommodation availability options;
2. accommodation options remain associated with the correct stop;
3. multiple accommodations can be represented for one stop;
4. multiple room options can be represented for one accommodation;
5. multiple rates remain associated with the correct room;
6. client can select property, room and rate;
7. rate belonging to another room is rejected;
8. selection belonging to another stop is rejected;
9. multi-room occupancy is preserved;
10. child ages are preserved;
11. supplier-neutral reference is preserved;
12. selected accommodation projects correctly to APP-005;
13. selected accommodation projects correctly to APP-004;
14. incomplete stop selections remain incomplete;
15. `NO_AVAILABILITY` does not create a fabricated selection;
16. supplier failure does not create a successful selection;
17. BOOKABLE selection preserves booking continuity;
18. RECHECK selection preserves revalidation continuity;
19. multiple supplier offers remain distinguishable;
20. existing non-accommodation Journey behaviour remains unchanged.

## 24. Verification

Copilot SHALL perform:

- focused APP-003 tests;
- full Jest regression;
- `npm run build`;
- `npx prisma validate`;
- `npm run lint`.

No live Hotelbeds calls SHALL be made during normal automated verification.

Any existing lint warning backlog SHALL be reported but SHALL NOT be expanded into unrelated remediation.

## 25. Acceptance Criteria

### AC-01 — Stop Association

Every accommodation option is associated with exactly one package stop.

### AC-02 — Property Selection

A client can select an accommodation property from the options available for the selected stop.

### AC-03 — Room Selection

A client can select a room belonging to the selected accommodation.

### AC-04 — Rate Selection

A client can select a rate belonging to the selected room.

### AC-05 — Rate Ownership

A rate belonging to another room cannot be selected.

### AC-06 — Multi-Room Occupancy

Independent room occupancy and child ages remain intact throughout selection.

### AC-07 — Selection Continuity

The complete Property → Room → Rate selection remains available after composition.

### AC-08 — Pricing Projection

The selected accommodation option can be supplied to APP-005 without losing stop, room, rate or supplier-reference information.

### AC-09 — Reservation Projection

The selected accommodation option can be supplied to APP-004 without losing stop, room, rate, occupancy or supplier-reference information.

### AC-10 — Supplier Neutrality

No Hotelbeds-specific DTO or field is exposed through APP-003.

### AC-11 — No Availability

A `NO_AVAILABILITY` result produces no fabricated accommodation selection.

### AC-12 — Recheck Continuity

A selected `RECHECK` rate retains the information required for APP-008 revalidation.

### AC-13 — Multiple Suppliers

Offers from different suppliers remain distinguishable.

### AC-14 — Multi-Stop Package

Selections for different stops remain independently addressable.

### AC-15 — Existing Behaviour

Existing Journey functionality outside this accommodation-selection scope remains unchanged.

### AC-16 — Regression Safety

Focused and full regression tests pass.

## 26. Definition of Done

APP-003 accommodation selection is complete when:

- the approved specification is implemented;
- package stops retain accommodation selection context;
- Property → Room → Rate relationships are preserved;
- multi-room occupancy is preserved;
- client selections are validated;
- APP-005 receives the required accommodation pricing input;
- APP-004 receives the required reservation input;
- APP-008 remains the sole supplier-operation boundary;
- Hotelbeds remains isolated behind its provider adapter;
- focused tests pass;
- full regression passes;
- build passes;
- Prisma validation passes;
- no new blocking lint errors exist;
- no unrelated architecture has been redesigned.

## 27. Scope Confirmation

Source files modified: implementation only as required by this specification.

Test files modified: only tests required by this specification.

Specification files modified: none during implementation.

Database modified: NO unless explicitly required by an existing canonical persistence contract.

Prisma schema modified: NO unless explicitly required by an existing canonical persistence contract.

Hotelbeds calls: NO during automated verification.

Git reset/revert: NO.

Commit: performed by the user only after architect acceptance.

## 28. Architectural Statement

APP-003 closes the application-layer gap identified after completion of APP-008.

The resulting architecture is:

GCT Package
→ Package Stop
→ Approved Accommodation Candidates
→ APP-008 Availability
→ Accommodation
→ Room
→ Rate
→ Client Selection
→ APP-005 Pricing
→ APP-008 Revalidation where required
→ APP-008 Booking
→ APP-004 Reservation

APP-003 owns the package and journey composition between supplier-neutral accommodation availability and the downstream pricing/reservation capabilities.

APP-008 remains the accommodation supplier-operation boundary.

APP-005 remains the owner of GCT package pricing.

APP-004 remains the owner of reservation lifecycle and persistence.

No new APP-008.9 capability is introduced by this iteration.

## 29. References

- GOV-DEV-001 — GCT Core Development Process Governance
- BUS-001 — Business Capability Model
- BUS-002 — Business Entity Model
- BUS-003 — Business Process Model
- APP-002 — Accommodation Capability
- APP-003 — Journey Capability
- APP-004 — Reservation Capability
- APP-005 — Pricing Capability
- APP-008.3 — Accommodation Availability
- APP-008.4 — Accommodation Revalidation
- APP-008.5 — Accommodation Booking
- APP-008.6 — Accommodation Cancellation
- APP-008.7 — Accommodation Booking Modification
- APP-008.8 — Accommodation Booking Details / Retrieval
- HBX-001 — Hotelbeds Certification Readiness
- IMP-001 — Enterprise Implementation Roadmap

## 30. Final Instruction to Copilot

Implement only APP-003 accommodation selection and stop-aware composition as defined above.

Use the existing architecture and accepted APP-008.3–APP-008.8 contracts.

Where an implementation detail is necessary but not explicitly prescribed, inspect the existing repository conventions and make the smallest compatible decision that preserves the stated architectural boundaries.

Do not create a new APP-008 capability.

Do not modify accepted APP-008 behaviour unless a genuine defect directly prevents this specification from being implemented.

Do not expand the iteration into pricing, reservation persistence, payment, documents, or supplier reconciliation.

After implementation, run the required focused tests and full regression and provide the standard Copilot implementation report required by GOV-DEV-001.