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
} from "../../../pricing";
import { AccommodationSelectionInput } from "./accommodation-selection-service";
import { DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { JourneySelectionStore, journeySelectionStore } from "./journey-selection-store";

export type JourneyQuoteStatus = "PRICED" | "RECHECK_REQUIRED" | "UNAVAILABLE" | "INVALID" | "NOT_FOUND";

export interface JourneyQuoteResult {
  readonly status: JourneyQuoteStatus;
  readonly journeyId: string;
  readonly journey?: Journey;
  readonly pricing?: PricingEngineResult;
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
function createPricingRequest(
  journey: Journey,
  pricingInputs: ReadonlyArray<JourneyAccommodationPricingInput>,
  travellerCount: number,
): PricingEngineRequest {
  const currency = Currency.ZAR;
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
        label: "Base package",
        unitAmount: createMoney({ amount: 0, currency }),
        totalAmount: createMoney({ amount: 0, currency }),
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
      subtotal: createMoney({ amount: 0, currency }),
      taxTotal: createMoney({ amount: 0, currency }),
      feeTotal: createMoney({ amount: 0, currency }),
      discountTotal: createMoney({ amount: 0, currency }),
      markupTotal: createMoney({ amount: 0, currency }),
      commissionTotal: createMoney({ amount: 0, currency }),
      grandTotal: createMoney({ amount: 0, currency }),
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

    if (selections.length !== resolution.journey.accommodation.length) {
      return { status: "INVALID", journeyId, journey: resolution.journey, selections };
    }

    const pricingInputs: JourneyAccommodationPricingInput[] = [];
    let travellerCount = 0;
    for (const selection of selections) {
      const option = resolution.journey.accommodation.find((candidate) =>
        candidate.accommodationId === selection.accommodationId
        && (!selection.stopId || candidate.packageStop?.stopId === selection.stopId),
      );
      const room = option?.roomOptions?.find((candidate) =>
        candidate.reference.provider === selection.roomReference.provider
        && candidate.reference.opaqueReference === selection.roomReference.opaqueReference,
      );
      const rate = room?.rateOptions.find((candidate) =>
        candidate.reference.provider === selection.rateReference.provider
        && candidate.reference.opaqueReference === selection.rateReference.opaqueReference,
      );

      if (!option || !room || !rate) {
        return { status: "INVALID", journeyId, journey: resolution.journey, selections };
      }
      if (rate.status !== "BOOKABLE") {
        return { status: "RECHECK_REQUIRED", journeyId, journey: resolution.journey, selections };
      }

      const selected = selectJourneyAccommodation(option, {
        accommodationId: selection.accommodationId,
        packageStopId: selection.stopId,
        roomReference: selection.roomReference,
        rateReference: selection.rateReference,
      });
      const pricingInput = selected.pricingInput;
      if (!pricingInput) {
        return { status: "INVALID", journeyId, journey: resolution.journey, selections };
      }
      pricingInputs.push(pricingInput);
      travellerCount += (pricingInput.occupancy ?? rate.occupancy ?? option.requestedOccupancy)?.rooms
        .reduce((total, roomOccupancy) => total + roomOccupancy.adults + roomOccupancy.children, 0) ?? 0;
    }

    const pricing = await this.pricingEngine.execute(createPricingRequest(resolution.journey, pricingInputs, travellerCount));
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