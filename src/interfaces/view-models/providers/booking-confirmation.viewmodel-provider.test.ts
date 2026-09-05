import { BookingConfirmationViewModelProvider } from "./booking-confirmation.viewmodel-provider";

describe("BookingConfirmationViewModelProvider", () => {
  it("maps customer-safe confirmed reservation data", (): void => {
    const viewModel = new BookingConfirmationViewModelProvider().provide({
      status: "CONFIRMED",
      journeyId: "journey-homepage-journey-001",
      paymentStatus: "COMPLETED",
      fulfilmentStatus: "CONFIRMED",
      errors: [],
      reservation: {
        reservationNumber: "RES-001",
        status: "CONFIRMED",
        journeySnapshot: {
          title: "Cape Winelands Journey",
          destination: "Cape Winelands",
          duration: "4 Days / 3 Nights",
          startDate: new Date("2026-10-01"),
          endDate: new Date("2026-10-04"),
        },
        accommodationSnapshots: [{ propertyName: "Cape Winelands Retreat", roomType: "Signature Room" }],
        travellerSnapshots: [{ fullName: "Ava Cape", email: "ava@example.com", travellerType: "ADULT" }],
        pricingSnapshot: { totalPrice: 18950, currency: "ZAR" },
      } as never,
    });

    expect(viewModel.reservationReference).toBe("RES-001");
    expect(viewModel.journeyTitle).toBe("Cape Winelands Journey");
    expect(viewModel.amount).toBe(18950);
    expect(viewModel.currency).toBe("ZAR");
    expect(viewModel.leadTraveller).toBe("Ava Cape");
    expect(viewModel.status).toBe("CONFIRMED");
    expect(viewModel.recoveryAction.href).toBe("/ui/journeys/journey-homepage-journey-001");
  });

  it("does not present pending state as confirmed", (): void => {
    const viewModel = new BookingConfirmationViewModelProvider().provide({
      status: "PENDING",
      journeyId: "journey-001",
      errors: [],
      confirmed: false,
    } as never);

    expect(viewModel.message).not.toContain("confirmed");
    expect(viewModel.status).toBe("PENDING");
  });
});
