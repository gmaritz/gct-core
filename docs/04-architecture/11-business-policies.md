# GCT Core – Business Policies

**Project:** GCT Core (Go Cape Tours Core Platform)  
**Document:** Business Policies  
**Version:** 1.0  
**Status:** Draft  
**Last Updated:** 19 July 2026

---

# 1. Purpose

This document defines the business policies that govern the operation of Go Cape Tours.

Business Policies capture organisational decisions independently of technical implementation. They represent the rules, constraints and operational standards that guide reservations, pricing, staffing, supplier management and guest experiences.

Separating business policies from application logic enables the platform to evolve without requiring changes to the core domain model.

---

# 2. Policy Principles

Every Business Policy should be:

- Business-owned
- Clearly documented
- Configurable where practical
- Version controlled
- Auditable
- Testable
- Independent of implementation technology

Business Policies should describe **what** the business requires rather than **how** software implements those requirements.

---

# 3. Reservation Policies

## RES-001 — Reservation Creation

Every reservation must contain at least one traveller.

---

## RES-002 — Reservation Confirmation

Reservations may only be confirmed once all mandatory booking requirements have been satisfied.

Examples include:

- Required traveller information received
- Supplier availability confirmed
- Required deposits received
- Operational feasibility verified

---

## RES-003 — Reservation Amendments

Confirmed reservations may be amended provided:

- Suppliers permit changes.
- Operational schedules can accommodate the amendment.
- Commercial terms remain acceptable.

---

## RES-004 — Reservation Cancellation

Cancelled reservations cannot be reactivated.

A new reservation must be created if travel is reinstated.

---

## RES-005 — Reservation Expiry

Unconfirmed reservations expire according to commercial policy and supplier requirements.

---

# 4. Traveller Policies

## TRV-001 — Traveller Profiles

Each traveller maintains a single customer profile across all bookings.

---

## TRV-002 — Preferences

Traveller preferences should be retained for future journeys where appropriate.

Examples:

- Wine interests
- Dietary requirements
- Accessibility requirements
- Language preferences

---

## TRV-003 — Privacy

Traveller information must be processed in accordance with applicable privacy legislation.

---

# 5. Journey Policies

## JRN-001 — Bespoke Journeys

Every itinerary should be curated according to traveller preferences whenever practical.

---

## JRN-002 — Experience Compatibility

Experiences included within a journey should be operationally compatible.

Examples:

- Travel times
- Opening hours
- Capacity
- Geographic location

---

## JRN-003 — Journey Quality

Journey quality takes precedence over maximising the number of included experiences.

---

# 6. Tour Staffing Policies

Go Cape Tours primarily operates using **Driver-Guides**.

Separate Driver and Tour Guide roles are introduced only when operational requirements justify additional staffing.

---

## STF-001 — Standard Staffing Model

Private tours and small groups should be assigned one Driver-Guide.

---

## STF-002 — Large Group Staffing

Groups of ten (10) or more participants should normally be assigned:

- One Driver
- One Tour Guide

---

## STF-003 — Specialist Guides

Specialist guides may be allocated based on:

- Wine expertise
- Language requirements
- Specialist destination knowledge
- VIP guest requirements

---

## STF-004 — Staff Allocation

Staff allocations should consider:

- Availability
- Experience
- Qualifications
- Language capability
- Vehicle compatibility
- Working hour regulations

---

# 7. Vehicle Policies

## VEH-001 — Vehicle Suitability

Vehicles must be appropriate for:

- Passenger numbers
- Luggage
- Accessibility requirements
- Planned route

---

## VEH-002 — Safety

Only roadworthy vehicles meeting regulatory requirements may be assigned.

---

## VEH-003 — Driver Eligibility

Drivers must possess all licences and certifications required by law.

---

# 8. Pricing Policies

## PRI-001 — Premium Positioning

Go Cape Tours operates as a premium private touring company.

Pricing should reflect quality rather than competing solely on price.

---

## PRI-002 — Private Tour Pricing

Private tours maintain minimum commercial pricing thresholds.

---

## PRI-003 — Dynamic Supplier Pricing

Accommodation pricing should reflect current supplier rates.

---

## PRI-004 — Margin Protection

Commercial margins should remain within approved business targets.

---

# 9. Accommodation Policies

## ACC-001 — Preferred Suppliers

Preferred accommodation suppliers should be used where commercial and operationally appropriate.

---

## ACC-002 — Quality First

Accommodation quality should take precedence over lowest available price.

---

## ACC-003 — Guest Preferences

Traveller preferences should influence accommodation selection whenever practical.

---

## ACC-004 — Supplier Consistency

Where possible, accommodation within a single reservation should be sourced from the same supplier.

---

# 10. Experience Policies

## EXP-001 — Experience Quality

Only experiences meeting Go Cape Tours quality standards should be offered.

---

## EXP-002 — Capacity

Experience capacity must never be exceeded.

---

## EXP-003 — Authenticity

Experiences should prioritise authenticity over volume tourism.

---

## EXP-004 — Sustainability

Preference should be given to responsible tourism partners.

---

# 11. Supplier Policies

## SUP-001 — Supplier Relationships

Supplier partnerships should prioritise long-term collaboration.

---

## SUP-002 — Data Synchronisation

Supplier availability and pricing should be synchronised regularly.

---

## SUP-003 — Data Validation

Imported supplier data must be validated before publication.

---

## SUP-004 — Supplier Performance

Supplier performance should be monitored continuously.

Measures may include:

- Reliability
- Response time
- Guest satisfaction
- Cancellation frequency

---

# 12. Communication Policies

## COM-001 — Confirmation

Guests should receive booking confirmation promptly following successful reservation confirmation.

---

## COM-002 — Pre-Tour Communication

Guests should receive operational information before departure.

Examples:

- Pickup time
- Driver details
- Weather advice
- Recommended attire

---

## COM-003 — Post-Tour Communication

Guests should receive follow-up communication requesting feedback where appropriate.

---

# 13. Financial Policies

## FIN-001 — Payment Security

Payments must be processed using approved payment providers.

---

## FIN-002 — Refunds

Refunds should follow published cancellation policies and supplier agreements.

---

## FIN-003 — Financial Audit

Financial transactions must remain fully auditable.

---

# 14. AI Governance Policies

## AI-001 — Decision Support

Artificial Intelligence may recommend options but should not make final commercial decisions without appropriate authorisation.

---

## AI-002 — Human Oversight

AI-generated itineraries and recommendations should remain subject to human review where appropriate.

---

## AI-003 — Content Generation

AI-generated marketing or operational content should be reviewed prior to publication.

---

# 15. Policy Versioning

Every policy should record:

- Policy Identifier
- Version
- Effective Date
- Policy Owner
- Change History

Superseded policies should remain archived for audit purposes.

---

# 16. Policy Governance

Business Policies should be reviewed periodically to ensure they remain aligned with:

- Operational practices
- Commercial strategy
- Supplier agreements
- Regulatory requirements
- Customer expectations

Policy ownership rests with Go Cape Tours management.

---

# 17. Conclusion

Business Policies define the operational and commercial standards of Go Cape Tours. They provide a stable foundation for decision-making across the organisation while remaining independent of technology. By separating business policy from software implementation, GCT Core can evolve with changing operational requirements without compromising the integrity of the domain model.