# GCT Core – Context Map

**Project:** GCT Core (Go Cape Tours Core Platform)  
**Document:** Context Map  
**Version:** 1.0  
**Status:** Draft  
**Last Updated:** 19 July 2026

---

# 1. Purpose

This document defines the strategic relationships between the bounded contexts that comprise GCT Core.

The Context Map identifies:

- Context responsibilities
- Upstream and downstream relationships
- Integration patterns
- Published languages
- Anti-Corruption Layers (ACLs)
- Ownership boundaries

It provides the strategic blueprint for both internal architecture and external system integrations.

---

# 2. Context Mapping Principles

Every bounded context should:

- Own its own business rules.
- Own its own data.
- Publish a clear language to other contexts.
- Minimise direct dependencies.
- Remain independently evolvable.
- Protect itself from external models.

---

# 3. Internal Bounded Contexts

| Context | Responsibility |
|----------|----------------|
| Traveller | Customer profiles and traveller preferences |
| Reservation | Reservation lifecycle and booking state |
| Journey | Itinerary creation and package composition |
| Experience | Tours, activities and experiences |
| Accommodation | Hotel selection and accommodation allocation |
| Suppliers | External supplier integrations |
| Payments | Financial transactions |
| Operations | Staff, vehicles and operational planning |
| Communications | Guest messaging and notifications |
| Reporting | Analytics and operational reporting |

---

# 4. Context Relationship Overview

```text
                           Traveller
                               │
                               ▼
                        Reservation
                      ╱      │      ╲
                     ▼       ▼       ▼
                Journey   Payments  Operations
                  │                    │
          ┌───────┴────────┐           ▼
          ▼                ▼    Communications
   Experience      Accommodation
                           │
                           ▼
                      Suppliers
                           │
                           ▼
                      External APIs

Reporting consumes events from every context.
```

---

# 5. Upstream & Downstream Relationships

## Traveller → Reservation

### Relationship

Customer–Supplier

Traveller supplies customer information.

Reservation consumes traveller information.

---

## Reservation → Journey

### Relationship

Customer–Supplier

Journey depends upon confirmed reservations.

Reservation remains authoritative.

---

## Reservation → Payments

### Relationship

Customer–Supplier

Payments validate commercial transactions.

Reservation consumes payment outcomes.

---

## Journey → Experience

### Relationship

Partnership

Journey selects experiences.

Experience owns experience information.

---

## Journey → Accommodation

### Relationship

Partnership

Journey requests accommodation.

Accommodation decides supplier selection.

---

## Accommodation → Suppliers

### Relationship

Customer–Supplier

Accommodation requests availability.

Suppliers provide inventory.

---

## Reservation → Operations

### Relationship

Customer–Supplier

Operations consume confirmed reservations.

Operations own staffing and scheduling.

---

## Operations → Communications

### Relationship

Published Language

Operations publish events.

Communications deliver messages.

---

## All Domains → Reporting

### Relationship

Published Language

Reporting never owns business rules.

Reporting consumes published events only.

---

# 6. Published Languages

Each bounded context exposes a stable language.

| Context | Published Language |
|----------|--------------------|
| Traveller | Traveller Events |
| Reservation | Reservation Events |
| Journey | Journey Events |
| Experience | Experience Events |
| Accommodation | Accommodation Events |
| Suppliers | Supplier Events |
| Payments | Payment Events |
| Operations | Operational Events |
| Communications | Communication Events |

Consumers should depend on published events rather than internal implementation.

---

# 7. Anti-Corruption Layers

External systems should never dictate the internal domain model.

Each external integration is protected by an Anti-Corruption Layer (ACL).

## Accommodation Suppliers

External Models

- Hotelbeds
- Future accommodation suppliers

ACL Responsibilities

- Translate supplier hotel models.
- Map supplier room types.
- Normalise facilities.
- Translate availability.
- Standardise pricing.

---

## Payment Providers

External Models

- Payment gateway APIs

ACL Responsibilities

- Translate payment statuses.
- Convert gateway responses.
- Normalise transaction records.

---

## Communication Providers

External Models

- Email providers
- SMS providers
- WhatsApp providers

ACL Responsibilities

- Translate delivery statuses.
- Normalise messaging responses.

---

## Mapping Services

External Models

- Routing APIs
- Mapping providers

ACL Responsibilities

- Route calculation
- Distance calculation
- Estimated travel times

---

# 8. Open Host Services

Some contexts expose services for internal consumers.

Examples:

Reservation

- Reservation lookup
- Reservation status
- Reservation history

Traveller

- Traveller profile lookup
- Preference retrieval

Accommodation

- Hotel search
- Availability lookup

Payments

- Payment status

These services expose stable contracts without revealing implementation details.

---

# 9. Shared Kernel

The Shared Kernel should remain intentionally small.

Shared concepts include:

- Money
- Currency
- Address
- Date Range
- Geo Location
- Contact Details
- Audit Information

Business logic should never be placed in the Shared Kernel.

---

# 10. External Systems

Current and future integrations include:

Accommodation

- Hotelbeds
- Additional accommodation wholesalers

Payments

- Payment gateways

Communications

- Email services
- SMS services
- WhatsApp services

Maps

- Routing providers

AI

- Recommendation engines
- Content generation
- Itinerary assistance

CRM

- Marketing platforms
- Customer relationship systems

Each integration must pass through an Anti-Corruption Layer.

---

# 11. Integration Patterns

GCT Core supports three integration styles.

## Synchronous

Examples

- Hotel availability search
- Payment authorisation

---

## Asynchronous

Examples

- Reservation confirmed
- Payment captured
- Tour completed

---

## Batch Synchronisation

Examples

- Hotel content import
- Supplier rate updates
- Supplier mapping updates

---

# 12. Context Ownership

| Context | Owner |
|----------|-------|
| Traveller | Customer Management |
| Reservation | Reservations |
| Journey | Journey Planning |
| Experience | Product Management |
| Accommodation | Accommodation Services |
| Suppliers | Supplier Services |
| Payments | Finance |
| Operations | Operations |
| Communications | Guest Communications |
| Reporting | Business Intelligence |

Every context has one authoritative owner.

---

# 13. Evolution Strategy

Bounded contexts should be capable of evolving independently.

Future architectural evolution may include:

- Dedicated reservation service
- Separate supplier integration platform
- AI recommendation service
- Operations scheduling service
- Reporting warehouse

The Context Map enables these transitions without redesigning the domain model.

---

# 14. Design Guidelines

- Avoid direct database sharing between contexts.
- Prefer events over shared tables.
- Protect the domain model from external schemas.
- Publish stable contracts.
- Minimise coupling.
- Preserve clear ownership.
- Treat integrations as replaceable components.

---

# 15. Conclusion

The Context Map provides the strategic integration blueprint for GCT Core. By defining clear ownership, upstream and downstream relationships, published languages and Anti-Corruption Layers, the platform remains resilient, maintainable and adaptable as new suppliers, technologies and business capabilities are introduced.