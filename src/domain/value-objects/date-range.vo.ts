import { ValueObject } from '../shared/value-object';

/**
 * Date Range Value Object
 * 
 * Represents a period with start and end dates.
 * Date ranges are immutable and compared by value.
 */
export class DateRange extends ValueObject {
  private constructor(props: { startDate: Date; endDate: Date }) {
    super(props);
  }

  static create(startDate: Date, endDate: Date): DateRange {
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }
    return new DateRange({ startDate, endDate });
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  get durationInDays(): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / millisecondsPerDay);
  }

  includes(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  overlaps(other: DateRange): boolean {
    return this.startDate <= other.endDate && this.endDate >= other.startDate;
  }

  contains(other: DateRange): boolean {
    return this.startDate <= other.startDate && this.endDate >= other.endDate;
  }
}
