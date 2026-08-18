import { HotelContentRecord, HotelContentRepository } from "../../../../application/accommodation/content";
export declare class HotelContentPrismaRepository implements HotelContentRepository {
    upsertMany(records: ReadonlyArray<HotelContentRecord>): Promise<void>;
    findByProviderHotelCode(providerHotelCode: string): Promise<HotelContentRecord | null>;
    all(): Promise<ReadonlyArray<HotelContentRecord>>;
}
//# sourceMappingURL=hotel-content-prisma.repository.d.ts.map