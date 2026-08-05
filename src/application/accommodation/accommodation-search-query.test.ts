import {
  AccommodationSearchContext,
  AccommodationSearchCriteria,
  AccommodationSearchQuery,
  AccommodationSearchSource,
  DefaultAccommodationDiscoveryEngine,
  InMemoryProviderRegistry,
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
    requestId: "req-123",
    source: AccommodationSearchSource.PACKAGE_BUILDER,
    channel: "web",
    locale: "en-ZA",
    currency: "ZAR",
    timestamp: new Date("2026-08-05T00:00:00.000Z"),
  };
}

describe("Canonical accommodation search query model", () => {
  it("constructs search query from immutable criteria and context contracts", () => {
    const query: AccommodationSearchQuery = {
      criteria: createCriteria(),
      context: createContext(),
    };

    expect(query.criteria.destination).toBe("Cape Town");
    expect(query.context.requestId).toBe("req-123");
    expect(query.context.currency).toBe("ZAR");
  });

  it("constructs search context using canonical search source enum", () => {
    const context = createContext();

    expect(context.source).toBe(AccommodationSearchSource.PACKAGE_BUILDER);
    expect(AccommodationSearchSource.API).toBe("API");
    expect(AccommodationSearchSource.INTERNAL).toBe("INTERNAL");
  });

  it("allows discovery engine to accept the canonical query object", async () => {
    const engine = new DefaultAccommodationDiscoveryEngine(new InMemoryProviderRegistry());
    const result = await engine.search({
      criteria: createCriteria(),
      context: createContext(),
    });

    expect(result.accommodations).toEqual([]);
  });
});