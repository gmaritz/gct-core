import { Reservation, ReservationStatus } from "@application/reservations/aggregate";

import { BookingGateway } from "./booking-gateway";
import { BookingIntegrationOrchestrator } from "./booking-integration-orchestrator";
import { BookingIntegrationRequest } from "./models";

function createReservation(): Reservation {
  return Reservation.create({
    identity: { id: "reservation-2001" },
    status: ReservationStatus.CREATED,
    journeySnapshot: {
      snapshotId: "journey-snap-2001",
      capturedAt: new Date("2026-08-07T12:00:00.000Z"),
      version: "1.0.0",
      journeyId: "journey-7001",
      title: "Cape Heritage Escape",
      destination: "Cape Town",
      duration: "3 days / 2 nights",
      accommodationSummary: "Boutique city stay",
      experienceSummary: "Guided heritage route",
    },
    travellerSnapshots: [
      {
        snapshotId: "traveller-snap-2001",
        capturedAt: new Date("2026-08-07T12:00:00.000Z"),
        version: "1.0.0",
        travellerId: "traveller-2001",
        fullName: "Ari Jacobs",
      },
    ],
    metadata: {
      createdAt: new Date("2026-08-07T12:00:00.000Z"),
      updatedAt: new Date("2026-08-07T12:00:00.000Z"),
      version: "1.0.0",
    },
  });
}

function createRequest(operation: BookingIntegrationRequest["bookingRequest"]["operation"]): BookingIntegrationRequest {
  const reservation = createReservation();

  return Object.freeze({
    reservation,
    bookingRequest: Object.freeze({
      operation,
      reservationId: reservation.identity.id,
      payload: Object.freeze({
        specialRequest: "Late check-in",
      }),
    }),
    providerSelection: Object.freeze({
      providerId: "hotelbeds",
      channel: "b2b",
    }),
    correlation: Object.freeze({
      requestId: "reservation-request-2001",
      correlationId: "correlation-2001",
      traceId: "trace-2001",
    }),
    metadata: Object.freeze({
      source: "test",
    }),
  });
}

describe("BookingGateway", () => {
  it("supports compile-safe provider-independent contract", async () => {
    const gateway: BookingGateway = {
      createBooking: async () => ({ successful: true, providerIdentifier: "provider-a" }),
      amendBooking: async () => ({ successful: true, providerIdentifier: "provider-a" }),
      cancelBooking: async () => ({ successful: true, providerIdentifier: "provider-a" }),
      retrieveBookingStatus: async () => ({ successful: true, providerIdentifier: "provider-a" }),
    };

    const result = await gateway.createBooking(createRequest("CREATE") as never);

    expect(result.successful).toBe(true);
  });
});

describe("BookingIntegrationOrchestrator", () => {
  it("invokes create booking gateway operation", async () => {
    const calls: string[] = [];

    const gateway: BookingGateway = {
      createBooking: async () => {
        calls.push("create");
        return {
          successful: true,
          providerIdentifier: "hotelbeds",
          providerBookingReference: "HB-REF-9001",
          reservationStatus: ReservationStatus.CONFIRMED,
        };
      },
      amendBooking: async () => {
        calls.push("amend");
        return { successful: true, providerIdentifier: "hotelbeds" };
      },
      cancelBooking: async () => {
        calls.push("cancel");
        return { successful: true, providerIdentifier: "hotelbeds" };
      },
      retrieveBookingStatus: async () => {
        calls.push("status");
        return { successful: true, providerIdentifier: "hotelbeds" };
      },
    };

    const orchestrator = new BookingIntegrationOrchestrator(gateway);
    await orchestrator.execute(createRequest("CREATE"));

    expect(calls).toEqual(["create"]);
  });

  it("returns successful booking integration result", async () => {
    const gateway: BookingGateway = {
      createBooking: async () => ({
        successful: true,
        providerIdentifier: "hotelbeds",
        providerBookingReference: "HB-REF-9002",
        reservationStatus: ReservationStatus.CONFIRMED,
        warnings: ["Supplier confirmation pending"],
      }),
      amendBooking: async () => ({ successful: true, providerIdentifier: "hotelbeds" }),
      cancelBooking: async () => ({ successful: true, providerIdentifier: "hotelbeds" }),
      retrieveBookingStatus: async () => ({ successful: true, providerIdentifier: "hotelbeds" }),
    };

    const orchestrator = new BookingIntegrationOrchestrator(gateway);
    const result = await orchestrator.execute(createRequest("CREATE"));

    expect(result.successful).toBe(true);
    expect(result.providerIdentifier).toBe("hotelbeds");
    expect(result.providerBookingReference).toBe("HB-REF-9002");
    expect(result.reservationStatus).toBe(ReservationStatus.CONFIRMED);
    expect(result.warnings).toEqual(["Supplier confirmation pending"]);
  });

  it("returns failed booking integration result for business failure", async () => {
    const gateway: BookingGateway = {
      createBooking: async () => ({
        successful: false,
        providerIdentifier: "hotelbeds",
        errors: ["Inventory unavailable"],
        reservationStatus: ReservationStatus.CREATED,
      }),
      amendBooking: async () => ({ successful: true, providerIdentifier: "hotelbeds" }),
      cancelBooking: async () => ({ successful: true, providerIdentifier: "hotelbeds" }),
      retrieveBookingStatus: async () => ({ successful: true, providerIdentifier: "hotelbeds" }),
    };

    const orchestrator = new BookingIntegrationOrchestrator(gateway);
    const result = await orchestrator.execute(createRequest("CREATE"));

    expect(result.successful).toBe(false);
    expect(result.errors).toEqual(["Inventory unavailable"]);
    expect(result.providerBookingReference).toBeNull();
  });

  it("uses constructor-injected gateway and provides immutable result", async () => {
    let receivedRequestId = "";

    const gateway: BookingGateway = {
      createBooking: async (context) => {
        expect(Object.isFrozen(context)).toBe(true);
        expect(Object.isFrozen(context.bookingRequest)).toBe(true);
        expect(Object.isFrozen(context.providerSelection)).toBe(true);
        expect(Object.isFrozen(context.correlation)).toBe(true);
        receivedRequestId = context.correlation.requestId;

        return {
          successful: true,
          providerIdentifier: context.providerSelection.providerId,
        };
      },
      amendBooking: async () => ({ successful: true, providerIdentifier: "hotelbeds" }),
      cancelBooking: async () => ({ successful: true, providerIdentifier: "hotelbeds" }),
      retrieveBookingStatus: async () => ({ successful: true, providerIdentifier: "hotelbeds" }),
    };

    const orchestrator = new BookingIntegrationOrchestrator(gateway);
    const result = await orchestrator.execute(createRequest("CREATE"));

    expect(receivedRequestId).toBe("reservation-request-2001");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
  });
});
