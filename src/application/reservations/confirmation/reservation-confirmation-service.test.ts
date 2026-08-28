import { ReservationConfirmationService, DefaultReservationConfirmationService } from "./reservation-confirmation-service";
import { ReservationStatus } from "../aggregate";

function reservation(status: ReservationStatus, paymentStatus = "COMPLETED", supplierStatus = "CONFIRMED"): unknown {
  return {
    identity: { id: "reservation-001" },
    reservationNumber: "RES-001",
    status,
    journeySnapshot: {
      journeyId: "journey-homepage-journey-001",
      title: "Cape Winelands Journey",
      destination: "Cape Winelands",
      duration: "4 Days / 3 Nights",
      startDate: new Date("2026-10-01"),
      endDate: new Date("2026-10-04"),
    },
    accommodationSnapshots: [{ propertyName: "Cape Winelands Retreat", roomType: "Signature Room" }],
    travellerSnapshots: [{ fullName: "Ava Cape", email: "ava@example.com", travellerType: "ADULT" }],
    pricingSnapshot: { totalPrice: 18950, currency: "ZAR" },
    paymentSnapshot: { paymentStatus },
    bookingItems: [{ supplierBookings: [{ status: supplierStatus }] }],
    supplierReferences: [],
  };
}

function serviceFor(value: unknown): ReservationConfirmationService {
  return new DefaultReservationConfirmationService({
    findByJourneyId: async (): Promise<ReadonlyArray<unknown>> => value ? [value] : [],
  } as never);
}

describe("DefaultReservationConfirmationService", () => {
  it("resolves confirmed only when payment, reservation and fulfilment are confirmed", async (): Promise<void> => {
    const result = await serviceFor(reservation(ReservationStatus.CONFIRMED)).resolve("journey-homepage-journey-001");

    expect(result.status).toBe("CONFIRMED");
    expect(result.reservation?.reservationNumber).toBe("RES-001");
    expect(result.paymentStatus).toBe("COMPLETED");
    expect(result.fulfilmentStatus).toBe("CONFIRMED");
  });

  it("maps pending, failed and cancelled authoritative states", async (): Promise<void> => {
    await expect(serviceFor(reservation(ReservationStatus.CREATED, "PENDING")).resolve("journey-homepage-journey-001"))
      .resolves.toMatchObject({ status: "PENDING" });
    await expect(serviceFor(reservation(ReservationStatus.CONFIRMED, "FAILED")).resolve("journey-homepage-journey-001"))
      .resolves.toMatchObject({ status: "FAILED" });
    await expect(serviceFor(reservation(ReservationStatus.CANCELLED)).resolve("journey-homepage-journey-001"))
      .resolves.toMatchObject({ status: "CANCELLED" });
  });

  it("rejects invalid and unknown journey references", async (): Promise<void> => {
    await expect(serviceFor(null).resolve("invalid")).resolves.toMatchObject({ status: "INVALID" });
    await expect(serviceFor(null).resolve("journey-homepage-journey-001")).resolves.toMatchObject({ status: "NOT_FOUND" });
  });

  it("keeps confirmed payment pending when fulfilment is not confirmed", async (): Promise<void> => {
    const result = await serviceFor(reservation(ReservationStatus.CONFIRMED, "COMPLETED", "PENDING"))
      .resolve("journey-homepage-journey-001");

    expect(result.status).toBe("PENDING");
  });
});
