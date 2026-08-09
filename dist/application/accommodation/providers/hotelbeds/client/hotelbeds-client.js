"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultHotelbedsClient = void 0;
const hotelbeds_gateway_1 = require("./hotelbeds-gateway");
const hotelbeds_integration_error_1 = require("./hotelbeds-integration-error");
function createPlaceholderHotel() {
    return {
        code: 1000,
        name: "Hotelbeds Placeholder Hotel",
        categoryCode: "4EST",
        categoryName: "4 STARS",
        destinationCode: "CPT",
        destinationName: "Cape Town",
        zoneName: "Placeholder Zone",
        latitude: "-33.9249",
        longitude: "18.4241",
        address: {
            email: "placeholder@hotelbeds.local",
            phones: ["+27-21-000-0000"],
            countryCode: "ZA",
            city: "Cape Town",
        },
        facilities: [
            {
                facilityName: "Wi-Fi",
            },
        ],
        images: [
            {
                path: "https://cdn.gct.local/hotelbeds/placeholder/hero.jpg",
                order: 1,
                description: [{ content: "Hotelbeds placeholder image" }],
            },
        ],
        rooms: [
            {
                code: "DBL.ST",
                name: "DOUBLE STANDARD",
                rates: [
                    {
                        rateKey: "placeholder-rate-key",
                        rateClass: "NOR",
                        rateType: "BOOKABLE",
                        net: "100.00",
                        boardCode: "RO",
                        boardName: "ROOM ONLY",
                    },
                ],
            },
        ],
    };
}
function createResponse(request, data, status = 200) {
    return {
        request,
        status,
        data,
    };
}
function toClientError(request, code, message) {
    const error = new Error(`Hotelbeds ${request.operation} failed: ${message}`);
    error.code = code;
    return error;
}
async function executeAndUnwrap(gateway, request) {
    const result = await gateway.execute(request);
    if (!result.success || result.data === null) {
        const firstError = result.errors[0];
        const code = firstError?.code ?? hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.UNKNOWN_ERROR;
        const message = firstError?.message ?? "Unknown Hotelbeds provider failure.";
        throw toClientError(request, code, message);
    }
    return createResponse(request, result.data, result.providerResponse?.status ?? 200);
}
class DefaultHotelbedsClient {
    constructor(gateway = new hotelbeds_gateway_1.DefaultHotelbedsGateway()) {
        this.gateway = gateway;
    }
    async searchHotels(request) {
        if (request.path.startsWith("/placeholder")) {
            return createResponse(request, [createPlaceholderHotel()]);
        }
        return executeAndUnwrap(this.gateway, request);
    }
    async getHotelDetails(request) {
        if (request.path.startsWith("/placeholder")) {
            return createResponse(request, createPlaceholderHotel());
        }
        return executeAndUnwrap(this.gateway, request);
    }
    async getHotelContent(request) {
        if (request.path.startsWith("/placeholder")) {
            return createResponse(request, createPlaceholderHotel());
        }
        return executeAndUnwrap(this.gateway, request);
    }
    async getHotelImages(request) {
        if (request.path.startsWith("/placeholder")) {
            return createResponse(request, createPlaceholderHotel().images ?? []);
        }
        return executeAndUnwrap(this.gateway, request);
    }
    async getHotelRates(request) {
        if (request.path.startsWith("/placeholder")) {
            return createResponse(request, createPlaceholderHotel().rooms?.[0]?.rates ?? []);
        }
        return executeAndUnwrap(this.gateway, request);
    }
}
exports.DefaultHotelbedsClient = DefaultHotelbedsClient;
//# sourceMappingURL=hotelbeds-client.js.map