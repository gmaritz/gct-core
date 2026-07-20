# SPEC-002 – Canonical Physical Data Model

> **Section 1 of 7 — Global Database Standards**

## Document Control

| Property | Value |
|---|---|
| Specification ID | SPEC-002 |
| Version | 1.1.0 |
| Status | Approved Implementation Specification |

## Purpose

This specification establishes the global standards governing the physical persistence layer of GCT Core. These standards apply to every persistence model, migration, repository implementation and future module.

## Authority

1. Architecture Manifest
2. Architecture Documents
3. Approved Specifications
4. Source Code

Where conflicts exist, the higher authority prevails.

## Architectural Principles

- Domain First
- Persistence Ignorance
- Infrastructure Isolation
- Aggregate Persistence
- Stable Data Model

## Canonical Platform

- PostgreSQL
- Prisma ORM
- Prisma Migrate
- Prisma Studio

## Naming Standards

### Tables
- snake_case
- singular nouns

### Columns
- snake_case

### Primary Keys
- UUID
- Immutable
- Technical identifiers

### Technical Identity vs Business Identity

UUIDs are internal technical identifiers.

Business identifiers (Reservation Number, Payment Reference, Supplier Booking Reference) are separate and may evolve independently.

### Foreign Keys

<aggregate>_id

### Indexes

idx_<table>_<field>

### Constraints

uk_<table>_<field>

fk_<table>_<referenced_table>

chk_<table>_<rule>

## Standard Aggregate Fields

Identity:
- id

Audit:
- created_at
- created_by
- updated_at
- updated_by

### Audit Field Population

Repositories populate audit fields.

Authenticated user UUIDs are stored.

System processes use a configured system identity.

Lifecycle:
- is_active
- deleted_at
- deleted_by

### Soft Delete Visibility

Repositories exclude soft deleted records by default.

Administrative queries explicitly include deleted records.

Optimistic Concurrency:
- version

Version starts at 1 and increments on every successful update.

## Nullability Policy

Business fields default to NOT NULL unless a documented business reason exists.

## Canonical Data Types

- UUID
- VARCHAR
- TEXT
- BOOLEAN
- INTEGER
- NUMERIC(19,4)
- TIMESTAMPTZ
- DateTime

## Date & Time

UTC only.

## Monetary Standards

NUMERIC(19,4)

No floating point values.

## Enumerations

Canonical enums are defined in Section 2.

## Referential Integrity

Foreign keys mandatory.

Default delete behaviour: RESTRICT.

SQL cascade deletes only for true composition relationships.

## Transactions

Aggregate modifications occur within transactions.

Default isolation: READ COMMITTED.

Optimistic concurrency uses the version field.

## Baseline Indexing Principles

Every table includes:

- Primary key index
- Foreign key indexes
- Unique indexes

Business-specific indexes are defined with each aggregate.

## Database Migrations

Prisma Migrate only.

## Seed Data Standards

Idempotent, version controlled.

Only reference data may be seeded.

## Environment Standards

Separate Development, Testing, Staging and Production databases.

## Performance Standards

Indexes follow business access patterns.

## Security Standards

Credentials outside source control.

## Backup & Recovery

- Daily backups
- Point-in-time recovery
- Restoration testing

## Monitoring

- Migration history
- Slow query logging
- Transaction monitoring

## Prohibited Practices

- Business logic in SQL
- Business logic in triggers
- Direct controller database access
- Exposing Prisma models outside Infrastructure
- Floating point monetary values
- Manual production schema changes

## Acceptance Criteria

This section establishes the baseline standards inherited by all future persistence models.

## Copilot Implementation Instructions

Implement these standards exactly. Report deviations rather than introducing new conventions.

## Revision History

| Version | Description |
|---|---|
|1.0.0|Initial specification|
|1.1.0|Governance review recommendations incorporated|
