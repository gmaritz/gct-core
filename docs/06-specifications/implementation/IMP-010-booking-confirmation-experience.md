# IMP-010 — Booking Confirmation Experience

**Status:** Approved for Implementation  
**Capability:** Customer-facing booking confirmation  
**Depends On:** SPEC-030, APP-004, APP-006, IMP-009  
**Scope:** MVP frontend confirmation experience

---

## 1. Objective

Implement the customer-facing Booking Confirmation experience following successful payment and authoritative booking confirmation.

The experience must consume existing canonical Reservation and Payment application state.

It must not create or modify Reservation or Payment state.

The target flow is:

Payment
→ authoritative Payment status
→ authoritative Reservation / fulfilment status
→ Booking Confirmation View Model
→ customer confirmation page

The browser return from PayFast is never, by itself, proof of successful payment or booking.

---

## 2. Governing Architecture

Follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

Use the verified architecture defined by:

- SPEC-026
- SPEC-027
- SPEC-028
- SPEC-029
- SPEC-030
- APP-004
- APP-006
- IMP-009

Do not introduce new Reservation, Payment, Booking, Supplier Booking, or confirmation aggregates.

The existing application/domain boundaries remain authoritative.

---

## 3. Authoritative State

The confirmation experience must resolve authoritative application state through existing application services/repositories.

Do not use browser parameters, query-string status, frontend state, or stale View Model values as authoritative.

The confirmation experience must distinguish:

- authoritative payment status;
- Reservation lifecycle;
- fulfilment/supplier status where available.

Do not equate payment success automatically with complete supplier fulfilment.

Do not modify Reservation lifecycle from the frontend.

---

## 4. Confirmation Route

Implement the customer-facing confirmation route using the established `/ui` frontend architecture.

The route must use the existing public journey/Reservation identity conventions.

Do not expose unnecessary internal database identifiers.

The route must resolve the authoritative Reservation/payment context through application boundaries rather than direct Prisma access.

---

## 5. Confirmation Resolution

Create the smallest required application-level confirmation resolver/service if an existing equivalent does not already exist.

It must:

1. Resolve the authoritative Reservation.
2. Resolve authoritative Payment status using the existing payment application boundary.
3. Resolve Reservation lifecycle.
4. Resolve fulfilment/supplier state where already available.
5. Produce a provider-independent confirmation result.

Do not call Hotelbeds or PayFast directly from the frontend.

Do not create a second payment-status architecture.

---

## 6. Confirmation States

Use existing application contracts where possible.

The View Model must support the meaningful states required by the current architecture, including where applicable:

- `CONFIRMED`
- `PENDING`
- `FAILED`
- `CANCELLED`
- `INVALID`
- `NOT_FOUND`
- `UNAVAILABLE`

Do not invent additional business states without an existing architectural basis.

### CONFIRMED

Display the customer confirmation experience only when authoritative state supports confirmation.

### PENDING

Clearly indicate that payment/booking confirmation is still being resolved.

Do not present the booking as confirmed.

### FAILED / CANCELLED

Present a controlled failure state and appropriate recovery path.

### INVALID / NOT_FOUND / UNAVAILABLE

Present a controlled error/recovery state without exposing internal implementation details.

---

## 7. Confirmation View Model

Create a dedicated Booking Confirmation View Model/provider following the established frontend architecture.

The View Model should expose only presentation-ready data.

Where available, include:

- Reservation reference;
- journey/package summary;
- travel dates;
- destinations;
- accommodation summary;
- traveller/lead-traveller summary;
- authoritative final amount;
- currency;
- payment status;
- Reservation status;
- fulfilment/supplier status where appropriate.

Do not expose:

- Prisma objects;
- payment credentials;
- PayFast secrets;
- internal database identifiers unnecessarily;
- raw supplier responses.

---

## 8. Confirmed Experience

For an authoritative confirmed result, provide a clear customer-facing confirmation page.

The page should communicate:

- booking confirmed;
- Reservation/reference number;
- journey summary;
- relevant travel dates;
- accommodation summary;
- traveller/contact summary;
- authoritative amount/currency;
- appropriate next-step information.

The experience should provide a clear completion boundary from the booking flow.

Do not implement voucher/document generation.

---

## 9. Pending Experience

For a pending result:

- clearly state that confirmation is still being processed;
- do not display the booking as confirmed;
- preserve the Reservation reference where safely available;
- provide an appropriate recovery/refresh path.

Do not poll external suppliers directly from the browser.

Do not introduce a new background-processing architecture.

---

## 10. Failure and Recovery

For failed or cancelled payment/booking states:

- clearly communicate that confirmation was not completed;
- preserve the authoritative Reservation reference where appropriate;
- provide an appropriate recovery path to the existing payment/review flow;
- do not claim successful booking.

Avoid redirect loops.

Do not recreate Reservation or payment state from the frontend.

---

## 11. Payment Boundary

IMP-010 consumes the completed IMP-009 payment architecture.

The expected boundary is:

Canonical Reservation
→ Payment application state
→ Confirmation resolution
→ Confirmation View Model

Do not initiate payment from IMP-010.

Do not modify the PaymentGateway.

Do not modify PayFast integration.

Do not establish payment success from the PayFast browser return alone.

---

## 12. Reservation Boundary

Use the completed SPEC-030 canonical Reservation persistence.

The Reservation must be resolved through:

`ReservationRepository`

and the canonical persistence implementation.

Do not access Prisma directly from controllers or View Model providers.

Do not create a second Reservation repository.

Do not modify the Reservation Aggregate solely for presentation purposes.

---

## 13. Fulfilment Boundary

Where existing APP-004/APP-008 application state provides supplier fulfilment information, present the appropriate authoritative status.

Do not introduce new supplier fulfilment logic.

Do not call Hotelbeds from the confirmation controller or View Model.

Do not require voucher generation for confirmation.

---

## 14. Frontend Implementation

Use the established:

- frontend controller;
- frontend route;
- application service/resolver;
- View Model;
- View Model provider;
- EJS;
- existing CSS architecture.

Follow the existing accessibility and responsive UI conventions.

Do not introduce a new frontend framework.

Do not redesign unrelated journey pages.

---

## 15. Tests

Add/update focused tests covering:

### Confirmation Resolution

- confirmed Reservation/payment;
- pending payment/booking;
- failed payment;
- cancelled payment;
- invalid context;
- Reservation not found;
- unavailable context.

### Authoritative State

Verify that:

- browser return does not establish payment success;
- query-string status cannot override authoritative payment status;
- displayed amount/currency comes from authoritative state;
- Reservation identity is resolved server-side.

### View Model

Verify:

- Reservation reference;
- journey summary;
- dates;
- accommodation;
- traveller summary;
- amount/currency;
- payment status;
- Reservation status;
- fulfilment status where available.

### HTTP

Verify:

- confirmation route;
- successful rendering;
- pending rendering;
- failure rendering;
- controlled invalid/not-found/unavailable responses;
- recovery links.

### Regression

Preserve all existing accepted functionality through:

- APP-004;
- APP-006;
- IMP-003.1;
- IMP-003.2;
- IMP-004;
- IMP-005;
- IMP-006;
- IMP-007;
- IMP-008;
- IMP-009.

Do not use live PayFast or Hotelbeds.

---

## 16. Non-Scope

Do not implement:

- AI;
- dynamic itinerary generation;
- voucher generation;
- PDF/document generation;
- invoice generation;
- email/SMS/WhatsApp delivery;
- payment processing;
- payment-provider redesign;
- supplier API changes;
- reservation creation;
- Reservation lifecycle redesign;
- new persistence architecture;
- unrelated frontend redesign;
- unrelated lint remediation.

These are separate capabilities.

---

## 17. Lint Baseline

Maintain the established frontend baseline:

**0 errors, 10 pre-existing warnings.**

Do not introduce new warnings.

Do not weaken lint rules.

Do not suppress warnings.

---

## 18. Decision-Gap Rule

Do not stop merely because a dedicated confirmation resolver/View Model does not currently exist.

Implement the smallest missing presentation/application layer required by this specification.

Stop only if an existing verified architecture contains a genuine contradiction concerning:

- authoritative payment state;
- Reservation confirmation semantics;
- fulfilment state;
- identity;
- application ownership.

If a genuine contradiction exists, report:

1. affected boundary;
2. current implementation;
3. verified requirement;
4. exact contradiction;
5. minimum architectural decision required.

Do not invent a new architecture.

---

## 19. Verification

Run focused IMP-010 tests first.

Then run:

`npm run type-check`

`npm test -- --runInBand`

`npx prisma generate`

`npx prisma validate`

`npm run build`

`npm run lint`

Report exact suite/test counts and results.

The full regression is required unless an explicit environmental failure prevents it.

Do not commit or push.

---

## 20. Implementation Report

Return a concise report containing:

### Status

Implemented / Partial / Blocked.

### Changes

List created and modified files.

### Confirmation Boundary

Explain:

Reservation
→ Payment status
→ Confirmation resolution
→ Confirmation View Model
→ Customer confirmation.

### Authoritative State

Explain how payment, Reservation and fulfilment status are resolved.

### Frontend

Report route, controller, View Model/provider and confirmation views.

### Tests

Report focused suites/tests and full regression suites/tests.

### Verification

Report:

- type-check;
- full regression;
- Prisma generate;
- Prisma validate;
- build;
- lint.

### Lint

Report final warning count and whether any new warnings were introduced.

### Decision Gaps

State:

`No unresolved decision gap.`

or provide the exact contradiction.

### Scope

Confirm:

- no AI;
- no payment processing;
- no supplier API changes;
- no voucher/document generation;
- no Reservation architecture changes;
- no unrelated refactoring;
- no commit;
- no push.

---

## 21. Completion Criteria

IMP-010 is complete when a customer with an authoritative confirmed Reservation and payment state can reach a clear Booking Confirmation experience showing the relevant confirmed booking information.

The flow must correctly distinguish confirmed, pending and unsuccessful states.

Payment success must come from authoritative application state.

Reservation confirmation must not be fabricated by the frontend.

The implementation must use the existing canonical Reservation, Payment and fulfilment architecture.

No voucher/document or communications capability is required for IMP-010.

No AI is implemented.

No new architecture is introduced.

Do not commit or push.