import { Journey, JourneyLifecycle, JourneyStatus } from "../../../journeys";
import { AccommodationSelectionInput } from "./accommodation-selection-service";
import { JourneySelectionStore } from "./journey-selection-store";

const journeyId = "journey-homepage-journey-001";
const bookingContext = { startDate: "2026-11-01", participants: 2, roomAdults: [2] };
const selection: AccommodationSelectionInput = {
  accommodationId: "hotel-a",
  roomReference: { provider: "test", opaqueReference: "room-a" },
  rateReference: { provider: "test", opaqueReference: "rate-a" },
};

function offeredJourney(): Journey {
  return Journey.create({
    identity: { id: journeyId },
    classification: { type: "PACKAGE", category: "SIGNATURE" },
    metadata: { created: new Date(), modified: new Date(), version: "1.0.0", source: "TEST" },
    status: JourneyStatus.DRAFT,
    lifecycle: JourneyLifecycle.DESIGN,
    duration: { days: 4, nights: 3, description: "4 Days / 3 Nights" },
    destinations: [{ name: "Cape Winelands" }],
    accommodation: [],
    experiences: [],
    travellerRules: { minimumTravellers: 2, maximumTravellers: 6, privateOnly: true },
    tags: [],
  });
}

describe("JourneySelectionStore owner isolation", () => {
  it("isolates booking context, offers, and selections for owners sharing a public journey ID", () => {
    const store = new JourneySelectionStore();
    const journeyA = offeredJourney();
    const journeyB = Journey.create({ ...journeyA, destinations: [{ name: "Other destination" }] });

    store.configure("owner-a", journeyId, bookingContext);
    store.saveOfferedJourney("owner-a", journeyId, journeyA);
    store.save("owner-a", journeyId, [selection]);

    store.configure("owner-b", journeyId, { ...bookingContext, startDate: "2026-12-01" });
    store.saveOfferedJourney("owner-b", journeyId, journeyB);
    store.save("owner-b", journeyId, [{ ...selection, accommodationId: "hotel-b" }]);

    expect(store.context("owner-a", journeyId)?.startDate).toBe("2026-11-01");
    expect(store.offeredJourney("owner-a", journeyId)?.destinations[0]?.name).toBe("Cape Winelands");
    expect(store.find("owner-a", journeyId)[0]?.accommodationId).toBe("hotel-a");
    expect(store.context("owner-b", journeyId)?.startDate).toBe("2026-12-01");
    expect(store.offeredJourney("owner-b", journeyId)?.destinations[0]?.name).toBe("Other destination");
    expect(store.find("owner-b", journeyId)[0]?.accommodationId).toBe("hotel-b");

    store.configure("owner-b", journeyId, bookingContext);
    expect(store.context("owner-a", journeyId)?.startDate).toBe("2026-11-01");
    expect(store.find("owner-a", journeyId)[0]?.accommodationId).toBe("hotel-a");
    expect(store.offeredJourney("owner-b", journeyId)).toBeUndefined();

    store.clear("owner-b", journeyId);
    expect(store.context("owner-b", journeyId)).toBeUndefined();
    expect(store.find("owner-b", journeyId)).toEqual([]);
    expect(store.context("owner-a", journeyId)).toBeDefined();
    expect(store.offeredJourney("owner-a", journeyId)).toBe(journeyA);
  });

  it("keeps independently scoped writes isolated when owner operation order is reversed", () => {
    const store = new JourneySelectionStore();
    const journeyB = offeredJourney();
    const journeyA = Journey.create({ ...journeyB, destinations: [{ name: "Owner A destination" }] });

    store.configure("owner-b", journeyId, bookingContext);
    store.saveOfferedJourney("owner-b", journeyId, journeyB);
    store.save("owner-b", journeyId, [{ ...selection, accommodationId: "hotel-b" }]);
    store.configure("owner-a", journeyId, bookingContext);
    store.saveOfferedJourney("owner-a", journeyId, journeyA);
    store.save("owner-a", journeyId, [selection]);

    expect(store.find("owner-a", journeyId)[0]?.accommodationId).toBe("hotel-a");
    expect(store.find("owner-b", journeyId)[0]?.accommodationId).toBe("hotel-b");
    expect(store.offeredJourney("owner-a", journeyId)?.destinations[0]?.name).toBe("Owner A destination");
    expect(store.offeredJourney("owner-b", journeyId)?.destinations[0]?.name).toBe("Cape Winelands");
  });

  it("fails closed when the owner context is missing", () => {
    const store = new JourneySelectionStore();

    expect(() => Reflect.apply(store.find, store, [undefined, journeyId])).toThrow("validated journey-state owner");
    expect(() => Reflect.apply(store.configure, store, [undefined, journeyId, bookingContext])).toThrow("validated journey-state owner");
  });
});
