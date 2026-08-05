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

export function getHomepageShowcaseViewModel(): HomepageShowcaseViewModel {
  return {
    curatedJourneys: [
      {
        variant: "primary",
        ariaLabel: "Primary journey",
        imageLabel: "Luxury Winelands landscape",
        headingTag: "h2",
        name: "Luxury Winelands Escape",
        destination: "Cape Winelands",
        duration: "4 Days / 3 Nights",
        highlights: "Private cellar experiences, boutique lodges, curated culinary route.",
        price: "From R18 950 per couple",
        buttonClass: "button--primary",
        ctaLabel: "View Journey",
        ctaHref: "#journey-planning",
        saving: "Save 22%",
      },
      {
        variant: "secondary",
        ariaLabel: "Secondary journey one",
        imageLabel: "Coastal journey landscape",
        headingTag: "h3",
        name: "Ocean & Vineyard Retreat",
        destination: "Atlantic Seaboard",
        duration: "3 Days / 2 Nights",
        highlights: "Coastal estates, sunset tastings, private guide.",
        price: "From R12 400 per couple",
        buttonClass: "button--secondary",
        ctaLabel: "View Journey",
        ctaHref: "#journey-planning",
        saving: "Save 18%",
      },
      {
        variant: "secondary",
        ariaLabel: "Secondary journey two",
        imageLabel: "Mountain and valley journey landscape",
        headingTag: "h3",
        name: "Mountain Valley Signature",
        destination: "Franschhoek Valley",
        duration: "5 Days / 4 Nights",
        highlights: "Scenic rail moments, chef tables, private transfers.",
        price: "From R21 300 per couple",
        buttonClass: "button--secondary",
        ctaLabel: "View Journey",
        ctaHref: "#journey-planning",
        saving: "Save 15%",
      },
    ],
  };
}
