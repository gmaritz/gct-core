import {
  PaymentMethod,
  PaymentStatus,
} from "@application/payments/models";
import {
  createPaymentValidationResult,
  PaymentValidationErrorCode,
  GatewayReadinessValidator,
  PaymentRequestValidator,
  PaymentValidationPipeline,
  PaymentValidationRequest,
  PaymentValidationResult,
  PaymentValidationStage,
  PricingValidator,
  ReservationValidator,
  SettlementReadinessValidator,
} from "@application/payments/validation";

function createValidRequest(): PaymentValidationRequest {
  return Object.freeze({
    reference: Object.freeze({
      paymentId: "payment-3001",
      reservationId: "reservation-3001",
      quotationNumber: "Q-3001",
    }),
    reservationSnapshot: Object.freeze({
      snapshotId: "reservation-snap-3001",
      capturedAt: new Date("2026-08-07T13:00:00.000Z"),
      version: "1.0.0",
      reservationId: "reservation-3001",
      reservationReference: "RES-3001",
    }),
    pricingSnapshot: Object.freeze({
      snapshotId: "pricing-snap-3001",
      capturedAt: new Date("2026-08-07T13:01:00.000Z"),
      version: "1.0.0",
      pricingId: "pricing-3001",
      subtotal: 12000,
      taxes: 1500,
      discounts: 300,
      fees: 100,
      total: 13300,
      currency: "ZAR",
    }),
    paymentAmount: 13300,
    currency: "ZAR",
    paymentMethod: PaymentMethod.CARD,
    status: PaymentStatus.CREATED,
    metadata: Object.freeze({
      createdAt: new Date("2026-08-07T13:00:00.000Z"),
      updatedAt: new Date("2026-08-07T13:00:00.000Z"),
      version: "1.0.0",
      source: "test",
      audit: Object.freeze({
        correlationId: "corr-3001",
        requestId: "request-3001",
      }),
    }),
    reservationContext: Object.freeze({
      exists: true,
      status: "CONFIRMED",
      payable: true,
    }),
    gatewayContext: Object.freeze({
      providerReference: Object.freeze({
        providerIdentifier: "gateway-a",
        reference: "GW-3001",
      }),
      correlationId: "corr-3001",
      requestId: "request-3001",
      paymentContextId: "payment-context-3001",
    }),
  });
}

describe("PaymentRequestValidator", () => {
  it("passes for a valid request", () => {
    const validator = new PaymentRequestValidator();
    const result = validator.validate(createValidRequest());

    expect(result.success).toBe(true);
    expect(result.stage).toBe(PaymentValidationStage.REQUEST);
  });

  it("fails when payment identifier is missing", () => {
    const validator = new PaymentRequestValidator();
    const request = createValidRequest();

    const result = validator.validate({
      ...request,
      reference: {
        ...request.reference!,
        paymentId: "",
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === "MISSING_PAYMENT_IDENTIFIER")).toBe(true);
  });

  it("fails when payment method is missing", () => {
    const validator = new PaymentRequestValidator();
    const request = createValidRequest();

    const result = validator.validate({
      ...request,
      paymentMethod: null,
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === "MISSING_PAYMENT_METHOD")).toBe(true);
  });
});

describe("ReservationValidator", () => {
  it("passes for a payable reservation", () => {
    const validator = new ReservationValidator();
    const result = validator.validate(createValidRequest());

    expect(result.success).toBe(true);
  });

  it("fails when reservation is cancelled", () => {
    const validator = new ReservationValidator();
    const request = createValidRequest();

    const result = validator.validate({
      ...request,
      reservationContext: {
        exists: true,
        status: "CANCELLED",
        payable: false,
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === "RESERVATION_CANCELLED")).toBe(true);
  });

  it("fails when reservation is missing", () => {
    const validator = new ReservationValidator();
    const request = createValidRequest();

    const result = validator.validate({
      ...request,
      reservationContext: {
        exists: false,
        status: "UNKNOWN",
        payable: false,
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === "MISSING_RESERVATION")).toBe(true);
  });
});

describe("PricingValidator", () => {
  it("passes for valid pricing", () => {
    const validator = new PricingValidator();
    const result = validator.validate(createValidRequest());

    expect(result.success).toBe(true);
  });

  it("fails for invalid totals", () => {
    const validator = new PricingValidator();
    const request = createValidRequest();

    const result = validator.validate({
      ...request,
      pricingSnapshot: {
        ...request.pricingSnapshot!,
        total: 0,
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === "INVALID_PRICING_TOTAL")).toBe(true);
  });

  it("fails for currency mismatch", () => {
    const validator = new PricingValidator();
    const request = createValidRequest();

    const result = validator.validate({
      ...request,
      currency: "USD",
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === "CURRENCY_MISMATCH")).toBe(true);
  });
});

describe("SettlementReadinessValidator", () => {
  it("passes for supported payment method", () => {
    const validator = new SettlementReadinessValidator();
    const result = validator.validate(createValidRequest());

    expect(result.success).toBe(true);
  });

  it("fails for unsupported currency", () => {
    const validator = new SettlementReadinessValidator();
    const request = createValidRequest();

    const result = validator.validate({
      ...request,
      currency: "ABC",
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === "UNSUPPORTED_CURRENCY")).toBe(true);
  });

  it("fails for invalid settlement metadata", () => {
    const validator = new SettlementReadinessValidator();
    const request = createValidRequest();

    const result = validator.validate({
      ...request,
      metadata: {
        ...request.metadata!,
        source: "",
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === "INVALID_SETTLEMENT_METADATA")).toBe(true);
  });
});

describe("GatewayReadinessValidator", () => {
  it("passes for complete gateway context", () => {
    const validator = new GatewayReadinessValidator();
    const result = validator.validate(createValidRequest());

    expect(result.success).toBe(true);
  });

  it("fails for incomplete gateway context", () => {
    const validator = new GatewayReadinessValidator();
    const request = createValidRequest();

    const result = validator.validate({
      ...request,
      gatewayContext: {
        providerReference: {
          providerIdentifier: "gateway-a",
          reference: "",
        },
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === "INCOMPLETE_GATEWAY_CONTEXT" || error.code === "MISSING_PROVIDER_REFERENCE")).toBe(true);
  });
});

describe("PaymentValidationPipeline", () => {
  it("executes validators in order with constructor injection", () => {
    const callOrder: string[] = [];

    const requestValidator = {
      validate: jest.fn(() => {
        callOrder.push("request");
        return createPaymentValidationResult({
          stage: PaymentValidationStage.REQUEST,
          metadata: {
            validatedAt: new Date(),
            version: "1.0.0",
            source: "test",
          },
        });
      }),
    } as unknown as PaymentRequestValidator;

    const reservationValidator = {
      validate: jest.fn(() => {
        callOrder.push("reservation");
        return createPaymentValidationResult({
          stage: PaymentValidationStage.RESERVATION,
          metadata: {
            validatedAt: new Date(),
            version: "1.0.0",
            source: "test",
          },
        });
      }),
    } as unknown as ReservationValidator;

    const pricingValidator = {
      validate: jest.fn(() => {
        callOrder.push("pricing");
        return createPaymentValidationResult({
          stage: PaymentValidationStage.PRICING,
          metadata: {
            validatedAt: new Date(),
            version: "1.0.0",
            source: "test",
          },
        });
      }),
    } as unknown as PricingValidator;

    const settlementValidator = {
      validate: jest.fn(() => {
        callOrder.push("settlement");
        return createPaymentValidationResult({
          stage: PaymentValidationStage.SETTLEMENT_READINESS,
          metadata: {
            validatedAt: new Date(),
            version: "1.0.0",
            source: "test",
          },
        });
      }),
    } as unknown as SettlementReadinessValidator;

    const gatewayValidator = {
      validate: jest.fn(() => {
        callOrder.push("gateway");
        return createPaymentValidationResult({
          stage: PaymentValidationStage.GATEWAY_READINESS,
          metadata: {
            validatedAt: new Date(),
            version: "1.0.0",
            source: "test",
          },
        });
      }),
    } as unknown as GatewayReadinessValidator;

    const pipeline = new PaymentValidationPipeline(
      requestValidator,
      reservationValidator,
      pricingValidator,
      settlementValidator,
      gatewayValidator,
    );

    const result = pipeline.execute(createValidRequest());

    expect(callOrder).toEqual(["request", "reservation", "pricing", "settlement", "gateway"]);
    expect(result.stage).toBe(PaymentValidationStage.GATEWAY_READINESS);
  });

  it("stops on critical errors (fail-fast)", () => {
    const requestValidator = {
      validate: jest.fn(() =>
        createPaymentValidationResult({
          stage: PaymentValidationStage.REQUEST,
          errors: [
            {
              stage: PaymentValidationStage.REQUEST,
              code: PaymentValidationErrorCode.MISSING_PAYMENT_IDENTIFIER,
              message: "Missing",
              severity: "CRITICAL",
            },
          ],
          metadata: {
            validatedAt: new Date(),
            version: "1.0.0",
            source: "test",
          },
        }),
      ),
    } as unknown as PaymentRequestValidator;

    const reservationValidator = { validate: jest.fn() } as unknown as ReservationValidator;
    const pricingValidator = { validate: jest.fn() } as unknown as PricingValidator;
    const settlementValidator = { validate: jest.fn() } as unknown as SettlementReadinessValidator;
    const gatewayValidator = { validate: jest.fn() } as unknown as GatewayReadinessValidator;

    const pipeline = new PaymentValidationPipeline(
      requestValidator,
      reservationValidator,
      pricingValidator,
      settlementValidator,
      gatewayValidator,
    );

    const result = pipeline.execute(createValidRequest());

    expect(result.success).toBe(false);
    expect(result.stage).toBe(PaymentValidationStage.REQUEST);
    expect(reservationValidator.validate).not.toHaveBeenCalled();
    expect(pricingValidator.validate).not.toHaveBeenCalled();
    expect(settlementValidator.validate).not.toHaveBeenCalled();
    expect(gatewayValidator.validate).not.toHaveBeenCalled();
  });

  it("returns immutable result and compile-safe usage", () => {
    const pipeline: PaymentValidationPipeline = new PaymentValidationPipeline(
      new PaymentRequestValidator(),
      new ReservationValidator(),
      new PricingValidator(),
      new SettlementReadinessValidator(),
      new GatewayReadinessValidator(),
    );

    const result: PaymentValidationResult = pipeline.execute(createValidRequest());

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(result.success).toBe(true);
  });
});
