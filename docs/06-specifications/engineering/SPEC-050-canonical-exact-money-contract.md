# SPEC-050 — Canonical Exact-Money Contract

## Document control

| Field | Value |
|---|---|
| Identifier | SPEC-050, proposed; governance assignment pending |
| Version | 0.1.0 |
| Status | Draft — Architect and specification-owner review |
| Classification | Cross-capability application and persistence contract |
| Proposed owner | GCT Core System Architecture, with Application Architecture and Pricing; assignment requires confirmation |
| Applies to | Pricing, accommodation, Reservation, Payment, Refund, PaymentAttempt and provider boundaries |
| Governing authority | [SPEC-000](SPEC-000-engineering-specification-standard.md), [GOV-DEV-001](../../09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md), approved applicable specifications and Project Owner decisions |

| Version | Date | Change |
|---|---|---|
| 0.1.0 | 2026-11-19 | Initial proposed contract for review; no implementation, migration or operation authorised. |

SPEC-050 is the next identifier found unused in the repository and architecture index; its assignment and catalogue entry require governance confirmation. The user requested this draft; neither a candidate number nor this draft establishes approval. **All new SHALL requirements below are proposals**, conditional on the decisions and approvals in section 9. They do not amend existing approved documents or authorise implementation. Where a requirement is already established, its scope and source are identified explicitly.

## 1. Purpose, scope and authority

Define one precision-safe contract for the financial values passed between supplier pricing, GCT pricing, Reservation, Payment and PayFast, and through their approved persistence mappings. Separate subsequent specifications must cover implementation, Payment lifecycle, supplier booking persistence and migration.

The approved [APP-004.1/004.2](../../07-application/implementations/reservation/APP-004.2-reservation-snapshot-model-library.md), [APP-006.1 v2.0](../../07-application/implementations/payments/APP-006.1-payment-aggregate-v2.0.0.md), [APP-006.2 v2.0](../../07-application/implementations/payments/APP-006.2-payment-model-library-v2.0.0.md), and [APP-006.8 provider-neutral v1.0](../../07-application/implementations/payments/APP-006.8-payment-provider-integration-v1.0.0.md) remain in force subject to controlled amendment. [APP-006.9 v1.1.0](../../07-application/implementations/payments/APP-006.9-payfast-provider-integration-v1.1.0.md) identifies itself as an Implementation Specification, not explicitly Approved; its identity and status require confirmation. [SPEC-001 v1.0](SPEC-001-project-structure-and-folder-layout-v1.0.0.md), [SPEC-026 v2.0](SPEC-026-canonical-logical-data-model-v2.0.0.md), [SPEC-027 v2.1](SPEC-027-physical-data-model-v2.1.0.md), [SPEC-028 v2.1](SPEC-028-prisma-data-model-v2.1.0.md) and [SPEC-029 v2.0](SPEC-029-repository-persistence-architecture-v2.0.0.md) are the indexed historical baselines; SPEC-026 and SPEC-029 have header/footer status discrepancies requiring governance confirmation. Their proposed revisions, including [SPEC-027 v3.0.0 §20.1](SPEC-027-physical-data-model-v3.0.0.md), are drafts, not authority. The [version index](../../07-application/implementations/payments/payment-document-version-index.md) is navigation only.

[AR-003.4 v0.1.7](../../07-application/implementations/payments/AR-003.4-project-owner-architecture-decision-review.md) records accepted Project Owner directions, although its header remains Draft for Architect Review; it is not an implementation specification. The [accepted authority assessment](../../13-reports/payment-and-hotelbeds-specification-authority-assessment.md) records unresolved dependencies. Do not silently resolve conflicts between documents.

## 2. Boundaries and distinct facts

| Boundary | Required distinct value and responsibility |
|---|---|
| Supplier availability, CheckRate and selected offer | APP-008 preserves each supplier amount, currency, rate basis and relevant provenance, including individual rooms. A selected offer is not a supplier-confirmed booking. |
| GCT package pricing | APP-005 owns the final GCT price and components. Preserve the supplier original separately from any converted accommodation line and the GCT group component. Hotelbeds rates received by GCT already include the 10% accommodation margin; no additional 10% accommodation markup is permitted. |
| Reservation | APP-004 preserves the agreed full total in PricingSnapshot, the agreed initial payable and contractual future balance/due date, and separately the PaymentSnapshot's verified received and outstanding amounts. Historical values are not recalculated from current policies or supplier data. |
| Payment and Refund | APP-006 preserves the individual transaction amount and currency, its historical pricing and evidenced stage amounts, and each Refund amount; none alone establishes full Reservation settlement. |
| Attempt and provider | PaymentAttempt preserves its own expected transaction amount/currency. The provider adapter validates the amount for the applicable provider without changing the commercial amount. |
| Supplier booking | APP-008's later booking specification must preserve the actual confirmed supplier price, currency, basis and provenance separately from selection and GCT package price. This contract does not design booking storage. |

Reservation and Payment remain separate Aggregates with separate persistence boundaries. This draft introduces no parallel Payment or Supplier Booking Aggregate, table, cardinality, lifecycle or cross-Aggregate transaction. A verified PayFast `COMPLETE` is provider evidence only until a separate transition contract is explicitly approved; it does not fabricate authorisation, capture, settlement or confirmation.

## 3. Application money representation

**Recommended, not yet approved:** an immutable money value consisting of an exact signed base-10 decimal amount plus an uppercase three-letter currency code. Internally use an arbitrary-precision integer coefficient and non-negative decimal scale, or a decimal library with equivalent exact semantics; do not expose JavaScript `number` as authoritative money. No specific library is selected. Integer minor units alone simplify settlement but cannot preserve supplier sub-minor prices; an exact decimal supports both. A decimal string alone serialises safely but still needs exact arithmetic.

1. A persisted monetary fact SHALL be representable by at most 15 integral digits and four fractional digits after removal of insignificant leading and trailing zeroes. This proposed common supported range matches existing Payment, Refund and PaymentAttempt `Decimal(19,4)` columns; it does **not** make four digits the currency settlement scale or claim all other columns already have that type. Values outside it SHALL be rejected at the boundary, not rounded or truncated. Expansion for a supplier, currency or future use requires an approved affected-specification and storage change.
2. The canonical decimal text SHALL match `-?(0|[1-9][0-9]*)(\.[0-9]*[1-9])?`, with zero written `0`, not `-0`; exponent notation, plus signs, whitespace, separators, leading zeroes, trailing fractional zeroes, NaN and infinity are invalid. This is a value encoding, not a display format. For example `12.3400` from an exact database decimal normalises to `12.34`, and `0.0000` to `0`. External source text may be parsed by a source-specific exact grammar and normalised without loss; reject invalid or unsupported source values.
3. Value equality SHALL compare exact numeric value and currency, not text scale. Currency SHALL be validated against a versioned supported-currency/precision policy; unknown or absent codes fail explicitly. Counts and dates may use integer types, but monetary values, percentages and exchange rates used in financial calculation SHALL not pass through binary floating-point arithmetic.
4. Exact intermediate calculations SHALL use integer coefficients/scales or exact rational arithmetic; round only at an approved boundary. Input digit/scale limits and computation resource limits SHALL be checked before exponentiation or allocation. Exceeding supported limits is an explicit error, never a partial amount. Field-specific non-negative, positive and zero constraints belong to the owning contract; signed values may represent an authorised adjustment, not an automatic permission for negative Payment or Refund.
5. ZAR transactional precision is two fractional digits. Recommend supporting EUR, USD and GBP at two minor digits only after Pricing/Finance and relevant provider owners approve their currency metadata and boundaries; their mere presence in a code enum is not approval. Retain supplier sub-minor values up to the supported four-digit value scale where the source contract allows them. Currency minor units, supplier precision, display precision and database scale are separate constraints.

## 4. Arithmetic, rounding and conversion

Addition, subtraction and comparisons SHALL require identical currencies. Multiplication by a quantity, percentage or FX rate SHALL use its exact integer/decimal representation. Preserve the declared pricing basis: multiply a per-room or per-person price only by its applicable count; sum distinct room rates to the stop total and distinct stop lines to the package total exactly once. A group-total GCT line SHALL not be multiplied by participant count again. No duplicate or missing stop or currency mismatch may be silently accepted.

An approved policy SHALL specify the input, output scale, rounding mode, exact point of rounding, and reconciliation of independently rounded lines to totals. Storage or deserialisation SHALL never round. For otherwise undecided calculations, recommend `ROUND_HALF_EVEN` at the final named currency boundary, with no intermediate rounding; this is **not approved** and must not override an established commercial or supplier rule. Pricing/Finance and the affected specification owners must decide line-versus-total boundaries, permitted differences and allocation; do not invent a balancing adjustment.

**Existing specific rule:** [INT-004 v1.0.0 §5.1](../../08-integration/INT-004-cape-winelands-dynamic-availability-pricing.md) is Architect Approved for the Signature Cape Winelands initial requirement. For booking more than 14 calendar days before departure, apply the effective configured rate to the GCT group component, independently calculate its complement, round each `ROUND_HALF_UP` to ZAR cents, add all final accommodation stop lines to the initial amount and require initial plus future balance to reconcile to the quote total. If they do not reconcile, fail closed. At 14 days or fewer the initial amount is the total. Preserve the approved timezone, effective policy version, rates, thresholds and due-date rules. Do not substitute half-even or change the split to force reconciliation. For example, where the GCT group component is ZAR `100.01`, a 50/50 split using `ROUND_HALF_UP` produces an initial GCT component of `50.01` and a future GCT component of `50.01`. Their combined amount is `100.02`, so the calculation fails reconciliation rather than inventing a one-cent adjustment. Accommodation amounts remain separate and are added according to the approved initial-payment calculation.

Conversion SHALL occur only under an explicitly authorised pricing policy, never implicitly inside PayFast or while loading historical values. Retain exact source amount/currency, target amount/currency, exact rate and direction, policy/source identity and version, effective time and conversion/rounding boundary, alongside relevant quote provenance. A conversion SHALL multiply exact source by an exact positive rate, then round only as that policy authorises. Same-currency amounts require no FX; unsupported pairs, missing policy/rate or stale/invalid provenance fail closed. [CUR-002](../../07-application/implementations/pricing/CUR-002-configurable-accommodation-currency-reconciliation.md) documents a configured EUR-to-ZAR path and [CUR-002.1](../../07-application/implementations/pricing/CUR-002.1-persist-accommodation-currency-conversion-metadata.md) its snapshot metadata; do not treat its example rate or current numeric implementation as a universal FX policy. Pricing/Finance must approve precision, rate provenance, timing and rounding for each supported policy.

## 5. JSON, snapshots and provider boundaries

Proposed versioned money JSON shape: `{"amount":"123.45","currency":"ZAR"}`. The amount is canonical decimal text under section 3; currency is the validated code. Each owning snapshot schema SHALL define its version, field location, currency rules, required/optional fields and explicit decoding of each supported historical version. Decimal rates SHALL also be strings with a separately defined exact rate schema. A schema version identifies the encoding; readers SHALL reject unknown versions and malformed values, rather than default missing amounts to zero. JSON numbers SHALL NOT represent new authoritative financial values.

Reservation snapshots SHALL carry separate total, agreed initial amount, future balance and due date, received and outstanding values. A snapshot of a supplier price SHALL retain original amount, currency and basis and, where conversion occurred, its separately preserved conversion information. Payment and Refund snapshots SHALL preserve their own amount and currency and sufficient historical precision. Versioning and exact field placement require APP-004.2, APP-006.2 and physical-model approval; this proposal creates no JSON field.

At the initial PayFast boundary, accept only an approved positive ZAR transaction amount exactly expressible in cents; extra **non-zero** fractional digits are invalid, not rounded. Format accepted values with exactly two fractional digits for checkout and compare the verified ITN gross to the persisted attempt in exact cents. For example `12.3` formats as `12.30`, while `12.345` is rejected. Preserve validation and evidence separately from lifecycle transitions. A provider constraint is not a universal GCT currency rule; no provider conversion is implied.

## 6. Persistence and reconstruction

For existing `Decimal(19,4)` Payment, Refund and PaymentAttempt amount columns, the proposed mapping SHALL validate range and scale **before** database assignment, create the Prisma Decimal from exact decimal text, and restore it from an exact decimal representation without `Number`, `parseFloat` or floating-point arithmetic. Currency codes SHALL map to and from the approved currency reference without fallback or invented defaults. For a stored `999999999999999.9999`, the restored value and currency must equal the input exactly; `1000000000000000` or `0.00001` must fail before persistence. Non-significant trailing zeroes may be removed; the numeric value must not change.

For approved JSON/JSONB snapshots, write and read the versioned string representation without a numeric intermediate. For any other relational column or provider evidence, its owner SHALL specify an exact compatible mapping and bounds before use; incompatible storage rejects the value. Mappers and repositories SHALL surface malformed, missing, overflowed and unsupported data as explicit errors with appropriate operational reporting, not as empty or zero-valued successful reconstructions. Read/write tests must demonstrate application → database → application equality for every applicable amount and currency, including complete owned Refunds when Payment reconstruction is separately authorised.

This contract does not approve any new JSON structure, schema or repository API. [SPEC-027 v3.0.0](SPEC-027-physical-data-model-v3.0.0.md) proposes equivalent `Decimal(19,4)` handling for existing Payment/Refund columns but remains Draft; APP-004, APP-005, APP-006 and SPEC-026–029 require coordinated amendments and approval.

## 7. Legacy compatibility and migration

Current code already passes financial values through JavaScript `number`, and Reservation JSON contains numeric values. Their original source precision cannot generally be recovered by converting the resulting number to text. A decimal column may preserve its stored value exactly without proving that upstream input was accurate. Historical numeric JSON tokens, even if parsed losslessly from raw stored text, establish only the stored decimal, not the original supplier or commercial intent.

Before any implementation, the responsible owners SHALL approve an inventory and classification of affected source, snapshot, Payment, Refund and Attempt records and consumers; a version-aware read/write and rollout strategy; evidence-based conversion rules; reconciliation and exception ownership; backward compatibility; rollback and verification. An exact historic value may be migrated only when authoritative evidence and compatible identity establish it. Ambiguous, conflicting, unsupported or unverifiable data SHALL remain available for controlled investigation, not be silently rounded, fabricated, zero-filled or represented as a verified canonical amount. Preserve raw evidence, original record identities and history subject to approved retention/access controls. D10 does not permit manufacturing historical Payments or replacements.

Legacy readers and migration tooling SHALL not claim a precision guarantee before a record has passed the approved evidence-based classification. No live database operation, backfill, schema change or deployment is authorised by this draft.

## 8. Required validation and acceptance criteria

After decisions and controlled amendments, a separately authorised implementation is acceptable only if focused tests demonstrate:

1. Exact parsing, canonical serialisation and currency validation; numeric equality across trailing-zero scales; rejection of invalid strings, unknown currencies, negative/zero values where prohibited, excess non-zero precision, range overflow and resource limits.
2. Exact addition, subtraction, comparison and multiplication, with mixed currencies rejected; per-room, per-stop and group basis respected, no duplicated accommodation and no extra 10% margin.
3. Exact Signature Cape Winelands approved half-up split, boundary dates, due date, effective version, full-payment path and the half-cent reconciliation failure above; other policy rounding only after approval.
4. Explicit approved FX provenance and exact conversion; same-currency/no-conversion path; missing, unsupported or invalid rates and currencies fail closed; source amount remains distinct from converted amount.
5. Versioned Reservation and Payment JSON encode/decode and actual database round trips retain all accepted values and currencies, including boundary values, zeroes, selected supplier prices, totals, initial/future terms, received/outstanding, PaymentAttempt and each complete Refund; no binary conversion or silent rounding occurs.
6. PayFast exact-cent formatting and gross-to-attempt comparison reject mismatch and excess precision; verified provider evidence is not treated as an approved canonical transition or Reservation confirmation.
7. Legacy numeric, invalid, unknown-version and incomplete records follow approved classification and explicit error/recovery paths; no invented history or successful reconstruction from defaults.
8. The implementation meets existing applicable regressions and approved migration/rollback tests. A mocked Prisma round trip alone does not demonstrate database precision or a complete Aggregate reconstruction.

## 9. Open decisions and approval gates

| Decision / alternatives and recommended direction | Accountable approval or confirmation |
|---|---|
| Decimal coefficient/scale or equivalent decimal library versus integer minor units; recommend exact decimal as in §3. Choose bounded persisted range and supplier precision, including inputs beyond four digits. | Application Architecture, Pricing, APP-008 and Payment owners; System Architecture and physical/repository owners approve consistency. |
| Supported currencies, minor-unit metadata source/version and applicability to supplier, pricing, settlement and display; recommend ZAR first and review EUR/USD/GBP individually. | Pricing/Finance and affected specification/provider owners; Project Owner if commercial scope changes. |
| Rounding mode and line/stop/total allocation for each non-INT-004 case; recommend half-even only where owners explicitly approve, with no silent balancing. | Pricing/Finance and applicable commercial owner; Project Owner for new or changed commercial policy. Preserve the existing INT-004 rule. |
| FX rate source, approval, validity, precision, timing, pair, rounding, snapshot provenance and what happens when unavailable; compare configured fixed policy with other authorised sources. Recommend explicit policy and fail closed. | Pricing/Finance and accommodation owners; Project Owner for commercial FX policy as required; affected Reservation owners approve history. |
| Snapshot versions and exact JSON shapes, storage bounds, currency-reference mapping and complete Payment/Refund reconstruction; compare compatible versioned strings with other exact storage. Recommend §5–6; no new model is authorised. | APP-004.1/.2, APP-005, APP-006.1/.2/.8/.9, APP-008 and SPEC-026–029 owners; Architect/governance as applicable. Confirm APP-006.9 identity/status and the recorded baseline discrepancies. |
| Legacy source-of-truth evidence, classification, exceptions, compatibility, staged migration, rollback, access and retention. Recommend no inferred repair; unresolved records remain controlled. | System Architecture, persistence, Payment, Reservation, Pricing and Financial/Operations owners; Project Owner only for unresolved commercial or operational policy choices. D08 and D10 remain binding. |

Before implementation: governance confirms identifier/ownership and status; responsible specification owners and Architect review this contract and reconcile affected approved documents; commercial decisions are approved by their appropriate owners; detailed mapping, compatibility, migration and rollback specifications are approved; and the relevant implementation iteration is separately authorised under GOV-DEV-001. D05, D07–D11 and their conditions remain unchanged. Do not treat this draft as authorisation to execute payments or enable customer access.

## 10. Dependent workstreams and change control

1. Once the common contract and decisions are approved, align APP-004, APP-005, APP-006 and SPEC-026–029 through controlled revisions, including Payment lifecycle/evidence reconciliation separately from money. Define and approve the precise persistence and migration work before implementation.
2. The APP-008/Hotelbeds booking-persistence workstream must independently specify and approve selected versus confirmed supplier price, provenance and recovery using this contract; this draft selects no booking repository or schema.
3. Changes to this contract require responsible owner and architecture-governance review and, where they change commercial rules, appropriate Project Owner approval. Historic snapshots retain the applicable contract version and must not be silently reinterpreted.

**Approval:** Pending — no owner, Architect or governance approval is asserted by this draft.
