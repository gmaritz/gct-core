"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHotelContentRecord = createHotelContentRecord;
function cloneAddress(address) {
    if (!address) {
        return undefined;
    }
    return Object.freeze({
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        countryCode: address.countryCode,
        countryName: address.countryName,
    });
}
function cloneContact(contact) {
    if (!contact) {
        return undefined;
    }
    return Object.freeze({
        email: contact.email,
        phones: Object.freeze([...(contact.phones ?? [])]),
    });
}
function createHotelContentRecord(record) {
    return Object.freeze({
        provider: "hotelbeds",
        providerHotelCode: record.providerHotelCode,
        name: record.name,
        description: record.description,
        categoryCode: record.categoryCode,
        categoryName: record.categoryName,
        starRating: record.starRating,
        accommodationTypeCode: record.accommodationTypeCode,
        accommodationTypeName: record.accommodationTypeName,
        destinationCode: record.destinationCode,
        destinationName: record.destinationName,
        coordinates: Object.freeze({
            latitude: record.coordinates.latitude,
            longitude: record.coordinates.longitude,
        }),
        address: cloneAddress(record.address),
        contact: cloneContact(record.contact),
        facilities: Object.freeze((record.facilities ?? []).map((facility) => Object.freeze({
            code: facility.code,
            name: facility.name,
            groupCode: facility.groupCode,
            groupName: facility.groupName,
        }))),
        images: Object.freeze((record.images ?? []).map((image) => Object.freeze({
            url: image.url,
            type: image.type,
            order: image.order,
            description: image.description,
        }))),
        active: record.active,
        lastUpdatedAt: new Date(record.lastUpdatedAt.getTime()),
        rawLastUpdate: record.rawLastUpdate,
    });
}
//# sourceMappingURL=hotel-content-record.js.map