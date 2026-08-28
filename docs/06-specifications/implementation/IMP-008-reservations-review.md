# GCT CORE — IMP-008 RESERVATION REVIEW

## 1. DOCUMENT CONTROL

| Property          | Value                                                    |
| ----------------- | -------------------------------------------------------- |
| Specification     | IMP-008                                                  |
| Title             | Reservation Review                                       |
| Capability        | Frontend & UI                                            |
| Version           | 1.0                                                      |
| Predecessors      | IMP-003.1, IMP-003.2, IMP-004, IMP-005, IMP-006, IMP-007 |
| Next Capability   | IMP-009                                                  |
| Governing Process | `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`  |

Follow `GOV-DEV-001-DEVELOPMENT-PROCESS.md`.

Workflow:

**Specification → Copilot Implementation → Tests/Regression → Copilot Report → Architect Acceptance → User Commit**

Copilot must not commit.

---

# 2. PURPOSE

Implement the next MVP customer journey stage:

**Quote → Guest Information → Reservation Review → Payment**

IMP-008 provides the customer with a complete review of the proposed reservation before proceeding to payment.

The review must combine:

* selected journey;
* selected accommodation;
* authoritative quote;
* guest/traveller information.

The customer must explicitly confirm the reviewed information before proceeding.

---

# 3. ARCHITECTURAL BOUNDARY

The canonical architecture defines:

**Booking = commercial transaction**

**Reservation = canonical GCT Aggregate Root**

**Supplier Booking = external fulfilment**

Do not reinterpret these concepts in the frontend.

IMP-008 is a customer-facing review/confirmation boundary.

It must not create a competing Reservation model or bypass the existing Reservation application capability.

---

# 4. MVP SCOPE

Implement:

* reservation review route;
* application-level review/confirmation contract where required;
* complete review View Model/provider;
* journey summary;
* accommodation summary;
* pricing summary;
* guest/traveller summary;
* validation/revalidation before commitment;
* explicit customer confirmation;
* transition toward IMP-009 Payment.

Do not implement:

* payment;
* payment provider calls;
* booking;
* supplier booking;
* voucher/document generation;
* AI;
* new Reservation persistence architecture.

---

# 5. REVIEW INPUT

The review must use the completed state from:

**IMP-005 Accommodation Selection**

**IMP-006 Quote**

**IMP-007 Guest Information**

The application must re-resolve authoritative state before allowing the customer to confirm.

Do not trust browser-submitted:

* price;
* accommodation;
* rate;
* occupancy;
* traveller count;
* traveller identity;
* journey data.

---

# 6. REVIEW CONTENT

The page must present, where applicable:

### Journey

* journey/tour name;
* destinations;
* duration;
* relevant itinerary summary.

### Accommodation

For each stop:

* destination;
* property;
* room;
* rate/board basis;
* dates;
* nights;
* occupancy.

### Guest Information

* booking contact;
* lead traveller;
* additional travellers;
* relevant traveller information.

### Price

* journey/tour component;
* accommodation component;
* applicable extras;
* taxes/fees where authoritative;
* total;
* currency;
* per-person price where authoritative.

The review must reflect the authoritative application state.

---

# 7. RESERVATION-READY STATE

Before confirmation, validate that the customer has completed:

* journey selection;
* required accommodation selection;
* authoritative pricing;
* required guest/traveller information.

If any prerequisite is incomplete or stale, do not allow confirmation.

Provide recovery to the relevant preceding stage.

---

# 8. REVALIDATION

Before accepting the customer's final review confirmation:

1. re-resolve the selected journey;
2. revalidate required accommodation selections;
3. revalidate pricing where required;
4. validate guest/traveller information;
5. confirm that the review still represents the authoritative current state.

If anything has changed:

* do not confirm the review;
* explain what requires attention;
* return the customer to the appropriate stage.

Do not silently replace customer selections.

---

# 9. APPLICATION CONTRACT

Create or extend an application-level reservation-review/confirmation contract following existing conventions.

Conceptually:

`confirmReservationReview(selection, guestInformation)`

The exact contract name and location must follow the existing application architecture.

The contract shall:

1. validate the journey;
2. validate accommodation selection;
3. validate pricing state;
4. validate guest information;
5. establish that the customer has explicitly confirmed the reviewed information;
6. return a provider-neutral result suitable for the next payment stage.

Do not put business validation in the controller or EJS.

---

# 10. RESERVATION CREATION BOUNDARY

IMP-008 must not invent a new Reservation creation mechanism.

Inspect the existing approved Reservation application capability.

If that capability requires a reservation request before payment, use the existing contract.

If the existing application architecture establishes Reservation creation as a later step, preserve that boundary.

The implementation must not create duplicate Reservation persistence, repositories or aggregates.

If the existing application contract is insufficient to support the review-to-payment handoff, report the precise dependency gap rather than inventing one.

---

# 11. RESERVATION LIFECYCLE

The canonical Reservation lifecycle is:

* `CREATED`
* `QUOTED`
* `CONFIRMED`
* `AMENDED`
* `CANCELLED`
* `COMPLETED`

IMP-008 must not incorrectly map a frontend review state onto supplier booking status.

Do not represent:

`Review Confirmed = Supplier Booking Confirmed`

They are separate concepts.

---

# 12. SNAPSHOT BOUNDARY

The canonical Reservation architecture requires historical snapshots for:

* travellers;
* journey;
* accommodation;
* pricing;
* payment.

IMP-008 must prepare the information required by the existing Reservation capability.

It must not redesign snapshot persistence.

Traveller master data must remain distinct from the eventual Reservation Traveller Snapshot.

---

# 13. CUSTOMER IDENTITY

Customer identity must come from the existing Customer/application context.

Do not infer Customer identity from:

* traveller email;
* traveller name;
* booking contact;
* supplier data.

The canonical Reservation physical model explicitly requires an explicit Customer relationship.

---

# 14. REVIEW VIEW MODEL

Create or extend a dedicated Reservation Review View Model.

It should contain:

* journey summary;
* accommodation summaries;
* guest/traveller summaries;
* price breakdown;
* total/currency;
* validation/revalidation state;
* customer confirmation state;
* next-action state.

The View Model must contain presentation-safe data only.

Do not expose:

* Prisma objects;
* repositories;
* supplier response objects;
* infrastructure exceptions;
* internal persistence structures.

---

# 15. VIEW MODEL PROVIDER

The provider shall:

* map authoritative application data;
* preserve ordering;
* format customer-facing monetary values;
* map validation/revalidation states;
* format traveller and accommodation summaries.

It must not:

* calculate authoritative pricing;
* access Prisma;
* access repositories;
* call suppliers;
* implement business rules.

---

# 16. ROUTING

Use the existing `/ui` namespace.

Preferred route:

`/ui/journeys/:journeyId/review`

Use an existing equivalent route if already established.

Use:

* `GET` to display the review;
* `POST` for explicit review confirmation.

Do not use GET for a state-changing confirmation.

---

# 17. CONTROLLER

The controller shall:

1. resolve the selected journey;
2. obtain the authoritative quote;
3. obtain validated guest-information context;
4. construct the review View Model;
5. accept explicit confirmation;
6. delegate confirmation to the application layer;
7. render validation/revalidation failures;
8. continue to IMP-009 when the review is successfully confirmed.

The controller must not:

* calculate prices;
* create Prisma records;
* call Hotelbeds;
* call PayFast;
* create supplier bookings;
* implement Reservation persistence.

---

# 18. CUSTOMER CONFIRMATION

The customer must explicitly confirm that the displayed information is correct.

The confirmation action should be unambiguous, for example:

**Confirm and Continue to Payment**

Do not label the action:

* Book Now;
* Pay Now;
* Reservation Confirmed.

Those meanings belong to later capabilities.

---

# 19. REVIEW STATUS

Support explicit review states as required by the application contract.

At minimum handle:

* `READY`;
* `RECHECK_REQUIRED`;
* `INVALID`;
* `UNAVAILABLE`.

Equivalent existing terminology may be reused.

A failed review must never appear successful.

---

# 20. RECHECK STATE

If the quote, accommodation or other required information changes:

* invalidate the current review;
* explain the affected information;
* provide a recovery path;
* preserve unaffected customer-entered information where possible.

Do not present stale prices or availability as confirmed.

---

# 21. GUEST DATA REVIEW

The review should show sufficient information for the customer to identify mistakes before payment.

Display only information appropriate to the current customer-facing workflow.

Sensitive travel-document information should not be displayed unnecessarily.

Do not expose sensitive information in:

* URLs;
* query strings;
* browser storage;
* debug output.

---

# 22. PRICE REVIEW

The review must use the authoritative quote from IMP-006.

Do not independently recalculate:

* accommodation price;
* journey price;
* discounts;
* taxes;
* fees;
* total;
* per-person amount.

If the authoritative quote is no longer valid, require revalidation before confirmation.

---

# 23. ACCOMMODATION REVIEW

For each accommodation stop display enough information to verify the selection:

* destination;
* property;
* room;
* rate/board;
* dates;
* nights;
* occupancy.

For multi-stop journeys, preserve the correct stop order.

Do not flatten multiple accommodation stops into one summary if doing so could obscure the selection.

---

# 24. TRAVELLER REVIEW

Display:

* lead traveller;
* additional travellers;
* relevant traveller details;
* adult/child distinction where applicable.

The displayed traveller count must correspond to the authoritative occupancy.

Do not alter traveller information from the review page.

Corrections should return the customer to IMP-007.

---

# 25. EDIT / RECOVERY

Where practical, provide clear links/actions to return to:

* accommodation selection;
* guest information.

Returning to a previous stage must preserve the existing journey context where supported.

Do not create duplicate selection state.

---

# 26. PAYMENT HANDOFF

Successful review confirmation establishes the handoff to:

**IMP-009 Payment Experience**

The review must provide IMP-009 with the validated context required by the existing payment/reservation architecture.

IMP-008 must not:

* initiate PayFast;
* redirect to PayFast;
* create a payment;
* display payment success;
* capture card/payment details.

---

# 27. PERSISTENCE

Do not introduce new review persistence merely to support the page.

Use the existing application state/contracts.

If a durable Reservation is already required by the approved application flow before payment, use the existing Reservation capability rather than creating a frontend-specific persistence model.

---

# 28. SECURITY

All submitted identifiers and review confirmation data are untrusted.

The server must re-resolve authoritative state.

Do not trust client-submitted:

* journey;
* accommodation;
* rate;
* traveller count;
* price;
* total;
* currency;
* confirmation state.

Use existing CSRF/security conventions.

---

# 29. RESPONSIVE / ACCESSIBLE UI

The review must work on:

* mobile;
* tablet;
* desktop.

Use existing GCT Core design tokens and components.

Ensure:

* logical section headings;
* semantic content structure;
* accessible status/error messages;
* keyboard-accessible actions;
* visible focus states;
* clear confirmation action.

The customer must be able to understand the total and selected components without relying on colour alone.

---

# 30. TESTING

Create focused tests covering:

## Application

* complete valid review;
* journey validation;
* accommodation validation;
* quote validation;
* guest-information validation;
* stale pricing;
* stale accommodation;
* invalid journey;
* invalid guest data;
* successful explicit confirmation;
* correct handoff result;
* no duplicate Reservation architecture.

## View Model / Provider

* journey mapping;
* multi-stop accommodation mapping;
* traveller mapping;
* price mapping;
* currency;
* total;
* status;
* validation/recheck messages;
* infrastructure isolation.

## HTTP / Controller

* GET review;
* valid POST confirmation;
* invalid POST;
* recheck response;
* unavailable response;
* recovery to previous stages;
* successful continuation to IMP-009.

## Presentation

Verify:

* complete journey is understandable;
* accommodation selections are clear;
* traveller information is clear;
* total price is prominent;
* confirmation action is unambiguous;
* stale information is clearly identified;
* no payment-success or booking-confirmation claim is displayed.

## Regression

Verify homepage, discovery, Journey Detail, Journey Selection, Accommodation Selection, Quote and Guest Information remain intact.

---

# 31. LINT BASELINE

Current frontend baseline:

**0 errors / 10 confirmed pre-existing warnings**

IMP-008 must introduce:

**0 new warnings**

Do not weaken lint rules or suppress warnings.

---

# 32. ACCEPTANCE CRITERIA

* [ ] Customer can reach Reservation Review from completed Guest Information.
* [ ] Review contains the selected journey.
* [ ] Review contains all required accommodation selections.
* [ ] Multi-stop accommodation remains correctly ordered.
* [ ] Review contains guest/traveller information.
* [ ] Review contains the authoritative quote.
* [ ] Total and currency are authoritative.
* [ ] Review revalidates required state before confirmation.
* [ ] Stale/unavailable state is handled safely.
* [ ] Customer must explicitly confirm the review.
* [ ] Invalid submissions cannot confirm the review.
* [ ] No client-supplied commercial value is trusted.
* [ ] Existing Customer/Traveller/Reservation architecture is preserved.
* [ ] No duplicate Reservation model/repository is introduced.
* [ ] No supplier booking is created.
* [ ] No payment is initiated.
* [ ] No PayFast call is introduced.
* [ ] Customer can recover to accommodation or guest information.
* [ ] Successful confirmation hands off to IMP-009.
* [ ] Responsive/accessibility requirements are satisfied.
* [ ] Existing IMP-003.1 through IMP-007 behaviour remains intact.
* [ ] Focused tests pass.
* [ ] Full regression passes.
* [ ] Type-check passes.
* [ ] Prisma validation passes.
* [ ] Build passes.
* [ ] Lint has 0 errors and no new warnings.
* [ ] No AI functionality is introduced.

---

# 33. EXPLICIT NON-SCOPE

Copilot must not introduce:

* AI;
* AI recommendations;
* AI personalization;
* booking;
* supplier booking;
* payment;
* PayFast integration;
* checkout;
* guest account functionality;
* new Reservation persistence architecture;
* new Traveller persistence architecture;
* direct Hotelbeds access;
* pricing logic in the frontend;
* document/voucher generation;
* unrelated refactoring;
* lint-rule weakening;
* warning suppression;
* modifications to `GOV-DEV-001`;
* modifications to historical IMP specifications;
* Git commit.

Any requirement outside this specification must be reported as a deviation.

---

# 34. IMPLEMENTATION GUIDANCE

Before modifying code, inspect:

* committed IMP-003.1 through IMP-007 implementations;
* existing Reservation application contracts;
* Reservation Aggregate;
* Reservation creation/orchestration service;
* existing Booking/Reservation boundary;
* Traveller Snapshot contract;
* Journey Snapshot contract;
* Accommodation Snapshot contract;
* Pricing Snapshot contract;
* existing payment handoff;
* existing frontend route/controller/View Model conventions.

Reuse existing contracts.

If the review-to-payment boundary exposes a genuine application dependency gap, report it explicitly rather than inventing a new architecture.

---

# 35. VERIFICATION

From the repository root run:

`npm run type-check`

`npm test -- --runInBand`

`npx prisma validate`

`npm run lint`

`npm run build`

Also run the focused IMP-008 tests explicitly.

The implementation report must provide exact commands and results.

The lint report must explicitly state:

* initial warning count;
* final warning count;
* warnings introduced by IMP-008;
* remaining pre-existing warnings.

---

# 36. IMPLEMENTATION REPORT

After implementation provide:

### Files Created

Complete list.

### Files Modified

Complete list.

### Application Changes

Review/confirmation contract and validation.

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

# 37. COMPLETION BOUNDARY

IMP-008 establishes:

**Quote**

→ **Guest Information**

→ **Reservation Review**

→ **Explicit Customer Confirmation**

→ **IMP-009 Payment**

IMP-008 does not process payment, create supplier bookings or confirm fulfilment.

The implementation remains deterministic and MVP-focused.

**AI remains explicitly deferred until MVP completion.**
