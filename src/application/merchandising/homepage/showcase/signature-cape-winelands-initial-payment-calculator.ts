import { Currency, createMoney, Money, Pricing } from "../../../pricing";
import { CAPE_WINELANDS_JOURNEY_ID, CAPE_WINELANDS_STOPS } from "./cape-winelands-journey-resolver";
import { JourneyQuoteResult } from "./journey-quote-service";

const COMMERCIAL_TIME_ZONE = "Africa/Johannesburg";
const MAX_SAFE_INTEGER_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

export interface SignatureCapeWinelandsPaymentPolicy {
  readonly policyId: string;
  readonly version: string;
  readonly effectiveDate: string;
  readonly gctCollectionRate: string;
}

export interface GctCostingSource {
  readonly costingSourceId: string;
  readonly costingSourceVersion: string;
  readonly costingSourceEffectiveDate: string;
}

export interface InitialPaymentRequirement {
  readonly classification: "PARTIAL_PAYMENT" | "FULL_PAYMENT";
  readonly amountPayableAtBooking: Money;
  readonly contractualFutureBalance?: {
    readonly amount: Money;
    readonly dueDate: string;
  };
  readonly pricingSnapshotId: string;
  readonly commercialPolicy: {
    readonly policyId: string;
    readonly version: string;
    readonly appliedRate: string;
  };
  readonly calculationBasis: {
    readonly bookingDate: string;
    readonly departureDate: string;
    readonly leadTimeDays: number;
    readonly commercialTimeZone: typeof COMMERCIAL_TIME_ZONE;
    readonly gctComponent: {
      readonly sourcePricingLineIdentifier: string;
      readonly amount: Money;
      readonly costingSourceId: string;
      readonly costingSourceVersion: string;
      readonly costingSourceEffectiveDate: string;
    };
    readonly accommodationComponents: ReadonlyArray<{
      readonly packageStopId: string;
      readonly sourcePricingLineIdentifier: string;
      readonly amount: Money;
    }>;
  };
}

export interface CalculateSignatureCapeWinelandsInitialPaymentInput {
  readonly quote: JourneyQuoteResult;
  readonly bookingDate: Date;
  readonly policy?: SignatureCapeWinelandsPaymentPolicy;
  readonly costingSource?: GctCostingSource;
}

export class InitialPaymentCalculationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "InitialPaymentCalculationError";
  }
}

function fail(message: string): never {
  throw new InitialPaymentCalculationError(message);
}

function toMinorUnits(amount: number, label: string): bigint {
  if (!Number.isFinite(amount)) fail(`${label} must be a finite monetary amount.`);

  const match = /^(-?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(amount.toString());
  if (!match) fail(`${label} is not a supported decimal monetary amount.`);

  const sign = match[1] === "-" ? -1n : 1n;
  const fraction = match[3] ?? "";
  const exponent = Number(match[4] ?? "0");
  if (!Number.isSafeInteger(exponent)) fail(`${label} has an unsupported decimal exponent.`);

  let coefficient = BigInt(`${match[2]}${fraction}`) * sign;
  const scale = fraction.length - exponent;
  const minorUnitScale = scale - 2;
  if (minorUnitScale <= 0) {
    coefficient *= 10n ** BigInt(-minorUnitScale);
  } else {
    const divisor = 10n ** BigInt(minorUnitScale);
    if (coefficient % divisor !== 0n) fail(`${label} contains a fraction smaller than one ZAR cent.`);
    coefficient /= divisor;
  }
  return coefficient;
}

function moneyFromMinorUnits(amount: bigint, label: string): Money {
  if (amount > MAX_SAFE_INTEGER_BIGINT || amount < -MAX_SAFE_INTEGER_BIGINT) {
    fail(`${label} exceeds the supported monetary range.`);
  }
  return createMoney({ amount: Number(amount) / 100, currency: Currency.ZAR });
}

function assertCurrency(money: Money, currency: Currency, label: string): bigint {
  if (money.currency !== currency) fail(`${label} currency does not match the quote currency.`);
  return toMinorUnits(money.amount, label);
}

function parseCalendarDate(value: string, label: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(`${label} must be a valid YYYY-MM-DD calendar date.`);
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    fail(`${label} must be a valid YYYY-MM-DD calendar date.`);
  }
  return value;
}

function calendarDateInTimeZone(value: Date, label: string): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) fail(`${label} must be a valid date.`);

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: COMMERCIAL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: string): string | undefined => parts.find((item) => item.type === type)?.value;
  const year = part("year");
  const month = part("month");
  const day = part("day");
  if (!year || !month || !day) fail(`${label} could not be resolved in ${COMMERCIAL_TIME_ZONE}.`);
  return `${year.padStart(4, "0")}-${month}-${day}`;
}

function calendarDayNumber(value: string): number {
  return new Date(`${value}T00:00:00.000Z`).getTime() / 86_400_000;
}

function subtractCalendarDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function getApplicableStops(quote: JourneyQuoteResult): ReadonlyArray<{
  readonly packageStopId: string;
  readonly stopOrder: number;
  readonly checkInDate: Date;
}> {
  const journey = quote.journey;
  if (!journey
    || quote.journeyId !== CAPE_WINELANDS_JOURNEY_ID
    || journey.identity.id !== CAPE_WINELANDS_JOURNEY_ID) {
    fail("A Signature Cape Winelands journey quote is required.");
  }

  const expectedStopIds = new Set<string>(CAPE_WINELANDS_STOPS.map((stop) => stop.stopId));
  const selectedStops = new Map<string, { readonly packageStopId: string; readonly stopOrder: number; readonly checkInDate: Date }>();
  for (const selection of quote.selections) {
    const matches = journey.accommodation.filter((option) =>
      option.accommodationId === selection.accommodationId
      && (!selection.stopId || option.packageStop?.stopId === selection.stopId),
    );
    if (matches.length !== 1 || !matches[0]?.packageStop) {
      fail("Each selected accommodation must identify exactly one package stop.");
    }
    const packageStop = matches[0].packageStop;
    if (!expectedStopIds.has(packageStop.stopId)) fail(`Selected accommodation references unexpected package stop ${packageStop.stopId}.`);
    if (selectedStops.has(packageStop.stopId)) fail(`Accommodation for package stop ${packageStop.stopId} is selected more than once.`);
    if (!Number.isInteger(packageStop.stopOrder)) fail("Journey package stops must have valid stop orders.");
    if (!(packageStop.checkInDate instanceof Date) || Number.isNaN(packageStop.checkInDate.getTime())) {
      fail(`Journey package stop ${packageStop.stopId} has no valid departure date.`);
    }
    selectedStops.set(packageStop.stopId, {
      packageStopId: packageStop.stopId,
      stopOrder: packageStop.stopOrder,
      checkInDate: packageStop.checkInDate,
    });
  }
  const stopOrders = [...selectedStops.values()].map((stop) => stop.stopOrder);
  if (new Set(stopOrders).size !== stopOrders.length) fail("Journey package stops must have distinct stop orders.");
  if (selectedStops.size !== expectedStopIds.size
    || [...expectedStopIds].some((stopId) => !selectedStops.has(stopId))) {
    fail("The successful quote must contain one selected accommodation for every Cape Winelands package stop.");
  }

  return [...selectedStops.values()].sort((left, right) => left.stopOrder - right.stopOrder);
}

function parseRate(value: string): { readonly numerator: bigint; readonly denominator: bigint } {
  if (!/^\d+(?:\.\d+)?$/.test(value)) {
    fail("The GCT collection rate must be a finite decimal value from 0 through 1.");
  }
  const [whole, fraction = ""] = value.split(".");
  const denominator = 10n ** BigInt(fraction.length);
  const numerator = BigInt(`${whole}${fraction}`);
  if (numerator > denominator) fail("The GCT collection rate must be a finite decimal value from 0 through 1.");
  return { numerator, denominator };
}

function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;
  return remainder * 2n >= denominator ? quotient + 1n : quotient;
}

function assertPolicy(
  policy: SignatureCapeWinelandsPaymentPolicy | undefined,
  bookingDate: string,
): { readonly policy: SignatureCapeWinelandsPaymentPolicy; readonly rateNumerator: bigint; readonly rateDenominator: bigint } {
  if (!policy
    || typeof policy.policyId !== "string"
    || !policy.policyId.trim()
    || typeof policy.version !== "string"
    || !policy.version.trim()
    || typeof policy.effectiveDate !== "string"
    || !policy.effectiveDate.trim()
    || typeof policy.gctCollectionRate !== "string") {
    fail("A versioned Signature Cape Winelands commercial payment policy is required.");
  }
  const effectiveDate = parseCalendarDate(policy.effectiveDate, "Commercial policy effective date");
  if (effectiveDate > bookingDate) fail("The commercial payment policy is not effective on the booking date.");
  const rate = parseRate(policy.gctCollectionRate);
  return { policy, rateNumerator: rate.numerator, rateDenominator: rate.denominator };
}

function assertCostingSource(
  source: GctCostingSource | undefined,
  bookingDate: string,
): GctCostingSource {
  if (!source
    || typeof source.costingSourceId !== "string"
    || !source.costingSourceId.trim()
    || typeof source.costingSourceVersion !== "string"
    || !source.costingSourceVersion.trim()
    || typeof source.costingSourceEffectiveDate !== "string"
    || !source.costingSourceEffectiveDate.trim()) {
    fail("Controlled GCT costing source identity, version, and effective date are required.");
  }
  const effectiveDate = parseCalendarDate(source.costingSourceEffectiveDate, "GCT costing source effective date");
  if (effectiveDate > bookingDate) fail("The GCT costing source is not effective on the booking date.");
  return source;
}

function validatePricingComponents(pricing: Pricing, quote: JourneyQuoteResult): {
  readonly gctLineCode: string;
  readonly gctAmount: bigint;
  readonly accommodationComponents: ReadonlyArray<{
    readonly packageStopId: string;
    readonly sourcePricingLineIdentifier: string;
    readonly amount: bigint;
  }>;
  readonly departureDate: string;
  readonly total: bigint;
} {
  if (pricing.currency !== Currency.ZAR) fail("Signature Cape Winelands initial payment currently requires a ZAR quote.");

  const stops = getApplicableStops(quote);
  const lineItems = pricing.breakdown.lineItems;
  const gctLines = lineItems.filter((line) => line.code === "BASE");
  if (gctLines.length !== 1) fail("The successful quote must contain exactly one GCT BASE pricing line.");
  const gctLine = gctLines[0]!;
  if (gctLine.quantity !== 1) fail("The GCT BASE pricing line must be a single group total.");

  const accommodationLines = lineItems.filter((line) => line.code.startsWith("ACCOMMODATION:"));
  const expectedLineCount = 1 + stops.length;
  if (lineItems.length !== expectedLineCount || accommodationLines.length !== stops.length) {
    fail("The successful quote contains missing, duplicate, or unexpected pricing components.");
  }

  const gctAmount = assertCurrency(gctLine.totalAmount, pricing.currency, "GCT BASE component");
  const gctUnitAmount = assertCurrency(gctLine.unitAmount, pricing.currency, "GCT BASE unit amount");
  if (gctAmount <= 0n || gctUnitAmount !== gctAmount) fail("The GCT BASE line must contain one positive group total.");

  const accommodationComponents = stops.map((stop) => {
    const lineCode = `ACCOMMODATION:${stop.packageStopId}`;
    const matches = accommodationLines.filter((line) => line.code === lineCode);
    if (matches.length !== 1) fail(`The successful quote must contain exactly one ${lineCode} pricing line.`);
    const line = matches[0]!;
    if (line.metadata?.packageStopId !== stop.packageStopId) {
      fail(`Pricing line ${lineCode} does not identify its matching package stop.`);
    }
    if (line.quantity !== 1) fail(`Pricing line ${lineCode} must contain one final stop amount.`);
    const amount = assertCurrency(line.totalAmount, pricing.currency, lineCode);
    const unitAmount = assertCurrency(line.unitAmount, pricing.currency, `${lineCode} unit amount`);
    if (amount <= 0n || unitAmount !== amount) fail(`Pricing line ${lineCode} must contain one positive final amount.`);
    return {
      packageStopId: stop.packageStopId,
      sourcePricingLineIdentifier: line.code,
      amount,
    };
  });

  const componentTotal = accommodationComponents.reduce((sum, component) => sum + component.amount, gctAmount);
  const pricingTotals = pricing.totals;
  const subtotal = assertCurrency(pricingTotals.subtotal, pricing.currency, "Quote subtotal");
  const total = assertCurrency(pricingTotals.grandTotal, pricing.currency, "Reservation total");
  if (componentTotal !== subtotal || componentTotal !== total) {
    fail("GCT and final accommodation components do not reconcile to the successful quote total.");
  }

  const nonComponentTotals = [
    ["Tax total", pricingTotals.taxTotal],
    ["Fee total", pricingTotals.feeTotal],
    ["Discount total", pricingTotals.discountTotal],
    ["Markup total", pricingTotals.markupTotal],
    ["Commission total", pricingTotals.commissionTotal],
    ["Tax breakdown total", pricing.taxes.total],
  ] as const;
  for (const [label, amount] of nonComponentTotals) {
    if (assertCurrency(amount, pricing.currency, label) !== 0n) fail(`${label} is not covered by the approved initial-payment calculation.`);
  }
  const ancillaryAmounts = [
    ...pricing.taxes.entries.map((entry) => ["Tax entry", entry.amount] as const),
    ...pricing.fees.map((entry) => ["Fee entry", entry.amount] as const),
    ...pricing.discounts.map((entry) => ["Discount entry", entry.amount] as const),
    ...pricing.markups.map((entry) => ["Markup entry", entry.amount] as const),
    ...pricing.commissions.map((entry) => ["Commission entry", entry.amount] as const),
  ];
  for (const [label, amount] of ancillaryAmounts) {
    if (assertCurrency(amount, pricing.currency, label) !== 0n) fail(`${label} is not covered by the approved initial-payment calculation.`);
  }

  return {
    gctLineCode: gctLine.code,
    gctAmount,
    accommodationComponents,
    departureDate: calendarDateInTimeZone(stops[0]!.checkInDate, "Departure date"),
    total,
  };
}

export function calculateSignatureCapeWinelandsInitialPaymentRequirement(
  input: CalculateSignatureCapeWinelandsInitialPaymentInput,
): InitialPaymentRequirement {
  const { quote } = input;
  if (quote.status !== "PRICED" || !quote.pricing?.successful || !quote.pricing.pricing) {
    fail("A successful, current Signature Cape Winelands quote is required.");
  }
  const pricing = quote.pricing.pricing;
  if (typeof pricing.identity.id !== "string" || !pricing.identity.id.trim()) {
    fail("A PricingSnapshot identity is required.");
  }

  const bookingDate = calendarDateInTimeZone(input.bookingDate, "Booking date");
  const policy = assertPolicy(input.policy, bookingDate);
  const costingSource = assertCostingSource(input.costingSource, bookingDate);
  const components = validatePricingComponents(pricing, quote);
  const departureDate = components.departureDate;
  const leadTimeDays = calendarDayNumber(departureDate) - calendarDayNumber(bookingDate);
  if (!Number.isInteger(leadTimeDays) || leadTimeDays < 0) {
    fail("Departure date must not precede the booking date.");
  }

  let initialAmount: bigint;
  let futureBalance: bigint | undefined;
  let dueDate: string | undefined;
  if (leadTimeDays > 14) {
    const gctPayable = roundHalfUp(components.gctAmount * policy.rateNumerator, policy.rateDenominator);
    futureBalance = roundHalfUp(
      components.gctAmount * (policy.rateDenominator - policy.rateNumerator),
      policy.rateDenominator,
    );
    initialAmount = components.accommodationComponents.reduce((sum, component) => sum + component.amount, gctPayable);
    if (initialAmount + futureBalance !== components.total) {
      fail("Rounded initial payment and contractual future balance do not reconcile to the successful quote total.");
    }
    if (futureBalance > 0n) dueDate = subtractCalendarDays(departureDate, 14);
  } else {
    initialAmount = components.total;
  }
  if (initialAmount <= 0n || initialAmount > components.total) {
    fail("Initial amount payable must be positive and no greater than the Reservation total.");
  }

  const classification = initialAmount === components.total ? "FULL_PAYMENT" : "PARTIAL_PAYMENT";
  const accommodationComponents = Object.freeze(components.accommodationComponents.map((component) => Object.freeze({
    packageStopId: component.packageStopId,
    sourcePricingLineIdentifier: component.sourcePricingLineIdentifier,
    amount: moneyFromMinorUnits(component.amount, component.sourcePricingLineIdentifier),
  })));
  return Object.freeze({
    classification,
    amountPayableAtBooking: moneyFromMinorUnits(initialAmount, "Initial amount payable"),
    contractualFutureBalance: futureBalance !== undefined && futureBalance > 0n && dueDate
      ? Object.freeze({
          amount: moneyFromMinorUnits(futureBalance, "Contractual future balance"),
          dueDate,
        })
      : undefined,
    pricingSnapshotId: pricing.identity.id,
    commercialPolicy: Object.freeze({
      policyId: policy.policy.policyId,
      version: policy.policy.version,
      appliedRate: policy.policy.gctCollectionRate,
    }),
    calculationBasis: Object.freeze({
      bookingDate,
      departureDate,
      leadTimeDays,
      commercialTimeZone: COMMERCIAL_TIME_ZONE,
      gctComponent: Object.freeze({
        sourcePricingLineIdentifier: components.gctLineCode,
        amount: moneyFromMinorUnits(components.gctAmount, "GCT BASE component"),
        costingSourceId: costingSource.costingSourceId,
        costingSourceVersion: costingSource.costingSourceVersion,
        costingSourceEffectiveDate: costingSource.costingSourceEffectiveDate,
      }),
      accommodationComponents,
    }),
  });
}
