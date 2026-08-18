import { HotelContentSyncState, HotelContentSyncStateRepository } from "../../../../application/accommodation/content";
export declare class HotelContentSyncStatePrismaRepository implements HotelContentSyncStateRepository {
    getState(): Promise<HotelContentSyncState | null>;
    saveState(state: HotelContentSyncState): Promise<void>;
}
//# sourceMappingURL=hotel-content-sync-state-prisma.repository.d.ts.map