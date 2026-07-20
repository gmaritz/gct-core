import { ITravellerRepository } from '@domain/repositories';
import { UpdateTravellerCommand } from '../../commands/update-traveller.command';
import { TravellerDTO } from '../../dto/traveller.dto';
/**
 * UpdateTravellerService
 *
 * Orchestrates updates to an existing traveller's profile.
 * Profile validation remains within the Traveller aggregate.
 */
export declare class UpdateTravellerService {
    private readonly travellerRepository;
    constructor(travellerRepository: ITravellerRepository);
    execute(command: UpdateTravellerCommand): Promise<TravellerDTO>;
}
//# sourceMappingURL=update-traveller.service.d.ts.map