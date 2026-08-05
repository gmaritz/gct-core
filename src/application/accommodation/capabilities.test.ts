import {
  AccommodationProvider,
  AccommodationProviderCapability,
  AccommodationProviderCapabilityType,
  InMemoryProviderRegistry,
  ProviderCapabilitySet,
  ProviderFeature,
  ProviderFeatureSet,
  ProviderRegistry,
} from "@application/accommodation";

describe("Provider capability framework", () => {
  it("constructs capability descriptor and feature models", () => {
    const feature: ProviderFeature = {
      id: "feature.radius-search",
      name: "Radius Search",
      description: "Supports radius-constrained accommodation search",
    };
    const featureSet: ProviderFeatureSet = {
      features: [feature],
    };
    const capability: AccommodationProviderCapability = {
      identifier: "capability.search.v1",
      type: AccommodationProviderCapabilityType.SEARCH,
      name: "Search",
      description: "Supports canonical accommodation search",
      version: "1.0.0",
      enabled: true,
      deprecated: false,
      experimental: false,
      features: featureSet,
    };

    expect(capability.identifier).toBe("capability.search.v1");
    expect(capability.type).toBe(AccommodationProviderCapabilityType.SEARCH);
    expect(capability.features.features).toEqual([feature]);
  });

  it("constructs provider capability set with immutable arrays", () => {
    const capabilitySet: ProviderCapabilitySet = {
      capabilities: [
        {
          identifier: "capability.images.v1",
          type: AccommodationProviderCapabilityType.IMAGES,
          name: "Images",
          description: "Supports canonical image retrieval",
          version: "1.0.0",
          enabled: true,
          deprecated: false,
          experimental: false,
          features: {
            features: [
              {
                id: "feature.hi-res-images",
                name: "High Resolution Images",
                description: "Provides high resolution imagery",
              },
            ],
          },
        },
      ],
    };

    expect(capabilitySet.capabilities).toHaveLength(1);
    expect(capabilitySet.capabilities[0]?.type).toBe(AccommodationProviderCapabilityType.IMAGES);
  });

  it("discovers providers, capabilities, and features through the registry", () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const provider: AccommodationProvider = {
      providerId: "hotelbeds",
      capabilities: {
        capabilities: [
          {
            identifier: "capability.search.v1",
            type: AccommodationProviderCapabilityType.SEARCH,
            name: "Search",
            description: "Supports canonical accommodation search",
            version: "1.0.0",
            enabled: true,
            deprecated: false,
            experimental: false,
            features: {
              features: [
                {
                  id: "feature.free-text",
                  name: "Free Text Search",
                  description: "Supports free text keyword searching",
                },
              ],
            },
          },
        ],
      },
      async search() {
        return {
          accommodations: [],
          metadata: {
            provider: "hotelbeds",
            generatedAt: new Date("2026-08-05T00:00:00.000Z"),
            version: "1.0.0",
          },
        };
      },
    };

    registry.register(provider);

    expect(registry.findProviders(AccommodationProviderCapabilityType.SEARCH)).toEqual([provider]);
    expect(registry.capabilities("hotelbeds")).toEqual(provider.capabilities);
    expect(registry.features("hotelbeds")[0]?.id).toBe("feature.free-text");
    expect(registry.supports("hotelbeds", AccommodationProviderCapabilityType.SEARCH)).toBe(true);
  });

  it("compiles capability framework through accommodation namespace exports", () => {
    const capabilityType: AccommodationProviderCapabilityType =
      AccommodationProviderCapabilityType.AVAILABILITY;

    expect(capabilityType).toBe(AccommodationProviderCapabilityType.AVAILABILITY);
  });
});
