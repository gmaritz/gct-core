# Milestone 2.10 – OpenAPI Foundation

## Objective

Introduce a canonical OpenAPI 3.1 foundation for GCT Core.

This milestone establishes:

- OpenAPI infrastructure
- Swagger UI (development only)
- Platform API documentation
- Canonical API metadata
- Reusable component definitions

No business endpoints shall be introduced.

No runtime behaviour shall change.

---

# Existing Architecture

Continue using the approved project structure.

Do NOT reorganise existing layers.

Do NOT modify business logic.

Use the existing routing hierarchy.

---

# Scope

Implement ONLY:

- OpenAPI 3.1 configuration
- Swagger UI
- Platform metadata
- API information
- Common schemas
- Error schemas
- Health endpoint documentation
- Readiness endpoint documentation
- Version endpoint documentation

Do NOT document future business APIs.

Do NOT introduce authentication.

Do NOT introduce code generation.

Do NOT introduce client SDK generation.

---

# Recommended Structure

Introduce:

src/interfaces/http/openapi/

    openapi.ts
    info.ts
    tags.ts
    servers.ts

    schemas/
        problem-details.schema.ts
        api-response.schema.ts

    paths/
        platform.paths.ts

    index.ts

---

# Swagger

Expose Swagger UI in development only.

Recommended endpoint:

/docs

The endpoint shall not be enabled in production.

---

# OpenAPI Information

Document:

Title

Version

Description

Contact

License

Servers

Tags

Use PlatformInfoService as the source of platform metadata where practical.

Avoid duplicated metadata.

---

# Platform Tags

Create initial tags.

Platform

Health

System

These become the foundation for future business tags.

---

# Common Schemas

Define reusable schemas for:

Problem Details

ApiResponse

PagedResponse

Future APIs should reuse these components.

---

# Platform Paths

Document ONLY:

GET /

GET /health

GET /live

GET /ready

GET /version

GET /api/v1

Use reusable components wherever practical.

---

# Error Responses

Document RFC 9457 Problem Details.

Reference the reusable schema.

Do not duplicate error definitions.

---

# Validation

Verify:

npm run build

npm test

npm run dev

Verify:

✓ Swagger UI loads.

✓ Existing endpoints unchanged.

✓ OpenAPI document generated.

✓ Platform endpoints documented.

✓ Problem Details reusable component present.

✓ No runtime regressions.

---

# Deliverables

Return:

- files created
- files modified
- OpenAPI architecture summary
- documented endpoints
- validation results

Keep this milestone strictly limited to the OpenAPI foundation.

Do not document future business APIs.