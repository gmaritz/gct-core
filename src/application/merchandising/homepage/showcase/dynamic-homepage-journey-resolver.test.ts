import {
  createJourneyCompositionResult,
  JourneyCompositionResult,
} from "../../../journeys";

import {
  DefaultDynamicHomepageJourneyResolver,
  DynamicHomepageJourneyResolver,
} from "./dynamic-homepage-journey-resolver";

function unavailableComposition(): JourneyCompositionResult {
  return createJourneyCompositionResult({
    success: false,
    payload: null,
    metadata: { generatedAt: new Date("2026-08-27T00:00:00.000Z"), version: "1.0.0" },
    errors: ["No composition capabilities succeeded."],
  });
}

describe("DefaultDynamicHomepageJourneyResolver", () => {
  it("reconstructs a known homepage journey through the composition service", async () => {
    const resolver: DynamicHomepageJourneyResolver = new DefaultDynamicHomepageJourneyResolver();
    const result = await resolver.resolve("journey-homepage-journey-001");

    expect(result.status).toBe("RESOLVED");
    expect(result.journey?.identity.id).toBe("journey-homepage-journey-001");
    expect(result.journey?.destinations[0]?.name).toBe("Cape Winelands");
  });

  it("rejects malformed and unknown identifiers", async () => {
    const resolver = new DefaultDynamicHomepageJourneyResolver();

    await expect(resolver.resolve("journey/unsafe")).resolves.toEqual({ status: "INVALID" });
    await expect(resolver.resolve("journey-homepage-journey-999")).resolves.toEqual({ status: "NOT_FOUND" });
  });

  it("reports an unavailable offer when reconstruction fails", async () => {
    const resolver = new DefaultDynamicHomepageJourneyResolver({
      execute: async () => unavailableComposition(),
    });

    await expect(resolver.resolve("journey-homepage-journey-001")).resolves.toEqual({ status: "UNAVAILABLE" });
  });
});
