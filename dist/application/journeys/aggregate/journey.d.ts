import { JourneyAccommodation, JourneyDestination, JourneyDuration, JourneyExperience, JourneyIdentity, JourneyLifecycle, JourneyStatus, JourneyTag, JourneyTravellerRules } from "../models";
export interface JourneyClassification {
    readonly type: string;
    readonly category: string;
}
export interface JourneyMetadata {
    readonly created: Date;
    readonly modified: Date;
    readonly version: string;
    readonly source: string;
}
export interface JourneyComposition {
    readonly identity: JourneyIdentity;
    readonly classification: JourneyClassification;
    readonly metadata: JourneyMetadata;
    readonly status: JourneyStatus;
    readonly lifecycle: JourneyLifecycle;
    readonly duration: JourneyDuration;
    readonly destinations: ReadonlyArray<JourneyDestination>;
    readonly accommodation: ReadonlyArray<JourneyAccommodation>;
    readonly experiences: ReadonlyArray<JourneyExperience>;
    readonly travellerRules: JourneyTravellerRules;
    readonly tags: ReadonlyArray<JourneyTag>;
}
export declare class Journey {
    readonly identity: JourneyIdentity;
    readonly classification: JourneyClassification;
    readonly metadata: JourneyMetadata;
    readonly status: JourneyStatus;
    readonly lifecycle: JourneyLifecycle;
    readonly duration: JourneyDuration;
    readonly destinations: ReadonlyArray<JourneyDestination>;
    readonly accommodation: ReadonlyArray<JourneyAccommodation>;
    readonly experiences: ReadonlyArray<JourneyExperience>;
    readonly travellerRules: JourneyTravellerRules;
    readonly tags: ReadonlyArray<JourneyTag>;
    private constructor();
    static create(composition: JourneyComposition): Journey;
    static restore(composition: JourneyComposition): Journey;
}
//# sourceMappingURL=journey.d.ts.map