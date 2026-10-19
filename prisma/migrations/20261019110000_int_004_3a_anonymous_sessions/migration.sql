CREATE TABLE "anonymous_session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "csrfToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "anonymous_session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "anonymous_session_tokenHash_key"
    ON "anonymous_session"("tokenHash");

CREATE INDEX "anonymous_session_expiresAt_idx"
    ON "anonymous_session"("expiresAt");
