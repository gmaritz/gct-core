import { Express } from "express";

import { Journey, JourneyLifecycle, JourneyStatus } from "../../../src/application/journeys";
import { PricingEngine } from "../../../src/application/pricing";
import { createTestApplication } from "../../helpers/application.helper";
import { createRequest, getCsrfToken } from "../../helpers/request.helper";

const journeyId = "journey-homepage-journey-001";
const stopIds = ["stop-1", "stop-2"] as const;
let mockCurrencies: ReadonlyArray<string> = ["EUR", "EUR"];

function createSupplierJourney(currencies: ReadonlyArray<string>): Journey {
  return Journey.create({
    identity: { id: journeyId },
    classification: { type: "PACKAGE", category: "SIGNATURE" },
    metadata: { created: new Date(), modified: new Date(), version: "1.0.0", source: "CUR-001" },
    status: JourneyStatus.PUBLISHED,
    lifecycle: JourneyLifecycle.BOOKABLE,
    duration: { days: 4, nights: 3, description: "4 Days / 3 Nights" },
    destinations: [{ name: "Cape Winelands" }],
    accommodation: stopIds.map((stopId, index) => ({
      accommodationId: `hotel-${stopId}`,
      name: `Hotel ${stopId}`,
      provider: "hotelbeds",
      packageStop: {
        packageId: journeyId,
        stopId,
        stopOrder: index + 1,
        checkInDate: new Date(`2026-11-0${index + 1}T00:00:00.000Z`),
        checkOutDate: new Date(`2026-11-0${index + 2}T00:00:00.000Z`),
      },
      requestedOccupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
      roomOptions: [{
        reference: { provider: "hotelbeds", opaqueReference: `room-${stopId}` },
        name: "Double Room",
        rateOptions: [{
          reference: { provider: "hotelbeds", opaqueReference: `rate-${stopId}` },
          status: "BOOKABLE" as const,
          pricing: { amount: 1000, currency: currencies[index]!, basis: "TOTAL_STAY" },
          occupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
          cancellationPolicies: [],
          taxes: [],
        }],
      }],
    })),
    experiences: [],
    travellerRules: { minimumTravellers: 2, maximumTravellers: 8, privateOnly: true },
    tags: [],
  });
}

// Replaces only the supplier-backed resolver; routing, session, controller, selection, quote and pricing are real.
jest.mock("../../../src/infrastructure/merchandising/frontend-journey-resolver", () => ({
  createFrontendJourneyResolver: () => ({
    resolve: async () => ({ status: "RESOLVED", journey: createSupplierJourney(mockCurrencies) }),
  }),
}));

function selectionForm(): Record<string, string> {
  const form: Record<string, string> = {};
  stopIds.forEach((stopId, index) => {
    form[`selections[${index}][stopId]`] = stopId;
    form[`selections[${index}][accommodationId]`] = `hotel-${stopId}`;
    form[`selections[${index}][roomReference][provider]`] = "hotelbeds";
    form[`selections[${index}][roomReference][opaqueReference]`] = `room-${stopId}`;
    form[`selections[${index}][rateReference][provider]`] = "hotelbeds";
    form[`selections[${index}][rateReference][opaqueReference]`] = `rate-${stopId}`;
  });
  return form;
}

describe("CUR-001 supplier currency mismatch through the customer journey routes", () => {
  let app: Express;
  let executeSpy: jest.SpyInstance;

  beforeAll(async () => {
    app = await createTestApplication();
  });

  beforeEach(() => {
    executeSpy = jest.spyOn(PricingEngine.prototype, "execute");
  });

  afterEach(() => {
    executeSpy.mockRestore();
  });

  async function selectAccommodation(currencies: ReadonlyArray<string>): Promise<void> {
    mockCurrencies = currencies;
    const csrfToken = await getCsrfToken(app);
    const response = await createRequest(app, "post")(`/ui/journeys/${journeyId}/accommodation`)
      .set("X-CSRF-Token", csrfToken)
      .type("form")
      .send(selectionForm());
    expect(response.status).toBe(200);
  }

  it.each([
    ["EUR on every stop", ["EUR", "EUR"]],
    ["EUR on one stop and ZAR on the other", ["ZAR", "EUR"]],
  ])("returns HTTP 409 without invoking the pricing engine for %s", async (_label, currencies) => {
    await selectAccommodation(currencies);

    const response = await createRequest(app, "get")(`/ui/journeys/${journeyId}/quote`);

    expect(response.status).toBe(409);
    expect(response.text).toContain("currency requires confirmation");
    expect(response.text).toContain("Pending currency confirmation");
    expect(response.text).not.toContain("Journey quote");
    expect(executeSpy).not.toHaveBeenCalled();
  });

  it("still prices ZAR supplier accommodation through the existing pricing engine", async () => {
    await selectAccommodation(["ZAR", "ZAR"]);

    const response = await createRequest(app, "get")(`/ui/journeys/${journeyId}/quote`);

    expect(response.status).toBe(200);
    expect(response.text).toContain("Journey quote");
    expect(executeSpy).toHaveBeenCalledTimes(1);
  });
});