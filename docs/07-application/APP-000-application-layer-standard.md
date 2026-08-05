# APP-000
# Application Layer Standard

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Document | APP-000 |
| Title | Application Layer Standard |
| Status | Approved |
| Version | 1.0 |
| Owner | Platform Architecture |
| Applies To | All Application Services |

---

# Purpose

This document defines the architectural standards governing the GCT Core Application Layer.

The Application Layer orchestrates business capabilities.

It coordinates Domain Services, Policies and Infrastructure to produce application results that can be transformed into presentation contracts.

The Application Layer never renders user interfaces and never contains presentation logic.

---

# Architectural Philosophy

The Application Layer answers the question:

> **"How should the platform coordinate its business capabilities to fulfil this use case?"**

The Domain Layer answers:

> **"What is the business?"**

The Presentation Layer answers:

> **"How is the result displayed?"**

Each layer has a single responsibility.

---

# Layer Position

```
Presentation Layer

↓

View Model Providers

↓

Application Layer

↓

Domain Layer

↓

Infrastructure
```

Application Services sit between the Domain Layer and the Presentation Layer.

---

# Responsibilities

Application Services are responsible for:

- Orchestrating business capabilities
- Coordinating Domain Services
- Executing application workflows
- Applying application policies
- Returning application results
- Coordinating external integrations
- Providing deterministic outputs

Application Services are **not** responsible for:

- Rendering HTML
- Creating View Models
- Performing server-side rendering
- Managing CSS or JavaScript
- Accessing UI components
- Formatting presentation data
- Holding presentation state

---

# Dependency Rules

Application Services may depend on:

- Domain Services
- Domain Models
- Repository Interfaces
- Policies
- Infrastructure Abstractions
- External Provider Abstractions

Application Services shall not depend on:

- Controllers
- Views
- Components
- View Models
- EJS Templates
- CSS
- Browser APIs

Dependency direction shall always point inward toward the Domain Layer.

---

# Application Service Pattern

Every Application Service shall expose a clear public contract.

Example

```typescript
interface HomepageMerchandisingService {

    getHomepageMerchandising():

        Promise<HomepageMerchandisingResult>;

}
```

Services should expose business-oriented methods rather than technical operations.

---

# Application Results

Application Services return **Application Results**.

Application Results are business-oriented contracts.

They are not presentation contracts.

Example

```text
HomepageMerchandisingResult

↓

HomepageShowcaseViewModelProvider

↓

HomepageShowcaseViewModel
```

Application Results remain presentation-neutral.

---

# View Model Providers

View Model Providers form the bridge between the Application Layer and the Presentation Layer.

Responsibilities:

- Consume Application Results
- Map business objects to View Models
- Construct presentation contracts
- Perform explicit mapping

View Model Providers shall not:

- Execute business logic
- Perform orchestration
- Access repositories
- Communicate with external providers

---

# Policies

Policies encapsulate business decisions.

Examples:

- Campaign Policy
- Seasonal Priority Policy
- Journey Eligibility Policy
- Featured Journey Policy
- Collection Policy

Application Services orchestrate Policies.

Policies make business decisions.

---

# Error Handling

Application Services shall:

- Return safe fallback results where appropriate
- Avoid exposing infrastructure exceptions
- Preserve stable service contracts
- Surface recoverable business failures through typed results

Presentation layers shall never receive raw infrastructure exceptions.

---

# Stateless Design

Application Services shall be stateless.

They shall:

- Avoid mutable shared state
- Be deterministic for identical inputs
- Support dependency injection
- Be easily testable

---

# Folder Structure

Canonical structure

```text
src/

application/

    merchandising/

        homepage/

        models/

        policies/

    accommodation/

    packages/

    booking/

    notifications/
```

Application capabilities are organised by business responsibility rather than technical implementation.

---

# Naming Conventions

Services

```
HomepageMerchandisingService
```

Results

```
HomepageMerchandisingResult
```

Policies

```
JourneyEligibilityPolicy
```

Models

```
MerchandisingCampaign
```

Use explicit business terminology.

Avoid generic names such as:

- Helper
- Utility
- Manager
- Processor

---

# Testing Standards

Every Application Service shall include:

- Unit tests
- Contract verification
- Error handling tests
- Deterministic behaviour tests

Presentation integration tests belong outside the Application Layer.

---

# Performance

Application Services should:

- Minimise allocations
- Avoid duplicate orchestration
- Remain cache friendly
- Support server-side rendering
- Avoid presentation concerns

Optimisation shall never compromise architectural clarity.

---

# Current Reference Implementation

The Homepage Merchandising capability is the reference implementation of the Application Layer.

Reference flow:

```text
Frontend Controller

↓

HomepageShowcaseViewModelProvider

↓

HomepageMerchandisingService

↓

HomepageMerchandisingResult

↓

Policies (future)

↓

Package Builder (future)

↓

Accommodation Engine (future)

↓

Hotelbeds (future)
```

Future Application Services shall follow this pattern.

---

# Architectural Principles

The Application Layer shall always maintain:

- Single Responsibility
- Explicit Dependencies
- Dependency Inversion
- Stateless Design
- Deterministic Behaviour
- Clear Service Contracts
- Explicit Mapping
- Testability
- Presentation Independence

---

# Governance

Any new Application Service shall:

- Follow APP-000
- Expose a documented service contract
- Return typed Application Results
- Be independently testable
- Avoid presentation dependencies
- Undergo architectural review before implementation

---

# Milestone Status

APP-000 Version 1.0 is established using the verified implementation of:

- APP-001.1 Homepage Merchandising Application Structure
- APP-001.2 Homepage Merchandising Service
- APP-001.3 Homepage Showcase View Model Provider Integration

Future Application Services shall conform to this standard.

---

# Revision History

| Version | Date | Notes |
|----------|------|-------|
| 1.0 | Initial Release | Established from the first production-ready Application Layer implementation (Homepage Merchandising). |