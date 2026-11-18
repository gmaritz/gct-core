import {
  Currency,
  createMoney,
  createPricingBreakdown,
  createPricingLineItem,
  createPricingMetadata,
  createPricingSummary,
  createPricingTotal,
  createTaxBreakdown,
  Pricing,
  createPricingEngineResult,
} from "../../../pricing";
import { Journey, JourneyLifecycle, JourneyStatus } from "../../../journeys";
import {
  calculateSignatureCapeWinelandsInitialPaymentRequirement,
  CalculateSignatureCapeWinelandsInitialPaymentInput,
  GctCostingSource,
  InitialPaymentCalculationError,
} from "./signature-cape-winelands-initial-payment-calculator";
import {
  resolveSignatureCapeWinelandsPaymentPolicy,
  ResolvedSignatureCapeWinelandsPaymentPolicy,
  SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICIES,
  SignatureCapeWinelandsPaymentPolicyRecord,
} from "./signature-cape-winelands-payment-policy";
import { JourneyQuoteResult } from "./journey-quote-service";
import { CAPE_WINELANDS_JOURNEY_ID, CAPE_WINELANDS_STOPS } from "./cape-winelands-journey-resolver";

const defaultBookingDate = new Date("2026-12-01T10:00:00.000Z");

const costingSource: GctCostingSource = {
  costingSourceId: "controlled-costing-fixture",
  costingSourceVersion: "fixture-v1",
  costingSourceEffectiveDate: "2026-11-17",
};

function resolvePolicy(
  bookingDate: Date,
  overrides: Partial<SignatureCapeWinelandsPaymentPolicyRecord> = {},
): ResolvedSignatureCapeWinelandsPaymentPolicy {
  const record = SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICIES[0]!;
  const records = [{ ...record, ...overrides }];
  return resolveSignatureCapeWinelandsPaymentPolicy(CAPE_WINELANDS_JOURNEY_ID, bookingDate, records);
}

interface QuoteOptions {
  readonly baseAmount?: number;
  readonly accommodationAmounts?: readonly [number, number];
  readonly totalAmount?: number;
  readonly currency?: Currency;
  readonly lineItems?: ReadonlyArray<ReturnType<typeof createPricingLineItem>>;
  readonly departureDate?: Date;
}

function createJourney(departureDate: Date): Journey {
  const secondStopDate = new Date(departureDate.getTime());
  secondStopDate.setUTCDate(secondStopDate.getUTCDate() + 2);
  return Journey.create({
    identity: { id: CAPE_WINELANDS_JOURNEY_ID },
    classification: { type: "PACKAGE", category: "SIGNATURE" },
    metadata: { created: new Date("2026-01-01T00:00:00.000Z"), modified: new Date("2026-01-01T00:00:00.000Z"), version: "1.0.0", source: "TEST" },
    status: JourneyStatus.PUBLISHED,
    lifecycle: JourneyLifecycle.BOOKABLE,
    duration: { days: 4, nights: 3, description: "4 Days / 3 Nights" },
    destinations: [{ name: "Cape Winelands" }],
    accommodation: CAPE_WINELANDS_STOPS.map((stop, index) => ({
      accommodationId: `hotel-${stop.stopId}`,
      name: stop.destination,
      provider: "hotelbeds",
      packageStop: {
        packageId: CAPE_WINELANDS_JOURNEY_ID,
        stopId: stop.stopId,
        stopOrder: stop.stopOrder,
        checkInDate: index === 0 ? departureDate : secondStopDate,
        checkOutDate: index === 0 ? secondStopDate : new Date(secondStopDate.getTime() + 86_400_000),
      },
    })),
    experiences: [],
    travellerRules: { minimumTravellers: 2, maximumTravellers: 8, privateOnly: true },
    tags: [],
  });
}

function createQuote(options: QuoteOptions = {}): JourneyQuoteResult {
  const currency = options.currency ?? Currency.ZAR;
  const baseAmount = options.baseAmount ?? 1000;
  const accommodationAmounts = options.accommodationAmounts ?? [100, 200];
  const lineItems = options.lineItems ?? [
    createPricingLineItem({
      code: "BASE",
      label: "Go Cape Tours journey component",
      unitAmount: createMoney({ amount: baseAmount, currency }),
      totalAmount: createMoney({ amount: baseAmount, currency }),
      quantity: 1,
      metadata: {
        costingSourceId: costingSource.costingSourceId,
        costingSourceVersion: costingSource.costingSourceVersion,
        costingSourceEffectiveDate: costingSource.costingSourceEffectiveDate,
      },
    }),
    ...CAPE_WINELANDS_STOPS.map((stop, index) => {
      const amount = accommodationAmounts[index]!;
      return createPricingLineItem({
        code: `ACCOMMODATION:${stop.stopId}`,
        label: `Accommodation ${stop.stopId}`,
        unitAmount: createMoney({ amount, currency }),
        totalAmount: createMoney({ amount, currency }),
        quantity: 1,
        metadata: { packageStopId: stop.stopId },
      });
    }),
  ];
  const componentTotal = lineItems.reduce((sum, line) => sum + line.totalAmount.amount, 0);
  const totalAmount = options.totalAmount ?? componentTotal;
  const now = new Date("2026-12-01T00:00:00.000Z");
  const pricing = Pricing.create({
    identity: { id: "pricing-signature-cw-1" },
    summary: createPricingSummary({
      productId: CAPE_WINELANDS_JOURNEY_ID,
      productType: "PACKAGE",
      description: "Signature Cape Winelands",
    }),
    breakdown: createPricingBreakdown({ lineItems }),
    taxes: createTaxBreakdown({
      entries: [],
      total: createMoney({ amount: 0, currency }),
    }),
    fees: [],
    discounts: [],
    markups: [],
    commissions: [],
    totals: createPricingTotal({
      subtotal: createMoney({ amount: componentTotal, currency }),
      taxTotal: createMoney({ amount: 0, currency }),
      feeTotal: createMoney({ amount: 0, currency }),
      discountTotal: createMoney({ amount: 0, currency }),
      markupTotal: createMoney({ amount: 0, currency }),
      commissionTotal: createMoney({ amount: 0, currency }),
      grandTotal: createMoney({ amount: totalAmount, currency }),
    }),
    currency,
    metadata: createPricingMetadata({ createdAt: now, updatedAt: now, version: "1.0.0", source: "test" }),
  });
  const journey = createJourney(options.departureDate ?? new Date("2026-12-16T10:00:00.000Z"));

  return {
    status: "PRICED",
    journeyId: CAPE_WINELANDS_JOURNEY_ID,
    journey,
    pricing: createPricingEngineResult({
      successful: true,
      pricing,
      metadata: { completedAt: now, version: "1.0.0", requestId: "quote-signature-cw", stages: [] },
    }),
    selections: CAPE_WINELANDS_STOPS.map((stop) => ({
      stopId: stop.stopId,
      accommodationId: `hotel-${stop.stopId}`,
    })),
  };
}

function createInput(overrides: Partial<CalculateSignatureCapeWinelandsInitialPaymentInput> = {}): CalculateSignatureCapeWinelandsInitialPaymentInput {
  const bookingDate = overrides.bookingDate ?? defaultBookingDate;
  return {
    quote: createQuote(),
    bookingDate,
    policy: resolvePolicy(bookingDate),
    costingSource,
    ...overrides,
  };
}

describe("calculateSignatureCapeWinelandsInitialPaymentRequirement", () => {
  it("calculates a 50% initial payment 15 calendar days before departure and preserves both accommodation lines once", () => {
    const result = calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput());

    expect(result).toMatchObject({
      classification: "PARTIAL_PAYMENT",
      amountPayableAtBooking: { amount: 800, currency: Currency.ZAR },
      contractualFutureBalance: { amount: { amount: 500, currency: Currency.ZAR }, dueDate: "2026-12-02" },
      pricingSnapshotId: "pricing-signature-cw-1",
      commercialPolicy: {
        policyId: "SIGNATURE_CAPE_WINELANDS_INITIAL_PAYMENT",
        version: "1.0.0",
        appliedRate: "0.50",
        scope: "SIGNATURE_CAPE_WINELANDS_MULTI_DAY_PACKAGE",
        effectiveFrom: "2026-11-17",
        leadTimeThresholdDays: 14,
        commercialTimeZone: "Africa/Johannesburg",
      },
      calculationBasis: {
        commercialPolicy: {
          policyId: "SIGNATURE_CAPE_WINELANDS_INITIAL_PAYMENT",
          version: "1.0.0",
          appliedRate: "0.50",
          scope: "SIGNATURE_CAPE_WINELANDS_MULTI_DAY_PACKAGE",
          effectiveFrom: "2026-11-17",
          leadTimeThresholdDays: 14,
          commercialTimeZone: "Africa/Johannesburg",
        },
        bookingDate: "2026-12-01",
        departureDate: "2026-12-16",
        leadTimeDays: 15,
        commercialTimeZone: "Africa/Johannesburg",
        gctComponent: {
          sourcePricingLineIdentifier: "BASE",
          amount: { amount: 1000, currency: Currency.ZAR },
          costingSourceId: "controlled-costing-fixture",
          costingSourceVersion: "fixture-v1",
          costingSourceEffectiveDate: "2026-11-17",
        },
        accommodationComponents: [
          { packageStopId: CAPE_WINELANDS_STOPS[0]!.stopId, sourcePricingLineIdentifier: `ACCOMMODATION:${CAPE_WINELANDS_STOPS[0]!.stopId}`, amount: { amount: 100, currency: Currency.ZAR } },
          { packageStopId: CAPE_WINELANDS_STOPS[1]!.stopId, sourcePricingLineIdentifier: `ACCOMMODATION:${CAPE_WINELANDS_STOPS[1]!.stopId}`, amount: { amount: 200, currency: Currency.ZAR } },
        ],
      },
    });
  });

  it.each([
    ["exactly 14 days", "2026-12-02T10:00:00.000Z"],
    ["fewer than 14 days", "2026-12-03T10:00:00.000Z"],
  ])("collects the full quote total %s before departure", (_label, bookingDate) => {
    const result = calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({
      bookingDate: new Date(bookingDate),
    }));

    expect(result.classification).toBe("FULL_PAYMENT");
    expect(result.amountPayableAtBooking).toEqual({ amount: 1300, currency: Currency.ZAR });
    expect(result.contractualFutureBalance).toBeUndefined();
  });

  it("uses calendar dates in Johannesburg across a UTC date boundary", () => {
    const quote = createQuote({ departureDate: new Date("2026-12-16T21:59:00.000Z") });
    const result = calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({
      quote,
      bookingDate: new Date("2026-12-01T22:30:00.000Z"),
    }));

    expect(result.calculationBasis).toMatchObject({
      bookingDate: "2026-12-02",
      departureDate: "2026-12-16",
      leadTimeDays: 14,
    });
    expect(result.classification).toBe("FULL_PAYMENT");
  });

  it("uses the configured policy rate and rounds the initial GCT share half-up to ZAR cents", () => {
    const quote = createQuote({ baseAmount: 100.03, accommodationAmounts: [100, 200] });
    const bookingDate = new Date("2026-12-01T10:00:00.000Z");
    const result = calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({
      quote,
      bookingDate,
      policy: resolvePolicy(bookingDate, { gctCollectionRate: "0.51" }),
    }));

    expect(result.amountPayableAtBooking).toEqual({ amount: 351.02, currency: Currency.ZAR });
    expect(result.contractualFutureBalance).toEqual({
      amount: { amount: 49.01, currency: Currency.ZAR },
      dueDate: "2026-12-02",
    });
    expect(result.calculationBasis.gctComponent.amount).toEqual({ amount: 100.03, currency: Currency.ZAR });
  });

  it("classifies a 100% GCT collection rate as full payment with no future balance", () => {
    const bookingDate = new Date("2026-12-01T10:00:00.000Z");
    const result = calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({
      bookingDate,
      policy: resolvePolicy(bookingDate, { gctCollectionRate: "1" }),
    }));

    expect(result.classification).toBe("FULL_PAYMENT");
    expect(result.amountPayableAtBooking).toEqual({ amount: 1300, currency: Currency.ZAR });
    expect(result.contractualFutureBalance).toBeUndefined();
  });

  it("fails closed when independently rounded split amounts do not reconcile to the quote total", () => {
    const quote = createQuote({ baseAmount: 100.01, accommodationAmounts: [100, 200] });

    expect(() => calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({ quote })))
      .toThrow("Rounded initial payment and contractual future balance do not reconcile");
  });

  it("rejects a missing GCT line, duplicate components, and unexpected price lines", () => {
    const normal = createQuote();
    const lines = normal.pricing!.pricing!.breakdown.lineItems;
    const withoutBase = lines.filter((line) => line.code !== "BASE");
    const duplicateBase = [...lines, lines.find((line) => line.code === "BASE")!];
    const unexpected = [...lines, createPricingLineItem({
      code: "EXTRA",
      label: "Unexpected",
      unitAmount: createMoney({ amount: 1, currency: Currency.ZAR }),
      totalAmount: createMoney({ amount: 1, currency: Currency.ZAR }),
      quantity: 1,
    })];

    for (const lineItems of [withoutBase, duplicateBase, unexpected]) {
      expect(() => calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({
        quote: createQuote({ lineItems }),
      }))).toThrow(InitialPaymentCalculationError);
    }
  });

  it("rejects missing, duplicate, or misidentified accommodation components", () => {
    const normal = createQuote();
    const lines = normal.pricing!.pricing!.breakdown.lineItems;
    const firstAccommodation = lines.find((line) => line.code.startsWith("ACCOMMODATION:"))!;
    const cases = [
      lines.filter((line) => line !== firstAccommodation),
      [...lines, firstAccommodation],
      lines.map((line) => line === firstAccommodation
        ? createPricingLineItem({ ...line, metadata: { packageStopId: CAPE_WINELANDS_STOPS[1]!.stopId } })
        : line),
    ];

    for (const lineItems of cases) {
      expect(() => calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({
        quote: createQuote({ lineItems }),
      }))).toThrow(InitialPaymentCalculationError);
    }
  });

  it("rejects totals that do not reconcile and mixed component currencies", () => {
    expect(() => calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({
      quote: createQuote({ totalAmount: 1301 }),
    }))).toThrow("do not reconcile");

    const normal = createQuote();
    const lines = normal.pricing!.pricing!.breakdown.lineItems;
    const mixedCurrency = lines.map((line) => line.code === "BASE"
      ? createPricingLineItem({
          ...line,
          unitAmount: createMoney({ amount: line.unitAmount.amount, currency: Currency.EUR }),
          totalAmount: createMoney({ amount: line.totalAmount.amount, currency: Currency.EUR }),
        })
      : line);
    expect(() => calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({
      quote: createQuote({ lineItems: mixedCurrency }),
    }))).toThrow("currency does not match");
  });

  it("rejects zero or negative GCT quote components", () => {
    for (const baseAmount of [0, -1]) {
      expect(() => calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({
        quote: createQuote({ baseAmount }),
      }))).toThrow("GCT BASE line must contain one positive group total");
    }
  });

  it("requires a versioned policy and controlled costing provenance", () => {
    expect(() => calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({ policy: undefined })))
      .toThrow("resolved, active Signature Cape Winelands commercial payment policy");
    expect(() => calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({ costingSource: undefined })))
      .toThrow("Controlled GCT costing source identity, version, and effective date are required");
  });

  it("rejects a policy that is not effective on the booking date or has an invalid rate", () => {
    const bookingDate = new Date("2026-12-01T10:00:00.000Z");
    const resolvedPolicy = resolvePolicy(bookingDate);
    expect(() => calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({
      policy: { ...resolvedPolicy, effectiveFrom: "2026-12-02" },
    }))).toThrow("not effective on the booking date");
    expect(() => calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({
      policy: { ...resolvedPolicy, gctCollectionRate: "1.01" },
    }))).toThrow("GCT collection rate");
  });

  it("rejects invalid quote status and invalid booking dates", () => {
    expect(() => calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({
      quote: { ...createQuote(), status: "UNAVAILABLE" },
    }))).toThrow("successful, current");
    expect(() => calculateSignatureCapeWinelandsInitialPaymentRequirement(createInput({
      bookingDate: new Date(Number.NaN),
    }))).toThrow("Booking date must be a valid date");
  });
});
