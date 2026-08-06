import {
  JourneyAccommodation,
  JourneyDestination,
  JourneyDuration,
  JourneyExperience,
  JourneyIdentity,
  JourneyLifecycle,
  JourneyStatus,
  JourneyTag,
  JourneyTravellerRules,
} from "../models";

export interface JourneyClassification {
  readonly type: string;
  readonly category: string;
}

export interface JourneyMetadata {
  readonly created: Date;
  readonly modified: Date;
  readonly version: string;
  readonly source: string;
}

export interface JourneyComposition {
  readonly identity: JourneyIdentity;
  readonly classification: JourneyClassification;
  readonly metadata: JourneyMetadata;
  readonly status: JourneyStatus;
  readonly lifecycle: JourneyLifecycle;
  readonly duration: JourneyDuration;
  readonly destinations: ReadonlyArray<JourneyDestination>;
  readonly accommodation: ReadonlyArray<JourneyAccommodation>;
  readonly experiences: ReadonlyArray<JourneyExperience>;
  readonly travellerRules: JourneyTravellerRules;
  readonly tags: ReadonlyArray<JourneyTag>;
}

function freezeDate(date: Date): Date {
  return new Date(date.getTime());
}

function freezeIdentity(identity: JourneyIdentity): JourneyIdentity {
  return Object.freeze({ ...identity });
}

function freezeClassification(classification: JourneyClassification): JourneyClassification {
  return Object.freeze({ ...classification });
}

function freezeMetadata(metadata: JourneyMetadata): JourneyMetadata {
  return Object.freeze({
    created: freezeDate(metadata.created),
    modified: freezeDate(metadata.modified),
    version: metadata.version,
    source: metadata.source,
  });
}

function freezeDuration(duration: JourneyDuration): JourneyDuration {
  return Object.freeze({ ...duration });
}

function freezeDestinations(destinations: ReadonlyArray<JourneyDestination>): ReadonlyArray<JourneyDestination> {
  return Object.freeze(destinations.map((destination) => Object.freeze({ ...destination })));
}

function freezeAccommodation(accommodation: ReadonlyArray<JourneyAccommodation>): ReadonlyArray<JourneyAccommodation> {
  return Object.freeze(accommodation.map((stay) => Object.freeze({ ...stay })));
}

function freezeExperiences(experiences: ReadonlyArray<JourneyExperience>): ReadonlyArray<JourneyExperience> {
  return Object.freeze(experiences.map((experience) => Object.freeze({ ...experience })));
}

function freezeTravellerRules(rules: JourneyTravellerRules): JourneyTravellerRules {
  return Object.freeze({ ...rules });
}

function freezeTags(tags: ReadonlyArray<JourneyTag>): ReadonlyArray<JourneyTag> {
  return Object.freeze(tags.map((tag) => Object.freeze({ ...tag })));
}

export class Journey {
  public readonly identity: JourneyIdentity;
  public readonly classification: JourneyClassification;
  public readonly metadata: JourneyMetadata;
  public readonly status: JourneyStatus;
  public readonly lifecycle: JourneyLifecycle;
  public readonly duration: JourneyDuration;
  public readonly destinations: ReadonlyArray<JourneyDestination>;
  public readonly accommodation: ReadonlyArray<JourneyAccommodation>;
  public readonly experiences: ReadonlyArray<JourneyExperience>;
  public readonly travellerRules: JourneyTravellerRules;
  public readonly tags: ReadonlyArray<JourneyTag>;

  private constructor(composition: JourneyComposition) {
    this.identity = freezeIdentity(composition.identity);
    this.classification = freezeClassification(composition.classification);
    this.metadata = freezeMetadata(composition.metadata);
    this.status = composition.status;
    this.lifecycle = composition.lifecycle;
    this.duration = freezeDuration(composition.duration);
    this.destinations = freezeDestinations(composition.destinations);
    this.accommodation = freezeAccommodation(composition.accommodation);
    this.experiences = freezeExperiences(composition.experiences);
    this.travellerRules = freezeTravellerRules(composition.travellerRules);
    this.tags = freezeTags(composition.tags);

    Object.freeze(this);
  }

  public static create(composition: JourneyComposition): Journey {
    return new Journey(composition);
  }

  public static restore(composition: JourneyComposition): Journey {
    return new Journey(composition);
  }
}