# APP-003
# Application Capability Specification
## Journey Composition Engine

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Document | APP-003 |
| Title | Journey Composition Engine |
| Status | Approved |
| Version | 1.0 |
| Owner | Application Architecture |
| Depends On | APP-002 Accommodation Capability Suite |
| Conforms To | APP-001A Application Service Pattern |
| Next | APP-003.1 Journey Aggregate |

---

# Purpose

Implement the Journey Composition Engine.

The Journey Composition Engine is the central orchestration capability responsible for composing canonical sellable journeys from independent business capabilities.

The engine never retrieves provider data directly.

The engine never performs pricing.

The engine never performs reservations.

The engine composes journeys.

---

# Business Vision

The Journey Composition Engine enables GCT Core to create premium travel experiences by combining accommodation, experiences and future journey components into a single canonical Journey.

The business may refer to this capability as the Package Builder.

Within the architecture the canonical capability name is Journey Composition Engine.

---

# Architectural Principles

Journey composition belongs to GCT Core.

Business capabilities provide data.

The engine composes journeys.

The engine owns no supplier integrations.

The engine owns no provider models.

The engine conforms to APP-001A.

---

# Scope

## Included

- Journey Composition Engine
- Journey Composition Query
- Journey Composition Context
- Journey Composition Source
- Journey Type
- Journey Composition Strategy
- Journey Validator
- Composition Policies
- Journey Composition Result

---

## Excluded

- Pricing
- Reservations
- Payments
- Promotions
- Guest communications
- Homepage merchandising
- Supplier integrations

---

# High-Level Architecture

```text
Journey Composition Query

        │

        ▼

Journey Validator

        │

        ▼

Journey Composition Engine

        │

 ┌──────┴──────────────┐

 ▼                     ▼

Accommodation     Experiences

        │

        ▼

Journey Aggregate

        │

        ▼

Journey Composition Result
```

---

# Application Service Pattern

The engine shall implement

```typescript
ApplicationService<
    JourneyCompositionQuery,
    JourneyCompositionResult
>
```

The public API consists solely of

```typescript
execute(query)
```

---

# Journey Composition Query

Purpose

Canonical request for journey composition.

The query shall be immutable.

It shall contain:

- journey type
- composition strategy
- composition context
- traveller requirements
- destination requirements
- stay requirements

Future extensions shall not require API changes.

---

# Journey Composition Context

Purpose

Describe why composition is being performed.

Properties

- requestId
- source
- timestamp

Future additions may include:

- market
- currency
- partner
- campaign
- locale

---

# Journey Composition Source

Create

```text
HOMEPAGE

PACKAGE_DESIGNER

PACKAGE_DETAILS

ADMIN

API

INTERNAL
```

No string literals.

---

# Journey Type

Create

```text
DAY_TOUR

MULTI_DAY

CUSTOM
```

A single Journey aggregate shall support every journey type.

---

# Composition Strategy

Create

```text
STANDARD

CURATED

DYNAMIC
```

Future strategies

- AI_ASSISTED
- PROMOTIONAL
- PARTNER
- MANUAL

---

# Journey Validator

Responsibilities

Validate:

- query
- context
- journey type
- traveller requirements
- destination requirements
- stay requirements

Remain supplier-independent.

---

# Composition Policies

The engine shall delegate business rules to policy objects.

Initial policies include:

- Accommodation Composition Policy
- Experience Composition Policy
- Journey Duration Policy
- Journey Eligibility Policy

Policies shall remain independently replaceable.

---

# Journey Aggregate

The Journey Aggregate is the canonical output.

A Journey may contain:

- accommodation
- experiences
- itinerary
- traveller rules
- metadata

Future components may include:

- restaurants
- flights
- events
- transfers

The aggregate shall remain extensible.

---

# Composition Workflow

```text
JourneyCompositionQuery

        │

        ▼

JourneyValidator

        │

        ▼

JourneyCompositionEngine

        │

 ┌──────┼──────────┐

 ▼      ▼          ▼

Discovery

Content

Inventory

Rates

        │

        ▼

Journey Aggregate

        │

        ▼

JourneyCompositionResult
```

---

# Responsibilities

The engine shall:

- orchestrate business capabilities
- compose journeys
- aggregate canonical results
- isolate failures
- remain stateless

The engine shall never:

- call providers directly
- calculate pricing
- calculate discounts
- create reservations
- expose supplier models

---

# Error Handling

The engine shall isolate failures using

```typescript
Promise.allSettled()
```

Component failures shall not compromise unrelated capability execution.

---

# Coding Standards

Follow

- APP-000
- APP-001A
- INT-000

Requirements

- Stateless orchestration
- Immutable contracts
- Dependency Injection
- Named exports
- Strict TypeScript

---

# Non-Functional Requirements

The capability shall:

- remain provider-independent
- remain UI-independent
- remain pricing-independent
- remain reservation-independent
- compile successfully

---

# Future Evolution

Future business capabilities include:

- Journey Pricing Engine
- Promotions
- Dynamic Packaging
- AI Journey Design
- Journey Personalisation
- Campaign Optimisation
- Supplier Expansion
- Reservation Orchestration

None of these enhancements shall require changes to the Journey Composition Engine public API.

---

# Capability Outcome

Upon completion, GCT Core shall possess a canonical Journey Composition Engine capable of composing supplier-independent journeys from reusable business capabilities.

The Journey Composition Engine becomes the central orchestration capability of GCT Core, enabling dynamic package creation, homepage merchandising, journey design and future AI-assisted travel planning while preserving complete separation between business composition, pricing, reservations and supplier integrations.