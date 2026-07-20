# GCT Core – Aggregate Roots

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document:** Aggregate Roots
**Version:** 1.0
**Status:** Draft
**Last Updated:** 17 July 2026

---

# 1. Purpose

This document identifies the Aggregate Roots within GCT Core.

Aggregate Roots are the primary consistency boundaries of the domain model.

Each Aggregate Root:

- owns one transactional boundary
- enforces business invariants
- protects internal consistency
- exposes a single entry point for modification

No object outside an aggregate may directly modify internal entities.

---

# 2. Aggregate Design Principles

Aggregate Roots are selected according to business rules rather than database structure.

Each aggregate should:

- represent one business responsibility
- remain small and cohesive
- enforce consistency immediately
- avoid cross-aggregate transactions
- collaborate using identifiers and domain events

---

# 3. Aggregate Overview

The platform contains the following primary aggregates.

| Domain | Aggregate Root |
|---------|----------------|
| Traveller Relationship | Traveller |
| Reservations | Reservation |
| Experience Design | Journey |
| Experience Design | Experience |
| Partner & Supplier | Partner |
| Logistics & Operations | Operational Schedule |
| Guest Communications | Communication |
| Brand & Content | Brand Asset |
| Payments | Payment |
| Administration | User |

---

# 4. Traveller Aggregate

## Purpose

Represents the long-term relationship with a traveller.

### Responsibilities

- Traveller identity
- Preferences
- Travel history
- Marketing preferences
- Consent
- Travel party relationships

### Business Invariants

- Traveller identity must remain unique.
- Preferences belong to exactly one traveller.
- Consent changes must be auditable.

### Child Entities

- Preference
- Contact Method
- Emergency Contact
- Travel Party Member

### Value Objects

- Name
- Email Address
- Telephone Number
- Address
- Dietary Requirement
- Accessibility Requirement

---

# 5. Reservation Aggregate

## Purpose

Represents a commercial reservation.

This is one of the most important aggregates in the platform.

### Responsibilities

- Reservation lifecycle
- Payment state
- Reservation status
- Cancellation
- Amendments

### Business Invariants

- A reservation cannot exist without a traveller.
- Confirmed reservations require valid availability.
- Reservation status must follow the defined lifecycle.
- Payment state must remain consistent.
- Cancelled reservations cannot be fulfilled.

### Child Entities

- Reservation Item
- Reservation Amendment
- Reservation Note

### Value Objects

- Reservation Number
- Reservation Status
- Money
- Date Range
- Cancellation Policy

---

# 6. Journey Aggregate

## Purpose

Represents a curated multi-day travel experience.

This aggregate exists only for package journeys.

Private day experiences do not create Journey aggregates.

### Responsibilities

- Journey structure
- Itinerary
- Daily planning
- Experience sequencing

### Business Invariants

- A journey contains at least one day.
- Every day belongs to one journey.
- Experiences must occur in chronological order.
- Accommodation and experiences must align with the itinerary.

### Child Entities

- Itinerary
- Day Plan
- Journey Stop

### Value Objects

- Journey Theme
- Duration
- Date Range

---

# 7. Experience Aggregate

## Purpose

Represents a curated day experience.

Examples include:

- Cape Peninsula Tour
- Stellenbosch Wine Tour
- Franschhoek Experience

### Responsibilities

- Experience definition
- Business rules
- Duration
- Capacity
- Meeting information

### Business Invariants

- Duration must be valid.
- Capacity cannot be negative.
- Experience category must exist.

### Child Entities

- Experience Option
- Meeting Point

### Value Objects

- Duration
- Capacity
- Operating Hours

---

# 8. Partner Aggregate

## Purpose

Represents a commercial relationship.

Partners include:

- Wine estates
- Restaurants
- Activity operators
- Guides

Suppliers include:

- Hotelbeds
- WebBeds
- Expedia Rapid

### Responsibilities

- Contracts
- Rates
- Availability mappings
- Commercial agreements

### Business Invariants

- Contract periods may not overlap.
- Commission rules must remain valid.
- Supplier mappings must be unique.

### Child Entities

- Contract
- Contact
- Product Mapping

### Value Objects

- Commission
- Currency
- Contract Period

---

# 9. Operational Schedule Aggregate

## Purpose

Coordinates operational delivery.

### Responsibilities

- Driver allocation
- Pickup schedules
- Daily operations

### Child Entities

- Pickup
- Route
- Driver Assignment

---

# 10. Communication Aggregate

## Purpose

Represents outbound communication.

### Responsibilities

- Templates
- Delivery
- Communication history

### Business Invariants

- Messages cannot be sent without recipients.
- Templates must exist.
- Delivery history is immutable.

---

# 11. Brand Asset Aggregate

## Purpose

Protects Go Cape Tours' brand identity.

### Responsibilities

- Photography
- Brand assets
- Destination content
- Estate storytelling

### Child Entities

- Content Block
- Image
- Video

---

# 12. Payment Aggregate

## Purpose

Owns financial transactions.

### Responsibilities

- Payments
- Refunds
- Settlement
- Invoice association

### Business Invariants

- Payments are immutable once settled.
- Refunds may not exceed payments.
- Currency must remain consistent.

---

# 13. User Aggregate

## Purpose

Represents an internal platform user.

### Responsibilities

- Identity
- Roles
- Permissions

---

# 14. Aggregate Relationships

The aggregates collaborate using identifiers and domain events.

```text
Traveller
      │
Reservation
      │
Journey / Experience
      │
Partner
      │
Operational Schedule
      │
Communication
```

Payments, Brand Assets and Administration provide supporting capabilities without creating tight coupling.

---

# 15. Aggregate Rules

Every aggregate:

- has exactly one Aggregate Root
- protects its own invariants
- owns its child entities
- exposes behaviour rather than setters
- is loaded and persisted as a single consistency boundary

Cross-aggregate updates should be coordinated using domain events rather than direct modification.

---

# 16. Repository Boundaries

Each aggregate root owns one repository.

Examples:

- TravellerRepository
- ReservationRepository
- JourneyRepository
- ExperienceRepository
- PartnerRepository
- PaymentRepository

Repositories never expose child entities independently.

---

# 17. Conclusion

Aggregate Roots define the transactional heart of GCT Core.

They ensure that business rules remain consistent while allowing bounded contexts to evolve independently.

Subsequent modelling will identify the entities, value objects and domain services contained within each aggregate.