import { HomepageMerchandisingResult } from "./homepage-merchandising-result";
import { HomepageMerchandisingPolicies } from "../policies";
export interface HomepageMerchandisingService {
    getHomepageMerchandising(): Promise<HomepageMerchandisingResult>;
}
export declare class DefaultHomepageMerchandisingService implements HomepageMerchandisingService {
    readonly policies: HomepageMerchandisingPolicies;
    constructor(policies?: HomepageMerchandisingPolicies);
    getHomepageMerchandising(): Promise<HomepageMerchandisingResult>;
}
//# sourceMappingURL=homepage-merchandising.service.d.ts.map