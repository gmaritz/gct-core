# Durable Anonymous Journey Workflow State — Architecture Proposal

## Document Control

| Property | Value |
|---|---|
| Document | Durable Anonymous Journey Workflow State |
| Version | 0.2 |
| Status | Approved |
| Owner | Platform Architecture |
| Approval Date | 2026-11-17 |
| Approving Authority | Project Owner |
| Governing Process | [GOV-DEV-001](../09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md) |
| Governing Architecture | [ARCH-000](ARCH-000-architecture-manifest.md); [Persistence Model](05-persistence-model.md); [Security Architecture](08-security-architecture.md) |
| Decision | [ADR-003](../decisions/ADR-003-durable-journey-workflow-state.md) |
| Scope | Pre-Reservation, session-scoped Journey workflow state and verified handoff |

## Revision History

| Version | Date | Description |
|---|---|---|
| 0.2 | 2026-11-17 | Approved by Project Owner; architectural content unchanged |

Version 0.2 records the approved architectural direction for a future capability. It is not an implementation specification and does not authorise implementation or changes to code, schema, data or payment state.

## 1. Purpose and existing authority

Establish durable, authoritative evidence that a validated anonymous session completed a particular Journey selection, guest-information and review workflow. Evidence authorises an attempted Reservation creation; it does not prove that the Reservation exists, that supplier fulfilment succeeded, or that the session owns an existing Reservation. Reservation access remains governed by the separately approved Option C principle and the proposed [PERSIST-002](../06-specifications/persistence/PERSIST-002-reservation-session-ownership-proposal.md).

[INT-004.3](../08-integration/INT-004.3-customer-journey-state-isolation.md) is a bounded implementation specification: it isolates journey and guest state by a trusted owner and journey, excludes schema/migrations and new distributed state, and prohibits new persistence without an approved architectural basis. It remains unchanged; this proposal does not reinterpret or waive its restrictions. [INT-004.3A](../08-integration/INT-004.3A-anonymous-session-foundation.md) establishes the persisted anonymous-session foundation but explicitly excludes durable journey state and requires a separately approved shared design before claiming multi-instance continuity.

[SPEC-001](../06-specifications/engineering/SPEC-001-canonical-domain-model.md) separates domain business rules from application orchestration and places domain repository interfaces in the Domain Layer. [SPEC-002](../06-specifications/engineering/SPEC-002-canonical-physical-data-model.md) governs physical persistence, not the Prisma schema, and requires traceability to approved domain concepts. [SPEC-007](../06-specifications/engineering/SPEC-007-canonical-workflow-model.md) requires governed workflow ownership and technology-independent concepts. The [approved Application Services architecture](02-application-services.md) coordinates use cases and transactions while leaving business decisions in the domain.

[SPEC-028 v2](../06-specifications/engineering/SPEC-028-prisma-data-model%20v2.0.md) records Approved in document control, while its closing text still says Draft. Repository commit `9c0d20b85471a9a3ffb3ade06de953b3c1a918d5` deliberately changed the document-control status from Draft to Approved without changing the closing text. [SPEC-029 v2](../06-specifications/engineering/SPEC-029-repository-persistence-architecture%20v2.0.md) references v2, and [SPEC-030 Reservation persistence](../06-specifications/engineering/SPEC-030-reservation-persistence-reconciliation-and-implementation%20v2.0.md) describes SPEC-028 as approved; [SPEC-028 v1](../06-specifications/engineering/SPEC-028-prisma-data-model%20v1.0.md) is marked Superseded. This supports treating v2's document-control status as the repository's recorded status and the footer as apparently historical, but no independent approval record was established in the inspected history. The SPEC-028 document owner/Platform Architecture must confirm the footer's meaning and any correction; this proposal does not modify it.

[SPEC-029 v2](../06-specifications/engineering/SPEC-029-repository-persistence-architecture%20v2.0.md) and [SPEC-030 Reservation persistence](../06-specifications/engineering/SPEC-030-reservation-persistence-reconciliation-and-implementation%20v2.0.md) keep Prisma in infrastructure, preserve the Reservation root and its transaction graph, and prohibit external supplier calls inside that transaction. The workflow, Reservation and grant are related components of one creation handoff; whether their proposed shared application transaction conforms to those contracts must be explicitly confirmed during architecture reconciliation. [PERSIST-001](../06-specifications/persistence/PERSIST-001-canonical-persistence-architecture-reconciliation.md) retains the canonical Reservation authority.

The separately named [SPEC-030 Application Layer Architecture](../06-specifications/engineering/SPEC-030-application-layer-architecture.md) describes application orchestration and unit-of-work coordination but is marked Superseded; it is historical context, not the authority for this proposal. SPEC-030 Reservation persistence v2 explicitly supersedes it.

The original iteration boundaries remain unchanged: [IMP-003](../06-specifications/implementation/IMP-003-customer-journey-discovery-detail-foundation.md), [IMP-003.1](../06-specifications/implementation/IMP-003.1-customer-journey-discovery-foundation.md) and [IMP-003.2](../06-specifications/implementation/IMP-003.2-customer-journey-detail-experience.md) compose and present dynamic Journeys rather than persisting a catalogue Journey; [IMP-004](../06-specifications/implementation/IMP-004-deterministic-journey-selection-foundation.md) provides the selection boundary; [IMP-007](../06-specifications/implementation/IMP-007-guest-information.md) validates guest data; [IMP-008](../06-specifications/implementation/IMP-008-reservations-review.md) requires review and explicit confirmation. [APP-004 orchestration](../07-application/implementations/reservation/APP-004-end-to-end-accommodation-booking-orchestration.md) retains Reservation construction and supplier handoff; [APP-011 customer resolution](../07-application/implementations/customer/APP-011-customer-resolution-for-anonymous-bookings.md) resolves contact, not browser ownership.

## 2. Verified current behaviour

1. [AnonymousSessionService](../../src/application/sessions/anonymous-session-service.ts) issues a random browser bearer, stores its hash and returns the internal session record ID as `ownerId`. [Session repository](../../src/infrastructure/persistence/repositories/anonymous-session-prisma.repository.ts) checks expiry and revocation. [Middleware](../../src/interfaces/http/middleware/anonymous-session.middleware.ts) creates a separate session for invalid/missing cookies and requires an existing valid cookie and CSRF token for unsafe methods. No rotation operation is implemented in this service.
2. [Frontend routes](../../src/interfaces/http/routes/frontend.routes.ts) progress through Journey detail, selection, accommodation, quote, guest information, review and payment. The [default resolver](../../src/application/merchandising/homepage/showcase/dynamic-homepage-journey-resolver.ts) resolves a public featured Journey after checking a nonblank owner; it does not establish a durable entitlement. [Journey factory](../../src/application/journeys/composition/factory/journey-factory.ts) derives a Journey ID from a composition request; the inspected [Prisma schema](../../prisma/schema.prisma) has no Journey model.
3. [Selection store](../../src/application/merchandising/homepage/showcase/journey-selection-store.ts) holds booking start date, participant counts, per-stop room occupancy and child ages, offered Journey, and property/room/rate selections in process-local maps keyed by internal owner ID and public Journey ID. [Guest store](../../src/application/merchandising/homepage/showcase/guest-information-store.ts) similarly holds contact email/phone, lead index and traveller details, including type, optional birth date and nationality. The session survives a process restart; these maps do not. Two instances do not share their contents.
4. The [Cape Winelands resolver](../../src/application/merchandising/homepage/showcase/cape-winelands-journey-resolver.ts) requires stored context and may cache an offered Journey. [Accommodation selection](../../src/application/merchandising/homepage/showcase/accommodation-selection-service.ts) checks stop, room, rate, occupancy and currency before saving. The [guest service](../../src/application/merchandising/homepage/showcase/guest-information-service.ts) validates contact, traveller details and occupancy. The [quote service](../../src/application/merchandising/homepage/showcase/journey-quote-service.ts) re-resolves selections and prices them.
5. The [controller](../../src/interfaces/http/controllers/frontend.controller.ts) clears guest data after relevant selection changes, saves valid guest input and requires an explicitly confirmed review. [Review](../../src/application/merchandising/homepage/showcase/reservation-review-service.ts) revalidates guest data and the current quote; `READY` and confirmation are request results, not persisted workflow completion. Process-local maps have no revision or cross-instance concurrency control.
6. [Reservation creation](../../src/application/merchandising/homepage/showcase/customer-journey-reservation-service.ts) receives a review without owner identity and derives a deterministic Reservation ID from selection and guest data. [ReservationService](../../src/application/reservations/service/reservation-service.ts) returns the built object even when `saveIfAbsent` reused a row; [repository](../../src/infrastructure/persistence/repositories/canonical-reservation-prisma.repository.ts) performs an upsert in its own transaction. The [Reservation model](../../prisma/schema.prisma) contains customer and journey snapshots, not a session grant. These records and submitted contact details do not establish browser ownership.
7. Prisma includes `WorkflowEvent` and `AuditRecord`, but they are generic event/audit records, not an implemented owner-scoped current Journey workflow repository or concurrency contract. Their existence is not evidence that they satisfy this capability.

## 3. Alternatives and recommendation

| Option | Architectural assessment |
|---|---|
| Existing `WorkflowEvent` or `AuditRecord` | Reuse existing tables but they lack this workflow's current-state, owner/session relationships, revision and conditional update contracts; an event-sourcing/reconstruction policy would be an unapproved redesign. Neither is an authorisation grant. |
| Add workflow data to `AnonymousSession` | Simplifies one lookup but embeds mutable guest/selection information in the identity record, contrary to INT-004.3A's separation, and makes multiple Journeys, retention and lifecycle awkward. |
| Persist/extend Journey, Customer or Reservation | Conflates a dynamic merchandising result, unverified contact identity, or a not-yet-created Reservation with a temporary customer interaction. A Journey catalogue entity and Customer email do not prove browser control. |
| Dedicated session-scoped application workflow state | **Approved direction.** A bounded application capability owns temporary orchestration state and its lifecycle/concurrency invariants. A dedicated persistence boundary uses PostgreSQL/Prisma infrastructure. This supports explicit revisions and cross-instance reads without inventing a domain Aggregate Root solely for storage. It requires architecture reconciliation, a migration, privacy controls and a transaction-aware handoff. |

**Classification: application-layer workflow-state capability, not a Domain Aggregate Root.** Its application workflow service owns session/Journey correlation, state transitions, review-revision consistency and retry invariants. It orchestrates existing Journey/accommodation selection, guest validation, pricing, review and APP-004 Reservation services. Business rules remain in their established domain/validation and pricing capabilities; neither the workflow storage adapter nor controller decides them. Session middleware remains the source of validated identity.

A dedicated workflow-state storage contract and infrastructure adapter provide durable state; they are not proposed as a new domain repository or a new domain aggregate. SPEC-001 and SPEC-029 constrain domain repository interfaces and Aggregate-root persistence, while SPEC-002 requires persistent representations to be traceable to approved domain concepts. Before implementation, Platform Architecture must explicitly reconcile how this application-state boundary fits those rules and approve the applicable persistence contract; renaming a repository or approving this ADR does not waive them. This is not a new persistent catalogue Journey, Customer, Reservation, scheduler, external session system or authorisation grant.

## 4. Evidence and identity contract

The workflow state has a server-generated opaque workflow ID; internal anonymous session ID; public Journey ID as a scoped correlation value; creation/update/expiry timestamps; state; monotonically increasing revision; and an explicitly versioned payload schema. The session FK points to `AnonymousSession.id`, never its bearer, token hash or CSRF token. A client-provided workflow ID or revision is only a locator/concurrency precondition after trusted server session validation, never authority.

The workflow state contains the minimum data needed to resume and revalidate: Journey booking context and stop/occupancy slots; chosen property, room and rate references for every required stop; and validated contact, lead traveller and required traveller details. Supplier references and guest information are sensitive.

### Review snapshot and confirmation

1. For a captured workflow revision, validate the current Journey, all required stops, accommodation, rooms, rates, occupancy, guest information, final GCT price/currency and relevant offer/availability evidence using the existing capabilities.
2. In a CSRF-protected state-changing operation, recheck session and revision, then persist an immutable review snapshot before presenting it. The snapshot contains those material facts, a server-generated review identity, its revision, validation/offer evidence and the workflow revision to which it corresponds; do not persist unnecessary supplier response payloads.
3. A GET reads and presents exactly that persisted snapshot; it creates or changes no authoritative state. If no current snapshot exists, it directs the customer to a protected preparation action rather than preparing one on GET.
4. The customer explicitly confirms the displayed review identity and snapshot revision through a CSRF-protected POST. These references identify what was presented, not who owns it.
5. Revalidate session, Journey, workflow, current revision, snapshot identity, completeness and offer/price eligibility. If any material fact has changed or become stale, reject confirmation, invalidate the old review and require preparation, presentation and confirmation of a new snapshot; never silently replace the reviewed selection or price.
6. Only a successful conditional transaction records that exact confirmation and moves the workflow to `READY`. A new snapshot is not a consent-management document or a digital signature.

The workflow revision increases on every authoritative workflow change. Snapshot creation records its immutable snapshot revision as the resulting workflow revision `R`; it remains `R` even when confirmation increments the workflow revision to `R+1`. The confirmed record stores the review identity, snapshot revision `R` and resulting confirmed workflow revision `R+1`. `READY` is current only while its confirmed workflow revision equals the current workflow revision and the snapshot remains valid. Material changes to Journey context, selections, occupancy, guest information, price, applicable rules or offer validity clear confirmation, invalidate the snapshot and return the workflow to `IN_PROGRESS` in the relevant protected update. A read-only GET that detects stale evidence reports it without mutation; invalidation occurs on the next protected operation.

An identical lost-response confirmation retry for the same valid session, Journey, review identity and snapshot revision returns the existing result only while that same confirmation is still current; it does not increment a revision or create another Reservation. A stale, superseded or different confirmation fails safely. After consumption, a duplicate may return only the existing safe outcome for that same authorised workflow; it cannot re-initiate fulfilment.

Creation eligibility requires all of the following at the handoff linearization point:

- The cookie resolves to the current unexpired, unrevoked server-side session and unsafe request CSRF checks pass.
- Exactly one current, consistent workflow is found under that internal session and requested Journey; its state is `READY`, not expired, and its confirmed workflow revision equals its current workflow revision.
- The server has validated complete, current stop/room/rate/occupancy selections, guest and lead-traveller data, pricing/currency and applicable policy, and has recorded explicit customer confirmation of that exact review basis.
- Current authoritative rules and offer freshness still permit the handoff. A persisted `READY` flag or price is not proof of present supplier availability. If re-resolution or repricing changes what the customer reviewed, invalidate readiness and require a new explicit review/confirmation; never silently replace the accepted price or selection.
- Evidence is not already consumed by a different creation operation. Neither a public Journey ID, Reservation/payment reference, email nor possession of a workflow ID independently grants access.

Expose safe not-found/unavailable responses for missing or foreign workflow/session/Journey combinations without existence disclosure. Incomplete, stale, expired or changed data directs the legitimate user to reselect/review without disclosing other users' information. Sanitised internal categories distinguish invalid session, missing/foreign state, mismatch, stale revision, expired evidence, validation failure, duplicate/conflict and persistence failure; logs contain no guest data, credentials, CSRF tokens, raw supplier references or review payload.

## 5. Lifecycle, idempotency and concurrency

The workflow states are independent of session validity, Reservation status, grant state and supplier outcome:

| State | Entry and permitted transition |
|---|---|
| `IN_PROGRESS` | Created for a valid session and Journey. Valid selection/guest updates advance the workflow revision. A validated review snapshot is persisted and presented before explicit confirmation transitions it to `READY`; expiry changes it to `EXPIRED`. |
| `READY` | The confirmed snapshot remains valid and the confirmed workflow revision equals the current workflow revision. A detected material change invalidates confirmation and returns to `IN_PROGRESS` in a protected operation; expiry changes it to `EXPIRED`; successful atomic handoff changes it to `CONSUMED`. |
| `CONSUMED` | Bound to the exact Reservation created by the verified handoff. It is not editable or usable to create another Reservation. An authenticated same-session retry may resolve only the same workflow, Reservation and grant; it does not repeat supplier fulfilment. |
| `EXPIRED` | Terminal for creation and customer data access. A valid session may start a new workflow only when no existing Reservation grant conflicts with the approved first-iteration ownership policy. No data transfers automatically to a new session. |

Expiry is enforced on every operation, not by cleanup. The workflow deadline must not exceed the session expiry; a shorter configured duration and retention windows need owner/privacy approval. Revocation or expiry of the session denies use even if workflow state remains `READY`. Abandonment is expiry without further customer action; cleanup is a separate approved operational policy.

Within the proposed first iteration, a database-enforced partial unique index on `(sessionId, journeyId)` for `IN_PROGRESS` and `READY` prevents duplicate current workflows. A workflow ID is unique; `CONSUMED` retains a unique exact Reservation correlation. To start another workflow after time expiry, lock the session and transition the expired current row to `EXPIRED` before insertion; a time-dependent index predicate is not used. An existing grant for that session/Journey prevents a second Reservation under the proposed PERSIST-002 policy. Conflicts and legacy records never become claimable by matching fingerprints.

All writes to workflow state use a single local PostgreSQL transaction and a conditional update on `(workflowId, sessionId, journeyId, expectedRevision, allowedState)`; increment revision atomically. An affected-row count other than one produces a conflict or safe unavailable result, never last-write-wins. Revision is a server-verified precondition, not an authorisation credential. This follows the optimistic-concurrency approach in the [Persistence Model](05-persistence-model.md) and the existing conditional-update precedent in [PaymentAttempt persistence](../../src/infrastructure/persistence/repositories/payment-attempt-prisma.repository.ts), not an existing workflow implementation.

Validation or offer retrieval outside the database transaction operates on a captured revision. Before persisting a review or confirming it, lock/revalidate the session and compare the expected revision and snapshot identity; discard the result if anything changed. Apply the snapshot and confirmation revision rules in section 4. Do not hold database locks across supplier/network calls.

Across multiple instances, PostgreSQL is the authority: no process-local fallback, cache-only completion or per-process mutex may authorise a handoff. Session revocation and workflow updates/handoff must use a consistent session-then-workflow locking order and recheck expiry/revocation at the conditional mutation point using current database time, not an earlier request-time check. An operation that commits before revocation is not retroactively undone. Roll back all local writes on failure; after an ambiguous commit, reload under the authenticated session and determine the durable state rather than repeat a side effect.

## 6. Reservation handoff and atomicity

Workflow update/confirmation transactions are distinct from the later Reservation creation transaction. The future handoff:

1. Resolve the validated session, load the exact owned workflow, capture its revision and perform current review/eligibility validation without holding database locks across network calls.
2. In a short infrastructure-managed PostgreSQL transaction, lock and recheck the session and workflow in the agreed order, expiry, Journey, `READY` state and confirmed workflow/snapshot revisions; reject concurrent edits, revocation or stale evidence.
3. APP-004 constructs and validates the canonical Reservation using the verified review. In the same local transaction, coordinate the existing canonical Reservation persistence boundary, the separate grant persistence boundary and workflow state storage to: create a genuinely new canonical Reservation; create its `PENDING` Reservation Session Grant; transition the exact workflow to `CONSUMED`; and bind that workflow to the exact persisted Reservation ID. All four outcomes commit together or all roll back. Customer resolution must follow APP-011 and an approved transaction policy; its email match never establishes entitlement.
4. A uniqueness conflict or deterministic Reservation fingerprint collision with another session or an unowned/legacy Reservation fails closed. Never bind or overwrite it. An already `CONSUMED` workflow can return only its own persisted Reservation/grant after independent owner and correlation checks; no automatic fulfilment retry.
5. Supplier fulfilment occurs only after commit, outside the local transaction. Grant activation, ambiguous supplier results, duplicate protection and operational reconciliation are separate PERSIST-002/APP-004 dependencies, not solved or authorised here.

The application orchestrator coordinates one **handoff-specific** transaction boundary; the canonical Reservation repository remains responsible for the complete Reservation graph and the other boundaries remain responsible for their own records. Prisma clients and transaction mechanics stay in infrastructure, not application/domain contracts. The current Reservation repository opens its own Prisma transaction and `saveIfAbsent` does not report whether an existing row was reused; the inspected code does not establish a shared unit of work for this handoff. A focused implementation specification must define the minimum transaction-participation and create-result capabilities needed for the three boundaries, without a generic transaction framework or refactoring unrelated repositories. Platform Architecture must confirm the related workflow/Reservation/grant transaction against SPEC-029's Reservation graph boundary; an ADR alone cannot change an approved specification. There is no distributed transaction with suppliers.

## 7. Privacy, security and retention

Apply existing session validation, CSRF, secure cookies and transport controls. Isolate workflow records by session in all reads and writes, including internal lookups. The [Security Architecture](08-security-architecture.md) treats traveller information as sensitive and requires protection in transit and at rest; provision restricted database roles, encrypted database storage and backups, and access-controlled support procedures before production use.

Keep personal data and supplier references to the minimum needed for the workflow; do not store payment credentials, browser credentials or CSRF secrets. Do not include workflow payloads in logs, audit records, metrics or exceptions. If fingerprints are needed, do not log unsalted hashes of low-entropy personal data. Separate non-sensitive operational audit/correlation from the temporary guest payload.

| Data/state | Policy to approve before implementation |
|---|---|
| `IN_PROGRESS` | Validity deadline, inactivity/abandonment treatment, access restriction and deletion or anonymisation of temporary selections and personal data. |
| `READY` | Validity of the confirmed snapshot and offers, expiry/invalidation treatment, and retention/deletion of the review and guest data if not consumed. |
| `CONSUMED` | Minimum retention of workflow/Reservation correlation, review identity and retry evidence; separate schedule for removing temporary guest and selection data after handoff. |
| `EXPIRED` | Deny customer access and creation immediately; define when residual personal data and stale snapshots are deleted or anonymised. |
| Personal guest information | Minimum fields, authorised access, encryption, deletion/anonymisation and any applicable legal hold. |
| Minimal retry/correlation evidence | Exact fields, permitted access and retention needed for safe retries; no automatic legacy claiming. |
| Audit records | Required non-sensitive events, access and retention, separate from workflow payload and financial records. |
| Backups | Approved retention, restoration protections and how deletion requests are handled within the backup lifecycle. |

The project owner and responsible privacy/security reviewers must approve the applicable durations, access and deletion rules before implementation and deployment; legal/compliance input is required where applicable. These are policy dependencies, not invented durations or a reason to postpone review of the proposed architecture. Grant/session retention and deletion must respect FKs and the separately approved financial retention policy; do not delete a Reservation or grant merely because temporary workflow data expires. No new retention service or audit platform is proposed.

## 8. Migration, deployment and failure handling

- After the implementation prerequisites are satisfied and implementation is separately authorised, an additive migration may introduce the approved workflow persistence model, FK/unique/partial-index constraints, revision and state constraints. No schema or migration is created by this document. Approve an implementation specification and validate actual PostgreSQL/Prisma SQL before execution.
- Do not infer or backfill completed workflow evidence from process-local data, email, Journey ID or historical Reservations. Existing in-flight sessions may need to restart their Journey workflow. Legacy Reservations remain unassigned absent separately authorised recovery.
- Deploy all instances against one compatible workflow schema and fail-closed read/write path. Gate the old process-local path during mixed-version rollout; old instances must not accept Reservation creation using unverified local state. On rollback, disable affected creation routes rather than restore insecure authority. No data-loss rollback is assumed.
- Missing, foreign, invalid, expired or inconsistent state cannot be repaired automatically by reassignment. Stale revisions fail without mutation; persistence errors fail closed and remain observable. After restart, load durable data, re-resolve/revalidate offers and request renewed confirmation if the review basis changed. No claim is made that persisted supplier offers remain bookable.

## 9. Prerequisites, review and acceptance

1. The Project Owner approved the version 0.2 architecture and ADR-003 on 2026-11-17. Before implementation, the SPEC-028 owner/Platform Architecture must confirm the historical footer discrepancy; the committed document-control status records Approved.
2. Before implementation, reconcile the application-state persistence boundary and the related cross-boundary transaction with SPEC-001/002/029 and affected contracts. Approve a focused implementation specification covering the minimum transaction participation, state/constraint migrations, session locking and expiry, quote freshness, approved privacy/retention policy, deployment and security tests. ADR-000 requires reconciled architecture/specifications; this approval does not authorise implementation.
3. Reconcile PERSIST-002/ADR-002 grant and handoff requirements. Supplier idempotency and ambiguous-outcome reconciliation remain a separate dependency before enabling fulfilment or PAY-001.5.21; legacy recovery is not part of this capability.
4. Verify with synthetic data: same-session continuity across restarts/instances; two sessions on one Journey; invalid/expired/revoked sessions; CSRF; stale edits and review confirmation races; concurrent creation and uniqueness; changed offers; failure/rollback at every handoff write; lost-response retries; legacy/fingerprint collisions; and privacy/retention behavior. No external supplier or payment calls in automated tests.
5. Follow GOV-DEV-001 for focused tests, regression, build, Prisma validation and lint in the later implementation iteration. Owner approval of this proposal alone does not authorise implementation, migration, recovery or a payment.
