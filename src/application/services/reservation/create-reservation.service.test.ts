import { CreateReservationCommand } from "../../commands/create-reservation.command";
import { CreateReservationService } from "./create-reservation.service";
import { IReservationRepository, ReservationPersistenceContext } from "@domain/repositories";
import { Reservation } from "@domain/aggregates";

describe("CreateReservationService persistence context", () => {
  it("passes explicit customer and booking dates to reservation persistence", async () => {
    let savedContext: ReservationPersistenceContext | undefined;

    const repository: IReservationRepository = {
      save: async (_reservation: Reservation, context?: ReservationPersistenceContext): Promise<void> => {
        savedContext = context;
      },
      findById: async () => null,
      findByReservationNumber: async () => null,
      findByTravelerId: async () => [],
      findByJourneyId: async () => [],
      delete: async (): Promise<void> => undefined,
    };

    const service = new CreateReservationService(repository);
    const command = new CreateReservationCommand(
      "customer-001",
      "traveller-001",
      "journey-001",
      15000,
      "ZAR",
      new Date("2026-09-01T00:00:00.000Z"),
      new Date("2026-09-05T00:00:00.000Z"),
    );

    const result = await service.execute(command);

    expect(result.id).toBeTruthy();
    expect(result.reservationNumber).toMatch(/^RES-\d{6}-[A-Z0-9]{4}$/);
    expect(savedContext).toEqual({
      customerId: "customer-001",
      bookingStartDate: new Date("2026-09-01T00:00:00.000Z"),
      bookingEndDate: new Date("2026-09-05T00:00:00.000Z"),
      bookingStatus: undefined,
    });
  });

  it("rejects missing customer context before persistence", async () => {
    const save = jest.fn();

    const repository: IReservationRepository = {
      save,
      findById: async () => null,
      findByReservationNumber: async () => null,
      findByTravelerId: async () => [],
      findByJourneyId: async () => [],
      delete: async (): Promise<void> => undefined,
    };

    const service = new CreateReservationService(repository);

    await expect(service.execute(new CreateReservationCommand(
      "",
      "traveller-001",
      "journey-001",
      15000,
      "ZAR",
      new Date("2026-09-01T00:00:00.000Z"),
      new Date("2026-09-05T00:00:00.000Z"),
    ))).rejects.toThrow("Customer ID is required");

    expect(save).not.toHaveBeenCalled();
  });

  it("rejects invalid booking dates before persistence", async () => {
    const save = jest.fn();

    const repository: IReservationRepository = {
      save,
      findById: async () => null,
      findByReservationNumber: async () => null,
      findByTravelerId: async () => [],
      findByJourneyId: async () => [],
      delete: async (): Promise<void> => undefined,
    };

    const service = new CreateReservationService(repository);

    await expect(service.execute(new CreateReservationCommand(
      "customer-001",
      "traveller-001",
      "journey-001",
      15000,
      "ZAR",
      new Date("2026-09-10T00:00:00.000Z"),
      new Date("2026-09-05T00:00:00.000Z"),
    ))).rejects.toThrow("Booking end date must be on or after booking start date");

    expect(save).not.toHaveBeenCalled();
  });
});
