import { AggregateRoot } from '../shared/aggregate-root';
import { DateRange } from '../value-objects/date-range.vo';
/**
 * Journey Status enumeration
 */
export declare enum JourneyStatus {
    PLANNING = "PLANNING",
    SCHEDULED = "SCHEDULED",
    ONGOING = "ONGOING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
/**
 * Journey Aggregate Root
 *
 * Represents the complete travel experience.
 * Encapsulates itinerary, bookings, and experiences.
 */
export declare class Journey extends AggregateRoot {
    private journeyCode;
    private travelerId;
    private name;
    private description;
    private status;
    private dateRange;
    private createdAt;
    private updatedAt;
    private finalizedAt;
    private constructor();
    static create(travelerId: string, name: string, description: string, startDate: Date, endDate: Date): Journey;
    static restore(id: string, journeyCode: string, travelerId: string, name: string, description: string, status: JourneyStatus, dateRange: DateRange, createdAt: Date, updatedAt: Date, finalizedAt: Date | null): Journey;
    finalize(): void;
    updateStatus(newStatus: JourneyStatus): void;
    getJourneyCode(): string;
    getTravelerId(): string;
    getName(): string;
    getDescription(): string;
    getStatus(): JourneyStatus;
    getDateRange(): DateRange;
    getCreatedAt(): Date;
    getUpdatedAt(): Date;
    getFinalizedAt(): Date | null;
    isValid(): boolean;
    private static generateJourneyCode;
}
//# sourceMappingURL=journey.aggregate.d.ts.map