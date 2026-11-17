# PERSIST-002 — Reservation Session Ownership and Legacy Policy

## Document Control

| Field | Value |
|---|---|
| Document ID | PERSIST-002 |
| Version | 0.1 |
| Status | Proposed — not approved for implementation |
| Classification | Persistence and security implementation proposal |
| Owner | GCT Core Architecture |
| Governing Process | GOV-DEV-001 — Development Process Governance |
| Related Architecture | ARCH-000; architecture security and persistence documents |
| Related Specifications | PERSIST-001; APP-004; APP-006; APP-011; IMP-009; IMP-010 |
| Proposed Decision | [ADR-002](../../decisions/ADR-002-reservation-session-ownership.md) |
| Scope | Anonymous-session access to canonical Reservations and their payment context |

This proposal is not an approved architecture decision, migration, recovery procedure, or payment authorisation. Approval and reconciliation with governing architecture and specifications are required before implementation.

## 1. Problem and verified current state

- `AnonymousSessionService` issues a random browser bearer, stores its hash, and resolves a valid, unexpired, unrevoked record to its internal `ownerId`. The internal ID is the database record ID, not the browser bearer. There is no implemented rotation or renewal operation. Invalid or expired cookies cause middleware to issue a fresh session; unsafe requests require an existing valid cookie and CSRF token. See [session service](../../../src/application/sessions/anonymous-session-service.ts), [middleware](../../../src/interfaces/http/middleware/anonymous-session.middleware.ts), and [schema](../../../prisma/schema.prisma).
- The `Journey` aggregate has identity, status and lifecycle, but the inspected schema has no `Journey` model. The homepage flow composes public journey IDs; the default resolver validates a nonblank owner but resolves the public feature, not a persisted session-to-journey entitlement. Cape Winelands selection and guest information use process-local maps keyed by session ID and journey ID. These maps do not persist a Reservation ID and do not survive restart. See [Journey factory](../../../src/application/journeys/composition/factory/journey-factory.ts), [default resolver](../../../src/application/merchandising/homepage/showcase/dynamic-homepage-journey-resolver.ts), [selection store](../../../src/application/merchandising/homepage/showcase/journey-selection-store.ts), and [guest store](../../../src/application/merchandising/homepage/showcase/guest-information-store.ts).
- Reservation persists `customerId` and a journey snapshot, but no session association. Customer resolution matches the submitted email; that is contact resolution, not proof of control of a customer identity. The review result omits the session owner, and customer-journey Reservation creation returns success/errors rather than a canonical Reservation ID. See [schema](../../../prisma/schema.prisma), [customer resolution](../../../src/application/customers/customer-resolution-service.ts), [review](../../../src/application/merchandising/homepage/showcase/reservation-review-service.ts), and [creation](../../../src/application/merchandising/homepage/showcase/customer-journey-reservation-service.ts).
- Payment resolution selects the first non-cancelled Reservation returned for a journey without session ownership. Browser callbacks correlate a reference to that context but do not establish ownership. Booking confirmation also selects the first journey result. See [payment resolver](../../../src/application/payments/payment-initiation-service.ts), [callback resolver](../../../src/application/payments/payment-callback-service.ts), and [confirmation service](../../../src/application/reservations/confirmation/reservation-confirmation-service.ts).
- Reservation `saveIfAbsent` uses an upsert with an empty update in its own transaction and returns no persisted outcome. The Reservation service returns its built aggregate, even when persistence reused an existing row. The creation workflow then may invoke supplier fulfilment and persist again, outside that first transaction. A fingerprint collision or retry therefore cannot itself prove ownership or persisted identity. See [Reservation service](../../../src/application/reservations/service/reservation-service.ts), [repository](../../../src/infrastructure/persistence/repositories/canonical-reservation-prisma.repository.ts), and [fulfilment](../../../src/application/reservations/service/accommodation-booking-orchestration.ts).
- Existing PAY-001.5.18 changes add a CSRF-protected initiation form but do not resolve this ownership gap. Do not expose that flow publicly until ownership is enforced.

## 2. Alternatives and recommendation

| Option | Assessment |
|---|---|
| A. Session reference on Reservation | Simple FK but puts an ephemeral authentication principal into the long-lived Reservation aggregate; one field is awkward for recovery, session lifecycle and future access principals. |
| B. Reservation selection on session | A single reference limits multiple bookings and makes session expiry/cleanup and Reservation retention tightly coupled. A collection on the session is effectively an association and still needs constraints and lifecycle rules. |
| C. Separate persisted session–Reservation grant | Recommended. Keeps access authority in an application/security persistence boundary while retaining the canonical Reservation and session as separate aggregates. Supports explicit uniqueness, auditing and future account grants without trusting public IDs. Adds a migration, lifecycle management and a cross-repository transaction. |

**Proposed policy:** one session may have several Reservations across journeys; the first iteration allows at most one grant per session and public journey. A Reservation has at most one anonymous-session grant, including pending and revoked/expired sessions. No automatic multi-session access or reassignment. Multiple bookings for the same journey in one session require an explicit future selection design, not arbitrary ordering or replacement.

These are recommended constraints, not evidence that broader business cardinality has already been decided. Customer-account access must be added as a separately authenticated principal and authorisation policy; do not make a customer ID or matching email an anonymous-session credential.

## 3. Proposed logical and Prisma-level model

The following is a design sketch, not a schema change or migration. Add relation collections on `AnonymousSession` and `Reservation` and a separate application/security association:

    model ReservationSessionGrant {
      id            String   @id @default(uuid())
      sessionId     String
      reservationId String   @unique
      journeyId     String
      state         String
      createdAt     DateTime @default(now())
      activatedAt   DateTime?
      updatedAt     DateTime @updatedAt

      session       AnonymousSession @relation(fields: [sessionId], references: [id], onDelete: Restrict, onUpdate: Cascade)
      reservation   Reservation      @relation(fields: [reservationId], references: [id], onDelete: Restrict, onUpdate: Cascade)

      @@unique([sessionId, journeyId])
      @@map("reservation_session_grant")
    }

- Allowed states are `PENDING`, `ACTIVE`, and `FAILED`; use a database check constraint or a Prisma enum, and enforce valid transitions transactionally. `PENDING` and `FAILED` never authorise payment or customer Reservation presentation.
- `reservationId` uniqueness prevents competing anonymous owners; `(sessionId, journeyId)` uniqueness enforces the proposed selection rule and provides the lookup index. `sessionId` uses the internal record ID, never the cookie value, token hash or CSRF token.
- `journeyId` identifies the public journey captured in the Reservation snapshot; there is no Journey FK in the current schema. Validate the session's actual journey workflow before creation and compare this value with the canonical Reservation snapshot on every resolution. A mismatch fails closed and is an operational integrity error. Do not claim the FK or unique indexes enforce this JSON equality.
- `Restrict` prevents deletion of a session or Reservation with a grant. Expiration/revocation does not delete the grant or Reservation. Retention and eventual archival/deletion require an approved policy; do not silently cascade financial records.
- `createdAt`/`updatedAt` are not an audit history. Recovery, rotation to a new session identity, transfer or revocation requiring a grant change must use a separately designed, durable append-only audit mechanism; this proposal does not claim that the sketch supplies one.

## 4. Canonical resolution contract

`resolveOwnedReservation(validatedSession, journeyId, purpose)` returns exactly one authorised canonical Reservation context, or a non-disclosing unavailable result. The session identity is supplied only by trusted server middleware, never by client form data. The implementation must:

1. Validate the actual cookie server-side and confirm the underlying session is current and unrevoked; a newly issued replacement session has no inherited authority.
2. Select the single `ACTIVE` grant by internal session ID and requested journey. Verify grant, session and canonical Reservation exist and match, including snapshot journey ID; reject missing, duplicate, inconsistent or ambiguous data.
3. Fetch the exact canonical Reservation by grant ID, not by first journey match or a legacy Booking fallback. Reject deleted, cancelled or otherwise ineligible records for payment initiation using existing business rules. Read-only display/callback eligibility must be defined separately so a cancelled attempt can still be presented safely to its owner.
4. Return the authorised Reservation identity and necessary payment context only after these checks. Missing grant, wrong session, malformed reference, missing Reservation and ownership mismatch have the same externally safe not-found/unavailable response; internal logs use sanitised reason codes without customer data or secrets.
5. Revalidate session, grant and relevant Reservation state at the transaction boundary immediately before PaymentAttempt creation or claim. A GET result or a browser-supplied Reservation ID is never an authorisation token.

If the session has multiple Reservations for the same journey after a future cardinality change, use an explicit server-owned selection with verified grant, not insertion order. Do not weaken the present uniqueness constraint without a migration and reviewed selection policy.

## 5. Creation, concurrency and recovery

1. A validated session completes the existing session-scoped journey, guest and confirmed review workflow. A public journey ID or client-supplied contact details alone do not prove ownership.
2. Resolve customer contact and prepare the Reservation using the established services. The creation contract must return the actual persisted canonical identity and distinguish **newly created**, **already exists and already granted to this session**, and **conflict/unowned**. Do not treat the currently built aggregate or an empty-update upsert as proof of creation.
3. In one local PostgreSQL transaction, persist the new canonical Reservation and its `PENDING` grant. Use a transaction-aware repository/unit of work; the current internally owned repository transaction must be adapted. If the grant insert or Reservation persistence fails, roll back both. Verify the session is active and the snapshot journey matches the reviewed journey inside the transaction.
4. A retry may reuse an existing Reservation only when its existing grant is for the same valid session and journey and the operation is the same verified idempotent workflow. A collision with an unowned legacy Reservation or another session's grant fails closed, without binding it, overwriting it, invoking fulfilment or revealing its existence. Do not use shared deterministic fingerprint equality as ownership evidence.
5. Complete supplier fulfilment **outside** the database transaction. Never hold database locks across external calls. Keep the grant `PENDING` and deny payment/presentation until the persisted fulfilment result and eligibility are confirmed. Then atomically transition that grant to `ACTIVE` and persist relevant local state. On failure mark `FAILED` or leave `PENDING` for controlled reconciliation; never report success solely because a Reservation row exists.
6. If the process crashes after a supplier call or before activation, treat the result as potentially ambiguous. Inspect durable supplier correlation and reconcile through an authorised operator/workflow; do not blindly repeat supplier booking or create another Reservation. Recovery must be idempotent, preserve the financial snapshot, and be separately tested. If existing supplier evidence cannot support this, fail closed and escalate.
7. Enforce uniqueness in the database, use consistent row-lock ordering and re-read on conflicts. Concurrent requests must produce at most one authorised association and no duplicate fulfilment. Specify and test the actual isolation, conflict handling and supplier idempotency before implementation; do not assume database atomicity covers supplier effects.

## 6. Session and grant lifecycle

- The browser proves possession of the existing random cookie; the server validates its hash, expiration and revocation. A database FK alone is not browser authentication. Preserve existing secure-cookie, CSRF and session validation requirements.
- A new anonymous session starts with no grants. Reusing the public journey ID, Reservation ID, payment reference, contact email, or an expired cookie does not restore access.
- Expiry or revocation immediately denies access at the next authorised operation, even if an `ACTIVE` grant remains for audit/reconciliation. New sessions and other browsers cannot resume it automatically.
- No session rotation/renewal currently exists. A future rotation within the same internal session record must atomically replace the token hash and invalidate the old bearer, preserve the grant only after validating the old session, and rotate CSRF material as appropriate. Rotation to a new internal session ID or transfer requires separately authorised, audited recovery; never copy grants automatically.
- Authorisation and initiation claim must be serialized with session revocation and grant changes using a documented locking/revalidation protocol. Once a valid claim commits, subsequent revocation cannot retroactively cancel an already started external operation; document and handle that boundary without holding locks over provider calls.
- A stolen valid cookie remains a bearer compromise; use TLS, secure/HttpOnly/SameSite cookies, short lifetime, CSRF protection, minimal logging and revocation. These measures do not make theft impossible.

## 7. Legacy Reservations and recovery

Existing Reservations without a verified grant remain inaccessible through customer Reservation and payment routes. This includes `reservation-journey-homepage-journey-001-1edb5be5a03ef03e29dcc939`; it remains unassigned. No automatic migration backfill, email matching, journey matching, ID possession, or customer self-assertion establishes ownership.

Recommend controlled administrative recovery only in a separately approved iteration: an authenticated, authorised operator verifies independent trusted evidence of the customer's entitlement and current session, records the evidence category and decision without secrets or unnecessary personal data, and creates the grant transactionally with a durable audit record. Conflicts, insufficient evidence, existing grants and ambiguous matches fail closed and require review. Any reassignment requires separately authorised revocation/transfer controls and immutable audit; no overwrite or silent takeover. Exact evidence standards, operator roles, audit retention, revocation and customer-account recovery are outstanding decisions, not implemented mechanisms.

Until that process is approved and executed, the Sandbox Reservation cannot be used for customer payment. Supplier ITNs for already initiated payments remain independently processed by their existing provider checks and are not blocked by browser-session expiry.

## 8. Downstream requirements

- **Payment GET:** resolve the owned Reservation first; show only that Reservation's financial context. No grant means no balance, status or other private details.
- **Payment POST:** independently resolve/revalidate ownership before constructing context, creating or reusing an attempt, claiming it, or invoking the gateway. Preserve CSRF and existing idempotency, provider, amount and currency checks. An ownership failure must not create, claim or modify attempts or invoke the gateway.
- **Return and cancel:** resolve owned Reservation first, then correlate the GCT reference to its PaymentAttempt, payment identity, provider and environment. These are read-only and cannot credit or change financial state. An expired session or unrelated reference returns the same non-disclosing response as a missing record.
- **Confirmation:** the current journey-only first-result lookup is also a customer-facing Reservation disclosure risk. Require this same contract before displaying confirmation or booking details; scope its correction explicitly in the future implementation and do not change unrelated HTTP status semantics.
- Other pre-Reservation journey, quote, guest and review routes retain their established session-scoped controls. Audit any additional Reservation presentation or customer APIs before exposing them; do not assume this proposal covers uninspected routes.
- Genuine verified ITNs remain server-to-server and independent of browser ownership. Preserve signature, source, server validation, correlation, transactional payment update and duplicate handling.

## 9. Migration and deployment

1. After approval, add the association and restrictive FKs, state constraint and unique indexes in a reviewed additive migration. Validate the exact SQL against the installed PostgreSQL/Prisma versions and integration-test concurrent inserts and deletion behavior.
2. Do not backfill ownership. Existing rows remain unowned; any legacy Booking-only fallback must not bypass the canonical grant. Inventory and securely reconcile such records separately.
3. Deploy fail-closed resolution and grant creation coherently: do not expose old journey-only routes against the new table during a mixed-version rollout. Establish maintenance/feature-gating and rollback procedures before deployment.
4. A rollback to old application code would restore insecure journey-only access. Disable customer Reservation/payment routes until a safe version is restored; retain grants and financial data. Dropping the association destroys ownership history and requires explicit data-retention and recovery approval.
5. Run migration only in the later approved implementation/deployment stage. This proposal performs no schema, data or configuration changes.

## 10. Required future verification

- Two independent valid sessions: each can view/initiate only its explicitly granted Reservation; supplied other-session journey, Reservation ID or payment reference cannot grant access. Errors do not disclose existence.
- Missing, invalid, expired or revoked sessions; missing, pending, failed, conflicting, cancelled, deleted, mismatched and ambiguous grants/Reservations all fail closed as appropriate. A new replacement session inherits nothing.
- Two sessions creating the same deterministic Reservation fingerprint cannot bind each other's record; concurrent creation/binding and same-session retries preserve the uniqueness and idempotency invariants.
- Successful creation and pending binding commit atomically; injected failures roll both back. Activation occurs only after persisted successful fulfilment. Crash-after-supplier-call scenarios remain unavailable until safe reconciliation.
- Ownership rejection precedes attempt creation, reuse, claim and gateway execution and leaves Reservation financial state unchanged. Valid repeated attempts use the existing idempotency behavior.
- Return/cancel reference replay across sessions is rejected, both routes remain read-only, and genuine ITN processing remains independent of browser session. Confirmation and all in-scope Reservation presentation use the same contract.
- Integration tests validate PostgreSQL constraints, transaction rollback, locking, revocation races and mixed-version deployment behavior. Automated tests use controlled fakes; no external PayFast request or payment is permitted.
- Follow GOV-DEV-001 focused tests, full regression, build, type-check, Prisma validation and lint. Known unrelated booking-confirmation 404/409 failures remain separately classified.

## 11. Decisions requiring architectural approval

1. Approve or replace option C, the per-session/per-journey cardinality limit, and the proposed `PENDING`/`ACTIVE`/`FAILED` lifecycle.
2. Decide the authoritative session-to-journey evidence at creation, including process restart behavior and how customers explicitly select among future same-journey Reservations.
3. Approve the transaction/unit-of-work refactor and the fulfilment reconciliation strategy, including exact supplier idempotency and operator escalation.
4. Decide retention, deletion, session rotation, authenticated-account access, transfer, audit schema and operational recovery authority/evidence.
5. Decide how to recover the existing Sandbox Reservation without inferring ownership, or whether to use a newly created, properly bound Reservation in a future separately authorised transaction.
6. Reconcile this proposal and ADR-002 with accepted APP-004, APP-011, PERSIST-001, security architecture and payment/confirmation specifications; approve an implementation specification before any schema change.
