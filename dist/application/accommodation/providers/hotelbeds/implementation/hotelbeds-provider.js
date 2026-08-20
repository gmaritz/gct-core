"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelbedsProvider = void 0;
const capabilities_1 = require("../../../capabilities");
const rates_1 = require("../../../rates");
const mapper_1 = require("../mapper");
const client_1 = require("../client");
function parseAmount(value) {
    if (!value) {
        return 0;
    }
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
}
function mapRateType(_rate) {
    return rates_1.AccommodationRateType.PUBLIC;
}
function mapRateStatus(rate) {
    if (typeof rate.allotment !== "number") {
        return rates_1.AccommodationRateStatus.UNKNOWN;
    }
    if (rate.allotment <= 0) {
        return rates_1.AccommodationRateStatus.UNAVAILABLE;
    }
    if (rate.allotment <= 3) {
        return rates_1.AccommodationRateStatus.LIMITED;
    }
    return rates_1.AccommodationRateStatus.AVAILABLE;
}
function mapRate(rate, defaultCurrency) {
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
function createMetadata() {
    return {
        provider: "hotelbeds",
        generatedAt: new Date(),
        version: "1.0.0",
    };
}
function createCapability(type, name, description) {
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
function createCapabilities() {
    return {
        capabilities: [
            createCapability(capabilities_1.AccommodationProviderCapabilityType.SEARCH, "Hotel Search", "Searches Hotelbeds accommodation content via the provider client."),
            createCapability(capabilities_1.AccommodationProviderCapabilityType.DETAILS, "Hotel Details", "Retrieves Hotelbeds accommodation details via the provider client."),
            createCapability(capabilities_1.AccommodationProviderCapabilityType.AVAILABILITY, "Hotel Availability", "Executes Hotelbeds real-time accommodation availability requests."),
            createCapability(capabilities_1.AccommodationProviderCapabilityType.CONTENT, "Hotel Content", "Retrieves Hotelbeds content payloads via the provider client."),
            createCapability(capabilities_1.AccommodationProviderCapabilityType.IMAGES, "Hotel Images", "Retrieves Hotelbeds image payloads via the provider client."),
            createCapability(capabilities_1.AccommodationProviderCapabilityType.RATES, "Hotel Rates", "Retrieves Hotelbeds rate payloads via the provider client."),
            createCapability(capabilities_1.AccommodationProviderCapabilityType.REVALIDATION, "Hotel Rate Revalidation", "Revalidates selected Hotelbeds rates through CheckRate."),
            createCapability(capabilities_1.AccommodationProviderCapabilityType.BOOKING, "Hotel Accommodation Booking", "Creates Hotelbeds accommodation bookings for selected offers."),
            createCapability(capabilities_1.AccommodationProviderCapabilityType.CANCELLATION, "Hotel Accommodation Cancellation", "Cancels confirmed Hotelbeds accommodation bookings."),
            createCapability(capabilities_1.AccommodationProviderCapabilityType.MODIFICATION, "Hotel Accommodation Booking Modification", "Modifies confirmed Hotelbeds accommodation bookings."),
        ],
    };
}
function createRequest(operation, path) {
    return {
        operation,
        method: "GET",
        path,
    };
}
class HotelbedsProvider {
    constructor(client = new client_1.DefaultHotelbedsClient(), mapper = new mapper_1.HotelMapper(), availabilityExecutor = new client_1.DefaultHotelbedsAvailabilityExecutor(), availabilityMapper = new mapper_1.HotelbedsAvailabilityResponseMapper()) {
        this.client = client;
        this.mapper = mapper;
        this.availabilityExecutor = availabilityExecutor;
        this.availabilityMapper = availabilityMapper;
        this.providerId = "hotelbeds";
        this.capabilities = createCapabilities();
    }
    async search(criteria) {
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
    async details(providerAccommodationId) {
        const response = await this.client.getHotelDetails(createRequest("details", `/hotels/${providerAccommodationId}`));
        return {
            accommodation: this.mapper.mapHotel(response.data),
            metadata: createMetadata(),
        };
    }
    async content(providerAccommodationId) {
        const response = await this.client.getHotelContent(createRequest("content", `/hotels/${providerAccommodationId}/content`));
        return {
            accommodation: this.mapper.mapHotel(response.data),
            metadata: createMetadata(),
        };
    }
    async images(providerAccommodationId) {
        const detailsResult = await this.details(providerAccommodationId);
        return {
            accommodationId: detailsResult.accommodation.identity.id,
            images: detailsResult.accommodation.images,
            metadata: createMetadata(),
        };
    }
    async rates(query) {
        const response = await this.client.getHotelRates(createRequest("rates", `/hotels/${query.identifier}/rates`));
        return {
            accommodationId: query.identifier,
            stayPeriod: query.stayPeriod,
            occupancy: query.occupancy,
            selectionStrategy: query.selectionStrategy,
            rates: response.data.map((rate) => mapRate(rate, query.context.currency)),
            metadata: createMetadata(),
        };
    }
    async revalidate(request) {
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
            const currentRate = (0, mapper_1.mapHotelbedsCheckRateResponse)(response.data, request.rate);
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
        }
        catch (error) {
            const code = error instanceof Error && typeof error.code === "string"
                ? error.code
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
    async executeAvailabilityRequests(requests) {
        return this.availabilityExecutor.execute(requests);
    }
    mapAvailabilityResponse(rawResponses) {
        return this.availabilityMapper.mapAvailabilityResponse(rawResponses);
    }
    async book(request) {
        if (request.providerReference.provider !== this.providerId) {
            throw new Error("Hotelbeds provider cannot book a different provider reference.");
        }
        const book = this.client.book;
        if (!book)
            throw new Error("Hotelbeds client does not support Booking.");
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
        }
        catch (error) {
            const code = error instanceof Error && typeof error.code === "string"
                ? error.code
                : "BOOKING_FAILED";
            const unknownOutcome = code === "TIMEOUT" || code === "NETWORK_ERROR" || code === "UNKNOWN_ERROR";
            return createBookingFailure(request, code, error instanceof Error ? error.message : "Hotelbeds booking failed.", unknownOutcome ? "UNKNOWN" : "FAILED");
        }
    }
    async cancelAccommodation(request) {
        if (request.provider !== this.providerId) {
            throw new Error("Hotelbeds provider cannot cancel a different provider booking.");
        }
        const cancel = this.client.cancel;
        if (!cancel)
            throw new Error("Hotelbeds client does not support cancellation.");
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
        }
        catch (error) {
            const code = error instanceof Error && typeof error.code === "string"
                ? error.code
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
    async modifyBooking(request) {
        if (request.provider !== this.providerId)
            throw new Error("Hotelbeds provider cannot modify a different provider booking.");
        const modify = this.client.modify;
        if (!modify) {
            return createModificationFailure(request, "UNSUPPORTED", "Hotelbeds modification is not supported by this client.");
        }
        const change = request.changes;
        const body = {
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
        if (change.room)
            body.room = { code: change.room.reference.opaqueReference };
        if (change.rate)
            body.rateKey = change.rate.reference.opaqueReference;
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
        }
        catch (error) {
            const code = error instanceof Error && typeof error.code === "string"
                ? error.code : "MODIFICATION_FAILED";
            const unknown = code === "TIMEOUT" || code === "NETWORK_ERROR" || code === "UNKNOWN_ERROR";
            return createModificationFailure(request, unknown ? "UNKNOWN" : "FAILED", error instanceof Error ? error.message : "Hotelbeds modification failed.", code);
        }
    }
}
exports.HotelbedsProvider = HotelbedsProvider;
function asObject(value) {
    return typeof value === "object" && value !== null ? value : undefined;
}
function readString(value, keys) {
    if (!value)
        return undefined;
    for (const key of keys)
        if (typeof value[key] === "string")
            return value[key];
    return undefined;
}
function mapCancellationCharge(value) {
    const object = asObject(value);
    if (!object)
        return undefined;
    const charge = asObject(object.cancellationAmount) ?? asObject(object.cancellationFee) ?? object;
    const amountValue = charge.amount ?? charge.value ?? charge.cancellationAmount;
    const currency = charge.currency ?? object.currency;
    const amount = Number.parseFloat(String(amountValue));
    if (!Number.isFinite(amount) || typeof currency !== "string")
        return undefined;
    return Object.freeze({
        amount,
        currency,
        description: typeof charge.description === "string" ? charge.description : undefined,
    });
}
function findString(value, keys) {
    if (!value || typeof value !== "object")
        return undefined;
    const object = value;
    for (const key of keys)
        if (typeof object[key] === "string" && object[key])
            return object[key];
    for (const child of Object.values(object)) {
        if (Array.isArray(child)) {
            for (const item of child) {
                const found = findString(item, keys);
                if (found)
                    return found;
            }
        }
        else {
            const found = findString(child, keys);
            if (found)
                return found;
        }
    }
    return undefined;
}
function findPrice(value) {
    if (!value || typeof value !== "object")
        return undefined;
    const object = value;
    const amount = object.totalSellingRate ?? object.totalNet ?? object.amount ?? object.net;
    const currency = object.currency;
    if ((typeof amount === "number" || typeof amount === "string") && typeof currency === "string") {
        const parsed = Number.parseFloat(String(amount));
        if (Number.isFinite(parsed))
            return { amount: parsed, currency };
    }
    for (const child of Object.values(object)) {
        const found = findPrice(child);
        if (found)
            return found;
    }
    return undefined;
}
function createBookingFailure(request, code, message, status) {
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
function createModificationFailure(request, status, message, code = status) {
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
function mapSupplierPrice(value) {
    const object = asObject(value);
    if (!object)
        return undefined;
    const amount = object.totalSellingRate ?? object.totalNet ?? object.amount;
    const currency = object.currency;
    const parsed = Number.parseFloat(String(amount));
    return Number.isFinite(parsed) && typeof currency === "string" ? Object.freeze({ amount: parsed, currency }) : undefined;
}
function mapModificationCharge(value) {
    const object = asObject(value);
    if (!object)
        return undefined;
    const charge = asObject(object.modificationCharge) ?? asObject(object.charge);
    if (!charge)
        return undefined;
    const amount = Number.parseFloat(String(charge.amount));
    return Number.isFinite(amount) && typeof charge.currency === "string"
        ? Object.freeze({ amount, currency: charge.currency, description: typeof charge.description === "string" ? charge.description : undefined })
        : undefined;
}
//# sourceMappingURL=hotelbeds-provider.js.map