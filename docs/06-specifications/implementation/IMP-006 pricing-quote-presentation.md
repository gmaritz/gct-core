# GCT CORE — IMP-006 PRICING & QUOTE PRESENTATION

## 1. DOCUMENT CONTROL

| Property | Value |
|---|---|
| Specification | IMP-006 |
| Title | Pricing & Quote Presentation |
| Capability | Frontend & UI |
| Version | 1.0 |
| Predecessors | IMP-003.1, IMP-003.2, IMP-004, IMP-005 |
| Next Capability | IMP-007 |
| Governing Process | `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md` |

This specification follows the development process defined in `GOV-DEV-001-DEVELOPMENT-PROCESS.md`.

Copilot implements, tests and reports. Copilot must not commit.

---

## 2. PURPOSE

Implement the next MVP customer journey stage:

**Discover → Understand → Select Journey → Select Accommodation → Review Price**

IMP-006 converts the completed deterministic accommodation selection from IMP-005 into an authoritative customer-facing price/quote.

The capability ends at **Quote Presented**.

It does not implement booking, payment or checkout.

---

## 3. MVP BOUNDARY

The pricing model is deterministic.

Use existing GCT Core application/domain pricing rules and authoritative accommodation pricing.

Do not introduce:

- AI;
- AI pricing;
- AI recommendations;
- AI personalization;
- AI package construction;
- a new independent pricing engine.

AI remains deferred until after MVP.

---

## 4. EXISTING IMPLEMENTATION TO BUILD ON

Before implementation inspect and reuse:

- IMP-003.1 dynamic journey resolver;
- IMP-003.2 Journey Detail;
- IMP-004 journey selection;
- IMP-005 accommodation selection;
- existing accommodation availability/revalidation services;
- existing pricing/commercial application services;
- existing frontend route/controller patterns;
- existing View Model/provider patterns.

Do not create parallel implementations where an existing application capability can be reused.

If the required application pricing capability does not exist, identify the precise dependency gap rather than moving pricing logic into the frontend.

---

## 5. PRICING INPUT

The pricing operation receives the completed selection established by IMP-005.

The authoritative selection must preserve, where applicable:

- journey identity;
- journey/stops;
- selected property per accommodation stop;
- selected room;
- selected rate;
- occupancy;
- child ages;
- stay dates;
- required supplier/application references.

The frontend must never submit a price and have that price treated as authoritative.

---

## 6. APPLICATION PRICING CONTRACT

Create or extend an application-level pricing contract according to existing architecture.

Conceptually:

`priceJourney(selection)`

The exact name and location must follow repository conventions.

The application capability shall:

1. validate the selected journey;
2. validate the accommodation selection;
3. revalidate required commercial data;
4. obtain authoritative current accommodation pricing;
5. apply existing deterministic GCT pricing rules;
6. return a provider-neutral pricing result.

Pricing rules must remain outside controllers and presentation providers.

---

## 7. REVALIDATION

Accommodation availability/rates may change between IMP-005 and IMP-006.

Use the existing application-level revalidation/CheckRate capability where required.

The frontend must not call Hotelbeds directly.

If a selected rate is no longer available, return a controlled:

`RECHECK_REQUIRED`

or the equivalent existing application state.

Do not present stale pricing as final.

Do not silently substitute another rate or property.

---

## 8. PRICE RESULT

The application pricing result should provide, where supported by the existing architecture:

- journey identifier;
- currency;
- journey/tour component;
- accommodation component;
- optional extras where already supported;
- applicable discounts where already supported;
- applicable taxes/fees where already supported;
- GCT commercial components where customer-facing;
- total;
- per-person price where authoritative;
- pricing/revalidation status.

Do not invent price components that do not exist in the application result.

Do not expose confidential supplier margins or internal commercial information.

---

## 9. PRICE CALCULATION RULE

The frontend must not independently calculate the authoritative total.

The following must originate from the application pricing result:

- accommodation totals;
- package/tour totals;
- markup;
- discounts;
- taxes/fees;
- total;
- per-person price.

View Model providers may format values for display but must not establish the business result through arithmetic.

---

## 10. CURRENCY

Use the currency supplied by the authoritative pricing result.

Do not:

- hard-code a currency;
- perform frontend currency conversion;
- infer currency from location.

Currency conversion is outside IMP-006 unless an existing approved application service already provides it.

---

## 11. QUOTE VIEW MODEL

Create or extend a dedicated quote/pricing View Model following existing conventions.

It should contain only presentation-safe information, including:

- journey summary;
- accommodation summary;
- price components;
- currency;
- total;
- per-person price where available;
- pricing status;
- revalidation status;
- customer-facing messages;
- next-action state.

Do not expose:

- Prisma models;
- repository objects;
- raw Hotelbeds responses;
- infrastructure exceptions.

---

## 12. ACCOMMODATION SUMMARY

The quote shall summarise the accommodation selected in IMP-005.

For each applicable stop show, where available:

- destination;
- property;
- room;
- rate/board basis;
- nights;
- occupancy.

The summary must reflect the authoritative selection.

---

## 13. PRICE BREAKDOWN

Where authoritative components exist, present a clear breakdown.

Typical structure:

**Journey / Tour**

**Accommodation**

**Extras**

**Taxes / Fees**

**Total**

Only display categories supported by the pricing result.

The **Total** must be the authoritative application result.

---

## 14. PER-PERSON PRICE

Display a per-person price only when the application provides an authoritative value or approved calculation.

Do not calculate the per-person price in:

- EJS;
- browser JavaScript;
- controller;
- View Model provider.

The displayed basis must be clear enough for the customer to understand what the amount represents.

---

## 15. OPTIONAL EXTRAS

IMP-006 may present extras only if an existing approved application capability already provides them.

Do not create a new extras catalogue as part of this implementation.

If extras are not supported by the current application architecture, omit them.

Do not invent placeholder commercial values.

---

## 16. PRICING STATES

Support the application states required by the existing pricing contract.

At minimum handle:

- `PRICED`;
- `RECHECK_REQUIRED`;
- `UNAVAILABLE`;
- `INVALID`;
- `NOT_FOUND`.

Equivalent existing application terminology may be reused.

A failed pricing operation must never render as a successful quote.

---

## 17. RECHECK REQUIRED

When the selected accommodation/rate has changed:

1. inform the customer;
2. do not present the stale total as final;
3. provide recovery to accommodation selection;
4. preserve valid journey context where possible.

Do not implement the complete reservation/check-rate workflow in the frontend.

---

## 18. UNAVAILABLE / INVALID

If the journey or required accommodation is unavailable:

- render a controlled customer-facing state;
- identify the affected component where possible;
- provide a recovery route;
- do not display stale pricing as authoritative.

Do not expose internal errors.

---

## 19. ROUTING

Use the existing `/ui` namespace.

Preferred route:

`/ui/journeys/:journeyId/quote`

Use an existing equivalent route if already established.

The route must resolve the authoritative selected journey/accommodation state.

Do not create duplicate journey routes.

---

## 20. HTTP / CONTROLLER

Use GET for rendering the current quote where appropriate.

If an explicit state-changing pricing action is required by the existing architecture, use the appropriate non-GET method.

The controller shall:

1. receive the journey identity;
2. resolve the selected accommodation state;
3. invoke the application pricing capability;
4. map the result to the quote View Model;
5. render the quote or controlled error/recheck state.

The controller must not:

- calculate pricing;
- access Prisma directly;
- access repositories directly;
- call Hotelbeds;
- apply commercial rules.

---

## 21. VIEW MODEL PROVIDER

The provider shall:

- map authoritative pricing data;
- format monetary values;
- format accommodation information;
- map pricing/revalidation states;
- expose customer-safe information.

It must not make pricing decisions or perform business calculations.

---

## 22. CUSTOMER UX

The quote page must clearly communicate:

1. selected journey;
2. selected accommodation;
3. price breakdown;
4. total;
5. currency;
6. price basis where available;
7. relevant pricing/revalidation conditions;
8. next customer action.

The total must be prominent.

The UI must not imply:

- payment completed;
- booking completed;
- reservation confirmed;
- guaranteed availability beyond the authoritative state.

---

## 23. RESPONSIVE / ACCESSIBLE UI

The quote experience must work on mobile, tablet and desktop.

Use existing GCT Core:

- design tokens;
- typography;
- spacing;
- components;
- responsive conventions.

Ensure:

- semantic headings;
- accessible price labels;
- keyboard-accessible actions;
- visible focus states;
- accessible error/status messages.

Do not redesign unrelated frontend areas.

---

## 24. PERSISTENCE

Do not introduce a new permanent Quote or Booking persistence model for IMP-006 unless an already-approved application capability requires it.

Prefer reconstructing the quote from authoritative selected journey/accommodation state.

Do not create a frontend-only pricing store.

---

## 25. HOTELBEDS BOUNDARY

No direct Hotelbeds calls may exist in:

- EJS;
- browser JavaScript;
- frontend controllers;
- View Model providers.

All supplier interaction remains behind the existing application/integration boundary.

Tests must not call live Hotelbeds APIs.

---

## 26. TESTING

Add focused tests for:

### Application

- valid completed journey can be priced;
- completed accommodation selection is validated;
- authoritative pricing result is returned;
- currency is preserved;
- price components are mapped;
- authoritative total is preserved;
- per-person price is preserved where supplied;
- stale rate produces `RECHECK_REQUIRED`;
- unavailable accommodation produces `UNAVAILABLE`;
- invalid/not-found journey is handled;
- client-supplied price is never authoritative.

### View Model / Provider

- journey summary;
- accommodation summary;
- price components;
- currency formatting;
- total;
- per-person price;
- pricing status;
- recheck state;
- optional components;
- no infrastructure-object leakage.

### HTTP / Controller

- quote route renders;
- valid pricing request produces quote;
- recheck state renders correctly;
- unavailable state renders correctly;
- invalid/not-found state renders correctly;
- recovery to accommodation selection works.

### Presentation

Verify:

- total is prominent;
- breakdown is understandable;
- accommodation summary is correct;
- currency is displayed;
- failed/recheck states are clear;
- no booking/payment claim is displayed.

### Regression

Verify existing homepage, discovery, Journey Detail, Journey Selection and Accommodation Selection behaviour remains intact.

---

## 27. LINT BASELINE

Current frontend baseline:

**0 errors / 10 confirmed pre-existing warnings**

IMP-006 must introduce:

**0 new warnings**

Do not weaken lint rules or suppress warnings to achieve this.

---

## 28. ACCEPTANCE CRITERIA

IMP-006 is accepted when:

- [ ] completed accommodation selection can reach the quote stage;
- [ ] pricing uses the selected journey and accommodation configuration;
- [ ] authoritative pricing is produced by the application layer;
- [ ] frontend does not independently calculate the authoritative total;
- [ ] accommodation pricing is included where supplied;
- [ ] journey/package pricing is included where supplied;
- [ ] deterministic GCT pricing rules are applied by the application layer;
- [ ] currency is correct;
- [ ] authoritative total is displayed;
- [ ] per-person price is displayed only when authoritative;
- [ ] price breakdown is displayed where supported;
- [ ] stale/unavailable pricing is handled safely;
- [ ] customer can recover to accommodation selection;
- [ ] no client-supplied commercial value is trusted;
- [ ] no direct Hotelbeds access exists in presentation code;
- [ ] no booking/reservation/payment is implemented;
- [ ] no new permanent pricing/booking persistence is introduced;
- [ ] responsive/accessibility requirements are satisfied;
- [ ] existing IMP-003.1 through IMP-005 behaviour remains intact;
- [ ] focused tests pass;
- [ ] full regression passes;
- [ ] type-check passes;
- [ ] Prisma validation passes;
- [ ] build passes;
- [ ] lint has 0 errors and no new warnings;
- [ ] no AI functionality is introduced.

---

## 29. EXPLICIT NON-SCOPE

Copilot must not introduce:

- AI;
- AI pricing;
- AI recommendations;
- AI personalization;
- new independent pricing architecture;
- unrestricted Hotelbeds search;
- direct Hotelbeds frontend access;
- booking;
- reservation;
- payment;
- guest details;
- checkout;
- invoice generation;
- voucher generation;
- customer accounts;
- new Journey persistence;
- bulk content/image ingestion;
- unrelated refactoring.

Any discovered requirement outside this scope must be reported as a deviation.

---

## 30. VERIFICATION

From the repository root run:

`npm run type-check`

`npm test -- --runInBand`

`npx prisma validate`

`npm run lint`

`npm run build`

Also run the focused IMP-006 test suite explicitly.

The implementation report must provide the exact commands and results.

The lint report must explicitly state:

- initial warning count;
- final warning count;
- warnings introduced by IMP-006;
- remaining pre-existing warnings.

---

## 31. IMPLEMENTATION REPORT

After implementation provide:

### Files Created
Complete list.

### Files Modified
Complete list.

### Application Changes
Pricing contract, validation, revalidation and pricing orchestration.

### Frontend Changes
Routes, controller, View Model/provider, EJS and styling.

### Tests
Focused tests and regression results.

### Verification
Exact commands and results.

### Lint Baseline
Initial and final warning counts and attribution.

### Deviations
`No deviations.` if none.

### Outstanding Issues
`No outstanding issues.` if none.

### Commit
`No commit created.`

---

## 32. COMPLETION BOUNDARY

IMP-006 establishes:

**Completed Accommodation Selection**
→ **Authoritative Deterministic Pricing**
→ **Customer Quote**

The next capability begins after the quote has been presented.

IMP-006 must remain a deterministic MVP implementation.

**AI remains explicitly deferred until MVP completion.**