export type JourneyCardVariant = "primary" | "secondary";
export type JourneyCardHeadingTag = "h2" | "h3";
export interface JourneyCardViewModel {
    variant: JourneyCardVariant;
    ariaLabel: string;
    imageLabel: string;
    headingTag: JourneyCardHeadingTag;
    name: string;
    destination: string;
    duration: string;
    highlights: string;
    price: string;
    buttonClass: "button--primary" | "button--secondary";
    ctaLabel: string;
    ctaHref: string;
    saving: string;
}
export interface HomepageShowcaseViewModel {
    curatedJourneys: JourneyCardViewModel[];
}
export declare function getHomepageShowcaseViewModel(): HomepageShowcaseViewModel;
//# sourceMappingURL=homepage-showcase.view-model.d.ts.map