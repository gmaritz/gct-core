# 19 – Physical Database

**Project:** GCT Core (Go Cape Tours Core Platform)
**Document ID:** 19
**Title:** Physical Database
**Status:** Approved
**Version:** 1.0

---

# Purpose

The Physical Database defines the canonical PostgreSQL database structure used by GCT Core.

It translates the Persistence Model into a relational schema while preserving the integrity of the Domain Model.

The database is an implementation detail of the Infrastructure Layer and must never dictate business behaviour.

---

# Objectives

The Physical Database aims to:

* provide a reliable persistence layer
* preserve Aggregate consistency
* support transactional integrity
* optimise read and write performance
* enforce referential integrity
* support future evolution through migrations

---

# Technology Stack

Database Engine

```text
PostgreSQL
```

Persistence Framework

```text
Prisma ORM
```

Migration Tool

```text
Prisma Migrate
```

Administration

```text
Prisma Studio
```

---

# Architectural Position

```text
Domain Model
      │
Repository
      │
Persistence Mapper
      │
Prisma Client
      │
PostgreSQL
```

The database remains invisible to the Domain Layer.

---

# Design Principles

The database follows these principles:

* Domain-driven
* Normalised where appropriate
* Explicit constraints
* Stable identifiers
* Immutable audit history
* Infrastructure isolation

Business rules remain inside Aggregate Roots.

---

# Naming Standards

Tables use:

```text
snake_case
```

Examples:

```text
traveller

reservation

journey

accommodation

payment
```

Columns use:

```text
snake_case
```

Examples:

```text
created_at

updated_at

reservation_status
```

Indexes

```text
idx_reservation_status

idx_traveller_email
```

Foreign Keys

```text
traveller_id

journey_id

reservation_id
```

Constraints

```text
pk_

fk_

uk_

chk_
```

---

# Primary Keys

Every Aggregate table has a single immutable primary key.

Recommended type:

```text
UUID
```

Example

```text
reservation.id UUID PRIMARY KEY
```

Primary keys never change.

---

# Foreign Keys

Relationships use explicit foreign keys.

Example

```text
reservation.traveller_id

reservation.journey_id
```

Foreign keys preserve referential integrity.

---

# Aggregate Tables

Primary Aggregate tables include:

```text
traveller

reservation

journey

accommodation

payment

supplier

operational_schedule
```

Each Aggregate has its own repository.

---

# Supporting Tables

Supporting entities are stored separately where required.

Examples:

```text
reservation_note

journey_day

journey_stop

reservation_traveller
```

Supporting tables remain owned by their Aggregate.

---

# Value Objects

Value Objects are persisted as columns within Aggregate tables unless complexity requires dedicated tables.

Examples

Money

```text
amount

currency
```

DateRange

```text
start_date

end_date
```

EmailAddress

```text
email
```

Value Objects remain invisible outside the Aggregate.

---

# Enumerations

Business enumerations should use stable database values.

Examples:

```text
reservation_status

journey_status

payment_status

staff_role
```

Enumeration values should never depend upon display text.

---

# Audit Columns

Every Aggregate table should contain:

```text
id

created_at

updated_at

created_by

updated_by
```

Audit information is maintained automatically.

---

# Soft Deletes

Where historical information is required:

```text
is_active

deleted_at

deleted_by
```

Soft deletion preserves historical integrity.

---

# Optimistic Concurrency

Every Aggregate should support optimistic concurrency.

Recommended column:

```text
version INTEGER
```

Repositories perform version checks before updates.

---

# Indexing Strategy

Indexes should support:

Primary keys

Foreign keys

Frequently searched business identifiers

Examples

```text
idx_reservation_status

idx_reservation_travel_date

idx_traveller_email

idx_payment_reference
```

Indexes should reflect business usage patterns.

---

# Unique Constraints

Typical examples:

```text
traveller.email

payment.reference
```

Business uniqueness should be enforced by both the Domain Model and the database.

---

# Check Constraints

Database check constraints may enforce technical integrity.

Examples:

```text
amount >= 0

start_date <= end_date
```

Business validation remains inside the Domain Layer.

---

# Transactions

Database transactions should remain short-lived.

Typical flow:

```text
BEGIN

↓

UPDATE Aggregate

↓

COMMIT
```

Application Services coordinate transactions.

---

# Cascade Rules

Cascade deletes should be used cautiously.

Recommended:

```text
RESTRICT
```

Business deletion decisions belong to Aggregate behaviour.

---

# Time Standards

All timestamps are stored in UTC.

Timezone conversion occurs outside the persistence layer.

---

# Monetary Values

Never store monetary values using floating-point types.

Recommended:

```text
NUMERIC(19,4)
```

Currency stored separately.

---

# Large Objects

Images, PDFs and media files are not stored in PostgreSQL.

Only references should be persisted.

Example:

```text
media_url

storage_key
```

---

# Supplier Data

External supplier identifiers remain separate from internal identifiers.

Example:

```text
supplier_hotel_code

internal_accommodation_id
```

Supplier schemas never become part of the Domain Model.

---

# Event Storage

Domain Events are not stored inside Aggregate tables.

Future event persistence should utilise:

```text
outbox_event
```

or

```text
event_store
```

This remains independent of Aggregate persistence.

---

# Migration Strategy

All schema changes occur through Prisma Migrate.

Manual database changes are prohibited.

Every migration should:

* be version controlled
* be repeatable
* include rollback considerations
* preserve existing data

---

# Backup Strategy

Production databases should support:

* daily backups
* point-in-time recovery
* encrypted storage
* tested restoration procedures

---

# Performance

Performance optimisation should prioritise:

* correct indexing
* query optimisation
* Aggregate boundaries
* transaction duration

Premature denormalisation should be avoided.

---

# Security

Database access occurs only through Infrastructure repositories.

Applications never execute arbitrary SQL.

Credentials are managed through secure configuration.

---

# Monitoring

Operational monitoring should include:

* slow query logging
* connection pool usage
* migration history
* transaction duration
* index utilisation

---

# Relationship to Prisma

The Prisma schema is derived from this document.

Prisma models should mirror Aggregate ownership while remaining implementation-specific.

The Prisma schema is **not** the architectural source of truth.

---

# Anti-Patterns

Avoid:

* business logic in SQL
* business logic in triggers
* exposing database tables externally
* using floating-point money
* manual schema edits
* database-driven domain design
* persistence annotations inside Domain objects

---

# Acceptance Criteria

Implementation is compliant when:

* every Aggregate has a corresponding table
* identifiers remain immutable
* foreign keys preserve integrity
* audit fields are consistently applied
* optimistic concurrency is supported
* migrations are version controlled
* Prisma remains isolated within Infrastructure
* database design reflects the Domain Model

---

# Conclusion

The Physical Database provides the canonical relational implementation of the GCT Core Domain Model. It preserves the principles of Domain-Driven Design by ensuring that persistence remains an infrastructure concern while providing a robust, scalable, and maintainable PostgreSQL foundation. Prisma serves as the implementation layer for this model, allowing the Domain to remain completely independent of database technology.
