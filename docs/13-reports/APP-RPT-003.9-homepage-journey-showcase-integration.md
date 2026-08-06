# APP-RPT-003.9
# Application Implementation Report
## Homepage Journey Showcase Integration

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Document | APP-RPT-003.9 |
| Title | Homepage Journey Showcase Integration |
| Status | Completed |
| Version | 1.0 |
| Date | 2026-08-06 |
| Related Specification | APP-003.9 |

---

# Implementation Summary

APP-003.9 has been implemented.

Homepage merchandising now integrates the completed journey composition capability through a dedicated homepage journey showcase service. Featured journey cards flow through the canonical journey composition, presentation mapping, and homepage journey view-model pipeline before being adapted into the existing homepage showcase frontend contract. Editorial content remains sourced from homepage merchandising, while featured journey card orchestration is isolated in the new showcase service.

---

# Delivered Scope

Implemented deliverables:

- Homepage journey showcase service
- Homepage journey showcase result contract
- Homepage provider integration with the journey presentation pipeline
- Homepage showcase regression tests
- Application-layer barrel exports

Out-of-scope items were not implemented:

- Journey composition business logic changes
- Provider integrations
- Controller changes
- EJS template changes
- Pricing logic
- Reservation logic

---

# Files Added

- src/application/merchandising/homepage/showcase/homepage-journey-showcase-service.ts
- src/application/merchandising/homepage/showcase/homepage-journey-showcase-result.ts
- src/application/merchandising/homepage/showcase/homepage-journey-showcase.test.ts
- src/application/merchandising/homepage/showcase/index.ts
- docs/13-reports/APP-RPT-003.9-homepage-journey-showcase-integration.md

# Files Updated

- src/application/merchandising/homepage/index.ts
- src/interfaces/view-models/providers/homepage-showcase.viewmodel-provider.ts
- tests/unit/interfaces/view-models/homepage-showcase.viewmodel-provider.test.ts
- tests/integration/frontend/placeholder.test.ts
- src/application/journeys/composition/accommodation/accommodation-composition-adapter.ts
- src/application/journeys/composition/accommodation/accommodation-composition-context.ts
- src/application/journeys/composition/accommodation/accommodation-composition-result.ts
- src/application/journeys/composition/experiences/framework/experience-composition-framework.ts
- src/application/journeys/composition/experiences/models/experience-composition-context.ts
- src/application/journeys/composition/factory/journey-factory.ts
- src/application/journeys/composition/models/journey-composition-context.ts
- src/application/journeys/composition/models/journey-composition-result.ts
- src/application/journeys/composition/service/journey-composition-service.ts
- src/application/journeys/presentation/mapper/journey-presentation-mapper.ts

---

# Design Notes

- `HomepageJourneyShowcaseService` coordinates featured journey retrieval through:
  - `JourneyCompositionService`
  - `JourneyPresentationMapper`
  - `JourneyViewModelProvider`
- The existing homepage showcase provider now combines:
  - editorial and metadata from `HomepageMerchandisingService`
  - journey cards from `HomepageJourneyShowcaseService`
- Frontend presentation contract stability is preserved by adapting canonical `HomepageJourneyViewModel` objects into the existing `JourneyCardViewModel` structure.
- Runtime import paths in newly added application-layer modules were normalized to relative imports so `npm start` works under plain Node without alias resolution.
- The homepage placeholder integration test was updated to assert the new canonical featured journey output rather than the retired static placeholder journey titles/prices.

---

# Verification Evidence

## Focused Homepage Showcase + Journey Presentation Tests

Command:

- npm test -- --runInBand src/application/merchandising/homepage/showcase/homepage-journey-showcase.test.ts src/application/journeys/presentation/journey-view-model-provider.test.ts src/application/journeys/composition/journey-composition.test.ts tests/unit/interfaces/view-models/homepage-showcase.viewmodel-provider.test.ts

Result:

- Passed (4 suites, 16 tests)

## Production Build

Command:

- npm run build

Result:

- Passed

## Full Regression Suite

Command:

- npm test -- --runInBand

Result:

- Passed (34 suites, 160 tests)

## Startup Smoke Verification

Command:

- npm start
- Invoke-WebRequest -Uri http://localhost:3000/health -UseBasicParsing

Result:

- /health returned status UP
