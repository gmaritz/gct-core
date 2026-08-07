# APP-000
# Application Capability Dependency Map

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Document | APP-000 |
| Title | Application Capability Dependency Map |
| Status | Version 1.0 Approved |
| Owner | Application Architecture |
| Layer | Application Layer |

---

# Purpose

This document defines the canonical dependency relationships between the major Application Capabilities of GCT Core.

It establishes:

- capability responsibilities
- dependency direction
- orchestration boundaries
- permitted interactions
- future extension points

The dependency map serves as the architectural reference for Application Layer evolution.

---

# Architectural Principles

Application capabilities follow these principles:

- Dependencies flow in one direction only.
- Higher-level capabilities consume lower-level capabilities.
- Capabilities never form cyclic dependencies.
- Provider implementations remain outside the Application Layer.
- Business responsibilities remain isolated.

---

# Canonical Capability Stack

```text
                    External Providers
                            │
                            ▼
                 ┌─────────────────────┐
                 │ APP-002             │
                 │ Accommodation       │
                 └─────────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ APP-003             │
                 │ Journey             │
                 └─────────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ APP-005             │
                 │ Pricing             │
                 └─────────────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ APP-004             │
                 │ Reservation         │
                 └─────────────────────┘
                            │
                            ▼
                 Future Capabilities
```

---

# Dependency Matrix

| Capability | Depends On |
|------------|------------|
| APP-002 Accommodation | External Provider Abstractions |
| APP-003 Journey | APP-002 Accommodation |
| APP-005 Pricing | APP-002 Accommodation, APP-003 Journey |
| APP-004 Reservation | APP-003 Journey, APP-005 Pricing |

---

# Capability Responsibilities

## APP-002 Accommodation

Owns:

- supplier discovery
- accommodation content
- inventory
- rates

Provides:

- canonical accommodation models

Consumed by:

- Journey
- Pricing

---

## APP-003 Journey

Owns:

- itinerary composition
- accommodation selection
- experience composition
- journey presentation

Consumes:

- Accommodation

Provides:

- Journey Aggregate

Consumed by:

- Pricing
- Reservation

---

## APP-005 Pricing

Owns:

- commercial valuation
- pricing policies
- pricing calculations
- quotations

Consumes:

- Accommodation
- Journey

Provides:

- Pricing Aggregate
- Quote

Consumed by:

- Reservation
- Future Payment Capability

---

## APP-004 Reservation

Owns:

- reservation creation
- reservation lifecycle
- booking orchestration
- booking presentation

Consumes:

- Journey
- Pricing

Provides:

- Reservation Aggregate

Consumed by:

- Future Payment Capability
- Future CRM Capability

---

# Canonical Flow

```text
Accommodation

        │

        ▼

Journey

        │

        ▼

Pricing

        │

        ▼

Reservation
```

Business information always flows downward.

---

# Capability Interaction Map

```text
             APP-002
          Accommodation
                │
        ┌───────┴────────┐
        ▼                ▼
 APP-003 Journey    APP-005 Pricing
        │                │
        └───────┬────────┘
                ▼
      APP-004 Reservation
```

No reverse dependencies exist.

---

# Internal Capability Architecture

Each capability follows the same canonical pattern.

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

Some capabilities omit stages that are not applicable, but the ordering remains consistent.

---

# Shared Architectural Patterns

The following patterns are now standardized across the Application Layer.

## Validation Pipelines

Used by:

- Journey
- Reservation
- Pricing

---

## Policy Frameworks

Used by:

- Journey
- Reservation
- Pricing

---

## Registry Pattern

Used by:

- Provider Registry
- Policy Registry
- Calculator Registry

---

## Pipeline Pattern

Used by:

- Journey Composition
- Pricing Calculation

---

## Stateless Orchestration

Used by:

- Journey Composition Service
- Reservation Service
- Pricing Engine

---

## Immutable Aggregates

Used by:

- Journey Aggregate
- Reservation Aggregate
- Pricing Aggregate

---

## Presentation Pattern

Used by:

- Journey
- Reservation
- Pricing

---

# Future Capability Positioning

The next Application Capabilities naturally extend the stack.

```text
Accommodation

        │

        ▼

Journey

        │

        ▼

Pricing

        │

        ▼

Reservation

        │

        ▼

Payment

        │

        ▼

Invoicing

        │

        ▼

Revenue Management

        │

        ▼

CRM

        │

        ▼

Communications
```

Each capability consumes only the capabilities immediately beneath it.

---

# Architectural Constraints

Capabilities shall never:

- depend upward
- bypass lower-layer abstractions
- expose mutable public contracts
- communicate directly with providers
- duplicate another capability's responsibility

---

# Version 1.0 Summary

The Application Layer now contains four mature provider-independent business capabilities.

Together they provide:

- product discovery
- journey composition
- commercial pricing
- reservation orchestration

These capabilities establish the canonical Application Architecture for GCT Core and form the foundation for all future commercial and operational capabilities.

---

# Related Documents

- APP-000 – Application Layer Standard
- APP-002 – Accommodation Capability Summary
- APP-003 – Journey Capability Summary
- APP-004 – Reservation Capability Summary
- APP-005 – Pricing Capability Summary
- ENG-001 – Engineering Development Lifecycle
- ENG-002 – Engineering Verification Standard