import { ValueObject } from '../shared/value-object';
/**
 * Email Address Value Object
 *
 * Represents a validated email address.
 * Email addresses are immutable and compared by value.
 */
export declare class EmailAddress extends ValueObject {
    private constructor();
    static create(email: string): EmailAddress;
    get value(): string;
    static isValid(email: string): boolean;
}
//# sourceMappingURL=email-address.vo.d.ts.map