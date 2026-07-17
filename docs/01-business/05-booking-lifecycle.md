# GCT Core – Booking Lifecycle

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document:** Booking Lifecycle
**Version:** 1.0
**Status:** Draft
**Last Updated:** 17 July 2026

---

# 1. Introduction

The Booking Lifecycle defines the complete lifecycle of every booking managed by GCT Core.

A booking is more than a financial transaction.

It represents a customer's commitment to a curated travel experience and becomes the central operational record used throughout the planning, fulfilment and post-travel stages.

This lifecycle defines the business process independently of any software implementation.

---

# 2. Booking Philosophy

Every booking should be:

- Accurate
- Transparent
- Traceable
- Secure
- Recoverable
- Auditable

The booking process should minimise customer effort while maintaining complete operational visibility.

---

# 3. Booking Lifecycle Overview

Every booking progresses through a controlled series of states.

```
Journey Planning

↓

Availability Search

↓

Itinerary Creation

↓

Pricing

↓

Booking Request

↓

Supplier Confirmation

↓

Payment

↓

Booking Confirmed

↓

Pre-Travel

↓

Travel

↓

Completed

↓

Post-Travel
```

Each stage represents a measurable business event.

---

# 4. Stage 1 – Journey Planning

The customer explores destinations and experiences.

Activities include:

- Destination research
- Accommodation selection
- Experience selection
- Date selection
- Budget planning

No booking exists at this stage.

---

# 5. Stage 2 – Availability Search

The platform retrieves live availability from suppliers where applicable.

Availability checks may include:

- Accommodation
- Experiences
- Capacity
- Seasonal restrictions

Only available options should be presented to customers.

---

# 6. Stage 3 – Itinerary Creation

The customer journey is assembled.

The itinerary may include:

- Accommodation
- Private experiences
- Wine experiences
- Curated packages

The itinerary represents the proposed journey but has not yet been confirmed.

---

# 7. Stage 4 – Pricing

The platform calculates the complete itinerary price.

Pricing may consider:

- Supplier rates
- Seasonal pricing
- Occupancy
- Promotions
- Package pricing
- Currency
- Taxes
- Service fees

The customer receives a transparent price before committing.

---

# 8. Stage 5 – Booking Request

The customer confirms their intention to book.

The platform collects:

- Traveller details
- Contact information
- Special requests
- Payment information
- Terms acceptance

The booking enters a pending state.

---

# 9. Stage 6 – Supplier Confirmation

Where supplier confirmation is required, GCT Core validates that all itinerary components can be fulfilled.

Supplier confirmations may include:

- Accommodation confirmation
- Experience confirmation

If any component cannot be confirmed, the platform should allow the itinerary to be amended before payment is finalised.

---

# 10. Stage 7 – Payment

The customer completes payment.

Activities include:

- Payment authorisation
- Fraud checks
- Transaction recording
- Receipt generation

Successful payment does not complete the customer journey.

Instead, it activates fulfilment.

---

# 11. Stage 8 – Booking Confirmed

The booking becomes operational.

Activities include:

- Booking reference creation
- Supplier references
- Confirmation emails
- Travel documentation
- Customer notifications

This stage represents the official commencement of fulfilment.

---

# 12. Stage 9 – Pre-Travel

The platform supports the traveller before departure.

Examples include:

- Travel reminders
- Updated itineraries
- Destination advice
- Travel recommendations
- Weather information
- Important notices

The objective is to improve preparedness and reduce uncertainty.

---

# 13. Stage 10 – Travel

The customer experiences the booked itinerary.

Examples include:

- Hotel check-in
- Private touring
- Wine experiences
- Curated activities

The platform records the operational status of the journey while maintaining communication where appropriate.

---

# 14. Stage 11 – Completed

The itinerary has concluded successfully.

Activities include:

- Completion status
- Supplier reconciliation
- Operational reporting

The booking becomes part of the customer's travel history.

---

# 15. Stage 12 – Post-Travel

The relationship with the customer continues.

Activities may include:

- Thank-you communication
- Customer feedback
- Reviews
- Testimonials
- Future travel recommendations
- Loyalty initiatives

This stage supports repeat business and long-term customer relationships.

---

# 16. Booking States

Every booking should exist in one of the following states.

- Draft
- Pending
- Awaiting Supplier Confirmation
- Awaiting Payment
- Confirmed
- Active
- Completed
- Cancelled
- Refunded
- Archived

State transitions should be fully auditable.

---

# 17. Booking Amendments

Bookings may require modification after confirmation.

Examples include:

- Date changes
- Accommodation changes
- Experience substitutions
- Traveller information updates
- Special requests

Every amendment should preserve the complete booking history.

---

# 18. Booking Cancellation

Bookings may be cancelled according to supplier policies and Go Cape Tours terms and conditions.

Cancellation processing should include:

- Policy validation
- Financial calculation
- Refund processing
- Customer notification
- Supplier notification
- Audit logging

---

# 19. Business Rules

The booking lifecycle follows these principles:

- Every booking has a unique identifier.
- Every booking is associated with one primary traveller.
- Every booking references one itinerary.
- Every booking maintains a complete audit trail.
- Every financial event is recorded.
- Supplier confirmations are preserved.
- Historical booking data is never deleted.

---

# 20. Success Measures

An effective booking lifecycle should achieve:

- High booking completion rates
- Low abandonment rates
- Accurate supplier confirmations
- Minimal manual intervention
- Fast processing times
- Excellent customer satisfaction
- Complete operational traceability

---

# 21. Conclusion

The Booking Lifecycle defines how GCT Core manages customer journeys from initial planning through post-travel engagement.

Rather than viewing a booking as a simple commercial transaction, GCT Core treats it as the operational representation of a customer's travel experience.

This lifecycle provides the business foundation upon which the Booking Engine, Domain Model and future software architecture will be built.