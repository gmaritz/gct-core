import { IJourneyRepository } from '@domain/repositories';
import { CreateJourneyCommand } from '../../commands/create-journey.command';
import { JourneyDTO } from '../../dto/journey.dto';
/**
 * CreateJourneyService
 *
 * Orchestrates the creation of a new journey.
 * Journey validation remains within the Journey aggregate.
 */
export declare class CreateJourneyService {
    private readonly journeyRepository;
    constructor(journeyRepository: IJourneyRepository);
    execute(command: CreateJourneyCommand): Promise<JourneyDTO>;
}
//# sourceMappingURL=create-journey.service.d.ts.map