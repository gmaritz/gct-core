# SPEC-026 — Canonical Logical Data Model

## Document Control

| Field | Value |
|---|---|
| Document ID | SPEC-026 |
| Title | Canonical Logical Data Model |
| Version | 2.0 |
| Status | Draft — Architect Review Required |
| Classification | Internal |
| Owner | GCT Core System Architecture |
| Project | GCT Core |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS.md |
| Architectural Authority | ARCH-000 |
| Related Decision | ADR-001 — Booking, Reservation and Supplier Booking Semantics |
| Previous Version | SPEC-026 v1.0 |
| Downstream | SPEC-027 — Physical Data Model |

---

# 1. Purpose

This specification defines the canonical logical data model for GCT Core.

It establishes:

- canonical business entities;
- aggregate roots;
- aggregate ownership;
- logical relationships;
- domain boundaries;
- fulfilment relationships;
- value objects;
- reference data;
- cross-domain references;
- persistence classifications.

The model is technology independent.

It is the logical authority for subsequent physical data modelling, Prisma modelling, repository design and application implementation.

This revision reconciles the Booking, Reservation and Supplier Booking semantics established by ADR-001 while preserving unrelated established architecture.

---

# 2. Governing Development Process

This specification is produced under:

`GOV-DEV-001-DEVELOPMENT-PROCESS.md`

The specification is the architectural contract for the subsequent physical-model work.

This document does not authorise implementation.

The subsequent development workflow remains:

Specification  
→ Implementation by Copilot  
→ Focused Tests + Regression  
→ Copilot Report  
→ Architect Acceptance  
→ User Commit

No implementation specification or Copilot implementation prompt shall override this logical model without an explicit architecture decision.

---

# 3. Scope

## 3.1 Included

This specification defines:

- Commercial logical entities;
- Reservation aggregate ownership;
- Booking transaction semantics;
- Booking Items;
- Supplier Bookings;
- Go Cape internal fulfilment;
- Customer and Traveller ownership;
- Catalogue ownership;
- Supplier ownership;
- Financial ownership;
- Operations ownership;
- Platform ownership;
- aggregate boundaries;
- cross-domain references;
- value objects;
- reference data;
- persistence classification.

## 3.2 Excluded

This specification does not define:

- PostgreSQL tables;
- Prisma models;
- SQL types;
- database migrations;
- API DTOs;
- HTTP routes;
- supplier payloads;
- supplier-specific persistence structures;
- payment-provider implementation;
- QuickBooks implementation;
- physical naming conventions.

These belong to downstream specifications.

---

# 4. Canonical Modelling Principles

## 4.1 Single Ownership

Every logical business entity has exactly one owning domain and one owning aggregate.

Ownership includes:

- lifecycle;
- validation;
- business rules;
- consistency;
- persistence responsibility.

Ownership is never shared.

---

## 4.2 Aggregate Root

Every aggregate has exactly one Aggregate Root.

External domains may reference Aggregate Roots only.

Child entities are never directly referenced across aggregate boundaries.

---

## 4.3 Aggregate Independence

Aggregates maintain independent lifecycle and consistency boundaries.

One aggregate SHALL NOT be made a child of another aggregate merely because a business process connects them.

---

## 4.4 Canonical Business Concepts

The logical model represents GCT business concepts rather than supplier-specific concepts.

Supplier-specific terminology SHALL be translated into canonical GCT concepts at the supplier boundary.

---

## 4.5 Historical State

Where the Reservation contract requires historical preservation, Reservation owns immutable snapshots rather than depending on mutable live business entities.

This applies particularly to:

- Traveller;
- Journey;
- Accommodation;
- Pricing;
- Payment.

---

## 4.6 Technology Independence

The logical model is independent of:

- PostgreSQL;
- Prisma;
- REST;
- JSON;
- Hotelbeds;
- PayFast;
- QuickBooks;
- other external providers.

---

# 5. Core Booking and Reservation Semantics

## 5.1 Booking

`Booking` represents the commercial transaction/process initiated by the client.

Business meaning:

> Booking is what the client does to secure a Go Cape Tours experience.

The Booking process may include:

- client request;
- availability assessment;
- pricing;
- commercial commitment;
- applicable deposit/payment;
- establishment of the Reservation.

Booking is therefore a business/process concept and SHALL NOT be treated as the parent Aggregate Root of Reservation.

---

## 5.2 Reservation

`Reservation` is the durable GCT business record created from the client's Booking and subsequently managed by Go Cape Tours.

Business meaning:

> Reservation is what Go Cape Tours creates and manages.

Reservation is the canonical Aggregate Root for the Reservation Capability.

Reservation represents the complete experience Go Cape has committed to deliver.

---

## 5.3 Reservation Aggregate

The canonical aggregate is:

`application/reservations/Reservation`

Reservation owns the business state required to manage the experience, including:

- Reservation identity;
- reservation number;
- Reservation lifecycle;
- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- PricingSnapshot;
- PaymentSnapshot;
- Booking Items / fulfilment components;
- supplier references and state;
- Reservation timeline;
- Reservation metadata.

The Reservation aggregate SHALL NOT depend on live supplier or catalogue aggregates to reconstruct its historical state.

---

## 5.4 Booking Item

A `Booking Item` represents an individual component required to fulfil a Reservation.

Examples:

- Go Cape transport;
- externally rented transport;
- wine estate experience;
- restaurant;
- attraction;
- activity;
- accommodation;
- other tour/package component.

Booking Items are Reservation fulfilment components.

They do not form a separate aggregate.

---

## 5.5 Supplier Booking

A `Supplier Booking` represents an external booking made by Go Cape Tours with a supplier to fulfil a Reservation Booking Item.

Examples:

- wine estate booking;
- restaurant booking;
- attraction/activity booking;
- accommodation booking;
- externally rented vehicle booking.

Supplier Bookings are fulfilment records.

They are not the canonical GCT Reservation.

The historical physical use of `Reservation` to mean an external supplier booking is superseded by this semantic definition.

---

## 5.6 Go Cape Internal Fulfilment

A Booking Item may be fulfilled directly by Go Cape.

Examples:

- Go Cape vehicle;
- Go Cape driver;
- Go Cape guide;
- other Go Cape-managed resources.

Not every Booking Item therefore has a Supplier Booking.

Fulfilment may be:

- internal;
- external;
- or a combination of internal and external resources.

---

## 5.7 Availability

Availability is a fulfilment prerequisite.

It may include:

- supplier availability;
- accommodation availability;
- activity availability;
- restaurant availability;
- vehicle availability;
- driver/guide availability;
- other resource availability;
- capacity constraints.

Availability is not Reservation lifecycle state.

A supplier becoming unavailable does not automatically cancel a Reservation.

Supplier substitution may be used where appropriate.

---

# 6. Reservation Lifecycle

The canonical Reservation lifecycle is:

- `CREATED`
- `QUOTED`
- `CONFIRMED`
- `AMENDED`
- `CANCELLED`
- `COMPLETED`

Supplier operational state is separate from this lifecycle.

A Reservation may exist before all fulfilment components have been secured.

Typical progression:

    Client Booking
        ↓
    Reservation Created
        ↓
    Fulfilment Planning
        ↓
    Availability Checks
        ↓
    Supplier Bookings / Internal Allocations
        ↓
    Reservation Confirmed
        ↓
    Amendments if required
        ↓
    Completed or Cancelled

The lifecycle represents the GCT Reservation, not the state of an individual supplier booking.

---

# 7. Reservation Aggregate Composition

The canonical logical Reservation aggregate is:

    Reservation
    ├── Reservation Identity
    ├── Reservation Status
    ├── Traveller Snapshots
    ├── Journey Snapshot
    ├── Accommodation Snapshots
    ├── Pricing Snapshot
    ├── Payment Snapshot
    ├── Booking Items
    ├── Supplier References / State
    ├── Reservation Timeline
    └── Reservation Metadata

All aggregate-owned state remains subject to the canonical Reservation contract established by APP-004.1 and 3K-C.

---

# 8. Reservation Invariants

The Reservation aggregate SHALL preserve:

- unique technical identity;
- distinct business reservation number;
- valid Reservation lifecycle state;
- required Traveller snapshot state;
- required Journey snapshot;
- Reservation-owned historical snapshots;
- Reservation timeline;
- Reservation metadata.

Reservation SHALL NOT:

- call suppliers;
- perform provider orchestration;
- perform payment-provider calls;
- own external supplier systems;
- own Go Cape operational resource aggregates;
- calculate business policy outside its established aggregate responsibility.

Application services and domain services remain responsible for orchestration and policy where already established.

---

# 9. Commercial Domain

## 9.1 Responsibility

The Commercial Domain owns:

- Customer relationships;
- Traveller information;
- Booking transactions;
- Quotations;
- Reservations;
- commercial lifecycle management.

## 9.2 Aggregate Roots

The Commercial Domain contains:

- Customer;
- Quote;
- Reservation.

`Booking` is a commercial transaction/process concept associated with the establishment of Reservation and is not the parent Aggregate Root of Reservation.

---

# 10. Customer Aggregate

## Aggregate Root

`Customer`

## Owned Entity

`Traveller`

Traveller represents customer-associated person information.

Traveller is owned by Customer for master/customer identity purposes.

Reservation SHALL use Traveller snapshots where historical reservation state is required.

The Reservation snapshot SHALL NOT depend on later mutable Traveller state.

---

# 11. Quote Aggregate

## Aggregate Root

`Quote`

Quote represents the commercial offer preceding the client's booking commitment.

Quote may contain the information necessary to establish the commercial terms that lead into a Booking and subsequent Reservation.

Quote does not own Reservation.

---

# 12. Reservation Aggregate

## Aggregate Root

`Reservation`

Reservation is the canonical commercial/fulfilment aggregate for the Reservation Capability.

## Owned Components

- Booking Item;
- Traveller Snapshot;
- Journey Snapshot;
- Accommodation Snapshot;
- Pricing Snapshot;
- Payment Snapshot;
- Supplier Booking references/state;
- Reservation Timeline;
- Reservation Metadata.

The precise structure of these components remains governed by their respective approved application specifications.

---

# 13. Booking Process and Reservation Relationship

The logical relationship is:

    Client
      ↓
    Booking
      ↓
    Reservation
      ↓
    Booking Items
      ↓
    Fulfilment

Booking establishes the commercial transaction.

Reservation becomes the durable business object.

Booking SHALL NOT own Reservation as an aggregate child.

Reservation SHALL NOT be reduced to a Booking record.

---

# 14. Booking Item Fulfilment Model

Each Booking Item identifies a component that must be fulfilled.

Fulfilment may be represented by:

    Booking Item
        ├── Go Cape internal fulfilment
        └── Supplier Booking

A Reservation may contain multiple Booking Items.

A single Reservation may therefore contain:

- multiple Supplier Bookings;
- multiple internal Go Cape allocations;
- a mixture of both.

The existence or absence of a Supplier Booking does not determine whether the Reservation exists.

---

# 15. Supplier Domain

## 15.1 Responsibility

The Supplier Domain owns:

- Supplier;
- Supplier Agreement;
- Supplier Product;
- Supplier availability;
- Supplier rates;
- Supplier offers;
- Supplier seasons;
- supplier synchronisation;
- supplier mapping.

It provides supplier-side information required by other domains.

---

## 15.2 Supplier Booking Boundary

Supplier Booking is a fulfilment concept associated with a Reservation Booking Item.

The Supplier Domain may own supplier integration state required to communicate with external providers.

The Reservation domain owns the canonical Reservation-level supplier references/state required by the Reservation contract.

A supplier's internal booking lifecycle SHALL NOT become the GCT Reservation lifecycle.

---

## 15.3 Supplier Product Aggregate

Aggregate Root:

`Supplier Product`

Owned concepts include:

- Availability;
- Rate;
- Offer;
- Season.

These are supplier-side operational concepts.

They are inputs to fulfilment and pricing decisions.

They are not Reservation state.

---

# 16. Catalogue Domain

## Aggregate Root

`Product`

The Catalogue Domain owns canonical products offered by GCT.

Owned concepts include:

- Product;
- Tour;
- Activity;
- Accommodation;
- Package;
- Destination;
- Media;
- Product Type;
- Product Category.

Catalogue data defines what GCT sells.

It does not represent the historical state of a Reservation.

Reservation snapshots preserve the selected historical state required by the Reservation contract.

---

# 17. Financial Domain

## Aggregate Roots

- Payment;
- Invoice.

The Financial Domain owns:

- Payment;
- Payment Allocation;
- Refund;
- Financial Adjustment;
- Financial Reconciliation;
- Invoice;
- Credit Note;
- Currency;
- Exchange Rate;
- Tax Rate;
- Payment Method.

Payment processing remains a separate Financial concern.

The Reservation may own a `PaymentSnapshot` as historical Reservation state where required by the accepted Reservation contract.

The Payment aggregate remains the authoritative financial transaction.

The snapshot and Financial aggregate SHALL NOT be treated as the same concept.

---

# 18. Operations Domain

## Aggregate Root

`Itinerary`

The Operations Domain owns:

- Itinerary;
- Itinerary Day;
- Itinerary Item;
- Resource Assignment;
- Operational Schedule;
- Tour Execution;
- Operational Note.

The Operations Domain also owns independent resource aggregates:

- Vehicle;
- Driver;
- Guide;
- Trailer.

These resources have independent lifecycles and may be assigned across multiple Reservations/Itineraries.

---

# 19. Reservation and Operations

Reservation provides the commercial commitment.

Operations transforms that commitment into an executable itinerary and resource allocation.

The Operations Domain SHALL NOT become the owner of Reservation state.

Operational availability and resource allocation SHALL remain separate from Reservation lifecycle.

A confirmed Reservation may therefore reference operational fulfilment without owning the Vehicle, Driver or Guide aggregate.

---

# 20. Platform Domain

The Platform Domain provides shared capabilities.

Aggregate Roots include:

- User;
- Role;
- Document;
- Notification;
- Integration Endpoint;
- System Configuration.

Additional platform operational entities include:

- Permission;
- Document Template;
- Notification Template;
- Audit Record;
- Workflow Event.

Platform capabilities do not own Commercial, Catalogue, Supplier, Financial or Operations business concepts.

---

# 21. Cross-Domain Reference Rules

Cross-domain relationships SHALL:

- reference Aggregate Roots only;
- preserve aggregate autonomy;
- preserve single ownership;
- avoid direct child-entity references;
- avoid shared ownership;
- avoid cross-domain lifecycle control;
- avoid cross-domain transactions.

Examples of valid references include:

- Reservation → Product;
- Reservation → Supplier Product;
- Reservation → Payment;
- Reservation → Itinerary;
- Itinerary → Product;
- Itinerary → Supplier Product.

Direct ownership of another domain's child entities is prohibited.

---

# 22. Domain Dependency Model

| Domain | Permitted Dependencies |
|---|---|
| Commercial | Catalogue, Financial, Operations |
| Catalogue | Supplier |
| Supplier | Catalogue |
| Financial | Commercial |
| Operations | Commercial, Catalogue, Supplier |
| Platform | Shared capability only |

Cross-domain references must remain Aggregate Root references.

---

# 23. Value Objects

Canonical Value Objects remain:

| Value Object | Owning Domain | Purpose |
|---|---|---|
| Person Name | Commercial | Person names |
| Contact Information | Commercial | Email, telephone and contact channels |
| Postal Address | Platform | Physical/postal address |
| Geographic Location | Catalogue | Geographic coordinates |
| Money | Financial | Monetary value and currency |
| Date Range | Platform | Start/end dates |
| Time Period | Operations | Operational time period |
| Audit Information | Platform | Audit metadata |
| Tax Calculation | Financial | Tax calculation |
| Media Reference | Catalogue | Media reference |

Value Objects:

- have no independent identity;
- are immutable;
- are compared by value;
- have one owning domain;
- are embedded in their owning entity or aggregate.

---

# 24. Reference Data

| Reference Data | Owning Domain |
|---|---|
| Booking Status | Commercial |
| Product Type | Catalogue |
| Product Category | Catalogue |
| Destination | Catalogue |
| Currency | Financial |
| Tax Rate | Financial |
| Payment Method | Financial |
| Season | Supplier |
| User Role | Platform |
| Permission | Platform |
| Notification Type | Platform |
| Document Type | Platform |

Reference data has one authoritative owner.

Reference data SHALL NOT be duplicated as competing business concepts across domains.

---

# 25. Persistence Classification

Persistence classification remains logical and does not prescribe physical implementation.

| Domain | Master | Transactional | Operational | Reference |
|---|---|---|---|---|
| Commercial | Customer, Traveller | Quote, Reservation | Booking process, Booking Items | Booking Status |
| Catalogue | Product, Tour, Activity, Accommodation, Package | — | Media | Product Type, Product Category, Destination |
| Supplier | Supplier, Supplier Product | — | Availability, Rate, Offer, Synchronisation | Season |
| Financial | Currency | Payment, Invoice, Refund | Reconciliation | Tax Rate, Payment Method |
| Operations | Vehicle, Driver, Guide, Trailer | Itinerary | Schedule, Tour Execution, Resource Assignment | — |
| Platform | User, Document | — | Notification, Workflow Event, Audit Record | Role, Permission |

The physical classification SHALL be reconciled in SPEC-027.

---

# 26. Canonical Entity Catalogue

| Domain | Entity / Concept | Aggregate |
|---|---|---|
| Commercial | Customer | Customer |
| Commercial | Traveller | Customer |
| Commercial | Booking | Reservation process / commercial transaction |
| Commercial | Quote | Quote |
| Commercial | Reservation | Reservation |
| Commercial | Booking Item | Reservation |
| Commercial | Booking Contact | Reservation / commercial context |
| Commercial | Booking Note | Reservation |
| Catalogue | Product | Product |
| Catalogue | Tour | Product |
| Catalogue | Activity | Product |
| Catalogue | Accommodation | Product |
| Catalogue | Package | Product |
| Catalogue | Destination | Product |
| Catalogue | Product Type | Product |
| Catalogue | Product Category | Product |
| Catalogue | Media | Product |
| Supplier | Supplier | Supplier |
| Supplier | Supplier Agreement | Supplier |
| Supplier | Supplier Product | Supplier Product |
| Supplier | Availability | Supplier Product |
| Supplier | Rate | Supplier Product |
| Supplier | Offer | Supplier Product |
| Supplier | Season | Supplier Product |
| Supplier | Synchronisation Job | Supplier |
| Supplier | Import Batch | Supplier |
| Supplier | Mapping Rule | Supplier |
| Supplier | Supplier Booking | Reservation fulfilment |
| Financial | Payment | Payment |
| Financial | Payment Allocation | Payment |
| Financial | Refund | Payment |
| Financial | Financial Adjustment | Payment |
| Financial | Financial Reconciliation | Payment |
| Financial | Invoice | Invoice |
| Financial | Credit Note | Invoice |
| Financial | Currency | Currency |
| Financial | Exchange Rate | Currency |
| Financial | Tax Rate | Tax Rate |
| Financial | Payment Method | Payment Method |
| Operations | Itinerary | Itinerary |
| Operations | Itinerary Day | Itinerary |
| Operations | Itinerary Item | Itinerary |
| Operations | Resource Assignment | Itinerary |
| Operations | Operational Schedule | Itinerary |
| Operations | Tour Execution | Itinerary |
| Operations | Operational Note | Itinerary |
| Operations | Vehicle | Vehicle |
| Operations | Driver | Driver |
| Operations | Guide | Guide |
| Operations | Trailer | Trailer |
| Platform | User | User |
| Platform | Role | Role |
| Platform | Permission | Role |
| Platform | Document | Document |
| Platform | Document Template | Document |
| Platform | Notification | Notification |
| Platform | Notification Template | Notification |
| Platform | Workflow Event | Workflow Event |
| Platform | Audit Record | Audit Record |
| Platform | Integration Endpoint | Integration Endpoint |
| Platform | System Configuration | System Configuration |

---

# 27. Aggregate Catalogue

## Commercial

### Customer

Root:

`Customer`

Child:

`Traveller`

### Quote

Root:

`Quote`

### Reservation

Root:

`Reservation`

Components:

- Booking Item;
- Booking Contact;
- Booking Note;
- Traveller Snapshots;
- Journey Snapshot;
- Accommodation Snapshots;
- Pricing Snapshot;
- Payment Snapshot;
- Supplier references/state;
- Reservation Timeline;
- Reservation Metadata.

`Booking` is not the parent aggregate of Reservation.

---

## Catalogue

### Product

Root:

`Product`

Children:

- Tour;
- Activity;
- Accommodation;
- Package;
- Destination;
- Media;
- Product Type;
- Product Category.

---

## Supplier

### Supplier

Root:

`Supplier`

Children:

- Supplier Agreement;
- Synchronisation Job;
- Import Batch;
- Mapping Rule.

### Supplier Product

Root:

`Supplier Product`

Children:

- Availability;
- Rate;
- Offer;
- Season.

Supplier Booking fulfilment associated with a Reservation Booking Item SHALL NOT become a second canonical Reservation aggregate.

---

## Financial

### Payment

Root:

`Payment`

Children:

- Payment Allocation;
- Refund;
- Financial Adjustment;
- Financial Reconciliation.

### Invoice

Root:

`Invoice`

Child:

- Credit Note.

---

## Operations

### Itinerary

Root:

`Itinerary`

Children:

- Itinerary Day;
- Itinerary Item;
- Resource Assignment;
- Operational Schedule;
- Tour Execution;
- Operational Note.

### Independent Resource Aggregates

- Vehicle;
- Driver;
- Guide;
- Trailer.

---

## Platform

Independent Aggregate Roots:

- User;
- Role;
- Document;
- Notification;
- Integration Endpoint;
- System Configuration;
- Workflow Event;
- Audit Record.

---

# 28. Supplier Fulfilment Model

The logical relationship between Reservation and external fulfilment is:

    Reservation
        ↓
    Booking Item
        ↓
    Supplier Booking
        ↓
    External Supplier

The Supplier Booking exists to fulfil a Reservation component.

A Reservation may contain:

- zero Supplier Bookings at creation;
- one Supplier Booking;
- multiple Supplier Bookings;
- a mixture of Supplier Bookings and internal Go Cape fulfilment.

Supplier substitution SHALL therefore be possible without replacing the Reservation.

---

# 29. Internal Fulfilment Model

The logical relationship for Go Cape-managed fulfilment is:

    Reservation
        ↓
    Booking Item
        ↓
    Go Cape Fulfilment
        ↓
    Resource Assignment
        ↓
    Vehicle / Driver / Guide / Trailer

The operational resources remain independent aggregates.

The Reservation does not own the operational resource aggregate.

---

# 30. Day Tour and Package Tour Model

Both products use the Reservation aggregate.

### Day Tour

Typical components:

- transport;
- wine experiences;
- activities;
- attractions;
- restaurants;
- other tour services.

### Package Tour

Typical components:

- transport;
- wine experiences;
- activities;
- attractions;
- restaurants;
- accommodation;
- other tour services.

The difference is composition.

No separate Reservation aggregate is required for Package Tours.

---

# 31. Cancellation and Amendment

Reservation cancellation and amendment are Reservation business processes.

Cancellation may require evaluation of:

- cancellation timing;
- deposit;
- refund policy;
- supplier cancellation requirements;
- supplier charges;
- operational consequences.

Supplier cancellation state does not become the Reservation lifecycle.

Amendments may require:

- new availability;
- supplier rebooking;
- supplier substitution;
- resource reassignment;
- pricing changes.

The Reservation remains the authoritative business record.

Accounting treatment remains governed by the established Financial architecture and manual QuickBooks process where applicable.

---

# 32. Physical Model Constraints for SPEC-027

The following logical constraints SHALL be honoured by the physical data model:

1. Reservation SHALL NOT be a child entity of a Booking aggregate.
2. Reservation SHALL have its own canonical identity.
3. Reservation SHALL support its own lifecycle.
4. Reservation SHALL preserve its business reservation number.
5. Booking Items SHALL belong to Reservation fulfilment.
6. Supplier Bookings SHALL represent external fulfilment.
7. Supplier Bookings SHALL NOT be mistaken for the canonical Reservation.
8. Internal Go Cape fulfilment SHALL be representable.
9. Reservation SHALL be representable before all Supplier Bookings exist.
10. Supplier lifecycle SHALL remain distinct from Reservation lifecycle.
11. Historical Reservation snapshots SHALL remain reconstructable.
12. The existing physical `reservation` model SHALL not be repurposed until its actual semantics have been reconciled.
13. The physical model SHALL NOT force the canonical Reservation aggregate into the historical Booking root merely for persistence convenience.

Exact tables, relationships, columns and migration strategy belong to SPEC-027.

---

# 33. Ownership Rules

- Each aggregate has one owner.
- Reservation owns Reservation business state.
- Supplier owns supplier master and supplier operational supply state.
- Financial owns financial transactions.
- Operations owns operational resources and execution.
- Catalogue owns canonical products.
- Customer owns Traveller master information.
- Platform owns cross-cutting platform capabilities.
- Supplier Bookings fulfil Reservation Booking Items but do not replace Reservation.
- External domains reference Aggregate Roots only.
- No domain may modify another domain's entities directly.

---

# 34. Traceability

## Architectural Authorities

| Authority | Relationship |
|---|---|
| ARCH-000 | Architecture governance |
| GOV-DEV-001 | Development process |
| ADR-001 | Booking/Reservation/Supplier Booking semantics |
| APP-004 | Reservation capability |
| APP-004.1 | Canonical Reservation aggregate |
| 3K-C | Canonical Reservation contract |

## Downstream

| Specification | Purpose |
|---|---|
| SPEC-027 | Physical Data Model |
| SPEC-028 | Prisma Data Model |
| SPEC-029 | Repository & Persistence Architecture |

---

# 35. Superseded Logical Decisions

The following statements from SPEC-026 v1.0 are superseded by this revision:

1. `Booking` as the parent Aggregate Root of `Reservation`.
2. `Reservation` as a child entity of the Booking aggregate.
3. The interpretation of the logical Reservation entity as an external supplier reservation.

The historical physical model is not itself modified by this document.

Its semantic mapping will be determined in SPEC-027.

---

# 36. Preserved Architecture

This revision does not restart GCT Core.

The following remain preserved:

- six bounded business domains;
- Customer Aggregate;
- Quote Aggregate;
- Catalogue architecture;
- Supplier architecture;
- Financial architecture;
- Operations architecture;
- Platform architecture;
- independent operational resource aggregates;
- canonical Reservation aggregate;
- Reservation lifecycle;
- Reservation snapshots;
- ReservationRepository boundary;
- supplier integration separation;
- existing application Reservation contract;
- established cross-domain ownership principles.

Only the Booking/Reservation/Supplier Booking semantic boundary is reconciled here.

---

# 37. Acceptance Criteria

SPEC-026 v2.0 is ready for architecture approval when:

- [ ] Booking is defined as the commercial transaction/process.
- [ ] Reservation is defined as the canonical GCT Aggregate Root.
- [ ] Reservation is not a child of Booking.
- [ ] Booking Items are Reservation fulfilment components.
- [ ] Supplier Bookings are external fulfilment records.
- [ ] Internal Go Cape fulfilment is supported.
- [ ] Supplier availability is separated from Reservation lifecycle.
- [ ] Reservation can exist before all Supplier Bookings exist.
- [ ] Reservation lifecycle remains canonical.
- [ ] Day Tours and Package Tours use the same Reservation model.
- [ ] Historical Reservation snapshots remain part of the canonical model.
- [ ] Financial Payment remains a separate aggregate while PaymentSnapshot remains Reservation-owned historical state.
- [ ] Operations resources remain separate aggregates.
- [ ] Cross-domain ownership remains explicit.
- [ ] Physical persistence decisions are deferred to SPEC-027.
- [ ] No unrelated architecture is redesigned.
- [ ] ADR-001 is the governing semantic decision.

---

# 38. Next Step

After architect approval of SPEC-026 v2.0:

1. Reconcile SPEC-027 against this logical model.
2. Determine the correct physical representation of Reservation.
3. Determine the correct physical meaning of the existing `reservation` structure.
4. Determine the physical representation of Booking Items and Supplier Bookings.
5. Determine how the existing Booking structure maps to the Booking transaction concept.
6. Only then reconcile SPEC-028.
7. Then reconcile SPEC-029.
8. Only after those specifications are approved should Reservation persistence implementation resume.

No implementation is authorised by SPEC-026 alone.

---

# End of Specification

**Document:** SPEC-026 — Canonical Logical Data Model

**Version:** 2.0

**Status:** Draft — Architect Review Required

**Next Specification:** SPEC-027 — Physical Data Model