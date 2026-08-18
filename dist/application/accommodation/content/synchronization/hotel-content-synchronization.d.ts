import { HotelbedsGateway } from "../../providers/hotelbeds/client";
import { HotelbedsContentMapper } from "../../providers/hotelbeds/mapper/hotel-content.mapper";
import { HotelContentRecord } from "../models/hotel-content-record";
import { HotelCatalogueRepository } from "../../catalogue";
export type HotelContentSyncType = "FULL" | "INCREMENTAL";
export type HotelContentSyncExecutionStatus = "IDLE" | "RUNNING" | "SUCCEEDED" | "FAILED";
export interface HotelContentSyncState {
    readonly type: HotelContentSyncType;
    readonly executionStatus: HotelContentSyncExecutionStatus;
    readonly lastSuccessfulCheckpoint?: Date;
    readonly processedCount: number;
    readonly failedCount: number;
    readonly batchSize?: number;
    readonly totalSelectedHotels?: number;
    readonly batchesCompleted?: number;
    readonly hotelsProcessed?: number;
    readonly hotelsFailed?: number;
    readonly lastSuccessfulBatch?: number;
    readonly missingHotelCodes?: ReadonlyArray<string>;
    readonly failedBatches?: ReadonlyArray<number>;
    readonly retryCount?: number;
    readonly requestCount?: number;
    readonly elapsedTimeMs?: number;
    readonly startedAt?: Date;
    readonly completedAt?: Date;
    readonly metadata: {
        readonly pagesProcessed: number;
        readonly lastErrorCode?: string;
        readonly lastErrorMessage?: string;
    };
}
export interface HotelContentSyncResult {
    readonly success: boolean;
    readonly type: HotelContentSyncType;
    readonly processedCount: number;
    readonly failedCount: number;
    readonly pagesProcessed: number;
    readonly checkpoint?: Date;
    readonly retryable: boolean;
    readonly errors: ReadonlyArray<{
        readonly code: string;
        readonly message: string;
        readonly retryable: boolean;
    }>;
    readonly selectedHotelCount: number;
    readonly batchCount: number;
    readonly requestCount: number;
    readonly successfulContentRecords: number;
    readonly missingHotelCodes: ReadonlyArray<string>;
    readonly failedBatches: ReadonlyArray<number>;
    readonly retryCount: number;
    readonly elapsedTimeMs: number;
    readonly finalState: HotelContentSyncExecutionStatus;
}
export interface HotelContentRepository {
    upsertMany(records: ReadonlyArray<HotelContentRecord>): Promise<void>;
    findByProviderHotelCode(providerHotelCode: string): Promise<HotelContentRecord | null>;
    all(): Promise<ReadonlyArray<HotelContentRecord>>;
}
export interface HotelContentSyncStateRepository {
    getState(): Promise<HotelContentSyncState | null>;
    saveState(state: HotelContentSyncState): Promise<void>;
}
export interface HotelbedsContentSyncOptions {
    readonly pageSize?: number;
    readonly language?: string;
    readonly checkpoint?: Date;
    readonly requestId?: string;
    readonly correlationId?: string;
    readonly selectedHotelCodes?: ReadonlyArray<string>;
    readonly batchSize?: number;
    readonly maxQps?: number;
    readonly maxRetries?: number;
    readonly retryBaseDelayMs?: number;
}
export interface HotelbedsContentSyncSettings {
    readonly batchSize: number;
    readonly maxQps: number;
    readonly maxRetries: number;
    readonly retryBaseDelayMs: number;
    readonly sleep?: (delayMs: number) => Promise<void>;
}
export declare class InMemoryHotelContentRepository implements HotelContentRepository {
    private readonly records;
    upsertMany(records: ReadonlyArray<HotelContentRecord>): Promise<void>;
    findByProviderHotelCode(providerHotelCode: string): Promise<HotelContentRecord | null>;
    all(): Promise<ReadonlyArray<HotelContentRecord>>;
}
export declare class InMemoryHotelContentSyncStateRepository implements HotelContentSyncStateRepository {
    private state;
    getState(): Promise<HotelContentSyncState | null>;
    saveState(state: HotelContentSyncState): Promise<void>;
}
export declare class HotelbedsContentSynchronizationService {
    private readonly gateway;
    private readonly contentRepository;
    private readonly stateRepository;
    private readonly mapper;
    private readonly selectedHotelCodes;
    private readonly catalogueRepository?;
    private readonly settings;
    constructor(gateway: HotelbedsGateway, contentRepository: HotelContentRepository, stateRepository: HotelContentSyncStateRepository, mapper?: HotelbedsContentMapper, selectedHotelCodes?: ReadonlyArray<string>, catalogueRepository?: HotelCatalogueRepository | undefined, settings?: HotelbedsContentSyncSettings);
    synchronizeFull(options?: HotelbedsContentSyncOptions): Promise<HotelContentSyncResult>;
    synchronizeIncremental(options?: HotelbedsContentSyncOptions): Promise<HotelContentSyncResult>;
    private synchronize;
}
//# sourceMappingURL=hotel-content-synchronization.d.ts.map