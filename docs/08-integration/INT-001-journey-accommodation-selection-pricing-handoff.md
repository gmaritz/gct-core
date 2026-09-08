# INT-001 — Journey / Accommodation Selection → Pricing Handoff

**Status:** Implementation Specification  
**Workstream:** Integration  
**Depends On:** APP-003, APP-005, APP-008  
**Related:** UI-006, UI-008, UI-009, UI-010  
**Governance:** `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

## 1. Objective

Complete the production application handoff from the selected accommodation in APP-003 into the existing APP-005 pricing architecture.

Required flow:

**Journey → Package Stop → Selected Accommodation → Selected Room → Selected Rate → JourneyAccommodationPricingInput → APP-005 Pricing Engine → Authoritative GCT Package Price**

The repository already contains:

- `JourneyAccommodationPricingInput`;
- `selectJourneyAccommodation(...)` with canonical pricing projection;
- `createAccommodationPricingComponents(...)`;
- `withAccommodationPricingInputs(...)`;
- the APP-005 pricing engine;
- the Journey Quote service.

The current gap is that `DefaultJourneyQuoteService` constructs accommodation pricing directly from raw rate amounts instead of using the existing APP-005 accommodation pricing integration.

Complete this handoff without creating a competing pricing model.

## 2. Current Architecture

The existing selection model is:

**Journey → JourneyAccommodation → RoomOptions → RateOptions**

`selectJourneyAccommodation(...)` already defines the canonical `JourneyAccommodationPricingInput` representation containing:

- package identity;
- package stop;
- stop order;
- accommodation;
- stay period;
- accommodation ID;
- selected room;
- selected rate;
- occupancy.

The existing APP-005 integration transforms this into accommodation pricing components preserving:

- package stop;
- accommodation;
- room reference;
- rate reference;
- provider;
- supplier amount;
- currency;
- pricing basis;
- occupancy;
- child ages.

Reuse these existing structures and contracts. Do not create alternative selection or pricing representations.

## 3. Required Integration

Update the existing Journey Quote pricing path so that selected accommodation is converted into the canonical `JourneyAccommodationPricingInput` representation and passed through the existing:

`withAccommodationPricingInputs(...)`

before the `PricingEngine` executes.

The integration SHALL:

1. Resolve the journey.
2. Validate stored accommodation selections against the current journey.
3. Resolve each selected accommodation.
4. Resolve the selected room.
5. Resolve the selected rate.
6. Preserve the package-stop association.
7. Construct or reuse the canonical `JourneyAccommodationPricingInput`.
8. Build the base `PricingValidationRequest`.
9. Apply `withAccommodationPricingInputs(...)`.
10. Pass the resulting request to the existing `PricingEngine`.
11. Return the resulting authoritative `PricingEngineResult`.

Do not call Hotelbeds from APP-005.

## 4. Prevent Double Counting

The current pricing request construction receives selected rate amounts and creates accommodation line items directly.

Once the canonical APP-005 accommodation integration is used, those raw accommodation amounts MUST NOT also be inserted into the base pricing request.

The selected accommodation amount must enter pricing exactly once through:

`withAccommodationPricingInputs(...)`

For the current dynamic journey implementation, where no separate non-accommodation package component exists, the base pricing request SHALL contain only the minimum valid base structure required by the existing pricing architecture, without duplicating the selected accommodation amount.

Do not invent a new package-price source merely to populate the base request.

The resulting calculation must remain conceptually:

**Base package components + Selected accommodation pricing components + Existing APP-005 pricing rules = GCT package price**

For the current deterministic journey test data, the existing expected total of **ZAR 18,950** must remain unchanged.

## 5. Selection-to-Pricing Mapping

For every selected stop, construct the canonical pricing input using the existing journey structures.

Required information:

- `packageId`;
- `packageStopId`;
- `stopOrder`;
- selected accommodation;
- stay period;
- accommodation ID;
- selected room;
- selected rate;
- occupancy.

Where available, reuse the `pricingInput` produced by `selectJourneyAccommodation(...)` rather than reconstructing an alternative model.

If the selected option is reconstructed from stored selection, the resulting object must have the same semantics as the existing `JourneyAccommodationPricingInput`.

Do not persist a second selection/pricing representation.

## 6. Package-Stop Integrity

Each pricing component MUST remain associated with its originating package stop.

Do not use accommodation ID as the aggregation key.

If the same property occurs at multiple stops, each occurrence must produce an independent accommodation pricing component.

The ordering of pricing inputs must remain deterministic and correspond to the journey's accommodation/package-stop order.

## 7. Room and Rate Integrity

The selected rate must belong to the selected room.

The selected room must belong to the selected accommodation.

The selected accommodation must belong to the correct package stop where stop identity is defined.

Existing `selectJourneyAccommodation(...)` validation semantics remain authoritative.

Do not silently substitute another room, rate or accommodation.

Invalid or stale selections must continue to result in the existing application status/error behaviour rather than being priced.

## 8. Supplier Price Semantics

The Hotelbeds/supplier accommodation amount remains an input to GCT pricing.

It must not bypass the APP-005 pricing engine.

The final customer price remains owned by APP-005.

Preserve:

- supplier amount;
- supplier currency;
- pricing basis;
- supplier/provider reference;
- selected accommodation identity;
- selected room identity;
- selected rate identity.

Do not introduce supplier-specific pricing logic into the Journey Quote service.

## 9. Currency

Use the existing APP-005 currency behaviour.

Do not introduce currency conversion as part of this integration.

`withAccommodationPricingInputs(...)` currently requires the accommodation pricing currency to match the package pricing currency.

The current journey quote request uses the existing GCT pricing currency.

If real Hotelbeds data later exposes a currency mismatch that cannot be handled by the existing pricing architecture, report the limitation rather than silently converting or reinterpreting the amount.

## 10. Pricing Architecture

Preserve the existing architecture:

**JourneyQuoteService → PricingEngine → PricingValidationPipeline → PricingPolicyPipeline → PricingCalculatorPipeline → Pricing Aggregate**

The Journey Quote service may assemble the canonical pricing request, but it must not implement:

- markup calculations;
- commission calculations;
- discount calculations;
- tax calculations;
- package-total calculations;
- supplier pricing rules.

Existing APP-005 policies and calculators remain authoritative.

## 11. Existing Quote Integration

Do not replace or duplicate `QuoteIntegrationService`.

This iteration concerns the existing Journey Quote application path used by the customer frontend.

`JourneyQuoteResult` and the existing `JourneyQuoteViewModelProvider` remain unchanged unless a compile-safe correction is genuinely required by the handoff.

The existing Quote Integration capability remains available for its established application contract.

## 12. Reservation Compatibility

INT-001 must preserve compatibility with the existing reservation handoff.

The selected accommodation currently flows into reservation through journey selections and the existing reservation construction.

Do not implement the APP-005 → APP-004 reservation handoff in this iteration.

Do not modify:

- reservation persistence;
- reservation snapshots;
- reservation orchestration;
- Hotelbeds booking;
- revalidation;
- payment.

Those belong to subsequent integration slices.

Ensure the pricing representation remains compatible with the existing `JourneyAccommodationPricingInput` and reservation projection so that INT-002 can consume the same canonical selection.

## 13. Tests

Update or add focused tests for the Journey Quote pricing integration.

At minimum verify:

1. A selected accommodation produces an APP-005 accommodation pricing component.
2. The component contains the correct package stop.
3. The component preserves accommodation identity.
4. The component preserves room reference.
5. The component preserves rate reference.
6. The component preserves provider.
7. The supplier amount is incorporated exactly once.
8. Multiple package stops produce independent accommodation pricing components.
9. Repeated accommodation properties at different stops remain independent.
10. Invalid room/rate references are rejected before pricing.
11. Non-BOOKABLE rates continue to produce `RECHECK_REQUIRED`.
12. Currency mismatch follows existing APP-005 behaviour.
13. The existing deterministic journey quote remains `PRICED`.
14. The current deterministic total remains **ZAR 18,950**.
15. The Pricing Engine receives the canonical accommodation-enriched pricing request.

Do not weaken existing APP-005 accommodation pricing tests.

Existing tests in:

`src/application/pricing/accommodation/accommodation-pricing-input.test.ts`

must continue to pass unchanged unless a genuine defect in the existing implementation is discovered.

## 14. Verification

After implementation run:

1. Focused Journey Quote tests.
2. Focused APP-005 accommodation pricing tests.
3. Relevant reservation integration tests if affected.
4. `npm test`
5. `npm run type-check`
6. `npm run build`
7. `npm run lint`
8. `git diff --check`

Report exact suite/test counts and any pre-existing lint warnings.

## 15. Browser Verification

Because this integration changes the price displayed by the existing customer journey, perform browser verification through:

**Accommodation Selection → Quote → Guest Information → Reservation Review**

At minimum:

- desktop: **1280×800**;
- mobile: **375×812**.

Verify:

- selected accommodation remains displayed correctly;
- selected room/rate remains displayed correctly;
- quote renders successfully;
- quote total is authoritative and consistent;
- no duplicate accommodation amount appears;
- no horizontal overflow occurs;
- existing responsive layout remains intact.

Do not introduce new frontend functionality.

## 16. Architecture & Scope Constraints

Do not:

- create another accommodation pricing model;
- bypass `withAccommodationPricingInputs(...)`;
- duplicate pricing calculations;
- call Hotelbeds from pricing;
- add Hotelbeds-specific logic to APP-005;
- modify the Prisma schema;
- modify reservation persistence;
- implement Hotelbeds booking;
- implement CheckRate;
- implement payment;
- introduce new pricing rules;
- introduce frontend state;
- redesign the UI.

Use existing contracts wherever possible.

If the current architecture prevents the canonical handoff without a contract change, **stop and report the architectural issue rather than silently expanding scope**.

## 17. Expected Result

After INT-001 the production application flow must be:

**Selected Accommodation → JourneyAccommodationPricingInput → withAccommodationPricingInputs(...) → PricingValidationRequest → PricingEngine → Authoritative GCT Pricing → Journey Quote**

The supplier accommodation amount must enter the pricing engine once and remain traceable to:

**Package Stop → Accommodation → Room → Rate**

The existing customer-facing quote must continue to produce the current deterministic result while now using the canonical APP-005 accommodation pricing integration.

## 18. Deliverables

Provide an implementation report containing:

- files changed;
- exact integration point(s);
- explanation of how the canonical `JourneyAccommodationPricingInput` is produced and consumed;
- confirmation that accommodation amounts are not double-counted;
- focused test results;
- full regression result;
- type-check result;
- build result;
- lint result;
- `git diff --check` result;
- browser verification results;
- confirmation that Hotelbeds supplier operations were not modified;
- confirmation that reservation/payment functionality was not expanded;
- confirmation that no production photography/UI redesign was introduced;
- confirmation that Copilot did not commit or push;
- any unresolved architectural or integration issues.

## 19. Acceptance Criteria

INT-001 is ready for Architect Acceptance only when:

- selected accommodation reaches APP-005 through the canonical pricing input;
- package-stop identity is preserved;
- room/rate identity is preserved;
- supplier price is incorporated exactly once;
- GCT pricing remains authoritative;
- multi-stop pricing is supported;
- repeated properties across stops remain independent;
- invalid/stale selections remain rejected;
- existing pricing rules remain unchanged;
- deterministic quote remains **ZAR 18,950**;
- focused tests pass;
- full regression passes;
- type-check passes;
- build passes;
- lint passes;
- `git diff --check` passes;
- browser quote flow passes at desktop and mobile;
- no unrelated architecture or scope expansion occurs.

**Copilot must not commit or push.**

**Proposed commit message after Architect Acceptance:**

`feat(integration): connect accommodation selection to pricing`