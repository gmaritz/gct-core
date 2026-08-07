# APP-001F
# Application Standard
## Cross-Capability Architecture Patterns

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Document | APP-001F |
| Title | Cross-Capability Architecture Patterns |
| Status | Version 1.0 Approved |
| Owner | Application Architecture |
| Layer | Application Layer |

---

# Purpose

This document identifies architectural patterns that have been implemented consistently across multiple Application Capabilities and promotes them to canonical Application Standards.

The objective is to maximise consistency, maintainability, and reuse across future capabilities.

---

# Standard 1
## Layered Capability Architecture

Every major Application Capability shall follow the canonical layered structure.

```text
Request

    │

    ▼

Validation

    │

    ▼

Policy

    │

    ▼

Framework

    │

    ▼

Engine / Service

    │

    ▼

Aggregate

    │

    ▼

Presentation

    │

    ▼

Integration
```

Not every capability requires every layer, but the ordering shall remain consistent.

---

# Standard 2
## Immutable Aggregate Pattern

Observed in:

- Journey
- Reservation
- Pricing

Rules:

- readonly properties
- readonly collections
- defensive copying
- immutable snapshots
- create() and restore() constructors

This is now the canonical aggregate standard.

---

# Standard 3
## Validation Pipeline Pattern

Observed in:

- Journey
- Reservation
- Pricing

Structure:

```text
Request

↓

Validator 1

↓

Validator 2

↓

Validator 3

↓

Validation Result
```

Rules:

- Stateless validators
- Constructor injection
- Immutable validation results
- Fail-fast on critical errors
- One responsibility per validator

---

# Standard 4
## Policy Framework Pattern

Observed in:

- Journey
- Reservation
- Pricing

Structure:

```text
Registry

↓

Ordered Policies

↓

Policy Pipeline

↓

Policy Result
```

Rules:

- Registry owned
- Deterministic execution
- Priority ordering
- Critical-denial short circuit
- Immutable policy result

Policies select strategy.

Policies never execute business logic directly.

---

# Standard 5
## Registry Pattern

Observed in:

- Provider Registry
- Journey Policy Registry
- Reservation Policy Registry
- Pricing Policy Registry
- Pricing Calculator Registry

Canonical responsibilities:

- register
- unregister
- resolve
- resolveAll

Rules:

- Duplicate rejection
- Immutable collections
- Deterministic ordering

---

# Standard 6
## Pipeline Pattern

Observed in:

- Journey Composition
- Pricing Calculation

Structure:

```text
Context

↓

Pipeline Stage

↓

Enriched Context

↓

Pipeline Stage

↓

Result
```

Rules:

- Stateless stages
- Immutable contexts
- One responsibility
- No stage instantiates another

---

# Standard 7
## Context Pattern

Observed in:

- JourneyCompositionContext
- AccommodationCompositionContext
- PricingCalculationContext
- PricingEngineContext
- QuoteContext

Rules:

Contexts represent the mutable business process as immutable snapshots.

Each processing stage returns a new context.

Contexts are orchestration state, not domain entities.

---

# Standard 8
## Factory Pattern

Observed in:

- JourneyFactory
- ReservationBuilder
- QuoteFactory

Rules:

Factories construct aggregates or application artefacts.

Factories never:

- validate
- execute policies
- orchestrate services

---

# Standard 9
## Orchestration Pattern

Observed in:

- Journey Composition Service
- Reservation Service
- Pricing Engine

Rules:

Services coordinate.

Services never:

- validate directly
- calculate directly
- execute policy logic
- compose providers

---

# Standard 10
## Presentation Pattern

Observed in:

- Journey
- Reservation
- Pricing

Structure:

```text
Aggregate

↓

Presentation Mapper

↓

Presentation Model

↓

ViewModel Provider

↓

ViewModel
```

Rules:

Presentation contains no business logic.

Presentation is UI-independent.

---

# Standard 11
## Integration Pattern

Observed in:

- Accommodation Provider Integration
- Booking Integration
- Quote Integration

Rules:

Integration layers:

- consume application services
- transform results
- expose provider-independent contracts

Integration layers never own business rules.

---

# Standard 12
## Result Pattern

Observed in every capability.

Rules:

Results contain:

- success
- payload
- warnings
- metadata

Results never expose mutable state.

---

# Standard 13
## Dependency Injection Pattern

Observed across all capabilities.

Rules:

All dependencies shall be constructor injected.

No application service shall instantiate collaborators.

---

# Standard 14
## Namespace Structure

Every capability shall use:

```text
aggregate/

models/

validation/

policies/

framework/

engine/

presentation/

integration/
```

Capability-specific folders may extend this structure.

---

# Standard 15
## Verification Pattern

Every milestone shall include:

Focused tests

↓

Production build

↓

Full regression

↓

Startup smoke

↓

Implementation report

No milestone is complete without successful verification.

---

# Standard 16
## Report Pattern

Every implementation milestone produces:

```text
APP-RPT-xxxx
```

The report records:

- implementation
- verification
- evidence
- deliverables

Reports form part of the permanent engineering record.

---

# Standard 17
## Naming Conventions

Avoid generic helper names.

Prefer capability-qualified helpers.

Examples:

```text
withJourney...

withReservation...

withPricing...

withEngine...

withPresentation...
```

Never expose helpers such as:

```text
withResult()

withContext()

withValidation()
```

These become collision-prone as the platform grows.

---

# Capability Maturity Assessment

| Pattern | Status |
|----------|--------|
| Validation Pipeline | Mature |
| Policy Framework | Mature |
| Registry | Mature |
| Pipeline | Mature |
| Context | Mature |
| Factory | Mature |
| Aggregate | Mature |
| Presentation | Mature |
| Result | Mature |
| Orchestration | Mature |
| Integration | Mature |
| Verification | Mature |

All listed patterns are now promoted to canonical Application Standards.

---

# Version 1.0 Approval

The Application Layer has demonstrated these patterns consistently across:

- APP-002 Accommodation
- APP-003 Journey
- APP-004 Reservation
- APP-005 Pricing

These patterns are now considered stable architectural standards for all future Application Capabilities.