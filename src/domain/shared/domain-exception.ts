/**
 * Domain Exception Base Class
 * 
 * All domain exceptions should extend this class.
 * Domain exceptions represent business rule violations.
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
