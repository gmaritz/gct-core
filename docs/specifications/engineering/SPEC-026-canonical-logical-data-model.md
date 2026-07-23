# SPEC-026 – Canonical Logical Data Model

**Version:** 1.0  
**Status:** Draft  
**Classification:** Internal  
**Owner:** Enterprise Architecture  
**Project:** GCT Core Platform

---

# Revision History

| Version | Date | Author | Description |
|----------|------|--------|-------------|
| 0.1 | YYYY-MM-DD | Enterprise Architecture | Initial draft |
| 1.0 | YYYY-MM-DD | Enterprise Architecture | First approved version |

---

# Purpose

This specification defines the canonical logical data model for the Go Cape Tours (GCT) Core Platform.

The logical data model establishes the authoritative business entities, aggregate boundaries, ownership rules, and relationships that represent the business independently of implementation technology.

This document serves as the governing specification for:

- Domain Driven Design (DDD)
- PostgreSQL Physical Data Model
- Prisma Schema
- REST APIs
- Application Services
- Integration Services
- Reporting
- Future microservice decomposition

This specification intentionally avoids database implementation details, persistence technologies, or supplier-specific representations.

---

# Scope

This specification defines:

- Canonical business entities
- Aggregate roots
- Aggregate boundaries
- Logical relationships
- Domain ownership
- Value objects
- Reference data
- Cross-domain references
- Persistence classifications
- Governance principles

This specification does **not** define:

- Physical database tables
- SQL data types
- Prisma models
- API contracts
- User interface models
- Supplier payload structures

These are defined in subsequent specifications.

---

# Objectives

The objectives of the Canonical Logical Data Model are to:

- Establish a single authoritative business model.
- Eliminate duplicated business concepts.
- Ensure clear ownership of all business entities.
- Provide stable aggregate boundaries.
- Enable technology-independent architecture.
- Support future business growth.
- Enable consistent integration with external suppliers.
- Provide the foundation for physical database design.

---

# Audience

This document is intended for:

- Enterprise Architects
- Solution Architects
- Software Engineers
- Database Designers
- API Developers
- Technical Leads
- Integration Engineers
- Business Analysts

---

# Related Specifications

| Specification | Description |
|---------------|-------------|
| SPEC-001 | Business Architecture |
| SPEC-002 | Domain Architecture |
| SPEC-003 | Application Architecture |
| SPEC-004 | Integration Architecture |
| SPEC-005 | Technology Architecture |
| SPEC-027 | Physical Data Model |
| SPEC-028 | Prisma Data Model |
| SPEC-029 | REST API Specification |

---

# 1. Canonical Modelling Principles

The logical data model shall adhere to the following architectural principles.

## 1.1 Single Ownership Principle

Every logical entity shall have exactly one owning domain.

Ownership includes:

- lifecycle
- validation
- business rules
- consistency
- persistence responsibility

No entity may be jointly owned by multiple domains.

---

## 1.2 Aggregate Root Principle

Every aggregate shall expose exactly one Aggregate Root.

Only Aggregate Roots may be referenced by external domains.

Internal entities shall never be referenced directly across domain boundaries.

---

## 1.3 Domain Independence Principle

Business domains shall remain logically independent.

Each domain owns its own model.

Business rules belonging to one domain shall not be implemented within another domain.

---

## 1.4 Canonical Business Principle

The logical model represents canonical business concepts.

Supplier-specific concepts shall be translated into canonical concepts before entering the logical model.

Example:

Supplier Accommodation

↓

Accommodation

Supplier Rate

↓

Rate

Supplier Availability

↓

Availability

---

## 1.5 Reference Data Principle

Reference Data shall have exactly one authoritative owner.

Reference data shall never be duplicated across domains.

Examples include:

- Currency
- Tax Rate
- Product Type
- Booking Status
- User Role

---

## 1.6 Value Object Principle

Value Objects:

- have no identity
- are immutable
- are compared by value
- belong to a single owning domain

---

## 1.7 Platform Principle

The Platform domain owns only shared cross-cutting capabilities.

The Platform domain shall never own business concepts.

Examples include:

- User
- Document
- Notification
- Audit
- Configuration

---

## 1.8 Technology Independence Principle

The canonical logical model shall remain independent of:

- PostgreSQL
- Prisma
- REST
- JSON
- MongoDB
- external suppliers

Technology-specific implementation belongs to downstream specifications.

---

# 2. Logical Entity Standards

Every logical entity shall define:

- Name
- Purpose
- Owning Domain
- Aggregate
- Lifecycle
- Relationships
- Business Rules

Entities shall represent business concepts rather than technical constructs.

---

# 3. Aggregate Standards

Aggregates provide transactional consistency and define business boundaries.

Each aggregate shall contain:

- one Aggregate Root
- one consistency boundary
- one transactional boundary

Child entities exist only within the aggregate that owns them.

External domains shall interact only with the Aggregate Root.

Example:

Booking

├── Booking Item

├── Booking Contact

└── Booking Note

External domains reference:

Booking

Never:

Booking Item

---

# 4. Domain Overview

The canonical logical model consists of six business domains.

| Domain | Responsibility |
|---------|----------------|
| Commercial | Customer engagement and commercial commitments |
| Catalogue | Canonical products offered for sale |
| Supplier | External suppliers and commercial supply |
| Financial | Payments, invoicing and financial transactions |
| Operations | Delivery and execution of bookings |
| Platform | Shared platform capabilities |

The Platform domain provides shared services to all business domains but owns no business concepts.

---

# 5. Cross-Domain Dependency Rules

The following dependency rules govern interactions between domains.

| Source Domain | Target Domain | Allowed |
|---------------|---------------|---------|
| Commercial | Catalogue | Yes |
| Commercial | Financial | Yes |
| Commercial | Operations | Yes |
| Catalogue | Supplier | Yes |
| Supplier | Catalogue | Yes |
| Financial | Commercial | Read Only |
| Operations | Commercial | Read Only |
| Platform | All Domains | Yes |

Cross-domain communication shall occur exclusively through Aggregate Roots.

Direct references to internal entities are prohibited.

---

# 6. Commercial Domain

## Purpose

The Commercial Domain owns customer relationships and commercial commitments made between Go Cape Tours and its customers.

It is responsible for the complete customer lifecycle from enquiry through quotation, booking, and reservation.

The Commercial Domain is the authoritative owner of all customer-facing commercial transactions.

## Responsibilities

The Commercial Domain is responsible for:

- Customer management
- Traveller information
- Quotations
- Bookings
- Reservations
- Booking contacts
- Booking notes
- Commercial lifecycle management

## Aggregate Roots

- Customer
- Booking
- Quote

## Owned Entities

| Entity | Aggregate |
|---------|-----------|
| Customer | Customer |
| Traveller | Customer |
| Booking | Booking |
| Booking Item | Booking |
| Booking Contact | Booking |
| Booking Note | Booking |
| Quote | Quote |
| Reservation | Booking |

## Aggregate Structure

Customer

├── Traveller

Booking

├── Booking Item

├── Booking Contact

├── Booking Note

└── Reservation

Quote

## External References

The Commercial Domain may reference:

- Product (Catalogue)
- Supplier Product (Supplier)
- Payment (Financial)
- Itinerary (Operations)

Only Aggregate Roots may be referenced.

Child entities shall never be referenced externally.

# 7. Catalogue Domain

## Purpose

The Catalogue Domain owns the canonical representation of every product offered for sale by Go Cape Tours.

It provides a supplier-independent product catalogue that forms the foundation for quoting, booking, pricing, packaging, and itinerary planning.

The Catalogue Domain defines *what* is sold, not *who* supplies it.

---

## Responsibilities

The Catalogue Domain is responsible for:

- Canonical product definitions
- Product classifications
- Tours
- Activities
- Accommodation
- Packages
- Destinations
- Product media
- Product categorisation

The Catalogue Domain is **not** responsible for:

- Supplier relationships
- Availability
- Rates
- Commercial agreements
- Reservations

---

## Aggregate Root

- Product

---

## Owned Entities

| Entity | Aggregate |
|---------|-----------|
| Product | Product |
| Tour | Product |
| Activity | Product |
| Accommodation | Product |
| Package | Product |
| Destination | Product |
| Media | Product |
| Product Type | Product |
| Product Category | Product |

---

## Aggregate Structure

Product

├── Tour

├── Activity

├── Accommodation

├── Package

├── Destination

├── Media

├── Product Type

└── Product Category

---

## Business Rules

- Every sellable item shall belong to exactly one Product aggregate.
- Every Product shall have one Product Type.
- Every Product may belong to one or more Product Categories.
- A Package may reference multiple Products.
- A Product shall remain independent of any supplier implementation.

---

## External References

The Catalogue Domain may reference:

- Supplier Product (Supplier)

The following domains may reference the Product aggregate:

- Commercial
- Operations
- Supplier

Only the Product Aggregate Root may be referenced.

---

## Lifecycle

Product Created

↓

Product Categorised

↓

Product Published

↓

Product Available for Sale

↓

Product Updated

↓

Product Retired

---

# 8. Supplier Domain

## Purpose

The Supplier Domain owns all relationships with external suppliers and their commercial products.

It translates supplier-specific data into canonical business concepts without exposing supplier implementations to the remainder of the platform.

---

## Responsibilities

The Supplier Domain is responsible for:

- Supplier management
- Supplier agreements
- Supplier products
- Availability
- Rates
- Offers
- Seasons
- Import processing
- Synchronisation
- Mapping rules

The Supplier Domain is not responsible for:

- Customer bookings
- Product catalogue ownership
- Financial processing

---

## Aggregate Roots

- Supplier
- Supplier Product

---

## Owned Entities

| Entity | Aggregate |
|---------|-----------|
| Supplier | Supplier |
| Supplier Agreement | Supplier |
| Synchronisation Job | Supplier |
| Import Batch | Supplier |
| Mapping Rule | Supplier |
| Supplier Product | Supplier Product |
| Availability | Supplier Product |
| Rate | Supplier Product |
| Offer | Supplier Product |
| Season | Supplier Product |

---

## Aggregate Structures

### Supplier

Supplier

├── Supplier Agreement

├── Synchronisation Job

├── Import Batch

└── Mapping Rule

### Supplier Product

Supplier Product

├── Availability

├── Rate

├── Offer

└── Season

---

## Business Rules

- Every Supplier Product belongs to one Supplier.
- Supplier Products may map to one canonical Product.
- Supplier identifiers shall never become canonical identifiers.
- Supplier data shall be validated before publication.
- Import failures shall never corrupt canonical data.

---

## External References

The Supplier Domain may reference:

- Product (Catalogue)

The following domains may reference Supplier Product:

- Commercial
- Operations

Availability, Rate, Offer and Season shall never be referenced directly outside the aggregate.

---

## Lifecycle

Supplier Created

↓

Agreement Established

↓

Import Executed

↓

Validation

↓

Mapping

↓

Supplier Product Published

↓

Availability & Rates Updated

↓

Retired

---

# 9. Financial Domain

## Purpose

The Financial Domain owns the financial consequences of commercial transactions.

It manages invoices, payments, refunds, reconciliations and monetary calculations independently from booking operations.

---

## Responsibilities

The Financial Domain is responsible for:

- Payments
- Invoices
- Refunds
- Credit Notes
- Payment Allocation
- Financial Adjustments
- Currency
- Exchange Rates
- Tax Rates
- Reconciliation

The Financial Domain does not own:

- Bookings
- Products
- Suppliers

---

## Aggregate Roots

- Payment
- Invoice

---

## Owned Entities

| Entity | Aggregate |
|---------|-----------|
| Payment | Payment |
| Payment Allocation | Payment |
| Refund | Payment |
| Financial Adjustment | Payment |
| Financial Reconciliation | Payment |
| Invoice | Invoice |
| Credit Note | Invoice |
| Currency | Currency |
| Exchange Rate | Currency |
| Tax Rate | Tax Rate |
| Payment Method | Payment Method |

---

## Aggregate Structures

### Payment

Payment

├── Payment Allocation

├── Refund

├── Financial Adjustment

└── Financial Reconciliation

### Invoice

Invoice

└── Credit Note

---

## Business Rules

- Every Payment belongs to one Booking.
- A Payment may settle one or more Invoices.
- Refunds shall reference an original Payment.
- Exchange Rates are immutable once applied to a transaction.
- Financial records shall never be physically deleted.

---

## External References

The Financial Domain may reference:

- Booking (Commercial)

The following domains may reference Payment:

- Commercial

Invoice child entities shall not be referenced outside the Financial Domain.

---

## Lifecycle

Invoice Issued

↓

Payment Received

↓

Payment Allocated

↓

Reconciliation

↓

Refund (optional)

↓

Closed

# 10. Operations Domain

## Purpose

The Operations Domain owns the planning, scheduling and execution of confirmed bookings.

It transforms commercial commitments into operational activities by allocating resources, managing itineraries and recording tour execution.

The Operations Domain begins once a booking has been confirmed.

---

## Responsibilities

The Operations Domain is responsible for:

- Itinerary planning
- Itinerary management
- Daily schedules
- Resource allocation
- Vehicle allocation
- Driver allocation
- Guide allocation
- Tour execution
- Operational notes

The Operations Domain is not responsible for:

- Customer quotations
- Payments
- Supplier contracts
- Product definitions

---

## Aggregate Root

- Itinerary

---

## Owned Entities

| Entity | Aggregate |
|---------|-----------|
| Itinerary | Itinerary |
| Itinerary Day | Itinerary |
| Itinerary Item | Itinerary |
| Resource Assignment | Itinerary |
| Operational Schedule | Itinerary |
| Tour Execution | Itinerary |
| Operational Note | Itinerary |
| Vehicle | Vehicle |
| Driver | Driver |
| Guide | Guide |
| Trailer | Trailer |

---

## Aggregate Structures

### Itinerary

Itinerary

├── Itinerary Day

├── Itinerary Item

├── Resource Assignment

├── Operational Schedule

├── Tour Execution

└── Operational Note

### Vehicle

Vehicle

### Driver

Driver

### Guide

Guide

### Trailer

Trailer

> **Architectural Note**
>
> Vehicle, Driver, Guide and Trailer are modelled as independent Aggregate Roots because they have independent lifecycles and may be assigned across multiple itineraries over time. This replaces the earlier concept of an abstract "Operational Resource" aggregate.

---

## Business Rules

- Every confirmed Booking shall have one Itinerary.
- An Itinerary consists of one or more Itinerary Days.
- Each Itinerary Day consists of one or more Itinerary Items.
- Resources shall only be assigned to confirmed itineraries.
- A Vehicle shall not have overlapping assignments.
- A Driver shall not have overlapping assignments.
- A Guide shall not have overlapping assignments.
- Tour Execution records shall provide the operational history of the itinerary.

---

## External References

The Operations Domain may reference:

- Booking (Commercial)
- Product (Catalogue)
- Supplier Product (Supplier)

The following domains may reference the Itinerary aggregate:

- Commercial

No external domain may reference Itinerary child entities directly.

---

## Lifecycle

Booking Confirmed

↓

Itinerary Created

↓

Resources Assigned

↓

Operational Schedule Published

↓

Tour Executed

↓

Operational Notes Recorded

↓

Completed

---

# 11. Platform Domain

## Purpose

The Platform Domain provides shared technical capabilities used across all business domains.

It contains cross-cutting concerns but owns no business concepts.

---

## Responsibilities

The Platform Domain is responsible for:

- Identity management
- Authorisation
- Documents
- Notifications
- Auditing
- Workflow events
- System configuration
- Integration endpoints

The Platform Domain shall never contain business logic belonging to another domain.

---

## Aggregate Roots

- User
- Role
- Document
- Notification
- Integration Endpoint
- System Configuration

---

## Owned Entities

| Entity | Aggregate |
|---------|-----------|
| User | User |
| Role | Role |
| Permission | Role |
| Document | Document |
| Document Template | Document |
| Notification | Notification |
| Notification Template | Notification |
| Audit Record | Audit Record |
| Workflow Event | Workflow Event |
| Integration Endpoint | Integration Endpoint |
| System Configuration | System Configuration |

---

## Aggregate Structures

### User

User

### Role

Role

└── Permission

### Document

Document

└── Document Template

### Notification

Notification

└── Notification Template

### Audit Record

Audit Record

### Workflow Event

Workflow Event

### Integration Endpoint

Integration Endpoint

### System Configuration

System Configuration

> **Architectural Note**
>
> Abstract aggregates such as "Platform Service" have been removed. Each independently managed platform capability is represented by its own Aggregate Root.

---

## Business Rules

- Every User shall have one or more Roles.
- A Role contains one or more Permissions.
- Notifications may be generated from Workflow Events.
- Documents may be generated from Document Templates.
- Audit Records shall be immutable.
- System Configuration changes shall be auditable.

---

## External References

Every business domain may reference:

- User
- Role
- Notification
- Document

Business domains shall not own Platform entities.

---

## Lifecycle

User Created

↓

Role Assigned

↓

Business Event Occurs

↓

Workflow Event Generated

↓

Notification Sent

↓

Audit Recorded

---

# 12. Domain Interaction Model

The canonical logical model is composed of six independent domains.

| Domain | Depends On |
|----------|------------|
| Commercial | Catalogue, Financial, Operations |
| Catalogue | Supplier |
| Supplier | Catalogue |
| Financial | Commercial |
| Operations | Commercial, Catalogue, Supplier |
| Platform | None |

Platform services are available to every domain but do not introduce business ownership dependencies.

---

## Domain Interaction Diagram

Commercial

├── Catalogue

├── Financial

└── Operations

Catalogue

└── Supplier

Platform

├── Commercial

├── Catalogue

├── Supplier

├── Financial

└── Operations

---

# 13. Cross-Domain Reference Rules

To preserve domain independence, cross-domain references shall comply with the following rules.

## Allowed

- Aggregate Root → Aggregate Root
- Read-only references
- Business identifiers
- Canonical identifiers

---

## Not Allowed

- Child Entity → Child Entity
- Aggregate → Child Entity
- Shared ownership
- Cross-domain lifecycle management
- Cross-domain validation
- Cross-domain transactions

---

## Example

**Allowed**

Booking

↓

Product

Booking

↓

Payment

Booking

↓

Itinerary

---

**Not Allowed**

Booking Item

↓

Availability

Traveller

↓

Guide

Booking Note

↓

Rate

---

## Governance Rules

Every cross-domain relationship shall:

- reference an Aggregate Root only;
- preserve aggregate autonomy;
- avoid cyclic ownership;
- maintain transactional independence;
- preserve single ownership of business concepts.

Any new cross-domain dependency shall be reviewed during architecture governance before implementation.

# 14. Value Object Catalogue

Value Objects represent immutable business concepts that have no independent identity.

They are owned by a single domain and are compared by their values rather than by identifiers.

---

## Value Object Characteristics

Every Value Object shall:

- be immutable;
- have no unique identifier;
- belong to one owning domain;
- be compared by value;
- be replaceable as a whole.

---

## Canonical Value Objects

| Value Object | Owning Domain | Purpose |
|--------------|---------------|---------|
| Person Name | Commercial | Customer and traveller names |
| Contact Information | Commercial | Email addresses, telephone numbers and contact channels |
| Postal Address | Platform | Physical and postal addresses |
| Geographic Location | Catalogue | Latitude and longitude coordinates |
| Money | Financial | Monetary values including currency |
| Date Range | Platform | Effective date ranges |
| Time Period | Operations | Operational scheduling periods |
| Audit Information | Platform | Audit metadata |
| Tax Calculation | Financial | Tax calculation values |
| Media Reference | Catalogue | References to media assets |

---

## Usage Rules

- Value Objects shall not be shared across domains by ownership.
- Value Objects may be embedded within entities.
- Value Objects shall not maintain lifecycle state.
- Changes to a Value Object result in replacement rather than modification.

---

# 15. Reference Data Catalogue

Reference Data represents stable classifications shared across the platform.

Each Reference Data set shall have a single owning domain.

---

## Canonical Reference Data

| Reference Data | Owning Domain |
|----------------|---------------|
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

---

## Governance Rules

Reference Data shall:

- have a single authoritative owner;
- change infrequently;
- be reusable across domains;
- never be duplicated;
- remain technology independent.

---

# 16. Persistence Classification Matrix

The logical model classifies information according to its business purpose.

Persistence classifications are logical only and do not imply database implementation.

---

## Classification Types

### Master Data

Relatively stable business information.

Examples:

- Customer
- Product
- Supplier
- Vehicle

---

### Transactional Data

Business events created during normal operations.

Examples:

- Booking
- Quote
- Payment
- Invoice
- Itinerary

---

### Operational Data

Information supporting execution and monitoring.

Examples:

- Availability
- Tour Execution
- Audit Record
- Synchronisation Job
- Workflow Event

---

### Reference Data

Controlled classifications used throughout the platform.

Examples:

- Currency
- Booking Status
- Product Type
- Tax Rate

---

## Persistence Matrix

| Domain | Master | Transactional | Operational | Reference |
|---------|----------|---------------|-------------|-----------|
| Commercial | Customer, Traveller | Booking, Quote | Booking Note | Booking Status |
| Catalogue | Product, Tour, Activity, Accommodation | — | Media | Product Type, Product Category, Destination |
| Supplier | Supplier, Supplier Product | — | Availability, Rate, Offer, Synchronisation Job | Season |
| Financial | Currency | Payment, Invoice, Refund | Financial Reconciliation | Tax Rate, Payment Method |
| Operations | Vehicle, Driver, Guide, Trailer | Itinerary | Tour Execution, Operational Schedule | — |
| Platform | User, Document | — | Notification, Workflow Event, Audit Record | Role, Permission |

---

# 17. Domain Ownership Matrix

Every logical business concept has exactly one owning domain.

Ownership determines:

- lifecycle;
- business rules;
- validation;
- persistence;
- transactional consistency.

---

## Ownership Matrix

| Domain | Owned Concepts |
|---------|----------------|
| Commercial | Customer, Traveller, Booking, Quote, Reservation |
| Catalogue | Product, Tour, Activity, Accommodation, Package, Destination |
| Supplier | Supplier, Supplier Product, Availability, Rate, Offer, Season |
| Financial | Payment, Invoice, Refund, Credit Note, Currency |
| Operations | Itinerary, Vehicle, Driver, Guide, Trailer, Resource Assignment |
| Platform | User, Role, Permission, Document, Notification, Audit Record |

---

## Ownership Rules

- Ownership shall never be shared.
- Only the owning domain may modify an entity.
- Other domains interact through Aggregate Roots only.
- Business rules remain within the owning domain.

---

# 18. Traceability Matrix

This specification provides the logical foundation for downstream architecture and implementation specifications.

---

## Upstream Specifications

| Specification | Relationship |
|---------------|--------------|
| SPEC-001 | Business Architecture |
| SPEC-002 | Domain Architecture |
| SPEC-003 | Application Architecture |
| SPEC-004 | Integration Architecture |
| SPEC-005 | Technology Architecture |

---

## Downstream Specifications

| Specification | Purpose |
|---------------|---------|
| SPEC-027 | Physical Data Model |
| SPEC-028 | Prisma Data Model |
| API Specification | REST resources and contracts |
| Repository Design | Persistence implementation |
| Application Services | Domain service implementation |
| Security Model | Identity and authorisation |
| Reporting Model | Analytical reporting structures |

---

## Implementation Flow

Business Architecture

↓

Domain Architecture

↓

Canonical Logical Data Model (SPEC-026)

↓

Physical Data Model (SPEC-027)

↓

Prisma Schema

↓

Application Services

↓

REST APIs

↓

User Interface

# Appendix A – Canonical Entity Catalogue

| Domain | Entity | Aggregate Root | Persistence |
|---------|--------|----------------|-------------|
| Commercial | Customer | Customer | Master |
| Commercial | Traveller | Customer | Master |
| Commercial | Booking | Booking | Transactional |
| Commercial | Booking Item | Booking | Transactional |
| Commercial | Booking Contact | Booking | Transactional |
| Commercial | Booking Note | Booking | Operational |
| Commercial | Quote | Quote | Transactional |
| Commercial | Reservation | Booking | Transactional |
| Catalogue | Product | Product | Master |
| Catalogue | Tour | Product | Master |
| Catalogue | Activity | Product | Master |
| Catalogue | Accommodation | Product | Master |
| Catalogue | Package | Product | Master |
| Catalogue | Destination | Product | Reference |
| Catalogue | Product Type | Product | Reference |
| Catalogue | Product Category | Product | Reference |
| Catalogue | Media | Product | Master |
| Supplier | Supplier | Supplier | Master |
| Supplier | Supplier Agreement | Supplier | Master |
| Supplier | Supplier Product | Supplier Product | Master |
| Supplier | Availability | Supplier Product | Operational |
| Supplier | Rate | Supplier Product | Operational |
| Supplier | Offer | Supplier Product | Operational |
| Supplier | Season | Supplier Product | Reference |
| Supplier | Synchronisation Job | Supplier | Operational |
| Supplier | Import Batch | Supplier | Operational |
| Supplier | Mapping Rule | Supplier | Master |
| Financial | Payment | Payment | Transactional |
| Financial | Payment Allocation | Payment | Transactional |
| Financial | Refund | Payment | Transactional |
| Financial | Financial Adjustment | Payment | Transactional |
| Financial | Financial Reconciliation | Payment | Operational |
| Financial | Invoice | Invoice | Transactional |
| Financial | Credit Note | Invoice | Transactional |
| Financial | Currency | Currency | Reference |
| Financial | Exchange Rate | Currency | Reference |
| Financial | Tax Rate | Tax Rate | Reference |
| Financial | Payment Method | Payment Method | Reference |
| Operations | Itinerary | Itinerary | Transactional |
| Operations | Itinerary Day | Itinerary | Transactional |
| Operations | Itinerary Item | Itinerary | Transactional |
| Operations | Resource Assignment | Itinerary | Transactional |
| Operations | Operational Schedule | Itinerary | Operational |
| Operations | Tour Execution | Itinerary | Operational |
| Operations | Operational Note | Itinerary | Operational |
| Operations | Vehicle | Vehicle | Master |
| Operations | Driver | Driver | Master |
| Operations | Guide | Guide | Master |
| Operations | Trailer | Trailer | Master |
| Platform | User | User | Master |
| Platform | Role | Role | Reference |
| Platform | Permission | Role | Reference |
| Platform | Document | Document | Master |
| Platform | Document Template | Document | Master |
| Platform | Notification | Notification | Operational |
| Platform | Notification Template | Notification | Master |
| Platform | Workflow Event | Workflow Event | Operational |
| Platform | Audit Record | Audit Record | Operational |
| Platform | Integration Endpoint | Integration Endpoint | Master |
| Platform | System Configuration | System Configuration | Master |

---

# Appendix B – Aggregate Catalogue

## Commercial Domain

### Customer Aggregate

**Aggregate Root**

- Customer

**Children**

- Traveller

---

### Booking Aggregate

**Aggregate Root**

- Booking

**Children**

- Booking Item
- Booking Contact
- Booking Note
- Reservation

---

### Quote Aggregate

**Aggregate Root**

- Quote

---

## Catalogue Domain

### Product Aggregate

**Aggregate Root**

- Product

**Children**

- Tour
- Activity
- Accommodation
- Package
- Destination
- Media
- Product Type
- Product Category

---

## Supplier Domain

### Supplier Aggregate

**Aggregate Root**

- Supplier

**Children**

- Supplier Agreement
- Synchronisation Job
- Import Batch
- Mapping Rule

---

### Supplier Product Aggregate

**Aggregate Root**

- Supplier Product

**Children**

- Availability
- Rate
- Offer
- Season

---

## Financial Domain

### Payment Aggregate

**Aggregate Root**

- Payment

**Children**

- Payment Allocation
- Refund
- Financial Adjustment
- Financial Reconciliation

---

### Invoice Aggregate

**Aggregate Root**

- Invoice

**Children**

- Credit Note

---

## Operations Domain

### Itinerary Aggregate

**Aggregate Root**

- Itinerary

**Children**

- Itinerary Day
- Itinerary Item
- Resource Assignment
- Operational Schedule
- Tour Execution
- Operational Note

---

### Vehicle Aggregate

**Aggregate Root**

- Vehicle

---

### Driver Aggregate

**Aggregate Root**

- Driver

---

### Guide Aggregate

**Aggregate Root**

- Guide

---

### Trailer Aggregate

**Aggregate Root**

- Trailer

---

## Platform Domain

### User Aggregate

**Aggregate Root**

- User

---

### Role Aggregate

**Aggregate Root**

- Role

**Children**

- Permission

---

### Document Aggregate

**Aggregate Root**

- Document

**Children**

- Document Template

---

### Notification Aggregate

**Aggregate Root**

- Notification

**Children**

- Notification Template

---

### Workflow Event Aggregate

**Aggregate Root**

- Workflow Event

---

### Audit Record Aggregate

**Aggregate Root**

- Audit Record

---

### Integration Endpoint Aggregate

**Aggregate Root**

- Integration Endpoint

---

### System Configuration Aggregate

**Aggregate Root**

- System Configuration

---

# Appendix C – Value Object Catalogue

| Value Object | Domain | Description |
|--------------|--------|-------------|
| Person Name | Commercial | Customer and traveller names |
| Contact Information | Commercial | Email, phone numbers and contact channels |
| Postal Address | Platform | Physical and postal addresses |
| Geographic Location | Catalogue | Latitude and longitude |
| Money | Financial | Monetary amount with currency |
| Date Range | Platform | Effective start and end dates |
| Time Period | Operations | Operational scheduling periods |
| Audit Information | Platform | Created/updated metadata |
| Tax Calculation | Financial | Tax calculation values |
| Media Reference | Catalogue | References to media assets |

---

## Value Object Rules

- Immutable
- No identity
- Compared by value
- Owned by a single domain
- Embedded within entities
- Never referenced independently

---

# Appendix D – Cross-Domain Reference Catalogue

| Source Domain | Target Domain | Aggregate Root | Purpose |
|---------------|---------------|----------------|---------|
| Commercial | Catalogue | Product | Booking products |
| Commercial | Financial | Payment | Payment processing |
| Commercial | Operations | Itinerary | Tour execution |
| Catalogue | Supplier | Supplier Product | Supplier mapping |
| Supplier | Catalogue | Product | Canonical product mapping |
| Operations | Commercial | Booking | Operational planning |
| Operations | Catalogue | Product | Itinerary products |
| Operations | Supplier | Supplier Product | Supplier fulfilment |
| Platform | All Domains | User | Identity management |
| Platform | All Domains | Notification | Messaging |
| Platform | All Domains | Document | Document generation |

---

## Cross-Domain Rules

- References shall target Aggregate Roots only.
- Child entities shall never be referenced across domains.
- Cross-domain relationships shall be read-only unless owned by the target domain.
- Circular ownership is prohibited.
- Aggregate boundaries shall remain intact.

---

# Appendix E – Domain Interaction Matrix

| From | Commercial | Catalogue | Supplier | Financial | Operations | Platform |
|------|------------|-----------|----------|-----------|------------|----------|
| Commercial | — | ✓ | — | ✓ | ✓ | ✓ |
| Catalogue | — | — | ✓ | — | — | ✓ |
| Supplier | — | ✓ | — | — | — | ✓ |
| Financial | ✓ | — | — | — | — | ✓ |
| Operations | ✓ | ✓ | ✓ | — | — | ✓ |
| Platform | ✓ | ✓ | ✓ | ✓ | ✓ | — |

---

## Interaction Principles

- Every domain owns its own data.
- Communication occurs only through Aggregate Roots.
- Platform services are shared but do not own business concepts.
- No domain may modify entities owned by another domain.
- Cross-domain communication shall preserve transactional boundaries.

---

# End of Specification

**Document:** SPEC-026 – Canonical Logical Data Model

**Status:** Complete

**Next Specification:** SPEC-027 – Physical Data Model