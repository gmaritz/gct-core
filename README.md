# gct-core

## Anonymous frontend sessions

The `/ui` frontend issues opaque, server-validated session cookies backed by PostgreSQL. Apply the committed Prisma migrations before serving frontend requests. Session lifetime is configured with `ANONYMOUS_SESSION_TTL_SECONDS` (default 43,200 seconds; allowed range 300–604,800 seconds). The session cookie is `HttpOnly`, host-only, `SameSite=Lax`, scoped to `/ui`, and marked `Secure` when `NODE_ENV=production`; production deployments must use HTTPS. Frontend state-changing forms require their session-bound CSRF token.