# GCT Core – Architecture Manifest (v1.0)

**Project:** Go Cape Tours Core Platform (GCT Core)
**Document:** Architecture Manifest
**Version:** 1.0
**Status:** Approved

---

# Purpose

The Architecture Manifest is the governing document for the GCT Core platform.

It establishes the architectural principles, governance model, document hierarchy, and implementation rules that apply to every component of the system.

All architecture documents, implementation specifications, and source code must conform to this manifest.

Where uncertainty exists, this document defines how architectural decisions are interpreted.

---

# Mission

Build a scalable, maintainable, provider-independent tourism platform capable of supporting Go Cape Tours for the next decade while remaining adaptable to new business opportunities, technologies, and integrations.

The platform shall prioritise business correctness, maintainability, extensibility, and operational excellence over short-term implementation convenience.

---

# Architectural Philosophy

GCT Core is built upon:

* Domain-Driven Design (DDD)
* Clean Architecture
* CQRS
* SOLID Principles
* Hexagonal Architecture
* Provider Independence
* Infrastructure Isolation
* API-First Design
* AI as a Platform Capability

Business requirements always take precedence over technical convenience.

---

# Core Principles

The following principles are non-negotiable.

## 1. Domain First

The Domain Model is the source of business truth.

Nothing outside the Domain Layer defines business behaviour.

---

## 2. Business Before Technology

Frameworks, databases, AI providers, ORMs, APIs, and suppliers are implementation details.

The platform is designed around the business—not around technology.

---

## 3. Clean Boundaries

Every architectural layer has a clearly defined responsibility.

Dependencies always point inward.

Outer layers may depend on inner layers.

Inner layers never depend on outer layers.

---

## 4. Persistence Ignorance

The Domain Layer has no knowledge of:

* Prisma
* PostgreSQL
* SQL
* HTTP
* Express
* External APIs

---

## 5. Provider Independence

Hotelbeds is not the architecture.

Stripe is not the architecture.

OpenAI is not the architecture.

Every provider is replaceable.

---

## 6. AI Augments Business

Artificial Intelligence assists decision-making.

Business rules remain deterministic.

The Domain Model always has the final authority.

---

## 7. Simplicity

Prefer simple, understandable solutions over clever solutions.

Complexity requires justification.

---

## 8. Evolutionary Design

The architecture is designed to evolve through Specifications rather than structural redesign.

The core architecture should remain stable.

---

# Architecture Hierarchy

The following hierarchy governs the project.

```text
Architecture Manifest

↓

Architecture Documents

↓

Architecture Decision Records (ADR)

↓

Specifications (SPEC)

↓

Source Code

↓

Configuration
```

Higher levels always take precedence.

---

# Architecture Documents

The Architecture consists of twenty-two documents organised into three logical layers.

## Domain Architecture

Documents 01–13 define the business model.

## Application Architecture

Documents 14–19 define application behaviour.

## Platform Architecture

Documents 20–22 define cross-cutting capabilities.

No implementation may contradict these documents.

---

# Specifications

Specifications define implementation.

Specifications may:

* introduce new modules
* define implementation details
* describe deployment
* define testing approaches

Specifications may never contradict Architecture Documents.

---

# Architecture Decision Records (ADR)

Architecture Decision Records capture important design decisions.

Every significant architectural change should produce an ADR.

An ADR records:

* decision
* rationale
* alternatives considered
* consequences

ADRs complement the architecture but do not replace it.

---

# Source Code Governance

Source code exists to implement the architecture.

Where code and architecture differ, the architecture is considered correct unless superseded through the governance process.

Temporary implementation shortcuts must be documented.

---

# AI Coding Assistant Governance

AI coding assistants (including GitHub Copilot, ChatGPT, Claude, Gemini, and future tools) must treat the Architecture Manifest as the authoritative entry point.

AI implementations should:

* preserve architectural boundaries
* avoid introducing undocumented patterns
* comply with approved Specifications
* report deviations rather than silently correcting architecture

AI assistants must not redesign the platform without explicit approval.

---

# Change Management

Architecture changes occur in this order:

1. Architecture discussion
2. Architecture approval
3. Architecture documentation
4. Specification update
5. Implementation
6. Validation

Implementation must never precede architecture.

---

# Compliance

Every implementation should be evaluated against the following questions:

* Does it preserve Domain integrity?
* Does it respect architectural boundaries?
* Does it follow approved Specifications?
* Does it avoid technology leakage?
* Is it maintainable?
* Is it testable?
* Is it provider-independent?
* Is it secure?
* Is it observable?

If the answer to any question is "No", the implementation should be reconsidered.

---

# Project Structure

The recommended documentation structure is:

```text
docs/
│
├── ARCHITECTURE-MANIFEST.md
│
├── architecture/
│   ├── 01-project-vision.md
│   ├── ...
│   └── 22-ai-services-architecture.md
│
├── specifications/
│   ├── SPEC-001-project-structure.md
│   ├── SPEC-002-cqrs-implementation.md
│   └── ...
│
└── decisions/
    ├── ADR-001-...
    └── ADR-...
```

This structure separates architecture, implementation, and design decisions while providing a clear entry point for both developers and AI assistants.

---

# Definition of Done

An implementation is considered architecturally complete when:

* it complies with this Manifest
* it complies with all applicable Architecture Documents
* it complies with all relevant Specifications
* it passes architectural validation
* it introduces no undocumented architectural patterns

---

# Conclusion

The Architecture Manifest is the constitutional document of GCT Core. It establishes the principles, governance, and hierarchy that guide every architectural decision and implementation. By placing business concerns above technology and enforcing disciplined architectural boundaries, it ensures that GCT Core remains scalable, maintainable, and adaptable throughout its lifecycle while providing a single, authoritative starting point for developers, architects, and AI coding assistants.
