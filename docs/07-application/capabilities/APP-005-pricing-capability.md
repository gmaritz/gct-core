# APP-005
# Pricing Capability

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Capability | APP-005 |
| Title | Pricing Capability |
| Status | Version 1.0 Approved |
| Owner | Application Architecture |
| Layer | Application Layer |
| Related | APP-000 Application Layer Standard |
| Related | APP-001A – APP-001E |
| Related | APP-002 Accommodation Capability |
| Related | APP-003 Journey Capability |
| Related | APP-004 Reservation Capability |

---

# Purpose

The Pricing Capability is responsible for determining the commercial value of travel products within GCT Core.

It calculates, aggregates and presents prices using canonical application models while remaining independent of supplier-specific pricing implementations.

The Pricing Capability is the commercial decision engine of the platform.

---

# Capability Responsibilities

The Pricing Capability is responsible for:

- Price calculation
- Price aggregation
- Package pricing
- Accommodation pricing
- Experience pricing
- Tax calculation
- Fee calculation
- Discount calculation
- Promotion evaluation
- Markup calculation
- Commission calculation
- Currency handling
- Quote generation
- Pricing presentation

The capability is not responsible for:

- Accommodation availability
- Journey composition
- Reservation management
- Payment processing
- Supplier communication
- User interface rendering

---

# Architectural Overview

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

Pricing Calculator Framework

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

The Pricing Capability transforms travel products into commercially priced offers through provider-independent application services.

---

# Capability Components

## Pricing Aggregate

Represents the complete commercial pricing outcome.

The aggregate owns:

- calculated totals
- pricing breakdown
- taxes
- fees
- discounts
- commissions
- markups
- currency
- pricing metadata

---

## Pricing Model Library

Provides canonical pricing models.

Includes:

- pricing request
- pricing result
- pricing breakdown
- money
- tax
- fee
- discount
- markup
- commission
- currency
- quote

---

## Validation Pipeline

Coordinates pricing validation.

Responsibilities include:

- pricing request validation
- pricing completeness
- currency validation
- commercial consistency

Validation ensures pricing correctness before calculation.

---

## Policy Framework

Evaluates commercial pricing policies.

Supports:

- pricing eligibility
- promotion policies
- discount policies
- commission policies
- markup policies
- taxation policies

Policies determine commercial pricing rules.

---

## Pricing Calculator Framework

Coordinates specialised pricing calculators.

Supports:

- accommodation calculator
- experience calculator
- package calculator
- tax calculator
- fee calculator
- discount calculator
- markup calculator
- commission calculator
- total calculator

Each calculator performs one commercial responsibility.

---

## Pricing Engine

Coordinates the complete pricing workflow.

Invokes:

- validation
- policy evaluation
- calculator framework
- aggregate construction

Returns immutable pricing results.

The engine contains no pricing rules directly.

---

## Presentation Pipeline

Transforms pricing results into presentation models.

Includes:

- PricingPresentationModel
- PricingBreakdownPresentationModel
- QuotePresentationModel
- PricingViewModelProvider

Separates pricing calculations from presentation.

---

## Quote Integration

Coordinates provider-independent quotation workflows.

Provides:

- quotation generation
- quotation updates
- quotation lifecycle

Supplier-specific implementations remain outside the Application Layer.

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

Calculator Framework

        │

        ▼

Pricing Aggregate

        │

        ▼

Pricing Engine

        │

        ▼

Presentation Pipeline

        │

        ▼

Quote Integration
```

Each stage performs one architectural responsibility.

---

# Design Principles

The Pricing Capability follows the core Application Layer principles:

- Stateless orchestration
- Immutable pricing models
- Constructor dependency injection
- Provider independence
- Calculator composition
- Canonical application models
- Strict separation of concerns
- Presentation isolation

---

# Key Architectural Decisions

## Pricing is a Business Capability

Pricing exists independently of Reservation.

Reservations consume pricing.

Pricing does not consume reservations.

---

## Calculator Composition

Commercial calculations are delegated to specialised calculators.

The Pricing Engine coordinates calculators but performs no calculations itself.

---

## Canonical Money Models

All monetary values use canonical Money value objects.

No primitive currency calculations are exposed.

---

## Commercial Policy Separation

Pricing policies remain independent from pricing calculations.

Policies decide whether commercial rules apply.

Calculators perform calculations.

---

## Provider Independence

Supplier pricing implementations remain isolated behind provider contracts.

The Pricing Capability consumes canonical pricing models only.

---

## Presentation Separation

Pricing calculations remain independent of presentation.

Presentation models are generated after pricing completes.

---

# Capability Milestones

| Milestone | Description |
|-----------|-------------|
| APP-005.1 | Pricing Aggregate |
| APP-005.2 | Pricing Model Library |
| APP-005.3 | Pricing Validation Pipeline |
| APP-005.4 | Pricing Policy Framework |
| APP-005.5 | Pricing Calculator Framework |
| APP-005.6 | Pricing Engine |
| APP-005.7 | Pricing Presentation Pipeline |
| APP-005.8 | Quote Integration |

---

# Relationships

The Pricing Capability consumes:

- Accommodation Capability
- Journey Capability

The Pricing Capability provides services to:

- Reservation Capability
- Future Payment Capability
- Future Quotation Capability
- Future Customer Portal
- Future CRM Capability

The Pricing Capability remains provider-independent.

---

# Extension Points

The architecture supports future additions including:

- Dynamic pricing
- Yield management
- Promotional campaigns
- Loyalty pricing
- Corporate pricing
- Regional pricing
- AI-assisted pricing optimisation
- Multi-currency pricing
- Real-time exchange rates
- Revenue management

These enhancements extend the capability without changing its public contracts.

---

# Verification

The Pricing Capability shall be verified according to ENG-002.

Verification shall include:

- Focused unit tests
- Targeted regression tests
- Production builds
- Full regression suites
- Runtime startup verification
- Health endpoint verification

---

# Version 1.0 Status

The Pricing Capability defines the canonical commercial pricing architecture for GCT Core.

Implementation milestones will establish provider-independent pricing services that transform travel products into commercially valid quotations while remaining fully aligned with the Application Layer standards.

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
- INT-000 – External Provider Integration Standard
- ENG-001 – Engineering Development Lifecycle
- ENG-002 – Engineering Verification Standard