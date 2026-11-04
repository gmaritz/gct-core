# CUR-001 — Supplier Currency Preservation and Pricing Boundary Integrity

**Specification ID:** CUR-001  
**Title:** Supplier Currency Preservation and Pricing Boundary Integrity  
**Status:** Approved for implementation  
**Type:** Focused application implementation  
**Priority:** High  
**Scope:** Hotelbeds supplier currency handling and APP-005 pricing integrity

## 1. Objective

Establish reliable currency preservation and validation across the Hotelbeds accommodation integration and GCT Core commercial pricing boundary.

Hotelbeds has confirmed that its testing environment accounts operate in EUR and cannot be configured to another currency. Production accounts can be configured in the preferred operating currency. GCT Core's intended production operating currency is ZAR.

The implementation must allow EUR supplier responses to be mapped and preserved correctly while ensuring that incompatible currencies cannot silently enter ZAR commercial pricing.

The implementation must also close the identified APP-005 adapter integrity gap: mixed-currency room rates must not be aggregated under a single currency.

## 2. Mandatory Development Governance

Follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

as the single source of truth for the development workflow.

Follow the established workflow:

1. Specification.
2. Copilot implementation.
3. Focused tests and full regression.
4. Copilot implementation report.
5. Architect acceptance or rejection.
6. User commit after architect acceptance.

This specification is approved for implementation. Do not introduce an additional approval stage.

ChatGPT acts as system architect. Copilot acts as implementation architect and developer.

Do not commit or push. The user performs the commit after architect acceptance.

## 3. Repository and Existing Implementation

Before implementation, inspect the existing code and the current working tree.

Relevant areas identified during the architecture investigation include:

- `availability-response.mapper.ts`
- `hotelbeds-availability-response-mapper.test.ts`
- `money.ts`
- `currency.ts`
- `exchange-rate.ts`
- `accommodation-pricing-input.ts`
- `pricing-integrity-validator.ts`
- `journey-quote-service.ts`
- `journey-quote-service.test.ts`
- `frontend.controller.ts`
- `reservation-review-service.ts`
- Existing reservation handoff and canonical Reservation repository tests.

These names are investigation references. Locate the actual repository paths and follow current implementation conventions rather than assuming paths or interfaces.

The working tree contains substantial uncommitted INT-004.4 work. Preserve it.

In particular:

- Do not revert or overwrite existing changes.
- Do not stage unrelated files.
- Do not use `git add .` or `git add -A`.
- Do not modify the untracked INT-004.4 specification.
- Do not modify `public/hotelbeds/Destination Code.docx`.
- Do not modify `.env`, credentials, certificates, or TLS configuration.

## 4. Functional Requirements

### CUR-001.1 — Preserve Hotelbeds supplier currency

Verify and test that the Hotelbeds Availability response mapper:

- Reads the supplier amount from the existing authoritative response field.
- Reads the currency from the supplier response.
- Preserves the original amount and currency without conversion.
- Supports EUR as a valid supplier currency.
- Continues to support ZAR.
- Does not substitute ZAR when currency is missing or invalid.
- Does not silently interpret EUR amounts as ZAR.

Add a deterministic EUR response fixture to the existing mapper test suite.

The test must demonstrate that an EUR response produces a canonical supplier rate retaining the original EUR amount and currency.

Keep the existing ZAR fixtures and behaviour unchanged.

Do not introduce a new supplier response mapping strategy.

### CUR-001.2 — Preserve the commercial currency mismatch safeguard

The commercial pricing workflow must continue to reject supplier accommodation currency that is incompatible with the commercial request currency.

For the existing ZAR Cape Winelands commercial pricing workflow:

- EUR supplier accommodation must not produce a ZAR quotation.
- The original EUR amount and currency must remain available in the supplier data.
- The outcome must remain `CURRENCY_UNCONFIRMED`.
- The applicable HTTP response must remain 409.
- The pricing engine must not be invoked with incompatible monetary components.

Add a focused route/controller integration test that supplies an EUR canonical supplier offer through the existing supported test boundary and verifies the resulting HTTP 409 behaviour.

The test must demonstrate the actual application path rather than only testing an isolated error mapper.

Do not change the existing currency error contract or weaken existing safeguards.

### CUR-001.3 — APP-005 mixed-currency adapter integrity

The architecture investigation identified a boundary weakness in:

`withAccommodationPricingInputs`

and its associated `componentFromInput` behaviour.

The adapter aggregates `roomRates` while taking the currency from the aggregate input. It does not independently verify that every individual room rate has the same currency.

The normal journey currently performs upstream validation, but the adapter must not silently aggregate mixed-currency monetary amounts when called directly.

Implement the smallest appropriate guard so that:

1. Every room rate included in a single accommodation pricing component has a valid currency.
2. Every room rate currency matches the expected aggregate accommodation currency.
3. Mixed-currency room-rate lists are rejected before aggregation.
4. The failure uses the existing domain error and error-handling conventions where appropriate.
5. No monetary values are converted or re-labelled.
6. Existing valid single-currency pricing inputs continue to work unchanged.

Add direct adapter tests covering:

- Multiple ZAR room rates: accepted.
- Multiple EUR room rates with EUR aggregate currency: accepted where the adapter contract permits it.
- ZAR and EUR room rates in the same aggregate: rejected.
- Aggregate currency differs from all or some room-rate currencies: rejected.
- Missing or invalid room-rate currency: rejected according to existing domain conventions.

Do not duplicate validation unnecessarily if an existing shared validator can enforce the same invariant cleanly.

The guard must be enforced at the adapter boundary, not solely in the journey quote service.

### CUR-001.4 — Reservation supplier currency preservation

Inspect the existing accommodation reservation handoff and canonical Reservation snapshot implementation.

Determine whether supplier amount and currency can be preserved independently of the commercial quote currency.

Where the existing snapshot model supports it, add a focused EUR round-trip test demonstrating that:

- The original supplier amount remains EUR-denominated.
- The original supplier currency remains EUR.
- The snapshot can be serialized and reconstructed without losing or changing the monetary values.
- Existing ZAR reservation behaviour remains unchanged.

Do not introduce schema changes or migrations merely to add this test.

If the current architecture prevents a valid EUR supplier snapshot from reaching the repository, test the repository boundary directly with a valid canonical snapshot, where appropriate.

Do not bypass domain invariants or invent invalid Reservation states.

Report any genuine persistence limitation rather than expanding the scope.

### CUR-001.5 — Existing ZAR commercial pricing

Preserve the current APP-005 pricing behaviour.

Verify that:

- Valid ZAR supplier accommodation continues through the existing pricing engine.
- The final commercial package price remains ZAR.
- Existing markup, pricing, rounding, and package calculation rules remain unchanged.
- No additional exchange-rate calculation is introduced.

No change to the normal ZAR pricing calculation should be necessary for this specification.

## 5. Currency Architecture Rules

The following rules are mandatory:

| Concept | Required behaviour |
|---|---|
| Supplier amount | Preserve original amount |
| Supplier currency | Preserve original currency |
| Commercial currency | Remains explicitly defined by the pricing request |
| Currency mismatch | Reject; do not silently convert |
| Mixed room currencies | Reject before aggregation |
| ZAR commercial quotation | Continue existing ZAR pricing rules |
| ExchangeRate | Remains structural only |
| EUR-to-ZAR conversion | Not implemented by CUR-001 |

The Hotelbeds mapper must not become a currency-conversion boundary.

The `Money` value object must not be expanded to perform conversion.

The Reservation repository must not perform conversion.

The pricing engine must not automatically convert incompatible currencies.

## 6. Explicit Exclusions

CUR-001 does not authorise:

- Automatic EUR-to-ZAR conversion.
- A new exchange-rate provider or API.
- Live exchange-rate retrieval.
- An exchange-rate calculation service.
- Exchange-rate margins or buffers.
- Currency conversion configuration.
- Changes to the `Money` value object beyond what is strictly required by existing invariants.
- Changes to APP-005 commercial pricing rules.
- Changes to Hotelbeds account configuration.
- Changes to Hotelbeds API request semantics.
- Changes to Hotelbeds TLS or authentication.
- New Reservation schema fields or database migrations.
- Supplier booking, CheckRate, cancellation, payment, or confirmation operations.
- Any relaxation of INT-004.4 multi-room fail-closed behaviour.
- Any unrelated journey or frontend functionality.

A future multi-currency commercial pricing capability must be specified and approved separately, following an explicit commercial decision.

## 7. Verification Requirements

Follow the repository's prescribed verification workflow.

At minimum, run:

### Focused tests

- Hotelbeds EUR response mapper test.
- Existing Hotelbeds ZAR mapper tests.
- APP-005 accommodation pricing adapter tests.
- Journey quote currency mismatch tests.
- Controller/route HTTP 409 integration test.
- Reservation supplier currency snapshot round-trip test, if applicable.

### Regression and engineering checks

- Full test regression.
- Build.
- TypeScript/type-check.
- Prisma validation, where required by the repository workflow.
- Lint.
- `git diff --check`.

Report actual results and test counts.

Distinguish existing warnings from newly introduced warnings. Do not claim a test or check passed unless it was actually executed.

## 8. Acceptance Criteria

CUR-001 is complete only when:

1. An EUR Hotelbeds response is mapped without changing its amount or currency.
2. A ZAR Hotelbeds response continues to behave as before.
3. An EUR supplier offer cannot silently enter the ZAR commercial pricing workflow.
4. The applicable currency mismatch continues to produce `CURRENCY_UNCONFIRMED` and HTTP 409.
5. The pricing engine is not invoked with incompatible currencies.
6. The APP-005 adapter independently rejects mixed-currency room-rate aggregation.
7. Valid single-currency accommodation pricing remains functional.
8. Supplier currency can be preserved through the supported Reservation snapshot boundary, or any architectural limitation is explicitly reported.
9. No automatic currency conversion has been introduced.
10. Full regression and required engineering checks pass.
11. No unrelated changes have been introduced.
12. Existing INT-004.4 safeguards remain unchanged.

## 9. Required Copilot Implementation Report

Return a structured report containing:

1. **Disposition:** Complete or incomplete.
2. **Repository baseline:** Branch, HEAD, and working-tree status before and after.
3. **Implementation changes:** Files changed and reasons.
4. **EUR mapper evidence:** Exact test demonstrating amount and currency preservation.
5. **Currency mismatch evidence:** Exact route/controller test demonstrating HTTP 409.
6. **APP-005 adapter evidence:** Exact tests demonstrating mixed-currency rejection.
7. **Reservation evidence:** EUR snapshot preservation test or documented limitation.
8. **ZAR regression evidence:** Confirmation that existing ZAR commercial pricing remains unchanged.
9. **Verification results:** Actual test counts and engineering checks.
10. **Remaining gaps:** Anything incomplete or not verified.
11. **Git hygiene:** Confirm no files were staged, committed, or pushed and unrelated files remain untouched.
12. **Commit readiness:** State whether all CUR-001 acceptance criteria are satisfied.

Do not claim completion merely because the full test suite passes. Every acceptance criterion must be supported by implementation and test evidence.

## 10. Final Instruction

Implement only CUR-001.

Preserve existing supplier-currency data and all existing commercial pricing safeguards.

Do not introduce automatic currency conversion.

Do not commit or push.

Return the implementation report for architect review before the user commits.