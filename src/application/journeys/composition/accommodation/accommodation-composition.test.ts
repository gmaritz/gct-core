import {
  Accommodation,
  AccommodationCurrency,
  AccommodationRateSelectionStrategy,
  AccommodationRateStatus,
  AccommodationRateType,
  AccommodationSearchSource,
  AccommodationSearchQuery,
  AccommodationSearchResult,
} from "@application/accommodation";
import {
  AccommodationContentQuery,
  AccommodationContentResult,
} from "@application/accommodation";
import {
  AccommodationAvailabilityResult,
  AccommodationInventoryQuery,
} from "@application/accommodation";
import {
  AccommodationRateQuery,
  AccommodationRateResult,
} from "@application/accommodation";
import {
  JourneyCompositionSource,
} from "@application/journeys/validation";

import {
  AccommodationCompositionAdapter,
} from "./accommodation-composition-adapter";
import {
  AccommodationCompositionContext,
} from "./accommodation-composition-context";

function createAccommodation(
  id: string,
  name: string,
): Accommodation {
  return {
    identity: {
      id,
      name,
    },
    category: "Boutique Hotel",
    location: {
      country: "South Africa",
      region: "Western Cape",
      city: "Cape Town",
      suburb: "City Bowl",
      latitude: -33.9249,
      longitude: 18.4241,
    },
    rating: {
      stars: 5,
      classification: "Luxury",
      reviewScore: 4.7,
    },
    images: [],
    amenities: ["Wi-Fi"],
    policies: [],
    contacts: [],
    providerReference: {
      provider: "hotelbeds",
      providerAccommodationId: id,
    },
  };
}

function createSearchResult(accommodations: ReadonlyArray<Accommodation>): AccommodationSearchResult {
  return {
    accommodations,
    metadata: {
      generatedAt: new Date("2026-08-06T00:00:00.000Z"),
      version: "1.0.0",
      provider: "aggregate",
    },
  };
}

function createContentResult(accommodation: Accommodation): AccommodationContentResult {
  return {
    accommodation,
    metadata: {
      generatedAt: new Date("2026-08-06T00:00:00.000Z"),
      version: "1.0.0",
      provider: "content",
    },
  };
}

function createAvailabilityResult(
  accommodation: Accommodation,
  available: boolean,
): AccommodationAvailabilityResult {
  return {
    kind: "ACCOMMODATION",
    accommodation,
    available,
    metadata: {
      generatedAt: new Date("2026-08-06T00:00:00.000Z"),
      version: "1.0.0",
      provider: "inventory",
    },
  };
}

function createRateResult(accommodationId: string): AccommodationRateResult {
  return {
    accommodationId,
    stayPeriod: {
      checkIn: new Date("2026-10-10T00:00:00.000Z"),
      checkOut: new Date("2026-10-14T00:00:00.000Z"),
    },
    occupancy: {
      adults: 2,
      children: 0,
      rooms: 1,
    },
    selectionStrategy: AccommodationRateSelectionStrategy.RECOMMENDED,
    rates: [
      {
        id: `${accommodationId}-rate-1`,
        type: AccommodationRateType.PUBLIC,
        status: AccommodationRateStatus.AVAILABLE,
        currency: AccommodationCurrency.ZAR,
        amount: 4200,
      },
    ],
    metadata: {
      generatedAt: new Date("2026-08-06T00:00:00.000Z"),
      version: "1.0.0",
      provider: "rates",
    },
  };
}

function createContext(
  overrides: Partial<AccommodationCompositionContext> = {},
): AccommodationCompositionContext {
  return {
    requestId: "request-0035",
    source: JourneyCompositionSource.API,
    timestamp: new Date("2026-08-06T00:00:00.000Z"),
    destination: "Cape Town",
    checkInDate: new Date("2026-10-10T00:00:00.000Z"),
    checkOutDate: new Date("2026-10-14T00:00:00.000Z"),
    adults: 2,
    children: 0,
    rooms: 1,
    locale: "EN",
    currency: AccommodationCurrency.ZAR,
    market: "ZA",
    channel: "WEB",
    ...overrides,
  };
}

describe("AccommodationCompositionAdapter", () => {
  it("orchestrates canonical accommodation services and transforms to journey accommodations", async () => {
    const accommodation = createAccommodation("acc-1001", "Signal Hill Lodge");
    const discoveryCalls: AccommodationSearchQuery[] = [];
    const contentCalls: AccommodationContentQuery[] = [];
    const inventoryCalls: AccommodationInventoryQuery[] = [];
    const rateCalls: AccommodationRateQuery[] = [];

    const adapter = new AccommodationCompositionAdapter(
      {
        search: async (query) => {
          discoveryCalls.push(query);
          return createSearchResult([accommodation]);
        },
      },
      {
        execute: async (query) => {
          contentCalls.push(query);
          return createContentResult(createAccommodation("acc-1001", "Signal Hill Signature Lodge"));
        },
      },
      {
        execute: async (query) => {
          inventoryCalls.push(query);
          return createAvailabilityResult(accommodation, true);
        },
      },
      {
        execute: async (query) => {
          rateCalls.push(query);
          return createRateResult(query.identifier);
        },
      },
    );

    const result = await adapter.compose(createContext());

    expect(discoveryCalls).toHaveLength(1);
    expect(contentCalls).toHaveLength(1);
    expect(inventoryCalls).toHaveLength(1);
    expect(rateCalls).toHaveLength(1);
    expect(discoveryCalls[0]?.criteria.destination).toBe("Cape Town");
    expect(discoveryCalls[0]?.context.source).toBe(AccommodationSearchSource.API);
    expect(result).toEqual([
      {
        accommodationId: "acc-1001",
        name: "Signal Hill Signature Lodge",
      },
    ]);
  });

  it("returns immutable canonical collections", async () => {
    const accommodation = createAccommodation("acc-1002", "Vineyard House");

    const adapter = new AccommodationCompositionAdapter(
      {
        search: async () => createSearchResult([accommodation]),
      },
      {
        execute: async () => createContentResult(accommodation),
      },
      {
        execute: async () => createAvailabilityResult(accommodation, true),
      },
      {
        execute: async () => createRateResult("acc-1002"),
      },
    );

    const result = await adapter.compose(createContext());

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result[0])).toBe(true);
  });

  it("isolates downstream service failures and composes when sufficient data exists", async () => {
    const accommodation = createAccommodation("acc-1003", "Harbour View Residence");

    const adapter = new AccommodationCompositionAdapter(
      {
        search: async () =>
          createSearchResult([
            accommodation,
            createAccommodation("acc-1004", "Mountain Terrace"),
          ]),
      },
      {
        execute: async (query) => {
          if (query.identifier === "acc-1004") {
            throw new Error("content timeout");
          }

          return createContentResult(accommodation);
        },
      },
      {
        execute: async (query) =>
          createAvailabilityResult(
            query.identifier === "acc-1003" ? accommodation : createAccommodation("acc-1004", "Mountain Terrace"),
            true,
          ),
      },
      {
        execute: async (query) => createRateResult(query.identifier),
      },
    );

    const result = await adapter.compose(createContext());

    expect(result).toHaveLength(2);
    expect(result.map((entry) => entry.accommodationId)).toEqual(["acc-1003", "acc-1004"]);
  });

  it("filters out accommodations without sufficient availability or rate data", async () => {
    const accommodation = createAccommodation("acc-1005", "Peninsula Escape");

    const adapter = new AccommodationCompositionAdapter(
      {
        search: async () => createSearchResult([accommodation]),
      },
      {
        execute: async () => createContentResult(accommodation),
      },
      {
        execute: async () => createAvailabilityResult(accommodation, false),
      },
      {
        execute: async () => ({
          ...createRateResult("acc-1005"),
          rates: [],
        }),
      },
    );

    const result = await adapter.compose(createContext());

    expect(result).toEqual([]);
  });

  it("returns empty result when discovery fails", async () => {
    const adapter = new AccommodationCompositionAdapter(
      {
        search: async () => {
          throw new Error("discovery failed");
        },
      },
      {
        execute: async () => {
          throw new Error("not called");
        },
      },
      {
        execute: async () => {
          throw new Error("not called");
        },
      },
      {
        execute: async () => {
          throw new Error("not called");
        },
      },
    );

    const result = await adapter.compose(createContext());

    expect(result).toEqual([]);
  });

  it("exposes compile-safe canonical contracts", async () => {
    const adapter: AccommodationCompositionAdapter = new AccommodationCompositionAdapter(
      {
        search: async () => createSearchResult([]),
      },
      {
        execute: async () => {
          throw new Error("unused");
        },
      },
      {
        execute: async () => {
          throw new Error("unused");
        },
      },
      {
        execute: async () => {
          throw new Error("unused");
        },
      },
    );

    const result = await adapter.compose(createContext());

    expect(Array.isArray(result)).toBe(true);
  });
});