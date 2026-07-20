"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
const value_object_1 = require("../shared/value-object");
/**
 * Money Value Object
 *
 * Represents a monetary amount with a specific currency.
 * Money is immutable and can be compared by value.
 */
class Money extends value_object_1.ValueObject {
    constructor(props) {
        super(props);
    }
    static create(amount, currency) {
        if (amount < 0) {
            throw new Error('Amount cannot be negative');
        }
        if (!currency || currency.length !== 3) {
            throw new Error('Currency must be a valid 3-letter code');
        }
        return new Money({ amount, currency });
    }
    get amount() {
        return this.props.amount;
    }
    get currency() {
        return this.props.currency;
    }
    add(other) {
        if (this.currency !== other.currency) {
            throw new Error('Cannot add money with different currencies');
        }
        return Money.create(this.amount + other.amount, this.currency);
    }
    subtract(other) {
        if (this.currency !== other.currency) {
            throw new Error('Cannot subtract money with different currencies');
        }
        const result = this.amount - other.amount;
        if (result < 0) {
            throw new Error('Result cannot be negative');
        }
        return Money.create(result, this.currency);
    }
    multiply(factor) {
        if (factor < 0) {
            throw new Error('Factor cannot be negative');
        }
        return Money.create(this.amount * factor, this.currency);
    }
    isZero() {
        return this.amount === 0;
    }
    isGreaterThan(other) {
        if (this.currency !== other.currency) {
            throw new Error('Cannot compare money with different currencies');
        }
        return this.amount > other.amount;
    }
    isLessThan(other) {
        if (this.currency !== other.currency) {
            throw new Error('Cannot compare money with different currencies');
        }
        return this.amount < other.amount;
    }
}
exports.Money = Money;
//# sourceMappingURL=money.vo.js.map