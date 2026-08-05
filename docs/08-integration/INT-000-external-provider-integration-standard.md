# INT-000
# External Provider Integration Standard

---

# Document Information

| Item | Value |
|------|-------|
| Project | GCT Core |
| Document | INT-000 |
| Title | External Provider Integration Standard |
| Status | Approved |
| Version | 1.0 |
| Owner | Platform Architecture |
| Applies To | All External Provider Integrations |

---

# Purpose

This document defines the architectural standards governing all external provider integrations within GCT Core.

Its purpose is to ensure that third-party services integrate consistently, safely and independently of the core business architecture.

External providers are implementation details.

They shall never dictate the structure of GCT Core.

---

# Architectural Philosophy

The platform owns the business model.

External providers supply information.

External providers never define:

- Business Models
- Application Models
- Domain Models
- View Models
- UI Components

Every provider integrates into the platform—not the other way around.

---

# Integration Principles

Every provider integration shall:

- Be replaceable.
- Be independently testable.
- Be supplier independent.
- Be capability driven.
- Use canonical models.
- Use application result contracts.
- Remain isolated behind adapters.

---

# Integration Architecture

Every external integration shall follow this pattern.

```text
Provider API

↓

Provider Models

↓

Mapper

↓

Canonical Application Models

↓

Application Results

↓

Application Services
```

Presentation layers shall never consume provider models.

---

# Provider Adapter Pattern

Every provider shall implement an adapter.

Example

```text
AccommodationProvider

↓

HotelbedsProviderAdapter

↓

Hotelbeds API
```

No application service shall communicate directly with supplier SDKs or APIs.

---

# Provider Models

Provider models represent the external provider exactly as documented.

Provider models shall:

- Preserve provider naming.
- Preserve provider data structures.
- Never contain business logic.

They are disposable implementation models.

---

# Canonical Mapping

Every provider model shall be mapped into a canonical application model.

Mappings shall be explicit.

Mappings shall be one-directional.

No canonical model shall depend on provider models.

---

# Application Services

Application Services communicate only with:

- Canonical Models
- Application Results
- Provider Adapters

They shall never consume raw provider payloads.

---

# Error Handling

Provider failures shall be isolated.

Integration layers shall:

- Handle provider exceptions.
- Translate errors into application results.
- Prevent provider-specific exceptions from escaping.

The platform shall remain resilient to supplier failures.

---

# Authentication

Authentication shall remain within provider adapters.

Credentials shall:

- Never appear in application services.
- Never appear in presentation layers.
- Be sourced from secure configuration.

---

# Versioning

Provider API versions shall be isolated within adapters.

Upgrading a provider API shall not require changes to:

- Canonical Models
- Application Services
- View Models
- Components

---

# Retry and Resilience

Provider adapters should support:

- Retry policies
- Timeouts
- Circuit breakers (future)
- Graceful degradation

These mechanisms shall remain inside the integration layer.

---

# Logging

Integration layers shall log:

- Provider requests
- Provider responses (where appropriate)
- Retry attempts
- Failures
- Latency

Sensitive information shall never be logged.

---

# Testing Standards

Every provider integration shall include:

- Unit tests
- Mapper tests
- Mock provider tests
- Contract tests
- Integration tests

External provider availability shall never be required for unit testing.

---

# Current Reference Implementation

The Accommodation Engine is the reference integration capability.

Future providers shall follow:

```text
Provider Models

↓

Mapper

↓

Provider Adapter

↓

Accommodation Engine

↓

Application Results
```

---

# Governance

Every new provider integration shall:

- Comply with INT-000
- Comply with APP-000
- Use canonical models
- Use typed application results
- Implement provider adapters
- Avoid provider leakage into business logic

Architectural review is required before introducing a new provider.

---

# Future Standards

INT-000 forms the basis for:

- INT-001 Hotelbeds Integration Standard
- INT-002 Payment Gateway Integration Standard
- INT-003 CRM Integration Standard
- INT-004 Email Provider Integration Standard
- INT-005 Mapping & Transformation Standard
- INT-006 Retry & Resilience Standard
- INT-007 API Credential Management Standard
- INT-008 Integration Testing Standard

---

# Revision History

| Version | Date | Notes |
|----------|------|-------|
| 1.0 | Initial Release | Established before the first external provider implementation (Hotelbeds). |