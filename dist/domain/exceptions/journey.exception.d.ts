import { DomainException } from '../shared/domain-exception';
/**
 * Exception thrown when a journey cannot be found
 */
export declare class JourneyNotFoundException extends DomainException {
    constructor(journeyId: string);
}
/**
 * Exception thrown when journey data is invalid
 */
export declare class InvalidJourneyException extends DomainException {
    constructor(message: string);
}
//# sourceMappingURL=journey.exception.d.ts.map