import {
  createJourneyCompositionResult,
  JourneyCompositionResult,
  JourneyPresentationMapper,
  JourneyViewModelProvider,
} from "@application/journeys";
import {
  Journey,
  JourneyLifecycle,
  JourneyStatus,
} from "@application/journeys/aggregate";

import {
  createDefaultHomepageJourneyShowcaseService,
  HomepageJourneyShowcaseService,
} from "./homepage-journey-showcase-service";

function createCompositionResult(id: string, destination: string): JourneyCompositionResult {
  const journey = Journey.create({
    identity: { id },
    classification: { type: "PACKAGE", category: "SIGNATURE" },
    metadata: {
      created: new Date("2026-08-06T00:00:00.000Z"),
      modified: new Date("2026-08-06T00:00:00.000Z"),
      version: "1.0.0",
      source: "APP-003.7",
    },
    status: JourneyStatus.DRAFT,
    lifecycle: JourneyLifecycle.DESIGN,
    duration: { days: 4, nights: 3, description: "4 Days / 3 Nights" },
    destinations: [{ name: destination }],
    accommodation: [{ accommodationId: `${id}-acc`, name: `${destination} Retreat` }],
    experiences: [{ experienceId: `${id}-exp`, name: `${destination} Tasting` }],
    travellerRules: { minimumTravellers: 2, maximumTravellers: 6, privateOnly: true },
    tags: [{ value: "Luxury" }],
  });

  return createJourneyCompositionResult({
    success: true,
    payload: journey,
    metadata: {
      generatedAt: new Date("2026-08-06T00:00:00.000Z"),
      version: "1.0.0",
    },
  });
}

describe("HomepageJourneyShowcaseService", () => {
  it("invokes journey composition, presentation mapping, and view model provider", async () => {
    const events: string[] = [];
    const service = new HomepageJourneyShowcaseService(
      {
        execute: async () => {
          events.push("composition");
          return createCompositionResult("journey-001", "Cape Winelands");
        },
      },
      {
        map: (result) => {
          events.push("mapper");
          return new JourneyPresentationMapper().map(result);
        },
      } as JourneyPresentationMapper,
      {
        provideHomepageJourney: (model) => {
          events.push("provider");
          return new JourneyViewModelProvider().provideHomepageJourney(model);
        },
      } as JourneyViewModelProvider,
    );

    const result = await service.execute();

    expect(result.success).toBe(true);
    expect(result.featuredJourneys.length).toBeGreaterThan(0);
    expect(events).toContain("composition");
    expect(events).toContain("mapper");
    expect(events).toContain("provider");
  });

  it("handles empty showcase results when composition produces no successful journeys", async () => {
    const service = new HomepageJourneyShowcaseService(
      {
        execute: async () =>
          createJourneyCompositionResult({
            success: false,
            payload: null,
            metadata: {
              generatedAt: new Date("2026-08-06T00:00:00.000Z"),
              version: "1.0.0",
            },
            errors: ["Journey not eligible"],
          }),
      },
      new JourneyPresentationMapper(),
      new JourneyViewModelProvider(),
    );

    const result = await service.execute();

    expect(result.success).toBe(false);
    expect(result.featuredJourneys).toEqual([]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.featuredJourneys)).toBe(true);
  });

  it("supports compile-safe default integration", async () => {
    const service = createDefaultHomepageJourneyShowcaseService();
    const result = await service.execute();

    expect(result.success).toBe(true);
    expect(result.featuredJourneys).toHaveLength(3);
  });
});