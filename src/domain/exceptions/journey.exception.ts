import { DomainException } from '../shared/domain-exception';

/**
 * Exception thrown when a journey cannot be found
 */
export class JourneyNotFoundException extends DomainException {
  constructor(journeyId: string) {
    super(`Journey with ID ${journeyId} not found`);
  }
}

/**
 * Exception thrown when journey data is invalid
 */
export class InvalidJourneyException extends DomainException {
  constructor(message: string) {
    super(`Invalid journey data: ${message}`);
  }
}
