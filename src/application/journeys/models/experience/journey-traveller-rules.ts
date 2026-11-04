export interface JourneyTravellerRules {
  readonly minimumTravellers?: number;
  readonly maximumTravellers?: number;
  readonly privateOnly?: boolean;
  readonly ageRestriction?: string;
  readonly childrenAllowed?: boolean;
}