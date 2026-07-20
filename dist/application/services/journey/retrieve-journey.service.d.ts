import { IJourneyRepository } from '@domain/repositories';
import { FindJourneyQuery } from '../../queries/find-journey.query';
import { JourneyDTO } from '../../dto/journey.dto';
/**
 * RetrieveJourneyService
 *
 * Retrieves a journey by ID and returns a DTO.
 * No business rules — read-only orchestration.
 */
export declare class RetrieveJourneyService {
    private readonly journeyRepository;
    constructor(journeyRepository: IJourneyRepository);
    execute(query: FindJourneyQuery): Promise<JourneyDTO>;
}
//# sourceMappingURL=retrieve-journey.service.d.ts.map