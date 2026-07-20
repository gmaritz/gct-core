/**
 * Reservation DTO (Data Transfer Object)
 *
 * Used for transferring reservation data between layers.
 */
export interface ReservationDTO {
    id: string;
    reservationNumber: string;
    travelerId: string;
    journeyId: string;
    status: string;
    totalPrice: {
        amount: number;
        currency: string;
    };
    createdAt: Date;
    confirmedAt: Date | null;
    cancelledAt: Date | null;
}
//# sourceMappingURL=reservation.dto.d.ts.map