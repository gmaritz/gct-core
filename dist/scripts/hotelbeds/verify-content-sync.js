"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../bootstrap/prisma");
const accommodation_1 = require("../../application/accommodation");
const hotelbeds_1 = require("../../infrastructure/accommodation/hotelbeds");
const hotel_content_prisma_repository_1 = require("../../infrastructure/persistence/repositories/accommodation/hotel-content-prisma.repository");
const hotel_content_sync_state_prisma_repository_1 = require("../../infrastructure/persistence/repositories/accommodation/hotel-content-sync-state-prisma.repository");
async function run() {
    const config = (0, accommodation_1.loadHotelbedsIntegrationConfig)();
    if (config.environment !== accommodation_1.HotelbedsEnvironment.TEST) {
        throw new Error("Hotelbeds environment is not TEST. Live verification aborted.");
    }
    if (!config.baseUrl.includes("api.test.hotelbeds.com")) {
        throw new Error("Hotelbeds base URL is not test environment. Live verification aborted.");
    }
    await (0, prisma_1.connectPrisma)();
    try {
        const service = (0, hotelbeds_1.createHotelbedsContentSynchronizationService)();
        const contentRepository = new hotel_content_prisma_repository_1.HotelContentPrismaRepository();
        const syncStateRepository = new hotel_content_sync_state_prisma_repository_1.HotelContentSyncStatePrismaRepository();
        const selectedHotelCodes = (config.selectedHotelCodes ?? []).slice(0, 3);
        const firstRun = await service.synchronizeFull({
            language: "ENG",
            selectedHotelCodes,
            requestId: "app-008.2-r3-live-1",
            correlationId: "app-008.2-r3-live",
        });
        const afterFirst = await contentRepository.all();
        const stateAfterFirst = await syncStateRepository.getState();
        const secondRun = await service.synchronizeFull({
            language: "ENG",
            selectedHotelCodes,
            requestId: "app-008.2-r3-live-2",
            correlationId: "app-008.2-r3-live",
        });
        const afterSecond = await contentRepository.all();
        const stateAfterSecond = await syncStateRepository.getState();
        const output = {
            environment: config.environment,
            baseUrl: config.baseUrl,
            selectedHotelCodes,
            firstRun: {
                success: firstRun.success,
                processedCount: firstRun.processedCount,
                pagesProcessed: firstRun.pagesProcessed,
                errorCodes: firstRun.errors.map((error) => error.code),
                errorMessages: firstRun.errors.map((error) => error.message),
                retryable: firstRun.retryable,
            },
            secondRun: {
                success: secondRun.success,
                processedCount: secondRun.processedCount,
                pagesProcessed: secondRun.pagesProcessed,
                errorCodes: secondRun.errors.map((error) => error.code),
                errorMessages: secondRun.errors.map((error) => error.message),
                retryable: secondRun.retryable,
            },
            repositoryCountAfterFirst: afterFirst.length,
            repositoryCountAfterSecond: afterSecond.length,
            idempotent: afterSecond.length === afterFirst.length,
            checkpointAdvanced: Boolean(stateAfterFirst?.lastSuccessfulCheckpoint),
            checkpointAfterSecond: stateAfterSecond?.lastSuccessfulCheckpoint
                ? stateAfterSecond.lastSuccessfulCheckpoint.toISOString()
                : null,
        };
        process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
    }
    finally {
        await (0, prisma_1.disconnectPrisma)();
    }
}
run().catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown verification failure.";
    process.stderr.write(`${message}\n`);
    process.exit(1);
});
//# sourceMappingURL=verify-content-sync.js.map