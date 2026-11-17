# ADR-002 — Anonymous Session Access to Canonical Reservations

## Document Control

| Property | Value |
|---|---|
| ADR ID | ADR-002 |
| Version | 0.1 |
| Status | Proposed — not approved |
| Date | 2026-11-16 |
| Author | Copilot, for architectural review |
| Decision Category | Security and persistence |
| Owner | Platform Architecture |

## Context and problem

Anonymous browser sessions are authenticated with a server-validated bearer cookie, but the persisted Reservation has no session access association. Payment and confirmation currently select a Reservation by public journey ID; that identifier and customer contact information are not proof of browser authority. Reservation and supplier operations also span separate persistence/external boundaries.

## Proposed decision

Subject to architectural approval, persist an application/security `ReservationSessionGrant` between the internal anonymous-session record and the canonical Reservation. Require an active grant and a valid current session for customer Reservation, payment, return, cancellation and confirmation access. Establish a pending grant atomically with a newly created Reservation; activate it only after successful, persisted fulfilment. Existing unowned Reservations remain inaccessible pending a separately approved, audited recovery process.

The initial proposed cardinality permits multiple journeys per session, one Reservation per session/journey and one anonymous grant per Reservation. No automatic cross-session transfer or legacy backfill is permitted. Genuine provider ITNs remain independent of browser-session access.

## Rationale and alternatives

- **Reservation-linked session:** couples an ephemeral access principal to a long-lived business aggregate and makes recovery/account support awkward.
- **Session-owned selection:** a single field limits bookings and couples session retention to Reservation lifetime; multiple selections effectively require an association.
- **Dedicated grant:** keeps access policy outside the Reservation domain, allows explicit FK/uniqueness constraints and supports a separate future authenticated-account model. It introduces a migration, additional lifecycle and transactional coordination.

## Consequences and risks

- FKs do not authenticate browsers; cookie validation and session expiry/revocation remain mandatory.
- Current `saveIfAbsent` cannot prove a newly created row or ownership. Collision handling and transaction boundaries require revision; existing records must not be silently claimed.
- Supplier operations cannot be rolled back by PostgreSQL. Ambiguous supplier outcomes require durable evidence and controlled reconciliation, not blind retry.
- Restrictive FKs affect session cleanup; retention and deletion policy must be approved. Fixed same-journey cardinality constrains future booking UX.
- The approved Sandbox test Reservation remains inaccessible until legitimate recovery is separately approved and executed.
- Mixed-version or rollback deployment to journey-only resolution would reintroduce the vulnerability; customer access must be gated.

## Approval and dependencies

**Proposed, not approved.** Cardinality, journey-selection evidence, transaction/reconciliation design, session lifecycle, recovery evidence, audit and account migration require architect decisions. Reconcile affected architecture and specifications before implementation.

## Related architecture, specifications and references

- [ARCH-000](../04-software-architecture/ARCH-000-architecture-manifest.md); [ADR-000](ADR-000-architecture-decision-record-standard.md).
- [PERSIST-002 proposal](../06-specifications/persistence/PERSIST-002-reservation-session-ownership-proposal.md); [PERSIST-001](../06-specifications/persistence/PERSIST-001-canonical-persistence-architecture-reconciliation.md); APP-004, APP-006, APP-011, IMP-009 and IMP-010.
- [Session service](../../src/application/sessions/anonymous-session-service.ts); [payment resolver](../../src/application/payments/payment-initiation-service.ts); [Reservation persistence](../../src/infrastructure/persistence/repositories/canonical-reservation-prisma.repository.ts).
