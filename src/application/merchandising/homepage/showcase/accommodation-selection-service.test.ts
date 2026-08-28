import { Journey, JourneyLifecycle, JourneyStatus } from "../../../journeys";
import { DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import {
  AccommodationSelectionInput,
  DefaultAccommodationSelectionService,
} from "./accommodation-selection-service";

function createResolver(rateStatus: "BOOKABLE" | "UNAVAILABLE" = "BOOKABLE"): DynamicHomepageJourneyResolver {
  const journey = Journey.create({
    identity: { id: "journey-homepage-journey-001" },
    classification: { type: "PACKAGE", category: "SIGNATURE" },
    metadata: { created: new Date(), modified: new Date(), version: "1.0.0", source: "HOMEPAGE" },
    status: JourneyStatus.DRAFT,
    lifecycle: JourneyLifecycle.DESIGN,
    duration: { days: 4, nights: 3, description: "4 Days / 3 Nights" },
    destinations: [{ name: "Cape Winelands" }],
    accommodation: [{
      accommodationId: "property-1",
      name: "Cape Winelands Retreat",
      roomOptions: [{
        reference: { provider: "curated", opaqueReference: "room-1" },
        name: "Signature Room",
        rateOptions: [{
          reference: { provider: "curated", opaqueReference: "rate-1" },
          status: rateStatus,
          pricing: { amount: 18950, currency: "ZAR", basis: "PER_STAY" },
          occupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
          cancellationPolicies: [],
          taxes: [],
        }],
      }],
      requestedOccupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
    }],
    experiences: [],
    travellerRules: { minimumTravellers: 2, maximumTravellers: 6, privateOnly: true },
    tags: [],
  });

  return { resolve: async (): Promise<{ status: "RESOLVED"; journey: Journey }> => ({ status: "RESOLVED", journey }) };
}

const validSelection: AccommodationSelectionInput = {
  accommodationId: "property-1",
  roomReference: { provider: "curated", opaqueReference: "room-1" },
  rateReference: { provider: "curated", opaqueReference: "rate-1" },
};

describe("DefaultAccommodationSelectionService", () => {
  it("validates and completes a property, room and rate selection", async (): Promise<void> => {
    const result = await new DefaultAccommodationSelectionService(createResolver()).selectAccommodation(
      "journey-homepage-journey-001",
      [validSelection],
    );

    expect(result.status).toBe("COMPLETE");
    expect(result.selectedStops[0]).toEqual({
      accommodationId: "property-1",
      roomReference: "room-1",
      rateReference: "rate-1",
    });
  });

  it("rejects invalid hierarchy selections and incomplete journeys", async (): Promise<void> => {
    const service = new DefaultAccommodationSelectionService(createResolver());
    const invalid = await service.selectAccommodation("journey-homepage-journey-001", [{ ...validSelection, accommodationId: "other" }]);
    const incomplete = await service.selectAccommodation("journey-homepage-journey-001", []);

    expect(invalid.status).toBe("INVALID");
    expect(incomplete.status).toBe("INCOMPLETE");
  });

  it("reports a stale rate without silently substituting another option", async (): Promise<void> => {
    const result = await new DefaultAccommodationSelectionService(createResolver("UNAVAILABLE")).selectAccommodation(
      "journey-homepage-journey-001",
      [validSelection],
    );

    expect(result.status).toBe("STALE");
    expect(result.selectedStops).toEqual([]);
  });
});
