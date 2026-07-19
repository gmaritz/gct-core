# GCT Core – Value Object Catalogue

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document:** Value Object Catalogue
**Version:** 1.0
**Status:** Draft
**Last Updated:** 17 July 2026

---

# 1. Purpose

This document defines the reusable Value Objects used throughout GCT Core.

A Value Object has no independent identity.

It is defined entirely by its attributes and is immutable once created.

Value Objects capture shared business concepts and prevent duplication across the platform.

---

# 2. Design Principles

Every Value Object:

- Is immutable.
- Has no identity.
- Is compared by value.
- Encapsulates business validation.
- Can be reused across bounded contexts.
- Cannot exist independently of an Entity.

---

# 3. Identity Value Objects

Shared identifiers used throughout the platform.

| Value Object | Purpose |
|---------------|---------|
| Reservation Number | Human-friendly reservation reference |
| Quote Number | Quote reference |
| Journey Code | Journey identifier |
| Experience Code | Experience identifier |
| Supplier Code | External supplier identifier |
| Partner Code | Internal partner identifier |
| Hotel Code | Internal accommodation identifier |

---

# 4. Personal Value Objects

Traveller information.

| Value Object | Purpose |
|---------------|---------|
| Person Name | First and last name |
| Email Address | Email validation |
| Telephone Number | International telephone format |
| Physical Address | Postal and street address |
| Nationality | Country of citizenship |
| Dietary Requirement | Guest dietary needs |
| Accessibility Requirement | Accessibility preferences |
| Emergency Contact Details | Emergency contact information |

---

# 5. Commercial Value Objects

Reusable commercial concepts.

| Value Object | Purpose |
|---------------|---------|
| Money | Currency and amount |
| Percentage | Discount or commission |
| Tax Amount | Tax calculation |
| Exchange Rate | Currency conversion |
| Commission Rate | Supplier commission |
| Markup | Commercial markup |
| Price Breakdown | Detailed pricing |
| Cancellation Charge | Cancellation cost |

---

# 6. Time Value Objects

Scheduling concepts.

| Value Object | Purpose |
|---------------|---------|
| Date Range | Start and end dates |
| Duration | Time interval |
| Operating Hours | Opening hours |
| Pickup Window | Collection time window |
| Check-in Time | Hotel check-in |
| Check-out Time | Hotel check-out |
| Booking Deadline | Reservation cutoff |

---

# 7. Location Value Objects

Geographic information.

| Value Object | Purpose |
|---------------|---------|
| GPS Coordinates | Latitude and longitude |
| Geo Point | General map position |
| Meeting Point | Pickup location |
| Route Segment | Part of a journey |
| Region | Geographic region |
| Wine Region | Wine-producing region |

---

# 8. Operational Value Objects

Support operational delivery.

| Value Object | Purpose |
|---------------|---------|
| Capacity | Maximum guests |
| Group Size | Number of travellers |
| Seat Allocation | Reserved seating |
| Driver Status | Operational availability |
| Pickup Sequence | Collection order |
| Operational Window | Working period |

---

# 9. Brand Value Objects

Support brand consistency.

| Value Object | Purpose |
|---------------|---------|
| Brand Colour | Brand palette |
| Typography Style | Font definitions |
| Content Tone | Writing style |
| SEO Metadata | Search metadata |
| GEO Metadata | AI-optimised metadata |
| Image Dimensions | Media sizing |

---

# 10. Integration Value Objects

Represent external system concepts.

| Value Object | Purpose |
|---------------|---------|
| Supplier Identifier | External supplier ID |
| External Product Code | Supplier product |
| External Rate Code | Supplier rate |
| External Reservation ID | Supplier booking reference |
| API Version | Supplier API version |
| Mapping Confidence | Mapping quality |
| Value Object         | Purpose                         |
| Group Size           | Number of participants          |
| Staffing Requirement | Required staffing configuration |
| Staff Role           | Operational role on a tour      |


---

# 11. Context Usage

The following table illustrates reuse.

| Value Object | Traveller | Reservation | Journey | Supplier | Communication |
|---------------|-----------|-------------|----------|-----------|---------------|
| Person Name | ✓ | ✓ | | | ✓ |
| Email Address | ✓ | ✓ | | | ✓ |
| Money | | ✓ | ✓ | ✓ | |
| Date Range | | ✓ | ✓ | ✓ | |
| GPS Coordinates | | | ✓ | ✓ | |
| Capacity | | | ✓ | ✓ | |
| SEO Metadata | | | | | ✓ |

---

# 12. Value Object Rules

Value Objects:

- Cannot be modified.
- Are replaced rather than updated.
- Contain business validation.
- May be shared across bounded contexts.
- Never contain persistence logic.
- Never publish domain events.

---

# 13. Examples

Example:

Money

Currency: ZAR

Amount: 7400.00

This Value Object guarantees:

- Currency is valid.
- Amount is non-negative (unless explicitly allowed, e.g. refunds).
- Arithmetic operations preserve currency consistency.

---

Example:

Date Range

Start: 2027-03-10

End: 2027-03-15

Guarantees:

- Start date precedes end date.
- Duration can be calculated.
- Overlap detection is supported.

---

Example:

GPS Coordinates

Latitude: -33.9258

Longitude: 18.4232

Guarantees:

- Latitude is within valid bounds.
- Longitude is within valid bounds.

---

# 14. Future Value Objects

The architecture should support additional reusable Value Objects, including:

- Wine Preference
- Climate Preference
- Travel Pace
- Budget Range
- Language Preference
- Carbon Footprint
- Sustainability Rating
- Accessibility Score

---

# 15. Conclusion

The Value Object Catalogue establishes a shared business language for GCT Core.

By modelling reusable concepts as immutable Value Objects, the platform avoids duplication, improves consistency and creates a stronger foundation for long-term evolution.