# SPEC-001 – Project Structure

**Project:** GCT Core (Go Cape Tours Core Platform)
**Specification ID:** SPEC-001
**Title:** Project Structure & Folder Layout
**Status:** Approved
**Version:** 1.0
**Audience:** Developers, GitHub Copilot, Future Contributors

---

# Purpose

This specification defines the official source code structure for GCT Core.

Every new file created during implementation **must follow this structure**.

The purpose of this specification is to:

* provide a consistent architecture
* align implementation with the DDD documentation
* make navigation predictable
* reduce technical debt
* ensure GitHub Copilot generates code in the correct location

This specification is considered authoritative unless superseded by a later version.

---

# Architectural Style

The project follows:

* Domain-Driven Design (DDD)
* Clean Architecture
* CQRS (where appropriate)
* Repository Pattern
* Dependency Injection
* Event-Driven Architecture
* Prisma + PostgreSQL Persistence

Business logic always belongs in the Domain Layer.

Infrastructure details must never leak into the Domain Layer.

---

# Source Tree

```text
src/

domain/
application/
infrastructure/
interfaces/
shared/
```

Each layer has a clearly defined responsibility.

Dependencies always point inward.

```
Interfaces
      │
Application
      │
 Domain
      ▲
Infrastructure
```

The Domain Layer must never depend on Infrastructure.

---

# Domain Layer

Location

```text
src/domain/
```

Purpose

Contains the business model.

This layer contains no Express, Prisma, HTTP, SQL or framework-specific code.

Structure

```text
domain/

aggregates/
entities/
value-objects/
repositories/
services/
events/
policies/
specifications/
exceptions/
shared/
```

Responsibilities

## aggregates/

Contains Aggregate Root implementations.

Examples

```text
reservation.aggregate.ts
journey.aggregate.ts
traveller.aggregate.ts
```

---

## entities/

Contains domain entities that belong to aggregates.

Examples

```text
reservation-item.entity.ts
itinerary-day.entity.ts
tour-stop.entity.ts
```

---

## value-objects/

Contains immutable value objects.

Examples

```text
money.vo.ts
email.vo.ts
address.vo.ts
date-range.vo.ts
```

---

## repositories/

Contains repository interfaces only.

Never implementations.

Examples

```text
reservation.repository.ts
journey.repository.ts
traveller.repository.ts
```

---

## services/

Contains Domain Services.

Examples

```text
pricing.service.ts
availability.service.ts
journey-planning.service.ts
```

---

## events/

Contains Domain Events.

Examples

```text
reservation-confirmed.event.ts
payment-captured.event.ts
journey-created.event.ts
```

---

## policies/

Contains business policy implementations.

Examples

```text
pricing-policy.ts
staffing-policy.ts
cancellation-policy.ts
```

---

## specifications/

Contains business specifications.

Examples

```text
minimum-group-size.specification.ts
reservation-valid.specification.ts
```

---

## exceptions/

Contains domain exceptions.

Examples

```text
reservation-not-found.exception.ts
payment-declined.exception.ts
```

---

## shared/

Contains reusable domain components.

Only pure domain concepts belong here.

---

# Application Layer

Location

```text
src/application/
```

Purpose

Coordinates use cases.

Contains no business rules.

Structure

```text
commands/
queries/
handlers/
services/
dto/
mappers/
```

Responsibilities

## commands/

Write operations.

One file per command.

Example

```text
create-reservation.command.ts
```

---

## queries/

Read operations.

Example

```text
find-reservation.query.ts
```

---

## handlers/

Command and Query handlers.

Example

```text
create-reservation.handler.ts
```

---

## services/

Application Services.

These orchestrate multiple aggregates.

Examples

```text
reservation.service.ts
booking.service.ts
```

---

## dto/

Data Transfer Objects.

Never expose domain entities directly.

---

## mappers/

Maps DTOs to Domain objects.

---

# Infrastructure Layer

Location

```text
src/infrastructure/
```

Purpose

Implements technical concerns.

Structure

```text
persistence/
suppliers/
payments/
communications/
ai/
logging/
```

---

## persistence/

```text
prisma/
```

Contains all Prisma implementation.

Structure

```text
repositories/
mappers/
prisma.service.ts
```

Repository implementations

```text
reservation-prisma.repository.ts
journey-prisma.repository.ts
traveller-prisma.repository.ts
```

---

## suppliers/

Contains supplier integrations.

Example

```text
hotelbeds/
future-suppliers/
acl/
```

The ACL folder contains Anti-Corruption Layers responsible for translating supplier models into the internal domain model.

---

## payments/

Contains payment gateway integrations.

Examples

```text
payfast/
stripe/
```

---

## communications/

Contains email, SMS and WhatsApp providers.

---

## ai/

Contains AI integrations.

Examples

```text
itinerary-assistant/
recommendation-engine/
```

---

## logging/

Central logging implementation.

---

# Interface Layer

Location

```text
src/interfaces/
```

Purpose

Exposes the application externally.

Structure

```text
api/
controllers/
middleware/
presenters/
```

Responsibilities

Controllers

Receive HTTP requests.

Call Application Services.

Never contain business rules.

Presenters

Transform Application responses into API responses.

Middleware

Authentication

Authorisation

Validation

Logging

---

# Shared Layer

Location

```text
src/shared/
```

Contains framework-independent utilities.

Structure

```text
config/
constants/
types/
utils/
```

Business logic should never be placed here.

---

# Naming Standards

Use kebab-case for filenames.

Examples

```text
reservation.repository.ts

reservation-prisma.repository.ts

create-reservation.command.ts

payment-captured.event.ts
```

Class names use PascalCase.

Interfaces begin with "I" only when required by team convention. Repository interfaces should use descriptive names such as `ReservationRepository` rather than `IReservationRepository` unless the convention changes project-wide.

---

# Dependency Rules

Allowed

```text
Interfaces
    ↓
Application
    ↓
Domain

Infrastructure
    ↑
implements Domain Interfaces
```

Not Allowed

* Domain importing Prisma
* Domain importing Express
* Domain importing HTTP
* Domain importing PostgreSQL
* Controllers accessing Prisma directly
* Controllers containing business logic

---

# Repository Rule

Repositories belong here

```text
src/domain/repositories/
```

Implementations belong here

```text
src/infrastructure/persistence/prisma/repositories/
```

The Domain Layer must only know about repository interfaces.

---

# Future Specifications

This specification forms the foundation for subsequent implementation specifications, including:

* SPEC-002 – Repository Interfaces
* SPEC-003 – Application Services
* SPEC-004 – CQRS Commands & Queries
* SPEC-005 – API Contracts
* SPEC-006 – Persistence Model
* SPEC-007 – Prisma Implementation
* SPEC-008 – Database Migrations

Each subsequent specification must comply with the folder structure and architectural rules defined in this document.

---

# Acceptance Criteria

Implementation is considered compliant when:

* All files are created in the correct locations.
* No layer violates dependency rules.
* Repository interfaces exist only in the Domain Layer.
* Repository implementations exist only in Infrastructure.
* Controllers contain no business logic.
* Business rules exist only in the Domain Layer.
* Prisma is isolated to the Infrastructure Layer.
* New features follow this structure without requiring reorganisation.

---

# Conclusion

This specification establishes the canonical project structure for GCT Core. All future implementation work, whether written manually or generated by GitHub Copilot, must adhere to this layout to preserve architectural consistency, maintainability and scalability.
