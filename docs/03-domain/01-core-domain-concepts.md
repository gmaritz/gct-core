# GCT Core – Core Domain Concepts

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document:** Core Domain Concepts
**Version:** 1.0
**Status:** Draft
**Last Updated:** 17 July 2026

---

# 1. Introduction

This document defines the primary business concepts that make up the GCT Core domain.

These concepts describe the business independently of any technical implementation.

They form the conceptual foundation for later domain modelling, bounded contexts, aggregate design and entity identification.

---

# 2. Core Domain Philosophy

GCT Core is organised around the traveller's journey.

Unlike traditional travel platforms that begin with supplier inventory, GCT Core begins with the traveller and the experience they wish to have.

Every other concept exists to support that objective.

---

# 3. The Primary Domain Concepts

The domain consists of the following primary concepts.

```
Traveller
        │
Journey
        │
Itinerary
        │
Booking
        │
Service
```

These concepts form the backbone of the business.

---

# 4. Traveller

## Purpose

The Traveller represents the person experiencing the journey.

The traveller is the central beneficiary of every business process.

## Responsibilities

A traveller may:

- Plan journeys
- Request quotations
- Confirm bookings
- Experience services
- Return for future journeys

## Relationships

A traveller:

- Owns one or more journeys
- May have multiple itineraries over time
- May complete many bookings throughout their lifetime

---

# 5. Journey

## Purpose

A Journey represents the complete travel experience.

It begins with inspiration and planning and concludes only after the traveller returns home.

The Journey is the highest-level business concept within GCT Core.

## Responsibilities

A journey provides the context for:

- Destinations
- Accommodation
- Experiences
- Travel timeline
- Customer communications
- Service fulfilment

## Characteristics

A journey:

- May span multiple destinations
- May contain multiple itinerary revisions
- May include multiple bookings where required
- Exists independently of supplier systems

---

# 6. Itinerary

## Purpose

An Itinerary is the planned structure of a journey.

It translates customer requirements into a practical travel plan.

## Responsibilities

An itinerary defines:

- Travel dates
- Destinations
- Daily schedule
- Accommodation
- Experiences
- Optional services

## Characteristics

An itinerary:

- Evolves during planning
- May have several revisions
- Becomes commercially committed through booking

---

# 7. Booking

## Purpose

A Booking represents the commercial confirmation of an itinerary.

It creates contractual and operational commitments.

## Responsibilities

A booking records:

- Confirmed services
- Pricing
- Commercial status
- Payments
- Supplier commitments

## Characteristics

A booking progresses through a controlled lifecycle.

Historical records are preserved.

---

# 8. Service

## Purpose

A Service is something delivered to the traveller during the journey.

Unlike physical products, services are experienced over time.

## Examples

- Accommodation
- Private wine experiences
- Guided touring
- Bespoke itinerary planning
- Destination experiences

## Characteristics

Services may originate from Go Cape Tours or trusted partners.

---

# 9. Supporting Concepts

Several important concepts support the core domain.

These include:

## Destination

Provides geographical context.

---

## Accommodation

Provides places to stay.

---

## Experience

Represents curated activities.

---

## Supplier

Provides fulfilment services.

---

## Pricing

Determines commercial value.

---

## Payment

Confirms financial settlement.

---

## Customer Communication

Maintains traveller engagement throughout the journey.

---

# 10. Relationships Between Concepts

The concepts interact as follows.

```
Traveller

↓

Journey

↓

Itinerary

↓

Booking

↓

Service

↓

Supplier
```

Each concept adds another layer of business meaning without changing the traveller-centric nature of the platform.

---

# 11. Domain Characteristics

The GCT Core domain has several defining characteristics.

## Traveller-Centric

Everything exists to serve the traveller.

---

## Journey-Driven

The journey is the organising concept.

---

## Service-Based

The business delivers services rather than products.

---

## Curated

Quality takes precedence over quantity.

---

## Supplier-Independent

Suppliers fulfil services but do not define the domain.

---

## Long-Term Relationship

The objective is not a single booking but a lifetime relationship with the traveller.

---

# 12. Future Domain Expansion

The conceptual model should naturally support future capabilities including:

- Multi-country journeys
- Specialist travel themes
- Luxury rail experiences
- Safari extensions
- Cruise combinations
- International supplier integrations
- AI-assisted itinerary planning

These additions should extend the domain rather than redefine it.

---

# 13. Conclusion

The Core Domain Concepts define the essential vocabulary and structure of GCT Core.

They describe the business independently of software implementation and provide the conceptual framework upon which the detailed domain model will be built.

Every entity, aggregate, bounded context and business service introduced in later documents should trace back to one or more of these core concepts.