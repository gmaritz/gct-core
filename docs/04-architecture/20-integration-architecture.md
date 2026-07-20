# 20 – Integration Architecture

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document ID:** 20
**Title:** Integration Architecture
**Status:** Approved
**Version:** 1.0

---

# Purpose

The Integration Architecture defines how GCT Core communicates with external systems while protecting the Domain Model from supplier-specific implementations.

It establishes a consistent framework for integrating accommodation providers, payment gateways, communication services, mapping platforms, AI providers, and future third-party systems.

External systems are infrastructure concerns and must never influence business rules or the Domain Model.

---

# Objectives

The Integration Architecture aims to:

* isolate external providers from the Domain Layer
* support multiple suppliers simultaneously
* enable provider replacement with minimal impact
* standardise integration patterns
* improve resilience and observability
* simplify onboarding of future partners

---

# Architectural Position

```text
Domain Model
      │
Application Services
      │
Provider Interfaces
      │
Anti-Corruption Layer (ACL)
      │
Provider Adapter
      │
External API
```

The Domain communicates only through provider abstractions.

---

# Design Principles

The Integration Architecture follows these principles:

* provider independence
* loose coupling
* explicit contracts
* fault isolation
* resilience by design
* observability
* extensibility

No external provider model is permitted inside the Domain Layer.

---

# Integration Categories

The platform supports multiple integration categories:

```text
Accommodation Suppliers

Payment Gateways

Communication Providers

Mapping Services

AI Providers

Identity Providers

Analytics Platforms
```

Each category follows a common integration pattern.

---

# Supplier Integration Platform

Every supplier is represented through a common provider interface.

Example:

```text
AccommodationProvider
```

Possible implementations:

```text
HotelbedsProvider

FutureSupplierProvider

DirectHotelProvider
```

Application Services depend only on the provider interface.

---

# Anti-Corruption Layer (ACL)

Every external provider must be isolated by an Anti-Corruption Layer.

Responsibilities:

* request translation
* response translation
* identifier mapping
* error translation
* provider-specific validation

The ACL prevents supplier concepts from leaking into the Domain Model.

---

# Provider Adapters

Each provider implements a dedicated adapter.

Example structure:

```text
src/infrastructure/suppliers/

hotelbeds/
    hotelbeds.provider.ts
    hotelbeds.mapper.ts
    hotelbeds.client.ts
    hotelbeds.acl.ts

future-supplier/
    provider.ts
    mapper.ts
    client.ts
    acl.ts
```

Adapters encapsulate all provider-specific logic.

---

# Canonical Domain Model

The Domain Model defines the canonical representation of business concepts.

Example:

```text
Accommodation

Room

Rate

Availability

Reservation
```

Provider-specific payloads are transformed into canonical domain objects before reaching the Application Layer.

---

# Provider Mapping

Typical mapping flow:

```text
External Response

↓

ACL

↓

Provider Mapper

↓

Canonical DTO

↓

Application Service
```

No provider JSON is exposed beyond the Infrastructure Layer.

---

# Identifier Mapping

Internal identifiers remain independent of supplier identifiers.

Example:

```text
Internal Accommodation ID

↓

Supplier Mapping Table

↓

Supplier Hotel Code
```

This enables multiple suppliers to represent the same business entity.

---

# Hotelbeds Integration

Hotelbeds is treated as a supplier implementation.

Responsibilities include:

* accommodation search
* availability
* rates
* booking
* content retrieval

Hotelbeds-specific concepts remain confined to the Infrastructure Layer.

---

# Future Supplier Support

Future suppliers should require only:

* provider implementation
* ACL
* mapper
* client
* configuration

No changes should be required within the Domain Model.

---

# Payment Integrations

Payment providers implement a common interface.

Example:

```text
PaymentProvider
```

Possible implementations:

```text
PayFast

Peach Payments

Stripe

Adyen
```

The Domain Model interacts only with the abstraction.

---

# Communication Providers

Communication services implement a common interface.

Example:

```text
CommunicationProvider
```

Possible implementations:

```text
Email

SMS

WhatsApp

Push Notifications
```

Providers remain interchangeable.

---

# Mapping Services

Mapping providers expose common geographic services.

Example:

```text
MappingProvider
```

Possible implementations:

```text
Google Maps

Mapbox

OpenStreetMap
```

Routing and geocoding remain infrastructure concerns.

---

# AI Providers

AI services are accessed through provider abstractions.

Example:

```text
AIProvider
```

Possible implementations:

```text
OpenAI

Azure OpenAI

Anthropic

Google Gemini
```

The Domain never communicates directly with AI providers.

---

# Authentication Providers

Identity providers remain external integrations.

Possible implementations:

```text
Microsoft Entra ID

Google Identity

Auth0

Custom JWT
```

Authentication remains outside the Domain Layer.

---

# Resilience

Every provider should support:

* configurable timeouts
* retries with exponential backoff
* circuit breakers
* rate limiting
* graceful degradation

Failures should be isolated to the affected provider.

---

# Error Translation

Provider errors must be translated into platform exceptions.

Example:

```text
Hotelbeds 404

↓

AccommodationNotFoundException
```

Business logic never interprets provider-specific error codes.

---

# Caching Strategy

Caching may be applied where appropriate.

Examples:

* static accommodation content
* destination metadata
* supplier reference data

Live availability and pricing should not be cached beyond acceptable business tolerances.

---

# Asynchronous Processing

Long-running integrations should utilise asynchronous messaging where appropriate.

Examples:

* confirmation emails
* supplier synchronisation
* itinerary generation
* analytics events

Application Services remain responsive.

---

# Configuration

Provider configuration should include:

* credentials
* endpoints
* timeout values
* retry policies
* feature flags

Configuration must remain externalised.

---

# Security

Provider credentials are never hardcoded.

Secrets should be managed securely.

All provider communication should use encrypted transport.

---

# Observability

Every integration should provide:

* structured logging
* correlation identifiers
* latency metrics
* failure metrics
* retry counts
* provider health status

Operational visibility is essential.

---

# Testing Strategy

Each integration should include:

* unit tests
* contract tests
* provider mocks
* integration tests
* resilience tests

External provider availability should never determine test success.

---

# Anti-Patterns

Avoid:

* exposing supplier models to the Domain Layer
* business logic inside provider adapters
* direct HTTP calls from Application Services
* shared models between providers
* hardcoded provider selection
* provider-specific exceptions outside Infrastructure

---

# Acceptance Criteria

Implementation is compliant when:

* all external systems are accessed through provider interfaces
* every provider is isolated by an Anti-Corruption Layer
* canonical domain models remain provider independent
* provider-specific models remain within Infrastructure
* retries and resilience are consistently applied
* provider errors are translated into platform exceptions
* new providers can be added without modifying the Domain Model

---

# Conclusion

The Integration Architecture establishes GCT Core as an integration platform rather than a collection of supplier-specific implementations. By enforcing provider abstractions, Anti-Corruption Layers, and canonical domain models, the platform remains resilient, extensible, and independent of any individual third-party provider, ensuring long-term scalability as new partners and services are introduced.
