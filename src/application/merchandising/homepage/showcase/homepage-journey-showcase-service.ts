import {
  AccommodationCompositionAdapter,
  ExperienceCandidateProvider,
  ExperienceCompositionFramework,
  ExperiencePriority,
  ExperienceSource,
  ExperienceType,
  JourneyCompositionQuery,
  JourneyCompositionResult,
  JourneyCompositionService,
  JourneyCompositionSource,
  JourneyCompositionStrategy,
  JourneyFactory,
  JourneyPresentationMapper,
  JourneyType,
  JourneyValidationPipeline,
  JourneyViewModelProvider,
} from "../../../journeys";
import { JourneyPolicyPipeline } from "../../../journeys/policies";
import {
  Accommodation,
  AccommodationAvailabilityResult,
  AccommodationContentResult,
  AccommodationCurrency,
  AccommodationRateResult,
  AccommodationRateSelectionStrategy,
  AccommodationRateStatus,
  AccommodationRateType,
  AccommodationSearchResult,
} from "../../../accommodation";

import {
  createHomepageJourneyShowcaseResult,
  HomepageJourneyShowcaseResult,
} from "./homepage-journey-showcase-result";

interface JourneyCompositionExecutor {
  execute(query: JourneyCompositionQuery): Promise<JourneyCompositionResult>;
}

interface FeaturedJourneyDefinition {
  readonly requestId: string;
  readonly destination: string;
  readonly journeyType: JourneyType;
  readonly days: number;
  readonly nights: number;
}

const FEATURED_JOURNEYS: ReadonlyArray<FeaturedJourneyDefinition> = Object.freeze([
  Object.freeze({
    requestId: "homepage-journey-001",
    destination: "Cape Winelands",
    journeyType: JourneyType.PACKAGE,
    days: 4,
    nights: 3,
  }),
  Object.freeze({
    requestId: "homepage-journey-002",
    destination: "Atlantic Seaboard",
    journeyType: JourneyType.PACKAGE,
    days: 3,
    nights: 2,
  }),
  Object.freeze({
    requestId: "homepage-journey-003",
    destination: "Franschhoek Valley",
    journeyType: JourneyType.PRIVATE,
    days: 5,
    nights: 4,
  }),
]);

function isFulfilled<T>(result: PromiseSettledResult<T>): result is PromiseFulfilledResult<T> {
  return result.status === "fulfilled";
}

function createQueries(timestamp: Date): ReadonlyArray<JourneyCompositionQuery> {
  return Object.freeze(
    FEATURED_JOURNEYS.map((feature) =>
      Object.freeze({
        journeyType: feature.journeyType,
        strategy: JourneyCompositionStrategy.CURATED,
        context: Object.freeze({
          requestId: feature.requestId,
          source: JourneyCompositionSource.HOMEPAGE,
          timestamp: new Date(timestamp),
        }),
        travellerRequirements: Object.freeze({
          minimumTravellers: 2,
          maximumTravellers: 6,
          privateOnly: true,
        }),
        destinationRequirements: Object.freeze({
          destinations: Object.freeze([
            Object.freeze({ name: feature.destination }),
          ]),
        }),
        stayRequirements: Object.freeze({
          duration: Object.freeze({
            days: feature.days,
            nights: feature.nights,
            description: `${feature.days} Days / ${feature.nights} Nights`,
          }),
        }),
      }),
    ),
  );
}

function createAccommodation(destination: string): Accommodation {
  return {
    identity: {
      id: destination.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: `${destination} Retreat`,
    },
    category: "Boutique Hotel",
    location: {
      country: "South Africa",
      region: "Western Cape",
      city: destination,
      suburb: "Central",
      latitude: -33.9,
      longitude: 18.4,
    },
    rating: {
      stars: 5,
      classification: "Luxury",
      reviewScore: 4.8,
    },
    images: [],
    amenities: ["Wi-Fi", "Breakfast Included"],
    policies: [],
    contacts: [],
    providerReference: {
      provider: "curated",
      providerAccommodationId: destination.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    },
  };
}

function createSearchResult(destination: string): AccommodationSearchResult {
  return {
    accommodations: Object.freeze([createAccommodation(destination)]),
    metadata: Object.freeze({
      generatedAt: new Date(),
      version: "1.0.0",
      provider: "curated",
    }),
  };
}

function createContentResult(destination: string): AccommodationContentResult {
  return {
    accommodation: createAccommodation(destination),
    metadata: Object.freeze({
      generatedAt: new Date(),
      version: "1.0.0",
      provider: "curated",
    }),
  };
}

function createAvailabilityResult(destination: string): AccommodationAvailabilityResult {
  return {
    kind: "ACCOMMODATION",
    accommodation: createAccommodation(destination),
    available: true,
    metadata: Object.freeze({
      generatedAt: new Date(),
      version: "1.0.0",
      provider: "curated",
    }),
  };
}

function createRateResult(destination: string): AccommodationRateResult {
  const accommodationId = destination.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    accommodationId,
    stayPeriod: Object.freeze({
      checkIn: new Date("2026-12-01T00:00:00.000Z"),
      checkOut: new Date("2026-12-05T00:00:00.000Z"),
    }),
    occupancy: Object.freeze({
      adults: 2,
      children: 0,
      rooms: 1,
    }),
    selectionStrategy: AccommodationRateSelectionStrategy.RECOMMENDED,
    rates: Object.freeze([
      Object.freeze({
        id: `${accommodationId}-rate-1`,
        type: AccommodationRateType.PUBLIC,
        status: AccommodationRateStatus.AVAILABLE,
        currency: AccommodationCurrency.ZAR,
        amount: 18950,
      }),
    ]),
    metadata: Object.freeze({
      generatedAt: new Date(),
      version: "1.0.0",
      provider: "curated",
    }),
  };
}

function createExperienceCandidateProvider(): ExperienceCandidateProvider {
  return {
    resolve: (context) =>
      Object.freeze([
        Object.freeze({
          experienceId: `${context.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-exp-1`,
          name: `${context.destination} Signature Experience`,
          source: ExperienceSource.CURATED,
          type: ExperienceType.SCENIC,
          priority: ExperiencePriority.PRIMARY,
          sequence: Object.freeze({ day: 1, order: 1 }),
        }),
        Object.freeze({
          experienceId: `${context.destination.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-exp-2`,
          name: `${context.destination} Private Tasting`,
          source: ExperienceSource.CURATED,
          type: ExperienceType.WINE,
          priority: ExperiencePriority.SECONDARY,
          sequence: Object.freeze({ day: 2, order: 1 }),
        }),
      ]),
  };
}

function createDefaultJourneyCompositionService(): JourneyCompositionService {
  const validationPipeline = new JourneyValidationPipeline();
  const policyPipeline = new JourneyPolicyPipeline();
  const accommodationCompositionAdapter = new AccommodationCompositionAdapter(
    {
      search: async (query) => createSearchResult(query.criteria.destination),
    },
    {
      execute: async (query) => createContentResult(query.context.requestId.includes("002") ? "Atlantic Seaboard" : query.context.requestId.includes("003") ? "Franschhoek Valley" : "Cape Winelands"),
    },
    {
      execute: async (query) => createAvailabilityResult(query.context.requestId.includes("002") ? "Atlantic Seaboard" : query.context.requestId.includes("003") ? "Franschhoek Valley" : "Cape Winelands"),
    },
    {
      execute: async (query) => createRateResult(query.identifier.includes("atlantic") ? "Atlantic Seaboard" : query.identifier.includes("franschhoek") ? "Franschhoek Valley" : "Cape Winelands"),
    },
  );
  const experienceFramework = new ExperienceCompositionFramework(createExperienceCandidateProvider());
  const journeyFactory = new JourneyFactory();

  return new JourneyCompositionService(
    validationPipeline,
    policyPipeline,
    accommodationCompositionAdapter,
    experienceFramework,
    journeyFactory,
  );
}

export class HomepageJourneyShowcaseService {
  public constructor(
    private readonly journeyCompositionService: JourneyCompositionExecutor,
    private readonly presentationMapper: JourneyPresentationMapper,
    private readonly viewModelProvider: JourneyViewModelProvider,
  ) {}

  public async execute(): Promise<HomepageJourneyShowcaseResult> {
    const queries = createQueries(new Date());

    const compositionExecutions = await Promise.allSettled(
      queries.map((query) => this.journeyCompositionService.execute(query)),
    );

    const featuredJourneys = compositionExecutions
      .filter(isFulfilled)
      .map((execution) => this.presentationMapper.map(execution.value))
      .filter((model): model is NonNullable<typeof model> => model !== null)
      .map((model) => this.viewModelProvider.provideHomepageJourney(model));

    return createHomepageJourneyShowcaseResult({
      success: featuredJourneys.length > 0,
      featuredJourneys: Object.freeze(featuredJourneys),
      metadata: Object.freeze({
        generatedAt: new Date(),
        version: "1.0.0",
      }),
    });
  }
}

export function createDefaultHomepageJourneyShowcaseService(): HomepageJourneyShowcaseService {
  return new HomepageJourneyShowcaseService(
    createDefaultJourneyCompositionService(),
    new JourneyPresentationMapper(),
    new JourneyViewModelProvider(),
  );
}