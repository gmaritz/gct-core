-- APP-011: normalized Customer email is the authoritative anonymous-booking identity key.
UPDATE "customer" SET "email" = LOWER(BTRIM("email"));

CREATE UNIQUE INDEX "customer_email_key" ON "customer"("email");