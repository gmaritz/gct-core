# GCT Core — UI-001 Frontend Design Foundation

## Document Control

| Field | Value |
|---|---|
| Document | UI-001 — Frontend Design Foundation |
| Project | GCT Core |
| Phase | Frontend UI Implementation |
| Status | Proposed — Architect Review Required |
| Governing Process | `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md` |
| UI Roadmap | `docs/10-ui/UI-ROADMAP.md` |
| Design System | `docs/10-ui/DS-001-frontend-design-system.md` |
| Components | `docs/10-ui/COMP-001` through `COMP-005` |
| Implementation Owner | Copilot |
| Architecture Owner | ChatGPT |
| Commit Owner | User |

---

# 1. Purpose

Implement and consolidate the shared frontend design foundation for GCT Core.

UI-001 establishes the reusable visual and presentation foundations required by subsequent UI implementation slices.

The existing design-system and component specifications remain authoritative. UI-001 implements their foundations in the existing frontend architecture; it does not redefine them.

---

# 2. Governing Process

Implementation MUST follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

Workflow:

1. Specification
2. Architect Review / Approval
3. Copilot Implementation
4. Focused Tests + Regression / Build / Lint
5. Copilot Implementation Report
6. Architect Acceptance
7. User Commit
8. Next Iteration

Copilot MUST NOT commit or push.

If implementation encounters a genuine architectural decision gap, stop and report it.

---

# 3. Authoritative UI Documentation

The following documents MUST be read and followed before implementation:

- `docs/10-ui/DS-001-frontend-design-system.md`
- `docs/10-ui/COMP-001-journey-card.md`
- `docs/10-ui/COMP-002-button.md`
- `docs/10-ui/COMP-003-price-display.md`
- `docs/10-ui/COMP-004-accommodation-gallery.md`
- `docs/10-ui/COMP-005-section-heading.md`

These documents define the existing UI/design-system intent.

UI-001 MUST NOT create a competing design system or redefine component behaviour already specified there.

Where the existing implementation conflicts with an authoritative UI document, resolve it in accordance with the specification or report a genuine conflict for Architect review.

---

# 4. Architectural Baseline

Retain the established frontend architecture:

- Express;
- TypeScript;
- EJS server-side rendering;
- existing frontend routes/controllers;
- application services;
- presentation View Models;
- shared EJS partials;
- existing CSS entrypoint;
- modular CSS;
- progressive-enhancement JavaScript.

Do NOT introduce:

- React, Vue, Angular or another frontend framework;
- SPA architecture;
- client-side application state management;
- CSS frameworks;
- utility CSS frameworks;
- component runtimes;
- replacement template engines;
- replacement frontend build architecture.

Existing dependencies must not be replaced without an explicit architectural decision.

---

# 5. Scope

## 5.1 In Scope

Implement/consolidate the shared foundations for:

- design tokens;
- typography;
- colours;
- spacing;
- containers;
- layout primitives;
- buttons;
- links;
- cards;
- forms;
- validation/error presentation;
- alerts/status presentation;
- badges;
- price presentation;
- action groups;
- focus states;
- responsive behaviour;
- reduced-motion handling;
- shared CSS organisation.

Shared EJS partials may be adjusted where required to support these foundations.

## 5.2 Out of Scope

Do NOT redesign individual customer journey pages.

The following remain subsequent UI slices:

- Discover/Homepage;
- Journey Detail;
- Journey Selection;
- Accommodation Selection;
- Quote;
- Guest Information;
- Reservation Review;
- Payment;
- Confirmation.

Do NOT modify:

- domain logic;
- Reservation logic;
- Customer Resolution;
- pricing;
- payment;
- supplier fulfilment;
- authentication;
- persistence;
- Prisma schema;
- migrations;
- application orchestration.

---

# 6. Design-System Foundation

Use DS-001 as the authority for the visual language.

Consolidate the existing token implementation so reusable visual values are centrally defined and consistently consumed.

The foundation must provide semantic tokens for the values required by the existing design system, including:

- brand;
- text;
- muted text;
- inverse text;
- surfaces;
- backgrounds;
- borders;
- feedback/status;
- spacing;
- typography;
- radii;
- shadows;
- focus;
- transitions.

Rules:

- reuse suitable existing tokens;
- remove unnecessary duplicate values;
- avoid arbitrary hardcoded reusable values;
- do not create speculative token categories.

---

# 7. Typography

Implement the typography foundation defined by DS-001.

Provide consistent styles for:

- page titles;
- section headings;
- supporting headings;
- body text;
- supporting text;
- eyebrow/overline text;
- labels;
- links;
- buttons;
- prices;
- status text.

Retain the existing typography direction unless a concrete implementation issue requires change.

Do not introduce new font dependencies.

---

# 8. Colour

Implement the semantic colour system defined by DS-001.

Ensure consistent treatment of:

- brand;
- primary/secondary content;
- muted content;
- surfaces;
- backgrounds;
- borders;
- success;
- warning;
- error;
- informational states.

Components should consume semantic colour tokens.

Status communication must not depend on colour alone.

---

# 9. Spacing and Layout

Consolidate the existing spacing and container foundations.

Retain the existing general container approach unless implementation demonstrates a concrete usability problem.

Provide reusable support for:

- standard content width;
- wide content;
- narrow content/forms;
- section spacing;
- component padding;
- form spacing;
- action spacing.

Resolve the current container ownership ambiguity between `layouts/container.css` and `layouts/site.css` so container styling has one clear owner.

Do not introduce a new layout framework.

---

# 10. Shared Components

Implement or consolidate the shared foundations required by the existing component specifications.

## 10.1 Button

Follow `COMP-002-button.md`.

Ensure consistent:

- variants;
- sizing;
- focus;
- hover;
- active;
- disabled states.

Preserve semantic button behaviour and existing duplicate-submit protection.

## 10.2 Journey Card

Provide the generic card foundation required by `COMP-001-journey-card.md`.

The generic card must remain presentation-only.

## 10.3 Price Display

Provide the presentation foundation required by `COMP-003-price-display.md`.

The UI must display supplied values only.

It must not calculate, discount, convert or otherwise determine prices.

## 10.4 Accommodation Gallery

Provide any shared presentation foundation required by `COMP-004-accommodation-gallery.md`.

Do not introduce accommodation-specific business logic.

## 10.5 Section Heading

Provide the shared heading foundation required by `COMP-005-section-heading.md`.

---

# 11. Links

Establish consistent presentation for:

- normal links;
- navigation links;
- contextual links;
- secondary actions;
- edit/recovery links.

Links must remain semantically links.

Provide clear default, hover and focus states.

Do not use JavaScript to replace ordinary navigation.

---

# 12. Forms

Consolidate the shared form foundation.

Support the controls already used by the customer journey:

- text;
- email;
- date;
- select;
- textarea;
- radio;
- checkbox;
- fieldset;
- legend.

Provide consistent:

- labels;
- required indicators;
- help text;
- default state;
- focus state;
- invalid state;
- disabled state.

Preserve native form semantics.

Do not change application validation rules.

---

# 13. Validation and Messages

Establish reusable presentation foundations for:

- validation summaries;
- field-level errors;
- success messages;
- warnings;
- errors;
- informational messages;
- pending/unavailable states.

The foundation must support the existing server-side validation model and error-summary focus behaviour.

It must permit accessible association between controls and their errors.

Do not change validation or application state logic.

Status presentation must remain understandable without colour alone.

---

# 14. Badges

Provide the shared visual foundation required by the existing design system and component specifications.

Badges must remain concise and visually subordinate to primary content.

Do not introduce business-specific badge behaviour.

---

# 15. Action Groups

Provide a reusable layout foundation for related actions, including:

- primary + secondary;
- back/edit + continue;
- submit + recovery.

Support:

- horizontal desktop presentation;
- stacked mobile presentation;
- consistent spacing;
- keyboard accessibility.

Generic action groups must not contain journey-specific routes.

---

# 16. Focus and Interaction

All shared interactive elements must have a visible focus state.

At minimum:

- links;
- buttons;
- inputs;
- selects;
- textareas.

Do not suppress native focus without providing an equivalent visible indicator.

Preserve existing keyboard behaviour.

---

# 17. Responsive Foundation

Consolidate the existing responsive approach.

The baseline uses approximately:

- 1024px for major navigation/layout changes;
- 768px for compact/mobile changes.

Avoid introducing competing breakpoint systems.

Shared foundations must support desktop, tablet and mobile.

At narrow widths:

- content must wrap naturally;
- controls must remain usable;
- action groups must be able to stack;
- cards must remain readable;
- no shared foundation may introduce horizontal overflow.

Page-specific responsive work remains out of scope.

---

# 18. Reduced Motion

Provide a global reduced-motion accommodation where practical.

When reduced motion is requested:

- non-essential transitions should be reduced or disabled;
- decorative motion should be minimised;
- functional behaviour must remain unchanged.

Do not add unnecessary animation.

---

# 19. CSS Organisation

Retain the existing modular CSS structure:

- `base/`;
- `layouts/`;
- `components/`;
- `pages/`;
- `utilities/`.

Clarify ownership rather than introducing additional architectural layers.

Expected ownership:

- **base:** reset, tokens, typography and global foundations;
- **layouts:** containers and shared structural layouts;
- **components:** reusable UI components;
- **pages:** page-specific presentation;
- **utilities:** only genuinely reusable small utilities.

Continue the existing naming convention.

Do not perform large-scale class renaming without a functional reason.

---

# 20. Shared Template Boundary

Shared EJS partials may be modified where necessary to support the foundation.

Potential shared areas include:

- `main.ejs`;
- head;
- header;
- footer;
- shared component partials.

Changes must remain foundation-level.

Do not redesign individual journey templates.

Do not move application logic into EJS.

---

# 21. View Model Boundary

Existing presentation View Models remain authoritative.

UI-001 MUST NOT introduce:

- domain objects into templates;
- Prisma entities into templates;
- repositories into templates;
- application services into templates;
- business calculations into templates.

Shared presentation components should consume simple presentation-oriented values.

Do not alter existing View Model contracts unless a genuine foundation-level requirement makes it unavoidable.

---

# 22. JavaScript Boundary

UI-001 is primarily a CSS and presentation implementation.

Existing progressive-enhancement JavaScript must continue to function.

Do not rewrite existing:

- navigation behaviour;
- duplicate-submit protection;
- error-summary focus behaviour;
- homepage interaction.

JavaScript changes are permitted only where required for a foundation-level accessibility or interaction requirement.

Any such change must be reported.

---

# 23. Asset Boundary

Do not establish the production imagery/content asset library in UI-001.

Do not:

- download external images;
- add stock imagery;
- add third-party icon libraries;
- add font packages.

Existing placeholder/generated assets may remain where required for current rendering.

Production asset work belongs to the relevant later UI slices.

---

# 24. Dependency Boundary

Do not add frontend dependencies unless an existing capability is genuinely impossible to implement using the current stack.

If a dependency appears necessary, stop and report the architectural decision gap.

---

# 25. Out-of-Scope Baseline Findings

The baseline inspection identified issues that must remain assigned to later slices rather than expanding UI-001.

These include:

- placeholder navigation destinations;
- placeholder homepage content;
- journey-specific route/link inconsistencies;
- page-specific responsive layouts;
- payment presentation;
- confirmation presentation;
- complete accessibility audit;
- browser visual-regression tooling;
- production imagery/assets.

Do not fix these broadly as part of UI-001.

---

# 26. Testing

Run focused frontend tests covering the affected foundation and representative existing pages.

Run the full established regression suite.

Also run:

- TypeScript type-check;
- production build;
- lint;
- Prisma generation/validation where part of the established project verification process.

No Prisma schema or migration changes are expected.

No existing tests may be removed solely because presentation changes.

---

# 27. Visual Verification

Verify representative examples of the shared foundation:

- typography;
- buttons;
- links;
- cards;
- form controls;
- validation;
- alerts/statuses;
- badges;
- prices;
- action groups;
- containers.

Verify at representative desktop and narrow/mobile widths.

Manual browser verification is acceptable.

Do not introduce visual-regression tooling as part of UI-001 without explicit approval.

---

# 28. Regression Requirements

Confirm that UI-001 has not broken the existing customer journey.

At minimum verify continued operation of:

- Discover/Homepage;
- Journey Detail;
- Journey Selection;
- Accommodation;
- Quote;
- Guest Information;
- Review;
- Payment;
- Confirmation;
- error handling.

Application semantics must remain unchanged.

---

# 29. Acceptance Criteria

UI-001 is accepted when:

### Design System

- DS-001 is implemented consistently.
- Existing tokens are consolidated and reused.
- Typography is consistent.
- Colour semantics are consistent.
- Spacing is consistent.
- Container ownership is clear.

### Components

- Existing component specifications have the shared foundations they require.
- Buttons have consistent variants and states.
- Cards have a reusable foundation.
- Price presentation is reusable and presentation-only.
- Forms have consistent shared styling.
- Validation and status presentation are consistent.
- Action groups support responsive layouts.

### Accessibility

- Shared interactive elements have visible focus.
- Form semantics are preserved.
- Status presentation does not rely on colour alone.
- Reduced-motion handling is supported where appropriate.
- Interaction sizing remains usable.

### Responsive

- Shared foundations work at desktop and mobile widths.
- No shared foundation introduces horizontal overflow.
- Action groups can stack appropriately.
- Typography and spacing remain usable on narrow screens.

### Architecture

- Express/EJS SSR remains intact.
- View Model boundaries remain intact.
- No frontend framework is introduced.
- No unnecessary dependency is introduced.
- No business/application logic moves into the UI foundation.

### Quality

- Focused tests pass.
- Full regression passes.
- Typecheck passes.
- Build passes.
- Lint passes without new errors.
- Prisma verification remains valid where applicable.
- No unrelated functionality is changed.

---

# 30. Expected Change Boundary

Expected changes are primarily limited to:

- design tokens;
- shared CSS;
- layout styles;
- component styles;
- shared presentation markup where required;
- narrowly scoped accessibility foundation changes;
- narrowly scoped JavaScript only where necessary.

Changes to controllers, application services, domain models, repositories, Prisma, Reservation, Customer, payment or supplier integrations are outside scope.

If such changes appear necessary, stop and report the decision gap.

---

# 31. Implementation Report

Copilot MUST report:

1. Implementation summary.
2. Files changed.
3. Design-system changes.
4. Shared component changes.
5. Accessibility changes.
6. Responsive changes.
7. JavaScript changes, if any.
8. Dependency changes, if any.
9. Focused test results.
10. Full regression results.
11. Typecheck result.
12. Build result.
13. Lint result.
14. Prisma verification result where applicable.
15. Visual verification performed.
16. Confirmation that application semantics were unchanged.
17. Confirmation that no unrelated refactoring was performed.
18. Confirmation that no commit or push was performed.

Any unresolved issue or architectural decision gap must be explicitly reported.

---

# 32. Architect Acceptance Gate

Implementation may begin only after explicit Architect approval of this specification.

After implementation:

- Copilot provides the implementation report;
- ChatGPT performs Architect acceptance;
- the user performs the commit after acceptance.

---

# End of Specification