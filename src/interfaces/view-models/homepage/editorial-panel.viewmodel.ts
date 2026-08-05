import { CTAViewModel } from "../shared/cta.viewmodel";

export interface EditorialPanelViewModel {
  eyebrow: string;
  heading: string;
  narrative: string;
  primaryCTA: CTAViewModel;
  secondaryCTA: CTAViewModel;
}
