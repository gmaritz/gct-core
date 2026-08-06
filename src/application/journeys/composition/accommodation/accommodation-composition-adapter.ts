import {
  Accommodation,
  AccommodationSearchContext,
  AccommodationSearchQuery,
  AccommodationSearchResult,
  AccommodationSearchSource,
} from "../../../accommodation";
import {
  AccommodationContentContext,
  AccommodationContentLocale,
  AccommodationContentQuery,
  AccommodationContentResult,
  AccommodationContentService,
  AccommodationContentSource,
} from "../../../accommodation";
import {
  AccommodationAvailabilityResult,
  AccommodationInventoryContext,
  AccommodationInventoryQuery,
  AccommodationInventoryService,
  AccommodationInventorySource,
} from "../../../accommodation";
import {
  AccommodationCurrency,
  AccommodationRateContext,
  AccommodationRateQuery,
  AccommodationRateResult,
  AccommodationRateSelectionStrategy,
  AccommodationRateService,
  AccommodationRateSource,
} from "../../../accommodation";
import { AccommodationDiscoveryEngine } from "../../../accommodation";
import { JourneyAccommodation } from "../../models";
import { JourneyCompositionSource } from "../../validation";

import { AccommodationCompositionContext } from "./accommodation-composition-context";
import {
  AccommodationCompositionResult,
  createAccommodationCompositionResult,
} from "./accommodation-composition-result";

interface AccommodationDiscoveryService {
  search(query: AccommodationSearchQuery): Promise<AccommodationSearchResult>;
}

interface AccommodationContentQueryService {
  execute(query: AccommodationContentQuery): Promise<AccommodationContentResult>;
}

interface AccommodationInventoryQueryService {
  execute(query: AccommodationInventoryQuery): Promise<AccommodationAvailabilityResult>;
}

interface AccommodationRateQueryService {
  execute(query: AccommodationRateQuery): Promise<AccommodationRateResult>;
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function isFulfilled<T>(
  result: PromiseSettledResult<T>,
): result is PromiseFulfilledResult<T> {
  return result.status === "fulfilled";
}

function toSearchSource(
  source: JourneyCompositionSource,
): AccommodationSearchSource {
  switch (source) {
    case JourneyCompositionSource.HOMEPAGE:
      return AccommodationSearchSource.HOMEPAGE_MERCHANDISING;
    case JourneyCompositionSource.PACKAGE_DESIGNER:
      return AccommodationSearchSource.PACKAGE_BUILDER;
    case JourneyCompositionSource.PACKAGE_DETAILS:
      return AccommodationSearchSource.PACKAGE_DETAILS;
    case JourneyCompositionSource.ADMIN:
      return AccommodationSearchSource.ADMIN;
    case JourneyCompositionSource.API:
      return AccommodationSearchSource.API;
    case JourneyCompositionSource.INTERNAL:
      return AccommodationSearchSource.INTERNAL;
    default:
      return AccommodationSearchSource.INTERNAL;
  }
}

function toInventorySource(
  source: JourneyCompositionSource,
): AccommodationInventorySource {
  switch (source) {
    case JourneyCompositionSource.HOMEPAGE:
      return AccommodationInventorySource.HOMEPAGE;
    case JourneyCompositionSource.PACKAGE_DESIGNER:
      return AccommodationInventorySource.PACKAGE_BUILDER;
    case JourneyCompositionSource.PACKAGE_DETAILS:
      return AccommodationInventorySource.PACKAGE_DETAILS;
    case JourneyCompositionSource.ADMIN:
      return AccommodationInventorySource.ADMIN;
    case JourneyCompositionSource.API:
      return AccommodationInventorySource.API;
    case JourneyCompositionSource.INTERNAL:
      return AccommodationInventorySource.INTERNAL;
    default:
      return AccommodationInventorySource.INTERNAL;
  }
}

function toRateSource(
  source: JourneyCompositionSource,
): AccommodationRateSource {
  switch (source) {
    case JourneyCompositionSource.HOMEPAGE:
      return AccommodationRateSource.HOMEPAGE;
    case JourneyCompositionSource.PACKAGE_DESIGNER:
      return AccommodationRateSource.PACKAGE_BUILDER;
    case JourneyCompositionSource.PACKAGE_DETAILS:
      return AccommodationRateSource.PACKAGE_DETAILS;
    case JourneyCompositionSource.ADMIN:
      return AccommodationRateSource.ADMIN;
    case JourneyCompositionSource.API:
      return AccommodationRateSource.API;
    case JourneyCompositionSource.INTERNAL:
      return AccommodationRateSource.INTERNAL;
    default:
      return AccommodationRateSource.INTERNAL;
  }
}

function toContentSource(
  source: JourneyCompositionSource,
): AccommodationContentSource {
  switch (source) {
    case JourneyCompositionSource.HOMEPAGE:
      return AccommodationContentSource.HOMEPAGE;
    case JourneyCompositionSource.PACKAGE_DESIGNER:
      return AccommodationContentSource.PACKAGE_BUILDER;
    case JourneyCompositionSource.PACKAGE_DETAILS:
      return AccommodationContentSource.PACKAGE_DETAILS;
    case JourneyCompositionSource.ADMIN:
      return AccommodationContentSource.ADMIN;
    case JourneyCompositionSource.API:
      return AccommodationContentSource.API;
    case JourneyCompositionSource.INTERNAL:
      return AccommodationContentSource.INTERNAL;
    default:
      return AccommodationContentSource.INTERNAL;
  }
}

function toContentLocale(locale: string | undefined): AccommodationContentLocale {
  const normalized = locale?.toUpperCase();

  switch (normalized) {
    case AccommodationContentLocale.DE:
      return AccommodationContentLocale.DE;
    case AccommodationContentLocale.FR:
      return AccommodationContentLocale.FR;
    case AccommodationContentLocale.ES:
      return AccommodationContentLocale.ES;
    case AccommodationContentLocale.NL:
      return AccommodationContentLocale.NL;
    default:
      return AccommodationContentLocale.EN;
  }
}

function createSearchQuery(context: AccommodationCompositionContext): AccommodationSearchQuery {
  const searchContext: AccommodationSearchContext = {
    requestId: context.requestId,
    source: toSearchSource(context.source),
    channel: context.channel ?? "WEB",
    locale: context.locale ?? "EN",
    currency: context.currency ?? AccommodationCurrency.ZAR,
    timestamp: context.timestamp,
  };

  return Object.freeze({
    criteria: {
      destination: context.destination,
      checkInDate: context.checkInDate,
      checkOutDate: context.checkOutDate,
      adults: context.adults,
      children: context.children,
      rooms: context.rooms,
      category: context.preferences?.category,
      minimumRating: context.preferences?.minimumRating,
      amenities: context.preferences?.amenities,
      collections: context.preferences?.collections,
    },
    context: searchContext,
  });
}

function createContentQuery(
  context: AccommodationCompositionContext,
  identifier: string,
): AccommodationContentQuery {
  const contentContext: AccommodationContentContext = {
    requestId: context.requestId,
    source: toContentSource(context.source),
    locale: toContentLocale(context.locale),
    timestamp: context.timestamp,
  };

  return Object.freeze({
    identifier,
    context: contentContext,
  });
}

function createInventoryQuery(
  context: AccommodationCompositionContext,
  identifier: string,
): AccommodationInventoryQuery {
  const inventoryContext: AccommodationInventoryContext = {
    requestId: context.requestId,
    source: toInventorySource(context.source),
    timestamp: context.timestamp,
  };

  return Object.freeze({
    identifier,
    checkInDate: context.checkInDate,
    checkOutDate: context.checkOutDate,
    adults: context.adults,
    children: context.children,
    rooms: context.rooms,
    context: inventoryContext,
  });
}

function createRateQuery(
  context: AccommodationCompositionContext,
  identifier: string,
): AccommodationRateQuery {
  const rateContext: AccommodationRateContext = {
    requestId: context.requestId,
    source: toRateSource(context.source),
    currency: context.currency ?? AccommodationCurrency.ZAR,
    market: context.market ?? "ZA",
    timestamp: context.timestamp,
  };

  return Object.freeze({
    identifier,
    stayPeriod: {
      checkIn: context.checkInDate,
      checkOut: context.checkOutDate,
    },
    occupancy: {
      adults: context.adults,
      children: context.children,
      rooms: context.rooms,
    },
    selectionStrategy: AccommodationRateSelectionStrategy.RECOMMENDED,
    context: rateContext,
  });
}

function toJourneyAccommodation(
  accommodation: Accommodation,
  contentResult: AccommodationContentResult | undefined,
): JourneyAccommodation | undefined {
  const accommodationId = accommodation.identity.id;
  const resolvedName = contentResult?.accommodation.identity.name ?? accommodation.identity.name;

  if (isBlank(accommodationId) || isBlank(resolvedName)) {
    return undefined;
  }

  return Object.freeze({
    accommodationId,
    name: resolvedName,
  });
}

export class AccommodationCompositionAdapter {
  public constructor(
    private readonly discoveryService: AccommodationDiscoveryService,
    private readonly contentService: AccommodationContentQueryService,
    private readonly inventoryService: AccommodationInventoryQueryService,
    private readonly rateService: AccommodationRateQueryService,
  ) {}

  public static fromServices(
    discoveryService: AccommodationDiscoveryEngine,
    contentService: AccommodationContentService,
    inventoryService: AccommodationInventoryService,
    rateService: AccommodationRateService,
  ): AccommodationCompositionAdapter {
    return new AccommodationCompositionAdapter(
      discoveryService,
      contentService,
      inventoryService,
      rateService,
    );
  }

  public async compose(
    context: AccommodationCompositionContext,
  ): Promise<AccommodationCompositionResult> {
    const [discoveryExecution] = await Promise.allSettled([
      this.discoveryService.search(createSearchQuery(context)),
    ]);

    if (!discoveryExecution || !isFulfilled(discoveryExecution)) {
      return createAccommodationCompositionResult([]);
    }

    const candidateCompositions = await Promise.allSettled(
      discoveryExecution.value.accommodations.map((accommodation) =>
        this.composeAccommodation(accommodation, context),
      ),
    );

    const journeyAccommodations = candidateCompositions
      .filter(isFulfilled)
      .map((result) => result.value)
      .filter((value): value is JourneyAccommodation => typeof value !== "undefined");

    return createAccommodationCompositionResult(journeyAccommodations);
  }

  private async composeAccommodation(
    accommodation: Accommodation,
    context: AccommodationCompositionContext,
  ): Promise<JourneyAccommodation | undefined> {
    const accommodationId = accommodation.identity.id;

    const [contentExecution, inventoryExecution, rateExecution] = await Promise.allSettled([
      this.contentService.execute(createContentQuery(context, accommodationId)),
      this.inventoryService.execute(createInventoryQuery(context, accommodationId)),
      this.rateService.execute(createRateQuery(context, accommodationId)),
    ]);

    const inventoryResult = isFulfilled(inventoryExecution)
      ? inventoryExecution.value
      : undefined;
    const rateResult = isFulfilled(rateExecution)
      ? rateExecution.value
      : undefined;
    const contentResult = isFulfilled(contentExecution)
      ? contentExecution.value
      : undefined;

    if (!inventoryResult || !inventoryResult.available) {
      return undefined;
    }

    if (!rateResult || rateResult.rates.length === 0) {
      return undefined;
    }

    return toJourneyAccommodation(accommodation, contentResult);
  }
}