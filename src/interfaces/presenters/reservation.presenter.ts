/**
 * Reservation Presenter
 * 
 * Transforms Application responses into API responses.
 */
import { ReservationDTO } from '@application/dto';

export class ReservationPresenter {
  static toJSON(dto: ReservationDTO): any {
    return {
      id: dto.id,
      reservationNumber: dto.reservationNumber,
      travelerId: dto.travelerId,
      journeyId: dto.journeyId,
      status: dto.status,
      totalPrice: {
        amount: dto.totalPrice.amount,
        currency: dto.totalPrice.currency,
        formatted: `${dto.totalPrice.currency} ${(dto.totalPrice.amount / 100).toFixed(2)}`,
      },
      createdAt: dto.createdAt.toISOString(),
      confirmedAt: dto.confirmedAt?.toISOString() || null,
      cancelledAt: dto.cancelledAt?.toISOString() || null,
    };
  }

  static toJSONList(dtos: ReservationDTO[]): any[] {
    return dtos.map((dto) => this.toJSON(dto));
  }
}
