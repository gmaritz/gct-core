import { CTAViewModel } from "../shared/cta.viewmodel";
import { ImageViewModel } from "../shared/image.viewmodel";
import { PriceViewModel } from "../shared/price.viewmodel";
import { SavingViewModel } from "../shared/saving.viewmodel";

export interface JourneyCardViewModel {
  variant?: "primary" | "secondary";
  ariaLabel?: string;
  id: string;
  title: string;
  destination: string;
  duration: string;
  image: ImageViewModel;
  highlights: string[];
  price: PriceViewModel;
  saving: SavingViewModel;
  primaryCTA: CTAViewModel;
}
