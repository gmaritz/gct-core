import { ApplicationService } from "../../../application-service";
import { ProviderRegistry } from "../../registry";
import { AccommodationAvailabilityResult } from "../../results";
import { AccommodationInventoryQuery } from "../models";
import { AccommodationInventoryValidator } from "../validation";
export declare class AccommodationInventoryService implements ApplicationService<AccommodationInventoryQuery, AccommodationAvailabilityResult> {
    private readonly providerRegistry;
    private readonly validator;
    constructor(providerRegistry: ProviderRegistry, validator?: AccommodationInventoryValidator);
    execute(query: AccommodationInventoryQuery): Promise<AccommodationAvailabilityResult>;
}
//# sourceMappingURL=accommodation-inventory-service.d.ts.map