import { Reservation } from "../aggregate";
import { ReservationRepository } from "../repository";
export type ReservationConfirmationStatus = "CONFIRMED" | "PENDING" | "FAILED" | "CANCELLED" | "INVALID" | "NOT_FOUND" | "UNAVAILABLE";
export interface ReservationConfirmationResult {
    readonly status: ReservationConfirmationStatus;
    readonly journeyId: string;
    readonly reservation?: Reservation;
    readonly paymentStatus?: string;
    readonly fulfilmentStatus?: string;
    readonly errors: ReadonlyArray<string>;
}
export interface ReservationConfirmationService {
    resolve(journeyId: string): Promise<ReservationConfirmationResult>;
}
export declare class DefaultReservationConfirmationService implements ReservationConfirmationService {
    private readonly repository;
    constructor(repository: ReservationRepository);
    resolve(journeyId: string): Promise<ReservationConfirmationResult>;
}
//# sourceMappingURL=reservation-confirmation-service.d.ts.map