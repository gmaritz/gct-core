export interface HomepageJourneyImageViewModel {
    readonly src: string;
    readonly alt: string;
    readonly width: number;
    readonly height: number;
}
export interface HomepageJourneyPriceViewModel {
    readonly amount: number;
    readonly currency: string;
    readonly display: string;
}
export interface HomepageJourneyCtaViewModel {
    readonly label: string;
    readonly href: string;
    readonly style: string;
}
export interface HomepageJourneyViewModel {
    readonly id: string;
    readonly title: string;
    readonly subtitle: string;
    readonly destination: string;
    readonly duration: string;
    readonly image: HomepageJourneyImageViewModel;
    readonly highlights: ReadonlyArray<string>;
    readonly accommodationSummary: string;
    readonly experienceSummary: string;
    readonly price?: HomepageJourneyPriceViewModel;
    readonly badges: ReadonlyArray<string>;
    readonly primaryCTA: HomepageJourneyCtaViewModel;
}
export declare function createHomepageJourneyViewModel(model: HomepageJourneyViewModel): HomepageJourneyViewModel;
//# sourceMappingURL=homepage-journey.viewmodel.d.ts.map