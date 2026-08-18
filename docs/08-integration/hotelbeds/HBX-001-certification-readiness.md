# HBX-001 — Hotelbeds Certification Readiness

## 1. Document Control

| Field                 | Value                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------ |
| Document ID           | HBX-001                                                                                    |
| Title                 | Hotelbeds Certification Readiness                                                          |
| Version               | 1.0                                                                                        |
| Status                | Active                                                                                     |
| Owner                 | Go Cape Tours / GCT Core                                                                   |
| Integration           | Hotelbeds Hotels                                                                           |
| Supplier              | Hotelbeds / HBX Group                                                                      |
| Repository Path       | `docs/08-integration/hotelbeds/HBX-001-certification-readiness.md`                         |
| Certification Target  | Hotelbeds Hotels API                                                                       |
| Planned Certification | Before GCT Core production go-live                                                         |
| Primary Source        | Hotelbeds Certification Process                                                            |
| Source URL            | https://developer.hotelbeds.com/documentation/hotels/knowledge-base/certification-process/ |

---

# 2. Purpose

This document defines the GCT Core readiness requirements, evidence and release controls required before requesting Hotelbeds certification and subsequently enabling the Hotelbeds integration in the production environment.

It is a **supplier certification control document**, not an additional architecture specification.

The document provides:

* the Hotelbeds certification requirements applicable to GCT Core;
* GCT Core commercial and integration decisions;
* implementation status;
* verification evidence;
* certification submission requirements;
* live-environment release controls.

Hotelbeds states that its certification process is intended to verify that the integration is correctly implemented, that mandatory information is handled correctly, and that API usage does not create incorrect or misleading customer outcomes.

---

# 3. Certification Authority

Hotelbeds' published Certification Process is the authoritative external requirement for this document.

The current Hotelbeds certification process evaluates:

1. Technical implementation
2. Workflow
3. Availability / CheckRate / Confirmation
4. Voucher
5. Content
6. Live environment

Hotelbeds instructs integrators to review these areas before requesting certification.

Certification requests are submitted to:

```text
apitude@hotelbeds.com
```

The current Hotelbeds documentation requires the certification request to include relevant workflow information, commercial decisions, certification URL/access, payment information where applicable, language information where required, and information necessary to identify HBX Group product where multiple suppliers are integrated.

---

# 4. Scope

HBX-001 applies to the GCT Core Hotelbeds Hotels integration.

The certification scope includes:

```text
Hotelbeds Content API
        ↓
Hotelbeds Availability
        ↓
CheckRate where required
        ↓
Booking Confirmation
        ↓
Cancellation
        ↓
Voucher
```

It also includes:

* hotel content presentation;
* accommodation selection;
* supplier filtering;
* rate information;
* cancellation information;
* customer-facing booking information;
* live-environment certification;
* resilience to non-breaking API changes.

---

# 5. GCT Core Hotelbeds Commercial Model

GCT Core does not expose the complete Hotelbeds hotel portfolio.

GCT Core maintains a curated accommodation catalogue containing the approved Hotelbeds properties selected by Go Cape Tours.

Current catalogue:

```text
Active hotels: 340
```

The catalogue contains GCT-owned:

```text
starGrading
```

and Hotelbeds-owned:

```text
hotelCode
destinationCode
zoneCode
zoneName
```

Hotelbeds Content API provides supplier content independently of the GCT commercial classification.

---

# 6. GCT Star Grading

`starGrading` is a GCT Core commercial classification.

It MUST NOT be represented as a direct equivalent of Hotelbeds `categoryCode`, `categoryName`, or supplier category type.

The distinction is:

```text
GCT Hotel Catalogue
    starGrading
        ↓
GCT commercial/package filtering

Hotelbeds Hotel Content
    category
        ↓
Supplier-provided hotel classification
```

Hotelbeds certification includes verification of category types and category values where these are displayed. GCT Core must therefore preserve the distinction between supplier category information and GCT commercial classification.

---

# 7. Accommodation Selection Modes

GCT Core supports two accommodation-selection modes.

## 7.1 Explicit Hotel-Code Selection

Used for existing curated package tours.

Example:

```text
Overnight Stop
    ├── Hotel Code A
    ├── Hotel Code B
    ├── Hotel Code C
    └── Hotel Code D
```

The package explicitly identifies the eligible Hotelbeds properties.

## 7.2 Attribute-Based Selection

Used for on-demand package construction.

The candidate catalogue is filtered using:

```text
destinationCode
zoneCode
starGrading
```

The resulting Hotelbeds hotel codes are then submitted to live Hotelbeds Availability.

The two modes share the same curated hotel catalogue.

---

# 8. Hotelbeds Catalogue Boundary

Hotelbeds content synchronization MUST only process active `HotelCatalogueEntry` records.

The production synchronizer MUST NOT:

* perform unrestricted destination imports;
* discover and automatically add new Hotelbeds hotels;
* use the complete Hotelbeds hotel portfolio;
* use a static `.env` list as the production catalogue boundary.

The database catalogue is the authoritative GCT selection boundary.

---

# 9. Certification Status Model

Use the following status values:

| Status        | Meaning                                                            |
| ------------- | ------------------------------------------------------------------ |
| `NOT_STARTED` | Requirement not yet assessed                                       |
| `IN_PROGRESS` | Implementation or verification underway                            |
| `PASS`        | Internally verified                                                |
| `CONDITIONAL` | Works but requires documented commercial/certification explanation |
| `N/A`         | Not applicable and documented                                      |
| `BLOCKED`     | Prevents certification readiness                                   |

No Hotelbeds certification request may be submitted while a mandatory applicable requirement is `BLOCKED`.

---

# 10. Certification Matrix

## 10.1 Technical

| ID           | Requirement                         | GCT Core Control                                    | Status        | Evidence |
| ------------ | ----------------------------------- | --------------------------------------------------- | ------------- | -------- |
| HBX-TECH-001 | Correct API configuration           | Hotelbeds provider configuration                    | `IN_PROGRESS` |          |
| HBX-TECH-002 | GZIP usage                          | HTTP client/provider configuration                  | `IN_PROGRESS` |          |
| HBX-TECH-003 | Supplier authentication             | Hotelbeds credentials via environment configuration | `IN_PROGRESS` |          |
| HBX-TECH-004 | Robust response handling            | Provider gateway                                    | `IN_PROGRESS` |          |
| HBX-TECH-005 | Non-breaking response compatibility | Tolerant response mapping                           | `IN_PROGRESS` |          |

Hotelbeds states that technical certification reviews request configuration and GZIP compression.

---

# 11. Booking Workflow

The canonical Hotelbeds booking workflow is:

```text
Availability
    ↓
CheckRate
    ↓
Booking
```

CheckRate is only required when the selected rate has:

```text
rateType = RECHECK
```

A `BOOKABLE` rate may proceed directly to Booking.

GCT Core MUST NOT repeat Availability between CheckRate and Booking merely to refresh the same search.

Hotelbeds specifically identifies repeated Availability calls before CheckRate and Booking as an incorrect workflow.

| ID         | Requirement                                              | Status        | Evidence |
| ---------- | -------------------------------------------------------- | ------------- | -------- |
| HBX-WF-001 | Availability is first booking operation                  | `IN_PROGRESS` |          |
| HBX-WF-002 | CheckRate only for `RECHECK` rates                       | `IN_PROGRESS` |          |
| HBX-WF-003 | `BOOKABLE` rates can proceed to Booking                  | `IN_PROGRESS` |          |
| HBX-WF-004 | No repeated Availability before CheckRate                | `IN_PROGRESS` |          |
| HBX-WF-005 | No repeated Availability before Booking                  | `IN_PROGRESS` |          |
| HBX-WF-006 | All rooms requested for booking included in Availability | `IN_PROGRESS` |          |
| HBX-WF-007 | Multiple rates can be grouped into CheckRate requests    | `IN_PROGRESS` |          |

Hotelbeds permits up to 10 rates in a CheckRate request.

---

# 12. Availability

Hotelbeds certification requires correct availability handling and checks that the system presents the relevant product information.

GCT Core MUST support:

* check-in date;
* check-out date;
* hotel candidates;
* number of rooms;
* passengers/occupancy;
* room types;
* board types;
* rates;
* hotel category information where displayed;
* pagination where applicable.

Hotelbeds states that up to 2,000 hotels may be requested in a single Availability call and recommends requesting as many hotels as possible within that limit.

Therefore:

```text
Content synchronization batch size
≠
Availability request size
```

The content importer may use controlled batches of 50, while Availability should group eligible hotels efficiently within Hotelbeds' limits.

| ID         | Requirement                                           | Status        | Evidence |
| ---------- | ----------------------------------------------------- | ------------- | -------- |
| HBX-AV-001 | Correct dates                                         | `IN_PROGRESS` |          |
| HBX-AV-002 | Correct hotel candidates                              | `IN_PROGRESS` |          |
| HBX-AV-003 | Occupancy represented correctly                       | `IN_PROGRESS` |          |
| HBX-AV-004 | Multiple rooms supported where applicable             | `IN_PROGRESS` |          |
| HBX-AV-005 | All required rooms included in same Availability call | `IN_PROGRESS` |          |
| HBX-AV-006 | Maximum 2,000 hotels/call respected                   | `IN_PROGRESS` |          |
| HBX-AV-007 | Product information displayed correctly               | `IN_PROGRESS` |          |
| HBX-AV-008 | Pagination correctly implemented where applicable     | `IN_PROGRESS` |          |

---

# 13. Passenger and Child Handling

Passenger selection is not mandatory according to Hotelbeds, but if implemented it must be correctly represented.

If children are supported:

```text
children
    +
child age
```

MUST be supplied to Hotelbeds.

If multiple occupancy groups have different child ages, they should be represented as separate occupancy nodes as required by the Hotelbeds API.

Hotelbeds explicitly states that when a system implements children, their ages must be supplied.

| ID          | Requirement                         | Status        |
| ----------- | ----------------------------------- | ------------- |
| HBX-PAX-001 | Adult occupancy correct             | `IN_PROGRESS` |
| HBX-PAX-002 | Children supported if exposed       | `IN_PROGRESS` |
| HBX-PAX-003 | Child ages supplied                 | `IN_PROGRESS` |
| HBX-PAX-004 | Multiple occupancy groups supported | `IN_PROGRESS` |

---

# 14. Source Market

If GCT Core uses Hotelbeds `sourceMarket`, the returned prices MUST only be presented to the corresponding source market.

GCT Core must not display prices obtained for one source market to another market.

Decision:

```text
Source Market Usage
Status: TO BE CONFIRMED
```

Before certification, explicitly decide whether GCT Core will:

1. use source-market pricing; or
2. not use source-market pricing.

If not used, record this as a documented commercial/integration decision for Hotelbeds.

Hotelbeds certification checks source-market usage where implemented.

---

# 15. Opaque Rates

GCT Core MUST NOT use opaque rates unless they are genuinely part of a package containing additional products where the final price cannot be determined independently.

Current decision:

```text
Opaque Rates
Status: NOT PLANNED unless package pricing requires them
```

If implemented, certification must verify correct use.

Hotelbeds states that opaque rates are intended for combinations such as flights, transfers or car rental where the price cannot be determined independently.

---

# 16. Availability Filters

GCT Core will implement its own accommodation candidate filtering:

```text
destinationCode
zoneCode
starGrading
```

These are GCT catalogue filters.

They are not substitutes for Hotelbeds Availability filters.

Hotelbeds provides additional Availability filters. Implemented supplier filters will be tested during certification; implementing every available Hotelbeds filter is not mandatory.

The final list of Hotelbeds Availability filters exposed by GCT Core must be documented before certification.

---

# 17. Cancellation Policies

Hotelbeds provides cancellation policies in Availability responses.

GCT Core must decide whether these policies are:

* displayed to customers;
* applied to booking workflows;
* both;
* or intentionally not used.

If GCT Core uses Hotelbeds cancellation policies, their implementation must be verified.

The cancellation policy time calculations are based on the booking destination's relevant dates/times, not the customer's local timezone.

Current status:

```text
HBX-CAN-001
Cancellation policy implementation
Status: IN_PROGRESS
```

---

# 18. Rate Comments / Contact Remarks

GCT Core MUST preserve and display applicable rate comments/contact remarks before confirmation where this information is used.

Hotelbeds provides `rateCommentsId` in Availability and rate comments can be resolved through Content API or CheckRate.

For `RECHECK` rates, CheckRate may provide the relevant rate comments.

| ID         | Requirement                                     | Status        |
| ---------- | ----------------------------------------------- | ------------- |
| HBX-RC-001 | Preserve `rateCommentsId`                       | `IN_PROGRESS` |
| HBX-RC-002 | Resolve rate comments                           | `IN_PROGRESS` |
| HBX-RC-003 | Display applicable comments before confirmation | `IN_PROGRESS` |
| HBX-RC-004 | Handle RECHECK rate comments correctly          | `IN_PROGRESS` |

---

# 19. Booking Confirmation Timeout

The Hotelbeds Booking Confirmation response timeout MUST be configured to at least:

```text
60 seconds
```

This is a certification requirement.

Status:

```text
HBX-BOOK-001
Booking timeout >= 60 seconds
Status: IN_PROGRESS
```

Hotelbeds explicitly specifies a minimum 60-second Booking Confirmation response timeout.

---

# 20. Recommended Selling Price

If GCT Core uses Hotelbeds selling rates, the implementation must correctly respect the `hotelMandatory`/selling-price information where applicable.

This is a certification consideration rather than a blanket requirement to implement every selling-price option.

Status:

```text
HBX-PRICE-001
Status: TO BE CONFIRMED
```

---

# 21. Voucher

For every confirmed Hotelbeds reservation, GCT Core MUST generate and make available a customer voucher.

Hotelbeds states that vouchers are mandatory for confirmed reservations.

## 21.1 Hotel Information

Voucher must include:

* hotel name — mandatory;
* hotel address — mandatory;
* hotel category — recommended;
* destination name — recommended;
* hotel phone — recommended.

## 21.2 Passenger Information

Voucher must include:

* lead passenger / holder name;
* at least one passenger name per room;
* children's ages when children are present.

## 21.3 Booking Information

Voucher must include:

* Hotelbeds booking reference;
* agency reference where used;
* check-in date;
* check-out date;
* room type;
* board type;
* applicable rate comments.

Hotelbeds identifies the booking reference, dates, room type and board type as mandatory voucher information, with rate comments mandatory where applicable.

## 21.4 Payment Information

The voucher must use the appropriate Hotelbeds-required supplier/payment wording where applicable.

The exact commercial/legal values must be populated before certification.

| ID          | Requirement                               | Status        |
| ----------- | ----------------------------------------- | ------------- |
| HBX-VCH-001 | Voucher generated after confirmed booking | `IN_PROGRESS` |
| HBX-VCH-002 | Hotel name                                | `IN_PROGRESS` |
| HBX-VCH-003 | Hotel address                             | `IN_PROGRESS` |
| HBX-VCH-004 | Holder name                               | `IN_PROGRESS` |
| HBX-VCH-005 | Passenger information                     | `IN_PROGRESS` |
| HBX-VCH-006 | Child ages where applicable               | `IN_PROGRESS` |
| HBX-VCH-007 | Hotelbeds booking reference               | `IN_PROGRESS` |
| HBX-VCH-008 | Check-in/out                              | `IN_PROGRESS` |
| HBX-VCH-009 | Room type                                 | `IN_PROGRESS` |
| HBX-VCH-010 | Board type                                | `IN_PROGRESS` |
| HBX-VCH-011 | Rate comments where applicable            | `IN_PROGRESS` |

---

# 22. Content API

GCT Core uses Hotelbeds Content API to populate persistent hotel content.

Hotelbeds states that Content API information used by the integration must be stored in the integrating system and recommends updating the database at least weekly.

GCT Core implementation:

```text
Hotelbeds Content API
        ↓
HotelContent
        ↓
GCT Core application
```

The current GCT catalogue boundary contains:

```text
340 selected hotels
```

Content synchronization is therefore restricted to these properties.

---

# 23. Content Scope

GCT Core must document which Hotelbeds Content API information is actually used.

Current intended content includes:

* hotel name;
* descriptions;
* category;
* images;
* facilities;
* address;
* destination;
* zone;
* room types;
* board types;
* contract remarks where applicable;
* points of interest where applicable.

Hotelbeds identifies category, images, descriptions, facilities, contract remarks, room types and other content as Content API information that may be used.

---

# 24. Content Category

Hotelbeds Content API supports multiple category types, including:

* stars;
* keys;
* apart-hotel categories;
* other supplier category types.

GCT Core MUST preserve supplier category semantics.

GCT `starGrading` MUST remain separate.

Status:

```text
HBX-CONT-001
Category representation
Status: IN_PROGRESS
```

---

# 25. Images

If Hotelbeds images are displayed, GCT Core must verify:

* correct hotel association;
* correct image mapping;
* image URL handling;
* number of images displayed;
* appropriate image ordering/selection.

Hotelbeds certification checks that displayed images correspond to the correct hotel and asks how many available images the system presents.

Status:

```text
HBX-CONT-002
Images
Status: IN_PROGRESS
```

---

# 26. Facilities

If Hotelbeds facilities are displayed, GCT Core must correctly distinguish:

* facility presence;
* paid facilities;
* mandatory facility indicators;
* payment-related facilities where used.

Hotelbeds provides facility codes, groups, descriptions and indicators such as `indFee` and `indYesOrNo`.

Status:

```text
HBX-CONT-003
Facilities
Status: IN_PROGRESS
```

---

# 27. Crawler

Hotelbeds certification documentation explicitly requires crawler integration according to the Hotelbeds Crawler specification.

This requirement MUST be investigated and implemented or formally clarified with Hotelbeds before certification.

Status:

```text
HBX-CONT-004
Crawler integration
Status: BLOCKED / TO BE ASSESSED
```

This is a certification-critical item and must not be assumed to be satisfied by Content API synchronization alone.

---

# 28. Other Content

Before certification, explicitly decide whether GCT Core displays:

* hotel description;
* contract remarks;
* room types;
* board types;
* points of interest.

Each implemented item must be verified against the corresponding Hotelbeds Content API data.

---

# 29. Content Synchronization

The GCT Core content synchronization process MUST:

* use active `HotelCatalogueEntry` records;
* process selected hotels in controlled batches;
* respect Hotelbeds API limits;
* retry transient failures;
* persist synchronization state;
* support recovery/resume;
* avoid unrestricted imports;
* update existing HotelContent;
* not automatically add new Hotelbeds hotels to the catalogue.

The current initial catalogue contains 340 selected hotels.

The target content synchronization frequency is at least weekly unless Hotelbeds or GCT operational requirements dictate a more frequent schedule.

---

# 30. Multi-Supplier Content

Current GCT Core Hotelbeds accommodation content source:

```text
Hotelbeds / HBX Group
```

If another hotel-content supplier is introduced, the certification document MUST be updated before Hotelbeds certification to explain how Hotelbeds content is isolated and identified.

Hotelbeds requires integrators using multiple suppliers to explain how its own product can be identified during certification.

---

# 31. Live Environment

Live certification is a separate controlled release stage.

Hotelbeds requires a live booking test after certification using the live API credentials.

The documented Hotelbeds live test requires:

* a booking approximately six months in advance;
* 2 adults / 2 children;
* voucher and price sent to Hotelbeds;
* cancellation afterwards;
* no NRF or other cancellation-fee rate selected for the test.

Hotelbeds explicitly warns that live bookings are real and cancellation charges may apply.

---

# 32. Live Booking Gate

No live certification booking may be executed until:

* Hotelbeds certification has been granted;
* live credentials have been supplied;
* the test booking has been explicitly approved;
* a suitable refundable/non-NRF rate has been identified;
* cancellation instructions have been confirmed with Hotelbeds.

Status:

```text
HBX-LIVE-001
Status: NOT_STARTED
```

---

# 33. Live Cancellation

The certification live booking MUST be cancelled after the required verification.

Cancellation MUST be performed in accordance with Hotelbeds' instructions.

The team MUST verify that no cancellation fee is inadvertently incurred.

Status:

```text
HBX-LIVE-002
Status: NOT_STARTED
```

---

# 34. Non-Breaking API Changes

GCT Core must tolerate non-breaking Hotelbeds API changes including:

* additional response fields;
* new endpoints;
* new optional request parameters;
* reordered response properties;
* permitted string format/length changes.

GCT Core MUST NOT rely on rigid schemas that reject otherwise valid additive API changes.

Hotelbeds explicitly requires this resilience as part of live readiness.

Status:

```text
HBX-LIVE-003
Status: IN_PROGRESS
```

---

# 35. Certification Request Package

Before contacting Hotelbeds, prepare:

### Integration Workflow

Document:

```text
Customer/package selection
        ↓
Hotel candidate selection
        ↓
Availability
        ↓
Rate selection
        ↓
CheckRate if RECHECK
        ↓
Booking
        ↓
Voucher
        ↓
Cancellation where applicable
```

### Commercial Decisions

Document:

* curated hotel catalogue;
* direct hotel-code package selection;
* destination/zone/star-grading filtering;
* excluded destinations;
* excluded hotels;
* excluded room types;
* excluded board types;
* excluded supplier categories;
* source-market decisions;
* cancellation-policy decisions;
* any deliberate limitations.

Hotelbeds specifically asks certification requests to disclose commercial decisions that affect availability or booking results.

### Certification Environment

Provide:

* certification URL;
* user;
* password;
* required access information.

### Payment

Provide payment information if required by Hotelbeds.

### Language

Provide a language guide if the certification environment and Hotelbeds communication do not share a common language.

### Supplier Isolation

If additional accommodation suppliers exist by certification time, document how Hotelbeds products are identified.

---

# 36. Evidence Requirements

Every applicable certification requirement must have evidence before submission.

Accepted evidence includes:

* automated test;
* integration test;
* API request/response log;
* database verification;
* application screenshot;
* voucher;
* booking record;
* cancellation record;
* configuration verification;
* Hotelbeds certification response.

Evidence should be referenced in this document or stored in the appropriate test/evidence location.

---

# 37. Internal Certification Test Pack

Before requesting Hotelbeds certification, GCT Core must execute an internal certification test pack covering at minimum:

```text
1. Hotel catalogue selection
2. Attribute-based hotel filtering
3. Explicit hotel-code selection
4. Availability
5. Multiple rooms
6. Multiple occupancies
7. Children
8. Child ages
9. BOOKABLE rate
10. RECHECK rate
11. CheckRate
12. Booking
13. Cancellation
14. Rate comments
15. Cancellation policies
16. Voucher
17. Hotel content
18. Images
19. Facilities
20. Content update
21. Error handling
22. Retry handling
23. Non-breaking response handling
24. Live certification readiness
```

---

# 38. Certification Readiness Gate

The Hotelbeds certification request may only be submitted when:

```text
All mandatory applicable requirements = PASS
No certification-critical item = BLOCKED
Commercial decisions documented
Certification environment available
Workflow documented
Voucher verified
Content verified
Booking workflow verified
Cancellation workflow verified
Crawler requirement resolved
```

---

# 39. Go-Live Gate

Hotelbeds production go-live requires all of the following:

```text
GCT Core development complete
        ↓
Internal certification matrix PASS
        ↓
Certification request submitted
        ↓
Hotelbeds certification approved
        ↓
Live credentials received
        ↓
Controlled live booking
        ↓
Voucher + price supplied
        ↓
Live booking cancelled
        ↓
Live verification PASS
        ↓
GCT Core Hotelbeds GO-LIVE
```

No production Hotelbeds integration may be declared live before this gate is satisfied.

---

# 40. Certification Change Control

Any change to the following after certification must trigger a review of HBX-001:

* Hotelbeds API workflow;
* Availability request structure;
* CheckRate behaviour;
* Booking behaviour;
* cancellation behaviour;
* voucher structure;
* supplier/content source;
* accommodation catalogue rules;
* commercial filtering;
* source market;
* rate handling;
* Hotelbeds content presentation;
* crawler integration.

The purpose is to determine whether re-certification or notification to Hotelbeds is required.

---

# 41. Current Readiness Summary

| Area                           | Status                     |
| ------------------------------ | -------------------------- |
| Curated Hotel Catalogue        | `PASS`                     |
| 340 selected hotel codes       | `PASS`                     |
| GCT Star Grading separation    | `PASS`                     |
| Hotelbeds Content boundary     | `PASS`                     |
| Content initial load           | `IN_PROGRESS`              |
| Content weekly synchronization | `IN_PROGRESS`              |
| Availability                   | `IN_PROGRESS`              |
| CheckRate                      | `IN_PROGRESS`              |
| Booking                        | `IN_PROGRESS`              |
| Cancellation                   | `IN_PROGRESS`              |
| Rate Comments                  | `IN_PROGRESS`              |
| Cancellation Policies          | `IN_PROGRESS`              |
| Voucher                        | `IN_PROGRESS`              |
| Images                         | `IN_PROGRESS`              |
| Facilities                     | `IN_PROGRESS`              |
| Crawler                        | `BLOCKED / TO BE ASSESSED` |
| Non-breaking API handling      | `IN_PROGRESS`              |
| Certification environment      | `NOT_STARTED`              |
| Certification request          | `NOT_STARTED`              |
| Live booking test              | `NOT_STARTED`              |
| Live cancellation test         | `NOT_STARTED`              |

---

# 42. Immediate Actions

The following actions are the current certification-readiness priorities:

1. Complete APP-008.2 content synchronization hardening.
2. Complete the initial 340-property Hotelbeds content load.
3. Complete APP-008.3 Availability.
4. Implement and verify CheckRate.
5. Implement and verify Booking.
6. Implement cancellation.
7. Implement voucher generation.
8. Implement/display applicable rate comments.
9. Implement/display applicable cancellation policies.
10. Verify Hotelbeds content presentation.
11. Assess and resolve the crawler requirement.
12. Verify Booking Confirmation timeout is at least 60 seconds.
13. Verify GZIP usage.
14. Verify non-breaking API response handling.
15. Establish the certification environment.
16. Complete this certification matrix.
17. Prepare the Hotelbeds certification request.
18. Request Hotelbeds certification.
19. Resolve any certification findings.
20. Perform controlled live certification booking and cancellation.
21. Approve production go-live.

---

# 43. External Reference

Authoritative Hotelbeds certification documentation:

https://developer.hotelbeds.com/documentation/hotels/knowledge-base/certification-process/

The external documentation must be rechecked before submitting certification because Hotelbeds may update its requirements.

---

# 44. Final Principle

HBX-001 is a **release control**, not a development milestone.

GCT Core is not Hotelbeds-production-ready merely because the API integration works.

The Hotelbeds integration is production-ready only when:

```text
Implementation
+
Internal verification
+
Certification readiness
+
Hotelbeds certification
+
Controlled live verification
=
GO-LIVE
```

No individual implementation shortcut may bypass this sequence.
