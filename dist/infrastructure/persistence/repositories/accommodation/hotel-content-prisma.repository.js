"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelContentPrismaRepository = void 0;
const prisma_1 = require("../../../../bootstrap/prisma");
const content_1 = require("../../../../application/accommodation/content");
function toPayload(record) {
    return {
        description: record.description,
        categoryCode: record.categoryCode,
        categoryName: record.categoryName,
        starRating: record.starRating,
        accommodationTypeCode: record.accommodationTypeCode,
        accommodationTypeName: record.accommodationTypeName,
        destinationCode: record.destinationCode,
        destinationName: record.destinationName,
        coordinates: {
            latitude: record.coordinates.latitude,
            longitude: record.coordinates.longitude,
        },
        address: record.address
            ? {
                line1: record.address.line1,
                line2: record.address.line2,
                city: record.address.city,
                state: record.address.state,
                postalCode: record.address.postalCode,
                countryCode: record.address.countryCode,
                countryName: record.address.countryName,
            }
            : undefined,
        contact: record.contact
            ? {
                email: record.contact.email,
                phones: [...record.contact.phones],
            }
            : undefined,
        facilities: record.facilities.map((facility) => ({
            code: facility.code,
            name: facility.name,
            groupCode: facility.groupCode,
            groupName: facility.groupName,
        })),
        images: record.images.map((image) => ({
            url: image.url,
            type: image.type,
            order: image.order,
            description: image.description,
        })),
        active: record.active,
        rawLastUpdate: record.rawLastUpdate,
    };
}
function fromPayload(providerHotelCode, name, payload, lastUpdatedAt) {
    return (0, content_1.createHotelContentRecord)({
        provider: "hotelbeds",
        providerHotelCode,
        name,
        description: payload.description,
        categoryCode: payload.categoryCode,
        categoryName: payload.categoryName,
        starRating: payload.starRating,
        accommodationTypeCode: payload.accommodationTypeCode,
        accommodationTypeName: payload.accommodationTypeName,
        destinationCode: payload.destinationCode,
        destinationName: payload.destinationName,
        coordinates: {
            latitude: payload.coordinates?.latitude,
            longitude: payload.coordinates?.longitude,
        },
        address: payload.address,
        contact: payload.contact
            ? {
                email: payload.contact.email,
                phones: Object.freeze([...(payload.contact.phones ?? [])]),
            }
            : undefined,
        facilities: Object.freeze((payload.facilities ?? []).map((facility) => ({
            code: facility.code,
            name: facility.name,
            groupCode: facility.groupCode,
            groupName: facility.groupName,
        }))),
        images: Object.freeze((payload.images ?? []).map((image) => ({
            url: image.url,
            type: image.type,
            order: image.order,
            description: image.description,
        }))),
        active: payload.active,
        lastUpdatedAt,
        rawLastUpdate: payload.rawLastUpdate,
    });
}
class HotelContentPrismaRepository {
    async upsertMany(records) {
        const prisma = (0, prisma_1.getPrismaClient)();
        await prisma.$transaction(records.map((record) => prisma.hotelContent.upsert({
            where: {
                provider_providerHotelCode: {
                    provider: record.provider,
                    providerHotelCode: record.providerHotelCode,
                },
            },
            update: {
                name: record.name,
                payload: toPayload(record),
                lastUpdatedAt: record.lastUpdatedAt,
                isActive: record.active,
            },
            create: {
                provider: record.provider,
                providerHotelCode: record.providerHotelCode,
                name: record.name,
                payload: toPayload(record),
                lastUpdatedAt: record.lastUpdatedAt,
                isActive: record.active,
            },
        })));
    }
    async findByProviderHotelCode(providerHotelCode) {
        const prisma = (0, prisma_1.getPrismaClient)();
        const raw = await prisma.hotelContent.findUnique({
            where: {
                provider_providerHotelCode: {
                    provider: "hotelbeds",
                    providerHotelCode,
                },
            },
        });
        if (!raw) {
            return null;
        }
        return fromPayload(raw.providerHotelCode, raw.name, raw.payload, raw.lastUpdatedAt);
    }
    async all() {
        const prisma = (0, prisma_1.getPrismaClient)();
        const rows = await prisma.hotelContent.findMany({
            where: {
                provider: "hotelbeds",
            },
            orderBy: {
                providerHotelCode: "asc",
            },
        });
        return Object.freeze(rows.map((row) => fromPayload(row.providerHotelCode, row.name, row.payload, row.lastUpdatedAt)));
    }
}
exports.HotelContentPrismaRepository = HotelContentPrismaRepository;
//# sourceMappingURL=hotel-content-prisma.repository.js.map