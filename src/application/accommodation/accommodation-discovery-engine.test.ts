import {
  AccommodationQueryValidator,
  AccommodationProvider,
  AccommodationSearchContext,
  AccommodationProviderCapabilityType,
  AccommodationSearchCriteria,
  AccommodationSearchResult,
  AccommodationSearchQuery,
  AccommodationSearchSource,
  DefaultAccommodationDiscoveryEngine,
  InMemoryProviderRegistry,
  ProviderRegistry,
} from "@application/accommodation";

function createCriteria(): AccommodationSearchCriteria {
  return {
    destination: "Cape Town",
    checkInDate: new Date("2026-09-10T00:00:00.000Z"),
    checkOutDate: new Date("2026-09-14T00:00:00.000Z"),
    adults: 2,
    children: 1,
    rooms: 1,
    category: "Villa",
    minimumRating: 4,
    amenities: ["Pool"],
    collections: ["Family"],
  };
}

function createContext(): AccommodationSearchContext {
  return {
    requestId: "req-discovery-001",
    source: AccommodationSearchSource.INTERNAL,
    channel: "application",
    locale: "en-ZA",
    currency: "ZAR",
    timestamp: new Date("2026-08-05T00:00:00.000Z"),
  };
}

function createQuery(): AccommodationSearchQuery {
  return {
    criteria: createCriteria(),
    context: createContext(),
  };
}

function createProvider(
  providerId: string,
  capabilities: ReadonlyArray<AccommodationProviderCapabilityType>,
  behavior?: {
    throwError?: boolean;
    accommodations?: ReadonlyArray<{ id: string; name: string }>;
    onSearch?: (criteria: AccommodationSearchCriteria) => void;
  },
): AccommodationProvider {
  return {
    providerId,
    capabilities: {
      capabilities: capabilities.map((type, index) => ({
        identifier: `${providerId}.${type}.${index}`,
        type,
        name: `${type} capability`,
        description: `${type} support`,
        version: "1.0.0",
        enabled: true,
        deprecated: false,
        experimental: false,
        features: {
          features: [],
        },
      })),
    },
    async search(criteria: AccommodationSearchCriteria): Promise<AccommodationSearchResult> {
      behavior?.onSearch?.(criteria);

      if (behavior?.throwError) {
        throw new Error(`Provider failure: ${providerId}`);
      }

      return {
        accommodations: (behavior?.accommodations ?? []).map((accommodation) => ({
          identity: {
            id: accommodation.id,
            name: accommodation.name,
          },
          category: "Villa",
          location: {
            country: "ZA",
            region: "WC",
            city: "Cape Town",
            suburb: "Atlantic Seaboard",
            latitude: -33.9249,
            longitude: 18.4241,
          },
          rating: {
            stars: 5,
            classification: "Luxury",
          },
          images: [],
          amenities: [],
          policies: [],
          contacts: [],
          providerReference: {
            provider: providerId,
            providerAccommodationId: accommodation.id,
          },
        })),
        metadata: {
          provider: providerId,
          generatedAt: new Date("2026-08-05T00:00:00.000Z"),
          version: "1.0.0",
        },
      };
    },
  };
}

describe("AccommodationDiscoveryEngine", () => {
  it("constructs canonical search criteria", () => {
    const criteria = createCriteria();

    expect(criteria.destination).toBe("Cape Town");
    expect(criteria.adults).toBe(2);
    expect(criteria.category).toBe("Villa");
    expect(criteria.amenities).toEqual(["Pool"]);
  });

  it("discovers providers supporting SEARCH and delegates canonical criteria", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const searchCalls: AccommodationSearchCriteria[] = [];
    registry.register(
      createProvider("hotelbeds", [AccommodationProviderCapabilityType.SEARCH], {
        accommodations: [{ id: "hb-1", name: "Hotelbeds One" }],
        onSearch(criteria) {
          searchCalls.push(criteria);
        },
      }),
    );
    registry.register(createProvider("content-only", [AccommodationProviderCapabilityType.CONTENT]));

    const engine = new DefaultAccommodationDiscoveryEngine(registry, new AccommodationQueryValidator());
    const query = createQuery();
    const result = await engine.search(query);

    expect(searchCalls).toHaveLength(1);
    expect(searchCalls[0]).toBe(query.criteria);
    expect(result.accommodations).toHaveLength(1);
    expect(result.accommodations[0]?.identity.id).toBe("hb-1");
  });

  it("aggregates results from multiple SEARCH providers without ranking", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    registry.register(
      createProvider("hotelbeds", [AccommodationProviderCapabilityType.SEARCH], {
        accommodations: [{ id: "hb-1", name: "Hotelbeds One" }],
      }),
    );
    registry.register(
      createProvider("partner-x", [AccommodationProviderCapabilityType.SEARCH], {
        accommodations: [{ id: "px-1", name: "Partner X One" }],
      }),
    );

    const engine = new DefaultAccommodationDiscoveryEngine(registry, new AccommodationQueryValidator());
    const result = await engine.search(createQuery());

    expect(result.accommodations.map((accommodation) => accommodation.identity.id)).toEqual([
      "hb-1",
      "px-1",
    ]);
  });

  it("isolates provider failures while preserving successful provider results", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    registry.register(
      createProvider("hotelbeds", [AccommodationProviderCapabilityType.SEARCH], {
        accommodations: [{ id: "hb-1", name: "Hotelbeds One" }],
      }),
    );
    registry.register(
      createProvider("broken-provider", [AccommodationProviderCapabilityType.SEARCH], {
        throwError: true,
      }),
    );

    const engine = new DefaultAccommodationDiscoveryEngine(registry, new AccommodationQueryValidator());
    const result = await engine.search(createQuery());

    expect(result.accommodations).toHaveLength(1);
    expect(result.accommodations[0]?.providerReference.provider).toBe("hotelbeds");
  });

  it("compiles discovery engine exports through the accommodation namespace", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const engine = new DefaultAccommodationDiscoveryEngine(registry, new AccommodationQueryValidator());
    const result = await engine.search(createQuery());

    expect(result.accommodations).toEqual([]);
  });

  it("rejects invalid queries before provider discovery begins", async () => {
    let providerDiscoveryInvoked = false;
    const registry: ProviderRegistry = {
      register() {
        throw new Error("register should not be called");
      },
      unregister() {
        throw new Error("unregister should not be called");
      },
      resolve() {
        return undefined;
      },
      resolveAll() {
        return [];
      },
      findProviders() {
        providerDiscoveryInvoked = true;
        throw new Error("provider discovery should not be reached for invalid queries");
      },
      capabilities() {
        return undefined;
      },
      features() {
        return [];
      },
      supports() {
        return false;
      },
    };

    const validator = {
      validate(): { valid: false; errors: Array<{ code: number; field: string; message: string }> } {
        return {
          valid: false,
          errors: [
            {
              code: 0,
              field: "criteria.destination",
              message: "Destination is required.",
            },
          ],
        };
      },
    };

    const engine = new DefaultAccommodationDiscoveryEngine(registry, validator as AccommodationQueryValidator);

    await expect(engine.search(createQuery())).rejects.toThrow("Accommodation query validation failed");
    expect(providerDiscoveryInvoked).toBe(false);
  });
});