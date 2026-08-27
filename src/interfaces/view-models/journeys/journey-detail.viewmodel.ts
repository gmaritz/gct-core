import { CTAViewModel } from "../shared/cta.viewmodel";
import { ImageViewModel } from "../shared/image.viewmodel";
import { PriceViewModel } from "../shared/price.viewmodel";

export interface JourneyDetailExperienceViewModel {
  readonly id: string;
  readonly name: string;
  readonly sequence?: number;
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
  readonly duration: string;
  readonly summary?: string;
  readonly image: ImageViewModel;
  readonly itinerary: ReadonlyArray<{ readonly day: number; readonly label: string }>;
  readonly accommodation: ReadonlyArray<JourneyDetailAccommodationViewModel>;
  readonly experiences: ReadonlyArray<JourneyDetailExperienceViewModel>;
  readonly price?: PriceViewModel;
  readonly primaryCTA: CTAViewModel;
}