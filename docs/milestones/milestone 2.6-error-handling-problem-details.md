# Milestone 2.6 – Error Handling & Problem Details

## Objective

Implement the canonical error handling framework for GCT Core.

This milestone introduces:

- Standard platform exceptions
- Global Express error middleware
- RFC 9457 Problem Details responses
- Exception-to-HTTP mapping

No business functionality shall be implemented.

---

# Existing Architecture

Continue using the approved project structure.

Do NOT reorganise folders.

Do NOT introduce dependency injection.

Do NOT modify existing platform endpoints beyond registering the global error handler.

---

# Scope

Implement ONLY:

- Shared exception hierarchy
- Global error middleware
- Problem Details response model
- Exception mapping

Do NOT implement:

- Business exceptions
- Validation framework
- Authentication
- Authorization
- Logging enhancements
- Database exception translation
- Feature modules

---

# Recommended Structure

Introduce the following shared HTTP infrastructure:

src/interfaces/http/

    middleware/
        error.middleware.ts

    errors/
        api-error.ts
        bad-request.error.ts
        unauthorized.error.ts
        forbidden.error.ts
        not-found.error.ts
        conflict.error.ts
        internal-server.error.ts

    dto/
        problem-details.ts

Use existing folder conventions where appropriate.

---

# Problem Details DTO

Implement an RFC 9457 compatible response model.

Suggested fields:

- type
- title
- status
- detail
- instance
- timestamp

The DTO should remain generic and reusable.

---

# API Error Base Class

Implement a reusable base exception.

Suggested properties:

- statusCode
- title
- detail
- type

All platform exceptions shall derive from this class.

---

# Standard Platform Exceptions

Implement:

BadRequestError (400)

UnauthorizedError (401)

ForbiddenError (403)

NotFoundError (404)

ConflictError (409)

InternalServerError (500)

These are platform exceptions only.

Do not introduce business-specific exceptions.

---

# Global Error Middleware

Implement a single Express error middleware.

Responsibilities:

- detect ApiError instances
- map to Problem Details responses
- convert unknown exceptions into InternalServerError
- never expose stack traces in HTTP responses
- preserve existing request logging

The middleware should become the final middleware registered by Express.

---

# Express Registration

Update express.ts to register the global error middleware after all routes and the existing 404 handler.

Middleware order should become:

1. Platform middleware
2. Routers
3. 404 handler
4. Global error middleware

---

# Existing Endpoints

Do NOT refactor existing platform endpoints to throw exceptions.

Do NOT modify endpoint response contracts.

This milestone establishes the infrastructure only.

Future milestones will adopt it incrementally.

---

# Validation

The following shall succeed:

npm run build

npm run dev

Verify:

✓ Existing platform endpoints still return the same responses.

✓ Existing middleware behaviour remains unchanged.

✓ Unknown routes continue returning JSON 404.

✓ Throwing an ApiError from a temporary test route produces a valid Problem Details response.

✓ Unknown errors return HTTP 500 with Problem Details.

✓ No stack traces are exposed to clients.

---

# Deliverables

Return:

- files created
- files modified
- exception hierarchy
- middleware registration summary
- validation results

Do not implement future milestones.

Keep this commit strictly limited to canonical error handling infrastructure.