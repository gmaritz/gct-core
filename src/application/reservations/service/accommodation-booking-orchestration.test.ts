import { AccommodationBookingOrchestrationService } from "./accommodation-booking-orchestration";
import { AccommodationBookingService } from "@application/accommodation/booking";
import { AccommodationRateRevalidationService } from "@application/accommodation/revalidation";
import { PricingEngine, PricingEngineRequest } from "@application/pricing";
import { ReservationService } from "./reservation-service";
import { ReservationStatus } from "../aggregate";
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
      reservation: { query: { requestId: "r1", journeyId: "j1", checkInDate: new Date("2026-10-01"), checkOutDate: new Date("2026-10-04"), travellers: [{ travellerId: "t1", fullName: "Ari" }] }, snapshots: { journeySnapshot: { snapshotId: "j", capturedAt: new Date(), version: "1", journeyId: "j1", title: "Journey" }, travellerSnapshots: [{ snapshotId: "t", capturedAt: new Date(), version: "1", travellerId: "t1", fullName: "Ari" }], metadata: { createdAt: new Date(), updatedAt: new Date(), version: "1" } }, metadata: { createdAt: new Date(), updatedAt: new Date(), version: "1" }, timelineSeed: [] },
      handoff: { packageId: "package-1", pricingInputs: [selected.pricing], reservationInputs: [selected.reservation], finalPackagePrice: { amount: 0, currency: "ZAR" }, holder: { firstName: "Ari", lastName: "A", email: "ari@example.com" }, guests: [{ roomIndex: 0, type: "ADULT", firstName: "Ari", lastName: "A" }], idempotencyKey: "id-1" },
    });

    expect(calls).toEqual(["pricing", "reservation", "revalidation", "booking"]);
    expect(result.successful).toBe(true);
  });
});
