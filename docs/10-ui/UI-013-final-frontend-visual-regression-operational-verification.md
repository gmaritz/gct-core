# UI-013 — Final Frontend Visual Regression & Operational Verification

**Status:** Implementation Specification  
**Capability:** Frontend UI  
**Depends On:** UI-001 through UI-012  
**Governance:** `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

## 1. Objective

Perform the final visual-regression and operational verification of the completed GCT Core frontend.

This is primarily a **verification and hardening slice**, not a new UI implementation. Establish confidence that the completed frontend is visually coherent, functionally navigable, responsive, accessible, and operational across the complete customer journey.

Only make code changes where verification identifies a concrete defect that can be corrected within the existing frontend architecture.

## 2. Scope

Verify the completed customer-facing flow:

**Discover → Journey Detail → Journey Selection → Accommodation → Quote → Guest Information → Reservation Review → Payment → Confirmation**

Verify shared frontend elements:

- global application shell;
- navigation;
- footer;
- skip link;
- breadcrumbs/back navigation;
- page headers;
- journey cards;
- accommodation cards/gallery;
- buttons/actions;
- pricing displays;
- forms;
- validation/error feedback;
- status messaging;
- responsive layouts;
- focus states.

Use the existing Express/EJS SSR architecture, View Models/providers, DS-001 and COMP-001 through COMP-005.

**Do not introduce production photography as part of this slice.**

## 3. Visual Regression Verification

Perform actual browser-based visual inspection at minimum:

- **Desktop:** 1280×800
- **Mobile:** 375×812

Inspect every major page in the complete journey.

Verify:

- consistent typography;
- spacing and vertical rhythm;
- container alignment;
- page-header hierarchy;
- card dimensions and alignment;
- image aspect ratios;
- sidebar/action-card positioning;
- pricing presentation;
- button hierarchy;
- form alignment;
- feedback/status presentation;
- navigation/footer consistency;
- mobile stacking;
- absence of clipping, overlap or unexpected wrapping;
- no horizontal overflow.

Pay particular attention to regressions introduced by UI-011 and UI-012.

If the repository already contains an appropriate visual/browser testing mechanism, use it. Do not introduce a heavyweight visual-regression framework solely for this slice unless an existing project requirement justifies it.

## 4. Functional Operational Verification

Verify the complete journey using the existing application contracts.

Confirm:

- Discover journey links resolve correctly;
- journey detail renders correctly;
- journey selection succeeds;
- accommodation selection succeeds;
- quote renders authoritative pricing;
- guest information accepts valid data;
- server validation rejects invalid guest data correctly;
- reservation review displays the selected journey, accommodation, guest information and authoritative price;
- reservation confirmation requires the existing confirmation action;
- payment handoff reaches the existing PayFast hosted-payment mechanism;
- confirmation renders the successful booking state;
- confirmation reference and status information are displayed correctly;
- confirmation refresh is safe and does not create duplicate reservations or payments;
- recovery/back links resolve to registered routes;
- no placeholder links remain where production navigation is expected.

Do not change business rules, payment logic, reservation logic or persistence as part of this slice.

## 5. Accessibility & Responsive Verification

Reconfirm the UI-012 hardening across the complete journey:

- skip link;
- landmarks;
- heading hierarchy;
- visible keyboard focus;
- keyboard-only navigation;
- logical tab order;
- form labels;
- required fields;
- validation error association;
- `aria-invalid`;
- status/error semantics;
- image alternative text;
- mobile navigation;
- reduced-motion behaviour;
- absence of focus traps.

Verify at:

- 1280×800;
- 375×812.

Also exercise at least one narrower/intermediate viewport where practical to expose layout edge cases.

## 6. Operational Checks

Verify:

- production build serves the completed UI correctly;
- static assets resolve correctly;
- CSS and JavaScript load without browser console errors;
- no broken image/resource requests occur;
- no unexpected 404/500 responses occur during the normal journey;
- navigation does not depend on JavaScript where it should remain functional without it;
- progressive enhancement remains intact;
- no obvious browser console errors or warnings attributable to the implementation.

Where a browser console warning is pre-existing and unrelated, document it rather than expanding scope.

## 7. Automated Verification

After any required corrections, run:

1. Focused frontend tests covering changed behaviour.
2. `npm test`
3. `npm run type-check`
4. `npm run build`
5. `npm run lint`
6. `git diff --check`

Report exact suite/test counts and distinguish pre-existing warnings from newly introduced issues.

## 8. Scope Control

Do not:

- redesign the UI;
- introduce new frontend frameworks;
- introduce client-side application state;
- move business logic into templates or browser JavaScript;
- change backend/domain/payment behaviour;
- introduce production photography;
- introduce a heavyweight visual-regression dependency without architectural justification;
- create duplicate design-system/component specifications;
- modify unrelated files.

Minor frontend corrections required to resolve verified visual, responsive, accessibility or navigation defects are within scope.

If verification exposes a defect requiring architectural or backend changes, **stop and report it rather than silently expanding scope**.

## 9. Deliverables

Provide an implementation/verification report containing:

- files changed, or explicitly state that no changes were required;
- pages and viewports verified;
- visual-regression findings and corrections;
- complete journey functional verification;
- accessibility/keyboard results;
- responsive results;
- browser console/resource findings;
- payment handoff verification;
- confirmation refresh/idempotency verification;
- automated test results;
- type-check result;
- build result;
- lint result;
- `git diff --check` result;
- confirmation that the established architecture remains unchanged;
- confirmation that no production photography was introduced;
- confirmation that Copilot did not commit or push;
- any unresolved issues or scope concerns.

## 10. Acceptance Criteria

UI-013 is ready for Architect Acceptance when:

- the complete customer journey has been browser-verified;
- all major pages have passed desktop and mobile visual inspection;
- no material visual regressions remain;
- no horizontal overflow or responsive defects remain;
- keyboard/accessibility verification passes;
- navigation and route integrity pass;
- payment handoff is operationally verified;
- successful confirmation and refresh behaviour are verified;
- no unexpected browser console/resource errors remain;
- focused tests pass;
- full regression passes;
- type-check passes;
- production build passes;
- lint passes;
- `git diff --check` passes;
- no architectural or unrelated scope expansion has occurred.

**Copilot must not commit or push.**

**Proposed commit message after Architect Acceptance:**

`feat(ui): complete frontend visual and operational verification`