# Copilot Implementation — CUR-002: Configurable Accommodation Currency Reconciliation

## Objective

Implement a production-ready currency reconciliation capability that allows the Signature Cape Winelands Journey quote to combine Hotelbeds accommodation prices with the Go Cape Tours journey component.

The immediate requirement is to complete the customer journey using:

**EUR 1.00 = ZAR 18.60**

This must be implemented as a configurable, explicitly authorised conversion policy — not as a hardcoded workaround.

## Mandatory development workflow

Follow `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md` as the single source of truth for the development workflow.

Before implementation, inspect:
- CUR-001 and its currency integrity requirements.
- The existing pricing and quote implementation.
- `Money` and currency-related value objects.
- Accommodation pricing and supplier amount snapshots.
- Reservation persistence and quote persistence.
- Existing configuration and environment variable conventions.

Do not redesign unrelated functionality.

## Required business rules

### 1. ZAR production pricing

When both the Go Cape Tours journey component and Hotelbeds accommodation prices are ZAR:

- Add the amounts directly.
- Do not perform currency conversion.
- Preserve the existing CUR-001 currency integrity rules.

This is the expected production operating model.

### 2. Explicit EUR-to-ZAR conversion

When Hotelbeds returns EUR and the Go Cape Tours journey component is ZAR:

- Convert the supplier accommodation amount using the explicitly configured rate.
- Initial configured rate: `1 EUR = 18.60 ZAR`.
- Add the converted accommodation amounts to the Go Cape Tours ZAR component.
- Produce one final ZAR package quote.

The conversion must apply to the accommodation amounts only. Do not convert the Go Cape Tours component.

### 3. Configuration and safeguards

Implement a clear currency reconciliation policy.

Requirements:

- Same-currency pricing must always work without conversion.
- Fixed-rate conversion must require explicit configuration.
- The configured EUR/ZAR rate must be validated as positive and finite.
- Missing, invalid or unsupported conversion configuration must fail closed.
- No automatic live exchange-rate lookup.
- No implicit conversion or default exchange rate.
- The fixed-rate policy must be independently configurable and must not be confused with the production ZAR pricing policy.
- Production configuration must be able to operate in strict same-currency mode.

Use the existing project configuration conventions. Do not introduce unnecessary infrastructure.

### 4. Pricing integrity and traceability

Preserve:

- Original Hotelbeds supplier amount.
- Original supplier currency.
- Applied exchange rate.
- Converted ZAR amount.
- Conversion policy/source identifier.
- Final Go Cape Tours package amount in ZAR.

The original supplier amount must never be overwritten by the converted amount.

The conversion details must remain available through quote generation and the canonical reservation/pricing snapshot wherever the existing model supports this.

Do not weaken CUR-001 or bypass existing currency validation.

### 5. Rounding

Use the existing Money/value-object conventions.

Apply currency-appropriate minor-unit rounding consistently. Avoid unnecessary intermediate rounding and ensure the final quote reconciles exactly with its displayed line items.

## Tests required

Add focused tests covering:

1. ZAR accommodation + ZAR journey component: direct addition, no conversion.
2. EUR accommodation + ZAR journey component: conversion at 18.60.
3. Multiple accommodation stops: each supplier amount is correctly reconciled.
4. Missing conversion configuration: fail closed.
5. Invalid or zero conversion rate: fail closed.
6. Unsupported currency pair: fail closed.
7. Original EUR supplier amounts and conversion metadata remain preserved.
8. Final quote total reconciles with its component amounts.
9. Existing CUR-001 same-currency and currency-integrity tests remain valid.

Include a quote integration test using the actual Signature Cape Winelands pricing path, with the current two-stop accommodation selection.

## Scope restrictions

- Do not change Hotelbeds availability or booking integration.
- Do not change accommodation selection.
- Do not implement multi-room frontend changes.
- Do not introduce live FX services.
- Do not change unrelated pricing behaviour.
- Do not commit or push.

## Acceptance criteria

The current customer journey must be able to:

1. Select the Stellenbosch establishment.
2. Select the Hermanus establishment.
3. Convert both EUR accommodation amounts using the configured 18.60 rate.
4. Add the converted amounts to the Go Cape Tours ZAR journey component.
5. Display one reconciled ZAR package quote.
6. Proceed to the Guest Information step.

The implementation must also preserve direct ZAR pricing for the intended production configuration.

## Verification and report

Run focused tests, full regression, type-check, production build, Prisma validation and lint.

Report:
- Files changed.
- Configuration introduced and its defaults.
- Exact conversion calculation and rounding behaviour.
- Quote integration test results.
- Full regression results.
- Any persistence changes.
- Confirmation that CUR-001 remains intact.

Stop after this implementation. Do not continue into Guest Information or later steps; we will verify the browser journey separately.