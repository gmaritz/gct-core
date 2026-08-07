# APP-001E
# Application Architecture Standard
## Application Presentation Pattern

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Document | APP-001E |
| Title | Application Presentation Pattern |
| Status | Approved |
| Version | 1.0 |
| Owner | Application Architecture |
| Depends On | APP-000 Application Layer Standard |
| Related | APP-001A Application Service Pattern |
| Related | APP-001B Application Policy Pattern |
| Related | APP-001C Application Validation Pattern |
| Related | APP-001D Application Result Pattern |

---

# Purpose

Define the canonical presentation architecture for every Application Capability in GCT Core.

The Presentation Pattern establishes the standard mechanism for transforming application results into presentation-specific view models while maintaining strict separation between the Application Layer and the Presentation Layer.

Presentation is a first-class architectural concern.

It is not an implementation detail.

---

# Architectural Principles

Presentation shall remain independent of business orchestration.

Presentation shall consume canonical application results.

Presentation shall be immutable.

Presentation shall be deterministic.

Presentation shall remain UI-independent until the final View Model transformation.

Presentation shall never expose provider contracts.

---

# Why Presentation Exists

Application Services solve business problems.

Presentation solves communication problems.

Presentation exists to transform business outcomes into representations suitable for user interfaces.

The Application Layer should never understand user interface concerns.

The Presentation Layer should never understand business orchestration.

---

# Canonical Presentation Pipeline

Every Application Capability shall follow the same presentation pipeline.

```text
Application Result

        │

        ▼

Presentation Mapper

        │

        ▼

Presentation Model

        │

        ▼

View Model Provider

        │

        ▼

View Model

        │

        ▼

Presentation
```

This pipeline forms the canonical boundary between the Application Layer and the Presentation Layer.

---

# Presentation Mapper

The Presentation Mapper transforms canonical application contracts into canonical presentation contracts.

Responsibilities

- transform Application Results
- normalise presentation data
- enrich presentation-friendly structures
- remain independent of any specific user interface

The Presentation Mapper shall never

- execute business rules
- invoke Application Services
- call providers
- perform validation

---

# Presentation Model

Presentation Models represent canonical presentation-ready information.

Presentation Models are reusable across multiple user interfaces.

Examples

- JourneyPresentationModel
- ReservationPresentationModel
- AccommodationPresentationModel
- PricingPresentationModel

Presentation Models are immutable.

Presentation Models are not View Models.

---

# View Model Provider

The View Model Provider transforms Presentation Models into UI-specific View Models.

Responsibilities

- apply presentation defaults
- compose UI-specific structures
- isolate UI concerns

View Model Providers shall never perform business orchestration.

---

# View Model

View Models belong exclusively to the user interface.

Examples

- HomepageJourneyViewModel
- BookingSummaryViewModel
- ReservationCardViewModel
- AccommodationSearchCardViewModel

View Models shall contain only the information required by the consuming interface.

---

# Canonical Responsibilities

| Component | Responsibility |
|-----------|----------------|
| Application Result | Business outcome |
| Presentation Mapper | Business → Presentation transformation |
| Presentation Model | Canonical presentation contract |
| View Model Provider | Presentation → UI transformation |
| View Model | UI-specific representation |

Each component owns a single responsibility.

---

# Dependency Rules

Application Results may depend on

- Canonical business models
- Value objects

Presentation Models may depend on

- Application Results
- Canonical presentation models

View Models may depend on

- Presentation Models

No component shall bypass the canonical pipeline.

---

# Immutability

Presentation components shall expose

- readonly properties
- readonly collections
- immutable models

Presentation components shall never expose mutable state.

---

# Supplier Independence

Presentation components shall never expose

- provider models
- HTTP responses
- infrastructure objects
- persistence entities

All provider-specific information shall be transformed before reaching the Presentation Layer.

---

# Relationship to Application Services

Application Services return Application Results.

Presentation components consume Application Results.

Application Services shall never construct View Models.

---

# Relationship to Presentation Layer

The Presentation Layer consumes View Models only.

Controllers, templates and user interface components shall never consume Application Results directly.

---

# Dependency Injection

Presentation Mappers and View Model Providers shall receive collaborators through constructor injection where required.

They shall remain stateless.

---

# Testing

Every Presentation Mapper shall verify

- application result transformation
- immutable presentation model
- compile safety

Every View Model Provider shall verify

- presentation transformation
- UI-specific defaults
- immutable View Models

---

# Naming

Presentation Mappers

```text
JourneyPresentationMapper

ReservationPresentationMapper

AccommodationPresentationMapper
```

Presentation Models

```text
JourneyPresentationModel

ReservationPresentationModel

AccommodationPresentationModel
```

View Model Providers

```text
JourneyViewModelProvider

ReservationViewModelProvider

AccommodationViewModelProvider
```

View Models

```text
HomepageJourneyViewModel

BookingSummaryViewModel

ReservationCardViewModel
```

---

# Canonical Execution Model

The complete Application Layer execution model becomes

```text
Application Request

        │

        ▼

Validation Pipeline

        │

        ▼

Application Service

        │

        ▼

Policy Pipeline

        │

        ▼

Application Result

        │

        ▼

Presentation Mapper

        │

        ▼

Presentation Model

        │

        ▼

View Model Provider

        │

        ▼

View Model

        │

        ▼

Presentation
```

Every Application Capability in GCT Core shall conform to this model.

---

# Adoption

This standard applies to

- Homepage Merchandising
- Accommodation Capability Suite
- Journey Capability Suite
- Reservation Capability Suite
- Pricing Engine
- Booking Engine
- CRM
- Communications
- Partner Portal
- Mobile Applications
- AI Interfaces

---

# Non-Functional Requirements

Presentation shall

- remain immutable
- remain deterministic
- remain highly testable
- remain supplier-independent
- remain presentation-framework independent
- remain reusable

---

# Future Evolution

Future enhancements may include

- localisation
- theming
- accessibility metadata
- device-specific presentation models
- AI presentation models
- channel-specific view model providers

These enhancements shall extend the Presentation Pattern without changing its canonical structure.

---

# Standard Outcome

APP-001E establishes the canonical Presentation Pattern for GCT Core.

By separating Application Results, Presentation Models and View Models into distinct architectural responsibilities, every Application Capability exposes business outcomes consistently while remaining completely independent of user interface technologies.

Together with APP-000, APP-001A, APP-001B, APP-001C and APP-001D, this standard completes the Application Layer Architecture and defines the canonical execution model for all current and future capabilities.