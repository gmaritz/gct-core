# GCT CORE — IMP-003 CUSTOMER JOURNEY DISCOVERY & DETAIL FOUNDATION

## 1. DOCUMENT CONTROL

**Document:** IMP-003 Customer Journey Discovery & Detail Foundation  
**Project:** GCT Core  
**Capability:** Frontend Customer Journey Discovery & Detail Foundation  
**Status:** IMPLEMENTATION SPECIFICATION  
**Version:** 1.0  
**Governing Process:** `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

This specification is the implementation contract for IMP-003.

The implementation workflow is:

**Specification → Copilot Implementation → Focused Tests + Regression → Copilot Implementation Report → Architect Acceptance → Commit**

No additional approval or governance stage is introduced by this specification.

---

# 2. PURPOSE

IMP-003 establishes the first real customer-facing transition from the dynamic homepage merchandising experience into a journey detail experience.

The target flow is:

**Homepage Journey Card → Dynamic Journey Detail**

The capability must allow a customer to select a dynamically generated homepage journey and view a richer representation of that journey on a dedicated customer-facing page.

IMP-003 establishes the foundation for the subsequent customer journey capabilities.

It does NOT implement the complete booking journey.

---

# 3. ARCHITECTURAL CONTEXT

GCT Core deliberately contains two different journey/product flows.

## 3.1 Dynamic Homepage Journey

The homepage dynamically creates journey offers from current merchandising inputs.

Conceptually:

**Pre-selected accommodation establishments**
→ current accommodation opportunities
→ dynamic journey composition
→ homepage merchandising
→ Journey Card
→ dynamic journey detail

The homepage flow is implemented through the existing homepage merchandising/composition architecture, including:

- `HomepageMerchandisingService`
- `HomepageJourneyShowcaseService`
- `JourneyCompositionService`
- `JourneyPresentationMapper`
- `JourneyViewModelProvider`
- homepage View Model providers
- Journey Card presentation

The resulting journey is a dynamic merchandising composition.

It is NOT required to be a persisted catalogue Journey.

## 3.2 Established GOCAPE Tours / Packages

Established tours/packages are a separate product flow.

They contain GOCAPE-authored:

- itineraries;
- tour/package definitions;
- per-person costing;
- optional extras where applicable;
- pre-selected Hotelbeds accommodation establishments/codes.

That architecture remains separate.

IMP-003 MUST NOT collapse the dynamic homepage journey into the established persisted Journey/package architecture merely because both use the term "Journey".

---

# 4. SCOPE

## 4.1 Included

IMP-003 shall establish:

1. a real customer-facing dynamic journey detail route;
2. homepage Journey Card navigation to that route;
3. an application-level mechanism for resolving/reconstructing a dynamic homepage journey for a subsequent request;
4. a dedicated detail application contract;
5. a dedicated detail View Model;
6. a dedicated View Model provider;
7. a customer-facing journey detail EJS page;
8. reusable presentation components required by the detail page;
9. journey identity and not-found handling;
10. appropriate dynamic-offer validity handling;
11. focused automated tests;
12. preservation of all existing homepage behaviour.

## 4.2 Explicitly Excluded

IMP-003 MUST NOT implement:

- accommodation selection UI;
- room selection;
- rate selection;
- booking;
- reservation;
- payment;
- guest information;
- customer account functionality;
- checkout;
- confirmation;
- voucher generation;
- invoice generation;
- established-tour catalogue discovery;
- a general-purpose package catalogue;
- Hotelbeds supplier certification;
- direct supplier API calls from frontend presentation code;
- React, Vue, Angular, Next.js, or another frontend framework;
- unrelated refactoring;
- redesign of the existing Express/EJS architecture.

These belong to subsequent iterations.

---

# 5. EXISTING ARCHITECTURE TO PRESERVE

The implementation MUST preserve:

- Express;
- `/ui` route namespace;
- frontend controllers;
- application services;
- View Model providers;
- presentation View Models;
- EJS;
- shared layout;
- existing EJS partials;
- existing CSS architecture;
- existing design-token approach;
- separation between application/domain services and presentation.

EJS templates MUST NOT:

- retrieve application data;
- call supplier APIs;
- access repositories;
- contain business rules;
- reconstruct journey data.

The controller MUST remain thin.

Business/application retrieval or reconstruction belongs in the application layer.

The View Model provider MUST translate application data into presentation contracts.

---

# 6. DYNAMIC JOURNEY IDENTITY

The homepage currently exposes an identity originating from the dynamically composed journey.

IMP-003 shall establish a stable identifier for navigation between the homepage request and the detail request.

The identifier MUST:

- be safe for use in a URL path;
- identify the dynamic homepage offer;
- not expose internal database implementation details;
- not be interpreted as a persisted `Journey` database ID unless it actually is one;
- be accepted and validated at the application boundary;
- provide deterministic resolution for the lifetime/validity of the dynamic offer.

The implementation MUST reuse the existing journey identity where it is suitable.

Do NOT introduce a second arbitrary identifier if the existing composition identity can safely fulfil this purpose.

---

# 7. DYNAMIC JOURNEY RETRIEVAL / RECONSTRUCTION

This is the principal application requirement of IMP-003.

The current homepage composition is stateless. Its richer `JourneyCompositionResult.payload` exists during the homepage request but is reduced by the presentation layer.

A subsequent detail request therefore requires an explicit application-level resolution mechanism.

The implementation MUST introduce a dedicated application capability for resolving the dynamic homepage journey from its customer-facing identifier.

The capability MUST NOT simply reuse `RetrieveJourneyService` or `JourneyPrismaRepository.findById` unless repository evidence demonstrates that the homepage journey is actually persisted through that path.

The implementation MUST preserve the distinction between:

- dynamically composed homepage journeys;
- persisted established GOCAPE journeys.

## 7.1 Resolution Contract

Define an application-layer contract equivalent in responsibility to:

**Resolve dynamic homepage journey by public journey identity.**

The exact interface/class name should follow existing repository naming conventions.

The contract MUST:

- accept the public journey identifier;
- validate the identifier;
- resolve the dynamic homepage journey;
- return the richer application data required by the detail View Model provider;
- distinguish not-found/invalid/expired offers from successful resolution;
- avoid leaking infrastructure concerns into the frontend.

## 7.2 Source of Reconstruction

Use the existing homepage composition architecture and existing source definitions wherever possible.

Do not duplicate the journey construction algorithm inside the frontend controller or View Model provider.

The same application composition services used by the homepage MUST remain the authoritative mechanism for constructing the dynamic journey.

If reconstruction requires additional application services, those services must be introduced at the application boundary rather than embedded in presentation code.

## 7.3 Consistency

A detail request MUST resolve a journey according to the same business composition rules that define homepage journeys.

Do not create a second, independently maintained journey-building algorithm.

---

# 8. OFFER VALIDITY

The dynamic homepage journey is an offer generated from changing accommodation/commercial inputs.

IMP-003 must therefore treat the detail resource as a dynamic offer rather than a permanent catalogue record.

The implementation MUST provide a clear application outcome when the requested journey cannot be resolved.

At minimum distinguish:

- invalid identifier;
- journey not found;
- journey no longer resolvable/available.

The frontend MUST render an appropriate not-found/unavailable customer response.

Do not silently render an empty detail page.

The exact persistence/cache/expiry mechanism is not required to be a permanent business catalogue mechanism.

Do not introduce database persistence solely to solve this iteration unless existing architecture demonstrates that persistence is already required.

---

# 9. FRONTEND ROUTING

Add a dedicated customer-facing journey detail route under `/ui`.

Use the repository's existing route/controller conventions.

The route MUST:

- accept the public journey identifier;
- pass the identifier to the application resolution capability;
- obtain the detail View Model;
- render the detail EJS page.

The route MUST NOT:

- access Prisma directly;
- access Hotelbeds directly;
- construct journey data;
- contain business rules.

The homepage Journey Card CTA MUST be changed from the current fragment target to the implemented customer-facing detail route.

The existing homepage layout and card presentation must otherwise remain unchanged.

---

# 10. CONTROLLER RESPONSIBILITY

Extend the existing frontend controller boundary rather than introducing a parallel HTTP architecture.

The controller action shall:

1. receive the public journey identifier;
2. invoke the appropriate application-level resolver;
3. obtain the detail View Model through the View Model provider;
4. render the journey detail page;
5. handle the defined not-found/unavailable outcome.

Controller logic MUST remain orchestration-only.

No business calculations or presentation composition should be performed directly in the controller.

---

# 11. DETAIL VIEW MODEL

Create a dedicated journey detail View Model.

Do NOT reuse `JourneyCardViewModel` as the detail contract.

The detail View Model should expose the information required for the initial discovery/detail experience.

At minimum, support the following categories where the underlying composition data exists:

## Identity

- public journey identifier;
- customer-safe identifier if distinct.

## Journey Summary

- title;
- destinations;
- duration;
- journey summary/description where available.

## Itinerary Foundation

Expose structured itinerary information where the existing composition model provides it.

The View Model MUST NOT invent itinerary narrative that does not exist in the application data.

If day-by-day itinerary information is not currently available, keep the contract extensible without fabricating content.

## Accommodation

Expose customer-relevant accommodation information available from the dynamic composition, such as:

- establishment name;
- destination;
- category/rating where available;
- accommodation summary;
- number of nights where available.

Do not expose raw supplier/infrastructure objects.

Hotelbeds codes may remain application-level identifiers and MUST NOT be rendered merely because they exist.

## Experiences

Expose included experience information available from the composition:

- name;
- sequence/order where available;
- relevant customer-facing description where available.

Do not invent descriptions or pricing.

## Pricing

Expose pricing only when a valid customer-facing price is actually available from the application contract.

The View Model MUST distinguish:

- actual price;
- unavailable price.

Do not manufacture a price from partial data.

If the dynamic composition currently cannot provide a reliable customer-facing price, the detail page must use the established "Price on request" semantics rather than inventing a value.

Pricing calculation and supplier rate retrieval are outside the presentation layer.

## Imagery

Use the existing image/presentation conventions.

If only placeholder imagery exists, retain the existing placeholder mechanism.

Do not introduce an unrelated image infrastructure in IMP-003.

## CTA

The detail page should expose the foundation for the next customer journey stage.

The CTA MUST NOT initiate booking, reservation, payment, or accommodation selection in IMP-003.

It may provide a clearly defined continuation placeholder/state consistent with the existing design system, but must not imply that functionality already exists.

---

# 12. VIEW MODEL PROVIDER

Create a dedicated provider for the journey detail View Model.

The provider MUST:

- consume the application-level resolved journey contract;
- map application data into presentation data;
- contain presentation mapping only;
- avoid supplier calls;
- avoid repository access;
- avoid database access;
- avoid business rules.

The existing Journey Card provider remains responsible for the summary/card representation.

Do not enlarge the card View Model simply to make it serve the detail page.

---

# 13. DETAIL PAGE STRUCTURE

Create a dedicated EJS journey detail page using the existing shared layout.

The page should establish the following presentation hierarchy:

1. global navigation;
2. journey title / identity;
3. journey summary;
4. destinations and duration;
5. itinerary foundation;
6. accommodation summary;
7. experiences/highlights;
8. pricing state where available;
9. continuation CTA;
10. footer/shared layout elements.

The page must be responsive and use the established frontend CSS/design-token conventions.

Do not redesign the homepage.

Do not introduce a separate frontend framework or page architecture.

---

# 14. REUSABLE PRESENTATION COMPONENTS

Reuse existing presentation components wherever appropriate.

Existing Journey Card components MUST NOT be repurposed as the detail page itself.

If a reusable detail component is required, create it under the existing frontend component conventions.

Potential reusable components include:

- journey header;
- journey metadata;
- itinerary section;
- accommodation summary;
- experience list;
- pricing summary.

Only create components that are required by the actual detail page.

Avoid speculative component libraries.

---

# 15. ERROR / NOT-FOUND PRESENTATION

The detail route must handle unsuccessful journey resolution gracefully.

At minimum:

### Invalid Identifier

Return the established customer-facing not-found/error experience.

### Journey Not Found

Return the established customer-facing not-found experience.

### Journey No Longer Available

Return an appropriate unavailable/expired-offer presentation.

Do not expose:

- stack traces;
- database errors;
- supplier errors;
- internal identifiers;
- implementation details.

Use the existing `/ui/404` conventions where appropriate rather than creating a competing error architecture.

---

# 16. SECURITY AND INPUT VALIDATION

The public journey identifier is untrusted request input.

The application boundary MUST validate it before resolution.

The implementation MUST:

- reject malformed identifiers;
- avoid unsafe interpolation;
- avoid direct database queries from the route;
- avoid exposing internal errors;
- avoid trusting URL values as persisted database identifiers without explicit contract validation.

No authentication is required for the public journey detail page unless existing repository architecture already requires it.

---

# 17. HOTELBEDS / SUPPLIER BOUNDARY

IMP-003 MUST NOT introduce direct Hotelbeds calls into:

- EJS;
- controllers;
- View Model providers;
- presentation components.

Existing application-layer supplier services may be used indirectly through the established journey composition architecture.

Automated tests MUST use mocks/stubs.

Supplier APIs MUST NOT be called during automated tests.

Supplier certification is outside this iteration.

---

# 18. TESTING REQUIREMENTS

Add focused automated tests covering the new capability.

At minimum test:

## Application Resolution

- valid dynamic homepage journey resolves;
- invalid identifier is rejected;
- unknown journey is handled;
- unavailable/expired resolution is handled where the implementation supports this state.

## View Model Provider

- rich application journey maps correctly to detail View Model;
- absent optional data does not cause failure;
- unavailable pricing produces the correct presentation state;
- customer-facing fields do not expose infrastructure objects.

## Routing / Controller

- valid journey route renders the detail page;
- invalid/not-found journey produces the expected error response;
- controller delegates to the application/provider layers rather than constructing business data.

## Homepage Regression

- existing homepage Journey Cards continue to render;
- Journey Card CTA now points to the real detail route;
- existing homepage tests continue to pass.

Tests MUST remain deterministic.

No live Hotelbeds calls are permitted.

---

# 19. REGRESSION REQUIREMENT

After implementation Copilot MUST run:

1. focused IMP-003 tests;
2. relevant existing homepage/frontend tests;
3. the full Jest regression suite;
4. TypeScript/type-check verification;
5. lint;
6. any existing build verification required by the repository;
7. Prisma validation where part of the established verification set.

Existing unrelated warnings do not require cleanup unless they are caused by this implementation.

A regression failure MUST be investigated and classified before changing unrelated code.

---

# 20. ACCEPTANCE CRITERIA

IMP-003 is complete when all of the following are true.

### AC-01 — Dynamic Journey Boundary

The implementation preserves the distinction between dynamic homepage merchandising and established persisted GOCAPE journeys.

### AC-02 — Real Navigation

A homepage Journey Card navigates to a real customer-facing journey detail route.

### AC-03 — Public Identity

The route uses a validated customer-safe journey identity.

### AC-04 — Application Resolution

The detail request resolves/reconstructs the dynamic homepage journey through an application-layer contract.

### AC-05 — No False Persistence

The implementation does not incorrectly treat the dynamic homepage journey as a persisted catalogue Journey.

### AC-06 — Dedicated Detail Contract

The detail page uses a dedicated View Model rather than the Journey Card View Model.

### AC-07 — Richer Detail

The detail page presents materially richer journey information than the homepage card, using only data actually available from the dynamic composition.

### AC-08 — Pricing Integrity

The detail page never invents a price. It presents a valid application-provided price or the established unavailable-price state.

### AC-09 — Error Handling

Invalid, missing, or unavailable journeys produce a controlled customer-facing response.

### AC-10 — Presentation Separation

EJS and controllers contain no business logic, repository access, or supplier calls.

### AC-11 — Existing Homepage Preservation

Existing homepage behaviour remains intact except for replacing the placeholder Journey Card CTA with the real detail destination.

### AC-12 — Responsive UI

The detail page follows the established frontend responsive and design-token conventions.

### AC-13 — Automated Verification

Focused tests, regression tests, type checking, lint, and established build/validation checks pass.

### AC-14 — No Future Scope

No accommodation selection, pricing workflow, guest details, reservation, payment, confirmation, or other subsequent capability is implemented.

---

# 21. IMPLEMENTATION GUIDANCE

Copilot should first inspect the existing repository implementation and reuse existing patterns.

In particular, inspect before changing:

- `frontend.routes.ts`
- `frontend.controller.ts`
- `homepage-showcase.viewmodel-provider.ts`
- `homepage-journey-showcase-service.ts`
- `journey-composition-service.ts`
- `journey-presentation-mapper.ts`
- `journey-view-model-provider.ts`
- `homepage-journey.viewmodel.ts`
- `journey-card.viewmodel.ts`
- `journey-card.ejs`
- existing shared layout/partial conventions
- existing application journey composition contracts
- existing error/not-found handling.

Do not assume the names in this specification are mandatory implementation class names where repository conventions provide a better equivalent.

The responsibilities and architectural boundaries in this specification ARE mandatory.

---

# 22. IMPLEMENTATION CONSTRAINTS

Copilot MUST NOT:

- modify the baseline repository;
- introduce a frontend framework;
- create a parallel routing architecture;
- duplicate journey composition logic;
- add unnecessary database persistence;
- create a new catalogue system;
- alter established-tour domain behaviour;
- change Hotelbeds contracts unnecessarily;
- refactor unrelated code;
- clean unrelated technical debt;
- modify historical IMP documentation;
- implement future frontend roadmap capabilities;
- create a commit.

If an implementation discovery requires a change outside this scope, stop at the smallest necessary boundary and report the issue rather than silently expanding IMP-003.

---

# 23. EXPECTED IMPLEMENTATION OUTCOME

After IMP-003, the customer journey must have a real first transition:

**Homepage**
→ **Dynamic Journey Card**
→ **Dynamic Journey Detail**

The customer should be able to understand:

- what the dynamically generated journey is;
- where it goes;
- how long it is;
- what accommodation is included;
- what experiences are included;
- the current pricing state where available.

The page must establish a sound foundation for the next implementation iteration without prematurely implementing the booking workflow.

The established-tour/package architecture remains available for the separate product pages and must not be altered merely to satisfy the homepage dynamic journey requirement.

---

# 24. COPILOT IMPLEMENTATION REPORT

After implementation and verification, Copilot MUST report:

- files created;
- files modified;
- application contracts introduced;
- frontend routes introduced;
- View Models/providers introduced;
- EJS components/pages introduced;
- tests added/modified;
- exact verification commands;
- verification results;
- regression results;
- any deviations from this specification;
- any unresolved issues.

The report must distinguish implementation facts from recommendations.

---

# 25. COMPLETION CONDITION

IMP-003 is ready for architect acceptance only when:

1. the implementation satisfies this specification;
2. focused tests pass;
3. full regression passes or any unrelated pre-existing failures are explicitly classified;
4. type-check passes;
5. lint passes or existing unrelated warnings are clearly identified;
6. build/validation checks pass;
7. Copilot provides the implementation report.

Architect acceptance occurs only after the Copilot implementation report is supplied.

The user performs the Git commit only after architect acceptance.

No commit is part of IMP-003 implementation.

---

# 26. FINAL ARCHITECTURAL PRINCIPLE

The implementation must preserve this boundary:

**Homepage merchandising dynamically creates an offer.**

**The detail page explains that dynamically created offer.**

**Established GOCAPE tours/packages remain a separate product architecture.**

IMP-003 is the bridge between the first two stages only:

**DISCOVER → UNDERSTAND**

The later stages:

**SELECT → PRICE → ENTER GUEST DETAILS → REVIEW → PAY → CONFIRM**

remain outside this iteration and will be specified separately.