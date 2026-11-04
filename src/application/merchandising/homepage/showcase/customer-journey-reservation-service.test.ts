import {
  Currency,
  createMoney,
  createPricingBreakdown,
  createPricingLineItem,
  createPricingMetadata,
  createPricingSummary,
  createPricingTotal,
  createTaxBreakdown,
  Pricing,
  createPricingEngineResult,
} from "../../../pricing";
import { Journey, JourneyLifecycle, JourneyStatus } from "../../../journeys";
import { ReservationServiceRequest } from "../../../reservations/service/models/reservation-service-context";
import { CustomerJourneyReservationService } from "./customer-journey-reservation-service";
import { ReservationReviewResult } from "./reservation-review-service";

const stopIds = ["stop-1", "stop-2", "stop-3"] as const;
const supplierAmounts = [596.68, 135.26, 100] as const;
const supplierCurrencies = ["EUR", "EUR", "ZAR"] as const;

function createJourney(): Journey {
  return Journey.create({
    identity: { id: "journey-currency-snapshots" },
    classification: { type: "PACKAGE", category: "SIGNATURE" },
    metadata: { created: new Date(), modified: new Date(), version: "1.0.0", source: "CUR-002.1" },
    status: JourneyStatus.PUBLISHED,
    lifecycle: JourneyLifecycle.BOOKABLE,
    duration: { days: 4, nights: 3, description: "4 Days / 3 Nights" },
    destinations: [{ name: "Cape Winelands" }],
    accommodation: stopIds.map((stopId, index) => ({
      accommodationId: `hotel-${stopId}`,
      name: `Hotel ${stopId}`,
      provider: "hotelbeds",
      packageStop: {
        packageId: "journey-currency-snapshots",
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
          pricing: { amount: supplierAmounts[index]!, currency: supplierCurrencies[index]!, basis: "TOTAL_STAY" },
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

function createPricedQuote(): ReturnType<typeof createPricingEngineResult> {
  const amounts = [11098.25, 2515.84, 100];
  const lineItems = [
    createPricingLineItem({
      code: "BASE",
      label: "Journey component",
      unitAmount: createMoney({ amount: 51376, currency: Currency.ZAR }),
      totalAmount: createMoney({ amount: 51376, currency: Currency.ZAR }),
      quantity: 1,
    }),
    ...stopIds.map((stopId, index) => createPricingLineItem({
      code: `ACCOMMODATION:${stopId}`,
      label: `Accommodation ${stopId}`,
      unitAmount: createMoney({ amount: amounts[index]!, currency: Currency.ZAR }),
      totalAmount: createMoney({ amount: amounts[index]!, currency: Currency.ZAR }),
      quantity: 1,
      metadata: index < 2 ? {
        packageStopId: stopId,
        supplierAmount: String(supplierAmounts[index]),
        supplierCurrency: "EUR",
        conversionRate: "18.6",
        convertedAmount: String(amounts[index]),
        convertedCurrency: "ZAR",
        conversionPolicyId: "CONFIGURED_FIXED_RATE",
      } : {
        packageStopId: stopId,
      },
    })),
  ];
  const pricing = Pricing.create({
    identity: { id: "pricing-currency-snapshots" },
    summary: createPricingSummary({ productId: "journey-currency-snapshots", productType: "PACKAGE", description: "Journey" }),
    breakdown: createPricingBreakdown({ lineItems }),
    taxes: createTaxBreakdown({
      entries: [],
      total: createMoney({ amount: 0, currency: Currency.ZAR }),
    }),
    fees: [],
    discounts: [],
    markups: [],
    commissions: [],
    totals: createPricingTotal({
      subtotal: createMoney({ amount: 65090.09, currency: Currency.ZAR }),
      taxTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      feeTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      discountTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      markupTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      commissionTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      grandTotal: createMoney({ amount: 65090.09, currency: Currency.ZAR }),
    }),
    currency: Currency.ZAR,
    metadata: createPricingMetadata({
      createdAt: new Date("2026-11-01T00:00:00.000Z"),
      updatedAt: new Date("2026-11-01T00:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    }),
  });
  return createPricingEngineResult({
    successful: true,
    pricing,
    metadata: { completedAt: new Date(), version: "1.0.0", requestId: "quote", stages: [] },
  });
}

describe("CustomerJourneyReservationService currency conversion snapshots", () => {
  it("copies each priced stop's conversion details and preserves supplier prices", async () => {
    let capturedRequest: ReservationServiceRequest | undefined;
    const customerResolutionService = {
      resolveOrCreate: async (): Promise<{ customerId: string }> => ({ customerId: "customer-1" }),
    };
    const reservationService = {
      executeIfAbsent: async (request: ReservationServiceRequest): Promise<{ successful: boolean; reservation: null; errors: string[] }> => {
        capturedRequest = request;
        return { successful: true, reservation: null, errors: [] };
      },
    };
    const service = new CustomerJourneyReservationService(
      customerResolutionService as never,
      reservationService as never,
    );
    const journey = createJourney();
    const selections = stopIds.map((stopId) => ({
      stopId,
      accommodationId: `hotel-${stopId}`,
      roomSelections: [{
        roomSlotId: `${stopId}-room-1`,
        roomReference: { provider: "hotelbeds", opaqueReference: `room-${stopId}` },
        rateReference: { provider: "hotelbeds", opaqueReference: `rate-${stopId}` },
      }],
    }));
    const review = {
      status: "READY",
      journeyId: journey.identity.id,
      journey,
      quote: { status: "PRICED", journeyId: journey.identity.id, journey, selections, pricing: createPricedQuote() },
      guestInformation: {
        contact: { email: "traveller@example.com", phone: "+27123456789" },
        leadTravellerIndex: 0,
        travellers: [
          { firstName: "Ari", lastName: "Jacobs", email: "traveller@example.com", travellerType: "ADULT" as const },
          { firstName: "Mika", lastName: "Jacobs", email: "traveller@example.com", travellerType: "ADULT" as const },
        ],
      },
      errors: [],
      confirmed: true,
    } satisfies ReservationReviewResult;

    await service.create(review);

    const snapshots = capturedRequest?.snapshots.accommodationSnapshots;
    expect(snapshots).toHaveLength(3);
    expect(snapshots?.map((snapshot) => snapshot.packageStopId)).toEqual(stopIds);
    expect(snapshots?.map((snapshot) => snapshot.supplierPrice)).toEqual([
      { amount: 596.68, currency: "EUR", basis: "TOTAL_STAY" },
      { amount: 135.26, currency: "EUR", basis: "TOTAL_STAY" },
      { amount: 100, currency: "ZAR", basis: "TOTAL_STAY" },
    ]);
    expect(snapshots?.map((snapshot) => snapshot.currencyConversion)).toEqual([
      { fromCurrency: "EUR", toCurrency: "ZAR", exchangeRate: 18.6, convertedAmount: 11098.25, policyId: "CONFIGURED_FIXED_RATE" },
      { fromCurrency: "EUR", toCurrency: "ZAR", exchangeRate: 18.6, convertedAmount: 2515.84, policyId: "CONFIGURED_FIXED_RATE" },
      undefined,
    ]);
  });
});
