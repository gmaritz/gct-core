import { IJourneyRepository } from '@domain/repositories';
import { CompleteJourneyCommand } from '../../commands/complete-journey.command';
import { JourneyDTO } from '../../dto/journey.dto';
/**
 * CompleteJourneyService
 *
 * Orchestrates marking an ongoing journey as completed.
 * State transition rules remain within the Journey aggregate.
 */
export declare class CompleteJourneyService {
    private readonly journeyRepository;
    constructor(journeyRepository: IJourneyRepository);
    execute(command: CompleteJourneyCommand): Promise<JourneyDTO>;
}
//# sourceMappingURL=complete-journey.service.d.ts.map