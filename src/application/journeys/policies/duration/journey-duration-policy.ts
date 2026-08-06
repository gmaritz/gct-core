import { JourneyPolicy } from "../contracts";
import { JourneyCompositionPolicyContext, JourneyPolicyResult } from "../models";

export interface JourneyDurationPolicy
  extends JourneyPolicy<JourneyCompositionPolicyContext, JourneyPolicyResult> {}