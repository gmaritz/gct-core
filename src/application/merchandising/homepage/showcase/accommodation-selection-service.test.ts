import { Journey, JourneyLifecycle, JourneyStatus } from "../../../journeys";
import { AccommodationRateOption } from "../../../accommodation";
import { DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import {
  AccommodationSelectionInput,
  DefaultAccommodationSelectionService,
} from "./accommodation-selection-service";
import { JourneySelectionStore } from "./journey-selection-store";

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

function createMultiRoomResolver(): DynamicHomepageJourneyResolver {
  const roomReference = { provider: "hotelbeds", opaqueReference: "room-1" };
  const rate = (opaqueReference: string): AccommodationRateOption => ({
    reference: { provider: "hotelbeds", opaqueReference },
    status: "BOOKABLE" as const,
    pricing: { amount: 100, currency: "ZAR", basis: "TOTAL_STAY" },
    occupancy: { rooms: [{ adults: 1, children: 0, childAges: [] }] },
    cancellationPolicies: [],
    taxes: [],
  });
  const journey = Journey.create({
    identity: { id: "journey-homepage-journey-001" },
    classification: { type: "PACKAGE", category: "SIGNATURE" },
    metadata: { created: new Date(), modified: new Date(), version: "1.0.0", source: "TEST" },
    status: JourneyStatus.DRAFT,
    lifecycle: JourneyLifecycle.DESIGN,
    duration: { days: 4, nights: 3, description: "4 Days / 3 Nights" },
    destinations: [{ name: "Cape Winelands" }],
    accommodation: [{
      accommodationId: "property-1",
      name: "Cape Winelands Retreat",
      packageStop: {
        packageId: "journey-homepage-journey-001",
        stopId: "stop-1",
        stopOrder: 1,
        checkInDate: new Date("2026-11-01T00:00:00.000Z"),
        checkOutDate: new Date("2026-11-02T00:00:00.000Z"),
      },
      requestedOccupancy: {
        rooms: [
          { slotId: "stop-1-room-1", adults: 1, children: 0, childAges: [] },
          { slotId: "stop-1-room-2", adults: 1, children: 0, childAges: [] },
        ],
      },
      roomOptions: [{
        reference: roomReference,
        name: "Twin Room",
        rateOptions: [rate("rate-1"), rate("rate-2")],
      }],
    }],
    experiences: [],
    travellerRules: { minimumTravellers: 2, maximumTravellers: 6, privateOnly: true },
    tags: [],
  });
  return { resolve: async () => ({ status: "RESOLVED", journey }) };
}

const validSelection: AccommodationSelectionInput = {
  accommodationId: "property-1",
  roomReference: { provider: "curated", opaqueReference: "room-1" },
  rateReference: { provider: "curated", opaqueReference: "rate-1" },
};

// Modelled on the Hotelbeds Postman reference transaction (booking 241-749700): two different room types
// from one Availability response, here with a child in the second room. The rateKeys are synthetic.
function createReferenceScenarioResolver(): DynamicHomepageJourneyResolver {
  const rateFor = (rateKey: string, amount: number, child: boolean): AccommodationRateOption => ({
    reference: { provider: "hotelbeds", opaqueReference: rateKey },
    status: "BOOKABLE" as const,
    pricing: { amount, currency: "EUR", basis: "TOTAL_STAY" },
    occupancy: { rooms: [child ? { adults: 2, children: 1, childAges: [7] } : { adults: 2, children: 0, childAges: [] }] },
    cancellationPolicies: [],
    taxes: [],
  });
  const journey = Journey.create({
    identity: { id: "journey-homepage-journey-001" },
    classification: { type: "PACKAGE", category: "SIGNATURE" },
    metadata: { created: new Date(), modified: new Date(), version: "1.0.0", source: "TEST" },
    status: JourneyStatus.DRAFT,
    lifecycle: JourneyLifecycle.DESIGN,
    duration: { days: 4, nights: 3, description: "4 Days / 3 Nights" },
    destinations: [{ name: "Cape Winelands" }],
    accommodation: [{
      accommodationId: "property-1",
      name: "Cape Winelands Retreat",
      packageStop: {
        packageId: "journey-homepage-journey-001",
        stopId: "stop-1",
        stopOrder: 1,
        checkInDate: new Date("2026-11-18T00:00:00.000Z"),
        checkOutDate: new Date("2026-11-19T00:00:00.000Z"),
      },
      requestedOccupancy: {
        rooms: [
          { slotId: "stop-1-room-1", adults: 2, children: 0, childAges: [] },
          { slotId: "stop-1-room-2", adults: 2, children: 1, childAges: [7] },
        ],
      },
      roomOptions: [
        { reference: { provider: "hotelbeds", opaqueReference: "APT.B2" }, name: "Apartment B2", rateOptions: [rateFor("synthetic-rate-apt-b2", 266.91, false)] },
        { reference: { provider: "hotelbeds", opaqueReference: "APT.B3-C6" }, name: "Apartment B3-C6", rateOptions: [rateFor("synthetic-rate-apt-b3-c6", 275.83, true)] },
      ],
    }],
    experiences: [],
    travellerRules: { minimumTravellers: 2, maximumTravellers: 6, privateOnly: true },
    tags: [],
  });
  return { resolve: async () => ({ status: "RESOLVED", journey }) };
}

describe("DefaultAccommodationSelectionService", () => {
  it("validates and completes a property, room and rate selection", async (): Promise<void> => {
    const result = await new DefaultAccommodationSelectionService(createResolver()).selectAccommodation(
      "owner-a",
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
    const invalid = await service.selectAccommodation("owner-a", "journey-homepage-journey-001", [{ ...validSelection, accommodationId: "other" }]);
    const incomplete = await service.selectAccommodation("owner-a", "journey-homepage-journey-001", []);

    expect(invalid.status).toBe("INVALID");
    expect(incomplete.status).toBe("INCOMPLETE");
  });

  it("reports a stale rate without silently substituting another option", async (): Promise<void> => {
    const result = await new DefaultAccommodationSelectionService(createResolver("UNAVAILABLE")).selectAccommodation(
      "owner-a",
      "journey-homepage-journey-001",
      [validSelection],
    );

    expect(result.status).toBe("STALE");
    expect(result.selectedStops).toEqual([]);
  });

  it("requires distinct compatible rates for each requested room slot and persists the slots", async () => {
    const store = new JourneySelectionStore();
    const service = new DefaultAccommodationSelectionService(createMultiRoomResolver(), store);
    const createRoomSelection = (
      roomSlotId: string,
      rateReference: string,
    ): NonNullable<AccommodationSelectionInput["roomSelections"]>[number] => ({
      roomSlotId,
      roomReference: { provider: "hotelbeds", opaqueReference: "room-1" },
      rateReference: { provider: "hotelbeds", opaqueReference: rateReference },
    });

    const duplicate = await service.selectAccommodation("owner-a", "journey-homepage-journey-001", [{
      stopId: "stop-1",
      accommodationId: "property-1",
      roomSelections: [
        createRoomSelection("stop-1-room-1", "rate-1"),
        createRoomSelection("stop-1-room-2", "rate-1"),
      ],
    }]);
    expect(duplicate.status).toBe("INVALID");
    expect(store.find("owner-a", "journey-homepage-journey-001")).toEqual([]);

    const valid = await service.selectAccommodation("owner-a", "journey-homepage-journey-001", [{
      stopId: "stop-1",
      accommodationId: "property-1",
      roomSelections: [
        createRoomSelection("stop-1-room-1", "rate-1"),
        createRoomSelection("stop-1-room-2", "rate-2"),
      ],
    }]);
    expect(valid.status).toBe("COMPLETE");
    expect(store.find("owner-a", "journey-homepage-journey-001")[0]?.roomSelections?.map((selection) => selection.roomSlotId))
      .toEqual(["stop-1-room-1", "stop-1-room-2"]);
  });

  it("selects two room types with different rateKeys and occupancies, preserving each rateKey and slot unchanged", async () => {
    const store = new JourneySelectionStore();
    const service = new DefaultAccommodationSelectionService(createReferenceScenarioResolver(), store);
    const roomSelections = [
      {
        roomSlotId: "stop-1-room-1",
        roomReference: { provider: "hotelbeds", opaqueReference: "APT.B2" },
        rateReference: { provider: "hotelbeds", opaqueReference: "synthetic-rate-apt-b2" },
      },
      {
        roomSlotId: "stop-1-room-2",
        roomReference: { provider: "hotelbeds", opaqueReference: "APT.B3-C6" },
        rateReference: { provider: "hotelbeds", opaqueReference: "synthetic-rate-apt-b3-c6" },
      },
    ];

    const result = await service.selectAccommodation("owner-a", "journey-homepage-journey-001", [{
      stopId: "stop-1",
      accommodationId: "property-1",
      roomSelections,
    }]);

    expect(result.status).toBe("COMPLETE");
    expect(store.find("owner-a", "journey-homepage-journey-001")[0]?.roomSelections).toEqual(roomSelections);
  });

  it("rejects the same rateKey allocated to two room slots even when the room references differ", async () => {
    const store = new JourneySelectionStore();
    const service = new DefaultAccommodationSelectionService(createReferenceScenarioResolver(), store);

    const result = await service.selectAccommodation("owner-a", "journey-homepage-journey-001", [{
      stopId: "stop-1",
      accommodationId: "property-1",
      roomSelections: [
        {
          roomSlotId: "stop-1-room-1",
          roomReference: { provider: "hotelbeds", opaqueReference: "APT.B2" },
          rateReference: { provider: "hotelbeds", opaqueReference: "synthetic-rate-apt-b2" },
        },
        {
          roomSlotId: "stop-1-room-2",
          roomReference: { provider: "hotelbeds", opaqueReference: "APT.B3-C6" },
          rateReference: { provider: "hotelbeds", opaqueReference: "synthetic-rate-apt-b2" },
        },
      ],
    }]);

    expect(result.status).toBe("INVALID");
    expect(store.find("owner-a", "journey-homepage-journey-001")).toEqual([]);
  });

  it("rejects an allocation that omits a room slot or swaps offers between slots with different occupancy", async () => {
    const store = new JourneySelectionStore();
    const service = new DefaultAccommodationSelectionService(createReferenceScenarioResolver(), store);
    const b2 = { roomReference: { provider: "hotelbeds", opaqueReference: "APT.B2" }, rateReference: { provider: "hotelbeds", opaqueReference: "synthetic-rate-apt-b2" } };
    const b3 = { roomReference: { provider: "hotelbeds", opaqueReference: "APT.B3-C6" }, rateReference: { provider: "hotelbeds", opaqueReference: "synthetic-rate-apt-b3-c6" } };

    const missing = await service.selectAccommodation("owner-a", "journey-homepage-journey-001", [{
      stopId: "stop-1",
      accommodationId: "property-1",
      roomSelections: [{ roomSlotId: "stop-1-room-1", ...b2 }],
    }]);
    const swapped = await service.selectAccommodation("owner-a", "journey-homepage-journey-001", [{
      stopId: "stop-1",
      accommodationId: "property-1",
      roomSelections: [{ roomSlotId: "stop-1-room-1", ...b3 }, { roomSlotId: "stop-1-room-2", ...b2 }],
    }]);

    expect(missing.status).toBe("INVALID");
    expect(swapped.status).toBe("INVALID");
    expect(store.find("owner-a", "journey-homepage-journey-001")).toEqual([]);
  });

  it("rejects a room rate whose returned occupancy differs from its requested slot", async () => {
    const resolver = createMultiRoomResolver();
    const journey = await resolver.resolve("owner-a", "journey-homepage-journey-001");
    if (journey.status !== "RESOLVED" || !journey.journey) throw new Error("Expected test journey.");
    const invalidJourney = Journey.create({
      ...journey.journey,
      accommodation: journey.journey.accommodation.map((option) => ({
        ...option,
        roomOptions: option.roomOptions?.map((room) => ({
          ...room,
          rateOptions: room.rateOptions.map((rate) => ({
            ...rate,
            occupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
          })),
        })),
      })),
    });
    const service = new DefaultAccommodationSelectionService({
      resolve: async (): Promise<{ status: "RESOLVED"; journey: Journey }> => ({ status: "RESOLVED", journey: invalidJourney }),
    });
    const result = await service.selectAccommodation("owner-a", "journey-homepage-journey-001", [{
      stopId: "stop-1",
      accommodationId: "property-1",
      roomSelections: [
        {
          roomSlotId: "stop-1-room-1",
          roomReference: { provider: "hotelbeds", opaqueReference: "room-1" },
          rateReference: { provider: "hotelbeds", opaqueReference: "rate-1" },
        },
        {
          roomSlotId: "stop-1-room-2",
          roomReference: { provider: "hotelbeds", opaqueReference: "room-1" },
          rateReference: { provider: "hotelbeds", opaqueReference: "rate-2" },
        },
      ],
    }]);
    expect(result.status).toBe("INVALID");
  });
});
