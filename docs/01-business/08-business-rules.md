# GCT Core – Business Rules

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document:** Business Rules
**Version:** 1.0
**Status:** Draft
**Last Updated:** 17 July 2026

---

# 1. Introduction

This document defines the fundamental business rules that govern GCT Core.

Business rules describe how the business operates independently of technology.

Every domain model, database design, API, workflow, user interface and software implementation must comply with these rules.

These rules are considered the constitutional principles of the platform.

---

# 2. Core Business Principles

## BR-001

Go Cape Tours is a premium travel company.

Every business decision must reinforce the premium positioning of the brand.

---

## BR-002

The platform exists to create exceptional travel experiences.

It does not exist simply to process bookings.

---

## BR-003

Customer experience always takes precedence over operational convenience.

---

## BR-004

Quality is always preferred over quantity.

Products, suppliers and experiences are curated rather than accumulated.

---

## BR-005

Technology supports personalised service.

It must never replace it where human expertise adds value.

---

# 3. Customer Rules

## BR-100

Every booking belongs to one primary traveller.

---

## BR-101

A traveller may make multiple journeys over time.

---

## BR-102

A journey may contain one or more itineraries.

---

## BR-103

An itinerary may evolve before confirmation.

Historical revisions should be preserved where commercially relevant.

---

## BR-104

Every confirmed booking must reference a single itinerary.

---

## BR-105

Customer information must remain accurate, secure and confidential.

---

## BR-106

Customer relationships belong to Go Cape Tours.

Suppliers must never become the customer's primary relationship.

---

# 4. Journey Rules

## BR-200

Every journey is designed around the customer's interests.

---

## BR-201

Journeys may combine multiple destinations.

---

## BR-202

Journeys may combine multiple accommodation providers.

---

## BR-203

Journeys may combine multiple curated experiences.

---

## BR-204

A journey is considered complete only after all booked services have been delivered.

---

# 5. Itinerary Rules

## BR-300

An itinerary represents the planned journey.

---

## BR-301

An itinerary may exist before a booking.

---

## BR-302

Itineraries may be revised before confirmation.

---

## BR-303

Confirmed itineraries should preserve historical versions where appropriate.

---

## BR-304

Every itinerary must remain internally consistent.

---

# 6. Booking Rules

## BR-400

A booking represents the commercial commitment to an itinerary.

---

## BR-401

Every booking must have a unique reference.

---

## BR-402

Every booking must be fully auditable.

---

## BR-403

Bookings progress through predefined lifecycle states.

---

## BR-404

Historical bookings are never deleted.

---

## BR-405

Booking amendments must preserve historical records.

---

## BR-406

Cancellation policies must be respected.

---

# 7. Accommodation Rules

## BR-500

Accommodation forms part of the customer journey.

It is not the primary product of Go Cape Tours.

---

## BR-501

Accommodation availability should reflect supplier inventory.

---

## BR-502

Accommodation information should remain current and accurate.

---

## BR-503

Accommodation may be booked independently or as part of a curated itinerary.

---

# 8. Experience Rules

## BR-600

Experiences represent the core offering of Go Cape Tours.

---

## BR-601

Only experiences meeting Go Cape Tours quality standards should be offered.

---

## BR-602

Experiences should support the overall customer journey.

---

## BR-603

Every experience should provide genuine customer value.

---

# 9. Supplier Rules

## BR-700

Suppliers provide services.

Go Cape Tours provides the customer experience.

---

## BR-701

Supplier integrations must remain independent of the core platform.

---

## BR-702

Multiple suppliers may coexist within the same category.

---

## BR-703

Supplier performance should be continuously evaluated.

---

## BR-704

Suppliers may be suspended without affecting platform architecture.

---

# 10. Revenue Rules

## BR-800

Revenue is earned by delivering customer value.

---

## BR-801

Revenue should support sustainable long-term growth.

---

## BR-802

Customer trust must never be sacrificed for short-term revenue.

---

## BR-803

Commercial relationships with suppliers should remain ethical and transparent.

---

# 11. Content Rules

## BR-900

Content must be accurate.

---

## BR-901

Content should inspire travel.

---

## BR-902

Content should educate customers.

---

## BR-903

Content should reflect the premium positioning of the brand.

---

## BR-904

Content should support both traditional SEO and modern Generative Engine Optimisation (GEO).

---

# 12. Operational Rules

## BR-1000

Every significant business event should be traceable.

---

## BR-1001

Operational processes should minimise manual intervention where appropriate.

---

## BR-1002

Automation should improve consistency without reducing service quality.

---

## BR-1003

Every operational process should be measurable.

---

# 13. Scalability Rules

## BR-1100

The platform should support future business expansion.

---

## BR-1101

New suppliers should be added without redesigning the platform.

---

## BR-1102

New destinations should not require architectural changes.

---

## BR-1103

Future premium experiences should integrate naturally into the platform.

---

# 14. Architectural Rules

## BR-1200

Business rules take precedence over technical implementation.

---

## BR-1201

The Domain Model represents the business—not the database.

---

## BR-1202

Technical implementation should remain independent of commercial policy wherever possible.

---

## BR-1203

The platform should be modular, maintainable and extensible.

---

## BR-1204

The platform should remain supplier-independent.

---

## BR-1205

Technology decisions should support long-term business strategy.

---

# 15. Conclusion

These business rules define the principles by which GCT Core operates.

Every future software component, business workflow, API, integration and user interface should be evaluated against these rules.

As the platform evolves, new rules may be introduced, but existing rules should only change when the underlying business itself changes.

These principles provide the foundation upon which the remainder of GCT Core will be designed and implemented.