# IMP-012 — UI Operational Hardening

## Document Control

| Field | Value |
|---|---|
| Document ID | IMP-012 |
| Title | UI Operational Hardening |
| Version | 1.0 |
| Status | Approved for Implementation |
| Classification | Implementation Specification |
| Owner | GCT Core System Architecture |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS.md |
| Architectural Authority | ARCH-000 |
| Dependencies | IMP-003 through IMP-011, APP-011, SPEC-030 |

---

# 1. Purpose

Harden the existing GCT Core customer-facing UI and journey against the concrete operational risks identified during the bounded IMP-012 architecture inspection.

The implementation SHALL address only:

1. authoritative Guest Information → Review continuation;
2. idempotent Review → Reservation handling;
3. appropriate POST/Redirect/GET behaviour;
4. consistent route failure mapping;
5. safe structured operational diagnostics;
6. focused accessibility and duplicate-action protection.

IMP-012 is an operational hardening capability.

It is NOT a UI redesign, workflow redesign, authentication implementation, or payment architecture change.

---

# 2. Governing Development Process

Implementation MUST follow:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

GOV-DEV-001 is the single source of truth for the development workflow.

The workflow SHALL remain:

Specification → Copilot Implementation → Focused Tests + Regression → Implementation Report → Architect Acceptance → User Commit

Copilot SHALL NOT commit or push.

---

# 3. Architectural Baseline

Reuse the existing architecture:

- frontend routes;
- frontend controller;
- application services;
- Guest Information Service;
- Reservation Review Service;
- Customer Resolution Service;
- ReservationService;
- ReservationRepository;
- CanonicalReservationPrismaRepository;
- existing payment architecture;
- existing confirmation architecture;
- existing View Models/providers;
- existing EJS templates;
- existing logger/request-ID facilities;
- existing validation and error-handling conventions.

The implementation MUST NOT introduce:

- a generic workflow engine;
- a new session framework;
- a new Reservation architecture;
- a new payment architecture;
- a new authentication architecture;
- a new supplier architecture.

---

# 4. Authoritative Guest / Review Continuation

## 4.1 Problem

Validated Guest Information currently exists only within the Guest Information POST request and is reconstructed through hidden browser fields when entering Review.

This creates two risks:

- refreshing/directly requesting Review loses validated guest state;
- browser-modified hidden values can become Reservation input if they pass validation.

The Review boundary therefore does not currently preserve the originally validated guest state authoritatively.

## 4.2 Requirement

Establish a server-authoritative continuation mechanism for validated Guest Information between:

`Guest Information → Review → Reservation`

The implementation SHALL use the smallest mechanism compatible with the existing architecture.

It MUST NOT introduce a generic workflow/session framework.

The server-authoritative continuation SHALL preserve all guest information required by the existing Reservation contract, including:

- booking contact;
- lead traveller identity/index;
- traveller first name;
- traveller last name;
- traveller email where applicable;
- traveller type;
- date of birth where supplied/required;
- nationality where supplied;
- optional phone;
- all other currently validated fields required by the canonical Reservation snapshot.

The server SHALL NOT rely on hidden browser fields as the authoritative source.

## 4.3 Review GET

A Review GET SHALL obtain guest state from the authoritative server-side continuation mechanism.

A direct or refreshed Review request SHALL either:

- recover the previously established authoritative guest state; or
- return a controlled prerequisite/recovery state.

It SHALL NOT silently reconstruct or invent guest information.

## 4.4 Review POST

Review POST SHALL use authoritative server-side guest information.

Browser-submitted guest values SHALL NOT replace the established authoritative guest state merely because they pass validation.

The implementation SHALL preserve the existing Guest Information validation boundary.

---

# 5. Review → Reservation Idempotency

## 5.1 Problem

Repeated Review confirmation currently uses deterministic Reservation identity and persistence upsert behaviour.

Although duplicate Reservation rows are prevented, a replay can overwrite authoritative Reservation snapshots and generate a new Reservation number.

## 5.2 Requirement

Make confirmed Review → Reservation creation idempotent.

For an already-created canonical Reservation associated with the customer journey/request identity:

- return/reuse the existing authoritative Reservation;
- do not generate a replacement Reservation number;
- do not overwrite authoritative Reservation snapshots through a replay;
- do not create a second Reservation.

The existing Reservation persistence model SHALL remain authoritative.

The implementation SHALL NOT introduce a new idempotency framework.

## 5.3 Concurrency

Concurrent confirmation requests SHALL resolve to one authoritative Reservation.

The implementation SHALL use the smallest existing application/persistence mechanisms capable of providing this behaviour.

Do not add distributed locking.

---

# 6. POST / Redirect / GET

## 6.1 Requirement

Review the existing customer-facing mutation routes and apply PRG where appropriate.

At minimum, consider:

- accommodation selection;
- guest information;
- review confirmation;
- payment initiation where applicable.

The objective is to prevent browser refresh from unintentionally repeating mutations.

Successful mutation processing SHOULD transition to a GET representation of the resulting state where this is compatible with the existing application architecture.

## 6.2 Constraints

PRG SHALL NOT:

- lose public `journeyId`;
- lose authoritative server-side state;
- bypass application validation;
- duplicate application logic;
- interfere with payment provider redirects;
- create a second workflow mechanism.

Where direct rendering is necessary for validation failure, preserve the existing validation redisplay behaviour.

---

# 7. Consistent Route Failure Mapping

## 7.1 Requirement

Frontend routes SHALL consistently distinguish expected journey states using the existing presentation boundaries.

At minimum:

- invalid/malformed journey reference;
- not found;
- unavailable/expired journey;
- stale/recheck state;
- application failure.

Payment and payment-return routes SHALL resolve the journey before rendering payment state where required.

Unknown or invalid journey references SHALL NOT simply produce HTTP 200 payment-unavailable responses when a more accurate existing failure state is available.

## 7.2 HTTP / Presentation Consistency

HTTP status codes and rendered customer-facing messages SHALL correspond to the same semantic state.

Do not return an HTTP 410 while rendering a generic 404 message unless that behaviour is explicitly required by an existing contract.

Do not create a new error-page framework.

---

# 8. Operational Diagnostics

## 8.1 Requirement

Add safe structured diagnostics for significant operational failures at existing application/controller boundaries.

At minimum cover:

- canonical Reservation creation failure;
- payment initiation failure;
- confirmation-resolution failure.

Use the existing logger/request-ID facilities.

Where available, include safe correlation data such as:

- request ID;
- public journey ID;
- operation;
- controlled outcome/status.

## 8.2 Security

Diagnostics MUST NOT contain:

- payment credentials;
- PayFast passphrase;
- supplier credentials;
- full payment payloads;
- sensitive traveller information;
- database credentials;
- stack traces in customer responses.

The customer-facing response SHALL remain a controlled generic failure/recovery state.

## 8.3 Error Separation

Operational diagnostics SHALL distinguish the operation that failed.

For example:

`reservation_creation_failed`

is distinct from:

`payment_initiation_failed`

and:

`confirmation_resolution_failed`

Do not expose these internal event names to customers unless an existing UI contract requires them.

---

# 9. Accessibility Hardening

Address only the concrete accessibility defects identified by inspection.

## 9.1 Validation Association

Validation summaries and field-level validation messages SHALL be programmatically associated with the affected controls using appropriate accessible relationships such as:

`aria-describedby`

where applicable.

Controls with validation errors SHALL expose their invalid state appropriately.

## 9.2 Focus

After validation failure, focus behaviour SHOULD allow keyboard and assistive-technology users to reach the validation summary or first invalid field efficiently.

Do not introduce a general frontend accessibility framework.

## 9.3 Accommodation Controls

Accommodation room/rate controls SHALL have explicit, reliable label/control associations.

Do not rely solely on wrapping labels.

---

# 10. Duplicate-Action Protection

Customer-facing mutation controls SHALL provide basic UI protection against accidental repeated submission.

At minimum review:

- Review confirmation;
- Payment initiation;
- other mutation actions where repeated clicks can cause meaningful duplicate work.

The UI MAY disable the initiating control or display a loading/submitting state after submission.

Server-side protection remains authoritative.

UI protection SHALL NOT be treated as a replacement for application-level idempotency.

The implementation SHALL NOT introduce a generic frontend state-management framework.

---

# 11. Existing Payment and Confirmation Safety

The following already-correct behaviour SHALL be preserved:

- payment amount comes from canonical Reservation state;
- currency is authoritative;
- browser payment status is ignored;
- PayFast credentials/passphrase are not exposed;
- confirmation requires authoritative Reservation/payment/fulfilment state;
- internal Reservation IDs are not unnecessarily exposed.

IMP-012 SHALL NOT redesign payment or confirmation architecture.

The existing PayFast callback/status-refresh limitation is explicitly outside this capability.

---

# 12. Existing Error Handling

The existing global error middleware correctly prevents raw exceptions and stack traces from reaching customers.

This behaviour SHALL remain unchanged.

IMP-012 SHALL improve diagnostic context without exposing internal errors.

Do not replace the existing global error architecture.

---

# 13. View Model / Template Robustness

Correct only the concrete template/runtime risks identified by inspection.

At minimum:

- confirmation SHALL not select an inappropriate reservation when multiple records exist;
- confirmation markup SHALL not render literal stray `+` characters;
- Review SHALL handle missing/empty authoritative guest/accommodation state with a controlled recovery;
- optional data SHALL not cause template runtime failures.

Do not perform unrelated View Model refactoring.

---

# 14. State and Process Boundaries

Accommodation selection currently uses a process-local map keyed by public journey ID.

Guest Information currently requires an authoritative continuation mechanism before Review.

IMP-012 SHALL address the Guest Information → Review continuity gap.

It SHALL NOT expand into a general distributed session/state-management implementation.

Do not introduce a persistent workflow/session framework merely to solve unrelated future scalability concerns.

---

# 15. Test Requirements

Add or update focused tests for the concrete hardening requirements.

## 15.1 Guest / Review Continuation

Test:

- validated guest information survives Guest → Review;
- all required guest fields survive;
- DOB and nationality are not lost;
- lead traveller identity is preserved;
- Review GET can recover authoritative guest state;
- browser-modified hidden guest values cannot replace authoritative state.

## 15.2 Reservation Idempotency

Test:

- repeated Review confirmation returns the same canonical Reservation;
- Reservation number is not replaced;
- authoritative snapshots are not overwritten by replay;
- concurrent confirmation resolves to one Reservation.

## 15.3 Route Failure Mapping

Test:

- malformed journey ID;
- unknown journey ID;
- unavailable/expired journey;
- payment route invalid journey;
- payment-return invalid journey;
- correct HTTP status;
- correct customer-facing presentation.

## 15.4 PRG

Test successful mutation routes where PRG is introduced.

Verify:

- resulting GET is reachable;
- public journey ID is preserved;
- refresh does not repeat the mutation;
- validation failures still redisplay correctly.

## 15.5 Diagnostics

Test that:

- Reservation creation failure generates safe structured diagnostics;
- payment initiation failure generates safe structured diagnostics;
- confirmation-resolution failure generates safe structured diagnostics;
- request/journey correlation is available where supported;
- sensitive information is not logged.

## 15.6 Accessibility

Test or inspect:

- validation message/control association;
- invalid control state;
- explicit accommodation label/control association;
- focus behaviour after validation failure.

## 15.7 Duplicate Actions

Test:

- UI submission protection exists;
- server-side idempotency remains authoritative;
- repeated requests cannot create duplicate Reservations.

## 15.8 Regression

Existing IMP-003 through IMP-011 tests SHALL continue to pass.

---

# 16. Scope

Included:

- authoritative Guest → Review continuation;
- Review → Reservation idempotency;
- targeted PRG improvements;
- consistent frontend route state/status mapping;
- safe operational diagnostics;
- targeted accessibility hardening;
- duplicate-action UI protection;
- associated regression tests.

Excluded:

- authentication;
- customer accounts;
- session framework;
- workflow engine;
- distributed state architecture;
- payment architecture changes;
- PayFast callback redesign;
- supplier API changes;
- AI;
- dynamic itinerary generation;
- voucher/document generation;
- communications;
- broad accessibility redesign;
- visual redesign;
- unrelated refactoring;
- lint-baseline remediation.

---

# 17. Lint Baseline

Maintain the established baseline:

**0 errors, 10 pre-existing warnings.**

IMP-012 SHALL introduce:

**0 new warnings.**

Do not weaken lint rules.

Do not suppress warnings.

Do not perform unrelated lint cleanup.

---

# 18. Decision-Gap Rule

The bounded inspection identified no architectural decision gap.

Implementation SHALL proceed using the existing architecture.

If implementation reveals a genuine contradiction involving:

- authoritative Guest state;
- Reservation ownership;
- Reservation idempotency;
- route identity;
- payment authority;

implementation SHALL stop and report:

1. affected boundary;
2. current implementation;
3. governing requirement;
4. exact contradiction;
5. minimum architectural decision required.

Do not invent a workaround.

---

# 19. Verification

Run focused IMP-012 tests first.

Then run:

`npm run type-check`

`npm test -- --runInBand`

`npx prisma generate`

`npx prisma validate`

`npm run build`

`npm run lint`

Run `git diff --check`.

Report exact suite/test counts and every verification result.

Full regression SHALL be run unless an environmental failure prevents it.

No commit or push SHALL be performed by Copilot.

---

# 20. Worktree Discipline

Do not modify unrelated files.

Generated `dist` output SHALL follow the repository's established generated-output convention.

Do not modify Prisma schema or create migrations unless implementation of the approved IMP-012 scope genuinely requires one.

No migration is expected from the current specification.

No specification files other than the approved IMP-012 implementation specification SHALL be modified.

---

# 21. Implementation Report

The report SHALL contain:

## Status

`IMPLEMENTED`, `PARTIAL`, or `BLOCKED`.

## Guest / Review Continuation

Explain how validated Guest Information is now authoritative through Review.

## Reservation Idempotency

Explain how repeated/concurrent Review confirmation is handled.

## PRG

List the mutation routes changed and explain the resulting behaviour.

## Route Mapping

Explain invalid/not-found/unavailable handling.

## Diagnostics

List the operational failure paths with structured diagnostics.

## Accessibility

List the concrete accessibility corrections.

## Duplicate Actions

Explain UI and server-side protection.

## Tests

Report focused and full regression suite/test counts.

## Verification

Report:

- type-check;
- tests;
- Prisma generate;
- Prisma validate;
- build;
- lint;
- `git diff --check`.

## Lint

Report final warning count and whether any new warnings were introduced.

## Decision Gaps

State:

`No unresolved decision gap.`

or provide the exact contradiction.

## Scope

Confirm:

- no AI;
- no authentication;
- no session/workflow framework;
- no payment architecture changes;
- no supplier changes;
- no unrelated refactoring;
- no unrelated schema changes;
- no commit;
- no push.

---

# 22. Acceptance Criteria

IMP-012 SHALL be accepted when:

- [ ] validated Guest Information has an authoritative server-side continuation into Review;
- [ ] Review no longer relies on hidden browser fields as authoritative guest state;
- [ ] DOB and nationality are preserved where applicable;
- [ ] lead traveller identity is preserved;
- [ ] Review refresh/direct GET has controlled behaviour;
- [ ] repeated Review confirmation cannot overwrite an existing authoritative Reservation;
- [ ] Reservation number is stable after replay;
- [ ] concurrent confirmation cannot create duplicate Reservations;
- [ ] applicable successful mutation routes use appropriate PRG behaviour;
- [ ] journey identity survives PRG;
- [ ] invalid/not-found/unavailable route states have consistent HTTP and presentation mapping;
- [ ] payment invalid journey references are handled correctly;
- [ ] Reservation, payment, and confirmation failures produce safe operational diagnostics;
- [ ] sensitive data is not logged;
- [ ] validation errors are associated with affected controls;
- [ ] accommodation controls have explicit label/control associations;
- [ ] duplicate-action UI protection exists for relevant mutation actions;
- [ ] existing payment and confirmation security boundaries remain intact;
- [ ] concrete template/runtime defects are corrected;
- [ ] no generic workflow/session framework is introduced;
- [ ] no payment architecture is changed;
- [ ] no supplier architecture is changed;
- [ ] focused tests pass;
- [ ] full regression passes;
- [ ] type-check passes;
- [ ] Prisma generate passes;
- [ ] Prisma validation passes;
- [ ] build passes;
- [ ] lint passes with 0 errors and no new warnings;
- [ ] `git diff --check` passes.

---

# 23. Traceability

| Authority | Purpose |
|---|---|
| GOV-DEV-001 | Governing development process |
| ARCH-000 | Architectural authority |
| SPEC-030 | Canonical Reservation persistence |
| APP-011 | Anonymous Customer Resolution |
| IMP-003 | Journey Discovery / Detail |
| IMP-004 | Journey Selection |
| IMP-005 | Accommodation Selection |
| IMP-006 | Pricing / Quote |
| IMP-007 | Guest Information |
| IMP-008 | Reservation Review |
| IMP-009 | Payment Experience |
| IMP-010 | Booking Confirmation |
| IMP-011 | Customer Journey Integration |

---

# 24. Scope Discipline

IMP-012 is limited to operational hardening of the existing MVP customer journey.

It SHALL NOT become a redesign of GCT Core.

Copilot SHALL preserve all accepted architectural boundaries and SHALL make the smallest changes necessary to satisfy the acceptance criteria.

No new generic state-management, workflow, identity, payment, supplier, or frontend framework SHALL be introduced.

---

# End of Specification

**Document:** IMP-012 — UI Operational Hardening

**Version:** 1.0

**Status:** Approved for Implementation

**Governing Process:** GOV-DEV-001-DEVELOPMENT-PROCESS.md

**Next Stage:** Copilot Implementation