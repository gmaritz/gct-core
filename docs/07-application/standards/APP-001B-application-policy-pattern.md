# APP-001B
# Application Architecture Standard
## Application Policy Pattern

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Document | APP-001B |
| Title | Application Policy Pattern |
| Status | Approved |
| Version | 1.0 |
| Owner | Application Architecture |
| Depends On | APP-000 Application Layer Standard |
| Related | APP-001A Application Service Pattern |

---

# Purpose

Define the canonical pattern for expressing business rules within the Application Layer.

Policies encapsulate business decisions.

Application Services orchestrate policies.

Business rules shall never be embedded directly inside application services.

---

# Architectural Principles

Policies express business intent.

Policies are stateless.

Policies are immutable.

Policies are independently testable.

Policies are dependency injectable.

Policies remain supplier-independent.

Policies never perform orchestration.

Policies never perform presentation.

Policies never perform persistence.

---

# Why Policies Exist

Application Services should answer the question:

> What happens?

Policies answer the question:

> Is this business action permitted?

or

> How should this business decision be evaluated?

Separating these responsibilities keeps orchestration and business logic independent.

---

# Canonical Architecture

```text
Query

        │

        ▼

Validator

        │

        ▼

Application Service

        │

        ▼

Policy Pipeline

        │

 ┌──────┼─────────────┐

 ▼      ▼             ▼

Policy  Policy       Policy

        │

        ▼

Canonical Result
```

---

# Canonical Interface

Every policy shall implement a single public operation.

```typescript
export interface ApplicationPolicy<
    TContext,
    TResult
> {

    evaluate(
        context: TContext
    ): TResult;

}
```

Policies shall expose no additional public operations.

---

# Responsibilities

Policies shall

- evaluate business rules
- evaluate eligibility
- evaluate constraints
- evaluate business decisions
- return deterministic results

Policies shall never

- retrieve provider data
- call external APIs
- perform persistence
- perform HTTP
- modify application state
- calculate presentation models

---

# Policy Context

Policies receive immutable context objects.

A context contains only the information required for evaluation.

Contexts shall remain supplier-independent.

Example

```typescript
JourneyCompositionContext
```

---

# Policy Result

Policies return immutable result objects.

Results may include

- allowed
- rejected
- warnings
- recommendations
- evaluation metadata

Policies shall never throw business exceptions for expected rule failures.

Business outcomes are expressed through policy results.

---

# Policy Pipeline

Where multiple policies participate, they shall execute through a pipeline.

```text
Policy Pipeline

        │

        ▼

Eligibility Policy

        │

        ▼

Duration Policy

        │

        ▼

Accommodation Policy

        │

        ▼

Experience Policy
```

Pipelines remain deterministic.

Policy order shall be explicit.

---

# Dependency Injection

Policies shall be provided through constructor injection.

Application Services own policy orchestration.

Policies never resolve dependencies directly.

---

# Composition

Policies may depend on other policies.

However, policy dependency chains should remain shallow.

Complex orchestration belongs in Application Services.

---

# Error Handling

Policies shall never throw exceptions for ordinary business rule failures.

Instead they return deterministic evaluation results.

Exceptions are reserved for exceptional technical failures.

---

# Testing

Every policy shall include

- positive evaluation tests
- negative evaluation tests
- boundary tests
- deterministic execution tests

Policies should be among the simplest units to test.

---

# Example

```text
JourneyCompositionService

        │

        ▼

JourneyPolicyPipeline

        │

 ┌──────┼───────────────┐

 ▼      ▼               ▼

Eligibility

Duration

Accommodation

Experience
```

The service coordinates.

The policies decide.

---

# Initial Policy Families

The following policy families are expected within GCT Core.

## Journey

- JourneyEligibilityPolicy
- JourneyDurationPolicy
- JourneyAccommodationPolicy
- JourneyExperiencePolicy
- JourneySeasonPolicy

---

## Merchandising

- FeaturedJourneyPolicy
- CampaignPolicy
- SeasonalPriorityPolicy
- CollectionPolicy

---

## Pricing

- PricingEligibilityPolicy
- DiscountPolicy
- CommissionPolicy
- CurrencyPolicy

---

## Reservations

- ReservationEligibilityPolicy
- CancellationPolicy
- PaymentPolicy

---

## Guest Experience

- TravellerEligibilityPolicy
- CommunicationPolicy

---

# Policy Naming

Policy names shall follow

```text
<Business Concept>Policy
```

Examples

```text
JourneyEligibilityPolicy

JourneyDurationPolicy

CampaignPolicy

PricingEligibilityPolicy
```

Avoid generic names such as

```text
RuleEngine

DecisionManager

BusinessLogic
```

Policies should describe a single business responsibility.

---

# Non-Functional Requirements

Policies shall

- remain immutable
- remain deterministic
- remain supplier-independent
- remain UI-independent
- remain persistence-independent
- remain presentation-independent

---

# Relationship to APP-001A

Application Services orchestrate.

Policies evaluate.

Validators verify.

Results communicate.

These standards together define the canonical Application Layer architecture.

```text
Query

        │

        ▼

Validation

        │

        ▼

Application Service

        │

        ▼

Policy Pipeline

        │

        ▼

Canonical Result
```

---

# Adoption

This standard applies to

- Journey Composition Engine
- Homepage Merchandising
- Accommodation Engine
- Journey Pricing Engine
- Reservation Engine
- CRM
- Communications
- Future AI orchestration

---

# Standard Outcome

APP-001B establishes the canonical business rule architecture for GCT Core.

By separating policy evaluation from orchestration, the Application Layer remains modular, deterministic and highly testable.

Together with APP-000 and APP-001A, this standard forms one of the core architectural pillars of GCT Core and provides a consistent pattern for expressing business rules across every application capability.