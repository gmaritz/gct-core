# UI-003 — Discover / Homepage Experience

**Document:** `docs/10-ui/UI-003-DISCOVER-HOMEPAGE-EXPERIENCE.md`  
**Roadmap:** UI-003  
**Status:** Implementation Specification  
**Depends On:** UI-001 — Frontend Design Foundation; UI-002 — Global Application Shell

---

## 1. Purpose

Implement the production-quality GCT Core homepage and journey-discovery experience.

The homepage shall:

- establish the GCT Core visual identity;
- introduce the customer proposition;
- present available journeys clearly;
- use the approved GCT Core photography;
- provide a clear path into the existing journey flow;
- work responsively and accessibly;
- preserve the existing server-rendered architecture.

UI-003 is a presentation-layer implementation. It shall consume existing application contracts and shall not introduce new business behaviour.

---

## 2. Governing Process

Implementation shall follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

The workflow is:

**Specification → Architect Review/Approval → Copilot Implementation → Focused Tests + Regression → Implementation Report → ChatGPT Architect Acceptance → User Commit → Next Iteration**

Copilot shall not commit or push.

---

## 3. Governing UI Documents

The following documents remain authoritative:

- `docs/10-ui/DS-001-frontend-design-system.md`
- `docs/10-ui/COMP-001-journey-card.md`
- `docs/10-ui/COMP-002-button.md`
- `docs/10-ui/COMP-003-price-display.md`
- `docs/10-ui/COMP-004-accommodation-gallery.md`
- `docs/10-ui/COMP-005-section-heading.md`

UI-003 shall use these documents rather than creating competing component or styling rules.

UI-001 establishes the frontend design foundation.

UI-002 establishes the global application shell.

---

## 4. Architectural Boundary

Retain the existing architecture:

**Express → Controller → Application Service → View Model/Provider → EJS**

UI-003 shall:

- reuse the existing homepage/discovery controller and application flow;
- consume the existing homepage/discovery View Model;
- render presentation data through EJS;
- reuse existing shared partials and components;
- retain server-side navigation;
- use JavaScript only for progressive enhancement.

Do not introduce:

- React, Vue, Angular or another frontend framework;
- SPA architecture;
- client-side application state;
- client-side business logic;
- new booking/domain services;
- new persistence;
- new supplier integrations.

---

## 5. Scope

### In Scope

- homepage visual hierarchy;
- homepage introduction/hero;
- journey discovery section;
- journey-card presentation;
- journey-card imagery;
- responsive journey-card layout;
- homepage-specific styling;
- appropriate homepage interaction enhancement;
- accessibility and responsive application of the existing design foundation;
- integration of approved GCT Core photography;
- homepage visual verification.

### Out of Scope

- journey-detail redesign;
- accommodation selection;
- quote;
- guest information;
- reservation review;
- payment;
- confirmation;
- Reservation or Customer behaviour;
- authentication;
- supplier integrations;
- database/schema changes;
- new content-management functionality;
- frontend framework introduction.

---

# 6. Existing Homepage Baseline

Before implementation, inspect and retain the existing:

- homepage route;
- controller;
- homepage application service;
- homepage View Model/provider;
- homepage template;
- journey-card partial;
- homepage JavaScript;
- homepage CSS.

Existing application semantics remain authoritative.

UI-003 is a visual and presentation enhancement of this existing flow, not a replacement of the application architecture.

---

# 7. Homepage Experience

The homepage shall establish the following customer flow:

**Introduction → Discover Journeys → Select Journey**

The visual hierarchy shall make journey discovery the primary functional purpose of the page.

The customer should understand:

1. what GCT Core offers;
2. what journeys are available;
3. how to proceed.

The page should remain visually focused and avoid unnecessary decorative or informational content.

---

# 8. Homepage Structure

Use the existing homepage content model to produce an appropriate structure consisting conceptually of:

1. global application shell;
2. introductory/hero area;
3. journey-discovery section;
4. journey-card collection;
5. existing supporting content where appropriate;
6. global footer.

The exact template structure may follow the existing View Model and content availability.

Do not invent business or editorial content solely to fill visual space.

---

# 9. Introduction / Hero

The introductory area shall provide a strong visual entry into GCT Core.

Where supported by the existing homepage content, it should communicate:

- GCT Core identity;
- destination/travel proposition;
- concise supporting messaging;
- an appropriate journey-discovery action.

The hero shall establish visual hierarchy without competing with the journey-card collection.

Use the UI-001 typography, colour, spacing and container foundations.

---

# 10. Hero Imagery

Where the existing homepage supports a showcase/hero image, replace placeholder or generated imagery with an appropriate approved GCT Core image.

Hero imagery is not required to use the journey-card 16:9 convention if the homepage composition benefits from another presentation ratio.

The implementation shall not introduce a new image-management mechanism.

---

# 11. Primary Action

The homepage shall provide a clear path toward journey discovery where required.

Use `COMP-002-button.md` for button presentation.

Do not create a new route solely to support the homepage.

If the journey collection itself is already the obvious next action, do not add redundant CTA elements.

---

# 12. Journey Discovery

Journey discovery is the principal functional element of UI-003.

The discovery section shall:

- identify available journeys clearly;
- provide strong visual differentiation;
- make journey selection obvious;
- work naturally on desktop and mobile;
- use the existing journey data.

Journey information shall come from the existing View Model/application contract.

Do not duplicate business data in EJS.

---

# 13. Journey Cards

Journey cards shall use:

`docs/10-ui/COMP-001-journey-card.md`

UI-003 shall determine the page-level presentation of the cards, including:

- placement;
- grid;
- spacing;
- responsive behaviour;
- imagery supplied to the component.

Do not create a second journey-card design.

If implementation reveals that `COMP-001` requires a genuine contract change, stop at that boundary and report it for Architect review.

---

# 14. Journey Card Content

Journey cards shall display only information available through the established presentation contract.

Where supported, this may include:

- journey title;
- description;
- relevant journey metadata;
- pricing indication;
- journey action.

Do not calculate or derive business values in the template.

Pricing shall use `COMP-003-price-display.md` where applicable.

---

# 15. Journey Card Images

The agreed GCT Core journey-card image convention is:

**Aspect ratio:** 16:9  
**Prepared web master:** 1600 × 900 px  
**Preferred format:** WebP

The original high-resolution photography shall remain preserved separately.

Prepared web assets shall never overwrite or destructively modify the originals.

---

# 16. Image Rendering

Journey-card image containers shall maintain a **16:9** presentation ratio.

Images shall:

- fill the presentation frame;
- preserve their aspect ratio;
- not be stretched or distorted;
- use an appropriate crop.

Centre positioning is the default where the composition permits it.

The presentation layer should support a focal position for images where centre cropping would compromise the principal subject.

---

# 17. Image Eligibility

Not every source photograph must be suitable for journey cards.

Portrait or compositionally unsuitable photographs shall not be forced into 16:9 when doing so materially damages the image.

Where necessary, select another appropriate photograph.

The photography library shall therefore distinguish conceptually between:

- journey-card imagery;
- general journey/experience imagery;
- original source photography.

---

# 18. Responsive Image Delivery

The initial implementation may use the prepared 1600 × 900 WebP asset.

Do not generate or introduce numerous image variants without evidence that they are required.

If responsive variants are introduced, use standard responsive image mechanisms and base their sizes on the actual rendered UI.

The application shall never serve the original high-resolution photography as the normal journey-card asset.

---

# 19. Image Focal Position

The presentation layer may support an optional focal position for journey-card imagery.

Centre positioning shall be the default.

Focal positioning shall be used only where necessary to preserve an important visual subject.

Focal position is presentation/content metadata and shall not be added to the domain model.

---

# 20. Journey Card Grid

The journey-card collection shall form a responsive grid.

The grid shall:

- adapt to available horizontal space;
- maintain comfortable card widths;
- preserve consistent gaps;
- avoid horizontal scrolling;
- present a single-column arrangement on narrow mobile screens.

The exact breakpoint and column values shall be determined using the existing UI-001 foundations and actual page geometry rather than being unnecessarily hard-coded by this specification.

---

# 21. Responsive Behaviour

UI-003 shall provide a coherent experience across:

- desktop;
- tablet/intermediate widths;
- mobile.

The responsive implementation shall preserve:

- visual hierarchy;
- card readability;
- 16:9 imagery;
- usable actions;
- appropriate spacing;
- accessibility.

Do not create separate desktop/mobile implementations of the same page.

---

# 22. Mobile

On narrow screens:

- the global shell from UI-002 remains authoritative;
- the introduction remains concise;
- journey cards become a readable single-column sequence;
- card imagery remains 16:9;
- actions remain easy to use;
- content remains available without horizontal scrolling.

Do not hide important journey information merely to reduce page height.

---

# 23. Desktop

On larger screens:

- the introduction shall provide a strong visual entry point;
- the journey-card collection shall form a coherent grid;
- cards shall align consistently;
- page content shall use the canonical container;
- whitespace shall support hierarchy rather than unnecessarily consume the viewport.

---

# 24. Navigation

Journey cards shall use the existing authoritative journey destination.

Do not introduce new journey routes.

If an existing homepage link points to an obsolete placeholder while the correct existing destination is unambiguous, correct the link as part of UI-003.

If route intent is genuinely ambiguous, report the issue rather than guessing.

---

# 25. Accessibility

UI-003 shall consume and extend the accessibility foundations established by UI-001 and UI-002.

The homepage shall provide:

- meaningful semantic structure;
- correct heading hierarchy;
- keyboard-accessible journey actions;
- visible focus;
- appropriate image alternative text;
- usable controls;
- sufficient contrast;
- responsive accessibility;
- reduced-motion compatibility.

Do not create a separate accessibility implementation for the homepage.

---

# 26. Image Alternative Text

Journey images that communicate meaningful content shall have useful `alt` text.

The text shall describe the relevant subject rather than the filename.

Decorative images shall be treated appropriately.

Image accessibility content shall remain separate from business/domain data.

---

# 27. Progressive Enhancement

The essential homepage experience shall work without JavaScript.

Without JavaScript, the customer must still be able to:

- load the homepage;
- view journeys;
- select a journey;
- continue through the existing server-side journey flow.

Existing homepage JavaScript may enhance visual interaction but shall not become a prerequisite for core navigation.

---

# 28. Homepage JavaScript

JavaScript changes shall remain small and progressive.

Existing homepage showcase behaviour may be retained or refined.

Permitted behaviour includes presentation enhancement and simple interaction required by the existing homepage.

Do not use JavaScript to:

- fetch journey data;
- calculate prices;
- manage booking state;
- replace server-side navigation;
- implement business rules.

---

# 29. CSS

Use the UI-001 CSS foundation.

Homepage-specific layout belongs in the established page-level CSS structure.

Reusable journey-card presentation belongs to the component stylesheet.

Do not:

- duplicate component CSS in the homepage stylesheet;
- introduce a second token system;
- introduce arbitrary global styles;
- introduce a CSS framework.

---

# 30. Design System Usage

UI-003 shall consume the established:

- semantic colour tokens;
- typography;
- spacing;
- container;
- button;
- form/feedback;
- card;
- focus;
- responsive foundations.

Where a design requirement is already governed by `DS-001`, `COMP-001`–`COMP-005`, or UI-001, those documents remain authoritative.

---

# 31. Asset Integration

Use the supplied GCT Core photography for the homepage and journey cards where the corresponding journey/content relationship is established.

Do not commit the entire photography library merely because UI-003 requires a small number of images.

Asset names shall be stable and meaningful.

Prepared web assets shall remain separate from original high-resolution photography.

---

# 32. Initial Photography

The supplied representative photography provides suitable candidates including:

- Table Mountain cableway;
- Cape Town aerial;
- Cape Town cityscape;
- Stellenbosch/wine-country landscapes;
- Cape Point;
- coastal imagery;
- hospitality/wine-estate imagery;
- penguin/coastal wildlife imagery.

The actual journey-to-image mapping shall follow the existing journey/content semantics.

Do not infer journey identity solely from visual similarity where the mapping is uncertain.

---

# 33. Asset Processing

UI-003 shall use prepared web assets rather than original high-resolution files.

If assets need to be prepared:

- preserve the originals;
- produce a 1600 × 900 journey-card master where appropriate;
- use WebP where supported;
- crop deliberately where necessary;
- do not alter the original files.

Runtime image-processing infrastructure is not part of UI-003.

---

# 34. Development Tooling

UI-003 shall not introduce `nodemon` or another development dependency solely because it may be convenient.

Before adding development tooling, inspect the existing development scripts and determine whether a genuine gap exists.

If a tooling change is genuinely required, report it separately with its purpose and scope.

No unrelated dependency changes are permitted.

---

# 35. View Model Boundary

The existing homepage/discovery View Model remains authoritative.

If required presentation data is missing:

1. determine whether it already exists in an existing presentation contract;
2. reuse it where appropriate;
3. if a genuine contract gap remains, report it.

Do not access domain entities directly from EJS.

Do not introduce business calculations into the View Model merely to simplify template presentation unless the required value is already an established presentation responsibility.

---

# 36. Scope Control

Minor presentation corrections required to complete UI-003 are permitted.

The implementation shall stop and report if it discovers a genuine:

- application-contract gap;
- domain dependency;
- route ambiguity;
- persistence dependency;
- payment dependency;
- architectural conflict.

Do not silently expand the implementation into another capability.

---

# 37. Testing

Focused UI-003 tests shall cover the meaningful homepage behaviour, including where applicable:

- homepage rendering;
- journey-card rendering;
- journey data presentation;
- journey destinations;
- image references;
- accessibility attributes;
- supported empty-state behaviour;
- existing homepage enhancement behaviour where tested.

Do not create brittle pixel-level tests.

---

# 38. Regression and Quality Gates

After focused tests, run the established project verification:

- full regression;
- TypeScript type-check;
- production build;
- Prisma validation where part of the established project gate;
- lint;
- `git diff --check`;
- worktree scope verification.

No database migration is expected from UI-003.

---

# 39. Visual Verification

Manually verify the homepage at representative desktop and mobile widths.

Verify:

- global shell;
- introduction/hero;
- journey discovery;
- journey-card layout;
- image crops;
- focal positioning where applicable;
- typography;
- spacing;
- actions;
- footer;
- absence of horizontal scrolling.

Also verify keyboard navigation and visible focus.

---

# 40. Photography Verification

The supplied photography shall be evaluated in the actual journey-card presentation.

Check that:

- images remain visually strong at 16:9;
- important subjects are not unintentionally clipped;
- images are not distorted;
- card image heights remain consistent;
- unsuitable images are replaced rather than badly cropped;
- image quality is appropriate for web presentation.

---

# 41. Performance

The homepage shall avoid unnecessarily large image payloads.

At minimum:

- use prepared web assets;
- do not serve original high-resolution photography;
- preserve image dimensions/aspect ratio to minimise layout shift;
- avoid unnecessary image variants.

Do not introduce CDN or image-processing infrastructure as part of UI-003.

---

# 42. Acceptance Criteria

UI-003 shall be considered complete when:

- [ ] Existing Express/EJS architecture is retained.
- [ ] Existing homepage/discovery application contracts are reused.
- [ ] Homepage provides a clear visual introduction.
- [ ] Journey discovery is the primary functional focus.
- [ ] Journey cards use `COMP-001`.
- [ ] Journey cards use 16:9 imagery.
- [ ] Prepared journey-card imagery follows the 1600×900 convention.
- [ ] Approved GCT Core photography is integrated.
- [ ] Original photography remains preserved.
- [ ] Images are not distorted.
- [ ] Appropriate image cropping is used.
- [ ] Focal positioning is supported where required.
- [ ] Journey cards form a responsive grid.
- [ ] Narrow mobile uses a readable single-column presentation.
- [ ] Existing authoritative journey routes are used.
- [ ] Homepage works without JavaScript.
- [ ] UI-001 design foundations are used.
- [ ] UI-002 global shell is retained.
- [ ] Accessibility requirements are satisfied.
- [ ] No business logic is introduced into EJS.
- [ ] No domain, Reservation, Customer, payment or supplier changes are introduced.
- [ ] No unnecessary dependencies are introduced.
- [ ] Focused tests pass.
- [ ] Full regression passes.
- [ ] Type-check passes.
- [ ] Build passes.
- [ ] Required project validation passes.
- [ ] Lint passes within the established baseline.
- [ ] `git diff --check` passes.
- [ ] Desktop visual verification passes.
- [ ] Mobile visual verification passes.
- [ ] Keyboard verification passes.
- [ ] Worktree scope is confirmed.
- [ ] Copilot has not committed or pushed.

---

# 43. Implementation Report

Copilot shall provide a concise implementation report containing:

### Implementation

- summary of the homepage changes;
- journey-card implementation;
- responsive behaviour;
- image integration;
- relevant CSS/JS changes.

### Architecture

Confirm that:

- Express/EJS remains unchanged architecturally;
- existing View Models are retained;
- no frontend framework was introduced;
- no business logic was moved into templates.

### Assets

Report:

- assets added;
- dimensions/formats;
- journey-image mappings;
- any focal-position decisions;
- any unsuitable images identified.

### Verification

Report:

- focused test results;
- full regression results;
- type-check;
- build;
- Prisma validation where applicable;
- lint;
- `git diff --check`;
- visual verification.

### Scope

Explicitly confirm:

- no unrelated changes;
- no schema/migration changes;
- no unnecessary dependencies;
- no commit;
- no push.

### Outstanding Issues

Report only genuine unresolved issues or architectural blockers.

---

# 44. Architect Acceptance

After implementation, the user shall provide the Copilot implementation report to ChatGPT.

ChatGPT shall assess the implementation against:

- this specification;
- UI-001;
- UI-002;
- `DS-001`;
- `COMP-001`–`COMP-005`;
- the implementation report;
- verification results.

The result shall be:

- **ACCEPTED**
- **ACCEPTED WITH REQUIRED CORRECTION**
- **NOT ACCEPTED**

No commit message shall be supplied until UI-003 is accepted.

---

# 45. Commit Boundary

After Architect Acceptance:

- the user performs the commit;
- Copilot does not commit;
- Copilot does not push.

ChatGPT shall provide the commit message after acceptance.

---

# 46. Definition of Done

UI-003 is complete when GCT Core has a production-quality homepage/discovery experience that:

- introduces GCT Core clearly;
- presents journeys visually;
- uses the approved GCT photography;
- applies the agreed 16:9 journey-card convention;
- provides a clear path into the existing journey flow;
- works responsively;
- remains accessible;
- works without JavaScript;
- uses the established UI foundations;
- preserves the existing application architecture.

UI-003 then provides the visual discovery foundation for:

- UI-004 — Journey Detail & Selection;
- UI-005 — Accommodation Selection;
- UI-006 — Quote & Pricing Experience;
- UI-007 — Guest Information Experience;
- UI-008 — Reservation Review Experience;
- UI-009 — Payment Experience;
- UI-010 — Confirmation Experience.

**Specification Status: READY FOR ARCHITECT REVIEW**