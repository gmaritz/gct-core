import {
  AccommodationProviderCapability,
  AccommodationProviderCapabilityType,
  ProviderCapabilitySet,
} from "../../../capabilities";
import { Accommodation } from "../../../models";
import {
  AccommodationContentResult,
  AccommodationDetailsResult,
  AccommodationImageResult,
  AccommodationResultMetadata,
  AccommodationSearchResult,
} from "../../../results";
import {
  AccommodationRateRevalidationRequest,
  AccommodationRateRevalidationResult,
} from "../../../revalidation";
import {
  AccommodationBookingRequest,
  AccommodationBookingResult,
} from "../../../booking";
import {
  AccommodationCancellationRequest,
  AccommodationCancellationResult,
} from "../../../cancellation";
import {
  AccommodationBookingModificationRequest,
  AccommodationBookingModificationResult,
} from "../../../modification";
import {
  AccommodationRate,
  AccommodationRateResult,
  AccommodationRateStatus,
  AccommodationRateType,
} from "../../../rates";
import { AccommodationSearchCriteria } from "../../../discovery";

import { AccommodationProvider } from "../../accommodation-provider";
import {
  HotelMapper,
  HotelbedsAvailabilityMappingResult,
  HotelbedsAvailabilityResponseMapper,
  mapHotelbedsCheckRateResponse,
} from "../mapper";
import {
  DefaultHotelbedsAvailabilityExecutor,
  DefaultHotelbedsClient,
  HotelbedsAvailabilityExecutionResult,
  HotelbedsAvailabilityExecutor,
  HotelbedsAvailabilityRequest,
  HotelbedsClient,
  HotelbedsRequest,
} from "../client";
import { HotelbedsHotel, HotelbedsRate } from "../models";

function parseAmount(value: string | undefined): number {
  if (!value) {
    return 0;
  }

  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mapRateType(_rate: HotelbedsRate): AccommodationRateType {
  return AccommodationRateType.PUBLIC;
}

function mapRateStatus(rate: HotelbedsRate): AccommodationRateStatus {
  if (typeof rate.allotment !== "number") {
    return AccommodationRateStatus.UNKNOWN;
  }

  if (rate.allotment <= 0) {
    return AccommodationRateStatus.UNAVAILABLE;
  }

  if (rate.allotment <= 3) {
    return AccommodationRateStatus.LIMITED;
  }

  return AccommodationRateStatus.AVAILABLE;
}

function mapRate(
  rate: HotelbedsRate,
  defaultCurrency: AccommodationRateResult["rates"][number]["currency"],
): AccommodationRate {
  return {
    id: rate.rateKey ?? "unknown-rate",
    type: mapRateType(rate),
    status: mapRateStatus(rate),
    currency: defaultCurrency,
    amount: parseAmount(rate.sellingRate ?? rate.net),
    boardCode: rate.boardCode,
    boardName: rate.boardName,
  };
}

export interface HotelbedsAccommodationMapper {
  mapHotel(hotel: HotelbedsHotel): Accommodation;
}

export interface HotelbedsAvailabilityMapper {
  mapAvailabilityResponse(rawResponses: ReadonlyArray<HotelbedsAvailabilityExecutionResult["responses"][number]>): HotelbedsAvailabilityMappingResult;
}

function createMetadata(): AccommodationResultMetadata {
  return {
    provider: "hotelbeds",
    generatedAt: new Date(),
    version: "1.0.0",
  };
}

function createCapability(
  type: AccommodationProviderCapabilityType,
  name: string,
  description: string,
): AccommodationProviderCapability {
  return {
    identifier: `hotelbeds.${type.toLowerCase()}.v1`,
    type,
    name,
    description,
    version: "1.0.0",
    enabled: true,
    deprecated: false,
    experimental: false,
    features: {
      features: [],
    },
  };
}

function createCapabilities(): ProviderCapabilitySet {
  return {
    capabilities: [
      createCapability(
        AccommodationProviderCapabilityType.SEARCH,
        "Hotel Search",
        "Searches Hotelbeds accommodation content via the provider client.",
      ),
      createCapability(
        AccommodationProviderCapabilityType.DETAILS,
        "Hotel Details",
        "Retrieves Hotelbeds accommodation details via the provider client.",
      ),
      createCapability(
        AccommodationProviderCapabilityType.AVAILABILITY,
        "Hotel Availability",
        "Executes Hotelbeds real-time accommodation availability requests.",
      ),
      createCapability(
        AccommodationProviderCapabilityType.CONTENT,
        "Hotel Content",
        "Retrieves Hotelbeds content payloads via the provider client.",
      ),
      createCapability(
        AccommodationProviderCapabilityType.IMAGES,
        "Hotel Images",
        "Retrieves Hotelbeds image payloads via the provider client.",
      ),
      createCapability(
        AccommodationProviderCapabilityType.RATES,
        "Hotel Rates",
        "Retrieves Hotelbeds rate payloads via the provider client.",
      ),
      createCapability(
        AccommodationProviderCapabilityType.REVALIDATION,
        "Hotel Rate Revalidation",
        "Revalidates selected Hotelbeds rates through CheckRate.",
      ),
      createCapability(
        AccommodationProviderCapabilityType.BOOKING,
        "Hotel Accommodation Booking",
        "Creates Hotelbeds accommodation bookings for selected offers.",
      ),
      createCapability(
        AccommodationProviderCapabilityType.CANCELLATION,
        "Hotel Accommodation Cancellation",
        "Cancels confirmed Hotelbeds accommodation bookings.",
      ),
      createCapability(
        AccommodationProviderCapabilityType.MODIFICATION,
        "Hotel Accommodation Booking Modification",
        "Modifies confirmed Hotelbeds accommodation bookings.",
      ),
    ],
  };
}

function createRequest(operation: HotelbedsRequest["operation"], path: string): HotelbedsRequest {
  return {
    operation,
    method: "GET",
    path,
  };
}

export class HotelbedsProvider implements AccommodationProvider {
  public readonly providerId = "hotelbeds";
  public readonly capabilities = createCapabilities();

  public constructor(
    private readonly client: HotelbedsClient = new DefaultHotelbedsClient(),
    private readonly mapper: HotelbedsAccommodationMapper = new HotelMapper(),
    private readonly availabilityExecutor: HotelbedsAvailabilityExecutor =
      new DefaultHotelbedsAvailabilityExecutor(),
    private readonly availabilityMapper: HotelbedsAvailabilityMapper =
      new HotelbedsAvailabilityResponseMapper(),
  ) {}

  public async search(criteria: AccommodationSearchCriteria): Promise<AccommodationSearchResult> {
    const response = await this.client.searchHotels({
      ...createRequest("search", "/hotels"),
      query: {
        destination: criteria.destination,
        checkInDate: criteria.checkInDate.toISOString(),
        checkOutDate: criteria.checkOutDate.toISOString(),
        adults: criteria.adults,
        children: criteria.children,
        rooms: criteria.rooms,
      },
    });

    return {
      accommodations: response.data.map((hotel) => this.mapper.mapHotel(hotel)),
      metadata: createMetadata(),
    };
  }

  public async details(providerAccommodationId: string): Promise<AccommodationDetailsResult> {
    const response = await this.client.getHotelDetails(
      createRequest("details", `/hotels/${providerAccommodationId}`),
    );

    return {
      accommodation: this.mapper.mapHotel(response.data),
      metadata: createMetadata(),
    };
  }

  public async content(providerAccommodationId: string): Promise<AccommodationContentResult> {
    const response = await this.client.getHotelContent(
      createRequest("content", `/hotels/${providerAccommodationId}/content`),
    );

    return {
      accommodation: this.mapper.mapHotel(response.data),
      metadata: createMetadata(),
    };
  }

  public async images(providerAccommodationId: string): Promise<AccommodationImageResult> {
    const detailsResult = await this.details(providerAccommodationId);

    return {
      accommodationId: detailsResult.accommodation.identity.id,
      images: detailsResult.accommodation.images,
      metadata: createMetadata(),
    };
  }

  public async rates(query: import("../../../rates").AccommodationRateQuery): Promise<AccommodationRateResult> {
    const response = await this.client.getHotelRates(
      createRequest("rates", `/hotels/${query.identifier}/rates`),
    );

    return {
      accommodationId: query.identifier,
      stayPeriod: query.stayPeriod,
      occupancy: query.occupancy,
      selectionStrategy: query.selectionStrategy,
      rates: response.data.map((rate) => mapRate(rate, query.context.currency)),
      metadata: createMetadata(),
    };
  }

  public async revalidate(
    request: AccommodationRateRevalidationRequest,
  ): Promise<AccommodationRateRevalidationResult> {
    if (request.providerReference.provider !== this.providerId) {
      throw new Error("Hotelbeds provider cannot revalidate a different provider reference.");
    }

    const checkRate = this.client.checkRate;
    if (!checkRate) {
      throw new Error("Hotelbeds client does not support CheckRate.");
    }

    try {
      const response = await checkRate({
        operation: "checkRate",
        method: "POST",
        path: "/hotel-api/1.0/checkrate",
        body: {
          rooms: [{ rateKey: request.providerReference.opaqueReference }],
        },
      });
      const currentRate = mapHotelbedsCheckRateResponse(response.data, request.rate);
      const changed = JSON.stringify(currentRate) !== JSON.stringify(request.rate);

      if (currentRate.status === "UNAVAILABLE") {
        return Object.freeze({
          status: "UNAVAILABLE",
          accommodation: request.accommodation,
          room: request.room,
          previousRate: request.rate,
          packageStopId: request.packageStopId,
          provider: this.providerId,
        });
      }

      return Object.freeze({
        status: changed ? "CHANGED" : "VALID",
        accommodation: request.accommodation,
        room: request.room,
        previousRate: request.rate,
        currentRate,
        packageStopId: request.packageStopId,
        provider: this.providerId,
      });
    } catch (error) {
      const code = error instanceof Error && typeof (error as Error & { code?: unknown }).code === "string"
        ? (error as Error & { code: string }).code
        : "CHECK_RATE_FAILED";
      const unavailable = code === "NOT_FOUND" || code === "VALIDATION_ERROR";
      return Object.freeze({
        status: unavailable ? "UNAVAILABLE" : "FAILED",
        accommodation: request.accommodation,
        room: request.room,
        previousRate: request.rate,
        packageStopId: request.packageStopId,
        provider: this.providerId,
        error: Object.freeze({
          code,
          message: error instanceof Error ? error.message : "Hotelbeds CheckRate failed.",
        }),
      });
    }
  }

  public async executeAvailabilityRequests(
    requests: ReadonlyArray<HotelbedsAvailabilityRequest>,
  ): Promise<HotelbedsAvailabilityExecutionResult> {
    return this.availabilityExecutor.execute(requests);
  }

  public mapAvailabilityResponse(
    rawResponses: ReadonlyArray<HotelbedsAvailabilityExecutionResult["responses"][number]>,
  ): HotelbedsAvailabilityMappingResult {
    return this.availabilityMapper.mapAvailabilityResponse(rawResponses);
  }

  public async book(request: AccommodationBookingRequest): Promise<AccommodationBookingResult> {
    if (request.providerReference.provider !== this.providerId) {
      throw new Error("Hotelbeds provider cannot book a different provider reference.");
    }

    const book = this.client.book;
    if (!book) throw new Error("Hotelbeds client does not support Booking.");

    const rooms = request.occupancy.rooms.map((_occupancy, roomIndex) => ({
      rateKey: request.providerReference.opaqueReference,
      paxes: request.guests
        .filter((guest) => guest.roomIndex === roomIndex)
        .map((guest) => ({
          type: guest.type === "CHILD" ? "CH" : "AD",
          name: guest.firstName,
          surname: guest.lastName,
          ...(guest.age === undefined ? {} : { age: guest.age }),
        })),
    }));

    try {
      const response = await book({
        operation: "booking",
        method: "POST",
        path: "/hotel-api/1.0/bookings",
        body: {
          stay: {
            checkIn: request.stayPeriod.checkIn.toISOString().slice(0, 10),
            checkOut: request.stayPeriod.checkOut.toISOString().slice(0, 10),
          },
          holder: {
            name: request.holder.firstName,
            surname: request.holder.lastName,
            email: request.holder.email,
            ...(request.holder.phone ? { phone: request.holder.phone } : {}),
          },
          rooms,
          clientReference: request.idempotencyKey,
        },
      });
      const bookingReference = findString(response.data, ["reference", "bookingReference", "confirmationNumber"]);
      if (!bookingReference) {
        return createBookingFailure(request, "UNKNOWN_BOOKING_OUTCOME", "Hotelbeds returned no booking confirmation reference.", "UNKNOWN");
      }

      const supplierPrice = findPrice(response.data) ?? {
        amount: request.rate.pricing.amount,
        currency: request.rate.pricing.currency,
      };
      return Object.freeze({
        successful: true,
        status: "CONFIRMED",
        provider: this.providerId,
        accommodation: request.accommodation,
        room: request.room,
        rate: request.rate,
        supplierBookingReference: bookingReference,
        supplierPrice: Object.freeze(supplierPrice),
        packageStopId: request.packageStopId,
        errors: Object.freeze([]),
        warnings: Object.freeze([]),
      });
    } catch (error) {
      const code = error instanceof Error && typeof (error as Error & { code?: unknown }).code === "string"
        ? (error as Error & { code: string }).code
        : "BOOKING_FAILED";
      const unknownOutcome = code === "TIMEOUT" || code === "NETWORK_ERROR" || code === "UNKNOWN_ERROR";
      return createBookingFailure(
        request,
        code,
        error instanceof Error ? error.message : "Hotelbeds booking failed.",
        unknownOutcome ? "UNKNOWN" : "FAILED",
      );
    }
  }

  public async cancelAccommodation(
    request: AccommodationCancellationRequest,
  ): Promise<AccommodationCancellationResult> {
    if (request.provider !== this.providerId) {
      throw new Error("Hotelbeds provider cannot cancel a different provider booking.");
    }

    const cancel = this.client.cancel;
    if (!cancel) throw new Error("Hotelbeds client does not support cancellation.");

    try {
      const response = await cancel({
        operation: "cancellation",
        method: "POST",
        path: "/hotel-api/1.0/bookings",
        body: {
          reference: request.supplierBookingReference,
          cancellation: true,
          clientReference: request.idempotencyKey,
        },
      });
      const responseObject = asObject(response.data);
      const status = readString(responseObject, ["status", "cancellationStatus"]);
      const alreadyCancelled = status?.toUpperCase().includes("CANCEL") &&
        status.toUpperCase().includes("ALREADY");
      const charge = mapCancellationCharge(response.data);

      return Object.freeze({
        successful: true,
        status: alreadyCancelled ? "ALREADY_CANCELLED" : "CANCELLED",
        reservationId: request.reservationId,
        provider: this.providerId,
        supplierBookingReference: request.supplierBookingReference,
        charge,
        cancelledAt: new Date(),
        packageStopId: request.packageStopId,
        errors: Object.freeze([]),
        warnings: Object.freeze([]),
      });
    } catch (error) {
      const code = error instanceof Error && typeof (error as Error & { code?: unknown }).code === "string"
        ? (error as Error & { code: string }).code
        : "CANCELLATION_FAILED";
      const unknown = code === "TIMEOUT" || code === "NETWORK_ERROR" || code === "UNKNOWN_ERROR";
      return Object.freeze({
        successful: false,
        status: unknown ? "UNKNOWN" : "FAILED",
        reservationId: request.reservationId,
        provider: this.providerId,
        supplierBookingReference: request.supplierBookingReference,
        packageStopId: request.packageStopId,
        errors: Object.freeze([{ code, message: error instanceof Error ? error.message : "Hotelbeds cancellation failed." }]),
        warnings: Object.freeze([]),
      });
    }
  }

  public async modifyBooking(
    request: AccommodationBookingModificationRequest,
  ): Promise<AccommodationBookingModificationResult> {
    if (request.provider !== this.providerId) throw new Error("Hotelbeds provider cannot modify a different provider booking.");
    const modify = this.client.modify;
    if (!modify) {
      return createModificationFailure(request, "UNSUPPORTED", "Hotelbeds modification is not supported by this client.");
    }

    const change = request.changes;
    const body: Record<string, unknown> = {
      reference: request.supplierBookingReference,
      clientReference: request.idempotencyKey,
    };
    if (change.stayPeriod) {
      body.stay = {
        checkIn: change.stayPeriod.checkIn.toISOString().slice(0, 10),
        checkOut: change.stayPeriod.checkOut.toISOString().slice(0, 10),
      };
    }
    if (change.holder) {
      body.holder = {
        name: change.holder.firstName,
        surname: change.holder.lastName,
        email: change.holder.email,
        ...(change.holder.phone ? { phone: change.holder.phone } : {}),
      };
    }
    if (change.occupancy || change.guests) {
      const occupancy = change.occupancy ?? request.currentOccupancy;
      body.rooms = occupancy?.rooms.map((_room, roomIndex) => ({
        ...(change.rate?.reference.opaqueReference || request.currentRate?.reference.opaqueReference
          ? { rateKey: change.rate?.reference.opaqueReference ?? request.currentRate?.reference.opaqueReference } : {}),
        paxes: (change.guests ?? []).filter((guest) => guest.roomIndex === roomIndex).map((guest) => ({
          type: guest.type === "CHILD" ? "CH" : "AD",
          name: guest.firstName,
          surname: guest.lastName,
          ...(guest.age === undefined ? {} : { age: guest.age }),
        })),
      }));
    }
    if (change.room) body.room = { code: change.room.reference.opaqueReference };
    if (change.rate) body.rateKey = change.rate.reference.opaqueReference;

    try {
      const response = await modify({ operation: "modification", method: "POST", path: "/hotel-api/1.0/bookings", body });
      const responseData = asObject(response.data);
      const resultingRate = request.changes.rate ?? request.currentRate;
      const resultingRoom = request.changes.room ?? request.currentRoom;
      return Object.freeze({
        successful: true,
        status: "MODIFIED",
        reservationId: request.reservationId,
        provider: this.providerId,
        supplierBookingReference: readString(responseData, ["reference", "bookingReference"]) ?? request.supplierBookingReference,
        accommodation: request.accommodation,
        room: resultingRoom,
        rate: resultingRate,
        stayPeriod: request.changes.stayPeriod ?? undefined,
        occupancy: request.changes.occupancy,
        guests: request.changes.guests,
        holder: request.changes.holder,
        supplierPrice: mapSupplierPrice(response.data),
        modificationCharge: mapModificationCharge(response.data),
        packageStopId: request.packageStopId,
        errors: Object.freeze([]),
        warnings: Object.freeze([]),
      });
    } catch (error) {
      const code = error instanceof Error && typeof (error as Error & { code?: unknown }).code === "string"
        ? (error as Error & { code: string }).code : "MODIFICATION_FAILED";
      const unknown = code === "TIMEOUT" || code === "NETWORK_ERROR" || code === "UNKNOWN_ERROR";
      return createModificationFailure(request, unknown ? "UNKNOWN" : "FAILED", error instanceof Error ? error.message : "Hotelbeds modification failed.", code);
    }
  }
}

function asObject(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : undefined;
}

function readString(value: Record<string, unknown> | undefined, keys: ReadonlyArray<string>): string | undefined {
  if (!value) return undefined;
  for (const key of keys) if (typeof value[key] === "string") return value[key] as string;
  return undefined;
}

function mapCancellationCharge(value: unknown): { readonly amount: number; readonly currency: string; readonly description?: string } | undefined {
  const object = asObject(value);
  if (!object) return undefined;
  const charge = asObject(object.cancellationAmount) ?? asObject(object.cancellationFee) ?? object;
  const amountValue = charge.amount ?? charge.value ?? charge.cancellationAmount;
  const currency = charge.currency ?? object.currency;
  const amount = Number.parseFloat(String(amountValue));
  if (!Number.isFinite(amount) || typeof currency !== "string") return undefined;
  return Object.freeze({
    amount,
    currency,
    description: typeof charge.description === "string" ? charge.description : undefined,
  });
}

function findString(value: unknown, keys: ReadonlyArray<string>): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const object = value as Record<string, unknown>;
  for (const key of keys) if (typeof object[key] === "string" && object[key]) return object[key] as string;
  for (const child of Object.values(object)) {
    if (Array.isArray(child)) {
      for (const item of child) { const found = findString(item, keys); if (found) return found; }
    } else { const found = findString(child, keys); if (found) return found; }
  }
  return undefined;
}

function findPrice(value: unknown): { readonly amount: number; readonly currency: string } | undefined {
  if (!value || typeof value !== "object") return undefined;
  const object = value as Record<string, unknown>;
  const amount = object.totalSellingRate ?? object.totalNet ?? object.amount ?? object.net;
  const currency = object.currency;
  if ((typeof amount === "number" || typeof amount === "string") && typeof currency === "string") {
    const parsed = Number.parseFloat(String(amount));
    if (Number.isFinite(parsed)) return { amount: parsed, currency };
  }
  for (const child of Object.values(object)) {
    const found = findPrice(child);
    if (found) return found;
  }
  return undefined;
}

function createBookingFailure(
  request: AccommodationBookingRequest,
  code: string,
  message: string,
  status: "FAILED" | "UNKNOWN",
): AccommodationBookingResult {
  return Object.freeze({
    successful: false,
    status,
    provider: "hotelbeds",
    accommodation: request.accommodation,
    room: request.room,
    rate: request.rate,
    packageStopId: request.packageStopId,
    errors: Object.freeze([{ code, message }]),
    warnings: Object.freeze([]),
  });
}

function createModificationFailure(
  request: AccommodationBookingModificationRequest,
  status: "FAILED" | "UNKNOWN" | "UNSUPPORTED",
  message: string,
  code: string = status,
): AccommodationBookingModificationResult {
  return Object.freeze({
    successful: false,
    status,
    reservationId: request.reservationId,
    provider: "hotelbeds",
    supplierBookingReference: request.supplierBookingReference,
    packageStopId: request.packageStopId,
    errors: Object.freeze([{ code, message }]),
    warnings: Object.freeze([]),
  });
}

function mapSupplierPrice(value: unknown): { readonly amount: number; readonly currency: string } | undefined {
  const object = asObject(value);
  if (!object) return undefined;
  const amount = object.totalSellingRate ?? object.totalNet ?? object.amount;
  const currency = object.currency;
  const parsed = Number.parseFloat(String(amount));
  return Number.isFinite(parsed) && typeof currency === "string" ? Object.freeze({ amount: parsed, currency }) : undefined;
}

function mapModificationCharge(value: unknown): { readonly amount: number; readonly currency: string; readonly description?: string } | undefined {
  const object = asObject(value);
  if (!object) return undefined;
  const charge = asObject(object.modificationCharge) ?? asObject(object.charge);
  if (!charge) return undefined;
  const amount = Number.parseFloat(String(charge.amount));
  return Number.isFinite(amount) && typeof charge.currency === "string"
    ? Object.freeze({ amount, currency: charge.currency, description: typeof charge.description === "string" ? charge.description : undefined })
    : undefined;
}