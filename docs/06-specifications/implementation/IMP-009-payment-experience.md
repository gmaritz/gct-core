# GCT CORE — IMP-009 PAYMENT EXPERIENCE

## 1. DOCUMENT CONTROL

| Property | Value |
|---|---|
| Specification | IMP-009 |
| Title | Payment Experience |
| Capability | Frontend & UI |
| Version | 1.0 |
| Predecessors | IMP-003.1–IMP-008 |
| Next Capability | IMP-010 |
| Governing Process | `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md` |

Follow `GOV-DEV-001-DEVELOPMENT-PROCESS.md`.

Workflow:

**Specification → Copilot Implementation → Tests/Regression → Copilot Report → Architect Acceptance → User Commit**

Copilot must not commit.

---

# 2. PURPOSE

Implement the MVP payment stage:

**Reservation Review → Payment → Payment Provider → Payment Result**

IMP-009 shall allow the customer to initiate payment for the reviewed reservation and provide controlled payment-state feedback.

The authoritative payment outcome must come from the existing application/payment architecture.

IMP-009 does not implement booking confirmation.

---

# 3. MVP BOUNDARY

Use the existing deterministic payment architecture and PayFast integration.

Do not introduce:

- AI;
- a new payment engine;
- direct payment-provider logic in frontend code;
- raw card-data handling;
- booking confirmation;
- supplier booking;
- unrelated payment providers;
- new payment persistence architecture.

AI remains deferred until after MVP.

---

# 4. EXISTING PAYMENT ARCHITECTURE

Before implementation inspect and reuse the existing:

- `Payment` model/domain;
- `PaymentTransaction` where applicable;
- payment status/lifecycle;
- `PaymentGateway` abstraction;
- payment application service(s);
- PayFast integration/adapter;
- Reservation → Payment relationship;
- existing payment notification/ITN handling;
- existing payment return/status handling.

PayFast-specific implementation must remain behind the established payment boundary.

Do not create a parallel PayFast integration.

---

# 5. PAYMENT FLOW

The intended flow is:

**Reservation Review**

→ customer chooses to pay

→ application creates/initiates payment

→ PayFast payment request

→ customer completes/interacts with PayFast

→ PayFast notification/ITN

→ application updates authoritative payment state

→ frontend displays current payment state

→ IMP-010 Booking Confirmation

The browser return from PayFast is **not authoritative proof of payment success**.

---

# 6. RESERVATION ASSOCIATION

Payment must be associated with the applicable canonical Reservation through the existing application contract.

Do not associate payment solely through:

- browser state;
- journey ID;
- customer email;
- PayFast return parameters.

Use the existing Reservation/Payment relationship.

Do not create a duplicate Reservation or payment ownership model.

---

# 7. PAYMENT INITIATION

Create or extend an application-level payment initiation contract only where required.

Conceptually:

`initiatePayment(reservationId)`

The exact name and location must follow existing repository conventions.

The application layer shall:

1. validate the Reservation;
2. validate its payable state;
3. obtain the authoritative payable amount;
4. establish the payment transaction;
5. invoke the existing payment gateway abstraction;
6. return provider-neutral payment initiation information.

The controller must not perform these operations itself.

---

# 8. AMOUNT AUTHORITY

The payment amount must come from the authoritative Reservation/quote/payment application state.

The frontend must never submit an amount and have it treated as authoritative.

Do not calculate:

- total;
- currency;
- outstanding balance;
- payment amount

in the browser or EJS.

Do not allow the customer to modify the payment amount.

---

# 9. CURRENCY

Use the authoritative payment amount and currency supplied by the application/payment boundary.

Do not:

- hard-code currency;
- perform frontend currency conversion;
- derive currency from location.

---

# 10. PAYMENT PROVIDER BOUNDARY

Frontend code must not:

- call PayFast APIs directly;
- construct PayFast signatures;
- contain PayFast credentials;
- calculate PayFast hashes/signatures;
- process provider notifications.

All provider-specific behaviour remains behind the existing payment gateway/application boundary.

---

# 11. PAYMENT PAGE

Provide a customer-facing payment page or transition screen showing:

- reservation/journey summary;
- amount payable;
- currency;
- payment status;
- clear action to proceed to the payment provider.

Do not collect card details inside GCT Core unless an existing approved payment architecture explicitly requires it.

The preferred MVP flow is provider-hosted payment.

---

# 12. PAYMENT INITIATION UX

The primary action should clearly communicate that the customer is leaving GCT Core for payment.

Examples:

**Proceed to Secure Payment**

or an equivalent existing UI convention.

Do not label the initiation action:

- Booking Confirmed;
- Payment Complete;
- Reservation Confirmed.

Those states belong to later processing.

---

# 13. PAYMENT STATUS

Use the existing canonical payment lifecycle/status model.

The implementation must not invent a competing payment status enum.

At minimum, correctly represent the states required for:

- payment created;
- payment initiation/requested;
- payment pending;
- payment authorised/captured where supported;
- payment failed;
- payment cancelled;
- payment completed.

Map these to customer-facing states without exposing unnecessary internal provider terminology.

---

# 14. PAYMENT RETURN

Implement the existing PayFast/browser return boundary if required by the current architecture.

A browser return may indicate that the customer has:

- returned from PayFast;
- cancelled;
- abandoned;
- encountered an error;
- completed an apparent payment.

It must **not independently establish successful payment**.

The frontend should retrieve the current authoritative application payment state.

---

# 15. ITN / PROVIDER NOTIFICATION

Use the existing PayFast ITN/provider-notification implementation.

IMP-009 may wire the frontend to the resulting canonical payment state where necessary.

Do not duplicate ITN processing in the frontend.

The provider notification/application state is authoritative over browser return parameters.

---

# 16. PAYMENT RESULT STATES

Provide controlled customer-facing states for at least:

### Pending

Payment has been initiated but authoritative completion has not yet been established.

### Successful

The application reports the canonical payment state as successfully completed/accepted.

### Failed

The application reports payment failure.

### Cancelled

The customer/provider reports cancellation and the canonical application state supports that outcome.

### Unknown / Recheck

Payment status cannot yet be established.

Do not display payment success merely because PayFast redirected the browser back.

---

# 17. PAYMENT FAILURE / RECOVERY

For failed or cancelled payment:

- clearly explain that payment was not completed;
- preserve the Reservation context;
- provide an appropriate retry/recovery action;
- do not create duplicate payment transactions unnecessarily.

Retry behaviour must follow the existing payment application contract.

Do not implement ad-hoc transaction creation in the frontend.

---

# 18. DUPLICATE PAYMENT PROTECTION

The implementation must respect existing payment transaction/idempotency rules.

Do not create a new payment transaction simply because the customer refreshes the page.

Do not initiate another payment while an existing valid payment transaction is still pending unless the application/payment contract explicitly permits it.

---

# 19. PAYMENT VIEW MODEL

Create or extend a dedicated Payment View Model/provider.

The View Model should contain only customer-safe data, including:

- reservation/journey summary;
- amount;
- currency;
- payment status;
- customer-facing status message;
- provider redirect/continuation information where appropriate;
- retry/recovery state.

Do not expose:

- payment credentials;
- gateway secrets;
- raw provider payloads;
- internal exceptions;
- database entities.

---

# 20. ROUTING

Use the existing `/ui` namespace.

Preferred route:

`/ui/journeys/:journeyId/payment`

Use existing equivalent conventions if already present.

The implementation may require additional provider-return/status routes according to the existing payment architecture.

Follow established route naming rather than creating duplicate payment endpoints.

---

# 21. CONTROLLER

The controller shall:

1. resolve the applicable Reservation/payment context;
2. obtain authoritative payment state;
3. invoke the application payment service when initiation is requested;
4. map the result to the Payment View Model;
5. render payment/pending/failure/success states.

The controller must not:

- calculate payment amounts;
- call PayFast directly;
- process ITN payloads;
- determine payment success from browser parameters;
- create database payment records directly.

---

# 22. SECURITY

Treat all browser/provider-return parameters as untrusted.

Never trust client-submitted:

- amount;
- currency;
- Reservation ID;
- payment status;
- transaction status;
- success/failure indication.

Use the existing application payment validation.

Do not log sensitive payment information.

Do not expose payment credentials or secrets to browser code.

---

# 23. PAYMENT DATA

Do not collect or store raw card details in GCT Core.

Use the established PayFast/provider-hosted payment mechanism where available.

Only collect payment information directly if an already-approved payment architecture explicitly requires it.

---

# 24. RESERVATION BOUNDARY

IMP-009 operates against the canonical Reservation/payment context established by IMP-008 and the existing application architecture.

Do not:

- create supplier bookings;
- mark the Reservation as fulfilled merely because payment was initiated;
- create Booking records outside the existing architecture;
- trigger confirmation before authoritative payment success.

Successful payment is an input to the subsequent **IMP-010 Booking Confirmation** capability.

---

# 25. PERSISTENCE

Do not introduce a new payment persistence model.

Reuse the existing Payment/PaymentTransaction architecture.

If the existing payment application service already persists payment state, use it.

If a dependency gap exists, report it rather than creating a frontend-specific persistence solution.

---

# 26. RESPONSIVE / ACCESSIBLE UI

The payment experience must work on:

- mobile;
- tablet;
- desktop.

Use existing GCT Core design tokens/components.

Ensure:

- clear payment amount;
- clear currency;
- semantic status messages;
- keyboard-accessible actions;
- visible focus states;
- accessible failure/pending messaging.

---

# 27. TESTING

Create focused tests covering:

## Application

- valid payment initiation;
- Reservation validation;
- authoritative amount;
- authoritative currency;
- payment gateway invocation;
- payment initiation failure;
- existing transaction/pending state;
- retry/idempotency behaviour;
- provider-independent result mapping.

## Payment Provider Boundary

- gateway abstraction is used;
- PayFast implementation remains behind the boundary;
- no frontend/provider credential leakage.

## View Model / Provider

- amount;
- currency;
- payment status;
- pending state;
- success state;
- failure state;
- cancellation state;
- retry state;
- infrastructure isolation.

## HTTP / Controller

- payment page renders;
- valid initiation;
- invalid Reservation;
- initiation failure;
- pending state;
- provider return;
- provider return does not falsely establish success;
- authoritative status is displayed;
- recovery/retry works where supported.

## Regression

Verify IMP-003.1 through IMP-008 remain intact.

---

# 28. LINT BASELINE

Current frontend baseline:

**0 errors / 10 confirmed pre-existing warnings**

IMP-009 must introduce:

**0 new warnings**

Do not weaken lint rules or suppress warnings.

---

# 29. ACCEPTANCE CRITERIA

- [ ] Customer can reach Payment from the Reservation Review stage.
- [ ] Payment is associated with the correct canonical Reservation.
- [ ] Payment amount is authoritative.
- [ ] Payment currency is authoritative.
- [ ] Frontend cannot modify the payable amount.
- [ ] Existing payment application architecture is reused.
- [ ] Existing PayFast integration boundary is reused.
- [ ] No direct PayFast API calls exist in frontend code.
- [ ] No PayFast credentials/secrets reach the frontend.
- [ ] Payment initiation is performed through the application boundary.
- [ ] Duplicate payment initiation is controlled by existing transaction/idempotency rules.
- [ ] Provider-hosted payment is used where supported by the existing architecture.
- [ ] Browser return is not treated as authoritative payment success.
- [ ] Canonical application/payment state determines payment outcome.
- [ ] Pending payment is clearly represented.
- [ ] Failed payment is clearly represented.
- [ ] Cancelled payment is clearly represented.
- [ ] Successful payment is shown only when supported by authoritative state.
- [ ] Payment recovery/retry follows existing application rules.
- [ ] No supplier booking is created.
- [ ] No booking confirmation is implemented.
- [ ] No new payment persistence architecture is introduced.
- [ ] Responsive/accessibility requirements are satisfied.
- [ ] Existing IMP-003.1 through IMP-008 behaviour remains intact.
- [ ] Focused tests pass.
- [ ] Full regression passes.
- [ ] Type-check passes.
- [ ] Prisma validation passes.
- [ ] Build passes.
- [ ] Lint has 0 errors and no new warnings.
- [ ] No AI functionality is introduced.

---

# 30. EXPLICIT NON-SCOPE

Copilot must not introduce:

- AI;
- AI payment decisions;
- a new payment engine;
- direct PayFast frontend integration;
- payment credentials in frontend code;
- raw card-data storage;
- supplier booking;
- booking confirmation;
- voucher generation;
- invoice generation;
- customer account functionality;
- new payment persistence architecture;
- unrelated refactoring;
- lint-rule weakening;
- warning suppression;
- modifications to `GOV-DEV-001`;
- modifications to historical IMP specifications;
- Git commit.

Any requirement outside this scope must be reported as a deviation.

---

# 31. IMPLEMENTATION GUIDANCE

Before modifying code, inspect:

- committed IMP-003.1 through IMP-008;
- Payment domain/model;
- PaymentTransaction model where applicable;
- payment status/lifecycle;
- `PaymentGateway`;
- existing PayFast adapter/service;
- payment application services;
- Reservation → Payment relationship;
- ITN/provider-notification handling;
- existing payment return/status handling;
- frontend route/controller/View Model conventions.

Reuse existing approved contracts.

If the existing payment architecture does not support a required frontend transition, identify the precise application-layer gap rather than creating a parallel payment architecture.

---

# 32. VERIFICATION

From the repository root run:

`npm run type-check`

`npm test -- --runInBand`

`npx prisma validate`

`npm run lint`

`npm run build`

Also run the focused IMP-009 test suite explicitly.

The implementation report must provide exact commands and results.

The lint report must explicitly state:

- initial warning count;
- final warning count;
- warnings introduced by IMP-009;
- remaining pre-existing warnings.

---

# 33. IMPLEMENTATION REPORT

After implementation provide:

### Files Created
Complete list.

### Files Modified
Complete list.

### Application Changes
Payment initiation, validation, gateway interaction and state handling.

### Frontend Changes
Routes, controller, View Model/provider, EJS and styling.

### Payment Boundary
Explain how PayFast remains behind the approved application/gateway boundary.

### Tests
Focused tests and regression results.

### Verification
Exact commands and results.

### Lint Baseline
Initial warnings, final warnings, new warnings and remaining pre-existing warnings.

### Deviations
`No deviations.` if none.

### Outstanding Issues
`No outstanding issues.` if none.

### Commit
`No commit created.`

---

# 34. COMPLETION BOUNDARY

IMP-009 establishes:

**Reservation Review**

→ **Payment Initiation**

→ **Payment Provider**

→ **Authoritative Payment State**

→ **IMP-010 Booking Confirmation**

IMP-009 does not confirm fulfilment or create supplier bookings.

The implementation remains deterministic and MVP-focused.

**AI remains explicitly deferred until MVP completion.**