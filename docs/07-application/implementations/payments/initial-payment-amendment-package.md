# Signature Cape Winelands — Initial Payment Requirement Amendment Package

## Document control

| Field | Value |
| --- | --- |
| Identifier | Pending governance assignment |
| Version | 0.1.0 |
| Status | Draft — Proposed Amendment, Pending Owner Approval |
| Date | 2026-11-18 |
| Scope | Initial payment requirement handoff for the Signature Cape Winelands four-day package |
| Controlling draft | [Initial Payment Requirement Handoff Proposal](initial-payment-requirement-handoff-proposal.md) |
| Authority | Review package only; no amendment or implementation is approved |

This package presents isolated proposed amendments for the exact target documents below. It does not edit or supersede any target. The proposals preserve B01–B04, D02, and D04 as recorded. They do not authorize code, schema, migration, payment, outcome, confirmation, or customer-access changes.

## 1. Verified authority and target inventory

| Document | Repository path | Current identifier / version / status | Amendment target |
| --- | --- | --- | --- |
| AR-003.4 — Project Owner Architecture Decision Review | [AR-003.4](AR-003.4-project-owner-architecture-decision-review.md) | AR-003.4 / 0.1.5 / Draft — For Project Owner Decision; decision preparation only | No amendment proposed. Source of B01–B04 and D01/D02/D04 decisions. |
| AR-003.6 — Dynamic Payment Requirement Reconciliation | [AR-003.6](AR-003.6-deposit-and-full-payment-reconciliation-design.md) | AR-003.6 / 0.1.3 / Draft — Architect Review Accepted; not implementation authorization | No amendment proposed. Controlling analysis and proposed-amendment source. |
| INT-004 — Cape Winelands Dynamic Availability & Package Pricing | [INT-004](../../../08-integration/INT-004-cape-winelands-dynamic-availability-pricing.md) | INT-004 / version not stated / Architect Approved | §5 Go Cape Tours Pricing; add journey-specific initial-requirement handoff subsection. |
| APP-004.1 — Reservation Aggregate | [APP-004.1](../reservation/APP-004.1-reservation-aggregate.md) | APP-004.1 / 2.0 / Approved | `# Snapshot Principle`; `# Responsibilities`. |
| APP-004.2 — Reservation Snapshot Model Library | [APP-004.2](../reservation/APP-004.2-reservation-snapshot-model-library.md) | APP-004.2 / 2.0 / Approved | `# Accommodation Snapshot`, `# Payment Snapshot`, and `# Versioning`. |
| APP-004.4 — Reservation Policy Framework | [APP-004.4](../reservation/APP-004.4-reservation-policy-framework.md) | APP-004.4 / 2.0 / Approved | `## Reservation Payment Policy`. |
| APP-005 — Accommodation-to-Package Pricing Integration | [APP-005](../pricing/APP-005-accommodation-to-package-pricing-integration.md) | APP-005 / 1.0.1 / Implementation Specification | §§9, 20, 22, and 25. The existing embedded-margin rule is retained. |
| APP-005.8 — Quote Integration | [APP-005.8](../pricing/APP-005.8-quote-integration.md) | APP-005.8 / 2.0 / Approved | `# Quote Integration Service` and `# QuoteFactory`. |
| APP-006.3 — Payment Validation Pipeline | [APP-006.3](APP-006.3-payment-validation-pipeline.md) | APP-006.3 / 1.0 / Approved | `## PRICING`, `## SETTLEMENT_READINESS`, and settlement-readiness acceptance criteria. |
| APP-006.4 — Payment Policy Framework | [APP-006.4](APP-006.4-payment-policy-framework.md) | APP-006.4 / 1.0 / Approved | `## Settlement Policy` and `# Policy Context`. |
| APP-006.9 — PayFast Provider Integration | [APP-006.9](APP-006.9-payfast-provider-integration.md) | APP-006.9 / 1.0.0 / Implementation Specification | §§8, 18, 19, and AC-09. Its identifier is distinct from approved, provider-neutral APP-006.8. |
| SPEC-027 — Physical Data Model | [SPEC-027](../../../06-specifications/engineering/SPEC-027-physical-data-model%20v2.0.md) | SPEC-027 / 2.0 / Approved | §§15 and 32. No status change proposed. |
| SPEC-028 — Prisma Data Model | [SPEC-028](../../../06-specifications/engineering/SPEC-028-prisma-data-model%20v2.0.md) | SPEC-028 / 2.0 / Approved | §§18 and 30. No status change proposed. |

The PayFast document is distinct from the approved provider-neutral APP-006.8 Payment Provider Integration. Its unique identifier is now APP-006.9; its status remains Implementation Specification and is not changed to Approved by this package.

## 2. Contract proposed across the amendments

The single source of truth for Reservation total and currency remains the existing Reservation `PricingSnapshot.totalPrice` and `PricingSnapshot.currency`. Do not duplicate a mutable Reservation total in the payment requirement.

The application-level requirement result is:

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

`Money` reuses the established APP-005 amount/currency concept. `DateOnly` is proposed to be an ISO `YYYY-MM-DD` calendar date. The exact Signature Cape Winelands commercial timezone and ZAR percentage rounding rule require the Project Owner's decision in §4; implementation must not infer them.

The facts remain separate:

- Reservation total: existing `PricingSnapshot`.
- Initial amount payable: `InitialPaymentRequirement.amountPayableAtBooking`.
- Commercial classification: `InitialPaymentRequirement.classification`, calculated before payment; never a Payment lifecycle status.
- Contractual future balance and due date: requirement snapshot, when applicable.
- Amount received: existing `PaymentSnapshot.amountReceived`, changed only by verified outcomes under the separately approved outcome contract.
- Outstanding balance: existing `PaymentSnapshot.balanceOutstanding`, equal to Reservation total less verified amount received; it is neither the initial amount payable nor a substitute for the contractual future balance.

Valid requirements have a positive initial amount no greater than the Reservation total, consistent currency, and classification consistent with the amount/total relationship. A missing, stale, inconsistent, or uncalculable result fails closed.

## 3. Proposed specification amendments

Each block below is independent and remains subject to the owner and governance approvals in §4.

### A. INT-004 §5 — Signature Cape Winelands commercial requirement

**Target:** INT-004, §5 “Go Cape Tours Pricing” (version is not stated; status is Architect Approved).

**Existing wording:** §5 states that the participant-count table's group totals are authoritative for this iteration; they exclude accommodation; package price is GCT group total plus selected Hotelbeds accommodation totals for Stops 1 and 2; the group total is selected by party size and must not be multiplied by participant count again.

**Proposed addition after the package-price formula:**

> **Initial payment requirement handoff — Signature Cape Winelands**
>
> For a successful quote for this four-day multi-day package, the Signature Cape Winelands commercial calculation SHALL derive the initial payment requirement from the existing final package quote. It SHALL NOT independently recalculate the GCT component, selected accommodation amounts, currency conversion, or Reservation total.
>
> `G` SHALL be the single GCT group component selected for the participant count and represented once in the successful quote. It is already a group total and SHALL NOT be multiplied by participant count again. `A_i` SHALL be the finalized APP-005 accommodation pricing component for each selected package stop, using the existing pricing currency treatment. Where multiple rooms/rates contribute to a stop, `A_i` SHALL equal that stop's final quote component. `T` SHALL be the quote's final Reservation total.
>
> The calculation SHALL collect 100% of every selected Hotelbeds accommodation component at booking. The received Hotelbeds rate already contains the 10% accommodation margin; no additional 10% accommodation markup SHALL be applied. Cancellation/refundability terms and supplier-payment conditions do not reduce the customer amount due at booking.
>
> Let `r` be the effective GCT-component collection rate from the approved, versioned commercial policy and `D` the lead time derived using the Project Owner-approved calendar-date and timezone rule. For this multi-day package:
>
> - If `D > 14`, the initial amount payable SHALL be `sum(A_i) + r × G`. The contractual future balance SHALL be `(1 - r) × G`, due 14 calendar days before departure.
> - If `D <= 14`, the initial amount payable SHALL be `T`, and no future balance is due under this initial requirement.
> - `r` SHALL be a commercial policy value, not a Payment constant. The current B04 standard is 50%; the applied policy identifier, version, effective rate, booking date, departure date, lead time and component amounts SHALL be included in the calculation basis.
>
> The result SHALL be classified as `PARTIAL_PAYMENT` only when the positive initial amount is less than `T`; it SHALL be `FULL_PAYMENT` when the initial amount equals `T`. These are commercial requirement classifications, not Payment lifecycle statuses or evidence of receipt.
>
> If a required component, policy version, date basis, compatible currency, or exact amount cannot be established, or if `T` cannot be reconciled to the approved quote components, the quote SHALL be unavailable for this payment handoff. Do not infer a zero-payment, full-payment, or alternative pricing outcome.

**Reason:** B01–B04 assign the component-derived requirement to tour/package commercial logic. INT-004 is the journey-specific authority for the current package components and group totals. The addition defines only the missing requirement handoff and does not make APP-005, APP-004, or Payment the calculator.

**Dependencies/approvals:** OR-01–OR-04 in §4; INT-004 owner must assign/confirm the controlled document version before incorporation.

### B. APP-005 §§9, 20, 22 and 25 — pricing inputs, not payment calculation

**Target:** APP-005 v1.0.1, §9 “Supplier Price Semantics,” §20 “Pricing Request Construction,” §22 “Package-Level Aggregation,” and §25 “APP-004 Boundary.” Status is Implementation Specification, not Approved.

**Existing wording:** §9 says the supplier price is an input and prohibits reapplying the Hotelbeds-included 10% accommodation margin. §§20/22 define accommodation inputs and package aggregation. §25 says APP-004 consumes the resulting priced package.

**Proposed addition to §22, with a cross-reference from §25:**

> For the Signature Cape Winelands journey, the successful APP-005 quote SHALL expose the existing GCT group component and one final accommodation component per selected package stop as traceable pricing components. These are inputs to the journey-owned commercial initial-payment calculation defined by INT-004; APP-005 SHALL NOT calculate the payment requirement, contractual future balance, or payment status.
>
> The final stop components SHALL use the existing pricing and currency-conversion rules. They SHALL not reapply the Hotelbeds-included 10% accommodation margin. The Reservation total remains the successful quote's final total.

**Reason:** Makes the existing price/component boundary consumable by the journey rule without moving payment calculation into the pricing capability or changing the approved embedded-margin treatment.

**Dependencies/approvals:** OR-04 in §4; APP-005 owner review. Any non-zero tax, fee, discount, or other component not covered by the INT-004 formula requires an explicit commercial treatment before this handoff is enabled.

### B.1 APP-005.8 Quote Integration — preserve successful quote inputs

**Target:** APP-005.8 v2.0 Approved, `# Quote Integration Service` and `# QuoteFactory`.

**Existing wording:** Quote Integration consumes a successful PricingEngineResult, creates an immutable Quote and preserves the pricing snapshot; QuoteFactory performs no pricing calculations.

**Proposed addition:**

> For the Signature Cape Winelands handoff, the Quote SHALL preserve the successful PricingEngineResult's existing component identities, amounts, currencies, and final total in its pricing snapshot. The journey-owned commercial calculation SHALL consume those preserved quote components without recalculating prices or reconstructing component amounts. If the existing quote snapshot cannot expose the required GCT group component and per-stop accommodation components, the handoff SHALL fail pending an approved quote-contract amendment; do not add a parallel pricing representation.

**Reason:** Ensures the calculation uses the exact successful quote and supports traceability to the authoritative `BASE` and per-stop accommodation lines.

**Dependencies/approvals:** OR-04 in §4; APP-005.8 owner. This addition does not authorize price recalculation or new pricing fields unless separately approved.

### C. APP-004.4 §Reservation Payment Policy — consumer/evaluator boundary

**Target:** APP-004.4 v2.0 Approved, `## Reservation Payment Policy`.

**Existing wording:** The policy “Evaluates payment-related rules” and lists deposit requirements, outstanding balances, and payment-status compatibility as examples; the initial implementation defines the contract only.

**Proposed addition:**

> For the Signature Cape Winelands initial-payment flow, the Reservation Payment Policy SHALL consume and evaluate the `InitialPaymentRequirement` supplied by the tour/package commercial calculation. It SHALL evaluate policy permission and consistency within its existing responsibilities.
>
> The Reservation Payment Policy SHALL NOT calculate the component-derived requirement, select the GCT costing amount, derive the Hotelbeds amount, apply an accommodation markup, or treat `PARTIAL_PAYMENT` or `FULL_PAYMENT` as a Payment lifecycle status. The Reservation preserves the customer-agreed result; the Payment request represents the individual transaction amount supplied by application orchestration.

**Reason:** Implements B02's approved ownership boundary without expanding the existing policy framework into a commercial calculator.

**Dependencies/approvals:** OR-05 in §4; Application Architecture owner.

### D. APP-004.1 `# Snapshot Principle` and `# Responsibilities` — preserve, do not calculate

**Target:** APP-004.1 v2.0 Approved, `# Snapshot Principle` and `# Responsibilities`.

**Existing wording:** Reservation owns immutable snapshots that preserve booking state at creation or amendment; the Aggregate does not orchestrate, calculate pricing, validate, or evaluate policy.

**Proposed addition to `# Snapshot Principle`:**

> For the Signature Cape Winelands journey, Reservation SHALL preserve the customer-agreed initial payment requirement and its calculation basis with the Reservation's PricingSnapshot and PaymentSnapshot. The preserved requirement SHALL describe the accepted terms as of agreement and SHALL NOT be silently recalculated from later pricing, supplier, or policy state.
>
> Before Reservation creation, the customer SHALL be presented with the initial amount payable and any contractual future balance and due date, and SHALL accept those terms. Reservation creation SHALL preserve the exact accepted requirement. This clarification does not authorize payment initiation or confirmation behavior.
>
> The Reservation Aggregate preserves the result; it does not calculate the requirement or process a payment. An amended quote or changed commercial terms require renewed customer agreement before a new Reservation state is established.

**Reason:** Makes the accepted initial amount and future contractual balance historical Reservation facts while retaining the existing Aggregate boundary.

**Dependencies/approvals:** OR-05 in §4; Application Architecture owner.

### E. APP-004.2 `# Accommodation Snapshot`, `# Payment Snapshot`, and `# Versioning`

**Target:** APP-004.2 v2.0 Approved, the named sections.

**Existing wording:** `Accommodation Snapshot` lists identity, property, room, meal basis and stay dates. `Payment Snapshot` lists status, method, amount received and balance outstanding. §Versioning says amendments create new snapshots without modifying historical snapshots.

**Proposed addition under `# Accommodation Snapshot`:**

> Where available from the selected canonical APP-008 rate, preserve the selected rate's supplier payment condition and cancellation policies with that selected rate in the Reservation AccommodationSnapshot. These remain supplier/commercial facts, separate from the customer payment requirement. Do not reinterpret them as reducing the B03 customer collection amount.

**Proposed replacement under `# Payment Snapshot`:**

> PaymentSnapshot represents Reservation-owned historical payment state and the agreed initial payment requirement. It SHALL remain distinct from the Payment Aggregate.
>
> In addition to payment status, method, amount received and outstanding balance, the Signature Cape Winelands PaymentSnapshot SHALL preserve an immutable `initialRequirement` containing:
>
> - classification: `PARTIAL_PAYMENT` or `FULL_PAYMENT`;
> - amount payable at booking, including currency;
> - contractual future balance amount, currency and due date when applicable;
> - pricing snapshot identity;
> - commercial policy identifier and version;
> - booking date, departure date and evaluated lead time;
> - the GCT component amount; and
> - the final accommodation component amount for each package stop and its source pricing-line identifier.
>
> Reservation total and currency SHALL continue to come from PricingSnapshot; do not duplicate them as independently mutable values in `initialRequirement`. `amountReceived` SHALL reflect verified received funds only. `balanceOutstanding` SHALL mean Reservation total less verified amount received; it SHALL NOT mean amount payable at booking or replace the contractual future balance.
>
> `PARTIAL_PAYMENT` and `FULL_PAYMENT` classify the commercial requirement before payment. They SHALL NOT be represented as Payment lifecycle statuses. Payment status and Reservation-level received/outstanding state remain distinct facts.

**Proposed addition under `# Versioning`:**

> Once accepted, the initial requirement and its basis SHALL be immutable historical terms. A changed quote or policy SHALL NOT overwrite them; changed terms require explicit customer re-agreement and a new Reservation snapshot version.

**Reason:** Reuses the existing Reservation snapshot library and gives the initial amount, future balance and commercial basis a durable historical home without creating a new Aggregate Root.

**Dependencies/approvals:** OR-05–OR-07 in §4; APP-004.2 and APP-008 owners. Exact date-only and monetary representations are subject to OR-01.

### F. APP-006.3 `## PRICING` and `## SETTLEMENT_READINESS`

**Target:** APP-006.3 v1.0 Approved, the named validation stages and their acceptance criteria.

**Existing wording:** PRICING validates that a pricing snapshot exists, totals are present, payable amount is positive and currency is consistent. SETTLEMENT_READINESS validates amount consistency, among other settlement conditions. The approved text does not state that the individual transaction must equal the Reservation total; the current implementation's equality check is stricter than that text.

**Proposed replacement for the amount-consistency requirement:**

> Payment validation SHALL receive the Reservation-preserved initial payment requirement as immutable application context. For this Signature Cape Winelands flow, it SHALL verify that:
>
> - the individual transaction amount is positive and no greater than the Reservation total;
> - its currency matches the requirement and Reservation pricing currency;
> - it equals the preserved amount payable at booking; and
> - the requirement classification agrees with the amount-versus-total relationship.
>
> The full Reservation total remains the pricing total. A permitted partial initial transaction SHALL NOT be rejected solely because its amount is less than that total. Missing or inconsistent requirement context SHALL fail validation; the validator SHALL NOT infer a payment amount from the total or outstanding balance.

**Reason:** Removes the undocumented full-total equality restriction while retaining validation against the actual Reservation-authorized amount, positive amount, and currency.

**Dependencies/approvals:** OR-08, plus OR-01, OR-03, and OR-05 in §4. Application Architecture and Payment specification owners.

### G. APP-006.4 `## Settlement Policy` and `# Policy Context`

**Target:** APP-006.4 v1.0 Approved, the named sections.

**Existing wording:** Settlement Policy determines whether settlement is permitted under current business rules. The policy context contains Reservation snapshot, pricing snapshot, payment request, payment method and metadata; policies read context only.

**Proposed addition to `# Policy Context`:**

> For the scoped Signature Cape Winelands initial transaction, the immutable context SHALL include the Reservation-preserved `InitialPaymentRequirement` supplied by application orchestration. It is decision context, not a Payment Aggregate field or a second pricing source.

**Proposed addition to `## Settlement Policy`:**

> Settlement Policy SHALL evaluate permission for the individual transaction against the supplied, Reservation-preserved initial requirement. It SHALL NOT calculate that requirement or assume the transaction amount equals the Reservation total. A partial initial transaction may be permitted when it matches the agreed amount payable at booking and the context is otherwise valid. The policy SHALL NOT treat the contractual future balance as an instruction to initiate another transaction.

**Reason:** Keeps provider-neutral Payment policy evaluation distinct from tour/package commercial calculation and prevents full Reservation settlement from being inferred from one transaction.

**Dependencies/approvals:** OR-05 and OR-08 in §4; Application Architecture and Payment specification owners.

### H. PayFast §§8, 18, 19 and AC-09 — expected individual transaction amount

**Target:** APP-006.9 — PayFast Provider Integration, version 1.0.0, status Implementation Specification. APP-006.8 remains the separate approved provider-neutral specification.

**Existing wording:** §8 maps the canonical APP-006 request's `amount`; §18 compares ITN amount with the expected APP-006 payment amount; §19 says the authoritative GCT amount is supplied upstream; AC-09 requires notification amounts to be checked against the expected payment amount.

**Proposed additions to §§8 and 18:**

> The `amount` in the hosted checkout SHALL be the exact individual transaction amount in the canonical APP-006 request. For the Signature Cape Winelands initial transaction, that amount SHALL equal the initial amount payable preserved in the Reservation requirement, not an assumed full Reservation total.
>
> The expected ITN amount SHALL be the persisted PaymentAttempt amount for that individual transaction. The verified PayFast `amount_gross` SHALL match it exactly under the existing currency precision rules. A mismatch SHALL be rejected. Do not substitute the Reservation total or contractual future balance for the expected attempt amount.

**Proposed addition to §19 and AC-09:**

> APP-004/tour-package commercial orchestration supplies the agreed initial requirement; APP-006 supplies the authorized individual transaction amount; PayFast neither calculates the requirement nor determines whether the Reservation's full obligation is settled. A verified completion of this transaction is not evidence that a contractual future balance was paid.

**Reason:** Clarifies the existing provider boundary for partial initial payments while preserving current amount-correlation and ITN validation behavior.

**Dependencies/approvals:** OR-03, OR-04, and OR-08 in §4; Payment and PayFast specification owners. This amendment does not alter ITN lifecycle mapping or confirmation.

### I. SPEC-027 §15/§32 and SPEC-028 §18/§30 — physical snapshot mapping

**Target:** SPEC-027 v2.0 and SPEC-028 v2.0, the named sections. Both documents' headers and footers state Approved. The proposed physical mapping still requires review and approval before implementation.

**Existing wording:** SPEC-027 §15 requires Reservation-owned snapshots to be reconstructable and says JSONB structures must follow the canonical application contract. §32 permits JSONB only for a defined historical snapshot contract. SPEC-028 §18 requires the Prisma representation to follow SPEC-027; §30 permits Prisma `Json` only for structures explicitly defined in SPEC-027.

**Proposed addition to SPEC-027 §15 (after APP-004.2 approval):**

> The existing Reservation `payment_snapshot` historical snapshot MAY contain a structured `initialRequirement` object defined by APP-004.2 for the Signature Cape Winelands initial-payment flow. Its canonical fields are classification, amount payable at booking, optional contractual future balance and due date, and calculation basis bound to the existing PricingSnapshot. Reservation total remains authoritative in `pricing_snapshot`; it SHALL NOT be duplicated in `payment_snapshot`.
>
> The `initialRequirement` object is Reservation-owned commercial history. It SHALL NOT represent or contain a Payment Aggregate, Payment-to-Reservation relationship, provider payload, or future collection command. The existing Reservation payment snapshot SHALL remain independently reconstructable.

**Proposed addition to SPEC-027 §32:**

> Where the approved APP-004.2 contract defines the Signature Cape Winelands `initialRequirement` as part of the Reservation PaymentSnapshot, the structure MAY be stored within the existing Reservation `payment_snapshot` JSON/JSONB snapshot. Its exact approved fields and validation rules SHALL be defined by APP-004.2. This does not authorize a new table, column, Payment relationship, or change to Payment persistence.

**Proposed addition to SPEC-028 §18 and §30:**

> Map the SPEC-027-defined `initialRequirement` within the existing Reservation `paymentSnapshot` Prisma `Json` field. Do not add a Prisma model, column, relation, or migration for this handoff. The structure SHALL round-trip under the APP-004.2 contract, and unknown or malformed requirement data SHALL not be converted into a successful Payment initiation context.

**Reason:** Defines a constrained physical representation using the existing Reservation snapshot field, consistent with the Reservation/Payment boundary and the rule that Prisma JSON structures must first be defined by SPEC-027.

**Dependencies/approvals:** OR-07 in §4 and prior approval of APP-004.2 amendment E. No schema change or migration is proposed or authorized.

## 4. Owner decision register

This register is limited to the outstanding approvals identified in §8 of the controlling proposal. It does not decide on behalf of any owner.

`OR` means **Owner Review** in the identifiers below; these package-local identifiers are distinct from architectural decisions D01–D11.

| ID | Decision required | Responsible owner | Recommended wording / question for approval | Approval/rejection consequence | Blocks this implementation? |
| --- | --- | --- | --- | --- | --- |
| OR-01 | Date semantics and monetary precision for the 14-day rule and GCT percentage | Project Owner, with Finance/Pricing input | “Approve comparing the booking and departure as calendar dates in the Signature Cape Winelands commercial timezone (`Africa/Johannesburg` proposed), using `D > 14` versus `D <= 14`; approve exact decimal calculation and ZAR cent rounding (`ROUND_HALF_UP` proposed). Reject or specify alternatives.” | Approval makes the exact boundary and amount reproducible. Rejection requires a replacement rule; no implementation may guess. | Yes |
| OR-02 | Effective source/version for the configurable GCT-component collection rate | Project Owner and commercial policy owner | “Approve the versioned Signature Cape Winelands commercial policy source for `r`, effective-date selection, and captured policy ID/version. Confirm the current B04 standard is 50% for `D > 14`, while retaining configurability.” | Approval enables deterministic calculation and history. Rejection leaves the applicable rate unavailable; do not hardcode a Payment constant. | Yes |
| OR-03 | D01 identity scope for a partial initial transaction | Project Owner | “Approve or reject extending D01 Option A's derived Payment identity `payment-${reservationId}` from the scoped first full-payment flow to the first partial initial-payment transaction for this Reservation. This does not approve one-to-one Payment/Reservation cardinality or PaymentAttempt cardinality.” | Approval permits reuse of the scoped identity subject to D01 collision/legacy/consumer checks. Rejection requires the flow to remain disabled pending a separately approved identity; D01 itself is not reopened. | Yes for partial payments; no for the existing full-payment path |
| OR-04 | Verification of Signature pricing component source and margin parity | Pricing owner | “Confirm that the successful Signature quote carries one GCT group total and the final amount per selected accommodation stop according to INT-004 §5; identify/confirm the applicable costing source and version; verify the quote's production component values and that production applies no second 10% accommodation markup. Confirm how the payment calculator receives only those successful quote components.” | Approval permits consumption of those quote lines without copying static prices. Rejection requires correction/clarification of the pricing output before amount calculation. | Yes |
| OR-05 | Logical Reservation requirement snapshot, customer agreement, and APP-004.4 consumer boundary | Application Architecture / APP-004 owners | “Approve amendments C–E: tour/package logic calculates; APP-004.4 consumes/evaluates; before Reservation creation the customer sees and accepts the initial amount and any future balance/due date; Reservation immutably preserves the accepted requirement and basis, with total remaining in PricingSnapshot and receipt/outstanding state separate.” | Approval enables Reservation persistence and resolver handoff. Rejection leaves no authorized historical contract or agreed amount to initiate. | Yes |
| OR-06 | Preservation of supplier cancellation/payment conditions per selected rate | APP-004.2 and APP-008 specification owners | “Approve preserving the selected canonical rate's existing cancellation policy collection and supplier payment type with each selected rate in AccommodationSnapshot; confirm this is sufficient to preserve deadlines/penalties/conditions for the scoped flow.” | Approval satisfies B03's separate historical supplier-condition requirement without changing the amount due. Rejection leaves that aspect of B03 preservation incomplete. | Yes for the complete scoped B03 Reservation contract |
| OR-07 | SPEC-027/028 status and physical snapshot mapping | GCT Core System Architecture and architecture governance | “With SPEC-027/028 v2.0 headers and footers stating Approved, approve or reject amendment I's mapping into the existing Reservation `paymentSnapshot` JSON field under those specifications, with no schema change.” | Approval permits snapshot persistence implementation under those authorities. Rejection blocks persistence implementation; no alternate storage is authorized here. | Yes |
| OR-08 | APP-006 validation/policy and PayFast amount amendments | Application Architecture / Payment owner and PayFast specification owner | “Approve amendments F–H: Payment validation checks the individual request against the Reservation-preserved initial amount; Payment policy evaluates but does not calculate the obligation; hosted checkout uses that amount and ITN validates against the persisted attempt amount. Confirm APP-006.9 as the unique PayFast-specific identifier and retain its Implementation Specification status; do not mark it Approved through this change.” | Approval enables the existing initiation/adapter path to accept an authorized partial amount. Rejection leaves the full-total restriction or unapproved provider specification in place. | Yes |

The approvals do not change B01–B04. D02 and D04 are deliberately not submitted for reconsideration. No D03–D11 decision is requested or made here.

## 5. Dependency and approval sequence

1. **Project Owner decisions OR-01 through OR-03:** close date/precision, effective commercial policy, and D01 partial-identity scope. Keep B01–B04 and existing D01 conditions intact.
2. **Pricing owner decision OR-04:** verify the actual successful quote component mapping and no double accommodation margin. This can run in parallel with OR-01 through OR-03.
3. **Application/specification owners decisions OR-05 and OR-06:** approve Reservation-owned requirement history, APP-004.4's consumer role, and separate preservation of selected supplier terms.
4. **Architecture governance decision OR-07:** confirm SPEC-027/028 status reconciliation and approve the proposed mapping. This depends on the logical snapshot contract in step 3.
5. **Payment/PayFast decision OR-08:** approve the validation, policy and provider amendments using the approved contract from steps 1–4; confirm APP-006.9 remains Implementation Specification.
6. **Controlled incorporation:** owners incorporate accepted wording with normal identifiers, versions, revision history and approvals. Only after all applicable gates close may a separately authorized implementation task begin.

No amendment is effective merely because it appears in this package.

## 6. Architect assessment

No approved business decision is contradicted by this package. It preserves B01–B04, keeps the Reservation as the Commercial Aggregate and Payment as the individual Financial Aggregate, and makes no change to the already approved D02 or D04 decisions.

The relevant gaps and authority tensions are:

- APP-004.1 and APP-004.2 currently require historical snapshots but do not define the agreed initial requirement, calculation basis, or contractual future balance.
- APP-004.4 describes a Reservation Payment Policy but does not define the tour/package commercial calculation or its handoff. Assigning calculation to that policy would conflict with B02.
- APP-005 governs the final package price and explicitly prohibits reapplying the Hotelbeds-included 10% margin. The proposed APP-005 text preserves that rule and makes its component output consumable; it does not transfer commercial payment calculation to Pricing.
- APP-006.3 requires positive payable amount and amount consistency but does not state in its approved text that the transaction must equal the Reservation total. The current implementation's stricter equality check is an implementation/specification mismatch, not a reason to reinterpret B01.
- The PayFast specification already requires comparison against the expected APP-006 payment amount and upstream authority. It does not clearly distinguish an individual authorized initial amount from the full Reservation total. Its identity is now APP-006.9; its status remains Implementation Specification.
- INT-004 calls its group totals authoritative for this iteration, while AR-003.6 notes that the underlying costing workbook/source and production implementation verification are not evidenced. The proposed handoff consumes the successful quote and does not copy those static totals; the Pricing owner verification in OR-04 is limited to that actual output and margin parity.
- SPEC-027/028 require JSON snapshot structures to be defined and mapped consistently. Their v2.0 headers and footers now agree on Approved status; the proposed physical mapping still requires explicit approval.

No amendment here expands into Payment persistence, Payment–Reservation relationships, ITN lifecycle, Reservation confirmation, or later balance collection.

## 7. Final status

- One review-ready amendment package has been prepared with separately identified target sections, existing wording/behavior, proposed text, rationale, dependencies, and owner approvals.
- The eight required owner decisions and their consequences are explicit.
- No approved specification was modified; no approval or status was assigned.
- No source code, Prisma schema, migration, or test was changed.
- No files were staged or committed.
- **Implementation remains unauthorized pending the applicable approvals and controlled incorporation.**
