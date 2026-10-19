import {
  AccommodationAvailabilityResult,
  AccommodationSearchQuery,
  HotelCatalogueService,
  InMemoryHotelCatalogueRepository,
  createHotelCatalogueEntry,
} from "../../../accommodation";
import { JourneySelectionStore } from "./journey-selection-store";
import {
  calculateCapeWinelandsStays,
  CapeWinelandsJourneyResolver,
  validateBookingContext,
} from "./cape-winelands-journey-resolver";
import {
  CAPE_WINELANDS_FRANSCHHOEK_PROPERTIES,
  CAPE_WINELANDS_HERMANUS_PROPERTIES,
  CAPE_WINELANDS_STELLENBOSCH_PROPERTIES,
  CapeWinelandsPropertyConfiguration,
} from "./cape-winelands-property-configuration";

const allProperties = [
  ...CAPE_WINELANDS_STELLENBOSCH_PROPERTIES,
  ...CAPE_WINELANDS_FRANSCHHOEK_PROPERTIES,
  ...CAPE_WINELANDS_HERMANUS_PROPERTIES,
];

function createAvailability(
  property: CapeWinelandsPropertyConfiguration,
  adults: number,
  propertyName = property.name,
): AccommodationAvailabilityResult {
  return {
    kind: "ACCOMMODATION",
    available: true,
    accommodation: {
      identity: { id: property.hotelCode, name: propertyName },
      category: "Boutique Hotel",
      location: {
        country: "South Africa",
        region: "Western Cape",
        city: property.zoneName,
        suburb: "",
        latitude: 0,
        longitude: 0,
      },
      rating: { stars: property.starGrading, classification: "Premium" },
      images: [],
      amenities: [],
      policies: [],
      contacts: [],
      providerReference: { provider: "hotelbeds", providerAccommodationId: property.hotelCode },
    },
    metadata: { provider: "hotelbeds", generatedAt: new Date("2026-01-01T00:00:00.000Z"), version: "1.0.0" },
    availabilityOptions: {
      roomOptions: [{
        reference: { provider: "hotelbeds", opaqueReference: `room-${property.hotelCode}` },
        name: "Double Room",
        rateOptions: [{
          reference: { provider: "hotelbeds", opaqueReference: `rate-${property.hotelCode}` },
          status: "BOOKABLE",
          pricing: { amount: 2500, currency: "ZAR", basis: "TOTAL_STAY" },
          occupancy: { rooms: [{ adults, children: 0, childAges: [] }] },
          cancellationPolicies: [],
          taxes: [],
        }],
      }],
    },
  };
}

async function createCatalogue(inactiveCodes: ReadonlyArray<string> = []): Promise<HotelCatalogueService> {
  const repository = new InMemoryHotelCatalogueRepository();
  for (const property of allProperties) {
    await repository.upsert(createHotelCatalogueEntry({
      hotelCode: property.hotelCode,
      starGrading: property.starGrading,
      destinationCode: "CPT",
      zoneCode: property.zoneCode,
      zoneName: property.zoneName,
      active: !inactiveCodes.includes(property.hotelCode),
    }));
  }
  return new HotelCatalogueService(repository);
}

function context(): { readonly startDate: string; readonly participants: number; readonly roomAdults: ReadonlyArray<number> } {
  return { startDate: "2026-11-01", participants: 2, roomAdults: [2] };
}

function queryHotelCode(query: AccommodationSearchQuery): string {
  const code = query.criteria.hotelCodes?.[0];
  if (!code) throw new Error("Resolver query must contain a hotel code.");
  return code;
}

function queryAdults(query: AccommodationSearchQuery): number {
  const adults = query.criteria.occupancies?.[0]?.adults;
  if (!adults) throw new Error("Resolver query must contain an adult occupancy.");
  return adults;
}

describe("CapeWinelandsJourneyResolver", () => {
  it("calculates the itinerary as deterministic UTC date-only stays", () => {
    const [stellenbosch, hermanus] = calculateCapeWinelandsStays("2026-11-01");

    expect(stellenbosch?.checkInDate.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    expect(stellenbosch?.checkOutDate.toISOString()).toBe("2026-11-03T00:00:00.000Z");
    expect(hermanus?.checkInDate.toISOString()).toBe("2026-11-03T00:00:00.000Z");
    expect(hermanus?.checkOutDate.toISOString()).toBe("2026-11-04T00:00:00.000Z");
    expect(() => calculateCapeWinelandsStays("2026-02-30")).toThrow("valid journey start date");
  });

  it("validates participants and room allocations", () => {
    expect(validateBookingContext(context())).toBeUndefined();
    expect(validateBookingContext({ ...context(), participants: 9, roomAdults: [9] })).toContain("2 to 8");
    expect(validateBookingContext({ ...context(), participants: 3, roomAdults: [2] })).toContain("equal");
  });

  it("uses Franschhoek only when no eligible Stellenbosch property is available", async () => {
    const calls: AccommodationSearchQuery[] = [];
    const availabilityService = {
      execute: async (query: AccommodationSearchQuery): Promise<AccommodationAvailabilityResult> => {
        calls.push(query);
        const code = queryHotelCode(query);
        const property = allProperties.find((candidate) => candidate.hotelCode === code)!;
        if (CAPE_WINELANDS_STELLENBOSCH_PROPERTIES.some((candidate) => candidate.hotelCode === code)) {
          return {
            kind: "NO_AVAILABILITY",
            available: false,
            metadata: { provider: "hotelbeds", generatedAt: new Date(), version: "1.0.0" },
          };
        }
        return createAvailability(property, queryAdults(query));
      },
    };
    const resolver = new CapeWinelandsJourneyResolver(
      await createCatalogue(),
      availabilityService,
      undefined,
      new JourneySelectionStore(),
    );

    const result = await resolver.resolve("owner-a", "journey-homepage-journey-001", context());
    expect(result.status).toBe("RESOLVED");
    expect(result.journey?.accommodation.map((option) => option.packageStop?.destination)).toEqual(["Stellenbosch", "Hermanus"]);
    expect(result.journey?.accommodation[0]?.accommodationId).toBe(CAPE_WINELANDS_FRANSCHHOEK_PROPERTIES[0]?.hotelCode);
    expect(calls.map(queryHotelCode)).toEqual([
      CAPE_WINELANDS_STELLENBOSCH_PROPERTIES[0]?.hotelCode,
      CAPE_WINELANDS_FRANSCHHOEK_PROPERTIES[0]?.hotelCode,
      CAPE_WINELANDS_HERMANUS_PROPERTIES[0]?.hotelCode,
    ]);
    expect(calls[1]?.criteria.checkInDate.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    expect(calls[1]?.criteria.checkOutDate.toISOString()).toBe("2026-11-03T00:00:00.000Z");
  });

  it("excludes inactive catalogue candidates and avoids unnecessary fallback searches", async () => {
    const calls: AccommodationSearchQuery[] = [];
    const inactiveCode = CAPE_WINELANDS_STELLENBOSCH_PROPERTIES[0]!.hotelCode;
    const availabilityService = {
      execute: async (query: AccommodationSearchQuery): Promise<AccommodationAvailabilityResult> => {
        calls.push(query);
        const property = allProperties.find((candidate) => candidate.hotelCode === queryHotelCode(query))!;
        return createAvailability(property, queryAdults(query));
      },
    };
    const resolver = new CapeWinelandsJourneyResolver(
      await createCatalogue([inactiveCode]),
      availabilityService,
      undefined,
      new JourneySelectionStore(),
    );

    const result = await resolver.resolve("owner-a", "journey-homepage-journey-001", context());
    expect(result.status).toBe("RESOLVED");
    expect(result.journey?.accommodation[0]?.accommodationId).toBe(CAPE_WINELANDS_STELLENBOSCH_PROPERTIES[1]?.hotelCode);
    expect(calls).toHaveLength(2);
    expect(calls[0]?.criteria.hotelCodes ?? []).not.toContain(inactiveCode);
    expect(result.journey?.accommodation[0]?.packageStop?.approvedAccommodationIds).not.toContain(inactiveCode);
  });

  it("rejects supplier results whose name does not match the configured property", async () => {
    const availabilityService = {
      execute: async (query: AccommodationSearchQuery): Promise<AccommodationAvailabilityResult> => {
        const property = allProperties.find((candidate) => candidate.hotelCode === queryHotelCode(query))!;
        return createAvailability(property, queryAdults(query), "Different Hotel");
      },
    };
    const resolver = new CapeWinelandsJourneyResolver(
      await createCatalogue(),
      availabilityService,
      undefined,
      new JourneySelectionStore(),
    );

    await expect(resolver.resolve("owner-a", "journey-homepage-journey-001", context())).resolves.toEqual({ status: "UNAVAILABLE" });
  });
});
