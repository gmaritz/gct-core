import { AggregateRoot } from '../shared/aggregate-root';
import { Money } from '../value-objects/money.vo';
/**
 * Reservation Status enumeration
 */
export declare enum ReservationStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}
/**
 * Reservation Aggregate Root
 *
 * Represents a booking of a journey by a traveller.
 * Encapsulates reservation state and business rules.
 */
export declare class Reservation extends AggregateRoot {
    private reservationNumber;
    private travelerId;
    private journeyId;
    private status;
    private totalPrice;
    private createdAt;
    private confirmedAt;
    private cancelledAt;
    private constructor();
    static create(travelerId: string, journeyId: string, totalPrice: Money): Reservation;
    static restore(id: string, reservationNumber: string, travelerId: string, journeyId: string, status: ReservationStatus, totalPrice: Money, createdAt: Date, confirmedAt: Date | null, cancelledAt: Date | null): Reservation;
    confirm(): void;
    cancel(reason: string): void;
    getReservationNumber(): string;
    getTravelerId(): string;
    getJourneyId(): string;
    getStatus(): ReservationStatus;
    getTotalPrice(): Money;
    getCreatedAt(): Date;
    getConfirmedAt(): Date | null;
    getCancelledAt(): Date | null;
    isValid(): boolean;
    private static generateReservationNumber;
}
//# sourceMappingURL=reservation.aggregate.d.ts.map