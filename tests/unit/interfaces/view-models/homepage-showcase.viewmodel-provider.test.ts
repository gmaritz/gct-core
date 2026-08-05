import { getHomepageShowcaseViewModel } from "@interfaces/view-models";

describe("getHomepageShowcaseViewModel", () => {
  it("builds the homepage showcase presentation contract", () => {
    const viewModel = getHomepageShowcaseViewModel();

    expect(viewModel.editorial.eyebrow).toBe("Curated Private Journeys");
    expect(viewModel.editorial.heading).toContain("Carefully Curated Journeys");
    expect(viewModel.editorial.primaryCTA.label).toBe("Explore Experiences");
    expect(viewModel.editorial.secondaryCTA.label).toBe("Plan Your Journey");
    expect(viewModel.metadata.version).toBe("1.0.0");
    expect(viewModel.journeys).toHaveLength(3);
    expect(viewModel.journeys[0].title).toBe("Luxury Winelands Escape");
    expect(viewModel.journeys[0].image.alt).toBe("Luxury Winelands landscape");
    expect(viewModel.journeys[0].price.display).toBe("From R18 950 per couple");
    expect(viewModel.journeys[0].saving.display).toBe("Save 22%");
    expect(viewModel.journeys[0].primaryCTA.label).toBe("View Journey");
    expect(viewModel.journeys[1].highlights).toContain("Sunset tastings");
  });
});
