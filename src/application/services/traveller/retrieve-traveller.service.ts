import { ITravellerRepository } from '@domain/repositories';
import { TravellerNotFoundException } from '@domain/exceptions';
import { FindTravellerQuery } from '../../queries/find-traveller.query';
import { TravellerMapper } from '../../mappers/traveller.mapper';
import { TravellerDTO } from '../../dto/traveller.dto';

/**
 * RetrieveTravellerService
 *
 * Retrieves a traveller by ID and returns a DTO.
 * No business rules — read-only orchestration.
 */
export class RetrieveTravellerService {
  constructor(private readonly travellerRepository: ITravellerRepository) {}

  async execute(query: FindTravellerQuery): Promise<TravellerDTO> {
    const traveller = await this.travellerRepository.findById(query.travelerId);

    if (!traveller) {
      throw new TravellerNotFoundException(query.travelerId);
    }

    return TravellerMapper.toDTO(traveller);
  }
}
