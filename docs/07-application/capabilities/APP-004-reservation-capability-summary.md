# APP-004
# Reservation Capability Summary

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Capability | APP-004 |
| Title | Reservation Capability Summary |
| Status | Version 1.0 Approved |
| Owner | Application Architecture |
| Layer | Application Layer |
| Related | APP-000 Application Layer Standard |
| Related | APP-001A – APP-001E |
| Related | APP-003 Journey Capability |
| Related | INT-000 External Provider Integration Standard |

---

# Purpose

The Reservation Capability is responsible for transforming composed journeys into commercially valid reservations.

It coordinates validation, policy evaluation, aggregate construction, presentation and booking integration through immutable application models and provider-independent orchestration.

The Reservation Capability is the transactional core of GCT Core.

---

# Capability Responsibilities

The Reservation Capability is responsible for:

- Reservation aggregate construction
- Reservation snapshot management
- Reservation validation
- Commercial policy evaluation
- Reservation construction
- Reservation orchestration
- Reservation presentation
- Booking integration orchestration

The capability is not responsible for:

- Journey composition
- Accommodation discovery
- Supplier-specific booking implementations
- Payment processing
- Persistence
- User interface rendering

---

# Architectural Overview

```text
Reservation Request

        │

        ▼

Validation Pipeline

        │

        ▼

Policy Pipeline

        │

        ▼

Reservation Builder

        │

        ▼

Reservation Aggregate

        │

        ▼

Reservation Service

        │

        ▼

Presentation Pipeline

        │

        ▼

Booking Integration

        │

        ▼

Integration Layer
```

The Reservation Capability coordinates the complete transactional workflow while remaining independent of supplier implementations.

---

# Capability Components

## Reservation Aggregate

The immutable aggregate root representing a commercial reservation.

The aggregate owns:

- reservation identity
- journey snapshot
- traveller snapshots
- accommodation snapshots
- pricing snapshot
- payment snapshot
- reservation metadata
- reservation timeline

---

## Snapshot Model Library

Provides immutable reservation snapshots representing the commercial state of a reservation.

Includes:

- Reservation Snapshot
- Journey Snapshot
- Traveller Snapshot
- Accommodation Snapshot
- Pricing Snapshot
- Payment Snapshot
- Supplier Reference
- Reservation Timeline
- Reservation Metadata

Snapshots preserve the commercial state at the time of reservation.

---

## Validation Pipeline

Coordinates specialised validators.

Responsibilities include:

- reservation request validation
- snapshot validation
- commercial integrity validation

Validation ensures structural correctness and transactional consistency.

---

## Policy Framework

Evaluates whether a reservation is permitted to proceed.

Supports:

- eligibility policies
- commercial policies
- supplier policies
- payment policies
- amendment policies
- cancellation policies

Policies determine commercial permission.

---

## Reservation Builder

Constructs immutable Reservation aggregates from validated requests and approved policy outcomes.

The builder:

- assembles snapshots
- initialises metadata
- initialises timeline
- invokes aggregate validation

The builder performs construction only.

---

## Reservation Service

Coordinates the complete reservation workflow.

Invokes:

- validation pipeline
- policy pipeline
- reservation builder

Returns immutable reservation results.

The service contains no business rules.

---

## Presentation Pipeline

Transforms reservation results into reusable presentation models.

Includes:

- ReservationPresentationModel
- ReservationLifecyclePresentationModel
- ReservationViewModel
- ReservationPresentationMapper
- ReservationViewModelProvider

Separates commercial reservation data from operational lifecycle presentation.

---

## Booking Integration

Coordinates booking operations through provider-independent contracts.

Includes:

- BookingIntegrationOrchestrator
- BookingGateway
- BookingIntegrationContext
- BookingIntegrationResult

Supplier implementations remain within the Integration Layer.

---

# Canonical Execution Flow

```text
Reservation Request

        │

        ▼

Validation Pipeline

        │

        ▼

Policy Pipeline

        │

        ▼

Reservation Builder

        │

        ▼

Reservation Aggregate

        │

        ▼

Reservation Service

        │

        ▼

Presentation Pipeline

        │

        ▼

Booking Integration

        │

        ▼

External Provider
```

Each stage performs a single architectural responsibility.

---

# Design Principles

The Reservation Capability follows the core Application Layer principles:

- Stateless orchestration
- Immutable aggregates
- Immutable snapshots
- Constructor dependency injection
- Provider independence
- Transactional integrity
- Strict separation of concerns
- Canonical application models
- Presentation isolation

---

# Key Architectural Decisions

## Snapshot-Based Reservation Model

Reservations store immutable commercial snapshots.

Subsequent supplier changes do not alter the historical reservation.

---

## Validation Before Construction

Validation completes before any reservation is built.

Builders never perform validation.

---

## Policy-Driven Commercial Decisions

Commercial permission is evaluated through specialised policy pipelines.

Reservation construction remains independent of business policies.

---

## Builder Pattern

Reservations are constructed through the Reservation Builder.

Construction remains separate from orchestration.

---

## Service-Oriented Orchestration

The Reservation Service coordinates workflows but contains no business rules.

---

## Provider Independence

Booking is executed through the BookingGateway abstraction.

The Reservation Capability never depends upon supplier implementations.

---

## Presentation Separation

Commercial reservation information and lifecycle presentation are represented by separate presentation models.

---

# Capability Milestones

| Milestone | Description |
|-----------|-------------|
| APP-004.1 | Reservation Aggregate |
| APP-004.2 | Reservation Snapshot Model Library |
| APP-004.3 | Reservation Validation Pipeline |
| APP-004.4 | Reservation Policy Framework |
| APP-004.5 | Reservation Builder |
| APP-004.6 | Reservation Service |
| APP-004.7 | Reservation Presentation Pipeline |
| APP-004.8 | Booking Integration |

---

# Relationships

The Reservation Capability consumes:

- Journey Capability
- Accommodation Capability

The Reservation Capability provides services to:

- Booking Integration Layer
- Future Payment Capability
- Future Customer Portal
- Future Agent Console
- Future Operations Dashboard

The Reservation Capability remains provider-independent.

---

# Extension Points

The architecture supports future additions including:

- Reservation amendments
- Reservation cancellations
- Multi-provider booking
- Payment orchestration
- Refund workflows
- Voucher generation
- Travel documentation
- Event publication
- AI-assisted reservation management

These enhancements extend the capability without changing its public contracts.

---

# Verification

The Reservation Capability has been fully verified according to ENG-002.

Verification included:

- Focused unit tests
- Targeted regression tests
- Production builds
- Full regression suites
- Runtime startup verification
- Health endpoint verification

---

# Version 1.0 Status

The Reservation Capability is complete and approved as Version 1.0.

All implementation milestones have been delivered, verified and integrated into GCT Core.

The capability provides the canonical transactional reservation services for the platform and bridges Journey Composition with external booking providers through provider-independent integration contracts.

---

# Related Documents

- APP-000 – Application Layer Standard
- APP-001A – Application Service Pattern
- APP-001B – Application Policy Pattern
- APP-001C – Application Validation Pattern
- APP-001D – Application Result Pattern
- APP-001E – Application Presentation Pattern
- APP-003 – Journey Capability Summary
- INT-000 – External Provider Integration Standard
- ENG-001 – Engineering Development Lifecycle
- ENG-002 – Engineering Verification Standard