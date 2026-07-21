# 18 – Persistence Model

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document ID:** 18
**Title:** Persistence Model
**Status:** Approved
**Version:** 1.0

---

# Purpose

The Persistence Model defines how Aggregate Roots and supporting domain objects are stored and retrieved from persistent storage.

It provides the mapping between the Domain Model and the physical database while preserving the principles of Domain-Driven Design and Clean Architecture.

The Persistence Model is an implementation concern and does not influence domain behaviour.

---

# Objectives

The Persistence Model aims to:

* persist Aggregate Roots
* preserve Aggregate consistency
* isolate the Domain Layer from persistence technology
* support transactional integrity
* support future database evolution
* maintain infrastructure independence

---

# Architectural Position

```text
Domain Model
      │
      ▼
Repository Interface
      │
      ▼
Repository Implementation
      │
      ▼
Persistence Mapper
      │
      ▼
Prisma Client
      │
      ▼
PostgreSQL
```

The Domain Layer remains completely unaware of Prisma and PostgreSQL.

---

# Design Principles

The Persistence Model follows these principles:

* Domain-first
* Persistence ignorance
* Aggregate persistence
* Infrastructure isolation
* Transactional consistency
* Explicit mapping

Persistence concerns never leak into the Domain Layer.

---

# Aggregate Persistence

Repositories persist Aggregate Roots only.

Examples:

```text
Traveller Aggregate

Reservation Aggregate

Journey Aggregate

Accommodation Aggregate

Payment Aggregate
```

Internal Entities and Value Objects are persisted through their owning Aggregate.

---

# Repository Responsibilities

Repositories are responsible for:

* loading aggregates
* saving aggregates
* deleting aggregates (where appropriate)
* existence checks
* optimistic concurrency
* transaction participation

Repositories are not responsible for:

* business rules
* validation
* workflow orchestration
* HTTP handling
* DTO mapping

---

# Repository Mapping

Every Aggregate has:

```text
Aggregate

↓

Repository Interface

↓

Repository Implementation

↓

Persistence Mapper

↓

Database
```

Example:

```text
Reservation

↓

ReservationRepository

↓

ReservationPrismaRepository

↓

ReservationMapper

↓

reservation table
```

---

# Persistence Mappers

Persistence Mappers translate between:

```text
Domain Aggregate

↓

Persistence Model

↓

Prisma Model
```

Responsibilities:

* object mapping
* value object conversion
* identifier conversion
* enum conversion
* date conversion

Business logic must never exist within mappers.

---

# Aggregate Reconstruction

Repositories reconstruct Aggregates from persistence.

Example flow:

```text
Database Record

↓

Prisma Model

↓

Persistence Mapper

↓

Aggregate Constructor

↓

Domain Aggregate
```

Aggregates should always be restored in a valid state.

---

# Value Object Persistence

Value Objects are persisted as part of their owning Aggregate.

Examples:

```text
Money

EmailAddress

DateRange

Address
```

Persistence details remain hidden from the Domain Layer.

---

# Entity Persistence

Entities belonging to an Aggregate are stored together with the Aggregate.

Example:

```text
Reservation

↓

Reservation Traveller

Reservation Items

Reservation Notes
```

Repositories reconstruct the complete Aggregate.

---

# Identity Persistence

Every Aggregate has a stable identifier.

Examples:

```text
TravellerId

ReservationId

JourneyId

AccommodationId

PaymentId
```

Identifiers remain immutable throughout the Aggregate lifecycle.

The persistence layer is responsible for storing identifiers without exposing database-specific implementation details.

---

# Transactions

Each Aggregate modification executes within a single transaction.

Typical flow:

```text
Load Aggregate

↓

Modify Aggregate

↓

Persist Aggregate

↓

Commit

↓

Publish Events
```

Events are published only after successful persistence.

---

# Optimistic Concurrency

Repositories should support optimistic concurrency where appropriate.

Typical implementation:

```text
Aggregate Version

↓

Repository Save

↓

Version Check

↓

Commit
```

Conflicting updates should result in concurrency exceptions.

---

# Lazy vs Eager Loading

Repositories should load complete Aggregate Roots.

Avoid partial Aggregate loading.

Read-only projections may use optimized query models outside the Aggregate.

---

# Read Models

CQRS queries may utilise dedicated read models.

Example:

```text
Reservation Table

↓

Read Repository

↓

Reservation DTO

↓

API
```

Read models do not reconstruct full Aggregates unless business behaviour is required.

---

# Soft Deletes

Where business requirements demand historical records, soft deletion should be preferred.

Typical fields:

```text
isActive

deletedAt

deletedBy
```

Deletion policies remain domain-driven.

---

# Auditing

Persistent records should support auditing.

Typical fields:

```text
createdAt

updatedAt

createdBy

updatedBy
```

Auditing is an infrastructure concern.

---

# Relationships

The database may contain foreign keys.

The Domain Model contains object relationships.

Example:

```text
Reservation

↓

Traveller
```

The Aggregate remains independent of relational database implementation.

---

# Enumerations

Business enumerations are stored using stable values.

Examples:

```text
ReservationStatus

JourneyStatus

PaymentStatus

StaffRole
```

Enumeration persistence should remain implementation-independent.

---

# Date & Time

All timestamps should be stored in UTC.

The Domain Layer remains timezone aware through Value Objects where appropriate.

---

# Money

Financial values should never use floating-point types.

Recommended persistence:

```text
amount

currency
```

Precision is preserved at the persistence level.

---

# Event Persistence

Domain Events are not part of Aggregate persistence.

Where event storage is required, an independent event store or outbox mechanism should be used.

Aggregate persistence and event persistence remain separate concerns.

---

# Infrastructure Independence

The Domain Layer never imports:

* Prisma
* PostgreSQL
* SQL
* ORM models

All persistence concerns remain within Infrastructure.

---

# Error Handling

Persistence failures are translated into infrastructure exceptions.

Infrastructure exceptions never replace Domain Exceptions.

Repository implementations should isolate database-specific errors.

---

# Testing Strategy

Persistence tests verify:

* aggregate reconstruction
* mapper correctness
* repository behaviour
* transaction integrity
* optimistic concurrency
* value object persistence

Business rules remain tested within Aggregate tests.

---

# Anti-Patterns

Avoid:

* exposing Prisma models to the Domain Layer
* business logic inside repositories
* business logic inside mappers
* partial Aggregate persistence
* leaking SQL into Application Services
* persistence annotations inside Domain objects

---

# Relationship to Physical Database

The Persistence Model defines **how** domain objects are persisted.

The Physical Database defines **where** they are stored.

This document remains independent of any specific database schema.

---

# Acceptance Criteria

Implementation is compliant when:

* repositories persist Aggregate Roots only
* repository implementations remain within Infrastructure
* mappers isolate persistence concerns
* Domain objects remain persistence ignorant
* value objects are correctly reconstructed
* transactions preserve Aggregate consistency
* optimistic concurrency is supported where required
* business rules remain outside the persistence layer

---

# Conclusion

The Persistence Model provides the bridge between the Domain Model and the underlying database without compromising the principles of Domain-Driven Design. By isolating persistence concerns within Infrastructure and preserving persistence ignorance in the Domain Layer, GCT Core maintains a clean, scalable, and technology-independent architecture capable of evolving as business requirements and storage technologies change.
