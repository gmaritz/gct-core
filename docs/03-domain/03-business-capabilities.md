# GCT Core – Business Capabilities

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document:** Business Capabilities
**Version:** 1.0
**Status:** Draft
**Last Updated:** 17 July 2026

---

# 1. Introduction

Business Capabilities define the core functions that Go Cape Tours performs to deliver value to travellers.

A capability describes *what* the business does, not *how* it is implemented.

Capabilities remain relatively stable even as business processes, technologies and integrations evolve.

This document identifies the primary capabilities that shape the GCT Core platform.

---

# 2. Capability Categories

The capabilities are grouped into three layers:

- Core Commercial Capabilities
- Supporting Business Capabilities
- Platform Capabilities

---

# 3. Core Commercial Capabilities

These capabilities directly generate revenue and define the Go Cape Tours offering.

## Capability 1 – Private Day Experiences

### Purpose

Deliver premium privately guided day experiences.

Examples include:

- Cape Winelands
- Cape Peninsula
- Cape Town
- Hermanus
- Whale Coast
- Custom day experiences

### Characteristics

- Single-day duration
- One booking
- No itinerary required
- Accommodation not included
- Optional quotation
- Private guide
- Premium service

### Typical Workflow

```text
Traveller
      │
Experience Selection
      │
(Optional Quote)
      │
Booking
      │
Service Delivery
```

---

## Capability 2 – Curated Package Journeys

### Purpose

Design and deliver multi-day premium travel experiences.

Examples include:

- Cape & Winelands
- Garden Route
- Safari combinations
- Luxury wine journeys
- Bespoke itineraries

### Characteristics

- Multi-day duration
- Multiple destinations
- Accommodation included
- Detailed itinerary
- Quotation required
- Consultation-led
- Personalised planning

### Typical Workflow

```text
Traveller
      │
Journey Design
      │
Itinerary
      │
Quote
      │
Booking
      │
Service Delivery
```

---

## Capability 3 – Bespoke Journey Planning

### Purpose

Provide professional travel planning services for clients with unique requirements.

Examples include:

- Honeymoons
- Family travel
- Food and wine itineraries
- Luxury escapes
- Special interest travel

### Characteristics

- Highly personalised
- Multiple revisions
- Consultation-driven
- Often results in a Curated Package Journey

---

# 4. Supporting Business Capabilities

These capabilities enable the commercial offering.

## Traveller Management

Maintain traveller profiles, preferences and history.

---

## Booking Management

Create, amend, confirm and cancel bookings.

---

## Quotation Management

Prepare, revise and manage quotations.

---

## Supplier Management

Manage accommodation and experience partners.

---

## Availability Management

Retrieve and manage supplier availability.

---

## Pricing Management

Calculate commercial pricing using business rules.

---

## Payment Management

Receive and reconcile customer payments.

---

## Customer Communication

Manage communications before, during and after travel.

---

## Content Management

Maintain destination, experience and marketing content.

---

# 5. Platform Capabilities

These capabilities support the operation and growth of GCT Core.

## Reporting & Analytics

Business intelligence and operational reporting.

---

## Marketing

SEO, GEO, campaigns and traveller engagement.

---

## User Administration

Manage internal users, roles and permissions.

---

## Integration Management

Connect external supplier platforms and services.

---

## Audit & Compliance

Maintain operational traceability and compliance.

---

# 6. Capability Relationships

The capabilities interact as follows.

```text
Core Commercial Capabilities
            │
            ▼
Supporting Business Capabilities
            │
            ▼
Platform Capabilities
```

The commercial capabilities drive revenue.

The supporting capabilities enable delivery.

The platform capabilities sustain and scale the business.

---

# 7. Shared Platform Services

Several services are shared across multiple capabilities.

These include:

- Traveller Profiles
- Booking Engine
- Pricing Engine
- Payment Engine
- Supplier Integrations
- Notifications
- Documents
- Reporting
- Authentication

These services should be designed once and reused wherever appropriate.

---

# 8. Architectural Implications

The capability model has several architectural consequences.

- Capabilities should be loosely coupled.
- Each capability should have clearly defined responsibilities.
- Shared platform services should avoid duplication.
- Business capabilities should guide bounded context design.
- New capabilities should be introduced without disrupting existing ones.

---

# 9. Future Capability Expansion

The platform should support future commercial capabilities, including:

- Hosted group journeys
- Luxury rail experiences
- Cruise extensions
- Corporate travel
- Incentive programmes
- Concierge services
- Membership offerings

Future capabilities should integrate naturally into the platform while preserving the traveller-centric architecture.

---

# 10. Conclusion

Business Capabilities define what Go Cape Tours does as a business.

They provide the organisational structure for the platform and establish a clear separation between commercial functions, operational support and technical services.

These capabilities will form the foundation for the bounded contexts, aggregates and services defined in the next stage of domain modelling.