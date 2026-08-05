import {
  AccommodationSearchCriteria,
  AccommodationSearchQuery,
  AccommodationProviderCapabilityType,
  AccommodationProvider,
  AccommodationSearchSource,
  DefaultAccommodationEngine,
  InMemoryProviderRegistry,
  ProviderRegistry,
} from "@application/accommodation";

function createCriteria(): AccommodationSearchCriteria {
  return {
    destination: "Cape Town",
    checkInDate: new Date("2026-09-10T00:00:00.000Z"),
    checkOutDate: new Date("2026-09-14T00:00:00.000Z"),
    adults: 2,
    children: 0,
    rooms: 1,
  };
}

function createQuery(): AccommodationSearchQuery {
  return {
    criteria: createCriteria(),
    context: {
      requestId: "req-engine-001",
      source: AccommodationSearchSource.INTERNAL,
      channel: "application",
      locale: "en-ZA",
      currency: "ZAR",
      timestamp: new Date("2026-08-05T00:00:00.000Z"),
    },
  };
}

describe("AccommodationEngine namespace scaffold", () => {
  it("supports namespace imports and engine construction", () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const engine = new DefaultAccommodationEngine(registry);

    expect(engine).toBeDefined();
  });

  it("exposes provider abstraction and registry scaffold", () => {
    const provider: AccommodationProvider = {
      providerId: "stub",
      capabilities: {
        capabilities: [
          {
            identifier: "cap.search",
            type: AccommodationProviderCapabilityType.SEARCH,
            name: "Search",
            description: "Search capability",
            version: "1.0.0",
            enabled: true,
            deprecated: false,
            experimental: false,
            features: {
              features: [],
            },
          },
        ],
      },
      async search() {
        return {
          accommodations: [],
          metadata: {
            provider: "stub",
            generatedAt: new Date("2026-08-05T00:00:00.000Z"),
            version: "1.0.0",
          },
        };
      },
    };

    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    registry.register(provider);

    expect(registry.resolve("stub")).toBe(provider);
  });

  it("compiles accommodation namespace barrels", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const engine = new DefaultAccommodationEngine(registry);

    await expect(engine.search(createQuery())).resolves.toEqual({
      accommodations: [],
      metadata: expect.objectContaining({
        version: "1.0.0",
      }),
    });
  });
});
