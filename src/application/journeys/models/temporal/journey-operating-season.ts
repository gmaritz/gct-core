import { JourneySeason } from "../classification/journey-season";

export interface JourneyOperatingSeason {
  readonly seasons: ReadonlyArray<JourneySeason>;
  readonly yearRound: boolean;
}