# SPEC-027 – Physical Data Model

**Version:** 1.0  
**Status:** Superseded  
**Classification:** Internal  
**Owner:** Enterprise Architecture  
**Project:** GCT Core Platform

---

# Revision History

| Version | Date | Author | Description |
|----------|------|--------|-------------|
| 0.1 | YYYY-MM-DD | Enterprise Architecture | Initial draft |

---

# Purpose

This specification defines the physical persistence model for the GCT Core Platform.

It transforms the canonical logical entities defined in **SPEC-026 – Canonical Logical Data Model** into a relational PostgreSQL database design.

This specification establishes the physical database standards that govern:

- Database tables
- Primary keys
- Foreign keys
- Constraints
- Indexes
- Normalisation
- Audit columns
- Soft deletion
- Naming conventions
- Referential integrity

---

# Scope

This specification defines:

- Physical tables
- Physical relationships
- Column standards
- Key strategies
- Index strategies
- Constraint rules
- Data integrity rules
- Physical naming conventions

This specification does **not** define:

- Prisma models
- SQL migration scripts
- Stored procedures
- API contracts
- Application services

---

# Objectives

The Physical Data Model shall:

- preserve the integrity of the Canonical Logical Model;
- optimise transactional consistency;
- minimise data duplication;
- maximise query performance;
- support future scalability;
- remain independent of application implementation.

---

# Related Specifications

| Specification | Description |
|---------------|-------------|
| SPEC-026 | Canonical Logical Data Model |
| SPEC-028 | Prisma Data Model |
| REST API Specification | API Resources |

---

# 1. Physical Design Principles

## 1.1 Relational Database

The GCT Core Platform shall use PostgreSQL as its authoritative relational database.

All persistent business data shall be stored within PostgreSQL.

---

## 1.2 Normalisation

Business tables shall conform to Third Normal Form (3NF) as the default.

Denormalisation shall only occur where justified by measurable performance requirements.

---

## 1.3 Surrogate Keys

Every business table shall use a surrogate primary key.

Primary keys shall use UUID values.

Example:

```text
id UUID PRIMARY KEY
```

Natural keys may exist but shall not replace surrogate keys.

---

## 1.4 Foreign Keys

Relationships between tables shall be enforced through foreign key constraints.

Every foreign key shall reference the primary key of the parent table.

Example

```text
booking.customer_id

↓

customer.id
```

---

## 1.5 Referential Integrity

Referential integrity shall be enforced by the database.

Application code shall never replace foreign key constraints.

---

## 1.6 Audit Columns

Every master and transactional table shall contain the following columns.

| Column | Type |
|---------|------|
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| created_by | UUID |
| updated_by | UUID |

Where applicable:

| Column | Type |
|---------|------|
| deleted_at | TIMESTAMP NULL |
| deleted_by | UUID NULL |

---

## 1.7 Soft Delete Strategy

Business records shall normally be soft deleted.

Soft deletion shall use:

```text
deleted_at

deleted_by
```

Records shall remain physically present unless permanent deletion is explicitly required.

---

## 1.8 Immutable Data

The following data shall be immutable after creation:

- Payments
- Invoices
- Credit Notes
- Audit Records

Corrections shall be represented using compensating records rather than updates.

---

# 2. Database Naming Standards

## Tables

Tables shall use:

- singular nouns
- lowercase
- snake_case

Examples

```text
customer

booking

supplier_product

payment
```

---

## Columns

Columns shall use:

- lowercase
- snake_case

Examples

```text
customer_id

created_at

updated_at

supplier_code
```

---

## Primary Keys

Primary key column name

```text
id
```

---

## Foreign Keys

Foreign keys shall follow:

```text
<parent>_id
```

Examples

```text
customer_id

booking_id

supplier_id

vehicle_id
```

---

## Junction Tables

Junction tables shall combine participating table names.

Examples

```text
booking_product

package_product

role_permission
```

---

# 3. Standard Table Structure

Unless otherwise specified, every master table shall follow the standard structure.

| Column | Required |
|---------|----------|
| id | Yes |
| created_at | Yes |
| updated_at | Yes |
| created_by | Yes |
| updated_by | Yes |
| deleted_at | Optional |
| deleted_by | Optional |

Business-specific columns are defined within their respective domains.

---


# 4. Commercial Domain Physical Model

## Purpose

The Commercial Domain stores customer information and commercial transactions.

It forms the primary source of truth for customer relationships, quotations, bookings and reservations.

---

# 4.1 Customer Table

## Table Name

```text
customer
```

## Description

Stores customer master records.

---

## Primary Key

```text
id UUID PRIMARY KEY
```

---

## Columns

| Column | Type | Nullable | Description |
|----------|---------|----------|-------------|
| id | UUID | No | Primary Key |
| customer_number | VARCHAR(30) | No | Business identifier |
| customer_type | VARCHAR(30) | No | Individual or Organisation |
| first_name | VARCHAR(100) | Yes | Customer first name |
| last_name | VARCHAR(100) | Yes | Customer surname |
| company_name | VARCHAR(200) | Yes | Organisation name |
| email | VARCHAR(255) | No | Primary email |
| mobile | VARCHAR(50) | Yes | Mobile number |
| telephone | VARCHAR(50) | Yes | Telephone number |
| status | VARCHAR(30) | No | Customer status |
| created_at | TIMESTAMP | No | Audit |
| updated_at | TIMESTAMP | No | Audit |
| created_by | UUID | No | Audit |
| updated_by | UUID | No | Audit |
| deleted_at | TIMESTAMP | Yes | Soft delete |
| deleted_by | UUID | Yes | Soft delete |

---

## Constraints

```text
PK_customer

UK_customer_customer_number

UK_customer_email
```

---

## Indexes

```text
IX_customer_email

IX_customer_last_name

IX_customer_status
```

---

# 4.2 Traveller Table

## Table Name

```text
traveller
```

---

## Description

Stores travellers associated with a customer.

---

## Primary Key

```text
id UUID PRIMARY KEY
```

---

## Foreign Keys

```text
customer_id

REFERENCES customer(id)
```

---

## Columns

| Column | Type | Nullable |
|----------|---------|----------|
| id | UUID | No |
| customer_id | UUID | No |
| title | VARCHAR(20) | Yes |
| first_name | VARCHAR(100) | No |
| last_name | VARCHAR(100) | No |
| date_of_birth | DATE | Yes |
| passport_number | VARCHAR(50) | Yes |
| passport_expiry | DATE | Yes |
| nationality | VARCHAR(100) | Yes |
| dietary_requirements | TEXT | Yes |
| medical_notes | TEXT | Yes |
| created_at | TIMESTAMP | No |
| updated_at | TIMESTAMP | No |

---

## Constraints

```text
PK_traveller

FK_traveller_customer
```

---

## Indexes

```text
IX_traveller_customer

IX_traveller_last_name
```

---

# 4.3 Quote Table

## Table Name

```text
quote
```

---

## Description

Represents a commercial quotation.

---

## Foreign Keys

```text
customer_id

REFERENCES customer(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| customer_id | UUID |
| quote_number | VARCHAR(30) |
| status | VARCHAR(30) |
| valid_from | DATE |
| valid_until | DATE |
| total_amount | NUMERIC(12,2) |
| currency_code | CHAR(3) |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Constraints

```text
PK_quote

FK_quote_customer

UK_quote_number
```

---

## Indexes

```text
IX_quote_customer

IX_quote_status

IX_quote_valid_until
```

---

# 4.4 Booking Table

## Table Name

```text
booking
```

---

## Description

Represents a confirmed customer booking.

---

## Foreign Keys

```text
customer_id

REFERENCES customer(id)

quote_id

REFERENCES quote(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| booking_number | VARCHAR(30) |
| customer_id | UUID |
| quote_id | UUID |
| booking_status | VARCHAR(30) |
| booking_date | DATE |
| travel_start | DATE |
| travel_end | DATE |
| total_amount | NUMERIC(12,2) |
| currency_code | CHAR(3) |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |
| deleted_at | TIMESTAMP |

---

## Constraints

```text
PK_booking

FK_booking_customer

FK_booking_quote

UK_booking_number
```

---

## Indexes

```text
IX_booking_customer

IX_booking_status

IX_booking_travel_start

IX_booking_booking_date
```

---

# 4.5 Booking Item Table

## Table Name

```text
booking_item
```

---

## Description

Represents an individual product within a booking.

---

## Foreign Keys

```text
booking_id

REFERENCES booking(id)

product_id

REFERENCES product(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| booking_id | UUID |
| product_id | UUID |
| supplier_product_id | UUID |
| quantity | INTEGER |
| unit_price | NUMERIC(12,2) |
| total_price | NUMERIC(12,2) |
| start_date | DATE |
| end_date | DATE |

---

## Constraints

```text
PK_booking_item

FK_booking_item_booking

FK_booking_item_product
```

---

## Indexes

```text
IX_booking_item_booking

IX_booking_item_product

IX_booking_item_supplier
```

---

# 4.6 Booking Contact Table

## Table Name

```text
booking_contact
```

---

## Description

Stores booking-specific contact information.

---

## Foreign Keys

```text
booking_id

REFERENCES booking(id)
```

---

## Columns

- id
- booking_id
- contact_name
- email
- telephone
- mobile
- preferred_contact_method

---

# 4.7 Booking Note Table

## Table Name

```text
booking_note
```

---

## Description

Stores internal operational and commercial notes.

---

## Foreign Keys

```text
booking_id

REFERENCES booking(id)

created_by

REFERENCES user(id)
```

---

## Columns

- id
- booking_id
- note_type
- note
- created_at
- created_by

---

# 4.8 Reservation Table

## Table Name

```text
reservation
```

---

## Description

Represents reservations made with external suppliers.

---

## Foreign Keys

```text
booking_item_id

REFERENCES booking_item(id)

supplier_product_id

REFERENCES supplier_product(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| booking_item_id | UUID |
| supplier_product_id | UUID |
| supplier_reference | VARCHAR(100) |
| reservation_status | VARCHAR(30) |
| reserved_at | TIMESTAMP |
| expires_at | TIMESTAMP |
| confirmed_at | TIMESTAMP |

---

## Constraints

```text
PK_reservation

FK_reservation_booking_item

FK_reservation_supplier_product
```

---

## Indexes

```text
IX_reservation_status

IX_reservation_supplier_reference

IX_reservation_booking_item
```

---

# Commercial Domain Relationship Diagram

```text
Customer
    │
    ├──────────────┐
    │              │
Traveller       Quote
                   │
                   │
               Booking
                   │
         ┌─────────┴─────────┐
         │                   │
 Booking Item         Booking Contact
         │
         │
   Reservation
         │
         │
Supplier Product

Booking
    │
    └── Booking Note
```

---

# Commercial Domain Integrity Rules

1. Every Traveller shall belong to exactly one Customer.

2. Every Quote shall belong to exactly one Customer.

3. Every Booking shall belong to exactly one Customer.

4. Every Booking Item shall belong to exactly one Booking.

5. Every Reservation shall belong to exactly one Booking Item.

6. Reservation records shall always reference a Supplier Product.

7. Booking deletion shall use soft delete only.

8. Booking Items shall never exist without a Booking.

9. Customer deletion shall be prohibited while active Bookings exist.

10. Booking Numbers and Quote Numbers shall be globally unique.

---

# 5. Catalogue Domain Physical Model

## Purpose

The Catalogue Domain stores the canonical products offered by Go Cape Tours.

The physical model separates the core `product` table from specialised product tables, allowing different product types to share common attributes while maintaining their own domain-specific data.

The Catalogue Domain is independent of supplier implementations.

---

# 5.1 Product Table

## Table Name

```text
product
```

## Description

Stores the canonical definition of every sellable product.

---

## Primary Key

```text
id UUID PRIMARY KEY
```

---

## Foreign Keys

```text
product_type_id

REFERENCES product_type(id)
```

```text
destination_id

REFERENCES destination(id)
```

---

## Columns

| Column | Type | Nullable | Description |
|----------|------|----------|-------------|
| id | UUID | No | Primary Key |
| product_code | VARCHAR(30) | No | Business identifier |
| name | VARCHAR(200) | No | Product name |
| short_description | TEXT | Yes | Summary |
| description | TEXT | Yes | Full description |
| product_type_id | UUID | No | Product type |
| destination_id | UUID | Yes | Primary destination |
| active | BOOLEAN | No | Availability flag |
| created_at | TIMESTAMP | No | Audit |
| updated_at | TIMESTAMP | No | Audit |
| created_by | UUID | No | Audit |
| updated_by | UUID | No | Audit |
| deleted_at | TIMESTAMP | Yes | Soft delete |
| deleted_by | UUID | Yes | Soft delete |

---

## Constraints

```text
PK_product

UK_product_code

FK_product_type

FK_product_destination
```

---

## Indexes

```text
IX_product_name

IX_product_type

IX_product_destination

IX_product_active
```

---

# 5.2 Product Type Table

## Table Name

```text
product_type
```

---

## Description

Defines the available product classifications.

Examples:

- Tour
- Activity
- Accommodation
- Package

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| code | VARCHAR(30) |
| name | VARCHAR(100) |
| description | TEXT |

---

## Constraints

```text
PK_product_type

UK_product_type_code
```

---

# 5.3 Product Category Table

## Table Name

```text
product_category
```

---

## Description

Stores reusable product categories.

Examples:

- Wine Tour
- Adventure
- Family
- Luxury
- Wildlife
- Cultural

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| code | VARCHAR(30) |
| name | VARCHAR(100) |
| description | TEXT |

---

## Constraints

```text
PK_product_category

UK_product_category_code
```

---

# 5.4 Product Category Junction

## Table Name

```text
product_product_category
```

---

## Purpose

Allows a Product to belong to multiple categories.

---

## Foreign Keys

```text
product_id

REFERENCES product(id)
```

```text
product_category_id

REFERENCES product_category(id)
```

---

## Constraints

```text
PK_product_product_category

FK_product_product_category_product

FK_product_product_category_category

UK_product_category
```

---

# 5.5 Destination Table

## Table Name

```text
destination
```

---

## Description

Stores canonical destinations.

Examples

- Cape Town
- Stellenbosch
- Franschhoek
- Hermanus
- Garden Route

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| code | VARCHAR(30) |
| name | VARCHAR(200) |
| country_code | CHAR(2) |
| latitude | DECIMAL(10,7) |
| longitude | DECIMAL(10,7) |
| description | TEXT |

---

## Constraints

```text
PK_destination

UK_destination_code
```

---

## Indexes

```text
IX_destination_name
```

---

# 5.6 Tour Table

## Table Name

```text
tour
```

---

## Description

Stores attributes specific to tour products.

---

## Foreign Keys

```text
product_id

REFERENCES product(id)
```

---

## Columns

| Column | Type |
|----------|------|
| product_id | UUID |
| duration_days | INTEGER |
| duration_hours | INTEGER |
| minimum_guests | INTEGER |
| maximum_guests | INTEGER |
| private_tour | BOOLEAN |
| pickup_available | BOOLEAN |

---

## Constraints

```text
PK_tour

FK_tour_product
```

---

# 5.7 Activity Table

## Table Name

```text
activity
```

---

## Description

Stores activity-specific information.

---

## Foreign Keys

```text
product_id

REFERENCES product(id)
```

---

## Columns

| Column | Type |
|----------|------|
| product_id | UUID |
| duration_minutes | INTEGER |
| minimum_age | INTEGER |
| maximum_age | INTEGER |
| fitness_level | VARCHAR(30) |
| weather_dependent | BOOLEAN |

---

## Constraints

```text
PK_activity

FK_activity_product
```

---

# 5.8 Accommodation Table

## Table Name

```text
accommodation
```

---

## Description

Stores accommodation-specific information independent of suppliers.

---

## Foreign Keys

```text
product_id

REFERENCES product(id)
```

---

## Columns

| Column | Type |
|----------|------|
| product_id | UUID |
| accommodation_type | VARCHAR(50) |
| star_rating | DECIMAL(2,1) |
| check_in_time | TIME |
| check_out_time | TIME |

---

## Constraints

```text
PK_accommodation

FK_accommodation_product
```

---

# 5.9 Package Table

## Table Name

```text
package
```

---

## Description

Stores package-specific information.

Packages combine multiple canonical products into a single sellable offering.

---

## Foreign Keys

```text
product_id

REFERENCES product(id)
```

---

## Columns

| Column | Type |
|----------|------|
| product_id | UUID |
| minimum_duration_days | INTEGER |
| maximum_duration_days | INTEGER |
| featured | BOOLEAN |

---

## Constraints

```text
PK_package

FK_package_product
```

---

# 5.10 Package Product Junction

## Table Name

```text
package_product
```

---

## Purpose

Defines the products included within a package.

---

## Foreign Keys

```text
package_id

REFERENCES package(product_id)
```

```text
product_id

REFERENCES product(id)
```

---

## Columns

| Column | Type |
|----------|------|
| package_id | UUID |
| product_id | UUID |
| sequence_no | INTEGER |
| mandatory | BOOLEAN |

---

## Constraints

```text
PK_package_product

FK_package_product_package

FK_package_product_product
```

---

## Indexes

```text
IX_package_product_package

IX_package_product_product
```

---

# 5.11 Media Table

## Table Name

```text
media
```

---

## Description

Stores media assets associated with products.

---

## Foreign Keys

```text
product_id

REFERENCES product(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| product_id | UUID |
| media_type | VARCHAR(30) |
| file_name | VARCHAR(255) |
| url | TEXT |
| alt_text | VARCHAR(255) |
| display_order | INTEGER |

---

## Constraints

```text
PK_media

FK_media_product
```

---

## Indexes

```text
IX_media_product

IX_media_display_order
```

---

# Catalogue Domain Relationship Diagram

```text
                    Product Type
                          │
                          │
                          ▼
                     Product
                  ┌─────┼──────┐
                  │     │      │
                  │     │      │
             Destination Media  Categories
                                 │
                                 ▼
                  Product_Product_Category

                     │
     ┌───────────────┼────────────────┐
     │               │                │
     ▼               ▼                ▼
   Tour         Activity      Accommodation
                                      │
                                      ▼
                                  Package
                                      │
                                      ▼
                              Package_Product
                                      │
                                      ▼
                                   Product
```

---

# Catalogue Domain Integrity Rules

1. Every Product shall have exactly one Product Type.

2. A Product may belong to multiple Product Categories.

3. Every Tour shall reference one Product.

4. Every Activity shall reference one Product.

5. Every Accommodation shall reference one Product.

6. Every Package shall reference one Product.

7. Every Package shall contain one or more Products.

8. Products shall never reference Supplier tables directly.

9. Destinations shall be canonical and supplier-independent.

10. Product Codes shall be globally unique across the platform.

---


# 6. Supplier Domain Physical Model

## Purpose

The Supplier Domain stores supplier organisations and the mapping between canonical products and externally supplied inventory.

This domain is responsible for supplier integrations, product mappings, availability, rates, offers, import processing and synchronisation.

The Supplier Domain shall never own canonical products.

---

# 6.1 Supplier Table

## Table Name

```text
supplier
```

## Description

Stores supplier master records.

Examples include:

- Hotelbeds
- Viator
- Bokun
- Rezdy
- Internal Suppliers

---

## Primary Key

```text
id UUID PRIMARY KEY
```

---

## Columns

| Column | Type | Nullable | Description |
|----------|------|----------|-------------|
| id | UUID | No | Primary Key |
| supplier_code | VARCHAR(30) | No | Business identifier |
| name | VARCHAR(200) | No | Supplier name |
| supplier_type | VARCHAR(50) | No | Hotel, Tour, Activity, API, Internal |
| api_provider | VARCHAR(100) | Yes | Integration platform |
| website | VARCHAR(255) | Yes | Website |
| contact_email | VARCHAR(255) | Yes | Primary contact |
| active | BOOLEAN | No | Active supplier |
| created_at | TIMESTAMP | No | Audit |
| updated_at | TIMESTAMP | No | Audit |
| created_by | UUID | No | Audit |
| updated_by | UUID | No | Audit |
| deleted_at | TIMESTAMP | Yes | Soft delete |
| deleted_by | UUID | Yes | Soft delete |

---

## Constraints

```text
PK_supplier

UK_supplier_code
```

---

## Indexes

```text
IX_supplier_name

IX_supplier_type

IX_supplier_active
```

---

# 6.2 Supplier Agreement Table

## Table Name

```text
supplier_agreement
```

---

## Description

Stores contractual agreements with suppliers.

---

## Foreign Keys

```text
supplier_id

REFERENCES supplier(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| supplier_id | UUID |
| agreement_number | VARCHAR(50) |
| effective_from | DATE |
| effective_to | DATE |
| commission_percentage | NUMERIC(5,2) |
| currency_code | CHAR(3) |
| status | VARCHAR(30) |

---

## Constraints

```text
PK_supplier_agreement

FK_supplier_agreement_supplier
```

---

## Indexes

```text
IX_supplier_agreement_supplier

IX_supplier_agreement_status
```

---

# 6.3 Supplier Product Table

## Table Name

```text
supplier_product
```

---

## Description

Maps supplier inventory to canonical products.

One canonical Product may have multiple Supplier Products.

---

## Foreign Keys

```text
supplier_id

REFERENCES supplier(id)
```

```text
product_id

REFERENCES product(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| supplier_id | UUID |
| product_id | UUID |
| supplier_product_code | VARCHAR(100) |
| supplier_name | VARCHAR(255) |
| status | VARCHAR(30) |
| default_supplier | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Constraints

```text
PK_supplier_product

FK_supplier_product_supplier

FK_supplier_product_product

UK_supplier_product_code
```

---

## Indexes

```text
IX_supplier_product_supplier

IX_supplier_product_product

IX_supplier_product_status
```

---

# 6.4 Availability Table

## Table Name

```text
availability
```

---

## Description

Stores supplier availability.

Availability records are snapshots imported from suppliers.

---

## Foreign Keys

```text
supplier_product_id

REFERENCES supplier_product(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| supplier_product_id | UUID |
| available_date | DATE |
| quantity_available | INTEGER |
| minimum_quantity | INTEGER |
| maximum_quantity | INTEGER |
| availability_status | VARCHAR(30) |
| imported_at | TIMESTAMP |

---

## Constraints

```text
PK_availability

FK_availability_supplier_product
```

---

## Indexes

```text
IX_availability_supplier_product

IX_availability_date

IX_availability_status
```

---

# 6.5 Rate Table

## Table Name

```text
rate
```

---

## Description

Stores supplier pricing.

Multiple rates may exist for different travel dates or occupancy combinations.

---

## Foreign Keys

```text
supplier_product_id

REFERENCES supplier_product(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| supplier_product_id | UUID |
| valid_from | DATE |
| valid_to | DATE |
| currency_code | CHAR(3) |
| selling_price | NUMERIC(12,2) |
| net_price | NUMERIC(12,2) |
| commission | NUMERIC(12,2) |
| imported_at | TIMESTAMP |

---

## Constraints

```text
PK_rate

FK_rate_supplier_product
```

---

## Indexes

```text
IX_rate_supplier_product

IX_rate_valid_from

IX_rate_valid_to
```

---

# 6.6 Offer Table

## Table Name

```text
offer
```

---

## Description

Stores promotional offers received from suppliers.

---

## Foreign Keys

```text
supplier_product_id

REFERENCES supplier_product(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| supplier_product_id | UUID |
| offer_name | VARCHAR(255) |
| offer_type | VARCHAR(50) |
| valid_from | DATE |
| valid_to | DATE |
| discount_value | NUMERIC(12,2) |
| discount_type | VARCHAR(20) |

---

## Constraints

```text
PK_offer

FK_offer_supplier_product
```

---

## Indexes

```text
IX_offer_supplier_product

IX_offer_valid_from

IX_offer_valid_to
```

---

# 6.7 Season Table

## Table Name

```text
season
```

---

## Description

Defines supplier seasons used for pricing and availability.

---

## Foreign Keys

```text
supplier_product_id

REFERENCES supplier_product(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| supplier_product_id | UUID |
| season_code | VARCHAR(30) |
| season_name | VARCHAR(100) |
| valid_from | DATE |
| valid_to | DATE |

---

## Constraints

```text
PK_season

FK_season_supplier_product
```

---

## Indexes

```text
IX_season_supplier_product

IX_season_code
```

---

# 6.8 Synchronisation Job Table

## Table Name

```text
synchronisation_job
```

---

## Description

Records every supplier synchronisation executed by the platform.

---

## Foreign Keys

```text
supplier_id

REFERENCES supplier(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| supplier_id | UUID |
| job_type | VARCHAR(50) |
| started_at | TIMESTAMP |
| completed_at | TIMESTAMP |
| records_processed | INTEGER |
| records_failed | INTEGER |
| status | VARCHAR(30) |
| error_message | TEXT |

---

## Constraints

```text
PK_synchronisation_job

FK_synchronisation_job_supplier
```

---

## Indexes

```text
IX_sync_supplier

IX_sync_status

IX_sync_started_at
```

---

# 6.9 Import Batch Table

## Table Name

```text
import_batch
```

---

## Description

Represents a logical import of supplier data.

---

## Foreign Keys

```text
synchronisation_job_id

REFERENCES synchronisation_job(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| synchronisation_job_id | UUID |
| batch_number | VARCHAR(50) |
| imported_at | TIMESTAMP |
| record_count | INTEGER |
| successful_records | INTEGER |
| failed_records | INTEGER |

---

## Constraints

```text
PK_import_batch

FK_import_batch_sync_job
```

---

# 6.10 Mapping Rule Table

## Table Name

```text
mapping_rule
```

---

## Description

Stores reusable mapping rules used during supplier imports.

---

## Foreign Keys

```text
supplier_id

REFERENCES supplier(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| supplier_id | UUID |
| source_field | VARCHAR(100) |
| target_field | VARCHAR(100) |
| transformation_rule | TEXT |
| active | BOOLEAN |

---

## Constraints

```text
PK_mapping_rule

FK_mapping_rule_supplier
```

---

# Supplier Domain Relationship Diagram

```text
Supplier
   │
   ├──────────────┐
   │              │
   ▼              ▼
Supplier      Synchronisation Job
Agreement           │
                    ▼
               Import Batch

Supplier
   │
   ▼
Supplier Product
   │
   ├────────────┬─────────────┬────────────┐
   ▼            ▼             ▼            ▼
Availability   Rate         Offer       Season

Supplier
   │
   ▼
Mapping Rule

Supplier Product
        │
        ▼
     Product
```

---

# Supplier Domain Integrity Rules

1. Every Supplier Product shall reference exactly one Supplier.

2. Every Supplier Product shall reference exactly one canonical Product.

3. A canonical Product may have multiple Supplier Products.

4. Supplier Product Codes shall be unique within a Supplier.

5. Availability records shall always reference a Supplier Product.

6. Rates shall always reference a Supplier Product.

7. Offers shall always reference a Supplier Product.

8. Seasons shall always reference a Supplier Product.

9. Import Batches shall belong to a Synchronisation Job.

10. Mapping Rules shall be owned by a single Supplier.

11. Supplier integrations shall never modify canonical Product data directly.

12. Supplier imports shall preserve historical Availability, Rate and Offer records for audit and reconciliation.

---

# 7. Financial Domain Physical Model

## Purpose

The Financial Domain manages all monetary transactions associated with commercial operations.

This includes customer payments, invoices, refunds, credit notes, payment allocations and financial reconciliation.

Financial records are immutable and form the official financial audit trail of the platform.

---

# 7.1 Currency Table

## Table Name

```text
currency
```

## Description

Stores supported currencies.

---

## Primary Key

```text
id UUID PRIMARY KEY
```

---

## Columns

| Column | Type | Nullable | Description |
|----------|------|----------|-------------|
| id | UUID | No | Primary Key |
| currency_code | CHAR(3) | No | ISO-4217 code |
| name | VARCHAR(100) | No | Currency name |
| symbol | VARCHAR(10) | Yes | Display symbol |
| decimal_places | SMALLINT | No | Decimal precision |
| active | BOOLEAN | No | Active flag |

---

## Constraints

```text
PK_currency

UK_currency_code
```

---

## Indexes

```text
IX_currency_code
```

---

# 7.2 Exchange Rate Table

## Table Name

```text
exchange_rate
```

---

## Description

Stores exchange rates used for reporting and financial calculations.

---

## Foreign Keys

```text
base_currency_id

REFERENCES currency(id)
```

```text
target_currency_id

REFERENCES currency(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| base_currency_id | UUID |
| target_currency_id | UUID |
| exchange_rate | NUMERIC(18,8) |
| effective_date | DATE |
| source | VARCHAR(100) |

---

## Constraints

```text
PK_exchange_rate

FK_exchange_rate_base_currency

FK_exchange_rate_target_currency
```

---

## Indexes

```text
IX_exchange_rate_effective_date

IX_exchange_rate_currency_pair
```

---

# 7.3 Tax Rate Table

## Table Name

```text
tax_rate
```

---

## Description

Stores applicable tax rates.

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| tax_code | VARCHAR(30) |
| description | VARCHAR(200) |
| percentage | NUMERIC(5,2) |
| effective_from | DATE |
| effective_to | DATE |
| active | BOOLEAN |

---

## Constraints

```text
PK_tax_rate

UK_tax_code
```

---

# 7.4 Payment Method Table

## Table Name

```text
payment_method
```

---

## Description

Stores supported payment methods.

Examples:

- Credit Card
- EFT
- Bank Transfer
- PayGate
- Stripe

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| method_code | VARCHAR(30) |
| name | VARCHAR(100) |
| active | BOOLEAN |

---

## Constraints

```text
PK_payment_method

UK_payment_method_code
```

---

# 7.5 Payment Table

## Table Name

```text
payment
```

---

## Description

Represents customer payments received.

Payment records are immutable.

---

## Foreign Keys

```text
booking_id

REFERENCES booking(id)
```

```text
payment_method_id

REFERENCES payment_method(id)
```

```text
currency_id

REFERENCES currency(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| payment_reference | VARCHAR(50) |
| booking_id | UUID |
| payment_method_id | UUID |
| currency_id | UUID |
| payment_date | TIMESTAMP |
| amount | NUMERIC(12,2) |
| exchange_rate | NUMERIC(18,8) |
| status | VARCHAR(30) |
| gateway_reference | VARCHAR(255) |
| created_at | TIMESTAMP |

---

## Constraints

```text
PK_payment

UK_payment_reference

FK_payment_booking

FK_payment_method

FK_payment_currency
```

---

## Indexes

```text
IX_payment_booking

IX_payment_date

IX_payment_status

IX_payment_gateway_reference
```

---

# 7.6 Payment Allocation Table

## Table Name

```text
payment_allocation
```

---

## Description

Allocates payments against invoices.

---

## Foreign Keys

```text
payment_id

REFERENCES payment(id)
```

```text
invoice_id

REFERENCES invoice(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| payment_id | UUID |
| invoice_id | UUID |
| allocated_amount | NUMERIC(12,2) |
| allocated_at | TIMESTAMP |

---

## Constraints

```text
PK_payment_allocation

FK_payment_allocation_payment

FK_payment_allocation_invoice
```

---

## Indexes

```text
IX_payment_allocation_payment

IX_payment_allocation_invoice
```

---

# 7.7 Refund Table

## Table Name

```text
refund
```

---

## Description

Represents refunds issued against payments.

---

## Foreign Keys

```text
payment_id

REFERENCES payment(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| payment_id | UUID |
| refund_reference | VARCHAR(50) |
| refund_date | TIMESTAMP |
| refund_amount | NUMERIC(12,2) |
| refund_reason | TEXT |
| gateway_reference | VARCHAR(255) |

---

## Constraints

```text
PK_refund

FK_refund_payment

UK_refund_reference
```

---

## Indexes

```text
IX_refund_payment

IX_refund_date
```

---

# 7.8 Financial Adjustment Table

## Table Name

```text
financial_adjustment
```

---

## Description

Stores authorised accounting adjustments.

---

## Foreign Keys

```text
payment_id

REFERENCES payment(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| payment_id | UUID |
| adjustment_type | VARCHAR(30) |
| amount | NUMERIC(12,2) |
| reason | TEXT |
| approved_by | UUID |
| approved_at | TIMESTAMP |

---

## Constraints

```text
PK_financial_adjustment

FK_financial_adjustment_payment
```

---

# 7.9 Invoice Table

## Table Name

```text
invoice
```

---

## Description

Represents customer invoices.

Invoices are immutable after issue.

---

## Foreign Keys

```text
booking_id

REFERENCES booking(id)
```

```text
currency_id

REFERENCES currency(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| invoice_number | VARCHAR(50) |
| booking_id | UUID |
| currency_id | UUID |
| invoice_date | DATE |
| due_date | DATE |
| subtotal | NUMERIC(12,2) |
| tax_amount | NUMERIC(12,2) |
| total_amount | NUMERIC(12,2) |
| status | VARCHAR(30) |

---

## Constraints

```text
PK_invoice

UK_invoice_number

FK_invoice_booking

FK_invoice_currency
```

---

## Indexes

```text
IX_invoice_booking

IX_invoice_date

IX_invoice_status
```

---

# 7.10 Credit Note Table

## Table Name

```text
credit_note
```

---

## Description

Represents credit notes issued against invoices.

---

## Foreign Keys

```text
invoice_id

REFERENCES invoice(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| invoice_id | UUID |
| credit_note_number | VARCHAR(50) |
| issue_date | DATE |
| amount | NUMERIC(12,2) |
| reason | TEXT |

---

## Constraints

```text
PK_credit_note

UK_credit_note_number

FK_credit_note_invoice
```

---

## Indexes

```text
IX_credit_note_invoice

IX_credit_note_issue_date
```

---

# 7.11 Financial Reconciliation Table

## Table Name

```text
financial_reconciliation
```

---

## Description

Records reconciliation between platform transactions and external financial systems.

---

## Foreign Keys

```text
payment_id

REFERENCES payment(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| payment_id | UUID |
| reconciliation_date | TIMESTAMP |
| external_reference | VARCHAR(100) |
| reconciliation_status | VARCHAR(30) |
| notes | TEXT |

---

## Constraints

```text
PK_financial_reconciliation

FK_financial_reconciliation_payment
```

---

## Indexes

```text
IX_financial_reconciliation_payment

IX_financial_reconciliation_status
```

---

# Financial Domain Relationship Diagram

```text
                  Currency
                 /        \
                ▼          ▼
      Exchange Rate     Payment
                             │
                             │
                  Payment Method
                             │
                             ▼
                          Booking
                             │
                             ▼
                          Invoice
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
      Payment Allocation          Credit Note
                ▲
                │
             Payment
                │
       ┌────────┴─────────┐
       ▼                  ▼
   Refund     Financial Adjustment
       │
       ▼
Financial Reconciliation
```

---

# Financial Domain Integrity Rules

1. Every Payment shall reference exactly one Booking.

2. Every Payment shall use one Currency.

3. Every Payment shall use one Payment Method.

4. Payments are immutable after creation.

5. Refunds shall always reference an existing Payment.

6. Credit Notes shall always reference an existing Invoice.

7. Payment Allocations shall reference both a Payment and an Invoice.

8. Invoice Numbers shall be globally unique.

9. Credit Note Numbers shall be globally unique.

10. Exchange Rates shall be versioned by effective date.

11. Financial records shall never be physically deleted.

12. Financial corrections shall be represented through compensating transactions rather than direct updates.

---

# 8. Operations Domain Physical Model

## Purpose

The Operations Domain manages the planning, scheduling and execution of tours.

It coordinates operational resources required to fulfil Bookings while maintaining complete execution history and operational traceability.

Operational resources are independent aggregate roots with their own lifecycles.

---

# 8.1 Itinerary Table

## Table Name

```text
itinerary
```

## Description

Represents the operational plan created from a confirmed Booking.

One Booking shall have one active Itinerary.

---

## Primary Key

```text
id UUID PRIMARY KEY
```

---

## Foreign Keys

```text
booking_id

REFERENCES booking(id)
```

---

## Columns

| Column | Type | Nullable | Description |
|----------|------|----------|-------------|
| id | UUID | No | Primary Key |
| booking_id | UUID | No | Booking |
| itinerary_number | VARCHAR(30) | No | Business identifier |
| itinerary_status | VARCHAR(30) | No | Draft, Planned, Confirmed, Completed, Cancelled |
| start_date | DATE | No | Tour start |
| end_date | DATE | No | Tour end |
| created_at | TIMESTAMP | No | Audit |
| updated_at | TIMESTAMP | No | Audit |
| created_by | UUID | No | Audit |
| updated_by | UUID | No | Audit |
| deleted_at | TIMESTAMP | Yes | Soft delete |
| deleted_by | UUID | Yes | Soft delete |

---

## Constraints

```text
PK_itinerary

FK_itinerary_booking

UK_itinerary_number

UK_itinerary_booking
```

---

## Indexes

```text
IX_itinerary_booking

IX_itinerary_status

IX_itinerary_start_date
```

---

# 8.2 Itinerary Day Table

## Table Name

```text
itinerary_day
```

---

## Description

Represents one operational day within an itinerary.

---

## Foreign Keys

```text
itinerary_id

REFERENCES itinerary(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| itinerary_id | UUID |
| day_number | INTEGER |
| itinerary_date | DATE |
| title | VARCHAR(200) |
| notes | TEXT |

---

## Constraints

```text
PK_itinerary_day

FK_itinerary_day_itinerary

UK_itinerary_day
```

---

## Indexes

```text
IX_itinerary_day_itinerary

IX_itinerary_day_date
```

---

# 8.3 Itinerary Item Table

## Table Name

```text
itinerary_item
```

---

## Description

Represents an operational activity scheduled within an itinerary day.

---

## Foreign Keys

```text
itinerary_day_id

REFERENCES itinerary_day(id)
```

```text
product_id

REFERENCES product(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| itinerary_day_id | UUID |
| product_id | UUID |
| sequence_no | INTEGER |
| planned_start | TIMESTAMP |
| planned_end | TIMESTAMP |
| pickup_location | VARCHAR(255) |
| dropoff_location | VARCHAR(255) |
| notes | TEXT |

---

## Constraints

```text
PK_itinerary_item

FK_itinerary_item_day

FK_itinerary_item_product
```

---

## Indexes

```text
IX_itinerary_item_day

IX_itinerary_item_product

IX_itinerary_item_start
```

---

# 8.4 Vehicle Table

## Table Name

```text
vehicle
```

---

## Description

Stores company-owned or contracted vehicles.

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| registration_number | VARCHAR(30) |
| make | VARCHAR(100) |
| model | VARCHAR(100) |
| year | SMALLINT |
| seating_capacity | SMALLINT |
| luggage_capacity | SMALLINT |
| active | BOOLEAN |

---

## Constraints

```text
PK_vehicle

UK_vehicle_registration
```

---

## Indexes

```text
IX_vehicle_registration

IX_vehicle_active
```

---

# 8.5 Driver Table

## Table Name

```text
driver
```

---

## Description

Stores operational drivers.

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| employee_number | VARCHAR(30) |
| first_name | VARCHAR(100) |
| last_name | VARCHAR(100) |
| licence_number | VARCHAR(100) |
| licence_expiry | DATE |
| mobile | VARCHAR(50) |
| email | VARCHAR(255) |
| active | BOOLEAN |

---

## Constraints

```text
PK_driver

UK_driver_employee_number

UK_driver_licence_number
```

---

## Indexes

```text
IX_driver_last_name

IX_driver_active

IX_driver_licence_expiry
```

---

# 8.6 Guide Table

## Table Name

```text
guide
```

---

## Description

Stores tour guides.

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| employee_number | VARCHAR(30) |
| first_name | VARCHAR(100) |
| last_name | VARCHAR(100) |
| guide_registration | VARCHAR(100) |
| languages | TEXT |
| mobile | VARCHAR(50) |
| email | VARCHAR(255) |
| active | BOOLEAN |

---

## Constraints

```text
PK_guide

UK_guide_employee_number

UK_guide_registration
```

---

## Indexes

```text
IX_guide_last_name

IX_guide_active
```

---

# 8.7 Trailer Table

## Table Name

```text
trailer
```

---

## Description

Stores trailers assigned to vehicles when required.

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| registration_number | VARCHAR(30) |
| description | VARCHAR(200) |
| luggage_capacity | SMALLINT |
| active | BOOLEAN |

---

## Constraints

```text
PK_trailer

UK_trailer_registration
```

---

## Indexes

```text
IX_trailer_registration

IX_trailer_active
```

---

# 8.8 Resource Assignment Table

## Table Name

```text
resource_assignment
```

---

## Description

Assigns operational resources to itinerary items.

Each assignment references exactly one resource type.

---

## Foreign Keys

```text
itinerary_item_id

REFERENCES itinerary_item(id)
```

```text
vehicle_id

REFERENCES vehicle(id)
```

```text
driver_id

REFERENCES driver(id)
```

```text
guide_id

REFERENCES guide(id)
```

```text
trailer_id

REFERENCES trailer(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| itinerary_item_id | UUID |
| vehicle_id | UUID NULL |
| driver_id | UUID NULL |
| guide_id | UUID NULL |
| trailer_id | UUID NULL |
| assigned_from | TIMESTAMP |
| assigned_to | TIMESTAMP |

---

## Constraints

```text
PK_resource_assignment

FK_assignment_itinerary_item

FK_assignment_vehicle

FK_assignment_driver

FK_assignment_guide

FK_assignment_trailer
```

---

## Indexes

```text
IX_assignment_itinerary_item

IX_assignment_vehicle

IX_assignment_driver

IX_assignment_guide

IX_assignment_trailer
```

---

# 8.9 Operational Schedule Table

## Table Name

```text
operational_schedule
```

---

## Description

Stores planned operational milestones for itinerary execution.

---

## Foreign Keys

```text
itinerary_id

REFERENCES itinerary(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| itinerary_id | UUID |
| scheduled_start | TIMESTAMP |
| scheduled_finish | TIMESTAMP |
| schedule_status | VARCHAR(30) |

---

## Constraints

```text
PK_operational_schedule

FK_operational_schedule_itinerary
```

---

# 8.10 Tour Execution Table

## Table Name

```text
tour_execution
```

---

## Description

Captures actual operational execution of a tour.

---

## Foreign Keys

```text
itinerary_id

REFERENCES itinerary(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| itinerary_id | UUID |
| actual_departure | TIMESTAMP |
| actual_return | TIMESTAMP |
| execution_status | VARCHAR(30) |
| kilometres_travelled | NUMERIC(8,2) |
| execution_notes | TEXT |

---

## Constraints

```text
PK_tour_execution

FK_tour_execution_itinerary
```

---

## Indexes

```text
IX_tour_execution_itinerary

IX_tour_execution_status
```

---

# 8.11 Operational Note Table

## Table Name

```text
operational_note
```

---

## Description

Stores operational notes related to itinerary execution.

---

## Foreign Keys

```text
itinerary_id

REFERENCES itinerary(id)
```

```text
created_by

REFERENCES user(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| itinerary_id | UUID |
| note_type | VARCHAR(30) |
| note | TEXT |
| created_at | TIMESTAMP |
| created_by | UUID |

---

## Constraints

```text
PK_operational_note

FK_operational_note_itinerary

FK_operational_note_user
```

---

# Operations Domain Relationship Diagram

```text
Booking
   │
   ▼
Itinerary
   │
   ▼
Itinerary Day
   │
   ▼
Itinerary Item
   │
   ▼
Resource Assignment
   ├─────────────┬─────────────┬─────────────┐
   ▼             ▼             ▼             ▼
Vehicle       Driver        Guide       Trailer

Itinerary
   ├──────────────┐
   ▼              ▼
Operational   Tour
Schedule      Execution
                  │
                  ▼
          Operational Note
```

---

# Operations Domain Integrity Rules

1. Every Booking shall have at most one active Itinerary.

2. Every Itinerary Day shall belong to exactly one Itinerary.

3. Every Itinerary Item shall belong to exactly one Itinerary Day.

4. Every Resource Assignment shall belong to exactly one Itinerary Item.

5. Vehicles, Drivers, Guides and Trailers are independent operational resources with separate lifecycles.

6. A resource shall not be assigned to overlapping itinerary items for the same time period.

7. Tour Execution records shall preserve actual operational history and shall never be overwritten.

8. Operational Notes shall be append-only and retain full audit history.

9. Completed Itineraries shall become read-only except for authorised operational annotations.

10. Physical deletion of operational records is prohibited once tour execution has commenced.

---

# 9. Platform Domain Physical Model

## Purpose

The Platform Domain provides shared platform capabilities that support every business domain.

Unlike the Commercial, Catalogue, Supplier, Financial and Operations domains, the Platform Domain does **not** own business transactions. Instead, it provides identity management, authorisation, auditing, document generation, notifications, workflow orchestration, system configuration and external integration management.

---

# 9.1 User Table

## Table Name

```text
user
```

## Description

Stores authenticated platform users.

Users may represent employees, administrators, operational staff or external users depending on platform configuration.

---

## Primary Key

```text
id UUID PRIMARY KEY
```

---

## Columns

| Column | Type | Nullable | Description |
|----------|------|----------|-------------|
| id | UUID | No | Primary Key |
| username | VARCHAR(100) | No | Login name |
| email | VARCHAR(255) | No | Email address |
| password_hash | TEXT | No | Password hash |
| first_name | VARCHAR(100) | No | First name |
| last_name | VARCHAR(100) | No | Last name |
| active | BOOLEAN | No | Active user |
| last_login | TIMESTAMP | Yes | Last successful login |
| created_at | TIMESTAMP | No | Audit |
| updated_at | TIMESTAMP | No | Audit |
| deleted_at | TIMESTAMP | Yes | Soft delete |

---

## Constraints

```text
PK_user

UK_user_username

UK_user_email
```

---

## Indexes

```text
IX_user_username

IX_user_email

IX_user_active
```

---

# 9.2 Role Table

## Table Name

```text
role
```

---

## Description

Defines security roles.

Examples:

- Administrator
- Operations Manager
- Consultant
- Guide
- Finance
- Customer Service

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| role_code | VARCHAR(30) |
| name | VARCHAR(100) |
| description | TEXT |
| active | BOOLEAN |

---

## Constraints

```text
PK_role

UK_role_code
```

---

# 9.3 Permission Table

## Table Name

```text
permission
```

---

## Description

Defines individual system permissions.

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| permission_code | VARCHAR(100) |
| description | TEXT |

---

## Constraints

```text
PK_permission

UK_permission_code
```

---

# 9.4 User Role Junction

## Table Name

```text
user_role
```

---

## Description

Assigns one or more Roles to a User.

---

## Foreign Keys

```text
user_id

REFERENCES user(id)
```

```text
role_id

REFERENCES role(id)
```

---

## Constraints

```text
PK_user_role

FK_user_role_user

FK_user_role_role

UK_user_role
```

---

## Indexes

```text
IX_user_role_user

IX_user_role_role
```

---

# 9.5 Role Permission Junction

## Table Name

```text
role_permission
```

---

## Description

Assigns Permissions to Roles.

---

## Foreign Keys

```text
role_id

REFERENCES role(id)
```

```text
permission_id

REFERENCES permission(id)
```

---

## Constraints

```text
PK_role_permission

FK_role_permission_role

FK_role_permission_permission

UK_role_permission
```

---

## Indexes

```text
IX_role_permission_role

IX_role_permission_permission
```

---

# 9.6 Document Table

## Table Name

```text
document
```

---

## Description

Stores generated business documents.

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| document_number | VARCHAR(50) |
| document_type | VARCHAR(50) |
| file_name | VARCHAR(255) |
| storage_uri | TEXT |
| generated_at | TIMESTAMP |
| generated_by | UUID |

---

## Constraints

```text
PK_document

UK_document_number
```

---

## Indexes

```text
IX_document_type

IX_document_generated_at
```

---

# 9.7 Document Template Table

## Table Name

```text
document_template
```

---

## Description

Stores reusable templates used for document generation.

---

## Foreign Keys

```text
document_id

REFERENCES document(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| document_id | UUID |
| template_name | VARCHAR(200) |
| template_version | VARCHAR(30) |
| active | BOOLEAN |

---

## Constraints

```text
PK_document_template

FK_document_template_document
```

---

# 9.8 Notification Table

## Table Name

```text
notification
```

---

## Description

Stores notifications delivered by the platform.

---

## Foreign Keys

```text
user_id

REFERENCES user(id)
```

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| user_id | UUID |
| notification_type | VARCHAR(30) |
| subject | VARCHAR(255) |
| message | TEXT |
| delivery_channel | VARCHAR(30) |
| sent_at | TIMESTAMP |
| read_at | TIMESTAMP |

---

## Constraints

```text
PK_notification

FK_notification_user
```

---

## Indexes

```text
IX_notification_user

IX_notification_type

IX_notification_sent_at
```

---

# 9.9 Notification Template Table

## Table Name

```text
notification_template
```

---

## Description

Stores reusable notification templates.

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| template_name | VARCHAR(200) |
| notification_type | VARCHAR(30) |
| subject_template | TEXT |
| body_template | TEXT |
| active | BOOLEAN |

---

## Constraints

```text
PK_notification_template

UK_notification_template_name
```

---

# 9.10 Workflow Event Table

## Table Name

```text
workflow_event
```

---

## Description

Records significant workflow events generated throughout the platform.

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| event_type | VARCHAR(100) |
| entity_type | VARCHAR(100) |
| entity_id | UUID |
| event_timestamp | TIMESTAMP |
| payload | JSONB |
| processed | BOOLEAN |

---

## Constraints

```text
PK_workflow_event
```

---

## Indexes

```text
IX_workflow_event_type

IX_workflow_event_timestamp

IX_workflow_event_processed
```

---

# 9.11 Audit Record Table

## Table Name

```text
audit_record
```

---

## Description

Stores immutable audit history for security and compliance.

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| user_id | UUID |
| entity_type | VARCHAR(100) |
| entity_id | UUID |
| action | VARCHAR(30) |
| audit_timestamp | TIMESTAMP |
| old_values | JSONB |
| new_values | JSONB |
| ip_address | VARCHAR(100) |

---

## Constraints

```text
PK_audit_record
```

---

## Indexes

```text
IX_audit_entity

IX_audit_timestamp

IX_audit_user
```

---

# 9.12 Integration Endpoint Table

## Table Name

```text
integration_endpoint
```

---

## Description

Stores external integration endpoint configurations.

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| endpoint_code | VARCHAR(50) |
| provider | VARCHAR(100) |
| base_url | TEXT |
| authentication_type | VARCHAR(50) |
| active | BOOLEAN |

---

## Constraints

```text
PK_integration_endpoint

UK_endpoint_code
```

---

# 9.13 System Configuration Table

## Table Name

```text
system_configuration
```

---

## Description

Stores platform-wide configuration settings.

---

## Columns

| Column | Type |
|----------|------|
| id | UUID |
| configuration_key | VARCHAR(100) |
| configuration_value | TEXT |
| configuration_group | VARCHAR(100) |
| encrypted | BOOLEAN |

---

## Constraints

```text
PK_system_configuration

UK_configuration_key
```

---

## Indexes

```text
IX_configuration_group
```

---

# Platform Domain Relationship Diagram

```text
                User
                  │
          ┌───────┴────────┐
          ▼                ▼
      User Role     Notification
          │
          ▼
         Role
          │
          ▼
   Role Permission
          │
          ▼
     Permission

Document
    │
    ▼
Document Template

Notification Template

Workflow Event

Audit Record

Integration Endpoint

System Configuration
```

---

# Platform Domain Integrity Rules

1. Every User shall authenticate using a unique Username and Email.

2. A User may have multiple Roles.

3. A Role may contain multiple Permissions.

4. Users shall inherit permissions exclusively through assigned Roles.

5. Audit Records shall be immutable and append-only.

6. Workflow Events shall record business events without modifying business data.

7. Notifications shall always reference a valid User.

8. Document Templates shall be version-controlled.

9. Integration Endpoints shall be centrally managed and reusable across integrations.

10. System Configuration keys shall be globally unique.

11. Platform tables shall never contain business-specific transactional data.

12. Security, auditing and workflow functionality shall remain independent of business domain implementations.

---

# 10. Global Relationship Model

## Purpose

This section defines the physical relationships between the domain schemas within the PostgreSQL database.

It establishes how referential integrity is enforced while maintaining clear ownership boundaries and preserving aggregate consistency.

The Global Relationship Model shall remain aligned with the Canonical Logical Data Model defined in SPEC-026.

---

# 10.1 Domain Relationship Principles

The physical database shall conform to the following principles.

## Ownership

Each table shall have exactly one owning domain.

No table shall be jointly owned by multiple domains.

---

## Referential Integrity

Relationships between domains shall be implemented using database foreign keys.

Foreign keys shall always reference the Primary Key (`id`) of the parent table.

---

## Aggregate Boundaries

Cross-domain relationships shall terminate at Aggregate Roots.

Child entities shall never be referenced directly by another domain.

---

## Independent Lifecycles

Each domain shall manage its own lifecycle independently.

Deletion, archival and versioning shall not cascade across domain boundaries unless explicitly defined.

---

# 10.2 Cross-Domain Relationship Matrix

| Source Domain | Target Domain | Relationship | Cardinality |
|---------------|---------------|--------------|-------------|
| Commercial | Catalogue | Booking Item → Product | Many-to-One |
| Commercial | Supplier | Reservation → Supplier Product | Many-to-One |
| Commercial | Financial | Payment → Booking | One-to-Many |
| Commercial | Operations | Itinerary → Booking | One-to-One |
| Catalogue | Supplier | Supplier Product → Product | Many-to-One |
| Operations | Catalogue | Itinerary Item → Product | Many-to-One |
| Platform | All Domains | Audit/User References | Many-to-One |

---

# 10.3 Domain Relationship Diagram

```text
                     Platform
                        │
     ┌──────────────────┼──────────────────┐
     │                  │                  │
     ▼                  ▼                  ▼
Commercial ───────► Catalogue ◄──────── Supplier
     │                  ▲
     │                  │
     ▼                  │
 Financial         Operations
```

Legend

```text
────►  Foreign Key Relationship

◄──── Aggregate Root Reference
```

---

# 10.4 Commercial Relationships

## Customer

```text
Customer
    │
    ├──────────────► Traveller
    │
    ├──────────────► Quote
    │
    └──────────────► Booking
```

---

## Booking

```text
Booking
    │
    ├────────────► Booking Item
    ├────────────► Booking Contact
    ├────────────► Booking Note
    ├────────────► Reservation
    └────────────► Itinerary
```

---

# 10.5 Catalogue Relationships

```text
Product Type
      │
      ▼
   Product
      │
 ┌────┼────┬──────────┐
 ▼    ▼    ▼          ▼
Tour Activity Accommodation Package
                     │
                     ▼
             Package Product
```

---

# 10.6 Supplier Relationships

```text
Supplier
    │
    ├────────────► Supplier Agreement
    ├────────────► Mapping Rule
    ├────────────► Synchronisation Job
    │                    │
    │                    ▼
    │              Import Batch
    │
    ▼
Supplier Product
      │
      ├────────► Availability
      ├────────► Rate
      ├────────► Offer
      └────────► Season
```

---

# 10.7 Financial Relationships

```text
Booking
    │
    ▼
Invoice
    ▲
    │
Payment Allocation
    │
    ▼
Payment
 ├────────► Refund
 ├────────► Financial Adjustment
 └────────► Financial Reconciliation
```

---

# 10.8 Operations Relationships

```text
Booking
    │
    ▼
Itinerary
    │
    ▼
Itinerary Day
    │
    ▼
Itinerary Item
    │
    ▼
Resource Assignment
```

Resources

```text
Vehicle

Driver

Guide

Trailer
```

---

# 10.9 Platform Relationships

```text
User
 │
 ├────────► User Role
 │              │
 │              ▼
 │            Role
 │              │
 │              ▼
 │      Role Permission
 │              │
 │              ▼
 │         Permission
 │
 ├────────► Notification
 │
 └────────► Audit Record

Document
    │
    ▼
Document Template

Notification Template

Workflow Event

Integration Endpoint

System Configuration
```

---

# 10.10 Relationship Cardinality Standards

## One-to-One

Used only where one entity cannot logically exist without another.

Examples

```text
Booking

↓

Itinerary
```

---

## One-to-Many

Used for hierarchical ownership.

Examples

```text
Customer

↓

Traveller
```

```text
Supplier

↓

Supplier Product
```

---

## Many-to-Many

Many-to-many relationships shall always be resolved using explicit junction tables.

Examples

```text
Product

↕

Product Category

↓

product_product_category
```

```text
User

↕

Role

↓

user_role
```

```text
Role

↕

Permission

↓

role_permission
```

---

# 10.11 Cascade Rules

The following cascade behaviour shall be applied.

| Relationship | Delete | Update |
|--------------|--------|--------|
| Parent → Child within Aggregate | RESTRICT | CASCADE |
| Cross-Domain Reference | RESTRICT | CASCADE |
| Financial Records | RESTRICT | RESTRICT |
| Audit Records | RESTRICT | RESTRICT |
| Reference Data | RESTRICT | CASCADE |

---

## Physical Delete Rules

Physical deletion shall generally be prohibited.

Business entities shall use soft deletion where supported.

Exceptions include:

- Temporary staging tables
- Synchronisation working tables
- Cache tables
- Session tables

---

# 10.12 Circular Dependency Rules

Circular foreign key dependencies are prohibited.

Examples of prohibited relationships:

```text
Booking

↓

Invoice

↓

Payment

↓

Booking
```

Instead:

```text
Booking

↓

Invoice

Payment

↓

Invoice
```

Each relationship shall have a single, unambiguous ownership direction.

---

# 10.13 Cross-Domain Access Rules

Domains shall interact through Aggregate Roots only.

Permitted

```text
Booking

↓

Product
```

Not Permitted

```text
Booking

↓

Media
```

Permitted

```text
Supplier Product

↓

Product
```

Not Permitted

```text
Supplier Product

↓

Package Product
```

---

# 10.14 Relationship Integrity Rules

1. Every Foreign Key shall reference a valid Primary Key.

2. Cross-domain references shall target Aggregate Roots only.

3. Child entities shall never be referenced directly across domains.

4. Every Many-to-Many relationship shall use an explicit junction table.

5. Foreign Keys shall use UUID values.

6. Cascading deletes shall be avoided for business entities.

7. Financial and Audit records shall remain immutable.

8. Aggregate ownership shall never be violated through database relationships.

9. Physical relationships shall mirror the ownership model defined in SPEC-026.

10. The database schema shall preserve transactional consistency across all domains.

---

# 11. Referential Integrity Rules

## Purpose

This section defines the enterprise-wide standards governing referential integrity within the physical PostgreSQL database.

These rules ensure that relationships between entities remain valid, consistent and enforceable throughout the lifecycle of the platform.

Every table defined within this specification shall comply with these standards.

---

# 11.1 Referential Integrity Principles

The database shall enforce data integrity through declarative constraints wherever possible.

Application-level validation shall complement, but never replace, database-enforced integrity.

All business data shall remain internally consistent regardless of application implementation.

---

# 11.2 Primary Key Standards

Every persistent table shall define exactly one Primary Key.

Primary Keys shall:

- use UUID data type
- be immutable
- never be reused
- never contain business meaning
- be generated by the platform

Example

```text
id UUID PRIMARY KEY
```

---

# 11.3 Foreign Key Standards

Every relationship between tables shall be implemented using Foreign Keys.

Foreign Keys shall:

- reference only the parent Primary Key
- use UUID data types
- use consistent naming conventions
- enforce referential integrity at database level

Example

```text
booking_id

REFERENCES booking(id)
```

---

# 11.4 Foreign Key Naming Convention

Foreign Key constraints shall use the following format.

```text
FK_<child_table>_<parent_table>
```

Examples

```text
FK_booking_customer

FK_booking_item_booking

FK_supplier_product_supplier

FK_itinerary_booking

FK_payment_booking
```

---

# 11.5 Primary Key Naming Convention

Primary Key constraints shall use:

```text
PK_<table_name>
```

Examples

```text
PK_booking

PK_customer

PK_supplier

PK_vehicle
```

---

# 11.6 Unique Constraint Naming Convention

Unique Constraints shall use:

```text
UK_<table_name>_<column_name>
```

Examples

```text
UK_booking_number

UK_customer_email

UK_supplier_code

UK_vehicle_registration
```

Where composite uniqueness exists:

```text
UK_user_role

UK_role_permission

UK_product_product_category
```

---

# 11.7 Check Constraint Naming Convention

Check Constraints shall use:

```text
CK_<table_name>_<rule>
```

Examples

```text
CK_payment_amount_positive

CK_quote_expiry_date

CK_booking_dates

CK_vehicle_capacity
```

---

# 11.8 Index Naming Convention

Indexes shall follow:

```text
IX_<table_name>_<column_name>
```

Composite indexes:

```text
IX_<table_name>_<column1>_<column2>
```

Examples

```text
IX_booking_status

IX_customer_email

IX_supplier_product_supplier

IX_rate_valid_from_valid_to
```

---

# 11.9 NULL Policy

Columns shall be classified according to business necessity.

## Mandatory Data

Mandatory attributes shall be defined as:

```text
NOT NULL
```

Examples

- Customer Name
- Booking Date
- Product Code
- Supplier Code
- Payment Amount

---

## Optional Data

Nullable attributes shall only be used where business rules explicitly permit missing information.

Examples

- Notes
- Secondary Telephone
- Cancellation Reason
- External Reference

---

## Nullable Foreign Keys

Nullable Foreign Keys shall only be permitted where relationships are optional.

Example

```text
booking.cancelled_by_user_id
```

---

# 11.10 Default Value Policy

Default values shall be used only where universally applicable.

Examples

```text
created_at DEFAULT now()

active DEFAULT true

deleted_at DEFAULT NULL
```

Defaults shall never replace business validation.

---

# 11.11 Business Identifier Policy

Business identifiers shall be protected using Unique Constraints.

Examples

```text
booking_number

invoice_number

credit_note_number

supplier_code

product_code

username

email
```

Business identifiers shall never serve as Primary Keys.

---

# 11.12 Domain Reference Rules

Cross-domain references shall comply with Aggregate boundaries.

Permitted

```text
Booking

↓

Customer
```

Permitted

```text
Supplier Product

↓

Product
```

Not Permitted

```text
Booking Item

↓

Media
```

Not Permitted

```text
Reservation

↓

Rate
```

Relationships shall always terminate at the Aggregate Root.

---

# 11.13 Delete Behaviour

Delete behaviour shall follow the table below.

| Relationship Type | Delete Action |
|-------------------|---------------|
| Parent → Child within Aggregate | RESTRICT |
| Cross-Domain Reference | RESTRICT |
| Financial Records | RESTRICT |
| Audit Records | RESTRICT |
| Reference Data | RESTRICT |

Physical deletion of business entities is prohibited.

---

# 11.14 Update Behaviour

Updates to Primary Keys are prohibited.

Foreign Keys shall automatically remain valid through immutable identifiers.

Business identifiers may change only where explicitly permitted.

Examples

Permitted

```text
Customer Email
```

Permitted

```text
Supplier Contact
```

Not Permitted

```text
Booking Primary Key
```

Not Permitted

```text
Invoice Primary Key
```

---

# 11.15 Cascade Update Rules

The following update strategy shall apply.

| Relationship | Update Action |
|--------------|---------------|
| Primary Key | Prohibited |
| Business Identifier | Allowed where authorised |
| Foreign Key | Automatic through immutable PK |
| Audit Records | Prohibited |
| Financial Records | Restricted |

---

# 11.16 Composite Key Policy

Composite Primary Keys shall not be used.

Composite uniqueness shall instead be enforced using:

```text
PRIMARY KEY

+

UNIQUE CONSTRAINT
```

Example

```text
user_role

Primary Key

id

Unique

user_id

role_id
```

This simplifies ORM mapping and improves maintainability.

---

# 11.17 Check Constraint Policy

Database Check Constraints shall enforce invariant business rules.

Examples

Positive Amount

```text
amount > 0
```

Guest Count

```text
guest_count >= 1
```

Vehicle Capacity

```text
seating_capacity >= 1
```

Date Validation

```text
end_date >= start_date
```

Percentage Validation

```text
commission_percentage BETWEEN 0 AND 100
```

Currency Validation

```text
currency_code ~ '^[A-Z]{3}$'
```

---

# 11.18 Transaction Integrity

Every business transaction shall execute within an ACID-compliant database transaction.

Transactions shall:

- succeed completely
- fail completely
- never leave partial updates

Examples

Booking Creation

```text
Customer

↓

Booking

↓

Booking Items

↓

Reservation

↓

Itinerary
```

Either:

- everything commits

or

- everything rolls back

---

# 11.19 Deferred Constraints

Deferred constraints shall only be used where circular insert ordering cannot reasonably be avoided.

Examples include:

- controlled data migrations
- bulk imports
- staging synchronisation

Deferred constraints shall not be used during normal business operations.

---

# 11.20 Orphan Prevention

The schema shall prevent orphan records.

Examples

Invalid

```text
Booking Item

without

Booking
```

Invalid

```text
Traveller

without

Customer
```

Invalid

```text
Reservation

without

Booking
```

Every child entity shall reference an existing parent.

---

# 11.21 Soft Delete Integrity

Soft-deleted records shall continue to satisfy referential integrity.

Rules

- Foreign Keys shall remain valid.
- Historical references shall remain resolvable.
- Audit history shall remain intact.
- Financial records shall continue to reference soft-deleted entities where applicable.

No Foreign Key shall be automatically nulled during soft deletion.

---

# 11.22 Data Validation Responsibilities

| Validation | Database | Application |
|------------|----------|-------------|
| Primary Keys | Yes | No |
| Foreign Keys | Yes | No |
| Unique Constraints | Yes | Optional |
| Check Constraints | Yes | Optional |
| Complex Business Rules | No | Yes |
| Workflow Validation | No | Yes |
| User Permissions | No | Yes |

---

# 11.23 Referential Integrity Compliance Rules

1. Every table shall define one immutable UUID Primary Key.

2. Every relationship shall be enforced using database Foreign Keys.

3. Foreign Keys shall reference Aggregate Roots only.

4. Cross-domain relationships shall not bypass Aggregate boundaries.

5. Physical deletion of business entities is prohibited.

6. Soft deletion shall preserve all Foreign Key relationships.

7. Composite Primary Keys are prohibited.

8. Unique business identifiers shall be protected with Unique Constraints.

9. Check Constraints shall enforce invariant business rules.

10. Every transaction shall satisfy ACID principles.

11. Orphan records shall be impossible.

12. Referential integrity shall be enforced by the database regardless of application implementation.

---

# 12. Indexing Strategy

## Purpose

This section defines the enterprise-wide indexing standards for the Go Cape Tours platform.

The objective is to ensure predictable query performance, scalability and maintainability while supporting transactional workloads, reporting and supplier synchronisation.

All indexes shall be implemented using PostgreSQL best practices and aligned with the access patterns defined in the application architecture.

---

# 12.1 Indexing Principles

Indexes shall be designed to:

- optimise read performance
- minimise write overhead
- support transactional integrity
- improve join performance
- reduce full table scans
- support efficient sorting and filtering

Indexes shall be created only where they provide measurable business value.

---

# 12.2 Primary Key Indexes

Every Primary Key shall automatically create a clustered unique B-tree index.

Example

```text
PK_booking

↓

INDEX booking_pkey
```

This index shall support:

- entity retrieval
- foreign key joins
- aggregate loading
- transaction processing

---

# 12.3 Foreign Key Indexes

Every Foreign Key shall have a supporting index.

Examples

```text
booking.customer_id
```

```text
booking_item.booking_id
```

```text
supplier_product.product_id
```

```text
reservation.booking_item_id
```

Purpose

- faster joins
- cascade validation
- lookup performance
- reporting

---

# 12.4 Business Identifier Indexes

Unique business identifiers shall always be indexed.

Examples

```text
booking_number

customer_number

quote_number

invoice_number

supplier_code

product_code

username

email
```

These indexes shall use:

```text
UNIQUE INDEX
```

---

# 12.5 Composite Index Strategy

Composite indexes shall support common business queries.

Example

Bookings

```text
(customer_id,
booking_status)
```

Supplier Products

```text
(supplier_id,
supplier_product_code)
```

Availability

```text
(supplier_product_id,
available_date)
```

Rates

```text
(supplier_product_id,
valid_from,
valid_to)
```

Reservations

```text
(booking_id,
reservation_status)
```

Composite indexes shall follow the Leftmost Prefix Rule.

---

# 12.6 Covering Index Strategy

Where practical, covering indexes shall include frequently selected columns.

Example

```text
Booking

(customer_id,
booking_status)

INCLUDE

(total_amount,
travel_date)
```

Benefits

- reduced heap lookups
- faster reporting
- lower I/O

---

# 12.7 Partial Index Strategy

Partial indexes shall be used for frequently queried subsets of data.

Examples

Active Products

```sql
WHERE active = true
```

Open Bookings

```sql
WHERE booking_status <> 'Completed'
```

Unread Notifications

```sql
WHERE read_at IS NULL
```

Active Suppliers

```sql
WHERE active = true
```

Benefits

- smaller indexes
- faster searches
- lower maintenance cost

---

# 12.8 JSONB Index Strategy

JSONB columns shall use GIN indexes where searchability is required.

Applicable Tables

```text
workflow_event.payload

audit_record.old_values

audit_record.new_values
```

Preferred Index

```text
GIN
```

Purpose

- containment queries
- key lookup
- JSON path searches

---

# 12.9 Full-Text Search Indexes

User-facing search shall utilise PostgreSQL Full-Text Search.

Applicable Columns

```text
product.description

product.short_description

destination.description

document.file_name

notification.subject
```

Preferred Index

```text
GIN

USING tsvector
```

Purpose

- keyword search
- tourism catalogue search
- document retrieval

---

# 12.10 Date-Based Indexes

Frequently queried temporal columns shall be indexed.

Examples

```text
booking_date

travel_date

invoice_date

payment_date

available_date

valid_from

valid_to

created_at

updated_at
```

Benefits

- reporting
- scheduling
- archival
- supplier synchronisation

---

# 12.11 Operational Scheduling Indexes

Operations require efficient scheduling queries.

Recommended indexes

Vehicle

```text
(active,
registration_number)
```

Driver

```text
(active,
licence_expiry)
```

Guide

```text
(active,
guide_registration)
```

Itinerary

```text
(start_date,
itinerary_status)
```

Resource Assignment

```text
(vehicle_id,
assigned_from,
assigned_to)
```

These indexes minimise scheduling conflicts and improve allocation performance.

---

# 12.12 Financial Reporting Indexes

Financial reporting requires optimised aggregation.

Recommended indexes

Payment

```text
(payment_date,
status)
```

Invoice

```text
(invoice_date,
status)
```

Refund

```text
(refund_date)
```

Financial Reconciliation

```text
(reconciliation_status,
reconciliation_date)
```

---

# 12.13 Supplier Synchronisation Indexes

Supplier imports generate high-volume write operations.

Recommended indexes

Synchronisation Job

```text
(started_at,
status)
```

Import Batch

```text
(imported_at)
```

Availability

```text
(supplier_product_id,
available_date)
```

Rate

```text
(supplier_product_id,
valid_from,
valid_to)
```

Offer

```text
(valid_from,
valid_to)
```

---

# 12.14 Reporting Indexes

Business Intelligence queries frequently aggregate by date, status and destination.

Recommended indexes

Booking

```text
(travel_date,
booking_status)
```

Product

```text
(product_type_id,
destination_id)
```

Reservation

```text
(reservation_status)
```

Payment

```text
(currency_id,
payment_date)
```

---

# 12.15 Unique Index Policy

Unique indexes shall enforce business uniqueness.

Examples

```text
username

email

booking_number

invoice_number

credit_note_number

supplier_code

product_code

vehicle_registration

driver_licence_number
```

Unique indexes shall never be duplicated with separate non-unique indexes unless justified by performance testing.

---

# 12.16 Index Maintenance

Indexes shall be monitored regularly.

Maintenance activities include:

- REINDEX where required
- VACUUM
- ANALYZE
- statistics updates
- index fragmentation review
- unused index identification

Maintenance shall be automated wherever practical.

---

# 12.17 Index Performance Monitoring

The following PostgreSQL statistics shall be monitored.

Tables

```text
pg_stat_user_indexes

pg_stat_all_indexes

pg_stat_statements
```

Metrics

- index scans
- sequential scans
- buffer usage
- index size
- bloat
- cache hit ratio

---

# 12.18 Index Creation Guidelines

Before creating an index, the following shall be evaluated:

- query frequency
- selectivity
- write overhead
- storage impact
- maintenance cost
- execution plans

Indexes shall not be created solely as a precaution.

---

# 12.19 Index Naming Convention

All indexes shall follow:

```text
IX_<table>_<column>
```

Composite indexes

```text
IX_<table>_<column1>_<column2>
```

Examples

```text
IX_booking_customer

IX_booking_status

IX_supplier_product_supplier

IX_rate_supplier_validity

IX_resource_assignment_vehicle_schedule
```

Unique indexes

```text
UK_customer_email

UK_booking_number

UK_supplier_code
```

---

# 12.20 Index Lifecycle

Indexes shall be reviewed throughout the platform lifecycle.

Lifecycle stages

```text
Design

↓

Implementation

↓

Performance Testing

↓

Production Monitoring

↓

Optimisation

↓

Retirement
```

Unused indexes shall be removed only after:

- workload analysis
- production monitoring
- regression testing

---

# 12.21 Domain-Specific Index Summary

| Domain | Primary Focus |
|----------|---------------|
| Commercial | Customer, Booking, Reservation lookups |
| Catalogue | Product search and destination filtering |
| Supplier | Synchronisation, Availability and Rates |
| Financial | Payment and Invoice reporting |
| Operations | Scheduling and resource allocation |
| Platform | Authentication, auditing and workflow |

---

# 12.22 Indexing Compliance Rules

1. Every Primary Key shall be indexed.

2. Every Foreign Key shall have a supporting index.

3. Business identifiers shall use Unique Indexes.

4. Composite indexes shall reflect actual query patterns.

5. Partial indexes shall be preferred for frequently filtered subsets.

6. JSONB search columns shall use GIN indexes.

7. Full-text searchable content shall use PostgreSQL Full-Text Search indexes.

8. Date-based reporting columns shall be indexed where appropriate.

9. Indexes shall be monitored continuously and reviewed during performance tuning.

10. Index creation and removal shall be evidence-based and supported by execution plans and production metrics.

---

# 13. Database Performance & Partitioning

## Purpose

This section defines the enterprise standards for database performance, scalability and long-term data management.

The objective is to ensure that the Go Cape Tours platform maintains consistent performance as transaction volumes, supplier integrations and historical data continue to grow.

These standards apply to all PostgreSQL environments, including Development, Test, Staging and Production.

---

# 13.1 Performance Principles

The database shall be designed to:

- support high transactional throughput
- minimise query latency
- maximise data consistency
- optimise resource utilisation
- simplify operational maintenance
- support future horizontal scaling where appropriate

Performance optimisation shall always preserve data integrity.

---

# 13.2 Workload Classification

The platform shall classify workloads into four categories.

| Workload | Characteristics |
|----------|-----------------|
| OLTP | High-volume transactional processing |
| Operational Reporting | Near real-time operational queries |
| Supplier Synchronisation | Bulk imports and updates |
| Business Intelligence | Historical reporting and analytics |

Each workload shall be optimised independently.

---

# 13.3 Table Growth Classification

Tables shall be classified according to expected growth.

## Small Tables

Examples

```text
Currency

Role

Permission

Tax Rate

System Configuration
```

Expected Size

```text
< 10 000 rows
```

Partitioning

```text
Not Required
```

---

## Medium Tables

Examples

```text
Customer

Product

Supplier

Vehicle

Guide

Driver
```

Expected Size

```text
10 000 – 1 million rows
```

Partitioning

```text
Normally Not Required
```

---

## Large Tables

Examples

```text
Booking

Reservation

Payment

Availability

Rate

Workflow Event

Audit Record

Notification
```

Expected Size

```text
Millions of rows
```

Partitioning

```text
Recommended
```

---

# 13.4 Partitioning Strategy

Partitioning shall be applied only where measurable performance benefits exist.

Preferred partitioning methods

1.

```text
Range Partitioning
```

2.

```text
List Partitioning
```

Hash partitioning shall only be considered for specialised workloads.

---

# 13.5 Date-Based Partitioning

Large historical tables shall be partitioned by date.

Recommended candidates

```text
Booking

Payment

Invoice

Audit Record

Workflow Event

Notification

Availability

Rate
```

Preferred partition interval

```text
Monthly
```

Example

```text
booking_2027_01

booking_2027_02

booking_2027_03
```

---

# 13.6 Audit Partitioning

Audit data grows continuously.

Recommended strategy

```text
Range Partition

↓

Audit Timestamp

↓

Monthly
```

Benefits

- faster reporting
- simplified archival
- reduced maintenance windows

---

# 13.7 Workflow Event Partitioning

Workflow events are append-only.

Recommended partition

```text
event_timestamp
```

Monthly partitions shall be automatically created.

---

# 13.8 Supplier Data Partitioning

Supplier imports generate high-volume data.

Recommended candidates

```text
Availability

Rate

Offer

Import Batch

Synchronisation Job
```

Preferred key

```text
import_date

or

available_date
```

Benefits

- faster imports
- simplified purging
- improved reporting

---

# 13.9 Archiving Strategy

Historical business data shall remain available while minimising operational overhead.

Recommended archival periods

| Table | Archive After |
|---------|--------------|
| Workflow Event | 24 months |
| Notification | 24 months |
| Audit Record | 60 months |
| Synchronisation Job | 36 months |
| Import Batch | 36 months |
| Availability Snapshots | 24 months |

Financial records shall never be archived without explicit legal approval.

---

# 13.10 Data Retention Policy

Retention shall comply with legal, financial and operational requirements.

Categories

| Data | Minimum Retention |
|------|-------------------|
| Financial | Legal Requirement |
| Audit | Legal Requirement |
| Customer | Business Policy |
| Supplier Import Logs | Operational Policy |
| Notifications | Operational Policy |

Soft deletion shall not replace retention requirements.

---

# 13.11 Materialized Views

Materialized Views shall be used for complex reporting workloads.

Examples

Daily Revenue

```text
mv_daily_revenue
```

Monthly Bookings

```text
mv_monthly_bookings
```

Supplier Performance

```text
mv_supplier_performance
```

Tour Statistics

```text
mv_operational_statistics
```

Materialized Views shall be refreshed on scheduled intervals.

---

# 13.12 Query Optimisation

Query optimisation shall prioritise:

- indexed lookups
- selective predicates
- efficient joins
- minimal sorting
- appropriate pagination

The following should be avoided:

- SELECT *
- unnecessary DISTINCT
- Cartesian joins
- correlated subqueries where alternatives exist
- repeated full table scans

---

# 13.13 Connection Pooling

Production environments shall utilise database connection pooling.

Recommended solution

```text
PgBouncer
```

Connection pools shall be sized according to:

- CPU cores
- concurrent users
- supplier synchronisation workload
- reporting workload

Long-running idle connections shall be avoided.

---

# 13.14 Transaction Management

Transactions shall remain as short as practical.

Guidelines

- open late
- commit early
- avoid user interaction during transactions
- minimise locking
- avoid unnecessary retries

---

# 13.15 Locking Strategy

The database shall rely primarily on PostgreSQL MVCC.

Explicit locking shall be used only where required.

Preferred

```text
Row-Level Locks
```

Avoid

```text
Table Locks
```

Business operations shall minimise blocking.

---

# 13.16 Isolation Levels

Default isolation level

```text
READ COMMITTED
```

Higher isolation

```text
REPEATABLE READ
```

or

```text
SERIALIZABLE
```

shall only be used for critical financial operations.

---

# 13.17 Bulk Processing

Supplier synchronisation shall use batch processing.

Recommended batch size

```text
500

to

5000 records
```

depending on payload size.

Bulk operations shall:

- minimise transaction duration
- use prepared statements
- support restart capability
- maintain audit logging

---

# 13.18 Read Optimisation

Frequently accessed reference data may utilise application caching.

Examples

```text
Currency

Destination

Product Type

Role

Permission

Tax Rate
```

Caching shall never bypass transactional consistency for mutable business data.

---

# 13.19 Write Optimisation

Write-intensive workloads include

```text
Supplier Imports

Workflow Events

Audit Records

Notifications
```

Optimisation techniques

- batching
- prepared statements
- partitioning
- asynchronous processing
- minimal index overhead

---

# 13.20 Statistics Management

PostgreSQL statistics shall remain current.

Maintenance

```text
VACUUM

ANALYZE

AUTO VACUUM
```

shall remain enabled.

Statistics targets may be increased for heavily queried tables.

---

# 13.21 Backup Strategy

Production backups shall include

Daily

```text
Full Backup
```

Continuous

```text
Write Ahead Log (WAL)
```

Periodic

```text
Restore Verification
```

Backups shall be encrypted and stored separately from the production environment.

---

# 13.22 Disaster Recovery

Recovery objectives shall be formally defined.

Recovery Point Objective (RPO)

```text
≤ 15 minutes
```

Recovery Time Objective (RTO)

```text
≤ 2 hours
```

Disaster recovery procedures shall be tested regularly.

---

# 13.23 High Availability

Production deployments should support high availability.

Recommended architecture

```text
Primary PostgreSQL

↓

Streaming Replication

↓

Standby Replica
```

Automatic failover may be implemented using an appropriate orchestration solution.

---

# 13.24 Monitoring

Database health shall be continuously monitored.

Metrics

- CPU utilisation
- memory usage
- disk utilisation
- query latency
- connection count
- replication lag
- lock contention
- cache hit ratio
- deadlocks
- WAL growth

Alerts shall be generated when operational thresholds are exceeded.

---

# 13.25 Performance Testing

Performance testing shall be conducted prior to production deployment.

Testing shall include

- load testing
- stress testing
- endurance testing
- failover testing
- recovery testing
- supplier synchronisation testing
- booking transaction testing

Results shall be documented and reviewed before release.

---

# 13.26 Database Performance Compliance Rules

1. Large transactional tables shall be evaluated for date-based partitioning.

2. Partitioning shall be driven by measured workload characteristics.

3. Materialized Views shall support complex reporting workloads.

4. Production environments shall use connection pooling.

5. Transactions shall remain short-lived.

6. Bulk supplier imports shall execute in batches.

7. MVCC shall remain the primary concurrency mechanism.

8. PostgreSQL statistics shall be maintained automatically.

9. Backup and recovery procedures shall be tested regularly.

10. Database performance shall be continuously monitored using measurable operational metrics.

11. High availability shall be supported through replication and tested failover procedures.

12. Performance optimisation shall never compromise transactional integrity or data consistency.

---

# 14. Physical Data Standards

## Purpose

This section defines the enterprise-wide physical database standards that shall be applied consistently across the Go Cape Tours platform.

These standards ensure consistency, maintainability, portability and operational reliability across all PostgreSQL environments.

Every physical database object defined within this specification shall comply with these standards.

---

# 14.1 Physical Design Principles

The physical database shall be designed according to the following principles.

- Simplicity
- Consistency
- Predictability
- Maintainability
- Scalability
- Performance
- Security
- Auditability

Database implementation shall always reflect the Canonical Logical Data Model.

---

# 14.2 Database Object Naming Standards

All database object names shall use:

```text
snake_case
```

Examples

```text
customer

booking

supplier_product

resource_assignment

workflow_event
```

The following are prohibited:

```text
CamelCase

PascalCase

Spaces

Special Characters
```

---

# 14.3 Column Naming Standards

Columns shall use descriptive singular names.

Examples

```text
customer_id

booking_date

supplier_code

created_at

updated_at

travel_date
```

Boolean fields shall use positive names.

Examples

```text
active

deleted

confirmed

processed
```

Avoid

```text
is_active_flag

has_been_processed_flag
```

---

# 14.4 Data Type Standards

The following physical data types shall be used throughout the platform.

| Business Type | PostgreSQL Type |
|--------------|-----------------|
| Identifier | UUID |
| Short Text | VARCHAR |
| Long Text | TEXT |
| Boolean | BOOLEAN |
| Integer | INTEGER |
| Small Integer | SMALLINT |
| Currency | NUMERIC(12,2) |
| Percentage | NUMERIC(5,2) |
| Exchange Rate | NUMERIC(18,8) |
| Date | DATE |
| Timestamp | TIMESTAMP WITH TIME ZONE |
| JSON | JSONB |
| Binary | BYTEA |

Alternative types shall require architectural approval.

---

# 14.5 UUID Standard

All Primary Keys shall use UUID version 4 (random UUIDs), generated by the application or database using an approved UUID generation mechanism.

Requirements

- globally unique
- immutable
- non-sequential
- non-business meaningful

Business identifiers shall never replace UUID Primary Keys.

---

# 14.6 Timestamp Standard

All timestamps shall use:

```text
TIMESTAMP WITH TIME ZONE
```

All timestamps shall be stored in:

```text
UTC
```

Presentation in local time zones shall occur exclusively within the application layer.

Examples

```text
created_at

updated_at

payment_date

travel_date

audit_timestamp
```

---

# 14.7 Audit Column Standard

Every business table shall include the following audit fields.

| Column | Required |
|---------|----------|
| created_at | Yes |
| updated_at | Yes |
| created_by | Yes |
| updated_by | Yes |

Tables supporting soft deletion shall additionally include:

| Column | Required |
|---------|----------|
| deleted_at | Yes |
| deleted_by | Yes |

Audit values shall be maintained automatically wherever possible.

---

# 14.8 Soft Delete Standard

Business entities shall use logical deletion.

Required fields

```text
deleted_at

deleted_by
```

Soft-deleted records shall:

- remain queryable
- preserve relationships
- remain auditable
- remain recoverable where appropriate

Financial and Audit records shall never be soft deleted.

---

# 14.9 Monetary Data Standard

All monetary values shall use:

```text
NUMERIC(12,2)
```

Examples

```text
selling_price

net_price

commission

payment_amount

refund_amount

invoice_total
```

Floating-point types shall never be used for monetary values.

---

# 14.10 Currency Standard

Currencies shall comply with ISO 4217.

Example

```text
ZAR

USD

EUR

GBP
```

Storage

```text
CHAR(3)
```

Exchange rates shall be version-controlled.

---

# 14.11 Character Encoding Standard

The database shall use:

```text
UTF-8
```

All tables shall support multilingual text.

Examples

- customer names
- destination descriptions
- tour descriptions
- supplier comments
- operational notes

---

# 14.12 JSON Standard

JSON shall use PostgreSQL:

```text
JSONB
```

Applicable examples

```text
workflow_event.payload

audit_record.old_values

audit_record.new_values
```

JSON shall not replace properly normalised relational data.

---

# 14.13 Reference Data Standard

Reference data shall be centrally managed.

Examples

```text
Currency

Tax Rate

Role

Permission

Product Type

Destination

Notification Type
```

Reference data shall remain stable and independently versioned where required.

---

# 14.14 Enumeration Standard

Small controlled vocabularies shall be implemented using lookup tables rather than PostgreSQL ENUM types.

Examples

```text
booking_status

reservation_status

payment_status

notification_type
```

Benefits

- easier versioning
- simpler migrations
- improved extensibility
- ORM compatibility

---

# 14.15 Security Standard

Sensitive information shall never be stored in plain text.

Examples

Passwords

```text
password_hash
```

API Credentials

```text
encrypted_secret
```

Personal information requiring additional protection shall be encrypted in accordance with platform security policies.

---

# 14.16 Encryption Standard

Encryption shall apply to:

- credentials
- API secrets
- authentication tokens
- encryption keys
- sensitive configuration values

Encryption at rest shall be enabled for production environments.

Transport encryption shall use TLS.

---

# 14.17 Document Storage Standard

Large binary files shall not be stored directly within transactional tables.

Preferred storage

```text
Object Storage
```

Database tables shall store:

```text
storage_uri

file_name

mime_type

file_size
```

Binary storage inside PostgreSQL shall be reserved for exceptional use cases.

---

# 14.18 Versioning Standard

The following entities shall support versioning where applicable.

Examples

```text
Document Template

Notification Template

Supplier Mapping Rule

System Configuration
```

Historical versions shall remain accessible for audit purposes.

---

# 14.19 Configuration Standard

Application configuration shall reside within the System Configuration domain.

Configuration values shall:

- be centrally managed
- be auditable
- support versioning where required
- separate environment-specific values from business configuration

Secrets shall not be stored in plain text.

---

# 14.20 Time Zone Standard

Business timestamps shall always be stored in UTC.

Examples

```text
Booking Created

Payment Date

Supplier Import

Workflow Event

Audit Record
```

User interfaces shall perform time zone conversion according to the authenticated user's locale or business requirements.

---

# 14.21 Nullability Standard

Columns shall default to:

```text
NOT NULL
```

NULL values shall only be permitted where a business requirement explicitly allows missing information.

Nullable columns shall be documented within the physical model.

---

# 14.22 Default Value Standard

Database defaults shall be limited to deterministic values.

Examples

```text
created_at = now()

active = true

deleted_at = null
```

Business workflow decisions shall never rely on implicit database defaults.

---

# 14.23 Physical Schema Organisation

The database shall be organised into logical schemas.

Recommended schema structure

```text
commercial

catalogue

supplier

financial

operations

platform
```

Supporting schemas may include:

```text
reporting

staging

integration

archive
```

Cross-schema references shall remain fully qualified.

---

# 14.24 Reserved Words

Database object names shall not use PostgreSQL reserved keywords.

Examples to avoid

```text
user

order

group

select

table

index
```

Where unavoidable due to domain terminology, an alternative naming convention shall be adopted.

Examples

```text
platform_user

booking_order

security_role
```

---

# 14.25 Physical Documentation Standard

Every table shall be documented with:

- purpose
- owning domain
- aggregate ownership
- primary key
- foreign keys
- indexes
- constraints
- audit behaviour
- lifecycle

This documentation shall remain synchronised with implementation.

---

# 14.26 Compliance Rules

1. All database objects shall use snake_case naming.

2. UUID shall be the standard Primary Key type.

3. All timestamps shall use `TIMESTAMP WITH TIME ZONE` and be stored in UTC.

4. Monetary values shall use fixed-precision `NUMERIC` data types.

5. JSON data shall use `JSONB` and shall not replace normalised relational structures.

6. Business entities shall implement standard audit columns.

7. Soft deletion shall preserve referential integrity and auditability.

8. Sensitive information shall be encrypted and never stored in plain text.

9. Large binary assets shall be stored externally with database references.

10. Lookup tables shall be preferred over PostgreSQL ENUM types.

11. Database defaults shall be deterministic and never encode business workflow logic.

12. Physical implementation shall remain fully aligned with the Canonical Logical Data Model and all preceding sections of this specification.

---

# 15. Traceability, Compliance & Appendices

## Purpose

This section provides the governance framework for the Physical Data Model.

It establishes traceability between business requirements, architectural specifications and physical implementation, ensuring that every database object can be traced from business capability through to implementation.

This section also defines the compliance checklist, implementation roadmap and supporting appendices required for enterprise governance.

---

# 15.1 Requirements Traceability Matrix

The Physical Data Model shall trace directly to preceding architectural specifications.

| Specification | Relationship |
|--------------|--------------|
| SPEC-001 Business Vision | Business Objectives |
| SPEC-002 Business Capability Model | Capability Support |
| SPEC-003 Business Process Model | Process Implementation |
| SPEC-004 Business Rules | Constraint Enforcement |
| SPEC-005 Domain Model | Aggregate Ownership |
| SPEC-006 Domain Events | Event Persistence |
| SPEC-026 Canonical Logical Data Model | Logical Structure |
| SPEC-027 Physical Data Model | Physical Implementation |
| SPEC-028 Prisma Data Model | ORM Mapping |

Every physical table shall trace back to an approved logical entity.

---

# 15.2 Domain Traceability Matrix

| Domain | Logical Model | Physical Model | Prisma |
|---------|---------------|----------------|---------|
| Commercial | ✓ | ✓ | ✓ |
| Catalogue | ✓ | ✓ | ✓ |
| Supplier | ✓ | ✓ | ✓ |
| Financial | ✓ | ✓ | ✓ |
| Operations | ✓ | ✓ | ✓ |
| Platform | ✓ | ✓ | ✓ |

No domain may exist in the Physical Model without a corresponding Logical Model.

---

# 15.3 Aggregate Traceability

Every Aggregate Root defined in SPEC-026 shall have a corresponding physical table.

## Commercial

```text
Customer

Traveller

Quote

Booking
```

---

## Catalogue

```text
Product

Destination

Product Type
```

---

## Supplier

```text
Supplier

Supplier Product
```

---

## Financial

```text
Invoice

Payment
```

---

## Operations

```text
Itinerary

Vehicle

Driver

Guide

Trailer
```

---

## Platform

```text
User

Role

Document

Notification

Workflow Event

Audit Record

Integration Endpoint

System Configuration
```

Aggregate ownership shall remain identical across all architectural layers.

---

# 15.4 Specification Cross-Reference Matrix

| Section | Related Specification |
|----------|-----------------------|
| Commercial Domain | SPEC-026 |
| Catalogue Domain | SPEC-026 |
| Supplier Domain | SPEC-026 |
| Financial Domain | SPEC-026 |
| Operations Domain | SPEC-026 |
| Platform Domain | SPEC-026 |
| Referential Integrity | SPEC-004 |
| Indexing Strategy | SPEC-029 Performance Architecture* |
| Partitioning | Infrastructure Architecture* |
| Security | Security Architecture* |

\* Future specifications.

---

# 15.5 Implementation Compliance Checklist

The following checklist shall be completed before implementation.

## Physical Schema

- [ ] All tables created
- [ ] Primary Keys implemented
- [ ] Foreign Keys implemented
- [ ] Unique Constraints implemented
- [ ] Check Constraints implemented
- [ ] Indexes created
- [ ] Audit columns included
- [ ] Soft delete implemented where applicable

---

## Referential Integrity

- [ ] Aggregate boundaries enforced
- [ ] Cross-domain references validated
- [ ] No orphan records possible
- [ ] Cascade rules implemented
- [ ] Constraint naming standards applied

---

## Performance

- [ ] Primary Key indexes verified
- [ ] Foreign Key indexes verified
- [ ] Composite indexes reviewed
- [ ] Full-text indexes implemented
- [ ] JSONB indexes implemented
- [ ] Partitioning strategy validated
- [ ] Query plans reviewed

---

## Security

- [ ] Passwords hashed
- [ ] Secrets encrypted
- [ ] TLS enabled
- [ ] Audit logging enabled
- [ ] Least privilege applied

---

## Operations

- [ ] Backup strategy implemented
- [ ] Restore testing completed
- [ ] Monitoring configured
- [ ] Maintenance jobs scheduled
- [ ] Disaster recovery documented

---

# 15.6 Migration Roadmap

Implementation shall follow the sequence below.

```text
Business Model

↓

Domain Model

↓

Canonical Logical Model

↓

Physical Data Model

↓

Prisma Data Model

↓

Migration Scripts

↓

Database Creation

↓

Seed Data

↓

Application Development

↓

Testing

↓

Production Deployment
```

No implementation shall bypass this sequence.

---

# 15.7 Database Review Checklist

Prior to production deployment, the following reviews shall be completed.

## Architecture Review

- Aggregate ownership verified
- Domain boundaries verified
- Naming standards verified
- Normalisation verified

---

## Database Review

- Constraints validated
- Indexes reviewed
- Partitioning reviewed
- Storage estimates reviewed
- Execution plans analysed

---

## Security Review

- Access control validated
- Encryption verified
- Secrets management verified
- Audit coverage reviewed

---

## Operational Review

- Backup verified
- Monitoring verified
- Replication verified
- Maintenance procedures verified

---

# 15.8 Change Management

All schema changes shall follow the controlled architecture process.

Change lifecycle

```text
Business Requirement

↓

Architecture Review

↓

Specification Update

↓

Prisma Update

↓

Migration Script

↓

Testing

↓

Deployment

↓

Documentation Update
```

Direct production schema modifications are prohibited.

---

# 15.9 Versioning

This specification shall remain under version control.

Each revision shall include:

- revision number
- revision date
- author
- summary of changes
- approval status

Physical implementation shall always reference the latest approved specification.

---

# 15.10 Glossary

| Term | Definition |
|------|------------|
| Aggregate | Consistency boundary within the domain model |
| Aggregate Root | Entity through which all aggregate access occurs |
| Canonical Model | Technology-independent representation of business data |
| Domain | Business capability boundary |
| Foreign Key | Database relationship to another table |
| Junction Table | Table implementing a many-to-many relationship |
| Logical Model | Business-oriented data model |
| Physical Model | Database implementation model |
| Soft Delete | Logical deletion preserving historical records |
| UUID | Universally Unique Identifier |

---

# 15.11 Acronyms

| Acronym | Meaning |
|----------|---------|
| API | Application Programming Interface |
| DDD | Domain-Driven Design |
| ERD | Entity Relationship Diagram |
| FK | Foreign Key |
| GIN | Generalized Inverted Index |
| JSONB | Binary JSON |
| MVCC | Multi-Version Concurrency Control |
| OLTP | Online Transaction Processing |
| ORM | Object Relational Mapping |
| PK | Primary Key |
| RPO | Recovery Point Objective |
| RTO | Recovery Time Objective |
| SQL | Structured Query Language |
| TLS | Transport Layer Security |
| UUID | Universally Unique Identifier |

---

# 15.12 Appendix Index

| Appendix | Description |
|-----------|-------------|
| Appendix A | Domain Relationship Diagrams |
| Appendix B | Constraint Naming Standards |
| Appendix C | Index Naming Standards |
| Appendix D | Data Type Standards |
| Appendix E | Compliance Checklist |
| Appendix F | Migration Sequence |
| Appendix G | Review Checklist |
| Appendix H | Glossary & Acronyms |

---

# 15.13 Specification Completion Statement

This specification defines the complete physical database architecture for the Go Cape Tours platform.

It establishes:

- physical database structure
- domain ownership
- referential integrity
- indexing strategy
- partitioning strategy
- performance standards
- physical data standards
- implementation governance
- compliance requirements
- traceability

This specification forms the authoritative source for implementation of the PostgreSQL database schema.

All subsequent implementation artefacts shall remain consistent with this specification.

---

# 15.14 Transition to SPEC-028

The next specification is:

```text
SPEC-028 – Prisma Data Model
```

SPEC-028 shall define:

- Prisma schema structure
- model definitions
- relations
- enums (where appropriate)
- indexes
- constraints
- mappings
- generated client conventions
- migration strategy
- implementation patterns

SPEC-028 shall be a direct implementation of the Physical Data Model defined in this specification.

---

# End of Specification

Document:

```text
SPEC-027 – Physical Data Model
```

Status:

```text
Complete
```

Architecture Status:

```text
Approved for Prisma Model Design
```

Next Specification:

```text
SPEC-028 – Prisma Data Model
```

---

