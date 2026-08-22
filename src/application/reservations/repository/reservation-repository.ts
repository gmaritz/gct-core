import { Reservation } from "../aggregate";

export interface ReservationPersistenceContext {
  readonly customerId: string;
  readonly bookingStartDate: Date;
  readonly bookingEndDate: Date;
}

export interface ReservationRepository {
  save(reservation: Reservation, context: ReservationPersistenceContext): Promise<void>;
  findById(id: string): Promise<Reservation | null>;
  findByReservationNumber(reservationNumber: string): Promise<Reservation | null>;
  findByTravellerId(travellerId: string): Promise<ReadonlyArray<Reservation>>;
  findByJourneyId(journeyId: string): Promise<ReadonlyArray<Reservation>>;
  delete(id: string): Promise<void>;
}
