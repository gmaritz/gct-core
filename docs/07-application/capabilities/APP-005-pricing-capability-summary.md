# APP-005
# Pricing Capability Summary

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Capability | APP-005 |
| Title | Pricing Capability Summary |
| Status | Version 1.0 Approved |
| Owner | Application Architecture |
| Layer | Application Layer |
| Conforms To | APP-000 Application Layer Standard |
| Related Standards | APP-001A, APP-001B, APP-001C, APP-001D, APP-001E |
| Previous Capability | APP-004 Reservation Capability |
| Next Capability | APP-006 Payment Capability |

---

# Purpose

The Pricing Capability is responsible for the commercial valuation of travel products within GCT Core.

It transforms composed journeys into commercially priced quotations through a provider-independent, immutable and fully orchestrated pricing pipeline.

Pricing owns commercial valuation.

It does not own reservations, bookings, payments or supplier communication.

---

# Business Responsibilities

The Pricing Capability is responsible for:

- accommodation pricing
- experience pricing
- package pricing
- commercial pricing strategies
- taxation
- fees
- discounts
- promotions
- markups
- commissions
- pricing aggregation
- quotation creation
- pricing presentation

The capability is not responsible for:

- journey composition
- reservation management
- payment processing
- booking confirmation
- supplier communication

---

# Capability Architecture

```text
Journey

        │

        ▼

Pricing Request

        │

        ▼

Validation Pipeline

        │

        ▼

Policy Framework

        │

        ▼

Pricing Strategy Set

        │

        ▼

Calculator Framework

        │

        ▼

Pricing Engine

        │

        ▼

Pricing Aggregate

        │

        ▼

Presentation Pipeline

        │

        ▼

Quote Integration
```

Each stage performs a single architectural responsibility.

---

# Capability Components

## APP-005.1 Pricing Aggregate

Owns the immutable commercial pricing outcome.

Responsibilities include:

- pricing summary
- pricing breakdown
- taxes
- fees
- discounts
- markups
- commissions
- totals
- metadata

---

## APP-005.2 Pricing Model Library

Provides the canonical financial language of GCT Core.

Includes:

- Money
- Currency
- Exchange Rate
- Tax
- Fee
- Discount
- Markup
- Commission
- Pricing Breakdown
- Pricing Summary
- Quote

This model library is reused by future commercial capabilities.

---

## APP-005.3 Pricing Validation Pipeline

Provides layered commercial validation.

Validation stages:

- Request Validation
- Commercial Validation
- Pricing Integrity Validation
- Quote Readiness Validation

Validation ensures commercial correctness before pricing execution.

---

## APP-005.4 Pricing Policy Framework

Determines applicable pricing strategies.

Produces immutable PricingStrategySet instances.

Policies select commercial strategies.

Policies never perform calculations.

---

## APP-005.5 Pricing Calculator Framework

Executes commercial calculations through a deterministic calculator pipeline.

Calculator families include:

- Accommodation Calculator
- Experience Calculator
- Promotion Calculator
- Discount Calculator
- Tax Calculator
- Markup Calculator
- Commission Calculator
- Total Calculator

Calculators enrich immutable calculation contexts.

---

## APP-005.6 Pricing Engine

Coordinates the complete pricing workflow.

Execution order:

1. Validation
2. Policy Evaluation
3. Calculator Pipeline
4. Aggregate Construction
5. Result

The engine performs orchestration only.

---

## APP-005.7 Pricing Presentation Pipeline

Transforms Pricing aggregates into immutable presentation models.

Components include:

- Pricing Presentation Mapper
- Pricing Summary Presentation Model
- Pricing Breakdown Presentation Model
- Quote Presentation Model
- Pricing View Model Provider

Presentation contains no commercial logic.

---

## APP-005.8 Quote Integration

Transforms Pricing Engine results into provider-independent Quote artefacts.

Responsibilities include:

- quote context creation
- quote lifecycle
- quote reference generation
- immutable quote construction

Quote Integration does not create reservations or bookings.

---

# Canonical Execution Flow

```text
Journey

        │

        ▼

Pricing Request

        │

        ▼

Validation

        │

        ▼

Policy Evaluation

        │

        ▼

Pricing Strategy Set

        │

        ▼

Calculator Pipeline

        │

        ▼

Pricing Aggregate

        │

        ▼

Presentation

        │

        ▼

Quote
```

---

# Design Principles

The Pricing Capability follows the Application Layer standards:

- Stateless orchestration
- Immutable models
- Constructor dependency injection
- Provider independence
- Deterministic execution
- Calculator composition
- Layered validation
- Strategy-based policy selection
- Presentation isolation
- Quote independence

---

# Architectural Decisions

## Commercial Separation

Pricing determines commercial value.

Reservations consume pricing.

Payments consume reservations.

Each capability owns a distinct business responsibility.

---

## Canonical Financial Language

All monetary values are represented using immutable canonical financial models.

Primitive monetary values are not exposed through public application contracts.

---

## Layered Validation

Commercial validation is separated into:

- structural validation
- commercial validation
- pricing integrity
- quote readiness

Each validator owns one responsibility.

---

## Strategy-Based Policies

Policies determine which pricing strategies apply.

Policies do not perform calculations.

---

## Pipeline-Based Calculation

Pricing calculations execute through a deterministic calculator pipeline.

Each calculator performs exactly one commercial responsibility.

---

## Pure Orchestration

The Pricing Engine coordinates application services.

It contains no commercial calculations.

---

## Presentation Isolation

Presentation models remain independent of commercial calculations.

---

## Quote Independence

Quotes are first-class commercial artefacts.

Quotes precede reservations.

Reservations precede bookings.

---

# Capability Relationships

The Pricing Capability consumes:

- Accommodation Capability
- Journey Capability

The Pricing Capability provides services to:

- Reservation Capability
- Future Payment Capability
- Future Invoicing Capability
- Future Revenue Capability
- Future CRM Capability

---

# Capability Deliverables

| Milestone | Status |
|-----------|--------|
| APP-005.1 Pricing Aggregate | Approved |
| APP-005.2 Pricing Model Library | Approved |
| APP-005.3 Pricing Validation Pipeline | Approved |
| APP-005.4 Pricing Policy Framework | Approved |
| APP-005.5 Pricing Calculator Framework | Approved |
| APP-005.6 Pricing Engine | Approved |
| APP-005.7 Pricing Presentation Pipeline | Approved |
| APP-005.8 Quote Integration | Approved |

---

# Verification Summary

Capability verification completed successfully.

Verification included:

- Focused unit testing
- Targeted regression testing
- Production build verification
- Full regression testing
- Runtime startup verification
- Health endpoint verification

Final verification status:

- 50 test suites passed
- 259 tests passed
- Production build successful
- Runtime startup successful
- Health endpoint returned **UP**

---

# Future Evolution

The Pricing Capability has been designed to support future extensions including:

- Dynamic pricing
- Revenue management
- Corporate pricing
- Loyalty pricing
- AI-assisted pricing
- Multi-currency pricing
- Yield management
- Real-time exchange rates
- Promotional campaign management

These enhancements can be introduced without changing the public capability contracts.

---

# Version 1.0 Approval

The Pricing Capability is approved as Version 1.0.

It establishes the canonical commercial architecture of GCT Core by separating validation, commercial strategy selection, pricing calculation, orchestration, presentation and quotation into independent, provider-independent application services.

The capability forms the commercial foundation upon which future Payment, Invoicing, Revenue Management and Financial Reporting capabilities will be built.

---

# Related Documents

- APP-000 – Application Layer Standard
- APP-001A – Application Service Pattern
- APP-001B – Application Policy Pattern
- APP-001C – Application Validation Pattern
- APP-001D – Application Result Pattern
- APP-001E – Application Presentation Pattern
- APP-002 – Accommodation Capability Summary
- APP-003 – Journey Capability Summary
- APP-004 – Reservation Capability Summary
- ENG-001 – Engineering Development Lifecycle
- ENG-002 – Engineering Verification Standard