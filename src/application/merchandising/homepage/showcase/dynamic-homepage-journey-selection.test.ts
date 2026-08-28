import {
  DynamicHomepageJourneyResolver,
  DefaultDynamicHomepageJourneyResolver,
} from "./dynamic-homepage-journey-resolver";
import { DefaultDynamicHomepageJourneySelector } from "./dynamic-homepage-journey-selection";

describe("DefaultDynamicHomepageJourneySelector", () => {
  it("revalidates and selects a known homepage journey", async () => {
    const resolver = new DefaultDynamicHomepageJourneyResolver();
    const selector = new DefaultDynamicHomepageJourneySelector(resolver);

    await expect(selector.selectJourney("journey-homepage-journey-001")).resolves.toEqual({
      status: "SELECTED",
      journeyId: "journey-homepage-journey-001",
      title: "SIGNATURE Cape Winelands Journey",
      continuationHref: "/ui/journeys/journey-homepage-journey-001/selected",
    });
  });

  it("maps invalid, unknown and unavailable resolution outcomes", async () => {
    const unavailableResolver: DynamicHomepageJourneyResolver = {
      resolve: async () => ({ status: "UNAVAILABLE" }),
    };
    const selector = new DefaultDynamicHomepageJourneySelector(unavailableResolver);

    await expect(selector.selectJourney("bad-id")).resolves.toEqual({ status: "UNAVAILABLE", journeyId: "bad-id" });
    await expect(new DefaultDynamicHomepageJourneySelector({ resolve: async () => ({ status: "INVALID" }) }).selectJourney("bad-id"))
      .resolves.toEqual({ status: "INVALID", journeyId: "bad-id" });
    await expect(new DefaultDynamicHomepageJourneySelector({ resolve: async () => ({ status: "NOT_FOUND" }) }).selectJourney("unknown"))
      .resolves.toEqual({ status: "NOT_FOUND", journeyId: "unknown" });
  });
});
