import {
  DefaultReservationReviewService,
  ReservationReviewAcceptanceStore,
} from "./reservation-review-service";
import { DefaultDynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { GuestInformationInput } from "./guest-information-service";
import { GuestInformationStore } from "./guest-information-store";

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
    const journeyId = "journey-homepage-journey-002";
    const journey = { identity: { id: journeyId } };
    let total = 1000;
    const resolver = {
      resolve: async () => ({ status: "RESOLVED", journey }),
    };
    const quoteService = {
      priceCurrentJourney: async () => ({
        status: "PRICED",
        journeyId,
        journey,
        selections: [],
        pricing: {
          pricing: {
            identity: { id: "pricing-1" },
            currency: "ZAR",
            totals: { grandTotal: { amount: total } },
            breakdown: { lineItems: [] },
          },
        },
      }),
    };
    const guestStore = new GuestInformationStore();
    guestStore.save("owner-a", journeyId, guestInformation);
    const service = new DefaultReservationReviewService(
      resolver as never,
      { captureGuestInformation: async () => ({ status: "VALID", errors: [] }) } as never,
      quoteService as never,
      guestStore,
      new ReservationReviewAcceptanceStore(),
      () => new Date("2026-11-18T12:00:00.000Z"),
    );
    const result = await service.review({
      ownerId: "owner-a",
      journeyId,
    });

    expect(result.status).toBe("READY");
    expect(result.confirmed).toBe(false);
    expect(result.quote?.status).toBe("PRICED");
    expect(result.guestInformation).toEqual(guestInformation);

    const acceptedReview = await service.review({
      ownerId: "owner-a",
      journeyId,
      confirmed: true,
      acceptanceToken: result.acceptanceToken,
    });
    expect(acceptedReview.confirmed).toBe(true);

    total = 1100;
    const changedReview = await service.review({
      ownerId: "owner-a",
      journeyId,
      confirmed: true,
      acceptanceToken: result.acceptanceToken,
    });
    expect(changedReview.confirmed).toBe(false);
    expect(changedReview.errors).toContain("The quote or payment terms have changed since your review. Review and accept the current terms to continue.");
  });

  it("does not confirm invalid guest information", async (): Promise<void> => {
    const result = await new DefaultReservationReviewService(
      undefined,
      undefined,
      undefined,
      new GuestInformationStore(),
    ).review({
      ownerId: "owner-a",
      journeyId: "journey-homepage-journey-001",
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
    const result = await new DefaultReservationReviewService(
      resolver,
      undefined,
      undefined,
      new GuestInformationStore(),
    ).review({
      ownerId: "owner-a",
      journeyId: "journey-homepage-journey-001",
    });

    expect(result.status).toBe("UNAVAILABLE");
  });
});
