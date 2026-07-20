import { FindJourneyQuery } from '../queries/find-journey.query';
import { RetrieveJourneyService } from '../services/journey/retrieve-journey.service';
import { JourneyDTO } from '../dto/journey.dto';

/**
 * FindJourneyHandler
 *
 * Handles the FindJourneyQuery by delegating to RetrieveJourneyService.
 */
export class FindJourneyHandler {
  constructor(private readonly service: RetrieveJourneyService) {}

  async handle(query: FindJourneyQuery): Promise<JourneyDTO> {
    return this.service.execute(query);
  }
}
