# ADR-003 — Durable Anonymous Journey Workflow State

## Document Control

| Property | Value |
|---|---|
| ADR ID | ADR-003 |
| Version | 0.2 |
| Status | Approved |
| Date | 2026-11-16 |
| Approval Date | 2026-11-17 |
| Approving Authority | Project Owner |
| Author | Copilot, for architectural review |
| Decision Category | Persistence |
| Owner | Platform Architecture |
| Governing Process | GOV-DEV-001 |

## Revision History

| Version | Date | Description |
|---|---|---|
| 0.2 | 2026-11-17 | Approved by Project Owner; architectural content unchanged |

## Context and problem statement

Anonymous session identity is persisted, but Journey selection and guest-information state is process-local. Review readiness and customer confirmation are not durable. Public Journey IDs and submitted contact information do not prove session authority, so the existing workflow cannot provide reliable cross-instance evidence for Reservation creation.

INT-004.3 excluded new persistence within its iteration; INT-004.3A explicitly requires a separate approved design for shared Journey state. Neither is amended or overridden by this decision.

## Decision

The approved direction is a dedicated **application-layer** session-scoped workflow-state capability and a PostgreSQL-backed infrastructure persistence boundary. It holds the minimum resume/review evidence under an internal validated session identity and Journey correlation, with a server-generated workflow identity, explicit lifecycle, revision-based concurrency and policy-governed retention. It is not a Domain Aggregate Root, a persistent catalogue Journey or a Reservation Session Grant. The application workflow service owns orchestration-state invariants and coordinates existing selection, guest validation, pricing, review and APP-004 services; domain business rules remain in their existing owners.

After validation, a protected operation persists the exact review snapshot before a read-only GET presents it. A protected explicit confirmation identifies that snapshot and revision; revalidation and a conditional update record confirmation and transition to `READY`. Material change invalidates confirmation; identical retries do not duplicate it. The snapshot revision remains immutable while the workflow revision advances.

The future APP-004 handoff rechecks session and workflow and commits four outcomes atomically: a new canonical Reservation, its separate PENDING grant, workflow consumption and binding to the persisted Reservation ID. The application coordinates only this use-case transaction; repositories retain their boundaries and Prisma transaction details remain in infrastructure. No supplier call occurs in that transaction. Reconciliation and any required approval of this boundary against existing contracts are prerequisites, not established facts.

## Rationale and alternatives considered

- **Existing WorkflowEvent/AuditRecord:** generic records do not supply current-state, owner, revision and transactional workflow contracts; event sourcing would require a separate approved design.
- **Extend AnonymousSession:** combines identity and sensitive business state and complicates multiple journeys and retention.
- **Extend Journey, Customer or Reservation:** conflates temporary workflow state with dynamic merchandising, contact resolution or a not-yet-created canonical Reservation.
- **Domain Aggregate Root:** the proposed state coordinates a temporary customer interaction rather than introducing an independent business aggregate; creating one solely to justify a repository would misclassify it.
- **Dedicated application workflow state:** explicit orchestration ownership, lifecycle and optimistic concurrency while retaining existing domain boundaries; costs an approved persistence boundary, migration and security controls.

## Consequences and risks

- PostgreSQL becomes the authority for workflow continuity across instances; mixed-version rollout must gate unsafe process-local creation paths.
- In-progress, ready, consumed and expired workflow data, guest information, minimal retry correlation, backups and audit records require distinct owner-approved retention, access and deletion policies before implementation; no arbitrary durations or new retention platform are proposed.
- Expired or revoked sessions cannot transfer workflow authority; workflow evidence is not a grant or payment proof.
- Existing Reservation `saveIfAbsent` and repository-owned transactions cannot by themselves establish the proposed atomic handoff. Supplier idempotency and ambiguous-outcome reconciliation remain separately unresolved.
- SPEC-001/002/029's domain-repository and persistence-traceability rules must be reconciled with the application-state storage boundary before implementation; this proposal does not silently waive them. No legacy Reservation or process-local state may be automatically claimed.

## Approval, dependencies and implementation impact

**Approved by Project Owner on 2026-11-17.** Approval covers version 0.2's classification, states, review sequence, uniqueness and handoff direction; retention durations and controls are a pre-implementation owner/privacy/security policy dependency. SPEC-028 v2's document control was deliberately changed to Approved in commit `9c0d20b85471a9a3ffb3ade06de953b3c1a918d5`; its unchanged Draft footer appears historical, but the document owner/Platform Architecture must confirm it before implementation. ADR-000 requires reconciliation of affected architecture and specifications; a focused implementation specification must define handoff-specific transaction participation before schema, migration or application work. Reconciliation with PERSIST-002 and ADR-002 remains required. Supplier idempotency and ambiguous-outcome reconciliation remain separate prerequisites before supplier fulfilment or PAY-001.5.21. This approval does not authorise implementation or payment.

## Related architecture, specifications, ADRs and references

- [Architecture proposal](../04-software-architecture/10-durable-journey-workflow-state-proposal.md); [ARCH-000](../04-software-architecture/ARCH-000-architecture-manifest.md); [ADR-000](ADR-000-architecture-decision-record-standard.md); [ADR-002 proposal](ADR-002-reservation-session-ownership.md).
- [INT-004.3](../08-integration/INT-004.3-customer-journey-state-isolation.md); [INT-004.3A](../08-integration/INT-004.3A-anonymous-session-foundation.md); [SPEC-001](../06-specifications/engineering/SPEC-001-canonical-domain-model.md); [SPEC-002](../06-specifications/engineering/SPEC-002-canonical-physical-data-model.md); [SPEC-007](../06-specifications/engineering/SPEC-007-canonical-workflow-model.md); [SPEC-028 v2](../06-specifications/engineering/SPEC-028-prisma-data-model%20v2.0.md); [SPEC-029 v2](../06-specifications/engineering/SPEC-029-repository-persistence-architecture%20v2.0.md); [PERSIST-002 proposal](../06-specifications/persistence/PERSIST-002-reservation-session-ownership-proposal.md).
- [Session service](../../src/application/sessions/anonymous-session-service.ts); [Journey selection store](../../src/application/merchandising/homepage/showcase/journey-selection-store.ts); [review service](../../src/application/merchandising/homepage/showcase/reservation-review-service.ts).
