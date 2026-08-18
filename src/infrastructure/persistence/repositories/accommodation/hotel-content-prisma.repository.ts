import { getPrismaClient } from "../../../../bootstrap/prisma";
import {
  HotelContentRecord,
  HotelContentRepository,
  createHotelContentRecord,
} from "../../../../application/accommodation/content";
import { Prisma } from "@prisma/client";

interface PersistedHotelContentPayload {
  readonly description?: string;
  readonly categoryCode?: string;
  readonly categoryName?: string;
  readonly starRating?: number;
  readonly accommodationTypeCode?: string;
  readonly accommodationTypeName?: string;
  readonly destinationCode?: string;
  readonly destinationName?: string;
  readonly coordinates: {
    readonly latitude?: number;
    readonly longitude?: number;
  };
  readonly address?: {
    readonly line1?: string;
    readonly line2?: string;
    readonly city?: string;
    readonly state?: string;
    readonly postalCode?: string;
    readonly countryCode?: string;
    readonly countryName?: string;
  };
  readonly contact?: {
    readonly email?: string;
    readonly phones: ReadonlyArray<string>;
  };
  readonly facilities: ReadonlyArray<{
    readonly code: string;
    readonly name: string;
    readonly groupCode?: string;
    readonly groupName?: string;
  }>;
  readonly images: ReadonlyArray<{
    readonly url: string;
    readonly type?: string;
    readonly order: number;
    readonly description?: string;
  }>;
  readonly active: boolean;
  readonly rawLastUpdate?: string;
}

function toPayload(record: HotelContentRecord): Prisma.InputJsonObject {
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

function fromPayload(
  providerHotelCode: string,
  name: string,
  payload: PersistedHotelContentPayload,
  lastUpdatedAt: Date,
): HotelContentRecord {
  return createHotelContentRecord({
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
    facilities: Object.freeze(
      (payload.facilities ?? []).map((facility) => ({
        code: facility.code,
        name: facility.name,
        groupCode: facility.groupCode,
        groupName: facility.groupName,
      })),
    ),
    images: Object.freeze(
      (payload.images ?? []).map((image) => ({
        url: image.url,
        type: image.type,
        order: image.order,
        description: image.description,
      })),
    ),
    active: payload.active,
    lastUpdatedAt,
    rawLastUpdate: payload.rawLastUpdate,
  });
}

export class HotelContentPrismaRepository implements HotelContentRepository {
  public async upsertMany(records: ReadonlyArray<HotelContentRecord>): Promise<void> {
    const prisma = getPrismaClient();

    await prisma.$transaction(
      records.map((record) =>
        prisma.hotelContent.upsert({
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
        }),
      ),
    );
  }

  public async findByProviderHotelCode(providerHotelCode: string): Promise<HotelContentRecord | null> {
    const prisma = getPrismaClient();
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

    return fromPayload(
      raw.providerHotelCode,
      raw.name,
      raw.payload as unknown as PersistedHotelContentPayload,
      raw.lastUpdatedAt,
    );
  }

  public async all(): Promise<ReadonlyArray<HotelContentRecord>> {
    const prisma = getPrismaClient();
    const rows = await prisma.hotelContent.findMany({
      where: {
        provider: "hotelbeds",
      },
      orderBy: {
        providerHotelCode: "asc",
      },
    });

    return Object.freeze(
      rows.map((row) =>
        fromPayload(
          row.providerHotelCode,
          row.name,
          row.payload as unknown as PersistedHotelContentPayload,
          row.lastUpdatedAt,
        ),
      ),
    );
  }
}
