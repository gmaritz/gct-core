# UI-010 — Confirmation Experience

## 1. Specification

| Field | Value |
|---|---|
| ID | UI-010 |
| Name | Confirmation Experience |
| Type | Frontend UI Implementation |
| Depends On | UI-001 through UI-009 |
| Route | Existing confirmation route |
| Architecture | Express + EJS SSR |
| Status | Ready for Implementation |

---

## 2. Objective

Implement the customer-facing Reservation Confirmation experience following the established GCT Core frontend architecture and design system.

The page must provide a clear completion state after the existing reservation/payment flow and allow the customer to understand:

- that the reservation has been successfully completed;
- the customer-facing reservation/reference number;
- what was booked;
- relevant guest/traveller information;
- authoritative payment/price information where supplied;
- what happens next;
- an appropriate navigation action.

UI-010 is a presentation-layer slice. Existing reservation, payment and confirmation application capabilities remain authoritative.

---

## 3. Existing Architecture

Retain:

- Express;
- EJS server-side rendering;
- existing confirmation route/controller;
- existing `ConfirmationViewModelProvider`;
- existing application/service boundaries;
- existing reservation/payment state;
- existing UI-001 through UI-009 foundations.

Do not introduce:

- SPA architecture;
- client-side reservation state;
- client-side payment state;
- reservation creation logic;
- payment logic;
- new persistence;
- new confirmation business rules.

The template must render the existing Confirmation View Model.

---

## 4. Existing Confirmation Contract

Before implementation, inspect the current confirmation route, controller, View Model and provider.

Use the existing registered confirmation route and actual repository filenames.

Do not invent an alternative confirmation route.

Use the existing customer-facing confirmation/reference identifier where supplied.

Do not expose internal database identifiers or implementation-specific IDs.

If the current View Model lacks a genuinely required presentation field, make the smallest necessary presentation-contract change and report it.

Do not redesign the confirmation/application architecture.

---

## 5. Page Structure

### 5.1 Confirmation Header

Create a prominent completion state containing:

- confirmation/status treatment;
- kicker such as `Booking confirmed`;
- one meaningful `h1`, e.g. `Your reservation is confirmed`;
- concise supporting confirmation message.

The successful state must be based on the authoritative Confirmation View Model.

Do not display a successful confirmation message when the application state is unsuccessful, pending or unresolved.

---

### 5.2 Reservation Reference

Where supplied, prominently display:

- customer-facing reservation/reference number;
- clear visible label;
- copy-friendly text presentation.

Do not generate a new reference number in EJS or JavaScript.

Do not expose internal IDs.

---

### 5.3 Journey / Reservation Summary

Display authoritative information supplied by the Confirmation View Model, where available:

- journey title;
- destination/context;
- dates;
- duration;
- accommodation/property;
- selected room/rate;
- occupancy.

Do not reconstruct these values from browser state or hidden inputs.

---

### 5.4 Guest / Traveller Summary

Where supplied, display appropriate customer-facing information, such as:

- booking contact name;
- booking contact email;
- traveller names;
- relevant traveller information.

Keep the presentation concise and avoid unnecessarily exposing sensitive personal information.

Only display fields supplied by the existing presentation contract.

---

### 5.5 Price / Payment Summary

Where supplied by the Confirmation View Model, display:

- authoritative amount;
- currency;
- payment status;
- relevant customer-facing payment/reference information.

Reuse:

`COMP-003 — Price Display`

The template MUST NOT calculate:

- totals;
- taxes;
- discounts;
- balances;
- payment amounts.

---

### 5.6 Next Steps

Provide concise customer guidance about what happens next.

Only state operational information supported by the existing application contract.

Examples may include:

- confirmation communication;
- reservation processing;
- supplier fulfilment;
- customer support/contact information.

Do not invent operational promises.

---

### 5.7 Navigation

Provide a clear post-confirmation navigation action.

Use an existing registered route supplied by the application where available.

Possible destination:

- journey/detail page;
- main customer journey;
- existing homepage/site route.

Do not invent account/dashboard/reservation-management routes.

---

## 6. Confirmation State

The confirmation page is read-only.

Do not provide:

- another reservation-confirmation form;
- another payment action;
- editable reservation fields;
- browser-side reservation state.

Customer-facing actions are limited to appropriate navigation/recovery actions.

---

## 7. Refresh / Idempotency

The confirmation page must be safe to refresh.

GET rendering must not:

- create another reservation;
- initiate another payment;
- mutate reservation state.

Existing reservation confirmation/idempotency behaviour remains application-owned.

UI-010 simply renders the authoritative confirmation state.

Verify refresh behaviour during browser testing.

---

## 8. Status / Failure States

Preserve existing confirmation/application outcome mapping.

Where supported by the current View Model, render customer-safe states such as:

- confirmed;
- processing/pending;
- confirmation unavailable;
- confirmation failure.

Do not invent new business states.

For unsuccessful states:

- use the existing feedback/status patterns;
- display only safe customer-facing messages;
- provide an existing recovery/navigation action where available.

Never expose:

- stack traces;
- supplier diagnostics;
- internal exception details;
- internal IDs;
- payment credentials;
- implementation details.

Do not introduce client-side polling or a new confirmation state machine.

---

## 9. Layout

Use the UI-001 container, typography, spacing and card foundations.

Recommended hierarchy:

1. prominent confirmation state;
2. reservation/reference information;
3. booking summary;
4. payment/price summary;
5. next-step information;
6. post-confirmation navigation.

The successful completion state should be immediately understandable.

Avoid excessive decorative content.

The page should feel calmer and more reassuring than the transactional Payment page.

---

## 10. Responsive Requirements

### Desktop

Verify at approximately:

`1280 × 800`

Confirm:

- confirmation state is immediately visible;
- reference is prominent;
- booking information is readable;
- price/payment information is clear;
- next steps are readable;
- actions are clear;
- no excessive unused space;
- no horizontal overflow.

### Mobile

Verify at approximately:

`375 × 812`

Confirm:

- confirmation message remains prominent;
- reference remains readable;
- sections stack logically;
- actions fit the viewport;
- no horizontal overflow;
- no fixed/sticky element obscures content.

Verify an intermediate width where practical.

---

## 11. Accessibility

Retain the accessibility foundations established by UI-001 through UI-009.

Required:

- one meaningful `h1`;
- logical heading hierarchy;
- semantic sections;
- native links/buttons;
- visible focus indicators;
- keyboard accessibility;
- logical tab order;
- no keyboard traps;
- accessible confirmation/status messaging.

The confirmation state MUST NOT rely on colour alone.

If an icon is used for success/status, provide an equivalent accessible text representation.

Reservation/reference values must have clear visible labels.

Do not introduce broken ARIA references.

---

## 12. Progressive Enhancement

UI-010 must function without JavaScript.

The complete confirmation experience must be rendered through SSR.

JavaScript is not required for:

- confirmation state;
- reservation reference;
- pricing;
- payment status;
- next-step messaging;
- navigation.

Any JavaScript must be optional progressive enhancement only.

---

## 13. Design-System Reuse

Reuse established:

- `DS-001`;
- container/layout foundations;
- typography;
- cards;
- `COMP-002 — Button`;
- `COMP-003 — Price Display`;
- existing feedback/status patterns;
- established action-group and spacing patterns;
- focus-state conventions.

Do not introduce a separate confirmation visual language.

Do not create a new reusable component unless implementation reveals a genuine component gap. Report such a gap rather than silently expanding the architecture.

---

## 14. Assets

**No production photography is required for UI-010.**

Do not introduce:

- production journey photography;
- new confirmation illustration systems;
- unrelated imagery;
- new icon libraries.

An existing approved status/icon treatment may be reused where appropriate.

---

## 15. Files / Scope

First inspect the existing confirmation implementation.

Expected scope is limited to the existing confirmation page template and stylesheet, using the actual repository filenames.

Only modify the Confirmation View Model/provider if a genuine presentation-contract gap prevents implementation.

Do not modify unrelated:

- reservation services;
- payment services;
- reservation persistence;
- Prisma/database;
- supplier integrations;
- customer resolution;
- confirmation application logic.

No unrelated refactoring.

---

## 16. Route Integrity

Use the existing registered confirmation route and navigation contracts.

Do not create alternate confirmation routes.

Do not invent:

- account routes;
- dashboard routes;
- reservation-management routes;
- confirmation APIs.

Use existing application-provided navigation targets where available.

---

## 17. Data / Security Boundary

Only display customer-facing information supplied by the existing Confirmation View Model.

Do not expose:

- internal database IDs;
- supplier booking credentials;
- payment secrets;
- security/signing values;
- raw supplier responses;
- internal exception information.

Avoid unnecessarily exposing sensitive traveller information.

Do not allow browser-supplied values to become authoritative confirmation data.

---

## 18. Testing

Inspect existing confirmation tests before implementation.

Add or extend focused tests only where UI-010 introduces behaviour not already covered.

At minimum verify:

1. confirmation page renders;
2. successful confirmation state renders;
3. customer-facing reservation/reference number renders where supplied;
4. journey/reservation context renders;
5. accommodation context renders where supplied;
6. guest/traveller information renders where supplied;
7. authoritative price/payment information renders where supplied;
8. next-step messaging renders;
9. appropriate post-confirmation navigation exists;
10. existing non-success/error states remain correctly represented;
11. internal implementation data is not rendered;
12. refresh does not initiate a new reservation/payment.

Where supported, verify:

- heading structure;
- accessible status;
- reference label;
- navigation action accessibility;
- valid ARIA references.

Do not duplicate existing application/domain tests unnecessarily.

---

## 19. Browser Verification

Actual browser verification is required after the final implementation changes.

### Desktop — 1280 × 800

Verify:

- confirmation page renders;
- success state is immediately clear;
- reference is visible;
- reservation summary is readable;
- payment/price summary is readable;
- next steps are clear;
- navigation actions work;
- focus indicators are visible;
- no horizontal overflow.

### Mobile — 375 × 812

Verify:

- confirmation state remains prominent;
- reference remains readable;
- sections stack correctly;
- actions remain usable;
- no horizontal overflow;
- no obstructive fixed/sticky elements.

### Keyboard

Verify:

- skip link;
- navigation;
- post-confirmation actions;
- visible focus;
- logical tab order;
- no keyboard trap.

### Refresh

Verify:

- refreshing the confirmation page does not create another reservation;
- refreshing does not initiate another payment;
- the authoritative confirmation state continues to render.

---

## 20. Verification Gate

After all implementation changes are complete, run:

1. focused UI-010 tests;
2. relevant confirmation/integration tests;
3. `npm test`;
4. `npm run type-check`;
5. `npm run build`;
6. `npm run lint`;
7. `git diff --check`.

All results reported MUST represent the final code state.

If a command fails:

- investigate;
- resolve the issue where appropriate;
- rerun the affected verification;
- report the final result.

Do not claim PASS based on an earlier execution followed by further code changes.

---

## 21. Regression

UI-010 must not regress:

- UI-001 Design Foundation;
- UI-002 Application Shell;
- UI-003 Discover;
- UI-004 Journey Detail;
- UI-005 Accommodation Selection;
- UI-006 Quote/Pricing;
- UI-007 Guest Information;
- UI-008 Reservation Review;
- UI-009 Payment;
- reservation confirmation behaviour;
- payment outcome handling;
- existing confirmation navigation.

Pre-existing failures must be identified separately.

Do not suppress or ignore failures.

---

## 22. Implementation Report

Copilot MUST provide an implementation report containing:

### Implementation

- files changed;
- meaningful template/CSS changes;
- View Model/provider changes, if any;
- design-system components/patterns reused.

### Architecture

Confirm:

- Express/EJS SSR retained;
- existing Confirmation View Model/provider retained;
- no client-side confirmation state;
- no duplicated reservation/payment logic;
- existing application confirmation capability retained.

### Verification

Report final results for:

- focused tests;
- relevant integration tests;
- `npm test`;
- `npm run type-check`;
- `npm run build`;
- `npm run lint`;
- `git diff --check`.

### Browser

Report:

- desktop result;
- mobile result;
- keyboard result;
- refresh/idempotency result;
- overflow result;
- accessibility observations.

### Scope

Confirm:

- no unrelated backend changes;
- no database/Prisma changes;
- no supplier/payment changes;
- no production photography;
- no commit;
- no push.

---

## 23. Acceptance Criteria

UI-010 is ready for Architect Acceptance when:

- [ ] Confirmation page renders through the existing route.
- [ ] Successful confirmation state is immediately clear.
- [ ] Customer-facing reservation/reference information is displayed.
- [ ] Journey/accommodation context is displayed where supplied.
- [ ] Guest/traveller context is displayed where appropriate.
- [ ] Authoritative price/payment information is displayed where supplied.
- [ ] Appropriate next-step information is displayed.
- [ ] Post-confirmation navigation is available.
- [ ] No second confirmation or payment action exists.
- [ ] Page is safe to refresh.
- [ ] Existing confirmation/application outcomes are preserved.
- [ ] UI-001 design foundations are reused.
- [ ] Desktop layout is coherent.
- [ ] Mobile layout is coherent.
- [ ] No horizontal overflow.
- [ ] Keyboard navigation works.
- [ ] Focus is visible.
- [ ] Confirmation status is accessible without relying on colour.
- [ ] No client-side authoritative reservation/payment state exists.
- [ ] No business logic is added to EJS/JavaScript.
- [ ] Focused tests pass.
- [ ] Full regression passes.
- [ ] Type-check passes.
- [ ] Build passes.
- [ ] Lint passes with only established baseline warnings, if applicable.
- [ ] `git diff --check` passes.
- [ ] Browser verification passes after final changes.
- [ ] Refresh behaviour is verified.
- [ ] No production photography introduced.
- [ ] Copilot has not committed or pushed.

---

## 24. Architectural Stop Conditions

Stop and report to the Architect rather than expanding UI-010 if implementation requires:

- a new reservation business rule;
- reservation lifecycle changes;
- payment changes;
- persistence changes;
- supplier changes;
- new confirmation state logic;
- notification/communication infrastructure;
- authentication/account architecture;
- a new authoritative confirmation contract;
- frontend framework/state-management architecture.

UI-010 is limited to presenting the existing confirmation capability as a clear, accessible and responsive customer completion experience.

---

## 25. Commit Boundary

Copilot MUST NOT:

- commit;
- amend;
- push.

Following Architect Acceptance, the user performs the commit.

Proposed commit message:

`feat(ui): establish confirmation experience`