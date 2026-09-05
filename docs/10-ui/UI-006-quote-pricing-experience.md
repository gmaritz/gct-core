# UI-006 — Quote & Pricing Experience

**Document Type:** UI Implementation Specification  
**Capability:** Frontend — Quote & Pricing Experience  
**Status:** Proposed for Architect Approval  
**Specification ID:** UI-006  
**Depends On:** UI-001, UI-002, UI-003, UI-004, UI-005  
**Primary Journey:** Discover → Detail → Select → Accommodation → Quote

---

## 1. Purpose

UI-006 establishes the customer-facing Quote and Pricing experience following accommodation selection.

The page presents the authoritative commercial quote assembled by the application layer and provides a clear transition to Guest Information.

The experience must:

- clearly communicate what the customer has selected;
- present the authoritative quote and pricing breakdown;
- distinguish included and payable amounts where supplied;
- make the total price immediately understandable;
- provide a clear next action;
- preserve the existing Express/EJS SSR architecture;
- reuse established design-system and price components;
- work responsively and accessibly;
- contain no pricing or commercial business logic in EJS or browser JavaScript.

This specification concerns the **presentation and interaction experience only**.

---

## 2. Governing Documentation

Implementation must follow:

- `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`
- `docs/10-ui/DS-001-frontend-design-system.md`
- `docs/10-ui/COMP-002-button.md`
- `docs/10-ui/COMP-003-price-display.md`
- `docs/10-ui/COMP-005-section-heading.md`

Existing application services, Quote View Models/providers and route contracts are authoritative.

Do not duplicate or redefine commercial behaviour in this specification.

---

## 3. Development Workflow

Follow:

1. Specification
2. Architect review and approval
3. Copilot implementation
4. Focused tests and regression verification
5. Browser/manual verification
6. Copilot implementation report
7. Architect acceptance
8. User commit
9. Next iteration

Copilot must not commit or push changes.

No separate pre-commit audit is required.

---

## 4. Architecture Boundary

Retain:

- Express;
- EJS server-side rendering;
- existing controller/route architecture;
- existing Application Services;
- existing Quote View Model/provider;
- modular CSS;
- lightweight progressive JavaScript only where genuinely useful.

Do not introduce:

- SPA frameworks;
- client-side commercial state;
- pricing calculations in EJS;
- pricing calculations in JavaScript;
- direct supplier/API calls from the UI;
- duplicated quote logic;
- a new frontend state-management architecture.

The UI is a presentation consumer of the authoritative application-layer quote.

---

## 5. Scope

### In Scope

- Quote page presentation.
- Selected journey context.
- Selected accommodation context.
- Quote/pricing summary.
- Pricing breakdown where supplied.
- Subtotals and totals where supplied.
- Included/additional amounts where supplied.
- Currency presentation.
- Appropriate explanatory pricing text.
- Primary transition to Guest Information.
- Back/navigation to the preceding selection step.
- Responsive presentation.
- Accessibility and keyboard interaction.
- Existing feedback/error presentation.
- Progressive enhancement where genuinely useful.

### Out of Scope

- Pricing calculations.
- Currency conversion.
- Tax/fee calculation.
- Supplier pricing.
- Availability.
- Repricing.
- Booking creation.
- Guest information implementation.
- Reservation review.
- Payment.
- Confirmation.
- New commercial/application capabilities.
- AI-generated pricing or content.
- Production photography.

---

## 6. Experience Objective

The customer must be able to understand the commercial position of their current selections without ambiguity.

The page should answer:

1. **What am I booking?**
2. **What accommodation did I select?**
3. **What does it cost?**
4. **What is included or excluded where this information is supplied?**
5. **What is the total?**
6. **What happens next?**

The visual hierarchy must prioritise:

1. Quote identity/context.
2. Selected journey/accommodation.
3. Pricing breakdown.
4. Total payable amount.
5. Primary continuation action.

Avoid presenting the quote as an unnecessarily dense financial statement.

---

## 7. Page Structure

Use the global application shell established by UI-002.

The page should provide a clear structure broadly equivalent to:

- quote heading/context;
- selected journey summary;
- selected accommodation summary;
- pricing breakdown;
- total;
- relevant explanatory/feedback information;
- primary continue action;
- secondary navigation.

The exact DOM/component structure should follow existing project conventions.

Do not create a generic commercial-page framework solely for UI-006.

---

## 8. Selection Context

The quote should retain enough context for the customer to understand what is being priced.

Where supplied by the existing Quote View Model, present:

- journey name;
- relevant journey information;
- selected accommodation;
- relevant stay/selection information;
- other authoritative context required to interpret the quote.

Do not reproduce the entire Journey Detail or Accommodation Selection pages.

Keep contextual information concise.

---

## 9. Pricing Breakdown

Present the pricing breakdown supplied by the authoritative Quote View Model.

Depending on the existing contract, this may include:

- journey price;
- accommodation amounts;
- line items;
- fees;
- supplements;
- discounts;
- taxes;
- other commercial amounts;
- subtotal;
- total.

Only display values and labels supplied by the application contract.

The UI must not infer, combine or recalculate line items.

Where the application supplies an ordered breakdown, preserve its semantic ordering.

---

## 10. Price Display

Use:

`COMP-003 — Price Display`

for monetary values.

Requirements:

- use the authoritative currency supplied by the application;
- preserve appropriate currency formatting;
- distinguish primary total from supporting amounts;
- do not hard-code a currency;
- do not convert currencies;
- do not perform arithmetic in the template.

The total should receive clear visual prominence without making the supporting breakdown difficult to understand.

---

## 11. Total Price

The authoritative total must be visually unambiguous.

Requirements:

- clear total label;
- prominent amount;
- currency clearly associated with the amount;
- consistent alignment;
- sufficient visual separation from supporting line items.

Do not calculate the total from displayed components.

If the application supplies a total, render that total.

If the application does not supply a required commercial value, report the contract gap rather than reconstructing it in EJS.

---

## 12. Included / Excluded Information

Where the Quote View Model supplies inclusion/exclusion information, present it clearly.

Examples may include:

- included items;
- additional charges;
- payable supplements;
- applicable fees;
- other supplied commercial notes.

Do not invent explanatory commercial language that could alter the meaning of the quote.

Do not use visual styling alone to communicate whether an amount is included or additional.

---

## 13. Primary Action

Provide one clear primary action to proceed to Guest Information.

The action must:

- use `COMP-002 — Button`;
- use the existing application route;
- communicate the actual next step;
- remain keyboard accessible;
- have visible focus;
- work without JavaScript;
- prevent duplicate action where existing global conventions apply.

The action must not initiate booking creation or payment.

---

## 14. Secondary Navigation

Provide an appropriate route back to the Accommodation Selection step where supported by the existing flow.

The navigation must:

- use an existing route;
- not compete visually with the primary action;
- remain keyboard accessible;
- preserve the customer's ability to correct their selection.

Do not create placeholder or speculative routes.

---

## 15. Responsive Behaviour

The quote must remain easy to understand at all supported viewport sizes.

### Desktop

Use available width effectively while maintaining a strong pricing hierarchy.

Where a summary/action panel is used, it must not obscure or detach the total from its relevant context.

### Intermediate Widths

Avoid:

- cramped pricing tables;
- awkward amount wrapping;
- overlapping labels;
- excessive horizontal compression.

### Mobile

Use a natural single-column flow where appropriate.

Ensure:

- line items remain readable;
- amounts remain clearly associated with their labels;
- total remains prominent;
- primary action remains easy to locate;
- no horizontal scrolling occurs.

Do not use fixed-width pricing layouts that require horizontal scrolling.

---

## 16. Accessibility

Retain the accessibility foundations established by UI-001 and UI-002.

At minimum:

- semantic heading hierarchy;
- appropriate page-level `h1`;
- meaningful labels;
- logical reading order;
- meaningful action text;
- keyboard-accessible navigation;
- visible focus states;
- appropriate semantic treatment of pricing information;
- no keyboard traps;
- no information conveyed by colour alone.

Where a pricing breakdown is represented as tabular information, use appropriate semantic table markup where that improves comprehension.

Do not introduce unnecessary ARIA when native semantics are sufficient.

---

## 17. Progressive Enhancement

Core quote presentation and navigation must work without JavaScript.

JavaScript must not be required for:

- rendering quote information;
- calculating totals;
- navigating to Guest Information;
- submitting any required server action.

Only add JavaScript for a genuine progressive enhancement.

If no meaningful enhancement is required, add none.

---

## 18. Components and Design System

Reuse:

- `DS-001 — Frontend Design System`;
- `COMP-002 — Button`;
- `COMP-003 — Price Display`;
- `COMP-005 — Section Heading`.

Use existing shared cards/containers where appropriate.

Do not duplicate component CSS within the quote page stylesheet.

Do not create a new price component.

If a genuine reusable component gap is discovered, report it separately rather than silently expanding the component system.

---

## 19. CSS Organisation

Follow the existing modular CSS architecture.

Prefer:

- quote-specific layout rules in the quote page stylesheet;
- shared pricing presentation in `COMP-003`;
- shared buttons in `COMP-002`;
- established design tokens;
- existing container/layout primitives.

Do not introduce:

- inline styles;
- hard-coded brand colours;
- duplicate design tokens;
- unrelated CSS refactoring.

---

## 20. View Model and Route Boundary

The existing Quote View Model/provider and application route contract are authoritative.

The implementation should:

1. receive the existing Quote View Model;
2. render supplied quote information;
3. use established price presentation;
4. submit/navigate through the existing route;
5. preserve the server-side application flow.

If required presentation data is absent:

- do not calculate it in EJS;
- do not fetch it through client-side JavaScript;
- report the contract gap to the Architect.

Do not modify commercial/application contracts without explicit approval.

---

## 21. Quote State and Recalculation

The UI must present the quote state supplied by the application.

If the application indicates that a quote is:

- unavailable;
- invalid;
- expired;
- changed;
- otherwise unable to proceed,

render the appropriate application-provided state using established feedback conventions.

Do not implement quote validity, expiry or repricing rules in the frontend.

The application remains authoritative.

---

## 22. Error and Feedback Presentation

Use the existing feedback/error conventions established by the frontend foundation.

Customer-facing messages should be:

- clear;
- concise;
- appropriately placed;
- accessible to assistive technology;
- visually distinguishable without relying solely on colour.

Do not expose raw supplier/application exceptions.

Do not create a new error-handling architecture.

---

## 23. Asset Requirements

UI-006 is primarily a commercial presentation slice.

No new photography is required.

Existing journey/accommodation imagery may be used only where needed to preserve useful selection context.

Do not introduce production photography as part of UI-006.

Do not create new image derivatives or an image-processing pipeline.

The Architect will explicitly identify when the real photography collection should be integrated.

---

## 24. Testing

Copilot must run focused tests covering the affected Quote experience.

At minimum verify:

- Quote View Model/provider behaviour;
- Quote page rendering;
- selected journey/accommodation context;
- pricing breakdown rendering;
- authoritative total rendering;
- currency presentation;
- primary navigation/action;
- relevant quote/error states.

Then run the full regression suite.

Also run:

- type check;
- production build;
- lint;
- `git diff --check`.

No unrelated failures should be attributed to UI-006.

---

## 25. Browser Verification

Before reporting completion, perform manual/browser verification.

### Desktop

Verify:

- global shell;
- quote heading;
- journey/accommodation context;
- pricing breakdown;
- total;
- primary Guest Information action;
- secondary navigation;
- footer;
- overall visual hierarchy.

### Mobile

Verify:

- navigation;
- readable line items;
- correct amount alignment;
- prominent total;
- usable primary action;
- no horizontal scrolling;
- footer.

### Keyboard

Verify:

- skip link;
- navigation;
- secondary navigation;
- primary action;
- visible focus;
- logical focus order;
- no focus trap.

### Commercial Presentation

Verify:

- displayed values match the authoritative View Model;
- currency presentation is correct;
- total is not visually ambiguous;
- included/additional amounts are distinguishable where supplied;
- no pricing information is clipped or wrapped confusingly.

Do not validate commercial calculations through the browser as an alternative to application tests. The browser check is for presentation and interaction.

---

## 26. Acceptance Criteria

UI-006 is ready for Architect Acceptance when:

- [ ] Quote page is implemented within the existing Express/EJS architecture.
- [ ] Existing Quote View Model/provider contract is reused.
- [ ] Selected journey context is clear.
- [ ] Selected accommodation context is clear.
- [ ] Authoritative pricing breakdown is presented correctly.
- [ ] `COMP-003` is reused for monetary values.
- [ ] Authoritative total is clearly presented.
- [ ] Currency is correctly presented from supplied data.
- [ ] Included/additional amounts are presented correctly where supplied.
- [ ] No pricing calculations exist in EJS.
- [ ] No pricing calculations exist in browser JavaScript.
- [ ] Primary action to Guest Information is clear and functional.
- [ ] Secondary navigation is correct where applicable.
- [ ] Core navigation works without JavaScript.
- [ ] Responsive desktop/mobile presentation works correctly.
- [ ] No horizontal scrolling occurs.
- [ ] Keyboard navigation works correctly.
- [ ] Visible focus is present.
- [ ] Semantic pricing presentation is appropriate.
- [ ] Existing feedback/error conventions are retained.
- [ ] No new commercial/business logic has been introduced.
- [ ] No production photography has been introduced.
- [ ] Focused tests pass.
- [ ] Full regression passes.
- [ ] Type check passes.
- [ ] Production build passes.
- [ ] Lint passes without new errors.
- [ ] `git diff --check` passes.
- [ ] Browser verification is explicitly reported.
- [ ] Copilot has not committed or pushed changes.

---

## 27. Implementation Report

Copilot must provide an implementation report containing:

1. Implementation summary.
2. Files changed.
3. Architecture confirmation.
4. Quote View Model and route contracts used.
5. Design-system/component reuse.
6. Pricing presentation implemented.
7. Asset changes, if any.
8. Focused test results.
9. Full regression result.
10. Type-check result.
11. Build result.
12. Lint result.
13. Diff-check result.
14. Browser verification results.
15. Any defects discovered and corrected.
16. Any application-contract gaps discovered.
17. Confirmation that no pricing/business logic was introduced into the frontend.
18. Confirmation that no production photography was introduced.
19. Confirmation that no commit/push was performed.
20. Final status: Ready for Architect Acceptance.

Actual verification results must be reported.

---

## 28. Scope Discipline

UI-006 is a focused frontend slice.

Do not use implementation to:

- redesign the global shell;
- redesign Journey Detail;
- redesign Accommodation Selection;
- introduce new pricing logic;
- alter commercial calculations;
- implement Guest Information;
- implement Reservation Review;
- implement Payment;
- implement Booking;
- introduce a frontend framework;
- create an asset-management system;
- introduce production photography;
- refactor unrelated application or CSS code.

If a genuine application-contract or architectural issue blocks implementation, stop at that boundary and report it rather than creating an undocumented workaround.

---

## 29. Completion Boundary

UI-006 ends when the Quote and Pricing experience is:

- implemented;
- responsive;
- accessible;
- visually verified;
- tested;
- regression-verified;
- reported to the Architect.

After Architect Acceptance, the user will commit the implementation.

The next frontend slice is:

**UI-007 — Guest Information Experience**