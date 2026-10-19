import {
  AccommodationAvailabilityResult,
  AccommodationAvailabilityService,
  AccommodationRateOption,
  AccommodationSearchQuery,
  AccommodationSearchSource,
  HotelCatalogueService,
} from "../../../accommodation";
import {
  Journey,
  JourneyAccommodation,
  JourneyPackageStop,
  JourneyType,
} from "../../../journeys";
import { JourneyLifecycle, JourneyStatus } from "../../../journeys";
import { JourneyBookingContext, JourneySelectionStore, journeySelectionStore } from "./journey-selection-store";
import { assertJourneyStateOwner } from "./journey-state-ownership";
import {
  CAPE_WINELANDS_DESTINATION_CODE,
  CAPE_WINELANDS_FRANSCHHOEK_PROPERTIES,
  CAPE_WINELANDS_HERMANUS_PROPERTIES,
  CAPE_WINELANDS_STELLENBOSCH_PROPERTIES,
  CapeWinelandsPropertyConfiguration,
} from "./cape-winelands-property-configuration";
import {
  DefaultDynamicHomepageJourneyResolver,
  DynamicHomepageJourneyResolution,
  DynamicHomepageJourneyResolver,
} from "./dynamic-homepage-journey-resolver";

export const CAPE_WINELANDS_JOURNEY_ID = "journey-homepage-journey-001";

export interface CapeWinelandsStay {
  readonly stopId: string;
  readonly stopOrder: number;
  readonly destination: "Stellenbosch" | "Hermanus";
  readonly checkInDate: Date;
  readonly checkOutDate: Date;
  readonly nights: number;
}

export function parseDateOnly(value: unknown): Date | undefined {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value
    ? undefined
    : parsed;
}

function addUtcDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function calculateCapeWinelandsStays(startDate: string): ReadonlyArray<CapeWinelandsStay> {
  const start = parseDateOnly(startDate);
  if (!start) throw new Error("A valid journey start date is required.");
  const firstCheckout = addUtcDays(start, 2);
  return Object.freeze([
    Object.freeze({
      stopId: "cape-winelands-stellenbosch",
      stopOrder: 1,
      destination: "Stellenbosch",
      checkInDate: start,
      checkOutDate: firstCheckout,
      nights: 2,
    }),
    Object.freeze({
      stopId: "cape-winelands-hermanus",
      stopOrder: 2,
      destination: "Hermanus",
      checkInDate: firstCheckout,
      checkOutDate: addUtcDays(firstCheckout, 1),
      nights: 1,
    }),
  ]);
}

function sameOccupancy(
  offered: AccommodationRateOption["occupancy"],
  requestedAdults: number,
): boolean {
  return offered.rooms.length === 1
    && offered.rooms[0]?.adults === requestedAdults
    && offered.rooms[0]?.children === 0
    && offered.rooms[0]?.childAges.length === 0;
}

function normalizePropertyName(value: string): string {
  return value.toLocaleLowerCase("en").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function isSuitableResult(
  result: AccommodationAvailabilityResult,
  configuration: CapeWinelandsPropertyConfiguration,
  requestedAdults: number,
): result is Extract<AccommodationAvailabilityResult, { readonly kind: "ACCOMMODATION" }> {
  if (result.kind !== "ACCOMMODATION" || !result.available) return false;
  if (result.accommodation.identity.id !== configuration.hotelCode) return false;
  if (normalizePropertyName(result.accommodation.identity.name) !== normalizePropertyName(configuration.name)) return false;
  return Boolean(result.availabilityOptions?.roomOptions.some((room) =>
    room.rateOptions.some((rate) =>
      (rate.status === "BOOKABLE" || rate.status === "RECHECK_REQUIRED")
      && sameOccupancy(rate.occupancy, requestedAdults),
    ),
  ));
}

function createQuery(
  context: JourneyBookingContext,
  stay: CapeWinelandsStay,
  propertyCodes: ReadonlyArray<string>,
  roomAdults: number,
): AccommodationSearchQuery {
  const occupancies = [Object.freeze({
    rooms: 1,
    adults: roomAdults,
    children: 0,
    childAges: Object.freeze([]),
  })];
  return Object.freeze({
    criteria: Object.freeze({
      destination: stay.destination,
      checkInDate: stay.checkInDate,
      checkOutDate: stay.checkOutDate,
      sourceMarket: "ZA",
      occupancies: Object.freeze(occupancies),
      adults: context.participants,
      children: 0,
      rooms: 1,
      hotelCodes: Object.freeze([...propertyCodes]),
      destinationCode: CAPE_WINELANDS_DESTINATION_CODE,
    }),
    context: Object.freeze({
      requestId: `${CAPE_WINELANDS_JOURNEY_ID}-${stay.stopId}-adults-${roomAdults}`,
      source: AccommodationSearchSource.PACKAGE_DETAILS,
      channel: "WEB",
      locale: "EN",
      currency: "ZAR",
      timestamp: new Date(),
    }),
  });
}

export class CapeWinelandsJourneyResolver implements DynamicHomepageJourneyResolver {
  public constructor(
    private readonly catalogueService: HotelCatalogueService,
    private readonly availabilityService: AccommodationAvailabilityService,
    private readonly fallbackResolver: DynamicHomepageJourneyResolver = new DefaultDynamicHomepageJourneyResolver(),
    private readonly selectionStore: JourneySelectionStore = journeySelectionStore,
  ) {}

  public async resolve(
    ownerId: string,
    journeyId: string,
    selection?: JourneyBookingContext,
  ): Promise<DynamicHomepageJourneyResolution> {
    assertJourneyStateOwner(ownerId);
    if (journeyId !== CAPE_WINELANDS_JOURNEY_ID) {
      return this.fallbackResolver.resolve(ownerId, journeyId);
    }

    if (selection) {
      const error = validateBookingContext(selection);
      if (error) return { status: "INVALID" };
      this.selectionStore.configure(ownerId, journeyId, selection);
    }

    const context = this.selectionStore.context(ownerId, journeyId);
    if (!context) return { status: "UNAVAILABLE" };

    const offeredJourney = this.selectionStore.offeredJourney(ownerId, journeyId);
    if (offeredJourney) return { status: "RESOLVED", journey: offeredJourney };

    const journey = await this.composeJourney(context);
    if (!journey) return { status: "UNAVAILABLE" };
    this.selectionStore.saveOfferedJourney(ownerId, journeyId, journey);
    return { status: "RESOLVED", journey };
  }

  private async activeProperties(
    configured: ReadonlyArray<CapeWinelandsPropertyConfiguration>,
  ): Promise<ReadonlyArray<CapeWinelandsPropertyConfiguration>> {
    const entries = await this.catalogueService.find({
      hotelCodes: configured.map((property) => property.hotelCode),
      destinationCode: CAPE_WINELANDS_DESTINATION_CODE,
    });
    const entriesByCode = new Map(entries.map((entry) => [entry.hotelCode, entry]));
    return Object.freeze(configured.filter((property) => {
      const entry = entriesByCode.get(property.hotelCode);
      return Boolean(entry
        && entry.active
        && entry.zoneCode === property.zoneCode
        && entry.zoneName.trim().toLocaleLowerCase("en") === property.zoneName.toLocaleLowerCase("en")
        && entry.starGrading === property.starGrading
        && entry.destinationCode === CAPE_WINELANDS_DESTINATION_CODE);
    }));
  }

  private async availableOptions(
    context: JourneyBookingContext,
    stay: CapeWinelandsStay,
    configured: ReadonlyArray<CapeWinelandsPropertyConfiguration>,
  ): Promise<ReadonlyArray<JourneyAccommodation>> {
    const active = await this.activeProperties(configured);
    if (active.length === 0) return Object.freeze([]);

    const resultsByCode = new Map<string, Array<Extract<AccommodationAvailabilityResult, { readonly kind: "ACCOMMODATION" }>>>();
    for (const adults of new Set(context.roomAdults)) {
      const result = await this.availabilityService.execute(createQuery(
        context,
        stay,
        active.map((property) => property.hotelCode),
        adults,
      ));
      const results = result.kind === "ACCOMMODATION" ? result.results ?? [result] : [];
      for (const candidate of results) {
        if (candidate.kind !== "ACCOMMODATION") continue;
        const current = resultsByCode.get(candidate.accommodation.identity.id) ?? [];
        current.push(candidate);
        resultsByCode.set(candidate.accommodation.identity.id, current);
      }
    }
    const stop: JourneyPackageStop = Object.freeze({
      packageId: CAPE_WINELANDS_JOURNEY_ID,
      stopId: stay.stopId,
      stopOrder: stay.stopOrder,
      destination: stay.destination,
      checkInDate: stay.checkInDate,
      checkOutDate: stay.checkOutDate,
      approvedAccommodationIds: Object.freeze(active.map((property) => property.hotelCode)),
    });

    return Object.freeze(active.flatMap((property) => {
      const occupancies = resultsByCode.get(property.hotelCode) ?? [];
      const matchingResults = occupancies.filter((availability) =>
        context.roomAdults.some((adults) => isSuitableResult(availability, property, adults)),
      );
      const firstAvailability = matchingResults[0];
      const allocatedAdults = context.roomAdults;
      const roomOptionsByReference = new Map<string, {
        reference: { readonly provider: string; readonly opaqueReference: string };
        name: string;
        rateOptions: AccommodationRateOption[];
      }>();
      matchingResults.forEach((availability) => {
        availability.availabilityOptions?.roomOptions.forEach((room) => {
          const rates = room.rateOptions.filter((rate) =>
            (rate.status === "BOOKABLE" || rate.status === "RECHECK_REQUIRED")
            && allocatedAdults.some((adults) => sameOccupancy(rate.occupancy, adults)),
          );
          if (rates.length === 0) return;
          const existing = roomOptionsByReference.get(room.reference.opaqueReference);
          if (existing) {
            const knownRates = new Set(existing.rateOptions.map((rate) => rate.reference.opaqueReference));
            existing.rateOptions.push(...rates.filter((rate) => !knownRates.has(rate.reference.opaqueReference)));
          } else {
            roomOptionsByReference.set(room.reference.opaqueReference, {
              reference: room.reference,
              name: room.name,
              rateOptions: [...rates],
            });
          }
        });
      });
      const roomOptions = [...roomOptionsByReference.values()]
        .filter((room) => allocatedAdults.some((adults) => room.rateOptions.some((rate) => sameOccupancy(rate.occupancy, adults))))
        .map((room) => Object.freeze({
          ...room,
          rateOptions: Object.freeze(room.rateOptions),
        }));
      const matchesEveryRoom = allocatedAdults.every((adults) =>
        roomOptions.some((room) => room.rateOptions.some((rate) => sameOccupancy(rate.occupancy, adults))),
      );
      if (!firstAvailability || !matchesEveryRoom || roomOptions.length === 0) return [];
      return [Object.freeze({
        accommodationId: property.hotelCode,
        name: firstAvailability.accommodation.identity.name,
        accommodation: firstAvailability.accommodation,
        packageStop: stop,
        provider: "hotelbeds",
        roomOptions: Object.freeze(roomOptions),
        requestedOccupancy: {
          rooms: Object.freeze(context.roomAdults.map((adults) => Object.freeze({
            adults,
            children: 0,
            childAges: Object.freeze([]),
          }))),
        },
      })];
    }));
  }

  private async composeJourney(context: JourneyBookingContext): Promise<Journey | undefined> {
    const stays = calculateCapeWinelandsStays(context.startDate);
    const primary = await this.availableOptions(context, stays[0]!, CAPE_WINELANDS_STELLENBOSCH_PROPERTIES);
    const firstStop = primary.length > 0
      ? primary
      : await this.availableOptions(context, stays[0]!, CAPE_WINELANDS_FRANSCHHOEK_PROPERTIES);
    const secondStop = await this.availableOptions(context, stays[1]!, CAPE_WINELANDS_HERMANUS_PROPERTIES);
    if (firstStop.length === 0 || secondStop.length === 0) return undefined;

    const start = parseDateOnly(context.startDate)!;
    return Journey.create({
      identity: { id: CAPE_WINELANDS_JOURNEY_ID },
      classification: { type: JourneyType.PACKAGE, category: "SIGNATURE" },
      metadata: { created: start, modified: start, version: "1.0.0", source: "INT-004" },
      status: JourneyStatus.PUBLISHED,
      lifecycle: JourneyLifecycle.BOOKABLE,
      duration: { days: 4, nights: 3, description: "4 Days / 3 Nights" },
      destinations: [{ name: "Cape Winelands" }],
      accommodation: Object.freeze([...firstStop, ...secondStop]),
      experiences: Object.freeze([
        { experienceId: "cape-winelands-day-1", name: "Franschhoek wine tour", sequence: { day: 1, order: 1, itineraryLabel: "Franschhoek wine tour" } },
        { experienceId: "cape-winelands-day-2", name: "Stellenbosch wine tour", sequence: { day: 2, order: 1, itineraryLabel: "Stellenbosch wine tour" } },
        { experienceId: "cape-winelands-day-3", name: "Elgin and Botriver wine tour", sequence: { day: 3, order: 1, itineraryLabel: "Elgin and Botriver wine tour" } },
        { experienceId: "cape-winelands-day-4", name: "Hemel-en-Aarde wine tour", sequence: { day: 4, order: 1, itineraryLabel: "Hemel-en-Aarde wine tour" } },
      ]),
      travellerRules: { minimumTravellers: 2, maximumTravellers: 8, privateOnly: true },
      tags: [],
    });
  }
}

export function validateBookingContext(context: JourneyBookingContext): string | undefined {
  if (!parseDateOnly(context.startDate)) return "A valid journey start date is required.";
  if (!Number.isInteger(context.participants) || context.participants < 2 || context.participants > 8) {
    return "The journey supports 2 to 8 adult participants.";
  }
  if (!Array.isArray(context.roomAdults) || context.roomAdults.length === 0
    || context.roomAdults.some((adults) => !Number.isInteger(adults) || adults < 1)) {
    return "Every room must have at least one adult.";
  }
  if (context.roomAdults.reduce((total, adults) => total + adults, 0) !== context.participants) {
    return "Room adult allocations must equal the participant count.";
  }
  return undefined;
}
