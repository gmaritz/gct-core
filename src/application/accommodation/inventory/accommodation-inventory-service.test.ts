import {
  AccommodationAvailabilityResult,
  AccommodationInventoryContext,
  AccommodationInventoryQuery,
  AccommodationInventoryService,
  AccommodationInventorySource,
  AccommodationInventoryStatus,
  AccommodationInventoryValidationErrorCode,
  AccommodationInventoryValidator,
  AccommodationProvider,
  AccommodationProviderCapabilityType,
  InMemoryProviderRegistry,
  ProviderRegistry,
} from "@application/accommodation";
import { ApplicationService } from "@application/application-service";

function createContext(): AccommodationInventoryContext {
  return {
    requestId: "req-inventory-001",
    source: AccommodationInventorySource.PACKAGE_DETAILS,
    timestamp: new Date("2026-08-05T00:00:00.000Z"),
  };
}

function createQuery(overrides: Partial<AccommodationInventoryQuery> = {}): AccommodationInventoryQuery {
  return {
    identifier: "acc-1001",
    checkInDate: new Date("2026-09-10T00:00:00.000Z"),
    checkOutDate: new Date("2026-09-14T00:00:00.000Z"),
    adults: 2,
    children: 1,
    rooms: 1,
    context: createContext(),
    ...overrides,
  };
}

function createAvailabilityResult(provider: string): AccommodationAvailabilityResult {
  return {
    kind: "ACCOMMODATION",
    accommodation: {
      identity: {
        id: "acc-1001",
        name: `${provider} inventory`,
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
        provider,
        providerAccommodationId: "acc-1001",
      },
    },
    available: true,
    metadata: {
      provider,
      generatedAt: new Date("2026-08-05T00:00:00.000Z"),
      version: "1.0.0",
    },
  };
}

function createInventoryProvider(
  providerId: string,
  behavior?: {
    throwError?: boolean;
    onAvailability?: (query: AccommodationInventoryQuery) => void;
  },
): AccommodationProvider & { availability(query: AccommodationInventoryQuery): Promise<AccommodationAvailabilityResult> } {
  return {
    providerId,
    capabilities: {
      capabilities: [
        {
          identifier: `${providerId}.availability.0`,
          type: AccommodationProviderCapabilityType.AVAILABILITY,
          name: "Availability capability",
          description: "Availability support",
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
    async availability(query: AccommodationInventoryQuery) : Promise<AccommodationAvailabilityResult> {
      behavior?.onAvailability?.(query);

      if (behavior?.throwError) {
        throw new Error(`Provider failure: ${providerId}`);
      }

      return createAvailabilityResult(providerId);
    },
  };
}

describe("AccommodationInventoryService", () => {
  it("constructs inventory source and status enums", () => {
    expect(AccommodationInventorySource.API).toBe("API");
    expect(AccommodationInventoryStatus.AVAILABLE).toBe("AVAILABLE");
  });

  it("validates a canonical inventory query", () => {
    const validator = new AccommodationInventoryValidator();

    const validationResult = validator.validate(createQuery());

    expect(validationResult.valid).toBe(true);
    expect(validationResult.errors).toEqual([]);
    expect(Object.isFrozen(validationResult)).toBe(true);
  });

  it.each([
    [
      "missing identifier",
      createQuery({ identifier: "" }),
      AccommodationInventoryValidationErrorCode.MISSING_IDENTIFIER,
    ],
    [
      "missing check-in",
      createQuery({ checkInDate: undefined as unknown as Date }),
      AccommodationInventoryValidationErrorCode.MISSING_CHECK_IN,
    ],
    [
      "missing check-out",
      createQuery({ checkOutDate: undefined as unknown as Date }),
      AccommodationInventoryValidationErrorCode.MISSING_CHECK_OUT,
    ],
    [
      "invalid date range",
      createQuery({ checkOutDate: new Date("2026-09-09T00:00:00.000Z") }),
      AccommodationInventoryValidationErrorCode.INVALID_DATE_RANGE,
    ],
    [
      "invalid adults",
      createQuery({ adults: 0 }),
      AccommodationInventoryValidationErrorCode.INVALID_ADULT_COUNT,
    ],
    [
      "invalid children",
      createQuery({ children: -1 }),
      AccommodationInventoryValidationErrorCode.INVALID_CHILD_COUNT,
    ],
    [
      "invalid rooms",
      createQuery({ rooms: 0 }),
      AccommodationInventoryValidationErrorCode.INVALID_ROOM_COUNT,
    ],
    [
      "missing request id",
      createQuery({ context: { ...createContext(), requestId: "" } }),
      AccommodationInventoryValidationErrorCode.MISSING_REQUEST_ID,
    ],
    [
      "missing source",
      createQuery({ context: { ...createContext(), source: "" as AccommodationInventorySource } }),
      AccommodationInventoryValidationErrorCode.MISSING_SOURCE,
    ],
    [
      "missing timestamp",
      createQuery({ context: { ...createContext(), timestamp: undefined as unknown as Date } }),
      AccommodationInventoryValidationErrorCode.MISSING_TIMESTAMP,
    ],
  ])("returns validation failure for %s", (_label, query, expectedCode) => {
    const validator = new AccommodationInventoryValidator();

    const validationResult = validator.validate(query);

    expect(validationResult.valid).toBe(false);
    expect(validationResult.errors.map((error: { code: AccommodationInventoryValidationErrorCode }) => error.code)).toContain(expectedCode);
  });

  it("discovers AVAILABILITY providers and delegates inventory request", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const availabilityCalls: AccommodationInventoryQuery[] = [];
    registry.register(
      createInventoryProvider("hotelbeds", {
        onAvailability(query) {
          availabilityCalls.push(query);
        },
      }),
    );

    const service = new AccommodationInventoryService(registry);
    const query = createQuery();
    const result = await service.execute(query);

    expect(availabilityCalls).toHaveLength(1);
    expect(availabilityCalls[0]).toEqual(query);
    expect(result.metadata.provider).toBe("hotelbeds");
  });

  it("isolates provider failures while preserving successful inventory results", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    registry.register(createInventoryProvider("hotelbeds"));
    registry.register(createInventoryProvider("broken-provider", { throwError: true }));

    const service = new AccommodationInventoryService(registry);
    const result = await service.execute(createQuery());

    if (result.kind !== "ACCOMMODATION") throw new Error("Expected accommodation result.");
    expect(result.accommodation.providerReference.provider).toBe("hotelbeds");
    expect(result.available).toBe(true);
  });

  it("returns immutable canonical inventory results", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    registry.register(createInventoryProvider("hotelbeds"));

    const service = new AccommodationInventoryService(registry);
    const result = await service.execute(createQuery());

    if (result.kind !== "ACCOMMODATION") throw new Error("Expected accommodation result.");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.accommodation)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
  });

  it("implements the application service contract using execute as the only public operation", () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const service = new AccommodationInventoryService(registry);
    const applicationService: ApplicationService<AccommodationInventoryQuery, AccommodationAvailabilityResult> = service;

    expect(applicationService.execute).toBeDefined();
    expect((service as { getContent?: unknown }).getContent).toBeUndefined();
    expect((service as { content?: unknown }).content).toBeUndefined();
  });
});