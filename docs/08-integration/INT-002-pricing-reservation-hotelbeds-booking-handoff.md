# INT-002 — Pricing → Reservation → Hotelbeds Booking Handoff

## 1. Document Control

| Field | Value |
|---|---|
| ID | INT-002 |
| Title | Pricing → Reservation → Hotelbeds Booking Handoff |
| Status | Draft — Architect Approval Required |
| Previous Integration | INT-001 — Journey / Accommodation Selection → Pricing Handoff |
| Related Capabilities | APP-003, APP-004, APP-005, APP-008 |
| Governing Process | `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md` |

---

## 2. Purpose

INT-002 connects the accepted INT-001 pricing handoff to the existing Reservation and accommodation-booking capabilities.

The target runtime flow is:

    Journey / Accommodation Selection
                ↓
        APP-005 Pricing
                ↓
        Reservation Review
                ↓
        APP-004 Reservation
                ↓
       APP-008.4 Revalidation
          where required
                ↓
       APP-008.5 Booking
                ↓
        Reservation Fulfilment
                ↓
       Existing Persistence

The objective is to make the existing accommodation booking implementation reachable from the real customer journey.

This specification does not create new Hotelbeds capability.

---

## 3. Governing Architecture

INT-002 SHALL follow the existing architecture and capability specifications.

Before implementation, Copilot SHALL inspect the current versions of:

- `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`
- `docs/08-integration/INT-001-JOURNEY-ACCOMMODATION-PRICING-HANDOFF.md`
- APP-003 journey/accommodation selection specifications
- APP-004 Reservation specifications
- APP-004.8 booking integration
- APP-005 pricing specifications
- APP-008.4 accommodation rate revalidation
- APP-008.5 accommodation booking
- existing Reservation persistence documentation
- existing Hotelbeds/provider implementation

Existing capability contracts are authoritative.

INT-002 SHALL connect them rather than reproduce or redesign them.

---

## 4. Current Integration Gap

The current repository already contains the major building blocks:

- canonical JourneyAccommodation selection;
- APP-005 pricing;
- `ReservationService`;
- `ReservationRepository`;
- `AccommodationBookingOrchestrationService`;
- APP-008.4 rate revalidation;
- APP-008.5 accommodation booking;
- provider selection;
- Hotelbeds provider/adapter;
- existing Reservation fulfilment structures.

The remaining gap is the production runtime connection between the customer journey Reservation path and the accommodation booking orchestration.

The implementation SHALL therefore begin by tracing the current call graph from:

`Reservation Review POST`

through:

`CustomerJourneyReservationService`

and the existing Reservation/booking services.

---

# 5. Scope

## 5.1 In Scope

Implement the minimum integration required to:

1. carry the selected accommodation through the accepted INT-001 pricing flow;
2. create the canonical Reservation;
3. preserve the selected accommodation snapshot;
4. invoke existing accommodation booking orchestration;
5. revalidate `RECHECK_REQUIRED` rates through APP-008.4;
6. send valid accommodation bookings through APP-008.5;
7. route the booking through the selected provider;
8. receive the supplier booking result;
9. associate the result with the correct Reservation fulfilment component;
10. persist supplier booking state/reference;
11. preserve existing Reservation lifecycle semantics;
12. preserve booking idempotency;
13. maintain the existing customer journey/payment handoff;
14. add focused integration tests and regression coverage.

---

## 5.2 Out of Scope

Do NOT implement:

- new Hotelbeds API capabilities;
- new suppliers;
- availability/search changes;
- new CheckRate functionality;
- cancellation;
- modification;
- booking retrieval;
- supplier reconciliation;
- payment;
- refunds;
- invoicing;
- vouchers;
- new pricing rules;
- new Reservation architecture;
- new persistence architecture;
- database redesign;
- frontend redesign;
- production photography;
- unrelated refactoring.

---

# 6. Ownership Rules

The following ownership is fixed:

| Concern | Owner |
|---|---|
| Customer/package price | APP-005 |
| Reservation | APP-004 |
| Reservation persistence | Existing Reservation repository |
| Supplier accommodation operations | APP-008 |
| Hotelbeds-specific DTOs/API | Hotelbeds adapter |
| Supplier booking state/reference | Existing Reservation fulfilment model |
| Payment | Existing downstream payment capability |

INT-002 SHALL NOT move ownership between these boundaries.

---

# 7. Required Production Flow

The implementation SHALL establish:

    Review Confirmation
          ↓
    Existing customer journey reservation path
          ↓
    Canonical selection resolution
          ↓
    APP-005 pricing
          ↓
    Reservation creation
          ↓
    Accommodation booking orchestration
          ↓
    BOOKABLE ─────────────→ APP-008.5
          │
          └─ RECHECK_REQUIRED
                    ↓
                APP-008.4
                    ↓
                APP-008.5
                    ↓
             Provider Adapter
                    ↓
                Hotelbeds
                    ↓
          Supplier Booking Result
                    ↓
          Reservation Fulfilment
                    ↓
        Reservation persistence

Use the existing services wherever possible.

Do not create a parallel orchestration path.

---

# 8. Pricing Continuity

INT-001 established the canonical pricing handoff.

INT-002 SHALL preserve it.

The final customer price SHALL remain the APP-005 result.

The deterministic INT-001 journey SHALL continue to produce:

`ZAR 18,950`

Accommodation pricing SHALL NOT be added twice.

Supplier pricing SHALL remain supplier input/traceability data and SHALL NOT replace the GCT customer price.

Where the existing booking orchestration reuses the pricing handoff, ensure accommodation inputs are applied exactly once.

---

# 9. Reservation Creation

Use the existing canonical Reservation service and repository.

Do NOT create another Reservation model or persistence path.

The Reservation SHALL preserve the information already established by the current customer journey, including:

- Reservation identity;
- journey snapshot;
- traveller snapshot;
- accommodation snapshot;
- pricing snapshot;
- existing payment snapshot;
- existing fulfilment/booking structures;
- timeline and metadata.

A Reservation MAY exist before supplier fulfilment is complete.

Do not hold a database transaction open across an external Hotelbeds call.

---

# 10. Accommodation Snapshot

The selected accommodation SHALL remain traceable through:

`Package Stop → Accommodation → Room → Rate`

Preserve, where already available in the canonical contract:

- package/stop identity;
- stop order;
- accommodation identity;
- room reference;
- rate reference;
- provider;
- supplier reference;
- stay period;
- occupancy;
- child ages;
- supplier amount;
- currency;
- pricing basis.

Do not replace the customer selection with a supplier response.

Supplier fulfilment may add booking information but must not erase the original selection snapshot.

---

# 11. Provider Selection

Use the existing provider abstraction and registry.

The booking provider SHALL correspond to the selected accommodation/rate provider.

Do NOT call Hotelbeds directly from the customer journey, Reservation aggregate, or Reservation repository.

The intended boundary remains:

    Customer Journey
          ↓
    Application Booking Service
          ↓
    Provider Registry
          ↓
    Hotelbeds Provider
          ↓
    Hotelbeds Client

Hotelbeds-specific DTOs SHALL remain inside APP-008.

---

# 12. Revalidation

For each selected accommodation:

### BOOKABLE

Proceed directly through the existing booking service.

Do not introduce an unnecessary CheckRate call.

### RECHECK_REQUIRED

Invoke the existing APP-008.4 revalidation service before booking.

The revalidation request SHALL retain the selected:

- accommodation;
- room;
- rate;
- provider;
- stay dates;
- occupancy;
- package-stop identity.

Booking SHALL proceed only after successful revalidation.

A failed/unavailable revalidation SHALL NOT proceed to booking.

---

# 13. Revalidated Rate

If revalidation produces a usable changed rate:

- use the validated supplier rate for booking;
- preserve the original customer selection traceability;
- preserve the provider identity;
- preserve package-stop association;
- do not introduce supplier pricing as a replacement for the GCT package price.

Follow the existing APP-008.4 contract for all other revalidation semantics.

Do not create new revalidation behaviour in INT-002.

---

# 14. Accommodation Booking

Use the existing:

`AccommodationBookingService`

and:

`AccommodationBookingOrchestrationService`

where appropriate.

Do not create a second accommodation booking service.

The application layer SHALL remain provider-neutral.

Hotelbeds invocation SHALL remain behind the existing provider adapter.

---

# 15. Booking Result

A successful supplier booking result SHALL be mapped into the existing canonical fulfilment representation.

Preserve:

- provider;
- supplier booking reference;
- supplier price where supplied;
- booking status;
- accommodation identity;
- room/rate identity where available;
- package-stop identity.

The supplier booking reference SHALL NOT replace the GCT Reservation number.

---

# 16. Fulfilment Association

The supplier result SHALL attach to the correct Reservation fulfilment component.

For multiple accommodation stops, association SHALL use the canonical package-stop identity.

Do not use accommodation identity alone as the stop key.

The same property may legitimately occur at more than one stop.

Do not create a new supplier-booking persistence model.

---

# 17. Supplier Outcomes

The implementation SHALL distinguish at least the existing canonical outcomes:

### Success

Supplier fulfilment is recorded as successful/confirmed according to the existing fulfilment model.

### Failure

Supplier fulfilment is recorded as failed.

The Reservation SHALL NOT be falsely marked confirmed.

### Unknown

If the result cannot establish whether the supplier operation succeeded:

- preserve the existing unknown/pending semantics;
- do not mark the fulfilment confirmed;
- do not automatically retry.

Do not invent new lifecycle states unless an existing contract explicitly requires them.

---

# 18. Reservation Lifecycle

Supplier fulfilment state and Reservation lifecycle state remain separate.

INT-002 SHALL NOT introduce a new Reservation confirmation rule.

A successful Hotelbeds booking does not automatically imply that the GCT Reservation is commercially confirmed if the existing lifecycle requires payment or another downstream condition.

Preserve the existing Reservation lifecycle implementation.

---

# 19. Idempotency

Reuse the existing idempotency mechanism.

Repeated customer confirmation SHALL NOT create duplicate canonical Reservations.

Repeated processing of an already-confirmed accommodation fulfilment SHALL NOT blindly issue another supplier booking.

For multi-stop accommodation, retain stop-specific identity in the existing idempotency mechanism where already supported.

Do not create a second idempotency subsystem.

If the current contract cannot safely guarantee supplier-booking idempotency, report the precise gap rather than inventing new persistence.

---

# 20. Multi-Stop Handling

The implementation SHALL preserve independent accommodation stops.

For supported multi-stop flows, verify:

- each stop retains its own accommodation;
- each stop retains its own room/rate;
- each stop retains its provider;
- each stop receives the correct booking result;
- supplier references cannot be attached to the wrong stop.

The same property at different stops MUST remain independently addressable.

If an existing contract does not provide information required for safe multi-stop processing, report the gap.

Do not invent a new business rule.

---

# 21. Guest Handling

Preserve the existing guest-information contract.

Where the current canonical booking contract already supplies room-level guest assignment, use it.

For a single-room booking, the existing contract may support the established room index.

Do not introduce a new guest-allocation policy as part of INT-002.

If multi-room guest assignment cannot be safely determined from the current approved contracts, report the exact limitation instead of guessing.

---

# 22. Persistence

Use the existing:

`ReservationRepository`

for Reservation persistence.

The application layer SHALL NOT import Prisma types.

The repository SHALL remain responsible for persistence only.

The implementation SHALL ensure that supplier fulfilment updates can be persisted without replacing unrelated Reservation state.

Verify that a persisted Reservation can be reloaded with:

- original snapshots;
- pricing;
- payment state;
- fulfilment state;
- supplier booking reference.

---

# 23. External Call Boundary

Do not perform Hotelbeds calls inside a database transaction.

The expected sequencing is:

    Create/persist Reservation
            ↓
    External supplier operation
            ↓
    Update Reservation fulfilment
            ↓
    Persist updated Reservation

Use the existing architecture if its actual implementation differs, but preserve the principle that the external call is not held inside a database transaction.

---

# 24. Error Handling

Supplier-specific errors SHALL be interpreted inside APP-008.

Higher application layers SHALL receive canonical outcomes/errors.

Do not expose:

- Hotelbeds DTOs;
- raw Hotelbeds error payloads;
- credentials;
- transport details;
- internal stack traces

to the customer-facing UI.

Use existing application error handling and logging.

---

# 25. Logging

Use existing logging/correlation facilities.

Operational logging MAY include:

- request/correlation ID;
- Reservation ID;
- reservation number;
- journey ID;
- package-stop ID;
- provider;
- booking outcome;
- supplier booking reference where permitted.

Do not log:

- credentials;
- API signatures;
- private keys;
- payment credentials;
- unnecessary personal data.

---

# 26. Implementation Constraints

Before changing code, trace the actual runtime implementation.

Prefer:

1. existing orchestration services;
2. existing Reservation contracts;
3. existing provider registry;
4. existing APP-008.4 service;
5. existing APP-008.5 service;
6. existing persistence;
7. minimum required wiring.

Do not refactor unrelated code.

Do not replace an accepted service simply because another implementation would be cleaner.

---

# 27. Decision-Gap Rule

Copilot SHALL stop and report a decision gap rather than inventing behaviour if implementation requires:

- a new Reservation lifecycle rule;
- a new supplier-booking persistence model;
- a new guest-to-room allocation rule;
- a new pricing rule;
- a new provider architecture;
- a database redesign;
- a change to an approved aggregate boundary.

Normal implementation choices do not require escalation.

---

# 28. Focused Test Requirements

Add or update focused tests proving:

1. reviewed journey reaches Reservation creation;
2. APP-005 price is preserved;
3. ZAR 18,950 remains deterministic;
4. accommodation snapshot is preserved;
5. BOOKABLE bypasses revalidation;
6. BOOKABLE reaches booking;
7. RECHECK_REQUIRED invokes APP-008.4;
8. failed revalidation prevents booking;
9. successful revalidation reaches booking;
10. correct provider is selected;
11. accommodation/room/rate identity is preserved;
12. package-stop identity is preserved;
13. supplier reference is preserved;
14. supplier booking result reaches Reservation fulfilment;
15. successful supplier booking is persisted;
16. failed supplier booking is not confirmed;
17. unknown supplier outcome is not confirmed;
18. repeated Reservation submission remains idempotent;
19. duplicate supplier booking is prevented by the existing idempotency mechanism;
20. existing INT-001 pricing behaviour remains unchanged.

---

# 29. Multi-Stop Tests

Where the current runtime supports multi-stop booking, test:

- two independent stops;
- repeated property at different stops;
- correct stop-specific booking association;
- correct provider per stop;
- independent supplier references;
- partial success;
- failure on one stop;
- unknown outcome on one stop.

Do not introduce new multi-stop rules solely for testing.

---

# 30. Persistence Tests

Verify:

- Reservation creation;
- supplier fulfilment update;
- supplier reference persistence;
- supplier booking status persistence;
- Reservation reload;
- original snapshot preservation;
- pricing preservation;
- payment snapshot preservation;
- existing fulfilment state preservation.

---

# 31. Integration Test

At least one application-level test SHALL exercise the real production orchestration path:

    Customer Journey Selection
            ↓
        APP-005 Pricing
            ↓
        Reservation
            ↓
    Revalidation if required
            ↓
        Booking
            ↓
    Fulfilment Result
            ↓
        Persistence

Supplier calls SHALL be mocked/stubbed.

Do not perform a live Hotelbeds booking during automated tests.

---

# 32. Browser Verification

After implementation verify:

    Accommodation Selection
            ↓
          Quote
            ↓
      Guest Information
            ↓
      Reservation Review
            ↓
       Reservation
            ↓
     Payment Handoff

At:

- 1280 × 800;
- 375 × 812.

Confirm:

- selected accommodation remains correct;
- Quote remains ZAR 18,950;
- accommodation appears once in the pricing breakdown;
- Reservation creation succeeds;
- existing payment handoff remains reachable;
- no supplier secrets appear;
- no raw supplier errors appear;
- no console errors;
- no failed resource requests;
- no horizontal overflow;
- no unexpected redirects/404s.

---

# 33. Hotelbeds Live Verification

INT-002 automated verification SHALL NOT perform an uncontrolled live Hotelbeds booking.

Live Hotelbeds testing belongs to the controlled certification workflow.

The implementation must nevertheless exercise the real provider boundary through tests/mocks sufficiently to prove:

    Canonical Booking Request
            ↓
    Provider Selection
            ↓
    Hotelbeds Adapter
            ↓
    Canonical Booking Result

No new Hotelbeds API implementation is authorised.

---

# 34. Regression Verification

After implementation run:

- focused INT-002 tests;
- relevant APP-003 tests;
- relevant APP-004 tests;
- relevant APP-005 tests;
- relevant APP-008.4 tests;
- relevant APP-008.5 tests;
- full Jest suite;
- TypeScript typecheck;
- production build;
- Prisma generate;
- Prisma validate;
- lint;
- git diff / working-tree inspection.

Report the actual current suite/test counts.

Do not modify unrelated tests merely to make historical counts match.

---

# 35. Expected Current Baseline

The accepted repository baseline immediately before INT-002 is:

- 117 Jest suites;
- 769 tests;
- 0 failures;
- typecheck passing;
- build passing;
- Prisma validation passing;
- lint passing with 10 established baseline warnings;
- clean working tree after the INT-001 commit.

Any regression must be investigated and classified.

---

# 36. Definition of Done

INT-002 is complete when:

- the customer Reservation path reaches the existing accommodation booking orchestration;
- INT-001 pricing remains authoritative;
- Reservation creation is canonical;
- accommodation selection remains traceable;
- BOOKABLE rates proceed to booking;
- RECHECK_REQUIRED rates are revalidated first;
- correct provider selection is preserved;
- Hotelbeds remains isolated behind APP-008;
- supplier booking results are captured;
- supplier references are persisted;
- fulfilment is associated with the correct stop;
- failures are not represented as confirmed;
- unknown outcomes are not represented as confirmed;
- existing idempotency is preserved;
- Reservation fulfilment can be reloaded;
- payment remains outside INT-002;
- focused tests pass;
- full regression passes;
- typecheck/build/Prisma/lint pass;
- browser verification passes;
- no unintended architecture changes are introduced.

---

# 37. Acceptance Criteria

| ID | Criterion |
|---|---|
| AC-01 | Customer journey reaches canonical Reservation orchestration |
| AC-02 | INT-001 APP-005 pricing remains authoritative |
| AC-03 | Reservation is created through existing APP-004 boundary |
| AC-04 | Accommodation snapshot remains complete and traceable |
| AC-05 | BOOKABLE rate reaches APP-008.5 |
| AC-06 | RECHECK_REQUIRED rate passes through APP-008.4 |
| AC-07 | Correct provider is used |
| AC-08 | Hotelbeds remains isolated behind APP-008 |
| AC-09 | Supplier booking result reaches Reservation fulfilment |
| AC-10 | Supplier reference is persisted |
| AC-11 | Booking result is associated with correct stop |
| AC-12 | Failed booking is not confirmed |
| AC-13 | Unknown booking is not confirmed |
| AC-14 | Existing idempotency prevents duplicate operations |
| AC-15 | Reservation can be reconstructed with fulfilment state |
| AC-16 | Reservation lifecycle remains separate from supplier fulfilment |
| AC-17 | Existing payment handoff remains intact |
| AC-18 | No payment/cancellation/modification functionality is added |
| AC-19 | Full regression and quality gates pass |
| AC-20 | Required browser flow passes at desktop and mobile |

---

# 38. Copilot Implementation Report

After implementation Copilot SHALL provide:

### Implementation
- files changed/added;
- production call path;
- orchestration changes;
- persistence changes;
- provider wiring changes.

### Architecture
- confirmation that existing APP-003/004/005/008 contracts were reused;
- confirmation that no parallel Reservation or supplier-booking architecture was created;
- confirmation that Hotelbeds remains isolated.

### Booking
- BOOKABLE path;
- RECHECK_REQUIRED path;
- success/failure/unknown handling;
- idempotency behaviour.

### Persistence
- Reservation creation;
- fulfilment update;
- supplier reference persistence;
- reload/reconstruction verification.

### Tests
- focused results;
- full Jest result;
- typecheck;
- build;
- Prisma generate;
- Prisma validate;
- lint.

### Browser
- desktop result;
- mobile result;
- end-to-end flow result;
- console/resource result.

### Scope
Explicit confirmation that no:
- payment;
- cancellation;
- modification;
- booking retrieval;
- supplier reconciliation;
- new supplier capability;
- database redesign

was implemented.

### Decision Gaps

State:

`No architectural or specification decision gap encountered.`

or identify the exact unresolved decision.

Copilot SHALL NOT commit or push.

---

# 39. Architectural Outcome

INT-002 connects existing accepted capabilities rather than introducing new architecture:

    APP-003
    Journey / Accommodation Selection
            ↓
    APP-005
    GCT Pricing
            ↓
    APP-004
    Reservation
            ↓
    APP-008.4
    Revalidation where required
            ↓
    APP-008.5
    Supplier Booking
            ↓
    Hotelbeds
            ↓
    Reservation Fulfilment

Ownership remains:

- APP-005 owns GCT customer pricing;
- APP-004 owns the Reservation;
- APP-008 owns supplier accommodation operations;
- Hotelbeds remains the supplier implementation.

This is the intended integration boundary for INT-002.

---

# 40. Final Constraint

INT-002 is an integration slice, not a capability rewrite.

Use the existing architecture.

Connect the existing services.

Preserve the existing contracts.

Make the smallest production changes necessary.

Do not invent new business rules where the existing architecture does not provide them.

Do not expand the scope into payment or Hotelbeds certification.

---

# End of Specification