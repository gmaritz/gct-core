import { JourneyPolicy } from "../contracts";
import { JourneyCompositionPolicyContext, JourneyPolicyResult } from "../models";

export interface JourneyExperiencePolicy
  extends JourneyPolicy<JourneyCompositionPolicyContext, JourneyPolicyResult> {}