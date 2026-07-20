import { CreateJourneyCommand } from '../commands/create-journey.command';
import { CreateJourneyService } from '../services/journey/create-journey.service';
import { JourneyDTO } from '../dto/journey.dto';
/**
 * CreateJourneyHandler
 *
 * Handles the CreateJourneyCommand by delegating to CreateJourneyService.
 */
export declare class CreateJourneyHandler {
    private readonly service;
    constructor(service: CreateJourneyService);
    handle(command: CreateJourneyCommand): Promise<JourneyDTO>;
}
//# sourceMappingURL=create-journey.handler.d.ts.map