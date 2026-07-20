import { v4 as uuidv4 } from 'uuid';
import { AggregateRoot } from '../shared/aggregate-root';
import { DateRange } from '../value-objects/date-range.vo';
import { JourneyCreatedEvent, JourneyFinalizedEvent } from '../events/journey.event';
import { InvalidJourneyException } from '../exceptions/journey.exception';

/**
 * Journey Status enumeration
 */
export enum JourneyStatus {
  PLANNING = 'PLANNING',
  SCHEDULED = 'SCHEDULED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Journey Aggregate Root
 * 
 * Represents the complete travel experience.
 * Encapsulates itinerary, bookings, and experiences.
 */
export class Journey extends AggregateRoot {
  private journeyCode: string;
  private travelerId: string;
  private name: string;
  private description: string;
  private status: JourneyStatus;
  private dateRange: DateRange;
  private createdAt: Date;
  private updatedAt: Date;
  private finalizedAt: Date | null;

  private constructor(
    id: string,
    journeyCode: string,
    travelerId: string,
    name: string,
    description: string,
    status: JourneyStatus,
    dateRange: DateRange,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    finalizedAt: Date | null = null
  ) {
    super(id);
    this.journeyCode = journeyCode;
    this.travelerId = travelerId;
    this.name = name;
    this.description = description;
    this.status = status;
    this.dateRange = dateRange;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.finalizedAt = finalizedAt;
  }

  static create(
    travelerId: string,
    name: string,
    description: string,
    startDate: Date,
    endDate: Date
  ): Journey {
    if (!travelerId) {
      throw new InvalidJourneyException('Traveller ID is required');
    }
    if (!name || name.trim().length === 0) {
      throw new InvalidJourneyException('Journey name is required');
    }

    const id = uuidv4();
    const journeyCode = this.generateJourneyCode();
    const dateRange = DateRange.create(startDate, endDate);

    const journey = new Journey(
      id,
      journeyCode,
      travelerId,
      name.trim(),
      description.trim(),
      JourneyStatus.PLANNING,
      dateRange
    );

    journey.addDomainEvent(
      new JourneyCreatedEvent(id, name, travelerId)
    );

    return journey;
  }

  static restore(
    id: string,
    journeyCode: string,
    travelerId: string,
    name: string,
    description: string,
    status: JourneyStatus,
    dateRange: DateRange,
    createdAt: Date,
    updatedAt: Date,
    finalizedAt: Date | null
  ): Journey {
    return new Journey(
      id,
      journeyCode,
      travelerId,
      name,
      description,
      status,
      dateRange,
      createdAt,
      updatedAt,
      finalizedAt
    );
  }

  finalize(): void {
    if (this.status === JourneyStatus.CANCELLED) {
      throw new InvalidJourneyException('Cannot finalize a cancelled journey');
    }

    this.status = JourneyStatus.SCHEDULED;
    this.finalizedAt = new Date();

    this.addDomainEvent(new JourneyFinalizedEvent(this.id));
  }

  updateStatus(newStatus: JourneyStatus): void {
    // Only allow certain transitions
    const allowedTransitions: Record<JourneyStatus, JourneyStatus[]> = {
      [JourneyStatus.PLANNING]: [JourneyStatus.SCHEDULED, JourneyStatus.CANCELLED],
      [JourneyStatus.SCHEDULED]: [JourneyStatus.ONGOING, JourneyStatus.CANCELLED],
      [JourneyStatus.ONGOING]: [JourneyStatus.COMPLETED, JourneyStatus.CANCELLED],
      [JourneyStatus.COMPLETED]: [],
      [JourneyStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[this.status].includes(newStatus)) {
      throw new InvalidJourneyException(
        `Cannot transition from ${this.status} to ${newStatus}`
      );
    }

    this.status = newStatus;
    this.updatedAt = new Date();
  }

  getJourneyCode(): string {
    return this.journeyCode;
  }

  getTravelerId(): string {
    return this.travelerId;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string {
    return this.description;
  }

  getStatus(): JourneyStatus {
    return this.status;
  }

  getDateRange(): DateRange {
    return this.dateRange;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getFinalizedAt(): Date | null {
    return this.finalizedAt;
  }

  isValid(): boolean {
    return (
      this.journeyCode.length > 0 &&
      this.travelerId.length > 0 &&
      this.name.length > 0 &&
      this.status !== null &&
      this.dateRange !== null
    );
  }

  private static generateJourneyCode(): string {
    const prefix = 'JRN';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}
