import {
  Journey,
  JourneyLifecycle,
  JourneyStatus,
} from "../../../application/journeys/aggregate";

import { JourneyDiscoveryViewModelProvider } from "./journey-discovery.viewmodel-provider";

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
    experiences: [{ experienceId: "exp-1", name: "Signature cellar experience" }],
    travellerRules: { minimumTravellers: 2, maximumTravellers: 6, privateOnly: true },
    tags: [],
  });
}

describe("JourneyDiscoveryViewModelProvider", () => {
  it("maps only available discovery data and keeps pricing optional", () => {
    const viewModel = new JourneyDiscoveryViewModelProvider().provide(createJourney());

    expect(viewModel).toMatchObject({
      id: "journey-homepage-journey-001",
      title: "SIGNATURE Cape Winelands Journey",
      destination: "Cape Winelands",
      duration: "4 Days / 3 Nights",
      highlights: ["Signature cellar experience", "Cape Winelands Retreat"],
    });
    expect(viewModel.price).toBeUndefined();
    expect(viewModel.continuation.href).toBe("/ui/placeholder#journey-planning");
    expect(Object.isFrozen(viewModel)).toBe(true);
  });
});
