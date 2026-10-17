# INT-004 — Cape Winelands Dynamic Availability & Package Pricing

## 1. Document Control

| Field | Value |
|---|---|
| ID | INT-004 |
| Title | Cape Winelands Dynamic Availability & Package Pricing |
| Status | Architect Approved |
| Previous Iterations | INT-001, INT-002, INT-003 |
| Governing Process | `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md` |
| Target Journey | SIGNATURE Cape Winelands Journey |
| Scope | Dynamic dates, journey-specific Hotelbeds availability, room allocation and package pricing |

## 2. Purpose

Replace the deterministic accommodation and pricing path for the SIGNATURE Cape Winelands Journey with a real, date-driven Hotelbeds availability and pricing experience through the existing UI.

The completed customer flow must support:

1. selecting a journey start date;
2. selecting 2–8 adult participants;
3. allocating participants across rooms;
4. calculating accommodation dates from the itinerary;
5. searching eligible Hotelbeds properties for each stop;
6. selecting one property, with one or more rooms, at each stop;
7. selecting available room/rate options;
8. calculating the GCT package price;
9. carrying the same dates, occupancy, selections and pricing into the existing Reservation handoff.

This is a focused implementation slice for one journey. It must establish a reusable pattern for subsequent journeys without implementing those journeys now.

## 3. Governing Architecture

Follow:

- `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`
- `docs/08-integration/INT-001-JOURNEY-ACCOMMODATION-PRICING-HANDOFF.md`
- `docs/08-integration/INT-002-PRICING-RESERVATION-HOTELBEDS-BOOKING-HANDOFF.md`
- `docs/08-integration/INT-003-HOTELBEDS-REAL-WORLD-INTEGRATION-CERTIFICATION-VERIFICATION.md`
- existing APP-003, APP-004, APP-005 and APP-008 specifications.

Reuse the existing Hotelbeds catalogue, Availability request builder, provider, response mapper, canonical accommodation contracts, selection flow, pricing engine and Reservation handoff.

Do not create a parallel supplier integration or pricing engine.

## 4. Confirmed Business Rules

### 4.1 Journey itinerary

The approved four-day itinerary has two accommodation stops:

| Stop | Destination | Nights | Accommodation rule |
|---|---|---:|---|
| 1 | Stellenbosch | 2 | One establishment for both nights |
| 2 | Hermanus | 1 | One establishment for the night |

The itinerary is:

- Day 1: Franschhoek wine tour; overnight in Stellenbosch.
- Day 2: Stellenbosch wine tour; second night at the selected establishment.
- Day 3: Elgin and Botriver wine tour; overnight in Hermanus.
- Day 4: Hemel-en-Aarde wine tour; journey ends in Cape Town or Cape Town Airport.

Use the supplied SIGNATURE Cape Winelands itinerary as the authoritative experience definition.

### 4.2 Stellenbosch fallback

For Stop 1:

1. Search the configured Stellenbosch properties first.
2. Determine whether at least one suitable property can accommodate the entire two-night stay and requested room allocation.
3. If suitable Stellenbosch availability exists, present those properties.
4. Only if no suitable Stellenbosch property is available, search the configured Franschhoek fallback properties.
5. If neither destination has suitable availability, prevent completion of the accommodation selection and explain the situation.

Do not combine one night in Stellenbosch and one night in Franschhoek.

The selected establishment must cover the entire stop.

Do not silently change the itinerary or stay dates.

### 4.3 Accommodation selection

For every stop:

- exactly one accommodation establishment is selected;
- multiple rooms may be selected at that establishment;
- each room has its own adult occupancy;
- the selected room/rate must support the requested occupancy and stay dates;
- different stops may use different establishments;
- the same establishment may legitimately appear at different stops.

Do not implement one accommodation selection per night.

### 4.4 Participants

The standard customer journey supports 2–8 adult participants.

More than eight participants must be directed to an enquiry/contact route. A dedicated enquiry form is outside this iteration.

The total number of adults allocated across rooms must equal the selected participant count.

No children are included in this initial journey configuration.

## 5. Go Cape Tours Pricing

The following group totals are authoritative for this iteration.

| Participants | Cost per person | Go Cape Tours group total |
|---:|---:|---:|
| 2 | R25,688.00 | R51,376.00 |
| 3 | R21,420.00 | R64,260.00 |
| 4 | R18,420.00 | R73,680.00 |
| 5 | R16,620.00 | R83,100.00 |
| 6 | R15,860.00 | R95,160.00 |
| 7 | R15,170.00 | R106,190.00 |
| 8 | R14,460.00 | R115,680.00 |

The six-participant total is corrected to R95,160.

These amounts represent the complete Go Cape Tours component for the four-day journey and exclude accommodation.

The package price is:

`GCT group total + selected Hotelbeds accommodation total for Stop 1 + selected Hotelbeds accommodation total for Stop 2`

Use the existing APP-005 pricing contracts and engine.

Do not introduce additional markup, fees, taxes or currency-conversion rules without an existing approved rule requiring them.

The Go Cape Tours component is selected by group size. It must not be multiplied by the participant count again.

## 6. Dynamic Journey Dates

The customer must choose the journey start date before accommodation availability is requested.

Use date-only values and the existing date conventions. Do not use the server's current timestamp as the commercial check-in date.

Calculate stop dates from the configured itinerary:

- Stop 1: check-in = selected start date; check-out = start date + 2 nights.
- Stop 2: check-in = Stop 1 check-out; check-out = Stop 2 check-in + 1 night.

The expected total itinerary duration is four days and three accommodation nights.

The calculation must be deterministic and independent of server timezone.

The selected start date and derived stop dates must remain consistent through:

`Journey Detail → Accommodation Selection → Quote → Guest Information → Review → Reservation`

If the customer changes the start date:

- discard or invalidate affected availability selections;
- recalculate every stop period;
- request availability for the new dates;
- recalculate pricing;
- prevent stale rates or quotes from being used.

Apply existing date validation where available. Do not invent an unsupported minimum advance-booking policy.

## 7. Journey-Specific Property Configuration

Configure the Cape Winelands journey's eligible Hotelbeds properties in application code, separately from global Hotelbeds credentials and runtime settings.

Use the supplied `Destination Code.docx` as the property-code source for:

- Stellenbosch primary properties;
- Franschhoek fallback properties;
- Hermanus properties.

The supplied document contains property names, Hotelbeds codes, categories and destination-zone information. Preserve those groupings.

Before using a code:

1. resolve it through the existing active Hotelbeds catalogue;
2. verify that the catalogue identity matches the supplied property;
3. exclude inactive, unknown or mismatched codes;
4. retain the supplier hotel code through the existing canonical mapping.

Do not invent or rename properties.

Do not put the permanent journey property lists in `.env`.

Do not create a second Hotelbeds property registry.

Use the existing stop eligibility contract, including `approvedAccommodationIds` where suitable. If the current model cannot associate the supplied Hotelbeds codes with stop-specific eligible properties, implement only the minimum compatible configuration/model extension required.

Keep the configuration reusable for future journeys.

## 8. Hotelbeds Availability Integration

Connect the commercial journey to the existing Hotelbeds Availability capability.

The application must pass, for each stop:

- calculated check-in date;
- calculated check-out date;
- room count;
- adults per room;
- zero children;
- eligible property codes;
- existing required supplier search context.

Use the existing catalogue service, Availability service, request builder, provider and response mapper.

Do not call Hotelbeds directly from EJS templates or browser JavaScript.

Do not create a second Availability implementation.

Availability results must supply the actual selectable:

- property;
- room;
- rate/board;
- supplier rate reference;
- supplier amount and currency;
- occupancy constraints;
- cancellation information;
- other existing canonical rate details.

Only offers returned by the real Availability flow may be presented as available.

The existing deterministic Cape Winelands Retreat, Signature Room, Breakfast Included and ZAR 18,950 fixture must not be presented as live Hotelbeds data.

Do not make live supplier requests during automated Jest tests.

The normal UI flow may invoke the existing configured Hotelbeds provider through its application boundary. Preserve the controlled verification safeguards established by INT-003.

## 9. Room Allocation

The customer can add or remove rooms and set the number of adults in each room.

The UI must support one or multiple rooms, subject to the selected property's and rate's actual occupancy constraints.

Requirements:

1. Each room has a positive adult count.
2. The sum of adults across rooms equals the selected participant count.
3. The selected room configuration is used for Availability.
4. The selected room configuration is retained with the selected offer.
5. Each stop may have a different room allocation if required by available properties/rates.
6. A property is suitable only if it can accommodate the complete requested room allocation for the full stop.
7. The customer cannot select different establishments for rooms belonging to the same stop.

Do not impose an arbitrary maximum adults-per-room rule. Use the occupancy limits supplied by the actual Hotelbeds offers.

If the existing supplier request contract supports multiple rooms and per-room occupancy, reuse it. If it does not, report the precise contract gap and make only the smallest required extension. Do not fake multi-room support by submitting incorrect occupancy.

## 10. Accommodation Selection UI

Update the existing Accommodation Selection page and its View Model/provider to show multiple real property options per stop.

For Stop 1:

- show suitable Stellenbosch results first;
- show Franschhoek fallback results only when no suitable Stellenbosch result exists.

For Stop 2:

- show suitable Hermanus results.

For each stop, the customer selects one property and then the required room/rate configuration.

The selected property must cover the entire stop period.

Show useful stay information:

- destination;
- check-in/check-out dates;
- number of nights;
- selected participant count;
- room allocation;
- property;
- room/rate details;
- supplier price as applicable.

Use the existing UI design system and shared components.

Do not redesign the entire frontend.

Do not put supplier or pricing business logic in templates.

## 11. Canonical Selection and State

Reuse the existing `JourneyAccommodation` and `selectJourneyAccommodation(...)` contracts.

Maintain one selected establishment per package stop.

The journey selection context must retain:

- journey identifier;
- selected start date;
- configured stop identities and order;
- calculated stop periods;
- participant count;
- room allocation;
- selected property per stop;
- selected room and rate per room;
- provider and supplier references;
- supplier amount and currency;
- enough offer/date identity to reject stale selections.

If the current in-memory selection store cannot safely retain the necessary date and room context, extend it minimally.

Do not introduce a new state-management or persistence architecture.

Do not accept submitted property, room or rate references unless they match the currently offered canonical result for that stop, stay period and occupancy.

## 12. APP-005 Pricing Integration

Preserve the accepted INT-001 pricing handoff.

For each stop, convert the selected supplier accommodation data into the existing canonical `JourneyAccommodationPricingInput` structure.

Pass the stop-specific inputs through the existing accommodation pricing integration into APP-005.

Requirements:

- one accommodation pricing component per stop;
- each stop uses its selected supplier cost;
- each selected multi-room configuration is priced correctly;
- each amount uses the supplier-provided currency and established pricing basis;
- currency validation follows existing contracts;
- accommodation cost is included exactly once;
- the Go Cape Tours group component is selected once from the approved group pricing table;
- the final customer total is the sum of the Go Cape Tours component and all selected accommodation costs.

Do not use the deterministic ZAR 18,950 fixture as the Go Cape Tours package price.

Do not add the Go Cape Tours group total once per stop.

Do not add supplier accommodation amounts twice.

Do not replace the GCT customer total with the Hotelbeds supplier amount.

The quote must clearly distinguish:

- Go Cape Tours component;
- accommodation by stop;
- total accommodation;
- final package total;
- participant count and room allocation.

Use the existing quote presentation and price display components.

## 13. Quote Recalculation and Stale Offers

Recalculate the quote when any of the following changes:

- journey start date;
- participant count;
- room allocation;
- selected property;
- selected room;
- selected rate;
- any stop's accommodation selection.

If a change affects availability, obtain valid offers through the existing application flow before accepting the selection.

Do not reuse a rate that belongs to different dates or occupancy.

Do not allow a quote calculated from an earlier selection to continue to Guest Information or Review after the selection changes.

Follow existing canonical stale-selection and error-handling conventions.

## 14. Reservation Continuity

Reuse INT-002 and the existing Reservation implementation.

Ensure the resulting canonical Reservation receives the same:

- journey start date;
- stop order;
- stop-specific stay periods;
- selected property per stop;
- room/rate selections;
- room occupancy;
- participant/guest information;
- supplier amounts;
- authoritative APP-005 customer price.

Do not redesign Reservation or supplier booking orchestration.

Do not perform an uncontrolled live Hotelbeds booking as part of this implementation.

The existing controlled booking safeguards and supplier-verification process remain authoritative.

## 15. Out-of-Scope Work

Do not implement:

- other package journeys;
- a generic itinerary-management UI;
- the over-eight-participant enquiry form;
- child occupancy for this journey;
- payment-provider changes;
- new Hotelbeds API capabilities;
- new supplier integrations;
- cancellation or modification changes;
- supplier reconciliation;
- new pricing or markup rules;
- new Reservation architecture;
- database redesign;
- unrelated UI redesign;
- production photography work.

The configuration and contracts should be reusable, but this iteration implements only the SIGNATURE Cape Winelands Journey.

## 16. Focused Tests

Add or update tests covering:

### Journey and dates

- start date is required;
- valid date is retained through the journey;
- date-only calculations are timezone-independent;
- Stop 1 spans two nights;
- Stop 2 starts on Stop 1 checkout;
- Stop 2 spans one night;
- total itinerary spans three accommodation nights;
- changing the start date invalidates affected offers and quotes.

### Participants and rooms

- participant counts from 2 through 8;
- more than 8 follows the existing enquiry/contact direction;
- room allocations sum to the participant count;
- one room with supported occupancy;
- multiple rooms with different adult counts;
- invalid room allocations are rejected;
- supplier occupancy limits are respected;
- one establishment is selected per stop.

### Property eligibility and fallback

- only configured active catalogue properties are considered;
- unknown/inactive codes are excluded;
- Stellenbosch is searched first;
- suitable Stellenbosch results suppress the Franschhoek fallback;
- Franschhoek is searched when no suitable Stellenbosch offer exists;
- no suitable property at either destination blocks progression;
- Hermanus properties are used only for Stop 2;
- same property at different stop IDs remains independently addressable.

### Hotelbeds Availability

- correct stop dates reach Availability;
- correct room count and per-room adults reach Availability;
- children are zero;
- canonical real-provider response mapping is preserved;
- no deterministic property/rate is presented as a live offer.

### Pricing

- each stop produces exactly one accommodation pricing component;
- multiple rooms are priced correctly;
- supplier amount is included once;
- the correct Go Cape Tours group total is selected;
- group total is added once, not once per stop;
- combined total equals GCT group cost plus all selected accommodation costs;
- no hard-coded ZAR 18,950 total remains in the real supplier-driven Cape Winelands path;
- existing currency and pricing validation remains effective.

### Reservation continuity

- dates and occupancy remain consistent through Review;
- selected property/room/rate remain traceable;
- APP-005 customer price is retained;
- stale date or offer selections cannot proceed.

Use mocks/stubs for automated supplier tests. Do not perform live Hotelbeds calls in Jest.

## 17. Browser Verification

Verify the actual UI flow at:

- Desktop: 1280 × 800;
- Mobile: 375 × 812.

Test:

`Discover → Journey Detail → Start Date / Participants → Accommodation Selection → Quote → Guest Information → Review`

Verify:

- customer can select a start date;
- stop dates are correct;
- 2–8 participants work;
- room allocation can be changed;
- one property is selected per stop;
- Stellenbosch-first/Franschhoek-fallback behaviour is correct;
- Hermanus options are available for Stop 2;
- actual Hotelbeds properties, rooms and rates are shown when the configured supplier environment is available;
- the combined quote uses the selected GCT group total plus actual selected accommodation costs;
- no stale offers are used after date/occupancy changes;
- Reservation handoff preserves dates and selections;
- no horizontal overflow;
- no browser console errors;
- no unexpected resource failures;
- no supplier secrets or raw supplier errors appear.

If the Hotelbeds test environment or credentials prevent real Availability, report the exact blocker. Do not substitute fixture data while claiming real supplier verification passed.

## 18. Verification Gates

Run and report:

- focused INT-004 tests;
- relevant APP-003 tests;
- relevant APP-004 tests;
- relevant APP-005 tests;
- relevant APP-008 Availability tests;
- full Jest regression;
- TypeScript typecheck;
- production build;
- Prisma generate;
- Prisma validate;
- lint;
- `git diff --check`;
- working-tree inspection.

Record actual test suite and test counts.

Compare against the current committed baseline and explain any change. Distinguish established baseline lint warnings from new warnings or errors.

## 19. Definition of Done

INT-004 is complete when:

1. the Cape Winelands journey supports customer-selected start dates;
2. both accommodation stop periods are derived correctly;
3. eligible Hotelbeds properties are configured by journey and stop;
4. Stellenbosch-first/Franschhoek-fallback works;
5. Hermanus availability works for Stop 2;
6. the customer can allocate 2–8 adults across rooms;
7. the selected property covers the entire stop;
8. room/rate selections come from canonical Availability offers;
9. supplier accommodation amounts reach APP-005;
10. the correct GCT group total is included once;
11. the combined package price is correct;
12. stale selections are invalidated when relevant inputs change;
13. the Reservation handoff retains the selected dates, occupancy and prices;
14. focused and full regression pass;
15. typecheck, build, Prisma and lint pass;
16. desktop/mobile browser verification passes;
17. no unrelated architecture or capability has been introduced.

## 20. Copilot Implementation Report

Return:

### Implementation
- files changed/added;
- runtime flow;
- journey/stop configuration;
- date calculation;
- Hotelbeds Availability wiring;
- room allocation;
- fallback behaviour;
- APP-005 pricing integration.

### Pricing
- group total selected for each participant count;
- accommodation costs by stop;
- example calculation using actual returned offers, if available;
- confirmation that no amount is double-counted.

### Tests
- focused results;
- full Jest result;
- typecheck;
- build;
- Prisma generate;
- Prisma validate;
- lint;
- diff check.

### Browser
- desktop;
- mobile;
- real supplier Availability status;
- quote status;
- Reservation continuity;
- console/resource results.

### Supplier Constraints
Explicitly state whether actual Hotelbeds Availability was exercised. Identify any configuration, catalogue or environment blocker.

### Scope
Confirm that no other journey, payment capability, enquiry form, supplier capability or database redesign was added.

### Decision Gaps
State either:

`No architectural or business decision gap encountered.`

or identify the precise unresolved decision.

Copilot must not commit or push.

## 21. Architect Approval

This specification is **Architect Approved for implementation**.

The approved objective is to complete the SIGNATURE Cape Winelands Journey as the first real, date-driven, supplier-priced GCT package journey.

The accepted architecture remains authoritative:

- APP-003 owns journey/accommodation selection contracts;
- Hotelbeds APP-008 owns supplier availability and supplier-specific integration;
- APP-005 owns GCT package pricing;
- APP-004 owns the Reservation;
- INT-002 owns the established Reservation-to-booking handoff.

Make the smallest coherent production changes necessary to connect these capabilities.

Do not invent commercial rules, replace accepted capabilities or expand the iteration beyond the stated scope.

# End of Specification