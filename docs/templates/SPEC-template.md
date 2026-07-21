# SPEC-XXX – [Specification Title]

> **[Specification Classification]**
>
> [Concise statement defining what this specification governs.]
>
> This specification SHALL conform to ARCH-000 – Architecture Manifest and SPEC-000 – Engineering Specification Standard.

---

## Document Control

| Property | Value |
|---|---|
| Specification ID | SPEC-XXX |
| Title | [Title] |
| Version | 0.1.0 |
| Status | Draft |
| Classification | [Specification Classification] |
| Owner | Platform Architecture |
| Applies To | [Platform / Project / Shared] |
| Parent Authority | ARCH-000 – Architecture Manifest |
| Governing Standard | SPEC-000 – Engineering Specification Standard |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 0.1.0 | YYYY-MM-DD | Initial draft | [Author / Owner] |

---

## Table of Contents

1. Purpose
2. Scope
3. Architecture Alignment
4. Definitions
5. Design Objectives
6. Requirements
7. Standards and Policies
8. Data / Contracts / Behaviour
9. Constraints and Invariants
10. Implementation Directives
11. Security Considerations
12. Operational Considerations
13. Related Specifications
14. Related ADRs
15. Compliance Requirements
16. Acceptance Criteria
17. Change Control
18. Approval

---

# 1. Purpose

[Define precisely why this specification exists and what it governs.]

---

# 2. Scope

## In Scope

- [Item]

## Out of Scope

- [Item]

---

# 3. Architecture Alignment

This specification SHALL conform to:

- ARCH-000 – Architecture Manifest;
- SPEC-000 – Engineering Specification Standard;
- [relevant Architecture Documents];
- [relevant parent specifications].

### Affected Domains / Bounded Contexts

- [Context]

### Architectural Constraints

- [Constraint]

---

# 4. Definitions

| Term | Definition |
|---|---|
| [Term] | [Canonical definition] |

Approved domain terminology SHALL be used consistently.

---

# 5. Design Objectives

The specification SHOULD achieve:

- [Objective]
- [Objective]

---

# 6. Requirements

## 6.1 [Requirement Area]

[Define normative requirements.]

Example:

> The implementation SHALL [requirement].

Where useful, assign stable requirement identifiers:

```text
REQ-001
[Normative requirement]
```

---

# 7. Standards and Policies

[Define applicable engineering standards, policies, conventions, and rules.]

---

# 8. Data / Contracts / Behaviour

[Define relevant schemas, contracts, state transitions, interfaces, persistence requirements, or behaviours.]

---

# 9. Constraints and Invariants

The implementation SHALL preserve:

- [Invariant]
- [Constraint]

Business invariants SHALL NOT be weakened for implementation convenience.

---

# 10. Implementation Directives

Implementation SHALL:

- conform to this approved specification;
- preserve architectural intent;
- maintain approved boundaries;
- report material ambiguity rather than silently invent architecture.

Implementation SHALL NOT:

- introduce contradictory architectural patterns;
- redefine business rules without approval;
- bypass approved boundaries.

---

# 11. Security Considerations

[Define or reference applicable security requirements.]

---

# 12. Operational Considerations

[Define relevant observability, resilience, scalability, performance, idempotency, or operational requirements.]

---

# 13. Related Specifications

- SPEC-000 – Engineering Specification Standard
- [Related SPECs]

---

# 14. Related ADRs

- [Related ADRs or `None`]

---

# 15. Compliance Requirements

Compliance MAY be assessed through:

- architecture review;
- code review;
- automated testing;
- schema validation;
- static analysis;
- integration testing;
- manual verification.

### Compliance Checklist

- [ ] Architecture alignment confirmed.
- [ ] Normative requirements implemented.
- [ ] Boundaries preserved.
- [ ] Acceptance criteria satisfied.
- [ ] No unresolved material deviations remain.

---

# 16. Acceptance Criteria

This specification is satisfied when:

- [Criterion]
- [Criterion]
- [Criterion]

Acceptance criteria SHOULD be observable and testable where practical.

---

# 17. Change Control

Material changes SHALL:

1. identify the reason for change;
2. assess architectural impact;
3. identify affected documents;
4. update revision history;
5. receive appropriate review and approval.

Implementation drift SHALL NOT be legitimised retrospectively without review.

---

# 18. Approval

## Approval Status

**[DRAFT / APPROVED]**

## Baseline

**[Specification Title] v[Version]**

## Governing Authorities

- ARCH-000 – Architecture Manifest
- SPEC-000 – Engineering Specification Standard

## Implementation Directive

Only the approved version of this specification SHALL govern implementation.

Where ambiguity or conflict is discovered, the authoritative documentation SHALL be reconciled before dependent implementation proceeds.

---

**End of SPEC-XXX – [Specification Title]**