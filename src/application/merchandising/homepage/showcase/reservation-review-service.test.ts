import { DefaultDynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { DefaultReservationReviewService } from "./reservation-review-service";
import { GuestInformationInput } from "./guest-information-service";

const guestInformation: GuestInformationInput = {
  contact: { email: "contact@example.com" },
  leadTravellerIndex: 0,
  travellers: [
    { firstName: "Ava", lastName: "Cape", email: "ava@example.com", travellerType: "ADULT" },
    { firstName: "Ben", lastName: "Cape", email: "ben@example.com", travellerType: "ADULT" },
  ],
};

describe("DefaultReservationReviewService", () => {
  it("revalidates the journey, quote and guest information", async (): Promise<void> => {
    const result = await new DefaultReservationReviewService().review({
      journeyId: "journey-homepage-journey-001",
      guestInformation,
    });

    expect(result.status).toBe("READY");
    expect(result.confirmed).toBe(false);
    expect(result.quote?.status).toBe("PRICED");
    expect(result.guestInformation).toBe(guestInformation);
  });

  it("does not confirm invalid guest information", async (): Promise<void> => {
    const result = await new DefaultReservationReviewService().review({
      journeyId: "journey-homepage-journey-001",
      guestInformation: { ...guestInformation, travellers: [] },
      confirmed: true,
    });

    expect(result.status).toBe("INVALID");
    expect(result.confirmed).toBe(false);
  });

  it("returns unavailable for an unresolved journey without creating a reservation", async (): Promise<void> => {
    const resolver = new DefaultDynamicHomepageJourneyResolver({
      execute: async () => ({
        success: false,
        payload: null,
        metadata: { generatedAt: new Date(), version: "1.0.0" },
      }),
    });
    const result = await new DefaultReservationReviewService(resolver).review({
      journeyId: "journey-homepage-journey-001",
      guestInformation,
    });

    expect(result.status).toBe("UNAVAILABLE");
  });
});
