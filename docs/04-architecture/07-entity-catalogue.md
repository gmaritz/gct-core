# GCT Core – Entity Catalogue

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document:** Entity Catalogue
**Version:** 1.0
**Status:** Draft
**Last Updated:** 17 July 2026

---

# 1. Purpose

This document defines every Entity within the GCT Core domain.

Entities represent business objects with a unique identity that persists throughout their lifecycle.

Unlike Value Objects, Entities continue to exist even when their attributes change.

---

# 2. Entity Classification

Entities are classified according to their primary business responsibility.

## Master Entities

Long-lived business identities.

Examples:

- Traveller
- Partner
- Supplier
- Experience

---

## Transactional Entities

Created as part of commercial transactions.

Examples:

- Reservation
- Quote
- Payment

---

## Operational Entities

Support fulfilment.

Examples:

- Driver Assignment
- Pickup Event
- Operational Schedule

---

## Reference Entities

Shared business reference data.

Examples:

- Country
- Currency
- Language
- Experience Category

---

## Integration Entities

Represent external systems.

Examples:

- Supplier Product
- Supplier Rate
- Availability Snapshot
- Hotel Mapping

---

# 3. Traveller Relationship Context

## Aggregate Root

Traveller

| Entity | Classification | Description |
|---------|----------------|-------------|
| Traveller | Master | Primary customer identity |
| Travel Party Member | Master | Member of a travelling group |
| Preference | Master | Long-term traveller preferences |
| Contact Method | Master | Email, phone, WhatsApp |
| Emergency Contact | Master | Emergency contact information |
| Marketing Consent | Master | Communication permissions |

---

# 4. Reservations Context

## Aggregate Root

Reservation

| Entity | Classification | Description |
|---------|----------------|-------------|
| Reservation | Transactional | Primary reservation |
| Reservation Item | Transactional | Individual booked component |
| Reservation Amendment | Transactional | Reservation modification |
| Reservation Note | Transactional | Operational notes |
| Reservation Payment | Transactional | Reservation payment record |

---

# 5. Experience Design Context

## Aggregate Root

Journey

| Entity | Classification | Description |
|---------|----------------|-------------|
| Journey | Transactional | Multi-day travel experience |
| Itinerary | Operational | Structured itinerary |
| Day Plan | Operational | Daily schedule |
| Journey Stop | Operational | Destination or activity |
| Experience Module | Operational | Curated experience component |

---

## Aggregate Root

Experience

| Entity | Classification | Description |
|---------|----------------|-------------|
| Experience | Master | Curated day experience |
| Experience Option | Operational | Bookable variation |
| Meeting Point | Reference | Collection location |

---

# 6. Partner & Supplier Context

## Aggregate Root

Experience Partner

| Entity | Classification | Description |
|---------|----------------|-------------|
| Partner | Master | Wine estate, guide, restaurant |
| Partner Contract | Transactional | Commercial agreement |
| Partner Contact | Operational | Contact person |
| Experience Offering | Operational | Experiences provided |

---

## Aggregate Root

Accommodation Supplier

| Entity | Classification | Description |
|---------|----------------|-------------|
| Supplier | Master | External inventory supplier |
| Supplier Contract | Transactional | Commercial agreement |
| Supplier Product | Integration | External accommodation product |
| Supplier Rate | Integration | External pricing |
| Supplier Mapping | Integration | Internal ↔ external mapping |
| Availability Snapshot | Integration | Cached availability |
| Hotel Mapping | Integration | Internal ↔ supplier hotel mapping |

---

# 7. Logistics & Operations Context

## Aggregate Root

Operational Schedule

| Entity | Classification | Description |
|---------|----------------|-------------|
| Operational Schedule | Operational | Daily operational plan |
| Tour Staff Assignment | Operational    | Assigns one or more staff members to a tour |
| Staff Member          | Master         | Employee or contracted guide/driver         |
| Staff Role            | Reference      | Driver Guide, Driver, Tour Guide
| Pickup Event | Operational | Collection activity |
| Route | Operational | Planned travel route |


---

# 8. Guest Communications Context

## Aggregate Root

Communication

| Entity | Classification | Description |
|---------|----------------|-------------|
| Communication | Transactional | Communication record |
| Message | Transactional | Individual communication |
| Delivery Attempt | Operational | Delivery attempt |
| Template | Reference | Message template |

---

# 9. Brand & Content Context

## Aggregate Root

Brand Asset

| Entity | Classification | Description |
|---------|----------------|-------------|
| Brand Asset | Master | Brand identity asset |
| Destination Guide | Master | Destination content |
| Estate Guide | Master | Winery content |
| Experience Content | Master | Experience content |
| Content Block | Operational | Reusable content |
| Image Asset | Operational | Photography |
| Video Asset | Operational | Video content |

---

# 10. Payments Context

## Aggregate Root

Payment

| Entity | Classification | Description |
|---------|----------------|-------------|
| Payment | Transactional | Financial transaction |
| Refund | Transactional | Returned payment |
| Invoice | Transactional | Customer invoice |
| Payment Transaction | Operational | Gateway transaction |

---

# 11. Administration Context

## Aggregate Root

User

| Entity | Classification | Description |
|---------|----------------|-------------|
| User | Master | Internal platform user |
| Role | Reference | Security role |
| Permission | Reference | System permission |
| Audit Record | Operational | Audit history |

---

# 12. Shared Reference Entities

These entities are shared across multiple bounded contexts.

| Entity | Description |
|---------|-------------|
| Country | ISO country |
| Currency | ISO currency |
| Language | Supported language |
| Region | Geographic region |
| Wine Region | Specialist wine region |
| Experience Category | Experience classification |
| Accommodation Category | Hotel classification |
| Cancellation Policy | Commercial policy |
| Tax Rule | Tax configuration |

---

# 13. Entity Design Rules

Every Entity:

- Has a stable identity.
- Has a business lifecycle.
- Owns behaviour, not just data.
- Exists within exactly one Aggregate.
- Cannot belong to multiple Aggregate Roots.
- May reference other Aggregates only by identifier.

---

# 14. Lifecycle Summary

| Classification | Lifecycle |
|----------------|-----------|
| Master | Long-lived |
| Transactional | Business process |
| Operational | Short-lived or fulfilment |
| Reference | Stable/shared |
| Integration | Mirrors external systems |

---

# 15. Conclusion

The Entity Catalogue defines the persistent business identities that make up GCT Core.

Together with the Aggregate Root and Aggregate Boundary documents, it provides the foundation for the platform's database design, ORM models, APIs, application services and event-driven architecture.