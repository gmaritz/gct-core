# GCT Core – Domain Overview

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document:** Domain Overview
**Version:** 1.0
**Status:** Draft
**Last Updated:** 17 July 2026

---

# 1. Introduction

This document introduces the business domain of GCT Core.

It identifies the major business concepts that exist within the platform and explains how they relate to one another.

This is a conceptual document.

It intentionally avoids discussing databases, APIs, software classes or implementation details.

Its purpose is to establish a shared understanding of the travel domain before detailed domain modelling begins.

---

# 2. The Core Domain

GCT Core is a premium travel commerce platform.

Unlike traditional e-commerce systems, its primary purpose is not to sell products.

Its purpose is to design, manage and deliver exceptional travel experiences.

Every business capability ultimately supports a traveller's journey.

---

# 3. The Central Concept

The most important concept within GCT Core is the **Journey**.

Everything else exists to support it.

The platform does not begin with accommodation.

It does not begin with bookings.

It begins with the traveller's journey.

---

# 4. Conceptual Hierarchy

The business can be understood through the following hierarchy.

```
Traveller
    │
Journey
    │
Itinerary
    │
Booking
    │
Services
```

Each concept represents a different level of the business.

---

# 5. Traveller

The Traveller is the individual undertaking the journey.

The traveller is the reason the platform exists.

Everything within GCT Core ultimately supports the traveller's experience.

A traveller may complete many journeys over time.

---

# 6. Journey

A Journey represents the complete travel experience.

It begins during planning and concludes after the traveller returns home.

A journey is not limited to the booking itself.

It encompasses every stage of the customer lifecycle.

A journey may include:

- Multiple destinations
- Multiple accommodation stays
- Multiple experiences
- Multiple itinerary revisions

The Journey is the highest-level business concept within GCT Core.

---

# 7. Itinerary

An Itinerary represents the planned version of a journey.

It defines:

- Destinations
- Accommodation
- Experiences
- Travel dates
- Daily schedule

An itinerary may evolve multiple times before confirmation.

Only one itinerary is confirmed through a booking.

---

# 8. Booking

A Booking represents the commercial commitment to an itinerary.

It confirms that the traveller intends to purchase the planned services.

A booking creates operational responsibilities for both Go Cape Tours and its suppliers.

---

# 9. Services

Services are the commercial components that make up an itinerary.

Examples include:

- Accommodation
- Private wine experiences
- Private touring
- Destination experiences
- Bespoke itinerary planning

Unlike products in traditional commerce, services are delivered over time.

---

# 10. Accommodation

Accommodation provides places for travellers to stay during their journey.

Accommodation supports the overall experience but is not the primary purpose of the platform.

Accommodation may be supplied by one or more external partners.

---

# 11. Experiences

Experiences represent the defining feature of Go Cape Tours.

Examples include:

- Private wine experiences
- Scenic experiences
- Culinary experiences
- Cultural experiences
- Wildlife experiences

Experiences differentiate the platform from traditional accommodation booking websites.

---

# 12. Destinations

Destinations provide the geographical context of a journey.

Examples include:

- Cape Town
- Cape Winelands
- Garden Route
- Kruger National Park

Destinations connect accommodation, experiences and itineraries.

---

# 13. Suppliers

Suppliers provide services that support customer journeys.

Examples include:

- Accommodation suppliers
- Wine estates
- Experience partners

Suppliers enable the platform but do not define it.

The customer relationship always belongs to Go Cape Tours.

---

# 14. Relationships Between Concepts

The business concepts interact in the following way.

```
Traveller

↓

Journey

↓

Itinerary

↓

Booking

↓

Accommodation

↓

Experiences

↓

Suppliers
```

Each concept supports the concept above it.

---

# 15. Supporting Domains

The core business concepts are supported by several additional domains.

Examples include:

- Customer Management
- Supplier Management
- Pricing
- Payments
- Content
- Marketing
- Administration
- Reporting

These domains exist to enable the successful delivery of journeys.

---

# 16. Domain Philosophy

The domain follows several guiding principles.

### Journey First

Everything begins with the traveller's journey.

---

### Service-Based Commerce

The platform sells services rather than products.

---

### Traveller-Centric Design

Every decision should improve the traveller's experience.

---

### Supplier Independence

Suppliers remain independent of the core business model.

---

### Curation

Quality and expertise are more important than inventory size.

---

# 17. Domain Layers

The business domain can be viewed as four conceptual layers.

## Layer 1 — Traveller

Who is travelling?

---

## Layer 2 — Journey

What experience are they planning?

---

## Layer 3 — Commerce

How is the journey commercially confirmed?

---

## Layer 4 — Delivery

How are the individual services fulfilled?

This layered view provides a clear separation between customer experience, commercial operations and supplier fulfilment.

---

# 18. Domain Boundaries

This document intentionally excludes:

- Database structures
- APIs
- User interface design
- Technical integrations
- Software architecture

Those subjects are addressed in later phases of the project.

---

# 19. Conclusion

The Domain Overview establishes the conceptual structure of GCT Core.

It identifies the principal business concepts and the relationships between them before any detailed modelling takes place.

All subsequent domain models, aggregate roots, entities and bounded contexts should remain aligned with the concepts defined in this document.

The Journey remains the central organising concept of the platform, with travellers, itineraries, bookings and services existing to support the successful delivery of exceptional travel experiences.