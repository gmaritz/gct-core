# APP-002
# Accommodation Capability Summary

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Capability | APP-002 |
| Title | Accommodation Capability Summary |
| Status | Version 1.0 Approved |
| Owner | Application Architecture |
| Layer | Application Layer |
| Related | APP-000 Application Layer Standard |
| Related | APP-001A–APP-001E |
| Related | INT-000 External Provider Integration Standard |

---

# Purpose

The Accommodation Capability provides the canonical application services responsible for discovering, retrieving, validating and presenting accommodation information within GCT Core.

It provides a provider-independent abstraction over external accommodation suppliers and exposes immutable application models that are consumed by higher-level capabilities such as Journey Composition and Reservation.

The Accommodation Capability contains no presentation logic, persistence logic or supplier-specific implementations.

---

# Capability Responsibilities

The Accommodation Capability is responsible for:

- Discovering accommodation providers
- Executing accommodation searches
- Retrieving accommodation content
- Retrieving inventory availability
- Retrieving accommodation rates
- Mapping provider contracts into canonical application models
- Validating accommodation queries
- Returning immutable application results

The capability is not responsible for:

- Journey composition
- Reservation management
- Pricing calculations
- Booking execution
- User interface rendering

---

# Architectural Overview

```text
External Providers

        │

        ▼

Provider Contracts

        │

        ▼

Provider Models

        │

        ▼

Mapping Library

        │

        ▼

Provider Implementation

        │

        ▼

Discovery Engine

        │

        ▼

Application Services

        │

        ▼

Canonical Results

        │

        ▼

Consumer Capabilities
```

The Accommodation Capability isolates supplier implementations from the remainder of the platform through canonical application contracts.

---

# Capability Components

## Provider Models

Canonical provider-specific models representing accommodation supplier data.

---

## Mapping Library

Transforms provider contracts into canonical application models.

The mapping layer performs structural transformation only.

It contains no business logic.

---

## Provider Implementation

Provides supplier-independent accommodation capabilities through provider contracts.

Supports:

- SEARCH
- CONTENT
- INVENTORY
- RATES

---

## Discovery Engine

Discovers providers capable of servicing a search request.

Provides:

- capability discovery
- provider selection
- failure isolation

---

## Query Validation

Validates canonical accommodation search queries before provider execution.

Validation remains independent from provider implementations.

---

## Application Services

The Accommodation Capability exposes four canonical services:

### Accommodation Discovery Service

Discovers accommodation.

---

### Accommodation Content Service

Retrieves descriptive accommodation content.

---

### Accommodation Inventory Service

Retrieves accommodation availability.

---

### Accommodation Rate Service

Retrieves accommodation pricing.

---

# Canonical Execution Flow

```text
Accommodation Search Request

        │

        ▼

Query Validation

        │

        ▼

Provider Discovery

        │

        ▼

Provider Execution

        │

        ▼

Mapping Library

        │

        ▼

Canonical Application Models

        │

        ▼

Application Result
```

Each stage performs a single responsibility.

---

# Design Principles

The Accommodation Capability follows the core Application Layer principles:

- Stateless services
- Immutable models
- Constructor dependency injection
- Provider independence
- Structural mapping only
- Failure isolation using Promise.allSettled()
- Strict separation of concerns

---

# Key Architectural Decisions

## Provider Independence

The Application Layer depends only on provider contracts.

Supplier implementations remain isolated.

---

## Canonical Models

All application services return canonical models.

No supplier-specific objects escape the capability.

---

## Mapping Before Consumption

Provider responses are mapped before any application logic executes.

---

## Capability Discovery

Providers advertise capabilities rather than being called directly.

This enables multiple accommodation suppliers without changing consumer services.

---

## Immutable Results

Every public result contract is immutable.

---

# Capability Milestones

| Milestone | Description |
|-----------|-------------|
| APP-002.1 | Accommodation Provider Contracts |
| APP-002.2 | Accommodation Registry |
| APP-002.3 | Capability Discovery |
| APP-002.4 | Provider Capabilities |
| APP-002.5 | Canonical Models |
| APP-002.6 | Hotelbeds Provider Models |
| APP-002.7 | Hotelbeds Mapping Library |
| APP-002.8 | Hotelbeds Provider |
| APP-002.9 | Accommodation Discovery Service |
| APP-002.9A | Canonical Search Query |
| APP-002.9B | Query Validator |
| APP-002.10 | Accommodation Content Service |
| APP-002.11 | Accommodation Inventory Service |
| APP-002.12 | Accommodation Rate Service |

---

# Relationships

The Accommodation Capability provides services to:

- Journey Capability
- Reservation Capability
- Future Pricing Capability

It depends upon:

- Integration Layer
- Provider Contracts

---

# Extension Points

The architecture supports future additions including:

- Additional accommodation suppliers
- Provider routing strategies
- Caching
- Localisation
- AI enrichment
- Availability optimisation
- Rate comparison

These enhancements extend the capability without changing its public contracts.

---

# Verification

The Accommodation Capability has been fully verified according to ENG-002.

Verification included:

- Focused unit tests
- Targeted regression tests
- Production builds
- Full regression suites
- Runtime startup verification
- Health endpoint verification

---

# Version 1.0 Status

The Accommodation Capability is complete and approved as Version 1.0.

All implementation milestones have been delivered, verified and integrated into GCT Core.

The capability provides the canonical accommodation application services for the platform and forms the foundation upon which Journey Composition and Reservation orchestration are built.

---

# Related Documents

- APP-000 – Application Layer Standard
- APP-001A – Application Service Pattern
- APP-001B – Application Policy Pattern
- APP-001C – Application Validation Pattern
- APP-001D – Application Result Pattern
- APP-001E – Application Presentation Pattern
- INT-000 – External Provider Integration Standard
- ENG-001 – Engineering Development Lifecycle
- ENG-002 – Engineering Verification Standard