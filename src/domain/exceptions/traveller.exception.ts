import { DomainException } from '../shared/domain-exception';

/**
 * Exception thrown when a traveller cannot be found
 */
export class TravellerNotFoundException extends DomainException {
  constructor(travelerId: string) {
    super(`Traveller with ID ${travelerId} not found`);
  }
}

/**
 * Exception thrown when traveller data is invalid
 */
export class InvalidTravellerException extends DomainException {
  constructor(message: string) {
    super(`Invalid traveller data: ${message}`);
  }
}
