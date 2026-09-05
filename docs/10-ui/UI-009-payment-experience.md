# UI-009 — Payment Experience

## 1. Purpose

Implement the customer-facing Payment Experience as the next frontend vertical slice in the GCT Core customer journey.

The page provides the transition from Reservation Review to the existing PayFast hosted-payment flow.

UI-009 is a presentation-layer implementation only. Existing payment orchestration, transaction creation, payment amount calculation, PayFast integration, reservation state and payment outcome handling remain authoritative.

Customer journey position:

`Reservation Review → Payment → PayFast Hosted Payment → Confirmation`

---

## 2. Governing Architecture

Implementation MUST follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

Retain the established frontend architecture:

- Express + EJS server-side rendering;
- existing payment routes/controllers;
- existing Payment View Model/provider;
- existing `HostedPaymentAction`;
- existing PayFast integration;
- existing application/service boundaries;
- UI-001 through UI-008 design foundations.

Do NOT introduce:

- React, Vue, Angular or another SPA framework;
- client-side application/payment state;
- frontend payment processing;
- direct PayFast API integration from the browser;
- client-side pricing/payment calculations;
- new payment persistence;
- duplicated payment or reservation business logic.

The existing application/payment capability remains authoritative.

---

## 3. Existing Payment Contract

Before implementation, inspect the current payment implementation and use the actual existing contracts.

Expected payment route:

`GET /ui/journeys/:journeyId/payment`

Existing PayFast handoff mechanism:

`HostedPaymentAction`

The implementation MUST preserve the existing server-side payment handoff mechanism.

Do not invent an alternative payment route or handoff mechanism.

If the existing Payment View Model lacks information genuinely required by the UI, make the smallest necessary presentation-contract change and report it. Do not redesign the payment architecture.

---

## 4. Page Requirements

Implement the Payment page with the following information hierarchy.

### 4.1 Breadcrumb / Back Navigation

Provide navigation back to:

`/ui/journeys/:journeyId/review`

Use the actual registered route.

Do not use placeholder anchors or invented routes.

### 4.2 Page Header

Provide:

- kicker: `Payment`;
- one meaningful `h1`, e.g. `Complete your payment`;
- concise supporting text explaining that the customer is proceeding to secure payment.

### 4.3 Reservation Context

Display authoritative reservation/journey context supplied by the existing Payment View Model.

Where available, show:

- journey title;
- accommodation/property;
- relevant dates;
- concise reservation context.

Do not reconstruct this information in EJS or JavaScript.

### 4.4 Amount Payable

Display the authoritative payable amount supplied by the Payment View Model.

Reuse:

`COMP-003 — Price Display`

The amount must be visually prominent.

The template MUST NOT:

- calculate totals;
- add/subtract pricing components;
- calculate taxes;
- calculate discounts;
- derive currency;
- derive the amount payable.

---

## 5. Payment Action

Provide one dominant payment action.

Preferred wording:

`Proceed to secure payment`

Use equivalent existing application terminology if already established.

The action must clearly communicate that the customer will continue to the secure PayFast payment environment.

Use the existing `HostedPaymentAction`.

The frontend MUST NOT implement PayFast handoff logic.

If the existing implementation uses a server-generated form/action:

- preserve the existing contract;
- render only values supplied by the application layer;
- do not modify signed/payment fields in the browser.

If the existing implementation redirects through a server route:

- retain that route;
- do not replace it with client-side JavaScript.

The action must use the established primary button pattern from `COMP-002`.

---

## 6. Payment Messaging

Clearly communicate:

- the amount being paid;
- that payment occurs through PayFast;
- that the customer will continue to a secure external payment environment;
- what happens after payment, where supported by the existing application flow.

Do not promise payment success or reservation confirmation before the application has actually established those outcomes.

Use existing application terminology for payment states.

---

## 7. Payment Security / Trust Boundary

The browser is not authoritative for:

- amount;
- currency;
- merchant identifiers;
- transaction identifiers;
- reservation identifiers;
- payment status;
- signatures;
- PayFast security fields.

Payment fields required by the PayFast integration MUST continue to originate from the existing server-side payment boundary.

Do not expose:

- merchant secrets;
- signing secrets;
- credentials;
- internal diagnostics;
- sensitive payment information.

Do not introduce browser-side payment-status determination.

---

## 8. Status and Failure States

Preserve the existing application/controller outcome mapping.

Support existing states supplied by the current payment contract, including where applicable:

- payment ready;
- payment unavailable;
- payment handoff failure;
- reservation/payment failure;
- already completed/no-longer-payable state.

Do not invent new business states.

Customer-facing failures must use safe messages supplied by the application boundary.

Do not expose:

- stack traces;
- PayFast diagnostics;
- internal exception details;
- internal IDs;
- credentials;
- supplier/payment implementation details.

Where an existing recovery action is supplied, render it clearly.

Do not create a new frontend retry/payment state machine.

---

## 9. Payment Form / Handoff Behaviour

Inspect the current `HostedPaymentAction` implementation before changing the payment template.

Preserve:

- server-side payment data generation;
- existing signatures/security fields;
- existing POST/redirect behaviour;
- existing PayFast integration;
- existing duplicate-action protection.

The customer must have one clear primary payment action.

The core handoff MUST work without JavaScript.

JavaScript may provide progressive enhancement only, such as:

- duplicate-submit protection;
- disabled/pending button state;
- non-essential visual feedback.

---

## 10. Layout

Use the UI-001 container, spacing and layout foundations.

Recommended desktop structure:

- primary payment explanation/reservation context;
- secondary summary/action card.

The summary/action area should contain:

- amount payable;
- concise reservation context;
- primary payment action.

Essential payment information must not exist only in the sidebar.

If a sticky summary is used on desktop:

- it must not obscure content;
- it must not create overflow;
- it must remain keyboard accessible;
- sticky behaviour must be removed or simplified on mobile.

---

## 11. Responsive Requirements

### Desktop

Verify at approximately:

`1280 × 800`

Confirm:

- coherent layout;
- prominent amount;
- clear payment action;
- readable explanatory content;
- usable reservation context;
- no clipping;
- no horizontal overflow.

### Mobile

Verify at approximately:

`375 × 812`

Confirm:

- single-column layout;
- readable payment content;
- prominent amount;
- payment action easy to locate;
- button fits viewport;
- no horizontal overflow;
- no obstructive sticky behaviour.

Verify an intermediate width where practical.

---

## 12. Accessibility

Maintain the accessibility foundation established by UI-001/UI-002.

Required:

- one meaningful `h1`;
- logical heading hierarchy;
- semantic sections;
- native links/buttons/forms;
- visible focus indicators;
- keyboard accessibility;
- logical tab order;
- no keyboard traps;
- accessible status/error messaging.

The primary payment action MUST have a clear accessible name.

Security/payment messaging MUST NOT rely on colour alone.

If `role="alert"` is used, it must be reserved for appropriate status/error content.

Do not introduce broken ARIA references.

---

## 13. Progressive Enhancement

The payment handoff MUST remain functional with JavaScript disabled.

JavaScript may enhance:

- duplicate-submit prevention;
- pending button state;
- non-essential visual feedback.

Do NOT move into JavaScript:

- payment processing;
- payment confirmation;
- payment status determination;
- pricing;
- reservation state.

---

## 14. Design-System Reuse

Reuse existing:

- `DS-001` tokens;
- shared container;
- typography;
- cards;
- `COMP-002 — Button`;
- `COMP-003 — Price Display`;
- feedback/status patterns;
- action-group patterns;
- spacing/focus tokens.

Do not introduce new one-off visual primitives where existing patterns are suitable.

No new component specification is required for UI-009 unless implementation reveals a genuinely reusable component gap. Report such a gap rather than silently expanding the component architecture.

---

## 15. Assets

**No production photography is required for UI-009.**

Do not introduce:

- production journey photography;
- payment illustrations;
- unrelated assets;
- a new asset library.

The payment experience should remain focused on reservation context, amount and secure payment action.

---

## 16. Files / Scope

First inspect the current payment implementation.

Expected scope is limited to the existing payment page template and stylesheet, for example:

- `views/pages/payment.ejs`;
- `public/css/pages/payment.css`.

Actual filenames MUST follow the repository structure.

View Model/provider changes are not expected unless a genuine presentation-contract gap is discovered.

Do NOT modify unrelated:

- payment services;
- PayFast integration;
- reservation services;
- pricing;
- persistence;
- Prisma/database;
- supplier integrations.

No unrelated refactoring.

---

## 17. Route Integrity

Use the existing registered routes.

| Purpose | Route / Mechanism |
|---|---|
| Payment page | Existing `/ui/journeys/:journeyId/payment` |
| Back to review | `/ui/journeys/:journeyId/review` |
| PayFast handoff | Existing `HostedPaymentAction` mechanism |
| Confirmation | Existing application confirmation route |

Copilot MUST inspect the current route registration before implementation rather than assuming route details.

---

## 18. Testing Requirements

Inspect existing payment tests before implementation.

Add or extend tests only where UI-009 introduces presentation behaviour not already covered.

At minimum verify:

1. payment page renders successfully;
2. reservation/journey context renders;
3. authoritative payable amount renders;
4. payment action is present;
5. payment action invokes the existing hosted-payment mechanism;
6. back navigation returns to Reservation Review;
7. existing payment status/error state renders;
8. sensitive payment information is not rendered;
9. existing payment application outcome mapping remains intact.

Where existing service/integration tests already cover PayFast behaviour, do not duplicate payment integration logic unnecessarily.

Where supported by the existing frontend test framework, verify:

- heading structure;
- accessible payment action;
- status/error semantics;
- valid ARIA references.

---

## 19. Browser Verification

Actual browser verification MUST be performed after the final implementation changes.

### Desktop — 1280 × 800

Verify:

- page renders correctly;
- reservation context is visible;
- payable amount is clear;
- payment/security messaging is clear;
- primary action is usable;
- back navigation works;
- focus indicators are visible;
- no horizontal overflow.

### Mobile — 375 × 812

Verify:

- single-column layout;
- content remains readable;
- amount remains prominent;
- payment action remains usable;
- no horizontal overflow;
- no obstructive sticky behaviour.

### Keyboard

Verify:

- skip link;
- navigation;
- back link;
- payment action;
- visible focus;
- logical tab order;
- no keyboard trap.

### Payment Handoff

Using the application's safe test/sandbox environment where applicable, verify:

- payment action invokes the existing hosted-payment mechanism;
- server-generated payment state is used;
- duplicate submission protection works;
- JavaScript is not required for the core handoff.

Do not use real customer payment credentials.

---

## 20. Verification Gate

After all implementation changes are complete, run:

1. focused UI-009 tests;
2. relevant payment integration tests;
3. `npm test`;
4. `npm run type-check`;
5. `npm run build`;
6. `npm run lint`;
7. `git diff --check`.

All reported verification results MUST represent the final code state.

If a failure occurs, resolve it or report it accurately. Do not claim PASS based on an earlier execution followed by further code changes.

---

## 21. Regression

UI-009 MUST NOT regress:

- UI-001 Design Foundation;
- UI-002 Application Shell;
- UI-003 Discover;
- UI-004 Journey Detail;
- UI-005 Accommodation Selection;
- UI-006 Quote/Pricing;
- UI-007 Guest Information;
- UI-008 Reservation Review;
- existing payment/application behaviour;
- existing PayFast handoff;
- confirmation flow.

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
- existing payment contract retained;
- existing `HostedPaymentAction` retained;
- no SPA/client-side payment state;
- no duplicated payment/pricing/reservation logic;
- server-authoritative payment state retained.

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
- payment-handoff result;
- overflow result;
- accessibility observations.

### Scope

Confirm:

- no unrelated backend changes;
- no database/Prisma changes;
- no supplier changes;
- no payment integration redesign;
- no production photography;
- no commit;
- no push.

---

## 23. Acceptance Criteria

UI-009 is ready for Architect Acceptance when:

- [ ] Payment page renders through the existing payment route.
- [ ] Reservation/journey context is clear.
- [ ] Authoritative payable amount is prominent.
- [ ] Payment/security messaging is clear.
- [ ] Primary payment action is explicit.
- [ ] Existing `HostedPaymentAction` mechanism is retained.
- [ ] Correct Reservation Review back navigation exists.
- [ ] Existing payment/status/error outcomes are preserved.
- [ ] No payment logic is duplicated in EJS/JavaScript.
- [ ] No client-side authoritative payment state exists.
- [ ] UI-001 design foundations are reused.
- [ ] Desktop layout is coherent.
- [ ] Mobile layout is coherent.
- [ ] No horizontal overflow.
- [ ] Keyboard navigation works.
- [ ] Focus is visible.
- [ ] Payment action is accessible.
- [ ] JavaScript is not required for the core payment handoff.
- [ ] Focused tests pass.
- [ ] Full regression passes.
- [ ] Type-check passes.
- [ ] Build passes.
- [ ] Lint passes with only established baseline warnings, if applicable.
- [ ] `git diff --check` passes.
- [ ] Browser verification passes after final changes.
- [ ] No production photography introduced.
- [ ] Copilot has not committed or pushed.

---

## 24. Architectural Stop Conditions

Stop and report to the Architect rather than expanding UI-009 if implementation requires:

- a new payment business rule;
- payment-domain changes;
- persistence changes;
- PayFast integration redesign;
- new payment security/signing logic;
- pricing changes;
- reservation lifecycle changes;
- a new authoritative payment contract;
- frontend framework/state-management architecture.

UI-009 is complete when the existing PayFast payment capability is presented as a clear, trustworthy, accessible and responsive customer-facing payment handoff.

---

## 25. Commit

Copilot MUST NOT commit, amend or push.

Following Architect Acceptance, the user performs the commit.

Proposed commit message:

`feat(ui): establish payment experience`