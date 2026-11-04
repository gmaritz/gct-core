import { Express } from "express";

import {
  DefaultAccommodationAvailabilityService,
  HotelCatalogueService,
  InMemoryHotelCatalogueRepository,
  InMemoryProviderRegistry,
} from "../../../src/application/accommodation";
import { CapeWinelandsJourneyResolver } from "../../../src/application/merchandising";
import * as frontendJourneyResolverFactory from "../../../src/infrastructure/merchandising/frontend-journey-resolver";
import { createTestApplication } from "../../helpers/application.helper";
import { createRequest, getCsrfToken } from "../../helpers/request.helper";

describe("Frontend dynamic journey detail page", () => {
  let app: Express;
  let requestTo: ReturnType<typeof createRequest>;

  beforeAll(async () => {
    app = await createTestApplication();
    requestTo = createRequest(app, "get");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the itinerary and booking inputs without showing fixture accommodation", async () => {
    const response = await requestTo("/ui/journeys/journey-homepage-journey-001");

    expect(response.status).toBe(200);
    expect(response.text).toContain("SIGNATURE Cape Winelands Journey");
    expect(response.text).toContain("Cape Winelands Signature Experience");
    expect(response.text).toContain("Price on request");
    expect(response.text).toContain("Itinerary");
    expect(response.text).toContain('name="startDate"');
    expect(response.text).toContain('name="participants"');
    expect(response.text).toContain('name="stopOccupancies[0][stopId]"');
    expect(response.text).toContain('name="stopOccupancies[1][stopId]"');
    expect(response.text).not.toContain("data-children");
    expect(response.text).not.toContain("Cape Winelands Retreat");
    expect(response.text).toContain("Check live availability");
  });

  it("accepts the adults-only browser form when child fields are omitted", async () => {
    const catalogueService = new HotelCatalogueService(new InMemoryHotelCatalogueRepository());
    const resolver = new CapeWinelandsJourneyResolver(
      catalogueService,
      new DefaultAccommodationAvailabilityService(new InMemoryProviderRegistry(), catalogueService),
    );
    const resolve = jest.spyOn(resolver, "resolve");
    jest.spyOn(frontendJourneyResolverFactory, "createFrontendJourneyResolver").mockReturnValue(resolver);

    const csrfToken = await getCsrfToken(app);
    const response = await createRequest(app, "post")("/ui/journeys/journey-homepage-journey-001/select")
      .set("X-CSRF-Token", csrfToken)
      .type("form")
      .send({
        startDate: "2026-11-01",
        participants: "2",
        "stopOccupancies[0][stopId]": "cape-winelands-stellenbosch",
        "stopOccupancies[0][rooms][0][adults]": "2",
        "stopOccupancies[1][stopId]": "cape-winelands-hermanus",
        "stopOccupancies[1][rooms][0][adults]": "2",
      });

    expect(response.status).toBe(410);
    expect(response.text).toContain("Journey unavailable");
    expect(response.text).not.toContain("Child count must be a non-negative whole number");
    expect(resolve).toHaveBeenCalledWith(expect.any(String), "journey-homepage-journey-001", {
      startDate: "2026-11-01",
      participants: 2,
      stopOccupancies: [
        {
          stopId: "cape-winelands-stellenbosch",
          rooms: [{
            slotId: "cape-winelands-stellenbosch-room-1",
            adults: 2,
            children: 0,
            childAges: [],
          }],
        },
        {
          stopId: "cape-winelands-hermanus",
          rooms: [{
            slotId: "cape-winelands-hermanus-room-1",
            adults: 2,
            children: 0,
            childAges: [],
          }],
        },
      ],
    });
  });

  it("rejects a direct request that attempts to add children to the adults-only journey", async () => {
    const csrfToken = await getCsrfToken(app);
    const response = await createRequest(app, "post")("/ui/journeys/journey-homepage-journey-001/select")
      .set("X-CSRF-Token", csrfToken)
      .type("form")
      .send({
        startDate: "2026-11-01",
        participants: "2",
        "stopOccupancies[0][stopId]": "cape-winelands-stellenbosch",
        "stopOccupancies[0][rooms][0][adults]": "2",
        "stopOccupancies[0][rooms][0][children]": "1",
        "stopOccupancies[0][rooms][0][childAges][0]": "8",
        "stopOccupancies[1][stopId]": "cape-winelands-hermanus",
        "stopOccupancies[1][rooms][0][adults]": "2",
        "stopOccupancies[1][rooms][0][children]": "1",
        "stopOccupancies[1][rooms][0][childAges][0]": "8",
      });

    expect(response.status).toBe(422);
    expect(response.text).toContain("Children are not permitted on this journey");
  });

  it("returns validation for malformed nested occupancy instead of failing the request", async () => {
    const csrfToken = await getCsrfToken(app);
    const response = await createRequest(app, "post")("/ui/journeys/journey-homepage-journey-001/select")
      .set("X-CSRF-Token", csrfToken)
      .send({
        startDate: "2026-11-01",
        participants: 2,
        stopOccupancies: [null, {
          stopId: "cape-winelands-hermanus",
          rooms: [null],
        }],
      });

    expect(response.status).toBe(422);
  });

  it("renders the established not-found response for an invalid journey", async () => {
    const response = await requestTo("/ui/journeys/invalid");

    expect(response.status).toBe(404);
    expect(response.text).toContain("Page unavailable");
  });
});