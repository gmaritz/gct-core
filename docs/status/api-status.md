# GCT Core API Status

---

## Document Information

| Property | Value |
|----------|-------|
| Document | API-STATUS.md |
| API Version | v1 |
| OpenAPI Version | 3.1 |
| Status | Current |
| Last Updated | 30 July 2026 |

---

# API Overview

The GCT Core API is the canonical public contract of the platform.

All public endpoints are:

- Implemented
- Integration Tested
- Documented using OpenAPI
- Versioned

The API follows:

- REST principles
- JSON payloads
- RFC 9457 Problem Details
- OpenAPI 3.1

---

# Current API Version

Version:

**v1**

Status:

**Platform API Complete**

---

# OpenAPI

| Item | Status |
|------|--------|
| OpenAPI Version | 3.1 |
| Specification | ✅ |
| Swagger UI | ✅ (Development Only) |
| Component Schemas | ✅ |
| Platform Tags | ✅ |

---

# Development Endpoints

| Endpoint | Availability |
|-----------|-------------|
| /docs | Development Only |
| /openapi.json | Development Only |

---

# Platform Endpoints

| Endpoint | Status |
|-----------|--------|
| GET / | ✅ |
| GET /health | ✅ |
| GET /live | ✅ |
| GET /ready | ✅ |
| GET /version | ✅ |
| GET /api/v1 | ✅ |

---

# Common Components

Reusable OpenAPI components currently include:

- ApiResponse
- PagedResponse
- ProblemDetails

Future business APIs shall reuse these components.

---

# Error Contract

All API errors conform to:

**RFC 9457 — Problem Details for HTTP APIs**

Implemented standard responses:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error

---

# API Design Standards

Every endpoint must satisfy the following:

- Implemented
- OpenAPI documented
- Integration tested
- Uses standard response models
- Uses Problem Details for errors

---

# Current Tags

| Tag | Status |
|-----|--------|
| Platform | ✅ |
| Health | ✅ |
| System | ✅ |

---

# Planned Business API Tags

The following API areas will be introduced during Phase 4:

- Catalogue
- Experiences
- Tours
- Packages
- Accommodation
- Reservations
- Bookings
- Pricing
- Availability
- Suppliers
- Customers
- Communications

---

# Planned API Roadmap

| Milestone | Status |
|-----------|--------|
| Platform API | ✅ |
| Catalogue API | ⏳ |
| Supplier API | ⏳ |
| Availability API | ⏳ |
| Pricing API | ⏳ |
| Reservation API | ⏳ |
| Booking API | ⏳ |
| Customer API | ⏳ |

---

# API Quality Gates

Every public endpoint must have:

- OpenAPI documentation
- Integration tests
- Standard API responses
- RFC 9457 error responses
- Structured logging
- Request correlation

No endpoint is considered complete until all quality gates have passed.

---

# API Lifecycle

```
OpenAPI Contract
        ↓
Architecture Review
        ↓
Implementation
        ↓
Integration Testing
        ↓
Approval
```

---

# Current API Metrics

| Metric | Status |
|--------|--------|
| OpenAPI | Complete |
| Swagger UI | Complete |
| Platform Endpoints | 6 |
| Business Endpoints | 0 |
| Integration Tested | Yes |
| Versioned | Yes |

---

# Version History

| Version | Date | Notes |
|---------|------|------|
| API v1 | 30 July 2026 | Platform API Foundation Complete |