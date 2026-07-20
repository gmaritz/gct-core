# GCT Core - Implementation Guide

**Status:** ✅ SPEC-001 Implementation Complete  
**Date:** 2026-07-20  
**Architecture:** Domain-Driven Design (DDD) with Clean Architecture  

---

## Overview

This document describes the GCT Core platform structure as implemented according to **SPEC-001 – Project Structure**.

GCT Core is a premium travel commerce platform built using:
- **Architecture:** Domain-Driven Design (DDD), Clean Architecture, CQRS Pattern
- **Language:** TypeScript (Node.js)
- **Persistence:** Prisma + PostgreSQL
- **API:** Express.js (HTTP REST)

All business logic is isolated in the Domain Layer. Infrastructure and framework details never leak into the domain.

---

## Project Structure

```
src/
├── domain/                    # Pure business logic (DDD)
│   ├── aggregates/            # Aggregate roots
│   ├── entities/              # Domain entities
│   ├── value-objects/         # Immutable value objects
│   ├── repositories/          # Repository interfaces (contracts)
│   ├── services/              # Domain services
│   ├── events/                # Domain events
│   ├── policies/              # Business policies
│   ├── specifications/        # Business specifications (Spec pattern)
│   ├── exceptions/            # Domain exceptions
│   └── shared/                # Base classes (Entity, ValueObject, AggregateRoot, etc.)
│
├── application/               # Use case orchestration
│   ├── commands/              # Write operations (CQRS)
│   ├── queries/               # Read operations (CQRS)
│   ├── handlers/              # Command/Query handlers
│   ├── services/              # Application services
│   ├── dto/                   # Data Transfer Objects
│   └── mappers/               # DTO↔Domain mappers
│
├── infrastructure/            # Technical implementations
│   ├── persistence/           # Prisma ORM implementation
│   │   ├── prisma/            # Prisma client management
│   │   ├── repositories/      # Repository implementations
│   │   └── mappers/           # Persistence mappers
│   ├── suppliers/             # Supplier integrations (Hotelbeds, etc.)
│   │   └── acl/               # Anti-Corruption Layers
│   ├── payments/              # Payment gateways (PayFast, Stripe)
│   ├── communications/        # Email, SMS, WhatsApp providers
│   ├── ai/                    # AI integrations
│   │   ├── itinerary-assistant/
│   │   └── recommendation-engine/
│   └── logging/               # Centralized logging
│
├── interfaces/                # External API exposure
│   ├── api/                   # HTTP route definitions
│   ├── controllers/           # Request handlers
│   ├── middleware/            # Auth, validation, logging
│   └── presenters/            # Response transformation
│
└── shared/                    # Framework-independent utilities
```

---

## Architectural Layers

### 1. Domain Layer (`src/domain/`)

**Purpose:** Contains 100% pure business logic with zero framework dependencies.

**Characteristics:**
- No Express, Prisma, HTTP, or framework code
- Business rules are sacred and protected
- Testable without mocks or frameworks

**Key Components:**

#### Aggregates
- `Traveller` - Long-term customer relationship
- `Reservation` - Booking of a journey
- `Journey` - Complete travel experience

#### Value Objects
- `Money` - Currency + amount (immutable)
- `EmailAddress` - Validated email (immutable)
- `DateRange` - Time period (immutable)

#### Events
- `TravellerCreatedEvent`
- `ReservationCreatedEvent`
- `ReservationConfirmedEvent`
- `JourneyCreatedEvent`

#### Exceptions
- `TravellerNotFoundException`
- `ReservationNotFoundException`
- `InvalidReservationException`

#### Base Classes (in `shared/`)
- `AggregateRoot` - Base for all aggregate roots with event sourcing support
- `Entity` - Base for entities with identity
- `ValueObject` - Base for immutable value objects
- `DomainEvent` - Base for all domain events
- `Specification<T>` - Business rule composition pattern

### 2. Application Layer (`src/application/`)

**Purpose:** Orchestrate use cases. Contains zero business rules.

**Components:**

#### Commands (Write Operations)
```typescript
- CreateTravellerCommand
- CreateReservationCommand
- ConfirmReservationCommand
- CancelReservationCommand
- CreateJourneyCommand
```

#### Queries (Read Operations)
```typescript
- FindTravellerQuery
- FindReservationQuery
- FindJourneyQuery
```

#### Data Transfer Objects (DTOs)
- `TravellerDTO`
- `ReservationDTO`
- `JourneyDTO`

#### Mappers
Map between domain aggregates and DTOs:
- `TravellerMapper`
- `ReservationMapper`
- `JourneyMapper`

**Usage Pattern:**
```typescript
// Handler receives command
// Maps to domain aggregate
// Executes business logic
// Saves to repository
// Returns DTO
```

### 3. Infrastructure Layer (`src/infrastructure/`)

**Purpose:** Implements technical concerns. Never accessed by Domain Layer.

**Components:**

#### Persistence
- `PrismaService` - Lifecycle management
- Repository implementations (Prisma-based)
  - `TravellerPrismaRepository`
  - `ReservationPrismaRepository`
  - `JourneyPrismaRepository`

#### Supplier Integrations
- **Hotelbeds** - Hotel availability and booking
- **Anti-Corruption Layer (ACL)** - Translates supplier models → domain models

#### Payment Gateways
- **PayFast** - South African payment processor
- **Stripe** - International payment processor

#### Communications
- Email
- SMS
- WhatsApp

#### AI Integrations
- **Itinerary Assistant** - AI-powered journey planning
- **Recommendation Engine** - Personalized recommendations

#### Logging
- Centralized application logging

### 4. Interfaces Layer (`src/interfaces/`)

**Purpose:** Exposes the application externally via HTTP APIs.

**Components:**

#### Controllers
Receive HTTP requests and delegate to application services.

#### Middleware
- Authentication
- Authorization
- Request validation
- Logging

#### Presenters
Transform application DTOs into API response format.

Example:
```typescript
// DTO from application
const travellerDTO: TravellerDTO = {
  id: "...",
  firstName: "John",
  lastName: "Doe",
  ...
};

// Presenter transforms to API response
const response = TravellerPresenter.toJSON(travellerDTO);
// Result: { firstName, lastName, fullName, ... }
```

### 5. Shared Layer (`src/shared/`)

**Purpose:** Framework-independent utilities and helpers.

Maintains no framework coupling.

---

## Key Design Patterns

### 1. Repository Pattern
Repositories are **interfaces** in the domain layer, implemented in the infrastructure layer.

```typescript
// Domain (interface only)
export interface ITravellerRepository extends IRepository<Traveller> {
  findByEmail(email: string): Promise<Traveller | null>;
}

// Infrastructure (implementation)
export class TravellerPrismaRepository implements ITravellerRepository {
  async findByEmail(email: string): Promise<Traveller | null> {
    // Prisma logic here
  }
}
```

### 2. Value Objects
Immutable, compared by value. Encapsulate validation.

```typescript
const money = Money.create(100.50, "USD");
const newAmount = money.add(Money.create(50.00, "USD"));
// Result: Money with 150.50 USD
```

### 3. Domain Events
Immutable records of significant business occurrences.

```typescript
const event = new TravellerCreatedEvent(travelleId, firstName, lastName, email);
aggregate.addDomainEvent(event);
// Later: event is published to event bus
```

### 4. Specification Pattern
Composable business rules.

```typescript
const validReservation = new ReservationValidSpecification();
const activeReservation = new ActiveReservationSpecification();
const rule = validReservation.and(activeReservation);

if (rule.isSatisfiedBy(reservation)) {
  // Process reservation
}
```

### 5. CQRS (Command Query Responsibility Segregation)
Commands (writes) and Queries (reads) are separated.

```typescript
// Command
const command = new CreateTravellerCommand(firstName, lastName, email);
// Dispatched to handler

// Query
const query = new FindTravellerQuery(travellerId);
// Dispatched to query handler
```

---

## Dependency Flow

Dependencies always point **inward**:

```
        ┌─────────────────────┐
        │    Interfaces       │
        │  (HTTP/REST)        │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │   Application       │
        │ (Use Cases/CQRS)    │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │     Domain          │
        │  (Business Logic)   │
        └──────────▲──────────┘
                   │
        ┌──────────┴──────────┐
        │ Infrastructure      │
        │ (Prisma/Payments)   │
        └─────────────────────┘
```

**Rule:** Domain never imports from Infrastructure or Interfaces.

---

## Implementing New Features

### Step 1: Model in Domain Layer

```typescript
// src/domain/aggregates/hotel-booking.aggregate.ts
export class HotelBooking extends AggregateRoot {
  // Business logic here
}

// src/domain/value-objects/room-rate.vo.ts
export class RoomRate extends ValueObject {
  // Rate logic here
}

// src/domain/events/hotel-booking-created.event.ts
export class HotelBookingCreatedEvent extends DomainEvent {
  // Event here
}
```

### Step 2: Create Repository Interface

```typescript
// src/domain/repositories/hotel-booking.repository.ts
export interface IHotelBookingRepository extends IRepository<HotelBooking> {
  findByReservationId(reservationId: string): Promise<HotelBooking | null>;
}
```

### Step 3: Create Application Layer

```typescript
// src/application/commands/create-hotel-booking.command.ts
export class CreateHotelBookingCommand {
  constructor(readonly reservationId: string, readonly roomType: string) {}
}

// src/application/dto/hotel-booking.dto.ts
export interface HotelBookingDTO {
  id: string;
  reservationId: string;
  // ...
}

// src/application/mappers/hotel-booking.mapper.ts
export class HotelBookingMapper {
  static toDomain(raw: any): HotelBooking { /* ... */ }
  static toDTO(aggregate: HotelBooking): HotelBookingDTO { /* ... */ }
}
```

### Step 4: Implement Infrastructure

```typescript
// src/infrastructure/persistence/repositories/hotel-booking-prisma.repository.ts
export class HotelBookingPrismaRepository implements IHotelBookingRepository {
  async save(aggregate: HotelBooking): Promise<void> { /* ... */ }
  async findById(id: string): Promise<HotelBooking | null> { /* ... */ }
}
```

### Step 5: Create API Interface

```typescript
// src/interfaces/controllers/hotel-booking.controller.ts
export class HotelBookingController {
  async create(req: Request, res: Response): Promise<void> {
    // Receive request → invoke application service → return DTO
  }
}

// src/interfaces/presenters/hotel-booking.presenter.ts
export class HotelBookingPresenter {
  static toJSON(dto: HotelBookingDTO): any { /* ... */ }
}
```

---

## Building and Testing

### Build
```bash
npm run build
```
Compiles TypeScript to `dist/` directory with source maps.

### Lint
```bash
npm run lint
```
Runs ESLint on TypeScript source.

### Format
```bash
npm run lint:fix
```
Auto-fixes linting issues.

### Type Check
```bash
npm run type-check
```
Checks TypeScript types without emitting.

### Test
```bash
npm test
npm run test:watch
npm run test:coverage
```

---

## Configuration Files

### tsconfig.json
- Target: ES2020
- Strict mode enabled
- Path aliases for clean imports (`@domain/*`, `@application/*`, etc.)
- Source maps enabled
- Strict null checks and type checking enabled

### jest.config.js
- Test environment: Node.js
- Module mapper for path aliases
- Coverage collection from `src/**/*.ts`
- Coverage thresholds: 70% (branches, functions, lines, statements)

### .eslintrc.json
- Extends ESLint recommended + TypeScript plugin
- Enforces explicit function return types
- No-console rule (warn)
- No unused variables

---

## Next Steps

1. **Implement Prisma Schema** - Define data models in `prisma/schema.prisma`
2. **Implement Handlers** - Create command/query handlers in `src/application/handlers/`
3. **Implement Controllers** - Create HTTP controllers in `src/interfaces/controllers/`
4. **Add Tests** - Implement unit tests for domain layer
5. **Configure Database** - Set up PostgreSQL and run migrations
6. **Add API Routes** - Define Express routes in `src/interfaces/api/`
7. **Implement Supplier Integrations** - Add Hotelbeds ACL
8. **Add Payment Processing** - Implement PayFast/Stripe integration

---

## References

- **Specification:** [SPEC-001 – Project Structure](../specifications/SPEC-001%20–%20Project%20Structure.md)
- **Domain Documentation:** [Domain Overview](../03-domain/00-domain-overview.md)
- **Architecture:** [DDD, Clean Architecture, CQRS](../04-architecture/)

---

**Implementation Date:** 2026-07-20  
**Implemented By:** GitHub Copilot  
**Status:** Ready for development
