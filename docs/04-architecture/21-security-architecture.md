# 21 – Security Architecture

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document ID:** 21
**Title:** Security Architecture
**Status:** Approved
**Version:** 1.0

---

# Purpose

The Security Architecture defines the principles, components, and controls used to protect GCT Core against unauthorized access, data breaches, operational misuse, and infrastructure threats.

Security is a cross-cutting concern that spans every architectural layer while remaining independent of business logic.

---

# Objectives

The Security Architecture aims to:

* protect business data
* authenticate users and systems
* authorize business operations
* secure external integrations
* protect sensitive information
* provide complete auditability
* support regulatory compliance

---

# Security Principles

The platform follows these principles:

* Least Privilege
* Defence in Depth
* Zero Trust
* Secure by Default
* Separation of Duties
* Principle of Explicit Access
* Fail Securely

Security must never rely upon a single layer of protection.

---

# Security Layers

```text
Internet
      │
API Gateway
      │
Authentication
      │
Authorization
      │
Controllers
      │
Application Services
      │
Domain Model
      │
Infrastructure
      │
Database
```

Each layer contributes to the overall security posture.

---

# Authentication

Authentication verifies identity.

Supported mechanisms may include:

```text
JWT

OAuth 2.0

OpenID Connect

API Keys

Service Accounts
```

Authentication occurs before business requests reach the Application Layer.

---

# Authorization

Authorization determines what an authenticated identity may do.

Authorization decisions occur before Application Services execute.

Authorization must never be implemented inside Aggregate Roots.

---

# Role-Based Access Control (RBAC)

Permissions are assigned to roles rather than individual users.

Typical roles include:

```text
Traveller

Administrator

Reservations Consultant

Operations Coordinator

Driver Guide

Supplier Integration

System Administrator
```

Additional roles may be introduced without modifying the Domain Model.

---

# Permission Model

Permissions represent business capabilities.

Examples:

```text
Create Reservation

Modify Reservation

Cancel Reservation

Allocate Driver

Issue Refund

Manage Suppliers

Manage Users
```

Permissions remain stable even if implementation changes.

---

# Identity Model

Every authenticated identity has:

```text
Identity

Roles

Permissions

Claims

Authentication Context
```

The Identity Model remains separate from Traveller domain entities.

---

# API Security

Every public API must support:

* HTTPS only
* authenticated access where required
* request validation
* rate limiting
* structured error handling

Sensitive endpoints require authorization in addition to authentication.

---

# Service-to-Service Security

Internal services communicate using authenticated identities.

Possible mechanisms:

```text
JWT

Mutual TLS

Signed Tokens
```

Service identities are distinct from user identities.

---

# Supplier Security

External providers authenticate using provider-specific credentials.

Examples:

```text
API Keys

OAuth Tokens

Certificates

HMAC Signatures
```

Provider credentials remain within Infrastructure.

---

# Secrets Management

Sensitive configuration includes:

* API keys
* database credentials
* encryption keys
* JWT signing keys
* supplier credentials

Secrets must:

* never be committed to source control
* never appear in logs
* be rotated periodically
* be stored securely

---

# Password Policy

Where passwords exist they should support:

* strong hashing
* salted hashes
* configurable complexity
* secure reset workflows

Plain-text passwords are never stored.

---

# Session Management

Sessions should:

* expire automatically
* support secure logout
* invalidate revoked tokens
* prevent session fixation

Authentication state remains external to the Domain Layer.

---

# Data Classification

Business data should be classified.

Typical categories:

```text
Public

Internal

Confidential

Sensitive
```

Protection measures increase with classification level.

---

# Personal Information

Traveller information is considered sensitive.

Examples:

* names
* email addresses
* phone numbers
* travel information
* payment references

Sensitive data should be handled according to applicable privacy regulations.

---

# Encryption

Data in transit:

```text
TLS 1.2+
```

Data at rest:

* encrypted database storage
* encrypted backups
* encrypted object storage

Sensitive secrets should use dedicated key management where appropriate.

---

# Audit Logging

Security-relevant events should be recorded.

Examples:

```text
User Login

Failed Login

Role Change

Reservation Cancellation

Payment Refund

Supplier Credential Update
```

Audit records should be immutable.

---

# Logging

Logs should include:

* correlation identifier
* timestamp
* authenticated identity
* operation
* result

Sensitive information must never appear in logs.

---

# Input Validation

Validation occurs at multiple levels.

Transport validation:

* malformed requests
* missing fields
* invalid formats

Domain validation:

* business rules
* workflow rules
* Aggregate invariants

---

# Output Protection

Responses should never expose:

* stack traces
* SQL errors
* provider credentials
* infrastructure details

Public errors should use standard error contracts.

---

# Rate Limiting

Public APIs should support configurable rate limits.

Examples:

```text
Requests per minute

Concurrent requests

Burst limits
```

Rate limiting protects platform availability.

---

# Cross-Origin Resource Sharing (CORS)

CORS policies should:

* explicitly define allowed origins
* restrict methods
* restrict headers
* support credential policies where appropriate

Default behaviour should deny unknown origins.

---

# Security Headers

HTTP responses should include appropriate security headers.

Examples include:

* Strict-Transport-Security
* X-Content-Type-Options
* X-Frame-Options
* Content-Security-Policy
* Referrer-Policy

Header configuration remains an Infrastructure concern.

---

# File Security

Uploaded files should:

* be virus scanned
* validate file types
* validate file size
* avoid executable content

Storage should remain external to the application.

---

# Database Security

Database access occurs only through Infrastructure repositories.

Application code never shares direct database credentials with clients.

Database users should have least-privilege permissions.

---

# Infrastructure Security

Infrastructure should support:

* network segmentation
* firewall rules
* secure configuration
* automated patching
* vulnerability scanning

Operational security remains outside the Domain Layer.

---

# Monitoring

Security monitoring should include:

* failed logins
* privilege escalation
* unusual API usage
* repeated authorization failures
* provider authentication failures

Security events should support alerting.

---

# Incident Response

Security incidents should support:

* detection
* containment
* investigation
* recovery
* post-incident review

Operational procedures remain separate from application code.

---

# Compliance

The architecture should support compliance with applicable legal and regulatory requirements.

Examples may include:

* POPIA
* GDPR (where applicable)
* PCI DSS (for payment integrations)

Compliance requirements should be addressed through implementation and operational controls.

---

# Testing Strategy

Security testing should include:

* authentication tests
* authorization tests
* penetration testing
* dependency vulnerability scanning
* secrets scanning
* API security testing

Security testing should form part of the continuous integration pipeline.

---

# Anti-Patterns

Avoid:

* business authorization inside Aggregate Roots
* hardcoded credentials
* plaintext secrets
* direct database access from clients
* logging sensitive data
* exposing infrastructure errors
* shared administrator accounts
* disabled TLS in production

---

# Acceptance Criteria

Implementation is compliant when:

* authentication precedes business processing
* authorization is consistently enforced
* roles and permissions remain external to the Domain Model
* secrets are securely managed
* audit logging is implemented
* encryption protects sensitive data
* APIs enforce secure communication
* supplier credentials remain isolated within Infrastructure

---

# Conclusion

The Security Architecture establishes a layered security model that protects GCT Core across its entire technology stack. By separating authentication, authorization, auditing, infrastructure security, and domain behaviour, the platform remains secure, scalable, and maintainable while ensuring that business logic remains independent of security implementation details.
