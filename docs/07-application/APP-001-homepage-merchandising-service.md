# APP-001
# Application Service Specification
## Homepage Merchandising Service

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Document | APP-001 |
| Title | Homepage Merchandising Service |
| Status | Approved |
| Version | 1.0 |
| Owner | Application Architecture |
| Depends On | IMP-002.5 Homepage Merchandising Model & View Model Library |
| Next | BRAND-001 Editorial Voice & Content Guidelines |

---

# Purpose

The Homepage Merchandising Service is responsible for selecting, ranking and preparing the journeys displayed within the Homepage Showcase.

It acts as the orchestration layer between business capabilities and the presentation layer.

The Homepage Merchandising Service does **not** render HTML.

It does **not** contain presentation logic.

It supplies business objects to the Homepage Showcase View Model Provider.

---

# Architectural Principle

The Homepage Merchandising Service answers one business question:

> **Which curated journeys should appear on the homepage today?**

It is the only application service responsible for homepage journey selection.

---

# Responsibilities

The Homepage Merchandising Service shall:

- Select curated journeys.
- Apply merchandising rules.
- Apply campaign priorities.
- Apply seasonal priorities.
- Prepare homepage merchandising results.
- Expose a presentation-neutral merchandising result.

The service shall **not**:

- Render View Models.
- Generate HTML.
- Perform server-side rendering.
- Query supplier APIs directly.
- Calculate accommodation pricing.
- Render UI components.

---

# Position within the Architecture

```
Hotelbeds

        │

Accommodation Engine

        │

Package Builder

        │

Homepage Merchandising Service

        │

Homepage Showcase View Model Provider

        │

HomepageShowcaseViewModel

        │

Homepage Showcase
```

The Homepage Showcase never communicates directly with Hotelbeds.

---

# Inputs

Future inputs may include:

- Curated Journey Catalogue
- Accommodation Engine
- Package Builder
- Seasonal Campaigns
- Business Policies
- Supplier Availability
- Marketing Campaigns
- Editorial Priorities

The Homepage Merchandising Service remains independent of the presentation layer.

---

# Outputs

The service shall return a presentation-neutral merchandising result.

Example

```typescript
interface HomepageMerchandisingResult {

    editorial: EditorialContent;

    journeys: JourneySelection[];

    metadata: MerchandisingMetadata;

}
```

The Homepage Showcase View Model Provider transforms this result into frontend View Models.

---

# Journey Selection

Each selected journey shall represent a curated Go Cape Tours experience.

The service shall never expose raw supplier inventory.

Journey selection shall remain independent of Hotelbeds.

---

# Initial Implementation

During the initial implementation the service shall:

- Return static curated journeys.
- Return placeholder editorial content.
- Return placeholder metadata.

No supplier integrations shall be introduced.

The public contract shall remain stable.

---

# Future Responsibilities

Future releases may include:

- Seasonal campaigns
- Destination campaigns
- Luxury collections
- Wine collections
- Limited availability campaigns
- Geographic targeting
- Returning visitor personalisation
- Language-specific merchandising
- AI-assisted journey ranking

None of these enhancements shall require changes to the Homepage Showcase.

---

# Business Rules

Business rules belong outside the presentation layer.

Examples include:

- Maximum three homepage journeys.
- One primary journey.
- Two supporting journeys.
- Campaign overrides.
- Seasonal priorities.
- Editorial priorities.
- Journey eligibility.
- Promotional windows.

These rules shall be encapsulated within the Homepage Merchandising Service.

---

# Service Contract

Suggested interface

```typescript
interface HomepageMerchandisingService {

    getHomepageMerchandising():

        Promise<HomepageMerchandisingResult>;

}
```

The service exposes one clear responsibility.

---

# View Model Relationship

The Homepage Merchandising Service returns business objects.

The Homepage Showcase View Model Provider transforms those business objects into:

- HomepageShowcaseViewModel
- JourneyCardViewModel
- EditorialPanelViewModel
- Shared View Models

Presentation remains isolated from business orchestration.

---

# Error Handling

If merchandising data cannot be generated:

- Return a safe fallback merchandising result.
- Preserve Homepage Showcase rendering.
- Never expose internal errors to the presentation layer.

The homepage should always remain functional.

---

# Performance

Requirements

- Stateless implementation
- Lightweight orchestration
- No presentation rendering
- Suitable for server-side rendering
- Easily cacheable
- Deterministic output for identical inputs

---

# Testing

Unit tests shall verify:

- Journey selection
- Campaign prioritisation
- Metadata generation
- Fallback behaviour
- Stable service contract

No presentation tests belong to this service.

---

# Deliverables

```
src/

application/

services/

    homepage/

        homepage-merchandising.service.ts

        homepage-merchandising-result.ts

        homepage-merchandising.service.test.ts
```

---

# Verification

Execute

- Unit tests
- Integration tests
- Production build
- Startup smoke verification

Produce

```
APP-RPT-001-homepage-merchandising-service.md
```

---

# Future Evolution

Future implementations may source data from:

- Accommodation Engine
- Package Builder
- Campaign Engine
- Business Rules Engine
- Hotelbeds
- Additional accommodation suppliers

The Homepage Merchandising Service contract shall remain stable.

---

# Milestone Outcome

Upon successful completion, GCT Core shall expose a dedicated Homepage Merchandising Service responsible for selecting and preparing curated journeys for the Homepage Showcase.

The service establishes a permanent separation between business orchestration and presentation, ensuring that supplier integrations, campaign management and future merchandising enhancements can evolve independently of the frontend.

It becomes the single source of truth for all homepage merchandising decisions.