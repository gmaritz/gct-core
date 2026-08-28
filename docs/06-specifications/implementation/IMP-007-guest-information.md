# GCT CORE — IMP-007 GUEST INFORMATION

## 1. DOCUMENT CONTROL

| Property | Value |
|---|---|
| Specification | IMP-007 |
| Title | Guest Information |
| Capability | Frontend & UI |
| Version | 1.0 |
| Predecessors | IMP-003.1, IMP-003.2, IMP-004, IMP-005, IMP-006 |
| Next Capability | IMP-008 |
| Governing Process | `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md` |

Follow `GOV-DEV-001-DEVELOPMENT-PROCESS.md`.

Workflow:

**Specification → Copilot Implementation → Tests/Regression → Copilot Report → Architect Acceptance → User Commit**

Copilot must not commit.

---

# 2. PURPOSE

Implement the next MVP customer journey stage:

**Quote → Guest Information → Reservation Review**

IMP-007 captures and validates the guest/traveller information required for the current journey and prepares it for the subsequent Reservation Review capability.

IMP-007 does not create the Reservation.

---

# 3. MVP BOUNDARY

The implementation is deterministic.

Do not introduce:

- AI;
- AI recommendations;
- AI personalization;
- AI-generated content;
- booking;
- reservation creation;
- payment;
- checkout.

AI remains deferred until after MVP.

---

# 4. ARCHITECTURAL MODEL

Use the existing distinction between:

**Customer**

→ owns customer contact information

**Traveller**

→ customer-owned traveller/master information

**Reservation Traveller Snapshot**

→ historical traveller information associated with a reservation

IMP-007 must not collapse these concepts into a new generic Guest entity.

The eventual reservation must be able to preserve a historical traveller snapshot independently of later changes to Traveller master data.

IMP-007 prepares the information required for that future handoff.

---

# 5. EXISTING IMPLEMENTATION TO REUSE

Before implementation inspect and reuse:

- IMP-003.1 journey resolver;
- IMP-003.2 journey detail;
- IMP-004 journey selection;
- IMP-005 accommodation selection;
- IMP-006 quote/pricing;
- existing Customer application contracts;
- existing Traveller application/domain contracts;
- existing Reservation/Traveller Snapshot contracts;
- existing frontend route/controller patterns;
- existing View Model/provider patterns;
- existing validation and security conventions.

Do not create parallel Customer, Traveller or Reservation models.

---

# 6. SCOPE

Implement:

1. guest-information route;
2. guest-information application contract where required;
3. Guest Information View Model;
4. Guest Information View Model Provider;
5. lead/contact information;
6. traveller information;
7. occupancy-aligned traveller requirements;
8. field validation;
9. controlled validation errors;
10. preservation of entered information;
11. continuation to IMP-008;
12. responsive/accessibility presentation;
13. focused tests;
14. regression verification.

Do not implement Reservation persistence.

---

# 7. CUSTOMER / CONTACT INFORMATION

The Guest Information experience shall capture the contact information required for the current customer journey.

Use the existing Customer/application contract.

Where the existing model identifies Customer as the owner of authoritative contact email, do not introduce email ownership into Traveller.

The exact required contact fields must follow the existing application/domain contract.

Do not invent additional customer fields merely for UI completeness.

---

# 8. TRAVELLER INFORMATION

The implementation shall capture the traveller information required for the current journey using the existing Traveller model/contract.

Where supported by the existing contract, this includes information such as:

- title;
- first name;
- last name;
- date of birth;
- nationality;
- passport/travel-document information.

Only fields required by the existing application/reservation model should be made mandatory.

Do not introduce fields that have no downstream purpose.

---

# 9. LEAD TRAVELLER

The UI must clearly identify the lead traveller/contact where the existing application model requires one.

The lead traveller must be distinguishable from additional travellers.

Do not assume that Customer and Traveller are always the same person.

Where the existing architecture permits a customer to act as booking contact while another person is the lead traveller, preserve that distinction.

---

# 10. MULTIPLE TRAVELLERS

The implementation must support the number of travellers implied by the selected journey/accommodation occupancy.

Traveller collection size must align with the authoritative occupancy established by IMP-005.

For example:

- 2 adults → 2 adult traveller records;
- 2 adults + 1 child → 3 traveller records;
- additional rooms must not cause travellers to be incorrectly duplicated.

Do not independently recalculate occupancy.

---

# 11. CHILD TRAVELLERS

Where children are present, preserve the child ages established by the accommodation/journey selection.

If date of birth is collected, validate it consistently with the authoritative child-age requirement.

Do not silently alter previously selected child ages.

If a submitted traveller's age conflicts with the selected accommodation occupancy, return a controlled validation error.

---

# 12. OCCUPANCY CONSISTENCY

Guest Information must remain consistent with IMP-005.

The application must validate that:

- required adult travellers exist;
- required child travellers exist;
- traveller counts correspond to the selected occupancy;
- child information remains compatible with the selected accommodation.

The client must not be authoritative for occupancy.

---

# 13. APPLICATION CONTRACT

Create or extend an application-level guest-information contract according to existing architecture.

Conceptually:

`captureGuestInformation(journeyId, guestInformation)`

The exact name and location must follow repository conventions.

The application boundary shall:

1. validate the selected journey;
2. validate the selected accommodation context;
3. validate customer/contact information;
4. validate traveller information;
5. validate traveller count against occupancy;
6. validate required child information;
7. return a provider-neutral result;
8. preserve information required by IMP-008.

Do not put domain validation in EJS or browser JavaScript.

---

# 14. VALIDATION

Validate at the application boundary:

- required fields;
- field formats;
- traveller count;
- traveller role;
- child/adult consistency;
- date-of-birth validity where applicable;
- nationality/travel-document values where required;
- journey association.

Do not trust client-submitted:

- journey identity;
- occupancy;
- traveller count;
- traveller role;
- pricing;
- accommodation selection.

Re-resolve authoritative journey/selection information.

---

# 15. PERSISTENCE BOUNDARY

IMP-007 must not introduce a new Guest or Traveller persistence architecture.

If an existing application service supports customer/traveller persistence and that capability is already approved for this workflow, reuse it.

If the existing architecture does not support persistence required by the current stage:

- do not invent a replacement;
- do not modify the canonical Traveller/Reservation architecture;
- report the exact dependency gap.

The Reservation Traveller Snapshot remains owned by the future Reservation process.

---

# 16. DATA HANDOFF

The completed Guest Information state must be sufficient for IMP-008 to construct the Reservation Review.

Preserve:

- customer/contact information required by the reservation;
- lead traveller;
- additional travellers;
- traveller roles;
- date of birth where required;
- nationality where required;
- travel-document information where required;
- occupancy association;
- selected journey identity;
- selected accommodation context.

Do not create the Reservation in IMP-007.

---

# 17. ROUTING

Use the existing `/ui` namespace.

Preferred route:

`/ui/journeys/:journeyId/guest-information`

Use an existing equivalent route if repository conventions already provide one.

Use:

- `GET` to render the Guest Information page;
- `POST` for submitting guest information.

Do not use GET for state-changing submission.

---

# 18. CONTROLLER

The controller shall:

1. receive the journey identity;
2. resolve the selected journey/quote context;
3. render Guest Information;
4. accept the POST submission;
5. delegate validation to the application layer;
6. render validation errors or continue to IMP-008.

The controller must not:

- access Prisma directly;
- access repositories directly;
- implement domain validation;
- calculate pricing;
- create a Reservation.

---

# 19. VIEW MODEL

Create or extend a dedicated Guest Information View Model.

It should contain:

- journey summary;
- required traveller count;
- traveller forms/data;
- lead traveller state;
- contact information;
- validation messages;
- completion state;
- continuation state.

Do not expose infrastructure objects.

Previously entered valid information should be redisplayed after validation failure.

---

# 20. VIEW MODEL PROVIDER

The provider shall:

- map application guest/traveller data;
- format customer-facing values;
- map validation errors;
- preserve traveller order;
- expose only presentation-safe data.

It must not:

- perform business validation;
- calculate occupancy;
- access Prisma;
- access repositories;
- call Hotelbeds.

---

# 21. FORM DESIGN

The page should group information logically:

### Booking Contact

Customer/contact information required for the reservation.

### Lead Traveller

Primary traveller information.

### Additional Travellers

Remaining traveller information required by occupancy.

The UI should clearly indicate required fields.

Do not overwhelm the customer with fields that are not required by the existing contract.

---

# 22. VALIDATION UX

Validation failures must:

- identify the affected field;
- provide understandable feedback;
- preserve valid entered information;
- avoid exposing internal errors;
- allow correction without restarting the journey.

Server-side validation is authoritative.

Client-side validation may improve UX but must not replace server-side validation.

---

# 23. PRIVACY / SECURITY

Guest Information contains personal data.

The implementation must:

- transmit it only through existing secure application routes;
- avoid logging sensitive values;
- avoid exposing submitted data in URLs;
- avoid placing personal data into query strings;
- use existing CSRF/security conventions;
- avoid exposing internal identifiers.

Do not add unnecessary analytics or browser storage containing personal information.

---

# 24. TRAVEL DOCUMENT DATA

If passport/travel-document fields are required by the existing Traveller contract:

- collect only required information;
- use appropriate field types;
- avoid displaying sensitive values unnecessarily;
- preserve secure server-side handling.

Do not invent additional passport fields.

Do not persist document information outside the approved Traveller/Reservation architecture.

---

# 25. ERROR STATES

Handle:

### Invalid Journey

The journey cannot be resolved.

### Invalid Occupancy

Traveller information does not match selected occupancy.

### Invalid Traveller

Traveller information fails application validation.

### Missing Required Information

Required information is incomplete.

### Persistence/Application Failure

Use existing controlled frontend error handling.

Do not expose internal exceptions.

---

# 26. CONTINUATION

Successful completion proceeds to:

**IMP-008 — Reservation Review**

The transition must preserve the validated guest-information state.

IMP-007 must not:

- create a reservation;
- confirm a booking;
- charge the customer;
- collect payment.

---

# 27. PRICING BOUNDARY

Guest Information must preserve the quote/pricing context from IMP-006.

It must not:

- recalculate pricing;
- alter accommodation pricing;
- alter journey pricing;
- apply discounts;
- modify the quote total.

Any pricing changes required by later reservation processing belong to the appropriate subsequent capability.

---

# 28. RESPONSIVE / ACCESSIBLE UI

The Guest Information page must work on:

- mobile;
- tablet;
- desktop.

Use existing GCT Core design tokens and form components.

Ensure:

- semantic labels;
- keyboard accessibility;
- visible focus states;
- accessible validation messages;
- logical field ordering;
- appropriate autocomplete/input semantics where supported.

---

# 29. TESTING

Create focused tests covering:

## Application

- valid guest information;
- valid lead traveller;
- multiple travellers;
- occupancy/traveller-count validation;
- child-age consistency;
- required-field validation;
- invalid journey;
- invalid traveller information;
- preservation of submitted information;
- no Reservation creation.

## View Model / Provider

- customer/contact mapping;
- lead traveller mapping;
- additional traveller mapping;
- traveller order;
- validation errors;
- completion state;
- no infrastructure leakage.

## HTTP / Controller

- GET renders Guest Information;
- valid POST continues to IMP-008;
- invalid POST redisplays form;
- validation errors are shown;
- submitted valid values are preserved;
- invalid journey is handled.

## Regression

Verify homepage, discovery, Journey Detail, Journey Selection, Accommodation Selection and Quote behaviour remains intact.

---

# 30. LINT BASELINE

Current frontend baseline:

**0 errors / 10 confirmed pre-existing warnings**

IMP-007 must introduce:

**0 new warnings**

Any warning introduced by IMP-007 must be fixed before completion.

Do not weaken lint rules or suppress warnings.

---

# 31. VERIFICATION

From the repository root run:

`npm run type-check`

`npm test -- --runInBand`

`npx prisma validate`

`npm run lint`

`npm run build`

Also run the focused IMP-007 tests explicitly.

The report must state the exact command and result for each.

---

# 32. ACCEPTANCE CRITERIA

- [ ] Guest Information is reachable from the completed quote.
- [ ] Existing Customer/Traveller architecture is reused.
- [ ] Customer/contact information is captured according to the existing contract.
- [ ] Lead traveller is supported.
- [ ] Multiple travellers are supported.
- [ ] Traveller count aligns with authoritative occupancy.
- [ ] Child information remains consistent with selected occupancy.
- [ ] Required fields are validated server-side.
- [ ] Invalid traveller data is handled safely.
- [ ] Submitted values are preserved after validation failure.
- [ ] Personal data is not exposed through URLs or unnecessary logging.
- [ ] No new Guest/Traveller persistence architecture is introduced.
- [ ] Reservation Traveller Snapshot is not created prematurely.
- [ ] Quote/pricing information is not recalculated.
- [ ] Successful completion continues to IMP-008.
- [ ] No booking/reservation/payment is implemented.
- [ ] Responsive/accessibility requirements are satisfied.
- [ ] Existing IMP-003.1 through IMP-006 behaviour remains intact.
- [ ] Focused tests pass.
- [ ] Full regression passes.
- [ ] Type-check passes.
- [ ] Prisma validation passes.
- [ ] Build passes.
- [ ] Lint has 0 errors and no new warnings.
- [ ] No AI functionality is introduced.

---

# 33. EXPLICIT NON-SCOPE

Copilot must not introduce:

- AI;
- AI recommendations;
- AI personalization;
- AI-generated content;
- Reservation creation;
- booking;
- payment;
- checkout;
- guest account functionality;
- new Traveller persistence architecture;
- new Reservation persistence architecture;
- direct Hotelbeds access;
- pricing logic in the frontend;
- unrelated refactoring;
- lint-rule weakening;
- warning suppression;
- modifications to `GOV-DEV-001`;
- modifications to historical IMP specifications;
- Git commit.

Any requirement outside this specification must be reported as a deviation.

---

# 34. IMPLEMENTATION GUIDANCE

Before modifying code, inspect:

- committed IMP-003.1 through IMP-006 implementations;
- canonical Customer/Traveller models;
- existing Traveller application services;
- existing Reservation contracts;
- Reservation Traveller Snapshot model;
- existing validation conventions;
- existing secure form handling;
- existing frontend route/controller/View Model patterns.

Reuse existing contracts.

If an application-level contract is missing, identify the exact gap rather than creating a parallel domain model.

---

# 35. IMPLEMENTATION REPORT

After implementation provide:

### Files Created
Complete list.

### Files Modified
Complete list.

### Application Changes
Guest-information contract, validation and state handling.

### Frontend Changes
Routes, controller, View Model/provider, EJS and styling.

### Tests
Focused tests and regression results.

### Verification
Exact commands and results.

### Lint Baseline
Initial warnings, final warnings, new warnings and remaining pre-existing warnings.

### Deviations
`No deviations.` if none.

### Outstanding Issues
`No outstanding issues.` if none.

### Commit
`No commit created.`

---

# 36. COMPLETION BOUNDARY

IMP-007 establishes:

**Quote**

→ **Guest Information**

→ **Validated Reservation-Ready Guest Data**

→ **IMP-008 Reservation Review**

It does not create the Reservation.

It does not collect payment.

It does not confirm a booking.

The implementation remains deterministic and MVP-focused.

**AI remains explicitly deferred until MVP completion.**