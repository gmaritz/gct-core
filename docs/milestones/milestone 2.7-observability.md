# Milestone 2.7 – Observability

## Objective

Implement the foundational observability infrastructure for GCT Core.

This milestone establishes:

- Platform metadata
- Structured logging
- Correlation ID propagation
- Request timing
- Startup information
- Operational diagnostics

No business functionality shall be implemented.

---

# Existing Architecture

Continue using the approved project structure.

Do NOT reorganise folders.

Do NOT introduce dependency injection.

Do NOT introduce external observability platforms.

Do NOT implement OpenTelemetry.

Do NOT implement Prometheus metrics.

---

# Scope

Implement ONLY:

- Platform information service
- Structured logging enhancements
- Request correlation
- Request timing
- Startup metadata
- Readiness diagnostics

Do NOT implement:

- Business metrics
- Distributed tracing
- Log aggregation
- External monitoring integrations

---

# Recommended Structure

Introduce:

src/application/platform/

    platform-info.service.ts

src/shared/

    metadata/
        platform.metadata.ts

Extend existing logging implementation where appropriate.

---

# Platform Metadata

Create a reusable metadata module.

Suggested properties:

- SERVICE_NAME
- PLATFORM_NAME
- VERSION
- BUILD
- NODE_ENV
- START_TIME

This becomes the canonical platform identity.

Do not duplicate these values elsewhere.

---

# Platform Information Service

Implement a lightweight service responsible for exposing platform metadata.

Suggested methods:

getPlatformInfo()

getVersionInfo()

getStartupInfo()

getUptime()

Future endpoints should consume this service instead of constructing responses manually.

---

# Structured Logging

Enhance the existing logger.

Each log entry should consistently include:

- timestamp
- level
- service
- requestId (when available)
- message

Retain the existing logger abstraction.

Do not introduce Winston or Pino.

---

# Correlation ID

Continue using the existing X-Request-Id.

Ensure it propagates consistently through request logging.

Prepare the logger so future services can log with request context.

Do not implement AsyncLocalStorage during this milestone.

---

# Request Timing

Extend request logging.

Log:

- HTTP method
- URL
- Status
- Duration (ms)
- Request ID

Use high-resolution timing where practical.

---

# Startup Information

Enhance application startup output.

Include:

Service name

Platform version

Environment

Node version

Port

Startup timestamp

Startup duration

The objective is operational visibility.

---

# Readiness Diagnostics

Extend the existing readiness implementation.

Include lightweight diagnostic information.

Example:

{
    "status": "READY",
    "database": "CONNECTED",
    "uptimeSeconds": 123,
    "timestamp": "..."
}

Do not perform additional database queries.

Use existing lifecycle state only.

---

# Existing Endpoints

Do NOT change endpoint URLs.

Maintain existing response contracts wherever practical.

Only enrich responses with operational metadata where appropriate.

---

# Validation

The following shall succeed:

npm run build

npm run dev

Verify:

✓ Existing endpoints remain functional.

✓ Startup logs include platform metadata.

✓ Request logs include timing.

✓ Correlation IDs continue functioning.

✓ Readiness endpoint reports diagnostic information.

✓ No middleware regressions.

---

# Deliverables

Return:

- files created
- files modified
- observability summary
- logging enhancements
- validation results

Do not implement future milestones.

Keep this commit strictly limited to foundational observability.