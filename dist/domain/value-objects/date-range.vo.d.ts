import { ValueObject } from '../shared/value-object';
/**
 * Date Range Value Object
 *
 * Represents a period with start and end dates.
 * Date ranges are immutable and compared by value.
 */
export declare class DateRange extends ValueObject {
    private constructor();
    static create(startDate: Date, endDate: Date): DateRange;
    get startDate(): Date;
    get endDate(): Date;
    get durationInDays(): number;
    includes(date: Date): boolean;
    overlaps(other: DateRange): boolean;
    contains(other: DateRange): boolean;
}
//# sourceMappingURL=date-range.vo.d.ts.map