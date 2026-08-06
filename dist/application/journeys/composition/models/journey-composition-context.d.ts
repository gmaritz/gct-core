import { Journey } from "../../aggregate";
import { JourneyCompositionQuery } from "../../validation";
import { JourneyCompositionPolicyContext } from "../../policies";
import { AccommodationCompositionContext } from "../accommodation";
import { ExperienceCompositionContext } from "../experiences";
export interface JourneyCompositionContext {
    readonly query: JourneyCompositionQuery;
    readonly policyContext: JourneyCompositionPolicyContext;
    readonly accommodationContext: AccommodationCompositionContext;
    readonly experienceContext: ExperienceCompositionContext;
    readonly createdAt: Date;
}
export declare function createJourneyCompositionContext(query: JourneyCompositionQuery, aggregate?: Journey): JourneyCompositionContext;
//# sourceMappingURL=journey-composition-context.d.ts.map