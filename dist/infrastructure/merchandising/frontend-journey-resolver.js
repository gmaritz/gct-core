"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFrontendJourneyResolver = createFrontendJourneyResolver;
const accommodation_1 = require("../../application/accommodation");
const merchandising_1 = require("../../application/merchandising");
const hotelbeds_runtime_1 = require("../accommodation/hotelbeds/hotelbeds-runtime");
const hotel_catalogue_prisma_repository_1 = require("../persistence/repositories/accommodation/hotel-catalogue-prisma.repository");
function createFrontendJourneyResolver() {
    const catalogueService = new accommodation_1.HotelCatalogueService(new hotel_catalogue_prisma_repository_1.HotelCataloguePrismaRepository());
    const providerRegistry = new accommodation_1.InMemoryProviderRegistry();
    providerRegistry.register((0, hotelbeds_runtime_1.createHotelbedsRuntimeProvider)());
    const availabilityService = new accommodation_1.DefaultAccommodationAvailabilityService(providerRegistry, catalogueService);
    return new merchandising_1.CapeWinelandsJourneyResolver(catalogueService, availabilityService);
}
//# sourceMappingURL=frontend-journey-resolver.js.map