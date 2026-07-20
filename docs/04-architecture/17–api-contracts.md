# 17 – API Contracts

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document ID:** 17
**Title:** API Contracts
**Status:** Approved
**Version:** 1.0

---

# Purpose

API Contracts define the public interface exposed by GCT Core.

They establish a stable agreement between external consumers and the Application Layer, independent of implementation details.

API Contracts describe:

* supported operations
* request structures
* response structures
* validation expectations
* error responses
* versioning strategy

They do **not** define HTTP routing, Express controllers, or framework-specific implementation.

---

# Objectives

The API Contract aims to:

* provide a stable external interface
* isolate clients from internal implementation changes
* support future web, mobile, AI, and partner integrations
* simplify testing
* maintain backward compatibility

---

# Architectural Position

```text
External Client
        │
        ▼
API Contract
        │
        ▼
Controller
        │
        ▼
Application Service
        │
        ▼
Domain Model
```

The API Contract represents the boundary between external consumers and the application.

---

# Design Principles

Every API Contract should be:

* explicit
* predictable
* versioned
* technology independent
* resource-oriented
* business focused

Contracts should describe business capabilities rather than database entities.

---

# API Versioning

Every public API must include an explicit version.

Example:

```text
/api/v1/
```

Future versions:

```text
/api/v2/
```

Breaking changes require a new version.

Non-breaking enhancements may remain within the same version.

---

# Standard Request Flow

```text
Client

↓

API Contract

↓

Controller

↓

Command / Query

↓

Handler

↓

Application Service

↓

Domain
```

Controllers translate HTTP requests into Commands or Queries.

---

# Standard Response Flow

```text
Domain

↓

Application Service

↓

DTO

↓

Presenter

↓

API Contract

↓

Client
```

Domain entities are never exposed directly.

---

# Resource Groups

The public API is organised around business capabilities.

Primary resource groups:

```text
Travellers

Reservations

Journeys

Accommodation

Experiences

Payments

Operations

Communications
```

Each resource exposes only relevant operations.

---

# Traveller API

Supported operations:

```text
Create Traveller

Retrieve Traveller

Update Traveller
```

Typical Command:

```text
CreateTravellerCommand
```

Typical Query:

```text
FindTravellerQuery
```

---

# Reservation API

Supported operations:

```text
Create Reservation

Retrieve Reservation

Confirm Reservation

Cancel Reservation

Modify Reservation
```

Commands:

```text
CreateReservationCommand

ConfirmReservationCommand

CancelReservationCommand
```

Queries:

```text
FindReservationQuery
```

---

# Journey API

Supported operations:

```text
Create Journey

Retrieve Journey

Start Journey

Complete Journey
```

Commands:

```text
CreateJourneyCommand

CompleteJourneyCommand
```

Queries:

```text
FindJourneyQuery
```

---

# Accommodation API

Supported operations:

```text
Search Accommodation

Assign Accommodation

Replace Accommodation
```

Accommodation searches may utilise supplier integrations without exposing supplier-specific models.

---

# Payment API

Supported operations:

```text
Initiate Payment

Capture Payment

Refund Payment
```

Payment providers remain hidden behind abstractions.

---

# Operations API

Supported operations:

```text
Allocate Driver

Allocate Driver Guide

Generate Operational Schedule

Complete Pickup

Complete Tour
```

Operational rules remain within the Domain Layer.

---

# Communication API

Supported operations:

```text
Send Confirmation

Send Reminder

Send Cancellation Notification
```

Communication providers remain infrastructure concerns.

---

# Request Design

Every request should:

* represent a single business intention
* contain only required information
* be immutable after creation
* support validation

Requests should map naturally to Commands or Queries.

---

# Response Design

Responses should:

* return DTOs only
* never expose Aggregate Roots
* never expose persistence models
* remain stable across implementation changes

Presenters transform DTOs into API responses.

---

# Standard Response Envelope

Successful responses should follow a consistent structure.

Example:

```json
{
  "success": true,
  "data": {
    ...
  },
  "meta": {
    "timestamp": "...",
    "version": "v1"
  }
}
```

---

# Error Envelope

Errors should follow a consistent format.

Example:

```json
{
  "success": false,
  "error": {
    "code": "RESERVATION_ALREADY_CONFIRMED",
    "message": "Reservation has already been confirmed."
  },
  "meta": {
    "timestamp": "...",
    "version": "v1"
  }
}
```

Business exceptions should map to stable error codes.

---

# HTTP Status Mapping

Typical mappings:

| Domain Result           | HTTP Status |
| ----------------------- | ----------: |
| Success                 |   200 / 201 |
| Validation Failure      |         400 |
| Authentication Required |         401 |
| Forbidden               |         403 |
| Not Found               |         404 |
| Business Conflict       |         409 |
| Unexpected Error        |         500 |

Controllers perform this translation.

---

# Validation

Validation occurs at multiple levels.

## Transport Validation

Examples:

* required fields
* data types
* malformed requests

Performed before Commands are created.

---

## Domain Validation

Business validation occurs inside Aggregate Roots.

Examples:

* reservation already confirmed
* invalid journey state
* staffing policy violations
* payment state violations

Business validation must never occur in Controllers.

---

# Idempotency

Operations that may be retried should support idempotency where appropriate.

Examples:

```text
Capture Payment

Confirm Reservation

Send Confirmation Email
```

Idempotency prevents duplicate business operations.

---

# Pagination

Collection endpoints should support pagination.

Recommended parameters:

```text
page

pageSize

sort

order
```

Responses should include pagination metadata.

---

# Filtering

Collection endpoints may support:

```text
status

date range

traveller

journey

supplier
```

Filtering remains independent of persistence technology.

---

# Security

Authentication occurs before Controllers.

Authorisation occurs before Application Services.

Application Services assume authenticated callers.

Business permissions remain outside the Domain Layer.

---

# OpenAPI

OpenAPI specifications should be generated from the implemented API Contracts.

OpenAPI documentation is derived from the implementation rather than acting as the architectural source of truth.

---

# Backward Compatibility

Public contracts must remain backward compatible wherever possible.

Breaking changes require:

* new API version
* migration documentation
* deprecation period

---

# Testing Strategy

API Contract tests verify:

* request validation
* response structure
* error responses
* versioning
* serialization
* backward compatibility

Business behaviour is tested separately within the Domain Layer.

---

# Anti-Patterns

Avoid:

* exposing Aggregate Roots
* exposing Prisma models
* exposing supplier models
* transport-specific business logic
* inconsistent response formats
* leaking infrastructure concerns

---

# Acceptance Criteria

Implementation is compliant when:

* all APIs expose stable contracts
* DTOs are returned instead of domain entities
* controllers translate between HTTP and Commands/Queries
* business rules remain inside Aggregate Roots
* responses follow the standard envelope
* errors follow the standard error contract
* versioning is consistently applied
* infrastructure details remain hidden

---

# Conclusion

API Contracts define the stable public interface of GCT Core. They isolate external consumers from internal implementation, preserve the integrity of the Domain Model, and provide a consistent, versioned contract that supports future evolution across web, mobile, AI, and partner integrations without exposing internal architecture.
