# GCT CORE — IMP-005 ACCOMMODATION SELECTION EXPERIENCE

## 1. DOCUMENT CONTROL

| Property | Value |
|---|---|
| Specification | IMP-005 |
| Title | Accommodation Selection Experience |
| Capability | Frontend & UI |
| Status | Implementation Specification |
| Version | 1.0 |
| Predecessors | IMP-003.1, IMP-003.2, IMP-004 |
| Next Capability | IMP-006 |
| Governing Process | `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md` |
| Implementation Agent | Copilot |
| Architectural Owner | ChatGPT / System Architect |

This specification is governed by `GOV-DEV-001-DEVELOPMENT-PROCESS.md`.

Required workflow:

**Specification → Copilot Implementation → Tests/Regression → Copilot Report → Architect Acceptance → User Commit**

Copilot must not commit.

---

# 2. PURPOSE

IMP-005 implements the next MVP customer journey stage:

**Discover → Understand → Select Journey → Select Accommodation**

The customer shall configure the accommodation associated with the selected journey.

The deterministic accommodation hierarchy is:

**Journey Stop → Property → Room → Rate**

IMP-005 ends when the required accommodation selections are complete and the selection state is ready for IMP-006 pricing.

---

# 3. MVP BOUNDARY

The MVP remains deterministic.

IMP-005 must NOT introduce:

- AI;
- AI accommodation recommendations;
- AI ranking;
- AI personalization;
- AI itinerary generation;
- AI attraction/activity selection.

The journey determines the applicable accommodation stops and pre-selected accommodation candidates.

The customer selects from the valid options returned by the existing application/accommodation capability.

---

# 4. EXISTING ARCHITECTURE

Build on the implementations completed by:

- IMP-003.1 — Customer Journey Discovery Foundation;
- IMP-003.2 — Customer Journey Detail Experience;
- IMP-004 — Deterministic Journey Selection Foundation.

Reuse existing:

- dynamic journey resolver;
- journey selection state;
- journey composition;
- accommodation availability/application services;
- frontend controller conventions;
- View Model/provider conventions;
- EJS/layout conventions;
- design tokens and frontend styling;
- existing error handling.

Do not create parallel journey or accommodation architectures.

---

# 5. SCOPE

## Included

Implement:

1. accommodation-selection route(s);
2. accommodation-selection application contract/service where required;
3. accommodation-selection View Model;
4. accommodation-selection View Model Provider;
5. property selection;
6. room selection;
7. rate selection;
8. multi-stop journey support;
9. occupancy preservation;
10. stay-date preservation where available;
11. server-side validation;
12. stale/unavailable selection handling;
13. selection progress/completion state;
14. continuation boundary to IMP-006;
15. responsive/accessibility presentation;
16. focused tests and regression.

## Excluded

Do not implement:

- final GCT package pricing;
- quotation;
- booking;
- reservation;
- payment;
- guest details;
- checkout;
- room/rate supplier reservation;
- AI;
- unrestricted Hotelbeds search;
- new search infrastructure;
- new Journey persistence architecture;
- bulk content/image ingestion;
- unrelated refactoring.

---

# 6. ACCOMMODATION SOURCE

Accommodation options must come through the existing application-layer accommodation/availability capability.

The frontend must not call Hotelbeds directly.

The implementation must use the existing pre-selected accommodation/property configuration associated with the journey.

Do not introduce unrestricted hotel search.

Do not expose supplier-specific infrastructure structures to EJS.

---

# 7. ROUTING

Introduce the accommodation-selection route under the existing `/ui` namespace.

Preferred route:

`/ui/journeys/:journeyId/accommodation`

Use existing repository route conventions if an equivalent route already exists.

Use:

- `GET` to render accommodation selection;
- `POST` for explicit accommodation selection/state changes.

Do not use GET for state-changing selection.

The journey identifier must remain the existing public journey identity established by IMP-003.1.

---

# 8. JOURNEY STOPS

The application must support both:

- single-stop journeys;
- multi-stop journeys.

For each accommodation stop preserve:

- stop identity;
- stop sequence/order;
- destination;
- stay dates where available;
- number of nights where available;
- applicable property options;
- selected property;
- selected room;
- selected rate;
- selection completion state.

For multi-stop journeys, selections must remain associated with the correct stop.

Do not flatten multiple stops into one accommodation selection.

---

# 9. PROPERTY SELECTION

For each accommodation stop, present the valid pre-selected property options.

Where available display:

- property name;
- destination;
- category/rating;
- representative image;
- customer-facing summary.

The customer must be able to select one valid property where alternatives exist.

A property selection must be validated against the applicable journey stop.

---

# 10. ROOM SELECTION

After property selection, present valid available rooms.

Where available display:

- room name/type;
- description;
- occupancy information;
- room image;
- relevant room attributes.

A room selection must be validated against the selected property.

Do not trust a client-supplied room ID without server-side validation.

---

# 11. RATE SELECTION

After room selection, present valid applicable rates.

Where available display:

- rate/board name;
- meal basis;
- cancellation/refundability information;
- current supplier/application price;
- currency.

A rate selection must be validated against the selected room.

Do not trust client-supplied:

- price;
- currency;
- availability;
- cancellation terms.

---

# 12. OCCUPANCY

Preserve applicable accommodation occupancy through the selection flow.

Where supported by the existing application contract, preserve:

- adults;
- children;
- child ages;
- room count.

For multiple rooms, maintain independent occupancy per room.

Do not collapse separate room occupancy into one value.

---

# 13. STAY DATES

Where journey accommodation dates are available, preserve:

- check-in;
- check-out;
- nights.

Use authoritative application data.

Do not independently calculate or infer stay dates in EJS or browser JavaScript.

---

# 14. APPLICATION SELECTION CONTRACT

Create or extend an application-level contract for accommodation selection.

Conceptually:

`selectAccommodation(journeyId, selections)`

The exact name and location must follow existing repository conventions.

The application capability must:

1. validate the journey;
2. validate each accommodation stop;
3. validate property selection;
4. validate room selection;
5. validate rate selection;
6. verify parent/child relationships;
7. preserve occupancy;
8. preserve stay dates;
9. return a provider-neutral selection result.

Do not place these validations in the controller or EJS.

---

# 15. SELECTION STATE

Represent the state of each accommodation stop as appropriate:

- `NOT_SELECTED`;
- `PROPERTY_SELECTED`;
- `ROOM_SELECTED`;
- `COMPLETE`.

The complete journey state is `COMPLETE` only when every required accommodation stop has a valid property, room and rate selection.

For multi-stop journeys, show clear progress.

Example:

`Accommodation 1 of 3 — Complete`

`Accommodation 2 of 3 — Select Room`

`Accommodation 3 of 3 — Not Started`

The exact presentation is implementation-dependent.

---

# 16. SERVER-SIDE REVALIDATION

The server must re-resolve authoritative accommodation data when a selection is submitted.

The client must never be authoritative for:

- property ownership;
- room ownership;
- rate ownership;
- availability;
- price;
- currency;
- cancellation terms.

If the selected option is no longer available, return a controlled unavailable/stale-selection result.

Do not silently substitute another property, room or rate.

---

# 17. STALE AVAILABILITY

Accommodation availability may change between page rendering and selection.

Support a controlled outcome such as:

`UNAVAILABLE` / `RECHECK_REQUIRED`

using the existing application terminology where applicable.

The customer should:

- be informed of the affected selection;
- retain unaffected valid selections where possible;
- be allowed to select an alternative;
- not receive false confirmation.

Do not implement the full CheckRate/reservation workflow in IMP-005.

---

# 18. VIEW MODEL

Create or extend the accommodation-selection View Model.

It must contain only presentation-safe data required by the page.

Minimum conceptual structure:

- journey identifier;
- journey title/summary where useful;
- ordered accommodation stops;
- property options;
- room options;
- rate options;
- selected values;
- occupancy;
- stay dates;
- selection/completion state;
- availability/error state;
- continuation state.

Do not expose:

- Prisma models;
- repositories;
- raw Hotelbeds responses;
- infrastructure exceptions.

---

# 19. VIEW MODEL PROVIDER

The provider shall:

- map application data to presentation data;
- preserve stop ordering;
- preserve selection state;
- format customer-facing values;
- handle missing optional values;
- map unavailable states.

The provider must not:

- call Hotelbeds;
- access Prisma;
- access repositories;
- perform business calculations;
- invent missing content.

---

# 20. SELECTION SUMMARY

The page should provide a clear summary of the current configuration.

Where applicable show:

- journey;
- accommodation stop;
- selected property;
- selected room;
- selected rate;
- occupancy;
- completion status.

Do not display a final GCT package price.

IMP-006 owns final package pricing.

---

# 21. CONTINUATION

The customer may continue only when all required accommodation stops are complete.

The continuation boundary is:

**Complete Accommodation Selection → IMP-006 Pricing**

IMP-005 may establish the route/state required for IMP-006.

It must not implement final pricing.

The UI must not claim that the customer has booked or reserved accommodation.

---

# 22. ERROR AND EMPTY STATES

Handle at minimum:

### No Properties

No valid accommodation is currently available for the stop.

### No Rooms

The selected property has no available rooms.

### No Rates

The selected room has no applicable rates.

### Stale Selection

A previously displayed option is no longer available.

### Invalid Selection

The submitted property/room/rate does not belong to the applicable selection hierarchy.

### Journey Unavailable

The selected journey can no longer be resolved.

All states must use existing frontend error/recovery conventions.

---

# 23. UI REQUIREMENTS

The customer must be able to understand:

1. which journey is being configured;
2. which accommodation stop is active;
3. which properties are available;
4. which room is selected;
5. which rate is selected;
6. what remains incomplete;
7. when the complete journey is ready to continue.

Use existing GCT Core components and design tokens.

Do not redesign unrelated navigation or global UI.

---

# 24. RESPONSIVE AND ACCESSIBILITY

The accommodation selection experience must work on:

- mobile;
- tablet;
- desktop.

Selection controls must be:

- keyboard accessible;
- clearly labelled;
- semantically appropriate;
- visibly focused;
- understandable without colour alone.

Use existing responsive and accessibility conventions.

---

# 25. IMAGERY

Use imagery already available through the established accommodation/content mechanisms.

Where no image exists:

- use the existing placeholder mechanism;
- do not introduce arbitrary external images.

Attraction/activity image ingestion is not part of IMP-005.

---

# 26. TESTING

Create focused tests covering at minimum:

### Application

- valid single-stop selection;
- valid multi-stop selection;
- stop ordering;
- property/stop validation;
- room/property validation;
- rate/room validation;
- invalid journey;
- invalid property;
- invalid room;
- invalid rate;
- unavailable/stale selection;
- occupancy preservation;
- child-age preservation;
- stay-date preservation;
- no final package pricing.

### View Model / Provider

- stop mapping;
- property mapping;
- room mapping;
- rate mapping;
- selection state;
- occupancy;
- availability state;
- missing imagery;
- infrastructure isolation.

### HTTP / Controller

- GET selection page;
- valid POST;
- invalid POST;
- unavailable POST;
- incomplete multi-stop journey;
- successful complete selection;
- correct continuation toward IMP-006.

### Regression

Verify existing:

- homepage;
- discovery;
- Journey Detail;
- Journey Selection;
- IMP-003.1;
- IMP-003.2;
- IMP-004

behaviour remains intact.

---

# 27. LINT BASELINE

The current frontend baseline is:

**0 errors / 10 confirmed pre-existing warnings**

IMP-005 must not increase this count.

Any new warning introduced by IMP-005 must be fixed before completion.

Do not weaken lint rules or suppress warnings merely to achieve compliance.

---

# 28. VERIFICATION

Run from the repository root:

`npm run type-check`

`npm test -- --runInBand`

`npx prisma validate`

`npm run lint`

`npm run build`

Also run the focused IMP-005 test suite explicitly.

The implementation report must state the exact command and result for each.

The final lint result must explicitly identify:

- errors;
- total warnings;
- warnings introduced by IMP-005;
- remaining pre-existing warnings.

Acceptance requires:

**0 lint errors and 0 new IMP-005 warnings.**

---

# 29. ACCEPTANCE CRITERIA

## AC-01

Customer can enter accommodation selection from the selected journey.

## AC-02

The selected journey remains correctly associated with accommodation selection.

## AC-03

Single-stop and multi-stop journeys are supported.

## AC-04

Each accommodation selection remains associated with the correct journey stop.

## AC-05

Property selection works against valid pre-selected accommodation options.

## AC-06

Room selection works against the selected property.

## AC-07

Rate selection works against the selected room.

## AC-08

Occupancy and child ages are preserved where supported.

## AC-09

Stay dates are preserved where supported.

## AC-10

All submitted selections are validated server-side.

## AC-11

Stale/unavailable selections are handled without silent substitution.

## AC-12

Customer cannot continue until all required accommodation stops are complete.

## AC-13

Completed selection contains the information required by the subsequent pricing capability.

## AC-14

No final GCT package price is calculated or guaranteed.

## AC-15

No booking or reservation is created.

## AC-16

No direct Hotelbeds access exists in frontend/presentation code.

## AC-17

Responsive and accessibility requirements are satisfied.

## AC-18

Existing IMP-003.1, IMP-003.2 and IMP-004 behaviour remains intact.

## AC-19

Focused IMP-005 tests pass.

## AC-20

Full regression passes.

## AC-21

Type-check, Prisma validation and build pass.

## AC-22

Lint has 0 errors and no new warnings.

## AC-23

No AI functionality is introduced.

---

# 30. IMPLEMENTATION CONSTRAINTS

Copilot MUST NOT:

- introduce AI;
- introduce AI recommendations;
- introduce AI ranking;
- introduce AI itinerary generation;
- introduce unrestricted hotel search;
- call Hotelbeds directly from frontend code;
- introduce a new Journey persistence model;
- calculate final package pricing;
- implement booking;
- implement reservation;
- implement payment;
- implement guest details;
- implement checkout;
- introduce a new search architecture;
- introduce bulk content/image ingestion;
- weaken lint rules;
- suppress new warnings;
- modify `GOV-DEV-001`;
- modify historical IMP specifications;
- overwrite IMP-003.1, IMP-003.2 or IMP-004;
- perform unrelated refactoring;
- create a Git commit.

Any requirement outside this specification must be reported as a deviation.

---

# 31. IMPLEMENTATION GUIDANCE

Before modifying code, inspect the committed implementations of:

- IMP-003.1 dynamic journey resolution;
- IMP-003.2 Journey Detail;
- IMP-004 Journey Selection;
- existing accommodation availability/application services;
- existing accommodation selection contracts;
- existing Hotelbeds integration boundary;
- existing frontend route/controller patterns;
- existing View Model/provider patterns.

Prefer extending existing approved contracts over creating parallel abstractions.

If an existing backend/application capability does not expose information required by this specification, identify the precise dependency gap rather than redesigning unrelated backend architecture.

---

# 32. IMPLEMENTATION REPORT

After implementation provide:

## Files Created

Complete list.

## Files Modified

Complete list.

## Application Changes

Describe the accommodation selection contract and validation.

## Frontend Changes

Describe:

- routes;
- controller;
- View Model;
- provider;
- EJS;
- components/CSS.

## Tests

List focused and regression tests.

## Verification

Report exact commands and results for:

- type-check;
- focused tests;
- full regression;
- Prisma validation;
- lint;
- build.

## Lint Baseline

Report:

- initial warning count;
- final warning count;
- new warnings;
- remaining pre-existing warnings.

## Deviations

If none:

`No deviations.`

## Outstanding Issues

If none:

`No outstanding issues.`

## Commit

State:

`No commit created.`

---

# 33. COMPLETION DEFINITION

IMP-005 is complete when:

**Journey Selected**

→ **Accommodation Selection**

→ **All required Stops Complete**

→ **Ready for Pricing**

and all acceptance criteria pass.

The implementation must remain deterministic and MVP-focused.

AI remains explicitly deferred until MVP is complete.