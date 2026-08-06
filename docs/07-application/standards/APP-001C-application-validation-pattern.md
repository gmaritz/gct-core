# APP-001C
# Application Architecture Standard
## Application Validation Pattern

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Document | APP-001C |
| Title | Application Validation Pattern |
| Status | Approved |
| Version | 1.0 |
| Owner | Application Architecture |
| Depends On | APP-000 Application Layer Standard |
| Related | APP-001A Application Service Pattern |
| Related | APP-001B Application Policy Pattern |

---

# Purpose

Define the canonical validation architecture for every Application Service in GCT Core.

Validation shall be implemented as a structured pipeline composed of focused validators.

Validation is a first-class application capability.

It is not an implementation detail.

---

# Architectural Principles

Validation protects business integrity.

Validation precedes orchestration.

Validation is deterministic.

Validation is stateless.

Validation is immutable.

Validation remains supplier-independent.

Validation remains presentation-independent.

---

# Why Validation Exists

Application validation answers one question:

> Can this request safely proceed?

Validation verifies structure and business consistency.

Validation never performs orchestration.

Validation never evaluates business policy.

Validation never communicates with providers.

---

# Canonical Validation Pipeline

Every Application Service shall follow the same validation flow.

```text
Query

        │

        ▼

Query Validator

        │

        ▼

Business Validator

        │

        ▼

Aggregate Validator

        │

        ▼

Application Service
```

The pipeline executes before business orchestration begins.

---

# Validator Responsibilities

Validation is divided into three responsibilities.

## Query Validation

Verify request correctness.

Examples

- required fields
- formats
- ranges
- enums
- mandatory values

---

## Business Validation

Verify business feasibility.

Examples

- supported journey type
- valid traveller counts
- duration compatibility
- destination eligibility

Business validation evaluates business consistency.

It never calls providers.

---

## Aggregate Validation

Validate the completed aggregate.

Examples

- aggregate integrity
- required value objects
- collection consistency
- invariant enforcement

Aggregate validation is the final quality gate.

---

# Canonical Interface

Every validator shall expose one public operation.

```typescript
export interface ApplicationValidator<
    TInput
> {

    validate(
        input: TInput
    ): ValidationResult;

}
```

No additional public operations shall exist.

---

# Validation Result

Validation results shall be immutable.

Minimum properties

```typescript
readonly valid

readonly errors
```

Optional future properties

- warnings
- recommendations
- metadata

---

# Validation Error

Validation errors shall remain canonical.

Recommended structure

```typescript
code

message
```

Future additions may include

- severity
- path
- source

Validation errors shall never expose supplier terminology.

---

# Validation Error Codes

Validation shall use strongly typed error codes.

Examples

```text
MISSING_FIELD

INVALID_VALUE

INVALID_RANGE

INVALID_CONTEXT

INVALID_AGGREGATE

UNKNOWN
```

String literals shall not be used.

---

# Validation Pipeline

Where multiple validators exist, they shall execute through a validation pipeline.

Responsibilities

- deterministic execution
- explicit ordering
- immutable results
- short-circuit on failure

---

# Short-Circuit Behaviour

Validation shall stop on the first critical failure.

Subsequent validators shall not execute once continuation is impossible.

This avoids unnecessary computation and keeps failure reporting deterministic.

---

# Dependency Injection

Validators shall receive collaborators through constructor injection.

Validators never resolve dependencies directly.

Validators remain stateless.

---

# Relationship to Policies

Validation and policies are different concerns.

Validation asks

> Is the request structurally and semantically valid?

Policies ask

> Is this business action allowed?

Validation shall always execute before policy evaluation.

---

# Relationship to Application Services

Application Services orchestrate.

Validators verify.

Policies evaluate.

Results communicate.

Application Services shall never embed validation logic directly.

---

# Error Handling

Validation failures are expected business outcomes.

Validators shall not throw exceptions for ordinary validation failures.

Validation failures shall be returned through immutable ValidationResult objects.

Exceptions remain reserved for unexpected technical failures.

---

# Testing

Every validator shall include

- positive validation
- negative validation
- boundary validation
- deterministic execution
- immutable result verification

Validation pipelines shall additionally verify

- execution order
- short-circuit behaviour
- pipeline determinism

---

# Canonical Processing Flow

The complete Application Layer flow becomes

```text
Query

        │

        ▼

Validation Pipeline

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

Every Application Service in GCT Core shall follow this flow.

---

# Adoption

This standard applies to

- Accommodation Discovery
- Accommodation Content
- Accommodation Inventory
- Accommodation Rates
- Journey Composition
- Homepage Merchandising
- Reservation Engine
- Pricing Engine
- CRM
- Communications

---

# Non-Functional Requirements

Validation shall

- remain immutable
- remain deterministic
- remain supplier-independent
- remain presentation-independent
- remain persistence-independent
- remain highly testable

---

# Future Evolution

Future validation capabilities may include

- asynchronous validators
- distributed validation
- validation caching
- localisation of validation messages
- validation metrics
- validation tracing

These enhancements shall extend the framework without changing the canonical validation pattern.

---

# Standard Outcome

APP-001C establishes the canonical validation architecture for GCT Core.

By separating validation from orchestration and policy evaluation, every Application Service follows a predictable, deterministic execution model.

Together with APP-000, APP-001A and APP-001B, this standard completes the core Application Layer processing architecture and provides a reusable validation framework for every current and future business capability.