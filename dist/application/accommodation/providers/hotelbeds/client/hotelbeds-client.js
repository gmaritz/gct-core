"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultHotelbedsClient = void 0;
const hotelbeds_authentication_1 = require("./hotelbeds-authentication");
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
function createResponse(request, data, authentication) {
    return {
        request,
        status: 200,
        data,
        headers: authentication.prepareHeaders(request),
    };
}
class DefaultHotelbedsClient {
    constructor(authentication = new hotelbeds_authentication_1.DefaultHotelbedsAuthentication()) {
        this.authentication = authentication;
    }
    async searchHotels(request) {
        return createResponse(request, [createPlaceholderHotel()], this.authentication);
    }
    async getHotelDetails(request) {
        return createResponse(request, createPlaceholderHotel(), this.authentication);
    }
    async getHotelContent(request) {
        return createResponse(request, createPlaceholderHotel(), this.authentication);
    }
    async getHotelImages(request) {
        return createResponse(request, createPlaceholderHotel().images ?? [], this.authentication);
    }
    async getHotelRates(request) {
        return createResponse(request, createPlaceholderHotel().rooms?.[0]?.rates ?? [], this.authentication);
    }
}
exports.DefaultHotelbedsClient = DefaultHotelbedsClient;
//# sourceMappingURL=hotelbeds-client.js.map