/**
 * Reservation Mapper
 *
 * Maps between Reservation aggregate and ReservationDTO.
 */
import { Reservation } from '@domain/aggregates';
import { ReservationDTO } from '../dto/reservation.dto';
export declare class ReservationMapper {
    static toPersistence(reservation: Reservation): any;
    static toDTO(reservation: Reservation): ReservationDTO;
    static toDomain(raw: any): Reservation;
}
//# sourceMappingURL=reservation.mapper.d.ts.map