import { AccommodationBookingOrchestrationService } from "./accommodation-booking-orchestration";
import { AccommodationBookingService } from "@application/accommodation/booking";
import { AccommodationRateRevalidationService } from "@application/accommodation/revalidation";
import { PricingEngine, PricingEngineRequest } from "@application/pricing";
import { ReservationService } from "./reservation-service";
import { Reservation, ReservationStatus } from "../aggregate";
import { JourneyAccommodationPricingInput, JourneyAccommodationReservationInput } from "@application/journeys/models";

function input(status: "BOOKABLE" | "RECHECK_REQUIRED" = "BOOKABLE"): {
  pricing: JourneyAccommodationPricingInput;
  reservation: JourneyAccommodationReservationInput;
} {
  const accommodation = {
    identity: { id: "hotel-1", name: "Hotel" }, category: "Boutique Hotel" as const,
    location: { country: "ZA", region: "WC", city: "Cape Town", suburb: "", latitude: 0, longitude: 0 },
    rating: { stars: 4, classification: "Premium" }, images: [], amenities: [], policies: [], contacts: [],
    providerReference: { provider: "supplier-a", providerAccommodationId: "hotel-1" },
  };
  const rate = {
    reference: { provider: "supplier-a", opaqueReference: "rate-1" }, status,
    pricing: { amount: 250, currency: "ZAR", basis: "TOTAL_STAY" },
    occupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] }, cancellationPolicies: [], taxes: [],
  };
  const room = { reference: { provider: "supplier-a", opaqueReference: "room-1" }, name: "Room", rateOptions: [rate] };
  return {
    pricing: { packageStopId: "stop-1", packageId: "package-1", accommodation, stayPeriod: { checkIn: new Date("2026-10-01"), checkOut: new Date("2026-10-04") }, accommodationId: "hotel-1", room, rate, occupancy: rate.occupancy } as JourneyAccommodationPricingInput,
    reservation: { packageStopId: "stop-1", packageId: "package-1", accommodation, stayPeriod: { checkIn: new Date("2026-10-01"), checkOut: new Date("2026-10-04") }, accommodationId: "hotel-1", room, rate, occupancy: rate.occupancy, provider: "supplier-a", supplierReference: rate.reference } as JourneyAccommodationReservationInput,
  };
}

describe("AccommodationBookingOrchestrationService", () => {
  it("connects pricing, reservation, revalidation and booking per stop", async () => {
    const calls: string[] = [];
    const selected = input("RECHECK_REQUIRED");
    const pricing = {
      pricingRequest: { currency: "ZAR", breakdown: { lineItems: [] }, totals: { subtotal: { amount: 0, currency: "ZAR" }, taxTotal: { amount: 0, currency: "ZAR" }, feeTotal: { amount: 0, currency: "ZAR" }, discountTotal: { amount: 0, currency: "ZAR" }, markupTotal: { amount: 0, currency: "ZAR" }, commissionTotal: { amount: 0, currency: "ZAR" }, grandTotal: { amount: 0, currency: "ZAR" } } },
    } as PricingEngineRequest;
    const service = new AccommodationBookingOrchestrationService(
      Object.assign(Object.create(PricingEngine.prototype), { execute: async () => { calls.push("pricing"); return { successful: true, pricing: { currency: "ZAR", totals: { grandTotal: { amount: 1000 }, taxTotal: { amount: 0 }, discountTotal: { amount: 0 }, feeTotal: { amount: 0 } } }, warnings: [] }; } }),
      Object.assign(Object.create(ReservationService.prototype), { execute: async () => { calls.push("reservation"); return { successful: true, reservation: { status: ReservationStatus.CREATED }, errors: [], warnings: [] }; } }),
      Object.assign(Object.create(AccommodationRateRevalidationService.prototype), { execute: async () => { calls.push("revalidation"); return { status: "VALID", currentRate: { ...selected.pricing.rate, status: "BOOKABLE" }, previousRate: selected.pricing.rate, accommodation: selected.pricing.accommodation, room: selected.pricing.room, provider: "supplier-a" }; } }),
      Object.assign(Object.create(AccommodationBookingService.prototype), { execute: async () => { calls.push("booking"); return { successful: true, status: "CONFIRMED", provider: "supplier-a", errors: [], warnings: [] }; } }),
    );

    const result = await service.execute({
      pricing,
      reservation: { query: { requestId: "r1", customerId: "customer-001", journeyId: "j1", checkInDate: new Date("2026-10-01"), checkOutDate: new Date("2026-10-04"), travellers: [{ travellerId: "t1", fullName: "Ari" }] }, snapshots: { journeySnapshot: { snapshotId: "j", capturedAt: new Date(), version: "1", journeyId: "j1", title: "Journey" }, travellerSnapshots: [{ snapshotId: "t", capturedAt: new Date(), version: "1", travellerId: "t1", fullName: "Ari" }], metadata: { createdAt: new Date(), updatedAt: new Date(), version: "1" } }, metadata: { createdAt: new Date(), updatedAt: new Date(), version: "1" }, timelineSeed: [] },
      handoff: { packageId: "package-1", pricingInputs: [selected.pricing], reservationInputs: [selected.reservation], finalPackagePrice: { amount: 0, currency: "ZAR" }, holder: { firstName: "Ari", lastName: "A", email: "ari@example.com" }, guests: [{ roomIndex: 0, type: "ADULT", firstName: "Ari", lastName: "A" }], idempotencyKey: "id-1" },
    });

    expect(calls).toEqual(["pricing", "reservation", "revalidation", "booking"]);
    expect(result.successful).toBe(true);
  });

  it("persists stop-specific supplier fulfilment on an existing reservation", async () => {
    const selected = input();
    let persisted: import("@application/reservations/aggregate").Reservation | undefined;
    const repository = {
      save: async (reservation: import("@application/reservations/aggregate").Reservation): Promise<void> => {
        persisted = reservation;
      },
    };
    const booking = {
      successful: true,
      status: "CONFIRMED" as const,
      provider: "supplier-a",
      accommodation: selected.pricing.accommodation,
      room: selected.pricing.room,
      rate: selected.pricing.rate,
      supplierBookingReference: "SUP-BOOK-1",
      packageStopId: "stop-1",
      errors: [],
      warnings: [],
    };
    const service = new AccommodationBookingOrchestrationService(
      Object.assign(Object.create(PricingEngine.prototype), { execute: async () => { throw new Error("not used"); } }),
      Object.assign(Object.create(ReservationService.prototype), {}),
      Object.assign(Object.create(AccommodationRateRevalidationService.prototype), {}),
      Object.assign(Object.create(AccommodationBookingService.prototype), { execute: async () => booking }),
      repository as never,
    );
    const existing = Reservation.create({
      identity: { id: "reservation-1" }, reservationNumber: "RES-1", status: ReservationStatus.CREATED,
      journeySnapshot: { snapshotId: "journey", capturedAt: new Date(), version: "1", journeyId: "j1", title: "Journey" },
      travellerSnapshots: [{ snapshotId: "traveller", capturedAt: new Date(), version: "1", travellerId: "t1", fullName: "Ari" }],
      metadata: { createdAt: new Date(), updatedAt: new Date(), version: "1" },
    });
    const result = await service.fulfilReservation(existing, {
      packageId: "package-1",
      pricingInputs: [selected.pricing],
      reservationInputs: [selected.reservation],
      finalPackagePrice: { amount: 250, currency: "ZAR" },
      holder: { firstName: "Ari", lastName: "A", email: "ari@example.com" },
      guests: [{ roomIndex: 0, type: "ADULT", firstName: "Ari", lastName: "A" }],
      idempotencyKey: "reservation-1",
    }, { customerId: "customer-1", bookingStartDate: new Date(), bookingEndDate: new Date() });

    expect(result.successful).toBe(true);
    expect(persisted?.supplierReferences[0]?.snapshotId).toContain("stop-1");
    expect(persisted?.supplierReferences[0]?.supplierBookingReference).toBe("SUP-BOOK-1");
  });
});
