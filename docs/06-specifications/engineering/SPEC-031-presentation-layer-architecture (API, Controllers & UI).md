# SPEC-031 – Presentation Layer Architecture

# Part 1 – Presentation Layer Principles, API Architecture & Controller Design

## Document Information

| Property | Value |
|----------|-------|
| Specification | SPEC-031 |
| Title | Presentation Layer Architecture |
| Status | Draft |
| Depends On | SPEC-026, SPEC-027, SPEC-028, SPEC-029, SPEC-030 |
| Target Platform | Node.js, Express.js, TypeScript, EJS (SSR), REST API |

---

# 1. Purpose

This specification defines the architecture of the Presentation Layer for the Go Cape Tours platform.

The Presentation Layer provides the interface between external clients and the Application Layer while remaining independent of business logic and persistence concerns.

It is responsible for:

- HTTP request handling
- route management
- authentication entry points
- request deserialization
- response serialization
- view rendering
- API exposure
- presentation validation
- content negotiation

It is **not** responsible for business decisions.

---

# 2. Architectural Position

The Presentation Layer forms the outermost layer of the system.

```text
Browser

Mobile App

Partner API

Admin Portal

        │

Presentation Layer

        │

Application Layer

        │

Domain Layer

        │

Persistence Layer
```

All external communication enters the system through the Presentation Layer.

---

# 3. Presentation Layer Responsibilities

The Presentation Layer shall:

- receive HTTP requests
- authenticate requests
- deserialize payloads
- invoke Application Services
- serialize responses
- render server-side views
- return API responses
- manage routing
- negotiate content types

The Presentation Layer shall never:

- implement business rules
- access repositories
- execute SQL
- manage transactions
- coordinate workflows

---

# 4. Supported Client Types

The platform supports multiple client interfaces.

```text
SSR Website (EJS)

REST API

Administrative Portal

Future Mobile Applications

Partner Integrations
```

All clients shall communicate through standardized presentation contracts.

---

# 5. Architectural Principles

The Presentation Layer shall remain:

- thin
- stateless
- technology-focused
- deterministic
- testable

Business behaviour belongs exclusively to the Application and Domain Layers.

---

# 6. Request Lifecycle

Every HTTP request shall follow a consistent lifecycle.

```text
HTTP Request

↓

Routing

↓

Authentication

↓

Presentation Validation

↓

Controller

↓

Application Layer

↓

Response Mapping

↓

HTTP Response
```

Controllers shall remain lightweight.

---

# 7. Controller Principles

Controllers are responsible for coordinating HTTP interactions.

Controllers shall:

- receive requests
- validate request structure
- invoke Application Services
- map responses
- return HTTP results

Controllers shall not:

- implement business rules
- access repositories
- perform persistence
- invoke Prisma

---

# 8. Controller Structure

Recommended controller layout

```text
Presentation

        │

Controller

        │

Application Service

        │

Response Mapper

        │

HTTP Response
```

Controllers shall delegate all business execution.

---

# 9. Route Organisation

Routes shall be organised by business domain.

```text
Commercial

Catalogue

Supplier

Financial

Operations

Platform
```

Each domain owns its controllers and routes.

---

# 10. Folder Structure

```text
src/

    presentation/

        api/

            controllers/

            routes/

            middleware/

            serializers/

            validators/

            dto/

        web/

            controllers/

            routes/

            middleware/

            view-models/

            views/

        shared/
```

Folder organisation shall reflect architectural boundaries.

---

# 11. REST Resource Principles

REST resources shall represent business concepts.

Examples

```text
Customers

Bookings

Quotes

Products

Destinations

Payments

Vehicles

Itineraries

Suppliers
```

Resources shall not expose implementation details.

---

# 12. URI Standards

URIs shall use plural nouns.

Examples

```text
/api/customers

/api/bookings

/api/products

/api/payments

/api/vehicles

/api/itineraries
```

Verbs shall not appear within resource paths.

Correct

```text
POST /bookings
```

Incorrect

```text
POST /createBooking
```

---

# 13. HTTP Method Standards

| Method | Purpose |
|---------|----------|
| GET | Retrieve |
| POST | Create |
| PUT | Replace |
| PATCH | Partial Update |
| DELETE | Remove |
| OPTIONS | Capability Discovery |

Method semantics shall follow HTTP standards.

---

# 14. Controller Naming Standards

Controllers shall represent resources.

Examples

```text
BookingController

CustomerController

ProductController

SupplierController

PaymentController
```

Avoid generic names.

Incorrect

```text
BookingLogic

BookingUtility

BookingProcessor
```

---

# 15. Dependency Rules

Controllers may depend upon:

- Application Services
- Request DTOs
- Response DTOs
- Validators
- Serializers

Controllers shall never depend upon:

- Prisma Client
- Repositories
- Domain Aggregates
- Database Connections

---

# 16. Request Deserialization

Incoming requests shall be converted into Application DTOs.

Example

```text
HTTP JSON

↓

Presentation DTO

↓

Application DTO

↓

Application Service
```

Deserialization shall occur before business execution.

---

# 17. Response Serialization

Application responses shall be converted into presentation responses.

```text
Application DTO

↓

Presentation DTO

↓

JSON

or

HTML

or

File Download
```

Serialization shall remain consistent across all endpoints.

---

# 18. Content Negotiation

Supported response types

```text
application/json

text/html

application/pdf

text/csv
```

Controllers shall negotiate responses using request headers where appropriate.

---

# 19. Error Responsibility

Presentation Layer responsibilities include:

- translating application exceptions
- returning standardized HTTP responses
- hiding implementation details
- preserving security

Internal exceptions shall never be exposed to clients.

---

# 20. Presentation Layer Compliance Rules

1. The Presentation Layer shall remain independent of business logic.

2. Controllers shall remain thin and orchestration-focused.

3. Every route shall invoke the Application Layer.

4. Controllers shall never access repositories or Prisma.

5. Routes shall be organised by business domain.

6. REST resources shall represent business concepts.

7. HTTP methods shall follow REST semantics.

8. Request deserialization shall occur before Application Layer execution.

9. Response serialization shall remain standardized.

10. This specification shall remain fully aligned with SPEC-026 through SPEC-030.

---

# SPEC-031 – Presentation Layer Architecture

# Part 2 – API Design, Request/Response Standards & Authentication

## Document Purpose

This section defines the standards governing the REST API exposed by the Go Cape Tours platform.

Its objectives are to ensure the API is:

- consistent
- secure
- predictable
- discoverable
- versionable
- technology-agnostic
- suitable for web, mobile and partner integrations

This specification establishes the public contract between clients and the Application Layer.

---

# 1. REST API Principles

The Go Cape Tours platform shall expose a RESTful API.

The API shall:

- represent business resources
- follow HTTP semantics
- remain stateless
- support caching where appropriate
- expose predictable contracts
- remain backwards compatible within supported versions

The API shall not expose internal implementation details.

---

# 2. API Base Structure

Recommended API structure

```text
/api/v1/

    customers/

    bookings/

    quotes/

    products/

    destinations/

    suppliers/

    payments/

    itineraries/

    vehicles/

    users/
```

All endpoints shall exist beneath a versioned API root.

---

# 3. REST Resource Standards

Resources represent Aggregate Roots or business concepts.

Examples

```text
Customers

Bookings

Quotes

Products

Destinations

Payments

Vehicles

Drivers

Guides

Suppliers
```

Resources shall never represent database tables.

---

# 4. URI Naming Standards

URIs shall:

- use plural nouns
- use lowercase
- separate words using hyphens where required
- avoid verbs
- remain stable

Examples

```text
GET /api/v1/bookings

GET /api/v1/products

POST /api/v1/customers

PATCH /api/v1/bookings/{bookingId}

DELETE /api/v1/users/{userId}
```

---

# 5. Nested Resource Standards

Nested resources shall represent ownership.

Examples

```text
/bookings/{id}/notes

/bookings/{id}/travellers

/products/{id}/media

/itineraries/{id}/days
```

Nested depth should not normally exceed two levels.

---

# 6. HTTP Method Usage

| Method | Usage |
|---------|-------|
| GET | Retrieve resource(s) |
| POST | Create resource |
| PUT | Replace resource |
| PATCH | Partial update |
| DELETE | Delete or archive resource |
| OPTIONS | Capability discovery |
| HEAD | Metadata retrieval |

Method behaviour shall remain idempotent where required by HTTP.

---

# 7. Request Standards

Requests shall include:

- authenticated identity (where required)
- valid headers
- supported content type
- request DTO
- correlation identifier

Example headers

```text
Authorization

Content-Type

Accept

X-Correlation-Id
```

---

# 8. Content Types

Supported request formats

```text
application/json

multipart/form-data

application/pdf (download only)

text/csv (download only)
```

JSON shall be the default exchange format.

---

# 9. Request DTO Standards

Request DTOs shall:

- contain only client input
- remain immutable
- support validation
- avoid business behaviour

Example

```text
CreateBookingRequest

CustomerId

TravelDate

ProductId

Travellers

SpecialRequests
```

---

# 10. Response DTO Standards

Responses shall expose only required information.

Example

```text
BookingResponse

BookingSummaryResponse

ProductSearchResponse

CustomerResponse
```

Internal identifiers shall only be exposed where appropriate.

---

# 11. Response Envelope

Successful responses shall follow a consistent structure.

```json
{
  "success": true,
  "data": {
    "...": "..."
  },
  "meta": {
    "...": "..."
  }
}
```

Error responses shall use a separate standardized structure.

---

# 12. Pagination Standard

Collection endpoints shall support pagination.

Request

```text
?page=1

&pageSize=25
```

Response

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 25,
    "totalItems": 500,
    "totalPages": 20
  }
}
```

Pagination shall be deterministic.

---

# 13. Filtering Standard

Filtering shall use query parameters.

Examples

```text
?status=Confirmed

?destination=stellenbosch

?productType=wine-tour

?supplier=hotelbeds

?travelDateFrom=2027-01-01

?travelDateTo=2027-01-31
```

Filtering shall remain composable.

---

# 14. Sorting Standard

Sorting shall use query parameters.

Example

```text
?sort=travelDate

?direction=asc
```

Multiple-field sorting may be supported.

---

# 15. Search Standard

Search endpoints shall support free-text queries.

Example

```text
?q=Franschhoek

?q=booking-10234

?q=John Smith
```

Search shall remain case-insensitive where appropriate.

---

# 16. Authentication

The platform supports authenticated and anonymous endpoints.

Authenticated endpoints require:

- valid identity
- verified credentials
- active account

Anonymous endpoints include examples such as:

```text
Product Catalogue

Destination Information

Availability Search

Public Tour Information
```

---

# 17. Authentication Architecture

Authentication shall occur before controller execution.

Pipeline

```text
HTTP Request

↓

Authentication Middleware

↓

Presentation Validation

↓

Authorization

↓

Controller

↓

Application Layer
```

Unauthenticated requests shall terminate immediately.

---

# 18. Authentication Mechanisms

Supported mechanisms

```text
JWT Access Tokens

Secure HTTP Sessions

Refresh Tokens

API Keys (Partner APIs)
```

Mechanisms may vary depending on client type.

---

# 19. Authorization

Authorization determines whether an authenticated identity may perform a requested action.

Authorization decisions may consider:

- role
- permission
- ownership
- business policy

Authorization shall execute before controller logic.

---

# 20. Permission Model

Permissions are defined within the Platform domain.

Examples

```text
BOOKING_CREATE

BOOKING_UPDATE

BOOKING_CANCEL

CUSTOMER_VIEW

PAYMENT_APPROVE

SUPPLIER_SYNC

USER_MANAGE
```

Controllers shall delegate authorization to the Application Layer.

---

# 21. API Versioning

The platform shall support URI-based versioning.

Example

```text
/api/v1/

/api/v2/
```

Breaking changes require a new API version.

Backward compatibility shall be maintained within a supported version.

---

# 22. HTTP Status Codes

Standard response codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource Created |
| 202 | Accepted |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Failure |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

Controllers shall use HTTP semantics consistently.

---

# 23. Error Response Standard

Error responses shall follow a common structure.

Example

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "Booking could not be located.",
    "correlationId": "...",
    "details": []
  }
}
```

Internal exception details shall never be exposed.

---

# 24. Rate Limiting

Rate limiting shall protect public APIs.

Policies may vary by:

- endpoint
- client
- authenticated user
- partner
- IP address

Exceeded limits shall return HTTP 429.

---

# 25. API Security Standards

API security shall include:

- HTTPS only
- secure headers
- input validation
- output encoding
- CSRF protection (where applicable)
- CORS policy
- request size limits
- content type validation

Security standards shall be enforced consistently.

---

# 26. API Documentation

Every public endpoint shall be documented.

Documentation shall include:

- endpoint
- method
- request DTO
- response DTO
- status codes
- authentication requirements
- authorization requirements
- example requests
- example responses
- error conditions

Documentation shall be maintained alongside implementation.

---

# 27. OpenAPI Standards

The REST API shall expose an OpenAPI specification.

Recommended documentation includes:

```text
Swagger UI

OpenAPI 3.x

JSON Specification

YAML Specification
```

The published specification shall reflect the deployed API.

---

# 28. API Compliance Rules

1. REST resources shall represent business concepts.

2. URIs shall remain stable and versioned.

3. Controllers shall expose standardized request and response contracts.

4. Request DTOs shall remain immutable.

5. Response DTOs shall expose only required information.

6. Collection endpoints shall support pagination.

7. Filtering, sorting and search shall use standardized query parameters.

8. Authentication shall precede controller execution.

9. Authorization shall be enforced before business execution.

10. Error responses shall follow the approved response schema.

11. Public APIs shall be documented using OpenAPI.

12. This specification shall remain fully aligned with SPEC-026 through SPEC-030.

---

# SPEC-031 – Presentation Layer Architecture

# Part 3 – Server-Side Rendering (Express/EJS), View Models & UI Architecture

## Document Purpose

This section defines the Server-Side Rendering (SSR) architecture for the Go Cape Tours platform using Express.js and EJS.

It establishes the standards governing:

- Web Controllers
- View Models
- EJS Templates
- Layout hierarchy
- Navigation
- Forms
- UI Components
- Asset management
- SEO
- Accessibility
- Rendering performance

The objective is to create a maintainable, high-performance, SEO-friendly web application while preserving a clear separation between presentation, application and domain concerns.

---

# 1. SSR Architectural Principles

The Go Cape Tours public website shall be implemented using Server-Side Rendering (SSR).

Technology stack

```text
Node.js

↓

Express.js

↓

EJS Templates

↓

HTML

↓

Browser
```

Rendering shall occur on the server.

---

# 2. SSR Responsibilities

The SSR layer shall:

- receive HTTP requests
- invoke Application Services
- construct View Models
- render HTML
- serve assets
- return complete pages

The SSR layer shall never:

- implement business rules
- access repositories
- communicate directly with Prisma
- execute business workflows

---

# 3. Web Request Lifecycle

Every web request shall follow a consistent lifecycle.

```text
Browser

↓

Express Route

↓

Web Controller

↓

Application Service

↓

Application DTO

↓

View Model Mapper

↓

View Model

↓

EJS Template

↓

HTML Response
```

Presentation responsibilities end with HTML generation.

---

# 4. Web Controller Responsibilities

Web Controllers shall:

- receive requests
- invoke Application Services
- construct View Models
- choose templates
- return rendered HTML

Web Controllers shall never:

- contain business rules
- access repositories
- perform database operations
- execute transactions

---

# 5. View Model Principles

View Models represent presentation-specific data.

They shall:

- be immutable
- contain display-ready values
- contain formatted data
- support rendering only

View Models shall not contain:

- business behaviour
- persistence models
- domain aggregates

---

# 6. View Model Mapping

View Model mapping occurs after the Application Layer.

```text
Application DTO

↓

View Model Mapper

↓

View Model

↓

EJS Template
```

Templates shall receive only View Models.

---

# 7. View Model Examples

Examples include:

```text
HomePageViewModel

ProductDetailsViewModel

WineTourViewModel

BookingSummaryViewModel

DestinationViewModel

CustomerProfileViewModel

CheckoutViewModel
```

Each page owns its own View Model.

---

# 8. Template Organisation

Recommended structure

```text
views/

    layouts/

    partials/

    pages/

        home/

        destinations/

        products/

        wine-tours/

        bookings/

        account/

        checkout/

        admin/

    errors/
```

Templates shall remain organised by business capability.

---

# 9. Layout Hierarchy

Rendering hierarchy

```text
Base Layout

        │

Page Layout

        │

Content Sections

        │

Reusable Components
```

Common elements shall be shared through layouts and partials.

---

# 10. Shared Layout Components

Shared layout components include:

```text
Header

Navigation

Footer

Breadcrumbs

Alerts

Flash Messages

Cookie Banner

Search

Pagination
```

Shared components shall avoid duplicated markup.

---

# 11. Navigation Architecture

Navigation shall reflect the business architecture.

Primary navigation

```text
Home

Wine Tours

Private Tours

Holiday Packages

Destinations

Accommodation

About

Blog

Contact
```

Navigation shall remain consistent across all pages.

---

# 12. Component-Based UI

Reusable presentation components shall be implemented using EJS partials.

Examples

```text
Product Card

Destination Card

Booking Summary

Hotel Card

Review Card

Image Gallery

Price Panel

Call-To-Action Banner
```

Components shall be presentation-only.

---

# 13. Form Handling

Forms shall submit only presentation DTOs.

Submission flow

```text
Browser

↓

Form

↓

Controller

↓

Application Layer
```

Forms shall never invoke business logic directly.

---

# 14. Validation

Validation occurs in two stages.

Client-side

```text
Required Fields

Formatting

Immediate Feedback
```

Server-side

```text
Presentation Validation

↓

Application Validation

↓

Domain Validation
```

Server-side validation remains authoritative.

---

# 15. View State

Temporary presentation state may include:

- selected navigation
- current page
- filters
- sorting
- form values
- validation messages

Business state shall never be stored in templates.

---

# 16. Asset Organisation

Recommended structure

```text
public/

    css/

    js/

    images/

    icons/

    fonts/

    downloads/
```

Assets shall remain independent of application logic.

---

# 17. JavaScript Standards

JavaScript shall progressively enhance the SSR experience.

Suitable uses include:

```text
Image Galleries

Interactive Maps

Autocomplete

Date Pickers

Form Enhancement

Live Validation

Carousel Components
```

Core business functionality shall remain available without JavaScript where practical.

---

# 18. CSS Standards

Presentation styling shall remain modular.

Recommended organisation

```text
Base

Layout

Components

Utilities

Pages

Themes
```

Styling shall remain independent of business behaviour.

---

# 19. Responsive Design

The user interface shall support:

```text
Desktop

Laptop

Tablet

Mobile
```

Responsive behaviour shall be mobile-first.

---

# 20. Accessibility Standards

The website shall comply with recognised accessibility standards.

Requirements include:

- semantic HTML
- keyboard navigation
- accessible forms
- sufficient colour contrast
- alternative text
- focus indicators
- screen reader compatibility

Accessibility shall be considered throughout development.

---

# 21. Localization

Presentation formatting shall support localization.

Examples

```text
Currency

Dates

Times

Numbers

Languages

Regional Formatting
```

Localization shall remain presentation-specific.

---

# 22. SEO Responsibilities

Server-Side Rendering shall support search engine optimisation.

Every public page shall provide:

- unique page title
- meta description
- canonical URL
- Open Graph metadata
- structured headings
- descriptive URLs

Search engine metadata shall be generated by the Presentation Layer.

---

# 23. Metadata Management

Page metadata may include:

```text
Title

Description

Keywords

Canonical URL

Open Graph

Twitter Cards

Robots Directives
```

Metadata shall be generated from View Models.

---

# 24. Error Pages

Standard error pages shall exist for:

```text
400

401

403

404

500

503
```

Error pages shall remain consistent with overall branding.

---

# 25. Rendering Performance

Presentation performance shall be optimized by:

- minimizing template complexity
- reducing duplicate rendering
- lazy loading non-critical assets
- compressing static assets
- minimizing client-side JavaScript
- optimizing images

Rendering performance shall remain measurable.

---

# 26. Caching Strategy

Suitable cache candidates include:

```text
Destination Pages

Wine Region Pages

Blog Articles

Product Listings

Static Assets
```

Dynamic booking and customer information shall not be publicly cached.

---

# 27. Security Standards

The Presentation Layer shall enforce:

- output encoding
- secure cookies
- CSRF protection
- Content Security Policy
- input sanitization
- secure headers

Templates shall never trust unescaped user input.

---

# 28. SSR Folder Structure

```text
src/

    presentation/

        web/

            controllers/

            routes/

            middleware/

            view-models/

            mappers/

            views/

                layouts/

                partials/

                pages/

                errors/

            assets/

public/

    css/

    js/

    images/

    fonts/

    icons/
```

The folder structure shall clearly separate server-side presentation assets from public static assets.

---

# 29. SSR Compliance Rules

1. Server-side rendering shall be the primary rendering strategy.

2. Web Controllers shall remain thin.

3. Templates shall receive only View Models.

4. View Models shall remain presentation-specific.

5. Business logic shall never appear inside templates.

6. Shared UI shall be implemented using layouts and partials.

7. JavaScript shall progressively enhance the SSR experience.

8. Accessibility shall be incorporated into every page.

9. SEO metadata shall be generated by the Presentation Layer.

10. Public assets shall remain independent of application code.

11. Output encoding shall protect against presentation-layer injection attacks.

12. This specification shall remain fully aligned with SPEC-026 through SPEC-030.

---

# SPEC-031 – Presentation Layer Architecture

# Part 4 – Presentation Layer Testing, Performance, Security & Production Readiness

## Document Purpose

This section defines the testing, performance, security and operational standards governing the Presentation Layer of the Go Cape Tours platform.

Its objective is to ensure the public-facing website and REST API remain:

- reliable
- secure
- performant
- accessible
- observable
- maintainable
- production-ready

This section concludes the Presentation Layer Architecture specification.

---

# 1. Presentation Layer Testing Strategy

The Presentation Layer shall be validated using multiple testing levels.

Testing hierarchy

```text
Unit Tests

        ↓

Controller Tests

        ↓

View Model Tests

        ↓

Template Rendering Tests

        ↓

API Tests

        ↓

Browser End-to-End Tests
```

Each testing level validates a distinct architectural responsibility.

---

# 2. Controller Testing

Controllers shall be tested independently from the Application Layer.

Tests shall verify:

- routing
- request deserialization
- response serialization
- status codes
- redirect behaviour
- middleware interaction
- exception translation

Application Services shall be mocked during controller tests.

---

# 3. View Model Testing

View Models shall be verified for:

- correct property mapping
- formatting
- localization
- null handling
- presentation calculations

View Models shall remain deterministic.

---

# 4. Template Rendering Tests

EJS templates shall be tested to verify:

- successful rendering
- conditional rendering
- layout composition
- component rendering
- empty state handling
- error page rendering

Templates shall never fail because optional data is unavailable.

---

# 5. API Testing

REST API tests shall verify:

- endpoint behaviour
- HTTP methods
- request validation
- response schema
- pagination
- filtering
- sorting
- authentication
- authorization
- error responses

Public API contracts shall remain stable.

---

# 6. Browser End-to-End Testing

Browser automation shall verify complete user journeys.

Examples

```text
Homepage Navigation

Wine Tour Search

Accommodation Search

Booking Enquiry

Checkout

Customer Login

Contact Form

Account Management
```

End-to-End tests shall execute against production-like environments.

---

# 7. Cross-Browser Compatibility

The website shall support current versions of major browsers.

Supported browsers include:

```text
Chrome

Edge

Firefox

Safari
```

Unsupported browsers shall degrade gracefully.

---

# 8. Responsive Testing

Presentation shall be verified across:

```text
Desktop

Laptop

Tablet

Mobile
```

Responsive layouts shall preserve usability across supported screen sizes.

---

# 9. Performance Objectives

Presentation performance shall support fast page delivery.

Recommended targets

| Metric | Target |
|---------|--------|
| Initial HTML Response | < 500 ms |
| First Contentful Paint (FCP) | < 1.8 s |
| Largest Contentful Paint (LCP) | < 2.5 s |
| Cumulative Layout Shift (CLS) | < 0.1 |
| Interaction to Next Paint (INP) | < 200 ms |

Performance shall be continuously monitored.

---

# 10. Asset Optimization

Static assets shall be optimized using:

- minification
- compression
- image optimization
- cache headers
- fingerprinted filenames
- lazy loading (where appropriate)

Production builds shall never serve unoptimized assets.

---

# 11. Image Standards

Images shall:

- use modern formats where supported
- include descriptive alternative text
- support responsive sizing
- avoid unnecessary file size
- preserve visual quality

Large hero images shall be optimized before deployment.

---

# 12. SEO Verification

Every public page shall be validated for:

- title
- meta description
- canonical URL
- structured headings
- internal links
- structured data
- sitemap inclusion

SEO validation shall form part of deployment verification.

---

# 13. Structured Data

Structured metadata shall be generated where appropriate.

Examples include:

```text
Organization

Tourist Attraction

Tour

Accommodation

Breadcrumb

FAQ

Article
```

Structured data shall follow Schema.org standards.

---

# 14. Accessibility Verification

Accessibility testing shall verify:

- keyboard navigation
- screen reader compatibility
- focus visibility
- colour contrast
- semantic HTML
- form accessibility
- heading hierarchy

Accessibility shall be verified throughout development.

---

# 15. Security Testing

Presentation security shall verify:

- XSS protection
- CSRF protection
- secure cookies
- HTTPS enforcement
- content security policy
- clickjacking protection
- request validation

Security testing shall occur before every production release.

---

# 16. OWASP Compliance

Presentation security shall align with recognised OWASP guidance.

Testing shall include protection against:

- injection attacks
- broken authentication
- sensitive data exposure
- security misconfiguration
- cross-site scripting
- insecure deserialization
- vulnerable dependencies

Security reviews shall be repeated regularly.

---

# 17. Authentication Testing

Authentication shall verify:

- login
- logout
- session expiration
- token validation
- refresh tokens
- unauthorized access

Authentication failures shall not expose sensitive information.

---

# 18. Authorization Testing

Authorization tests shall verify:

- role enforcement
- permission checks
- resource ownership
- administrative access
- privilege escalation prevention

Protected resources shall never be accessible without authorization.

---

# 19. Logging Standards

Presentation logging shall include:

- request identifier
- correlation identifier
- authenticated user
- response status
- execution duration
- client IP (where permitted)
- user agent

Sensitive request data shall never be logged.

---

# 20. Monitoring & Telemetry

Presentation monitoring shall collect:

- request count
- response time
- error rate
- route popularity
- rendering duration
- cache effectiveness
- browser performance metrics

Monitoring shall support operational dashboards.

---

# 21. Health Monitoring

Presentation health checks shall verify:

- web server availability
- routing
- static asset delivery
- template rendering
- Application Layer connectivity
- dependency availability

Health endpoints shall support readiness and liveness probes.

---

# 22. Deployment Standards

Presentation deployment sequence

```text
Build Assets

↓

Run Tests

↓

Optimize Assets

↓

Deploy Application

↓

Warm Cache

↓

Execute Smoke Tests

↓

Enable Monitoring
```

Rollback procedures shall be documented before deployment.

---

# 23. Operational Readiness Checklist

Before production deployment verify:

- Controller tests passing
- View Model tests passing
- Template tests passing
- API tests passing
- Browser tests passing
- Accessibility verified
- SEO validated
- Security review completed
- Performance targets achieved
- Assets optimized
- Logging enabled
- Monitoring operational
- Health checks passing
- Production configuration verified

Deployment shall not proceed until mandatory checks have passed.

---

# 24. Presentation Layer Compliance Rules

1. Controllers shall be tested independently of the Application Layer.

2. View Models shall remain deterministic and presentation-focused.

3. Templates shall render successfully for all supported scenarios.

4. Public API contracts shall remain stable.

5. Browser compatibility shall be verified before release.

6. Core Web Vitals shall remain within approved thresholds.

7. Accessibility shall be verified throughout development.

8. Presentation security shall align with recognised OWASP guidance.

9. Structured metadata shall be validated for SEO-critical pages.

10. Production deployments shall complete the operational readiness checklist.

11. Presentation monitoring shall remain active in production.

12. This specification shall remain fully aligned with SPEC-026 through SPEC-030.

---

# 25. Presentation Layer Completion Statement

SPEC-031 defines the complete Presentation Layer Architecture for the Go Cape Tours platform.

It establishes:

- Presentation Layer principles
- REST API architecture
- Controller standards
- Routing conventions
- Request and response contracts
- Authentication and authorization boundaries
- Server-Side Rendering architecture
- Express.js and EJS implementation standards
- View Model architecture
- Template organization
- UI component standards
- Accessibility requirements
- SEO responsibilities
- Performance standards
- Security requirements
- Testing strategy
- Operational readiness

Together with:

- SPEC-026 – Canonical Logical Data Model
- SPEC-027 – Physical Data Model
- SPEC-028 – Prisma Data Model
- SPEC-029 – Repository & Persistence Architecture
- SPEC-030 – Application Layer Architecture

this specification provides the authoritative blueprint for implementing a scalable, secure, maintainable and production-ready Presentation Layer for the Go Cape Tours platform.

----

