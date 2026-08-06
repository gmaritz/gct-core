import { Journey } from "../../aggregate";
import { JourneyCompositionQuery } from "../../validation";

export interface JourneyCompositionPolicyContext {
  readonly query: JourneyCompositionQuery;
  readonly aggregate?: Journey;
}