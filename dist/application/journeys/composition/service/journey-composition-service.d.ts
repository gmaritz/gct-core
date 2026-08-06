import { ApplicationService } from "../../../application-service";
import { JourneyPolicyPipeline } from "../../policies";
import { JourneyCompositionQuery, JourneyValidationPipeline } from "../../validation";
import { AccommodationCompositionAdapter } from "../accommodation";
import { ExperienceCompositionFramework } from "../experiences";
import { JourneyCompositionResult } from "../models";
import { JourneyFactory } from "../factory";
export declare class JourneyCompositionService implements ApplicationService<JourneyCompositionQuery, JourneyCompositionResult> {
    private readonly validationPipeline;
    private readonly policyPipeline;
    private readonly accommodationCompositionAdapter;
    private readonly experienceCompositionFramework;
    private readonly journeyFactory;
    constructor(validationPipeline: JourneyValidationPipeline, policyPipeline: JourneyPolicyPipeline, accommodationCompositionAdapter: AccommodationCompositionAdapter, experienceCompositionFramework: ExperienceCompositionFramework, journeyFactory: JourneyFactory);
    execute(query: JourneyCompositionQuery): Promise<JourneyCompositionResult>;
}
//# sourceMappingURL=journey-composition-service.d.ts.map