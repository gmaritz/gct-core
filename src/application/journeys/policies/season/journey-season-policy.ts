import { JourneyPolicy } from "../contracts";
import { JourneyCompositionPolicyContext, JourneyPolicyResult } from "../models";

export interface JourneySeasonPolicy
  extends JourneyPolicy<JourneyCompositionPolicyContext, JourneyPolicyResult> {}