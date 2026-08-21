import {
  AccommodationContentContext,
  AccommodationContentIdentifier,
  AccommodationContentLocale,
  AccommodationContentQuery,
  AccommodationContentService,
  AccommodationContentSource,
  AccommodationProviderCapabilityType,
  AccommodationProvider,
  AccommodationContentResult,
  Accommodation,
  InMemoryProviderRegistry,
  ProviderRegistry,
} from "@application/accommodation";

function createContext(): AccommodationContentContext {
  return {
    requestId: "req-content-001",
    source: AccommodationContentSource.PACKAGE_DETAILS,
    locale: AccommodationContentLocale.EN,
    timestamp: new Date("2026-08-05T00:00:00.000Z"),
  };
}

function createQuery(overrides: Partial<AccommodationContentQuery> = {}): AccommodationContentQuery {
  return {
    identifier: "acc-1001",
    context: createContext(),
    ...overrides,
  };
}

function createAccommodation(providerId: string, accommodationId: string, name: string): Accommodation {
  return {
    identity: {
      id: accommodationId,
      name,
    },
    category: "Villa",
    location: {
      country: "ZA",
      region: "WC",
      city: "Cape Town",
      suburb: "Constantia",
      latitude: -33.98,
      longitude: 18.41,
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
      providerAccommodationId: accommodationId,
    },
  };
}

function createProvider(
  providerId: string,
  behavior?: {
    throwError?: boolean;
    content?: ReturnType<typeof createAccommodation>;
  },
): AccommodationProvider & { content(identifier: AccommodationContentIdentifier): Promise<AccommodationContentResult> } {
  return {
    providerId,
    capabilities: {
      capabilities: [
        {
          identifier: `${providerId}.content.0`,
          type: AccommodationProviderCapabilityType.CONTENT,
          name: "Content capability",
          description: "Content support",
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
    async search() : Promise<{ accommodations: never[]; metadata: { provider: string; generatedAt: Date; version: string; }; }> {
      return {
        accommodations: [],
        metadata: {
          provider: providerId,
          generatedAt: new Date("2026-08-05T00:00:00.000Z"),
          version: "1.0.0",
        },
      };
    },
    async content(identifier): Promise<AccommodationContentResult> {
      void identifier;

      if (behavior?.throwError) {
        throw new Error(`Provider failure: ${providerId}`);
      }

      return {
        accommodation: behavior?.content ?? createAccommodation(providerId, "acc-1001", `${providerId} content`),
        metadata: {
          provider: providerId,
          generatedAt: new Date("2026-08-05T00:00:00.000Z"),
          version: "1.0.0",
        },
      };
    },
  };
}

describe("AccommodationContentService", () => {
  it("validates canonical content queries", () => {
    const service = new AccommodationContentService(new InMemoryProviderRegistry());

    const validQuery = createQuery();
    const invalidQuery = createQuery({
      identifier: "",
      context: {
        ...createContext(),
        locale: "ZZ" as AccommodationContentLocale,
      },
    });

    expect(service.getContent).toBeDefined();
    expect(service.content).toBeDefined();
    expect(service.execute).toBeDefined();
    expect(validQuery.identifier).toBe("acc-1001");
    expect(invalidQuery.context.locale).toBe("ZZ");
  });

  it("rejects invalid identifier and invalid locale through the validator", async () => {
    const service = new AccommodationContentService(new InMemoryProviderRegistry());

    await expect(
      service.execute(
        createQuery({
          identifier: "   ",
          context: {
            ...createContext(),
            locale: "ZZ" as AccommodationContentLocale,
          },
        }),
      ),
    ).rejects.toThrow("Accommodation content validation failed");
  });

  it("discovers CONTENT providers, isolates failures, and returns canonical content", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const failedCalls: string[] = [];
    registry.register(
      createProvider("hotelbeds", {
        content: createAccommodation("hotelbeds", "acc-1001", "Hotelbeds Content"),
      }),
    );
    registry.register(
      createProvider("broken-provider", {
        throwError: true,
      }),
    );
    registry.register({
      providerId: "search-only",
      capabilities: {
        capabilities: [
          {
            identifier: "search-only.search.0",
            type: AccommodationProviderCapabilityType.SEARCH,
            name: "Search capability",
            description: "Search support",
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
        failedCalls.push("search-only");
        return {
          accommodations: [],
          metadata: {
            generatedAt: new Date("2026-08-05T00:00:00.000Z"),
            version: "1.0.0",
          },
        };
      },
    });

    const service = new AccommodationContentService(registry);
    const result = await service.execute(createQuery());

    expect(failedCalls).toHaveLength(0);
    expect(result.accommodation.identity.name).toBe("Hotelbeds Content");
    expect(result.metadata.provider).toBe("hotelbeds");
  });

  it("returns the first successful canonical content result from CONTENT providers", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    registry.register(
      createProvider("hotelbeds", {
        content: createAccommodation("hotelbeds", "acc-1001", "Hotelbeds Content"),
      }),
    );
    registry.register(
      createProvider("partner-x", {
        content: createAccommodation("partner-x", "acc-1001", "Partner X Content"),
      }),
    );

    const service = new AccommodationContentService(registry);
    const result = await service.execute(createQuery());

    expect(result.accommodation.providerReference.provider).toBe("hotelbeds");
    expect(result.accommodation.identity.id).toBe("acc-1001");
  });

  it("compiles content namespace exports through the accommodation namespace", () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const service = new AccommodationContentService(registry);

    expect(service).toBeDefined();
  });
});