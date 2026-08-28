import {
  CanonicalReservationPaymentContextResolver,
  DefaultPaymentInitiationService,
} from "./payment-initiation-service";
import { PaymentMethod, PaymentStatus } from "./models";

describe("DefaultPaymentInitiationService", () => {
  const payment = {
    reference: { paymentId: "payment-1", reservationId: "reservation-1" },
    reservationSnapshot: { reservationReference: "RES-1" },
    paymentAmount: 12500,
    currency: "ZAR",
    paymentMethod: PaymentMethod.CARD,
    status: PaymentStatus.CREATED,
  };
  const engineResult = {
    success: true,
    payment,
    validationResult: { errors: [], warnings: [] },
    metadata: { requestId: "request-1", source: "test", pending: false },
  };
  const request = {
    reservationId: "reservation-1",
    engineRequest: { paymentRequest: { reservationSnapshot: { reservationId: "reservation-1" }, status: PaymentStatus.CREATED } },
    providerReference: { providerIdentifier: "payfast", reference: "pf-1" },
  };

  it("uses the gateway with authoritative payment amount and currency", async (): Promise<void> => {
    const gateway = {
      execute: jest.fn().mockResolvedValue({
        success: true,
        providerReference: request.providerReference,
        transactionReference: null,
        authorizationStatus: "APPROVED",
        captureStatus: null,
        settlementStatus: null,
        paymentStatus: PaymentStatus.AUTHORIZED,
        hostedPaymentAction: {
          method: "POST",
          action: "https://sandbox.payfast.co.za/eng/process",
          fields: { amount: "125.00", signature: "signed" },
        },
        warnings: [],
        metadata: { completedAt: new Date(), version: "1.0.0", requestId: "request-1", source: "test", operation: "AUTHORIZE" },
      }),
    };
    const service = new DefaultPaymentInitiationService({ execute: async () => engineResult } as never, gateway);
    const result = await service.initiatePayment(request as never);

    expect(result.status).toBe("INITIATED");
    expect(result.amount).toBe(12500);
    expect(result.currency).toBe("ZAR");
    expect(result.hostedPaymentAction?.action).toBe("https://sandbox.payfast.co.za/eng/process");
    expect(result.hostedPaymentAction?.fields.signature).toBe("signed");
    expect(gateway.execute).toHaveBeenCalledWith(expect.objectContaining({
      gatewayRequest: expect.objectContaining({ amount: 12500, currency: "ZAR" }),
    }));
  });

  it("does not create another transaction for an existing non-created payment", async (): Promise<void> => {
    const execute = jest.fn();
    const service = new DefaultPaymentInitiationService({ execute } as never, { execute: jest.fn() });
    const result = await service.initiatePayment({
      ...request,
      engineRequest: { paymentRequest: { reservationSnapshot: { reservationId: "reservation-1" }, status: PaymentStatus.AUTHORIZED } },
    } as never);

    expect(result.status).toBe("PENDING");
    expect(execute).not.toHaveBeenCalled();
  });
});

describe("CanonicalReservationPaymentContextResolver", () => {
  it("derives the payable amount and currency from the canonical Reservation", async (): Promise<void> => {
    const resolver = new CanonicalReservationPaymentContextResolver({
      findByJourneyId: async () => [{
        identity: { id: "reservation-1" },
        reservationNumber: "RES-1",
        status: "CONFIRMED",
        pricingSnapshot: {
          snapshotId: "pricing-1",
          capturedAt: new Date("2026-08-28T00:00:00.000Z"),
          version: "1.0.0",
          currency: "ZAR",
          totalPrice: 12500,
          taxes: 0,
          discounts: 0,
          fees: 0,
        },
        paymentSnapshot: undefined,
        metadata: {
          createdAt: new Date("2026-08-28T00:00:00.000Z"),
          updatedAt: new Date("2026-08-28T00:00:00.000Z"),
          version: "1.0.0",
        },
      }] as never,
    } as never);

    const context = await resolver.resolveForJourney("journey-homepage-journey-001");

    expect(context?.engineRequest.paymentRequest.paymentAmount).toBe(12500);
    expect(context?.engineRequest.paymentRequest.currency).toBe("ZAR");
    expect(context?.engineRequest.paymentRequest.reference?.reservationId).toBe("reservation-1");
  });
});
