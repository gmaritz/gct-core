# GCT Core – Repositories

**Project:** GCT Core (Go Cape Tours Core Platform)  
**Document:** Repository Design  
**Version:** 1.0  
**Status:** Draft  
**Last Updated:** 19 July 2026

---

# 1. Purpose

This document defines the repository interfaces used by GCT Core.

Repositories provide access to Aggregate Roots while abstracting the underlying persistence technology. They form the boundary between the Domain Layer and the Infrastructure Layer.

Repositories are responsible for retrieving and persisting complete aggregates—not individual entities or database records.

---

# 2. Repository Principles

Repositories should:

- Exist only for Aggregate Roots.
- Hide persistence implementation details.
- Return fully constructed aggregates.
- Preserve aggregate consistency.
- Avoid exposing database concepts.
- Contain no business rules.
- Support transactional consistency.

Repositories are **not** generic CRUD services.

---

# 3. Repository Ownership

| Aggregate Root | Repository |
|----------------|------------|
| Traveller | TravellerRepository |
| Reservation | ReservationRepository |
| Journey | JourneyRepository |
| Experience | ExperienceRepository |
| Accommodation | AccommodationRepository |
| Supplier | SupplierRepository |
| Payment | PaymentRepository |
| Operational Schedule | OperationalScheduleRepository |

No repositories exist for internal entities or value objects.

---

# 4. Common Repository Responsibilities

Repositories are responsible for:

- Loading aggregates
- Persisting aggregates
- Aggregate identity lookups
- Aggregate existence checks
- Optimistic concurrency
- Transaction participation

Repositories are **not** responsible for:

- Validation
- Business decisions
- Workflow orchestration
- DTO mapping
- API responses

---

# 5. Repository Interface Design

Repository interfaces belong to the Domain Layer.

Example:

```typescript
interface ReservationRepository {

    findById(
        reservationId: ReservationId
    ): Promise<Reservation | null>;

    save(
        reservation: Reservation
    ): Promise<void>;

    exists(
        reservationId: ReservationId
    ): Promise<boolean>;

}
```

Infrastructure provides the implementation.

---

# 6. Traveller Repository

Responsibilities

- Retrieve traveller profile
- Persist traveller profile
- Lookup by traveller identifier
- Lookup by email address

Example Methods

```typescript
findById(id)

findByEmail(email)

save(traveller)

exists(id)
```

---

# 7. Reservation Repository

Responsibilities

- Load reservation aggregate
- Persist reservation aggregate
- Lookup by reservation reference
- Lookup active reservations

Example Methods

```typescript
findById(id)

findByReference(reference)

findActive()

save(reservation)
```

---

# 8. Journey Repository

Responsibilities

- Retrieve journey
- Save journey
- Lookup itinerary

Example Methods

```typescript
findById(id)

findByReservation(id)

save(journey)
```

---

# 9. Experience Repository

Responsibilities

- Retrieve experiences
- Save experiences
- Lookup availability

Example Methods

```typescript
findById(id)

findAvailable(criteria)

save(experience)
```

---

# 10. Accommodation Repository

Responsibilities

- Persist accommodation allocations
- Retrieve hotel selections
- Lookup accommodation by reservation

Example Methods

```typescript
findByReservation(id)

save(accommodation)
```

Live supplier searches should be handled by Supplier Services rather than repositories.

---

# 11. Supplier Repository

Responsibilities

- Persist supplier metadata
- Retrieve supplier configuration
- Store mapping information

Example Methods

```typescript
findById(id)

findByCode(code)

save(supplier)
```

Repositories do not communicate directly with supplier APIs.

---

# 12. Payment Repository

Responsibilities

- Persist payment aggregate
- Retrieve payment history

Example Methods

```typescript
findByReservation(id)

findByTransaction(transactionId)

save(payment)
```

---

# 13. Operational Schedule Repository

Responsibilities

- Store operational schedules
- Retrieve daily schedules
- Retrieve Driver-Guide assignments
- Retrieve Driver assignments
- Retrieve Tour Guide assignments

Example Methods

```typescript
findByDate(date)

findByStaffMember(id)

save(schedule)
```

---

# 14. Query Repositories

Some read operations do not require aggregate loading.

Examples:

- Dashboard statistics
- Reporting
- Search
- Availability listings

These should use dedicated Query Repositories rather than Aggregate Repositories.

Examples:

```text
ReservationQueryRepository

JourneyQueryRepository

ReportingQueryRepository

DashboardQueryRepository
```

These repositories support the Query side of CQRS.

---

# 15. Transactions

A repository participates in a single aggregate transaction.

Cross-aggregate consistency should be coordinated by:

- Application Services
- Domain Events

Repositories should never manage distributed transactions.

---

# 16. Repository Implementation

Repository implementations belong to the Infrastructure Layer.

Example:

```text
ReservationRepository

        ▲

ReservationRepositoryPrisma

        ▲

PostgreSQL
```

The Domain Layer remains unaware of Prisma, PostgreSQL or any persistence technology.

---

# 17. Design Guidelines

Repositories should:

- Return Aggregate Roots only.
- Never expose ORM models.
- Never expose database tables.
- Never expose SQL.
- Preserve aggregate invariants.
- Support optimistic concurrency.
- Keep interfaces small and intention-revealing.

---

# 18. Future Enhancements

Potential future repository capabilities include:

- Read replicas for query repositories.
- Caching strategies.
- Event sourcing adapters.
- Multi-tenant repositories.
- Soft-delete policies.
- Audit history repositories.

These enhancements should remain transparent to the Domain Layer.

---

# 19. Conclusion

Repositories provide the persistence boundary between the Domain Layer and Infrastructure Layer. By restricting repositories to Aggregate Roots and keeping them free of business logic, GCT Core maintains a clean separation of concerns while remaining flexible enough to support future persistence technologies and architectural evolution.