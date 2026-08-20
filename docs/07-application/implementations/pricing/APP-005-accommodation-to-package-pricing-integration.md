# APP-005 — Accommodation-to-Package Pricing Integration

## Document Control

| Field | Value |
|---|---|
| Document ID | APP-005 |
| Title | Accommodation-to-Package Pricing Integration |
| Version | 1.0.0 |
| Status | Implementation Specification |
| Capability | APP-005 Pricing |
| Related Capabilities | APP-003 Journey, APP-004 Reservation, APP-008 Accommodation |
| Governing Process | GOV-DEV-001 |
| Scope | Integration of selected package-stop accommodation into GCT package pricing |

## 1. Purpose

This iteration completes the missing integration between APP-003 accommodation selection and APP-005 package pricing.

The required business flow is:

Package
→ Package Stop
→ Selected Accommodation
→ Selected Room
→ Selected Rate
→ Accommodation Pricing Input
→ GCT Package Pricing

APP-005 SHALL consume the selected accommodation information produced by APP-003 and incorporate the supplier accommodation price into the GCT-owned package pricing calculation.

This iteration SHALL connect existing capabilities.

It SHALL NOT redesign the pricing architecture or introduce supplier-specific pricing behaviour.

## 2. Business Requirement

Go Cape Tours sells private multi-day packages.

Each package may contain multiple accommodation stops.

At each stop:

- GCT defines the approved properties;
- APP-008 supplies live accommodation availability;
- the client selects the property;
- the client selects the room;
- the client selects the rate;
- the selected accommodation price becomes an input to the package price.

GCT owns the final customer package price.

The supplier accommodation price is therefore an **input**, not the final customer price.

The implementation SHALL support different accommodation selections and prices at different package stops.

## 3. Architectural Boundary

### APP-003 Journey

APP-003 owns:

- package-stop context;
- accommodation selection;
- room selection;
- rate selection;
- occupancy;
- selection validation;
- production of the pricing projection.

### APP-005 Pricing

APP-005 owns:

- pricing inputs;
- pricing line items;
- accommodation pricing;
- package pricing;
- markups;
- sliding-scale pricing;
- commissions;
- discounts;
- taxes and fees where already defined by the existing pricing architecture;
- final GCT package price.

### APP-004 Reservation

APP-004 consumes the resulting priced package and owns reservation construction and persistence.

### APP-008 Accommodation

APP-008 owns supplier accommodation operations.

APP-005 SHALL NOT:

- call Hotelbeds;
- call accommodation suppliers;
- perform CheckRate;
- perform booking;
- interpret supplier DTOs;
- interpret `rateKey`;
- calculate supplier availability;
- own supplier credentials.

## 4. Scope

### In Scope

- consumption of APP-003 selected accommodation pricing projections;
- ordered package-stop accommodation pricing inputs;
- one accommodation pricing component per applicable package stop;
- preservation of selected property, room and rate identity;
- supplier accommodation amount;
- supplier currency;
- pricing basis;
- multi-room occupancy;
- accommodation pricing integration into the existing APP-005 pricing engine;
- GCT package pricing calculation using accommodation inputs;
- focused tests;
- regression verification.

### Out of Scope

- APP-003 accommodation selection redesign;
- APP-004 reservation implementation;
- APP-008 supplier operations;
- Hotelbeds API changes;
- CheckRate;
- accommodation booking;
- cancellation;
- modification;
- booking retrieval;
- payment;
- voucher/document generation;
- database redesign;
- Prisma schema changes;
- new pricing rules not already established by APP-005;
- lint-warning cleanup unrelated to this implementation.

## 5. Canonical Accommodation Pricing Input

APP-005 SHALL consume a supplier-neutral accommodation pricing input derived from the selected APP-003 accommodation option.

The pricing input SHALL identify:

- package stop;
- accommodation;
- room;
- rate;
- occupancy;
- supplier/provider where required;
- supplier-neutral offer reference where required;
- supplier accommodation amount;
- currency;
- pricing basis.

The existing APP-003 pricing projection SHALL be reused where its semantics satisfy this specification.

Do not create a second competing accommodation pricing model if an existing canonical model can be extended safely.

## 6. Package Stop Association

Every accommodation pricing component SHALL be associated with exactly one package stop.

The implementation SHALL preserve:

- package identity;
- stop identity;
- stop order.

The same accommodation property MAY occur at multiple stops.

Those occurrences SHALL remain separate pricing components because their:

- dates;
- occupancy;
- room selection;
- rate selection;
- supplier price;

may differ.

Accommodation identity alone SHALL NOT be used as the pricing aggregation key.

## 7. Multi-Stop Pricing

APP-005 SHALL support an ordered collection of accommodation pricing inputs.

Conceptually:

Package
→ Stop 1 → Accommodation Pricing
→ Stop 2 → Accommodation Pricing
→ Stop 3 → Accommodation Pricing

Each stop SHALL contribute its own selected accommodation pricing input.

The pricing engine SHALL not replace one accommodation component with another merely because the accommodation identifier is the same.

A package with three accommodation stops SHALL be capable of receiving three independent accommodation pricing components.

## 8. Property, Room and Rate Preservation

The pricing input SHALL retain sufficient selection context to identify:

Accommodation
→ Room
→ Rate

The pricing calculation MAY use only the monetary information required for calculation, but the originating selection identity SHALL remain available in the pricing component or its associated metadata.

This is required so that the resulting price remains traceable to the client's selection.

APP-005 SHALL NOT flatten the selected rate into an untraceable numeric amount.

## 9. Supplier Price Semantics

The supplier accommodation price SHALL be treated as a pricing input.

The implementation SHALL preserve:

- amount;
- currency;
- pricing basis.

The supplier price SHALL NOT automatically become:

- the GCT customer price;
- the package total;
- the package selling price.

The existing APP-005 pricing rules remain authoritative for deriving the customer-facing package price.

## 10. Currency

The accommodation pricing input SHALL preserve the supplier-provided currency according to the existing canonical pricing model.

Do not introduce a second currency model.

If the existing APP-005 pricing architecture requires currency conversion before aggregation, use the existing pricing conversion mechanism.

If no such mechanism exists, do not invent one as part of this iteration.

Instead, preserve the supplier currency and report the limitation if it prevents the existing pricing engine from accepting the accommodation component.

## 11. Pricing Basis

The pricing input SHALL preserve the established accommodation pricing basis.

The implementation SHALL NOT silently reinterpret:

- total-stay pricing;
- per-room pricing;
- per-night pricing;
- per-person pricing.

The existing APP-008 canonical accommodation pricing semantics SHALL remain authoritative.

APP-005 SHALL convert or aggregate the accommodation input only according to existing pricing rules.

If a required conversion rule does not exist, stop and report the architectural gap rather than inventing a new commercial rule.

## 12. Occupancy

The pricing input SHALL preserve the selected accommodation occupancy.

This includes:

- ordered room groups;
- adults per room;
- children per room;
- child ages.

Multi-room occupancy SHALL NOT be collapsed into a scalar room count when doing so loses pricing-relevant information.

The pricing engine SHALL receive sufficient information to apply existing pricing rules correctly.

If the existing pricing engine does not currently use occupancy, preserve it in the pricing component without inventing new occupancy-based commercial rules.

## 13. Accommodation Pricing Component

Where the existing APP-005 pricing model supports pricing components or line items, accommodation SHALL be represented as an accommodation-specific component using the established model.

The component SHALL retain, directly or through metadata/reference:

- package stop;
- accommodation;
- room;
- rate;
- supplier/provider;
- supplier reference where required;
- supplier amount;
- currency;
- pricing basis;
- occupancy.

Do not create an accommodation-specific parallel pricing engine.

## 14. GCT Pricing Ownership

APP-005 remains the sole owner of the GCT package price.

The pricing flow SHALL remain conceptually:

Supplier Accommodation Price
→ Accommodation Pricing Input
→ Existing GCT Pricing Rules
→ GCT Package Price

The implementation SHALL not move:

- markup rules into APP-003;
- package pricing into APP-008;
- final customer price calculation into Journey.

## 15. Sliding-Scale Pricing

GCT uses a sliding-scale pricing model.

This iteration SHALL preserve the existing APP-005 sliding-scale implementation.

The accommodation integration SHALL provide accommodation pricing as an input to that existing model.

Do not redesign the sliding-scale algorithm.

Do not create accommodation-specific sliding-scale rules.

If the existing pricing implementation requires an additional adapter or mapping layer to accept accommodation inputs, implement the smallest compatible integration.

## 16. Pricing Traceability

The resulting package price SHALL remain traceable to the accommodation selections that contributed to it.

At minimum, the implementation SHALL be capable of identifying:

- which stop was priced;
- which accommodation was selected;
- which room was selected;
- which rate was selected;
- which supplier amount was used.

This traceability SHALL be maintained without exposing supplier-specific DTOs through APP-005.

## 17. Selection Completeness

APP-005 SHALL only price accommodation selections that have passed APP-003 validation.

APP-005 SHALL not:

- select another property;
- select another room;
- select another rate;
- silently substitute unavailable accommodation.

An incomplete accommodation selection SHALL produce the established canonical validation/error behaviour.

## 18. Availability State

APP-005 SHALL not treat `NO_AVAILABILITY` as a valid accommodation pricing input.

A selected accommodation pricing input must originate from a valid selectable accommodation option.

A supplier failure SHALL not be converted into a zero-price accommodation component.

A missing price SHALL not be interpreted as zero.

## 19. Recheck State

APP-005 SHALL preserve the distinction between a selected `BOOKABLE` rate and a selected `RECHECK` rate.

APP-005 SHALL NOT perform revalidation.

For a selected `RECHECK` rate, the pricing input SHALL retain sufficient context for downstream APP-004/APP-008 processing to revalidate before booking.

If revalidation later changes the supplier accommodation price, APP-005 SHALL be capable of receiving the updated pricing input through the established pricing workflow.

This iteration does not redesign the APP-008.4 revalidation contract.

## 20. Pricing Request Construction

The implementation SHALL provide the missing production mapping:

APP-003 selected accommodation
→ APP-005 pricing request
→ existing pricing engine

The mapping SHALL create one accommodation pricing component for each applicable selected package stop.

The mapper SHALL preserve:

- stop;
- property;
- room;
- rate;
- occupancy;
- supplier amount;
- currency;
- pricing basis;
- supplier/provider context where required.

## 21. Existing Pricing Engine

The existing APP-005 pricing engine SHALL remain authoritative.

Do not replace or duplicate:

- calculators;
- pricing policies;
- aggregates;
- quote services;
- pricing validation;
- totals calculation.

Only provide the missing accommodation input integration.

If the current pricing engine expects a different established input structure, create an adapter from the APP-003 pricing projection to that structure.

## 22. Package-Level Aggregation

The implementation SHALL support multiple accommodation components contributing to one package price.

Conceptually:

Package Base Components
+
Accommodation Stop 1
+
Accommodation Stop 2
+
Accommodation Stop 3
+
Existing Pricing Adjustments
=
GCT Package Price

The exact calculation remains governed by the existing APP-005 pricing rules.

Do not assume accommodation is necessarily additive if existing pricing rules specify another treatment.

## 23. Existing Consumers

Inspect the current APP-005 callers before implementation.

The implementation SHALL preserve existing pricing behaviour for consumers that do not yet supply accommodation pricing.

Do not break existing pricing requests merely to support APP-003.

The new accommodation integration SHALL be additive or minimally compatible with the existing canonical pricing contract.

## 24. APP-003 Boundary

APP-003 SHALL provide selection information.

APP-003 SHALL NOT:

- calculate package price;
- calculate markup;
- apply commissions;
- apply discounts;
- calculate final customer price.

If APP-003 currently contains a `pricingInput`, APP-005 SHALL consume it rather than moving pricing logic into Journey.

## 25. APP-004 Boundary

This iteration SHALL stop at the APP-005 pricing boundary.

APP-004 reservation integration is the next planned dependency iteration.

APP-005 SHALL produce the information required for APP-004 to consume the priced package without implementing reservation persistence in this iteration.

Do not modify APP-004 unless a minimal compatibility change is demonstrably required to expose the existing pricing result.

If such a change is required, report it explicitly.

## 26. Supplier Neutrality

APP-005 SHALL remain supplier-neutral.

Hotelbeds concepts SHALL NOT appear in:

- pricing engine contracts;
- pricing calculators;
- pricing policies;
- package pricing models.

Hotelbeds-specific information must already have been translated by APP-008.

Provider identity MAY remain as canonical metadata where required for traceability.

## 27. Multiple Suppliers

The pricing architecture SHALL support accommodation selections originating from different suppliers.

A package may contain:

Stop 1 → Supplier A
Stop 2 → Supplier B
Stop 3 → Supplier A

Each selected accommodation pricing input SHALL retain the provider context required for traceability.

The pricing engine SHALL not contain supplier-specific logic.

## 28. Error Handling

The implementation SHALL use existing canonical application error patterns.

At minimum handle:

- missing stop context;
- missing accommodation selection;
- missing room selection;
- missing rate selection;
- missing price;
- invalid currency;
- invalid pricing basis;
- invalid occupancy;
- duplicate stop pricing input where uniqueness is required.

Do not introduce supplier-specific error types into APP-005.

## 29. Idempotency / Recalculation

Pricing SHALL be deterministic for the same:

- package;
- selected accommodation options;
- pricing inputs;
- pricing rules;
- applicable commercial context.

Repeated construction of the same package pricing request SHALL not duplicate accommodation components unintentionally.

A package stop SHALL not receive two accommodation pricing components merely because the pricing operation was invoked twice.

Use existing APP-005 recalculation/idempotency conventions where they exist.

Do not introduce a new persistence-based idempotency mechanism.

## 30. Persistence

No new database or Prisma model is required by this specification.

Do not persist accommodation pricing separately merely to implement this integration.

Use the existing APP-005 pricing model and existing package/reservation structures.

If existing persistence is required by the current pricing architecture, use it without redesign.

## 31. Required Tests

Focused tests SHALL cover at least:

1. one selected accommodation produces one accommodation pricing component;
2. selected property is preserved;
3. selected room is preserved;
4. selected rate is preserved;
5. package stop identity is preserved;
6. multiple package stops produce independent accommodation pricing components;
7. the same accommodation at two different stops remains two distinct components;
8. multi-room occupancy is preserved;
9. child ages are preserved;
10. supplier amount is preserved;
11. supplier currency is preserved;
12. pricing basis is preserved;
13. supplier/provider context is preserved where required;
14. `NO_AVAILABILITY` cannot become a pricing component;
15. missing price cannot become zero;
16. invalid selection cannot enter pricing;
17. BOOKABLE rate remains identifiable;
18. RECHECK rate remains identifiable;
19. existing APP-005 pricing behaviour remains unchanged for existing consumers;
20. repeated pricing construction does not duplicate accommodation components.

## 32. Verification

Copilot SHALL run:

- focused APP-005 accommodation integration tests;
- relevant APP-003 tests;
- full Jest regression;
- `npm run build`;
- `npx prisma validate`;
- `npm run lint`.

No live Hotelbeds calls SHALL be made.

No database changes SHALL be made.

No Prisma schema changes SHALL be made.

Existing lint warnings SHALL be reported.

Do not expand this iteration into warning remediation.

## 33. Acceptance Criteria

### AC-01 — Accommodation Input

APP-005 accepts the selected accommodation pricing input from APP-003.

### AC-02 — Stop Association

Each accommodation pricing component is associated with the correct package stop.

### AC-03 — Property Preservation

The selected accommodation remains identifiable.

### AC-04 — Room Preservation

The selected room remains identifiable.

### AC-05 — Rate Preservation

The selected rate remains identifiable.

### AC-06 — Multi-Stop

Multiple accommodation stops can contribute independently to one package price.

### AC-07 — Multi-Room

Independent room occupancy remains available to pricing.

### AC-08 — Supplier Price

Supplier accommodation amount, currency and pricing basis are preserved.

### AC-09 — GCT Pricing

The supplier accommodation price is incorporated through the existing GCT pricing engine.

### AC-10 — Pricing Ownership

The final package price remains owned by APP-005.

### AC-11 — Supplier Neutrality

No Hotelbeds-specific concept enters the pricing model.

### AC-12 — Recheck Continuity

RECHECK selections retain sufficient context for downstream revalidation.

### AC-13 — No Fabricated Price

Unavailable or missing accommodation pricing cannot become a zero-price component.

### AC-14 — Existing Behaviour

Existing APP-005 pricing behaviour remains compatible.

### AC-15 — Deterministic Recalculation

Repeated construction of the same package pricing request does not duplicate accommodation components.

### AC-16 — Regression

Focused tests, full regression, build, Prisma validation and lint complete successfully.

## 34. Implementation Constraints

1. Use the existing APP-005 pricing architecture.
2. Use the existing APP-003 pricing projection where suitable.
3. Do not create a second pricing engine.
4. Do not move pricing logic into Journey.
5. Do not move supplier logic into Pricing.
6. Do not modify APP-008 supplier behaviour.
7. Do not introduce Hotelbeds DTOs into Pricing.
8. Do not redesign GCT pricing rules.
9. Do not redesign sliding-scale pricing.
10. Do not implement reservation persistence.
11. Do not implement payment.
12. Do not implement documents.
13. Do not create database or Prisma changes unless an existing canonical contract explicitly requires them.
14. Do not fix unrelated lint warnings.
15. Do not refactor unrelated technical debt.
16. Preserve all existing APP-005 consumers.

## 35. Definition of Done

This iteration is complete when:

- APP-003 selected accommodation can be converted into APP-005 pricing input;
- each applicable package stop contributes its selected accommodation pricing input;
- Property → Room → Rate remains traceable;
- multi-room occupancy remains preserved;
- supplier amount/currency/pricing basis remains preserved;
- APP-005 incorporates accommodation pricing using its existing pricing architecture;
- GCT remains the owner of final package pricing;
- no supplier-specific logic enters APP-005;
- focused tests pass;
- full regression passes;
- build passes;
- Prisma validation passes;
- lint has zero errors;
- no unrelated functionality has been changed.

## 36. Final Instruction to Copilot

Implement APP-005 accommodation-to-package pricing integration as specified above.

Before changing code:

1. Read GOV-DEV-001.
2. Read the authoritative APP-003 and APP-005 specifications.
3. Inspect the existing APP-003 pricing projection.
4. Inspect the existing APP-005 pricing engine and its callers.
5. Trace the actual current integration boundary.
6. Use the existing architecture and repository conventions.

Use your implementation expertise to determine the smallest compatible implementation required to make the specification operational.

Do not wait for an additional architecture-review step.

If an implementation detail is not explicitly specified, make the smallest compatible decision consistent with the existing architecture and documentation.

If you discover a genuine architectural contradiction that prevents implementation, stop before redesigning the architecture and report it.

After implementation, perform the required verification and provide the standard Copilot implementation report.

The report SHALL include:

- files changed;
- implementation summary;
- focused test results;
- full regression result;
- build result;
- Prisma validation result;
- lint result;
- warning count and comparison with the previous 156-warning baseline;
- confirmation of database/Prisma changes;
- confirmation of Hotelbeds calls;
- any implementation decisions made within the specification's boundaries.