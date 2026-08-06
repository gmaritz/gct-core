import { JourneyDuration, JourneyOperatingSeason, JourneyType } from "@application/journeys/models";
export interface ExperienceTravellerProfile {
    readonly adults: number;
    readonly children: number;
    readonly privateOnly?: boolean;
    readonly audience?: string;
}
export interface ExperienceCompositionContext {
    readonly destination: string;
    readonly journeyType: JourneyType;
    readonly travellerProfile: ExperienceTravellerProfile;
    readonly interests: ReadonlyArray<string>;
    readonly duration: JourneyDuration;
    readonly operatingSeason?: JourneyOperatingSeason;
    readonly requestedAt: Date;
}
export declare function createExperienceCompositionContext(context: ExperienceCompositionContext): ExperienceCompositionContext;
//# sourceMappingURL=experience-composition-context.d.ts.map