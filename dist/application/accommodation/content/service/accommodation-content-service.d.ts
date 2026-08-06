import { AccommodationContentResult } from "../../results";
import { ProviderRegistry } from "../../registry";
import { AccommodationContentQuery } from "../models";
import { AccommodationContentValidator } from "../validation";
export declare class AccommodationContentService {
    private readonly providerRegistry;
    private readonly validator;
    constructor(providerRegistry: ProviderRegistry, validator?: AccommodationContentValidator);
    execute(query: AccommodationContentQuery): Promise<AccommodationContentResult>;
    getContent(query: AccommodationContentQuery): Promise<AccommodationContentResult>;
    content(query: AccommodationContentQuery): Promise<AccommodationContentResult>;
}
//# sourceMappingURL=accommodation-content-service.d.ts.map