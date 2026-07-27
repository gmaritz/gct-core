# Milestone 2.3 – Platform Middleware

## Objective

Implement the global Express middleware required for the GCT Core platform.

This milestone prepares the HTTP pipeline for future APIs while remaining completely independent of business functionality.

No business routes shall be implemented.

---

# Existing Architecture

Continue using the approved project structure.

Do NOT reorganise folders.

Do NOT introduce new architectural layers.

---

# Scope

Implement ONLY the following middleware:

- CORS
- Helmet
- Compression
- Request Logging
- Request ID
- Trust Proxy
- Disable x-powered-by

Do NOT implement:

- Authentication
- Authorization
- Validation
- Rate limiting
- Sessions
- Cookies
- CSRF
- Feature routes

---

# bootstrap/express.ts

Extend the existing Express bootstrap.

Configure middleware in the following order:

1. trust proxy
2. disable x-powered-by
3. request ID
4. request logging
5. helmet
6. compression
7. cors
8. express.json()
9. health endpoint
10. 404 handler

Do not register any feature routes.

---

# Request ID

Generate a unique request ID for every request.

Expose it as:

```
X-Request-Id
```

Store it on the request object for future logging.

Use Node's built-in `crypto.randomUUID()`.

Do not introduce additional packages.

---

# Request Logging

Implement lightweight request logging.

Log:

- Request ID
- HTTP method
- URL
- Status code
- Response time

Console output is sufficient.

Use the existing logging abstraction.

Do not introduce Morgan.

---

# Helmet

Configure Helmet using the default secure configuration.

Do not customise CSP during this milestone.

---

# Compression

Enable gzip compression.

Use default configuration.

---

# CORS

Enable CORS.

For now:

- Allow localhost development.
- Keep configuration centralized so it can later be environment-specific.

Do not hardcode production origins.

---

# Express Settings

Enable:

```
app.set("trust proxy", true)
```

Disable:

```
x-powered-by
```

---

# Validation

The following shall succeed:

```bash
npm run build

npm run dev
```

Verify:

✓ Existing /health endpoint still returns HTTP 200.

✓ Unknown routes still return HTTP 404.

✓ Response headers include:

- X-Request-Id

✓ x-powered-by header is absent.

✓ Requests are logged.

✓ Gzip compression enabled.

✓ No existing bootstrap behaviour regresses.

---

# Deliverables

Return:

- files modified
- middleware added
- request pipeline summary
- validation results

Do not implement future milestones.

Keep this commit strictly limited to platform middleware.