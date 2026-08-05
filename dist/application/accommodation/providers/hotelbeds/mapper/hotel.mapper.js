"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelMapper = void 0;
const address_mapper_1 = require("./address.mapper");
const facility_mapper_1 = require("./facility.mapper");
const identity_mapper_1 = require("./identity.mapper");
const image_mapper_1 = require("./image.mapper");
const location_mapper_1 = require("./location.mapper");
const provider_reference_mapper_1 = require("./provider-reference.mapper");
const rating_mapper_1 = require("./rating.mapper");
function mapHotelbedsCategory(hotel) {
    const categoryValue = hotel.accommodationTypeName ?? hotel.categoryName ?? hotel.accommodationTypeCode ?? hotel.categoryCode ?? "";
    return categoryValue;
}
function buildLocationSource(hotel) {
    if (hotel.location) {
        return hotel.location;
    }
    if (hotel.latitude === undefined &&
        hotel.longitude === undefined &&
        hotel.destinationCode === undefined &&
        hotel.destinationName === undefined &&
        hotel.zoneCode === undefined &&
        hotel.zoneName === undefined) {
        return undefined;
    }
    return {
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        destinationCode: hotel.destinationCode,
        destinationName: hotel.destinationName,
        zoneCode: hotel.zoneCode,
        zoneName: hotel.zoneName,
    };
}
function mapPolicies() {
    return [];
}
class HotelMapper {
    mapHotel(hotel) {
        const contact = (0, address_mapper_1.mapHotelbedsAddress)(hotel.address);
        return {
            identity: (0, identity_mapper_1.mapHotelbedsIdentity)(hotel),
            category: mapHotelbedsCategory(hotel),
            location: (0, location_mapper_1.mapHotelbedsLocation)(buildLocationSource(hotel)),
            rating: (0, rating_mapper_1.mapHotelbedsRating)(hotel),
            images: (0, image_mapper_1.mapHotelbedsImages)(hotel.images),
            amenities: (0, facility_mapper_1.mapHotelbedsFacilities)(hotel.facilities),
            policies: mapPolicies(),
            contacts: contact ? [contact] : [],
            providerReference: (0, provider_reference_mapper_1.mapHotelbedsProviderReference)(hotel),
        };
    }
}
exports.HotelMapper = HotelMapper;
//# sourceMappingURL=hotel.mapper.js.map