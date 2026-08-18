"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHotelbedsContentSynchronizationService = createHotelbedsContentSynchronizationService;
const accommodation_1 = require("../../../application/accommodation");
const hotel_content_prisma_repository_1 = require("../../persistence/repositories/accommodation/hotel-content-prisma.repository");
const hotel_content_sync_state_prisma_repository_1 = require("../../persistence/repositories/accommodation/hotel-content-sync-state-prisma.repository");
const hotel_catalogue_prisma_repository_1 = require("../../persistence/repositories/accommodation/hotel-catalogue-prisma.repository");
function createHotelbedsContentSynchronizationService() {
    const config = (0, accommodation_1.loadHotelbedsIntegrationConfig)();
    const gateway = new accommodation_1.DefaultHotelbedsGateway();
    const contentRepository = new hotel_content_prisma_repository_1.HotelContentPrismaRepository();
    const syncStateRepository = new hotel_content_sync_state_prisma_repository_1.HotelContentSyncStatePrismaRepository();
    const catalogueRepository = new hotel_catalogue_prisma_repository_1.HotelCataloguePrismaRepository();
    return new accommodation_1.HotelbedsContentSynchronizationService(gateway, contentRepository, syncStateRepository, undefined, config.selectedHotelCodes, catalogueRepository, {
        batchSize: config.contentBatchSize ?? 50,
        maxQps: config.contentMaxQps ?? 1,
        maxRetries: config.contentMaxRetries ?? 3,
        retryBaseDelayMs: config.contentRetryBaseDelayMs ?? 1000,
    });
}
//# sourceMappingURL=hotelbeds-content-synchronization-factory.js.map