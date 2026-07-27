# Milestone 2.1 – Application Bootstrap

## Objective

Implement the GCT Core application bootstrap.

This milestone establishes the application startup pipeline only.

The objective is to prove that the platform can initialise successfully before introducing Express, HTTP routing or business features.

---

# Existing Architecture

The project already follows the approved enterprise architecture.

Use the existing folder structure exactly as it exists.

Do NOT reorganise the project.

Do NOT create duplicate layers.

The following folders already exist and shall remain unchanged:

- application
- domain
- infrastructure
- interfaces
- shared
- bootstrap
- config

---

# Scope

Implement ONLY the application bootstrap.

Do NOT implement:

- Express server
- HTTP routes
- Controllers
- Middleware
- Authentication
- Dependency Injection
- Business services
- Repository implementations
- Feature modules

The existing `bootstrap/express.ts` file shall remain unused during this milestone.

---

# Responsibilities

## src/index.ts

Replace the current placeholder implementation.

The entry point shall only:

- invoke the application bootstrap
- handle fatal startup errors
- terminate with exit code 1 on startup failure

No business logic may exist in this file.

---

## bootstrap/application.ts

Implement the application startup orchestrator.

Startup order:

1. Load configuration
2. Initialise logging
3. Initialise Prisma
4. Register lifecycle handlers
5. Report successful startup

This file coordinates startup only.

It must not contain implementation logic for configuration, logging or Prisma.

---

## bootstrap/configuration.ts

Load and validate application configuration.

Responsibilities:

- load environment variables
- validate required settings
- expose a typed configuration object

Required configuration:

- NODE_ENV
- PORT
- DATABASE_URL

Defaults:

NODE_ENV = development

PORT = 3000

Fail startup if DATABASE_URL is missing.

Do not introduce additional configuration libraries unless already present in the project.

---

## bootstrap/logging.ts

Implement a lightweight logging abstraction.

Expose:

- info()
- warn()
- error()

Internally this may use console methods.

The objective is to centralise logging behind a single interface so that Winston or Pino can later replace the implementation without affecting bootstrap code.

Do not scatter console.log throughout the application.

---

## bootstrap/prisma.ts

Implement a singleton PrismaClient.

Responsibilities:

- create one PrismaClient instance
- connect during startup
- expose the singleton
- disconnect during shutdown

Do not create repositories here.

Do not perform queries.

Startup should fail if Prisma cannot connect.

---

## bootstrap/lifecycle.ts

Register graceful shutdown handlers.

Handle:

- SIGINT
- SIGTERM

Shutdown sequence:

1. Log shutdown start
2. Disconnect Prisma
3. Flush logger
4. Exit cleanly

---

# Startup Output

Provide clear startup progress similar to:

==================================================

Go Cape Tours Core Platform

Environment : Development

✓ Configuration Loaded

✓ Logger Initialised

✓ Prisma Connected

✓ Lifecycle Registered

Platform Bootstrap Complete

==================================================

Exact wording is not important.

Clear progress reporting is.

---

# Validation

The following command must succeed:

```bash
npm run dev
```

Expected behaviour:

- configuration loads successfully
- Prisma connects successfully
- lifecycle handlers register
- startup messages are displayed
- process remains running
- Ctrl+C performs graceful shutdown

No HTTP server shall start during this milestone.

---

# Deliverables

Return:

- files created
- files modified
- startup sequence summary
- validation results

Do not introduce additional architecture.

Do not implement future milestones.

This commit is strictly limited to establishing a robust application bootstrap.