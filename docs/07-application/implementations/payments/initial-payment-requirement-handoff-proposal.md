# Signature Cape Winelands Initial Payment Requirement Handoff

## Document control

| Field | Value |
| --- | --- |
| Identifier | Pending governance assignment |
| Version | 0.1.0 |
| Status | Draft — Proposed controlled specification amendments |
| Date | 2026-11-18 |
| Scope | Initial payment requirement handoff for the Signature Cape Winelands multi-day package |
| Authority | Proposal only; not an approved specification or implementation authorization |
| Decision source | AR-003.4 B01–B04 |

This proposal does not amend an approved specification in place. It defines a bounded application contract for review by the responsible owners. The B01–B04 business decisions remain unchanged. No source, schema, migration, or Payment outcome behavior is authorized by this draft.

## 1. Purpose and scope

Define the minimum contract needed to carry the Signature Cape Winelands initial payment requirement from its existing priced quote into Reservation history and, from there, into the existing Payment initiation request.

This proposal covers:

- the existing four-day, three-night multi-day package and its selected accommodation stops;
- the agreed Reservation total and the amount payable at booking;
- the commercial requirement classification and any contractual future balance;
- preservation of the accepted terms by the Reservation;
- handoff of the preserved initial amount to the existing Payment engine and PayFast adapter.

It does not define private day-tour implementation, payment outcome mapping, Reservation confirmation, Payment Aggregate persistence, new Payment/Reservation relationships, retry cardinality, balance collection, invoicing, or reminders.

## 2. Authority and existing integration points

The approved business rules are B01–B04 in [AR-003.4](AR-003.4-project-owner-architecture-decision-review.md). In particular:

- the tour/package commercial calculation determines the initial requirement;
- APP-004.4 consumes and evaluates that result as policy, but is not its calculator;
- Reservation preserves the agreed terms;
- Payment represents one individual transaction;
- full collection of each selected Hotelbeds amount is independent of refundability;
- the received Hotelbeds rate already includes the 10% accommodation margin; no additional 10% markup is applied;
- the configurable GCT-component collection rate is 50% when the applicable threshold has not been reached and 100% at or inside that threshold.

The current integration path is:

1. [DefaultJourneyQuoteService](../../../../src/application/merchandising/homepage/showcase/journey-quote-service.ts) makes the existing pricing request. Its `BASE` line represents the GCT journey component.
2. [withAccommodationPricingInputs](../../../../src/application/pricing/accommodation/accommodation-pricing-input.ts) adds one priced line for each selected package stop and uses the existing currency policy. These final pricing-line amounts—not raw supplier-currency inputs—are the values relevant to customer collection.
3. [DefaultReservationReviewService](../../../../src/application/merchandising/homepage/showcase/reservation-review-service.ts) obtains the successful quote before reservation creation.
4. [CustomerJourneyReservationService](../../../../src/application/merchandising/homepage/showcase/customer-journey-reservation-service.ts) creates the Reservation from that quote. It currently stores the quote total in `PricingSnapshot.totalPrice` and initializes `PaymentSnapshot.balanceOutstanding` to the full total.
5. [CanonicalReservationPaymentContextResolver](../../../../src/application/payments/payment-initiation-service.ts) currently substitutes `PricingSnapshot.totalPrice` for the payable-now amount. The existing engine/gateway path then carries `paymentRequest.paymentAmount` to PayFast.

The requested change belongs at the existing commercial quote-to-Reservation boundary and the Reservation-to-Payment context boundary. It does not belong in the Payment Aggregate, provider adapter, or frontend calculation.

## 3. Proposed application contract

### 3.1 Monetary and date terms

`Money` below means the existing APP-005 pricing money value: an amount and its currency. No second money type is introduced. All Signature Cape Winelands component amounts handed to PayFast SHALL already be in the Reservation pricing currency (currently ZAR), using only the existing approved pricing currency policy.

`DateOnly` means an ISO calendar date (`YYYY-MM-DD`), not a timestamp. The proposed comparison uses the booking date and departure date in the tour's commercial timezone and counts calendar-date boundaries. The Signature Cape Winelands timezone, rounding rule for a half-cent result, and their owner approvals are listed in §8; implementation SHALL NOT guess them.

### 3.2 Requirement result

The existing commercial quote result SHALL carry a result with these meanings. This is an application contract, not a database layout:

```typescript
type PaymentRequirementClassification = "PARTIAL_PAYMENT" | "FULL_PAYMENT";

interface ContractualFutureBalance {
  readonly amount: Money;
  readonly dueDate: DateOnly;
}

interface InitialPaymentRequirement {
  readonly classification: PaymentRequirementClassification;
  readonly amountPayableAtBooking: Money;
  readonly contractualFutureBalance?: ContractualFutureBalance;
  readonly basis: {
    readonly pricingSnapshotId: string;
    readonly policyId: string;
    readonly policyVersion: string;
    readonly bookingDate: DateOnly;
    readonly departureDate: DateOnly;
    readonly leadTimeCalendarDays: number;
    readonly gctComponent: Money;
    readonly accommodationComponents: ReadonlyArray<{
      readonly packageStopId: string;
      readonly amount: Money;
      readonly pricingLineItemCode: string;
    }>;
  };
}
```

The contract has one source of truth for the Reservation total: the Reservation's existing `PricingSnapshot.totalPrice` and `PricingSnapshot.currency`. Consumers SHALL expose that value as `reservationTotal`; they SHALL NOT store a second independently mutable total in the requirement. `basis.pricingSnapshotId` binds the requirement to that total and to the exact quote from which the component amounts were taken.

`classification` is determined before payment. It is not a Payment lifecycle status and does not indicate that money has been received.

Ownership is:

| Fact | Authority and owner |
| --- | --- |
| Reservation total and currency | Successful APP-005 quote; preserved in the Reservation `PricingSnapshot`. |
| Component-based initial requirement and basis | Signature package commercial calculation; copied unchanged into the Reservation-owned requirement snapshot on customer agreement. |
| Requirement evaluation | APP-004.4 Reservation Payment Policy consumes/evaluates the calculated result; it does not calculate the amount. |
| Amount received and outstanding balance | Reservation `PaymentSnapshot`, updated only from verified Payment outcomes under the separately approved outcome contract. |
| Individual transaction amount | Payment request's existing `paymentAmount`, supplied from the preserved Reservation requirement by application orchestration. |

For a valid result:

- `0 < amountPayableAtBooking.amount <= reservationTotal.amount`;
- currencies match;
- `FULL_PAYMENT` means payable-now equals the Reservation total and no future balance is due under this initial requirement;
- `PARTIAL_PAYMENT` means payable-now is less than the Reservation total and the contractual future balance equals the amount of the GCT component deferred under B04;
- zero, negative, over-total, currency-inconsistent, missing-component, or uncalculable results are invalid; they SHALL fail closed, not become zero-payment or full-payment results.

The effective policy rate SHALL satisfy `0 < r <= 1`. If `r = 1`, the requirement is full payment even when booking is more than 14 days before departure; no future balance is due.

### 3.3 Signature Cape Winelands calculation

The calculation SHALL consume the successful APP-005 quote; it SHALL NOT recalculate or copy the configured GCT price, selected supplier price, currency conversion, taxes, fees, discount, or markup.

For the current Signature Cape Winelands quote:

- `G` is the single `BASE` pricing line for the GCT group component. It is already a group total; it SHALL NOT be multiplied by participant count again.
- `A_i` is the finalized `ACCOMMODATION:<packageStopId>` pricing line for each selected stop, after the existing APP-005 currency treatment.
- `T` is `PricingSnapshot.totalPrice`.
- the quote SHALL contain exactly one GCT component and one accommodation component per selected stop; duplicate or missing stops are invalid.
- each selected Hotelbeds amount is collected at 100%. The included 10% accommodation margin is not applied again.

Let `D` be the approved lead-time calendar-day value, `r` the effective configurable GCT-component collection rate, and `C` the applicable package threshold (14 days):

| Booking lead time | Payable at booking | Contractual future balance | Classification |
| --- | --- | --- | --- |
| `D > 14` | `sum(A_i) + r × G` | `(1 - r) × G`, due 14 calendar days before departure | `PARTIAL_PAYMENT` when the configured rate is below 100% |
| `D <= 14` | `T` | None | `FULL_PAYMENT` |

For the current B04 standard, `r` is 50%; that value SHALL remain commercial policy configuration, not a Payment constant. The policy identifier, version, effective rate, booking date, departure date, lead time and component amounts SHALL be bound into the result basis. The calculation SHALL NOT apply the private-day-tour threshold to this multi-day package.

The current Cape Winelands pricing path uses the GCT base plus accommodation lines, with no configured tax, fee, discount, or other priced component in the described quote. This proposal does not assign payment timing to any newly introduced or non-zero residual component. If `T` is not reconcilable to the identified, approved quote components under the approved pricing rules, the quote SHALL be unavailable for this payment flow until the owner defines that component's treatment.

### 3.4 Customer agreement and Reservation preservation

The payment requirement SHALL be calculated from the quote and booking context shown to the customer before the customer confirms the Reservation. The review experience SHALL show, at minimum:

- the Reservation total;
- the amount payable at booking;
- whether the requirement is partial or full;
- any contractual future balance and due date;
- that the future balance is a contractual term, not a GCT Core collection action.

If the quote, effective policy, or payable amount changes between review and Reservation creation, the system SHALL present the changed terms and obtain renewed customer agreement. It SHALL NOT silently create the Reservation with terms different from those displayed.

At Reservation creation, the accepted `InitialPaymentRequirement` SHALL be preserved as part of the existing Reservation-owned `PaymentSnapshot` (or an owner-approved equivalent within the existing Reservation snapshot boundary). `PricingSnapshot` remains authoritative for Reservation total and currency. No Payment entity, Payment repository, Payment-to-Reservation relation, new Aggregate Root, or separate balance-collection object is introduced by this contract.

Selected-rate cancellation rights, penalties, deadlines and supplier payment conditions remain separate supplier/commercial facts and SHALL NOT alter the B03 customer collection amount. The current [AccommodationSnapshot](../../../../src/application/reservations/models/snapshots/accommodation-snapshot.ts) preserves selected rate references, supplier price and conversion details, but does not define those supplier-condition fields. This proposal does not treat them as already preserved or place them inside the initial-requirement value; the applicable APP-004.2/APP-008 owners must define their Reservation-history treatment.

The following facts SHALL remain distinct:

- `PricingSnapshot.totalPrice`: total agreed Reservation price;
- `InitialPaymentRequirement.amountPayableAtBooking`: amount contractually due for the initial transaction;
- `InitialPaymentRequirement.contractualFutureBalance`: amount and due date contractually deferred under the accepted terms;
- `PaymentSnapshot.amountReceived`: amount established by verified payment outcomes only;
- `PaymentSnapshot.balanceOutstanding`: Reservation total less verified amount received; it is not the amount payable at booking and does not replace the contractual future balance.

The requirement and its basis are immutable for that Reservation agreement. An amended quote requires an explicit new agreement; this specification does not define the amendment operation.

This logical contract does not authorize a new physical representation. Any JSON representation must be explicitly defined and approved under SPEC-027 and SPEC-028 before persistence code uses it.

### 3.5 Payment initiation handoff

The existing Reservation payment-context resolver SHALL load the persisted Reservation and obtain the authoritative initial amount from its preserved `InitialPaymentRequirement`. It SHALL also obtain `reservationTotal` from `PricingSnapshot`.

The resolver and initiation service SHALL verify, before invoking the Payment engine, that:

- the requirement and pricing snapshot exist and refer to the same Reservation and pricing snapshot;
- the requirement's currency matches the Reservation pricing currency and the initial amount is positive and no greater than the Reservation total;
- the classification agrees with the amount/total relationship;
- any contractual future balance is consistent with the accepted partial-payment basis;
- the requested `paymentAmount` equals the preserved `amountPayableAtBooking`.

The existing Payment request's `paymentAmount` SHALL carry that exact authorized initial amount. Its pricing snapshot SHALL continue to carry the full Reservation total. The amount passed to the existing PaymentGateway and PayFast hosted form SHALL be the Payment request amount, unchanged. The Payment Aggregate SHALL neither calculate nor infer the commercial requirement.

The settlement validation contract SHALL stop requiring `paymentAmount == pricingSnapshot.total` and instead validate a positive, currency-consistent transaction amount that does not exceed the Reservation total. The application handoff SHALL independently verify equality with the Reservation's preserved authorized initial amount; relaxing total equality alone is not sufficient authorization.

The existing attempt record continues to describe this one transaction and its amount. A retry or conflicting attempt with a different amount SHALL NOT overwrite the original attempt. This proposal does not authorize changed-term retry behavior or alter PaymentAttempt identity/cardinality.

## 4. Explicit non-goals and boundary preservation

- No change to D01, D02, or D04 decisions. D01's existing derived Payment identity approval is scoped to the first full-payment flow; extending that identity to partial initial payments requires the explicit decision listed in §8. PaymentAttempt idempotency and retry behavior remain governed separately by D06.
- No Payment Aggregate persistence, repository, Prisma relationship, or migration.
- No change to ITN outcome mapping, Reservation confirmation, or cross-Aggregate transaction boundaries.
- No inference that one completed Payment settles the full Reservation.
- No later balance collection, invoice, reminder, or accounts-receivable behavior.
- No universal or private-day-tour implementation in this Signature Cape Winelands increment. B04's private-day rule remains as recorded and is not changed here.

## 5. Focused acceptance criteria

After approval and implementation, the Signature Cape Winelands flow SHALL demonstrate:

1. A successful quote provides exactly one GCT base component and one priced accommodation component for every selected stop; the GCT group component is included once, independent of participant count.
2. Multiple selected accommodation stops contribute each finalized accommodation line exactly once. No additional 10% is applied to Hotelbeds rates already containing that margin.
3. For a booking more than 14 calendar days before departure, with configured `r = 50%`, the classification is `PARTIAL_PAYMENT`, initial payable is `sum(A_i) + 0.5 × G`, and the contractual future balance is `0.5 × G`, due 14 calendar days before departure.
4. For a booking exactly 14 calendar days before departure, classification is `FULL_PAYMENT`, initial payable equals `T`, and no contractual future balance is recorded.
5. The Reservation preserves the accepted requirement and basis. At creation, actual `amountReceived` remains zero; `balanceOutstanding` remains the full Reservation total, independently of the initial payable and contractual future balance.
6. The payment experience presents the amount payable now, not the Reservation total when the accepted requirement is partial.
7. Payment initiation passes the preserved initial amount to the Payment engine, attempt, and PayFast hosted checkout unchanged, while retaining the full Reservation total in the pricing snapshot.
8. A missing, stale, inconsistent, unapproved-currency, or unrepresentable requirement fails closed before a PayFast action is produced.
9. A full-payment requirement retains existing full-total checkout behavior.
10. Tests use controlled component fixtures and do not copy the undocumented costing workbook values or treat a PayFast sandbox/live transaction as a test.

## 6. Required controlled amendments

If this proposal is accepted, responsible owners should incorporate the approved portions through normal version control:

| Specification | Proposed narrow amendment |
| --- | --- |
| APP-004.2 | Define the Reservation-owned initial requirement snapshot fields and immutability semantics; distinguish contractual future balance from received/outstanding state. |
| APP-004.4 | Clarify that tour/package commercial logic calculates the requirement and Reservation Payment Policy consumes/evaluates it; it does not calculate the amount. |
| APP-005 v1.0.1 / Signature quote integration | Confirm the `BASE` and per-stop accommodation line identities as the calculation inputs; retain received Hotelbeds margin treatment; define how any additional quote components affect this scoped payment rule. |
| APP-006.3 / APP-006.4 | Validate the selected transaction amount against the preserved initial requirement instead of equating it to the full pricing total; retain positive amount and currency checks. |
| PayFast integration specification | Clarify that hosted checkout and ITN expected amount use the authorized individual initial transaction amount, not necessarily the Reservation total. Resolve the document's identifier/status discrepancy before treating the amendment as authoritative. |
| SPEC-027 / SPEC-028 | Approve the exact physical representation only after APP-004.2 defines the snapshot semantics. Reuse the existing Reservation snapshot boundary; do not alter Payment persistence. |

## 7. Implementation boundary after approval

The expected code changes are limited to the existing quote result/calculation path, Reservation review presentation, Reservation snapshot construction/round-trip, Payment context resolution/validation, and focused tests. No new Aggregate Root or payment platform is required.

The implementation SHALL NOT begin from this proposal until the blockers in §8 are closed. Once closed, acceptance criteria in §5 are the scope boundary; unrelated Payment lifecycle, confirmation, and persistence work remains separate.

## 8. Outstanding approvals and decision classification

### Blocking this partial initial-payment handoff

1. **Project Owner — date semantics and financial precision:** approve the commercial timezone and date-only lead-time calculation for the 14-day boundary, and approve rounding/precision for calculating the configured GCT percentage in ZAR. B01–B04 remain unchanged; this closes their explicitly open mechanics.
2. **Project Owner / commercial owner — effective policy source:** identify the controlled source and version/effective-date rule for the configurable GCT-component rate. The B04 current standard is 50%; no permanent rate constant or ad-hoc Payment configuration is authorized.
3. **Project Owner — D01 scope:** explicitly approve or reject extending the existing derived Payment identity from the scoped first full-payment flow to this partial initial-payment flow. Do not silently extend D01. This does not decide PaymentAttempt cardinality or retry behavior under D06.
4. **Pricing owner — source verification:** confirm the current Signature quote's GCT `BASE` line and per-stop accommodation lines are authoritative component values for this calculation, confirm the applicable costing source/version, and verify production pricing does not reapply the Hotelbeds-included margin.
5. **Application Architecture and Reservation/Snapshot owners:** approve the APP-004.2 logical snapshot extension and APP-004.4 consumer/calculator boundary. This includes the agreement/display-before-create behavior.
6. **APP-004.2/APP-008 owners:** define how the Reservation preserves each selected rate's cancellation terms, penalties/deadlines and supplier payment conditions separately; the current `AccommodationSnapshot` does not contain this information.
7. **SPEC-027/SPEC-028 owners and architecture governance:** approve the snapshot's physical mapping and JSON structure under their rules before persistence implementation. Their v2.0 document-control status discrepancy is now corrected; that correction does not itself approve the proposed mapping.
8. **Payment and PayFast specification owners:** approve the APP-006.3 validation change and the provider-neutral/PayFast amount handoff amendment. Resolve the PayFast specification identifier/status discrepancy.

### Not blockers to this handoff, but remain gates for broader work

- **D02 and D04:** their recorded confirmations remain outstanding, but this proposal adds no canonical Payment persistence, Payment–Reservation relationship, or PaymentRepository. They are not reopened or changed here.
- **D03:** concerns full Payment/Refund Aggregate persistence. It is not needed to hand off an amount through the existing Payment engine and attempt path; no Payment persistence is proposed.
- **D05, D07, D08, and D09:** lifecycle mapping, ITN transaction boundaries, recovery, and Reservation confirmation are outside this amount-handoff increment. They remain required before implementing verified-outcome/confirmation behavior.
- **D06:** its PaymentAttempt relationship/retry decisions remain open. This narrow flow reuses the current attempt model and makes no new relationship, cardinality, or changed-amount retry behavior. Any expansion beyond one initial requirement/attempt needs D06 resolution.
- **D10:** historical Reservation recovery is not part of creating a new Signature Cape Winelands Reservation. Existing Reservations without preserved requirement terms SHALL remain unavailable for this flow until an approved recovery treatment exists.
- **D11:** customer-access authority is required before enabling customer-facing payment initiation. This proposal does not grant that authority.

The above distinction does not change any approved decision or authorize implementation. A final version number and specification identifier must be assigned through the applicable governance process.
