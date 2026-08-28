import { ReservationReviewViewModelProvider } from "./reservation-review.viewmodel-provider";

describe("ReservationReviewViewModelProvider", () => {
  it("maps review state without exposing infrastructure objects", (): void => {
    const viewModel = new ReservationReviewViewModelProvider().provide({
      status: "READY",
      journeyId: "journey-homepage-journey-001",
      errors: [],
      confirmed: false,
      journey: {
        identity: { id: "journey-homepage-journey-001" },
        classification: { category: "SIGNATURE", type: "PACKAGE" },
        destinations: [{ name: "Cape Winelands" }],
        duration: { description: "4 Days / 3 Nights" },
        accommodation: [],
      } as never,
      guestInformation: {
        contact: { email: "contact@example.com" },
        leadTravellerIndex: 0,
        travellers: [{ firstName: "Ava", lastName: "Cape", email: "ava@example.com", travellerType: "ADULT" }, { firstName: "Ben", lastName: "Cape", email: "ben@example.com", travellerType: "ADULT" }],
      },
    });

    expect(viewModel.journeyTitle).toContain("Cape Winelands");
    expect(viewModel.travellers[0]?.name).toBe("Ava Cape");
    expect(viewModel.confirmationAction?.label).toBe("Confirm and continue to payment");
    expect(viewModel.accommodationHref).toContain("/accommodation");
    expect(Object.isFrozen(viewModel)).toBe(true);
  });
});
