import {
  Journey,
  JourneyLifecycle,
  JourneyStatus,
} from "@application/journeys/aggregate";
import {
  createJourneyCompositionResult,
  JourneyCompositionResult,
} from "@application/journeys/composition";

import { JourneyPresentationMapper } from "./mapper/journey-presentation-mapper";
import { JourneyViewModelProvider } from "./providers/journey-view-model-provider";

function createCompositionResult(): JourneyCompositionResult {
  const journey = Journey.create({
    identity: { id: "journey-2001" },
    classification: { type: "PACKAGE", category: "SIGNATURE" },
    metadata: {
      created: new Date("2026-08-06T00:00:00.000Z"),
      modified: new Date("2026-08-06T00:00:00.000Z"),
      version: "1.0.0",
      source: "APP-003.7",
    },
    status: JourneyStatus.DRAFT,
    lifecycle: JourneyLifecycle.DESIGN,
    duration: {
      days: 4,
      nights: 3,
      description: "4 Days / 3 Nights",
    },
    destinations: [{ name: "Cape Winelands" }],
    accommodation: [
      { accommodationId: "acc-1", name: "Valley House" },
    ],
    experiences: [
      { experienceId: "exp-1", name: "Private Cellar Tasting" },
      { experienceId: "exp-2", name: "Scenic Estate Drive" },
    ],
    travellerRules: {
      minimumTravellers: 2,
      maximumTravellers: 6,
      privateOnly: true,
    },
    tags: [
      { value: "Luxury" },
      { value: "Wine" },
    ],
  });

  return createJourneyCompositionResult({
    success: true,
    payload: journey,
    metadata: {
      generatedAt: new Date("2026-08-06T00:00:00.000Z"),
      version: "1.0.0",
      requestId: "req-0038",
    },
  });
}

describe("JourneyPresentationMapper", () => {
  it("transforms journey composition results into immutable presentation models", () => {
    const mapper = new JourneyPresentationMapper();
    const model = mapper.map(createCompositionResult());

    expect(model).not.toBeNull();
    expect(model?.identity).toBe("journey-2001");
    expect(model?.title).toContain("Cape Winelands");
    expect(model?.destination).toBe("Cape Winelands");
    expect(model?.duration).toBe("4 Days / 3 Nights");
    expect(model?.highlights).toEqual([
      "Private Cellar Tasting",
      "Scenic Estate Drive",
      "Valley House",
    ]);
    expect(Object.isFrozen(model)).toBe(true);
    expect(Object.isFrozen(model?.highlights)).toBe(true);
    expect(Object.isFrozen(model?.heroImage)).toBe(true);
  });

  it("returns null for unsuccessful composition results", () => {
    const mapper = new JourneyPresentationMapper();
    const model = mapper.map(
      createJourneyCompositionResult({
        success: false,
        payload: null,
        metadata: {
          generatedAt: new Date("2026-08-06T00:00:00.000Z"),
          version: "1.0.0",
        },
        errors: ["Journey request is required."],
      }),
    );

    expect(model).toBeNull();
  });
});

describe("JourneyViewModelProvider", () => {
  it("produces homepage journey view models from presentation models", () => {
    const mapper = new JourneyPresentationMapper();
    const provider = new JourneyViewModelProvider(mapper);
    const model = mapper.map(createCompositionResult());

    if (!model) {
      throw new Error("Expected presentation model.");
    }

    const viewModel = provider.provideHomepageJourney(model);

    expect(viewModel.id).toBe("journey-2001");
    expect(viewModel.title).toContain("Journey");
    expect(viewModel.primaryCTA.label).toBe("View Journey");
    expect(viewModel.primaryCTA.style).toBe("primary");
    expect(viewModel.badges).toEqual(["SIGNATURE", "DRAFT"]);
    expect(Object.isFrozen(viewModel)).toBe(true);
    expect(Object.isFrozen(viewModel.highlights)).toBe(true);
    expect(Object.isFrozen(viewModel.primaryCTA)).toBe(true);
  });

  it("maps composition results directly into homepage journey view models", () => {
    const provider = new JourneyViewModelProvider();
    const viewModel = provider.mapCompositionResultToHomepageJourney(createCompositionResult());

    expect(viewModel?.destination).toBe("Cape Winelands");
    expect(viewModel?.accommodationSummary).toBe("1 accommodation option");
    expect(viewModel?.experienceSummary).toBe("2 experiences");
  });

  it("returns null when no successful presentation model exists", () => {
    const provider = new JourneyViewModelProvider();
    const viewModel = provider.mapCompositionResultToHomepageJourney(
      createJourneyCompositionResult({
        success: false,
        payload: null,
        metadata: {
          generatedAt: new Date("2026-08-06T00:00:00.000Z"),
          version: "1.0.0",
        },
        errors: ["Journey not eligible"],
      }),
    );

    expect(viewModel).toBeNull();
  });
});