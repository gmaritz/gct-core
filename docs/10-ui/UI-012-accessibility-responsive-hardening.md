# UI-012 — Accessibility & Responsive Hardening

**Status:** Implementation Specification  
**Capability:** Frontend UI  
**Depends On:** UI-003 through UI-011  
**Governance:** `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

## 1. Objective

Harden the completed customer-facing frontend for accessibility, responsive behaviour, keyboard interaction, focus management, semantic correctness, and common viewport edge cases.

This is a **hardening slice, not a redesign**. Preserve the established Express/EJS SSR architecture, View Models/providers, DS-001 design system, existing components, routes, progressive enhancement approach, and established visual language.

## 2. Scope

Review and improve the existing UI across:

- Discover / Homepage
- Journey Detail & Selection
- Accommodation Selection
- Quote / Pricing
- Guest Information
- Reservation Review
- Payment
- Confirmation
- Shared navigation, footer, feedback, forms, cards and actions

Use the existing architecture and contracts. Do not introduce new application functionality.

## 3. Accessibility

Audit and correct where required:

- semantic page structure and heading hierarchy;
- appropriate use of `main`, `header`, `nav`, `footer`, `section`, `form`, `fieldset` and `legend`;
- meaningful versus decorative image `alt` text;
- link versus button semantics;
- skip link and `#main-content`;
- active navigation state;
- visible keyboard focus;
- mobile navigation keyboard operation;
- sensible Escape behaviour where applicable;
- focus preservation when navigation state changes;
- logical tab order;
- absence of keyboard traps.

### Forms

Audit Accommodation Selection, Guest Information, Reservation Review and Payment:

- visible labels associated with every control;
- semantic required fields;
- appropriate `autocomplete`;
- logical field grouping;
- field-level error association;
- appropriate `aria-invalid`;
- accessible error summaries;
- preserved submitted values after validation failure;
- usable native controls without JavaScript.

Server-side validation remains authoritative. Do not introduce duplicated client-side business validation.

### Status and Feedback

Audit validation, unavailable/recheck, payment and confirmation states.

Use appropriate semantic mechanisms such as `aria-live` or `role` only where they materially improve accessibility. Do not create a second error/status architecture.

### Images

Audit all existing images:

- meaningful images receive useful `alt` text;
- decorative images use empty alternative text where appropriate;
- avoid repeating adjacent visible text unnecessarily;
- preserve existing 16:9 journey imagery behaviour;
- avoid image-related layout instability.

**Production photography remains out of scope.**

## 4. Responsive Hardening

Verify and correct layouts at:

- **Desktop:** 1280×800
- **Mobile:** 375×812

Also test intermediate/narrow viewport conditions where necessary to expose defects involving:

- navigation;
- long headings;
- metadata badges;
- prices;
- buttons/action groups;
- forms and controls;
- cards;
- sticky sidebars;
- breadcrumbs;
- feedback/error messages;
- confirmation/reference information.

Requirements:

- no horizontal page overflow;
- no clipped essential content;
- no overlapping controls;
- no unusably narrow controls;
- action controls remain reachable;
- sticky elements do not obscure content or controls;
- long text wraps naturally;
- mobile layouts remain coherent;
- existing layout hierarchy is retained.

Do not redesign layouts unless required to correct an identified defect.

## 5. Interaction Hardening

Verify:

- consistent visible focus states;
- usable keyboard operation;
- logical tab order;
- appropriate control hit areas;
- no reliance on hover-only information;
- understandable disabled/loading states;
- consistent button/link hierarchy;
- effective `:focus-visible`;
- reduced-motion behaviour;
- no focus traps.

Use DS-001 tokens and existing component patterns rather than introducing isolated styling values.

## 6. Browser Verification

Perform actual browser verification after implementation.

Verify the complete customer journey:

**Discover → Detail → Selection → Accommodation → Quote → Guest Information → Review → Payment → Confirmation**

At both:

- 1280×800
- 375×812

Also verify:

- keyboard-only navigation;
- skip link;
- visible focus;
- mobile navigation;
- form interaction;
- validation/error state where practical;
- payment handoff state;
- confirmation state;
- no horizontal overflow.

Any discovered defect must be corrected and the affected verification repeated.

## 7. Automated Verification

After implementation:

1. Run focused tests covering changed frontend behaviour.
2. Run `npm test`.
3. Run `npm run type-check`.
4. Run `npm run build`.
5. Run `npm run lint`.
6. Run `git diff --check`.

Report exact results, including suite/test counts and any pre-existing lint warnings.

## 8. Architecture & Scope Constraints

Preserve:

- Express + EJS SSR;
- existing Controller → Service → View Model Provider → EJS flow;
- existing View Models/providers;
- DS-001;
- COMP-001 through COMP-005;
- progressive enhancement;
- existing route contracts.

Do not:

- introduce React, Vue, Angular or another SPA framework;
- introduce client-side application state;
- move business rules into browser code;
- redesign the established UI;
- introduce production photography;
- modify unrelated backend/domain functionality;
- create duplicate design-system/component specifications;
- add accessibility libraries unless demonstrably required by the existing architecture.

If a defect cannot be resolved within the existing frontend architecture without changing an application contract or introducing a new architectural concept, **stop and report it rather than expanding scope**.

## 9. Deliverables

Implementation report must include:

- files changed;
- accessibility improvements;
- responsive improvements;
- browser verification results;
- keyboard/accessibility verification results;
- focused test results;
- full regression results;
- type-check result;
- build result;
- lint result;
- `git diff --check` result;
- confirmation that Express/EJS/View Model architecture remains unchanged;
- confirmation that no production photography was introduced;
- confirmation that no unrelated scope was changed;
- confirmation that Copilot did not commit or push;
- any unresolved issues or scope concerns.

**Copilot must not commit or push.**

## 10. Acceptance Criteria

UI-012 is ready for Architect Acceptance only when:

- accessibility hardening is complete;
- responsive hardening is complete;
- complete customer journey is browser-verified;
- 1280×800 and 375×812 verification passes;
- keyboard verification passes;
- no horizontal overflow remains;
- focused tests pass;
- full regression passes;
- type-check passes;
- build passes;
- lint passes with only documented pre-existing warnings, if any;
- `git diff --check` passes;
- no architectural or unrelated scope expansion has occurred.

**Proposed commit message after Architect Acceptance:**

`feat(ui): harden accessibility and responsive experience`