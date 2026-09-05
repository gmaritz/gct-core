# UI-008 — Reservation Review Experience

## 1. Document Control

| Property | Value |
|---|---|
| Capability | UI-008 — Reservation Review Experience |
| Status | Implementation Specification |
| Depends On | UI-001 through UI-007 |
| Governing Process | `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md` |
| Architecture | Express + EJS SSR |
| GET Route | `/ui/journeys/:journeyId/review` |
| POST Route | `/ui/journeys/:journeyId/review` |
| View Model | `ReservationReviewViewModel` / existing provider |

---

## 2. Objective

Implement the customer-facing Reservation Review page as the final review checkpoint before payment/reservation continuation.

The page must allow the customer to:

1. review the selected journey;
2. review the selected accommodation/configuration;
3. review booking-contact and traveller information;
4. review authoritative pricing;
5. explicitly confirm the displayed reservation;
6. return to Guest Information when required;
7. continue through the existing reservation/payment application flow.

This is a presentation-layer slice only. Existing application services, View Models, validation, reservation logic and pricing remain authoritative.

---

## 3. Architecture

Retain the existing GCT Core frontend architecture:

- Express + EJS server-side rendering;
- existing Reservation Review controller/routes;
- existing `ReservationReviewViewModelProvider`;
- existing application/service boundaries;
- existing UI-001 design foundation;
- progressive enhancement only.

Do not introduce:

- SPA/client-side application state;
- React/Vue/Angular;
- frontend state management;
- duplicated reservation/pricing logic;
- new persistence/domain logic;
- supplier/payment logic in the frontend.

The template must consume the existing View Model rather than reconstruct reservation state.

If a genuinely missing presentation field prevents implementation, make the smallest contract-preserving change and report it. Do not redesign the application contract.

---

## 4. Page Structure

Implement the page using the following information hierarchy.

### 4.1 Context / Breadcrumb

Provide appropriate contextual navigation identifying the review step.

Back navigation must return to:

`/ui/journeys/:journeyId/guest-information`

Use the actual journey ID/route supplied by the existing application context.

Do not use placeholder links.

### 4.2 Page Header

Provide:

- kicker: `Reservation review`;
- one meaningful `h1`, e.g. `Review your reservation`;
- concise supporting text explaining that the customer should verify the information before confirming.

Journey-specific content must come from the View Model.

### 4.3 Journey Summary

Display the authoritative journey information available from the View Model, such as:

- journey title;
- destination/context;
- duration;
- selected dates;
- relevant journey metadata.

Do not calculate or derive business values in EJS.

### 4.4 Accommodation Summary

Display the authoritative accommodation selection, where available:

- property name;
- property/location context;
- selected room;
- selected rate;
- occupancy;
- dates;
- nights;
- relevant accommodation metadata.

Do not reconstruct accommodation state from hidden fields or browser state.

Do not call supplier APIs from the template.

### 4.5 Guest / Traveller Summary

Display the authoritative information supplied by the existing review View Model.

Where available:

**Booking contact**
- name;
- email;
- phone.

**Travellers**
- first name;
- last name;
- email;
- nationality;
- date of birth;
- traveller/occupancy role.

Only render fields supported by the current presentation contract.

Do not duplicate Guest Information validation rules.

### 4.6 Pricing Summary

Display authoritative pricing supplied by the View Model.

Reuse `COMP-003 — Price Display` and established pricing/card patterns.

Render only pricing values supplied by the application layer, such as:

- component amounts;
- discounts/savings where supplied;
- total;
- currency.

The template must not:

- calculate totals;
- add/subtract amounts;
- calculate taxes;
- calculate discounts;
- derive payment amounts.

### 4.7 Status / Notes

Render existing review status, notes or warnings supplied by the View Model/application boundary.

Support existing states where applicable, including:

- normal review;
- recheck required;
- unavailable;
- validation/review failure;
- reservation confirmation failure.

Do not invent new business states.

---

## 5. Confirmation Form

Use the existing POST route:

`POST /ui/journeys/:journeyId/review`

The form must contain a clear primary confirmation action.

Preferred semantic action:

`Confirm reservation`

Use a native:

`<button type="submit">`

The button must:

- use the established primary button styling;
- have a clear accessible name;
- participate in existing duplicate-submit protection;
- work without JavaScript.

Do not submit authoritative reservation data through editable hidden fields.

If the existing application contract requires a confirmation field, preserve that contract and treat it only as a confirmation signal.

---

## 6. Summary / Action Area

Use the established desktop review composition:

- primary content column containing detailed review information;
- secondary summary/action area containing concise commercial summary and confirmation action.

The action area may contain:

- total price;
- concise reservation summary;
- confirmation action.

Essential review information must not exist only in the sidebar.

If the summary/action area is sticky on desktop:

- it must not obscure content;
- it must not cause overflow;
- it must remain keyboard accessible;
- sticky behaviour must be removed/simplified on mobile.

---

## 7. Responsive Behaviour

Use the UI-001 container/grid/spacing foundations.

### Desktop

Verify at approximately `1280 × 800`:

- coherent two-column layout;
- readable review sections;
- usable summary/action area;
- no clipping;
- no horizontal overflow.

### Mobile

Verify at approximately `375 × 812`:

- single-column layout;
- no horizontal overflow;
- long journey/property names wrap correctly;
- pricing remains readable;
- buttons fit viewport;
- review sections stack logically;
- sticky desktop behaviour does not obstruct content;
- confirmation action remains reachable.

Verify an intermediate width where practical.

---

## 8. Accessibility

Maintain the accessibility foundations established by UI-001/UI-002.

Required:

- one meaningful `h1`;
- logical heading hierarchy;
- semantic `<section>` groupings;
- meaningful section headings;
- native links/buttons;
- visible focus indicators;
- keyboard accessibility;
- logical tab order;
- no keyboard traps;
- accessible status/error messaging.

Use semantic presentation structures where appropriate, including definition lists for label/value information.

Do not use tables for layout.

### Error Summary

If the existing controller/View Model provides an error summary:

- render it using the established feedback/error pattern;
- retain existing focus behaviour;
- ensure ARIA references point to real elements;
- do not create a second error architecture.

### Confirmation Action

The confirmation button must remain meaningful when encountered without visual context.

---

## 9. Progressive Enhancement

The review flow must function with JavaScript disabled.

JavaScript may provide only progressive enhancement, such as:

- duplicate-submit prevention;
- pending button state;
- non-essential interaction.

Do not move validation, reservation state, pricing or confirmation logic into client-side JavaScript.

---

## 10. Design-System Reuse

Reuse established UI foundations:

- `DS-001`;
- shared containers;
- typography;
- cards;
- buttons (`COMP-002`);
- price display (`COMP-003`);
- feedback/status patterns;
- action-group patterns;
- spacing/focus tokens.

Do not introduce one-off primitives where an existing component/pattern is suitable.

No new component specification is required for UI-008 unless implementation reveals a genuinely reusable component gap. Report such a gap rather than silently expanding architecture.

---

## 11. Assets

**No production photography is required for UI-008.**

Continue using existing approved placeholder assets where imagery is required by the current View Model.

Do not:

- add production photography;
- create a new asset library;
- change the agreed 16:9 asset convention;
- perform unrelated asset work.

---

## 12. Files / Scope

First inspect the current repository and existing Reservation Review implementation.

Expected frontend scope:

- `views/pages/reservation-review.ejs`;
- `public/css/pages/reservation-review.css`.

Only modify View Model/provider code if a real presentation-contract gap is discovered.

Do not modify unrelated:

- reservation/domain services;
- pricing;
- payment;
- supplier integration;
- Prisma/database;
- persistence;
- customer resolution.

No unrelated refactoring.

---

## 13. Route Integrity

Use the existing registered routes.

| Purpose | Route |
|---|---|
| Review GET | `/ui/journeys/:journeyId/review` |
| Review POST | `/ui/journeys/:journeyId/review` |
| Back to Guest Information | `/ui/journeys/:journeyId/guest-information` |
| Payment continuation | Existing registered/application-provided route |

Do not introduce alternate review or confirmation routes.

---

## 14. Trust Boundary

The browser is not authoritative for:

- journey;
- accommodation;
- room;
- rate;
- occupancy;
- traveller information;
- pricing;
- reservation identity;
- payment amount.

The page presents server-authoritative state and sends an explicit confirmation request.

Do not encode authoritative booking state into editable hidden inputs.

---

## 15. Error / Failure Handling

Preserve existing controller/application outcome mapping.

### Review/validation failure

Render the existing server-provided error/status state using established feedback patterns.

### Reservation failure

Render only the safe customer-facing message supplied by the existing application boundary.

Do not expose:

- stack traces;
- supplier diagnostics;
- internal IDs;
- implementation details;
- sensitive information.

### Recheck/unavailable

Render the existing application-provided status and recovery action.

Do not implement a new client-side retry/revalidation mechanism.

---

## 16. Testing

Inspect existing Reservation Review tests before implementation.

Add/extend focused coverage only where UI-008 behaviour requires it.

At minimum verify:

1. review page renders successfully;
2. journey context renders;
3. accommodation selection renders;
4. traveller/contact information renders;
5. authoritative pricing renders;
6. confirmation form uses the correct POST route;
7. confirmation action exists;
8. Guest Information back navigation is correct;
9. existing status/error state renders;
10. existing application outcome mapping remains intact.

Where existing application tests already cover business behaviour, do not duplicate them in frontend tests.

Verify accessibility-oriented behaviour where supported by the existing integration-test framework:

- heading structure;
- accessible confirmation action;
- error-summary semantics;
- valid ARIA references.

---

## 17. Browser Verification

Actual browser verification is required after the final implementation changes.

### Desktop — 1280 × 800

Verify:

- page rendering;
- journey/accommodation/traveller/pricing content;
- visual hierarchy;
- summary/action area;
- confirmation action;
- keyboard focus;
- no horizontal overflow.

### Mobile — 375 × 812

Verify:

- single-column layout;
- readable content;
- pricing;
- buttons;
- confirmation action;
- no horizontal overflow;
- no obstructive sticky behaviour.

### Keyboard

Verify:

- skip link;
- navigation;
- back link;
- review content navigation where applicable;
- confirmation button;
- visible focus;
- logical tab order;
- no traps.

### Form

Verify:

- correct POST target;
- successful confirmation flow;
- server-rendered failure handling where testable;
- duplicate-submit protection;
- basic form operation without relying on JavaScript.

---

## 18. Verification Gate

Before requesting Architect Acceptance, run the final verification **after all code changes are complete**:

1. focused UI-008 tests;
2. relevant integration tests;
3. `npm test`;
4. `npm run type-check`;
5. `npm run build`;
6. `npm run lint`;
7. `git diff --check`.

The Implementation Report must provide the final result of each command.

If any command fails, resolve the issue or report the blocker. Do not claim PASS based on an earlier execution if subsequent code changes were made.

---

## 19. Regression

UI-008 must not regress UI-001 through UI-007 or existing application behaviour.

If an existing test fails:

- identify the failure;
- determine whether UI-008 caused it;
- do not suppress or ignore it;
- report pre-existing failures separately.

---

## 20. Implementation Report

Return an implementation report containing:

### Changes
- files changed;
- meaningful changes;
- route/template changes;
- View Model/provider changes, if any;
- design-system components/patterns reused.

### Architecture
Confirm:

- Express/EJS SSR retained;
- no SPA;
- no client-side booking state;
- no duplicated business logic;
- existing View Model/application boundaries retained.

### Verification
Report actual final results for:

- focused tests;
- full `npm test`;
- type-check;
- build;
- lint;
- `git diff --check`.

### Browser
Report:

- desktop result;
- mobile result;
- keyboard result;
- form result;
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

## 21. Commit Boundary

Copilot MUST NOT commit, amend or push.

After Architect Acceptance, the user performs the commit.

Proposed commit message:

`feat(ui): establish reservation review experience`

---

## 22. Acceptance Criteria

UI-008 is ready for Architect Acceptance when:

- [ ] Review page renders through the existing GET route.
- [ ] Journey context is clear.
- [ ] Accommodation selection is clear.
- [ ] Guest/traveller information is clear.
- [ ] Authoritative pricing is clear.
- [ ] Confirmation action is explicit and functional.
- [ ] Correct POST route is used.
- [ ] Guest Information back navigation is correct.
- [ ] Existing application status/error outcomes are preserved.
- [ ] UI-001 design foundations are reused.
- [ ] Desktop layout is coherent.
- [ ] Mobile layout is coherent.
- [ ] No horizontal overflow.
- [ ] Keyboard navigation works.
- [ ] Focus is visible.
- [ ] Error/status semantics are accessible.
- [ ] No business logic is added to EJS.
- [ ] No client-side authoritative state is introduced.
- [ ] No unrelated backend/domain changes are made.
- [ ] Focused tests pass.
- [ ] Full regression passes.
- [ ] Type-check passes.
- [ ] Build passes.
- [ ] Lint passes with only established baseline warnings, if applicable.
- [ ] `git diff --check` passes.
- [ ] Browser verification passes after final changes.
- [ ] Copilot has not committed or pushed.

---

## 23. Architectural Stop Conditions

Stop and report to the Architect rather than expanding UI-008 if implementation requires:

- a new business rule;
- reservation-domain changes;
- persistence changes;
- pricing changes;
- supplier integration changes;
- payment changes;
- a new authoritative application contract;
- a frontend framework/state-management architecture.

UI-008 is limited to delivering the Reservation Review presentation experience over the existing authoritative application capability.