import { CompleteJourneyCommand } from '../commands/complete-journey.command';
import { CompleteJourneyService } from '../services/journey/complete-journey.service';
import { JourneyDTO } from '../dto/journey.dto';
/**
 * CompleteJourneyHandler
 *
 * Handles the CompleteJourneyCommand by delegating to CompleteJourneyService.
 */
export declare class CompleteJourneyHandler {
    private readonly service;
    constructor(service: CompleteJourneyService);
    handle(command: CompleteJourneyCommand): Promise<JourneyDTO>;
}
//# sourceMappingURL=complete-journey.handler.d.ts.map