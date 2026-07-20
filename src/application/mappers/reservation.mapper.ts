/**
 * Reservation Mapper
 * 
 * Maps between Reservation aggregate and ReservationDTO.
 */
import { Reservation, ReservationStatus } from '@domain/aggregates';
import { Money } from '@domain/value-objects';
import { ReservationDTO } from '../dto/reservation.dto';

export class ReservationMapper {
  static toPersistence(reservation: Reservation): any {
    const price = reservation.getTotalPrice();
    return {
      id: reservation.getId(),
      reservationNumber: reservation.getReservationNumber(),
      travelerId: reservation.getTravelerId(),
      journeyId: reservation.getJourneyId(),
      status: reservation.getStatus(),
      amount: price.amount,
      currency: price.currency,
      createdAt: reservation.getCreatedAt(),
      confirmedAt: reservation.getConfirmedAt(),
      cancelledAt: reservation.getCancelledAt(),
    };
  }

  static toDTO(reservation: Reservation): ReservationDTO {
    const price = reservation.getTotalPrice();
    return {
      id: reservation.getId(),
      reservationNumber: reservation.getReservationNumber(),
      travelerId: reservation.getTravelerId(),
      journeyId: reservation.getJourneyId(),
      status: reservation.getStatus(),
      totalPrice: {
        amount: price.amount,
        currency: price.currency,
      },
      createdAt: reservation.getCreatedAt(),
      confirmedAt: reservation.getConfirmedAt(),
      cancelledAt: reservation.getCancelledAt(),
    };
  }

  static toDomain(raw: any): Reservation {
    const totalPrice = Money.create(raw.amount, raw.currency);
    return Reservation.restore(
      raw.id,
      raw.reservationNumber,
      raw.travelerId,
      raw.journeyId,
      raw.status as ReservationStatus,
      totalPrice,
      raw.createdAt,
      raw.confirmedAt,
      raw.cancelledAt
    );
  }
}
