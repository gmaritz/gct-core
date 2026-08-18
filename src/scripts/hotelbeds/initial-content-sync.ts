import { connectPrisma, disconnectPrisma } from "../../bootstrap/prisma";
import { loadHotelbedsIntegrationConfig } from "../../application/accommodation";
import { createHotelbedsContentSynchronizationService } from "../../infrastructure/accommodation/hotelbeds";
import { HotelCataloguePrismaRepository } from "../../infrastructure/persistence/repositories/accommodation/hotel-catalogue-prisma.repository";

async function run(): Promise<void> {
  const config = loadHotelbedsIntegrationConfig();
  const catalogueRepository = new HotelCataloguePrismaRepository();
  const catalogueEntries = await catalogueRepository.findActive();

  if (catalogueEntries.length === 0) {
    throw new Error("Initial Hotelbeds content synchronization aborted: active hotel catalogue is empty.");
  }

  await connectPrisma();
  try {
    const service = createHotelbedsContentSynchronizationService();
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

    console.log(JSON.stringify({
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
    }, null, 2));

    if (!result.success) process.exitCode = 1;
  } finally {
    await disconnectPrisma();
  }
}

void run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Initial synchronization failed.");
  process.exitCode = 1;
});
