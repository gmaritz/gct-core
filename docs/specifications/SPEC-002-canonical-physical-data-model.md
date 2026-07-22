# SPEC-002 – Canonical Physical Data Model

## Document Control

| Field | Value |
|---------|---------|
| Document ID | SPEC-002 |
| Title | Canonical Physical Data Model |
| Version | 1.0.0 |
| Status | Approved |
| Classification | Normative Engineering Specification |
| Owner | Platform Engineering |
| Parent Authority | ARCH-000 – Architecture Manifest |
| Governing Standard | SPEC-000 – Engineering Specification Standard |

---

## Revision History

| Version | Date | Author | Summary |
|----------|------|--------|---------|
| 0.1.0 | YYYY-MM-DD | Platform Engineering | Initial working draft |
| 1.0.0 | YYYY-MM-DD | Platform Engineering | First approved release of the Canonical Physical Data Model |

---

# Table of Contents

1. Purpose
2. Scope
3. Architecture Alignment
4. Definitions
5. Physical Data Model Principles
6. Global Persistence Standards
7. Implementation Directives
8. Canonical Persistence Model
9. Relationship Standards
10. Persistence Conventions
11. Persistence Lifecycle Management
12. Compliance & Verification
13. Related Documents
14. Change Control
15. Approval

---

# 1. Purpose

## 1.1 Purpose

The Canonical Physical Data Model defines the engineering standards governing the persistent representation of the Platform's approved Canonical Domain Model.

This specification establishes the rules, principles and conventions that SHALL govern the implementation of persistent storage throughout the Platform.

The purpose of this specification is to ensure that all persistence implementations remain:

- consistent;
- technology independent;
- maintainable;
- traceable to approved domain concepts;
- aligned with the approved Platform Architecture.

This specification defines **how** approved domain concepts SHALL be persisted.

This specification SHALL NOT define the domain concepts themselves.

---

## 1.2 Objectives

This specification SHALL:

- establish a single persistence standard for the Platform;
- preserve alignment with the Canonical Domain Model;
- define platform-wide persistence principles;
- define common persistence conventions;
- establish lifecycle standards;
- minimise implementation ambiguity;
- ensure consistency across all bounded contexts.

---

# 2. Scope

This specification applies to all persistent data managed by the Platform.

This includes, but is not limited to:

- Aggregate Roots
- Entities
- Value Objects
- Reference Data
- Lookup Data
- Configuration Data
- Operational Data
- Historical Data
- Audit Data

The requirements contained within this specification apply regardless of:

- database technology;
- persistence framework;
- object-relational mapper;
- programming language.

---

## 2.1 Out of Scope

This specification SHALL NOT define:

- business rules;
- business processes;
- domain behaviour;
- application workflows;
- user interface behaviour;
- API contracts;
- implementation technologies.

These concerns are governed by their respective Architecture Documents and Engineering Specifications.

---

# 3. Architecture Alignment

This specification derives its authority from the approved Platform Architecture.

Persistence implementations SHALL preserve the integrity of the approved Canonical Domain Model.

This specification SHALL be interpreted in conjunction with:

- ARCH-000 – Architecture Manifest
- SPEC-000 – Engineering Specification Standard
- SPEC-001 – Canonical Domain Model
- Approved Architecture Decision Records (ADRs)

Where conflicts exist, the governance hierarchy defined within ARCH-000 SHALL apply.

---

# 4. Definitions

The terminology used throughout this specification SHALL conform to:

**GOV-002 – Engineering Glossary (Canonical Engineering Vocabulary)**

Terms defined within GOV-002 SHALL NOT be redefined within this specification.

## 4.1 Normative Language

The keywords SHALL, SHOULD, MAY and SHALL NOT are to be interpreted in accordance with RFC 2119 unless otherwise stated.
---

# 5. Physical Data Model Principles

The following principles govern all persistence implementations within the Platform.

---

## 5.1 Canonical Persistence

The Platform SHALL maintain a single canonical persistent representation of every approved domain concept.

Multiple authoritative representations of the same business concept SHALL NOT exist.

Read models, caches and projections MAY exist provided they are not treated as authoritative sources of truth.

---

## 5.2 Domain Alignment

Persistent representations SHALL accurately reflect the approved Canonical Domain Model.

Persistence SHALL support the domain model.

Persistence SHALL NOT redefine the domain model.

---

## 5.3 Technology Independence

This specification SHALL remain independent of:

- database engines;
- persistence frameworks;
- ORM technologies;
- implementation languages.

Technology-specific implementations SHALL conform to this specification rather than redefine it.

---

## 5.4 Aggregate Integrity

Persistence SHALL preserve Aggregate boundaries as defined by the approved Domain Model.

Aggregate consistency SHALL NOT depend upon implementation-specific behaviour.

Cross-Aggregate relationships SHALL respect approved ownership boundaries.

---

## 5.5 Traceability

Every persistent representation SHALL be traceable to an approved domain concept.

Persistent structures SHALL NOT be introduced without an authoritative business definition.

---

The Canonical Physical Data Model is governed by the following principles:

• Single Source of Truth
• Domain Alignment
• Aggregate Integrity
• Technology Independence
• Traceability
• Long-term Maintainability

---

# 6. Global Persistence Standards

The following standards apply to every persistent representation unless explicitly exempted by an approved Architecture Decision Record.

---

## 6.1 Identity

Every Aggregate Root SHALL possess a unique, immutable identifier.

Identifiers SHALL remain stable throughout the lifetime of the Aggregate.

Identifier generation mechanisms are implementation concerns and are therefore outside the scope of this specification.

---

## 6.2 Persistence Lifecycle

Persistent representations SHALL support an identifiable lifecycle.

The lifecycle SHALL include, where applicable:

- Creation
- Modification
- Deactivation
- Archival

Deletion policies SHALL be determined by business requirements and applicable regulatory obligations.

---

## 6.3 Auditing

Persistent representations SHOULD support audit information sufficient to establish:

- creation;
- modification;
- responsible actor (where applicable).

Audit implementations SHALL remain consistent across the Platform.

---

## 6.4 Consistency

Persistence SHALL preserve consistency within Aggregate boundaries.

Consistency across multiple Aggregates SHALL be governed by application workflows.

---

## 6.5 Extensibility

Persistence implementations SHOULD support future evolution without unnecessary redesign.

Implementation decisions SHALL favour extensibility over short-term optimisation whenever practical.

---

# 7. Implementation Directives

Implementation SHALL:

- preserve alignment with the Canonical Domain Model;
- preserve Aggregate boundaries;
- comply with approved Architecture Documents;
- comply with this specification;
- preserve traceability between domain concepts and persistent representations;
- remain technology independent at the specification level.

Implementation SHALL NOT:

- redefine business concepts;
- introduce unauthorised persistence structures;
- violate Aggregate ownership;
- couple this specification to implementation technologies.

---

---

# 8. Canonical Persistence Model

## 8.1 Overview

The Canonical Persistence Model defines how approved Domain Model concepts SHALL be represented within persistent storage.

The persistence model SHALL preserve the integrity of the approved Canonical Domain Model.

Persistence SHALL support the Domain Model.

Persistence SHALL NOT redefine the Domain Model.

The persistence model SHALL remain independent of implementation technologies.

---

## 8.2 Aggregate Root Persistence

Aggregate Roots SHALL constitute the authoritative persistence boundary for every Aggregate.

Each Aggregate Root SHALL:

- possess a unique identity;
- define the persistence boundary of the Aggregate;
- control the lifecycle of all owned Entities and Value Objects;
- maintain Aggregate consistency;
- represent the single authoritative point through which Aggregate state is modified.

Persistent storage SHALL preserve Aggregate ownership.

Objects external to the Aggregate SHALL NOT modify internal Aggregate state directly.

Aggregate persistence SHALL preserve transactional consistency within the Aggregate boundary.

---

## 8.3 Entity Persistence

Entities SHALL exist only within the lifecycle of an Aggregate.

Each Entity SHALL:

- possess identity;
- belong to exactly one Aggregate;
- be owned by an Aggregate Root;
- exist only while permitted by its owning Aggregate.

Entities SHALL NOT be persisted independently unless explicitly authorised by the approved Domain Model.

Entity persistence SHALL preserve ownership relationships throughout the lifecycle of the Aggregate.

---

## 8.4 Value Object Persistence

Value Objects SHALL be persisted as part of their owning Aggregate or Entity.

Value Objects:

- SHALL NOT possess independent identity;
- SHALL NOT define an independent lifecycle;
- SHALL derive their existence from their owner;
- SHOULD be treated as immutable.

Persistence implementations SHOULD replace Value Objects rather than modify them in place whenever practical.

---

## 8.5 Enumeration Persistence

Enumerations represent finite, controlled sets of approved values.

Enumeration persistence SHALL preserve:

- semantic clarity;
- consistency;
- validation;
- business meaning.

The physical implementation of Enumerations is an implementation concern and is therefore outside the scope of this specification.

---

## 8.6 Reference Data Persistence

Reference Data represents relatively stable business information shared across the Platform.

Reference Data SHALL:

- possess clear ownership;
- be centrally governed;
- remain consistent across all bounded contexts;
- support reuse throughout the Platform.

Reference Data SHALL NOT be duplicated without explicit architectural approval.

---

## 8.7 Aggregate Ownership

Aggregate ownership SHALL define:

- lifecycle responsibility;
- modification authority;
- persistence responsibility;
- consistency boundaries.

Ownership relationships SHALL remain explicit throughout the persistence model.

Persistence implementations SHALL preserve approved ownership boundaries.

---

## 8.8 Persistence Boundaries

Persistent storage SHALL preserve the Aggregate boundaries defined by the approved Canonical Domain Model.

Cross-Aggregate consistency SHALL be coordinated by application workflows rather than direct persistence coupling.

Persistence implementations SHALL minimise unnecessary dependencies between Aggregates.

Aggregate boundaries SHALL remain the primary mechanism for maintaining consistency within the persistence model.

---

## 8.9 Traceability Requirements

Every persistent representation SHALL be traceable to:

- an approved Domain Concept;
- an approved Aggregate;
- the Canonical Domain Model;
- the governing Architecture Documents;
- the governing Engineering Specifications where applicable.

Persistent structures SHALL NOT exist without authoritative traceability.

Traceability SHALL be maintained throughout the lifecycle of the Platform.


# 9. Relationship Standards

## 9.1 Overview

This section defines the canonical standards governing relationships between persisted domain concepts.

Relationship definitions SHALL preserve the integrity of the approved Canonical Domain Model.

Relationships SHALL support business semantics rather than implementation convenience.

---

## 9.2 Relationship Principles

Relationships SHALL:

- preserve Aggregate boundaries;
- maintain ownership semantics;
- minimise coupling;
- maximise consistency;
- accurately reflect business meaning.

Relationship design SHALL favour clarity over optimisation.

---

## 9.3 One-to-One Relationships

One-to-One relationships SHALL be used only where the business domain defines a single mandatory or optional association between two concepts.

Implementations SHALL preserve ownership and lifecycle responsibilities.

---

## 9.4 One-to-Many Relationships

One-to-Many relationships SHALL represent ownership where one concept is responsible for the lifecycle of multiple related concepts.

The owning side SHALL be explicitly defined.

Ownership SHALL remain unambiguous.

---

## 9.5 Many-to-Many Relationships

Many-to-Many relationships SHOULD be avoided where they obscure business meaning.

Where required, the relationship SHALL be explicitly modelled in a manner that preserves traceability and ownership semantics.

---

## 9.6 Ownership

Every relationship SHALL define ownership.

Ownership SHALL determine:

- lifecycle responsibility;
- modification authority;
- persistence responsibility.

Ownership SHALL remain explicit throughout the persistence model.

---

## 9.7 Referential Integrity

Persistence implementations SHALL preserve referential integrity.

Relationships SHALL NOT permit orphaned data unless explicitly authorised by an approved Architecture Decision Record.

---

## 9.8 Optional and Mandatory Relationships

Relationship optionality SHALL accurately reflect business requirements.

Mandatory relationships SHALL be enforced consistently.

Optional relationships SHALL be explicitly defined.

---

## 9.9 Cascade Behaviour

Cascade operations SHALL reflect Aggregate ownership.

Cascade behaviour SHALL preserve data integrity.

Cascade rules SHALL be explicit and SHALL NOT rely upon implementation defaults.

---

## 9.10 Relationship Traceability

Every relationship SHALL be traceable to:

- an approved Domain Concept;
- an approved Aggregate;
- the Canonical Domain Model;
- applicable Engineering Specifications.

Relationship definitions SHALL remain consistent with the approved Domain Architecture.

---

# 10. Persistence Conventions

## 10.1 Overview

This overview defines the canonical engineering conventions governing the implementation of persistent storage throughout the Platform.

These conventions establish a consistent approach to naming, identity, keys, constraints, indexing, and default values while remaining independent of any specific database technology.

---

## 10.2 Persistence Convention Principles

Persistence conventions SHALL:

- promote consistency across all bounded contexts;
- minimise implementation ambiguity;
- support maintainability;
- preserve traceability to the Canonical Domain Model;
- remain technology independent.

Implementation-specific optimisations SHALL NOT redefine these conventions.

---

## 10.3 Naming Conventions

Persistent representations SHALL adopt consistent naming conventions.

Naming SHALL:

- be clear and unambiguous;
- reflect approved business terminology;
- remain stable over time;
- avoid technology-specific abbreviations.

Names SHALL be derived from the approved Canonical Domain Model wherever practical.

---

## 10.4 Identifier Conventions

Identifiers SHALL:

- uniquely identify the persisted object;
- remain immutable throughout the object's lifecycle;
- be independent of business meaning unless explicitly defined by the Domain Model.

The mechanism for generating identifiers is an implementation concern.

---

## 10.5 Key Conventions

Persistence implementations MAY define:

- primary identifiers;
- alternate identifiers;
- natural identifiers;
- composite identifiers.

The selection of identifier strategy SHALL preserve the integrity of the Canonical Domain Model.

---

## 10.6 Constraint Conventions

Constraints SHALL preserve:

- business integrity;
- referential integrity;
- data consistency.

Constraints SHALL accurately reflect approved business semantics.

---

## 10.7 Uniqueness

Uniqueness requirements SHALL be explicitly defined.

Uniqueness SHALL reflect business rules rather than implementation convenience.

---

## 10.8 Nullability

Mandatory information SHALL NOT permit null values.

Optional information MAY permit null values where supported by approved business requirements.

Nullability SHALL accurately reflect business semantics.

---

## 10.9 Indexing Principles

Indexing SHALL support efficient retrieval of persistent data.

Indexes SHALL improve query performance without altering the logical representation of the persistence model.

Index definitions are implementation concerns and are therefore outside the scope of this specification.

---

## 10.10 Default Values

Default values SHALL:

- be deterministic;
- preserve business meaning;
- remain consistent across implementations.

Implementation defaults SHALL NOT contradict approved business requirements.

---

# 11. Persistence Lifecycle Management

## 11.1 Overview

This overview defines the canonical lifecycle requirements governing persistent data throughout the Platform.

Persistence lifecycle management establishes consistent rules for the creation, modification, versioning, retention, archival and disposal of persisted information.

These requirements SHALL apply to all persistent data unless explicitly exempted by an approved Architecture Decision Record (ADR).

---

## 11.2 Persistence Lifecycle Principles

Persistent data SHALL be managed throughout its lifecycle in a manner that:

- preserves data integrity;
- maintains traceability;
- supports auditability;
- complies with applicable business, legal and regulatory requirements;
- minimises unnecessary data duplication;
- preserves the integrity of the Canonical Domain Model.

Persistence lifecycle management SHALL remain independent of implementation technologies.

---

## 11.3 Creation

Persistent representations SHALL be created in a valid state.

Creation SHALL:

- satisfy all mandatory business requirements;
- establish ownership;
- establish identity;
- initialise lifecycle metadata where applicable.

Persistent representations SHALL NOT be created in an invalid or incomplete state unless explicitly authorised by approved business rules.

---

## 11.4 Modification

Persistent representations MAY be modified only through approved business processes.

Modification SHALL:

- preserve data integrity;
- maintain Aggregate consistency;
- preserve ownership relationships;
- update lifecycle metadata where applicable.

Unauthorised modification SHALL NOT occur.

---

## 11.5 Versioning

Where versioning is required, version information SHALL accurately represent the evolution of the persisted object.

Versioning SHALL:

- preserve historical traceability;
- support concurrency management where applicable;
- remain consistent throughout the lifecycle of the object.

The implementation mechanism for version management is outside the scope of this specification.

---

## 11.6 Concurrency

Persistence implementations SHALL protect data from conflicting modifications.

Concurrency management SHALL:

- preserve data integrity;
- minimise conflicting updates;
- support consistent business operations.

The selected concurrency strategy is an implementation concern.

---

## 11.7 Soft Deletion

Where business requirements permit, persistent representations SHOULD be deactivated rather than physically removed.

Soft deletion SHALL:

- preserve historical information;
- maintain referential integrity;
- support auditability;
- preserve traceability.

Soft deleted objects SHALL remain distinguishable from active objects.

---

## 11.8 Hard Deletion

Physical deletion SHALL occur only where:

- required by business policy;
- required by regulatory obligations;
- explicitly authorised by approved business rules.

Hard deletion SHALL preserve platform integrity.

Deletion mechanisms are implementation concerns.

---

## 11.9 Archiving

Persistent information MAY be archived when it is no longer required for normal operational use.

Archived information SHALL:

- remain traceable;
- preserve historical integrity;
- support approved retention requirements.

Archive strategies are implementation concerns.

---

## 11.10 Retention

Retention requirements SHALL be determined by:

- business policy;
- contractual obligations;
- legal requirements;
- regulatory requirements.

Retention periods SHALL be consistently applied throughout the Platform.

---

## 11.11 Restoration

Where restoration is supported, restored information SHALL:

- preserve identity;
- preserve ownership;
- preserve integrity;
- preserve traceability.

Restoration SHALL NOT compromise the integrity of existing persistent information.

---

## 11.12 Disposal

Data disposal SHALL:

- comply with approved retention policies;
- comply with applicable legal obligations;
- preserve Platform integrity;
- maintain auditability where required.

Disposal SHALL be performed in a controlled and traceable manner.

---

## 11.13 Audit History

Where audit history is maintained, audit information SHALL:

- accurately represent lifecycle events;
- remain immutable where practical;
- support historical investigation;
- preserve accountability.

Audit history SHALL remain consistent throughout the lifecycle of the persisted object.

---

## 11.14 Lifecycle Traceability

Every significant lifecycle event SHOULD be traceable.

Lifecycle events MAY include:

- creation;
- modification;
- version changes;
- archival;
- restoration;
- deletion.

Traceability SHALL support operational, business and regulatory requirements.

---

# 12. Compliance & Verification

## 12.1 Overview

This overview defines the requirements for demonstrating compliance with the Canonical Physical Data Model.

Compliance ensures that persistence implementations conform to the mandatory requirements established by this specification and remain aligned with the approved Platform Architecture and Canonical Domain Model.

Verification activities SHALL provide objective evidence that implementations satisfy the requirements of this specification.

---

## 12.2 Compliance Principles

Compliance with this specification SHALL:

- preserve alignment with the Canonical Domain Model;
- preserve consistency across all bounded contexts;
- ensure implementation traceability;
- minimise implementation ambiguity;
- support long-term maintainability.

Implementation-specific optimisations SHALL NOT compromise compliance.

---

## 12.3 Mandatory Compliance

Implementations claiming compliance with this specification SHALL satisfy all mandatory requirements identified using the keyword **SHALL**.

Requirements identified using **SHOULD** are strongly recommended.

Requirements identified using **MAY** are optional unless otherwise mandated by an approved Architecture Decision Record (ADR).

---

## 12.4 Verification Requirements

Compliance SHALL be verified through one or more of the following activities:

- architecture review;
- engineering review;
- specification review;
- implementation review;
- automated validation where appropriate.

Verification SHALL produce objective evidence of compliance.

---

## 12.5 Traceability Verification

Every persistent representation SHALL be traceable to:

- the approved Canonical Domain Model;
- the governing Architecture Documents;
- the applicable Engineering Specifications;
- approved Architecture Decision Records where exceptions exist.

Traceability SHALL be maintained throughout the lifecycle of the Platform.

---

## 12.6 Engineering Review

Engineering reviews SHALL verify that persistence implementations:

- preserve Aggregate boundaries;
- preserve ownership semantics;
- preserve referential integrity;
- comply with approved persistence conventions;
- satisfy lifecycle management requirements.

Engineering reviews SHOULD identify opportunities for improving consistency and maintainability.

---

## 12.7 Architecture Review

Architecture reviews SHALL verify that persistence implementations remain aligned with:

- the approved Platform Architecture;
- the approved Domain Model;
- approved Architecture Decision Records.

Architecture reviews SHALL ensure that implementation decisions do not redefine architectural intent.

---

## 12.8 Implementation Review

Implementation reviews SHALL verify that implementation artefacts accurately realise the requirements of this specification.

Implementation reviews MAY include:

- schema review;
- migration review;
- repository review;
- persistence service review;
- integration review.

Implementation techniques are outside the scope of this specification.

---

## 12.9 Exception Management

Exceptions to this specification SHALL be authorised only through an approved Architecture Decision Record (ADR).

Approved exceptions SHALL:

- document the reason for the exception;
- identify affected requirements;
- describe the approved alternative;
- preserve overall architectural integrity.

Unapproved deviations SHALL be considered non-compliant.

---

## 12.10 Acceptance Criteria

An implementation SHALL be considered compliant when:

- mandatory requirements have been satisfied;
- approved exceptions have been documented;
- verification activities have been completed;
- traceability has been demonstrated;
- engineering review has been successfully completed.

---

## 12.11 Continuous Compliance

Compliance SHALL be maintained throughout the lifecycle of the Platform.

Changes affecting persistence behaviour SHALL be evaluated against this specification before implementation.

Where non-compliance is identified, corrective action SHALL be taken through the approved engineering governance process.

---

## 12.12 Compliance Reporting

Compliance assessments SHOULD produce documented evidence that includes:

- scope of assessment;
- requirements evaluated;
- identified exceptions;
- review outcomes;
- recommendations where applicable.

Compliance reports SHALL become part of the Platform's engineering record where required by governance.

---

# 13. Related Documents

### Governing Documents

- ARCH-000 – Architecture Manifest
- SPEC-000 – Engineering Specification Standard
- GOV-000 – Engineering Governance Handbook
- GOV-001 – Engineering Document Catalogue
- GOV-002 – Engineering Glossary

### Related Specifications

- SPEC-001 – Canonical Domain Model

---

# 14. Change Control

This specification SHALL evolve under the governance defined by SPEC-000.

Changes SHALL preserve consistency with:

- the Platform Architecture;
- the Canonical Domain Model;
- approved ADRs;
- related Engineering Specifications.

---

# 15. Approval

This specification is the authoritative Platform Engineering Standard and is approved in accordance with the Engineering Governance Framework.

**Approval Status:** Approved

---