import {
  Journey,
  JourneyLifecycle,
  JourneyStatus,
} from "../../../application/journeys/aggregate";

import { JourneyDetailViewModelProvider } from "./journey-detail.viewmodel-provider";

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
    accommodation: [{ accommodationId: "acc-1", name: "Cape Winelands Retreat" }],
    experiences: [
      { experienceId: "exp-1", name: "Signature cellar experience" },
    ],
    travellerRules: { minimumTravellers: 2, maximumTravellers: 6, privateOnly: true },
    tags: [],
  });
}

describe("JourneyDetailViewModelProvider", () => {
  it("maps rich journey data without exposing application objects or inventing pricing", () => {
    const viewModel = new JourneyDetailViewModelProvider().provide(createJourney());

    expect(viewModel.id).toBe("journey-homepage-journey-001");
    expect(viewModel.destination).toBe("Cape Winelands");
    expect(viewModel.accommodation[0]).toMatchObject({
      id: "acc-1",
      name: "Cape Winelands Retreat",
      destination: "Cape Winelands",
    });
    expect(viewModel.experiences).toEqual([
      { id: "exp-1", name: "Signature cellar experience" },
    ]);
    expect(viewModel.pricing).toEqual({ state: "UNAVAILABLE" });
    expect(viewModel.primaryCTA.href).toBe("#journey-planning");
    expect(Object.isFrozen(viewModel)).toBe(true);
  });
});
