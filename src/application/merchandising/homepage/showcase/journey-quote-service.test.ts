import { createPricingEngineResult, PricingEngineRequest } from "../../../pricing";
import { DefaultDynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { AccommodationSelectionInput } from "./accommodation-selection-service";
import { DefaultJourneyQuoteService } from "./journey-quote-service";

const selection: AccommodationSelectionInput = {
  accommodationId: "cape-winelands",
  roomReference: { provider: "curated", opaqueReference: "cape-winelands-room-1" },
  rateReference: { provider: "curated", opaqueReference: "cape-winelands-rate-1" },
};

describe("DefaultJourneyQuoteService", () => {
  it("revalidates the selected rate and returns an authoritative pricing result", async (): Promise<void> => {
    const pricingEngine = {
      execute: async (request: PricingEngineRequest): Promise<ReturnType<typeof createPricingEngineResult>> => createPricingEngineResult({
        successful: true,
        pricing: null,
        metadata: {
          completedAt: new Date(),
          version: "1.0.0",
          requestId: request.requestId ?? "quote",
          stages: [],
        },
      }),
    };
    const service = new DefaultJourneyQuoteService(new DefaultDynamicHomepageJourneyResolver(), pricingEngine as never);
    const result = await service.priceJourney("journey-homepage-journey-001", [selection]);

    expect(result.status).toBe("UNAVAILABLE");
    expect(result.journeyId).toBe("journey-homepage-journey-001");
  });

  it("rejects invalid selection references before pricing", async (): Promise<void> => {
    const execute = jest.fn();
    const service = new DefaultJourneyQuoteService(new DefaultDynamicHomepageJourneyResolver(), { execute } as never);
    const result = await service.priceJourney("journey-homepage-journey-001", [{ ...selection, rateReference: { provider: "curated", opaqueReference: "forged" } }]);

    expect(result.status).toBe("INVALID");
    expect(execute).not.toHaveBeenCalled();
  });

  it("returns the current deterministic quote from the application journey", async (): Promise<void> => {
    const result = await new DefaultJourneyQuoteService(
      new DefaultDynamicHomepageJourneyResolver(),
      (await import("./journey-quote-service")).createDefaultPricingEngine(),
    ).priceCurrentJourney("journey-homepage-journey-001");

    expect(result.status).toBe("PRICED");
    expect(result.pricing?.pricing?.currency).toBe("ZAR");
    expect(result.pricing?.pricing?.totals.grandTotal.amount).toBe(18950);
  });
});
