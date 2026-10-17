import {
  DefaultAccommodationAvailabilityService,
  HotelCatalogueService,
  InMemoryProviderRegistry,
} from "../../application/accommodation";
import { CapeWinelandsJourneyResolver } from "../../application/merchandising";
import { createHotelbedsRuntimeProvider } from "../accommodation/hotelbeds/hotelbeds-runtime";
import { HotelCataloguePrismaRepository } from "../persistence/repositories/accommodation/hotel-catalogue-prisma.repository";

export function createFrontendJourneyResolver(): CapeWinelandsJourneyResolver {
  const catalogueService = new HotelCatalogueService(new HotelCataloguePrismaRepository());
  const providerRegistry = new InMemoryProviderRegistry();
  providerRegistry.register(createHotelbedsRuntimeProvider());
  const availabilityService = new DefaultAccommodationAvailabilityService(
    providerRegistry,
    catalogueService,
  );
  return new CapeWinelandsJourneyResolver(catalogueService, availabilityService);
}
