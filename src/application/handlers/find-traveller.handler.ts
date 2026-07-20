import { FindTravellerQuery } from '../queries/find-traveller.query';
import { RetrieveTravellerService } from '../services/traveller/retrieve-traveller.service';
import { TravellerDTO } from '../dto/traveller.dto';

/**
 * FindTravellerHandler
 *
 * Handles the FindTravellerQuery by delegating to RetrieveTravellerService.
 */
export class FindTravellerHandler {
  constructor(private readonly service: RetrieveTravellerService) {}

  async handle(query: FindTravellerQuery): Promise<TravellerDTO> {
    return this.service.execute(query);
  }
}
