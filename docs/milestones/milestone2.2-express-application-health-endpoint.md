# Milestone 2.2 – Express Application & Health Endpoint

## Objective

Implement the HTTP hosting layer for GCT Core.

This milestone introduces the Express application and a single health endpoint.

No business functionality shall be implemented.

---

# Existing Architecture

Continue using the existing project structure.

Do NOT reorganise folders.

Do NOT introduce additional architectural layers.

---

# Scope

Implement ONLY:

- Express application
- HTTP server startup
- Health endpoint
- 404 handler

Do NOT implement:

- Authentication
- Authorization
- Controllers
- Business routes
- Feature modules
- Swagger/OpenAPI
- Validation libraries
- Dependency Injection
- Repository implementations

---

# bootstrap/express.ts

Implement the Express application bootstrap.

Responsibilities:

- create Express application
- configure JSON middleware
- register health endpoint
- register 404 handler

Do not register any feature routes.

Do not start the HTTP server here.

Return the configured Express application.

---

# bootstrap/application.ts

Extend the bootstrap sequence.

Current sequence:

1. Configuration
2. Logger
3. Prisma
4. Lifecycle

Extend with:

5. Create Express application
6. Start HTTP server
7. Report listening address

Do not move existing responsibilities.

---

# Health Endpoint

Register:

GET /health

Response:

```json
{
  "status": "UP",
  "service": "gct-core",
  "environment": "development",
  "version": "1.0.0",
  "timestamp": "<ISO-8601>"
}
```

Status code:

200 OK

No database query is required.

This endpoint simply confirms the platform is running.

---

# 404 Handler

Implement a default handler.

Return:

Status:

404

Body:

```json
{
  "status": 404,
  "error": "Not Found"
}
```

No HTML pages.

---

# Startup Output

Successful startup should resemble:

==================================================

Go Cape Tours Core Platform

Environment : Development

✓ Configuration Loaded

✓ Logger Initialised

✓ Prisma Connected

✓ Lifecycle Registered

✓ Express Configured

✓ HTTP Server Listening

Platform Ready

Listening:

http://localhost:3000

==================================================

Exact wording is not important.

---

# Validation

The following command shall succeed:

```bash
npm run dev
```

Validation checklist:

✓ Platform starts

✓ Prisma connects

✓ HTTP server listens on configured port

✓ GET /health returns HTTP 200

✓ Unknown routes return HTTP 404

✓ Ctrl+C performs graceful shutdown

---

# Deliverables

Return:

- files modified
- startup sequence
- endpoint summary
- validation results

Do not implement future milestones.

Keep this commit strictly limited to Express hosting and platform health.