import { ValueObject } from '../shared/value-object';
/**
 * Money Value Object
 *
 * Represents a monetary amount with a specific currency.
 * Money is immutable and can be compared by value.
 */
export declare class Money extends ValueObject<{
    amount: number;
    currency: string;
}> {
    private constructor();
    static create(amount: number, currency: string): Money;
    get amount(): number;
    get currency(): string;
    add(other: Money): Money;
    subtract(other: Money): Money;
    multiply(factor: number): Money;
    isZero(): boolean;
    isGreaterThan(other: Money): boolean;
    isLessThan(other: Money): boolean;
}
//# sourceMappingURL=money.vo.d.ts.map