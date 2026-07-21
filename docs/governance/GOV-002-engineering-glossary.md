# GOV-002 – Engineering Glossary

> **Canonical Engineering Vocabulary**
>
> This document defines the canonical engineering terminology used throughout the Platform Engineering Governance Framework.
>
> It establishes consistent definitions for architectural, engineering, governance and domain modelling terminology.
>
> This document is informative.
>
> It supports consistency across architecture documents, engineering specifications, architecture decision records, implementation guidance and AI-assisted engineering.

---

# Document Control

| Property | Value |
|---|---|
| Document ID | GOV-002 |
| Title | Engineering Glossary |
| Version | 1.0.0 |
| Status | Approved |
| Classification | Informative Governance Document |
| Owner | Platform Architecture |
| Applies To | GCT Core, PCS Core |

---

# Purpose

The Engineering Glossary provides a common engineering vocabulary for the platform.

Its objectives are to:

- establish consistent terminology;
- eliminate ambiguity;
- improve communication;
- support architecture reviews;
- improve specification quality;
- support AI-assisted engineering.

This glossary is informative.

Normative requirements remain defined by Architecture Documents, Engineering Specifications and Architecture Decision Records.

---

# Scope

This glossary applies to:

- Architecture Documents (ARCH)
- Engineering Specifications (SPEC)
- Architecture Decision Records (ADR)
- Governance Documents (GOV)
- Engineering documentation
- Source code terminology where practical
- AI-generated engineering content

---

# Usage Principles

The following principles apply.

- Approved terminology SHOULD be used consistently.
- Definitions SHOULD NOT be redefined in individual documents unless additional domain-specific clarification is required.
- Where ambiguity exists, this glossary is the preferred reference.
- New terminology SHOULD be added here before widespread adoption.

---

# Architecture

| Term | Definition |
|---|---|
| Architecture | The fundamental structure, principles and organisation of the platform. |
| Architecture Document | A normative document defining enduring architectural principles, boundaries or structures. |
| Architecture Manifest | The highest architectural authority for the platform (ARCH-000). |
| Architecture Review | Formal review confirming architectural compliance. |
| Architecture Drift | Divergence between approved architecture and implementation. |

---

# Domain-Driven Design

| Term | Definition |
|---|---|
| Domain | A business problem space with its own concepts and rules. |
| Domain Model | The canonical representation of business concepts and relationships. |
| Aggregate | A consistency boundary protecting related business entities. |
| Aggregate Root | The single entry point through which an aggregate is modified. |
| Entity | An object defined primarily by identity. |
| Value Object | An immutable object defined entirely by its attributes. |
| Bounded Context | A boundary within which terminology has a single, consistent meaning. |
| Ubiquitous Language | Shared terminology used consistently by business and engineering. |

---

# Data Architecture

| Term | Definition |
|---|---|
| Canonical Domain Model | The platform-owned conceptual business model. |
| Canonical Physical Data Model | The approved persistence model derived from the Canonical Domain Model. |
| Canonical Model | The authoritative representation of a business concept owned by the platform. |
| Persistence | Long-term storage of platform data. |
| Schema | The formal structure of persisted data. |

---

# Engineering Specifications

| Term | Definition |
|---|---|
| Specification | A normative engineering document defining implementation requirements. |
| Requirement | A mandatory implementation obligation. |
| Constraint | A mandatory limitation that implementation shall preserve. |
| Invariant | A condition that must always remain true. |
| Acceptance Criteria | Observable conditions required before a specification is considered satisfied. |

---

# Governance

| Term | Definition |
|---|---|
| Governance | The framework controlling engineering activities. |
| Normative | Defines mandatory requirements. |
| Informative | Provides guidance without defining mandatory requirements. |
| Compliance | Demonstrated conformance to approved governance. |
| Traceability | The ability to link architecture, specifications, decisions, implementation and testing. |

---

# Architecture Decision Records

| Term | Definition |
|---|---|
| ADR | Architecture Decision Record. |
| Decision | An approved architectural choice. |
| Rationale | The justification supporting a decision. |
| Consequence | The impact of a decision. |
| Superseded | Replaced by a newer approved decision. |

---

# Implementation

| Term | Definition |
|---|---|
| Implementation | The realization of approved architecture and specifications in software. |
| Implementation Specification | A specification governing implementation behaviour. |
| Implementation Drift | Divergence between implementation and approved documentation. |
| Refactoring | Improving implementation without changing externally observable behaviour. |

---

# AI Engineering

| Term | Definition |
|---|---|
| AI-Assisted Engineering | Use of AI to support engineering activities under governance. |
| AI Implementation | AI-generated implementation conforming to approved documentation. |
| Human Approval | Final engineering authority exercised by qualified reviewers. |

---

# Repository

| Term | Definition |
|---|---|
| Repository | The version-controlled engineering knowledge base. |
| Baseline | An approved version used as the reference point for future evolution. |
| Template | A reusable document structure. |
| Snippet | A reusable document section. |

---

# Related Documents

## Governing Documents

- ARCH-000 – Architecture Manifest
- SPEC-000 – Engineering Specification Standard
- ADR-000 – Architecture Decision Record Standard

## Related Governance

- GOV-000 – Engineering Governance Handbook
- GOV-001 – Engineering Document Catalogue

---

# Maintenance

The glossary should evolve as the engineering framework evolves.

New terminology should:

1. have a clear definition;
2. avoid duplication;
3. avoid ambiguity;
4. align with existing governance;
5. be reviewed before adoption.

Deprecated terminology should remain documented until no longer referenced.

---

# Approval

## Status

**APPROVED**

## Baseline

**Engineering Glossary v1.0**

## Classification

**Informative**

This glossary provides the canonical engineering vocabulary for the platform.

It supports consistent terminology across governance, architecture, specifications, implementation and AI-assisted engineering.

---

**End of GOV-002 – Engineering Glossary**