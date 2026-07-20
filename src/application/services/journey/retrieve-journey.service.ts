import { IJourneyRepository } from '@domain/repositories';
import { JourneyNotFoundException } from '@domain/exceptions';
import { FindJourneyQuery } from '../../queries/find-journey.query';
import { JourneyMapper } from '../../mappers/journey.mapper';
import { JourneyDTO } from '../../dto/journey.dto';

/**
 * RetrieveJourneyService
 *
 * Retrieves a journey by ID and returns a DTO.
 * No business rules — read-only orchestration.
 */
export class RetrieveJourneyService {
  constructor(private readonly journeyRepository: IJourneyRepository) {}

  async execute(query: FindJourneyQuery): Promise<JourneyDTO> {
    const journey = await this.journeyRepository.findById(query.journeyId);

    if (!journey) {
      throw new JourneyNotFoundException(query.journeyId);
    }

    return JourneyMapper.toDTO(journey);
  }
}
