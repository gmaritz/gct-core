import { ITravellerRepository } from '@domain/repositories';
import { CreateTravellerCommand } from '../../commands/create-traveller.command';
import { TravellerDTO } from '../../dto/traveller.dto';
/**
 * CreateTravellerService
 *
 * Orchestrates the registration of a new traveller.
 * Identity validation remains within the Traveller aggregate.
 */
export declare class CreateTravellerService {
    private readonly travellerRepository;
    constructor(travellerRepository: ITravellerRepository);
    execute(command: CreateTravellerCommand): Promise<TravellerDTO>;
}
//# sourceMappingURL=create-traveller.service.d.ts.map