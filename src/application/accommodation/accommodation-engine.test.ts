import {
  AccommodationProviderCapabilityType,
  AccommodationProvider,
  DefaultAccommodationEngine,
  InMemoryProviderRegistry,
  ProviderRegistry,
} from "@application/accommodation";

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
      async search(): Promise<void> {
        return;
      },
    };

    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    registry.register(provider);

    expect(registry.resolve("stub")).toBe(provider);
  });

  it("compiles accommodation namespace barrels", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const engine = new DefaultAccommodationEngine(registry);

    await expect(engine.search()).resolves.toBeUndefined();
  });
});
