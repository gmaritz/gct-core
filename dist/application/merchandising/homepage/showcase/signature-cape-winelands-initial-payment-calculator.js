"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialPaymentCalculationError = void 0;
exports.calculateSignatureCapeWinelandsInitialPaymentRequirement = calculateSignatureCapeWinelandsInitialPaymentRequirement;
const pricing_1 = require("../../../pricing");
const cape_winelands_journey_resolver_1 = require("./cape-winelands-journey-resolver");
const calendar_date_1 = require("./calendar-date");
const MAX_SAFE_INTEGER_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);
const PAYMENT_POLICY_SCOPE = "SIGNATURE_CAPE_WINELANDS_MULTI_DAY_PACKAGE";
class InitialPaymentCalculationError extends Error {
    constructor(message) {
        super(message);
        this.name = "InitialPaymentCalculationError";
    }
}
exports.InitialPaymentCalculationError = InitialPaymentCalculationError;
function fail(message) {
    throw new InitialPaymentCalculationError(message);
}
function toMinorUnits(amount, label) {
    if (!Number.isFinite(amount))
        fail(`${label} must be a finite monetary amount.`);
    const match = /^(-?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(amount.toString());
    if (!match)
        fail(`${label} is not a supported decimal monetary amount.`);
    const sign = match[1] === "-" ? -1n : 1n;
    const fraction = match[3] ?? "";
    const exponent = Number(match[4] ?? "0");
    if (!Number.isSafeInteger(exponent))
        fail(`${label} has an unsupported decimal exponent.`);
    let coefficient = BigInt(`${match[2]}${fraction}`) * sign;
    const scale = fraction.length - exponent;
    const minorUnitScale = scale - 2;
    if (minorUnitScale <= 0) {
        coefficient *= 10n ** BigInt(-minorUnitScale);
    }
    else {
        const divisor = 10n ** BigInt(minorUnitScale);
        if (coefficient % divisor !== 0n)
            fail(`${label} contains a fraction smaller than one ZAR cent.`);
        coefficient /= divisor;
    }
    return coefficient;
}
function moneyFromMinorUnits(amount, label) {
    if (amount > MAX_SAFE_INTEGER_BIGINT || amount < -MAX_SAFE_INTEGER_BIGINT) {
        fail(`${label} exceeds the supported monetary range.`);
    }
    return (0, pricing_1.createMoney)({ amount: Number(amount) / 100, currency: pricing_1.Currency.ZAR });
}
function assertCurrency(money, currency, label) {
    if (money.currency !== currency)
        fail(`${label} currency does not match the quote currency.`);
    return toMinorUnits(money.amount, label);
}
function parseCalendarDate(value, label) {
    try {
        return (0, calendar_date_1.parseCalendarDate)(value, label);
    }
    catch (error) {
        if (error instanceof Error)
            fail(error.message);
        throw error;
    }
}
function calendarDateInTimeZone(value, timeZone, label) {
    try {
        return (0, calendar_date_1.calendarDateInTimeZone)(value, timeZone, label);
    }
    catch (error) {
        if (error instanceof Error)
            fail(error.message);
        throw error;
    }
}
function calendarDayNumber(value) {
    return new Date(`${value}T00:00:00.000Z`).getTime() / 86400000;
}
function getApplicableStops(quote) {
    const journey = quote.journey;
    if (!journey
        || quote.journeyId !== cape_winelands_journey_resolver_1.CAPE_WINELANDS_JOURNEY_ID
        || journey.identity.id !== cape_winelands_journey_resolver_1.CAPE_WINELANDS_JOURNEY_ID) {
        fail("A Signature Cape Winelands journey quote is required.");
    }
    const expectedStopIds = new Set(cape_winelands_journey_resolver_1.CAPE_WINELANDS_STOPS.map((stop) => stop.stopId));
    const selectedStops = new Map();
    for (const selection of quote.selections) {
        const matches = journey.accommodation.filter((option) => option.accommodationId === selection.accommodationId
            && (!selection.stopId || option.packageStop?.stopId === selection.stopId));
        if (matches.length !== 1 || !matches[0]?.packageStop) {
            fail("Each selected accommodation must identify exactly one package stop.");
        }
        const packageStop = matches[0].packageStop;
        if (!expectedStopIds.has(packageStop.stopId))
            fail(`Selected accommodation references unexpected package stop ${packageStop.stopId}.`);
        if (selectedStops.has(packageStop.stopId))
            fail(`Accommodation for package stop ${packageStop.stopId} is selected more than once.`);
        if (!Number.isInteger(packageStop.stopOrder))
            fail("Journey package stops must have valid stop orders.");
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
    if (new Set(stopOrders).size !== stopOrders.length)
        fail("Journey package stops must have distinct stop orders.");
    if (selectedStops.size !== expectedStopIds.size
        || [...expectedStopIds].some((stopId) => !selectedStops.has(stopId))) {
        fail("The successful quote must contain one selected accommodation for every Cape Winelands package stop.");
    }
    return [...selectedStops.values()].sort((left, right) => left.stopOrder - right.stopOrder);
}
function parseRate(value) {
    if (!/^\d+(?:\.\d+)?$/.test(value)) {
        fail("The GCT collection rate must be a finite decimal value from 0 through 1.");
    }
    const [whole, fraction = ""] = value.split(".");
    const denominator = 10n ** BigInt(fraction.length);
    const numerator = BigInt(`${whole}${fraction}`);
    if (numerator > denominator)
        fail("The GCT collection rate must be a finite decimal value from 0 through 1.");
    return { numerator, denominator };
}
function roundHalfUp(numerator, denominator) {
    const quotient = numerator / denominator;
    const remainder = numerator % denominator;
    return remainder * 2n >= denominator ? quotient + 1n : quotient;
}
function assertPolicy(policy, bookingDate) {
    if (!policy
        || typeof policy.policyId !== "string"
        || !policy.policyId.trim()
        || typeof policy.version !== "string"
        || !policy.version.trim()
        || policy.journeyId !== cape_winelands_journey_resolver_1.CAPE_WINELANDS_JOURNEY_ID
        || policy.scope !== PAYMENT_POLICY_SCOPE
        || policy.status !== "ACTIVE"
        || policy.commercialTimeZone !== calendar_date_1.SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE
        || !Number.isInteger(policy.leadTimeThresholdDays)
        || policy.leadTimeThresholdDays <= 0
        || typeof policy.gctCollectionRate !== "string") {
        fail("A resolved, active Signature Cape Winelands commercial payment policy is required.");
    }
    const effectiveFrom = parseCalendarDate(policy.effectiveFrom, "Commercial policy effective-from date");
    const effectiveTo = policy.effectiveTo === undefined
        ? undefined
        : parseCalendarDate(policy.effectiveTo, "Commercial policy effective-to date");
    if (effectiveTo && effectiveTo < effectiveFrom)
        fail("Commercial policy effective-to date precedes its effective-from date.");
    if (effectiveFrom > bookingDate || (effectiveTo && bookingDate > effectiveTo)) {
        fail("The commercial payment policy is not effective on the booking date.");
    }
    const rate = parseRate(policy.gctCollectionRate);
    return { policy, rateNumerator: rate.numerator, rateDenominator: rate.denominator };
}
function assertCostingSource(source, bookingDate) {
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
    if (effectiveDate > bookingDate)
        fail("The GCT costing source is not effective on the booking date.");
    return source;
}
function validatePricingComponents(pricing, quote) {
    if (pricing.currency !== pricing_1.Currency.ZAR)
        fail("Signature Cape Winelands initial payment currently requires a ZAR quote.");
    const stops = getApplicableStops(quote);
    const lineItems = pricing.breakdown.lineItems;
    const gctLines = lineItems.filter((line) => line.code === "BASE");
    if (gctLines.length !== 1)
        fail("The successful quote must contain exactly one GCT BASE pricing line.");
    const gctLine = gctLines[0];
    if (gctLine.quantity !== 1)
        fail("The GCT BASE pricing line must be a single group total.");
    const accommodationLines = lineItems.filter((line) => line.code.startsWith("ACCOMMODATION:"));
    const expectedLineCount = 1 + stops.length;
    if (lineItems.length !== expectedLineCount || accommodationLines.length !== stops.length) {
        fail("The successful quote contains missing, duplicate, or unexpected pricing components.");
    }
    const gctAmount = assertCurrency(gctLine.totalAmount, pricing.currency, "GCT BASE component");
    const gctUnitAmount = assertCurrency(gctLine.unitAmount, pricing.currency, "GCT BASE unit amount");
    if (gctAmount <= 0n || gctUnitAmount !== gctAmount)
        fail("The GCT BASE line must contain one positive group total.");
    const accommodationComponents = stops.map((stop) => {
        const lineCode = `ACCOMMODATION:${stop.packageStopId}`;
        const matches = accommodationLines.filter((line) => line.code === lineCode);
        if (matches.length !== 1)
            fail(`The successful quote must contain exactly one ${lineCode} pricing line.`);
        const line = matches[0];
        if (line.metadata?.packageStopId !== stop.packageStopId) {
            fail(`Pricing line ${lineCode} does not identify its matching package stop.`);
        }
        if (line.quantity !== 1)
            fail(`Pricing line ${lineCode} must contain one final stop amount.`);
        const amount = assertCurrency(line.totalAmount, pricing.currency, lineCode);
        const unitAmount = assertCurrency(line.unitAmount, pricing.currency, `${lineCode} unit amount`);
        if (amount <= 0n || unitAmount !== amount)
            fail(`Pricing line ${lineCode} must contain one positive final amount.`);
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
    ];
    for (const [label, amount] of nonComponentTotals) {
        if (assertCurrency(amount, pricing.currency, label) !== 0n)
            fail(`${label} is not covered by the approved initial-payment calculation.`);
    }
    const ancillaryAmounts = [
        ...pricing.taxes.entries.map((entry) => ["Tax entry", entry.amount]),
        ...pricing.fees.map((entry) => ["Fee entry", entry.amount]),
        ...pricing.discounts.map((entry) => ["Discount entry", entry.amount]),
        ...pricing.markups.map((entry) => ["Markup entry", entry.amount]),
        ...pricing.commissions.map((entry) => ["Commission entry", entry.amount]),
    ];
    for (const [label, amount] of ancillaryAmounts) {
        if (assertCurrency(amount, pricing.currency, label) !== 0n)
            fail(`${label} is not covered by the approved initial-payment calculation.`);
    }
    return {
        gctLineCode: gctLine.code,
        gctAmount,
        accommodationComponents,
        departureDate: calendarDateInTimeZone(stops[0].checkInDate, calendar_date_1.SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE, "Departure date"),
        total,
    };
}
function calculateSignatureCapeWinelandsInitialPaymentRequirement(input) {
    const { quote } = input;
    if (quote.status !== "PRICED" || !quote.pricing?.successful || !quote.pricing.pricing) {
        fail("A successful, current Signature Cape Winelands quote is required.");
    }
    const pricing = quote.pricing.pricing;
    if (typeof pricing.identity.id !== "string" || !pricing.identity.id.trim()) {
        fail("A PricingSnapshot identity is required.");
    }
    const bookingDate = calendarDateInTimeZone(input.bookingDate, input.policy?.commercialTimeZone ?? calendar_date_1.SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE, "Booking date");
    const policy = assertPolicy(input.policy, bookingDate);
    const components = validatePricingComponents(pricing, quote);
    const costingSource = assertCostingSource(input.costingSource, bookingDate);
    const gctLine = pricing.breakdown.lineItems.find((line) => line.code === components.gctLineCode);
    if (gctLine?.metadata?.costingSourceId !== costingSource.costingSourceId
        || gctLine.metadata.costingSourceVersion !== costingSource.costingSourceVersion
        || gctLine.metadata.costingSourceEffectiveDate !== costingSource.costingSourceEffectiveDate) {
        fail("GCT costing source identity must match the successful quote BASE component.");
    }
    const departureDate = components.departureDate;
    const leadTimeDays = calendarDayNumber(departureDate) - calendarDayNumber(bookingDate);
    if (!Number.isInteger(leadTimeDays) || leadTimeDays < 0) {
        fail("Departure date must not precede the booking date.");
    }
    let initialAmount;
    let futureBalance;
    let dueDate;
    if (leadTimeDays > policy.policy.leadTimeThresholdDays) {
        const gctPayable = roundHalfUp(components.gctAmount * policy.rateNumerator, policy.rateDenominator);
        futureBalance = roundHalfUp(components.gctAmount * (policy.rateDenominator - policy.rateNumerator), policy.rateDenominator);
        initialAmount = components.accommodationComponents.reduce((sum, component) => sum + component.amount, gctPayable);
        if (initialAmount + futureBalance !== components.total) {
            fail("Rounded initial payment and contractual future balance do not reconcile to the successful quote total.");
        }
        if (futureBalance > 0n)
            dueDate = (0, calendar_date_1.subtractCalendarDays)(departureDate, policy.policy.leadTimeThresholdDays);
    }
    else {
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
    const commercialPolicy = Object.freeze({
        policyId: policy.policy.policyId,
        version: policy.policy.version,
        appliedRate: policy.policy.gctCollectionRate,
        scope: policy.policy.scope,
        effectiveFrom: policy.policy.effectiveFrom,
        effectiveTo: policy.policy.effectiveTo,
        leadTimeThresholdDays: policy.policy.leadTimeThresholdDays,
        commercialTimeZone: policy.policy.commercialTimeZone,
    });
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
        commercialPolicy,
        calculationBasis: Object.freeze({
            commercialPolicy,
            bookingDate,
            departureDate,
            leadTimeDays,
            commercialTimeZone: policy.policy.commercialTimeZone,
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
//# sourceMappingURL=signature-cape-winelands-initial-payment-calculator.js.map