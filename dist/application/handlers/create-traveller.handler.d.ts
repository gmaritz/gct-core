import { CreateTravellerCommand } from '../commands/create-traveller.command';
import { CreateTravellerService } from '../services/traveller/create-traveller.service';
import { TravellerDTO } from '../dto/traveller.dto';
/**
 * CreateTravellerHandler
 *
 * Handles the CreateTravellerCommand by delegating to CreateTravellerService.
 */
export declare class CreateTravellerHandler {
    private readonly service;
    constructor(service: CreateTravellerService);
    handle(command: CreateTravellerCommand): Promise<TravellerDTO>;
}
//# sourceMappingURL=create-traveller.handler.d.ts.map