import { JourneyPolicy } from "../contracts";
import { JourneyCompositionPolicyContext, JourneyPolicyResult } from "../models";

export interface JourneyEligibilityPolicy
  extends JourneyPolicy<JourneyCompositionPolicyContext, JourneyPolicyResult> {}