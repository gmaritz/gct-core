import {
  DefaultHotelbedsGateway,
  loadHotelbedsIntegrationConfig,
  HotelbedsContentSynchronizationService,
} from "../../../application/accommodation";
import { HotelContentPrismaRepository } from "../../persistence/repositories/accommodation/hotel-content-prisma.repository";
import { HotelContentSyncStatePrismaRepository } from "../../persistence/repositories/accommodation/hotel-content-sync-state-prisma.repository";
import { HotelCataloguePrismaRepository } from "../../persistence/repositories/accommodation/hotel-catalogue-prisma.repository";

export function createHotelbedsContentSynchronizationService(): HotelbedsContentSynchronizationService {
  const config = loadHotelbedsIntegrationConfig();
  const gateway = new DefaultHotelbedsGateway();
  const contentRepository = new HotelContentPrismaRepository();
  const syncStateRepository = new HotelContentSyncStatePrismaRepository();
  const catalogueRepository = new HotelCataloguePrismaRepository();

  return new HotelbedsContentSynchronizationService(
    gateway,
    contentRepository,
    syncStateRepository,
    undefined,
    config.selectedHotelCodes,
    catalogueRepository,
    {
      batchSize: config.contentBatchSize ?? 50,
      maxQps: config.contentMaxQps ?? 1,
      maxRetries: config.contentMaxRetries ?? 3,
      retryBaseDelayMs: config.contentRetryBaseDelayMs ?? 1000,
    },
  );
}
