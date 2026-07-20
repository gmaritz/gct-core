import { DomainException } from '../shared/domain-exception';
/**
 * Exception thrown when a traveller cannot be found
 */
export declare class TravellerNotFoundException extends DomainException {
    constructor(travelerId: string);
}
/**
 * Exception thrown when traveller data is invalid
 */
export declare class InvalidTravellerException extends DomainException {
    constructor(message: string);
}
//# sourceMappingURL=traveller.exception.d.ts.map