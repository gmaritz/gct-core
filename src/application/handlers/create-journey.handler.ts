import { CreateJourneyCommand } from '../commands/create-journey.command';
import { CreateJourneyService } from '../services/journey/create-journey.service';
import { JourneyDTO } from '../dto/journey.dto';

/**
 * CreateJourneyHandler
 *
 * Handles the CreateJourneyCommand by delegating to CreateJourneyService.
 */
export class CreateJourneyHandler {
  constructor(private readonly service: CreateJourneyService) {}

  async handle(command: CreateJourneyCommand): Promise<JourneyDTO> {
    return this.service.execute(command);
  }
}
