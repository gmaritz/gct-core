# SPEC-029 — Repository & Persistence Architecture

## Document Control

| Field | Value |
|---|---|
| Document ID | SPEC-029 |
| Title | Repository & Persistence Architecture |
| Version | 2.0 |
| Status | Draft — Architect Review Required |
| Classification | Implementation Specification |
| Owner | GCT Core System Architecture |
| Project | GCT Core |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS.md |
| Architectural Authority | ARCH-000 |
| Semantic Decision | ADR-001 — Booking, Reservation and Supplier Booking Semantics |
| Logical Model | SPEC-026 v2.0 |
| Physical Model | SPEC-027 v2.0 |
| Prisma Model | SPEC-028 v2.0 |
| Downstream | Reservation Persistence Implementation Specification |

---

# 1. Purpose

This specification defines the canonical repository and persistence architecture for GCT Core.

It establishes:

- repository ownership;
- aggregate persistence boundaries;
- repository abstraction boundaries;
- application/infrastructure separation;
- Prisma repository responsibilities;
- Reservation persistence responsibilities;
- persistence context usage;
- transaction boundaries;
- mapping responsibilities;
- retrieval responsibilities;
- persistence error handling;
- dependency direction.

This specification is intentionally implementation-focused.

It does not redefine the logical or physical data model.

---

# 2. Governing Development Process

This specification is governed by:

`GOV-DEV-001-DEVELOPMENT-PROCESS.md`

The specification is the implementation contract for the repository and persistence layer.

Implementation SHALL NOT begin until this specification has been reviewed and approved.

The mandatory workflow is:

Specification  
→ Architect Review  
→ Implementation by Copilot  
→ Focused Tests + Regression  
→ Copilot Implementation Report  
→ Architect Acceptance  
→ User Commit

Any Copilot implementation prompt derived from this specification SHALL explicitly reference:

`docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`

and instruct Copilot to follow it as the governing development process.

The specification format follows GOV-DEV-001: this entire document is supplied as one complete Markdown document in one copyable block, with no nested Markdown code blocks. :contentReference[oaicite:0]{index=0}

---

# 3. Authoritative Architecture

Repository implementation SHALL follow this authority order:

1. ADR-001
2. SPEC-026 v2.0
3. SPEC-027 v2.0
4. SPEC-028 v2.0
5. Accepted application contracts
6. Existing repository conventions where they do not conflict with the above

Repository code SHALL NOT redefine:

- aggregate boundaries;
- business ownership;
- lifecycle semantics;
- business identifiers;
- persistence relationships.

If implementation cannot satisfy the approved specifications without inventing an architectural decision, implementation SHALL stop and report the decision gap.

---

# 4. Repository Pattern

Repositories provide persistence access to Aggregate Roots.

A repository SHALL:

- persist an Aggregate Root;
- retrieve an Aggregate Root;
- reconstruct the Aggregate Root;
- preserve Aggregate boundaries;
- hide persistence technology;
- translate persistence failures where required.

A repository SHALL NOT:

- contain business rules;
- orchestrate suppliers;
- perform HTTP calls;
- perform payment-provider calls;
- construct unrelated aggregates;
- expose Prisma types outside infrastructure;
- expose database entities through domain interfaces.

---

# 5. Aggregate Persistence Boundary

The Aggregate Root defines the persistence boundary.

The canonical rule is:

> One repository represents one Aggregate Root persistence boundary.

Child entities belonging to an Aggregate SHALL be persisted through the Aggregate Root repository.

They SHALL NOT have independent repositories unless an approved architecture explicitly defines them as Aggregate Roots.

---

# 6. Repository Ownership

Repository interfaces belong to the domain/application architecture.

Concrete repository implementations belong to infrastructure.

Dependency direction SHALL remain:

    Domain
      ↓
    Repository Interface
      ↑
    Application Service
      ↓
    Infrastructure Repository
      ↓
    Prisma
      ↓
    PostgreSQL

The domain layer SHALL have no dependency on:

- Prisma;
- Prisma Client;
- PostgreSQL;
- SQL;
- database models;
- database-specific errors.

---

# 7. Repository Interface Rules

Repository interfaces SHALL express business persistence requirements.

They SHALL use:

- domain entities;
- domain value objects;
- persistence-neutral context types where explicitly approved.

They SHALL NOT expose:

- Prisma models;
- Prisma query types;
- Prisma create/update types;
- SQL;
- database transactions;
- database-specific error types.

---

# 8. Canonical Reservation Repository

The canonical Reservation repository is:

`ReservationRepository`

It is the persistence boundary for:

`Reservation`

The repository SHALL remain persistence-neutral.

The concrete Prisma implementation belongs in infrastructure.

The repository SHALL persist and reconstruct the complete Reservation Aggregate required by the accepted Reservation contract.

---

# 9. Reservation Repository Contract

The canonical repository SHALL support the established Reservation persistence operations.

At minimum:

- `save(...)`
- `findById(...)`

Where established by the accepted Reservation application contract:

- `findByReservationNumber(...)`

Additional lookup operations SHALL NOT be introduced merely because the database can support them.

The repository SHALL return the canonical Reservation Aggregate, not a supplier booking.

---

# 10. Reservation Persistence Context

`ReservationPersistenceContext` SHALL remain a persistence-neutral context used where the accepted Reservation contract requires persistence information not owned directly by the Reservation domain object.

It MAY contain explicitly required information such as:

- originating Booking identity;
- Customer identity;
- reservation number;
- booking start date;
- booking end date;
- other approved persistence context.

It SHALL NOT contain:

- Prisma types;
- SQL;
- database records;
- provider-specific persistence objects.

The context SHALL remain minimal and traceable to an explicit requirement.

---

# 11. Reservation Identity

The repository SHALL distinguish:

**Technical identity**

`Reservation.id`

**Business identity**

`Reservation.reservationNumber`

Both SHALL be persisted where defined by SPEC-028.

`reservationNumber` SHALL be unique.

The repository SHALL NOT substitute:

- Booking number;
- supplier reference;
- supplier confirmation number

for the GCT reservation number.

---

# 12. Booking and Reservation Boundary

The canonical semantic relationship is:

    Booking
        = commercial transaction

    Reservation
        = durable GCT Aggregate Root

Booking SHALL NOT own Reservation as an Aggregate child.

A Booking reference MAY be retained by Reservation persistence where required.

Such a reference represents an association with the originating commercial transaction, not aggregate ownership.

The repository SHALL NOT implement Reservation persistence as a Booking child merely because the physical database contains a Booking relationship.

---

# 13. Booking Item Persistence

Booking Items are Reservation fulfilment components.

They SHALL be persisted through the Reservation persistence boundary.

The Reservation repository SHALL persist and reconstruct the Booking Item state required by the canonical Reservation contract.

A separate `BookingItemRepository` SHALL NOT be introduced unless Booking Item is explicitly promoted to an Aggregate Root by a future approved architecture decision.

---

# 14. Supplier Booking Persistence

Supplier Booking represents an external booking made by Go Cape Tours to fulfil a Reservation Booking Item.

Supplier Booking SHALL remain subordinate to Reservation fulfilment.

The Reservation persistence implementation SHALL preserve the Supplier Booking state required by the approved Reservation contract.

Supplier Booking SHALL NOT become:

- the Reservation Aggregate Root;
- the Reservation lifecycle;
- the Reservation identity.

Supplier API calls SHALL remain outside the repository.

---

# 15. Internal Go Cape Fulfilment

Internal Go Cape fulfilment remains an Operations concern.

Reservation persistence MAY retain references to operational fulfilment where required.

The Reservation repository SHALL NOT own:

- Vehicle;
- Driver;
- Guide;
- Trailer;
- Resource Assignment

as Reservation aggregates.

Operations repositories remain responsible for those aggregates.

---

# 16. Reservation Snapshots

The Reservation repository SHALL persist and reconstruct Reservation-owned historical snapshots, including:

- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- PricingSnapshot;
- PaymentSnapshot.

Snapshots SHALL preserve historical Reservation state.

The repository SHALL NOT reconstruct historical Reservation state by querying mutable master data where the canonical contract requires a snapshot.

---

# 17. Traveller Snapshot

Traveller master data belongs to the Customer Aggregate.

Traveller snapshots belong to Reservation.

The repository SHALL:

- persist the approved snapshot structure;
- preserve required ordering;
- preserve required snapshot metadata;
- reconstruct the snapshot independently of current Traveller master data.

The repository SHALL NOT infer Reservation identity from Traveller email or other mutable contact information.

---

# 18. Journey Snapshot

The Reservation Journey snapshot is Reservation-owned historical state.

The repository SHALL persist the approved snapshot structure.

It SHALL NOT require a live Journey aggregate merely to reconstruct the Reservation snapshot unless an approved specification explicitly establishes such a dependency.

The repository SHALL not substitute a live Journey lookup for the canonical snapshot.

---

# 19. Accommodation Snapshots

Accommodation snapshots SHALL preserve the historical accommodation state required by the Reservation contract.

Where applicable this includes:

- property;
- room;
- rate;
- package;
- package stop;
- stay dates;
- occupancy;
- child ages;
- supplier/provider reference;
- supplier price;
- currency;
- pricing basis;
- booking state/reference.

The repository SHALL reconstruct the snapshot without depending on current mutable supplier or catalogue state.

---

# 20. Pricing Snapshot

PricingSnapshot remains Reservation-owned historical state.

The repository SHALL preserve the approved pricing structure, including where applicable:

- currency;
- total price;
- taxes;
- discounts;
- fees;
- supplier pricing information.

The repository SHALL NOT recalculate historical Reservation pricing during retrieval.

---

# 21. Payment Snapshot

PaymentSnapshot remains Reservation-owned historical state.

The repository SHALL preserve the approved snapshot structure.

The repository SHALL NOT:

- call PayFast;
- retrieve live payment status;
- modify the Payment Aggregate;
- calculate refunds.

Payment remains a separate Financial Aggregate.

---

# 22. Supplier References and State

Reservation-level supplier references/state SHALL remain distinct from Reservation identity and lifecycle.

The repository SHALL persist only the supplier information required by the canonical Reservation contract.

Supplier status SHALL NOT replace the GCT Reservation lifecycle.

Supplier availability SHALL NOT be reconstructed as Reservation state.

---

# 23. Reservation Lifecycle Persistence

The repository SHALL persist the canonical Reservation lifecycle:

- `CREATED`
- `QUOTED`
- `CONFIRMED`
- `AMENDED`
- `CANCELLED`
- `COMPLETED`

Lifecycle mapping between the domain representation and Prisma representation SHALL be explicit.

Unknown or invalid lifecycle values SHALL fail safely.

The repository SHALL NOT translate supplier status codes into GCT Reservation lifecycle states.

---

# 24. Aggregate Reconstruction

Reservation retrieval SHALL reconstruct the complete Reservation Aggregate required by the accepted application contract.

Required reconstruction includes, where applicable:

- technical identity;
- reservation number;
- lifecycle;
- Customer identity;
- booking dates;
- Traveller snapshots;
- Journey snapshot;
- Accommodation snapshots;
- PricingSnapshot;
- PaymentSnapshot;
- Booking Items;
- Supplier Booking state;
- supplier references;
- Reservation timeline;
- Reservation metadata.

Partial reconstruction SHALL NOT be returned as a successful complete Reservation.

---

# 25. Round-Trip Integrity

The repository SHALL support:

    Reservation
        ↓ save
    Persistence
        ↓ retrieve
    Reservation

The reconstructed Reservation SHALL preserve all business state required by the canonical contract.

Round-trip tests SHALL verify:

- identity;
- reservation number;
- lifecycle;
- dates;
- snapshots;
- pricing;
- payment snapshot;
- supplier state;
- Booking Items;
- timeline;
- metadata.

---

# 26. Persistence Mapping

Mapping SHALL occur inside infrastructure.

The mapping boundary is:

    Domain Reservation
        ↓
    Persistence Mapper
        ↓
    Prisma Representation

and:

    Prisma Representation
        ↓
    Persistence Mapper
        ↓
    Domain Reservation

Mappers SHALL perform representation translation only.

They SHALL NOT contain business rules.

---

# 27. Prisma Isolation

Prisma SHALL remain infrastructure-only.

The following SHALL NOT appear in domain/application repository contracts:

- `PrismaClient`;
- Prisma transaction clients;
- Prisma query types;
- Prisma create/update types;
- Prisma model types.

Infrastructure MAY use generated Prisma types internally.

---

# 28. Canonical Prisma Repository

The concrete Reservation implementation SHALL follow the repository naming convention established by the current source structure and SPEC-028.

The implementation SHALL implement `ReservationRepository`.

It SHALL NOT expose Prisma-specific methods through the domain interface.

The repository SHALL use the authoritative Prisma Client lifecycle established by the infrastructure architecture.

---

# 29. Repository Transaction Boundary

Saving a Reservation containing multiple persistence records SHALL be atomic.

The repository SHALL use the established Prisma transaction mechanism where required.

The transaction SHALL cover the Reservation persistence graph.

The transaction SHALL NOT include:

- Hotelbeds calls;
- PayFast calls;
- QuickBooks calls;
- email delivery;
- external supplier calls;
- unrelated Aggregate Roots.

External operations remain application/integration concerns.

---

# 30. Transaction Context

Transaction implementation details SHALL remain inside infrastructure.

The domain repository interface SHALL NOT expose Prisma transaction clients.

A persistence-neutral transaction abstraction SHALL NOT be introduced unless an actual implementation requirement demonstrates the need.

---

# 31. Save Behaviour

For a new Reservation, persistence SHALL:

1. create the Reservation root;
2. persist required Reservation-owned components;
3. persist required Booking Item state;
4. persist required Supplier Booking state;
5. commit atomically.

For an existing Reservation, persistence SHALL:

1. identify the existing Reservation;
2. persist the changed aggregate state;
3. preserve required historical state;
4. commit atomically.

The exact SQL/Prisma update strategy belongs to implementation.

---

# 32. Conflict Handling

Persistence SHALL fail explicitly on:

- duplicate Reservation number;
- duplicate technical identity;
- invalid required relationship;
- invalid lifecycle mapping;
- optimistic concurrency conflict where applicable.

The repository SHALL NOT silently overwrite another Reservation.

Application services remain responsible for converting persistence conflicts into application-level outcomes.

---

# 33. Optimistic Concurrency

Where the physical model defines Reservation versioning, the repository SHALL use it.

A stale update SHALL fail rather than overwrite a newer Reservation.

The exact Prisma predicate and version implementation SHALL follow SPEC-028.

No alternative concurrency mechanism SHALL be introduced without an approved decision.

---

# 34. Lookup by Reservation Number

Where supported by the repository contract:

`findByReservationNumber(...)`

SHALL:

- use the unique Reservation business identifier;
- return the complete Reservation Aggregate;
- return `null` when no Reservation exists;
- never return a Supplier Booking as a Reservation.

---

# 35. Lookup by Technical Identity

`findById(...)` SHALL:

- use the Reservation technical identity;
- retrieve the complete Reservation persistence graph;
- reconstruct the canonical Reservation Aggregate;
- return `null` when no Reservation exists.

It SHALL NOT use a historical supplier Reservation record as a substitute.

---

# 36. Query Scope

Repository methods SHALL represent approved business persistence queries.

Repositories SHALL NOT expose arbitrary query construction.

Application code SHALL NOT pass:

- Prisma filters;
- raw SQL;
- arbitrary database predicates

into repository methods.

---

# 37. Error Translation

Infrastructure SHALL translate persistence-specific errors where required.

Relevant categories include:

- duplicate business identifier;
- record not found;
- concurrency conflict;
- invalid persistence state;
- database failure.

Prisma-specific errors SHALL NOT leak through domain repository contracts.

---

# 38. Not-Found Semantics

Repository methods returning an optional Aggregate SHALL use the established optional semantics.

For Reservation retrieval:

- existing Reservation → complete Reservation;
- missing Reservation → `null`.

The repository SHALL NOT:

- construct an empty Reservation;
- silently substitute another record;
- expose Prisma-specific not-found errors through the domain contract.

---

# 39. Delete Semantics

Reservation cancellation SHALL NOT be implemented as physical deletion.

Cancellation is:

`Reservation.status = CANCELLED`

If legacy repository interfaces expose deletion of Reservation, that operation SHALL be removed or isolated unless an approved business requirement explicitly requires physical deletion.

Normal Reservation lifecycle management SHALL use state transitions.

---

# 40. Other Aggregate Repositories

Other Aggregate Roots SHALL follow the same repository architecture.

Examples include:

- CustomerRepository;
- QuoteRepository;
- ProductRepository;
- SupplierRepository;
- SupplierProductRepository;
- PaymentRepository;
- InvoiceRepository;
- ItineraryRepository;
- VehicleRepository;
- DriverRepository;
- GuideRepository;
- TrailerRepository.

Only repositories required by active approved capabilities SHALL be implemented.

No repository SHALL be created solely to populate an architectural catalogue.

---

# 41. Journey Repository Boundary

The existing repository evidence contains Journey persistence inconsistencies, including implementation/schema mismatches.

This specification SHALL NOT invent a new Journey Prisma model.

Journey persistence SHALL be addressed only where required by an approved Journey capability and an explicit persistence specification.

No mechanical Prisma model creation is authorised by SPEC-029.

If implementation of Reservation persistence encounters a genuine Journey dependency that cannot be resolved from the approved contracts, implementation SHALL stop and report the decision gap.

---

# 42. Legacy Repository Ownership

The current repository history contains evidence of repository filename/class mismatches and cross-mapped implementations.

The reconciled architecture requires:

    Reservation repository
        → Reservation persistence

    Journey repository
        → Journey persistence

where those repositories are actually required.

Incorrect historical ownership SHALL NOT be preserved merely to avoid correcting filenames or exports.

Only repository changes directly required by the approved Reservation persistence iteration are in scope.

---

# 43. Prisma Client Ownership

There SHALL be one authoritative Prisma Client lifecycle.

Repositories SHALL use the established infrastructure mechanism.

Repositories SHALL NOT:

- instantiate competing Prisma clients;
- maintain independent Prisma singleton implementations;
- expose Prisma lifecycle management to the domain.

If the current repository contains competing Prisma Client lifecycle implementations, the active implementation SHALL be identified and the conflict resolved only where it is directly required by the approved persistence iteration.

---

# 44. Repository Dependency Injection

Repositories SHALL receive infrastructure dependencies through the established composition/DI mechanism.

A repository SHALL NOT:

- instantiate itself;
- load environment configuration;
- construct application services;
- construct external provider clients.

Dependency direction remains:

    Composition Root
        ↓
    Repository Implementation
        ↓
    Prisma Client

---

# 45. External Provider Boundary

Repositories SHALL NOT directly call:

- Hotelbeds;
- PayFast;
- QuickBooks;
- email providers;
- other external APIs.

Provider interaction belongs to application/integration infrastructure.

The repository persists the result of an application/provider operation.

It does not orchestrate that operation.

---

# 46. Supplier Booking Boundary

Supplier Booking persistence records the state/result of external fulfilment.

The correct separation is:

    Application Service
        ↓
    Supplier Integration
        ↓
    Supplier Result
        ↓
    Reservation Persistence

The Reservation repository SHALL NOT perform the supplier call.

---

# 47. Reservation Persistence Workflow

The intended workflow is:

    Application Service
        ↓
    Reservation Aggregate
        ↓
    ReservationRepository
        ↓
    Prisma Reservation Repository
        ↓
    Prisma Client
        ↓
    PostgreSQL

For external fulfilment:

    Application Service
        ├── Supplier Integration
        │       ↓
        │   Supplier Result
        │
        └── ReservationRepository
                ↓
            PostgreSQL

The repository remains passive with respect to business orchestration.

---

# 48. Persistence Context Rules

`ReservationPersistenceContext` SHALL be:

- persistence-neutral;
- explicitly typed;
- minimal;
- traceable;
- immutable where practical.

It SHALL NOT become a generic container for arbitrary Prisma requirements.

Every context property SHALL have a documented reason for existence.

---

# 49. No Implicit Data Derivation

The repository SHALL NOT derive critical business values from unrelated records.

Examples:

- Customer ID SHALL NOT be inferred from Traveller email.
- Reservation dates SHALL NOT be inferred from arbitrary Booking Items.
- Reservation number SHALL NOT be generated from technical identity during retrieval.
- GCT lifecycle SHALL NOT be inferred from supplier status.
- Final GCT price SHALL NOT be reconstructed from supplier prices.

Required Reservation state must be explicitly provided by the accepted contract.

---

# 50. Persistence Semantic Mapping

The repository mapper SHALL preserve the distinction between:

| Domain Concept | Persistence Concept |
|---|---|
| Booking | Commercial Booking transaction |
| Reservation | GCT Reservation persistence root |
| Booking Item | Reservation fulfilment component |
| Supplier Booking | External fulfilment record |
| Traveller Snapshot | Reservation-owned historical state |
| Journey Snapshot | Reservation-owned historical state |
| Accommodation Snapshot | Reservation-owned historical state |
| PricingSnapshot | Reservation-owned historical state |
| PaymentSnapshot | Reservation-owned historical state |

The mapper SHALL NOT collapse these concepts.

---

# 51. Repository Testing

Focused repository tests SHALL cover:

- Reservation creation;
- Reservation update;
- Reservation retrieval;
- Reservation number lookup;
- duplicate Reservation number;
- lifecycle mapping;
- snapshot round trip;
- Booking Item round trip;
- Supplier Booking round trip;
- pending Supplier Booking state;
- internal fulfilment references where applicable;
- concurrency where applicable;
- transaction rollback on persistence failure.

Tests SHALL not call external supplier APIs.

---

# 52. Verification Requirements

After implementation, Copilot SHALL run:

- focused repository tests;
- full Jest regression;
- `npm run build`;
- `npx prisma generate`;
- `npx prisma validate`;
- `npm run lint`.

The full regression requirement follows GOV-DEV-001. Existing unrelated lint warnings SHALL NOT trigger unrelated remediation.

The objective is to establish correctness of the current iteration, not to create an additional governance process. :contentReference[oaicite:1]{index=1}

---

# 53. Database Safety

During implementation:

- no production database changes are permitted unless explicitly authorised by the current implementation specification;
- no manual schema changes are permitted;
- Prisma migrations SHALL be used for approved schema changes;
- persistent test data SHALL NOT be created outside the approved test strategy;
- schema changes SHALL remain within the approved iteration.

GOV-DEV-001 specifically prohibits database migrations or production database changes unless required by the current specification. :contentReference[oaicite:2]{index=2}

---

# 54. Scope Discipline

Copilot SHALL:

- inspect the current repository before modification;
- compare repository implementation against SPEC-026, SPEC-027 and SPEC-028;
- preserve accepted Reservation application behaviour;
- implement only the current iteration;
- keep Prisma isolated to infrastructure;
- preserve Reservation as Aggregate Root;
- preserve Booking as the commercial transaction;
- preserve Supplier Booking as fulfilment;
- preserve previous accepted behaviour.

Copilot SHALL NOT:

- create a new Aggregate Root;
- move Reservation under Booking;
- treat Supplier Booking as Reservation;
- invent Journey persistence;
- introduce provider calls into repositories;
- expose Prisma through repository interfaces;
- introduce speculative abstractions;
- refactor unrelated repositories;
- perform unrelated technical-debt remediation.

This follows the scope-discipline requirements of GOV-DEV-001. :contentReference[oaicite:3]{index=3}

---

# 55. Decision-Gap Rule

Implementation SHALL stop and report a decision gap if the approved specifications do not define:

- aggregate ownership;
- required persistence state;
- required relationship;
- lifecycle mapping;
- business identifier;
- snapshot structure;
- transaction boundary.

Copilot SHALL report:

1. the exact missing decision;
2. the affected file/model;
3. why implementation cannot proceed safely.

Copilot SHALL NOT invent the missing architecture.

---

# 56. Acceptance Criteria

SPEC-029 v2.0 is ready for architect approval when:

- [ ] Repository interfaces remain persistence-neutral.
- [ ] Aggregate Roots define repository boundaries.
- [ ] Child entities are persisted through their owning Aggregate.
- [ ] ReservationRepository is the canonical Reservation persistence boundary.
- [ ] Reservation remains the Aggregate Root.
- [ ] Booking remains the commercial transaction.
- [ ] Booking does not own Reservation.
- [ ] Booking Items belong to Reservation fulfilment.
- [ ] Supplier Bookings remain external fulfilment records.
- [ ] Internal Go Cape fulfilment remains an Operations concern.
- [ ] ReservationPersistenceContext remains persistence-neutral.
- [ ] Reservation identity and reservation number remain distinct.
- [ ] Complete Reservation reconstruction is required.
- [ ] Historical snapshots remain Reservation-owned.
- [ ] Supplier state remains separate from Reservation lifecycle.
- [ ] Prisma remains isolated to infrastructure.
- [ ] Prisma Client has one authoritative lifecycle.
- [ ] Transactions remain inside infrastructure.
- [ ] External provider calls remain outside repositories.
- [ ] Persistence errors are translated at the infrastructure boundary.
- [ ] Repository interfaces expose no Prisma types.
- [ ] Journey persistence is not invented by this specification.
- [ ] No unrelated repository redesign is introduced.
- [ ] Full regression remains mandatory.
- [ ] No unrelated lint remediation is introduced.
- [ ] Decision gaps stop implementation rather than being invented.

---

# 57. Traceability

| Authority | Purpose |
|---|---|
| GOV-DEV-001 | Governing development process |
| ARCH-000 | Architecture authority |
| ADR-001 | Booking/Reservation/Supplier Booking semantics |
| SPEC-026 v2.0 | Canonical logical model |
| SPEC-027 v2.0 | Canonical physical model |
| SPEC-028 v2.0 | Canonical Prisma model |
| APP-004.1 | Reservation Aggregate |
| 3K-C | Canonical Reservation contract |

---

# 58. Superseded Repository Assumptions

The following historical assumptions are superseded:

1. Booking is the persistence owner of Reservation.
2. The supplier-side Reservation record is the canonical GCT Reservation.
3. Repository implementation may infer Reservation context from unrelated records.
4. Supplier status may substitute for GCT Reservation lifecycle.
5. Prisma types may leak through repository boundaries.
6. Historical filename/class mismatches define repository ownership.
7. Multiple competing Prisma Client lifecycle implementations may coexist.

Historical implementation artefacts remain subject to reconciliation and SHALL NOT be treated as architectural authority.

---

# 59. Preserved Repository Architecture

The following remain preserved:

- domain repository interfaces;
- Clean Architecture dependency direction;
- repository isolation;
- Aggregate-based persistence;
- Prisma infrastructure isolation;
- application-service orchestration;
- domain-owned business rules;
- supplier integration separation;
- Financial Aggregate separation;
- Operations Aggregate separation;
- accepted Reservation application contract;
- accepted Reservation lifecycle.

This specification reconciles persistence architecture without restarting GCT Core.

---

# 60. Next Implementation Specification

After SPEC-029 v2.0 approval, the next artifact SHALL be a focused Reservation persistence implementation specification.

That implementation specification SHALL define only the concrete changes required to:

- align the Reservation Prisma model with SPEC-028;
- align ReservationRepository with the canonical Reservation Aggregate;
- implement ReservationPersistenceContext where required;
- implement complete Reservation round-trip persistence;
- reconcile Supplier Booking persistence;
- remove the obsolete Booking-as-Reservation persistence workaround;
- resolve directly related mapper/repository inconsistencies;
- preserve accepted application behaviour.

It SHALL NOT expand into unrelated:

- Journey redesign;
- API work;
- supplier integration work;
- payment work;
- lint remediation;
- repository-wide refactoring;
- future capabilities.

---

# 61. Definition of Done

The Repository & Persistence Architecture iteration is ready for implementation when:

- Reservation has one canonical repository boundary;
- Reservation persistence is defined as Aggregate persistence;
- Booking/Reservation/Supplier Booking semantics are preserved;
- Prisma remains infrastructure-only;
- external providers remain outside repositories;
- repository contracts are persistence-neutral;
- no unresolved architectural decision is hidden in implementation;
- focused tests are defined;
- full regression is defined;
- build, Prisma validation and lint verification are defined;
- the specification is architect-approved.

After implementation, the iteration is complete only when the Copilot report has been assessed and the architect has accepted the implementation in accordance with GOV-DEV-001. :contentReference[oaicite:4]{index=4}

---

# End of Specification

**Document:** SPEC-029 — Repository & Persistence Architecture

**Version:** 2.0

**Status:** Draft — Architect Review Required

**Next:** Reservation Persistence Implementation Specification