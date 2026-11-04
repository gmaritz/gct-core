import { AccommodationBookingService } from "../../../src/application/accommodation/booking";
import { AccommodationRateRevalidationService } from "../../../src/application/accommodation/revalidation";
import { PricingEngine } from "../../../src/application/pricing";
import { Reservation, ReservationStatus } from "../../../src/application/reservations/aggregate";
import { AccommodationBookingOrchestrationService } from "../../../src/application/reservations/service/accommodation-booking-orchestration";
import { AccommodationFulfilmentMode } from "../../../src/application/reservations/service/accommodation-fulfilment-mode";
import { ReservationRepository } from "../../../src/application/reservations/repository";
import { ReservationService } from "../../../src/application/reservations/service/reservation-service";
import { CanonicalReservationPaymentContextResolver } from "../../../src/application/payments";
import {
  JourneyAccommodationPricingInput,
  JourneyAccommodationReservationInput,
} from "../../../src/application/journeys/models";

describe("simulated accommodation fulfilment and canonical payment context", () => {
  it("persists an identified simulated result and resolves the canonical ZAR payment context", async () => {
    const accommodation = {
      identity: { id: "hotel-1", name: "Test Hotel" },
      category: "Boutique Hotel" as const,
      location: { country: "ZA", region: "WC", city: "Cape Town", suburb: "", latitude: 0, longitude: 0 },
      rating: { stars: 4, classification: "Premium" },
      images: [],
      amenities: [],
      policies: [],
      contacts: [],
      providerReference: { provider: "hotelbeds", providerAccommodationId: "hotel-1" },
    };
    const occupancy = { rooms: [{ adults: 2, children: 0, childAges: [] }] };
    const rate = {
      reference: { provider: "hotelbeds", opaqueReference: "rate-1" },
      status: "RECHECK_REQUIRED" as const,
      pricing: { amount: 596.68, currency: "EUR", basis: "TOTAL_STAY" as const },
      occupancy,
      cancellationPolicies: [],
      taxes: [],
    };
    const room = {
      reference: { provider: "hotelbeds", opaqueReference: "room-1" },
      name: "Double Room",
      rateOptions: [rate],
    };
    const stayPeriod = { checkIn: new Date("2026-12-10"), checkOut: new Date("2026-12-12") };
    const selectedPricing = {
      packageStopId: "stop-1",
      packageId: "package-1",
      accommodation,
      stayPeriod,
      accommodationId: "hotel-1",
      room,
      rate,
      occupancy,
    } as JourneyAccommodationPricingInput;
    const selectedReservation = {
      packageStopId: "stop-1",
      packageId: "package-1",
      accommodation,
      stayPeriod: selectedPricing.stayPeriod,
      accommodationId: "hotel-1",
      room,
      rate,
      occupancy,
      provider: "hotelbeds",
      supplierReference: rate.reference,
    } as JourneyAccommodationReservationInput;
    const reservation = Reservation.create({
      identity: { id: "reservation-simulated-1" },
      reservationNumber: "RES-SIMULATED-1",
      status: ReservationStatus.CREATED,
      journeySnapshot: {
        snapshotId: "journey-snapshot-1",
        capturedAt: new Date("2026-11-01T00:00:00.000Z"),
        version: "1.0.0",
        journeyId: "journey-simulated-1",
        title: "Test Journey",
      },
      travellerSnapshots: [{
        snapshotId: "traveller-snapshot-1",
        capturedAt: new Date("2026-11-01T00:00:00.000Z"),
        version: "1.0.0",
        travellerId: "traveller-1",
        fullName: "Test Guest",
      }],
      pricingSnapshot: {
        snapshotId: "pricing-snapshot-1",
        capturedAt: new Date("2026-11-01T00:00:00.000Z"),
        version: "1.0.0",
        currency: "ZAR",
        totalPrice: 64990.09,
        taxes: 0,
        discounts: 0,
        fees: 0,
      },
      metadata: {
        createdAt: new Date("2026-11-01T00:00:00.000Z"),
        updatedAt: new Date("2026-11-01T00:00:00.000Z"),
        version: "1.0.0",
      },
    });

    const persisted: Reservation[] = [];
    const repository: ReservationRepository = {
      save: async (value: Reservation): Promise<void> => { persisted.push(value); },
      saveIfAbsent: async (value: Reservation): Promise<void> => { persisted.push(value); },
      findById: async (id: string): Promise<Reservation | null> =>
        persisted.find((value) => value.identity.id === id) ?? null,
      findByReservationNumber: async (number: string): Promise<Reservation | null> =>
        persisted.find((value) => value.reservationNumber === number) ?? null,
      findByTravellerId: async (): Promise<ReadonlyArray<Reservation>> => persisted,
      findByJourneyId: async (journeyId: string): Promise<ReadonlyArray<Reservation>> =>
        persisted.filter((value) => value.journeySnapshot.journeyId === journeyId),
      delete: async (id: string): Promise<void> => {
        const index = persisted.findIndex((value) => value.identity.id === id);
        if (index >= 0) persisted.splice(index, 1);
      },
    };
    const revalidation = { execute: jest.fn() };
    const booking = { execute: jest.fn() };
    const orchestration = new AccommodationBookingOrchestrationService(
      Object.create(PricingEngine.prototype),
      Object.create(ReservationService.prototype),
      revalidation as unknown as AccommodationRateRevalidationService,
      booking as unknown as AccommodationBookingService,
      repository,
      AccommodationFulfilmentMode.SIMULATED,
    );

    const result = await orchestration.fulfilReservation(reservation, {
      packageId: "package-1",
      pricingInputs: [selectedPricing],
      reservationInputs: [selectedReservation],
      finalPackagePrice: { amount: 64990.09, currency: "ZAR" },
      holder: { firstName: "Test", lastName: "Guest", email: "test@example.com" },
      guests: [{ roomIndex: 0, type: "ADULT", firstName: "Test", lastName: "Guest" }],
      idempotencyKey: "reservation-simulated-1",
    }, {
      customerId: "customer-1",
      bookingStartDate: stayPeriod.checkIn,
      bookingEndDate: stayPeriod.checkOut,
    });

    expect(result.successful).toBe(true);
    expect(revalidation.execute).not.toHaveBeenCalled();
    expect(booking.execute).not.toHaveBeenCalled();
    expect(persisted[0]?.supplierReferences[0]).toMatchObject({
      providerId: "gct-test-simulator",
      reservationStatusId: "SIMULATED",
      isSimulated: true,
    });

    const paymentContext = await new CanonicalReservationPaymentContextResolver(repository)
      .resolveForJourney("journey-simulated-1");

    expect(paymentContext?.engineRequest.paymentRequest.paymentAmount).toBe(64990.09);
    expect(paymentContext?.engineRequest.paymentRequest.currency).toBe("ZAR");
    expect(paymentContext?.simulatedSupplierFulfilment).toBe(true);
  });
});
