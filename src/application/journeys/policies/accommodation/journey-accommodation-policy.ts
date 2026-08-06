import { JourneyPolicy } from "../contracts";
import { JourneyCompositionPolicyContext, JourneyPolicyResult } from "../models";

export interface JourneyAccommodationPolicy
  extends JourneyPolicy<JourneyCompositionPolicyContext, JourneyPolicyResult> {}