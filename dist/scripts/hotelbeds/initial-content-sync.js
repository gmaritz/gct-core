"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../bootstrap/prisma");
const accommodation_1 = require("../../application/accommodation");
const hotelbeds_1 = require("../../infrastructure/accommodation/hotelbeds");
const hotel_catalogue_prisma_repository_1 = require("../../infrastructure/persistence/repositories/accommodation/hotel-catalogue-prisma.repository");
async function run() {
    const config = (0, accommodation_1.loadHotelbedsIntegrationConfig)();
    const catalogueRepository = new hotel_catalogue_prisma_repository_1.HotelCataloguePrismaRepository();
    const catalogueEntries = await catalogueRepository.findActive();
    if (catalogueEntries.length === 0) {
        throw new Error("Initial Hotelbeds content synchronization aborted: active hotel catalogue is empty.");
    }
    await (0, prisma_1.connectPrisma)();
    try {
        const service = (0, hotelbeds_1.createHotelbedsContentSynchronizationService)();
        const startedAt = Date.now();
        const result = await service.synchronizeFull({
            language: "ENG",
            requestId: "app-008.2-r5-initial-content-sync",
            correlationId: "app-008.2-r5-initial-content-sync",
            batchSize: config.contentBatchSize,
            maxQps: config.contentMaxQps,
            maxRetries: config.contentMaxRetries,
            retryBaseDelayMs: config.contentRetryBaseDelayMs,
        });
        process.stdout.write(`${JSON.stringify({
            catalogueHotelsSelected: result.selectedHotelCount,
            batches: result.batchCount,
            requests: result.requestCount,
            successfulContentRecords: result.successfulContentRecords,
            missingHotelCodes: result.missingHotelCodes,
            failedBatches: result.failedBatches,
            retries: result.retryCount,
            elapsedTimeMs: result.elapsedTimeMs || Date.now() - startedAt,
            finalCheckpoint: result.checkpoint?.toISOString() ?? null,
            finalState: result.finalState,
            success: result.success,
            errors: result.errors,
        }, null, 2)}\n`);
        if (!result.success)
            process.exitCode = 1;
    }
    finally {
        await (0, prisma_1.disconnectPrisma)();
    }
}
void run().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : "Initial synchronization failed."}\n`);
    process.exitCode = 1;
});
//# sourceMappingURL=initial-content-sync.js.map