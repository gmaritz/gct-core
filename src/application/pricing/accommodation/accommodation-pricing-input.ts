import { JourneyAccommodationPricingInput } from "../../journeys/models";
import {
  Currency,
  PricingLineItem,
  createMoney,
  createPricingBreakdown,
  createPricingLineItem,
  createPricingTotal,
} from "../models";
import { PricingValidationRequest } from "../validation";

export interface AccommodationPricingComponent {
  readonly packageStopId: string;
  readonly accommodationId: string;
  readonly roomReference: string;
  readonly rateReference: string;
  readonly provider: string;
  readonly amount: number;
  readonly currency: Currency;
  readonly pricingBasis: string;
  readonly occupancyRoomCount: number;
  readonly childAges: ReadonlyArray<number>;
}

function toCurrency(value: string): Currency {
  if (!Object.values(Currency).includes(value as Currency)) {
    throw new Error(`Unsupported accommodation pricing currency: ${value}.`);
  }
  return value as Currency;
}

function componentFromInput(input: JourneyAccommodationPricingInput): AccommodationPricingComponent {
  const stopId = input.packageStopId?.trim();
  if (!stopId) throw new Error("Accommodation pricing input requires a package stop.");
  if (!input.accommodationId.trim()) throw new Error("Accommodation pricing input requires an accommodation.");
  if (!input.room.reference.opaqueReference.trim()) throw new Error("Accommodation pricing input requires a room reference.");
  if (!input.rate.reference.opaqueReference.trim()) throw new Error("Accommodation pricing input requires a rate reference.");
  if (!Number.isFinite(input.rate.pricing.amount) || input.rate.pricing.amount <= 0) {
    throw new Error("Accommodation pricing input requires a positive supplier price.");
  }
  if (!input.rate.pricing.currency.trim()) throw new Error("Accommodation pricing input requires a currency.");

  return Object.freeze({
    packageStopId: stopId,
    accommodationId: input.accommodationId,
    roomReference: input.room.reference.opaqueReference,
    rateReference: input.rate.reference.opaqueReference,
    provider: input.rate.reference.provider,
    amount: input.rate.pricing.amount,
    currency: toCurrency(input.rate.pricing.currency),
    pricingBasis: input.rate.pricing.basis ?? "UNSPECIFIED",
    occupancyRoomCount: input.occupancy?.rooms.length ?? input.rate.occupancy.rooms.length,
    childAges: Object.freeze(
      (input.occupancy?.rooms ?? input.rate.occupancy.rooms).flatMap((room) => room.childAges),
    ),
  });
}

function componentLineItem(component: AccommodationPricingComponent): PricingLineItem {
  return createPricingLineItem({
    code: `ACCOMMODATION:${component.packageStopId}`,
    label: `Accommodation ${component.packageStopId}`,
    unitAmount: createMoney({ amount: component.amount, currency: component.currency }),
    totalAmount: createMoney({ amount: component.amount, currency: component.currency }),
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

export function createAccommodationPricingComponents(
  inputs: ReadonlyArray<JourneyAccommodationPricingInput>,
): ReadonlyArray<AccommodationPricingComponent> {
  const components = inputs.map(componentFromInput);
  const stops = new Set<string>();
  components.forEach((component) => {
    if (stops.has(component.packageStopId)) throw new Error(`Duplicate accommodation pricing input for stop ${component.packageStopId}.`);
    stops.add(component.packageStopId);
  });
  return Object.freeze(components);
}

export function withAccommodationPricingInputs(
  request: PricingValidationRequest,
  inputs: ReadonlyArray<JourneyAccommodationPricingInput>,
): PricingValidationRequest {
  const components = createAccommodationPricingComponents(inputs);
  if (components.length === 0) return request;
  if (!request.breakdown || !request.totals || !request.currency) {
    throw new Error("Base pricing request is required before adding accommodation pricing.");
  }

  const lineItems = components.map(componentLineItem);
  const baseCurrency = request.currency;
  if (components.some((component) => component.currency !== baseCurrency)) {
    throw new Error("Accommodation pricing currency must match the package pricing currency.");
  }
  const accommodationTotal = lineItems.reduce((total, item) => total + item.totalAmount.amount, 0);
  const subtotal = request.totals.subtotal.amount + accommodationTotal;
  const grandTotal = request.totals.grandTotal.amount + accommodationTotal;

  return Object.freeze({
    ...request,
    breakdown: createPricingBreakdown({
      ...request.breakdown,
      lineItems: Object.freeze([...request.breakdown.lineItems, ...lineItems]),
    }),
    totals: createPricingTotal({
      ...request.totals,
      subtotal: createMoney({ amount: subtotal, currency: baseCurrency }),
      grandTotal: createMoney({ amount: grandTotal, currency: baseCurrency }),
    }),
  });
}