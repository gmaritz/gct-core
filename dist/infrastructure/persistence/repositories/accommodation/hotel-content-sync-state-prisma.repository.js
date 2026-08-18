"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelContentSyncStatePrismaRepository = void 0;
const prisma_1 = require("../../../../bootstrap/prisma");
const SYNC_KEY = "hotelbeds-content";
function toJson(state) {
    return {
        type: state.type,
        executionStatus: state.executionStatus,
        lastSuccessfulCheckpoint: state.lastSuccessfulCheckpoint
            ? state.lastSuccessfulCheckpoint.toISOString()
            : null,
        processedCount: state.processedCount,
        failedCount: state.failedCount,
        batchSize: state.batchSize,
        totalSelectedHotels: state.totalSelectedHotels,
        batchesCompleted: state.batchesCompleted,
        hotelsProcessed: state.hotelsProcessed,
        hotelsFailed: state.hotelsFailed,
        lastSuccessfulBatch: state.lastSuccessfulBatch,
        missingHotelCodes: state.missingHotelCodes,
        failedBatches: state.failedBatches,
        retryCount: state.retryCount,
        requestCount: state.requestCount,
        elapsedTimeMs: state.elapsedTimeMs,
        startedAt: state.startedAt ? state.startedAt.toISOString() : null,
        completedAt: state.completedAt ? state.completedAt.toISOString() : null,
        metadata: {
            pagesProcessed: state.metadata.pagesProcessed,
            lastErrorCode: state.metadata.lastErrorCode,
            lastErrorMessage: state.metadata.lastErrorMessage,
        },
    };
}
function parseDate(value) {
    if (typeof value !== "string" || value.trim().length === 0) {
        return undefined;
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return undefined;
    }
    return parsed;
}
function fromJson(payload) {
    if (!payload || typeof payload !== "object") {
        return null;
    }
    const candidate = payload;
    const metadata = (candidate.metadata ?? {});
    const type = candidate.type;
    const executionStatus = candidate.executionStatus;
    const processedCount = Number(candidate.processedCount ?? 0);
    const failedCount = Number(candidate.failedCount ?? 0);
    if ((type !== "FULL" && type !== "INCREMENTAL") ||
        (executionStatus !== "IDLE" &&
            executionStatus !== "RUNNING" &&
            executionStatus !== "SUCCEEDED" &&
            executionStatus !== "FAILED")) {
        return null;
    }
    return Object.freeze({
        type,
        executionStatus,
        lastSuccessfulCheckpoint: parseDate(candidate.lastSuccessfulCheckpoint),
        processedCount,
        failedCount,
        batchSize: candidate.batchSize === undefined ? undefined : Number(candidate.batchSize),
        totalSelectedHotels: candidate.totalSelectedHotels === undefined ? undefined : Number(candidate.totalSelectedHotels),
        batchesCompleted: candidate.batchesCompleted === undefined ? undefined : Number(candidate.batchesCompleted),
        hotelsProcessed: candidate.hotelsProcessed === undefined ? undefined : Number(candidate.hotelsProcessed),
        hotelsFailed: candidate.hotelsFailed === undefined ? undefined : Number(candidate.hotelsFailed),
        lastSuccessfulBatch: candidate.lastSuccessfulBatch === undefined ? undefined : Number(candidate.lastSuccessfulBatch),
        missingHotelCodes: Array.isArray(candidate.missingHotelCodes) ? candidate.missingHotelCodes.map(String) : [],
        failedBatches: Array.isArray(candidate.failedBatches) ? candidate.failedBatches.map(Number) : [],
        retryCount: candidate.retryCount === undefined ? undefined : Number(candidate.retryCount),
        requestCount: candidate.requestCount === undefined ? undefined : Number(candidate.requestCount),
        elapsedTimeMs: candidate.elapsedTimeMs === undefined ? undefined : Number(candidate.elapsedTimeMs),
        startedAt: parseDate(candidate.startedAt),
        completedAt: parseDate(candidate.completedAt),
        metadata: Object.freeze({
            pagesProcessed: Number(metadata.pagesProcessed ?? 0),
            lastErrorCode: metadata.lastErrorCode,
            lastErrorMessage: metadata.lastErrorMessage,
        }),
    });
}
class HotelContentSyncStatePrismaRepository {
    async getState() {
        const prisma = (0, prisma_1.getPrismaClient)();
        const row = await prisma.hotelContentSyncState.findUnique({
            where: {
                syncKey: SYNC_KEY,
            },
        });
        if (!row) {
            return null;
        }
        return fromJson(row.payload) ?? null;
    }
    async saveState(state) {
        const prisma = (0, prisma_1.getPrismaClient)();
        await prisma.hotelContentSyncState.upsert({
            where: {
                syncKey: SYNC_KEY,
            },
            update: {
                payload: toJson(state),
            },
            create: {
                syncKey: SYNC_KEY,
                payload: toJson(state),
            },
        });
    }
}
exports.HotelContentSyncStatePrismaRepository = HotelContentSyncStatePrismaRepository;
//# sourceMappingURL=hotel-content-sync-state-prisma.repository.js.map