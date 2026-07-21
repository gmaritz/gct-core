# 15 – Application Services

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document ID:** 15
**Title:** Application Services
**Status:** Approved
**Version:** 1.0

---

# Purpose

Application Services coordinate business use cases.

They receive requests from external interfaces (HTTP APIs, background jobs, integrations, scheduled tasks), orchestrate the execution of domain logic, coordinate repository access, and publish domain events.

Application Services **do not contain business rules**.

All business decisions remain within the Domain Layer.

---

# Responsibilities

Application Services are responsible for:

* Executing application use cases.
* Loading Aggregate Roots from repositories.
* Invoking behaviour on aggregates.
* Coordinating multiple aggregates where necessary.
* Managing transactions.
* Publishing Domain Events.
* Returning DTOs or Result objects.
* Calling infrastructure services through abstractions.

Application Services are **not responsible** for:

* Business rules.
* Validation of business invariants.
* HTTP handling.
* Database queries.
* SQL.
* Prisma.
* JSON formatting.
* Authentication.
* Authorisation.

---

# Position in the Architecture

```text
HTTP Request
        │
        ▼
Controller
        │
        ▼
Application Service
        │
        ▼
Aggregate Root
        │
        ▼
Repository
        │
        ▼
Prisma Repository
        │
        ▼
PostgreSQL
```

Business decisions always occur inside Aggregate Roots.

---

# Folder Structure

Application Services reside in:

```text
src/application/services/
```

Suggested structure:

```text
services/

reservation/

traveller/

journey/

accommodation/

payments/

operations/

communications/
```

Each folder groups related application services.

---

# General Responsibilities

Every Application Service should:

1. Receive a Command or Query.
2. Load required aggregates.
3. Execute aggregate behaviour.
4. Persist changes.
5. Publish Domain Events.
6. Return a Result or DTO.

---

# Service Lifecycle

Typical flow:

```text
Controller
      │
      ▼
Application Service
      │
      ▼
Repository
      │
      ▼
Aggregate
      │
Business Logic
      │
Repository Save
      │
Publish Events
      │
Return DTO
```

---

# Dependency Rules

Application Services may depend upon:

* Domain Aggregates
* Repository Interfaces
* Domain Services
* Domain Events
* Specifications
* DTOs
* Mappers

Application Services must **never** depend directly upon:

* Prisma Client
* SQL
* Express
* HTTP Request/Response
* PostgreSQL

Infrastructure dependencies are accessed only through interfaces.

---

# Reservation Application Services

Primary services include:

```text
CreateReservationService

ConfirmReservationService

CancelReservationService

ModifyReservationService

RetrieveReservationService
```

Responsibilities include:

* Creating reservations.
* Confirming reservations.
* Cancelling reservations.
* Retrieving reservation information.
* Coordinating payment requests.

Reservation validation remains inside the Reservation Aggregate.

---

# Traveller Application Services

Primary services:

```text
CreateTravellerService

UpdateTravellerService

RetrieveTravellerService
```

Responsibilities:

* Register travellers.
* Maintain traveller profiles.
* Retrieve traveller information.

Traveller identity validation belongs within the Traveller Aggregate.

---

# Journey Application Services

Primary services:

```text
CreateJourneyService

UpdateJourneyService

StartJourneyService

CompleteJourneyService
```

Responsibilities:

* Build journeys.
* Manage journey lifecycle.
* Record operational milestones.

Journey state transitions remain inside the Journey Aggregate.

---

# Accommodation Application Services

Primary services:

```text
SearchAccommodationService

AssignAccommodationService

ReplaceAccommodationService
```

Responsibilities:

* Coordinate accommodation searches.
* Select supplier integrations.
* Assign accommodation to journeys.

Supplier-specific logic belongs within Infrastructure adapters.

---

# Payment Application Services

Primary services:

```text
InitiatePaymentService

CapturePaymentService

RefundPaymentService
```

Responsibilities:

* Coordinate payment requests.
* Invoke payment providers.
* Record payment outcomes.

Payment business rules remain within the Payment Aggregate.

---

# Operations Application Services

Primary services:

```text
AllocateStaffService

AssignVehicleService

GenerateOperationalScheduleService
```

Responsibilities:

* Coordinate staffing.
* Allocate vehicles.
* Generate operational schedules.

Staffing rules remain inside Domain Policies.

---

# Communication Application Services

Primary services:

```text
SendReservationConfirmationService

SendReminderService

SendCancellationNotificationService
```

Responsibilities:

* Coordinate outbound communications.
* Publish messages through infrastructure providers.

Message formatting belongs to communication adapters.

---

# Transaction Management

Application Services define transaction boundaries.

Typical transaction:

```text
Load Aggregate

↓

Execute Domain Behaviour

↓

Persist Aggregate

↓

Commit Transaction

↓

Publish Events
```

Transactions should be short-lived.

---

# Event Publication

Application Services publish events raised by aggregates.

Example:

```text
ReservationConfirmed

↓

Application Service

↓

Event Bus

↓

Operations

↓

Communications

↓

Reporting
```

Application Services never construct Domain Events manually.

Events originate from Aggregate Roots.

---

# Repository Usage

Repositories are injected through interfaces.

Example dependencies:

```text
ReservationRepository

TravellerRepository

JourneyRepository

PaymentRepository
```

Application Services never instantiate repositories directly.

---

# DTO Mapping

Application Services return DTOs.

Flow:

```text
Aggregate

↓

Mapper

↓

DTO

↓

Controller

↓

HTTP Response
```

Domain entities are never exposed outside the Domain Layer.

---

# Error Handling

Application Services may translate Domain Exceptions into application-level results.

Example:

```text
ReservationAlreadyConfirmedException

↓

Application Result

↓

409 Conflict
```

Domain Exceptions are never converted into HTTP responses directly.

---

# Testing Strategy

Application Services should be tested independently.

Tests verify:

* Repository interactions.
* Aggregate orchestration.
* Transaction boundaries.
* Event publication.
* DTO mapping.

Business rule testing belongs to Aggregate tests.

---

# Design Principles

Application Services should be:

* Stateless.
* Lightweight.
* Focused.
* Transactional.
* Orchestrators only.

Business intelligence belongs inside the Domain.

---

# Anti-Patterns

Avoid:

* Business rules inside services.
* SQL inside services.
* Prisma inside services.
* HTTP handling inside services.
* Large "God Services".
* Returning domain entities directly.

---

# Relationship to CQRS

Application Services coordinate Command and Query execution.

Typical flow:

```text
Command

↓

Command Handler

↓

Application Service

↓

Aggregate

↓

Repository

↓

Result
```

Query flow:

```text
Query

↓

Query Handler

↓

Read Repository

↓

DTO
```

Application Services remain independent of transport mechanisms.

---

# Acceptance Criteria

Implementation is considered compliant when:

* Business rules remain inside Aggregate Roots.
* Services orchestrate but do not decide.
* Repository access occurs only through interfaces.
* Infrastructure dependencies remain isolated.
* Domain Events originate from aggregates.
* DTOs are returned instead of domain entities.
* Transactions are coordinated by Application Services.
* Services remain small, cohesive, and testable.

---

# Conclusion

Application Services form the orchestration layer of GCT Core. They coordinate the execution of business use cases while preserving the integrity of the Domain Model. By ensuring that business decisions remain inside Aggregate Roots and Domain Policies, the Application Layer remains lightweight, maintainable, and aligned with the principles of Domain-Driven Design and Clean Architecture.
