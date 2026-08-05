import {
  AccommodationProviderCapabilityType,
  AccommodationProvider,
  InMemoryProviderRegistry,
  ProviderRegistry,
} from "@application/accommodation";

function createProvider(
  providerId: string,
  capabilityTypes: ReadonlyArray<AccommodationProviderCapabilityType> = [],
): AccommodationProvider {
  return {
    providerId,
    capabilities: {
      capabilities: capabilityTypes.map((type, index) => ({
        identifier: `${providerId}.${type}.${index}`,
        type,
        name: `${type} capability`,
        description: `${type} support`,
        version: "1.0.0",
        enabled: true,
        deprecated: false,
        experimental: false,
        features: {
          features: [
            {
              id: `${providerId}.${type}.feature.${index}`,
              name: `${type} feature`,
              description: `${type} feature support`,
            },
          ],
        },
      })),
    },
    async search() {
      return {
        accommodations: [],
        metadata: {
          provider: providerId,
          generatedAt: new Date("2026-08-05T00:00:00.000Z"),
          version: "1.0.0",
        },
      };
    },
  };
}

describe("ProviderRegistry behavior", () => {
  it("registers and resolves providers by identifier", () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const provider = createProvider("hotelbeds", [AccommodationProviderCapabilityType.SEARCH]);

    registry.register(provider);

    expect(registry.resolve("hotelbeds")).toBe(provider);
  });

  it("rejects duplicate provider registrations", () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const provider = createProvider("hotelbeds", [AccommodationProviderCapabilityType.SEARCH]);

    registry.register(provider);

    expect(() => registry.register(provider)).toThrow("Provider already registered: hotelbeds");
  });

  it("unregisters known providers and ignores unknown providers", () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const provider = createProvider("hotelbeds", [AccommodationProviderCapabilityType.SEARCH]);

    registry.register(provider);
    registry.unregister("hotelbeds");
    registry.unregister("unknown-provider");

    expect(registry.resolve("hotelbeds")).toBeUndefined();
  });

  it("resolves all providers as an immutable view", () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const providerA = createProvider("hotelbeds", [
      AccommodationProviderCapabilityType.SEARCH,
      AccommodationProviderCapabilityType.DETAILS,
    ]);
    const providerB = createProvider("partner-x", [AccommodationProviderCapabilityType.AVAILABILITY]);

    registry.register(providerA);
    registry.register(providerB);

    const providers = registry.resolveAll();

    expect(providers).toEqual([providerA, providerB]);
    expect(Object.isFrozen(providers)).toBe(true);
  });

  it("supports placeholder capability discovery", () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const provider = createProvider("hotelbeds", [
      AccommodationProviderCapabilityType.SEARCH,
      AccommodationProviderCapabilityType.IMAGES,
    ]);

    registry.register(provider);

    expect(registry.supports("hotelbeds", AccommodationProviderCapabilityType.SEARCH)).toBe(true);
    expect(registry.supports("hotelbeds", AccommodationProviderCapabilityType.RATES)).toBe(false);
    expect(registry.supports("unknown-provider", AccommodationProviderCapabilityType.SEARCH)).toBe(false);
  });

  it("finds providers by capability type", () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const providerA = createProvider("hotelbeds", [AccommodationProviderCapabilityType.SEARCH]);
    const providerB = createProvider("partner-x", [AccommodationProviderCapabilityType.AVAILABILITY]);

    registry.register(providerA);
    registry.register(providerB);

    expect(registry.findProviders(AccommodationProviderCapabilityType.SEARCH)).toEqual([providerA]);
    expect(registry.findProviders(AccommodationProviderCapabilityType.CONTENT)).toEqual([]);
  });

  it("resolves provider capability set and features", () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const provider = createProvider("hotelbeds", [
      AccommodationProviderCapabilityType.SEARCH,
      AccommodationProviderCapabilityType.IMAGES,
    ]);

    registry.register(provider);

    expect(registry.capabilities("hotelbeds")).toEqual(provider.capabilities);
    expect(registry.features("hotelbeds")).toHaveLength(2);
    expect(registry.features("unknown-provider")).toEqual([]);
  });

  it("compiles registry contracts through namespace exports", () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();

    expect(registry.resolveAll()).toEqual([]);
  });
});
