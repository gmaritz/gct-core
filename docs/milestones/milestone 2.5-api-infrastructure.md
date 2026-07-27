# Milestone 2.5 – API Infrastructure

## Objective

Establish the reusable API infrastructure that all future business capabilities will use.

This milestone introduces:

- Standard API response models
- Pagination models
- Query parameter models
- Base controller utilities
- Shared HTTP constants

No business functionality shall be implemented.

---

# Existing Architecture

Continue using the approved project structure.

Do NOT reorganise folders.

Do NOT introduce dependency injection.

Do NOT implement feature modules.

---

# Scope

Implement ONLY reusable API infrastructure.

Do NOT implement:

- Business controllers
- Validation
- Authentication
- Authorization
- Error handling middleware
- Repository access
- Database queries

---

# Recommended Structure

Introduce the following shared HTTP infrastructure:

src/interfaces/http/

    controllers/
        base.controller.ts

    dto/
        api-response.ts
        paged-response.ts
        page-request.ts
        sort-request.ts

    constants/
        api.constants.ts

Use existing folder conventions where appropriate.

---

# API Response Model

Implement a reusable generic response model.

Example:

```typescript
ApiResponse<T>
```

Suggested shape:

```typescript
{
    success: true,
    data: T,
    timestamp: string
}
```

Keep the model generic.

Do not include business fields.

---

# Paged Response

Implement:

```typescript
PagedResponse<T>
```

Suggested fields:

- items
- page
- pageSize
- totalItems
- totalPages

This becomes the standard response for collection endpoints.

---

# Page Request

Implement a reusable request model.

Suggested properties:

- page
- pageSize

Apply sensible defaults.

Do not perform validation.

---

# Sort Request

Implement reusable sorting metadata.

Suggested properties:

- sortBy
- direction

Direction should support:

- asc
- desc

No validation required.

---

# API Constants

Create a shared constants module.

Suggested constants:

API_PREFIX

API_VERSION

DEFAULT_PAGE_SIZE

MAX_PAGE_SIZE

DEFAULT_SORT_DIRECTION

These values should become the platform defaults.

---

# Base Controller

Implement a lightweight reusable controller utility.

Responsibilities:

- createSuccessResponse()
- createPagedResponse()

No routing logic.

No Express dependencies beyond Response typing.

No business logic.

---

# Existing Routes

Do NOT modify existing platform endpoints.

Do NOT convert them to use the new infrastructure yet.

That refactoring will occur during later milestones.

---

# Validation

The following shall succeed:

npm run build

npm run dev

Verify:

✓ Existing platform endpoints continue functioning.

✓ No routing regressions.

✓ No middleware regressions.

✓ Infrastructure compiles successfully.

---

# Deliverables

Return:

- files created
- files modified
- infrastructure summary
- validation results

Do not implement future milestones.

Keep this commit strictly limited to reusable API infrastructure.