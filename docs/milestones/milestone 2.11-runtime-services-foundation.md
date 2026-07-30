# Milestone 2.11 – Runtime Services Foundation

## Objective

Implement the Runtime Services Foundation for GCT Core.

This milestone establishes:

- Runtime service abstraction
- Service registry
- Lifecycle integration
- Background task framework
- Scheduler foundation
- Graceful shutdown coordination

No business jobs shall be implemented.

No supplier integrations shall be implemented.

No scheduled work shall execute.

---

# Existing Architecture

Continue using the approved project structure.

Do NOT reorganise existing layers.

Do NOT introduce dependency injection.

Do NOT introduce external job frameworks.

Do NOT introduce queues.

Do NOT implement cron jobs.

This milestone builds the framework only.

---

# Scope

Implement ONLY:

- Runtime service interface
- Runtime service registry
- Lifecycle manager
- Scheduler abstraction
- Background worker abstraction
- Health integration

Do NOT implement:

- Supplier synchronisation

- Availability refresh

- Cache refresh

- Email sending

- Booking processing

- Payment jobs

Those belong to future milestones.

---

# Recommended Structure

Introduce:

src/application/runtime/

    runtime.service.ts
    runtime.registry.ts
    runtime.manager.ts

    scheduler/

        scheduler.interface.ts
        scheduler.service.ts

    workers/

        worker.interface.ts
        worker.registry.ts

    index.ts

---

# Runtime Service Interface

Define a common contract.

Suggested operations:

start()

stop()

health()

name()

status()

Every runtime component should implement this interface.

---

# Runtime Registry

Create a registry responsible for:

register()

startAll()

stopAll()

health()

Future runtime services register themselves here.

Avoid manual startup code scattered throughout the application.

---

# Runtime Manager

Integrate with the existing application lifecycle.

Responsibilities:

Application startup

↓

Start runtime services

↓

Application running

↓

Graceful shutdown

↓

Stop runtime services

Do not change existing lifecycle behaviour.

Extend it.

---

# Scheduler

Create an abstraction only.

Example responsibilities:

registerJob()

removeJob()

listJobs()

No scheduling implementation.

No cron expressions.

No timers.

Future milestones will provide implementations.

---

# Worker Registry

Create a lightweight registry.

Responsibilities:

register worker

list workers

lookup worker

No worker execution.

---

# Health Integration

Extend readiness diagnostics.

Expose runtime service status.

Example:

{
    "status": "READY",
    "database": "CONNECTED",
    "runtime": "READY",
    "services": [],
    "uptimeSeconds": ...
}

Do not fabricate services.

If none exist, return an empty collection.

---

# Observability

Log:

Runtime Manager started

Runtime services registered

Runtime shutdown completed

Use the existing structured logger.

---

# Testing

Add integration coverage for:

Runtime manager startup

Runtime manager shutdown

Registry registration

Readiness diagnostics

No scheduler execution tests.

---

# Validation

Verify:

npm test

npm run build

npm run dev

Verify:

✓ Existing endpoints unchanged.

✓ Existing middleware unchanged.

✓ Existing OpenAPI unchanged.

✓ Runtime registry initialises correctly.

✓ Graceful shutdown remains functional.

✓ No behavioural regressions.

---

# Deliverables

Return:

- files created
- files modified
- runtime architecture summary
- tests added
- validation results

Keep this milestone strictly limited to runtime infrastructure.

Do not implement future background jobs.

Do not introduce queues.

Do not introduce external scheduling libraries.