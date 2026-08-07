# APP-003
# Journey Capability Summary

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Capability | APP-003 |
| Title | Journey Capability Summary |
| Status | Version 1.0 Approved |
| Owner | Application Architecture |
| Layer | Application Layer |
| Related | APP-000 Application Layer Standard |
| Related | APP-001A – APP-001E |
| Related | APP-002 Accommodation Capability |

---

# Purpose

The Journey Capability is responsible for composing complete travel journeys from the platform's canonical business capabilities.

It transforms validated customer requirements into immutable Journey aggregates by orchestrating accommodation discovery, experience composition and business policy evaluation.

The Journey Capability contains no supplier-specific logic and no persistence responsibilities.

It represents the orchestration layer responsible for assembling complete travel experiences.

---

# Capability Responsibilities

The Journey Capability is responsible for:

- Journey composition
- Journey validation
- Journey policy evaluation
- Accommodation composition
- Experience composition
- Journey construction
- Journey presentation
- Homepage journey showcase generation

The capability is not responsible for:

- Accommodation discovery
- Reservation management
- Booking execution
- Payment processing
- Provider communication
- User interface rendering

---

# Architectural Overview

```text
Journey Request

        │

        ▼

Validation Pipeline

        │

        ▼

Policy Pipeline

        │

        ▼

Accommodation Composition

        │

        ▼

Experience Composition

        │

        ▼

Journey Factory

        │

        ▼

Journey Aggregate

        │

        ▼

Presentation Pipeline

        │

        ▼

Homepage Showcase
```

The Journey Capability composes complete travel experiences from canonical application services while remaining independent of external suppliers.

---

# Capability Components

## Journey Aggregate

The immutable aggregate root representing a composed journey.

The aggregate owns:

- destination
- itinerary
- accommodation
- experiences
- metadata
- lifecycle

---

## Journey Model Library

Provides canonical models shared across the Journey Capability.

Includes:

- journey models
- classifications
- lifecycle models
- status models
- supporting value objects

---

## Validation Pipeline

Coordinates specialised validators.

Responsibilities include:

- request validation
- composition validation
- aggregate validation

Validation ensures structural correctness.

---

## Policy Framework

Evaluates whether a journey may be composed.

Supports:

- eligibility policies
- accommodation policies
- duration policies
- experience policies
- seasonal policies

Policies determine composition permission.

---

## Accommodation Composition Adapter

Consumes canonical Accommodation application services.

Provides:

- accommodation selection
- availability composition
- rate composition

Contains no supplier logic.

---

## Experience Composition Framework

Builds canonical journey experiences through injected providers.

Supports:

- experience sequencing
- prioritisation
- composition

---

## Journey Composition Service

Coordinates the complete composition workflow.

Invokes:

- validation
- policies
- accommodation composition
- experience composition
- journey factory

Returns immutable Journey results.

---

## Presentation Pipeline

Transforms Journey results into presentation models.

Includes:

- JourneyPresentationModel
- HomepageJourneyViewModel
- JourneyViewModelProvider

---

## Homepage Showcase

Produces featured journeys for homepage merchandising.

Combines:

- editorial content
- composed journeys
- presentation models

---

# Canonical Execution Flow

```text
Journey Request

        │

        ▼

Validation

        │

        ▼

Policy Evaluation

        │

        ▼

Accommodation Composition

        │

        ▼

Experience Composition

        │

        ▼

Journey Factory

        │

        ▼

Journey Aggregate

        │

        ▼

Presentation Pipeline

        │

        ▼

Homepage Journey Showcase
```

Each stage performs a single architectural responsibility.

---

# Design Principles

The Journey Capability follows the core Application Layer principles:

- Stateless orchestration
- Immutable aggregates
- Constructor dependency injection
- Composition over inheritance
- Provider independence
- Strict separation of concerns
- Canonical application models
- Presentation isolation

---

# Key Architectural Decisions

## Composition Before Reservation

Journey composition is completed before reservation begins.

The Reservation Capability consumes completed journeys.

---

## Accommodation Independence

Accommodation information is obtained exclusively through the Accommodation Capability.

The Journey Capability never communicates with providers directly.

---

## Policy-Driven Composition

Business rules are evaluated through specialised policy pipelines.

Composition logic remains separate from policy evaluation.

---

## Immutable Aggregate

The Journey Aggregate is immutable after construction.

Construction occurs exclusively through the Journey Factory.

---

## Presentation Separation

Presentation models are distinct from application models.

View models remain channel-specific.

---

# Capability Milestones

| Milestone | Description |
|-----------|-------------|
| APP-003.1 | Journey Aggregate |
| APP-003.2 | Journey Model Library |
| APP-003.3 | Journey Validation Pipeline |
| APP-003.4 | Journey Policy Framework |
| APP-003.5 | Accommodation Composition Adapter |
| APP-003.6 | Experience Composition Framework |
| APP-003.7 | Journey Composition Service & Factory |
| APP-003.8 | Journey Presentation Pipeline |
| APP-003.9 | Homepage Journey Showcase Integration |

---

# Relationships

The Journey Capability consumes:

- Accommodation Capability

The Journey Capability provides services to:

- Reservation Capability
- Homepage Merchandising
- Future Package Builder
- Future Quotation Capability

The Journey Capability remains provider-independent.

---

# Extension Points

The architecture supports future additions including:

- AI itinerary optimisation
- Dynamic experience selection
- Alternative journey generation
- Multi-destination journeys
- Seasonal optimisation
- Personalisation
- Recommendation engines

These enhancements extend the capability without changing its public contracts.

---

# Verification

The Journey Capability has been fully verified according to ENG-002.

Verification included:

- Focused unit tests
- Targeted regression tests
- Production builds
- Full regression suites
- Runtime startup verification
- Health endpoint verification

---

# Version 1.0 Status

The Journey Capability is complete and approved as Version 1.0.

All implementation milestones have been delivered, verified and integrated into GCT Core.

The capability provides the canonical journey composition services for the platform and forms the bridge between Accommodation discovery and Reservation management.

---

# Related Documents

- APP-000 – Application Layer Standard
- APP-001A – Application Service Pattern
- APP-001B – Application Policy Pattern
- APP-001C – Application Validation Pattern
- APP-001D – Application Result Pattern
- APP-001E – Application Presentation Pattern
- APP-002 – Accommodation Capability Summary
- INT-000 – External Provider Integration Standard
- ENG-001 – Engineering Development Lifecycle
- ENG-002 – Engineering Verification Standard