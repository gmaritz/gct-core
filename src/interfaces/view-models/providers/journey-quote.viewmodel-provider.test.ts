import { JourneyQuoteViewModelProvider } from "./journey-quote.viewmodel-provider";

describe("JourneyQuoteViewModelProvider", () => {
  it("maps unavailable pricing without exposing infrastructure details", (): void => {
    const viewModel = new JourneyQuoteViewModelProvider().provide({
      status: "RECHECK_REQUIRED",
      journeyId: "journey-homepage-journey-001",
      selections: [],
    });

    expect(viewModel.status).toBe("RECHECK_REQUIRED");
    expect(viewModel.pricing).toBeUndefined();
    expect(viewModel.message).toContain("checked again");
    expect(viewModel.recoveryHref).toBe("/ui/journeys/journey-homepage-journey-001/accommodation");
    expect(Object.isFrozen(viewModel)).toBe(true);
  });
});
