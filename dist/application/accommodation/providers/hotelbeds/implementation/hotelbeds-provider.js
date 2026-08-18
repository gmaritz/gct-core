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
            createCapability(capabilities_1.AccommodationProviderCapabilityType.CONTENT, "Hotel Content", "Retrieves Hotelbeds content payloads via the provider client."),
            createCapability(capabilities_1.AccommodationProviderCapabilityType.IMAGES, "Hotel Images", "Retrieves Hotelbeds image payloads via the provider client."),
            createCapability(capabilities_1.AccommodationProviderCapabilityType.RATES, "Hotel Rates", "Retrieves Hotelbeds rate payloads via the provider client."),
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
    async executeAvailabilityRequests(requests) {
        return this.availabilityExecutor.execute(requests);
    }
    mapAvailabilityResponse(rawResponses) {
        return this.availabilityMapper.mapAvailabilityResponse(rawResponses);
    }
}
exports.HotelbedsProvider = HotelbedsProvider;
//# sourceMappingURL=hotelbeds-provider.js.map