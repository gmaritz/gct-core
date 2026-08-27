export interface JourneyExperience {
    readonly experienceId: string;
    readonly name: string;
    readonly type?: string;
    readonly sequence?: {
        readonly day: number;
        readonly order: number;
        readonly itineraryLabel?: string;
    };
}
//# sourceMappingURL=journey-experience.d.ts.map