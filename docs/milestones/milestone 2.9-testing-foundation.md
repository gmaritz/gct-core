# Milestone 2.9 – Testing Foundation

## Objective

Implement the canonical testing foundation for GCT Core.

This milestone establishes:

- test architecture
- shared test utilities
- HTTP integration test framework
- platform regression tests
- error middleware tests

No business functionality shall be implemented.

No production behaviour shall change.

---

# Existing Architecture

Continue using the approved project structure.

Do NOT reorganise application layers.

Do NOT modify runtime behaviour.

Use the existing test framework already configured in the project.

---

# Scope

Implement ONLY:

- test folder structure
- shared test helpers
- HTTP application bootstrap for tests
- platform endpoint integration tests
- error middleware integration tests
- configuration service tests (expand existing coverage)

Do NOT implement:

- business tests
- repository tests
- Prisma integration tests
- supplier integration tests
- performance tests
- end-to-end browser tests

---

# Recommended Structure

Introduce:

tests/

    integration/
        platform/
            health.test.ts
            readiness.test.ts
            version.test.ts
            routing.test.ts
            errors.test.ts

    helpers/
        application.helper.ts
        request.helper.ts

    fixtures/

        index.ts

The existing src tests may remain where appropriate.

New platform integration tests should live under /tests.

---

# Application Helper

Implement a reusable helper that boots the application for integration testing.

Responsibilities:

- initialise Express
- avoid opening a real HTTP listener
- expose the application instance
- support future authenticated requests

Future integration tests should reuse this helper.

---

# Request Helper

Implement common request helpers.

Examples:

GET

POST

PUT

DELETE

Default headers

Request ID generation

JSON assertions

Avoid duplicated request boilerplate.

---

# Platform Endpoint Tests

Create integration tests for:

GET /

GET /health

GET /live

GET /ready

GET /version

GET /api/v1

Verify:

Status code

Response structure

Content type

---

# Error Tests

Verify:

404 returns Problem Details

ApiError returns Problem Details

Unknown errors become HTTP 500

Content-Type:

application/problem+json

Verify stack traces are never exposed.

---

# Configuration Tests

Expand existing configuration coverage.

Verify:

grouped configuration

default values

validation

service access

Do not duplicate tests unnecessarily.

---

# Testing Principles

Tests should verify behaviour rather than implementation.

Prefer:

response.status

response.body

response.headers

Avoid:

private methods

internal implementation

class internals

---

# Validation

The following shall succeed:

npm test

npm run build

npm run dev

Verify:

✓ All platform endpoint tests pass.

✓ Error middleware tests pass.

✓ Existing functionality unchanged.

✓ No runtime regressions.

---

# Deliverables

Return:

- files created
- files modified
- testing architecture summary
- tests implemented
- validation results

Do not implement future milestones.

Keep this commit strictly limited to the testing foundation.