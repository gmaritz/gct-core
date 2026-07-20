# 22 – AI Services Architecture

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document ID:** 22
**Title:** AI Services Architecture
**Status:** Approved
**Version:** 1.0

---

# Purpose

The AI Services Architecture defines how Artificial Intelligence capabilities are incorporated into GCT Core while preserving Domain-Driven Design, Clean Architecture, and provider independence.

AI services enhance business capabilities but never replace business rules.

The Domain Model remains the authoritative source of business behaviour.

---

# Objectives

The AI Services Architecture aims to:

* provide AI-powered business capabilities
* isolate AI providers from the Domain Model
* support multiple AI providers
* enable intelligent recommendations
* improve operational efficiency
* ensure responsible AI usage
* maintain auditability and observability

---

# Architectural Position

```text
Domain Model
      │
Application Services
      │
AI Service Interface
      │
AI Orchestrator
      │
Provider Adapter
      │
AI Provider
```

Application Services communicate only with AI abstractions.

---

# Design Principles

The AI Architecture follows these principles:

* provider independence
* business-first
* deterministic workflows
* explainability
* auditability
* security by design
* human oversight

AI augments business decisions but does not define them.

---

# AI Responsibilities

AI services may assist with:

* itinerary generation
* tour recommendations
* accommodation recommendations
* content generation
* traveller assistance
* supplier summarisation
* operational insights
* conversational assistance

Business rules remain within Aggregate Roots.

---

# AI Service Categories

The platform supports:

```text
Recommendation Services

Planning Services

Conversational Services

Content Services

Knowledge Services

Operational Intelligence

Analytics Assistance
```

Each category exposes stable interfaces.

---

# AI Orchestrator

The AI Orchestrator coordinates:

* provider selection
* prompt assembly
* context retrieval
* response validation
* fallback handling
* telemetry

Application Services never communicate directly with AI providers.

---

# Provider Independence

Supported implementations may include:

```text
OpenAI

Azure OpenAI

Anthropic

Google Gemini

Future Providers
```

Switching providers should not require changes to the Domain Layer.

---

# Prompt Management

Prompts are application assets.

They should be:

* version controlled
* reusable
* testable
* externally configurable

Prompts should never be embedded directly inside business logic.

---

# Context Assembly

AI requests should be constructed using trusted business data.

Typical context sources:

* traveller profile
* reservation
* itinerary
* supplier availability
* operational constraints
* destination knowledge

Only relevant context should be supplied.

---

# Canonical AI Context

AI receives canonical platform models rather than provider-specific payloads.

Example:

```text
Traveller Profile

Journey

Accommodation Options

Experience Catalogue

Reservation Summary
```

The AI layer remains independent of Infrastructure models.

---

# AI Recommendations

Recommendations may include:

* wine estates
* accommodation options
* restaurants
* attractions
* transport suggestions
* tour sequencing

Recommendations remain advisory.

Application Services decide whether to accept AI output.

---

# Itinerary Generation

AI may generate draft itineraries using:

* traveller preferences
* accommodation
* travel dates
* operational constraints
* destination knowledge

Generated itineraries require validation before becoming reservations.

---

# Conversational Services

AI may support:

* traveller enquiries
* booking assistance
* FAQ responses
* destination guidance
* itinerary explanations

Conversations should remain separate from business transactions.

---

# Content Generation

AI may assist with:

* tour descriptions
* destination summaries
* marketing content
* email drafts
* itinerary explanations

Generated content should support editorial review where appropriate.

---

# Supplier Intelligence

AI may summarise supplier information.

Examples:

* hotel descriptions
* accommodation comparisons
* traveller reviews
* supplier documentation

Supplier data remains governed by platform policies.

---

# Operational Intelligence

AI may assist operations by identifying:

* scheduling conflicts
* optimisation opportunities
* workload balancing
* operational anomalies

Final operational decisions remain deterministic.

---

# Explainability

Where AI influences customer-facing experiences, responses should be explainable.

Examples:

* recommendation rationale
* itinerary reasoning
* ranking criteria

Opaque AI decisions should be avoided.

---

# Guardrails

AI responses should be validated for:

* completeness
* relevance
* prohibited content
* unsupported claims
* policy compliance

Unsafe responses must never reach customers unfiltered.

---

# Human Oversight

Certain workflows require manual approval.

Examples:

* published itineraries
* supplier communications
* refund recommendations
* operational changes

Human review remains configurable.

---

# Privacy

AI requests should minimise personal information.

Sensitive traveller data should be excluded unless required for the task.

Data sharing must comply with applicable privacy regulations.

---

# Security

AI provider credentials remain within Infrastructure.

AI providers must never receive secrets unrelated to the requested task.

Prompt injection and malicious input should be mitigated through validation and contextual isolation.

---

# Observability

AI interactions should capture:

* provider
* model
* request identifier
* latency
* token usage
* response status
* validation outcome

Sensitive prompt content should be logged only where appropriate and in accordance with privacy requirements.

---

# Resilience

AI services should support:

* configurable timeouts
* retries
* fallback providers
* graceful degradation
* circuit breakers

Platform functionality should continue if AI services are unavailable.

---

# Cost Management

The platform should monitor:

* token consumption
* provider costs
* request frequency
* usage trends

Cost controls should be configurable.

---

# Knowledge Sources

AI may utilise:

* internal knowledge bases
* curated destination content
* supplier metadata
* operational data

Knowledge sources should be governed and versioned.

---

# Model Governance

Supported models should be configurable.

Selection criteria may include:

* capability
* latency
* cost
* regulatory requirements

Models should be replaceable without affecting business logic.

---

# Testing Strategy

AI testing should include:

* prompt regression tests
* response validation tests
* provider failover tests
* guardrail verification
* deterministic workflow tests

Business behaviour should never depend solely on AI output.

---

# Anti-Patterns

Avoid:

* embedding prompts in business logic
* AI decisions replacing business rules
* direct provider calls from Application Services
* provider-specific models outside Infrastructure
* exposing raw AI responses to customers
* relying on AI for deterministic business validation

---

# Acceptance Criteria

Implementation is compliant when:

* AI providers remain behind platform abstractions
* Application Services communicate only with AI interfaces
* prompts are version controlled
* AI output is validated before use
* business rules remain within the Domain Layer
* provider changes require no Domain modifications
* AI interactions are observable and auditable
* human oversight is supported where required

---

# Conclusion

The AI Services Architecture establishes Artificial Intelligence as a governed platform capability rather than a direct dependency. By introducing an AI Orchestrator, provider abstractions, validation guardrails, and canonical business context, GCT Core can safely adopt evolving AI technologies while preserving the integrity of its Domain Model, ensuring that AI enhances business capabilities without becoming the source of business truth.
