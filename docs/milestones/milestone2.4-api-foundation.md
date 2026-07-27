# Milestone 2.4 – API Foundation

## Objective

Establish the foundational API structure for GCT Core.

This milestone introduces:

- Platform endpoints
- API versioning
- API router structure

No business capabilities shall be implemented.

---

# Existing Architecture

Continue using the approved project structure.

Do NOT reorganise folders.

Do NOT introduce new architectural layers.

Do NOT implement dependency injection.

---

# Scope

Implement ONLY:

- Platform endpoints
- API versioning
- API router registration

Do NOT implement:

- Business controllers
- Authentication
- Validation
- Swagger/OpenAPI
- Feature modules
- Repository access
- Database queries (except existing Prisma connection lifecycle)

---

# Router Structure

Introduce Express routers to prepare for future bounded contexts.

Recommended structure:

src/interfaces/http/

    routes/
        index.ts
        platform.routes.ts
        api.routes.ts
        v1.routes.ts

This becomes the permanent routing hierarchy.

---

# Route Registration

Register routes in the following hierarchy:

/

↓

Platform Routes

↓

/api

↓

/api/v1

No business routes are registered under /api/v1 during this milestone.

---

# Platform Endpoints

Implement:

GET /

Returns basic platform information.

Example response:

{
  "service": "gct-core",
  "name": "Go Cape Tours Core Platform",
  "version": "1.0.0",
  "environment": "development"
}

---

GET /version

Returns:

{
  "service": "gct-core",
  "version": "1.0.0",
  "environment": "development",
  "build": "development",
  "timestamp": "<ISO-8601>"
}

---

GET /live

Purpose:

Liveness probe.

Response:

HTTP 200

{
  "status": "UP"
}

No dependency checks.

---

GET /ready

Purpose:

Readiness probe.

Verify:

- Prisma client has successfully initialized.

If ready:

HTTP 200

{
  "status": "READY"
}

If not ready:

HTTP 503

{
  "status": "NOT_READY"
}

---

GET /health

Keep existing endpoint.

Refactor into the platform router.

Do not change its response contract.

---

# API Versioning

Introduce:

/api

/api/v1

The v1 router should return:

HTTP 200

{
  "message": "GCT Core API v1"
}

This is a placeholder only.

No business routes shall exist yet.

---

# Express Bootstrap

Update express.ts to register routers instead of inline endpoints.

The Express bootstrap should now only configure middleware and register routers.

---

# Validation

The following shall succeed:

npm run build

npm run dev

Verify:

✓ GET /

✓ GET /health

✓ GET /live

✓ GET /ready

✓ GET /version

✓ GET /api/v1

✓ Unknown routes still return JSON 404

✓ Existing middleware continues functioning

---

# Deliverables

Return:

- files created
- files modified
- routing hierarchy
- endpoint summary
- validation results

Do not implement future milestones.

Keep this commit strictly limited to API Foundation.