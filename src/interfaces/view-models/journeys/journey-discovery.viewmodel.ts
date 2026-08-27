import { CTAViewModel } from "../shared/cta.viewmodel";
import { ImageViewModel } from "../shared/image.viewmodel";
import { PriceViewModel } from "../shared/price.viewmodel";

export interface JourneyDiscoveryViewModel {
  readonly id: string;
  readonly title: string;
  readonly destination: string;
  readonly duration: string;
  readonly highlights: ReadonlyArray<string>;
  readonly image: ImageViewModel;
  readonly price?: PriceViewModel;
  readonly continuation: CTAViewModel;
}
