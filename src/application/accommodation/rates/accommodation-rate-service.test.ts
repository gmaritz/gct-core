import {
  AccommodationCurrency,
  AccommodationProvider,
  AccommodationProviderCapabilityType,
  AccommodationRateQuery,
  AccommodationRateResult,
  AccommodationRateSelectionStrategy,
  AccommodationRateService,
  AccommodationRateSource,
  AccommodationRateStatus,
  AccommodationRateType,
  AccommodationRateValidationErrorCode,
  AccommodationRateValidator,
  InMemoryProviderRegistry,
  ProviderRegistry,
} from "@application/accommodation";
import { ApplicationService } from "@application/application-service";

function createRateQuery(overrides: Partial<AccommodationRateQuery> = {}): AccommodationRateQuery {
  return {
    identifier: "acc-1001",
    stayPeriod: {
      checkIn: new Date("2026-09-10T00:00:00.000Z"),
      checkOut: new Date("2026-09-14T00:00:00.000Z"),
    },
    occupancy: {
      adults: 2,
      children: 1,
      rooms: 1,
    },
    selectionStrategy: AccommodationRateSelectionStrategy.CHEAPEST,
    context: {
      requestId: "req-rate-001",
      source: AccommodationRateSource.PACKAGE_DETAILS,
      currency: AccommodationCurrency.ZAR,
      market: "ZA",
      timestamp: new Date("2026-08-05T00:00:00.000Z"),
    },
    ...overrides,
  };
}

function createProviderRateResult(providerId: string): AccommodationRateResult {
  return {
    accommodationId: "acc-1001",
    stayPeriod: {
      checkIn: new Date("2026-09-10T00:00:00.000Z"),
      checkOut: new Date("2026-09-14T00:00:00.000Z"),
    },
    occupancy: {
      adults: 2,
      children: 1,
      rooms: 1,
    },
    selectionStrategy: AccommodationRateSelectionStrategy.CHEAPEST,
    rates: [
      {
        id: `${providerId}-rate-1`,
        type: AccommodationRateType.PUBLIC,
        status: AccommodationRateStatus.AVAILABLE,
        currency: AccommodationCurrency.ZAR,
        amount: providerId === "hotelbeds" ? 2500 : 2600,
        boardCode: "RO",
        boardName: "ROOM ONLY",
      },
    ],
    metadata: {
      provider: providerId,
      generatedAt: new Date("2026-08-05T00:00:00.000Z"),
      version: "1.0.0",
    },
  };
}

function createRatesProvider(
  providerId: string,
  behavior?: {
    throwError?: boolean;
    onRates?: (query: AccommodationRateQuery) => void;
  },
): AccommodationProvider & { rates(query: AccommodationRateQuery): Promise<AccommodationRateResult> } {
  return {
    providerId,
    capabilities: {
      capabilities: [
        {
          identifier: `${providerId}.rates.0`,
          type: AccommodationProviderCapabilityType.RATES,
          name: "Rates capability",
          description: "Rates support",
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
          provider: providerId,
          generatedAt: new Date("2026-08-05T00:00:00.000Z"),
          version: "1.0.0",
        },
      };
    },
    async rates(query) {
      behavior?.onRates?.(query);

      if (behavior?.throwError) {
        throw new Error(`Provider failure: ${providerId}`);
      }

      return createProviderRateResult(providerId);
    },
  };
}

describe("AccommodationRateService", () => {
  it("validates canonical rate query contracts", () => {
    const validator = new AccommodationRateValidator();
    const validationResult = validator.validate(createRateQuery());

    expect(validationResult.valid).toBe(true);
    expect(validationResult.errors).toEqual([]);
    expect(Object.isFrozen(validationResult)).toBe(true);
  });

  it.each([
    ["missing identifier", createRateQuery({ identifier: "" }), AccommodationRateValidationErrorCode.MISSING_IDENTIFIER],
    [
      "missing check in",
      createRateQuery({
        stayPeriod: {
          checkIn: undefined as unknown as Date,
          checkOut: new Date("2026-09-14T00:00:00.000Z"),
        },
      }),
      AccommodationRateValidationErrorCode.MISSING_CHECK_IN,
    ],
    [
      "missing check out",
      createRateQuery({
        stayPeriod: {
          checkIn: new Date("2026-09-10T00:00:00.000Z"),
          checkOut: undefined as unknown as Date,
        },
      }),
      AccommodationRateValidationErrorCode.MISSING_CHECK_OUT,
    ],
    [
      "invalid date range",
      createRateQuery({
        stayPeriod: {
          checkIn: new Date("2026-09-10T00:00:00.000Z"),
          checkOut: new Date("2026-09-09T00:00:00.000Z"),
        },
      }),
      AccommodationRateValidationErrorCode.INVALID_DATE_RANGE,
    ],
    [
      "invalid adults",
      createRateQuery({ occupancy: { adults: 0, children: 1, rooms: 1 } }),
      AccommodationRateValidationErrorCode.INVALID_ADULT_COUNT,
    ],
    [
      "invalid children",
      createRateQuery({ occupancy: { adults: 2, children: -1, rooms: 1 } }),
      AccommodationRateValidationErrorCode.INVALID_CHILD_COUNT,
    ],
    [
      "invalid rooms",
      createRateQuery({ occupancy: { adults: 2, children: 1, rooms: 0 } }),
      AccommodationRateValidationErrorCode.INVALID_ROOM_COUNT,
    ],
    [
      "invalid currency",
      createRateQuery({ context: { ...createRateQuery().context, currency: "ABC" as AccommodationCurrency } }),
      AccommodationRateValidationErrorCode.INVALID_CURRENCY,
    ],
    [
      "invalid strategy",
      createRateQuery({ selectionStrategy: "PROMOTIONAL" as AccommodationRateSelectionStrategy }),
      AccommodationRateValidationErrorCode.INVALID_SELECTION_STRATEGY,
    ],
  ])("fails validation for %s", (_label, query, expectedCode) => {
    const validator = new AccommodationRateValidator();
    const validationResult = validator.validate(query);

    expect(validationResult.valid).toBe(false);
    expect(validationResult.errors.map((error) => error.code)).toContain(expectedCode);
  });

  it("discovers RATES providers and delegates canonical rate query", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const rateCalls: AccommodationRateQuery[] = [];
    registry.register(
      createRatesProvider("hotelbeds", {
        onRates(query) {
          rateCalls.push(query);
        },
      }),
    );

    const service = new AccommodationRateService(registry);
    const query = createRateQuery();
    const result = await service.execute(query);

    expect(rateCalls).toHaveLength(1);
    expect(rateCalls[0]).toEqual(query);
    expect(result.rates).toHaveLength(1);
  });

  it("aggregates rates from successful providers and isolates provider failures", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    registry.register(createRatesProvider("hotelbeds"));
    registry.register(createRatesProvider("partner-x"));
    registry.register(createRatesProvider("broken-provider", { throwError: true }));

    const service = new AccommodationRateService(registry);
    const result = await service.execute(createRateQuery());

    expect(result.rates.map((rate) => rate.id)).toEqual(["hotelbeds-rate-1", "partner-x-rate-1"]);
  });

  it("returns immutable canonical rate result contracts", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    registry.register(createRatesProvider("hotelbeds"));

    const service = new AccommodationRateService(registry);
    const result = await service.execute(createRateQuery());

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.rates)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
  });

  it("implements the application service pattern with execute as the only public operation", () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const service = new AccommodationRateService(registry);
    const applicationService: ApplicationService<AccommodationRateQuery, AccommodationRateResult> = service;

    expect(applicationService.execute).toBeDefined();
    expect((service as { rates?: unknown }).rates).toBeUndefined();
    expect((service as { getRates?: unknown }).getRates).toBeUndefined();
  });
});