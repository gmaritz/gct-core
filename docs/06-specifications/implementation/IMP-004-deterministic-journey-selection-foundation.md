# GCT CORE — IMP-004 DETERMINISTIC JOURNEY SELECTION FOUNDATION

## 1. DOCUMENT CONTROL

| Property | Value |
|---|---|
| Specification | IMP-004 |
| Title | Deterministic Journey Selection Foundation |
| Capability | Frontend & UI |
| Status | Implementation Specification |
| Version | 1.0 |
| Governing Process | `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md` |
| Predecessors | IMP-001, IMP-001A, IMP-002, IMP-003.1, IMP-003.2 |
| Next Capability | IMP-005 |
| Implementation Agent | Copilot |
| Architectural Owner | ChatGPT / System Architect |

This document is the complete implementation contract for IMP-004.

No implementation shall begin outside the scope defined by this specification.

---

# 2. GOVERNING DEVELOPMENT PROCESS

The single source of truth for the GCT Core development workflow is:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

The mandatory workflow is:

**Specification → Copilot Implementation → Focused Tests + Regression → Copilot Implementation Report → Architect Acceptance → Commit**

Copilot shall:

1. implement this specification;
2. run focused tests;
3. run regression and verification checks;
4. provide the implementation report;
5. make no Git commit.

The user performs the Git commit only after architect acceptance.

No additional staging, audit, approval, or pre-commit workflow is introduced.

---

# 3. PURPOSE

IMP-004 establishes the first deterministic customer-facing selection capability following the Journey Detail experience.

The customer flow becomes:

**Discover → Understand → Select**

The purpose of IMP-004 is to allow the customer to make an explicit selection from the available deterministic journey/package configuration presented by GCT Core.

For the MVP, journey composition remains deterministic and curated.

AI itinerary generation, AI recommendations, AI personalization and dynamic AI composition are explicitly outside the scope of this specification.

---

# 4. MVP ARCHITECTURAL PRINCIPLE

The MVP must be completed before any AI implementation is introduced.

For IMP-004 and all immediately following MVP frontend capabilities:

- itineraries are curated/deterministic;
- journey structure is controlled by GCT Core;
- attractions and activities are selected by the defined journey;
- accommodation candidates are pre-selected;
- Hotelbeds provides current accommodation commercial information where required;
- customer interaction progressively configures the deterministic journey.

The implementation must NOT introduce an AI abstraction merely for future extensibility.

Future AI capabilities may eventually replace deterministic composition decisions, but that is post-MVP work.

---

# 5. ARCHITECTURAL CONTEXT

The current customer-facing flow is:

**Homepage Journey Card**
→ **Journey Discovery**
→ **Journey Detail**

IMP-004 extends this to:

**Journey Detail**
→ **Journey Selection**

The selected journey is still the same dynamic/curated journey identified by the existing public journey identifier.

IMP-004 must not create a second journey identity or a second journey composition mechanism.

The distinction between dynamic homepage merchandising and established GOCAPE tours/packages remains mandatory.

---

# 6. SCOPE

## 6.1 Included

IMP-004 shall implement the first explicit customer selection boundary.

This includes:

1. a customer-facing selection action from Journey Detail;
2. a deterministic journey selection request;
3. validation of the selected journey identity;
4. preservation of the selected journey context;
5. an application-level selection contract;
6. a selection result suitable for the next customer journey stage;
7. a selection View Model/state where required;
8. appropriate Journey Detail UI changes;
9. controlled success/failure states;
10. focused automated tests;
11. regression tests;
12. full repository verification.

## 6.2 Explicitly Excluded

IMP-004 shall NOT implement:

- AI itinerary generation;
- AI recommendations;
- AI personalization;
- AI ranking;
- dynamic AI attraction/activity selection;
- enterprise search;
- accommodation room selection;
- Hotelbeds room selection;
- Hotelbeds rate selection;
- final package pricing;
- reservation;
- booking;
- payment;
- guest details;
- checkout;
- confirmation;
- voucher generation;
- invoice generation;
- customer account functionality;
- new persistent Journey entity;
- new search infrastructure;
- new supplier APIs;
- direct Hotelbeds calls from frontend code;
- bulk itinerary ingestion;
- attraction/activity content ingestion;
- bulk image ingestion;
- unrelated frontend redesign;
- unrelated refactoring.

---

# 7. SELECTION SEMANTICS

IMP-004 establishes:

> The customer has explicitly chosen to proceed with a particular journey.

It does NOT establish:

> The customer has selected a specific accommodation room/rate or final package price.

Therefore the selection boundary is:

**Journey Selected**

not:

**Booking Selected**

The selected journey must remain associated with its public journey identity.

---

# 8. CUSTOMER FLOW

The resulting flow shall be:

**Journey Detail**

→ customer reviews journey

→ customer activates the primary continuation action

→ application validates/resolves the journey

→ selection state is established

→ customer is transferred to the next defined stage.

The next stage must use the existing frontend/application routing conventions.

Do not introduce an unfinished transaction endpoint merely to satisfy the CTA.

---

# 9. JOURNEY SELECTION IDENTITY

The selected journey shall use the existing public journey identifier established by IMP-003.1.

The implementation MUST NOT:

- generate a second identifier;
- expose a database primary key unnecessarily;
- create a new session identifier unless required by an existing application mechanism;
- store duplicate journey information merely to support selection.

The selected identity must be validated at the application boundary.

---

# 10. APPLICATION SELECTION CONTRACT

Introduce an application-level capability for selecting/proceeding with the resolved dynamic journey.

The exact class/interface names shall follow repository conventions.

Conceptually:

`selectJourney(journeyId)`

The contract shall:

1. validate the public journey identifier;
2. resolve the dynamic/curated journey through the existing application mechanism;
3. establish that the journey is currently valid for continuation;
4. return an application-level selection result;
5. distinguish invalid, unavailable and successful outcomes.

The contract MUST NOT:

- access presentation models;
- access EJS;
- expose Prisma models;
- expose supplier responses;
- perform booking;
- select rooms/rates;
- calculate final package pricing.

---

# 11. DYNAMIC JOURNEY REVALIDATION

Because the homepage journey may contain dynamic commercial accommodation information, the application must not blindly trust stale presentation state.

When the customer proceeds from Journey Detail:

- resolve the journey through the existing application boundary;
- verify that the journey remains resolvable;
- preserve the existing journey identity;
- report an unavailable state if it can no longer be resolved.

Do not silently proceed with an invalid journey.

The implementation should reuse the existing dynamic journey resolver established by IMP-003.1/IMP-003.2.

---

# 12. SELECTION RESULT

The application-level selection result should represent at minimum:

- selected journey public identifier;
- selected journey validity state;
- journey summary sufficient for the next presentation boundary;
- continuation state.

The result may include additional application data only where required by the next stage.

Do not duplicate the entire Journey aggregate into a selection object unnecessarily.

---

# 13. SELECTION STATES

At minimum, support:

## SELECTED

The journey was successfully resolved and selected.

## INVALID

The submitted journey identifier is invalid.

## NOT_FOUND

The selected journey cannot be resolved.

## UNAVAILABLE

The journey was previously visible but is no longer available for continuation.

The frontend shall provide appropriate customer-facing behaviour for each state.

---

# 14. STATE PERSISTENCE

IMP-004 must determine whether existing GCT Core request/session mechanisms can carry the selected journey context.

Prefer the smallest existing mechanism consistent with the architecture.

Do NOT introduce a new database persistence model merely to remember the selected journey.

If a session/request mechanism is already established for the frontend flow, reuse it.

If no such mechanism exists, the selected public journey identifier may be carried explicitly to the next customer-facing route, provided that:

- it remains validated;
- it does not expose sensitive data;
- the next application stage re-resolves authoritative data rather than trusting client-supplied state.

The client must never be treated as authoritative for journey or commercial data.

---

# 15. JOURNEY DETAIL CTA

The Journey Detail page shall contain a clear primary continuation control.

The CTA shall:

- communicate that the customer is proceeding with the selected journey;
- use the established journey identifier;
- invoke the selection boundary;
- avoid claiming that booking is occurring;
- avoid claiming that pricing is final.

The CTA text should follow the existing GCT Core UX conventions.

Possible semantic wording includes:

- Continue;
- Select Journey;
- Continue with this Journey.

The final wording should be chosen consistently with the existing UI language.

---

# 16. NEXT-STAGE BOUNDARY

IMP-004 must establish a clear continuation point but must not implement subsequent transaction functionality.

If the next implementation capability is not yet available, the implementation may:

- establish the route and application contract required by the next capability;
- render an appropriate transitional state;
- or use the existing approved continuation surface.

It must NOT create a fake booking or payment experience.

The implementation report must clearly identify the continuation boundary.

---

# 17. VIEW MODEL

If a dedicated selection state is required by the implementation, create a presentation View Model following existing conventions.

The View Model may contain:

- journey identifier;
- journey title;
- selection status;
- continuation destination;
- customer-facing status message where required.

It must not contain:

- raw Prisma objects;
- supplier objects;
- internal exceptions;
- secrets;
- infrastructure details.

Avoid creating a View Model if the existing architecture already has an appropriate reusable representation.

---

# 18. FRONTEND CONTROLLER

The controller action shall remain orchestration-only.

It shall:

1. receive the selected journey identifier;
2. pass it to the application selection contract;
3. handle the application result;
4. redirect/render according to the result;
5. use established frontend error handling.

The controller must not:

- resolve repositories directly;
- access Prisma;
- call Hotelbeds;
- perform business calculations;
- construct domain objects.

---

# 19. ROUTING

Add only the routes required to establish the selection boundary.

Routes shall remain under the existing `/ui` namespace.

The route naming must follow established GCT Core conventions.

The implementation must avoid route proliferation.

If a GET detail route already exists:

`/ui/journeys/:journeyId`

do not replace it.

The selection action should use an appropriate non-idempotent HTTP method where the existing frontend architecture supports it.

Do not implement selection as a misleading GET state-changing operation merely for convenience.

---

# 20. HTTP SEMANTICS

Where supported by the existing frontend architecture:

- GET remains used for retrieving/rendering Journey Detail;
- POST should be used for an explicit selection action that changes application/customer state.

The implementation must follow existing CSRF/security conventions if such protections are already established.

Do not introduce a new security framework.

---

# 21. CUSTOMER DATA AND SECURITY

The selected journey identifier is untrusted input.

The implementation must:

- validate it;
- avoid unsafe interpolation;
- avoid trusting client-provided commercial information;
- re-resolve authoritative journey information server-side;
- avoid exposing internal identifiers unnecessarily.

No customer PII is required by IMP-004.

Do not introduce guest/customer data collection at this stage.

---

# 22. PRICING BOUNDARY

IMP-004 does not establish final package pricing.

The selected journey may have an indicative/current pricing state from the existing dynamic composition.

The selection action must not:

- treat an indicative price as a final booking price;
- persist a final price;
- guarantee Hotelbeds availability;
- reserve accommodation;
- create a booking.

The subsequent pricing capability will perform the appropriate commercial calculation/revalidation.

---

# 23. HOTELBEDS BOUNDARY

No direct Hotelbeds calls may be introduced in:

- routes;
- controllers;
- View Model providers;
- EJS;
- frontend JavaScript.

If journey revalidation requires accommodation information, use existing application-level services.

Tests must use controlled application responses and must not call live Hotelbeds APIs.

---

# 24. PERSISTENCE BOUNDARY

IMP-004 shall not introduce a new persistent Journey Selection table.

A selected journey is customer interaction state, not a new catalogue entity.

If an existing session/request mechanism is sufficient, use it.

Do not persist selection state permanently unless an existing approved architecture explicitly requires it.

---

# 25. UI/UX REQUIREMENTS

The Journey Detail page must clearly communicate the selection action.

The customer should understand:

1. what journey they are selecting;
2. that they are proceeding with that journey;
3. that accommodation/pricing may still require subsequent confirmation;
4. what happens after selecting.

The UI must not imply:

- booking confirmation;
- payment;
- guaranteed accommodation;
- final price.

Use the existing GCT Core design system.

Do not redesign unrelated portions of the Journey Detail page.

---

# 26. RESPONSIVE DESIGN

The selection experience must work on:

- mobile;
- tablet;
- desktop.

The primary CTA must remain clearly visible and usable across supported viewport sizes.

Use existing spacing, typography, colour, button and responsive design tokens.

---

# 27. ACCESSIBILITY

The selection action must be:

- keyboard accessible;
- semantically represented as an interactive control;
- clearly labelled;
- understandable without colour alone;
- compatible with existing focus styles.

Error/status messages must be accessible to assistive technologies using existing repository conventions.

---

# 28. ERROR STATES

The application must handle:

## Invalid Journey

Customer receives a controlled invalid/not-found response.

## Journey Not Found

Customer receives a controlled not-found experience.

## Journey Unavailable

Customer is informed that the journey is no longer available and is given an appropriate return/alternative action.

## Selection Failure

Unexpected failures use existing frontend/application error handling.

Do not expose internal errors.

---

# 29. RETURN / RECOVERY

For an unavailable or invalid journey, provide an appropriate recovery path using existing routes.

Where practical, the customer should be able to return to:

- the homepage;
- journey discovery;
- or another valid journey entry point.

Do not create a dead-end error page where an existing recovery destination is available.

---

# 30. TESTING REQUIREMENTS

Focused automated tests are mandatory.

## 30.1 Application Selection Tests

Test:

1. valid journey can be selected;
2. actual homepage journey identity is accepted;
3. malformed identifier is rejected;
4. unknown journey returns NOT_FOUND;
5. unavailable journey returns UNAVAILABLE;
6. journey is re-resolved through the existing dynamic composition/resolution mechanism;
7. no booking/reservation operation occurs;
8. no final pricing is persisted or asserted.

## 30.2 Controller Tests

Test:

1. valid selection invokes the application contract;
2. successful selection produces the expected continuation;
3. invalid selection produces the expected response;
4. unavailable selection produces the expected response;
5. controller contains no direct persistence/supplier access.

## 30.3 Route Tests

Test:

1. Journey Detail still renders;
2. selection route accepts the expected HTTP method;
3. valid selection follows the expected continuation;
4. invalid selection is handled;
5. unavailable selection is handled.

## 30.4 UI Tests

Verify:

1. Journey Detail displays the primary selection CTA;
2. CTA uses the selected journey identity;
3. CTA does not loop back to the same Journey Detail route;
4. selection state/error state is displayed appropriately;
5. existing Journey Detail content remains intact.

## 30.5 Regression

Verify:

1. homepage still renders;
2. homepage Journey Cards still work;
3. Discovery still works;
4. Journey Detail still works;
5. IMP-003.1 behaviour remains intact;
6. IMP-003.2 behaviour remains intact.

---

# 31. VERIFICATION

Copilot shall run from the repository root:

`npm run type-check`

`npm test -- --runInBand`

`npx prisma validate`

`npm run lint`

`npm run build`

Focused IMP-004 tests shall also be executed explicitly.

The implementation report must provide exact commands and results.

Existing unrelated lint warnings do not require remediation unless caused by IMP-004.

---

# 32. ACCEPTANCE CRITERIA

## AC-01 — Explicit Selection

The customer can explicitly select the journey from Journey Detail.

## AC-02 — Correct Identity

Selection uses the existing public journey identifier.

## AC-03 — Server-Side Validation

The selected journey is validated and resolved server-side.

## AC-04 — Dynamic Revalidation

The application verifies that the dynamic journey remains resolvable before continuing.

## AC-05 — Application Boundary

Selection is implemented through an application-level contract.

## AC-06 — No Duplicate Composition

Existing dynamic journey composition/resolution is reused.

## AC-07 — No False Booking

Selecting a journey does not create a booking or reservation.

## AC-08 — No Final Price

Selecting a journey does not establish or guarantee final package pricing.

## AC-09 — Controlled Failure

Invalid, not-found and unavailable states are handled cleanly.

## AC-10 — Customer Recovery

Unsuccessful selection provides an appropriate recovery path.

## AC-11 — Correct HTTP Semantics

An explicit state-changing selection uses the appropriate HTTP method supported by the existing architecture.

## AC-12 — Supplier Isolation

No direct Hotelbeds access exists in presentation code.

## AC-13 — No New Journey Persistence

No new persistent Journey entity is created.

## AC-14 — Responsive UI

The selection interaction works on supported viewport sizes.

## AC-15 — Accessibility

The selection control and state handling meet the specified accessibility requirements.

## AC-16 — Existing Behaviour Preserved

Homepage, discovery and Journey Detail behaviour remain intact.

## AC-17 — Tests

Focused IMP-004 tests pass.

## AC-18 — Regression

The full Jest regression suite passes.

## AC-19 — Repository Verification

Type-check, Prisma validation, lint and build pass.

## AC-20 — MVP Boundary

No AI functionality is introduced.

---

# 33. IMPLEMENTATION CONSTRAINTS

Copilot MUST NOT:

- introduce AI;
- introduce AI recommendation;
- introduce AI itinerary generation;
- introduce AI personalization;
- introduce enterprise search;
- introduce a new Journey persistence model;
- introduce direct Hotelbeds calls in frontend code;
- implement room selection;
- implement rate selection;
- implement booking;
- implement reservation;
- implement payment;
- implement guest details;
- implement checkout;
- implement confirmation;
- implement final package pricing;
- modify GOV-DEV-001;
- modify historical IMP specifications;
- overwrite IMP-003.1 or IMP-003.2;
- create a Git commit;
- perform unrelated refactoring;
- introduce arbitrary external imagery;
- create permanent itinerary content storage as part of this capability.

Any requirement outside this scope must be reported as a deviation rather than silently implemented.

---

# 34. IMPLEMENTATION GUIDANCE

Before modifying code, Copilot shall inspect the committed implementation of:

- IMP-003.1 dynamic journey resolver;
- IMP-003.1 discovery route/controller;
- IMP-003.2 Journey Detail View Model;
- IMP-003.2 Journey Detail View Model Provider;
- Journey Detail EJS;
- existing frontend routing;
- existing error handling;
- existing HTTP method/security conventions;
- existing session/request state mechanisms, if any.

Reuse established abstractions wherever appropriate.

Do not create parallel versions of existing capabilities.

---

# 35. CONTENT AND IMAGES

Final curated itinerary content and the complete approved image library are not prerequisites for IMP-004.

The implementation shall work with the journey data currently available.

Do not:

- create bulk content files;
- invent final itinerary text;
- introduce attraction/activity image ingestion;
- source arbitrary internet images.

The existing Journey Detail page must remain compatible with the future controlled content/media architecture.

---

# 36. AI EXCLUSION — EXPLICIT

AI implementation is expressly deferred until GCT Core reaches MVP status.

IMP-004 MUST NOT introduce:

- LLM calls;
- AI services;
- recommendation models;
- AI prompts;
- AI itinerary composition;
- AI attraction/activity selection;
- AI personalization;
- AI ranking;
- AI-generated content.

The deterministic/curated journey model is the authoritative MVP model.

Future AI work will be specified separately after MVP acceptance.

---

# 37. FUTURE CUSTOMER JOURNEY

IMP-004 establishes:

**DISCOVER → UNDERSTAND → SELECT**

The later stages remain:

**PRICE → GUEST DETAILS → REVIEW → PAY → CONFIRM**

IMP-004 must establish only the selection boundary required to support that progression.

---

# 38. IMPLEMENTATION REPORT

After implementation Copilot shall provide an implementation report containing:

## Files Created

Complete list of new files.

## Files Modified

Complete list of modified files.

## Application Changes

Describe:

- selection contract;
- validation;
- dynamic journey revalidation;
- state handling.

## Frontend Changes

Describe:

- route;
- controller;
- View Model changes;
- CTA;
- UI changes;
- error/recovery states.

## Tests

List:

- focused tests;
- modified tests;
- regression results.

## Verification

Report exact commands and results for:

- type-check;
- focused tests;
- full Jest regression;
- Prisma validation;
- lint;
- build.

## Deviations

List every deviation from this specification.

If none:

`No deviations.`

## Outstanding Issues

List unresolved issues.

If none:

`No outstanding issues.`

## Commit

State:

`No commit created.`

---

# 39. COMPLETION DEFINITION

IMP-004 is complete when:

1. the Journey Detail page provides an explicit selection action;
2. the selection uses the existing public journey identity;
3. the journey is validated server-side;
4. the journey is re-resolved before continuation;
5. the application-level selection contract exists;
6. successful selection reaches the defined continuation boundary;
7. invalid/not-found/unavailable journeys are handled;
8. no booking or reservation is created;
9. no final package price is established;
10. no new Journey persistence model is introduced;
11. no direct Hotelbeds access exists in presentation code;
12. the UI is responsive and accessible;
13. existing homepage/discovery/detail behaviour remains intact;
14. focused tests pass;
15. full regression passes;
16. type-check passes;
17. Prisma validation passes;
18. lint passes subject only to documented pre-existing warnings;
19. build passes;
20. Copilot supplies the implementation report;
21. no Git commit has been created.

---

# 40. FINAL ARCHITECTURAL PRINCIPLE

IMP-004 establishes the deterministic MVP transition:

**DISCOVER → UNDERSTAND → SELECT**

The selected journey remains a GCT Core journey definition/composition.

The customer has not yet selected:

- a room;
- a rate;
- a final price;
- a booking;
- a payment option.

The intended MVP evolution is:

**Curated Journey**
→ **Dynamic/Current Accommodation**
→ **Customer Selection**
→ **Pricing**
→ **Guest Details**
→ **Review**
→ **Payment**
→ **Confirmation**

Only after this deterministic MVP customer journey is complete and validated shall GCT Core introduce the future AI-driven itinerary/recommendation architecture.

IMP-004 must therefore remain deliberately deterministic and must provide a stable foundation for the subsequent MVP capabilities without introducing AI prematurely.