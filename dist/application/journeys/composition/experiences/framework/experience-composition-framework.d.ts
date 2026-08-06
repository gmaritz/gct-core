import { JourneyExperience } from "../../../models";
import { ExperienceCompositionContext, ExperiencePriority, ExperienceSequence, ExperienceSource, ExperienceType } from "../models";
export interface ExperienceCompositionCandidate {
    readonly experienceId: string;
    readonly name: string;
    readonly source: ExperienceSource;
    readonly type: ExperienceType;
    readonly priority: ExperiencePriority;
    readonly sequence: ExperienceSequence;
}
export interface ExperienceCandidateProvider {
    resolve(context: ExperienceCompositionContext): Promise<ReadonlyArray<ExperienceCompositionCandidate>> | ReadonlyArray<ExperienceCompositionCandidate>;
}
export declare class ExperienceCompositionFramework {
    private readonly candidateProvider;
    constructor(candidateProvider?: ExperienceCandidateProvider);
    compose(context: ExperienceCompositionContext): Promise<ReadonlyArray<JourneyExperience>>;
}
//# sourceMappingURL=experience-composition-framework.d.ts.map