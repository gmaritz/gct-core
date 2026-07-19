# GCT Core – Bounded Contexts

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document:** Bounded Contexts
**Version:** 2.0
**Status:** Approved
**Last Updated:** 17 July 2026

---

# 1. Purpose

This document defines the strategic bounded contexts that make up the GCT Core platform.

Each bounded context represents a distinct business capability with its own language, business rules and responsibilities.

The boundaries are based on how Go Cape Tours operates as a premium travel company—not on software modules or database design.

These contexts will guide all future domain modelling, aggregate design, APIs and implementation.

---

# 2. Design Philosophy

The architecture is founded on several principles:

- Traveller-centric
- Experience-led
- Service-based commerce
- Curated over commoditised
- Business boundaries before technical boundaries
- Independent evolution of capabilities
- Supplier independence
- Long-term scalability

---

# 3. Strategic Business Domains

The platform consists of three strategic business domains.

```text
Experience Commerce

Travel Operations

Business Platform
```

These domains contain the bounded contexts described below.

---

# 4. Experience Commerce

Experience Commerce represents the heart of Go Cape Tours.

Its purpose is not simply to sell travel products.

Its purpose is to design and deliver memorable travel experiences.

---

## Traveller Relationship Context

### Purpose

Own the long-term relationship between Go Cape Tours and every traveller.

### Responsibilities

- Traveller profiles
- Guest preferences
- Wine preferences
- Dietary requirements
- Accessibility requirements
- Travel history
- Repeat guests
- Marketing preferences
- Consent management

### Owns

- Traveller
- Guest Profile
- Travel Party
- Preferences

---

## Reservations Context

### Purpose

Manage the commercial lifecycle of every reservation.

### Responsibilities

- Availability checking
- Reservations
- Payments
- Amendments
- Cancellations
- Reservation status
- Reservation confirmations

### Business Rules

- No double booking
- Reservation consistency
- Payment integrity
- Cancellation policy enforcement

### Owns

- Reservation
- Reservation Status
- Payment State
- Cancellation Policy

Typical reservation lifecycle

```text
Availability
      │
(Optional Quote)
      │
Reservation
      │
Payment
      │
Confirmation
      │
Service Delivery
```

---

## Experience Design Context

### Purpose

Design premium travel experiences.

This is the unique competitive advantage of Go Cape Tours.

### Responsibilities

- Curated itineraries
- Journey design
- Experience sequencing
- Storytelling
- Guest personas
- Destination planning
- Wine estate selection

### Owns

- Journey
- Itinerary
- Experience Module
- Day Plan
- Story Narrative
- Guest Persona

Typical workflow

Private Day Experience

```text
Traveller
      │
Experience Design
      │
(Optional Quote)
      │
Reservation
```

Package Journey

```text
Traveller
      │
Journey Design
      │
Itinerary
      │
Quote
      │
Reservation
```

---

# 5. Travel Operations

Travel Operations fulfils the promises created by Experience Commerce.

---

## Partner & Supplier Context

### Purpose

Manage all commercial partners and inventory suppliers.

### Experience Partners

- Wine Estates
- Restaurants
- Guides
- Activity Providers
- Attractions

### Accommodation Suppliers

- Hotelbeds
- WebBeds
- Expedia Rapid
- Future bedbanks

### Responsibilities

- Contracts
- Commercial agreements
- Commission structures
- Live availability
- Live rates
- Allocations
- Blackout dates
- Product mapping
- Supplier performance

### Owns

- Partner
- Supplier
- Contract
- Product Offering
- Supplier Availability
- Supplier Rate

---

## Logistics & Operations Context

### Purpose

Coordinate operational delivery.

### Phase 1

- Pickup scheduling
- Driver assignment
- Collection points
- Tour timing
- Daily operations

### Future

- Fleet management
- Route optimisation
- Vehicle utilisation
- Driver compliance
- Operational planning

### Owns

- Driver
- Vehicle
- Route
- Pickup Event
- Operational Schedule

---

# 6. Business Platform

These capabilities support every other business domain.

---

## Guest Communications Context

### Purpose

Own every communication with travellers.

### Responsibilities

- Email
- WhatsApp
- SMS
- Notifications
- Communication history
- Templates
- Delivery rules
- Brand tone

### Owns

- Message
- Template
- Delivery Channel
- Communication Event

Consumes

- Reservation events
- Experience events

Publishes

- Message Delivered
- Message Failed

---

## Brand & Content Management Context

### Purpose

Own the Go Cape Tours brand.

### Responsibilities

- Brand identity
- Photography
- Destination content
- Estate descriptions
- Storytelling
- SEO
- GEO
- Marketing assets

### Owns

- Brand Asset
- Content Block
- Destination Guide
- Estate Guide
- Experience Content

---

## Payments Context

### Purpose

Process financial transactions.

### Owns

- Payment
- Invoice
- Refund
- Transaction

---

## Administration Context

### Purpose

Support internal platform administration.

### Owns

- User
- Role
- Permission
- Audit Record

---

## Reporting & Analytics Context

### Purpose

Provide operational insight.

### Responsibilities

- Commercial reporting
- Guest analytics
- Reservation analytics
- Partner performance
- Revenue analysis

### Owns

- Dashboard
- KPI
- Report

---

# 7. Context Collaboration

The platform follows an event-driven collaboration model.

```text
Partner & Supplier
          │
          ▼
Reservations
          │
          ▼
Experience Design
          │
          ▼
Logistics & Operations
          │
          ▼
Guest Communications
```

Brand & Content Management supports Experience Design and Guest Communications throughout the process.

Traveller Relationship supports every commercial interaction.

---

# 8. Shared Principles

Every bounded context:

• Owns its own ubiquitous language.

• Owns its own business rules.

• Protects its internal model.

• Collaborates through published interfaces and events.

• Can evolve independently.

---

# 9. Future Contexts

The architecture supports future expansion without structural redesign.

Potential future contexts include:

- Concierge Services
- Loyalty Programme
- Membership
- AI Travel Assistant
- Sustainability
- Corporate Travel
- Guest Experience Intelligence

---

# 10. Conclusion

These bounded contexts reflect how Go Cape Tours actually operates.

Rather than modelling a generic online travel agency, they model a premium experience company that uses technology to support hospitality, curation and long-term traveller relationships.

This document forms the strategic foundation for the tactical Domain-Driven Design work that follows.