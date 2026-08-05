# APP-002
# Application Service Specification
## Accommodation Engine

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Document | APP-002 |
| Title | Accommodation Engine |
| Status | Approved |
| Version | 1.0 |
| Owner | Application Architecture |
| Depends On | APP-000, APP-001 |
| Next | APP-002.1 Accommodation Engine Structure |

---

# Purpose

The Accommodation Engine provides a supplier-independent application capability responsible for accommodation discovery, ranking, selection and orchestration.

The Accommodation Engine is the single entry point for all accommodation operations within GCT Core.

External accommodation suppliers shall integrate through the Accommodation Engine.

Presentation layers and business services shall never communicate directly with supplier APIs.

---

# Architectural Principle

The Accommodation Engine owns accommodation.

Supplier integrations are implementation details.

The Accommodation Engine exposes business-oriented contracts rather than supplier-specific contracts.

---

# Responsibilities

The Accommodation Engine shall:

- Search accommodation.
- Retrieve accommodation details.
- Retrieve accommodation imagery.
- Retrieve room information.
- Retrieve availability.
- Retrieve rates.
- Rank accommodation.
- Apply accommodation policies.
- Return canonical accommodation models.

The Accommodation Engine shall not:

- Render View Models.
- Render HTML.
- Build packages.
- Perform homepage merchandising.
- Expose supplier-specific models.

---

# Position within the Architecture

```
Package Builder

↓

Accommodation Engine

↓

Provider Registry

↓

Provider Adapter

↓

Supplier API
```

The Accommodation Engine isolates all supplier integrations from the remainder of the platform.

---

# Provider Independence

The Accommodation Engine shall support multiple accommodation providers.

Examples include:

- Hotelbeds
- Bedsonline
- Expedia TAAP
- Stuba
- Direct Partner Hotels

No application service outside the Accommodation Engine shall know which provider supplied the accommodation.

---

# Provider Adapter Pattern

Each supplier shall implement a provider adapter.

Example

```
AccommodationProvider

↓

HotelbedsAdapter

↓

Hotelbeds API
```

Future suppliers shall follow the same pattern.

---

# Canonical Accommodation Model

The Accommodation Engine returns canonical accommodation models.

These models are independent of supplier schemas.

They represent the business concept of accommodation within GCT Core.

---

# Search Orchestration

The Accommodation Engine orchestrates:

- Destination searches
- Availability searches
- Detail retrieval
- Image retrieval
- Ranking
- Policy evaluation

The engine coordinates providers.

Providers do not coordinate themselves.

---

# Policies

Future policies include:

- Preferred Partner Policy
- Accommodation Eligibility Policy
- Ranking Policy
- Quality Policy
- Image Selection Policy

Policies encapsulate business decisions.

---

# Result Contracts

The Accommodation Engine shall expose typed application results.

Example

```
AccommodationSearchResult

AccommodationDetailsResult

AccommodationAvailabilityResult
```

Presentation contracts remain separate.

---

# Error Handling

Supplier failures shall remain isolated.

The Accommodation Engine shall:

- Return safe application results.
- Support partial provider failures.
- Shield higher layers from supplier-specific exceptions.

---

# Performance

The engine should support:

- Provider caching
- Parallel provider execution
- Incremental provider expansion

Performance optimisations shall not compromise architectural clarity.

---

# Governance

Every supplier integration shall:

- Implement a provider adapter.
- Return canonical models.
- Avoid leaking supplier contracts.
- Comply with APP-000.

---

# Initial Implementation Roadmap

APP-002.1

Accommodation Engine Structure

↓

APP-002.2

Canonical Accommodation Model

↓

APP-002.3

Provider Registry

↓

APP-002.4

Hotelbeds Provider Adapter

↓

APP-002.5

Accommodation Search Service

↓

APP-002.6

Accommodation Details Service

↓

APP-002.7

Accommodation Image Service

↓

APP-002.8

Ranking Policies

---

# Milestone Outcome

The Accommodation Engine becomes the canonical accommodation capability for GCT Core.

Supplier APIs become replaceable implementation details.

All accommodation functionality shall pass through this engine.