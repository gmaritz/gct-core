# UI-005 — Accommodation Selection

**Document Type:** UI Implementation Specification  
**Capability:** Frontend — Accommodation Selection  
**Status:** Proposed for Architect Approval  
**Specification ID:** UI-005  
**Depends On:** UI-001, UI-002, UI-003, UI-004  
**Primary Journey:** Discover → Detail → Select → Accommodation

---

## 1. Purpose

UI-005 establishes the production Accommodation Selection experience within the GCT Core journey flow.

The page is the next step after journey selection and allows the customer to review the available accommodation options associated with the selected journey and choose an option where required.

The experience must:

- make accommodation choices easy to understand and compare;
- present accommodation imagery and key information clearly;
- communicate pricing using authoritative supplied values;
- provide an obvious accommodation-selection action;
- preserve the established GCT Core SSR architecture;
- reuse the existing design system and accommodation components;
- work responsively across desktop and mobile;
- remain accessible and keyboard usable;
- contain no business logic in EJS templates.

This specification concerns the **presentation and interaction experience only**.

---

## 2. Governing Documentation

Implementation must follow:

- `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`
- `docs/10-ui/DS-001-frontend-design-system.md`
- `docs/10-ui/COMP-002-button.md`
- `docs/10-ui/COMP-003-price-display.md`
- `docs/10-ui/COMP-004-accommodation-gallery.md`
- `docs/10-ui/COMP-005-section-heading.md`

Existing application architecture, Accommodation View Models/providers, services and route contracts are authoritative.

Do not duplicate or redefine application-layer behaviour in this specification.

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
- existing Accommodation View Models/providers;
- modular CSS;
- lightweight progressive JavaScript only where genuinely useful.

Do not introduce:

- React, Vue, Angular or another SPA framework;
- client-side application state management;
- direct API calls from EJS;
- accommodation business rules in templates;
- browser-side pricing calculations;
- a new image-processing pipeline.

The UI consumes the existing application-layer contract.

---

## 5. Scope

### In Scope

- Accommodation Selection page presentation.
- Selected journey context.
- Accommodation option presentation.
- Accommodation imagery/gallery presentation.
- Accommodation name and descriptive information.
- Key accommodation attributes supplied by the View Model.
- Accommodation pricing where supplied.
- Accommodation selection interaction.
- Selected-state presentation where supported by the existing contract.
- Responsive layout.
- Accessibility and keyboard interaction.
- Progressive enhancement where genuinely useful.
- Appropriate accommodation presentation assets.

### Out of Scope

- New accommodation search logic.
- Accommodation availability calculations.
- Supplier API integration.
- New pricing calculations.
- Booking creation.
- Guest information.
- Reservation review.
- Payment.
- Confirmation.
- New backend capability unless a genuine existing contract gap blocks the UI.
- CMS functionality.
- Image upload management.
- Runtime image transformation.
- AI-generated accommodation content.

---

## 6. Experience Objective

The page must make the accommodation decision straightforward.

The customer should be able to answer:

1. **What accommodation options are available?**
2. **What is different about each option?**
3. **What does each option cost?**
4. **Which option have I selected?**
5. **How do I proceed?**

The visual hierarchy should therefore prioritise:

1. Selected journey context.
2. Accommodation options.
3. Accommodation imagery.
4. Important accommodation characteristics.
5. Price.
6. Selection/proceed action.

Avoid presenting accommodation as an undifferentiated list of dense data.

---

## 7. Page Structure

Use the existing global application shell established by UI-002.

The page should provide a clear structure broadly equivalent to:

- journey/context heading;
- accommodation introduction;
- accommodation option collection;
- accommodation imagery;
- accommodation details;
- pricing;
- selection controls;
- primary continue action.

The exact DOM structure should follow existing project conventions.

Do not create a generic accommodation-page framework solely for UI-005.

---

## 8. Journey Context

The customer should retain clear context of the journey they selected.

Where supplied by the existing View Model, display:

- journey name;
- relevant journey context;
- concise supporting information.

The journey context must not overwhelm the accommodation choices.

Do not duplicate the complete Journey Detail page.

Provide appropriate navigation back to the preceding journey step where the existing route contract supports it.

---

## 9. Accommodation Option Presentation

Each accommodation option must be presented as a distinct, easily scannable choice.

An option should expose the information supplied by the existing View Model, which may include:

- accommodation name;
- category/type;
- location or relevant descriptor;
- descriptive text;
- key facilities/features;
- occupancy or room information;
- pricing;
- availability/selection status where provided.

Only display information supported by the application contract.

Do not invent accommodation attributes in EJS.

Avoid unnecessary information density.

---

## 10. Accommodation Gallery

Use:

`COMP-004 — Accommodation Gallery`

where the existing component contract is appropriate.

The gallery should:

- give the accommodation a strong visual identity;
- maintain consistent image presentation;
- support multiple images where supplied;
- provide meaningful alternative text for informative imagery;
- treat decorative imagery appropriately;
- remain usable on mobile.

If progressive image interaction is implemented, the core accommodation information must remain usable without JavaScript.

Do not build a second gallery implementation if `COMP-004` satisfies the requirement.

---

## 11. Accommodation Photography

For fixed-ratio accommodation presentation imagery, follow the established frontend asset principles:

- use web-ready assets;
- use deliberate cropping;
- preserve source photography separately;
- avoid destructive modification of originals;
- use appropriate focal positioning where required;
- do not introduce runtime image processing.

The accommodation gallery must not assume every photograph has the same aspect ratio if `COMP-004` supports flexible gallery imagery.

### Production Photography Timing

UI-005 should establish the correct presentation using the existing placeholder assets or suitable temporary imagery.

**Do not wait for or introduce the complete real accommodation photography collection during initial implementation.**

The Architect will explicitly identify when the real photographs should be supplied.

Do not create an asset-management system as part of UI-005.

---

## 12. Accommodation Comparison

Where multiple accommodation options are presented, the layout should allow the customer to compare them naturally.

Prioritise:

- image;
- name;
- concise description;
- key differentiating information;
- price;
- selection control.

Do not introduce a complex comparison matrix unless the existing application contract and UX clearly require it.

Cards/options should remain visually distinct without excessive decoration.

---

## 13. Selection Interaction

The customer must have an unambiguous way to select an accommodation option.

The interaction must:

- use the established form/control conventions;
- expose the selected state clearly;
- be keyboard accessible;
- provide a visible focus state;
- avoid ambiguous click targets;
- use the existing application route/action contract.

Where the existing route expects one accommodation selection, the UI should behave as a single-choice selection.

Do not implement selection state as an independent client-side application state.

The server/application layer remains authoritative.

---

## 14. Primary Continue Action

Provide one clear primary action for proceeding from accommodation selection.

The action should:

- use `COMP-002 — Button`;
- communicate the actual next step;
- use the existing route contract;
- remain usable on mobile;
- remain keyboard accessible;
- have visible focus;
- prevent accidental duplicate submission using existing global conventions where applicable.

Do not calculate or validate business rules in EJS or JavaScript.

If the application determines that selection is invalid or unavailable, use the existing application error/validation flow.

---

## 15. Pricing

Where accommodation pricing is supplied by the authoritative View Model, use:

`COMP-003 — Price Display`

Requirements:

- no pricing calculation in EJS;
- no currency conversion in EJS;
- no accommodation-price arithmetic in JavaScript;
- no duplicated pricing logic;
- display only authoritative values.

If the existing accommodation contract provides multiple price representations, follow the established View Model semantics.

Do not alter pricing contracts as part of UI-005 unless explicitly approved.

---

## 16. Selected State

The selected accommodation must have a clear visual and semantic state where the existing application flow supports it.

The selected state should be distinguishable through more than colour alone.

Use appropriate:

- border/state treatment;
- selected control state;
- textual indication where useful;
- focus indication.

Do not rely solely on a colour change to communicate selection.

If selection is server-controlled, render the authoritative selected state supplied by the application.

---

## 17. Responsive Behaviour

The page must adapt naturally to available space.

### Desktop

Accommodation options should use the available width effectively and allow meaningful comparison.

### Intermediate Widths

Avoid:

- cramped cards;
- unusable controls;
- broken galleries;
- text overflow;
- excessive horizontal compression.

### Mobile

Accommodation options should form a natural single-column reading flow where appropriate.

Ensure:

- gallery remains usable;
- accommodation information remains readable;
- selection controls remain accessible;
- primary action remains easy to locate;
- no horizontal scrolling occurs.

Do not hard-code arbitrary breakpoint-specific card counts when a flexible layout provides the correct result.

---

## 18. Accessibility

The implementation must retain the accessibility foundations established by UI-001 and UI-002.

At minimum:

- semantic page structure;
- appropriate heading hierarchy;
- meaningful accommodation names;
- meaningful link/action text;
- keyboard-accessible selection controls;
- visible focus states;
- clear selected state;
- no keyboard traps;
- appropriate image alternative text;
- decorative imagery handled correctly;
- readable text and sufficient contrast using established design tokens.

If accommodation selection uses radio controls or equivalent single-choice semantics, use the appropriate native semantic control where practical.

Do not recreate native selection behaviour unnecessarily with custom JavaScript.

---

## 19. Progressive Enhancement

Core accommodation selection and navigation must work without JavaScript.

JavaScript may enhance gallery interaction or another clearly beneficial presentation behaviour.

Do not make:

- accommodation selection;
- form submission;
- navigation;
- core content rendering

dependent on JavaScript.

If no meaningful enhancement is required, do not add JavaScript.

---

## 20. Components and Design System

Reuse:

- `DS-001 — Frontend Design System`;
- `COMP-002 — Button`;
- `COMP-003 — Price Display`;
- `COMP-004 — Accommodation Gallery`;
- `COMP-005 — Section Heading`.

Do not duplicate component CSS inside the page stylesheet.

If a genuine reusable accommodation component gap is discovered, report it rather than silently expanding the component system.

Do not create abstractions solely for theoretical future reuse.

---

## 21. CSS Organisation

Follow the existing modular CSS architecture.

Prefer:

- page-specific layout rules in the accommodation page stylesheet;
- shared gallery behaviour in `COMP-004`;
- shared buttons in `COMP-002`;
- shared prices in `COMP-003`;
- established design tokens;
- existing container/layout primitives.

Do not introduce:

- inline styling;
- a second token system;
- hard-coded brand colours;
- duplicated global component styles.

---

## 22. View Model and Route Boundary

The existing Accommodation View Model/provider and route/application contracts are authoritative.

The implementation should:

1. receive the established View Model;
2. render supplied accommodation data;
3. map presentation concerns to established components;
4. submit selection through the existing route/action;
5. preserve the server-side application flow.

If required presentation data is genuinely absent:

- do not calculate it in EJS;
- do not obtain it through a new client-side request;
- report the contract gap to the Architect.

Do not modify application-layer contracts without explicit approval.

---

## 23. Error and Empty States

Use existing application validation/error conventions.

The page should correctly present application-provided:

- validation failures;
- unavailable accommodation;
- selection failures;
- other established accommodation-flow errors.

Do not create a new error-handling architecture.

Do not expose raw supplier errors to the customer.

The template should render the presentation state supplied by the application layer.

---

## 24. Asset Integration

Use the established public asset structure.

Accommodation assets should:

- use stable descriptive filenames;
- be web-ready;
- remain separate from preserved source originals;
- avoid unnecessary derivative generation;
- not require runtime image processing.

Do not add real production photography merely to complete the implementation.

Use existing placeholders until the Architect explicitly requests production photography.

---

## 25. Testing

Copilot must run focused tests covering the affected Accommodation Selection experience.

At minimum verify:

- Accommodation View Model/provider behaviour;
- Accommodation Selection page rendering;
- accommodation option presentation;
- selection control/action;
- correct route submission;
- relevant validation/error rendering;
- existing accommodation gallery behaviour where applicable.

Then run the full regression suite.

Also run:

- type check;
- production build;
- lint;
- `git diff --check`.

No unrelated failures should be attributed to UI-005.

---

## 26. Browser Verification

Before reporting completion, perform manual/browser verification.

### Desktop

Verify:

- global shell;
- journey context;
- accommodation heading;
- accommodation options;
- gallery presentation;
- key accommodation information;
- prices;
- selection controls;
- primary continue action;
- footer;
- overall visual hierarchy.

### Mobile

Verify:

- navigation;
- gallery;
- single-column accommodation presentation;
- readable content;
- selection controls;
- primary action;
- footer;
- no horizontal scrolling.

### Keyboard

Verify:

- skip link;
- navigation;
- accommodation selection controls;
- gallery controls if present;
- primary action;
- visible focus;
- logical focus order;
- no focus trap.

### Selection

Verify:

- accommodation can be selected;
- selected state is visually and semantically clear;
- correct server route is submitted;
- successful selection follows the existing application flow;
- validation/failure states behave correctly where applicable.

### Photography

Verify:

- correct temporary/placeholder image mapping;
- gallery presentation;
- crop behaviour;
- no unintended distortion;
- appropriate alternative text.

Do not treat placeholder imagery as production photography.

---

## 27. Acceptance Criteria

UI-005 is ready for Architect Acceptance when:

- [ ] Accommodation Selection is implemented within the existing Express/EJS architecture.
- [ ] Existing Accommodation View Model/provider contracts are reused.
- [ ] Selected journey context is clear.
- [ ] Accommodation options are easy to scan and compare.
- [ ] Accommodation imagery is presented appropriately.
- [ ] `COMP-004` is reused where applicable.
- [ ] Accommodation information is rendered from authoritative supplied data.
- [ ] Pricing uses `COMP-003` where applicable.
- [ ] Selection controls are clear and accessible.
- [ ] Selected state is clearly communicated.
- [ ] Primary continue action is clear and functional.
- [ ] No business logic exists in EJS.
- [ ] No SPA/client-side application architecture has been introduced.
- [ ] Core selection works without JavaScript.
- [ ] Responsive desktop/mobile presentation works correctly.
- [ ] No horizontal scrolling occurs.
- [ ] Keyboard navigation works correctly.
- [ ] Visible focus is present.
- [ ] Image alternative text is appropriate.
- [ ] No runtime image-processing system has been introduced.
- [ ] Real production photography has not been introduced prematurely.
- [ ] Focused tests pass.
- [ ] Full regression passes.
- [ ] Type check passes.
- [ ] Production build passes.
- [ ] Lint passes without new errors.
- [ ] `git diff --check` passes.
- [ ] Browser verification is explicitly reported.
- [ ] Copilot has not committed or pushed changes.

---

## 28. Implementation Report

Copilot must provide an implementation report containing:

1. Implementation summary.
2. Files changed.
3. Architecture confirmation.
4. View Model and route contracts used.
5. Component/design-system reuse.
6. Asset changes.
7. Focused test results.
8. Full regression result.
9. Type-check result.
10. Build result.
11. Lint result.
12. Diff-check result.
13. Browser verification results.
14. Any defects discovered and corrected.
15. Any application-contract gaps discovered.
16. Confirmation that no production photography was introduced unless explicitly approved.
17. Confirmation that no commit/push was performed.
18. Final status: Ready for Architect Acceptance.

Actual verification results must be reported; do not provide a completion statement without evidence.

---

## 29. Scope Discipline

UI-005 is a focused frontend slice.

Do not use implementation to:

- redesign the global shell;
- redesign the homepage;
- redesign Journey Detail;
- replace established components;
- introduce a frontend framework;
- create new booking logic;
- create new pricing logic;
- implement guest information;
- implement review;
- implement payment;
- create an asset-management system;
- introduce production photography prematurely;
- refactor unrelated CSS or application code.

If a genuine architectural or application-contract issue blocks implementation, stop at the boundary and report it rather than creating an undocumented workaround.

---

## 30. Completion Boundary

UI-005 ends when the Accommodation Selection experience is:

- implemented;
- responsive;
- accessible;
- visually verified;
- tested;
- regression-verified;
- reported to the Architect.

After Architect Acceptance, the user will commit the implementation.

The next frontend slice is:

**UI-006 — Quote & Pricing Experience**