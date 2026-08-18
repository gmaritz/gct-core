import { connectPrisma, disconnectPrisma } from "../../bootstrap/prisma";
import { loadHotelbedsIntegrationConfig, HotelbedsEnvironment } from "../../application/accommodation";
import { createHotelbedsContentSynchronizationService } from "../../infrastructure/accommodation/hotelbeds";
import {
  HotelContentPrismaRepository,
} from "../../infrastructure/persistence/repositories/accommodation/hotel-content-prisma.repository";
import {
  HotelContentSyncStatePrismaRepository,
} from "../../infrastructure/persistence/repositories/accommodation/hotel-content-sync-state-prisma.repository";

interface VerificationOutput {
  readonly environment: string;
  readonly baseUrl: string;
  readonly selectedHotelCodes: ReadonlyArray<string>;
  readonly firstRun: {
    readonly success: boolean;
    readonly processedCount: number;
    readonly pagesProcessed: number;
    readonly errorCodes: ReadonlyArray<string>;
    readonly errorMessages: ReadonlyArray<string>;
    readonly retryable: boolean;
  };
  readonly secondRun: {
    readonly success: boolean;
    readonly processedCount: number;
    readonly pagesProcessed: number;
    readonly errorCodes: ReadonlyArray<string>;
    readonly errorMessages: ReadonlyArray<string>;
    readonly retryable: boolean;
  };
  readonly repositoryCountAfterFirst: number;
  readonly repositoryCountAfterSecond: number;
  readonly idempotent: boolean;
  readonly checkpointAdvanced: boolean;
  readonly checkpointAfterSecond: string | null;
}

async function run(): Promise<void> {
  const config = loadHotelbedsIntegrationConfig();

  if (config.environment !== HotelbedsEnvironment.TEST) {
    throw new Error("Hotelbeds environment is not TEST. Live verification aborted.");
  }

  if (!config.baseUrl.includes("api.test.hotelbeds.com")) {
    throw new Error("Hotelbeds base URL is not test environment. Live verification aborted.");
  }

  await connectPrisma();

  try {
    const service = createHotelbedsContentSynchronizationService();
    const contentRepository = new HotelContentPrismaRepository();
    const syncStateRepository = new HotelContentSyncStatePrismaRepository();
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

    const output: VerificationOutput = {
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

    console.log(JSON.stringify(output, null, 2));
  } finally {
    await disconnectPrisma();
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown verification failure.";
  console.error(message);
  process.exit(1);
});
