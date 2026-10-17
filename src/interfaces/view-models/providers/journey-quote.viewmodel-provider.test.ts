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

  it("shows ZAR group component and supplier currency without a combined total when currency is unconfirmed", (): void => {
    const stay = (stopId: string): never => ({ accommodationId: `hotel-${stopId}`, stopId } as never);
    const viewModel = new JourneyQuoteViewModelProvider().provide({
      status: "CURRENCY_UNCONFIRMED",
      journeyId: "journey-homepage-journey-001",
      selections: [stay("stop-1")],
      groupComponent: { amount: 51376, currency: "ZAR" },
    });

    expect(viewModel.status).toBe("CURRENCY_UNCONFIRMED");
    expect(viewModel.pricing).toBeUndefined();
    expect(viewModel.accommodationTotal).toBeUndefined();
    expect(viewModel.groupComponent).toEqual({ amount: 51376, currency: "ZAR" });
    expect(viewModel.message).toContain("currency requires confirmation");
  });
});
