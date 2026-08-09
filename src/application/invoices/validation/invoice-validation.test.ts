import {
  CommercialValidator,
  createInvoiceValidationResult,
  FinancialIntegrityValidator,
  InvoiceRequestValidator,
  InvoiceValidationErrorCode,
  InvoiceValidationPipeline,
  InvoiceValidationRequest,
  InvoiceValidationResult,
  InvoiceValidationStage,
  LifecycleReadinessValidator,
  ReservationValidator,
} from "@application/invoices/validation";
import { Invoice, InvoiceComposition, InvoiceStatus } from "@application/invoices";

function createInvoiceComposition(overrides?: Partial<InvoiceComposition>): InvoiceComposition {
  return {
    identity: { id: "invoice-001" },
    reservationReference: { reservationId: "reservation-001" },
    customerReference: { customerId: "customer-001" },
    quoteReference: { quoteId: "quote-001", quoteVersion: "v1" },
    pricingSnapshot: {
      snapshotId: "pricing-snapshot-001",
      pricingId: "pricing-001",
      capturedAt: new Date("2026-08-09T10:00:00.000Z"),
      version: "1.0.0",
      currency: "ZAR",
      totalAmount: 10000,
    },
    status: InvoiceStatus.ISSUED,
    financialObligation: { totalAmount: 10000, currency: "ZAR" },
    depositRequirement: { type: "PERCENTAGE", value: 20 },
    paymentAllocations: [
      {
        paymentId: "payment-001",
        allocatedAmount: 2500,
        allocatedAt: new Date("2026-08-09T11:00:00.000Z"),
        externalReference: "ALLOC-001",
      },
    ],
    amountPaid: 2500,
    balanceDue: 7500,
    dueDate: new Date("2026-08-20T00:00:00.000Z"),
    adjustments: [
      {
        id: "adj-001",
        type: "MANUAL",
        amount: 200,
        reason: "Approved",
        appliedAt: new Date("2026-08-09T12:00:00.000Z"),
      },
    ],
    cancellationSnapshot: {
      policyReference: "POL-001",
      cancellationDate: new Date("2026-08-10T09:00:00.000Z"),
      cancellationCharge: 1000,
      refundableAmount: 1500,
    },
    refundableAmount: 1500,
    externalReferences: [{ system: "QUICKBOOKS", reference: "INV-1001" }],
    metadata: {
      createdAt: new Date("2026-08-09T09:00:00.000Z"),
      updatedAt: new Date("2026-08-09T14:00:00.000Z"),
      version: "1.0.0",
    },
    ...(overrides ?? {}),
  };
}

function createInvoice(overrides?: Partial<InvoiceComposition>): Invoice {
  return Invoice.create(createInvoiceComposition(overrides));
}

function createValidRequest(overrides?: Partial<InvoiceValidationRequest>): InvoiceValidationRequest {
  const invoice = createInvoice();
  return {
    invoice,
    reservationReference: invoice.reservationReference,
    customerReference: invoice.customerReference,
    quoteReference: invoice.quoteReference,
    pricingSnapshot: invoice.pricingSnapshot,
    financialObligation: invoice.financialObligation,
    reservationContext: {
      exists: true,
      status: "CONFIRMED",
      reservationId: invoice.reservationReference.reservationId,
    },
    requiresExistingInvoice: true,
    requiresMutableState: false,
    ...(overrides ?? {}),
  };
}

describe("InvoiceRequestValidator", () => {
  it("passes for a valid request", () => {
    const validator = new InvoiceRequestValidator();

    const result = validator.validate(createValidRequest());

    expect(result.success).toBe(true);
    expect(result.stage).toBe(InvoiceValidationStage.REQUEST);
  });

  it("fails for missing request", () => {
    const validator = new InvoiceRequestValidator();

    const result = validator.validate(undefined);

    expect(result.success).toBe(false);
    expect(result.errors[0]?.code).toBe(InvoiceValidationErrorCode.MISSING_REQUEST);
  });

  it("fails for missing required references", () => {
    const validator = new InvoiceRequestValidator();

    const result = validator.validate({
      requiresExistingInvoice: true,
    });

    const codes = result.errors.map((error) => error.code);
    expect(codes).toContain(InvoiceValidationErrorCode.MISSING_INVOICE_IDENTIFIER);
    expect(codes).toContain(InvoiceValidationErrorCode.MISSING_RESERVATION_REFERENCE);
    expect(codes).toContain(InvoiceValidationErrorCode.MISSING_CUSTOMER_REFERENCE);
    expect(codes).toContain(InvoiceValidationErrorCode.MISSING_QUOTE_REFERENCE);
    expect(codes).toContain(InvoiceValidationErrorCode.MISSING_PRICING_SNAPSHOT);
    expect(codes).toContain(InvoiceValidationErrorCode.MISSING_FINANCIAL_OBLIGATION);
  });

  it("fails for blank required values", () => {
    const validator = new InvoiceRequestValidator();

    const result = validator.validate({
      invoice: createInvoice(),
      reservationReference: { reservationId: " " },
      customerReference: { customerId: " ", travellerId: " " },
      quoteReference: { quoteId: " ", quoteVersion: " " },
      pricingSnapshot: createInvoice().pricingSnapshot,
      financialObligation: createInvoice().financialObligation,
      requiresExistingInvoice: true,
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === InvoiceValidationErrorCode.MISSING_RESERVATION_REFERENCE)).toBe(true);
    expect(result.errors.some((error) => error.code === InvoiceValidationErrorCode.MISSING_CUSTOMER_REFERENCE)).toBe(true);
    expect(result.errors.some((error) => error.code === InvoiceValidationErrorCode.MISSING_QUOTE_REFERENCE)).toBe(true);
  });
});

describe("ReservationValidator", () => {
  it("passes for confirmed reservation context", () => {
    const validator = new ReservationValidator();

    const result = validator.validate(createValidRequest());

    expect(result.success).toBe(true);
  });

  it("fails for missing reservation", () => {
    const validator = new ReservationValidator();

    const result = validator.validate(
      createValidRequest({
        reservationContext: {
          exists: false,
          status: "UNKNOWN",
        },
      }),
    );

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === InvoiceValidationErrorCode.MISSING_RESERVATION)).toBe(true);
  });

  it("fails for cancelled reservation", () => {
    const validator = new ReservationValidator();

    const result = validator.validate(
      createValidRequest({
        reservationContext: {
          exists: true,
          status: "CANCELLED",
        },
      }),
    );

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === InvoiceValidationErrorCode.RESERVATION_CANCELLED)).toBe(true);
  });

  it("fails when reservation context is not confirmed", () => {
    const validator = new ReservationValidator();

    const result = validator.validate(
      createValidRequest({
        reservationContext: {
          exists: true,
          status: "CREATED",
        },
      }),
    );

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === InvoiceValidationErrorCode.RESERVATION_NOT_CONFIRMED)).toBe(true);
  });

  it("fails for reservation reference inconsistency", () => {
    const validator = new ReservationValidator();

    const result = validator.validate(
      createValidRequest({
        reservationContext: {
          exists: true,
          status: "CONFIRMED",
          reservationId: "reservation-other",
        },
      }),
    );

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === InvoiceValidationErrorCode.MISSING_RESERVATION_REFERENCE)).toBe(true);
  });
});

describe("CommercialValidator", () => {
  it("passes for valid commercial references", () => {
    const validator = new CommercialValidator();

    const result = validator.validate(createValidRequest());

    expect(result.success).toBe(true);
  });

  it("fails for missing pricing snapshot", () => {
    const validator = new CommercialValidator();

    const result = validator.validate(
      createValidRequest({
        pricingSnapshot: null,
        invoice: null,
      }),
    );

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === InvoiceValidationErrorCode.MISSING_PRICING_SNAPSHOT)).toBe(true);
  });

  it("fails for invalid pricing snapshot and mismatches", () => {
    const validator = new CommercialValidator();

    const result = validator.validate(
      createValidRequest({
        pricingSnapshot: {
          ...createInvoice().pricingSnapshot,
          snapshotId: " ",
          pricingId: "",
          version: " ",
          currency: "USD",
          totalAmount: 9999,
        },
      }),
    );

    const codes = result.errors.map((error) => error.code);
    expect(codes).toContain(InvoiceValidationErrorCode.PRICING_REFERENCE_INCONSISTENT);
    expect(codes).toContain(InvoiceValidationErrorCode.PRICING_CURRENCY_MISMATCH);
    expect(codes).toContain(InvoiceValidationErrorCode.PRICING_TOTAL_MISMATCH);
  });

  it("fails for quote reference inconsistency", () => {
    const validator = new CommercialValidator();

    const result = validator.validate(
      createValidRequest({
        quoteReference: {
          quoteId: "quote-other",
          quoteVersion: "v9",
        },
      }),
    );

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === InvoiceValidationErrorCode.QUOTE_REFERENCE_INCONSISTENT)).toBe(true);
  });
});

describe("FinancialIntegrityValidator", () => {
  it("passes for valid financial state", () => {
    const validator = new FinancialIntegrityValidator();

    const result = validator.validate(createValidRequest());

    expect(result.success).toBe(true);
  });

  it("fails for invalid financial values and structures", () => {
    const validator = new FinancialIntegrityValidator();

    const invoice = {
      ...createInvoice(),
      financialObligation: { totalAmount: Number.NaN, currency: "ZAR" },
      amountPaid: Number.NEGATIVE_INFINITY,
      balanceDue: -1,
      refundableAmount: -1,
      depositRequirement: { type: "PERCENTAGE", value: 200 },
      paymentAllocations: [
        {
          paymentId: "",
          allocatedAmount: 0,
          allocatedAt: new Date("invalid"),
          externalReference: " ",
        },
      ],
      adjustments: [
        {
          id: "",
          type: "",
          amount: Number.NaN,
          reason: "",
          appliedAt: new Date("invalid"),
        },
      ],
      cancellationSnapshot: {
        policyReference: "",
        policyVersion: " ",
        effectiveFrom: new Date("invalid"),
        effectiveTo: new Date("invalid"),
        cancellationDate: new Date("invalid"),
        cancellationCharge: -1,
        refundableAmount: -1,
      },
      dueDate: new Date("invalid"),
      externalReferences: [{ system: "", reference: " " }],
      metadata: {
        createdAt: new Date("invalid"),
        updatedAt: new Date("invalid"),
        version: " ",
      },
    } as unknown as Invoice;

    const result = validator.validate(createValidRequest({ invoice, financialObligation: undefined }));
    const codes = result.errors.map((error) => error.code);

    expect(codes).toContain(InvoiceValidationErrorCode.INVALID_TOTAL_AMOUNT);
    expect(codes).toContain(InvoiceValidationErrorCode.INVALID_AMOUNT_PAID);
    expect(codes).toContain(InvoiceValidationErrorCode.INVALID_BALANCE_DUE);
    expect(codes).toContain(InvoiceValidationErrorCode.INVALID_REFUNDABLE_AMOUNT);
    expect(codes).toContain(InvoiceValidationErrorCode.INVALID_DEPOSIT_REQUIREMENT);
    expect(codes).toContain(InvoiceValidationErrorCode.INVALID_PAYMENT_ALLOCATION);
    expect(codes).toContain(InvoiceValidationErrorCode.INVALID_ADJUSTMENT);
    expect(codes).toContain(InvoiceValidationErrorCode.INVALID_CANCELLATION_SNAPSHOT);
    expect(codes).toContain(InvoiceValidationErrorCode.INVALID_DUE_DATE);
    expect(codes).toContain(InvoiceValidationErrorCode.INVALID_EXTERNAL_REFERENCE);
    expect(codes).toContain(InvoiceValidationErrorCode.INVALID_METADATA);
  });

  it("fails on payment allocation total mismatch", () => {
    const validator = new FinancialIntegrityValidator();

    const invoice = createInvoice({
      amountPaid: 3000,
      paymentAllocations: [
        {
          paymentId: "payment-001",
          allocatedAmount: 2500,
          allocatedAt: new Date("2026-08-09T11:00:00.000Z"),
        },
      ],
    });

    const result = validator.validate(createValidRequest({ invoice }));

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === InvoiceValidationErrorCode.PAYMENT_ALLOCATION_TOTAL_MISMATCH)).toBe(true);
  });

  it("does not mutate invoice state", () => {
    const validator = new FinancialIntegrityValidator();
    const invoice = createInvoice();
    const beforeAmountPaid = invoice.amountPaid;
    const beforeAllocationCount = invoice.paymentAllocations.length;

    validator.validate(createValidRequest({ invoice }));

    expect(invoice.amountPaid).toBe(beforeAmountPaid);
    expect(invoice.paymentAllocations.length).toBe(beforeAllocationCount);
  });
});

describe("LifecycleReadinessValidator", () => {
  it("passes for valid lifecycle state", () => {
    const validator = new LifecycleReadinessValidator();

    const result = validator.validate(createValidRequest());

    expect(result.success).toBe(true);
  });

  it("fails for unsupported status", () => {
    const validator = new LifecycleReadinessValidator();
    const invoice = {
      ...createInvoice(),
      status: "NOT_A_STATUS",
    } as unknown as Invoice;

    const result = validator.validate(createValidRequest({ invoice }));

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.code === InvoiceValidationErrorCode.INVALID_INVOICE_STATUS)).toBe(true);
  });

  it("flags terminal CANCELLED and VOID when mutable state is required", () => {
    const validator = new LifecycleReadinessValidator();

    const cancelled = validator.validate(
      createValidRequest({
        invoice: createInvoice({ status: InvoiceStatus.CANCELLED }),
        requiresMutableState: true,
      }),
    );
    const voided = validator.validate(
      createValidRequest({
        invoice: createInvoice({ status: InvoiceStatus.VOID }),
        requiresMutableState: true,
      }),
    );

    expect(cancelled.errors.some((error) => error.code === InvoiceValidationErrorCode.INVOICE_ALREADY_CANCELLED)).toBe(true);
    expect(voided.errors.some((error) => error.code === InvoiceValidationErrorCode.INVOICE_ALREADY_VOID)).toBe(true);
  });
});

describe("InvoiceValidationPipeline", () => {
  it("executes validators in deterministic order", () => {
    const callOrder: string[] = [];

    const pipeline = new InvoiceValidationPipeline(
      {
        validate: jest.fn(() => {
          callOrder.push("request");
          return createInvoiceValidationResult({
            stage: InvoiceValidationStage.REQUEST,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          });
        }),
      } as unknown as InvoiceRequestValidator,
      {
        validate: jest.fn(() => {
          callOrder.push("reservation");
          return createInvoiceValidationResult({
            stage: InvoiceValidationStage.RESERVATION,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          });
        }),
      } as unknown as ReservationValidator,
      {
        validate: jest.fn(() => {
          callOrder.push("commercial");
          return createInvoiceValidationResult({
            stage: InvoiceValidationStage.COMMERCIAL,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          });
        }),
      } as unknown as CommercialValidator,
      {
        validate: jest.fn(() => {
          callOrder.push("financial");
          return createInvoiceValidationResult({
            stage: InvoiceValidationStage.FINANCIAL_INTEGRITY,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          });
        }),
      } as unknown as FinancialIntegrityValidator,
      {
        validate: jest.fn(() => {
          callOrder.push("lifecycle");
          return createInvoiceValidationResult({
            stage: InvoiceValidationStage.LIFECYCLE_READINESS,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          });
        }),
      } as unknown as LifecycleReadinessValidator,
    );

    const result = pipeline.execute(createValidRequest());

    expect(callOrder).toEqual(["request", "reservation", "commercial", "financial", "lifecycle"]);
    expect(result.stage).toBe(InvoiceValidationStage.LIFECYCLE_READINESS);
  });

  it("stops on request critical error", () => {
    const reservationValidator = { validate: jest.fn() } as unknown as ReservationValidator;
    const commercialValidator = { validate: jest.fn() } as unknown as CommercialValidator;
    const financialValidator = { validate: jest.fn() } as unknown as FinancialIntegrityValidator;
    const lifecycleValidator = { validate: jest.fn() } as unknown as LifecycleReadinessValidator;

    const pipeline = new InvoiceValidationPipeline(
      {
        validate: jest.fn(() =>
          createInvoiceValidationResult({
            stage: InvoiceValidationStage.REQUEST,
            errors: [
              {
                stage: InvoiceValidationStage.REQUEST,
                code: InvoiceValidationErrorCode.MISSING_REQUEST,
                message: "Missing",
                severity: "CRITICAL",
              },
            ],
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          }),
        ),
      } as unknown as InvoiceRequestValidator,
      reservationValidator,
      commercialValidator,
      financialValidator,
      lifecycleValidator,
    );

    const result = pipeline.execute(createValidRequest());

    expect(result.stage).toBe(InvoiceValidationStage.REQUEST);
    expect(reservationValidator.validate).not.toHaveBeenCalled();
    expect(commercialValidator.validate).not.toHaveBeenCalled();
    expect(financialValidator.validate).not.toHaveBeenCalled();
    expect(lifecycleValidator.validate).not.toHaveBeenCalled();
  });

  it("stops on reservation critical error", () => {
    const commercialValidator = { validate: jest.fn() } as unknown as CommercialValidator;
    const financialValidator = { validate: jest.fn() } as unknown as FinancialIntegrityValidator;
    const lifecycleValidator = { validate: jest.fn() } as unknown as LifecycleReadinessValidator;

    const pipeline = new InvoiceValidationPipeline(
      {
        validate: jest.fn(() =>
          createInvoiceValidationResult({
            stage: InvoiceValidationStage.REQUEST,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          }),
        ),
      } as unknown as InvoiceRequestValidator,
      {
        validate: jest.fn(() =>
          createInvoiceValidationResult({
            stage: InvoiceValidationStage.RESERVATION,
            errors: [
              {
                stage: InvoiceValidationStage.RESERVATION,
                code: InvoiceValidationErrorCode.MISSING_RESERVATION,
                message: "Missing reservation",
                severity: "CRITICAL",
              },
            ],
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          }),
        ),
      } as unknown as ReservationValidator,
      commercialValidator,
      financialValidator,
      lifecycleValidator,
    );

    pipeline.execute(createValidRequest());

    expect(commercialValidator.validate).not.toHaveBeenCalled();
    expect(financialValidator.validate).not.toHaveBeenCalled();
    expect(lifecycleValidator.validate).not.toHaveBeenCalled();
  });

  it("stops on commercial critical error", () => {
    const financialValidator = { validate: jest.fn() } as unknown as FinancialIntegrityValidator;
    const lifecycleValidator = { validate: jest.fn() } as unknown as LifecycleReadinessValidator;

    const pipeline = new InvoiceValidationPipeline(
      {
        validate: jest.fn(() =>
          createInvoiceValidationResult({
            stage: InvoiceValidationStage.REQUEST,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          }),
        ),
      } as unknown as InvoiceRequestValidator,
      {
        validate: jest.fn(() =>
          createInvoiceValidationResult({
            stage: InvoiceValidationStage.RESERVATION,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          }),
        ),
      } as unknown as ReservationValidator,
      {
        validate: jest.fn(() =>
          createInvoiceValidationResult({
            stage: InvoiceValidationStage.COMMERCIAL,
            errors: [
              {
                stage: InvoiceValidationStage.COMMERCIAL,
                code: InvoiceValidationErrorCode.PRICING_TOTAL_MISMATCH,
                message: "Mismatch",
                severity: "CRITICAL",
              },
            ],
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          }),
        ),
      } as unknown as CommercialValidator,
      financialValidator,
      lifecycleValidator,
    );

    pipeline.execute(createValidRequest());

    expect(financialValidator.validate).not.toHaveBeenCalled();
    expect(lifecycleValidator.validate).not.toHaveBeenCalled();
  });

  it("stops on financial critical error", () => {
    const lifecycleValidator = { validate: jest.fn() } as unknown as LifecycleReadinessValidator;

    const pipeline = new InvoiceValidationPipeline(
      {
        validate: jest.fn(() =>
          createInvoiceValidationResult({
            stage: InvoiceValidationStage.REQUEST,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          }),
        ),
      } as unknown as InvoiceRequestValidator,
      {
        validate: jest.fn(() =>
          createInvoiceValidationResult({
            stage: InvoiceValidationStage.RESERVATION,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          }),
        ),
      } as unknown as ReservationValidator,
      {
        validate: jest.fn(() =>
          createInvoiceValidationResult({
            stage: InvoiceValidationStage.COMMERCIAL,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          }),
        ),
      } as unknown as CommercialValidator,
      {
        validate: jest.fn(() =>
          createInvoiceValidationResult({
            stage: InvoiceValidationStage.FINANCIAL_INTEGRITY,
            errors: [
              {
                stage: InvoiceValidationStage.FINANCIAL_INTEGRITY,
                code: InvoiceValidationErrorCode.INVALID_BALANCE_DUE,
                message: "Invalid balance",
                severity: "CRITICAL",
              },
            ],
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          }),
        ),
      } as unknown as FinancialIntegrityValidator,
      lifecycleValidator,
    );

    pipeline.execute(createValidRequest());

    expect(lifecycleValidator.validate).not.toHaveBeenCalled();
  });

  it("does not fail-fast on warnings", () => {
    const callOrder: string[] = [];
    const warningResult = createInvoiceValidationResult({
      stage: InvoiceValidationStage.REQUEST,
      warnings: ["warning"],
      metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
    });

    const pipeline = new InvoiceValidationPipeline(
      {
        validate: jest.fn(() => {
          callOrder.push("request");
          return warningResult;
        }),
      } as unknown as InvoiceRequestValidator,
      {
        validate: jest.fn(() => {
          callOrder.push("reservation");
          return createInvoiceValidationResult({
            stage: InvoiceValidationStage.RESERVATION,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          });
        }),
      } as unknown as ReservationValidator,
      {
        validate: jest.fn(() => {
          callOrder.push("commercial");
          return createInvoiceValidationResult({
            stage: InvoiceValidationStage.COMMERCIAL,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          });
        }),
      } as unknown as CommercialValidator,
      {
        validate: jest.fn(() => {
          callOrder.push("financial");
          return createInvoiceValidationResult({
            stage: InvoiceValidationStage.FINANCIAL_INTEGRITY,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          });
        }),
      } as unknown as FinancialIntegrityValidator,
      {
        validate: jest.fn(() => {
          callOrder.push("lifecycle");
          return createInvoiceValidationResult({
            stage: InvoiceValidationStage.LIFECYCLE_READINESS,
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          });
        }),
      } as unknown as LifecycleReadinessValidator,
    );

    const result = pipeline.execute(createValidRequest());

    expect(callOrder).toEqual(["request", "reservation", "commercial", "financial", "lifecycle"]);
    expect(result.success).toBe(true);
    expect(result.warnings).toEqual(["warning"]);
  });

  it("aggregates errors from executed stages", () => {
    const pipeline = new InvoiceValidationPipeline(
      {
        validate: jest.fn(() =>
          createInvoiceValidationResult({
            stage: InvoiceValidationStage.REQUEST,
            errors: [
              {
                stage: InvoiceValidationStage.REQUEST,
                code: InvoiceValidationErrorCode.MISSING_RESERVATION_REFERENCE,
                message: "Missing reservation",
                severity: "CRITICAL",
              },
            ],
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          }),
        ),
      } as unknown as InvoiceRequestValidator,
      { validate: jest.fn() } as unknown as ReservationValidator,
      { validate: jest.fn() } as unknown as CommercialValidator,
      { validate: jest.fn() } as unknown as FinancialIntegrityValidator,
      { validate: jest.fn() } as unknown as LifecycleReadinessValidator,
    );

    const result = pipeline.execute(createValidRequest());

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.stage).toBe(InvoiceValidationStage.REQUEST);
    expect(result.errors[0]?.severity).toBe("CRITICAL");
  });

  it("returns immutable aggregate result and cloned metadata date", () => {
    const metadata = {
      validatedAt: new Date("2026-08-09T10:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    };

    const result = createInvoiceValidationResult({
      stage: InvoiceValidationStage.REQUEST,
      errors: [
        {
          stage: InvoiceValidationStage.REQUEST,
          code: InvoiceValidationErrorCode.MISSING_REQUEST,
          message: "Missing request",
          severity: "CRITICAL",
        },
      ],
      warnings: ["warning"],
      metadata,
    });

    metadata.validatedAt.setUTCFullYear(2040);

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(Object.isFrozen(result.errors[0])).toBe(true);
    expect(result.metadata.validatedAt.getUTCFullYear()).toBe(2026);
  });

  it("validators are stateless across multiple validations", () => {
    const validator = new InvoiceRequestValidator();

    const invalid = validator.validate(undefined);
    const valid = validator.validate(createValidRequest());

    expect(invalid.success).toBe(false);
    expect(valid.success).toBe(true);
  });

  it("uses concrete validators end-to-end without external dependencies", () => {
    const pipeline: InvoiceValidationPipeline = new InvoiceValidationPipeline(
      new InvoiceRequestValidator(),
      new ReservationValidator(),
      new CommercialValidator(),
      new FinancialIntegrityValidator(),
      new LifecycleReadinessValidator(),
    );

    const result: InvoiceValidationResult = pipeline.execute(createValidRequest());

    expect(result.success).toBe(true);
    expect(result.stage).toBe(InvoiceValidationStage.LIFECYCLE_READINESS);
  });
});