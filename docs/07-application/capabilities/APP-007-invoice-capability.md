# APP-007 – Invoice Capability

## Document Information

| Item | Value |
|---|---|
| Capability | APP-007 Invoice |
| Status | Approved |
| Version | 1.1 |
| Owner | Application Architecture |
| Depends On | APP-004 Reservation, APP-005 Pricing |
| Integrates With | APP-006 Payments, External Accounting |
| Conforms To | APP-000, APP-001A–E |

---

# 1. Purpose

The Invoice Capability manages the commercial financial obligation created after a client accepts a quotation and the associated reservation is confirmed.

The capability provides the canonical application representation of:

- financial obligations
- invoice lifecycle
- amounts due
- deposits
- outstanding balances
- payment allocations
- due dates
- cancellation charges
- refundable amounts
- financial adjustments
- external financial references

APP-007 does not require GCT Core to be the accounting system.

For the initial implementation, accounting and invoice execution may remain external to GCT Core, including the existing QuickBooks workflow.

---

# 2. Business Context

Go Cape Tours sells primarily private, customised touring experiences.

The commercial lifecycle therefore supports two principal booking modes:

```text
SELF-SERVICE

Client
  ↓
Journey Configuration
  ↓
Quotation
  ↓
Client Acceptance
  ↓
Reservation
  ↓
Financial Processing
```

and:

```text
ASSISTED

Client Enquiry
  ↓
Consultation
  ↓
Journey Customisation
  ↓
Quotation
  ↓
Quote Revision
  ↓
Client Acceptance
  ↓
Reservation
  ↓
Financial Processing
```

Both modes must ultimately use the same canonical Reservation, Pricing, Invoice, and Payment models.

The platform must not create separate booking systems for self-service and assisted bookings.

---

# 3. Commercial Lifecycle

The canonical Go Cape Tours lifecycle is:

```text
ENQUIRY
   ↓
JOURNEY DESIGN
   ↓
QUOTATION
   ↓
QUOTE REVISION
   ↓
QUOTE ACCEPTED
   ↓
RESERVATION CONFIRMED
   ↓
FINANCIAL OBLIGATION
   ↓
DEPOSIT / PAYMENT REQUEST
   ↓
PAYMENT
   ↓
BALANCE OUTSTANDING
   ↓
BALANCE PAYMENT
   ↓
TRAVEL
```

Not every booking will follow every stage inside GCT Core.

The platform must support partial lifecycle completion.

---

# 4. Lifecycle Completion Modes

The platform supports two financial execution modes.

## 4.1 Platform-Managed Financial Flow

Where online financial processing is available:

```text
Reservation
   ↓
Invoice / Financial Obligation
   ↓
Payment Request
   ↓
Online Payment
   ↓
Payment Confirmation
```

---

## 4.2 Assisted / External Financial Flow

Where financial processing remains manual:

```text
Reservation
   ↓
Financial Obligation
   ↓
External Invoice / QuickBooks
   ↓
Manual Payment
   ↓
Payment Recorded in GCT Core
```

The booking lifecycle does not fail merely because accounting or payment execution occurs outside GCT Core.

---

# 5. Financial System Boundary

For the initial platform implementation:

```text
GCT Core
   │
   ├── Quotation
   ├── Reservation
   ├── Financial Obligation
   └── Payment Status
          │
          ▼
   External Financial Process
          │
          ├── QuickBooks
          └── Manual Payment Gateway
```

QuickBooks remains the current accounting system.

GCT Core does not attempt to replace QuickBooks during the initial implementation.

---

# 6. Future Accounting Integration

The architecture shall preserve a future integration boundary:

```text
GCT Core
    │
    ▼
Accounting Integration
    │
    ▼
QuickBooks
```

The integration may eventually support:

- invoice creation
- invoice synchronization
- customer synchronization
- payment synchronization
- refund synchronization
- accounting references

The absence of this integration must not prevent the application lifecycle from functioning.

---

# 7. Financial Obligation

APP-007 represents what the client is financially obligated to pay.

This is distinct from:

### Pricing

> What should the journey cost?

### Reservation

> What did the client confirm?

### Invoice

> What financial obligation was created?

### Payment

> What money was actually received?

### Refund

> What money was returned?

---

# 8. Invoice vs Accounting Invoice

APP-007 may represent the canonical application financial obligation without necessarily being the authoritative accounting document.

This distinction allows the current workflow to remain:

```text
GCT Core
   ↓
Commercial Obligation
   ↓
QuickBooks
   ↓
Official Accounting Invoice
```

while allowing a future workflow:

```text
GCT Core
   ↓
Invoice Capability
   ↓
Accounting Integration
   ↓
QuickBooks
```

and eventually:

```text
GCT Core
   ↓
Native Accounting
```

---

# 9. Quote Revision

Customisation is a first-class Go Cape Tours business process.

A quotation may undergo multiple revisions before acceptance.

Example:

```text
Quote V1
   ↓
Client requests additional night
   ↓
Quote V2
   ↓
Client changes accommodation
   ↓
Quote V3
   ↓
Client accepts
```

Only the accepted quotation becomes the commercial basis for the Reservation.

Earlier quotation versions remain historical records.

---

# 10. Quote Acceptance

Quote acceptance represents a commercial decision by the client.

It does not necessarily mean payment has occurred.

The sequence is:

```text
QUOTATION
   ↓
CLIENT ACCEPTANCE
   ↓
RESERVATION CONFIRMED
   ↓
FINANCIAL OBLIGATION
   ↓
PAYMENT
```

Therefore:

```text
Quote Accepted ≠ Paid
```

---

# 11. Booking Channel

Reservations shall identify their originating booking channel.

Initial supported values:

```text
SELF_SERVICE
ASSISTED
```

Future values may include:

```text
AGENT
PARTNER
```

The booking channel affects workflow and presentation, but does not create a separate reservation model.

---

# 12. Assisted Booking

The platform must support GCT staff creating and managing bookings on behalf of clients.

Assisted booking may include:

- creating an enquiry
- entering traveller information
- configuring journeys
- adding accommodation
- adding experiences
- recording special requests
- adjusting itinerary components
- creating quotations
- revising quotations
- sending quotations
- recording client acceptance
- confirming reservations
- recording external financial activity

The staff workflow uses the same application capabilities as self-service booking.

---

# 13. Customisation

Private touring frequently requires bespoke arrangements.

The platform must therefore support:

- custom journey components
- client-requested changes
- manual adjustments
- special requirements
- non-standard combinations
- quotation revisions
- staff-managed configuration

Customisation must not require bypassing the canonical Pricing or Reservation models.

---

# 14. Deposit Model

The capability supports deposit-based payment schedules.

Example:

```text
Invoice / Obligation Total     R50,000
Deposit Required               R15,000
Balance Due                    R35,000
```

The deposit may be defined as:

- fixed amount
- percentage of total

The actual payment remains owned by APP-006.

---

# 15. Multiple Payments

A financial obligation may have multiple payments.

Example:

```text
Total                         R50,000

Deposit                       R15,000
Second Payment                R20,000
Final Payment                 R15,000

Total Paid                    R50,000
Balance                       R0
```

APP-007 maintains the financial relationship.

APP-006 owns the actual payment transactions.

---

# 16. Manual Payments

GCT Core must support recording payments processed outside the platform.

Example:

```text
Payment
    amount: R15,000
    method: EFT
    executionMode: MANUAL
    status: CONFIRMED
    externalReference: QB-12345
```

Possible manual payment methods include:

- EFT
- bank transfer
- manual card payment
- other externally processed methods

The platform records the payment outcome without executing the transaction.

---

# 17. Online Payments

Where online payment is available:

```text
Invoice
   ↓
Payment Request
   ↓
APP-006 Payments
   ↓
Payment Gateway
   ↓
Payment Result
```

The Invoice capability remains independent of the gateway.

---

# 18. Balance Calculation

The canonical financial relationship is:

```text
Balance Due =
Financial Obligation
- Payments Allocated
+ Adjustments
- Refunds
```

The implementation must prevent an unintended negative balance.

A credit or refundable state must be represented explicitly.

---

# 19. Cancellation

Cancellation is a business event that may create financial consequences.

The lifecycle is:

```text
Cancellation Requested
        ↓
Cancellation Policy Evaluated
        ↓
Cancellation Charge Determined
        ↓
Financial Obligation Adjusted
        ↓
Refundable Amount Determined
        ↓
Refund Requested
        ↓
Refund Processed
```

---

# 20. Cancellation Policy Snapshot

The cancellation conditions applicable to the booking must be preserved.

The financial outcome must not depend on a supplier or policy changing its terms after the booking was confirmed.

The applied cancellation information should preserve:

- policy reference
- policy version where available
- effective period
- cancellation date
- cancellation charge
- refundable amount

---

# 21. Partial Refunds

Partial refunds are explicitly supported.

Example:

```text
Amount Paid             R50,000
Cancellation Charge     R15,000
Refundable Amount       R35,000
```

APP-007 determines:

```text
Amount Retained         R15,000
Refundable Amount       R35,000
```

APP-006 executes and records the actual refund.

---

# 22. Refund Responsibility

APP-007 determines the financial consequence.

APP-006 executes the money movement.

Therefore:

```text
APP-007
Cancellation Financial Outcome
        │
        ▼
Refund Amount
        │
        ▼
APP-006
Payment Refund
```

---

# 23. Invoice Lifecycle

The application financial lifecycle supports:

```text
DRAFT
  ↓
ISSUED
  ↓
PARTIALLY_PAID
  ↓
PAID
```

Additional states:

```text
OVERDUE
CANCELLED
VOID
```

The exact transition rules will be defined by the Invoice Policy Framework.

---

# 24. Partial Lifecycle Completion

A booking may stop at different points depending on how the client is handled.

For example:

### Fully online

```text
Quotation
→ Acceptance
→ Reservation
→ Invoice
→ Payment
→ Confirmation
```

### Assisted / external financial processing

```text
Quotation
→ Acceptance
→ Reservation
→ External Invoice
→ Manual Payment
→ Payment Recorded
```

### Quote only

```text
Quotation
→ Client Review
→ No Acceptance
```

The platform must support these legitimate lifecycle states.

---

# 25. Capability Architecture

```text
APP-005 Pricing
       │
       ▼
   Quotation
       │
       ▼
APP-004 Reservation
       │
       ▼
APP-007 Invoice
       │
       ├───────────────┐
       │               │
       ▼               ▼
APP-006 Payments    External Accounting
       │               │
       ▼               ▼
Online / Manual     QuickBooks
Payment
```

---

# 26. Dependencies

APP-007 consumes:

- accepted quotation
- pricing snapshot
- reservation reference
- reservation snapshot
- traveller/customer information
- applicable cancellation conditions

APP-007 provides:

- financial obligation
- invoice reference
- amount due
- deposit requirement
- amount paid
- balance due
- cancellation charge
- refundable amount
- financial status

---

# 27. Architectural Principles

APP-007 shall:

- remain provider independent
- remain accounting-system independent
- use immutable snapshots
- support self-service and assisted workflows
- support manual and online financial execution
- preserve historical quotation versions
- preserve cancellation policy snapshots
- separate obligation from payment execution
- use established application patterns
- avoid duplicating APP-006 payment responsibilities

---

# 28. Implementation Structure

The capability is expected to follow:

```text
APP-007.1 Invoice Aggregate

APP-007.2 Invoice Model Library

APP-007.3 Invoice Validation Pipeline

APP-007.4 Invoice Policy Framework

APP-007.5 Invoice Engine

APP-007.6 Invoice Presentation Pipeline

APP-007.7 Invoice Integration
```

The implementation sequence may be adjusted if the detailed domain model demonstrates that a smaller implementation is sufficient.

---

# 29. Frontend Requirements

The client-facing experience must eventually support:

- quotation review
- quotation acceptance
- reservation confirmation
- invoice/financial obligation presentation
- deposit amount
- amount paid
- balance due
- payment status
- payment action where online payment is available

The staff-facing experience must support:

- enquiry creation
- journey customisation
- quote revision
- client acceptance
- reservation management
- financial status
- manual payment recording
- external accounting references
- cancellation handling
- refund status

Both experiences consume application View Models.

Neither directly manipulates domain aggregates.

---

# 30. Future Accounting Capability

A future accounting capability may eventually provide:

- accounts receivable
- accounting ledger
- invoice generation
- credit notes
- tax reporting
- payment reconciliation
- supplier accounting
- financial reporting
- QuickBooks integration
- replacement of QuickBooks

These are deliberately outside the scope of APP-007 V1.

---

# 31. Capability Completion Criteria

APP-007 V1 is complete when GCT Core can:

1. Create a financial obligation from an accepted quotation.
2. Preserve the accepted pricing snapshot.
3. Support deposit requirements.
4. Support multiple payments.
5. Record external/manual payments.
6. Integrate with APP-006 for online payments.
7. Calculate outstanding balances.
8. Preserve cancellation policy snapshots.
9. Determine cancellation charges.
10. Determine refundable amounts.
11. Support partial refunds through APP-006.
12. Present the financial lifecycle.
13. Support both self-service and assisted booking workflows.
14. Operate without requiring a QuickBooks integration.

---

# 32. Capability Status

**APP-007 – Invoice Capability**

Status:

**Approved for Implementation**

Version:

**1.1**

The capability now explicitly supports the actual Go Cape Tours commercial model, including bespoke assisted bookings, quotation revisions, deposits, staged payments, external accounting, manual payments, cancellation charges, and partial refunds.

---

# 33. Architectural Outcome

APP-007 establishes the financial-obligation layer between Reservation, Pricing, and Payments without prematurely turning GCT Core into an accounting system.

The resulting commercial model is:

```text
PRICING
"What should it cost?"

        ↓

QUOTATION
"What are we proposing?"

        ↓

CLIENT ACCEPTANCE
"What did the client agree to?"

        ↓

RESERVATION
"What did the client confirm?"

        ↓

FINANCIAL OBLIGATION
"What does the client owe?"

        ↓

PAYMENT
"What did the client actually pay?"

        ↓

REFUND
"What must be returned?"
```

This architecture supports both:

```text
SELF-SERVICE
```

and:

```text
ASSISTED / HIGH-TOUCH
```

booking workflows while preserving a single canonical commercial lifecycle.

QuickBooks remains the current external accounting system, while the architecture preserves a clean path toward future accounting integration or a native accounting capability.