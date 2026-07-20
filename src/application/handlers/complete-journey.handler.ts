import { CompleteJourneyCommand } from '../commands/complete-journey.command';
import { CompleteJourneyService } from '../services/journey/complete-journey.service';
import { JourneyDTO } from '../dto/journey.dto';

/**
 * CompleteJourneyHandler
 *
 * Handles the CompleteJourneyCommand by delegating to CompleteJourneyService.
 */
export class CompleteJourneyHandler {
  constructor(private readonly service: CompleteJourneyService) {}

  async handle(command: CompleteJourneyCommand): Promise<JourneyDTO> {
    return this.service.execute(command);
  }
}
