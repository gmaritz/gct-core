# ARCH-000 – Architecture Manifest

> **Enterprise Architecture Standard**
>
> This document defines the enduring architectural principles governing the design, development, implementation, operation, and evolution of the GCT Core and PCS Core platforms.
>
> All architecture documents, engineering specifications, Architecture Decision Records, and implementations SHALL conform to this Manifest.

---

## Document Control

| Property | Value |
|---|---|
| Architecture ID | ARCH-000 |
| Title | Architecture Manifest |
| Version | 1.0.0 |
| Status | Approved |
| Classification | Enterprise Architecture Standard |
| Owner | Platform Architecture |
| Applies To | GCT Core, PCS Core |
| Authority | Highest Architectural Authority |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0.0 | YYYY-MM-DD | Consolidated Architecture Manifest baseline | Platform Architecture |

---

## Table of Contents

1. Purpose
2. Scope
3. Architectural Vision
4. Architectural Philosophy
5. Core Architectural Principles
6. Engineering Lifecycle
7. Domain-Driven Design
8. Clean Architecture
9. Architectural Patterns
10. Domain and Data Ownership
11. Persistence Principles
12. Integration and Provider Independence
13. API and Interface Principles
14. Security Principles
15. Scalability and Performance Principles
16. Reliability and Observability Principles
17. Technology Principles
18. AI-Assisted Engineering Principles
19. Architecture Governance
20. Architecture Decision Records
21. Change and Evolution Principles
22. Guiding Statements
23. Compliance
24. Change Control
25. Approval

---

# 1. Purpose

The purpose of this Architecture Manifest is to establish the enduring architectural principles governing GCT Core and PCS Core.

The Manifest exists to ensure that architectural decisions remain:

- business-aligned;
- intentional;
- consistent;
- maintainable;
- scalable;
- technology-independent where practical;
- understandable to future engineers and AI-assisted development tools.

Architecture SHALL remain stable in principle even as implementation technologies evolve.

This document defines architectural direction.

It does not define detailed implementation.

Detailed implementation requirements SHALL be defined through approved engineering specifications.

---

# 2. Scope

This Manifest applies to all platform architecture, including:

- Business Architecture;
- Domain Architecture;
- Application Architecture;
- Data Architecture;
- Integration Architecture;
- Infrastructure Architecture;
- API Architecture;
- Security Architecture;
- AI Services Architecture;
- Operational Architecture;
- Testing Architecture;
- Deployment Architecture.

It applies to:

- GCT Core;
- PCS Core;
- shared platform capabilities;
- future platforms formally adopting this governance framework.

Project-specific business models SHALL remain distinct even where projects share architectural principles.

Shared governance SHALL NOT imply shared domain models.

---

# 3. Architectural Vision

The platforms SHALL be designed as durable business systems capable of evolving independently of individual technologies, suppliers, frameworks, and external providers.

Architecture SHALL enable each platform to:

- represent its business domain accurately;
- support long-term business evolution;
- integrate external providers without becoming dependent upon them;
- preserve clear ownership of business rules;
- evolve individual capabilities without destabilising unrelated capabilities;
- support secure and observable operations;
- remain understandable and maintainable over time.

The architecture SHALL optimise for long-term business capability rather than short-term implementation convenience.

---

# 4. Architectural Philosophy

The architecture is founded upon a central principle:

> **Model the business first. Build the technology second.**

Business concepts are generally more durable than technologies.

Frameworks, databases, suppliers, APIs, cloud platforms, and AI providers MAY change.

The core business meaning of concepts such as reservations, journeys, travellers, products, suppliers, orders, inventory, and payments generally evolves more slowly.

Architecture SHALL therefore model the business rather than allowing technology to define the business model.

---

# 5. Core Architectural Principles

## 5.1 Business First

Business capability SHALL drive architecture.

Technology SHALL serve the business model.

The business model SHALL NOT be distorted merely to accommodate a framework, supplier API, database structure, or third-party platform.

---

## 5.2 Architecture Before Implementation

Significant implementation SHALL be preceded by sufficient approved architecture and specification.

Implementation SHALL NOT be used as a substitute for architectural decision-making.

Exploratory prototypes MAY be created where appropriate, but SHALL NOT become production architecture without formal review.

---

## 5.3 Specification-Driven Development

Approved specifications SHALL define implementation requirements.

Source code SHALL conform to approved architecture and specifications.

Where implementation exposes an architectural ambiguity, the ambiguity SHALL be resolved in the appropriate governance artefact rather than silently decided in code.

---

## 5.4 Separation of Concerns

Each architectural component SHALL have a clearly defined responsibility.

Business logic, application orchestration, persistence, external integrations, presentation, and infrastructure concerns SHALL remain appropriately separated.

---

## 5.5 Dependency Direction

Dependencies SHALL point toward more stable business abstractions.

The Domain Layer SHALL NOT depend upon infrastructure technologies.

Infrastructure SHALL implement abstractions defined by more stable inner layers.

---

## 5.6 Simplicity

The simplest architecture capable of satisfying approved business and quality requirements SHOULD be preferred.

Complexity SHALL require justification.

Patterns SHALL NOT be introduced merely because they are fashionable or technically interesting.

---

## 5.7 Explicit Boundaries

Bounded contexts, aggregate boundaries, module boundaries, and integration boundaries SHALL be explicit.

Business meanings SHALL NOT leak unintentionally across those boundaries.

---

## 5.8 Provider Independence

External suppliers and technology providers SHALL be treated as replaceable dependencies.

No external provider SHALL define the canonical business model.

---

## 5.9 Maintainability Over Novelty

Long-term maintainability SHALL be preferred over technological novelty.

New technologies SHOULD be adopted only where they provide clear and justified value.

---

## 5.10 Evolution Over Premature Generalisation

Architecture SHALL support evolution without attempting to predict every future requirement.

Abstractions SHOULD be introduced when justified by actual architectural needs.

---

# 6. Engineering Lifecycle

The default engineering lifecycle SHALL be:

```text
Business Modelling
        ↓
Architecture
        ↓
Canonical Domain Model
        ↓
Canonical Physical Data Model
        ↓
Implementation Specifications
        ↓
Implementation
        ↓
Architecture & Specification Validation
        ↓
Testing
        ↓
Deployment
        ↓
Operations & Evolution
```

AI-assisted implementation MAY participate in implementation and review activities but SHALL NOT replace the required modelling, architecture, or specification stages.

A stage MAY overlap another where appropriate, but no mandatory architectural concern SHALL be silently bypassed.

---

# 7. Domain-Driven Design

The platforms SHALL use Domain-Driven Design where appropriate to represent complex business domains.

The architecture SHALL recognise concepts including:

- Ubiquitous Language;
- Bounded Contexts;
- Aggregate Roots;
- Entities;
- Value Objects;
- Domain Services;
- Domain Events;
- Repositories;
- Business Policies.

Domain terminology SHALL reflect the language of the actual business.

Generic software terminology SHALL NOT replace meaningful domain language where a clear business concept exists.

---

## 7.1 Bounded Context Integrity

Each bounded context SHALL own its own domain meaning.

A concept with the same name MAY have different meanings in different bounded contexts.

Those meanings SHALL NOT be merged merely for technical convenience.

---

## 7.2 Aggregate Integrity

Aggregate Roots SHALL define transactional consistency boundaries.

Business invariants SHALL be protected within the appropriate domain boundary.

External callers SHALL NOT mutate internal aggregate state directly.

---

## 7.3 Domain Purity

The Domain Layer SHALL remain independent of:

- HTTP frameworks;
- database frameworks;
- ORM implementations;
- external suppliers;
- payment providers;
- messaging providers;
- AI providers;
- infrastructure concerns.

---

# 8. Clean Architecture

The platforms SHALL follow Clean Architecture dependency principles.

A conceptual layering model is:

```text
Interfaces
    ↓
Application
    ↓
Domain

Infrastructure → implements inward-facing abstractions
```

The exact folder structure MAY vary according to approved specifications.

The dependency rule SHALL NOT vary.

---

## 8.1 Domain Layer

The Domain Layer owns:

- business behaviour;
- business invariants;
- aggregate rules;
- domain events;
- domain services;
- domain abstractions.

It SHALL remain framework-independent.

---

## 8.2 Application Layer

The Application Layer owns:

- use-case orchestration;
- commands;
- queries;
- application services;
- transaction coordination;
- workflow coordination.

Application Services SHALL orchestrate business behaviour.

They SHALL NOT become containers for domain rules that belong inside the Domain Layer.

---

## 8.3 Infrastructure Layer

The Infrastructure Layer owns technical implementations such as:

- persistence;
- external provider adapters;
- messaging implementations;
- payment integrations;
- logging implementations;
- infrastructure configuration.

Infrastructure SHALL depend on approved abstractions rather than redefine business concepts.

---

## 8.4 Interface Layer

The Interface Layer owns translation between external interaction mechanisms and application use cases.

Examples include:

- HTTP controllers;
- API routes;
- request validation;
- presenters;
- transport-level error mapping.

Controllers SHALL NOT contain core business logic.

---

# 9. Architectural Patterns

The platforms MAY use patterns including:

- Domain-Driven Design;
- Clean Architecture;
- CQRS;
- Repository Pattern;
- Dependency Injection;
- Domain Events;
- Event-Driven Architecture;
- Anti-Corruption Layers;
- Adapter Pattern;
- Strategy Pattern;
- Factory Pattern;
- Specification Pattern.

A pattern SHALL be used because it solves an identified architectural problem.

A pattern SHALL NOT be treated as a mandatory objective in itself unless explicitly required by an approved architecture document or specification.

---

# 10. Domain and Data Ownership

The platform SHALL distinguish clearly between:

1. data owned by the platform;
2. data referenced or synchronised from external providers.

Transactional business records created by the platform SHALL remain under platform ownership.

External provider data SHALL retain explicit provenance.

Supplier-specific identifiers SHALL NOT replace canonical platform identifiers.

---

## 10.1 Canonical Models

Canonical models SHALL represent the platform's business meaning.

External models SHALL be translated into canonical models at integration boundaries.

The canonical model SHALL NOT mirror a supplier API merely for implementation convenience.

---

## 10.2 Transactional and Catalogue Data

Transactional data and catalogue/reference data SHALL be modelled according to their distinct ownership and lifecycle requirements.

For example:

```text
External Accommodation Catalogue
            ↓
Canonical Accommodation Reference
            ↓
Accommodation Booking
            ↓
Journey / Reservation
```

A supplier's catalogue object and the platform's transactional booking SHALL NOT be treated as the same business object.

---

# 11. Persistence Principles

Persistence SHALL serve the Domain Model.

The Domain Model SHALL NOT serve the database schema.

Persistence concerns SHALL remain isolated behind appropriate abstractions.

The canonical physical data model SHALL be defined through approved architecture and specifications before substantial persistence implementation.

Database technology SHALL be considered replaceable infrastructure even when a specific technology is selected for implementation.

---

# 12. Integration and Provider Independence

External providers SHALL integrate through controlled boundaries.

The preferred conceptual model is:

```text
External Provider
        ↓
Provider Adapter
        ↓
Anti-Corruption / Translation Boundary
        ↓
Canonical Platform Model
        ↓
Application / Domain
```

Supplier-specific models SHALL NOT leak into the Domain Layer.

---

## 12.1 Provider Replacement

Replacing an external supplier SHOULD require changes primarily within the integration boundary.

Core business rules SHOULD remain unaffected.

---

## 12.2 External Identifiers

Internal platform identifiers, business identifiers, and supplier identifiers SHALL remain distinct.

External identifiers SHALL retain provider provenance.

---

## 12.3 Failure Isolation

External provider failure SHALL NOT unnecessarily compromise unrelated platform capabilities.

Timeouts, retries, idempotency, resilience, and degradation strategies SHALL be defined where appropriate in lower-level architecture and specifications.

---

# 13. API and Interface Principles

External interfaces SHALL expose stable platform concepts rather than internal implementation details.

APIs SHALL NOT expose:

- ORM models directly;
- supplier-specific models unnecessarily;
- internal persistence structures;
- infrastructure implementation details.

Contracts SHALL be explicit and versioned where required.

---

# 14. Security Principles

Security is an architectural concern and SHALL NOT be treated solely as an implementation feature.

The platforms SHALL follow principles including:

- least privilege;
- defence in depth;
- secure defaults;
- explicit authentication;
- explicit authorisation;
- encryption in transit;
- appropriate encryption at rest;
- secrets management;
- auditability;
- minimisation of sensitive data;
- secure failure behaviour.

Security requirements SHALL be refined through dedicated architecture documents and specifications.

---

# 15. Scalability and Performance Principles

Architecture SHALL support appropriate growth without premature complexity.

The platforms SHOULD favour:

- stateless application services where practical;
- horizontal scalability where justified;
- asynchronous processing where business semantics allow it;
- independently evolvable modules;
- efficient persistence access patterns;
- caching where evidence supports it.

Performance optimisation SHALL be driven by measurable requirements and observed behaviour.

Premature optimisation SHALL be avoided.

---

# 16. Reliability and Observability Principles

Production systems SHALL be designed to be observable.

Relevant capabilities SHOULD include:

- structured logging;
- metrics;
- tracing where appropriate;
- health monitoring;
- failure diagnostics;
- audit trails;
- alerting;
- operational dashboards where justified.

Failures SHOULD be explicit, diagnosable, and recoverable where practical.

Critical workflows SHALL define appropriate idempotency and retry behaviour.

---

# 17. Technology Principles

Technology choices are implementation decisions constrained by architecture.

Technologies MAY evolve without changing fundamental architectural principles.

Specific technology selections SHOULD be documented through:

- approved architecture documents;
- approved specifications;
- ADRs where the decision has significant long-term consequences.

Architecture SHALL NOT become unnecessarily coupled to a technology solely because it is currently selected.

---

# 18. AI-Assisted Engineering Principles

AI coding assistants MAY assist with:

- specification drafting;
- implementation;
- testing;
- documentation;
- code review;
- architecture compliance analysis.

AI-assisted engineering SHALL remain governed by approved architecture and specifications.

AI coding assistants SHALL:

- preserve architectural intent;
- implement approved requirements;
- identify ambiguity;
- identify conflicts;
- report deviations;
- avoid silent architectural invention.

AI coding assistants SHALL NOT independently:

- redefine aggregate boundaries;
- introduce new business rules;
- replace approved architectural patterns;
- bypass repository boundaries;
- introduce supplier coupling into the domain;
- alter canonical models without approval.

The responsibility for architectural approval remains with Platform Architecture.

---

# 19. Architecture Governance

The canonical authority hierarchy is:

```text
1. ARCH-000 – Architecture Manifest

2. SPEC-000 – Engineering Specification Standard

3. Approved Architecture Documents

4. Approved Implementation Specifications

5. Approved Architecture Decision Records

6. Source Code

7. Automated Tests
```

Higher-authority artefacts SHALL govern lower-authority artefacts.

However, this hierarchy SHALL NOT be used as a mechanism for tolerating unresolved contradictions.

If an approved architectural decision changes an existing Architecture Document or Specification:

1. the decision SHALL be recorded appropriately;
2. affected authoritative documents SHALL be updated;
3. implementation SHALL proceed only against the reconciled documentation baseline.

The desired state is always:

```text
Architecture
        =
Specifications
        =
Approved Decisions
        =
Implementation Intent
```

---

## 19.1 Role of ARCH Documents

ARCH documents define architectural structure, principles, boundaries, and approved architectural models.

They answer:

> How is the system architecturally organised?

---

## 19.2 Role of SPEC Documents

SPEC documents define precise implementation requirements.

They answer:

> What exactly SHALL be implemented?

Specifications SHALL conform to architecture.

---

## 19.3 Role of ADR Documents

ADRs preserve the rationale for significant architectural decisions.

They answer:

> Why was this decision made?

An ADR SHALL NOT be used as a permanent substitute for updating affected architecture or specifications.

---

## 19.4 Role of GOV Documents

Governance handbooks explain how the governance system is used.

They are informative unless explicitly classified otherwise.

They SHALL NOT override normative architecture or specifications.

---

# 20. Architecture Decision Records

Significant architectural decisions SHALL be recorded as ADRs when required by ADR-000.

An ADR SHOULD include:

- context;
- problem;
- decision;
- rationale;
- alternatives considered;
- consequences;
- risks;
- related architecture;
- related specifications.

Architectural history SHALL be preserved.

Superseded decisions SHALL normally remain in version control.

---

# 21. Change and Evolution Principles

Architecture SHALL be allowed to evolve deliberately.

Architectural change SHALL be:

- explicit;
- reviewed;
- documented;
- traceable;
- reflected in affected specifications.

Change SHALL NOT occur accidentally through implementation drift.

---

## 21.1 Backward Compatibility

Backward compatibility SHOULD be preserved where practical and valuable.

Breaking changes MAY be introduced where justified, but their impact SHALL be understood and governed.

---

## 21.2 Technical Debt

Technical debt MAY be accepted deliberately.

Significant technical debt SHOULD be documented.

Accidental architectural erosion SHALL NOT be normalised as technical debt.

---

# 22. Guiding Statements

The following statements summarise the architectural philosophy:

> **Model the business, not the technology.**

> **Architecture is a strategic asset.**

> **Architecture before implementation.**

> **Specifications govern implementation.**

> **Business rules belong in the domain.**

> **Dependencies point toward stable business abstractions.**

> **External providers are replaceable.**

> **The platform owns its canonical model.**

> **Supplier models stop at integration boundaries.**

> **Simplicity is preferred over unnecessary complexity.**

> **Maintainability is preferred over novelty.**

> **Optimisation follows evidence.**

> **Architectural decisions are explicit and traceable.**

> **AI assists engineering; it does not independently define architecture.**

> **Architecture outlives technology.**

---

# 23. Compliance

All architecture documents SHALL conform to this Manifest.

All specifications SHALL conform to:

- ARCH-000; and
- SPEC-000.

All ADRs SHALL conform to:

- ARCH-000; and
- ADR-000.

Implementation SHALL conform to the reconciled set of:

- approved architecture;
- approved specifications;
- approved architectural decisions.

Any material deviation SHALL be reported and resolved through the governance process.

---

# 24. Change Control

ARCH-000 is intended to be highly stable.

Changes to this Manifest SHALL require formal architectural review.

A change SHALL include:

- rationale;
- impact assessment;
- identification of affected architecture documents;
- identification of affected specifications;
- identification of affected ADRs;
- migration implications where applicable.

Versioning SHALL follow the governance rules defined by SPEC-000 or its successor.

Changes SHALL NOT erase historical architectural intent.

---

# 25. Approval

## Approval Status

**APPROVED**

## Baseline

**Architecture Manifest v1.0**

## Effective Scope

This Manifest governs:

- GCT Core;
- PCS Core;
- any future platform that formally adopts this governance framework.

## Implementation Directive

ARCH-000 is the highest architectural authority within the platform governance framework.

All lower-level architecture, specifications, ADRs, and implementation SHALL remain consistent with its principles.

Where ambiguity or conflict is discovered, implementation SHALL NOT silently resolve the issue.

The conflict SHALL be escalated through the governance process and the authoritative documentation SHALL be reconciled before dependent implementation proceeds.

---

**End of ARCH-000 – Architecture Manifest**