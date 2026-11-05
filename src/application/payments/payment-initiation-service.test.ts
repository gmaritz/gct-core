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

  it("uses the gateway with authoritative payment amount and currency", async (): Promise<void> => {
    const repository = {
      createOrFind: jest.fn().mockResolvedValue({
        attemptId: "attempt-1",
        paymentReference: "gct-reference-1",
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
    const attempt = { attemptId: "attempt-1", paymentReference: "gct-attempt-1", status: PaymentStatus.CREATED };
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
