# IMP-011 — Customer Journey Integration

## Document Control

| Field | Value |
|---|---|
| Document ID | IMP-011 |
| Title | Customer Journey Integration |
| Version | 1.0 |
| Status | Approved for Implementation |
| Classification | Implementation Specification |
| Owner | GCT Core System Architecture |
| Project | GCT Core |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS.md |
| Architectural Authority | ARCH-000 |
| Dependencies | IMP-003 through IMP-010, SPEC-030, APP-004, APP-006 |

---

# 1. Purpose

This specification defines the focused implementation required to integrate the existing customer-facing journey into one coherent MVP flow.

The target journey is:

Discover → Detail → Select → Accommodation → Quote → Guest → Review → Reservation → Payment → Confirmation

The primary missing integration boundary is:

Review → Canonical Reservation → Persistence → Payment → Confirmation

The implementation SHALL also correct the loss of authoritative accommodation selection and occupancy between Accommodation Selection and Pricing.

This specification does not redesign GCT Core.

It does not introduce a new workflow framework.

It does not introduce AI.

---

# 2. Governing Development Process

This specification SHALL be implemented under:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

GOV-DEV-001 is the single source of truth for the development workflow.

The mandatory workflow is:

Specification
→ Copilot Implementation
→ Focused Tests + Regression
→ Copilot Implementation Report
→ Architect Acceptance
→ User Commit

Copilot SHALL explicitly follow GOV-DEV-001.

Copilot SHALL NOT commit or push.

---

# 3. Architectural Baseline

The following existing architecture is authoritative and SHALL be reused:

- Dynamic Journey Resolver;
- Accommodation Selection Service;
- Journey Quote Service;
- Guest Information Service;
- Reservation Review Service;
- Reservation Aggregate;
- ReservationBuilder / existing Reservation services;
- `ReservationRepository`;
- `CanonicalReservationPrismaRepository`;
- existing payment application architecture;
- `CanonicalReservationPaymentContextResolver`;
- existing Booking Confirmation service/resolver;
- existing frontend controller;
- existing frontend routes;
- existing View Models/providers;
- existing EJS presentation architecture.

The following boundaries SHALL remain unchanged:

- Reservation remains the canonical Reservation Aggregate;
- Booking remains the commercial transaction;
- Booking Items remain Reservation fulfilment components;
- Supplier Bookings remain external fulfilment records;
- Payment remains a separate Financial Aggregate;
- Prisma remains infrastructure-only;
- supplier APIs remain outside frontend/application presentation boundaries.

No new Aggregate Root, repository, payment architecture, supplier architecture, or generic workflow engine SHALL be introduced.

---

# 4. Scope

## 4.1 Included

This implementation SHALL:

1. preserve validated accommodation selection through pricing and review;
2. preserve occupancy, including child ages;
3. ensure the quote corresponds to the selected accommodation;
4. preserve validated guest information;
5. establish the canonical Reservation at confirmed Review;
6. persist the Reservation through `ReservationRepository`;
7. retain the public journey identity;
8. connect the persisted Reservation to IMP-009 payment context;
9. connect payment continuation to IMP-010 confirmation;
10. correct the payment-to-confirmation identity handoff;
11. replace applicable placeholder recovery links;
12. add focused integration tests;
13. preserve existing accepted behaviour.

## 4.2 Excluded

This specification SHALL NOT implement:

- AI;
- dynamic itinerary generation;
- new Reservation architecture;
- new payment architecture;
- new supplier APIs;
- supplier API redesign;
- voucher generation;
- document generation;
- invoice generation;
- communications;
- generic workflow engines;
- unrelated frontend redesign;
- unrelated backend refactoring;
- lint-baseline remediation.

---

# 5. Accommodation Selection Continuity

The validated Accommodation Selection produced by IMP-005 SHALL remain authoritative through the subsequent Quote and Review stages.

The integrated journey SHALL preserve:

- public journey identity;
- destination/stop identity;
- stop ordering;
- property;
- room;
- rate;
- multiple rooms;
- occupancy;
- child ages;
- stay dates;
- supplier/provider references;
- required selection metadata.

The Quote stage SHALL consume the validated selected accommodation.

It SHALL NOT:

- reconstruct the first available room/rate;
- discard submitted room/rate selections;
- hardcode traveller count;
- use unvalidated browser state as authoritative.

Existing accommodation validation and revalidation behaviour SHALL remain in force.

---

# 6. Quote Continuity

The quote presented at Review SHALL correspond to the validated accommodation selection and occupancy.

The following SHALL be preserved:

- authoritative amount;
- currency;
- pricing basis;
- selected accommodation;
- occupancy;
- child ages;
- stay dates.

Pricing SHALL remain owned by the existing:

`JourneyQuoteService`

and:

`PricingEngine`

The frontend SHALL NOT calculate pricing.

Existing pricing recheck semantics SHALL be preserved.

---

# 7. Guest Information Continuity

Validated guest information SHALL remain available from Guest Information through Review and into canonical Reservation construction.

The implementation SHALL preserve:

- booking contact;
- lead traveller;
- traveller collection;
- adult/child information;
- required traveller data;
- validated dates of birth where applicable.

No second guest-information persistence mechanism SHALL be introduced.

---

# 8. Review → Canonical Reservation

A successfully validated and confirmed Review SHALL establish the canonical Reservation required by the downstream payment and confirmation capabilities.

The implementation SHALL:

1. resolve the authoritative journey;
2. resolve the validated accommodation selection;
3. resolve the authoritative quote;
4. resolve validated guest information;
5. construct the canonical Reservation using existing Reservation application/domain services;
6. preserve the public journey identity;
7. persist the Reservation through `ReservationRepository`;
8. obtain the authoritative Reservation identity;
9. continue to the existing IMP-009 payment experience.

The frontend controller SHALL NOT access Prisma directly.

The implementation SHALL NOT create a frontend-specific Reservation representation.

---

# 9. Reservation Contents

The canonical Reservation created through the customer journey SHALL preserve the authoritative information established by the preceding stages.

Where applicable, this includes:

- Reservation identity;
- Reservation number;
- customer/contact information;
- traveller snapshots;
- journey snapshot;
- accommodation snapshots;
- selected rooms;
- selected rates;
- occupancy;
- child ages;
- stay dates;
- pricing snapshot;
- payment context/snapshot;
- Booking Items;
- Supplier Bookings where authoritative data already exists.

The completed SPEC-030 persistence model SHALL be used.

The implementation SHALL NOT fabricate supplier fulfilment information.

---

# 10. APP-004 Boundary

Existing APP-004 Reservation construction and accommodation booking capabilities SHALL be reused where appropriate.

`AccommodationBookingOrchestrationService` SHALL NOT be blindly inserted into the Review controller.

That service contains supplier booking behaviour.

IMP-011 SHALL integrate the customer journey with the existing Reservation and payment boundaries without creating a second supplier-booking workflow.

Where an existing Reservation application service already provides the required construction/persistence capability, it SHALL be reused.

---

# 11. Reservation → Payment

After successful canonical Reservation persistence, the customer SHALL continue to the existing IMP-009 payment experience.

The payment context SHALL resolve from the persisted canonical Reservation.

Payment SHALL use authoritative:

- Reservation identity;
- amount;
- currency;
- payment context.

The existing PaymentGateway and PayFast architecture SHALL NOT be redesigned.

IMP-011 SHALL NOT initiate payment outside the existing payment application boundary.

---

# 12. Payment → Confirmation

The existing IMP-009 and IMP-010 boundaries SHALL remain authoritative.

The customer flow SHALL be:

Payment
→ authoritative payment state
→ Booking Confirmation

The PayFast browser return SHALL NOT establish payment success.

The confirmation experience SHALL resolve canonical Reservation/payment/fulfilment state through its existing application boundary.

The public `journeyId` SHALL remain the customer-facing identity.

Internal Reservation identifiers SHALL be resolved server-side where required.

---

# 13. Public Journey Identity

The public `journeyId` SHALL remain stable throughout the customer-facing journey.

It SHALL NOT be replaced by an internal Reservation ID in customer-facing routes.

The payment-to-confirmation handoff SHALL provide the identifier expected by the confirmation resolver.

The implementation SHALL correct the currently identified mismatch where a Reservation identifier may be supplied to a confirmation route expecting a journey identifier.

---

# 14. Recovery Integration

Normal customer recovery SHALL use existing journey-specific routes.

Applicable recovery paths SHALL preserve the public journey identity.

The implementation SHALL remove placeholder destinations from the normal customer journey, including applicable payment and confirmation recovery paths.

The following states SHALL retain controlled recovery:

- invalid journey;
- unavailable journey;
- stale accommodation;
- unavailable accommodation;
- pricing recheck;
- invalid guest information;
- invalid review;
- Reservation persistence failure;
- payment failure;
- payment cancellation;
- payment pending;
- payment unavailable;
- confirmation pending;
- confirmation unavailable.

No navigation loop SHALL be introduced.

Reservation persistence failures SHALL NOT be presented as generic payment failures.

---

# 15. Frontend Journey Integration

The normal successful journey SHALL be connected as:

Detail
→ Select
→ Accommodation
→ Quote
→ Guest Information
→ Review
→ Payment
→ Confirmation

The confirmed Review action SHALL establish the canonical Reservation required by downstream payment and confirmation.

The existing frontend architecture SHALL remain:

Route
→ Controller
→ Application Service
→ View Model / Provider
→ EJS

Controllers SHALL remain thin.

No frontend framework change is permitted.

---

# 16. Application Integration Boundary

A new application-level integration service MAY be introduced only where required to keep the controller thin and coordinate existing application services.

Such a service SHALL orchestrate existing boundaries.

It SHALL NOT replace:

- Reservation services;
- pricing services;
- payment services;
- confirmation services;
- supplier orchestration.

A generic workflow engine SHALL NOT be introduced.

---

# 17. Error and State Integrity

The integrated journey SHALL preserve the existing controlled states and SHALL NOT fabricate success.

In particular:

- payment success SHALL be authoritative;
- Reservation confirmation SHALL be authoritative;
- browser query parameters SHALL NOT override application state;
- frontend state SHALL NOT override persisted Reservation state;
- supplier availability SHALL NOT be substituted for Reservation lifecycle;
- Reservation persistence failure SHALL remain distinguishable from payment failure.

---

# 18. Tests

Focused tests SHALL cover the following.

## 18.1 Accommodation Continuity

Verify:

- selected property is preserved;
- selected room is preserved;
- selected rate is preserved;
- multiple rooms are preserved;
- occupancy is preserved;
- child ages are preserved;
- stay dates are preserved;
- first-room/rate reconstruction does not occur;
- traveller count is not hardcoded.

## 18.2 Quote Continuity

Verify:

- quote corresponds to selected accommodation;
- authoritative amount is preserved;
- currency is preserved;
- pricing basis is preserved;
- existing recheck behaviour remains correct.

## 18.3 Review → Reservation

Verify:

- valid confirmed Review creates a canonical Reservation;
- Reservation is persisted through `ReservationRepository`;
- expected Reservation snapshots are present;
- Booking Items are preserved;
- public journey identity is retained;
- persistence failure is handled safely.

## 18.4 Payment

Verify:

- payment resolves the newly persisted Reservation;
- authoritative amount/currency are used;
- normal payment no longer resolves as `UNAVAILABLE` because of missing Reservation state.

## 18.5 Confirmation

Verify:

- confirmation receives the correct public journey identity;
- canonical Reservation/payment/fulfilment state is resolved;
- browser return cannot establish payment success.

## 18.6 Recovery

Verify:

- applicable recovery paths retain journey identity;
- normal recovery does not use `/ui/placeholder`;
- no navigation loop is introduced.

## 18.7 End-to-End Integration

Add an integration test covering the principal customer flow:

Accommodation
→ Quote
→ Guest
→ Review
→ Canonical Reservation
→ Payment Context
→ Confirmation

Live Hotelbeds and PayFast calls SHALL NOT be used.

---

# 19. Lint Baseline

The established lint baseline is:

**0 errors, 10 pre-existing warnings.**

IMP-011 SHALL introduce:

**0 new warnings.**

Lint rules SHALL NOT be weakened.

Warnings SHALL NOT be suppressed.

Unrelated lint remediation SHALL NOT be performed.

---

# 20. Decision-Gap Rule

The architecture inspection identified no decision gap.

Implementation SHALL proceed using the existing application boundaries.

If implementation reveals a genuine contradiction concerning:

- Reservation ownership;
- payment authority;
- Reservation lifecycle;
- fulfilment ownership;
- public journey identity;

implementation SHALL stop at that boundary.

The implementation report SHALL identify:

1. affected boundary;
2. current implementation;
3. governing requirement;
4. exact contradiction;
5. minimum architectural decision required.

Copilot SHALL NOT invent a workaround or parallel architecture.

---

# 21. Verification

Focused IMP-011 tests SHALL be run first.

Then run:

`npm run type-check`

`npm test -- --runInBand`

`npx prisma generate`

`npx prisma validate`

`npm run build`

`npm run lint`

Full regression SHALL be run unless an environmental failure prevents it.

The implementation report SHALL provide exact suite/test counts and verification results.

No commit or push SHALL be performed by Copilot.

---

# 22. Implementation Report

The Copilot implementation report SHALL contain:

## Status

`IMPLEMENTED`, `PARTIAL`, or `BLOCKED`.

## Integration Boundary

Explain how:

`Review → Canonical Reservation → Persistence → Payment → Confirmation`

is connected.

## State Continuity

Explain how accommodation selection, occupancy, quote and guest information reach Reservation construction.

## Reservation

Identify the Reservation construction and persistence path.

## Payment

Explain how IMP-009 resolves the persisted Reservation.

## Confirmation

Explain how IMP-010 receives the correct public journey identity and authoritative state.

## Recovery

Identify placeholder recovery routes removed or replaced.

## Tests

Report focused and full regression suite/test counts.

## Verification

Report:

- type-check;
- tests;
- Prisma generate;
- Prisma validate;
- build;
- lint.

## Lint

Report final warning count and whether new warnings were introduced.

## Decision Gaps

State:

`No unresolved decision gap.`

or provide the exact contradiction.

## Scope

Confirm:

- no AI;
- no payment architecture changes;
- no supplier API changes;
- no voucher/document generation;
- no workflow framework;
- no unrelated refactoring;
- no specification changes;
- no commit;
- no push.

---

# 23. Acceptance Criteria

IMP-011 SHALL be considered implemented when:

- [ ] selected accommodation is preserved into pricing;
- [ ] selected room/rate are preserved;
- [ ] multiple-room selection is preserved where applicable;
- [ ] occupancy and child ages are preserved;
- [ ] stay dates are preserved;
- [ ] quote corresponds to the selected accommodation;
- [ ] traveller count is no longer hardcoded;
- [ ] validated guest information reaches Reservation construction;
- [ ] confirmed Review creates the canonical Reservation;
- [ ] Reservation is persisted through `ReservationRepository`;
- [ ] SPEC-030 persistence is used;
- [ ] public journey identity is retained;
- [ ] IMP-009 resolves the persisted Reservation;
- [ ] payment uses authoritative Reservation pricing;
- [ ] IMP-010 resolves the same journey correctly;
- [ ] payment-to-confirmation identity mismatch is corrected;
- [ ] applicable placeholder recovery links are removed;
- [ ] browser payment return remains non-authoritative;
- [ ] existing APP-004 Reservation/supplier boundaries remain intact;
- [ ] no new workflow architecture is introduced;
- [ ] no new lint warnings are introduced;
- [ ] focused tests pass;
- [ ] full regression passes;
- [ ] type-check passes;
- [ ] Prisma generate passes;
- [ ] Prisma validation passes;
- [ ] build passes;
- [ ] lint passes.

---

# 24. Traceability

| Authority | Purpose |
|---|---|
| GOV-DEV-001 | Governing development process |
| ARCH-000 | Architectural authority |
| SPEC-030 | Canonical Reservation persistence |
| APP-004 | Reservation construction and accommodation booking boundary |
| APP-006 | Payment/application integration authority |
| IMP-003 | Journey discovery/detail |
| IMP-004 | Journey selection |
| IMP-005 | Accommodation selection |
| IMP-006 | Pricing and quote |
| IMP-007 | Guest information |
| IMP-008 | Reservation review |
| IMP-009 | Payment experience |
| IMP-010 | Booking confirmation |

---

# 25. Scope Discipline

This implementation is limited to integrating the existing MVP customer journey.

Copilot SHALL NOT:

- redesign accepted architecture;
- introduce a competing Reservation model;
- introduce a competing payment model;
- create a generic workflow engine;
- bypass application boundaries;
- expose Prisma through frontend/application interfaces;
- call suppliers directly from frontend code;
- perform unrelated technical-debt remediation;
- modify unrelated capabilities.

The objective is to complete the existing MVP journey, not to restart or redesign GCT Core.

---

# End of Specification

**Document:** IMP-011 — Customer Journey Integration

**Version:** 1.0

**Status:** Approved for Implementation

**Governing Process:** GOV-DEV-001-DEVELOPMENT-PROCESS.md

**Next Stage:** Copilot Implementation