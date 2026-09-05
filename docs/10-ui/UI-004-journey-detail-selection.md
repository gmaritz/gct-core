# UI-004 — Journey Detail & Selection

**Document Type:** UI Implementation Specification  
**Capability:** Frontend — Journey Detail & Selection  
**Status:** Proposed for Architect Approval  
**Specification ID:** UI-004  
**Depends On:** UI-001, UI-002, UI-003  
**Primary Journey:** Discover → Detail → Select

---

## 1. Purpose

UI-004 establishes the production Journey Detail and Journey Selection experience for GCT Core.

The page is the transition from homepage journey discovery into the selected journey flow.

The experience must:

- communicate the selected journey clearly;
- present useful journey information in a structured, readable manner;
- provide a clear primary selection action;
- preserve the existing GCT Core SSR architecture;
- reuse established design-system and component foundations;
- work responsively across desktop and mobile;
- provide accessible navigation and interaction;
- contain no business logic in EJS templates.

This specification concerns the **presentation and interaction experience only**.

Existing application contracts remain authoritative for journey data, availability, selection and navigation.

---

## 2. Governing Documentation

Implementation must follow:

- `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`
- `docs/10-ui/DS-001-frontend-design-system.md`
- `docs/10-ui/COMP-001-journey-card.md`
- `docs/10-ui/COMP-002-button.md`
- `docs/10-ui/COMP-003-price-display.md`
- `docs/10-ui/COMP-004-accommodation-gallery.md`
- `docs/10-ui/COMP-005-section-heading.md`

Existing application architecture, View Models, providers and route contracts are authoritative.

Where this specification conflicts with an established architectural contract, the existing application architecture must not be changed implicitly. Raise the conflict for Architect review.

---

## 3. Development Workflow

Follow the established sequence:

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
- existing route/controller architecture;
- existing Application Services;
- existing Journey View Models/providers;
- modular CSS;
- lightweight progressive JavaScript only where required.

Do not introduce:

- React, Vue, Angular or another SPA framework;
- client-side application state for journey selection;
- a new frontend architecture;
- business calculations in templates;
- API calls directly from EJS;
- a runtime image-processing pipeline.

The UI consumes the application-layer contract; it does not redefine it.

---

## 5. Scope

### In Scope

- Journey Detail page presentation.
- Journey title and identity.
- Journey imagery.
- Journey overview/narrative.
- Key journey information supplied by the View Model.
- Journey highlights where supplied by the existing contract.
- Pricing information where already supplied.
- Primary journey-selection action.
- Secondary navigation back toward discovery.
- Responsive page composition.
- Accessible structure and keyboard interaction.
- Progressive enhancement where genuinely useful.
- Integration of approved presentation assets.

### Out of Scope

- New journey business rules.
- Journey availability calculations.
- Pricing calculations.
- Booking creation.
- Accommodation selection implementation.
- Guest information.
- Payment.
- New backend capabilities.
- Changes to journey domain/application contracts unless a genuine existing gap is discovered and separately approved.
- CMS functionality.
- Image upload management.
- Runtime image transformations.
- AI-generated content.

---

## 6. Experience Objective

The Journey Detail page must answer three questions quickly:

1. **What is this journey?**
2. **What can I expect from it?**
3. **How do I proceed?**

The visual hierarchy should therefore prioritise:

1. Journey identity.
2. Strong journey imagery.
3. Journey narrative/value proposition.
4. Important journey information.
5. Primary selection action.

The page should feel like a natural continuation of the homepage rather than a separate application.

---

## 7. Page Structure

Use the existing global application shell established by UI-002.

The Journey Detail page should provide a clear structure broadly equivalent to:

- Journey visual/hero area.
- Journey identity.
- Journey introductory narrative.
- Key journey information.
- Journey detail content.
- Primary selection/action area.
- Supporting navigation.

The exact DOM/component structure should follow existing project conventions and should not be unnecessarily abstracted.

Do not create a new generic page framework solely for UI-004.

---

## 8. Journey Identity

The page must present the journey name as the primary page heading.

Requirements:

- exactly one appropriate page-level `h1`;
- journey name supplied by the View Model;
- supporting category/type information only where supplied;
- no duplicated journey title unnecessarily repeated in adjacent elements;
- hierarchy must remain clear on mobile.

The page title should continue to use the dynamic document-title convention established by UI-002.

---

## 9. Journey Imagery

Journey imagery is a major part of the experience and must be treated as presentation content rather than decorative filler.

Follow the established photography convention:

- preferred presentation ratio: **16:9** where the image is used as a hero/card-style presentation image;
- preferred prepared web master: **1600 × 900 px**;
- preferred format: **WebP**;
- originals remain preserved separately;
- do not destructively resize originals;
- use deliberate cropping where required;
- centre crop is the default where composition permits;
- support presentation-layer focal positioning where an image requires it.

Use `object-fit: cover` where the design calls for a fixed-ratio presentation.

Do not force portrait or compositionally unsuitable photography into an inappropriate crop.

### Real Photography

UI-004 should initially establish the correct presentation and asset contract.

Do not delay implementation while waiting for the complete photography collection.

When the implementation reaches the point where production imagery is required, the Architect will explicitly identify that as the point to provide the selected real photographs.

Do not invent a new asset-management architecture.

---

## 10. Hero / Primary Visual Area

The primary visual area should establish the journey immediately.

On larger screens:

- provide strong visual prominence to the journey image;
- maintain a balanced relationship between image and journey identity/content;
- avoid excessive empty space;
- maintain alignment with the established page container.

On smaller screens:

- image and content must stack naturally;
- preserve the intended image ratio;
- avoid excessive hero height;
- ensure the journey title and primary action remain readily accessible.

The implementation should adapt to available space rather than depend on a rigid desktop layout.

---

## 11. Journey Narrative

Journey narrative content must come from the existing View Model/application contract.

The template must not:

- generate narrative;
- calculate or transform business content;
- contain hard-coded journey-specific business rules.

Present supplied content using the established typography hierarchy.

Long narrative content must remain readable:

- sensible line length;
- appropriate spacing;
- clear section separation;
- no unnecessarily dense blocks of text.

---

## 12. Key Journey Information

Where the existing Journey View Model provides structured information, present it clearly.

Examples may include:

- duration;
- journey type;
- location/region;
- departure information;
- group/private characteristics;
- other established journey attributes.

Only display information supported by the existing application contract.

Do not introduce new fields merely because they might be useful.

Avoid turning the page into a dense specification sheet.

The user should be able to scan important information quickly.

---

## 13. Journey Highlights

If the existing journey contract supplies highlights or equivalent structured content, present them as a visually scannable section.

Follow existing design-system spacing, typography and component conventions.

Do not create a new reusable component unless the implementation demonstrates that an existing component cannot appropriately represent the content.

If no structured highlights are currently supplied, do not manufacture them in the UI.

---

## 14. Pricing

If journey pricing is already supplied by the authoritative View Model, present it using `COMP-003 — Price Display`.

Requirements:

- no price calculation in EJS;
- no currency conversion in EJS;
- no duplication of pricing logic;
- display only authoritative supplied values.

If UI-004's current journey contract does not expose pricing, do not introduce a backend pricing change as part of this UI slice.

---

## 15. Primary Selection Action

The page must provide one visually dominant primary action for proceeding with the selected journey.

The action must:

- use the established button component/foundation;
- clearly communicate the next step;
- link or submit through the existing application route contract;
- remain keyboard accessible;
- have a visible focus state;
- remain usable on mobile.

The action label should describe the actual next step rather than use ambiguous wording.

Do not implement selection business logic in JavaScript.

Do not duplicate selection state in the browser.

---

## 16. Secondary Navigation

Provide an appropriate route back toward journey discovery where useful.

The secondary navigation must:

- use an existing route;
- use established link/button styling;
- not compete visually with the primary selection action;
- remain accessible by keyboard.

Do not introduce placeholder links.

Do not invent new routes when an existing route satisfies the requirement.

---

## 17. Responsive Behaviour

The layout must adapt continuously to available space.

Requirements:

- desktop presentation must use the available content width effectively;
- intermediate widths must not produce broken grids or clipped content;
- mobile must use a natural single-column reading flow where appropriate;
- no horizontal scrolling;
- images must remain contained within their layout;
- primary actions must remain accessible without awkward wrapping;
- typography must remain readable;
- spacing must follow DS-001 responsive principles.

Do not hard-code arbitrary column counts when a flexible layout provides the correct result.

---

## 18. Accessibility

The page must conform to the accessibility foundations established by UI-001 and UI-002.

At minimum:

- semantic page structure;
- one appropriate `h1`;
- meaningful heading hierarchy;
- meaningful link/action text;
- keyboard-accessible interactive elements;
- visible focus states;
- no keyboard traps;
- appropriate image alternative text;
- decorative imagery handled appropriately;
- sufficient readable contrast through existing design tokens;
- responsive text remains usable.

If the primary journey image communicates meaningful journey information, its alternative text must be meaningful.

Do not use filename-based alt text.

---

## 19. Progressive Enhancement

Core Journey Detail navigation and selection must work without JavaScript.

JavaScript may only enhance the experience where it provides a genuine UX benefit.

Do not make page rendering, navigation or journey selection dependent on client-side JavaScript.

If no meaningful enhancement is required, do not add JavaScript.

---

## 20. Components and Design System

Reuse established foundations from:

- `DS-001`;
- `COMP-001` where journey-card presentation is appropriate;
- `COMP-002` for actions;
- `COMP-003` for prices;
- `COMP-005` for section headings.

`COMP-004 — Accommodation Gallery` must only be used if the existing Journey Detail experience genuinely requires the established gallery pattern.

Do not duplicate component CSS inside the page stylesheet.

If UI-004 exposes a genuine reusable component need, identify it separately rather than silently expanding the component system.

---

## 21. CSS Organisation

Follow the existing modular CSS architecture.

Prefer:

- page-specific layout rules in the Journey Detail page stylesheet;
- shared visual behaviour in existing component styles;
- existing design tokens;
- existing container/layout primitives.

Do not introduce inline styling.

Do not introduce a second design-token system.

Do not hard-code colours, typography or spacing when an established token exists.

---

## 22. View Model and Route Boundary

The existing Journey Detail View Model/provider and route contract are authoritative.

The implementation should:

1. receive the established View Model;
2. render its supplied data;
3. map presentation concerns to existing components;
4. generate navigation using established routes.

If the implementation reveals that a required presentation value is genuinely absent from the existing contract:

- do not calculate it in EJS;
- do not obtain it through a new client-side request;
- report the contract gap to the Architect.

Only make application-layer changes if explicitly approved as part of the implementation.

---

## 23. Error / Missing-Data Behaviour

Use existing application error and empty-state conventions.

The page must not fail silently if expected optional presentation data is absent.

Do not introduce a new error-handling architecture.

Required data availability and failure behaviour should remain governed by the existing application layer.

The template should remain defensive about optional presentation fields without embedding business rules.

---

## 24. Asset Integration

For implementation assets:

- use the established `/public` asset structure;
- use web-ready assets rather than large originals where appropriate;
- preserve source photography separately;
- use stable, descriptive filenames;
- avoid unnecessary duplicate derivatives;
- do not create a runtime image transformation pipeline.

Real production photography will be integrated once the Architect identifies the appropriate implementation point.

Until then, use existing suitable project assets or clearly defined placeholders where necessary.

---

## 25. Testing

Copilot must run focused tests relevant to the Journey Detail implementation.

At minimum verify:

- Journey Detail View Model/provider behaviour remains intact;
- Journey Detail route renders successfully;
- expected journey content is present;
- primary selection navigation is correct;
- accessibility-related markup does not regress existing tests.

Then run the full regression suite.

Also run the established project verification commands:

- type check;
- production build;
- lint;
- `git diff --check`.

No unrelated failures should be attributed to UI-004.

---

## 26. Browser Verification

Before reporting completion, perform manual/browser verification.

Verify at minimum:

### Desktop

- global shell;
- journey hero/visual area;
- journey title;
- narrative;
- key information;
- primary action;
- secondary navigation;
- footer;
- overall visual hierarchy.

### Mobile

- navigation;
- image presentation;
- content stacking;
- readable typography;
- primary action;
- no horizontal scrolling;
- footer.

### Keyboard

- skip link;
- navigation;
- primary action;
- secondary links;
- visible focus;
- logical focus order;
- no focus trap.

### Responsive

- desktop;
- mobile;
- at least one intermediate width where practical;
- no clipping or overflow.

### Imagery

- correct image mapping;
- crop quality;
- subject positioning;
- no unintended distortion;
- appropriate alternative text.

---

## 27. Acceptance Criteria

UI-004 is ready for Architect Acceptance when:

- [ ] Journey Detail page is implemented within existing Express/EJS architecture.
- [ ] Existing Journey View Model/provider contract is reused.
- [ ] Journey identity is immediately clear.
- [ ] Journey imagery has appropriate visual prominence.
- [ ] Journey narrative is readable and correctly structured.
- [ ] Available key journey information is presented clearly.
- [ ] Existing components/design-system foundations are reused.
- [ ] Primary journey-selection action is clear and functional.
- [ ] Secondary discovery navigation is correct where applicable.
- [ ] No business logic exists in templates.
- [ ] No SPA/client-side application architecture has been introduced.
- [ ] Responsive desktop/mobile presentation works correctly.
- [ ] No horizontal scrolling occurs.
- [ ] Keyboard navigation works correctly.
- [ ] Visible focus is present.
- [ ] Image alternative text is appropriate.
- [ ] Real/approved presentation assets are correctly integrated when supplied.
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
4. View Model/route contracts used.
5. Asset changes.
6. Focused test results.
7. Full regression result.
8. Type-check result.
9. Build result.
10. Lint result.
11. Diff-check result.
12. Browser verification results.
13. Any defects discovered and corrected.
14. Any outstanding issues or contract gaps.
15. Confirmation that no commit/push was performed.
16. Final status: Ready for Architect Acceptance.

Do not provide a report that merely says the implementation is complete. Include actual verification results.

---

## 29. Scope Discipline

UI-004 is a focused frontend slice.

Do not use implementation as an opportunity to:

- redesign the global shell;
- redesign the homepage;
- refactor unrelated CSS;
- replace existing components;
- introduce new frontend frameworks;
- redesign backend contracts;
- introduce new dependencies;
- implement accommodation selection;
- implement booking;
- implement payment;
- create a complete asset-management system.

If a genuine architectural or application-contract issue blocks implementation, stop at the boundary and report it rather than creating an undocumented workaround.

---

## 30. Completion Boundary

UI-004 ends when the Journey Detail and Journey Selection experience is:

- implemented;
- responsive;
- accessible;
- visually verified;
- tested;
- regression-verified;
- reported to the Architect.

After Architect Acceptance, the user will commit the implementation.

The next frontend slice is:

**UI-005 — Accommodation Selection**