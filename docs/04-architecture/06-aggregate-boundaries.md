# GCT Core – Aggregate Boundaries

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document:** Aggregate Boundaries
**Version:** 1.0
**Status:** Draft
**Last Updated:** 17 July 2026

---

# 1. Purpose

This document defines the consistency boundaries for every Aggregate Root in GCT Core.

An aggregate boundary determines:

- which entities belong together
- which business rules must always be true
- which objects may be modified together
- where transactional consistency begins and ends

Aggregate boundaries are one of the most important architectural decisions in the platform.

---

# 2. Design Principles

Every aggregate should:

- protect one business capability
- enforce one set of business invariants
- remain small
- avoid unnecessary loading
- collaborate through identifiers and domain events

No aggregate should directly modify another aggregate.

---

# 3. Traveller Aggregate Boundary

## Aggregate Root

Traveller

### Contains

- Traveller
- Preferences
- Contact Methods
- Emergency Contacts
- Travel Party Members
- Marketing Consent

### References

- Reservations (ID only)
- Journeys (ID only)
- Communications (ID only)

### Owns

- Traveller identity
- Guest preferences
- Long-term relationship

### Publishes Events

- TravellerCreated
- TravellerUpdated
- TravellerPreferencesChanged
- TravellerConsentChanged

---

# 4. Reservation Aggregate Boundary

## Aggregate Root

Reservation

### Contains

- Reservation
- Reservation Items
- Reservation Amendments
- Reservation Notes
- Payment State

### References

- Traveller ID
- Journey ID (optional)
- Experience ID (optional)
- Partner ID
- Supplier ID

### Owns

- Reservation lifecycle
- Commercial state
- Availability allocation
- Reservation integrity

### Publishes Events

- ReservationCreated
- ReservationConfirmed
- ReservationCancelled
- ReservationAmended
- PaymentReceived

---

# 5. Journey Aggregate Boundary

## Aggregate Root

Journey

### Contains

- Journey
- Itinerary
- Day Plans
- Journey Stops

### References

- Traveller ID
- Reservation ID
- Experience IDs
- Accommodation IDs

### Owns

- Journey design
- Itinerary structure
- Experience sequencing

### Publishes Events

- JourneyCreated
- JourneyUpdated
- ItineraryChanged

---

# 6. Experience Aggregate Boundary

## Aggregate Root

Experience

### Contains

- Experience
- Experience Options
- Meeting Points

### References

- Partner ID
- Category ID

### Owns

- Experience definition
- Operating rules
- Capacity limits

### Publishes Events

- ExperienceCreated
- ExperienceUpdated
- ExperienceRetired

---

# 7. Experience Partner Aggregate Boundary

## Aggregate Root

Experience Partner

### Contains

- Partner
- Contracts
- Contacts
- Experience Offerings

### References

- Experiences
- Reservations

### Owns

- Commercial agreements
- Experience catalogue supplied by the partner

### Publishes Events

- PartnerCreated
- ContractUpdated
- OfferingChanged

---

# 8. Accommodation Supplier Aggregate Boundary

## Aggregate Root

Accommodation Supplier

### Contains

- Supplier
- Supplier Contracts
- Supplier Mappings
- Supported Products
- Rate Mapping Rules

### References

- Hotels
- Reservations
- Accommodation Products

### Owns

- Supplier connectivity
- Commercial agreements
- Mapping integrity

### Publishes Events

- SupplierConnected
- SupplierDisconnected
- MappingUpdated
- RatesImported
- AvailabilityImported

---

# 9. Operational Schedule Aggregate Boundary

## Aggregate Root

Operational Schedule

### Contains

- Daily Schedule
- Driver Assignments
- Pickup Events
- Routes

### References

- Reservations
- Journeys

### Owns

- Operational execution

### Publishes Events

- DriverAssigned
- PickupScheduled
- PickupCompleted
- DelayReported

---

# 10. Communication Aggregate Boundary

## Aggregate Root

Communication

### Contains

- Message
- Delivery Attempts
- Delivery Status

### References

- Traveller
- Reservation
- Journey

### Owns

- Communication lifecycle

### Publishes Events

- MessageQueued
- MessageSent
- MessageDelivered
- MessageFailed

---

# 11. Payment Aggregate Boundary

## Aggregate Root

Payment

### Contains

- Payment
- Refunds
- Transactions

### References

- Reservation
- Traveller

### Owns

- Financial integrity

### Publishes Events

- PaymentAuthorised
- PaymentCaptured
- RefundIssued

---

# 12. Boundary Rules

Every aggregate:

- owns its entities
- protects its invariants
- publishes business events
- references external aggregates by identifier only
- never exposes child entities independently

---

# 13. Cross-Aggregate Collaboration

Aggregates collaborate through:

- Domain Events
- Identifiers
- Application Services

Never through shared mutable state.

---

# 14. Conclusion

Aggregate boundaries provide the bridge between strategic modelling and implementation.

They define exactly where consistency is required and where collaboration should occur through events, enabling GCT Core to remain modular, scalable and resilient.