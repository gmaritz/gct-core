# GCT Core – Domain Interactions

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document:** Domain Interactions
**Version:** 1.0
**Status:** Draft
**Last Updated:** 19 July 2026

---

# 1. Purpose

This document defines how the bounded contexts within GCT Core collaborate to deliver business capabilities.

Rather than describing implementation details, this document focuses on the flow of business information and responsibilities between domains.

It provides the blueprint for:

- Application Services
- APIs
- Domain Events
- Integration workflows
- Future microservices

---

# 2. Interaction Principles

Every interaction should follow these principles:

- Domains remain autonomous.
- Communication occurs through well-defined contracts.
- Business rules remain inside the owning domain.
- Cross-domain dependencies should be minimised.
- Prefer events over synchronous calls where practical.
- Avoid circular dependencies.

---

# 3. Domain Collaboration Map

| Domain | Collaborates With |
|---------|-------------------|
| Traveller | Reservation, Journey, Communications |
| Reservation | Traveller, Journey, Payments, Operations |
| Journey | Reservation, Experience, Accommodation |
| Experience | Journey, Suppliers |
| Accommodation | Suppliers, Journey |
| Suppliers | Accommodation, Pricing |
| Payments | Reservation |
| Operations | Reservation, Journey, Communications |
| Communications | All domains |
| Reporting | All domains |

---

# 4. Traveller → Reservation

## Purpose

A traveller initiates a reservation.

### Flow

Traveller

↓

Reservation

Business Activities

- Create reservation
- Validate traveller
- Record guest preferences
- Generate quotation

Events

- TravellerCreated
- ReservationCreated

---

# 5. Reservation → Payments

## Purpose

Commercial validation.

### Flow

Reservation

↓

Payments

Business Activities

- Calculate amount
- Process payment
- Record transaction

Events

- PaymentAuthorised
- PaymentCaptured

---

# 6. Reservation → Journey

## Purpose

Transform a confirmed reservation into a curated journey.

Business Activities

- Build itinerary
- Allocate experiences
- Allocate accommodation
- Generate documentation

Events

- JourneyCreated
- ItineraryPublished

---

# 7. Journey → Experience

## Purpose

Populate the journey with suitable experiences.

Business Activities

- Select experiences
- Validate availability
- Calculate timing
- Ensure compatibility

Events

- ExperienceAddedToJourney

---

# 8. Journey → Accommodation

## Purpose

Assign accommodation to the itinerary.

Business Activities

- Search suppliers
- Compare rates
- Validate preferences
- Allocate hotels

Events

- AccommodationAllocated

---

# 9. Accommodation → Suppliers

## Purpose

Retrieve live inventory.

Business Activities

- Search availability
- Retrieve pricing
- Import content
- Validate mapping

Events

- SupplierAvailabilityImported
- SupplierRatesImported

---

# 10. Reservation → Operations

## Purpose

Prepare the operational delivery of the reservation.

Business Activities

- Determine staffing requirements
- Allocate Driver-Guide or Driver and Tour Guide
- Allocate vehicle
- Build operational schedule
- Confirm pickup logistics

Events

- StaffingRequirementCalculated
- DriverGuideAssigned
- DriverAssigned
- TourGuideAssigned
- OperationalScheduleCreated
- PickupScheduled

Business Policy

Groups of one to nine guests are normally assigned a Driver-Guide.

Groups of ten or more guests are normally assigned a Driver and a Tour Guide.

---

# 11. Operations → Communications

## Purpose

Keep travellers informed.

Business Activities

- Send confirmations
- Send pickup reminders
- Notify delays
- Send post-tour follow-up

Events

- MessageQueued
- MessageSent
- MessageDelivered

---

# 12. Payments → Reporting

## Purpose

Provide financial reporting.

Business Activities

- Revenue reporting
- Margin analysis
- Audit trail

---

# 13. Suppliers → Reporting

## Purpose

Supplier performance monitoring.

Business Activities

- Rate competitiveness
- Cancellation rates
- Availability accuracy
- Supplier utilisation

---

# 14. Cross-Domain Interaction Matrix

| From | To | Interaction |
|------|----|-------------|
| Traveller | Reservation | Create Reservation |
| Reservation | Payments | Capture Payment |
| Reservation | Journey | Create Journey |
| Journey | Experience | Add Experiences |
| Journey | Accommodation | Allocate Hotels |
| Accommodation | Suppliers | Retrieve Inventory |
| Reservation | Operations | Operational Planning |
| Operations | Communications | Notify Traveller |
| Payments | Reporting | Financial Reporting |
| Suppliers | Reporting | Supplier Analytics |

---

# 15. Interaction Ownership

Each interaction has a single owning domain.

| Interaction | Owner |
|-------------|-------|
| Reservation Creation | Reservation |
| Payment Processing | Payments |
| Journey Planning | Journey |
| Experience Allocation | Journey |
| Accommodation Allocation | Accommodation |
| Supplier Synchronisation | Suppliers |
| Operational Planning | Operations |
| Guest Communication | Communications |

The owning domain is responsible for enforcing business rules relating to that interaction.

---

# 16. Interaction Patterns

GCT Core uses three interaction styles.

## Request / Response

Used where an immediate answer is required.

Examples:

- Availability search
- Payment authorisation

---

## Domain Events

Used where asynchronous collaboration is preferred.

Examples:

- ReservationConfirmed
- PaymentCaptured
- OperationalScheduleCreated

---

## Scheduled Synchronisation

Used for external supplier integrations.

Examples:

- Hotel content import
- Rate synchronisation
- Availability refresh

---

# 17. Design Guidelines

Interactions should:

- Remain business-focused.
- Avoid leaking internal implementation.
- Preserve aggregate boundaries.
- Minimise coupling.
- Support future scalability.
- Remain observable through domain events.

---

# 18. Conclusion

Domain Interactions describe how GCT Core functions as a cohesive business platform. By clearly defining responsibilities, ownership and collaboration between bounded contexts, the platform remains maintainable, scalable and aligned with the operational model of Go Cape Tours.