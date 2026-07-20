import { IJourneyRepository } from '@domain/repositories';
import { JourneyStatus } from '@domain/aggregates';
import { JourneyNotFoundException } from '@domain/exceptions';
import { CompleteJourneyCommand } from '../../commands/complete-journey.command';
import { JourneyMapper } from '../../mappers/journey.mapper';
import { JourneyDTO } from '../../dto/journey.dto';

/**
 * CompleteJourneyService
 *
 * Orchestrates marking an ongoing journey as completed.
 * State transition rules remain within the Journey aggregate.
 */
export class CompleteJourneyService {
  constructor(private readonly journeyRepository: IJourneyRepository) {}

  async execute(command: CompleteJourneyCommand): Promise<JourneyDTO> {
    const journey = await this.journeyRepository.findById(command.journeyId);

    if (!journey) {
      throw new JourneyNotFoundException(command.journeyId);
    }

    journey.updateStatus(JourneyStatus.COMPLETED);

    await this.journeyRepository.save(journey);

    journey.clearDomainEvents();

    return JourneyMapper.toDTO(journey);
  }
}
