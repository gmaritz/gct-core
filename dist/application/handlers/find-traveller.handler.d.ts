import { FindTravellerQuery } from '../queries/find-traveller.query';
import { RetrieveTravellerService } from '../services/traveller/retrieve-traveller.service';
import { TravellerDTO } from '../dto/traveller.dto';
/**
 * FindTravellerHandler
 *
 * Handles the FindTravellerQuery by delegating to RetrieveTravellerService.
 */
export declare class FindTravellerHandler {
    private readonly service;
    constructor(service: RetrieveTravellerService);
    handle(query: FindTravellerQuery): Promise<TravellerDTO>;
}
//# sourceMappingURL=find-traveller.handler.d.ts.map