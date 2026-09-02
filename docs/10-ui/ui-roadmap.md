# GCT Core Frontend UI Implementation Specification & Roadmap

## Document Control

| Field | Value |
|---|---|
| Document | Frontend UI Implementation Specification & Roadmap |
| Project | GCT Core |
| Phase | Frontend UI Implementation |
| Status | Proposed — pending Architect Review |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS.md |
| Predecessor | IMP-012 — UI Operational Hardening |
| Implementation Owner | Copilot |
| Architecture Owner | ChatGPT |
| Commit Owner | User |
| Scope | Customer-facing frontend UI |
| AI Scope | Out of scope for MVP |

---

# 1. Purpose

This document establishes the implementation roadmap for the GCT Core customer-facing frontend UI.

The functional customer journey has now been implemented and operationally hardened through IMP-012. The next development phase is therefore concerned primarily with transforming the existing functional frontend into a coherent, production-quality customer experience.

The UI implementation must consume the existing application contracts, View Models, routes, validation, payment boundaries, reservation lifecycle and confirmation behaviour.

It must not redesign or duplicate those application capabilities.

This document establishes:

- the UI implementation objectives;
- the implementation sequence;
- the UI architectural principles;
- the capability roadmap;
- the expected componentisation;
- responsive and accessibility requirements;
- UI state requirements;
- the relationship between UI work and existing backend/application contracts;
- verification requirements;
- the boundaries for the forthcoming baseline inspection.

---

# 2. Governing Development Process

All implementation work governed by this specification MUST follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

The agreed workflow is:

1. Specification
2. Architect Review / Approval
3. Implementation by Copilot
4. Focused Tests + Regression / Build / Lint
5. Copilot Implementation Report
6. ChatGPT Architect Acceptance
7. User Commit
8. Next Iteration

Copilot MUST NOT commit or push changes.

No separate pre-commit staging, audit or acceptance workflow is required unless explicitly requested.

---

# 3. Current Functional Baseline

The functional customer journey is established as:

Discover
→ Journey Detail
→ Journey Selection
→ Accommodation Selection
→ Quote
→ Guest Information
→ Review
→ Payment
→ Confirmation

The frontend implementation already provides the functional foundations for these stages.

IMP-012 established the operational baseline including:

- authoritative server-side guest continuation;
- Review → Reservation idempotency;
- PRG behaviour for successful mutation routes;
- consistent route failure handling;
- structured diagnostics;
- validation-summary accessibility foundations;
- duplicate-action protection;
- robust payment and confirmation routing;
- authoritative canonical Reservation/payment/fulfilment state handling.

The UI phase MUST preserve these behaviours.

UI work must not weaken, bypass or duplicate these application-level controls.

---

# 4. UI Phase Objectives

The frontend UI phase has six primary objectives.

## 4.1 Visual Coherence

Establish a consistent GCT Core visual language across the entire customer journey.

This includes:

- typography;
- spacing;
- layout;
- colour usage;
- buttons;
- forms;
- cards;
- navigation;
- messaging;
- pricing;
- status indicators;
- responsive behaviour.

## 4.2 Reusable UI Architecture

Establish a practical reusable component system rather than implementing each page independently.

Components should be introduced where repetition or consistency justifies them.

Avoid premature abstraction.

## 4.3 Customer Journey Clarity

Make the progression through:

Discover → Select → Accommodation → Quote → Guest Details → Review → Pay → Confirm

clear and understandable to the customer.

The UI should communicate:

- where the customer is;
- what has already been selected;
- what action is required;
- what information is being requested;
- what the current price is;
- what happens next.

## 4.4 Responsive Experience

Provide a coherent experience across:

- desktop;
- tablet;
- mobile.

Responsive behaviour must be intentional rather than merely allowing desktop layouts to collapse.

## 4.5 Accessibility

Build accessibility into the UI rather than treating it as a final cosmetic pass.

The UI must support:

- semantic HTML;
- keyboard navigation;
- visible focus;
- accessible labels;
- meaningful headings;
- validation/error associations;
- sufficient interaction targets;
- appropriate status messaging;
- logical reading/order flow.

## 4.6 Production Readiness

The completed UI must be:

- visually consistent;
- robust under validation errors;
- usable on smaller screens;
- resilient to long content;
- compatible with existing server-rendered architecture;
- free of unnecessary client-side application complexity.

---

# 5. Architectural Principles

## 5.1 Existing Architecture Remains Authoritative

The UI phase MUST work within the established architecture:

HTTP Route
→ Controller
→ Application Service / View Model Provider
→ View Model
→ EJS Template

The UI layer must not introduce a competing application architecture.

## 5.2 View Models Remain the UI Contract

Templates must consume View Models rather than reaching into domain/application objects.

Templates must not:

- perform business calculations;
- resolve supplier data;
- calculate authoritative prices;
- create Reservations;
- determine payment state;
- make business decisions.

## 5.3 Server-Side Rendering Remains the Baseline

The established server-rendered EJS architecture remains the default.

Client-side JavaScript should be introduced only where it provides a clear UX benefit, such as:

- interaction enhancement;
- duplicate-action prevention;
- progressive disclosure;
- responsive navigation;
- lightweight form behaviour.

The UI phase must not evolve into a client-side SPA without an explicit architectural decision.

## 5.4 Backend Contracts Are Not Reimplemented in the UI

The UI must display and collect data using the established contracts.

It must not independently reproduce:

- pricing logic;
- availability logic;
- Reservation creation;
- payment determination;
- supplier fulfilment state;
- customer resolution;
- confirmation state.

---

# 6. UI Architecture Layers

The UI implementation should converge toward the following conceptual structure.

## 6.1 Global Shell

Shared site-level elements:

- page container;
- header;
- primary navigation;
- responsive navigation;
- footer;
- global messaging;
- shared page structure.

## 6.2 Design Primitives

Reusable presentation primitives such as:

- typography;
- spacing;
- containers;
- buttons;
- links;
- form controls;
- labels;
- badges;
- dividers;
- icons where appropriate.

## 6.3 Reusable Components

Candidate components include:

- journey card;
- image/media presentation;
- journey summary;
- itinerary/feature list;
- accommodation card;
- room/rate card;
- occupancy summary;
- price summary;
- traveller summary;
- validation summary;
- alert/message;
- status panel;
- action bar;
- progress/journey indicator.

The actual component inventory must be confirmed during the subsequent baseline/architecture inspection.

## 6.4 Page-Level Composition

Pages should compose reusable primitives and components rather than contain duplicated presentation structures.

---

# 7. UI Implementation Roadmap

The UI implementation will proceed as a sequence of controlled vertical UI slices.

## UI-001 — Frontend Design Foundation

Establish the shared visual and structural foundation.

Scope:

- design tokens;
- typography;
- spacing;
- containers;
- buttons;
- links;
- form foundations;
- alerts/messages;
- cards;
- common layout rules;
- global CSS structure;
- responsive breakpoints;
- base accessibility conventions.

Deliverable:

A reusable visual foundation capable of supporting the complete journey.

---

## UI-002 — Global Application Shell

Implement the shared customer-facing shell.

Scope:

- header;
- branding;
- primary navigation;
- responsive navigation;
- footer;
- global page container;
- common page heading structure;
- navigation/focus behaviour;
- shared responsive layout.

Deliverable:

All customer-facing pages can render within a consistent GCT Core shell.

---

## UI-003 — Discover / Homepage Experience

Transform the existing Discover experience into the primary customer entry point.

Scope:

- hero/introductory presentation where supported;
- journey discovery;
- journey cards;
- imagery;
- key journey information;
- clear calls to action;
- responsive composition;
- loading/empty/error presentation where applicable.

The implementation must use the existing Discover View Model and application contract.

---

## UI-004 — Journey Detail & Selection

Implement the visual experience covering Journey Detail and Journey Selection.

Scope:

- journey overview;
- itinerary;
- inclusions/features;
- journey metadata;
- selection controls;
- pricing presentation where supplied;
- primary CTA;
- responsive layout;
- error and unavailable states.

The UI must preserve existing server-side selection behaviour.

---

## UI-005 — Accommodation Selection

Implement the accommodation selection experience.

Scope:

- accommodation presentation;
- room/rate presentation;
- occupancy;
- availability-related messaging;
- selection state;
- pricing;
- room/rate details;
- action controls;
- responsive cards/lists;
- empty/error states.

The UI must consume existing accommodation View Models.

No accommodation or pricing business logic may be moved into templates.

---

## UI-006 — Quote & Pricing Experience

Establish consistent presentation of pricing throughout the journey.

Scope:

- quote summary;
- line-item presentation where appropriate;
- totals;
- currency;
- accommodation pricing;
- journey pricing;
- clear price hierarchy;
- responsive price summaries;
- mobile action presentation.

The canonical application pricing result remains authoritative.

The UI must never calculate the authoritative total.

---

## UI-007 — Guest Information Experience

Implement the production-quality guest information forms.

Scope:

- lead traveller;
- additional travellers;
- adult/child handling;
- date of birth;
- nationality and other supported fields;
- field grouping;
- labels/help text;
- validation presentation;
- error summary;
- redisplay of submitted values;
- responsive form layout;
- duplicate-action protection.

The existing server-side validation and authoritative guest-information continuation must remain intact.

---

## UI-008 — Reservation Review Experience

Implement the review page as the customer's final pre-commitment summary.

Scope:

- journey summary;
- accommodation summary;
- guest summary;
- pricing summary;
- review/edit navigation;
- explicit confirmation action;
- clear commitment messaging;
- responsive summary layout;
- validation/failure presentation.

The UI must make clear that confirmation is the transition into Reservation creation.

It must not create or mutate the Reservation itself.

---

## UI-009 — Payment Experience

Implement the customer payment experience.

Scope:

- payment summary;
- amount;
- currency;
- payment action;
- hosted-provider handoff;
- payment status messaging;
- duplicate-action protection;
- failure/recovery presentation;
- responsive layout.

The existing provider-neutral `HostedPaymentAction` contract remains authoritative.

The UI must not contain PayFast-specific business logic.

---

## UI-010 — Confirmation Experience

Implement the final customer confirmation experience.

Scope:

- confirmation state;
- Reservation information;
- booking/fulfilment information where authoritative and appropriate;
- payment status;
- journey summary;
- accommodation summary;
- customer-facing next steps;
- pending/failed/cancelled states;
- safe invalid/not-found handling;
- responsive presentation.

Confirmation must continue to consume authoritative server-side state.

Browser/query-string payment status must not become authoritative.

---

## UI-011 — Cross-Journey UX Consistency

After the individual pages have been implemented, perform a dedicated consistency pass.

Scope:

- typography consistency;
- spacing consistency;
- button hierarchy;
- card patterns;
- form patterns;
- messaging;
- pricing;
- headings;
- responsive behaviour;
- action placement;
- navigation;
- progress indication;
- error presentation.

This is a consolidation pass, not an opportunity for unrelated application refactoring.

---

## UI-012 — Accessibility & Responsive Hardening

Perform focused production hardening across the completed journey.

Scope:

- keyboard-only operation;
- focus management;
- semantic structure;
- label/control associations;
- validation associations;
- screen-reader-relevant status messaging;
- mobile layouts;
- tablet layouts;
- desktop layouts;
- long-content handling;
- zoom/reflow behaviour;
- interaction target sizing.

---

## UI-013 — Final Frontend Visual Regression & Operational Verification

Perform final UI verification across the complete customer journey.

Verification should cover:

- all primary routes;
- successful journey progression;
- validation failures;
- recovery/navigation;
- empty states;
- unavailable states;
- payment handoff;
- payment failure;
- confirmation states;
- mobile layout;
- desktop layout;
- keyboard interaction.

Existing functional regression remains mandatory.

---

# 8. UI State Model

Every customer-facing page must explicitly consider the states relevant to its function.

At minimum:

- normal;
- loading where applicable;
- validation failure;
- unavailable;
- empty;
- application failure;
- recovery;
- success;
- pending where applicable.

The UI must not invent states unsupported by the application contract.

Where the backend/application already distinguishes states, the UI should preserve that distinction rather than collapsing everything into a generic error.

---

# 9. Forms

All forms must follow a consistent pattern.

Required characteristics:

- visible labels;
- clear grouping;
- appropriate input types;
- server-side validation remains authoritative;
- validation errors adjacent to the relevant control;
- summary of validation failures where appropriate;
- submitted values redisplayed where supported;
- keyboard-friendly operation;
- clear primary action;
- duplicate submission protection.

Client-side validation may enhance the experience but must never replace server-side validation.

---

# 10. Responsive Design

Responsive behaviour must be defined as part of implementation rather than added retrospectively.

The implementation must support at least:

- mobile;
- tablet;
- desktop.

Particular attention must be given to:

- navigation;
- journey cards;
- accommodation cards;
- pricing summaries;
- forms;
- action bars;
- review summaries;
- payment actions;
- confirmation content.

No critical action or information may become inaccessible or impractical at smaller widths.

---

# 11. Accessibility Baseline

The UI must target a strong practical accessibility baseline consistent with modern WCAG principles.

Requirements include:

- semantic HTML;
- logical heading hierarchy;
- keyboard navigation;
- visible focus indicators;
- accessible form labels;
- explicit control associations;
- meaningful link/button text;
- accessible error presentation;
- non-colour-only status communication;
- sufficient contrast;
- responsive reflow;
- no keyboard traps.

Accessibility must be implemented incrementally within each UI slice.

---

# 12. Client-Side JavaScript Boundary

Client-side JavaScript must remain deliberately lightweight.

Permitted examples:

- responsive menu interaction;
- submit-button protection;
- progressive UI interaction;
- lightweight display toggles;
- accessibility enhancements.

Client-side JavaScript must not become responsible for:

- Reservation creation;
- authoritative pricing;
- payment state;
- supplier state;
- customer identity;
- security decisions;
- application orchestration.

---

# 13. Visual Design Decision Boundary

The forthcoming baseline/architecture inspection must determine what visual/design assets already exist in the codebase.

Before introducing:

- a new CSS framework;
- a component framework;
- a design system;
- a template engine;
- a client-side framework;
- a new asset pipeline;

the existing implementation must be inspected.

No technology replacement is authorised by this roadmap alone.

---

# 14. Baseline Inspection Dependency

The next activity after approval of this roadmap is a **read-only frontend baseline/architecture inspection**.

That inspection must establish:

1. Current frontend directory structure.
2. Existing EJS templates.
3. Existing CSS and styling architecture.
4. Existing JavaScript.
5. Existing assets and imagery.
6. Existing View Models.
7. Existing frontend controllers/routes.
8. Existing reusable presentation components.
9. Existing responsive behaviour.
10. Existing accessibility implementation.
11. Existing build/asset pipeline.
12. Existing dependencies relevant to UI.
13. Existing visual patterns worth retaining.
14. Existing duplication and inconsistency.
15. Existing gaps against this roadmap.

The inspection must not modify the repository.

Its purpose is to determine the smallest coherent implementation path for UI-001 onward.

---

# 15. Implementation Constraints

The UI phase MUST NOT:

- replace the established application architecture;
- introduce an SPA without explicit approval;
- duplicate application/domain logic;
- calculate authoritative pricing in templates or JavaScript;
- bypass server-side validation;
- bypass Reservation creation boundaries;
- bypass Customer Resolution;
- bypass payment architecture;
- make browser payment parameters authoritative;
- alter canonical Reservation semantics;
- alter supplier fulfilment semantics;
- introduce authentication;
- introduce AI functionality;
- perform unrelated backend refactoring;
- create duplicate application capabilities;
- commit or push changes through Copilot.

---

# 16. Testing & Verification

Each UI implementation slice must include appropriate focused tests.

Depending on the slice, verification should include:

- controller tests;
- View Model tests;
- route tests;
- template rendering tests where appropriate;
- accessibility-oriented checks;
- responsive verification;
- existing application regression.

Every implementation report must provide:

- focused test results;
- full regression results;
- typecheck result;
- build result;
- Prisma validation/generation result where applicable;
- lint result;
- summary of changed files;
- confirmation that unrelated areas were not modified.

The established regression suite remains mandatory after each implementation slice.

---

# 17. Acceptance Criteria for the UI Phase

The frontend UI phase will ultimately be considered complete when:

### Visual
- The customer journey presents a coherent visual language.
- Shared UI patterns are consistently reused.
- Desktop, tablet and mobile layouts are usable.

### Functional
- The complete customer journey remains operational.
- Existing route contracts remain intact.
- Existing application behaviour remains authoritative.
- Payment and confirmation flows remain correct.

### Accessibility
- Primary customer journeys are keyboard accessible.
- Form controls have appropriate labels and associations.
- Validation errors are understandable and discoverable.
- Focus behaviour is usable.
- Responsive reflow does not make content or actions inaccessible.

### Architecture
- UI logic remains separated from application/domain logic.
- View Models remain the presentation contract.
- Client-side JavaScript remains bounded.
- No unnecessary frontend architecture has been introduced.

### Quality
- Focused tests pass.
- Full regression passes.
- Build passes.
- Typecheck passes.
- Lint passes without new errors.
- No unrelated regressions are introduced.

---

# 18. Traceability

| Roadmap Area | Existing Foundation |
|---|---|
| Discover | Existing frontend journey discovery capability |
| Journey Detail | Existing journey presentation/application capability |
| Journey Selection | Existing journey selection flow |
| Accommodation | Existing accommodation selection flow |
| Quote | Existing canonical pricing/quote flow |
| Guest Information | IMP-007 |
| Review | IMP-008 |
| Reservation | APP-004 capability suite |
| Customer Resolution | APP-011 |
| Payment | IMP-009 |
| Confirmation | IMP-010 |
| Operational Hardening | IMP-012 |
| Persistence | SPEC-030 |
| Development Workflow | GOV-DEV-001 |

The roadmap therefore extends the established functional architecture rather than creating a parallel frontend architecture.

---

# 19. Immediate Next Step

Following Architect approval of this roadmap:

**Next task: Read-only Frontend Baseline & Architecture Inspection**

The inspection must be bounded to the frontend UI and its immediate presentation/application contracts.

No implementation changes are to be made during that inspection.

The inspection findings will be used to produce the first implementation specification:

**UI-001 — Frontend Design Foundation**

No UI implementation should begin until UI-001 has been specified and approved through the established development workflow.

---

# End of Specification