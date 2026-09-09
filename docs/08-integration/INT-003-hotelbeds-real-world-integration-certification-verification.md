# INT-003 — Hotelbeds Real-World Integration & Certification Verification

## 1. Document Control

| Field | Value |
|---|---|
| ID | INT-003 |
| Title | Hotelbeds Real-World Integration & Certification Verification |
| Status | Architect Approved |
| Previous Iteration | INT-002 — Pricing → Reservation → Hotelbeds Booking Handoff |
| Governing Process | `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md` |
| Supplier Governance | `docs/08-integration/hotelbeds/HBX-001-certification-readiness.md` |
| Scope | Controlled Hotelbeds test-environment verification and certification readiness |

---

# 2. Purpose

INT-003 verifies the completed Hotelbeds integration against the real Hotelbeds test environment and establishes the evidence required for formal Hotelbeds certification.

This is primarily a **supplier verification and release-readiness iteration**, not a new application capability.

The target supplier flow is:

    Catalogue
       ↓
    Availability
       ↓
    Selected Rate
       ↓
    CheckRate
    only when RECHECK
       ↓
    Booking
       ↓
    Booking Confirmation
       ↓
    Booking Details / Voucher evidence
       ↓
    Controlled cancellation where required

The GCT commercial flow remains:

    Customer Selection
       ↓
    GCT Pricing
       ↓
    Reservation
       ↓
    Hotelbeds Fulfilment

---

# 3. Governing Documents

The following are authoritative:

- `docs/09-governance/GOV-DEV-001-DEVELOPMENT-PROCESS.md`
- `docs/08-integration/hotelbeds/HBX-001-certification-readiness.md`
- `docs/08-integration/INT-001-JOURNEY-ACCOMMODATION-PRICING-HANDOFF.md`
- `docs/08-integration/INT-002-PRICING-RESERVATION-HOTELBEDS-BOOKING-HANDOFF.md`
- existing APP-008.1 through APP-008.8 specifications.

INT-003 SHALL verify the existing implementation.

It SHALL NOT redesign accepted application capabilities.

---

# 4. Certification Boundary

INT-003 SHALL distinguish three activities:

### A. Automated verification

Normal Jest/typecheck/build/lint verification.

No live Hotelbeds calls.

### B. Controlled test-environment verification

Real Hotelbeds TEST-environment calls using the authorised certification/test credentials.

These calls are explicitly controlled and evidence-producing.

### C. Formal Hotelbeds certification

Submission to Hotelbeds/HBX for their certification process.

INT-003 prepares the system and evidence for this process.

Formal certification approval remains external to GCT Core.

LIVE production booking SHALL NOT be performed automatically as part of normal INT-003 implementation verification.

---

# 5. Objective

INT-003 is complete when GCT Core has demonstrated that the implemented Hotelbeds integration correctly performs the real supplier workflow and has sufficient evidence to request formal certification.

The verification SHALL establish:

1. authentication works;
2. mTLS/security configuration works where required;
3. Availability works;
4. selected Hotelbeds rates are correctly represented;
5. BOOKABLE rates do not receive unnecessary CheckRate;
6. RECHECK rates receive CheckRate;
7. Booking succeeds;
8. supplier booking reference is captured;
9. booking status is captured;
10. booking details can be retrieved where implemented;
11. supplier price remains supplier data;
12. GCT customer price remains authoritative;
13. Reservation fulfilment is updated correctly;
14. no supplier-specific data leaks into canonical GCT contracts;
15. the workflow is suitable for Hotelbeds certification.

---

# 6. Existing Capability Baseline

INT-003 assumes the following are already implemented and accepted:

- Hotelbeds integration foundation;
- Hotelbeds catalogue/content;
- Hotelbeds Availability;
- APP-008.4 CheckRate;
- APP-008.5 Booking;
- APP-008.6 Cancellation;
- APP-008.7 Modification;
- APP-008.8 Booking Details/retrieval;
- INT-001 pricing handoff;
- INT-002 Reservation/booking handoff.

Do not reimplement these capabilities.

If verification exposes a genuine implementation defect, create the minimum corrective change necessary and report it explicitly.

---

# 7. Catalogue Boundary

Hotelbeds Availability SHALL remain downstream of the GCT catalogue boundary.

The catalogue remains authoritative for the commercially selectable property universe.

The Hotelbeds Availability response remains authoritative for:

- current availability;
- rooms;
- rates;
- supplier rate keys;
- supplier rate type;
- supplier pricing;
- supplier cancellation information.

Do not bypass the GCT catalogue by allowing arbitrary Hotelbeds hotel codes into the commercial journey.

---

# 8. Test Environment

Use the Hotelbeds TEST environment for controlled supplier verification.

Credentials SHALL be supplied through the existing secure configuration mechanism.

Do not:

- hard-code credentials;
- commit secrets;
- print secrets;
- place credentials in tests;
- place credentials in browser output;
- place credentials in logs.

If credentials/configuration are unavailable, report the exact blocker.

Do not substitute invented credentials.

---

# 9. Security Verification

Verify the actual configured Hotelbeds transport/security path.

Confirm:

- API key authentication;
- signature generation;
- timestamp handling;
- HTTPS;
- mTLS where required by the current Hotelbeds Hotels API;
- certificate/key loading;
- certificate failure handling.

Do not weaken TLS or bypass certificate verification to make the test pass.

Do not modify security configuration merely for local convenience.

---

# 10. Availability Verification

Execute a controlled real Hotelbeds Availability request using a known valid test scenario.

Verify:

- request reaches Hotelbeds;
- response is successful;
- hotels/rates are returned;
- selected hotel code is correct;
- dates are correct;
- room count is correct;
- adult count is correct;
- child count is correct;
- child ages are correct where applicable;
- rate key is preserved;
- rate type is preserved;
- cancellation policy is preserved;
- supplier price is preserved.

The real response SHALL be traceable to the application-level Availability result.

---

# 11. Availability Efficiency

The booking workflow SHALL NOT repeat Availability unnecessarily.

Required sequence:

    Availability
        ↓
    Selected Rate
        ↓
    CheckRate if RECHECK
        ↓
    Booking

Do NOT implement:

    Availability
        ↓
    Availability
        ↓
    CheckRate
        ↓
    Availability
        ↓
    Booking

The integration SHALL preserve the Hotelbeds-required workflow.

---

# 12. BOOKABLE Verification

Identify a real test-environment rate whose `rateType` is `BOOKABLE`.

Verify:

1. Availability returns the rate;
2. GCT preserves the rate;
3. no CheckRate call is made;
4. Booking is attempted using the selected rate;
5. Hotelbeds returns a booking result;
6. supplier reference is captured;
7. Reservation fulfilment is updated.

The verification SHALL capture evidence that CheckRate was not unnecessarily called.

---

# 13. RECHECK Verification

Identify a real test-environment rate whose `rateType` is `RECHECK`.

Verify:

1. Availability returns the rate;
2. GCT preserves the rate;
3. CheckRate is called;
4. Availability is not repeated;
5. CheckRate returns a valid/current result;
6. the resulting supplier rate is used for booking;
7. Booking is attempted only after successful CheckRate;
8. supplier booking reference is captured;
9. Reservation fulfilment is updated.

---

# 14. CheckRate Failure

Where a controlled test scenario permits safe verification, verify that an unsuccessful CheckRate result:

- does not proceed to Booking;
- does not falsely confirm supplier fulfilment;
- does not falsely confirm the Reservation;
- produces an application-level failure;
- preserves sufficient diagnostic information.

Do not create artificial supplier responses by modifying production supplier code.

Mocks may be used for deterministic automated failure tests.

---

# 15. Booking Verification

Perform a controlled real TEST-environment booking.

Verify:

- correct rate key reaches Hotelbeds;
- correct room/occupancy reaches Hotelbeds;
- correct holder information reaches Hotelbeds;
- correct passenger information reaches Hotelbeds;
- booking response is received;
- supplier booking reference is returned;
- supplier booking status is captured;
- supplier price is captured where returned;
- Reservation fulfilment is updated.

The GCT Reservation number remains distinct from the Hotelbeds booking reference.

---

# 16. Pricing Verification

Verify that supplier pricing does not replace GCT pricing.

The flow SHALL remain:

    Hotelbeds Supplier Price
            ↓
    Supplier Fulfilment Data

while:

    APP-005 GCT Price
            ↓
    Customer Reservation Price

For the deterministic internal journey, the existing GCT quote remains:

`ZAR 18,950`

INT-003 SHALL NOT introduce pricing changes.

---

# 17. Reservation Verification

After a successful controlled booking verify that the persisted Reservation contains:

- Reservation identity;
- Reservation number;
- selected journey;
- selected accommodation;
- selected room;
- selected rate;
- provider;
- supplier booking reference;
- supplier fulfilment status;
- supplier amount where available;
- existing pricing snapshot.

The original customer selection SHALL remain reconstructable.

---

# 18. Supplier Isolation

Verify that:

- Hotelbeds DTOs remain inside APP-008;
- Reservation does not import Hotelbeds models;
- Pricing does not import Hotelbeds models;
- customer-facing View Models do not expose Hotelbeds DTOs;
- supplier errors are mapped before reaching the UI.

No supplier leakage SHALL be introduced.

---

# 19. Booking Details Verification

Where APP-008.8 is available, retrieve the controlled test booking.

Verify:

- booking reference resolves;
- supplier status is returned;
- booking details map correctly;
- Reservation fulfilment remains associated with the correct supplier booking.

Do not create a second booking model.

---

# 20. Voucher / Certification Evidence

Verify that the booking produces the information required by the current HBX-001 certification requirements.

At minimum capture the information necessary to establish:

- supplier booking reference;
- hotel/property;
- room;
- board;
- stay dates;
- holder;
- passengers;
- child ages;
- supplier price;
- cancellation information;
- booking status.

If the current application does not yet generate the required customer voucher/document, record this as a certification-readiness gap.

Do not implement a new Documents capability inside INT-003 unless separately specified.

---

# 21. Content Evidence

Verify the supplier content required for certification is available for the controlled property:

- property name;
- property identifiers;
- category;
- GCT Star Grading where applicable;
- room information;
- board information;
- facilities/amenities;
- relevant images;
- rate comments where supplied.

Do not redesign the content synchronization capability.

If content evidence is incomplete, record the precise HBX-001 gap.

---

# 22. Rate Comments

Where the selected Hotelbeds rate provides rate comments:

- preserve the supplier identifier/content;
- verify the information can be resolved;
- confirm the customer-facing flow does not silently discard required rate comments.

If the current frontend does not yet expose certification-required rate comments, report the gap.

Do not introduce a new UI capability under INT-003 unless separately specified.

---

# 23. Cancellation Test

INT-003 SHALL NOT introduce cancellation functionality.

However, where the Hotelbeds certification scenario requires cancellation of the controlled test booking:

1. use the existing APP-008.6 implementation;
2. perform cancellation only against the controlled TEST booking;
3. capture the supplier cancellation result;
4. verify Reservation fulfilment is not falsely left as confirmed.

Do not perform live cancellation.

---

# 24. Modification Test

Modification is not part of the core INT-003 booking certification path.

Where HBX-001 or Hotelbeds certification specifically requires it:

- use existing APP-008.7;
- verify through a controlled TEST booking;
- do not redesign the modification capability.

Otherwise record modification as outside this iteration's verification scope.

---

# 25. Real-World Evidence

The controlled supplier verification SHALL record:

- test scenario;
- date/time;
- environment;
- hotel code;
- destination;
- stay dates;
- occupancy;
- rate type;
- rate key reference, subject to secret/sensitive-data rules;
- Availability result;
- CheckRate result where applicable;
- Booking result;
- supplier booking reference;
- Booking Details result where applicable;
- cancellation result where applicable.

Do not store credentials or secrets in repository files.

---

# 26. Automated Test Protection

Real Hotelbeds calls SHALL NOT be part of the normal Jest suite.

Automated tests SHALL continue to use:

- mocks;
- stubs;
- controlled transport tests.

The real supplier verification is a separate controlled verification activity.

This preserves deterministic CI/regression behaviour.

---

# 27. Browser Verification

Run the normal customer journey against the real TEST supplier only when a controlled test scenario is available:

    Accommodation Selection
        ↓
    Quote
        ↓
    Guest Information
        ↓
    Reservation Review
        ↓
    Reservation
        ↓
    Hotelbeds Booking
        ↓
    Existing Payment Handoff

Verify at:

- 1280 × 800;
- 375 × 812.

Confirm:

- real supplier property is displayed;
- selected room/rate is correct;
- GCT price remains authoritative;
- booking completes;
- supplier reference is retained;
- no supplier secrets appear;
- no raw supplier errors appear;
- no console errors;
- no unexpected network failures;
- no horizontal overflow.

---

# 28. Certification Readiness

Before requesting formal Hotelbeds certification, verify the HBX-001 checklist and classify every requirement:

- PASS;
- FAIL;
- NOT APPLICABLE;
- BLOCKED.

Every BLOCKED item SHALL identify:

- requirement;
- current application state;
- dependency;
- required future iteration.

Do not mark a requirement PASS without evidence.

---

# 29. Formal Certification Request

INT-003 SHALL prepare the information required for the Hotelbeds certification request, including where applicable:

- integration workflow;
- commercial decisions;
- certification URL;
- credentials/access instructions through the approved secure process;
- payment/test information where required;
- instructions for isolating HBX Group product if multiple suppliers exist;
- known certification considerations.

Do not send the certification request automatically.

The user/business owner controls the external certification request.

---

# 30. LIVE Environment Boundary

INT-003 SHALL NOT perform an uncontrolled LIVE Hotelbeds booking.

A LIVE booking is a real commercial supplier operation.

When Hotelbeds grants LIVE access, a separate controlled release activity SHALL:

- use the approved LIVE credentials;
- use the Hotelbeds-required test scenario;
- capture the booking reference/voucher/price;
- perform the required cancellation;
- verify the cancellation result;
- avoid non-refundable or chargeable test rates unless explicitly authorised.

LIVE verification is a release-control activity, not a normal development test.

---

# 31. Defect Handling

If controlled supplier verification exposes a defect:

### INT-003 defect

Correct only if directly related to the approved INT-003 verification scope.

### Existing capability defect

Record the defect and create the minimum corrective iteration if required.

### HBX-001 readiness gap

Record the gap without inventing a new implementation.

### Hotelbeds environment/data issue

Record the supplier/environment issue separately.

Do not silently change application behaviour to accommodate a temporary supplier-test anomaly.

---

# 32. No Scope Expansion

INT-003 SHALL NOT add:

- new supplier capabilities;
- new pricing rules;
- payment implementation;
- voucher/document implementation;
- communications;
- supplier reconciliation;
- operational administration;
- new database architecture;
- new Reservation models;
- new provider architecture.

Certification evidence SHALL expose gaps.

It SHALL NOT become a vehicle for implementing every certification gap discovered.

---

# 33. Required Verification Report

Copilot SHALL return:

## Automated Verification

- Jest suites/tests;
- typecheck;
- build;
- Prisma generate;
- Prisma validate;
- lint;
- git diff.

## Security

- authentication;
- signature;
- mTLS;
- certificate handling.

## Real Hotelbeds TEST Verification

- Availability;
- BOOKABLE flow;
- RECHECK flow;
- CheckRate;
- Booking;
- Booking Details;
- Cancellation if performed.

## Reservation

- Reservation persistence;
- supplier reference;
- fulfilment state;
- GCT price;
- supplier price.

## Browser

- desktop;
- mobile;
- customer flow;
- console/resources.

## HBX-001

A requirement-by-requirement evidence matrix:

| Requirement | Result | Evidence / Gap |
|---|---|---|
| Technical | PASS/FAIL/BLOCKED | ... |
| Workflow | PASS/FAIL/BLOCKED | ... |
| Availability | PASS/FAIL/BLOCKED | ... |
| CheckRate | PASS/FAIL/BLOCKED | ... |
| Confirmation | PASS/FAIL/BLOCKED | ... |
| Voucher | PASS/FAIL/BLOCKED | ... |
| Content | PASS/FAIL/BLOCKED | ... |
| Live readiness | PASS/FAIL/BLOCKED | ... |

## Defects

List all defects and classify them.

## Certification Recommendation

State one:

- READY TO REQUEST CERTIFICATION;
- READY WITH DOCUMENTED GAPS;
- NOT READY.

Copilot SHALL NOT commit or push.

---

# 34. Definition of Done

INT-003 is complete when:

1. automated regression remains green;
2. Hotelbeds TEST authentication succeeds;
3. required security/mTLS path succeeds;
4. real Availability succeeds;
5. BOOKABLE flow is verified;
6. RECHECK flow is verified;
7. CheckRate is not unnecessarily repeated;
8. real Booking succeeds;
9. supplier reference is captured;
10. Reservation fulfilment is persisted;
11. Booking Details is verified where applicable;
12. controlled cancellation is verified where required;
13. GCT pricing remains authoritative;
14. no supplier leakage exists;
15. browser flow remains functional;
16. HBX-001 evidence is classified;
17. certification blockers are explicitly identified;
18. no new unapproved capability has been implemented.

---

# 35. Acceptance Criteria

| ID | Criterion |
|---|---|
| AC-01 | Real Hotelbeds TEST authentication succeeds |
| AC-02 | Required transport security/mTLS succeeds |
| AC-03 | Real Availability succeeds |
| AC-04 | BOOKABLE rate can proceed without CheckRate |
| AC-05 | RECHECK rate passes through CheckRate |
| AC-06 | Availability is not unnecessarily repeated |
| AC-07 | Real Booking succeeds |
| AC-08 | Supplier booking reference is captured |
| AC-09 | Reservation fulfilment is persisted |
| AC-10 | GCT customer price remains authoritative |
| AC-11 | Supplier price remains supplier data |
| AC-12 | Booking Details works where implemented |
| AC-13 | Controlled cancellation works where required |
| AC-14 | No supplier DTO leakage exists |
| AC-15 | Browser customer journey remains functional |
| AC-16 | No credentials/secrets are exposed |
| AC-17 | HBX-001 evidence is complete or every gap is explicitly documented |
| AC-18 | No unapproved capability has been introduced |
| AC-19 | Automated regression remains green |
| AC-20 | Certification readiness can be objectively classified |

---

# 36. Architect Approval

This specification is **Architect Approved**.

The approved intent is deliberately limited to:

    Existing GCT Hotelbeds Integration
                ↓
    Controlled Real Supplier Verification
                ↓
    HBX-001 Evidence
                ↓
    Certification Readiness
                ↓
    External Hotelbeds Certification Request

Formal LIVE certification remains a controlled release activity.

No new application architecture is authorised by INT-003.

# End of Specification