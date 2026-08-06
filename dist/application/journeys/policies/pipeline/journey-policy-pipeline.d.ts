import { JourneyPolicyResult } from "../models";
import { JourneyPolicyRegistry } from "../registry";
import { JourneyCompositionPolicyContext } from "../models";
export declare class JourneyPolicyPipeline {
    private readonly registry;
    constructor(registry?: JourneyPolicyRegistry);
    evaluate(context: JourneyCompositionPolicyContext): ReadonlyArray<JourneyPolicyResult>;
}
//# sourceMappingURL=journey-policy-pipeline.d.ts.map