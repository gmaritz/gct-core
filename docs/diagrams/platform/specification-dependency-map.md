# Specification Dependency Map

## Purpose

This document illustrates the dependency hierarchy between the Platform's governing Architecture Documents, Engineering Specifications, Architecture Decision Records (ADRs), and implementation artefacts.

The objective is to provide a single reference showing how engineering decisions flow from business concepts through implementation.

---

# Engineering Governance Hierarchy

```text
                                    BUSINESS MODEL
                                          │
                                          ▼
                         ┌──────────────────────────────┐
                         │        ARCH-000              │
                         │   Architecture Manifest      │
                         └──────────────────────────────┘
                                          │
                 ┌────────────────────────┼────────────────────────┐
                 ▼                        ▼                        ▼
      ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
      │    GOV-000      │      │    GOV-001      │      │    GOV-002      │
      │ Governance      │      │ Document        │      │ Engineering     │
      │ Handbook        │      │ Catalogue       │      │ Glossary         │
      └─────────────────┘      └─────────────────┘      └─────────────────┘
                                          │
                                          ▼
                         ┌──────────────────────────────┐
                         │        SPEC-000              │
                         │ Engineering Specification    │
                         │ Standard                     │
                         └──────────────────────────────┘
                                          │
                 ┌────────────────────────┼────────────────────────┐
                 ▼                        ▼                        ▼
      ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
      │    SPEC-001     │      │    SPEC-002     │      │    SPEC-003     │
      │ Canonical       │─────▶│ Canonical       │─────▶│ Canonical       │
      │ Domain Model    │      │ Physical Data   │      │ API Model       │
      │                 │      │ Model           │      │ (Future)         │
      └─────────────────┘      └─────────────────┘      └─────────────────┘
                 │                        │                        │
                 └──────────────┬─────────┴──────────────┬─────────┘
                                ▼                        ▼
                    Domain-Specific Specifications   Future Specifications
                                │
                                ▼
                      Implementation Artefacts
                                │
      ┌─────────────────────────┼─────────────────────────┐
      ▼                         ▼                         ▼
 Prisma Schema          Database Migrations         API Implementations
      │                         │                         │
      └─────────────────────────┴─────────────────────────┘
                                │
                                ▼
                          Running Platform
```

---

# Dependency Principles

The Platform SHALL observe the following dependency rules:

1. Architecture Documents govern Engineering Specifications.
2. Engineering Specifications govern implementation.
3. Implementation SHALL NOT redefine Engineering Specifications.
4. Architecture Decision Records MAY authorise controlled exceptions.
5. Traceability SHALL exist from implementation back to the governing Architecture and Engineering Specifications.

---

# Canonical Dependency Chain

Business Model

↓

Architecture (ARCH)

↓

Governance (GOV)

↓

Engineering Specifications (SPEC)

↓

Domain-Specific Specifications

↓

Implementation

↓

Running Platform

---

# Notes

This dependency hierarchy SHALL be maintained throughout the lifecycle of the Platform.

New Architecture Documents, Engineering Specifications, and implementation artefacts SHALL integrate into this hierarchy without violating the established dependency rules.