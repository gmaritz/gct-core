import { ITravellerRepository } from '@domain/repositories';
import { FindTravellerQuery } from '../../queries/find-traveller.query';
import { TravellerDTO } from '../../dto/traveller.dto';
/**
 * RetrieveTravellerService
 *
 * Retrieves a traveller by ID and returns a DTO.
 * No business rules — read-only orchestration.
 */
export declare class RetrieveTravellerService {
    private readonly travellerRepository;
    constructor(travellerRepository: ITravellerRepository);
    execute(query: FindTravellerQuery): Promise<TravellerDTO>;
}
//# sourceMappingURL=retrieve-traveller.service.d.ts.map