import { createPricingEngineResult, PricingEngineRequest } from "../../../pricing";
import { DefaultDynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { AccommodationSelectionInput, DefaultAccommodationSelectionService } from "./accommodation-selection-service";
import { DefaultJourneyQuoteService, createDefaultPricingEngine } from "./journey-quote-service";
import { Journey, JourneyLifecycle, JourneyStatus } from "../../../journeys";

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

  it("passes canonical accommodation pricing inputs to the pricing engine", async (): Promise<void> => {
    const resolver = new DefaultDynamicHomepageJourneyResolver();
    const execute = jest.fn(async (request: PricingEngineRequest): Promise<ReturnType<typeof createPricingEngineResult>> => createPricingEngineResult({
      successful: true,
      pricing: null,
      metadata: {
        completedAt: new Date(),
        version: "1.0.0",
        requestId: request.requestId ?? "quote",
        stages: [],
      },
    }));
    await new DefaultAccommodationSelectionService(resolver).selectAccommodation("journey-homepage-journey-001", [selection]);
    await new DefaultJourneyQuoteService(resolver, { execute } as never).priceCurrentJourney("journey-homepage-journey-001");

    const request = execute.mock.calls[0]?.[0] as PricingEngineRequest;
    const accommodationItems = request.pricingRequest.breakdown?.lineItems.filter((item) => item.code.startsWith("ACCOMMODATION:")) ?? [];

    expect(accommodationItems.length).toBeGreaterThan(0);
    expect(request.pricingRequest.breakdown?.lineItems.some((item) => item.code === "BASE")).toBe(true);
    expect(request.pricingRequest.totals?.grandTotal.amount).toBe(18950);
    expect(accommodationItems[0]?.metadata?.packageStopId).toBeDefined();
  });

  it("returns the current deterministic quote from the application journey", async (): Promise<void> => {
    const resolver = new DefaultDynamicHomepageJourneyResolver();
    await new DefaultAccommodationSelectionService(resolver).selectAccommodation("journey-homepage-journey-001", [selection]);
    const result = await new DefaultJourneyQuoteService(
      resolver,
      (await import("./journey-quote-service")).createDefaultPricingEngine(),
    ).priceCurrentJourney("journey-homepage-journey-001");

    expect(result.status).toBe("PRICED");
    expect(result.pricing?.pricing?.currency).toBe("ZAR");
    expect(result.pricing?.pricing?.totals.grandTotal.amount).toBe(18950);
  });

  it("prices the GCT group component once for the party across multiple accommodation stops", async () => {
    const journey = Journey.create({
      identity: { id: "journey-homepage-journey-001" },
      classification: { type: "PACKAGE", category: "SIGNATURE" },
      metadata: { created: new Date(), modified: new Date(), version: "1.0.0", source: "INT-004" },
      status: JourneyStatus.PUBLISHED,
      lifecycle: JourneyLifecycle.BOOKABLE,
      duration: { days: 4, nights: 3, description: "4 Days / 3 Nights" },
      destinations: [{ name: "Cape Winelands" }],
      accommodation: ["stop-1", "stop-2"].map((stopId, index) => ({
        accommodationId: `hotel-${stopId}`,
        name: `Hotel ${stopId}`,
        provider: "hotelbeds",
        packageStop: {
          packageId: "journey-homepage-journey-001",
          stopId,
          stopOrder: index + 1,
          checkInDate: new Date(`2026-11-0${index + 1}T00:00:00.000Z`),
          checkOutDate: new Date(`2026-11-0${index + 2}T00:00:00.000Z`),
        },
        requestedOccupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
        roomOptions: [{
          reference: { provider: "hotelbeds", opaqueReference: `room-${stopId}` },
          name: "Double Room",
          rateOptions: [{
            reference: { provider: "hotelbeds", opaqueReference: `rate-${stopId}` },
            status: "BOOKABLE",
            pricing: { amount: 1000, currency: "ZAR", basis: "TOTAL_STAY" },
            occupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
            cancellationPolicies: [],
            taxes: [],
          }],
        }],
      })),
      experiences: [],
      travellerRules: { minimumTravellers: 2, maximumTravellers: 8, privateOnly: true },
      tags: [],
    });
    const execute = jest.fn(async (request: PricingEngineRequest): Promise<ReturnType<typeof createPricingEngineResult>> => createPricingEngineResult({
      successful: true,
      pricing: null,
      metadata: {
        completedAt: new Date(),
        version: "1.0.0",
        requestId: request.requestId ?? "quote",
        stages: [],
      },
    }));
    const resolver = {
      resolve: async (): Promise<{ readonly status: "RESOLVED"; readonly journey: Journey }> => ({
        status: "RESOLVED",
        journey,
      }),
    };

    await new DefaultJourneyQuoteService(resolver, { execute } as never).priceJourney(
      journey.identity.id,
      ["stop-1", "stop-2"].map((stopId) => ({
        stopId,
        accommodationId: `hotel-${stopId}`,
        roomReference: { provider: "hotelbeds", opaqueReference: `room-${stopId}` },
        rateReference: { provider: "hotelbeds", opaqueReference: `rate-${stopId}` },
      })),
    );

    const request = execute.mock.calls[0]?.[0] as PricingEngineRequest;
    const base = request.pricingRequest.breakdown?.lineItems.find((item) => item.code === "BASE");
    expect(base?.totalAmount.amount).toBe(51376);
    expect(request.pricingRequest.totals?.grandTotal.amount).toBe(53376);
  });
});

function createSupplierJourney(currencies: ReadonlyArray<string>): Journey {
  return Journey.create({
    identity: { id: "journey-homepage-journey-001" },
    classification: { type: "PACKAGE", category: "SIGNATURE" },
    metadata: { created: new Date(), modified: new Date(), version: "1.0.0", source: "INT-004.2" },
    status: JourneyStatus.PUBLISHED,
    lifecycle: JourneyLifecycle.BOOKABLE,
    duration: { days: 4, nights: 3, description: "4 Days / 3 Nights" },
    destinations: [{ name: "Cape Winelands" }],
    accommodation: ["stop-1", "stop-2"].map((stopId, index) => ({
      accommodationId: `hotel-${stopId}`,
      name: `Hotel ${stopId}`,
      provider: "hotelbeds",
      packageStop: {
        packageId: "journey-homepage-journey-001",
        stopId,
        stopOrder: index + 1,
        checkInDate: new Date(`2026-11-0${index + 1}T00:00:00.000Z`),
        checkOutDate: new Date(`2026-11-0${index + 2}T00:00:00.000Z`),
      },
      requestedOccupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
      roomOptions: [{
        reference: { provider: "hotelbeds", opaqueReference: `room-${stopId}` },
        name: "Double Room",
        rateOptions: [{
          reference: { provider: "hotelbeds", opaqueReference: `rate-${stopId}` },
          status: "BOOKABLE" as const,
          pricing: { amount: 1000, currency: currencies[index]!, basis: "TOTAL_STAY" },
          occupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
          cancellationPolicies: [],
          taxes: [],
        }],
      }],
    })),
    experiences: [],
    travellerRules: { minimumTravellers: 2, maximumTravellers: 8, privateOnly: true },
    tags: [],
  });
}

const supplierSelections: ReadonlyArray<AccommodationSelectionInput> = ["stop-1", "stop-2"].map((stopId) => ({
  stopId,
  accommodationId: `hotel-${stopId}`,
  roomReference: { provider: "hotelbeds", opaqueReference: `room-${stopId}` },
  rateReference: { provider: "hotelbeds", opaqueReference: `rate-${stopId}` },
}));

function resolverFor(journey: () => Journey): ConstructorParameters<typeof DefaultJourneyQuoteService>[0] {
  return { resolve: async () => ({ status: "RESOLVED" as const, journey: journey() }) } as never;
}

describe("INT-004.2 accommodation currency handling", () => {
  it.each([
    ["EUR", ["EUR", "EUR"]],
    ["unknown", ["UNKNOWN", "UNKNOWN"]],
    ["missing", ["", ""]],
    ["mixed across stops", ["ZAR", "EUR"]],
  ])("returns a controlled result without pricing for %s supplier currency", async (_label, currencies) => {
    const execute = jest.fn();
    const journey = createSupplierJourney(currencies);

    const result = await new DefaultJourneyQuoteService(resolverFor(() => journey), { execute } as never)
      .priceJourney(journey.identity.id, supplierSelections);

    expect(result.status).toBe("CURRENCY_UNCONFIRMED");
    expect(result.pricing).toBeUndefined();
    expect(result.groupComponent).toEqual({ amount: 51376, currency: "ZAR" });
    expect(result.selections).toBe(supplierSelections);
    expect(execute).not.toHaveBeenCalled();
  });

  it("does not combine room rates of one stop that use different currencies", async () => {
    const journey = createSupplierJourney(["ZAR", "ZAR"]);
    const mixed = Journey.create({
      ...journey,
      accommodation: journey.accommodation.map((option) => ({
        ...option,
        requestedOccupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }, { adults: 2, children: 0, childAges: [] }] },
        roomOptions: [
          ...option.roomOptions!,
          {
            ...option.roomOptions![0]!,
            reference: { provider: "hotelbeds", opaqueReference: `${option.packageStop!.stopId}-room-b` },
            rateOptions: [{
              ...option.roomOptions![0]!.rateOptions[0]!,
              reference: { provider: "hotelbeds", opaqueReference: `${option.packageStop!.stopId}-rate-b` },
              pricing: { amount: 900, currency: "EUR", basis: "TOTAL_STAY" },
            }],
          },
        ],
      })),
    } as never);
    const selections = supplierSelections.map((selection) => ({
      ...selection,
      roomSelections: [
        { roomReference: selection.roomReference!, rateReference: selection.rateReference! },
        {
          roomReference: { provider: "hotelbeds", opaqueReference: `${selection.stopId}-room-b` },
          rateReference: { provider: "hotelbeds", opaqueReference: `${selection.stopId}-rate-b` },
        },
      ],
    }));
    const execute = jest.fn();

    const result = await new DefaultJourneyQuoteService(resolverFor(() => mixed), { execute } as never)
      .priceJourney(mixed.identity.id, selections);

    expect(result.status).toBe("CURRENCY_UNCONFIRMED");
    expect(execute).not.toHaveBeenCalled();
  });

  it("still prices compatible ZAR supplier amounts once, alongside the ZAR group component", async () => {
    const execute = jest.fn(async (request: PricingEngineRequest) => createPricingEngineResult({
      successful: true,
      pricing: null,
      metadata: { completedAt: new Date(), version: "1.0.0", requestId: request.requestId ?? "quote", stages: [] },
    }));
    const journey = createSupplierJourney(["ZAR", "ZAR"]);

    await new DefaultJourneyQuoteService(resolverFor(() => journey), { execute } as never)
      .priceJourney(journey.identity.id, supplierSelections);

    const request = execute.mock.calls[0]?.[0] as PricingEngineRequest;
    expect(request.pricingRequest.totals?.grandTotal.amount).toBe(53376);
  });

  it("does not let a previously valid quote survive a change to incompatible accommodation pricing", async () => {
    let current = createSupplierJourney(["ZAR", "ZAR"]);
    const service = new DefaultJourneyQuoteService(resolverFor(() => current), createDefaultPricingEngine());

    const valid = await service.priceJourney(current.identity.id, supplierSelections);
    expect(valid.status).toBe("PRICED");
    expect(valid.pricing?.pricing?.totals.grandTotal.amount).toBe(53376);

    current = createSupplierJourney(["EUR", "EUR"]);
    const changed = await service.priceJourney(current.identity.id, supplierSelections);
    expect(changed.status).toBe("CURRENCY_UNCONFIRMED");
    expect(changed.pricing).toBeUndefined();
  });
});
