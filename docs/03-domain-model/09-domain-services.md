# GCT Core – Domain Services

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document:** Domain Services
**Version:** 1.0
**Status:** Draft
**Last Updated:** 17 July 2026

---

# 1. Purpose

This document defines the Domain Services used throughout GCT Core.

Domain Services encapsulate business behaviour that:

- spans multiple Aggregates,
- cannot naturally belong to a single Entity,
- represents important business expertise, or
- coordinates complex business decisions.

They are part of the Domain Layer and contain business rules—not infrastructure concerns.

---

# 2. Design Principles

Every Domain Service should:

- Represent meaningful business behaviour.
- Be stateless.
- Operate on Aggregates rather than own them.
- Publish Domain Events when appropriate.
- Remain independent of databases, messaging infrastructure and user interfaces.

---

# 3. Commercial Services

These services support revenue generation.

---

## Reservation Service

### Purpose

Coordinates the complete reservation lifecycle.

### Responsibilities

- Validate reservation requests
- Reserve inventory
- Apply business rules
- Confirm reservations
- Trigger payment workflow

Uses

- Reservation Aggregate
- Traveller Aggregate
- Partner & Supplier Context

Publishes

- ReservationCreated
- ReservationConfirmed

---

## Quotation Service

### Purpose

Generate commercial quotations.

### Responsibilities

- Calculate pricing
- Apply markups
- Include accommodation
- Include experiences
- Generate quote revisions

---

## Pricing Service

### Purpose

Calculate commercial pricing.

Responsibilities

- Package pricing
- Day tour pricing
- Dynamic markups
- Commission calculation
- Currency conversion
- Promotional pricing

---

# 4. Experience Services

These services represent Go Cape Tours' core expertise.

---

## Experience Design Service

### Purpose

Transform traveller requirements into memorable experiences.

Responsibilities

- Curate experiences
- Balance pacing
- Sequence activities
- Match traveller preferences
- Build premium experiences

Consumes

- Traveller Preferences
- Experience Catalogue
- Partner Information

---

## Journey Design Service

### Purpose

Construct multi-day package journeys.

Responsibilities

- Build itineraries
- Allocate accommodation
- Sequence destinations
- Balance travel time
- Optimise journey flow

---

## Experience Recommendation Service

### Purpose

Recommend suitable experiences.

Responsibilities

- Match interests
- Consider seasonality
- Consider traveller profile
- Recommend alternatives

---

## Accommodation Selection Service

### Purpose

Identify suitable accommodation.

Responsibilities

- Search suppliers
- Compare rates
- Compare availability
- Match traveller preferences
- Apply business rules

Uses

- Hotelbeds
- Future accommodation suppliers

---

# 5. Operational Services

These services support fulfilment.

---

## Logistics Planning Service

Responsibilities

- Allocate Driver Guides
- Allocate Drivers
- Allocate Tour Guides
- Validate staffing policy
- Optimise daily schedules

---

## Schedule Optimisation Service

Responsibilities

- Avoid timing conflicts
- Optimise daily schedules
- Balance operational workload

---

## Guest Care Service

Responsibilities

- Monitor guest milestones
- Trigger communications
- Track service delivery

---

# 6. Integration Services

These services coordinate external systems.

---

## Accommodation Integration Service

Responsibilities

- Retrieve availability
- Retrieve rates
- Map supplier products
- Synchronise inventory

Supports

- Hotelbeds
- WebBeds
- Expedia Rapid
- Future suppliers

---

## Experience Partner Integration Service

Responsibilities

- Synchronise experience information
- Import availability
- Import pricing
- Validate mappings

---

## Payment Gateway Service

Responsibilities

- Payment authorisation
- Capture
- Refund
- Settlement

---

# 7. Decision Services

These services evaluate multiple business options.

---

## Availability Evaluation Service

Purpose

Determine whether a complete package is possible.

Responsibilities

- Combine hotel availability
- Combine experience availability
- Validate dates

---

## Alternative Recommendation Service

Purpose

Suggest alternatives when the preferred option is unavailable.

Responsibilities

- Alternative hotels
- Alternative wine estates
- Alternative experiences
- Alternative travel dates

---

## Traveller Matching Service

Purpose

Match travellers with appropriate experiences.

Inputs

- Budget
- Preferences
- Pace
- Group composition
- Interests

Outputs

- Ranked experience recommendations

---

# 8. AI-Assisted Domain Services

The platform should support AI without compromising deterministic business rules.

Potential AI-enhanced services include:

- Journey Design Assistant
- Experience Recommendation Assistant
- Content Generation Assistant
- Quote Enhancement Assistant
- Itinerary Optimisation Assistant
- Guest Communication Assistant

AI should propose recommendations.

Final business decisions remain governed by domain rules.

---

# 9. Service Collaboration

Domain Services collaborate through Aggregates and Domain Events.

Example:

Traveller
        │
Experience Recommendation Service
        │
Journey Design Service
        │
Quotation Service
        │
Reservation Service
        │
Payment Service
        │
Guest Care Service

No service should become a "God Service" responsible for unrelated concerns.

---

# 10. Service Design Rules

Every Domain Service:

- Represents business behaviour.
- Has a single responsibility.
- Is stateless.
- Depends on domain abstractions.
- Avoids infrastructure dependencies.
- Does not own persistence.

---

# 11. Future Services

The architecture should support additional services such as:

- Concierge Service
- Sustainability Evaluation Service
- Loyalty Service
- Corporate Travel Service
- Wine Recommendation Service
- Seasonal Experience Planner
- Predictive Demand Service

---

# 12. Conclusion

Domain Services capture the business expertise that differentiates Go Cape Tours.

Rather than embedding complex behaviour inside entities or application services, they provide reusable, testable and business-focused capabilities that coordinate multiple aggregates while preserving the integrity of the domain model.