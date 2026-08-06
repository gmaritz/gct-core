export interface JourneyPresentationImage {
    readonly src: string;
    readonly alt: string;
    readonly width: number;
    readonly height: number;
}
export interface JourneyPresentationPrice {
    readonly amount: number;
    readonly currency: string;
    readonly display: string;
}
export interface JourneyPresentationCallToAction {
    readonly label: string;
    readonly href: string;
}
export interface JourneyPresentationModel {
    readonly identity: string;
    readonly title: string;
    readonly subtitle: string;
    readonly destination: string;
    readonly duration: string;
    readonly heroImage: JourneyPresentationImage;
    readonly highlights: ReadonlyArray<string>;
    readonly accommodationSummary: string;
    readonly experienceSummary: string;
    readonly primaryPrice?: JourneyPresentationPrice;
    readonly badges: ReadonlyArray<string>;
    readonly callToAction: JourneyPresentationCallToAction;
}
export declare function createJourneyPresentationModel(model: JourneyPresentationModel): JourneyPresentationModel;
//# sourceMappingURL=journey-presentation-model.d.ts.map