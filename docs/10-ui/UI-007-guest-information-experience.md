# UI-007 — Guest Information Experience

**Document Type:** UI Implementation Specification  
**Capability:** Frontend — Guest Information Experience  
**Status:** Proposed for Architect Approval  
**Specification ID:** UI-007  
**Depends On:** UI-001, UI-002, UI-003, UI-004, UI-005, UI-006  
**Primary Journey:** Discover → Detail → Select → Accommodation → Quote → Guest Information

---

## 1. Purpose

UI-007 establishes the customer-facing Guest Information experience following quote review.

The page allows the customer to provide the traveller information required by the existing application flow before proceeding to Reservation Review.

The experience must:

- clearly explain the information required;
- present the existing guest-information fields;
- preserve entered values after validation failures where supported by the application contract;
- provide accessible form interaction and validation feedback;
- provide a clear transition to Reservation Review;
- preserve the existing Express/EJS SSR architecture;
- contain no guest/customer business logic in EJS or browser JavaScript.

This specification concerns the **presentation and interaction experience only**.

---

## 2. Governing Documentation

Implementation must follow:

- `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`
- `docs/10-ui/DS-001-frontend-design-system.md`
- `docs/10-ui/COMP-002-button.md`
- `docs/10-ui/COMP-005-section-heading.md`

Existing Guest Information View Models, application services, validation contracts, session/state handling and routes are authoritative.

Do not duplicate or redefine application-layer behaviour.

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
- existing Guest Information View Model/provider;
- existing server-side guest-information state;
- existing validation flow;
- modular CSS;
- lightweight progressive JavaScript only where genuinely useful.

Do not introduce:

- SPA frameworks;
- client-side guest/customer state management;
- client-side validation as a replacement for server validation;
- customer-resolution logic in EJS or JavaScript;
- direct persistence from the browser;
- a new form-state architecture.

The UI consumes and submits the existing application-layer contract.

---

## 5. Scope

### In Scope

- Guest Information page presentation.
- Quote/journey context.
- Guest-information form.
- Traveller/contact fields already supported by the application contract.
- Field labels and supporting guidance.
- Required/optional presentation.
- Server-provided validation errors.
- Error summary.
- Field-level validation messaging.
- Preserving submitted values where supplied by the application.
- Primary continuation action to Reservation Review.
- Back/recovery navigation.
- Responsive form layout.
- Keyboard accessibility.
- Progressive enhancement where genuinely useful.

### Out of Scope

- New guest/customer domain rules.
- Customer resolution.
- Customer creation.
- Reservation creation.
- Payment.
- Pricing.
- Booking.
- Supplier communication.
- New persistence.
- New validation rules.
- Client-side application state.
- AI-generated content.
- Production photography.

---

## 6. Experience Objective

The page must make providing traveller information straightforward and reassuring.

The customer should understand:

1. **Why the information is required.**
2. **Which information must be provided.**
3. **Which fields are optional.**
4. **Whether anything needs correcting.**
5. **How to proceed to review.**

The visual hierarchy should prioritise:

1. Guest-information heading/context.
2. Required form information.
3. Validation feedback.
4. Primary continuation action.

Avoid making the page feel like a dense administrative form.

---

## 7. Page Structure

Use the global application shell established by UI-002.

The page should provide a clear structure broadly equivalent to:

- journey/booking context;
- page heading;
- concise explanatory introduction;
- validation/error summary where required;
- guest-information form sections;
- primary continuation action;
- secondary navigation/recovery action.

The exact DOM structure should follow existing project conventions.

Do not create a generic form framework solely for UI-007.

---

## 8. Journey and Quote Context

Retain sufficient context so the customer knows what information they are completing.

Where supplied by the existing View Model, present concise context such as:

- journey name;
- selected accommodation;
- quote/selection context.

Do not reproduce the complete Quote page.

Provide appropriate navigation back to the previous step where supported by the existing route contract.

---

## 9. Form Fields

Render the guest-information fields supplied by the authoritative View Model/form contract.

The implementation may include fields such as:

- title;
- first name;
- last name;
- email;
- telephone;
- address;
- traveller/contact details;
- other established guest information.

**Do not assume that these fields must all exist.**

The existing application contract determines which fields are required and available.

Do not introduce new fields merely because they are conventional.

---

## 10. Field Presentation

Every form control must have:

- an associated visible label;
- a stable field name/id consistent with the existing contract;
- clear required/optional indication where appropriate;
- appropriate input type;
- appropriate autocomplete semantics where useful;
- accessible validation messaging.

Use existing form foundations established by UI-001.

Do not place business rules or validation calculations in the template.

---

## 11. Form Grouping

Where the existing guest-information contract contains logically distinct groups, present them as clear sections.

Potential groupings include:

- Traveller details;
- Contact details;
- Additional required information.

Use `COMP-005 — Section Heading` or the existing heading conventions.

Do not create unnecessary sections for a small number of fields.

The form should have a natural top-to-bottom reading order.

---

## 12. Required and Optional Fields

Required/optional status must come from the authoritative application/form contract.

The UI must:

- clearly communicate required fields;
- avoid ambiguous asterisks without explanation;
- identify optional fields where useful;
- preserve consistent treatment across the form.

Do not infer required status in EJS from field names or assumptions.

---

## 13. Validation and Error Summary

Use the established frontend feedback/error conventions.

When validation fails:

- present an accessible error summary near the top of the form;
- associate field-level errors with their corresponding controls;
- preserve submitted values where the application supplies them;
- move/focus the user appropriately without relying exclusively on JavaScript;
- make errors understandable and actionable.

Do not duplicate validation rules in the frontend.

The application layer remains authoritative.

---

## 14. Error Summary Accessibility

Where an error summary is rendered:

- it must be discoverable by keyboard users;
- errors must reference their associated fields where practical;
- field controls must expose their invalid state appropriately;
- focus management must not prevent normal keyboard navigation;
- error information must not rely solely on colour.

Reuse the existing global error-summary/focus behaviour established by UI-001 where applicable.

Do not introduce a second error-summary implementation if an existing foundation satisfies the requirement.

---

## 15. Input Behaviour

Use native HTML controls wherever practical.

Examples:

- text inputs for names;
- email input for email addresses;
- telephone input for telephone numbers;
- select controls for established finite choices;
- textarea only where the application contract requires free-form multi-line input.

Use appropriate `autocomplete` attributes for recognised personal/contact fields.

Do not introduce custom input controls unless native controls cannot satisfy the established contract.

---

## 16. Primary Action

Provide one clear primary action to proceed to Reservation Review.

The action must:

- use `COMP-002 — Button`;
- communicate the actual next step;
- submit through the existing application route;
- remain keyboard accessible;
- have visible focus;
- work without JavaScript;
- follow existing duplicate-submit protection conventions.

Do not create or persist a Reservation from the frontend.

The application service remains responsible for the transition.

---

## 17. Secondary Navigation

Provide an appropriate recovery/back action to the previous quote/selection step where the existing route contract supports it.

The action must:

- use an existing route;
- not compete visually with the primary action;
- remain keyboard accessible;
- preserve the customer's ability to review/correct prior choices.

Do not create speculative routes.

---

## 18. Responsive Behaviour

The form must remain comfortable and readable across supported viewport sizes.

### Desktop

- use the available content width effectively;
- avoid unnecessarily wide form controls;
- maintain clear grouping;
- keep primary action visually prominent.

### Intermediate Widths

Avoid:

- cramped multi-column forms;
- awkward field wrapping;
- inconsistent control widths;
- excessive whitespace.

### Mobile

- use a natural single-column form flow;
- controls should be comfortably usable;
- labels and errors remain associated with fields;
- primary action remains easy to locate;
- no horizontal scrolling.

Do not force a desktop multi-column form onto mobile.

---

## 19. Accessibility

Retain the accessibility foundations established by UI-001 and UI-002.

At minimum:

- semantic form structure;
- appropriate page-level `h1`;
- logical heading hierarchy;
- visible labels;
- correctly associated controls;
- keyboard accessibility;
- visible focus;
- accessible required/optional indication;
- accessible field errors;
- accessible error summary;
- logical tab order;
- no keyboard traps;
- appropriate autocomplete semantics.

Use native form semantics wherever possible.

Do not introduce unnecessary ARIA.

---

## 20. Progressive Enhancement

The Guest Information form must work without JavaScript.

JavaScript must not be required for:

- rendering the form;
- entering information;
- displaying server validation;
- submitting the form;
- navigating to Reservation Review.

Existing duplicate-submit protection may remain in place.

Any additional JavaScript must provide genuine progressive enhancement only.

Do not create a client-side form-state application.

---

## 21. Design System and Components

Reuse:

- `DS-001 — Frontend Design System`;
- `COMP-002 — Button`;
- `COMP-005 — Section Heading`;
- existing form foundations;
- existing feedback/error-summary foundations.

Do not duplicate global form or feedback CSS inside the page stylesheet.

Do not create a new generic form component system for UI-007.

If a genuine reusable component gap is discovered, report it separately.

---

## 22. CSS Organisation

Follow the existing modular CSS architecture.

Prefer:

- guest-information-specific layout rules in the page stylesheet;
- shared form styling from existing foundations;
- shared buttons from `COMP-002`;
- shared feedback/error styling;
- established design tokens.

Do not introduce:

- inline styles;
- hard-coded brand colours;
- duplicate design tokens;
- unrelated CSS refactoring.

---

## 23. View Model and Route Boundary

The existing Guest Information View Model/provider and route/application contracts are authoritative.

The implementation should:

1. receive the existing View Model/form state;
2. render supplied fields and values;
3. render supplied validation state;
4. submit through the existing route;
5. preserve the established server-side flow.

If required presentation data is absent:

- do not calculate it in EJS;
- do not obtain it through client-side requests;
- report the contract gap to the Architect.

Do not modify customer/reservation application contracts without explicit approval.

---

## 24. Form State Preservation

Where the existing server-side guest-information store or View Model provides previously submitted values, render those values back into the form after validation failure.

The frontend must not create an independent persistent form state.

Do not use browser local storage or similar mechanisms to replace the established server-side state.

---

## 25. Security / Privacy Presentation

Guest Information contains customer-provided personal information.

The UI must:

- avoid unnecessarily displaying sensitive values outside their relevant controls;
- use appropriate input types;
- not echo submitted values into unrelated page content;
- not place personal information into URLs unnecessarily;
- follow existing server-side handling.

Do not add client-side persistence of guest information.

---

## 26. Feedback States

Use existing feedback conventions for application-provided states.

Examples may include:

- validation failure;
- session/state unavailable;
- previous selection no longer valid;
- inability to proceed.

Do not expose raw application exceptions.

Do not create a new error-handling architecture.

The application layer determines the state; the UI presents it.

---

## 27. Asset Requirements

UI-007 is a form-focused experience.

No photography is required.

Do not introduce production photography or new image assets as part of this slice.

The Architect will explicitly identify when real photography should be supplied for the frontend roadmap.

---

## 28. Testing

Copilot must run focused tests covering the affected Guest Information experience.

At minimum verify:

- Guest Information View Model/provider behaviour;
- form rendering;
- field/value mapping;
- required/optional presentation;
- validation/error rendering;
- submitted-value preservation where supported;
- successful form submission;
- transition to Reservation Review;
- relevant failure states.

Then run the full regression suite.

Also run:

- type check;
- production build;
- lint;
- `git diff --check`.

No unrelated failures should be attributed to UI-007.

---

## 29. Browser Verification

Before reporting completion, perform manual/browser verification.

### Desktop

Verify:

- global shell;
- journey/quote context;
- page heading;
- form sections;
- labels;
- controls;
- required/optional presentation;
- primary action;
- secondary navigation;
- feedback/error presentation;
- footer.

### Mobile

Verify:

- navigation;
- single-column form flow;
- comfortable controls;
- readable labels and errors;
- primary action;
- no horizontal scrolling;
- footer.

### Keyboard

Verify:

- skip link;
- navigation;
- every form control;
- error summary;
- primary action;
- secondary navigation;
- visible focus;
- logical focus order;
- no focus trap.

### Validation

Verify:

- invalid submission produces the expected server-side validation state;
- error summary is accessible;
- field-level errors are associated correctly;
- submitted values are preserved where supported;
- corrected submission proceeds correctly.

### Privacy / Form Behaviour

Verify:

- personal information remains within appropriate form/page context;
- no unnecessary client-side persistence occurs;
- no unexpected values appear in URLs.

---

## 30. Acceptance Criteria

UI-007 is ready for Architect Acceptance when:

- [ ] Guest Information page is implemented within the existing Express/EJS architecture.
- [ ] Existing Guest Information View Model/provider and application contracts are reused.
- [ ] Journey/quote context is clear.
- [ ] Existing guest-information fields are rendered correctly.
- [ ] Labels and controls are correctly associated.
- [ ] Required/optional status follows the application contract.
- [ ] Existing form foundations are reused.
- [ ] Server-side validation remains authoritative.
- [ ] Error summary and field-level errors are accessible.
- [ ] Submitted values are preserved where supported.
- [ ] Primary action to Reservation Review is clear and functional.
- [ ] Secondary recovery navigation is correct where applicable.
- [ ] Core form submission works without JavaScript.
- [ ] No guest/customer business logic exists in EJS or browser JavaScript.
- [ ] No client-side persistent guest-information state has been introduced.
- [ ] Responsive desktop/mobile presentation works correctly.
- [ ] No horizontal scrolling occurs.
- [ ] Keyboard navigation works correctly.
- [ ] Visible focus is present.
- [ ] No unnecessary ARIA/custom controls have been introduced.
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

## 31. Implementation Report

Copilot must provide an implementation report containing:

1. Implementation summary.
2. Files changed.
3. Architecture confirmation.
4. Guest Information View Model and route contracts used.
5. Form fields and grouping implemented.
6. Design-system/component reuse.
7. Validation/error handling implemented.
8. Focused test results.
9. Full regression result.
10. Type-check result.
11. Build result.
12. Lint result.
13. Diff-check result.
14. Browser verification results.
15. Any defects discovered and corrected.
16. Any application-contract gaps discovered.
17. Confirmation that no client-side persistent guest-information state was introduced.
18. Confirmation that no production photography was introduced.
19. Confirmation that no commit/push was performed.
20. Final status: Ready for Architect Acceptance.

Actual verification results must be reported.

---

## 32. Scope Discipline

UI-007 is a focused frontend slice.

Do not use implementation to:

- redesign the global shell;
- redesign Quote;
- redesign Accommodation Selection;
- introduce new customer-resolution logic;
- introduce new validation rules;
- alter reservation persistence;
- implement Reservation Review;
- implement Payment;
- implement Confirmation;
- introduce a frontend framework;
- create client-side application state;
- create an asset-management system;
- introduce production photography;
- refactor unrelated application or CSS code.

If a genuine application-contract or architectural issue blocks implementation, stop at that boundary and report it rather than creating an undocumented workaround.

---

## 33. Completion Boundary

UI-007 ends when the Guest Information experience is:

- implemented;
- responsive;
- accessible;
- validation-verified;
- visually verified;
- tested;
- regression-verified;
- reported to the Architect.

After Architect Acceptance, the user will commit the implementation.

The next frontend slice is:

**UI-008 — Reservation Review Experience**