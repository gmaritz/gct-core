import {
  Journey,
  JourneyLifecycle,
  JourneyStatus,
} from "../../../application/journeys/aggregate";

import { AccommodationSelectionViewModelProvider } from "./accommodation-selection.viewmodel-provider";

function createJourney(): Journey {
  return Journey.create({
    identity: { id: "journey-homepage-journey-001" },
    classification: { type: "PACKAGE", category: "SIGNATURE" },
    metadata: {
      created: new Date("2026-08-27T00:00:00.000Z"),
      modified: new Date("2026-08-27T00:00:00.000Z"),
      version: "1.0.0",
      source: "HOMEPAGE",
    },
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
          status: "BOOKABLE",
          pricing: { amount: 18950, currency: "ZAR", basis: "PER_STAY" },
          board: { code: "BB", name: "Breakfast Included" },
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
}

describe("AccommodationSelectionViewModelProvider", () => {
  it("provides complete accommodation selection view model from journey object", () => {
    const viewModel = new AccommodationSelectionViewModelProvider().provide(createJourney());

    expect(viewModel.journeyId).toBe("journey-homepage-journey-001");
    expect(viewModel.journeyTitle).toBe("SIGNATURE Cape Winelands Journey");
    expect(viewModel.stops).toHaveLength(1);
    expect(viewModel.stops[0].destination).toBe("Cape Winelands");
    expect(viewModel.stops[0].properties[0]).toMatchObject({
      id: "property-1",
      name: "Cape Winelands Retreat",
      destination: "Cape Winelands",
    });
    expect(viewModel.stops[0].properties[0].image?.src).toContain("cape-winelands");
    expect(viewModel.stops[0].properties[0].rooms[0].name).toBe("Signature Room");
    expect(viewModel.stops[0].properties[0].rooms[0].rates[0].name).toBe("Breakfast Included");
    expect(Object.isFrozen(viewModel)).toBe(true);
  });

  it("handles optional status message when provided", () => {
    const viewModel = new AccommodationSelectionViewModelProvider().provide(createJourney(), "Select accommodation for every stop.");

    expect(viewModel.status).toBe("Select accommodation for every stop.");
  });
});