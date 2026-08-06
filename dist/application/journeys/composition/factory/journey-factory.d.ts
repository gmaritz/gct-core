import { Journey, JourneyComposition, JourneyExperience } from "@application/journeys";
import { JourneyCompositionContext } from "../models";
export interface JourneyFactoryInput {
    readonly context: JourneyCompositionContext;
    readonly accommodation: ReadonlyArray<JourneyComposition["accommodation"][number]>;
    readonly experiences: ReadonlyArray<JourneyExperience>;
}
export declare class JourneyFactory {
    create(input: JourneyFactoryInput): Journey;
}
//# sourceMappingURL=journey-factory.d.ts.map