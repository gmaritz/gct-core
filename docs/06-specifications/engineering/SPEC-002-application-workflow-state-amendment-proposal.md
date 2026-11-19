# SPEC-002 Amendment Proposal: Application-Owned Journey Workflow State

| Property | Value |
|---|---|
| Proposal version | 0.1 |
| Status | Draft — architecture review required |
| Proposed amendment to | [SPEC-002 v1.0.0](SPEC-002-canonical-physical-data-model.md) |
| SPEC-002 owner | Platform Engineering |
| Governing process | [GOV-DEV-001](../../09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md) |
| Approved architectural direction | [ADR-003 v0.2](../../decisions/ADR-003-durable-journey-workflow-state.md); [workflow architecture v0.2](../../04-software-architecture/10-durable-journey-workflow-state-proposal.md) |

This is a proposed amendment, not an approved specification or an approved exception. SPEC-002 v1.0.0 remains the current approved baseline. The wording below has no implementation authority unless reviewed, approved and incorporated through the governing change process. No change to the baseline's approval status, version or owner is asserted here. This proposal does not authorise implementation, schema, migration or database changes.

## 1. Reason and scope

ADR-003 approves a dedicated application-owned, session-scoped Journey workflow-state capability, not a Domain Aggregate Root or Domain Repository. SPEC-002 applies to all persistent data, while sections 5.5 and 8.9 require every persistent representation to trace to a domain concept and Aggregate; sections 9.10 and 12.5 impose related universal traceability requirements. These requirements do not presently define the approved application-owned boundary.

The amendment below addresses only that ADR-003 capability. It does not create a general category of exempt persistence, change ownership of any domain object, or extend the capability to other application states. SPEC-002's domain and Aggregate requirements remain unchanged for all domain persistence and relationships. The clarification is proposed as an amendment to the standard, not as an already authorised exception under section 12.9.

## 2. Proposed changes to SPEC-002

All text and requirements not explicitly identified below remain unchanged.

### 2.1 Sections 1.1 and 5.2: scope of domain alignment

In section 1.1, retain the existing requirements and add after `This specification SHALL NOT define the domain concepts themselves.`:

> The application-owned Journey workflow-state capability governed by section 8.10 has an application-level persistence boundary and remains aligned with the approved Canonical Domain Model.

In section 5.2, retain the existing requirements and add:

> The application-owned Journey workflow-state capability governed by section 8.10 has its own application-level persistence boundary. It SHALL NOT become a Domain Aggregate or change the ownership of an existing Domain Aggregate.

### 2.2 Section 5.5: traceability

Replace section 5.5 with the following precise amendment to its universal rule. Every persistent representation remains subject to authoritative traceability; the domain-concept requirement remains unchanged for every representation except the specifically identified ADR-003 workflow-state capability.

> Every persistent representation SHALL have authoritative traceability. Every representation other than the application-owned Journey workflow state specifically governed by section 8.10 SHALL be traceable to an approved domain concept.
>
> For that specific capability only, the formally recognised application-state traceability basis SHALL be: ADR-003 -> application capability -> persistence port -> physical representation -> Prisma mapping and infrastructure adapter. This basis satisfies the representation-level traceability requirement without classifying the workflow state as a Domain Concept or Aggregate. Associated domain concepts and Aggregate boundaries remain subject to the approved Canonical Domain Model.
>
> Persistent structures SHALL NOT be introduced without an authoritative business definition. For the section 8.10 capability only, the approved architectural decision and application capability SHALL provide the authoritative definition for its workflow-state representation.

### 2.3 Section 8.9: persistence representation traceability

Replace section 8.9 with:

> Every persistent representation SHALL be traceable to the governing Architecture Documents and applicable Engineering Specifications. Every representation other than the application-owned Journey workflow state specifically governed by section 8.10 SHALL also be traceable to an approved Domain Concept, an approved Aggregate and the Canonical Domain Model.
>
> For the section 8.10 capability only, the formally recognised application-state traceability basis SHALL be: ADR-003 -> application capability -> persistence port -> physical representation -> Prisma mapping and infrastructure adapter. This basis fulfils the universal representation-level traceability requirement for that capability; it does not make the workflow state a Domain Concept, Domain Aggregate Root or Domain Entity. Any associated domain concepts and Aggregate boundaries SHALL independently satisfy the ordinary Canonical Domain Model and Aggregate Root requirements.
>
> Persistent structures SHALL NOT exist without authoritative traceability. Traceability SHALL be maintained throughout the lifecycle of the Platform.

### 2.4 New section 8.10: application-owned Journey workflow state

Insert after section 8.9:

> ## 8.10 Application-Owned Journey Workflow State
>
> This section applies only to the durable anonymous Journey workflow-state capability approved by ADR-003 and its approved architecture. It SHALL NOT be used as authority for another application-state capability.
>
> Journey workflow state is an application-owned persistence capability, not a Domain Aggregate Root, Domain Entity or alternative canonical business model. The application workflow service SHALL own lifecycle, ownership coordination, revision, review consistency and retry orchestration. Domain services SHALL retain their existing business rules and validation responsibilities; existing application services retain their established responsibilities.
>
> The application layer SHALL define a persistence-neutral port for this capability. Its infrastructure adapter SHALL implement that port, including representation mapping, atomic persistence mechanics, conditional revision enforcement and infrastructure error translation. The port SHALL express the required outcomes without exposing Prisma, SQL, database-specific types or transaction implementation details to application or domain contracts.
>
> This port and adapter SHALL NOT be classified as a Domain Repository. Domain Repositories and Domain Aggregate persistence SHALL continue to follow the existing Aggregate Root ownership and persistence rules, including sections 8.2 and 8.3.
>
> The canonical Reservation Aggregate owns Reservation lifecycle, Reservation state and its historical PaymentSnapshot, and remains authoritative for its transition to CONFIRMED. The separate canonical Payment Financial Aggregate owns the financial transaction and payment lifecycle and remains authoritative for payment status and financial transaction outcomes. PaymentAttempt remains a separate Reservation-linked persistence entity representing individual payment attempts; it does not replace the Payment Aggregate. Application orchestration coordinates payment and Reservation, evaluates the authoritative payment outcome against applicable Reservation confirmation requirements and coordinates the Reservation confirmation transition. Reservation persistence SHALL NOT modify the Payment Aggregate or retrieve live payment status.
>
> The workflow-state representation SHALL NOT be an alternative Reservation, Customer, Journey or payment model and SHALL NOT independently establish ownership of those domain concepts.
>
> The formally recognised application-state traceability basis under sections 5.5 and 8.9 SHALL follow: ADR-003 -> application capability -> persistence port -> physical representation -> Prisma mapping and infrastructure adapter. The application capability, persistence port, physical representation and mapping SHALL be approved through their relevant specifications before implementation. Applicable domain references and ownership boundaries SHALL remain traceable to the Canonical Domain Model. This section does not prescribe a physical schema, table structure, relationship or Prisma implementation.

### 2.5 Section 9.10: relationship traceability

Replace section 9.10 with:

> Every relationship SHALL have authoritative traceability. Every relationship other than an application-state persistence association specific to the section 8.10 capability SHALL be traceable to an approved Domain Concept, an approved Aggregate, the Canonical Domain Model and applicable Engineering Specifications.
>
> For an application-state persistence association specific to that capability, the formally recognised application-state traceability basis of section 8.10 fulfils this section's universal traceability requirement. An association does not, merely by existing in persistence, become a Domain Model relationship or alter Domain Aggregate ownership. Any actual domain relationship and affected Aggregate boundary SHALL continue to satisfy the ordinary Domain Model and Aggregate traceability requirements. Actual physical relationships and lifecycle behaviour SHALL be defined and approved through the relevant logical and physical specifications.
>
> Relationship definitions SHALL remain consistent with the approved Domain Architecture.

Sections 9.3 and 9.9 remain unchanged. No relationship cardinality, foreign keys or cascade behaviour is prescribed by this proposal.

### 2.6 Section 12.5: verification

Replace section 12.5 with:

> Every persistent representation SHALL be verified as traceable to the governing Architecture Documents, the applicable Engineering Specifications and approved Architecture Decision Records where exceptions exist. Every representation other than the application-owned Journey workflow state specifically governed by section 8.10 SHALL also be verified as traceable to the approved Canonical Domain Model.
>
> For the section 8.10 capability, verification SHALL establish the formally recognised application-state traceability basis: ADR-003 -> application capability -> persistence port -> physical representation -> Prisma mapping and infrastructure adapter. Objective evidence SHALL establish that:
>
> - approved ADR-003 covers the workflow capability;
> - the application capability and persistence-neutral port are defined and approved;
> - the physical representation and Prisma mapping are approved through the relevant specifications;
> - the infrastructure adapter implements the approved port;
> - applicable Domain Model references and Aggregate ownership boundaries remain intact;
> - the Reservation, Payment and PaymentAttempt authority boundaries in section 8.10 remain unchanged.
>
> Traceability SHALL be maintained throughout the lifecycle of the Platform.

Section 12.9 remains unchanged; no exception is approved by this proposal.

## 3. Compatibility and authority

- [ARCH-000](../../04-software-architecture/ARCH-000-architecture-manifest.md) governs architecture and dependency direction; ADR-003 and the approved workflow architecture record the capability's architectural intent.
- [SPEC-001](SPEC-001-canonical-domain-model.md) governs project layering and Domain Repository placement. Its repository rules do not explicitly govern a distinct application persistence port; no amendment is proposed. The application-owned port must not be used to circumvent those rules.
- [SPEC-002](SPEC-002-canonical-physical-data-model.md) governs technology-independent persistence standards. The proposed changes distinguish this single application-owned capability from domain persistence while preserving Aggregate ownership.
- [SPEC-026 v2](SPEC-026-canonical-logical-data-model-v2.0.0.md) governs the canonical logical domain model; [SPEC-027 v2](SPEC-027-physical-data-model%20v2.0.md) governs physical PostgreSQL modelling; [SPEC-028 v2](SPEC-028-prisma-data-model%20v2.0.md) governs Prisma mapping. SPEC-028 section 1 requires its persistence structures to be supported by SPEC-026 and SPEC-027. Before implementation, the responsible architects must reconcile and approve the applicable logical and physical support and Prisma mapping without inventing a domain Aggregate or assuming this amendment alone changes those specifications.
- [SPEC-029 v2](SPEC-029-repository-persistence-architecture-v2.0.0.md) governs Aggregate repository implementation, Prisma isolation and infrastructure transaction details. Its repository rules concern Aggregate Roots; the port in section 8.10 is not a Domain Repository. No amendment to SPEC-029 is proposed for this distinction. Its Reservation transaction boundary remains a separate unresolved prerequisite.
- [APP-006.1](../../07-application/implementations/payments/APP-006.1-payment-aggregate.md) and SPEC-026 section 17 establish the canonical Payment Aggregate; SPEC-026 sections 7 and 12 and SPEC-029 section 21 preserve the Reservation-owned historical PaymentSnapshot.

## 4. Review and remaining prerequisites

Platform Engineering, as SPEC-002 owner, and Platform Architecture must review the proposed amendment and determine its approved version and incorporation. They must verify that the scoped relationship rules and traceability do not weaken domain Aggregate ownership, and reconcile affected specifications before dependent implementation. No separate ADR is proposed: the architectural direction already exists in ADR-003. If reviewers choose an exception rather than an amendment, SPEC-002 section 12.9 requires the exception to be authorised through an approved ADR.

The existing universal domain-concept and Aggregate wording cannot literally be satisfied by the non-domain workflow state without an explicit normative amendment. Sections 5.5, 8.9, 9.10 and 12.5 above therefore retain universal authoritative traceability while recognising the section 8.10 application-state basis only for this capability. These changes remain proposed, not an approved exception or evidence that implementation compliance has already been established.

This review does not resolve Reservation ownership grants or handoff transactions, supplier idempotency, privacy and retention policy, payment, legacy recovery, or the document-control/footer discrepancies in SPEC-026 through SPEC-029. Those remain separate work and prerequisites where applicable.
