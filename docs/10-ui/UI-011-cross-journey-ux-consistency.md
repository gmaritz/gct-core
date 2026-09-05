# UI-011 — Cross-Journey UX Consistency

## 1. Specification

| Field | Value |
|---|---|
| ID | UI-011 |
| Name | Cross-Journey UX Consistency |
| Type | Frontend UI Implementation |
| Depends On | UI-001 through UI-010 |
| Architecture | Express + EJS SSR |
| Status | Ready for Implementation |

---

## 2. Objective

Perform a focused cross-journey UX consistency pass across the completed customer-facing booking journey.

UI-011 does not introduce a new customer journey capability. It aligns the existing UI-003 through UI-010 experiences so that customers encounter a coherent visual, interaction, navigation and responsive experience from:

`Discover → Detail → Selection → Accommodation → Quote → Guest Information → Review → Payment → Confirmation`

The implementation must use the foundations established by UI-001/UI-002 and the components established through the preceding UI slices.

This is a consistency/hardening slice, not a redesign.

---

## 3. Governing Architecture

Implementation MUST follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

Retain:

- Express + EJS SSR;
- existing View Models/providers;
- existing route/controller/application boundaries;
- modular CSS architecture;
- progressive enhancement;
- UI-001 design foundation;
- existing `COMP-*` components.

Do NOT introduce:

- SPA architecture;
- frontend state management;
- new business logic;
- duplicated application rules;
- unrelated backend changes;
- broad framework or dependency changes.

---

## 4. Scope

Review and align the customer-facing pages implemented in:

- UI-003 — Discover / Homepage;
- UI-004 — Journey Detail & Selection;
- UI-005 — Accommodation Selection;
- UI-006 — Quote & Pricing;
- UI-007 — Guest Information;
- UI-008 — Reservation Review;
- UI-009 — Payment;
- UI-010 — Confirmation.

The review must identify and correct only genuine cross-journey inconsistencies.

Focus on:

- page headers;
- containers;
- breadcrumbs/back navigation;
- section headings;
- cards;
- buttons/actions;
- pricing presentation;
- feedback/status messaging;
- form presentation;
- spacing;
- typography;
- responsive behaviour;
- focus states;
- navigation continuity;
- terminology;
- loading/pending/disabled states where already supported.

---

## 5. Consistency Principles

### 5.1 Visual Language

Pages should visibly belong to the same application.

Align, where inconsistent:

- typography;
- heading scale;
- kicker treatment;
- page spacing;
- card treatment;
- borders/radius;
- shadows;
- button sizing;
- action hierarchy;
- price presentation;
- status/feedback presentation.

Use existing DS-001 tokens rather than introducing new values.

Do not redesign an established pattern solely for stylistic preference.

### 5.2 Layout

Use the established container and responsive layout foundations.

Where equivalent page structures exist, align:

- content width;
- page padding;
- column gaps;
- section spacing;
- sidebar behaviour;
- mobile stacking;
- action positioning.

Do not force identical layouts onto pages with genuinely different information requirements.

### 5.3 Interaction

Equivalent actions must behave and appear consistently.

Examples:

- primary actions use the established primary button;
- secondary navigation uses established secondary/link patterns;
- back navigation follows a consistent treatment;
- disabled/pending states use established behaviour;
- duplicate-submit protection remains consistent.

---

## 6. Page Headers

Review page headers across UI-003 through UI-010.

Where appropriate, align:

- kicker;
- `h1`;
- supporting text;
- spacing;
- alignment;
- responsive behaviour.

Each page MUST retain one meaningful `h1`.

Do not make page titles identical where the page's actual purpose requires different wording.

Use customer-facing terminology consistently.

---

## 7. Navigation Continuity

Review the transitions between each customer journey step.

Verify that:

- links point to actual registered routes;
- no placeholder links remain;
- back navigation is predictable;
- forward actions use the correct next step;
- link labels clearly describe their destination;
- navigation does not unexpectedly abandon the current journey.

Expected sequence:

`Discover`
→ `Journey Detail`
→ `Journey Selection`
→ `Accommodation`
→ `Quote`
→ `Guest Information`
→ `Reservation Review`
→ `Payment`
→ `Confirmation`

Do not introduce new routing architecture.

If a route/link defect is discovered, correct the smallest affected frontend implementation.

---

## 8. Action Hierarchy

Review all journey pages for consistent action hierarchy.

### Primary action

Use the established `COMP-002` primary button for the principal next step.

Examples:

- select journey;
- continue to accommodation;
- continue to pricing;
- continue to guest information;
- continue to review;
- proceed to payment.

### Secondary action

Use established secondary/link treatment for:

- back;
- edit;
- recovery;
- alternative navigation.

Avoid competing primary actions.

Confirmation (`UI-010`) is an exception where navigation is the primary post-completion action rather than another transactional step.

---

## 9. Pricing Consistency

Review UI-005 through UI-010 for consistent price presentation.

Reuse:

`COMP-003 — Price Display`

Ensure equivalent concepts use consistent:

- currency presentation;
- amount hierarchy;
- labels;
- total treatment;
- spacing;
- alignment.

Do not modify pricing logic.

Do not calculate or reinterpret pricing in templates.

Any differences required by the underlying View Model should remain.

---

## 10. Section Heading Consistency

Review repeated content sections across the journey.

Reuse:

`COMP-005 — Section Heading`

or the established equivalent pattern.

Align:

- heading hierarchy;
- kicker/eyebrow usage;
- spacing;
- section separation.

Do not introduce duplicate heading components or competing heading conventions.

---

## 11. Cards and Content Containers

Review equivalent cards across UI-003 through UI-010.

Align:

- border;
- radius;
- padding;
- heading treatment;
- metadata layout;
- action placement;
- responsive behaviour.

Use existing card foundations.

Do not create page-specific versions of an existing reusable pattern unless there is a genuine semantic requirement.

---

## 12. Forms

Review UI-005 and UI-007, and any other form-bearing journey pages.

Ensure consistency in:

- field labels;
- required indicators;
- input/select styling;
- focus states;
- validation messages;
- error summaries;
- button placement;
- responsive spacing.

Existing server-side validation remains authoritative.

Do not introduce client-side validation or duplicate validation rules.

Do not change application validation behaviour.

---

## 13. Feedback / Status States

Review existing success, warning, error and informational treatments across the journey.

Use the established feedback/status foundation.

Align:

- semantic meaning;
- visual treatment;
- spacing;
- icon/text relationship;
- accessible status semantics.

Do not invent new business states.

Do not alter application state mapping.

---

## 14. Responsive Consistency

Review all journey pages at minimum:

- desktop: approximately `1280 × 800`;
- mobile: approximately `375 × 812`.

Check for consistent:

- page padding;
- container width;
- typography scaling;
- card stacking;
- button sizing;
- navigation behaviour;
- sidebar behaviour;
- form spacing;
- image behaviour where applicable;
- absence of horizontal overflow.

Correct only genuine inconsistencies.

Do not sacrifice page-specific layout requirements merely to make every page structurally identical.

---

## 15. Accessibility Consistency

Review UI-003 through UI-010 for consistent accessibility foundations.

Verify:

- one meaningful `h1` per page;
- logical heading hierarchy;
- keyboard navigation;
- visible focus;
- accessible buttons/links;
- semantic sections;
- accessible status/error messaging;
- valid ARIA references;
- no keyboard traps;
- skip-link behaviour;
- sufficient focus target sizing.

Do not introduce a second accessibility architecture.

If an existing page has a defect, correct it within the page's established implementation.

---

## 16. Terminology Consistency

Review customer-facing terminology across the journey.

Equivalent concepts should use consistent language.

Pay particular attention to:

- journey;
- accommodation;
- property;
- room;
- rate;
- traveller/guest;
- booking/reservation;
- review;
- payment;
- confirmation.

Do not change domain terminology merely for stylistic preference.

Where existing application/View Model terminology is authoritative, preserve it.

Correct obvious customer-facing inconsistencies where the meaning is unchanged.

---

## 17. Progressive Enhancement

Preserve the existing progressive-enhancement approach.

Do not introduce client-side state to achieve visual consistency.

JavaScript may continue to provide only existing non-essential enhancements such as:

- navigation behaviour;
- duplicate-submit protection;
- pending states.

All journey pages must remain fundamentally usable through SSR/native HTML.

---

## 18. Design-System Consolidation

During implementation, identify repeated local CSS declarations that should clearly use existing DS-001 tokens or established component styles.

Where safe:

- replace hardcoded design values with existing tokens;
- reuse existing component classes;
- consolidate clearly duplicated patterns.

Do not perform broad CSS refactoring unrelated to cross-journey consistency.

Do not change established component semantics merely to reduce line count.

---

## 19. Route / Link Integrity

Perform a cross-journey inspection for:

- placeholder links;
- stale routes;
- incorrect journey IDs;
- incorrect back links;
- incorrect next-step links;
- inconsistent route construction.

Every customer-facing journey link MUST resolve to an actual registered application route.

Do not create new routes to solve a link inconsistency unless an existing route genuinely does not support the required journey transition. If that occurs, stop and report the architectural dependency.

---

## 20. Assets

UI-011 does not introduce production photography.

Existing approved placeholder/outline assets remain unchanged unless a consistency defect directly requires a presentation correction.

Do not:

- add production photography;
- create a new asset library;
- replace image sources;
- perform unrelated image optimisation.

---

## 21. Files / Scope

First inspect the current UI-003 through UI-010 implementation and existing design-system/component files.

Expected changes may include:

- page-specific CSS files;
- shared component CSS;
- affected EJS templates;
- navigation/link markup where required.

Changes MUST be limited to genuine consistency corrections.

Do not modify:

- domain services;
- reservation logic;
- payment logic;
- pricing;
- supplier integrations;
- Prisma/database;
- persistence;
- customer resolution.

No unrelated refactoring.

---

## 22. Testing

Inspect the existing frontend test coverage before making changes.

Add or update tests only where UI-011 changes observable behaviour.

At minimum verify:

1. all affected pages continue to render;
2. journey navigation routes are correct;
3. primary/secondary actions remain correctly linked;
4. existing pricing presentation remains correct;
5. existing form behaviour remains correct;
6. existing status/error rendering remains correct;
7. no placeholder customer-facing links remain;
8. accessibility-related expectations remain valid where covered by existing tests.

Do not rewrite existing tests merely to accommodate cosmetic implementation changes.

---

## 23. Browser Verification

Actual browser verification is required after the final implementation changes.

Verify the complete customer journey across the implemented pages.

### Desktop

At approximately `1280 × 800`, verify:

- consistent page/container alignment;
- headers;
- cards;
- action hierarchy;
- pricing;
- navigation;
- responsive sidebar behaviour;
- no horizontal overflow.

### Mobile

At approximately `375 × 812`, verify:

- consistent page padding;
- typography;
- card stacking;
- action sizing;
- navigation;
- form presentation;
- no horizontal overflow.

### Journey Navigation

Verify the customer can move through:

`Discover → Detail → Selection → Accommodation → Quote → Guest Information → Review → Payment → Confirmation`

using the actual UI controls and registered routes.

### Keyboard

Verify:

- skip link;
- navigation;
- primary/secondary actions;
- forms;
- visible focus;
- logical tab order;
- no traps.

---

## 24. Verification Gate

After all final implementation changes, run:

1. focused tests for affected UI areas;
2. relevant frontend integration tests;
3. `npm test`;
4. `npm run type-check`;
5. `npm run build`;
6. `npm run lint`;
7. `git diff --check`.

All reported results MUST represent the final code state.

If changes are made after verification, rerun the affected verification and the final required gate.

---

## 25. Regression

UI-011 must not regress any previously accepted UI slice:

- UI-001 Design Foundation;
- UI-002 Application Shell;
- UI-003 Discover;
- UI-004 Journey Detail;
- UI-005 Accommodation Selection;
- UI-006 Quote/Pricing;
- UI-007 Guest Information;
- UI-008 Reservation Review;
- UI-009 Payment;
- UI-010 Confirmation.

Existing application behaviour must remain unchanged.

Pre-existing failures must be identified separately.

Do not suppress or ignore failures.

---

## 26. Implementation Report

Copilot MUST provide:

### Implementation

- files changed;
- each meaningful consistency correction;
- shared/component changes;
- page-specific changes;
- route/link corrections;
- terminology corrections.

### Architecture

Confirm:

- Express/EJS SSR retained;
- existing View Models/providers retained;
- no new frontend framework;
- no client-side application state;
- no duplicated business logic;
- no unrelated backend changes.

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

- desktop results;
- mobile results;
- complete journey navigation;
- keyboard results;
- overflow results;
- accessibility observations.

### Scope

Confirm:

- no domain/service changes;
- no database/Prisma changes;
- no supplier/payment changes;
- no production photography;
- no unrelated refactoring;
- no commit;
- no push.

---

## 27. Acceptance Criteria

UI-011 is ready for Architect Acceptance when:

- [ ] UI-003 through UI-010 present a coherent visual language.
- [ ] Page headers are consistently structured.
- [ ] Containers and page spacing are consistent where appropriate.
- [ ] Equivalent cards use consistent presentation.
- [ ] Primary/secondary action hierarchy is consistent.
- [ ] Pricing presentation is consistent.
- [ ] Section headings use established patterns.
- [ ] Forms use consistent established styling.
- [ ] Feedback/status states use established patterns.
- [ ] Customer-facing terminology is consistent where appropriate.
- [ ] Cross-journey navigation uses actual registered routes.
- [ ] No placeholder customer-facing links remain.
- [ ] Desktop presentation is consistent.
- [ ] Mobile presentation is consistent.
- [ ] No horizontal overflow exists on affected pages.
- [ ] Keyboard navigation remains functional.
- [ ] Focus remains visible.
- [ ] Accessibility foundations remain intact.
- [ ] No client-side business/application state is introduced.
- [ ] No production photography is introduced.
- [ ] Existing application contracts remain authoritative.
- [ ] Focused tests pass.
- [ ] Full regression passes.
- [ ] Type-check passes.
- [ ] Build passes.
- [ ] Lint passes with only established baseline warnings, if applicable.
- [ ] `git diff --check` passes.
- [ ] Browser verification passes after final changes.
- [ ] Complete customer journey navigation is verified.
- [ ] Copilot has not committed or pushed.

---

## 28. Architectural Stop Conditions

Stop and report to the Architect rather than expanding UI-011 if consistency work requires:

- a new business rule;
- new application/domain behaviour;
- new routes;
- reservation/payment/pricing changes;
- persistence changes;
- supplier integration changes;
- replacing the established frontend architecture;
- a new state-management architecture;
- a major design-system redesign.

UI-011 is complete when the existing customer journey pages operate and present as one coherent GCT Core frontend experience without changing the underlying application capabilities.
 
---

## 29. Commit Boundary

Copilot MUST NOT:

- commit;
- amend;
- push.

Following Architect Acceptance, the user performs the commit.

Proposed commit message:

`feat(ui): establish cross-journey UX consistency`