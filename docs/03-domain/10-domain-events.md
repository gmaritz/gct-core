
# GCT Core – Domain Events

**Project:** GCT Core (Go Cape Tours Core Platform)  
**Document:** Domain Events  
**Version:** 1.1  
**Status:** Draft  
**Last Updated:** 19 July 2026

---

# 1. Purpose

This document defines the Domain Events published by GCT Core.

Domain Events describe something that has already happened within the business.

Domain Events enable bounded contexts, operational workflows and external integrations to collaborate without introducing tight coupling.

---

# 2. Event Principles

Every Domain Event:

- Represents a completed business fact.
- Is immutable.
- Has occurred in the past.
- Contains only the information required by consumers.
- Can be replayed safely.
- May trigger workflows in other bounded contexts.

Events should always be named in the past tense.

Examples:

- TravellerCreated
- ReservationConfirmed
- PaymentCaptured

---

# 3. Event Categories

## Business Events

Represent meaningful business activity.

Examples:

- ReservationConfirmed
- JourneyCreated
- TravellerPreferencesUpdated

## Integration Events

Coordinate with external systems.

Examples:

- SupplierAvailabilityImported
- SupplierRatesImported
- PaymentGatewayAuthorised

## Notification Events

Drive guest and operational communications.

Examples:

- ConfirmationEmailRequested
- ReminderMessageRequested
- PickupReminderRequested

---

# 4. Traveller Relationship Events

Published by the Traveller Aggregate.

| Event | Description |
|--------|-------------|
| TravellerCreated | A new traveller profile has been created |
| TravellerUpdated | Traveller information changed |
| TravellerPreferencesUpdated | Preferences modified |
| TravellerConsentGranted | Marketing consent granted |
| TravellerConsentWithdrawn | Marketing consent withdrawn |

Consumers

- Reservations
- Experience Design
- Guest Communications

---

# 5. Reservation Events

Published by the Reservation Aggregate.

| Event | Description |
|--------|-------------|
| ReservationCreated | Reservation initiated |
| ReservationQuoted | Quote accepted |
| ReservationConfirmed | Reservation confirmed |
| ReservationAmended | Reservation changed |
| ReservationCancelled | Reservation cancelled |
| ReservationExpired | Reservation timed out |

Consumers

- Payments
- Operations
- Communications
- Reporting

---

# 6. Journey Events

Published by the Journey Aggregate.

| Event | Description |
|--------|-------------|
| JourneyCreated | Journey assembled |
| JourneyUpdated | Journey modified |
| ItineraryPublished | Itinerary finalised |
| ExperienceAddedToJourney | Experience added |
| AccommodationAllocated | Accommodation assigned |

Consumers

- Logistics
- Communications
- Reporting

---

# 7. Experience Events

Published by the Experience Aggregate.

| Event | Description |
|--------|-------------|
| ExperienceCreated | Experience introduced |
| ExperienceUpdated | Experience changed |
| ExperienceRetired | Experience retired |
| CapacityChanged | Capacity adjusted |

---

# 8. Partner & Supplier Events

## Experience Partner

| Event | Description |
|--------|-------------|
| PartnerCreated | New partner onboarded |
| PartnerContractUpdated | Commercial agreement changed |
| ExperienceOfferingUpdated | Experience catalogue updated |

## Accommodation Supplier

| Event | Description |
|--------|-------------|
| SupplierConnected | Supplier integration established |
| SupplierDisconnected | Supplier integration removed |
| SupplierRatesImported | Latest supplier rates imported |
| SupplierAvailabilityImported | Supplier availability synchronised |
| HotelMappingsUpdated | Hotel mappings updated |

Consumers

- Pricing
- Reservations
- Reporting

---

# 9. Payment Events

Published by the Payment Aggregate.

| Event | Description |
|--------|-------------|
| PaymentAuthorised | Payment approved |
| PaymentCaptured | Funds captured |
| PaymentFailed | Payment unsuccessful |
| RefundIssued | Refund completed |

---

# 10. Operational Events

Published by the Operational Schedule.

## Operational Staffing Policy

- Groups of **1–9 guests** are assigned a single **Driver-Guide**.
- Groups of **10 or more guests** are assigned both a **Driver** and a **Tour Guide**.

| Event | Description |
|--------|-------------|
| StaffingRequirementCalculated | Required staffing determined |
| DriverGuideAssigned | Driver-Guide assigned |
| DriverAssigned | Driver assigned |
| TourGuideAssigned | Tour Guide assigned |
| StaffAssignmentChanged | Staff assignment modified |
| StaffAssignmentCancelled | Staff assignment cancelled |
| OperationalScheduleCreated | Daily operational schedule created |
| PickupScheduled | Pickup confirmed |
| PickupCompleted | Guests collected |
| TourStarted | Tour commenced |
| TourCompleted | Tour completed |
| OperationalDelayReported | Delay identified |
| OperationalIssueReported | Operational issue logged |

Consumers

- Guest Communications
- Reporting

---

# 11. Communication Events

| Event | Description |
|--------|-------------|
| MessageQueued | Awaiting delivery |
| MessageSent | Message dispatched |
| MessageDelivered | Successfully delivered |
| MessageFailed | Delivery unsuccessful |

---

# 12. Brand & Content Events

| Event | Description |
|--------|-------------|
| DestinationContentPublished | Destination content updated |
| EstateGuideUpdated | Winery information updated |
| ExperienceContentPublished | Experience page published |

---

# 13. Typical Event Flow

## Private Day Tour (1–9 Guests)

TravellerCreated
→ ReservationCreated
→ PaymentCaptured
→ ReservationConfirmed
→ StaffingRequirementCalculated
→ DriverGuideAssigned
→ OperationalScheduleCreated
→ PickupScheduled
→ TourStarted
→ TourCompleted

## Large Group Tour (10+ Guests)

TravellerCreated
→ ReservationCreated
→ PaymentCaptured
→ ReservationConfirmed
→ StaffingRequirementCalculated
→ DriverAssigned
→ TourGuideAssigned
→ OperationalScheduleCreated
→ PickupScheduled
→ TourStarted
→ TourCompleted

## Curated Package Journey

TravellerCreated
→ JourneyCreated
→ AccommodationAllocated
→ ReservationCreated
→ PaymentCaptured
→ ReservationConfirmed
→ JourneyDocumentsIssued
→ TourCompleted

---

# 14. Event Metadata

Every event should contain:

- Event ID
- Event Name
- Aggregate ID
- Aggregate Type
- Event Version
- Occurred At (UTC)
- Correlation ID
- Causation ID

Optional:

- User ID
- Source System
- Tenant ID

---

# 15. Event Design Rules

- Immutable
- Represent completed business facts
- No business behaviour
- Small payloads
- Hide implementation details
- Can be transformed into Integration Events

---

# 16. Event Versioning

- Never introduce breaking changes.
- Version payloads when required.
- Consumers should tolerate additional fields.

---

# 17. Future Events

- ConciergeRequested
- LoyaltyRewardGranted
- AIRecommendationAccepted
- SustainabilityOffsetPurchased
- WineShipmentRequested
- GuestFeedbackReceived
- RepeatTravellerRecognised

---

# 18. Conclusion

Domain Events form the communication backbone of GCT Core. They enable bounded contexts, external integrations and operational workflows to collaborate asynchronously while preserving clear ownership of business behaviour. The operational model reflects Go Cape Tours' business practice of assigning a Driver-Guide to couples and small groups, while larger groups receive separate Driver and Tour Guide assignments.
