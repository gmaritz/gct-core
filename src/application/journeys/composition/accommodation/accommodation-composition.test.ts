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
import { selectJourneyAccommodation } from "@application/journeys/models";

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

  it("preserves stop context, room/rate hierarchy, occupancy and supplier references", async () => {
    const accommodation = createAccommodation("acc-stop-1", "Stop One Hotel");
    const room = {
      reference: { provider: "hotelbeds", opaqueReference: "room-1" },
      name: "Deluxe Room",
      rateOptions: [
        {
          reference: { provider: "hotelbeds", opaqueReference: "rate-1" },
          status: "RECHECK_REQUIRED" as const,
          pricing: { amount: 1200, currency: "ZAR", basis: "TOTAL_STAY" },
          occupancy: { rooms: [{ adults: 2, children: 1, childAges: [7] }] },
          cancellationPolicies: [],
          taxes: [],
        },
      ],
    };
    const adapter = new AccommodationCompositionAdapter(
      { search: async () => createSearchResult([accommodation]) },
      { execute: async () => createContentResult(accommodation) },
      {
        execute: async () => ({
          kind: "ACCOMMODATION" as const,
          accommodation,
          available: true,
          requestedOccupancy: { rooms: [{ adults: 2, children: 1, childAges: [7] }] },
          availabilityOptions: { roomOptions: [room] },
          metadata: { generatedAt: new Date(), version: "1.0.0", provider: "hotelbeds" },
        }),
      },
      { execute: async () => createRateResult(accommodation.identity.id) },
    );

    const result = await adapter.compose(createContext({
      packageStop: {
        packageId: "package-1",
        stopId: "stop-1",
        stopOrder: 1,
        checkInDate: new Date("2026-10-10"),
        checkOutDate: new Date("2026-10-14"),
      },
    }));

    expect(result[0]?.packageStop?.stopId).toBe("stop-1");
    expect(result[0]?.roomOptions?.[0]?.rateOptions[0]?.reference.opaqueReference).toBe("rate-1");
    expect(result[0]?.requestedOccupancy?.rooms[0]?.childAges).toEqual([7]);
    expect(result[0]?.provider).toBe("hotelbeds");
  });

  it("validates Property -> Room -> Rate selection and projects downstream inputs", () => {
    const option = {
      accommodationId: "acc-1",
      name: "Hotel",
      packageStop: {
        packageId: "package-1",
        stopId: "stop-1",
        stopOrder: 1,
        checkInDate: new Date("2026-10-10"),
        checkOutDate: new Date("2026-10-14"),
      },
      provider: "hotelbeds",
      roomOptions: [{
        reference: { provider: "hotelbeds", opaqueReference: "room-1" },
        name: "Room",
        rateOptions: [{
          reference: { provider: "hotelbeds", opaqueReference: "rate-1" },
          status: "BOOKABLE" as const,
          pricing: { amount: 100, currency: "ZAR", basis: "TOTAL_STAY" },
          occupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
          cancellationPolicies: [],
          taxes: [],
        }],
      }],
      requestedOccupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
    };
    const selected = selectJourneyAccommodation(option, {
      accommodationId: "acc-1",
      packageStopId: "stop-1",
      roomReference: { provider: "hotelbeds", opaqueReference: "room-1" },
      rateReference: { provider: "hotelbeds", opaqueReference: "rate-1" },
    });

    expect(selected.selection?.rateReference.opaqueReference).toBe("rate-1");
    expect(selected.pricingInput?.packageStopId).toBe("stop-1");
    expect(selected.reservationInput?.supplierReference.opaqueReference).toBe("rate-1");
    expect(() => selectJourneyAccommodation(option, {
      accommodationId: "acc-1",
      packageStopId: "stop-2",
      roomReference: { provider: "hotelbeds", opaqueReference: "room-1" },
      rateReference: { provider: "hotelbeds", opaqueReference: "rate-1" },
    })).toThrow("another package stop");
    expect(() => selectJourneyAccommodation(option, {
      accommodationId: "acc-1",
      packageStopId: "stop-1",
      roomReference: { provider: "hotelbeds", opaqueReference: "room-1" },
      rateReference: { provider: "hotelbeds", opaqueReference: "missing-rate" },
    })).toThrow("does not belong");
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