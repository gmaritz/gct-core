import { v4 as uuidv4 } from 'uuid';
import { AggregateRoot } from '../shared/aggregate-root';
import { ReservationCreatedEvent, ReservationConfirmedEvent, ReservationCancelledEvent } from '../events/reservation.event';
import { Money } from '../value-objects/money.vo';
import { InvalidReservationException, ReservationCannotBeCancelledException } from '../exceptions/reservation.exception';

/**
 * Reservation Status enumeration
 */
export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

/**
 * Reservation Aggregate Root
 * 
 * Represents a booking of a journey by a traveller.
 * Encapsulates reservation state and business rules.
 */
export class Reservation extends AggregateRoot {
  private reservationNumber: string;
  private travelerId: string;
  private journeyId: string;
  private status: ReservationStatus;
  private totalPrice: Money;
  private createdAt: Date;
  private confirmedAt: Date | null;
  private cancelledAt: Date | null;

  private constructor(
    id: string,
    reservationNumber: string,
    travelerId: string,
    journeyId: string,
    status: ReservationStatus,
    totalPrice: Money,
    createdAt: Date = new Date(),
    confirmedAt: Date | null = null,
    cancelledAt: Date | null = null
  ) {
    super(id);
    this.reservationNumber = reservationNumber;
    this.travelerId = travelerId;
    this.journeyId = journeyId;
    this.status = status;
    this.totalPrice = totalPrice;
    this.createdAt = createdAt;
    this.confirmedAt = confirmedAt;
    this.cancelledAt = cancelledAt;
  }

  static create(
    travelerId: string,
    journeyId: string,
    totalPrice: Money,
    reservationNumber: string,
  ): Reservation {
    if (!travelerId) {
      throw new InvalidReservationException('Traveller ID is required');
    }
    if (!journeyId) {
      throw new InvalidReservationException('Journey ID is required');
    }
    if (!reservationNumber || reservationNumber.trim().length === 0) {
      throw new InvalidReservationException('Reservation number is required');
    }

    const id = uuidv4();
    const reservation = new Reservation(
      id,
      reservationNumber,
      travelerId,
      journeyId,
      ReservationStatus.PENDING,
      totalPrice
    );

    reservation.addDomainEvent(
      new ReservationCreatedEvent(id, travelerId, journeyId)
    );

    return reservation;
  }

  static restore(
    id: string,
    reservationNumber: string,
    travelerId: string,
    journeyId: string,
    status: ReservationStatus,
    totalPrice: Money,
    createdAt: Date,
    confirmedAt: Date | null,
    cancelledAt: Date | null
  ): Reservation {
    return new Reservation(
      id,
      reservationNumber,
      travelerId,
      journeyId,
      status,
      totalPrice,
      createdAt,
      confirmedAt,
      cancelledAt
    );
  }

  confirm(): void {
    if (this.status !== ReservationStatus.PENDING) {
      throw new InvalidReservationException('Only pending reservations can be confirmed');
    }

    this.status = ReservationStatus.CONFIRMED;
    this.confirmedAt = new Date();

    this.addDomainEvent(
      new ReservationConfirmedEvent(this.id, this.reservationNumber)
    );
  }

  cancel(reason: string): void {
    if (this.status === ReservationStatus.CANCELLED) {
      throw new ReservationCannotBeCancelledException(
        this.id,
        'Reservation is already cancelled'
      );
    }

    if (this.status === ReservationStatus.COMPLETED) {
      throw new ReservationCannotBeCancelledException(
        this.id,
        'Cannot cancel a completed reservation'
      );
    }

    this.status = ReservationStatus.CANCELLED;
    this.cancelledAt = new Date();

    this.addDomainEvent(
      new ReservationCancelledEvent(this.id, reason)
    );
  }

  getReservationNumber(): string {
    return this.reservationNumber;
  }

  getTravelerId(): string {
    return this.travelerId;
  }

  getJourneyId(): string {
    return this.journeyId;
  }

  getStatus(): ReservationStatus {
    return this.status;
  }

  getTotalPrice(): Money {
    return this.totalPrice;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getConfirmedAt(): Date | null {
    return this.confirmedAt;
  }

  getCancelledAt(): Date | null {
    return this.cancelledAt;
  }

  isValid(): boolean {
    return (
      this.reservationNumber.length > 0 &&
      this.travelerId.length > 0 &&
      this.journeyId.length > 0 &&
      this.status !== null &&
      this.totalPrice !== null
    );
  }
}
