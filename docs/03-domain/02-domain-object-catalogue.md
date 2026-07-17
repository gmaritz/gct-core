# GCT Core – Domain Object Catalogue

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document:** Domain Object Catalogue
**Version:** 1.0
**Status:** Draft
**Last Updated:** 17 July 2026

---

# 1. Introduction

This catalogue identifies the principal business objects that exist within GCT Core.

A domain object is any meaningful concept recognised by the business.

This document intentionally avoids classifying objects as entities, value objects or aggregate roots. Those decisions are made later in the domain modelling process.

The purpose of this catalogue is to ensure that every significant business concept has been identified before software design begins.

---

# 2. Classification

The business objects are grouped into logical categories.

- Core Journey Objects
- Traveller Objects
- Service Objects
- Commercial Objects
- Supplier Objects
- Content Objects
- Operational Objects
- Supporting Objects

---

# 3. Core Journey Objects

These objects represent the heart of the platform.

| Object | Purpose |
|---------|---------|
| Journey | The complete travel experience |
| Itinerary | The planned structure of a journey |
| Day Plan | A single day within an itinerary |
| Stop | A planned location or activity within a day |
| Service | A deliverable component of the journey |

---

# 4. Traveller Objects

These objects describe people and their travel requirements.

| Object | Purpose |
|---------|---------|
| Traveller | Person undertaking the journey |
| Lead Traveller | Primary traveller responsible for the booking |
| Travel Party | Group travelling together |
| Traveller Preference | Personal interests and requirements |
| Traveller Profile | Long-term customer information |
| Special Requirement | Dietary, accessibility or other needs |
| Emergency Contact | Contact in case of emergencies |

---

# 5. Destination Objects

These objects describe where journeys take place.

| Object | Purpose |
|---------|---------|
| Destination | Geographic region |
| City | Urban location |
| Town | Smaller destination |
| Wine Region | Specialist wine-producing area |
| Point of Interest | Landmark or attraction |
| Route | Planned travel path |

---

# 6. Service Objects

These represent the experiences delivered during a journey.

| Object | Purpose |
|---------|---------|
| Experience | Curated activity |
| Accommodation | Overnight stay |
| Experience Category | Classification of experiences |
| Service Schedule | Planned timing |
| Availability | Supplier availability |
| Capacity | Maximum number of participants |
| Duration | Length of service |
| Meeting Point | Service start location |

---

# 7. Commercial Objects

These govern the commercial side of the business.

| Object | Purpose |
|---------|---------|
| Quote | Commercial proposal |
| Booking | Confirmed purchase |
| Booking Reference | Unique identifier |
| Booking Status | Lifecycle stage |
| Cancellation | Cancellation request |
| Amendment | Booking modification |
| Invoice | Financial document |
| Payment | Financial settlement |
| Refund | Returned payment |
| Promotion | Commercial offer |

---

# 8. Pricing Objects

These determine commercial value.

| Object | Purpose |
|---------|---------|
| Price | Monetary value |
| Pricing Rule | Business pricing logic |
| Rate | Supplier pricing |
| Commission | Supplier commission |
| Markup | Commercial adjustment |
| Discount | Price reduction |
| Currency | Monetary unit |
| Tax | Government levy |

---

# 9. Supplier Objects

These describe fulfilment partners.

| Object | Purpose |
|---------|---------|
| Supplier | Service provider |
| Supplier Agreement | Commercial relationship |
| Supplier Contract | Contractual terms |
| Supplier Contact | Operational contact |
| Supplier Availability | Inventory supplied |
| Supplier Performance | Quality metrics |

---

# 10. Content Objects

These support discovery, marketing and traveller education.

| Object | Purpose |
|---------|---------|
| Destination Guide | Informational content |
| Experience Guide | Experience description |
| Wine Estate | Featured winery |
| Image | Photography |
| Video | Multimedia |
| Review | Traveller feedback |
| FAQ | Frequently asked questions |
| SEO Content | Search optimisation |
| GEO Content | AI-friendly structured content |

---

# 11. Operational Objects

These support internal business processes.

| Object | Purpose |
|---------|---------|
| Task | Internal activity |
| Notification | Business alert |
| Communication | Traveller correspondence |
| Document | Business document |
| Audit Record | Historical record |
| Workflow | Business process |
| Approval | Internal decision |

---

# 12. Supporting Objects

These provide shared capabilities across the platform.

| Object | Purpose |
|---------|---------|
| User | Platform user |
| Role | Security role |
| Permission | Access control |
| Organisation | Business entity |
| Address | Physical location |
| Contact Method | Email, phone or messaging |
| Language | Communication language |
| Time Zone | Local time reference |

---

# 13. Cross-Domain Relationships

Several objects naturally support multiple areas of the platform.

Examples include:

- Address
- Currency
- Language
- Payment
- Communication
- Document
- Image

These should be designed as reusable domain concepts rather than duplicated across modules.

---

# 14. Future Domain Objects

The catalogue is expected to evolve.

Potential future objects include:

- Loyalty Programme
- Membership
- Gift Voucher
- Travel Insurance
- Visa Requirement
- Carbon Offset
- AI Travel Assistant
- Dynamic Recommendation
- Traveller Timeline

The platform should accommodate these without requiring fundamental redesign.

---

# 15. Modelling Principles

This catalogue follows several principles.

- Every object represents a recognised business concept.
- Objects are identified before implementation decisions.
- Not every object will become a database table.
- Not every object will become an entity.
- Objects may evolve into aggregates, entities, value objects, services or events.
- The business domain always drives technical design.

---

# 16. Conclusion

The Domain Object Catalogue provides a comprehensive inventory of the business concepts recognised by GCT Core.

It serves as the bridge between conceptual business modelling and detailed software design.

Subsequent documents will classify these objects into bounded contexts, aggregate roots, entities, value objects and domain services while preserving the traveller-centric philosophy established throughout the project.