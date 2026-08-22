# ADR-001 – Booking, Reservation and Supplier Booking Semantics

## Document Control

| Property | Value |
|---|---|
| ADR ID | ADR-001 |
| Title | Booking, Reservation and Supplier Booking Semantics |
| Version | 1.0.0 |
| Status | Proposed |
| Classification | Architecture Decision |
| Owner | GCT Core System Architecture |
| Applies To | GCT Core |
| Parent Authority | ARCH-000 – Architecture Manifest |
| Governing Specification | SPEC-000 – Engineering Specification Standard |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS.md |
| Date | 2026-08-22 |

---

# Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0.0 | 2026-08-22 | Initial architectural reconciliation of Booking, Reservation and Supplier Booking semantics | GCT Core System Architecture |

---

# Status

**PROPOSED — ARCHITECTURE REVIEW REQUIRED**

This ADR records the proposed architectural reconciliation resulting from the read-only review of the current GCT Core repository and the clarified Go Cape Tours business model.

Only an Approved ADR may influence future architecture.

This ADR does not authorise implementation.

---

# Decision Category

**Primary Category:** Domain

**Secondary Categories:** Architecture, Database

---

# 1. Context

GCT Core contains an extensive established architecture and specification baseline.

The repository contains two historical interpretations of the terms `Booking` and `Reservation`.

The earlier business and physical model establishes:

    Booking
        └── Booking Item
                └── Reservation

The physical `reservation` concept was documented as representing reservations made with external suppliers.

Later application architecture, particularly APP-004.1 and the 3K-C Reservation Contract Consolidation, establishes:

    Reservation

as the canonical application Aggregate Root with its own:

- identity;
- reservation number;
- lifecycle;
- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- PricingSnapshot;
- PaymentSnapshot;
- supplier references/state;
- timeline;
- metadata.

The two interpretations created a semantic collision.

PERSISTENCE-B3L subsequently attempted to reconcile the newer canonical Reservation aggregate with the older Booking-root physical model.

The resulting persistence design demonstrated that the business semantics should be reconciled before further persistence implementation.

The business model has now been clarified as follows:

- Booking is the commercial transaction/process initiated by the client.
- Reservation is the durable business record created and managed by Go Cape Tours.
- A Reservation can exist before all fulfilment bookings have been made.
- A Reservation consists of multiple fulfilment components.
- Some components are fulfilled directly by Go Cape Tours.
- Some components require external supplier bookings.
- Supplier availability is a fulfilment input, not Reservation lifecycle state.
- Go Cape internal resource availability is also a fulfilment input.
- A supplier becoming unavailable normally results in supplier substitution rather than cancellation of the client's Reservation.
- Day Tours and Package Tours use the same Reservation model.
- Package Tours additionally contain accommodation components.
- Reservation amendment and cancellation are governed by GCT business policies independently of individual supplier states.

---

# 2. Problem Statement

GCT Core currently contains overlapping meanings for `Reservation`.

The historical physical model uses Reservation to represent an external supplier booking.

The later canonical application model uses Reservation to represent the complete GCT commercial and fulfilment record.

These concepts are not equivalent.

Continuing implementation without resolving this semantic collision risks:

- treating supplier bookings as the Reservation;
- coupling Reservation lifecycle to supplier lifecycle;
- forcing the canonical Reservation aggregate into the Booking physical root;
- incorrectly modelling Go Cape internal fulfilment as supplier state;
- creating duplicate commercial roots;
- introducing persistence workarounds instead of modelling the business correctly;
- creating further divergence between application architecture and physical architecture.

The architecture therefore requires an explicit semantic decision.

---

# 3. Decision

## 3.1 Reservation Remains the Aggregate Root

`Reservation` SHALL remain the canonical Aggregate Root for the GCT Core Reservation Capability.

The canonical application aggregate remains:

    application/reservations/Reservation

Reservation SHALL NOT be modelled as a child entity of a Booking aggregate.

Reservation owns the business state required to represent and manage the client's secured Go Cape experience.

---

## 3.2 Booking Represents the Commercial Transaction

`Booking` SHALL represent the commercial transaction/process initiated by the client.

Booking is the action through which the client commits to securing a Go Cape Tours experience.

Booking SHALL NOT be treated as the parent Aggregate Root of the canonical Reservation.

The Booking process may include:

- client request;
- availability/feasibility assessment;
- pricing;
- commercial commitment;
- applicable deposit/payment;
- establishment of the Reservation.

The business meaning is therefore:

> **Booking is what the client does.**

---

## 3.3 Reservation Represents the Durable GCT Record

`Reservation` SHALL represent the durable business record created by Go Cape Tours from the client's booking transaction and subsequently managed throughout fulfilment.

The Reservation SHALL remain authoritative for:

- Reservation identity;
- reservation number;
- Reservation lifecycle;
- customer context;
- Traveller snapshots;
- Journey snapshot;
- booking dates;
- fulfilment components;
- Accommodation snapshots where applicable;
- PricingSnapshot;
- PaymentSnapshot;
- supplier references/state;
- timeline;
- metadata.

The business meaning is therefore:

> **Reservation is what Go Cape Tours creates and manages.**

---

## 3.4 Booking Items Represent Reservation Components

A `Booking Item` SHALL represent an individual component required to fulfil the Reservation.

Examples include:

- Go Cape transport;
- externally rented transport;
- wine estate experience;
- restaurant;
- attraction;
- activity;
- accommodation;
- other tour/package component.

Booking Items are components of Reservation fulfilment.

They SHALL NOT redefine or replace the Reservation aggregate.

---

## 3.5 Supplier Bookings Represent External Fulfilment

A Supplier Booking SHALL represent an external booking made by Go Cape Tours with a supplier to fulfil a Reservation Booking Item.

Examples include:

- wine estate booking;
- restaurant booking;
- attraction/activity booking;
- accommodation booking;
- externally rented vehicle booking.

Supplier Bookings are fulfilment components of the Reservation.

They are NOT the Reservation itself.

The historical use of the term `Reservation` for this supplier-side concept SHALL be treated as a semantic inconsistency requiring reconciliation.

---

## 3.6 Go Cape Fulfilment Is Not Necessarily a Supplier Booking

Not every Booking Item requires an external supplier.

Go Cape may fulfil a Booking Item directly using its own resources.

Examples include:

- Go Cape vehicle;
- Go Cape driver;
- Go Cape guide;
- other internally managed operational resources.

A Booking Item may therefore be fulfilled through:

- Go Cape internal fulfilment;
- an external Supplier Booking;
- or a combination of fulfilment mechanisms where required.

The architecture SHALL NOT assume that every Booking Item has a Supplier Booking.

---

## 3.7 Availability Is a Fulfilment Concern

Availability SHALL NOT be treated as Reservation lifecycle state.

Reservation fulfilment may depend on:

- supplier availability;
- accommodation availability;
- activity availability;
- restaurant availability;
- vehicle availability;
- driver/guide availability;
- other operational resource availability;
- applicable capacity constraints.

Availability results are inputs to fulfilment and confirmation.

They SHALL NOT replace or redefine Reservation lifecycle state.

---

## 3.8 Supplier State Is Separate from Reservation Lifecycle

The canonical Reservation lifecycle remains:

    CREATED
    QUOTED
    CONFIRMED
    AMENDED
    CANCELLED
    COMPLETED

Supplier states SHALL remain separate.

For example:

    Reservation: CONFIRMED

    Wine Estate A: CONFIRMED
    Restaurant B: PENDING
    Accommodation: CONFIRMED
    Go Cape Vehicle: ALLOCATED

A supplier becoming unavailable SHALL NOT automatically imply that the Reservation is cancelled.

Where possible, Go Cape SHALL substitute another supplier or fulfilment option.

Supplier state therefore contributes to fulfilment decisions without becoming the authoritative Reservation lifecycle.

---

## 3.9 Reservation May Exist Before Complete Fulfilment

A Reservation MAY exist before all Booking Items have been secured.

The expected operational sequence is:

    Client Booking
        ↓
    Reservation created
        ↓
    Fulfilment planning
        ↓
    Internal availability checks
        ↓
    Supplier availability checks
        ↓
    Supplier Bookings / internal allocations
        ↓
    Reservation confirmed

This is an expected GCT business workflow.

The architecture SHALL NOT require all Supplier Bookings to exist before the Reservation can exist.

---

## 3.10 Day Tours and Package Tours Share the Reservation Model

Day Tours and Package Tours SHALL use the same canonical Reservation model.

A Day Tour may contain:

    Transport
    Activities
    Wine experiences
    Restaurants
    Other tour components

A Package Tour may contain the same components plus:

    Accommodation

Accommodation is therefore a Reservation component specific to package-tour composition and does not require a separate Reservation architecture.

---

## 3.11 Reservation Cancellation Is Independent of Supplier State

Reservation cancellation SHALL be governed by the established GCT business cancellation policy.

The cancellation process may consider:

- cancellation timing;
- applicable refund;
- deposit treatment;
- supplier cancellation requirements;
- supplier cancellation costs;
- operational consequences.

Individual supplier cancellation policies are inputs to the cancellation process.

They do not define the Reservation lifecycle.

Accounting consequences outside the GCT Core automated commercial model remain subject to the established manual QuickBooks process.

---

## 3.12 Reservation Amendment Is Independent of Supplier State

A client request to change travel dates or other Reservation details SHALL be treated as a Reservation amendment.

An amendment may require:

- new availability checks;
- supplier amendments;
- supplier cancellation/rebooking;
- resource reassignment;
- pricing changes.

The Reservation remains the authoritative business object throughout this process.

---

# 4. Canonical Conceptual Model

The reconciled conceptual model is:

    Client
      │
      │ initiates
      ▼
    Booking
    commercial transaction/process
      │
      │ establishes
      ▼
    Reservation
    canonical GCT Aggregate Root
      │
      ├── Booking Items
      │     │
      │     ├── Go Cape Fulfilment
      │     │
      │     └── Supplier Booking
      │
      ├── Traveller Snapshots
      ├── Journey Snapshot
      ├── Accommodation Snapshots
      ├── PricingSnapshot
      ├── PaymentSnapshot
      ├── Supplier References / State
      ├── Reservation Timeline
      └── Reservation Metadata

Operational resource fulfilment remains represented by the established Logistics & Operations architecture.

---

# 5. Aggregate Boundary

The Reservation aggregate boundary SHALL be based on the business consistency requirements of the GCT Reservation.

The following remain Reservation-owned state where established by APP-004.1 and 3K-C:

- Reservation identity;
- Reservation lifecycle;
- reservation number;
- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- PricingSnapshot;
- PaymentSnapshot;
- supplier references/state;
- timeline;
- metadata.

External supplier systems SHALL NOT become part of the Reservation aggregate boundary.

Go Cape operational resource aggregates SHALL remain separate aggregates.

Supplier availability and supplier booking systems SHALL remain external systems/processes integrated through the established supplier architecture.

---

# 6. Relationship Between Booking and Reservation

The architectural relationship is:

    Booking
        ↓
    commercial transaction/process
        ↓
    establishes Reservation
        ↓
    Reservation becomes durable business aggregate

Booking SHALL NOT own Reservation as an aggregate child.

Reservation SHALL NOT be reduced to a Booking record.

The two concepts have different business responsibilities:

| Concept | Business Meaning |
|---|---|
| Booking | Client's commercial transaction/action |
| Reservation | Durable GCT business record |
| Booking Item | Component required to fulfil the Reservation |
| Supplier Booking | External fulfilment booking |
| Go Cape Fulfilment | Internal fulfilment of a Booking Item |

---

# 7. Existing Canonical Reservation Contract

The following decisions established by 3K-C remain valid and are preserved:

- canonical aggregate: `application/reservations/Reservation`;
- canonical Reservation lifecycle;
- explicit business `reservationNumber`;
- reservation number distinct from technical identity;
- canonical Reservation application service;
- persistence-neutral `ReservationRepository`;
- `ReservationPersistenceContext`;
- explicit `customerId`;
- `bookingStartDate`;
- `bookingEndDate`;
- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- PricingSnapshot;
- supplier references/state;
- timeline;
- metadata.

This ADR does not replace or redefine those decisions.

---

# 8. Rationale

The selected architecture best represents the actual Go Cape Tours operating model.

The client initiates a Booking with Go Cape.

Go Cape then creates and manages a Reservation representing the experience that has been secured commercially.

The Reservation must remain meaningful while fulfilment is still being arranged.

A Reservation can contain multiple Booking Items.

Each Booking Item can be fulfilled:

- directly by Go Cape;
- by an external supplier;
- through an internal operational resource;
- or through a combination of fulfilment mechanisms.

Supplier availability and Supplier Booking state therefore belong to fulfilment rather than defining the identity or lifecycle of the Reservation.

This allows Go Cape to substitute a supplier when availability changes without unnecessarily cancelling the client's Reservation.

The model also supports the established distinction between Day Tours and Package Tours without requiring separate Reservation architectures.

Most importantly, this decision reconciles the later canonical Reservation application architecture with the useful concepts already present in the earlier Booking and Booking Item model.

---

# 9. Alternatives Considered

## 9.1 Booking Aggregate Root with Reservation as Child

This is the historical interpretation in parts of the commercial and engineering documentation.

**Rejected.**

Reasons:

- incorrectly makes the Booking transaction the long-lived Reservation consistency boundary;
- conflicts with the accepted APP-004.1 Reservation Aggregate;
- conflicts with the 3K-C canonical Reservation contract;
- does not adequately represent Reservation's independent lifecycle;
- creates unnecessary coupling between Booking and Reservation;
- does not accurately represent supplier fulfilment.

---

## 9.2 Reservation Aggregate Root with Supplier Bookings as Components

**Selected.**

Reasons:

- matches the clarified Go Cape business model;
- preserves APP-004.1;
- preserves 3K-C;
- supports delayed supplier fulfilment;
- supports internal Go Cape fulfilment;
- supports supplier substitution;
- supports Day Tours and Package Tours;
- preserves independent Reservation lifecycle;
- preserves historical Reservation state.

---

## 9.3 Supplier Reservation as the Canonical Reservation

**Rejected.**

Reasons:

- Supplier Bookings are only fulfilment components;
- a Reservation exists before all Supplier Bookings;
- multiple Supplier Bookings may contribute to one Reservation;
- some Booking Items are fulfilled directly by Go Cape;
- supplier state must not define GCT Reservation state.

---

## 9.4 Booking and Reservation as Nested Aggregates

**Rejected for the current architecture.**

Reasons:

- creates unnecessary aggregate coupling;
- conflicts with the accepted Reservation Aggregate Root;
- does not provide a useful consistency boundary;
- reproduces the semantic collision identified during reconciliation.

Booking may remain a business/application transaction concept without becoming the parent aggregate of Reservation.

---

# 10. Consequences

## Positive Consequences

- Reservation remains the canonical Aggregate Root.
- The accepted 3K-C contract remains valid.
- Booking retains its correct commercial meaning.
- Supplier Bookings become correctly subordinate fulfilment records.
- Internal Go Cape fulfilment is supported.
- Supplier substitution is naturally supported.
- Day Tours and Package Tours share one Reservation architecture.
- Reservation can exist before complete fulfilment.
- Reservation lifecycle remains independent of supplier lifecycle.
- Historical Reservation state remains representable.
- Existing architecture can be reconciled instead of restarted.
- Physical persistence can be redesigned around correct business semantics.

## Negative Consequences

- Several historical specifications require reconciliation.
- The historical physical `Reservation` terminology may need clarification or replacement.
- The existing Prisma persistence model requires review before further implementation.
- Some repository and persistence mappings may require adjustment.
- The current B3L implementation may require revision or replacement if it conflicts with the reconciled physical model.

---

# 11. Risks

## Risk 1 — Historical documentation remains contradictory

**Mitigation:** Reconcile affected specifications after ADR approval and establish this ADR as the traceability reference.

## Risk 2 — Existing Prisma structures encode the historical meaning

**Mitigation:** Review the physical model before modifying implementation. Do not rename or repurpose database models solely from this ADR.

## Risk 3 — Supplier Booking terminology remains ambiguous

**Mitigation:** Establish explicit terminology in the affected glossary, domain and persistence specifications.

## Risk 4 — Booking becomes incorrectly implemented as an Aggregate Root

**Mitigation:** Maintain Booking as the commercial transaction/process and Reservation as the canonical Aggregate Root.

## Risk 5 — Supplier state becomes coupled to Reservation lifecycle

**Mitigation:** Maintain explicit separation between Reservation lifecycle and supplier fulfilment state.

## Risk 6 — Internal Go Cape fulfilment is incorrectly modelled as supplier state

**Mitigation:** Preserve the distinction between external Supplier Bookings and internal Go Cape resource fulfilment.

---

# 12. Related Architecture

This ADR SHALL be reconciled with the established:

- Business Capability Model;
- Business Entity Model;
- Business Process Model;
- Reservations Context;
- Experience Design Context;
- Partner & Supplier Context;
- Logistics & Operations Context;
- Guest Communications & Messaging Context;
- Brand & Content Management Context;
- canonical Reservation application architecture;
- canonical repository architecture;
- canonical physical data architecture.

Unrelated established architecture SHALL remain unchanged.

---

# 13. Related Specifications

The following specifications are directly affected or require verification during reconciliation:

- `APP-004` — Reservation Capability
- `APP-004.1` — Reservation Aggregate
- `SPEC-026` — Canonical Logical Data Model
- `SPEC-027` — Physical Data Model
- `SPEC-028` — Prisma Data Model
- `SPEC-029` — Repository & Persistence Architecture
- `SPEC-001` — Canonical Domain Model
- `SPEC-002` — Canonical Physical Data Model
- `3K-C` — Reservation Contract Consolidation
- `PERSISTENCE-B3L` — Reservation Physical Persistence Specification

The affected specifications SHALL be reconciled after ADR approval.

No affected specification SHALL be silently rewritten.

---

# 14. Related ADRs

- `ADR-000` — Architecture Decision Record Standard

No previous ADR establishes the Booking/Reservation semantic boundary.

This ADR establishes the first explicit architectural decision for this distinction.

---

# 15. Implementation Impact

This ADR does NOT authorise implementation.

After approval, the following sequence SHALL occur:

    ADR-001 Approval
          ↓
    Identify affected architecture documents
          ↓
    Reconcile affected specifications
          ↓
    Confirm canonical physical model
          ↓
    Revise or replace B3L as required
          ↓
    Architect approval
          ↓
    Implementation
          ↓
    Verification
          ↓
    Acceptance
          ↓
    User commit

The current B3L implementation SHALL remain on architectural hold until the affected persistence documentation has been reconciled.

---

# 16. Documentation Reconciliation

Following approval, the affected documentation SHALL establish the following semantics.

## Booking

> The commercial transaction/process initiated by the client to secure a Go Cape Tours experience.

## Reservation

> The durable GCT business aggregate created from the booking and managed throughout fulfilment and completion.

## Booking Item

> A component of a Reservation that must be fulfilled to deliver the booked experience.

## Supplier Booking

> An external booking made by Go Cape Tours with a supplier to fulfil a Reservation Booking Item.

## Internal Fulfilment

> Fulfilment of a Reservation Booking Item using Go Cape Tours-owned or Go Cape-managed resources.

## Availability

> A fulfilment prerequisite used to determine whether a Booking Item can be secured or allocated.

These definitions SHALL be reconciled with the existing glossary and business/domain terminology before implementation resumes.

---

# 17. Persistence Consequence

The historical physical relationship:

    Booking
        ↓
    Booking Item
        ↓
    Reservation

SHALL NOT automatically be interpreted as:

    Booking Aggregate
        ↓
    Reservation Entity

The physical model must instead distinguish:

- the commercial Booking concept;
- the canonical GCT Reservation;
- Reservation Booking Items;
- external Supplier Bookings;
- internal Go Cape fulfilment;
- operational resource allocations.

The existing physical `reservation` model/table SHALL therefore be reviewed for its actual business semantics before any rename, repurpose, migration or replacement decision is made.

No physical persistence decision is made by this ADR beyond this semantic requirement.

---

# 18. B3L Consequence

`PERSISTENCE-B3L` is placed on **ARCHITECTURAL HOLD**.

The B3L implementation SHALL NOT be accepted or extended until:

1. ADR-001 is approved;
2. affected architecture documents are reconciled;
3. affected specifications are reconciled;
4. the canonical physical Reservation model is confirmed;
5. a revised implementation specification is produced if required.

The current B3L implementation remains an implementation artefact under review and SHALL NOT become the architectural baseline.

---

# 19. Decision Boundary

This ADR deliberately does NOT decide:

- Prisma table names;
- Prisma column names;
- JSON versus relational persistence;
- migration strategy;
- exact repository method signatures beyond the accepted `ReservationRepository` boundary;
- Supplier Booking physical schema;
- Booking Item physical schema changes;
- exact physical relationships;
- API contracts;
- payment implementation;
- QuickBooks integration;
- supplier adapter implementation.

Those decisions SHALL be made in the affected Architecture Documents and subsequent implementation specifications.

---

# 20. Architectural Principle

The following principle is established by this ADR:

> **A Go Cape Tours Booking initiates the commercial transaction. A Reservation is the durable GCT Aggregate Root representing the experience Go Cape has committed to deliver. Booking Items represent the components required to fulfil that Reservation. Supplier Bookings and Go Cape resource allocations are fulfilment mechanisms for those components and are not the Reservation itself.**

This principle SHALL govern subsequent Reservation architecture and persistence decisions.

---

# 21. Governance and Development Process

This ADR has been prepared under:

`GOV-DEV-001-DEVELOPMENT-PROCESS.md`

The governing development process remains:

    Specification
        ↓
    Implementation by Copilot
        ↓
    Focused Tests + Full Regression
        ↓
    Copilot Implementation Report
        ↓
    Architect Acceptance
        ↓
    User Commit

This ADR is an architectural decision and therefore does not replace the implementation specification stage.

If this ADR introduces changes to established Architecture Documents or Specifications:

1. the ADR SHALL be approved;
2. affected Architecture Documents SHALL be updated;
3. affected Specifications SHALL be updated;
4. implementation SHALL proceed only against the reconciled documentation baseline.

No additional routine governance gate is introduced.

---

# 22. Compliance Checklist

Before approval:

### Governance

- [ ] Document Control complete
- [ ] Status correct
- [ ] Revision History updated
- [ ] GOV-DEV-001 compliance confirmed

### Decision

- [ ] Problem clearly defined
- [ ] Decision documented
- [ ] Rationale complete
- [ ] Alternatives considered
- [ ] Consequences documented
- [ ] Risks documented

### Architecture

- [ ] ARCH-000 alignment confirmed
- [ ] SPEC-000 alignment confirmed
- [ ] Related Architecture Documents identified
- [ ] Related Specifications identified
- [ ] Reservation Aggregate Root decision confirmed
- [ ] Booking/Reservation semantic boundary confirmed
- [ ] Supplier Booking semantics confirmed

### Governance

- [ ] Implementation impact assessed
- [ ] Documentation reconciliation identified
- [ ] B3L implementation placed on hold pending reconciliation
- [ ] No implementation authorised before documentation reconciliation

---

# 23. Approval

## Technical Review

**Status:** Pending

## Architecture Review

**Status:** Pending

## Editorial Review

**Status:** Pending

## Final Decision

**Status:** Pending

Upon approval, ADR-001 becomes the authoritative architectural decision for the Booking, Reservation and Supplier Booking semantic boundary.

Affected Architecture Documents and Specifications SHALL then be reconciled before implementation resumes.

---

**End of ADR-001 – Booking, Reservation and Supplier Booking Semantics**