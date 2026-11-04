import {
  AccommodationAvailabilityResult,
  AccommodationAvailabilityOccupancy,
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
export const CAPE_WINELANDS_OCCUPANCY_POLICY = Object.freeze({ childrenAllowed: false });

export interface CapeWinelandsStay {
  readonly stopId: string;
  readonly stopOrder: number;
  readonly destination: "Stellenbosch" | "Hermanus";
  readonly checkInDate: Date;
  readonly checkOutDate: Date;
  readonly nights: number;
}

export const CAPE_WINELANDS_STOPS = Object.freeze([
  Object.freeze({ stopId: "cape-winelands-stellenbosch", stopOrder: 1, destination: "Stellenbosch" as const, nights: 2 }),
  Object.freeze({ stopId: "cape-winelands-hermanus", stopOrder: 2, destination: "Hermanus" as const, nights: 1 }),
]);

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
  let checkInDate = start;
  return Object.freeze([
    ...CAPE_WINELANDS_STOPS.map((stop) => {
      const checkOutDate = addUtcDays(checkInDate, stop.nights);
      const stay = Object.freeze({ ...stop, checkInDate, checkOutDate });
      checkInDate = checkOutDate;
      return stay;
    }),
  ]);
}

function sameRoomOccupancy(
  offered: AccommodationRateOption["occupancy"]["rooms"][number],
  requested: JourneyBookingContext["stopOccupancies"][number]["rooms"][number],
): boolean {
  return offered.adults === requested.adults
    && offered.children === requested.children
    && offered.childAges.length === requested.childAges.length
    && offered.childAges.every((age, index) => age === requested.childAges[index]);
}

function sameRequestedOccupancy(
  offered: AccommodationAvailabilityOccupancy | undefined,
  requested: JourneyBookingContext["stopOccupancies"][number]["rooms"],
): boolean {
  return Boolean(offered
    && offered.rooms.length === requested.length
    && offered.rooms.every((room, index) => {
      const requestedRoom = requested[index];
      return requestedRoom !== undefined
        && room.adults === requestedRoom.adults
        && room.children === requestedRoom.children
        && room.childAges.length === requestedRoom.childAges.length
        && room.childAges.every((age, ageIndex) => age === requestedRoom.childAges[ageIndex]);
    }));
}

function normalizePropertyName(value: string): string {
  return value.toLocaleLowerCase("en").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function isSuitableResult(
  result: AccommodationAvailabilityResult,
  configuration: CapeWinelandsPropertyConfiguration,
  requestedRooms: JourneyBookingContext["stopOccupancies"][number]["rooms"],
): result is Extract<AccommodationAvailabilityResult, { readonly kind: "ACCOMMODATION" }> {
  if (result.kind !== "ACCOMMODATION" || !result.available) return false;
  if (result.accommodation.identity.id !== configuration.hotelCode) return false;
  if (normalizePropertyName(result.accommodation.identity.name) !== normalizePropertyName(configuration.name)) return false;
  if (!sameRequestedOccupancy(result.requestedOccupancy, requestedRooms)) return false;

  // Each rateKey is one supplier offer. Identical repeated entries are one offer; a rateKey
  // described inconsistently is ambiguous and the property is not offered.
  const offersByRateKey = new Map<string, string>();
  const ratesByOccupancy = new Map<string, number>();
  let ambiguous = false;
  result.availabilityOptions?.roomOptions.forEach((room) => {
    if (!isValidSupplierReference(room.reference)) return;
    room.rateOptions.forEach((rate) => {
      const offered = rate.occupancy.rooms[0];
      if (!offered
        || rate.occupancy.rooms.length !== 1
        || !requestedRooms.some((requested) => sameRoomOccupancy(offered, requested))
        || (rate.status !== "BOOKABLE" && rate.status !== "RECHECK_REQUIRED")
        || !isValidSupplierReference(rate.reference)
        || room.reference.provider !== rate.reference.provider
        || !Number.isFinite(rate.pricing.amount)
        || !/^[A-Z]{3}$/.test(rate.pricing.currency)
        || rate.pricing.basis !== "TOTAL_STAY") return;
      const occupancyKey = occupancyKeyFor(offered);
      const rateIdentity = JSON.stringify([rate.reference.provider, rate.reference.opaqueReference]);
      const description = JSON.stringify([
        room.reference.provider,
        room.reference.opaqueReference,
        occupancyKey,
        rate.pricing.amount,
        rate.pricing.currency,
        rate.status,
      ]);
      const known = offersByRateKey.get(rateIdentity);
      if (known !== undefined) {
        if (known !== description) ambiguous = true;
        return;
      }
      offersByRateKey.set(rateIdentity, description);
      ratesByOccupancy.set(occupancyKey, (ratesByOccupancy.get(occupancyKey) ?? 0) + 1);
    });
  });
  if (ambiguous) return false;

  // Offers are matched to room slots by exact occupancy, so a complete allocation with a distinct
  // rateKey per slot exists exactly when every occupancy has at least as many distinct offers as slots.
  const requiredCounts = new Map<string, number>();
  requestedRooms.forEach((room) => {
    const key = occupancyKeyFor(room);
    requiredCounts.set(key, (requiredCounts.get(key) ?? 0) + 1);
  });
  return [...requiredCounts].every(([key, count]) => (ratesByOccupancy.get(key) ?? 0) >= count);
}

function occupancyKeyFor(occupancy: { readonly adults: number; readonly children: number; readonly childAges: ReadonlyArray<number> }): string {
  return JSON.stringify([occupancy.adults, occupancy.children, occupancy.childAges]);
}

function isValidSupplierReference(reference: unknown): reference is { readonly provider: string; readonly opaqueReference: string } {
  return typeof reference === "object" && reference !== null
    && typeof (reference as { readonly provider?: unknown }).provider === "string"
    && (reference as { readonly provider: string }).provider.trim().length > 0
    && typeof (reference as { readonly opaqueReference?: unknown }).opaqueReference === "string"
    && (reference as { readonly opaqueReference: string }).opaqueReference.trim().length > 0;
}

function createQuery(
  stay: CapeWinelandsStay,
  propertyCodes: ReadonlyArray<string>,
  roomOccupancies: JourneyBookingContext["stopOccupancies"][number]["rooms"],
): AccommodationSearchQuery {
  const occupancies = Object.freeze(roomOccupancies.map((room) => Object.freeze({
    slotId: room.slotId,
    rooms: 1,
    adults: room.adults,
    children: room.children,
    childAges: Object.freeze([...room.childAges]),
  })));
  return Object.freeze({
    criteria: Object.freeze({
      destination: stay.destination,
      checkInDate: stay.checkInDate,
      checkOutDate: stay.checkOutDate,
      sourceMarket: "ZA",
      occupancies,
      adults: roomOccupancies.reduce((total, room) => total + room.adults, 0),
      children: roomOccupancies.reduce((total, room) => total + room.children, 0),
      rooms: roomOccupancies.length,
      hotelCodes: Object.freeze([...propertyCodes]),
      destinationCode: CAPE_WINELANDS_DESTINATION_CODE,
    }),
    context: Object.freeze({
      requestId: `${CAPE_WINELANDS_JOURNEY_ID}-${stay.stopId}-${JSON.stringify(roomOccupancies.map((room) => [room.adults, room.children, room.childAges]))}`,
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

    const roomOccupancies = context.stopOccupancies.find((allocation) => allocation.stopId === stay.stopId)?.rooms ?? [];
    const result = await this.availabilityService.execute(createQuery(
      stay,
      active.map((property) => property.hotelCode),
      roomOccupancies,
    ));
    const results = result.kind === "ACCOMMODATION" ? result.results ?? [result] : [];
    const resultsByCode = new Map(results.flatMap((candidate) =>
      candidate.kind === "ACCOMMODATION"
        ? [[candidate.accommodation.identity.id, candidate] as const]
        : [],
    ));
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
      const availability = resultsByCode.get(property.hotelCode);
      if (!availability || !isSuitableResult(availability, property, roomOccupancies)) return [];
      const roomOptionsByReference = new Map<string, {
        reference: { readonly provider: string; readonly opaqueReference: string };
        name: string;
        rateOptions: AccommodationRateOption[];
      }>();
      availability.availabilityOptions?.roomOptions.forEach((room) => {
        if (!isValidSupplierReference(room.reference)) return;
        const rates = room.rateOptions.filter((rate) => {
          const offered = rate.occupancy.rooms[0];
          return Boolean(offered
            && rate.occupancy.rooms.length === 1
            && roomOccupancies.some((requested) => sameRoomOccupancy(offered, requested))
            && (rate.status === "BOOKABLE" || rate.status === "RECHECK_REQUIRED")
            && isValidSupplierReference(rate.reference)
            && room.reference.provider === rate.reference.provider
            && Number.isFinite(rate.pricing.amount)
            && /^[A-Z]{3}$/.test(rate.pricing.currency)
            && rate.pricing.basis === "TOTAL_STAY");
        });
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
      const seenRateReferences = new Set<string>();
      const roomOptions = [...roomOptionsByReference.values()]
        .map((room) => Object.freeze({
          ...room,
          rateOptions: Object.freeze(room.rateOptions.filter((rate) => {
            const identity = JSON.stringify([rate.reference.provider, rate.reference.opaqueReference]);
            if (seenRateReferences.has(identity)) return false;
            seenRateReferences.add(identity);
            return true;
          })),
        }));
      if (roomOptions.length === 0) return [];
      return [Object.freeze({
        accommodationId: property.hotelCode,
        name: availability.accommodation.identity.name,
        accommodation: availability.accommodation,
        packageStop: stop,
        provider: "hotelbeds",
        roomOptions: Object.freeze(roomOptions),
        requestedOccupancy: {
          rooms: Object.freeze(roomOccupancies.map((room) => Object.freeze({
            slotId: room.slotId,
            adults: room.adults,
            children: room.children,
            childAges: Object.freeze([...room.childAges]),
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
      travellerRules: { minimumTravellers: 2, maximumTravellers: 8, privateOnly: true, childrenAllowed: CAPE_WINELANDS_OCCUPANCY_POLICY.childrenAllowed },
      tags: [],
    });
  }
}

export function validateBookingContext(
  context: JourneyBookingContext,
  policy: { readonly childrenAllowed: boolean } = CAPE_WINELANDS_OCCUPANCY_POLICY,
): string | undefined {
  if (!parseDateOnly(context.startDate)) return "A valid journey start date is required.";
  if (!Number.isInteger(context.participants) || context.participants < 2 || context.participants > 8) {
    return "The journey supports 2 to 8 adult participants.";
  }
  const expectedStops = calculateCapeWinelandsStays(context.startDate);
  if (!Array.isArray(context.stopOccupancies)
    || context.stopOccupancies.length !== expectedStops.length
    || context.stopOccupancies.some((allocation) =>
      !allocation || typeof allocation.stopId !== "string" || !Array.isArray(allocation.rooms))
    || expectedStops.some((stay) => context.stopOccupancies.filter((allocation) => allocation?.stopId === stay.stopId).length !== 1)) {
    return "Every package stop requires its own room allocation.";
  }

  let expectedTravellerCount: number | undefined;
  for (const stay of expectedStops) {
    const allocation = context.stopOccupancies.find((item) => item.stopId === stay.stopId);
    if (!allocation || !Array.isArray(allocation.rooms) || allocation.rooms.length === 0) return "Every package stop requires at least one room.";
    if (allocation.rooms.some((room: JourneyBookingContext["stopOccupancies"][number]["rooms"][number] | null) =>
      !room || typeof room !== "object")) return "Every room requires a valid occupancy allocation.";
    let adultCount = 0;
    let childCount = 0;
    for (const [index, room] of allocation.rooms.entries()) {
      if (room.slotId !== `${stay.stopId}-room-${index + 1}`) return "Room slots must have unique, valid identities.";
      if (!Number.isSafeInteger(room.adults) || room.adults < 1) return "Every room must have at least one adult.";
      if (!Number.isSafeInteger(room.children) || room.children < 0) return "Child count must be a non-negative whole number.";
      if (!Array.isArray(room.childAges) || room.childAges.length !== room.children
        || room.childAges.some((age: number) => !Number.isSafeInteger(age) || age < 0)) {
        return "Enter one valid non-negative whole-number age for every child.";
      }
      if (!policy.childrenAllowed && room.children > 0) return "Children are not permitted on this journey.";
      adultCount += room.adults;
      childCount += room.children;
    }
    if (adultCount !== context.participants) return "Room adult allocations must equal the participant count at every stop.";
    const travellerCount = adultCount + childCount;
    if (expectedTravellerCount !== undefined && expectedTravellerCount !== travellerCount) {
      return "Every package stop must preserve the same travelling party.";
    }
    expectedTravellerCount = travellerCount;
  }
  return undefined;
}
