/**
 * Reservation Presenter
 *
 * Transforms Application responses into API responses.
 */
import { ReservationDTO } from '@application/dto';
export interface ReservationJSONResponse {
    readonly id: string;
    readonly reservationNumber: string;
    readonly travelerId: string;
    readonly journeyId: string;
    readonly status: string;
    readonly totalPrice: {
        readonly amount: number;
        readonly currency: string;
        readonly formatted: string;
    };
    readonly createdAt: string;
    readonly confirmedAt: string | null;
    readonly cancelledAt: string | null;
}
export declare class ReservationPresenter {
    static toJSON(dto: ReservationDTO): ReservationJSONResponse;
    static toJSONList(dtos: ReservationDTO[]): ReservationJSONResponse[];
}
//# sourceMappingURL=reservation.presenter.d.ts.map