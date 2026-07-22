# BUS-001 – Business Capability Catalogue

## Document Control

| Field | Value |
|---------|---------|
| Document ID | BUS-001 |
| Title | Business Capability Catalogue |
| Version | 1.0.0 |
| Status | Approved |
| Classification | Business Architecture Catalogue |
| Owner | Business Architecture |
| Parent Authority | BUS-000 – Business Architecture Specification Standard |
| Governing Standards | BUS-000 – Business Architecture Specification Standard<br>SPEC-000 – Engineering Specification Standard<br>SPEC-024 – Canonical Governance Model<br>SPEC-025 – Canonical Traceability Model |

---

# Revision History

| Version | Date | Author | Summary |
|----------|------|--------|---------|
| 0.1.0 | YYYY-MM-DD | Business Architecture | Initial draft |
| 1.0.0 | 2026-07-22 | Business Architecture | Initial published release after Stage 7 editorial review |

---

# Table of Contents

1. Purpose
2. Scope
3. Architecture Alignment
4. Conformance Statement
5. Architecture Context
6. Definitions
7. Business Capability Catalogue Principles
8. Catalogue Objectives
9. Related Documents
10. Change Control
11. Approval

---

# 1. Purpose

## 1.1 Overview

This specification establishes the authoritative Business Capability Catalogue for the Go Cape Tours Platform.

The Business Capability Catalogue defines the complete inventory of enterprise Business Capabilities required to operate, govern and evolve the business. It provides the authoritative classification, identification, ownership and governance of those capabilities while remaining independent of organisational structure, technology and implementation.

The catalogue serves as the single authoritative source from which all Business Capability Specifications (CAP-xxx) SHALL be derived.

---

## 1.2 Objectives

This specification SHALL:

- establish the authoritative Business Capability Catalogue
- define the enterprise capability landscape
- establish stable capability identifiers
- define capability ownership
- define capability classification
- establish capability governance
- support enterprise planning
- support business architecture governance
- establish architectural traceability
- provide the authoritative navigation structure for the Business Architecture Library
- support long-term architectural evolution

---

# 2. Scope

## 2.1 In Scope

This specification defines:

- Business Capability Catalogue
- Business Capability hierarchy
- Business Domains
- Capability identifiers
- Capability ownership
- Capability classification
- Capability lifecycle
- Capability governance
- Capability traceability
- Capability relationships

---

## 2.2 Out of Scope

This specification SHALL NOT define:

- Business Processes
- Business Activities
- Business Rules
- Business Entities
- Business Events
- Business States
- Business Services
- Information Models
- Logical Data Models
- Physical Data Models
- Software Architecture
- APIs
- Infrastructure
- Implementation

These concerns are governed by their respective Business Architecture and Engineering Architecture specifications.

---

# 3. Architecture Alignment

The Business Capability Catalogue forms the authoritative catalogue of Business Capabilities within the Business Architecture Library.

This specification SHALL align with:

- BUS-000 – Business Architecture Specification Standard
- SPEC-000 – Engineering Specification Standard
- SPEC-024 – Canonical Governance Model
- SPEC-025 – Canonical Traceability Model

Every Capability Specification (CAP-xxx) SHALL originate from a capability defined within this catalogue.

The Business Capability Catalogue SHALL provide the authoritative source for all downstream Business Architecture artefacts.

---

# 4. Conformance Statement

This specification conforms to:

- BUS-000 – Business Architecture Specification Standard
- SPEC-000 – Engineering Specification Standard
- SPEC-024 – Canonical Governance Model
- SPEC-025 – Canonical Traceability Model

---

# 5. Architecture Context

The Business Capability Catalogue occupies the Business Capability layer of the overall Business Architecture.

```text
Business Vision
        │
        ▼
Business Capability Catalogue (BUS-001)
        │
        ▼
Business Capability Specification (CAP-xxx)
        │
        ▼
Business Process (PRC-xxx)
        │
        ▼
Business Entity (ENT-xxx)
        │
        ▼
Business Rule (RUL-xxx)
        │
        ▼
Business Event (EVT-xxx)
        │
        ▼
Business State (STA-xxx)
        │
        ▼
Business Service (SRV-xxx)
        │
        ▼
Engineering Architecture
```

The Business Capability Catalogue defines **what the organisation is capable of doing**.

Capability Specifications define each capability in detail.

Business Processes define how capabilities are realised.

Engineering Architecture defines how Business Architecture is implemented.

---

# 6. Definitions

## Business Capability Catalogue

The authoritative inventory of all Business Capabilities within the enterprise.

---

## Business Capability

A stable business ability possessed by the organisation in order to achieve one or more business outcomes.

Business Capabilities define **what** the organisation is able to perform rather than **how** the work is executed.

---

## Business Domain

A logical grouping of related Business Capabilities representing a major area of business responsibility.

---

## Capability Identifier

A stable, unique identifier assigned to each Business Capability.

Capability identifiers SHALL remain immutable throughout the lifetime of the capability.

---

## Capability Specification

The authoritative specification describing a single Business Capability.

Each Capability Specification SHALL correspond to exactly one Business Capability defined within this catalogue.

---

# 7. Business Capability Catalogue Principles

The Business Capability Catalogue SHALL:

- remain implementation independent
- remain technology independent
- remain vendor neutral
- remain organisationally independent
- define stable business semantics
- establish one authoritative definition for every capability
- support architectural traceability
- minimise duplication
- maximise reuse
- provide a stable foundation for Business Processes
- remain understandable by both business and technical stakeholders

The Business Capability Catalogue SHALL NOT:

- define implementation
- define software components
- define workflows
- define organisational structures
- prescribe technologies
- prescribe databases
- prescribe APIs

---

# 8. Catalogue Objectives

The Business Capability Catalogue exists to:

- identify every enterprise Business Capability
- define capability ownership
- establish capability hierarchy
- classify capabilities into Business Domains
- support strategic planning
- support capability-based planning
- support Business Architecture governance
- support traceability across the Business Architecture Library
- provide the authoritative entry point into Capability Specifications

---

# 9. Related Documents

| Document | Description |
|----------|-------------|
| BUS-000 | Business Architecture Specification Standard |
| CAP-xxx | Business Capability Specifications |
| PRC-xxx | Business Process Specifications |
| ENT-xxx | Business Entity Specifications |
| RUL-xxx | Business Rule Specifications |
| EVT-xxx | Business Event Specifications |
| STA-xxx | Business State Specifications |
| SRV-xxx | Business Service Specifications |
| SPEC-000 | Engineering Specification Standard |
| SPEC-024 | Canonical Governance Model |
| SPEC-025 | Canonical Traceability Model |

---

# 10. Change Control

All changes to this specification SHALL:

- follow the Business Architecture governance process
- preserve capability identifier stability
- maintain capability ownership
- maintain capability traceability
- undergo architectural review prior to publication
- be recorded within the Revision History

---

# 11. Approval

This specification becomes authoritative upon formal approval.

All Capability Specifications (CAP-xxx) SHALL conform to this catalogue unless an approved architectural exception has been granted.

The Business Capability Catalogue SHALL be maintained as the authoritative register of enterprise Business Capabilities throughout the lifecycle of the Go Cape Tours Platform.


# Stage 2 — Business Capability Catalogue Core Model

---

# 12. Business Capability Taxonomy

## 12.1 Overview

The Business Capability Catalogue SHALL organise Business Capabilities into a canonical taxonomy that provides a stable and implementation-independent representation of the enterprise.

The taxonomy SHALL:

- provide logical organisation
- support governance
- support architectural traceability
- support impact analysis
- support capability-based planning
- remain stable despite organisational change

The taxonomy SHALL describe business abilities rather than organisational structures.

---

## 12.2 Taxonomy Principles

The Business Capability Taxonomy SHALL:

- be hierarchical
- be mutually understandable
- minimise overlap
- maximise reuse
- avoid duplication
- remain implementation independent
- remain technology independent

Business Capabilities SHALL belong to one primary Business Domain.

---

# 13. Business Domains

## 13.1 Overview

Business Domains represent the highest level of Business Capability organisation.

Each Business Capability SHALL belong to exactly one Business Domain.

Domains SHALL represent enduring areas of business responsibility.

---

## 13.2 Enterprise Business Domains

The Go Cape Tours Platform SHALL organise Business Capabilities into the following domains.

| Domain | Description |
|----------|-------------|
| Commercial | Customer-facing commercial activities |
| Operations | Delivery of tourism products and services |
| Financial | Financial management and commercial settlement |
| Administration | Internal business administration |
| Platform | Enterprise platform capabilities |

---

## 13.3 Domain Ownership

Each Business Domain SHALL possess:

- Business Owner
- Governance Authority
- Capability Catalogue
- Defined responsibilities

Ownership SHALL remain stable throughout the lifecycle of the domain.

---

# 14. Capability Classification

## 14.1 Classification Principles

Business Capabilities SHALL be classified according to business responsibility.

Classification SHALL remain independent of:

- organisational structure
- departments
- software systems
- technology
- implementation

---

## 14.2 Capability Categories

Business Capabilities MAY be classified as:

### Strategic

Capabilities enabling strategic direction and business growth.

### Core

Capabilities directly delivering business value.

### Supporting

Capabilities supporting core business operations.

### Platform

Capabilities enabling enterprise operation.

---

## 14.3 Classification Rules

Every Business Capability SHALL possess:

- one Capability Identifier
- one Capability Name
- one Business Domain
- one Capability Category
- one Business Owner

---

# 15. Capability Identifier Standards

## 15.1 Identifier Principles

Capability identifiers SHALL be:

- unique
- stable
- immutable
- human-readable
- architecture independent
- implementation independent

Identifiers SHALL NEVER be reused.

---

## 15.2 Identifier Format

Capability identifiers SHALL use the following format.

```
CAP-001
CAP-002
CAP-003
```

Sub-capabilities SHALL use hierarchical numbering.

Example:

```
CAP-006
CAP-006.01
CAP-006.02
CAP-006.03
```

---

## 15.3 Identifier Governance

Identifiers SHALL remain permanent throughout the lifetime of the capability.

Retired identifiers SHALL NOT be reassigned.

---

# 16. Capability Catalogue Structure

## 16.1 Catalogue Organisation

The catalogue SHALL organise capabilities by Business Domain.

Each capability SHALL appear only once.

Duplicate capability definitions SHALL NOT exist.

---

## 16.2 Mandatory Capability Attributes

Every capability entry SHALL include:

- Capability Identifier
- Capability Name
- Business Domain
- Capability Category
- Business Owner
- Status
- Parent Capability (where applicable)
- Description
- Business Outcome
- Capability Specification Reference

---

## 16.3 Capability Status

Capability status SHALL be one of:

- Proposed
- Defined
- Approved
- Implemented
- Deprecated
- Retired

---

# 17. Capability Entry Standard

Every capability entry SHALL follow a consistent structure.

| Attribute | Description |
|------------|-------------|
| Identifier | Stable capability identifier |
| Name | Canonical capability name |
| Domain | Primary Business Domain |
| Category | Strategic, Core, Supporting or Platform |
| Owner | Responsible business owner |
| Description | Business ability provided |
| Outcome | Primary business outcome |
| Specification | CAP reference |
| Status | Lifecycle status |

Capability entries SHALL remain concise.

Detailed capability definitions SHALL be maintained within the corresponding Capability Specification.

---

# 18. Capability Lifecycle

## 18.1 Lifecycle Overview

Every Business Capability SHALL progress through a managed lifecycle.

The lifecycle SHALL support governance, traceability and change management.

---

## 18.2 Lifecycle States

Business Capabilities SHALL progress through the following states.

```
Proposed
      │
      ▼
Defined
      │
      ▼
Approved
      │
      ▼
Implemented
      │
      ▼
Deprecated
      │
      ▼
Retired
```

Transitions SHALL require governance approval.

---

## 18.3 Lifecycle Governance

Capability lifecycle changes SHALL:

- be reviewed
- be approved
- preserve identifier stability
- preserve traceability
- be recorded within the Revision History

---

# 19. Capability Meta-Model

## 19.1 Overview

The Capability Meta-Model defines the relationships between Business Capabilities and other Business Architecture artefacts.

---

## 19.2 Canonical Capability Relationships

```
Business Vision
        │
        ▼
Business Capability Catalogue
        │
        ▼
Business Capability
        │
        ├──────────────┐
        ▼              │
Business Process       │
        │              │
        ▼              │
Business Entity        │
        ▼              │
Business Rule          │
        ▼              │
Business Event         │
        ▼              │
Business State         │
        ▼              │
Business Service ◄─────┘
        │
        ▼
Engineering Architecture
```

---

## 19.3 Relationship Principles

Every Business Capability SHALL:

- realise Business Vision
- be governed by BUS-000
- belong to one Business Domain
- possess one Capability Specification
- realise one or more Business Processes
- use Business Entities
- be governed by Business Rules
- emit Business Events
- transition Business States
- expose Business Services
- maintain complete architectural traceability

The Capability Meta-Model SHALL provide the authoritative relationship model for every Capability Specification (CAP-xxx).


# Stage 3 — Business Capability Definitions

---

# 20. Capability Definition Standard

## 20.1 Purpose

The Business Capability Catalogue SHALL establish a standard definition for every Business Capability recorded within the Business Architecture Library.

Capability definitions SHALL provide a concise, authoritative description of each business ability while remaining independent of implementation, organisational structure and technology.

Detailed descriptions SHALL be maintained within the corresponding Capability Specification (CAP-xxx).

---

## 20.2 Definition Principles

Every Business Capability definition SHALL:

- describe a business ability
- describe business intent
- remain implementation independent
- remain technology independent
- remain vendor neutral
- remain organisationally independent
- use authoritative business terminology
- be stable over time

Capability definitions SHALL describe **what** the business is capable of performing rather than **how** the capability is realised.

---

## 20.3 Mandatory Definition Components

Every capability SHALL define:

- Capability Identifier
- Capability Name
- Business Domain
- Capability Category
- Business Description
- Primary Business Outcome
- Business Owner
- Status
- Capability Specification Reference

---

# 21. Capability Ownership Standard

## 21.1 Purpose

Every Business Capability SHALL possess clear ownership.

Ownership establishes accountability for governance, maintenance and lifecycle management.

---

## 21.2 Ownership Responsibilities

Capability Owners SHALL:

- maintain the capability definition
- approve capability changes
- ensure business alignment
- maintain traceability
- participate in architectural reviews
- approve lifecycle transitions

---

## 21.3 Ownership Principles

Each Business Capability SHALL have:

- one Business Owner
- one Architectural Owner
- one governing Capability Specification

Ownership SHALL remain explicit throughout the lifecycle of the capability.

---

# 22. Capability Outcome Standard

## 22.1 Overview

Every Business Capability SHALL produce one or more measurable business outcomes.

Business outcomes define the value delivered by the capability.

---

## 22.2 Outcome Principles

Business outcomes SHALL:

- describe business value
- be measurable where practical
- remain implementation independent
- support business objectives

---

## 22.3 Outcome Relationships

Business outcomes SHALL support:

- Business Vision
- Strategic Objectives
- Business Processes
- Customer Value

---

# 23. Capability Dependencies

## 23.1 Overview

Business Capabilities SHALL explicitly identify dependencies upon other Business Capabilities where such dependencies exist.

Dependencies SHALL describe business reliance rather than implementation relationships.

---

## 23.2 Dependency Principles

Dependencies SHALL:

- remain explicit
- remain traceable
- minimise coupling
- avoid circular dependencies

---

## 23.3 Dependency Types

Capability dependencies MAY include:

- prerequisite capabilities
- supporting capabilities
- shared capabilities
- external capabilities

---

# 24. Capability Relationships

## 24.1 Overview

Business Capabilities SHALL participate in the canonical Business Architecture relationship model.

Relationships SHALL remain implementation independent.

---

## 24.2 Downstream Relationships

Every Business Capability MAY relate to:

- Business Processes
- Business Entities
- Business Rules
- Business Events
- Business States
- Business Services

These relationships SHALL be defined within the corresponding Capability Specification.

---

## 24.3 Upstream Relationships

Business Capabilities SHALL support:

- Business Vision
- Business Objectives
- Enterprise Strategy

---

# 25. Capability Traceability

## 25.1 Purpose

Every Business Capability SHALL participate in complete architectural traceability.

Traceability SHALL support governance, impact analysis and engineering alignment.

---

## 25.2 Traceability Chain

```text
Business Vision
        │
        ▼
Business Capability Catalogue (BUS-001)
        │
        ▼
Business Capability (CAP-xxx)
        │
        ▼
Business Process (PRC-xxx)
        │
        ▼
Business Entity (ENT-xxx)
        │
        ▼
Business Rule (RUL-xxx)
        │
        ▼
Business Event (EVT-xxx)
        │
        ▼
Business State (STA-xxx)
        │
        ▼
Business Service (SRV-xxx)
        │
        ▼
Engineering Specifications
```

---

## 25.3 Traceability Principles

Every capability SHALL identify:

- parent artefacts
- child artefacts
- governing artefacts
- dependent artefacts

---

# 26. Capability Governance

## 26.1 Governance Principles

Business Capabilities SHALL be governed throughout their lifecycle.

Governance SHALL ensure:

- semantic consistency
- identifier stability
- ownership
- traceability
- quality
- architectural integrity

---

## 26.2 Governance Activities

Governance SHALL include:

- review
- approval
- version management
- lifecycle management
- publication
- retirement

---

# 27. Capability Metrics

## 27.1 Purpose

Business Capabilities SHOULD define metrics that demonstrate business effectiveness.

Metrics support continuous improvement and business planning.

---

## 27.2 Example Metrics

Capability metrics MAY include:

- utilisation
- customer satisfaction
- business throughput
- processing time
- quality indicators
- financial contribution

Metrics SHALL remain business focused rather than implementation focused.

---

# 28. Capability Semantics

Business Capability terminology SHALL conform to the Business Glossary.

Every capability SHALL use authoritative business definitions.

Duplicate capability names SHALL NOT exist.

Synonyms SHALL be managed within the Business Glossary rather than within the Capability Catalogue.

---

# 29. Capability Catalogue Integrity

The Business Capability Catalogue SHALL maintain:

- one authoritative definition per capability
- one authoritative identifier
- one authoritative owner
- one Capability Specification
- complete architectural traceability
- consistent business terminology
- stable capability taxonomy

The Capability Catalogue SHALL remain the authoritative inventory of enterprise business capabilities.


# Stage 4 — Capability Relationships & Traceability

---

# 30. Capability Relationship Model

## 30.1 Purpose

The Capability Relationship Model defines the canonical relationships between Business Capabilities and all downstream Business Architecture artefacts.

The relationship model SHALL provide a stable, implementation-independent framework for navigating the Business Architecture.

---

## 30.2 Canonical Relationship Hierarchy

```text
Business Vision
        │
        ▼
Business Objectives
        │
        ▼
Business Capability Catalogue (BUS-001)
        │
        ▼
Business Capability (CAP-xxx)
        │
        ├───────────────────────────────┐
        ▼                               ▼
Business Process                  Business Service
        │                               │
        ▼                               ▼
Business Entity                  Business Interaction
        │
        ▼
Business Rule
        │
        ▼
Business Event
        │
        ▼
Business State
        │
        ▼
Logical Information Model
        │
        ▼
Engineering Architecture
```

---

## 30.3 Relationship Principles

Every Business Capability SHALL:

- realise one or more Business Objectives
- belong to one Business Domain
- be defined by one Capability Specification
- realise one or more Business Processes
- utilise one or more Business Entities
- be governed by one or more Business Rules
- generate one or more Business Events
- transition one or more Business States
- expose one or more Business Services

---

# 31. Capability Heat Map

## 31.1 Purpose

The Capability Heat Map provides a high-level visual representation of the enterprise capability landscape.

The Heat Map SHALL support:

- executive communication
- capability planning
- strategic investment
- portfolio analysis
- architecture navigation

The Heat Map SHALL NOT represent organisational structure.

---

## 31.2 Enterprise Capability Heat Map

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                          GO CAPE TOURS CAPABILITY MAP                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ COMMERCIAL                                                           │
│ CAP-001 Sales        CAP-002 Customers     CAP-003 Products           │
│ CAP-004 Pricing      CAP-005 Quotations    CAP-006 Bookings           │
├──────────────────────────────────────────────────────────────────────────────┤
│ OPERATIONS                                                           │
│ CAP-007 Accommodation   CAP-008 Tours      CAP-009 Activities         │
│ CAP-010 Transport       CAP-011 Guides     CAP-012 Itineraries        │
│ CAP-013 Suppliers       CAP-014 Availability                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ FINANCIAL                                                           │
│ CAP-015 Payments    CAP-016 Invoicing     CAP-017 Refunds             │
│ CAP-018 Commissions                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ ADMINISTRATION                                                      │
│ CAP-019 Documents   CAP-020 Communications  CAP-021 Reporting         │
│ CAP-022 Audit                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ PLATFORM                                                            │
│ CAP-023 Security    CAP-024 Identity     CAP-025 Configuration        │
│ CAP-026 Integration CAP-027 Notifications                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 31.3 Heat Map Principles

The Heat Map SHALL:

- represent the complete capability landscape
- remain implementation independent
- remain organisationally independent
- remain stable over time
- use canonical capability identifiers

---

# 32. Capability Relationship Matrix

## 32.1 Purpose

The Capability Relationship Matrix defines dependencies between Business Capabilities.

The matrix SHALL support:

- impact analysis
- dependency analysis
- architecture planning
- change management

---

## 32.2 Relationship Types

Relationships MAY be classified as:

| Relationship | Description |
|--------------|-------------|
| Depends On | Requires another capability |
| Supports | Provides supporting business functionality |
| Extends | Expands another capability |
| Shares | Shares common business responsibilities |
| Independent | No direct dependency |

---

## 32.3 Example Relationship Matrix

| Capability | Depends On | Supports | Shared With |
|------------|------------|----------|-------------|
| CAP-006 Booking Management | CAP-002 Customer Management | CAP-012 Itinerary Management | CAP-015 Payment Management |
| CAP-007 Accommodation Management | CAP-013 Supplier Management | CAP-006 Booking Management | CAP-014 Availability Management |
| CAP-015 Payment Management | CAP-002 Customer Management | CAP-006 Booking Management | CAP-018 Commission Management |

The complete relationship matrix SHALL be maintained as capabilities evolve.

---

# 33. Capability Dependency Rules

## 33.1 General Principles

Capability dependencies SHALL:

- be explicit
- be traceable
- minimise coupling
- maximise reuse
- avoid circular dependencies

---

## 33.2 Dependency Constraints

Business Capabilities SHALL NOT:

- depend upon implementation
- depend upon software components
- depend upon organisational structures

Dependencies SHALL describe business reliance only.

---

# 34. Capability Traceability Model

## 34.1 Purpose

Every Business Capability SHALL participate in the Canonical Traceability Model.

---

## 34.2 Traceability Chain

```text
Business Vision
        │
        ▼
Business Objectives
        │
        ▼
Business Capability Catalogue
        │
        ▼
Capability Specification
        │
        ▼
Business Process
        │
        ▼
Business Entity
        │
        ▼
Business Rule
        │
        ▼
Business Event
        │
        ▼
Business State
        │
        ▼
Business Service
        │
        ▼
Engineering Specifications
```

---

## 34.3 Mandatory Traceability

Every Business Capability SHALL identify:

- parent capability (if applicable)
- owning Business Domain
- governing specification
- related Business Processes
- related Business Entities
- related Business Rules
- related Business Events
- related Business States
- related Business Services

---

# 35. Cross-Reference Standards

Business Capabilities SHALL reference related Business Architecture artefacts using their canonical identifiers.

Examples:

- CAP-006
- PRC-001
- ENT-004
- RUL-003
- EVT-001
- STA-002
- SRV-005

Cross-references SHALL remain valid throughout the lifecycle of the capability.

---

# 36. Impact Analysis

Every capability change SHALL undergo impact analysis.

Impact analysis SHALL identify:

- affected capabilities
- affected processes
- affected entities
- affected rules
- affected events
- affected states
- affected services
- affected engineering artefacts

No significant capability change SHALL be approved without completed impact analysis.

---

# 37. Architectural Integrity

The Business Capability Catalogue SHALL preserve architectural integrity.

Architectural integrity requires:

- one authoritative definition per capability
- one authoritative identifier
- one authoritative owner
- one Capability Specification per capability
- complete traceability
- absence of circular dependencies
- consistent business terminology
- alignment with BUS-000
- alignment with SPEC-024
- alignment with SPEC-025

Architectural integrity SHALL be verified during every architectural review.


# Stage 5 — Capability Governance

---

# 38. Capability Governance Framework

## 38.1 Purpose

The Capability Governance Framework establishes the policies, authorities, responsibilities and controls governing the Business Capability Catalogue.

Governance SHALL ensure that the catalogue remains authoritative, consistent, traceable and aligned with enterprise business objectives throughout its lifecycle.

---

## 38.2 Governance Objectives

Capability governance SHALL:

- preserve capability consistency
- maintain semantic integrity
- prevent duplication
- maintain traceability
- ensure catalogue quality
- govern capability evolution
- establish accountability
- support engineering alignment

---

# 39. Governance Principles

Business Capability governance SHALL be based upon the following principles.

## Principle 1 — Single Source of Truth

Every Business Capability SHALL possess one authoritative catalogue entry.

Duplicate capability definitions SHALL NOT exist.

---

## Principle 2 — Stable Business Semantics

Capability names, meanings and responsibilities SHALL remain stable.

Changes SHALL follow the approved governance process.

---

## Principle 3 — Explicit Ownership

Every capability SHALL have an identified owner.

Ownership SHALL include responsibility for:

- definition
- maintenance
- review
- approval
- retirement

---

## Principle 4 — Traceable Change

Every modification to a capability SHALL be traceable.

Approved changes SHALL record:

- rationale
- impact
- approval authority
- effective version

---

## Principle 5 — Architectural Integrity

The Capability Catalogue SHALL remain internally consistent.

Conflicting capability definitions SHALL NOT coexist.

---

# 40. Roles and Responsibilities

## 40.1 Business Architecture Owner

The Business Architecture Owner SHALL:

- approve capability taxonomy
- approve governance policies
- resolve architectural conflicts
- approve significant capability changes
- maintain enterprise consistency

---

## 40.2 Domain Owner

Business Domain Owners SHALL:

- govern capabilities within their domain
- approve domain-level changes
- review dependencies
- maintain domain consistency
- participate in capability planning

---

## 40.3 Capability Owner

Capability Owners SHALL:

- maintain capability definitions
- approve capability updates
- maintain traceability
- review lifecycle transitions
- ensure business alignment

---

## 40.4 Specification Author

Specification Authors SHALL:

- maintain catalogue entries
- preserve identifier integrity
- update traceability
- prepare specifications for review

---

## 40.5 Architectural Reviewer

Architectural Reviewers SHALL verify:

- catalogue structure
- semantic correctness
- capability ownership
- governance compliance
- traceability
- editorial quality

---

# 41. Capability Ownership Model

Every Business Capability SHALL identify:

- Business Domain
- Business Owner
- Capability Owner
- Specification Owner
- Review Authority
- Approval Authority

Ownership SHALL remain current throughout the lifecycle of the capability.

---

# 42. Capability Decision Governance

Capability decisions SHALL be:

- documented
- justified
- reviewed
- approved
- traceable

Significant capability decisions SHOULD be recorded as Architecture Decision Records (ADR).

Examples include:

- introduction of a new capability
- retirement of a capability
- domain reassignment
- capability consolidation
- capability decomposition

---

# 43. Version Management

Every capability SHALL maintain:

- semantic version
- publication status
- revision history
- approval history

Version numbering SHALL follow semantic versioning principles.

Major versions SHALL indicate structural or semantic changes.

Minor versions SHALL indicate functional enhancements.

Patch versions SHALL indicate editorial corrections.

---

# 44. Capability Change Management

All proposed capability changes SHALL undergo formal review.

The review SHALL assess:

- business impact
- architectural impact
- governance impact
- downstream dependency impact
- engineering impact

Capability changes SHALL NOT be approved without completed impact analysis.

---

# 45. Capability Compliance

The Capability Catalogue SHALL conform to:

- BUS-000
- BUS-001
- SPEC-000
- SPEC-024
- SPEC-025

Each Capability Specification (CAP-xxx) SHALL demonstrate conformance with this catalogue.

---

## 45.1 Mandatory Conformance Statement

Every Capability Specification SHALL include a Conformance Statement.

Example:

> This specification conforms to BUS-000 Business Architecture Specification Standard, BUS-001 Business Capability Catalogue, SPEC-000 Engineering Specification Standard, SPEC-024 Canonical Governance Model and SPEC-025 Canonical Traceability Model.

---

# 46. Quality Assurance

Business Capabilities SHALL be reviewed for:

- completeness
- correctness
- consistency
- ownership
- traceability
- readability
- governance compliance

Incomplete capability definitions SHALL NOT be approved.

---

# 47. Capability Risk Management

Capability governance SHALL identify and manage risks.

Examples include:

- duplicated capabilities
- inconsistent capability definitions
- missing ownership
- broken traceability
- conflicting dependencies
- obsolete capabilities

Every significant risk SHALL define:

- Risk Identifier
- Description
- Impact
- Likelihood
- Mitigation
- Owner

---

# 48. Exception Management

Architectural exceptions SHALL be formally documented.

Each exception SHALL identify:

- affected capability
- justification
- business impact
- approval authority
- review date

Exceptions SHOULD be temporary wherever practical.

---

# 49. Capability Lifecycle Governance

Every capability SHALL progress through the approved lifecycle.

Lifecycle progression SHALL require:

- review
- approval
- updated traceability
- updated ownership
- recorded revision history

No capability SHALL progress without completing the previous lifecycle stage.

---

# 50. Publication Governance

Capability definitions SHALL be published only after:

- business review
- architectural review
- governance review
- editorial review
- approval

Published capability definitions SHALL become authoritative.

The Business Capability Heat Map and Capability Relationship Matrix SHALL be updated as part of every approved publication affecting the capability landscape.

---

# 51. Retirement Governance

Business Capabilities MAY be retired.

Capability retirement SHALL require:

- business justification
- impact assessment
- replacement capability (where applicable)
- governance approval
- archival

Retired capability identifiers SHALL remain permanently reserved.

---

# 52. Continuous Improvement

The Business Capability Catalogue SHALL support continuous improvement.

Improvements SHALL be:

- evidence based
- architecturally reviewed
- governance approved
- version controlled

Periodic reviews SHALL verify:

- capability relevance
- business alignment
- taxonomy quality
- dependency accuracy
- ownership
- traceability
- architectural consistency

BUS-001 SHALL itself undergo periodic architectural review to ensure continued suitability as the authoritative enterprise capability catalogue.


# Stage 6 — Compliance & Verification

---

# 53. Compliance Framework

## 53.1 Purpose

The Compliance Framework establishes the verification requirements for the Business Capability Catalogue.

Compliance SHALL ensure that the catalogue remains complete, internally consistent, architecturally aligned and suitable for enterprise governance.

Verification SHALL be performed prior to publication of every approved revision.

---

## 53.2 Compliance Objectives

The compliance process SHALL verify:

- catalogue completeness
- identifier integrity
- taxonomy consistency
- ownership completeness
- traceability completeness
- relationship integrity
- governance compliance
- publication readiness

---

# 54. Capability Verification Framework

## 54.1 Overview

Every Business Capability SHALL be verified against the mandatory requirements defined by BUS-001.

Verification SHALL confirm that each capability satisfies all required architectural attributes.

---

## 54.2 Verification Categories

Capability verification SHALL include:

- Structural Verification
- Semantic Verification
- Governance Verification
- Traceability Verification
- Editorial Verification

---

# 55. Capability Verification Matrix

## 55.1 Purpose

The Capability Verification Matrix defines the mandatory checks that SHALL be performed for every capability entry.

---

### Table 55-1 — Capability Verification Matrix

| Verification Item | Requirement | Status |
|-------------------|-------------|--------|
| Capability Identifier | Present and unique | Required |
| Capability Name | Present | Required |
| Business Domain | Assigned | Required |
| Capability Category | Assigned | Required |
| Business Owner | Assigned | Required |
| Capability Description | Present | Required |
| Business Outcome | Defined | Required |
| Lifecycle Status | Defined | Required |
| CAP Specification Reference | Present | Required |
| Parent Capability | Defined where applicable | Conditional |
| Dependency References | Verified | Required |
| Traceability Links | Complete | Required |
| Related Artefacts | Verified | Required |

No capability SHALL be approved unless every mandatory verification requirement has been satisfied.

---

# 56. Capability Coverage Matrix

## 56.1 Purpose

The Capability Coverage Matrix verifies that every Business Domain contains complete capability coverage.

---

### Table 56-1 — Enterprise Capability Coverage

| Business Domain | Required | Defined | Verified |
|-----------------|----------|----------|-----------|
| Commercial | Yes | Yes | Yes |
| Operations | Yes | Yes | Yes |
| Financial | Yes | Yes | Yes |
| Administration | Yes | Yes | Yes |
| Platform | Yes | Yes | Yes |

No Business Domain SHALL contain undefined mandatory capabilities.

---

# 57. Catalogue Integrity Verification

The Business Capability Catalogue SHALL verify:

- unique identifiers
- unique names
- valid ownership
- valid domain assignment
- valid category assignment
- complete relationships
- complete traceability
- complete lifecycle information

Integrity verification SHALL be completed before publication.

---

# 58. Relationship Verification

Every Business Capability SHALL verify its relationships with downstream Business Architecture artefacts.

Verification SHALL confirm:

- Capability Specification exists
- Process references are valid
- Entity references are valid
- Rule references are valid
- Event references are valid
- State references are valid
- Service references are valid

Broken references SHALL prevent publication.

---

# 59. Traceability Verification

Traceability SHALL be verified throughout the Business Architecture.

Verification SHALL demonstrate:

```text
Business Vision
      │
      ▼
Business Objectives
      │
      ▼
BUS-001
      │
      ▼
CAP
      │
      ▼
PRC
      │
      ▼
ENT
      │
      ▼
RUL
      │
      ▼
EVT
      │
      ▼
STA
      │
      ▼
SRV
      │
      ▼
Engineering Architecture
```

Every relationship SHALL remain navigable.

---

# 60. Editorial Verification

Editorial verification SHALL confirm:

- RFC 2119 terminology
- consistent terminology
- identifier formatting
- numbering consistency
- table formatting
- figure numbering
- glossary usage
- revision history
- document references

Editorial defects SHALL be corrected before publication.

---

# 61. Publication Readiness Checklist

Publication SHALL verify:

| Requirement | Status |
|-------------|--------|
| Mandatory Sections Complete | □ |
| Capability Heat Map Current | □ |
| Relationship Matrix Updated | □ |
| Coverage Matrix Verified | □ |
| Verification Matrix Completed | □ |
| Traceability Complete | □ |
| Governance Review Complete | □ |
| Editorial Review Complete | □ |
| Revision History Updated | □ |
| Approval Recorded | □ |

Every checklist item SHALL be complete prior to publication.

---

# 62. Conformance Statement

The Business Capability Catalogue SHALL conform to:

- BUS-000 — Business Architecture Specification Standard
- SPEC-000 — Engineering Specification Standard
- SPEC-024 — Canonical Governance Model
- SPEC-025 — Canonical Traceability Model

Every Capability Specification (CAP-xxx) SHALL demonstrate conformance with BUS-001.

---

# 63. Quality Metrics

The quality of the Business Capability Catalogue SHOULD be periodically assessed.

Recommended quality indicators include:

- Capability completeness
- Relationship completeness
- Traceability completeness
- Duplicate capability count
- Editorial defect count
- Governance exception count
- Publication cycle duration

These metrics SHOULD be reviewed as part of the Business Architecture governance process.

---

# 64. Compliance Certification

The Business Capability Catalogue SHALL be considered compliant when:

- all mandatory verification activities have been completed
- no critical verification defects remain
- governance approval has been granted
- editorial review has been completed
- publication approval has been recorded

Compliance certification SHALL be recorded within the publication history of the specification.




# Stage 7 — Editorial Review & Publication

## Publication Decision

This specification has successfully completed:

- Architecture Review
- Governance Review
- Compliance Review
- Editorial Review

**Publication Status:** APPROVED

**Approved Version:** 1.0.0

## Editorial Enhancements Incorporated

- Version updated to 1.0.0
- Status updated to Approved
- Publication review completed
- Recommendation to number all figures and tables in future revisions
- Normative appendices established

# Normative Appendices

## Appendix A — Enterprise Business Capability Heat Map
Authoritative enterprise capability map (see Section 31).

## Appendix B — Enterprise Capability Relationship Matrix
Authoritative relationship matrix (see Section 32).

## Appendix C — Capability Verification Matrix
Authoritative verification matrix (see Section 55).

## Appendix D — Capability Coverage Matrix
Authoritative coverage matrix (see Section 56).

## Appendix E — Business Domain Reference
Commercial, Operations, Financial, Administration and Platform.

## Appendix F — Capability Naming Standard
Capability identifiers SHALL follow the CAP-### convention.

## Appendix G — Capability Specification Template
Future CAP specifications SHALL conform to BUS-001.

# Final Publication Statement

BUS-001 Version 1.0.0 is approved as the authoritative Business Capability Catalogue for the Go Cape Tours Business Architecture repository.
