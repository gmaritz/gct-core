"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateRange = void 0;
const value_object_1 = require("../shared/value-object");
/**
 * Date Range Value Object
 *
 * Represents a period with start and end dates.
 * Date ranges are immutable and compared by value.
 */
class DateRange extends value_object_1.ValueObject {
    constructor(props) {
        super(props);
    }
    static create(startDate, endDate) {
        if (startDate >= endDate) {
            throw new Error('Start date must be before end date');
        }
        return new DateRange({ startDate, endDate });
    }
    get startDate() {
        return this.props.startDate;
    }
    get endDate() {
        return this.props.endDate;
    }
    get durationInDays() {
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / millisecondsPerDay);
    }
    includes(date) {
        return date >= this.startDate && date <= this.endDate;
    }
    overlaps(other) {
        return this.startDate <= other.endDate && this.endDate >= other.startDate;
    }
    contains(other) {
        return this.startDate <= other.startDate && this.endDate >= other.endDate;
    }
}
exports.DateRange = DateRange;
//# sourceMappingURL=date-range.vo.js.map