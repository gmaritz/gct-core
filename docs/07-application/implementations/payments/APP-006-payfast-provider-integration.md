# APP-006 — PayFast Provider Integration

## Document Control

| Field | Value |
|---|---|
| Document ID | APP-006.8 |
| Title | PayFast Provider Integration |
| Version | 1.0.0 |
| Status | Implementation Specification |
| Capability | APP-006 Payment |
| Provider | PayFast |
| Related Capabilities | APP-004 Reservation, APP-005 Pricing, APP-007 Invoice |
| Governing Process | GOV-DEV-001-DEVELOPMENT-PROCESS.md |
| Provider Documentation | Official PayFast Developer Documentation |
| Scope | Concrete PayFast adapter and payment-provider integration |

## 1. Purpose

This specification defines the concrete PayFast implementation behind the existing supplier-neutral APP-006 payment architecture.

The existing APP-006 payment domain, application services and provider abstraction remain authoritative.

This specification SHALL NOT redesign APP-006.

The target architecture is:

APP-004 Reservation / APP-005 Pricing
        ↓
APP-006 Payment
        ↓
PaymentGateway
        ↓
PayFast Adapter
        ↓
PayFast

PayFast-specific behaviour SHALL remain inside the infrastructure/provider boundary.

## 2. Business Objective

Go Cape Tours has used PayFast as its payment gateway for more than ten years and has an existing PayFast merchant account.

GCT Core SHALL support PayFast as the concrete payment provider while maintaining a supplier-neutral payment application/domain layer.

The integration SHALL support the payment lifecycle required by GCT Core, including:

- payment initiation;
- customer payment;
- payment confirmation;
- payment status;
- provider references;
- refunds;
- provider failures;
- unknown outcomes;
- idempotent processing.

The initial implementation is for normal one-off package payments.

Recurring billing and subscription/tokenisation SHALL NOT be implemented by this iteration unless an existing GCT business requirement explicitly requires them.

## 3. Source of Provider Truth

The implementation SHALL be based on the official PayFast developer documentation.

Relevant PayFast capabilities include:

- Custom Payment Integration;
- payment signature generation;
- PayFast hosted payment page;
- Instant Transaction Notification (ITN);
- transaction querying;
- API authentication;
- refunds;
- sandbox testing.

The PayFast API uses REST endpoints, JSON responses and standard HTTP status codes. API requests require merchant identification, API version, timestamp and signature, with the merchant passphrase used in signature generation. :contentReference[oaicite:2]{index=2}

## 4. Existing APP-006 Architecture

The existing provider-neutral APP-006 architecture SHALL remain unchanged.

The implementation SHALL use the existing:

- Payment aggregate;
- payment state model;
- payment engine;
- validation pipeline;
- policy pipeline;
- processing pipeline;
- PaymentGateway abstraction;
- provider integration service;
- gateway request/result models;
- provider operation model;
- provider reference model.

Do not create a parallel payment domain.

Do not create a second PaymentGateway abstraction.

Do not bypass the existing payment engine solely for PayFast.

## 5. Provider Boundary

The PayFast adapter SHALL implement the existing supplier-neutral payment provider interface.

Conceptually:

PaymentGateway
        ↓
PayFastGateway
        ↓
PayFastClient / PayFast transport
        ↓
PayFast API

The exact class and file structure SHALL be determined by Copilot based on the existing repository architecture.

The PayFast adapter SHALL be responsible for:

- PayFast request mapping;
- PayFast authentication/signatures;
- PayFast endpoint selection;
- PayFast response mapping;
- PayFast status translation;
- PayFast provider references;
- PayFast-specific errors;
- PayFast ITN processing;
- PayFast refund mapping;
- PayFast configuration.

APP-006 domain/application code SHALL remain PayFast-neutral.

## 6. Payment Flow

The initial one-off payment flow SHALL follow:

Reservation / Package Price

↓

APP-006 Payment Request

↓

PayFast Payment Initiation

↓

Customer redirected to PayFast

↓

Customer completes payment

↓

PayFast ITN

↓

PayFast ITN verification

↓

Canonical Payment Result / Status

↓

APP-006 Payment State

The browser return from PayFast SHALL NOT by itself constitute authoritative payment confirmation.

The PayFast ITN notification SHALL be treated as the authoritative provider notification mechanism for asynchronous payment confirmation.

PayFast's documentation provides ITN fields including:

- m_payment_id;
- pf_payment_id;
- payment_status;
- amount_gross;
- amount_fee;
- amount_net;
- merchant_id;
- signature.

:contentReference[oaicite:3]{index=3}

## 7. Customer Redirect

The integration SHALL support the PayFast hosted payment page for the initial implementation.

The PayFast custom integration uses the PayFast payment endpoint and a signed set of payment parameters.

The live payment endpoint is:

https://www.payfast.co.za/eng/process

The sandbox payment endpoint is:

https://sandbox.payfast.co.za/eng/process

:contentReference[oaicite:4]{index=4}

The implementation SHALL generate the required PayFast payment parameters from the canonical APP-006 payment request.

The application SHALL return or expose the provider payment initiation information required to redirect the customer to PayFast.

The exact HTTP/UI response mechanism SHALL follow the existing GCT Core application architecture.

## 8. Payment Parameters

The PayFast adapter SHALL map canonical APP-006 payment information into the required PayFast custom-payment fields.

At minimum, where applicable, the mapping SHALL support:

- merchant_id;
- merchant_key where required by the chosen integration flow;
- amount;
- item_name;
- item_description;
- m_payment_id;
- name_first;
- name_last;
- email_address;
- return_url;
- cancel_url;
- notify_url;
- signature.

Only fields supported and required by the official PayFast integration SHALL be used.

Do not add arbitrary PayFast fields to the canonical APP-006 model.

## 9. PayFast Signature

PayFast uses an MD5 signature for the custom payment integration.

For the custom payment flow, the signature process is distinct from the PayFast API signature process.

The custom payment signature SHALL:

1. concatenate the non-empty submitted variables in the documented attribute order;
2. URL-encode values according to PayFast requirements;
3. append the merchant passphrase;
4. calculate the MD5 hash;
5. submit the result as the signature.

The custom payment signature SHALL NOT use the API's alphabetical variable ordering.

PayFast explicitly distinguishes these two signature formats. :contentReference[oaicite:5]{index=5}

The signature implementation SHALL therefore be isolated in a PayFast-specific component.

## 10. PayFast API Authentication

Where the PayFast server-to-server API is used, the adapter SHALL implement PayFast API authentication according to the official API contract.

PayFast API requests require:

- merchant-id;
- version;
- timestamp;
- signature.

The API signature is generated by:

1. including the submitted header/body/query variables;
2. adding the merchant passphrase;
3. sorting variables alphabetically;
4. URL-encoding the values;
5. concatenating them with ampersands;
6. calculating the MD5 hash.

This API signature mechanism is distinct from the custom payment signature mechanism. :contentReference[oaicite:6]{index=6}

Do not reuse the custom payment signature implementation for API requests.

## 11. Merchant Credentials

The following values SHALL be configuration/secrets, not source-code constants:

- PayFast merchant ID;
- PayFast merchant key where required;
- PayFast passphrase.

Credentials SHALL NOT be:

- committed to Git;
- stored in canonical domain models;
- stored in specifications;
- logged;
- returned to customers;
- embedded in tests.

The existing GCT Core configuration/secrets mechanism SHALL be reused.

Do not modify `.env` during implementation unless the repository's established configuration process explicitly requires a placeholder/configuration definition.

Actual production credentials SHALL NOT be placed into source control.

## 12. Environment Selection

The adapter SHALL support at least:

- sandbox;
- live.

The environment SHALL determine the appropriate PayFast endpoint configuration.

Sandbox payment processing uses:

https://sandbox.payfast.co.za/eng/process

Live payment processing uses:

https://www.payfast.co.za/eng/process

:contentReference[oaicite:7]{index=7}

The environment SHALL be selected through configuration rather than hard-coded application logic.

## 13. ITN Boundary

The PayFast ITN endpoint SHALL be implemented as a provider-specific infrastructure entry point.

Conceptually:

PayFast

↓

PayFast ITN endpoint

↓

PayFast ITN verification

↓

Canonical Payment Notification

↓

APP-006 payment processing

The ITN endpoint SHALL:

- accept the PayFast notification;
- verify the notification;
- validate merchant identity;
- validate the signature;
- validate the payment reference;
- validate the payment amount against the expected payment;
- translate PayFast payment status;
- pass the canonical result into APP-006.

PayFast documents the ITN payload as containing payment and merchant information including m_payment_id, pf_payment_id, payment_status, amount_gross, amount_fee, amount_net, merchant_id and signature. :contentReference[oaicite:8]{index=8}

## 14. ITN Security

ITN notifications SHALL NOT be trusted solely because they originate from a network request.

The adapter SHALL validate the PayFast notification according to PayFast's documented ITN verification requirements.

At minimum, verification SHALL ensure:

- signature validity;
- merchant identity;
- payment reference;
- expected amount;
- valid PayFast payment state.

The implementation SHALL follow the current official PayFast ITN verification procedure rather than inventing a simplified verification mechanism.

## 15. ITN Idempotency

The same PayFast ITN may be received more than once.

The integration SHALL process duplicate notifications safely.

An already-processed PayFast transaction notification SHALL NOT create a second payment.

The existing APP-006 payment reference/idempotency architecture SHALL be reused.

Do not create a second payment-specific idempotency store unless the existing architecture genuinely requires one.

## 16. Payment References

The integration SHALL preserve both:

- the GCT payment reference;
- the PayFast provider payment reference.

The PayFast `m_payment_id` SHALL represent the GCT-side payment identifier where appropriate.

The PayFast `pf_payment_id` SHALL be preserved as the provider transaction reference.

Provider-specific references SHALL remain inside canonical provider-reference structures rather than becoming PayFast-specific fields in the payment domain.

## 17. Payment Status Mapping

The PayFast payment status SHALL be translated into the existing APP-006 canonical payment state/outcome model.

The adapter SHALL NOT expose PayFast status strings directly to upstream business capabilities.

The implementation SHALL explicitly handle at minimum:

- successful/completed payment;
- failed payment;
- pending/unknown state where applicable;
- duplicate notification;
- invalid notification.

The exact mapping SHALL follow the existing APP-006 payment state model.

Do not create new canonical payment states solely to mirror PayFast values.

## 18. Amount Validation

The PayFast notification amount SHALL be compared against the expected APP-006 payment amount.

The implementation SHALL not automatically accept a successful notification when the amount does not match the expected payment.

The canonical payment amount originates from the GCT pricing/reservation flow.

APP-006 SHALL execute the authoritative payment amount.

PayFast SHALL NOT determine the GCT package price.

## 19. Pricing Boundary

The architecture remains:

APP-005 / APP-004

↓

Authoritative GCT amount due

↓

APP-006 Payment

↓

PayFast

APP-006 SHALL NOT calculate:

- package price;
- accommodation price;
- package markup;
- discounts;
- commission;
- GCT margin;
- tax policy owned elsewhere.

The payment amount SHALL be supplied by the authoritative upstream commercial state.

## 20. Currency

The PayFast integration SHALL operate using the currency supported by the applicable GCT payment flow.

PayFast refund documentation specifies amounts in cents (ZAR), and the initial GCT PayFast integration SHALL therefore treat ZAR as the concrete provider settlement currency unless the existing approved pricing/payment architecture explicitly requires another supported PayFast currency flow. :contentReference[oaicite:9]{index=9}

Do not introduce currency conversion into the PayFast adapter.

If the canonical payment amount is not in the provider-supported currency, the implementation SHALL reject or route the payment according to existing application policy rather than silently converting it.

## 21. Payment Completion

The PayFast ITN result SHALL update the canonical payment lifecycle.

The customer browser return SHALL be treated as a presentation/navigation event.

It SHALL NOT be used as the sole authority for:

- marking a payment successful;
- settling a reservation;
- issuing a paid invoice;
- confirming financial completion.

The authoritative payment status SHALL originate from the verified provider notification and/or provider status query where required.

## 22. Transaction Query

The PayFast API provides a transaction query endpoint:

GET /process/query/:id

It can return information including:

- pf_payment_id;
- m_payment_id;
- status;
- amount;
- cc_status;
- cc_message.

:contentReference[oaicite:10]{index=10}

The PayFast adapter SHALL expose provider transaction querying only through the existing supplier-neutral APP-006 provider abstraction.

Transaction querying SHALL be used where required to resolve provider state or verify an uncertain transaction.

Do not expose PayFast endpoint paths to APP-004, APP-005 or APP-007.

## 23. Unknown Payment Outcomes

A network timeout, ambiguous provider response or missing confirmation SHALL NOT automatically be classified as successful.

The integration SHALL preserve an unknown/pending outcome according to the existing APP-006 lifecycle.

Where appropriate, APP-006 SHALL use the PayFast transaction query operation to determine current provider state.

Do not automatically submit a duplicate payment because the first provider operation returned an uncertain result.

## 24. Refund Architecture

Refunds SHALL remain owned by APP-006.

The PayFast adapter SHALL implement the existing canonical refund provider operation.

The PayFast refund process requires querying refund eligibility/information before creating a refund. PayFast explicitly recommends performing the refund query before submitting a refund. :contentReference[oaicite:11]{index=11}

The logical flow SHALL therefore be:

APP-006 Refund Request

↓

PayFast Refund Query

↓

Eligibility / Available Amount

↓

PayFast Refund Request

↓

Canonical Refund Result

## 25. Refund Query

PayFast provides:

GET /refunds/query/:id

The query identifies information including:

- original amount;
- amount available for refund;
- refund status;
- full refund method;
- partial refund method;
- additional bank-payout requirements where applicable.

:contentReference[oaicite:12]{index=12}

The adapter SHALL translate this information into the existing APP-006 refund model.

PayFast-specific refund method names SHALL not leak into the canonical domain model.

## 26. Refund Creation

PayFast provides:

POST /refunds/:id

The refund request includes:

- amount;
- reason;
- notify_buyer;
- notify_merchant;
- additional bank payout information where required by the PayFast refund method.

:contentReference[oaicite:13]{index=13}

The adapter SHALL construct these fields from the canonical APP-006 refund request.

APP-006 SHALL determine:

- whether a refund should occur;
- the refund amount;
- the refund reason;
- the business context.

The PayFast adapter SHALL determine how that request is represented for PayFast.

## 27. Refund Amounts

PayFast refund amounts are represented in cents (ZAR).

The adapter SHALL perform the required provider representation conversion from the canonical APP-006 amount without introducing floating-point financial calculations.

The conversion SHALL follow the existing GCT Money/pricing precision architecture.

Do not introduce a second Money implementation inside the PayFast adapter.

## 28. Partial Refunds

The PayFast integration SHALL support partial refunds where permitted by the provider.

The adapter SHALL respect PayFast's reported `amount_available_for_refund`.

A refund SHALL NOT exceed the available refundable amount.

The existing APP-006 refund policy remains authoritative.

## 29. Refund Provider References

The PayFast provider transaction/payment reference SHALL be preserved for refunds.

The refund result SHALL retain sufficient provider reference information for:

- status;
- audit;
- reconciliation;
- future refund queries.

Provider references SHALL remain supplier-neutral at the APP-006 boundary.

## 30. Recurring Billing

PayFast supports recurring billing and tokenisation APIs.

These include subscription operations and tokenisation-related functionality. :contentReference[oaicite:14]{index=14}

Recurring billing SHALL NOT be implemented by APP-006.8 unless an approved GCT business requirement explicitly activates it.

Do not add:

- subscription tokens;
- recurring billing schedules;
- recurring payment lifecycle;
- token management

to the canonical GCT payment model as part of this iteration.

## 31. Onsite Payments

PayFast provides an Onsite Payments option that embeds payment functionality into the GCT checkout experience. :contentReference[oaicite:15]{index=15}

The initial APP-006.8 implementation SHALL use the standard PayFast hosted payment flow unless the existing GCT application architecture explicitly requires Onsite Payments.

Do not implement both flows simultaneously.

The provider abstraction SHALL allow future expansion without changing APP-006 domain contracts.

## 32. Payment Security

The integration SHALL ensure:

- merchant secrets remain configuration-only;
- passphrases are never logged;
- payment signatures are never exposed unnecessarily;
- raw card data is not stored by GCT Core;
- PayFast provider references are treated as sensitive integration data;
- ITN verification occurs before payment state mutation.

No raw card number, CVV or equivalent sensitive card credential SHALL be stored in the GCT Core payment domain.

## 33. Logging

Application logs SHALL contain sufficient diagnostic information to trace payment operations without exposing secrets.

Logs MAY include:

- GCT payment reference;
- reservation reference;
- PayFast provider payment reference;
- operation;
- canonical result;
- provider status;
- correlation ID.

Logs SHALL NOT include:

- merchant passphrase;
- API signatures;
- secret credentials;
- raw card information.

## 34. Error Mapping

PayFast API errors use conventional HTTP response codes.

PayFast documents 4xx errors for request/processing problems and 5xx errors for PayFast/application/network failures, including examples such as:

- 400 required variables missing;
- 400 invalid signature;
- 401 merchant not found;
- 401 merchant authorization failed;
- 404 endpoint/service not found;
- 429 signature rate limit reached;
- 500 application error;
- 500 communication failure.

:contentReference[oaicite:16]{index=16}

The adapter SHALL translate provider errors into the existing APP-006 canonical error/result model.

PayFast HTTP codes SHALL NOT become application-level business states.

## 35. Retry Behaviour

The adapter SHALL NOT blindly retry payment creation after an uncertain provider outcome.

For operations where retry is safe, retry behaviour SHALL follow the existing APP-006 execution policy.

Payment creation SHALL be treated as potentially non-idempotent from the provider perspective.

Status querying SHALL be preferred where provider state is uncertain.

Refund operations SHALL respect the existing APP-006 idempotency and provider-reference architecture.

## 36. Provider Configuration

The PayFast provider configuration SHALL support at least:

- environment;
- merchant ID;
- merchant key where required;
- passphrase;
- API version where applicable;
- API base URL;
- payment process URL;
- ITN configuration;
- timeout settings where supported by the existing infrastructure.

Configuration names SHALL follow existing GCT Core configuration conventions.

Do not hard-code environment-specific URLs inside business/application services.

## 37. Sandbox

The PayFast sandbox SHALL be the primary integration test environment.

PayFast describes the sandbox as a production-equivalent testing environment that supports test transactions and ITNs without moving real money. :contentReference[oaicite:17]{index=17}

The integration SHALL support sandbox testing before production activation.

No production merchant credentials SHALL be used during automated tests.

## 38. Automated Tests

The implementation SHALL include focused tests for:

1. PayFast configuration loading.
2. Sandbox/live environment selection.
3. Custom payment request mapping.
4. Custom payment signature generation.
5. API signature generation where API operations are used.
6. Payment amount conversion.
7. Payment reference mapping.
8. Customer/holder field mapping.
9. Return/cancel/notify URL mapping.
10. ITN signature verification.
11. ITN merchant validation.
12. ITN payment-reference validation.
13. ITN amount validation.
14. successful ITN mapping.
15. failed ITN mapping.
16. duplicate ITN handling.
17. unknown payment outcome.
18. provider transaction query.
19. PayFast error mapping.
20. refund eligibility query.
21. full refund mapping.
22. partial refund mapping.
23. refund amount validation.
24. refund error handling.
25. provider-reference preservation.
26. secret values never appearing in logs or domain objects.
27. existing APP-006 payment tests remain green.

## 39. Integration Testing

Integration testing SHALL use PayFast Sandbox when external integration testing is required.

The implementation SHALL verify:

- payment initiation;
- customer redirect;
- successful payment;
- ITN delivery;
- payment status update;
- transaction query;
- refund query;
- refund execution where sandbox supports the required flow.

No live payment SHALL be performed during normal development verification.

## 40. PayFast Documentation Versioning

The implementation SHALL be based on the current official PayFast documentation available at implementation time.

If PayFast changes:

- endpoint paths;
- authentication;
- signature rules;
- ITN behaviour;
- refund requirements;
- status values;

the adapter SHALL absorb those changes without changing canonical APP-006 business contracts unless a genuine business requirement requires it.

## 41. Persistence

This integration SHALL reuse the existing APP-006 persistence architecture.

At minimum, payment persistence must be able to retain:

- GCT payment reference;
- reservation reference;
- amount;
- currency;
- payment status;
- provider;
- provider payment reference;
- provider metadata required for reconciliation;
- payment lifecycle timestamps;
- refund information where applicable.

If the current payment persistence implementation is incomplete, Copilot SHALL identify the specific implementation gap.

Do not create a parallel payment persistence architecture.

Do not modify Prisma/database schema unless an already-approved canonical contract demonstrably requires it.

## 42. APP-004 Integration

APP-004 remains responsible for reservation lifecycle.

APP-006 SHALL receive the reservation and pricing information required to execute payment.

APP-006 SHALL NOT:

- create accommodation bookings;
- calculate package pricing;
- determine accommodation availability;
- alter reservation commercial rules.

Payment status MAY be consumed by APP-004 according to the established reservation lifecycle.

## 43. APP-005 Integration

APP-005 remains responsible for GCT pricing.

APP-006 consumes the authoritative payment amount.

The PayFast adapter SHALL never independently derive:

- accommodation cost;
- package markup;
- package discounts;
- customer pricing.

## 44. APP-007 Integration

APP-007 remains responsible for invoice/financial-obligation concerns.

APP-006 SHALL expose canonical payment status and payment results required by APP-007.

APP-006 SHALL NOT become an invoice or accounting subsystem.

## 45. Provider-Neutrality Requirement

The following SHALL NOT appear outside the PayFast adapter/infrastructure boundary unless already represented through an approved provider-neutral reference:

- PayFast endpoint names;
- PayFast-specific request fields;
- PayFast-specific status strings;
- PayFast API error codes;
- PayFast merchant credentials;
- PayFast signature implementation;
- PayFast ITN payload structures;
- PayFast refund payload structures.

## 46. Implementation Authority

This specification defines:

- provider boundary;
- business ownership;
- canonical integration behaviour;
- PayFast-specific requirements;
- security requirements;
- testing requirements.

Copilot SHALL determine the appropriate implementation structure based on:

- existing GCT Core architecture;
- existing APP-006 implementation;
- existing provider abstractions;
- current official PayFast documentation.

Copilot MAY make normal implementation decisions without further architectural approval.

If Copilot discovers a contradiction between this specification and an existing approved canonical contract, implementation SHALL pause and report the conflict.

## 47. Required Implementation Work

Copilot SHALL:

1. Inspect the existing APP-006 payment implementation.
2. Inspect the existing PaymentGateway abstraction.
3. Inspect the existing provider integration service.
4. Inspect existing configuration infrastructure.
5. Implement the PayFast provider adapter.
6. Implement PayFast custom payment request mapping.
7. Implement custom payment signature generation.
8. Implement PayFast ITN handling and verification.
9. Implement provider transaction reference mapping.
10. Implement PayFast transaction querying where required.
11. Implement canonical payment status mapping.
12. Implement PayFast refund query.
13. Implement PayFast refund execution.
14. Implement PayFast refund result mapping.
15. Implement sandbox/live configuration.
16. Preserve provider neutrality.
17. Preserve existing APP-006 domain contracts.
18. Add focused provider tests.
19. Add integration tests where appropriate.
20. Run the complete repository verification suite.

Copilot SHALL not implement recurring billing or Onsite Payments unless explicitly instructed later.

## 48. No Credential Changes During Implementation

Copilot SHALL NOT request, expose or commit actual production PayFast credentials.

The user SHALL configure actual merchant credentials through the established secure configuration mechanism when the integration is ready for sandbox/live testing.

## 49. Verification

After implementation Copilot SHALL run:

- focused APP-006 PayFast tests;
- relevant APP-004 tests;
- relevant APP-005 tests;
- relevant APP-007 tests;
- full Jest regression;
- npm run build;
- npx prisma validate;
- npm run lint.

Where sandbox integration tests are executed, they SHALL be clearly identified separately from local automated tests.

No live PayFast transactions SHALL be performed unless explicitly authorised by the user for controlled verification.

No Hotelbeds calls SHALL be made as part of this capability.

## 50. Lint Warning Policy

The current repository warning baseline is 167 warnings.

APP-006.8 SHALL target:

- zero lint errors;
- existing warnings may remain.

Copilot SHALL report:

- previous warning baseline;
- new warning count;
- warnings introduced by APP-006.8.

Unrelated warning cleanup SHALL remain outside this iteration.

## 51. Acceptance Criteria

### AC-01 — Provider Boundary

PayFast implements the existing APP-006 provider abstraction.

### AC-02 — Provider Isolation

PayFast-specific logic remains inside the provider adapter/infrastructure boundary.

### AC-03 — Payment Initiation

A canonical APP-006 payment request can be translated into a PayFast hosted-payment request.

### AC-04 — Signature

The PayFast custom-payment signature is generated according to the official PayFast custom-integration algorithm.

### AC-05 — API Authentication

Where PayFast API operations are used, API authentication/signature generation follows the official API algorithm.

### AC-06 — ITN

PayFast ITN notifications are verified before changing payment state.

### AC-07 — Browser Return

Browser return/cancel events are not treated as authoritative payment confirmation.

### AC-08 — Payment Status

PayFast payment status is translated into the existing APP-006 payment state model.

### AC-09 — Amount Integrity

Provider notification amounts are validated against the expected payment amount.

### AC-10 — Provider References

GCT and PayFast payment references remain associated.

### AC-11 — Idempotency

Duplicate provider notifications do not create duplicate payments.

### AC-12 — Unknown Outcomes

Unknown provider outcomes do not become successful payments automatically.

### AC-13 — Transaction Query

The provider adapter can query PayFast transaction state where required.

### AC-14 — Refund Eligibility

Refund operations query PayFast refund eligibility before creating a refund.

### AC-15 — Full Refund

Supported full refunds map correctly into the canonical APP-006 refund model.

### AC-16 — Partial Refund

Supported partial refunds map correctly into the canonical APP-006 refund model.

### AC-17 — Refund Safety

Refunds cannot exceed the provider-reported refundable amount.

### AC-18 — Security

Credentials, passphrases, signatures and sensitive payment information are not exposed or persisted incorrectly.

### AC-19 — Sandbox

Sandbox configuration can be used without changing application/domain contracts.

### AC-20 — Live Configuration

Live endpoint configuration can be activated through configuration without changing application code.

### AC-21 — Existing Architecture

Existing APP-006 domain and provider abstractions remain intact.

### AC-22 — Existing Capability Stability

APP-004, APP-005 and APP-007 integrations remain compatible.

### AC-23 — Regression

Full repository regression passes.

### AC-24 — Build

Production build passes.

### AC-25 — Prisma

Prisma validation passes.

### AC-26 — Lint

Lint completes with zero errors.

## 52. Definition of Done

APP-006.8 is complete when:

- PayFast implements the existing PaymentGateway boundary;
- hosted payment initiation works in sandbox;
- PayFast custom-payment signatures are correct;
- ITN notifications are securely verified;
- payment statuses are mapped canonically;
- provider references are preserved;
- unknown outcomes remain safe;
- transaction querying is available where required;
- refund eligibility is queried before refunds;
- full and partial refunds are mapped where supported;
- PayFast credentials are configuration-only;
- no raw card data is stored;
- provider-specific logic remains isolated;
- focused tests pass;
- full regression passes;
- build passes;
- Prisma validation passes;
- lint has zero errors.

## 53. Copilot Implementation Report

After implementation Copilot SHALL report:

- implementation status;
- files changed;
- PayFast adapter architecture;
- payment initiation flow;
- ITN flow;
- transaction-query flow;
- refund flow;
- configuration changes;
- focused test results;
- sandbox integration results if performed;
- full regression result;
- build result;
- Prisma validation result;
- lint errors;
- lint warnings compared with the 167-warning baseline;
- database changes;
- Prisma changes;
- live PayFast calls;
- sandbox PayFast calls;
- remaining limitations;
- any specification or architectural conflict discovered.

Copilot SHALL NOT create a commit.

The user performs the commit only after acceptance.

## 54. Explicitly Out of Scope

This specification does NOT implement:

- recurring billing;
- subscriptions;
- tokenisation;
- PayFast Onsite Payments;
- accounting;
- revenue recognition;
- invoice generation;
- payment reconciliation beyond the provider state required by APP-006;
- card storage;
- new payment database architecture;
- changes to APP-005 pricing rules;
- changes to APP-004 reservation ownership;
- changes to APP-007 invoice ownership;
- Hotelbeds functionality;
- broad lint remediation.

## 55. Final Architectural Constraint

The implementation SHALL preserve:

APP-004 Reservation
        ↓
APP-005 Pricing
        ↓
APP-006 Payment
        ↓
PaymentGateway
        ↓
PayFast Adapter
        ↓
PayFast

PayFast is an implementation detail of APP-006.

The GCT Core business domain SHALL remain unaware of PayFast-specific implementation details.

The PayFast adapter SHALL absorb provider-specific authentication, signatures, endpoints, payloads, statuses, errors, ITN structures and refund mechanics.

No provider-specific behaviour SHALL be allowed to leak upward into reservation, pricing, invoicing or other business capabilities.