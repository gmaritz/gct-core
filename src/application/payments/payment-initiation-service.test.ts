import {
  CanonicalReservationPaymentContextResolver,
  DefaultPaymentInitiationService,
} from "./payment-initiation-service";
import { PaymentMethod, PaymentStatus } from "./models";

describe("DefaultPaymentInitiationService", () => {
  const payment = {
    reference: { paymentId: "payment-1", reservationId: "reservation-1" },
    reservationSnapshot: { reservationReference: "RES-1" },
    paymentAmount: 64990.09,
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
  const initialRequirement = {
    classification: "PARTIAL_PAYMENT" as const,
    amountPayableAtBooking: { amount: 150, currency: "ZAR" },
    contractualFutureBalance: { amount: { amount: 50, currency: "ZAR" }, dueDate: "2026-12-02" },
    pricingSnapshotId: "pricing-1",
    commercialPolicy: {
      policyId: "SIGNATURE_CAPE_WINELANDS_INITIAL_PAYMENT",
      version: "1.0.0",
      appliedRate: "0.50",
      scope: "SIGNATURE_CAPE_WINELANDS_MULTI_DAY_PACKAGE",
      effectiveFrom: "2026-11-17",
      leadTimeThresholdDays: 14,
      commercialTimeZone: "Africa/Johannesburg",
    },
    calculationBasis: {
      commercialPolicy: {
        policyId: "SIGNATURE_CAPE_WINELANDS_INITIAL_PAYMENT",
        version: "1.0.0",
        appliedRate: "0.50",
        scope: "SIGNATURE_CAPE_WINELANDS_MULTI_DAY_PACKAGE",
        effectiveFrom: "2026-11-17",
        leadTimeThresholdDays: 14,
        commercialTimeZone: "Africa/Johannesburg",
      },
      bookingDate: "2026-11-18",
      departureDate: "2026-12-03",
      leadTimeDays: 15,
      commercialTimeZone: "Africa/Johannesburg",
      gctComponent: {
        sourcePricingLineIdentifier: "BASE",
        amount: { amount: 100, currency: "ZAR" },
        costingSourceId: "INT-004",
        costingSourceVersion: "1.0.0",
        costingSourceEffectiveDate: "2026-11-18",
      },
      accommodationComponents: [{
        packageStopId: "stop-1",
        sourcePricingLineIdentifier: "ACCOMMODATION:stop-1",
        amount: { amount: 100, currency: "ZAR" },
      }],
    },
  };

  it("uses the gateway with authoritative payment amount and currency", async (): Promise<void> => {
    const repository = {
      createOrFind: jest.fn().mockResolvedValue({
        attemptId: "attempt-1",
        paymentReference: "gct-reference-1",
        amount: 64990.09,
        currency: "ZAR",
        status: PaymentStatus.CREATED,
      }),
      claimInitiation: jest.fn().mockResolvedValue(true),
      updateStatus: jest.fn(),
    };
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
    const service = new DefaultPaymentInitiationService({ execute: async () => engineResult } as never, gateway, repository as never, "SANDBOX");
    const result = await service.initiatePayment(request as never);

    expect(result.status).toBe("INITIATED");
    expect(result.amount).toBe(64990.09);
    expect(result.currency).toBe("ZAR");
    expect(result.hostedPaymentAction?.action).toBe("https://sandbox.payfast.co.za/eng/process");
    expect(result.hostedPaymentAction?.fields.signature).toBe("signed");
    expect(result.paymentReference).toBe("gct-reference-1");
    expect(gateway.execute).toHaveBeenCalledWith(expect.objectContaining({
      gatewayRequest: expect.objectContaining({ amount: 64990.09, currency: "ZAR" }),
    }));
  });

  it("sends the accepted initial amount to PayFast and requires the persisted attempt to match", async (): Promise<void> => {
    const partialPayment = { ...payment, paymentAmount: 150 };
    const attempt = {
      attemptId: "attempt-partial",
      paymentReference: "gct-partial",
      amount: 150,
      currency: "ZAR",
      status: PaymentStatus.CREATED,
    };
    const gateway = {
      execute: jest.fn(async (context) => ({
        success: true,
        providerReference: context.gatewayRequest.providerReference,
        transactionReference: null,
        authorizationStatus: "APPROVED",
        captureStatus: null,
        settlementStatus: null,
        paymentStatus: PaymentStatus.AUTHORIZED,
        hostedPaymentAction: {
          method: "POST" as const,
          action: "https://sandbox.payfast.co.za/eng/process",
          fields: { amount: context.gatewayRequest.amount.toFixed(2) },
        },
        warnings: [],
        metadata: { completedAt: new Date(), version: "1.0.0", requestId: "request-1", source: "test", operation: "AUTHORIZE" },
      })),
    };
    const repository = {
      createOrFind: jest.fn().mockResolvedValue(attempt),
      claimInitiation: jest.fn().mockResolvedValue(true),
      updateStatus: jest.fn(),
    };
    const service = new DefaultPaymentInitiationService(
      { execute: async () => ({ ...engineResult, payment: partialPayment }) } as never,
      gateway as never,
      repository as never,
      "SANDBOX",
    );
    const partialRequest = {
      ...request,
      journeyId: "journey-homepage-journey-001",
      reservationPaymentSnapshot: {
        snapshotId: "payment-1",
        capturedAt: new Date("2026-11-18T00:00:00.000Z"),
        version: "1.0.0",
        paymentStatus: PaymentStatus.CREATED,
        amountReceived: 0,
        balanceOutstanding: 200,
        initialRequirement,
      },
      engineRequest: {
        ...request.engineRequest,
        paymentRequest: {
          ...request.engineRequest.paymentRequest,
          pricingSnapshot: { pricingId: "pricing-1", total: 200, currency: "ZAR" },
          paymentAmount: 150,
          currency: "ZAR",
        },
      },
    };

    const result = await service.initiatePayment(partialRequest as never);

    expect(result.status).toBe("INITIATED");
    expect(result.amount).toBe(150);
    expect(result.hostedPaymentAction?.fields.amount).toBe("150.00");
    expect(gateway.execute).toHaveBeenCalledWith(expect.objectContaining({
      gatewayRequest: expect.objectContaining({ amount: 150, currency: "ZAR" }),
    }));
    expect(repository.createOrFind).toHaveBeenCalledWith(expect.objectContaining({ amount: 150, currency: "ZAR" }));
  });

  it("resolves the preserved initial amount without replacing the full Reservation total", async (): Promise<void> => {
    const resolver = new CanonicalReservationPaymentContextResolver({
      findByJourneyId: async () => [{
        identity: { id: "reservation-partial" },
        reservationNumber: "RES-PARTIAL",
        status: "CONFIRMED",
        journeySnapshot: { journeyId: "journey-homepage-journey-001" },
        pricingSnapshot: {
          snapshotId: "pricing-1",
          capturedAt: new Date("2026-11-18T00:00:00.000Z"),
          version: "1.0.0",
          currency: "ZAR",
          totalPrice: 200,
          taxes: 0,
          discounts: 0,
          fees: 0,
        },
        paymentSnapshot: {
          snapshotId: "payment-1",
          capturedAt: new Date("2026-11-18T00:00:00.000Z"),
          version: "1.0.0",
          paymentStatus: PaymentStatus.CREATED,
          amountReceived: 0,
          balanceOutstanding: 200,
          initialRequirement,
        },
        supplierReferences: [],
        metadata: {
          createdAt: new Date("2026-11-18T00:00:00.000Z"),
          updatedAt: new Date("2026-11-18T00:00:00.000Z"),
          version: "1.0.0",
        },
      }] as never,
    } as never);

    const context = await resolver.resolveForJourney("journey-homepage-journey-001");

    expect(context?.engineRequest.paymentRequest.paymentAmount).toBe(150);
    expect(context?.engineRequest.paymentRequest.pricingSnapshot?.total).toBe(200);
  });

  it("does not create another transaction for an existing non-created payment", async (): Promise<void> => {
    const execute = jest.fn();
    const service = new DefaultPaymentInitiationService(
      { execute } as never,
      { execute: jest.fn() },
      { createOrFind: jest.fn() } as never,
      "SANDBOX",
    );
    const result = await service.initiatePayment({
      ...request,
      engineRequest: { paymentRequest: { reservationSnapshot: { reservationId: "reservation-1" }, status: PaymentStatus.AUTHORIZED } },
    } as never);

    expect(result.status).toBe("PENDING");
    expect(execute).not.toHaveBeenCalled();
  });

  it("persists an attempt before returning a PayFast action and uses its GCT reference", async (): Promise<void> => {
    const events: string[] = [];
    const attempt = {
      attemptId: "attempt-1",
      idempotencyKey: "payment-1",
      paymentId: "payment-1",
      reservationId: "reservation-1",
      paymentReference: "gct-attempt-1",
      provider: "PAYFAST" as const,
      environment: "SANDBOX" as const,
      amount: 64990.09,
      currency: "ZAR",
      status: PaymentStatus.CREATED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const repository = {
      createOrFind: jest.fn(async () => { events.push("persist"); return attempt; }),
      claimInitiation: jest.fn(async () => { events.push("claim"); return true; }),
      updateStatus: jest.fn(),
      associateProviderTransaction: jest.fn(),
    };
    const gateway = {
      execute: jest.fn(async (context) => {
        events.push("gateway");
        expect(context.gatewayRequest.providerReference.reference).toBe("gct-attempt-1");
        return {
          success: true,
          providerReference: context.gatewayRequest.providerReference,
          transactionReference: null,
          authorizationStatus: null,
          captureStatus: null,
          settlementStatus: null,
          paymentStatus: PaymentStatus.CREATED,
          hostedPaymentAction: { method: "POST" as const, action: "https://sandbox.payfast.co.za/eng/process", fields: { m_payment_id: "gct-attempt-1" } },
          warnings: [],
          metadata: { completedAt: new Date(), version: "1", requestId: "request-1", source: "test", operation: "AUTHORIZE" },
        };
      }),
    };
    const service = new DefaultPaymentInitiationService(
      { execute: async () => engineResult } as never,
      gateway as never,
      repository as never,
      "SANDBOX",
    );

    const result = await service.initiatePayment({
      ...request,
      engineRequest: { ...request.engineRequest, requestId: "payment-1" },
    } as never);

    expect(events).toEqual(["persist", "claim", "gateway"]);
    expect(result.paymentId).toBe("payment-1");
    expect(result.paymentAttemptId).toBe("attempt-1");
    expect(result.paymentReference).toBe("gct-attempt-1");
    expect(result.paymentStatus).toBe(PaymentStatus.CREATED);
    expect(result.hostedPaymentAction?.fields.m_payment_id).toBe("gct-attempt-1");
  });

  it("reuses the persisted attempt reference for repeated initiation with the same idempotency key", async (): Promise<void> => {
    const attempt = {
      attemptId: "attempt-1",
      idempotencyKey: "payment-1",
      paymentId: "payment-1",
      reservationId: "reservation-1",
      paymentReference: "gct-attempt-1",
      provider: "PAYFAST" as const,
      environment: "SANDBOX" as const,
      amount: 64990.09,
      currency: "ZAR",
      status: PaymentStatus.CREATED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const repository = {
      createOrFind: jest.fn().mockResolvedValue(attempt),
      claimInitiation: jest.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false),
      updateStatus: jest.fn(),
    };
    const observedReferences: string[] = [];
    const gateway = {
      execute: jest.fn(async (context) => {
        observedReferences.push(context.gatewayRequest.providerReference.reference);
        return {
          success: true,
          providerReference: context.gatewayRequest.providerReference,
          transactionReference: null,
          authorizationStatus: null,
          captureStatus: null,
          settlementStatus: null,
          paymentStatus: PaymentStatus.CREATED,
          hostedPaymentAction: { method: "POST" as const, action: "https://sandbox.payfast.co.za/eng/process", fields: { m_payment_id: context.gatewayRequest.paymentReference.paymentId } },
          warnings: [],
          metadata: { completedAt: new Date(), version: "1", requestId: "request-1", source: "test", operation: "AUTHORIZE" },
        };
      }),
    };
    const service = new DefaultPaymentInitiationService(
      { execute: async () => engineResult } as never,
      gateway as never,
      repository as never,
      "SANDBOX",
    );
    const sameRequest = { ...request, engineRequest: { ...request.engineRequest, requestId: "payment-1" } };

    const first = await service.initiatePayment(sameRequest as never);
    const second = await service.initiatePayment(sameRequest as never);

    expect(repository.createOrFind).toHaveBeenCalledTimes(2);
    expect(observedReferences).toEqual(["gct-attempt-1"]);
    expect(first.paymentAttemptId).toBe(second.paymentAttemptId);
    expect(first.paymentReference).toBe(second.paymentReference);
    expect(second.status).toBe("PENDING");
    expect(second.hostedPaymentAction).toBeUndefined();
    expect(gateway.execute).toHaveBeenCalledTimes(1);
  });

  it("does not call PayFast or return a hosted action when attempt persistence fails", async (): Promise<void> => {
    const gateway = { execute: jest.fn() };
    const service = new DefaultPaymentInitiationService(
      { execute: async () => engineResult } as never,
      gateway,
      { createOrFind: async () => { throw new Error("database unavailable"); }, claimInitiation: jest.fn() } as never,
      "SANDBOX",
    );

    const result = await service.initiatePayment(request as never);

    expect(result.status).toBe("FAILED");
    expect(result.hostedPaymentAction).toBeUndefined();
    expect(gateway.execute).not.toHaveBeenCalled();
  });

  it("preserves a persisted attempt when PayFast request construction fails", async (): Promise<void> => {
    const attempt = {
      attemptId: "attempt-1",
      paymentReference: "gct-attempt-1",
      amount: 64990.09,
      currency: "ZAR",
      status: PaymentStatus.CREATED,
    };
    const repository = {
      createOrFind: jest.fn()
        .mockResolvedValueOnce(attempt)
        .mockResolvedValueOnce({ ...attempt, status: PaymentStatus.AUTHORIZATION_FAILED }),
      claimInitiation: jest.fn().mockResolvedValue(true),
      updateStatus: jest.fn().mockResolvedValue({ ...attempt, status: PaymentStatus.AUTHORIZATION_FAILED }),
    };
    const gateway = {
      execute: jest.fn()
        .mockRejectedValueOnce(new Error("request construction failed"))
        .mockResolvedValueOnce({
          success: true,
          providerReference: request.providerReference,
          transactionReference: null,
          authorizationStatus: null,
          captureStatus: null,
          settlementStatus: null,
          paymentStatus: PaymentStatus.CREATED,
          hostedPaymentAction: {
            method: "POST" as const,
            action: "https://sandbox.payfast.co.za/eng/process",
            fields: { m_payment_id: "gct-attempt-1" },
          },
          warnings: [],
          metadata: { completedAt: new Date(), version: "1", requestId: "request-1", source: "test", operation: "AUTHORIZE" },
        }),
    };
    const service = new DefaultPaymentInitiationService(
      { execute: async () => engineResult } as never,
      gateway as never,
      repository as never,
      "SANDBOX",
    );

    const first = await service.initiatePayment(request as never);
    const retry = await service.initiatePayment(request as never);

    expect(first.status).toBe("FAILED");
    expect(first.hostedPaymentAction).toBeUndefined();
    expect(retry.paymentAttemptId).toBe("attempt-1");
    expect(retry.paymentReference).toBe("gct-attempt-1");
    expect(retry.hostedPaymentAction?.fields.m_payment_id).toBe("gct-attempt-1");
    expect(repository.createOrFind).toHaveBeenCalledTimes(2);
    expect(repository.claimInitiation).toHaveBeenCalledTimes(2);
    expect(gateway.execute).toHaveBeenCalledTimes(2);
    expect(repository.updateStatus).toHaveBeenCalledWith(
      "gct-attempt-1",
      PaymentStatus.AUTHORIZATION_FAILED,
      undefined,
      expect.any(Date),
    );
  });
});

describe("CanonicalReservationPaymentContextResolver", () => {
  it("derives the payable amount and currency from the canonical Reservation", async (): Promise<void> => {
    const resolver = new CanonicalReservationPaymentContextResolver({
      findByJourneyId: async () => [{
        identity: { id: "reservation-1" },
        reservationNumber: "RES-1",
        status: "CONFIRMED",
        journeySnapshot: { journeyId: "journey-homepage-journey-001" },
        pricingSnapshot: {
          snapshotId: "pricing-1",
          capturedAt: new Date("2026-08-28T00:00:00.000Z"),
          version: "1.0.0",
          currency: "ZAR",
          totalPrice: 64990.09,
          taxes: 0,
          discounts: 0,
          fees: 0,
        },
        paymentSnapshot: undefined,
        supplierReferences: [{
          providerId: "gct-test-simulator",
          reservationStatusId: "SIMULATED",
          isSimulated: true,
        }],
        metadata: {
          createdAt: new Date("2026-08-28T00:00:00.000Z"),
          updatedAt: new Date("2026-08-28T00:00:00.000Z"),
          version: "1.0.0",
        },
      }] as never,
    } as never);

    const context = await resolver.resolveForJourney("journey-homepage-journey-001");

    expect(context?.engineRequest.paymentRequest.paymentAmount).toBe(64990.09);
    expect(context?.engineRequest.paymentRequest.currency).toBe("ZAR");
    expect(context?.engineRequest.paymentRequest.reference?.reservationId).toBe("reservation-1");
    expect(context?.simulatedSupplierFulfilment).toBe(true);
  });
});
