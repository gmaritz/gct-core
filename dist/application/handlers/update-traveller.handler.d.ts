import { UpdateTravellerCommand } from '../commands/update-traveller.command';
import { UpdateTravellerService } from '../services/traveller/update-traveller.service';
import { TravellerDTO } from '../dto/traveller.dto';
/**
 * UpdateTravellerHandler
 *
 * Handles the UpdateTravellerCommand by delegating to UpdateTravellerService.
 */
export declare class UpdateTravellerHandler {
    private readonly service;
    constructor(service: UpdateTravellerService);
    handle(command: UpdateTravellerCommand): Promise<TravellerDTO>;
}
//# sourceMappingURL=update-traveller.handler.d.ts.map