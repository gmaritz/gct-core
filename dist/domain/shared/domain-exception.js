"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainException = void 0;
/**
 * Domain Exception Base Class
 *
 * All domain exceptions should extend this class.
 * Domain exceptions represent business rule violations.
 */
class DomainException extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.DomainException = DomainException;
//# sourceMappingURL=domain-exception.js.map