import { FindJourneyQuery } from '../queries/find-journey.query';
import { RetrieveJourneyService } from '../services/journey/retrieve-journey.service';
import { JourneyDTO } from '../dto/journey.dto';
/**
 * FindJourneyHandler
 *
 * Handles the FindJourneyQuery by delegating to RetrieveJourneyService.
 */
export declare class FindJourneyHandler {
    private readonly service;
    constructor(service: RetrieveJourneyService);
    handle(query: FindJourneyQuery): Promise<JourneyDTO>;
}
//# sourceMappingURL=find-journey.handler.d.ts.map