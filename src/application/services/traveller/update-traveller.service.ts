import { ITravellerRepository } from '@domain/repositories';
import { TravellerNotFoundException } from '@domain/exceptions';
import { UpdateTravellerCommand } from '../../commands/update-traveller.command';
import { TravellerMapper } from '../../mappers/traveller.mapper';
import { TravellerDTO } from '../../dto/traveller.dto';

/**
 * UpdateTravellerService
 *
 * Orchestrates updates to an existing traveller's profile.
 * Profile validation remains within the Traveller aggregate.
 */
export class UpdateTravellerService {
  constructor(private readonly travellerRepository: ITravellerRepository) {}

  async execute(command: UpdateTravellerCommand): Promise<TravellerDTO> {
    const traveller = await this.travellerRepository.findById(command.travelerId);

    if (!traveller) {
      throw new TravellerNotFoundException(command.travelerId);
    }

    traveller.updateProfile(command.firstName, command.lastName);

    await this.travellerRepository.save(traveller);

    // Domain events (TravellerProfileUpdatedEvent) are available here for publishing.
    traveller.clearDomainEvents();

    return TravellerMapper.toDTO(traveller);
  }
}
