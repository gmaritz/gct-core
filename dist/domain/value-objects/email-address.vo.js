"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAddress = void 0;
const value_object_1 = require("../shared/value-object");
/**
 * Email Address Value Object
 *
 * Represents a validated email address.
 * Email addresses are immutable and compared by value.
 */
class EmailAddress extends value_object_1.ValueObject {
    constructor(props) {
        super(props);
    }
    static create(email) {
        const trimmed = email.trim().toLowerCase();
        // Simple email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) {
            throw new Error('Invalid email address format');
        }
        return new EmailAddress({ value: trimmed });
    }
    get value() {
        return this.props.value;
    }
    static isValid(email) {
        try {
            EmailAddress.create(email);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.EmailAddress = EmailAddress;
//# sourceMappingURL=email-address.vo.js.map