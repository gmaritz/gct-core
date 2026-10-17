import { Journey, JourneyAccommodationPricingInput, selectJourneyAccommodation } from "../../../journeys";
import {
  createMoney,
  createPricingBreakdown,
  createPricingLineItem,
  createPricingSummary,
  createPricingTotal,
  createTaxBreakdown,
  createTax,
  createFee,
  Currency,
  PricingEngine,
  PricingEngineRequest,
  PricingEngineResult,
  TaxType,
  withAccommodationPricingInputs,
  AccommodationCurrencyError,
} from "../../../pricing";
import { AccommodationSelectionInput } from "./accommodation-selection-service";
import { DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { JourneySelectionStore, journeySelectionStore } from "./journey-selection-store";
import { CAPE_WINELANDS_JOURNEY_ID } from "./cape-winelands-journey-resolver";

export type JourneyQuoteStatus = "PRICED" | "RECHECK_REQUIRED" | "UNAVAILABLE" | "INVALID" | "NOT_FOUND" | "CURRENCY_UNCONFIRMED";

export interface JourneyQuoteResult {
  readonly status: JourneyQuoteStatus;
  readonly journeyId: string;
  readonly journey?: Journey;
  readonly pricing?: PricingEngineResult;
  readonly groupComponent?: { readonly amount: number; readonly currency: string };
  readonly selections: ReadonlyArray<AccommodationSelectionInput>;
}
import {
  PricingValidationPipeline,
  PricingRequestValidator,
  CommercialValidator,
  PricingIntegrityValidator,
  QuoteReadinessValidator,
  PricingPolicyPipeline,
  PricingCalculatorPipeline,
} from "../../../pricing";

export interface JourneyQuoteService {
  priceJourney(journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): Promise<JourneyQuoteResult>;
  priceCurrentJourney(journeyId: string): Promise<JourneyQuoteResult>;
}

export function createDefaultPricingEngine(): PricingEngine {
  return new PricingEngine(
    new PricingValidationPipeline({
      requestValidator: new PricingRequestValidator(),
      commercialValidator: new CommercialValidator(),
      integrityValidator: new PricingIntegrityValidator(),
      quoteReadinessValidator: new QuoteReadinessValidator(),
    }),
    new PricingPolicyPipeline(),
    new PricingCalculatorPipeline(),
  );
}
const groupTotals = {
  2: 51376,
  3: 64260,
  4: 73680,
  5: 83100,
  6: 95160,
  7: 106190,
  8: 115680,
} as const;

function groupTotalFor(journey: Journey, travellerCount: number): number {
  const hasCapeWinelandsSupplierOffers = journey.identity.id === CAPE_WINELANDS_JOURNEY_ID
    && journey.accommodation.some((option) => option.provider === "hotelbeds");
  return hasCapeWinelandsSupplierOffers
    ? groupTotals[travellerCount as keyof typeof groupTotals] ?? 0
    : 0;
}

// The accommodation currency cannot be safely combined with the ZAR group component: no total is produced.
function currencyUnconfirmed(
  journeyId: string,
  journey: Journey,
  selections: ReadonlyArray<AccommodationSelectionInput>,
  travellerCount: number,
): JourneyQuoteResult {
  const amount = groupTotalFor(journey, travellerCount);
  return {
    status: "CURRENCY_UNCONFIRMED",
    journeyId,
    journey,
    selections,
    groupComponent: amount > 0 ? { amount, currency: Currency.ZAR } : undefined,
  };
}

function createPricingRequest(
  journey: Journey,
  pricingInputs: ReadonlyArray<JourneyAccommodationPricingInput>,
  travellerCount: number,
): PricingEngineRequest {
  const currency = Currency.ZAR;
  const groupTotal = groupTotalFor(journey, travellerCount);
  const baseRequest = {
    currency,
    summary: createPricingSummary({
      productId: journey.identity.id,
      productType: "DYNAMIC_HOMEPAGE_JOURNEY",
      description: `${journey.classification.category} journey`,
    }),
    breakdown: createPricingBreakdown({
      lineItems: [createPricingLineItem({
        code: "BASE",
        label: journey.identity.id === CAPE_WINELANDS_JOURNEY_ID ? "Go Cape Tours journey component" : "Base package",
        unitAmount: createMoney({ amount: groupTotal, currency }),
        totalAmount: createMoney({ amount: groupTotal, currency }),
        quantity: 1,
      })],
    }),
    taxes: createTaxBreakdown({
      entries: [createTax({
        code: "VAT",
        type: TaxType.VAT,
        amount: createMoney({ amount: 0, currency }),
      })],
      total: createMoney({ amount: 0, currency }),
    }),
    fees: [createFee({
      code: "SERVICE_FEE",
      label: "Service fee",
      amount: createMoney({ amount: 0, currency }),
    })],
    discounts: [],
    markups: [],
    commissions: [],
    promotions: [],
    totals: createPricingTotal({
      subtotal: createMoney({ amount: groupTotal, currency }),
      taxTotal: createMoney({ amount: 0, currency }),
      feeTotal: createMoney({ amount: 0, currency }),
      discountTotal: createMoney({ amount: 0, currency }),
      markupTotal: createMoney({ amount: 0, currency }),
      commissionTotal: createMoney({ amount: 0, currency }),
      grandTotal: createMoney({ amount: groupTotal, currency }),
    }),
  };

  return {
    requestId: `quote-${journey.identity.id}`,
    travellerCount,
    destination: journey.destinations[0]?.name,
    market: "ZA",
    salesChannel: "DIRECT",
    pricingRequest: withAccommodationPricingInputs(baseRequest, pricingInputs),
  };
}

export class DefaultJourneyQuoteService implements JourneyQuoteService {
  public constructor(
    private readonly resolver: DynamicHomepageJourneyResolver,
    private readonly pricingEngine: PricingEngine,
    private readonly selectionStore: JourneySelectionStore = journeySelectionStore,
  ) {}

  public async priceJourney(
    journeyId: string,
    selections: ReadonlyArray<AccommodationSelectionInput>,
  ): Promise<JourneyQuoteResult> {
    const resolution = await this.resolver.resolve(journeyId);
    if (resolution.status !== "RESOLVED" || !resolution.journey) {
      return { status: resolution.status === "RESOLVED" ? "UNAVAILABLE" : resolution.status, journeyId, selections };
    }

    const expectedStops = new Set(resolution.journey.accommodation.map((option, index) =>
      option.packageStop?.stopId ?? `legacy-stop-${index + 1}`,
    ));
    if (selections.length !== expectedStops.size) {
      return { status: "INVALID", journeyId, journey: resolution.journey, selections };
    }

    const pricingInputs: JourneyAccommodationPricingInput[] = [];
    let travellerCount = 0;
    const selectedStopIds = new Set<string>();
    for (const selection of selections) {
      const option = resolution.journey.accommodation.find((candidate) =>
        candidate.accommodationId === selection.accommodationId
        && (!selection.stopId || candidate.packageStop?.stopId === selection.stopId),
      );
      const roomSelections = selection.roomSelections ?? (selection.roomReference && selection.rateReference
        ? [{ roomReference: selection.roomReference, rateReference: selection.rateReference }]
        : []);
      if (roomSelections.length === 0) {
        return { status: "INVALID", journeyId, journey: resolution.journey, selections };
      }
      const selectedRoomRates = roomSelections.map((roomSelection) => {
        const room = option?.roomOptions?.find((candidate) =>
          candidate.reference.provider === roomSelection.roomReference.provider
          && candidate.reference.opaqueReference === roomSelection.roomReference.opaqueReference,
        );
        const rate = room?.rateOptions.find((candidate) =>
          candidate.reference.provider === roomSelection.rateReference.provider
          && candidate.reference.opaqueReference === roomSelection.rateReference.opaqueReference,
        );
        return room && rate ? { room, rate } : undefined;
      });
      const room = selectedRoomRates[0]?.room;
      const rate = selectedRoomRates[0]?.rate;

      if (!option || !room || !rate || selectedRoomRates.some((item) => !item)) {
        return { status: "INVALID", journeyId, journey: resolution.journey, selections };
      }
      const stopId = option.packageStop?.stopId ?? selection.stopId ?? option.accommodationId;
      if (selectedStopIds.has(stopId)) {
        return { status: "INVALID", journeyId, journey: resolution.journey, selections };
      }
      selectedStopIds.add(stopId);
      if (selectedRoomRates.some((item) => item!.rate.status !== "BOOKABLE")) {
        return { status: "RECHECK_REQUIRED", journeyId, journey: resolution.journey, selections };
      }

      // Room rates of one stop in different currencies cannot be summed into a single stop price.
      if (selectedRoomRates.some((item) => item!.rate.pricing.currency !== rate.pricing.currency)) {
        const requestedTravellers = option.requestedOccupancy?.rooms
          .reduce((total, roomOccupancy) => total + roomOccupancy.adults + roomOccupancy.children, 0) ?? 0;
        return currencyUnconfirmed(journeyId, resolution.journey, selections, requestedTravellers);
      }

      const selected = selectJourneyAccommodation(option, {
        accommodationId: selection.accommodationId,
        packageStopId: selection.stopId,
        roomReference: roomSelections[0]!.roomReference,
        rateReference: roomSelections[0]!.rateReference,
        roomSelections,
      });
      const pricingInput = selected.pricingInput;
      if (!pricingInput) {
        return { status: "INVALID", journeyId, journey: resolution.journey, selections };
      }
      pricingInputs.push(pricingInput);
      const allocatedTravellerCount = (pricingInput.occupancy ?? rate.occupancy ?? option.requestedOccupancy)?.rooms
        .reduce((total, roomOccupancy) => total + roomOccupancy.adults + roomOccupancy.children, 0) ?? 0;
      if (travellerCount !== 0 && travellerCount !== allocatedTravellerCount) {
        return { status: "INVALID", journeyId, journey: resolution.journey, selections };
      }
      travellerCount = allocatedTravellerCount;
    }
    if (selectedStopIds.size !== expectedStops.size) {
      return { status: "INVALID", journeyId, journey: resolution.journey, selections };
    }

    let pricingRequest: PricingEngineRequest;
    try {
      pricingRequest = createPricingRequest(resolution.journey, pricingInputs, travellerCount);
    } catch (error) {
      if (error instanceof AccommodationCurrencyError) {
        return currencyUnconfirmed(journeyId, resolution.journey, selections, travellerCount);
      }
      throw error;
    }
    const pricing = await this.pricingEngine.execute(pricingRequest);
    return {
      status: pricing.successful && pricing.pricing ? "PRICED" : "UNAVAILABLE",
      journeyId,
      journey: resolution.journey,
      pricing,
      selections,
    };
  }

  public async priceCurrentJourney(journeyId: string): Promise<JourneyQuoteResult> {
    return this.priceJourney(journeyId, this.selectionStore.find(journeyId));
  }
}