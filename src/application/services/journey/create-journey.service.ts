import { IJourneyRepository } from '@domain/repositories';
import { Journey } from '@domain/aggregates';
import { CreateJourneyCommand } from '../../commands/create-journey.command';
import { JourneyMapper } from '../../mappers/journey.mapper';
import { JourneyDTO } from '../../dto/journey.dto';

/**
 * CreateJourneyService
 *
 * Orchestrates the creation of a new journey.
 * Journey validation remains within the Journey aggregate.
 */
export class CreateJourneyService {
  constructor(private readonly journeyRepository: IJourneyRepository) {}

  async execute(command: CreateJourneyCommand): Promise<JourneyDTO> {
    const journey = Journey.create(
      command.travelerId,
      command.name,
      command.description,
      command.startDate,
      command.endDate
    );

    await this.journeyRepository.save(journey);

    // Domain events (JourneyCreatedEvent) are available here for publishing.
    journey.clearDomainEvents();

    return JourneyMapper.toDTO(journey);
  }
}
