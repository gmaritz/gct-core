"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationCurrencyError = void 0;
exports.createAccommodationPricingComponents = createAccommodationPricingComponents;
exports.withAccommodationPricingInputs = withAccommodationPricingInputs;
const models_1 = require("../models");
const accommodation_currency_policy_1 = require("./accommodation-currency-policy");
class AccommodationCurrencyError extends Error {
    constructor(message) {
        super(message);
        this.name = "AccommodationCurrencyError";
    }
}
exports.AccommodationCurrencyError = AccommodationCurrencyError;
function toCurrency(value) {
    if (!Object.values(models_1.Currency).includes(value)) {
        throw new AccommodationCurrencyError(`Unsupported accommodation pricing currency: ${value}.`);
    }
    return value;
}
function componentFromInput(input) {
    const stopId = input.packageStopId?.trim();
    if (!stopId)
        throw new Error("Accommodation pricing input requires a package stop.");
    if (!input.accommodationId.trim())
        throw new Error("Accommodation pricing input requires an accommodation.");
    if (!input.room.reference.opaqueReference.trim())
        throw new Error("Accommodation pricing input requires a room reference.");
    if (!input.rate.reference.opaqueReference.trim())
        throw new Error("Accommodation pricing input requires a rate reference.");
    if (!Number.isFinite(input.rate.pricing.amount) || input.rate.pricing.amount <= 0) {
        throw new Error("Accommodation pricing input requires a positive supplier price.");
    }
    if (!input.rate.pricing.currency.trim())
        throw new AccommodationCurrencyError("Accommodation pricing input requires a currency.");
    const currency = toCurrency(input.rate.pricing.currency);
    input.roomRates?.forEach((roomRate) => {
        if (!roomRate.rate.pricing.currency?.trim()) {
            throw new AccommodationCurrencyError("Accommodation room rate requires a currency.");
        }
        if (toCurrency(roomRate.rate.pricing.currency) !== currency) {
            throw new AccommodationCurrencyError("Accommodation room rates must use the aggregate accommodation currency.");
        }
    });
    return Object.freeze({
        packageStopId: stopId,
        accommodationId: input.accommodationId,
        roomReference: input.room.reference.opaqueReference,
        rateReference: input.rate.reference.opaqueReference,
        provider: input.rate.reference.provider,
        amount: input.roomRates?.reduce((total, roomRate) => total + roomRate.rate.pricing.amount, 0)
            ?? input.rate.pricing.amount,
        currency,
        pricingBasis: input.rate.pricing.basis ?? "UNSPECIFIED",
        occupancyRoomCount: input.occupancy?.rooms.length ?? input.rate.occupancy.rooms.length,
        childAges: Object.freeze((input.occupancy?.rooms ?? input.rate.occupancy.rooms).flatMap((room) => room.childAges)),
    });
}
function componentLineItem(component) {
    return (0, models_1.createPricingLineItem)({
        code: `ACCOMMODATION:${component.packageStopId}`,
        label: `Accommodation ${component.packageStopId}`,
        unitAmount: (0, models_1.createMoney)({ amount: component.amount, currency: component.currency }),
        totalAmount: (0, models_1.createMoney)({ amount: component.amount, currency: component.currency }),
        quantity: 1,
        metadata: {
            packageStopId: component.packageStopId,
            accommodationId: component.accommodationId,
            roomReference: component.roomReference,
            rateReference: component.rateReference,
            provider: component.provider,
            pricingBasis: component.pricingBasis,
            occupancyRoomCount: String(component.occupancyRoomCount),
            childAges: component.childAges.join(","),
        },
    });
}
function createAccommodationPricingComponents(inputs) {
    const components = inputs.map(componentFromInput);
    const stops = new Set();
    components.forEach((component) => {
        if (stops.has(component.packageStopId))
            throw new Error(`Duplicate accommodation pricing input for stop ${component.packageStopId}.`);
        stops.add(component.packageStopId);
    });
    return Object.freeze(components);
}
// Rounds once to currency minor units (2 decimals); toPrecision removes binary floating-point noise first.
function roundToMinorUnits(value) {
    return Math.round(Number((value * 100).toPrecision(12))) / 100;
}
function reconciledLineItem(component, baseCurrency, policy) {
    const original = componentLineItem(component);
    if (component.currency === baseCurrency)
        return original;
    const fixedRate = (0, accommodation_currency_policy_1.findFixedRate)(policy, component.currency, baseCurrency);
    if (!fixedRate) {
        throw new AccommodationCurrencyError("Accommodation pricing currency must match the package pricing currency.");
    }
    const convertedAmount = roundToMinorUnits(component.amount * fixedRate.rate);
    const converted = (0, models_1.createMoney)({ amount: convertedAmount, currency: baseCurrency });
    return (0, models_1.createPricingLineItem)({
        code: original.code,
        label: original.label,
        unitAmount: converted,
        totalAmount: converted,
        quantity: 1,
        metadata: {
            ...original.metadata,
            supplierAmount: String(component.amount),
            supplierCurrency: component.currency,
            conversionRate: String(fixedRate.rate),
            convertedAmount: String(convertedAmount),
            convertedCurrency: baseCurrency,
            conversionPolicyId: policy.policyId,
        },
    });
}
function withAccommodationPricingInputs(request, inputs, policy = accommodation_currency_policy_1.STRICT_SAME_CURRENCY_POLICY) {
    const components = createAccommodationPricingComponents(inputs);
    if (components.length === 0)
        return request;
    if (!request.breakdown || !request.totals || !request.currency) {
        throw new Error("Base pricing request is required before adding accommodation pricing.");
    }
    const baseCurrency = request.currency;
    const lineItems = components.map((component) => reconciledLineItem(component, baseCurrency, policy));
    const accommodationTotal = roundToMinorUnits(lineItems.reduce((total, item) => total + item.totalAmount.amount, 0));
    const subtotal = roundToMinorUnits(request.totals.subtotal.amount + accommodationTotal);
    const grandTotal = roundToMinorUnits(request.totals.grandTotal.amount + accommodationTotal);
    return Object.freeze({
        ...request,
        breakdown: (0, models_1.createPricingBreakdown)({
            ...request.breakdown,
            lineItems: Object.freeze([...request.breakdown.lineItems, ...lineItems]),
        }),
        totals: (0, models_1.createPricingTotal)({
            ...request.totals,
            subtotal: (0, models_1.createMoney)({ amount: subtotal, currency: baseCurrency }),
            grandTotal: (0, models_1.createMoney)({ amount: grandTotal, currency: baseCurrency }),
        }),
    });
}
//# sourceMappingURL=accommodation-pricing-input.js.map