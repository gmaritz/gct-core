import { UpdateTravellerCommand } from '../commands/update-traveller.command';
import { UpdateTravellerService } from '../services/traveller/update-traveller.service';
import { TravellerDTO } from '../dto/traveller.dto';

/**
 * UpdateTravellerHandler
 *
 * Handles the UpdateTravellerCommand by delegating to UpdateTravellerService.
 */
export class UpdateTravellerHandler {
  constructor(private readonly service: UpdateTravellerService) {}

  async handle(command: UpdateTravellerCommand): Promise<TravellerDTO> {
    return this.service.execute(command);
  }
}
