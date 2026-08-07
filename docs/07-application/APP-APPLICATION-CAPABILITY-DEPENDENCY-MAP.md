# Application Capability Dependency Map

---

# Document Information

| Item | Value |
|------|-------|
| Document | APP-APPLICATION-CAPABILITY-DEPENDENCY-MAP |
| Status | Approved |
| Version | 1.0 |
| Owner | Application Architecture |

---

# Purpose

This document describes the dependency relationships between Application Capabilities within GCT Core.

The objective is to ensure capabilities remain loosely coupled, dependency direction remains consistent, and cyclic dependencies are avoided.

---

# Dependency Principles

Application capabilities shall:

- depend only on lower-level capabilities
- expose stable public contracts
- avoid cyclic dependencies
- communicate through canonical models
- remain independently testable

---

# Capability Overview

| Capability | Status |
|------------|--------|
| APP-001 Homepage | Complete |
| APP-002 Accommodation | Complete |
| APP-003 Journey | Complete |
| APP-004 Reservation | Complete |
| APP-005 Pricing | Complete |
| APP-006 Payments | Complete |

---

# Capability Dependency Map

```text
                    APP-001

                       │

        ┌──────────────┴──────────────┐

        ▼                             ▼

 APP-002 Accommodation         APP-003 Journey

                 │                   │

                 └──────────┬────────┘

                            ▼

                  APP-004 Reservation

                            │

                            ▼

                    APP-005 Pricing

                            │

                            ▼

                    APP-006 Payments
```

---

# Dependency Matrix

| Capability | Depends On |
|------------|------------|
| APP-001 | None |
| APP-002 | None |
| APP-003 | APP-002 |
| APP-004 | APP-002, APP-003 |
| APP-005 | APP-004 |
| APP-006 | APP-004, APP-005 |

---

# Public Services

## APP-002

Provides:

- accommodation discovery
- availability
- supplier content

---

## APP-003

Provides:

- journey composition
- itinerary construction

---

## APP-004

Provides:

- reservation lifecycle
- booking orchestration

---

## APP-005

Provides:

- quotation
- commercial pricing

---

## APP-006

Provides:

- payment lifecycle
- settlement
- refunds

---

# Architectural Rules

Capabilities shall never bypass intermediate capabilities.

Example:

APP-006 must not call APP-002 directly if Reservation or Pricing already expose the required information.

---

# Future Capability Placement

Future capabilities should extend the graph without introducing cycles.

Potential future capabilities include:

- APP-007 Customer
- APP-008 Communications
- APP-009 Documents
- APP-010 CRM
- APP-011 Reporting