import { CTAViewModel } from "../shared/cta.viewmodel";
import { ImageViewModel } from "../shared/image.viewmodel";
import { PriceViewModel } from "../shared/price.viewmodel";

export type JourneyDetailPricingState = "AVAILABLE" | "UNAVAILABLE";

export interface JourneyDetailPricingViewModel {
  readonly state: JourneyDetailPricingState;
  readonly price?: PriceViewModel;
}

export interface JourneyDetailExperienceViewModel {
  readonly id: string;
  readonly name: string;
  readonly type?: string;
  readonly sequence?: number;
  readonly day?: number;
}

export interface JourneyDetailAccommodationViewModel {
  readonly id: string;
  readonly name: string;
  readonly destination: string;
  readonly category?: string;
  readonly rating?: number;
  readonly nights?: number;
}

export interface JourneyDetailViewModel {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly destination: string;
  readonly destinations: ReadonlyArray<string>;
  readonly duration: string;
  readonly summary?: string;
  readonly image: ImageViewModel;
  readonly itinerary: ReadonlyArray<{ readonly day: number; readonly title?: string; readonly experiences: ReadonlyArray<string> }>;
  readonly accommodation: ReadonlyArray<JourneyDetailAccommodationViewModel>;
  readonly experiences: ReadonlyArray<JourneyDetailExperienceViewModel>;
  readonly pricing: JourneyDetailPricingViewModel;
  readonly primaryCTA: CTAViewModel;
}