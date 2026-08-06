export interface JourneyIdentity {
    readonly id: string;
}
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
export declare enum JourneyStatus {
    DRAFT = "DRAFT",
    CURATED = "CURATED",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}
export declare enum JourneyLifecycle {
    DESIGN = "DESIGN",
    CURATED = "CURATED",
    MERCHANDISED = "MERCHANDISED",
    BOOKABLE = "BOOKABLE",
    RETIRED = "RETIRED"
}
export interface JourneyDuration {
    readonly days?: number;
    readonly nights?: number;
    readonly description?: string;
}
export interface JourneyDestination {
    readonly name: string;
}
export interface JourneyAccommodation {
    readonly accommodationId: string;
    readonly name: string;
}
export interface JourneyExperience {
    readonly experienceId: string;
    readonly name: string;
}
export interface JourneyTravellerRules {
    readonly minimumTravellers?: number;
    readonly maximumTravellers?: number;
    readonly privateOnly?: boolean;
    readonly ageRestriction?: string;
}
export interface JourneyTag {
    readonly value: string;
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