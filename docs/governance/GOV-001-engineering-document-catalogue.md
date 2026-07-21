# GOV-001 – Engineering Document Catalogue

> **Engineering Governance Index**
>
> This document provides the authoritative catalogue of all governed engineering documentation within the GCT Core and PCS Core platforms.
>
> Unlike Architecture Documents, Engineering Specifications and Architecture Decision Records, this catalogue is informative.
>
> It serves as the primary navigation index for the engineering repository.

---

# Document Control

| Property | Value |
|---|---|
| Document ID | GOV-001 |
| Title | Engineering Document Catalogue |
| Version | 1.0.0 |
| Status | Approved |
| Classification | Informative Engineering Catalogue |
| Owner | Platform Architecture |
| Applies To | GCT Core, PCS Core |

---

# Purpose

The Engineering Document Catalogue provides a single authoritative index of all governed engineering documentation.

Its objectives are to:

- improve discoverability;
- establish a consistent documentation structure;
- identify document ownership;
- identify document status;
- simplify onboarding;
- support architecture reviews;
- support AI-assisted engineering.

This document is informative.

It does not define engineering requirements.

---

# Repository Structure

```text
docs/

├── architecture/
├── specifications/
├── decisions/
├── governance/
├── database/
└── diagrams/
```

Future folders MAY be added as the platform evolves.

---

# Document Classification

The engineering repository consists of four governed document families.

| Prefix | Purpose | Nature |
|---------|----------|---------|
| ARCH | Architecture | Normative |
| SPEC | Engineering Specification | Normative |
| ADR | Architecture Decision Record | Normative |
| GOV | Governance | Informative |

---

# Architecture Documents

| ID | Title | Status |
|----|-------|--------|
| ARCH-000 | Architecture Manifest | Approved |

Future Architecture Documents:

| Reserved ID | Planned Subject |
|--------------|----------------|
| ARCH-001 | System Architecture |
| ARCH-002 | Security Architecture |
| ARCH-003 | Integration Architecture |
| ARCH-004 | Application Architecture |
| ARCH-005 | Infrastructure Architecture |

Reserved identifiers are planning aids only.

They do not imply architectural approval.

---

# Engineering Specifications

| ID | Title | Status |
|----|-------|--------|
| SPEC-000 | Engineering Specification Standard | Approved |
| SPEC-001 | Project Structure | Planned |
| SPEC-002 | Canonical Physical Data Model | In Progress |

Future specifications will be added as approved.

---

# Architecture Decision Records

| ID | Title | Status |
|----|-------|--------|
| ADR-000 | Architecture Decision Record Standard | Approved |

Future ADRs are assigned sequentially.

Examples:

| Reserved ID | Planned Subject |
|--------------|----------------|
| ADR-001 | Adopt PostgreSQL |
| ADR-002 | Provider Adapter Pattern |
| ADR-003 | CQRS Adoption |
| ADR-004 | Authentication Strategy |

Reserved identifiers do not imply approval.

---

# Governance Documents

| ID | Title | Status |
|----|-------|--------|
| GOV-000 | Engineering Governance Handbook | Approved |
| GOV-001 | Engineering Document Catalogue | Approved |

---

# Engineering Lifecycle Documents

The documentation supports the following engineering lifecycle.

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

Architecture Validation

↓

Testing

↓

Deployment

↓

Operations
```

---

# Reading Order

New engineers should read documentation in the following order.

1. GOV-000 – Engineering Governance Handbook

2. GOV-001 – Engineering Document Catalogue

3. ARCH-000 – Architecture Manifest

4. SPEC-000 – Engineering Specification Standard

5. ADR-000 – Architecture Decision Record Standard

6. Relevant Architecture Documents

7. Relevant Engineering Specifications

8. Relevant ADRs

9. Source Code

---

# Governance Hierarchy

The authoritative governance hierarchy is:

```text
ARCH-000

↓

SPEC-000

↓

Approved Architecture Documents

↓

Approved Engineering Specifications

↓

Approved ADRs

↓

Implementation

↓

Tests
```

This catalogue reflects that hierarchy.

It does not define it.

---

# Naming Standards

Documents SHALL use the following filename convention.

```text
ARCH-NNN-title.md

SPEC-NNN-title.md

ADR-NNN-title.md

GOV-NNN-title.md
```

Example:

```text
SPEC-002-canonical-physical-data-model.md
```

---

# Document Status Values

Governed documents may use one of the following status values.

| Status | Meaning |
|----------|----------|
| Draft | Under development |
| Technical Review | Technical review underway |
| Architecture Review | Architecture review underway |
| Approved | Approved for implementation |
| Implemented | Implemented |
| Verified | Verified against implementation |
| Superseded | Replaced |
| Archived | Historical |

Informative documents may use simplified lifecycle states where appropriate.

---

# Ownership

Every governed document should identify:

- Owner
- Version
- Status
- Classification
- Parent Authority
- Revision History

---

# Repository Principles

The documentation repository should remain:

- organised;
- discoverable;
- version controlled;
- architecture-driven;
- specification-driven;
- implementation independent.

Documentation should evolve together with the platform.

---

# AI Navigation

AI coding assistants should use the following discovery order when beginning work.

```text
GOV-001

↓

ARCH-000

↓

SPEC-000

↓

Relevant ARCH

↓

Relevant SPEC

↓

Relevant ADR

↓

Implementation
```

This minimises architectural drift and ensures implementation begins from approved governance rather than existing code.

---

# Change Control

This catalogue should be updated whenever:

- a governed document is created;
- a governed document is archived;
- a governed document changes status;
- a new document family is introduced.

The catalogue should always reflect the current governance baseline.

---

# Approval

## Approval Status

**APPROVED**

## Baseline

**Engineering Document Catalogue v1.0**

## Purpose

This catalogue is the authoritative index of the engineering documentation repository.

It improves discoverability and onboarding while supporting consistent governance across the platform.

---

**End of GOV-001 – Engineering Document Catalogue**