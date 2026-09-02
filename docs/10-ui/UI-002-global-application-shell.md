# UI-002 — Global Application Shell

**Document:** `docs/10-ui/UI-002-GLOBAL-APPLICATION-SHELL.md`  
**Capability:** Frontend UI  
**Roadmap:** UI-002  
**Status:** Implementation Specification  
**Depends On:** UI-001 — Frontend Design Foundation

---

## 1. Purpose

Establish the production-ready global application shell for the GCT Core customer-facing frontend.

The shell provides the persistent structure surrounding all customer-facing pages:

- site header and brand;
- primary navigation;
- responsive/mobile navigation;
- main content frame;
- global container;
- footer;
- global accessibility behaviour.

UI-002 shall establish this shell without redesigning individual customer-journey pages.

---

## 2. Governing Process

Implementation shall follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

The implementation sequence is:

**Specification → Architect Review/Approval → Copilot Implementation → Focused Tests + Regression → Implementation Report → ChatGPT Architect Acceptance → User Commit → Next Iteration**

Copilot shall not commit or push.

---

## 3. Governing UI Documents

The following documents are authoritative and shall be used rather than duplicated:

- `docs/10-ui/DS-001-frontend-design-system.md`
- `docs/10-ui/COMP-001-journey-card.md`
- `docs/10-ui/COMP-002-button.md`
- `docs/10-ui/COMP-003-price-display.md`
- `docs/10-ui/COMP-004-accommodation-gallery.md`
- `docs/10-ui/COMP-005-section-heading.md`

UI-001 is the immediate implementation dependency and establishes the frontend design foundation.

Where these documents define an existing design rule, UI-002 shall consume that rule rather than introduce a competing one.

---

## 4. Architectural Baseline

The existing frontend architecture remains authoritative:

**Express → Controller → Application Service → View Model/Provider → EJS**

The existing shared EJS layout and partial structure shall be retained and refined.

The shell currently consists of the existing:

- main layout;
- head partial;
- header;
- navigation;
- footer;
- scripts;
- shared layout/container CSS;
- navigation CSS;
- navigation JavaScript.

The implementation shall extend these foundations rather than replace them.

No frontend framework or SPA architecture shall be introduced.

---

## 5. Scope

### 5.1 In Scope

UI-002 covers:

- global page structure;
- header;
- brand presentation;
- primary navigation;
- mobile navigation;
- navigation state;
- skip link;
- main content target;
- global container usage;
- footer;
- shell responsiveness;
- shell accessibility;
- shell-specific CSS;
- shell-specific JavaScript enhancement;
- shell-related tests.

### 5.2 Out of Scope

UI-002 shall not implement or redesign:

- homepage;
- discovery;
- journey detail;
- accommodation;
- quote;
- guest information;
- review;
- payment;
- confirmation;
- Reservation;
- Customer;
- payment architecture;
- supplier integrations;
- authentication;
- database/Prisma;
- application/domain services;
- new business logic;
- visual-regression infrastructure.

Page-specific UI remains the responsibility of UI-003 onward.

---

# 6. Global Shell Structure

The resulting rendered structure shall provide:

    body
    ├── skip link
    ├── header
    │   └── primary navigation
    ├── main
    │   └── page content
    ├── footer
    └── global scripts

The existing EJS composition may be retained where structurally equivalent.

The primary content region shall use semantic `<main>` markup and provide a stable target for the skip link.

---

# 7. Header

The header shall:

- provide consistent application identity;
- contain the primary navigation;
- use UI-001 design tokens;
- work across supported viewport sizes;
- provide visible focus states;
- remain usable without JavaScript;
- avoid containing application or journey business logic.

The header shall provide a clear visual relationship between the application identity and navigation.

---

# 8. Brand

The existing brand treatment shall be retained and refined using the established design foundation.

Where no authoritative production logo asset exists, do not introduce an invented branding or asset system.

The brand shall link to the appropriate existing application entry point.

Do not add external fonts, arbitrary imagery, or third-party branding assets.

---

# 9. Primary Navigation

Primary navigation shall use semantic navigation markup with an accessible label.

Navigation items shall:

- use ordinary links;
- have meaningful labels;
- have usable hit areas;
- provide hover and focus states;
- provide an active/current state where appropriate;
- remain functional without JavaScript.

The navigation shall not contain business logic.

---

# 10. Navigation Destinations

UI-002 shall use only existing, authoritative application routes.

It shall not create routes simply to satisfy navigation presentation.

Where a current shell link points to a placeholder or invalid destination and the correct existing destination is unambiguous, the shell link may be corrected.

Journey-page continuation links are outside UI-002.

Where a future destination belongs to a later UI slice and no authoritative route currently exists, do not invent a route.

---

# 11. Active Navigation

Where the current route can be safely determined from the existing request/presentation context, the corresponding navigation item shall receive an appropriate active presentation.

Where semantically appropriate, use:

    aria-current="page"

The active state shall not rely on colour alone.

No new application-level state or service shall be introduced solely to calculate navigation state.

---

# 12. Mobile Navigation

The existing mobile navigation shall be refined into an accessible progressive-enhancement pattern.

The mobile navigation shall provide:

- a semantic toggle button;
- accessible toggle labelling;
- expanded/collapsed state;
- usable touch target;
- visible focus;
- predictable open/close behaviour.

The navigation structure shall remain available without JavaScript.

JavaScript shall enhance the interaction rather than make navigation dependent on JavaScript.

---

# 13. Mobile Toggle

The mobile navigation toggle shall expose its state using `aria-expanded`.

The control shall:

- be a `<button>`;
- have an accessible name;
- provide visible focus;
- identify the controlled navigation region where practical;
- maintain a usable touch target.

Existing icon/glyph treatment should be reused where suitable.

No new icon library shall be introduced.

---

# 14. Mobile Interaction

With JavaScript enabled:

- activating the toggle opens the navigation;
- activating it again closes the navigation;
- `aria-expanded` reflects the current state;
- hidden navigation is not left containing keyboard focus;
- `Escape` closes the open menu;
- focus returns to the toggle when closed via `Escape`.

Outside-click closing may be implemented if it remains simple and does not interfere with keyboard or touch interaction.

Do not introduce a complex dialog/focus-trap implementation unless required by the existing interaction model.

---

# 15. Skip Link

The global shell shall provide a keyboard-accessible skip link to the main content.

The main content shall expose a stable target such as:

    <main id="main-content">

The skip link shall:

- be reachable through keyboard navigation;
- become visibly available when focused;
- provide sufficient contrast;
- move focus to the main content.

---

# 16. Global Container

UI-001 established the canonical container foundation.

UI-002 shall apply that container consistently to the global shell.

There shall be one authoritative ownership model for:

- maximum content width;
- horizontal page padding;
- responsive horizontal spacing.

The implementation shall not create a second container system.

---

# 17. Page Framing

The global shell shall provide predictable vertical framing:

**Header → Main Content → Footer**

Where appropriate, the shell may use a minimum viewport-height structure so short pages position the footer naturally.

The shell shall not impose page-specific height or spacing assumptions.

---

# 18. Footer

The footer shall be a shared semantic application footer.

It shall:

- use the UI-001 design foundation;
- maintain consistent application identity;
- present only authoritative existing links/content;
- provide accessible links;
- reflow appropriately on smaller screens.

Do not invent:

- legal policies;
- contact information;
- social accounts;
- customer-account functionality;
- operational claims.

The footer shall use semantic `<footer>` markup.

---

# 19. Responsive Shell

The shell shall use the responsive foundation established by UI-001.

It shall be verified at:

- narrow mobile;
- wider mobile/small tablet;
- desktop.

At narrow widths:

- navigation shall not overflow;
- the brand shall remain usable;
- the mobile toggle shall remain accessible;
- touch targets shall remain usable;
- footer content shall reflow.

At desktop widths:

- primary navigation shall be directly available;
- mobile-only controls shall be appropriately hidden.

No unnecessary new breakpoint system shall be introduced.

---

# 20. Accessibility

The global shell shall establish a consistent accessibility baseline.

Required:

- semantic header/main/footer landmarks;
- semantic navigation;
- keyboard-accessible navigation;
- visible focus;
- skip link;
- accessible mobile navigation toggle;
- meaningful link text;
- active/current navigation semantics where appropriate;
- sufficient contrast;
- no colour-only information;
- usable touch targets.

The implementation shall use the accessibility foundation established by UI-001.

---

# 21. Focus

All shell controls and links shall provide a visible focus state.

Existing browser focus indicators shall not be removed without an equivalent replacement.

The mobile navigation shall not leave keyboard focus inside hidden content.

Focus styling shall use the UI-001 foundation.

---

# 22. Reduced Motion

Any shell transition or animation shall respect:

    prefers-reduced-motion: reduce

Non-essential animation shall be reduced or disabled for users who request reduced motion.

No decorative animation shall be introduced solely for UI-002.

---

# 23. JavaScript Boundary

Shell JavaScript is limited to progressive enhancement.

Permitted responsibilities:

- mobile navigation state;
- toggle behaviour;
- Escape handling;
- focus restoration;
- simple shell interaction.

It shall not:

- fetch application data;
- own application state;
- perform business logic;
- calculate prices;
- validate business rules;
- create reservations;
- resolve customers;
- determine payment state.

---

# 24. Template Boundary

EJS templates shall remain presentation-focused.

The shell shall not introduce:

- database access;
- application-service calls;
- domain logic;
- pricing logic;
- Reservation logic;
- Customer resolution;
- payment logic.

Existing presentation data should be reused wherever possible.

---

# 25. View Model Boundary

A new shell-specific View Model shall not be introduced unless the existing rendering context is demonstrably insufficient.

If a shell presentation contract is required, it shall be:

- explicitly defined;
- presentation-only;
- minimal;
- free of domain entities;
- free of duplicated application state.

Do not expand application contracts solely for cosmetic convenience.

---

# 26. CSS Organisation

UI-002 shall follow the CSS organisation established by UI-001:

- `base/` — global document foundations;
- `layouts/` — page/shell structure;
- `components/` — reusable shell components;
- `pages/` — page-specific presentation;
- `utilities/` — small reusable utilities.

Shell styles belong in the appropriate layout/component files.

Page-specific styles shall not be moved into the global shell.

---

# 27. Design-System Compliance

UI-002 shall use the semantic tokens established by UI-001 and `DS-001`.

Do not introduce an independent colour, spacing, typography, radius, shadow, focus, or breakpoint system.

Existing component specifications remain authoritative for reusable components.

UI-002 may refine component usage where necessary for shell integration but shall not redefine component contracts.

---

# 28. Assets and Dependencies

UI-002 shall not introduce a new asset-management system.

Do not add:

- stock imagery;
- arbitrary logo assets;
- external font dependencies;
- icon libraries;
- CSS frameworks.

No new npm dependency is expected.

If a dependency appears genuinely necessary, implementation shall stop and report the architectural reason rather than silently introducing it.

---

# 29. Existing Page Compatibility

The global shell shall remain compatible with existing customer-facing pages, including:

- homepage/placeholder;
- journey detail;
- accommodation;
- quote;
- guest information;
- review;
- payment;
- confirmation;
- error pages.

UI-002 shall not require unnecessary page rewrites merely to render existing pages within the shell.

---

# 30. Error Pages

Existing error pages shall remain compatible with the global shell.

UI-002 may make shell-level changes required for consistent rendering.

Error-page content and page-specific visual redesign remain out of scope.

---

# 31. Testing

Add or update focused tests where they provide meaningful protection for shell behaviour.

Tests should cover, where applicable:

- shell rendering;
- navigation rendering;
- valid navigation destinations;
- active navigation state;
- mobile-navigation markup;
- accessibility attributes;
- skip-link target;
- footer rendering.

Do not create brittle tests for purely visual CSS properties.

---

# 32. Required Verification

Copilot shall run:

1. Focused UI-002 tests.
2. Full regression:

       npm test -- --runInBand

3. TypeScript type-check.
4. Production build.
5. Prisma validation where part of the established project verification.
6. Lint.
7. Existing whitespace/diff checks.
8. Worktree scope verification.

No database migration is expected.

No external supplier/API integration is expected.

---

# 33. Visual Verification

Manual/browser verification shall cover:

### Desktop

- header;
- brand;
- navigation;
- container;
- footer.

### Mobile

- header;
- closed navigation;
- open navigation;
- toggle state;
- main content;
- footer.

### Keyboard

- skip link;
- navigation links;
- navigation toggle;
- focus visibility;
- Escape behaviour.

Representative existing customer pages shall also be checked to confirm shell compatibility.

Formal visual-regression tooling is out of scope and belongs to UI-013.

---

# 34. Implementation Constraints

Copilot shall not:

- change application services;
- change domain models;
- change Reservation behaviour;
- change Customer behaviour;
- change payment behaviour;
- change supplier integrations;
- change authentication;
- change Prisma schema;
- introduce a frontend framework;
- introduce a CSS framework;
- introduce unrelated dependencies;
- redesign journey pages;
- perform unrelated refactoring;
- commit;
- push.

---

# 35. Scope Discipline

If implementation identifies a genuine architectural dependency that cannot be resolved within UI-002:

1. stop at the boundary;
2. document the dependency;
3. identify the affected existing contract;
4. report it for Architect review.

Do not silently redesign an existing architecture.

Minor presentation corrections directly required for the shell are permitted.

Unrelated cleanup is not.

---

# 36. Acceptance Criteria

UI-002 shall be considered complete when:

- [ ] Existing Express/EJS shell architecture is retained.
- [ ] Header is coherent and responsive.
- [ ] Brand treatment is consistent.
- [ ] Primary navigation is semantic and accessible.
- [ ] Navigation uses authoritative existing destinations.
- [ ] Active navigation is represented where appropriate.
- [ ] Mobile navigation is accessible.
- [ ] Mobile navigation remains structurally usable without JavaScript.
- [ ] Navigation toggle exposes its state.
- [ ] Escape closes the open mobile menu.
- [ ] Focus restoration is predictable.
- [ ] Skip link is present and functional.
- [ ] Main content has a stable target.
- [ ] Canonical container foundation is used.
- [ ] Footer is semantic and responsive.
- [ ] UI-001 design tokens are used.
- [ ] Focus states are visible.
- [ ] Reduced-motion behaviour is respected.
- [ ] Existing pages remain compatible with the shell.
- [ ] No journey-page redesign is included.
- [ ] No application/domain/payment changes are included.
- [ ] No new dependency is introduced.
- [ ] Focused tests pass.
- [ ] Full regression passes.
- [ ] Type-check passes.
- [ ] Build passes.
- [ ] Required project validation passes.
- [ ] Lint passes within the established baseline.
- [ ] Desktop verification passes.
- [ ] Mobile verification passes.
- [ ] Keyboard verification passes.
- [ ] Worktree scope is confirmed.
- [ ] Copilot has not committed or pushed.

---

# 37. Implementation Report

Copilot shall provide a concise implementation report containing:

### A. Summary

What was implemented.

### B. Files Changed

Every changed file and its purpose.

### C. Architecture Compliance

Confirm that:

- Express/EJS remains;
- existing View Model boundaries remain;
- no SPA/framework was introduced;
- no business logic was added to templates;
- no application/domain/payment changes were made.

### D. Shell Verification

Report:

- desktop behaviour;
- mobile behaviour;
- navigation state;
- skip link;
- focus behaviour;
- Escape handling;
- footer;
- responsive behaviour.

### E. Accessibility Verification

Report keyboard and semantic verification.

### F. Tests and Quality Gates

Report:

- focused tests and counts;
- full regression and counts;
- type-check;
- build;
- Prisma validation where applicable;
- lint;
- diff/whitespace verification.

### G. Visual Verification

Report desktop, mobile and keyboard verification.

### H. Scope Verification

Explicitly confirm:

- no unrelated changes;
- no schema/migration changes;
- no new dependencies;
- no commit;
- no push.

### I. Outstanding Issues

Report only genuine remaining issues or architectural blockers.

---

# 38. Architect Acceptance

After implementation, the user shall provide the Copilot implementation report to ChatGPT.

ChatGPT shall assess the implementation against:

1. this specification;
2. UI-001;
3. the authoritative design-system/component documents;
4. the implementation report;
5. the reported verification results.

The result shall be one of:

- **ACCEPTED**
- **ACCEPTED WITH REQUIRED CORRECTION**
- **NOT ACCEPTED**

No commit message shall be supplied until UI-002 is accepted.

---

# 39. Commit Boundary

After Architect Acceptance:

- the user performs the commit;
- Copilot does not commit;
- Copilot does not push.

ChatGPT shall provide the commit message after acceptance.

---

# 40. Definition of Done

UI-002 is complete when the GCT Core frontend has a stable global application shell that is:

- coherent;
- responsive;
- accessible;
- reusable;
- compatible with the existing customer journey;
- aligned with UI-001;
- implemented without changing the established application architecture.

The shell shall provide the foundation for:

- UI-003 Discover / Homepage Experience;
- UI-004 Journey Detail & Selection;
- UI-005 Accommodation Selection;
- UI-006 Quote & Pricing Experience;
- UI-007 Guest Information Experience;
- UI-008 Reservation Review Experience;
- UI-009 Payment Experience;
- UI-010 Confirmation Experience.

**Specification Status: READY FOR ARCHITECT REVIEW**