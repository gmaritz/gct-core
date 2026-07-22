# BUS-001 -- Business Capability Model

  Field            Value
  ---------------- ---------------------------------------------------------
  Document ID      BUS-001
  Version          2.0.0
  Status           Approved
  Classification   Business Architecture
  Parent           BUS-000 -- Business Architecture Specification Standard

## 1. Purpose

This specification defines the authoritative Business Capability Model
for the Go Cape Tours platform.

It identifies **what the business must be capable of doing**,
independently of organisation, technology or implementation.

The model is the foundation for:

-   Business Entity Model (BUS-002)
-   Business Process Model (BUS-003)
-   Engineering Specifications
-   PostgreSQL data model
-   Prisma schema
-   Application implementation

## 2. Scope

This specification defines:

-   Business capabilities
-   Business domains
-   Capability ownership
-   Capability relationships
-   Capability classification
-   Capability traceability

This specification does **not** define:

-   Business entities
-   Business processes
-   Business rules
-   Business events
-   Business states
-   Business services
-   Software architecture
-   APIs
-   Database design

## 3. Relationship to BUS-000

BUS-000 defines the Business Architecture standard.

BUS-001 applies that standard to define the enterprise Business
Capability Model.

## 4. Guiding Principles

Business capabilities SHALL:

-   describe business abilities
-   remain technology independent
-   remain implementation independent
-   remain stable over time
-   provide a foundation for implementation
-   be traceable to entities and processes

A Business Capability Specification (CAP-xxx) is optional and SHALL only
be created where additional business modelling or implementation
guidance is required.

## 5. Business Domains

  Domain           Purpose
  ---------------- -----------------------------------------------------
  Commercial       Selling and managing customer products and services
  Operations       Delivering tours, accommodation and experiences
  Financial        Commercial settlement and financial management
  Administration   Internal administration and reporting
  Platform         Shared platform capabilities

## 6. Capability Classification

Capabilities are classified as:

-   Strategic
-   Core
-   Supporting
-   Platform

## 7. Enterprise Capability Catalogue

  BC ID    Capability                 Domain           Category     CAP Spec
  -------- -------------------------- ---------------- ------------ ----------
  BC-001   Customer Management        Commercial       Core         Optional
  BC-002   Product Management         Commercial       Core         Optional
  BC-003   Booking Management         Commercial       Core         Optional
  BC-004   Pricing & Quotations       Commercial       Core         Optional
  BC-005   Accommodation Management   Operations       Core         Optional
  BC-006   Tour Management            Operations       Core         Optional
  BC-007   Supplier Management        Operations       Core         Optional
  BC-008   Availability Management    Operations       Core         Optional
  BC-009   Itinerary Management       Operations       Core         Optional
  BC-010   Payment Management         Financial        Core         Optional
  BC-011   Invoicing & Refunds        Financial        Supporting   Optional
  BC-012   Reporting                  Administration   Supporting   ---
  BC-013   Document Management        Administration   Supporting   ---
  BC-014   Communications             Administration   Supporting   ---
  BC-015   Security & Identity        Platform         Platform     ---
  BC-016   Integration                Platform         Platform     ---
  BC-017   Configuration              Platform         Platform     ---
  BC-018   Notifications              Platform         Platform     ---

## 8. Capability Relationships

Business capabilities are realised through Business Processes (BUS-003),
operate on Business Entities (BUS-002), and ultimately drive Engineering
Specifications.

``` text
Business Vision
      │
      ▼
BUS-001 Business Capability Model
      │
      ├──► BUS-002 Business Entity Model
      ├──► BUS-003 Business Process Model
      └──► CAP Specifications (where required)
                    │
                    ▼
          Engineering Specifications
                    │
                    ▼
        PostgreSQL / Prisma / Services / APIs
```

## 9. Capability Ownership

Each capability SHALL identify:

-   Business Domain
-   Business Owner
-   Business Outcome

Ownership details are maintained as the platform evolves.

## 10. Traceability

The following traceability model applies.

  From                  To
  --------------------- ----------------------------
  Business Capability   Business Entity
  Business Capability   Business Process
  Business Process      Business Rules
  Business Process      Business Events
  Business Process      Business Services
  Business Model        Engineering Specifications

## 11. Business Capability Map

### Commercial

-   Customer Management
-   Product Management
-   Booking Management
-   Pricing & Quotations

### Operations

-   Accommodation Management
-   Tour Management
-   Supplier Management
-   Availability Management
-   Itinerary Management

### Financial

-   Payment Management
-   Invoicing & Refunds

### Administration

-   Reporting
-   Document Management
-   Communications

### Platform

-   Security & Identity
-   Integration
-   Configuration
-   Notifications

The Capability Map is an architectural overview only and does not imply
that every capability requires a CAP specification.

## 12. References

-   BUS-000 Business Architecture Specification Standard
-   BUS-002 Business Entity Model
-   BUS-003 Business Process Model
-   SPEC-000 Engineering Specification Standard

## Appendix A -- Identifier Standards

  Prefix   Meaning
  -------- -----------------------------------
  BC       Business Capability
  CAP      Business Capability Specification
  BUS      Business Architecture Document
  ENT      Business Entity
  PRC      Business Process
  RUL      Business Rule
  EVT      Business Event
  STA      Business State
  SRV      Business Service
  SPEC     Engineering Specification

## Appendix B -- Architectural Principle

**Every specification SHALL directly contribute to the design,
implementation or long-term maintainability of the Go Cape Tours
platform.**
