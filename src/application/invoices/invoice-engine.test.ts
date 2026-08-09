import {
  Invoice,
  InvoiceComposition,
  InvoiceStatus,
} from "@application/invoices";
import {
  InvoiceEngine,
  InvoiceEngineErrorCode,
  InvoiceEngineOutcome,
  InvoiceEngineRequest,
  createInvoiceEngineResult,
  createInvoiceOperationExecution,
} from "@application/invoices/engine";
import {
  createInvoicePolicyContext,
  createInvoicePolicyResult,
  InvoiceOperation,
  InvoicePolicyOutcome,
  InvoicePolicyPriority,
  InvoiceRequiredAction,
} from "@application/invoices/policies";
import { createInvoiceValidationResult, InvoiceValidationStage } from "@application/invoices/validation";

function createComposition(status: InvoiceStatus = InvoiceStatus.DRAFT): InvoiceComposition {
  return {
    identity: { id: "invoice-engine-001" },
    reservationReference: { reservationId: "reservation-001" },
    customerReference: { customerId: "customer-001" },
    quoteReference: { quoteId: "quote-001", quoteVersion: "v1" },
    pricingSnapshot: {
      snapshotId: "pricing-snapshot-001",
      pricingId: "pricing-001",
      capturedAt: new Date("2026-08-09T14:00:00.000Z"),
      version: "1.0.0",
      currency: "ZAR",
      totalAmount: 10000,
    },
    status,
    financialObligation: { totalAmount: 10000, currency: "ZAR" },
    paymentAllocations: [],
    amountPaid: 0,
    balanceDue: 10000,
    adjustments: [],
    refundableAmount: 0,
    externalReferences: [{ system: "ACCOUNTING", reference: "INV-001" }],
    metadata: {
      createdAt: new Date("2026-08-09T14:00:00.000Z"),
      updatedAt: new Date("2026-08-09T14:00:00.000Z"),
      version: "1.0.0",
    },
  };
}

function createInvoice(status: InvoiceStatus = InvoiceStatus.DRAFT, overrides?: Partial<InvoiceComposition>): Invoice {
  return Invoice.create({
    ...createComposition(status),
    ...(overrides ?? {}),
  });
}

function createValidation(success = true) {
  return createInvoiceValidationResult({
    stage: InvoiceValidationStage.LIFECYCLE_READINESS,
    errors: success
      ? []
      : [
          {
            stage: InvoiceValidationStage.REQUEST,
            code: "MISSING_REQUEST" as never,
            message: "validation failed",
            severity: "CRITICAL",
          },
        ],
    warnings: success ? [] : ["validation warning"],
    metadata: {
      validatedAt: new Date("2026-08-09T14:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createPolicy(outcome: InvoicePolicyOutcome) {
  const permitted = outcome !== InvoicePolicyOutcome.DENY && outcome !== InvoicePolicyOutcome.REQUIRE_ACTION;
  return Object.freeze({
    permitted,
    outcome,
    priority: permitted ? InvoicePolicyPriority.NORMAL : InvoicePolicyPriority.HIGH,
    requiredActions: Object.freeze(
      outcome === InvoicePolicyOutcome.REQUIRE_ACTION ? [InvoiceRequiredAction.PAYMENT_REVIEW] : [],
    ),
    errors: Object.freeze(outcome === InvoicePolicyOutcome.DENY ? ["policy denied"] : []),
    warnings: Object.freeze(outcome === InvoicePolicyOutcome.WARNING ? ["policy warning"] : []),
    observations: Object.freeze([]),
    policyResults: Object.freeze([
      createInvoicePolicyResult({
        policyName: "test-policy",
        outcome,
        priority: permitted ? InvoicePolicyPriority.NORMAL : InvoicePolicyPriority.HIGH,
        metadata: {
          evaluatedAt: new Date("2026-08-09T14:01:00.000Z"),
          version: "1.0.0",
          source: "test",
        },
      }),
    ]),
    metadata: {
      evaluatedAt: new Date("2026-08-09T14:01:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createRequest(overrides?: Partial<InvoiceEngineRequest>): InvoiceEngineRequest {
  const invoice = createInvoice();
  return {
    operation: InvoiceOperation.ISSUE,
    invoice,
    validationRequest: {
      invoice,
      reservationReference: invoice.reservationReference,
      customerReference: invoice.customerReference,
      quoteReference: invoice.quoteReference,
      pricingSnapshot: invoice.pricingSnapshot,
      financialObligation: invoice.financialObligation,
      requiresExistingInvoice: true,
    },
    validationResult: createValidation(true),
    policyEvaluation: createPolicy(InvoicePolicyOutcome.ALLOW),
    operationInput: {
      operation: InvoiceOperation.ISSUE,
    },
    requestId: "invoice-engine-request-001",
    source: "test",
    ...(overrides ?? {}),
  };
}

describe("InvoiceEngine", () => {
  it("rejects unsuccessful validation", async () => {
    const engine = new InvoiceEngine();

    const result = await engine.execute(
      createRequest({
        validationResult: createValidation(false),
      }),
    );

    expect(result.success).toBe(false);
    expect(result.outcome).toBe(InvoiceEngineOutcome.REJECTED);
    expect(result.errors[0]?.code).toBe(InvoiceEngineErrorCode.VALIDATION_FAILED);
  });

  it("rejects denied policy", async () => {
    const engine = new InvoiceEngine();

    const result = await engine.execute(
      createRequest({
        policyEvaluation: createPolicy(InvoicePolicyOutcome.DENY),
      }),
    );

    expect(result.success).toBe(false);
    expect(result.outcome).toBe(InvoiceEngineOutcome.REJECTED);
    expect(result.errors[0]?.code).toBe(InvoiceEngineErrorCode.POLICY_DENIED);
  });

  it("returns pending action outcome when policy requires action", async () => {
    const engine = new InvoiceEngine();

    const result = await engine.execute(
      createRequest({
        policyEvaluation: createPolicy(InvoicePolicyOutcome.REQUIRE_ACTION),
      }),
    );

    expect(result.success).toBe(false);
    expect(result.outcome).toBe(InvoiceEngineOutcome.PENDING_ACTION);
    expect(result.errors[0]?.code).toBe(InvoiceEngineErrorCode.POLICY_ACTION_REQUIRED);
  });

  it("executes create operation with defaults", async () => {
    const engine = new InvoiceEngine();

    const result = await engine.execute({
      ...createRequest(),
      operation: InvoiceOperation.CREATE,
      invoice: null,
      validationRequest: {
        reservationReference: { reservationId: "reservation-001" },
        customerReference: { customerId: "customer-001" },
        quoteReference: { quoteId: "quote-001", quoteVersion: "v1" },
        pricingSnapshot: createComposition().pricingSnapshot,
        financialObligation: createComposition().financialObligation,
      },
      operationInput: {
        operation: InvoiceOperation.CREATE,
        composition: createComposition(InvoiceStatus.DRAFT),
      },
    });

    expect(result.success).toBe(true);
    expect(result.invoice?.amountPaid).toBe(0);
    expect(result.invoice?.balanceDue).toBe(10000);
    expect(result.invoice?.refundableAmount).toBe(0);
  });

  it("executes issue operation", async () => {
    const engine = new InvoiceEngine();

    const result = await engine.execute(createRequest());

    expect(result.success).toBe(true);
    expect(result.invoice?.status).toBe(InvoiceStatus.ISSUED);
  });

  it("applies payment allocation and computes partial payment state", async () => {
    const engine = new InvoiceEngine();

    const issued = createInvoice(InvoiceStatus.ISSUED);
    const result = await engine.execute(
      createRequest({
        operation: InvoiceOperation.ACCEPT_PAYMENT,
        invoice: issued,
        validationRequest: { ...createRequest().validationRequest, invoice: issued },
        operationInput: {
          operation: InvoiceOperation.ACCEPT_PAYMENT,
          paymentId: "payment-001",
          amount: 2500,
          currency: "ZAR",
          allocatedAt: new Date("2026-08-09T14:05:00.000Z"),
        },
      }),
    );

    expect(result.success).toBe(true);
    expect(result.invoice?.amountPaid).toBe(2500);
    expect(result.invoice?.balanceDue).toBe(7500);
    expect(result.invoice?.status).toBe(InvoiceStatus.PARTIALLY_PAID);
    expect(result.invoice?.paymentAllocations).toHaveLength(1);
  });

  it("applies payment allocation and computes full payment state", async () => {
    const engine = new InvoiceEngine();

    const issued = createInvoice(InvoiceStatus.ISSUED);
    const result = await engine.execute(
      createRequest({
        operation: InvoiceOperation.ACCEPT_PAYMENT,
        invoice: issued,
        validationRequest: { ...createRequest().validationRequest, invoice: issued },
        operationInput: {
          operation: InvoiceOperation.ACCEPT_PAYMENT,
          paymentId: "payment-002",
          amount: 10000,
          currency: "ZAR",
          allocatedAt: new Date("2026-08-09T14:06:00.000Z"),
        },
      }),
    );

    expect(result.success).toBe(true);
    expect(result.invoice?.amountPaid).toBe(10000);
    expect(result.invoice?.balanceDue).toBe(0);
    expect(result.invoice?.status).toBe(InvoiceStatus.PAID);
  });

  it("rejects invalid payment amount and currency mismatch", async () => {
    const engine = new InvoiceEngine();
    const issued = createInvoice(InvoiceStatus.ISSUED);

    const invalidAmount = await engine.execute(
      createRequest({
        operation: InvoiceOperation.ACCEPT_PAYMENT,
        invoice: issued,
        validationRequest: { ...createRequest().validationRequest, invoice: issued },
        operationInput: {
          operation: InvoiceOperation.ACCEPT_PAYMENT,
          paymentId: "payment-003",
          amount: 0,
          currency: "ZAR",
        },
      }),
    );

    const mismatch = await engine.execute(
      createRequest({
        operation: InvoiceOperation.ACCEPT_PAYMENT,
        invoice: issued,
        validationRequest: { ...createRequest().validationRequest, invoice: issued },
        operationInput: {
          operation: InvoiceOperation.ACCEPT_PAYMENT,
          paymentId: "payment-004",
          amount: 100,
          currency: "USD",
        },
      }),
    );

    expect(invalidAmount.success).toBe(false);
    expect(invalidAmount.errors[0]?.code).toBe(InvoiceEngineErrorCode.INVALID_OPERATION_INPUT);
    expect(mismatch.success).toBe(false);
    expect(mismatch.errors[0]?.code).toBe(InvoiceEngineErrorCode.CURRENCY_MISMATCH);
  });

  it("executes cancellation with snapshot, adjustment, refundable and preserved payments", async () => {
    const engine = new InvoiceEngine();
    const paid = createInvoice(InvoiceStatus.PAID, {
      paymentAllocations: [
        {
          paymentId: "payment-500",
          allocatedAmount: 10000,
          allocatedAt: new Date("2026-08-09T14:07:00.000Z"),
        },
      ],
      amountPaid: 10000,
      balanceDue: 0,
      refundableAmount: 0,
    });

    const result = await engine.execute(
      createRequest({
        operation: InvoiceOperation.CANCEL,
        invoice: paid,
        validationRequest: { ...createRequest().validationRequest, invoice: paid },
        operationInput: {
          operation: InvoiceOperation.CANCEL,
          policyReference: "POL-001",
          cancellationDate: new Date("2026-08-09T15:00:00.000Z"),
          cancellationCharge: 2000,
          reason: "Customer cancellation",
        },
      }),
    );

    expect(result.success).toBe(true);
    expect(result.invoice?.status).toBe(InvoiceStatus.CANCELLED);
    expect(result.invoice?.cancellationSnapshot?.cancellationCharge).toBe(2000);
    expect(result.invoice?.refundableAmount).toBe(8000);
    expect(result.invoice?.adjustments.length).toBe(1);
    expect(result.invoice?.paymentAllocations.length).toBe(1);
  });

  it("executes void while preserving financial history", async () => {
    const engine = new InvoiceEngine();
    const partial = createInvoice(InvoiceStatus.PARTIALLY_PAID, {
      amountPaid: 2000,
      balanceDue: 8000,
      paymentAllocations: [
        {
          paymentId: "payment-void-1",
          allocatedAmount: 2000,
          allocatedAt: new Date("2026-08-09T14:07:00.000Z"),
        },
      ],
    });

    const result = await engine.execute(
      createRequest({
        operation: InvoiceOperation.VOID,
        invoice: partial,
        validationRequest: { ...createRequest().validationRequest, invoice: partial },
        operationInput: {
          operation: InvoiceOperation.VOID,
        },
      }),
    );

    expect(result.success).toBe(true);
    expect(result.invoice?.status).toBe(InvoiceStatus.VOID);
    expect(result.invoice?.amountPaid).toBe(2000);
    expect(result.invoice?.paymentAllocations).toHaveLength(1);
  });

  it("supports invoice-side refund consequences without external execution", async () => {
    const engine = new InvoiceEngine();
    const cancelled = createInvoice(InvoiceStatus.CANCELLED, {
      amountPaid: 10000,
      balanceDue: 0,
      refundableAmount: 4000,
    });

    const result = await engine.execute(
      createRequest({
        operation: InvoiceOperation.REFUND,
        invoice: cancelled,
        validationRequest: { ...createRequest().validationRequest, invoice: cancelled },
        operationInput: {
          operation: InvoiceOperation.REFUND,
          amount: 2500,
          reason: "Approved refund",
        },
      }),
    );

    expect(result.success).toBe(true);
    expect(result.invoice?.amountPaid).toBe(7500);
    expect(result.invoice?.refundableAmount).toBe(1500);
    expect(result.warnings).toContain("External refund execution is required outside InvoiceEngine.");
  });

  it("returns immutable result contracts", async () => {
    const engine = new InvoiceEngine();
    const result = await engine.execute(createRequest());

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(Object.isFrozen(result.metadata.stages)).toBe(true);
  });

  it("returns invalid operation when handler is unavailable", async () => {
    const engine = new InvoiceEngine([]);
    const result = await engine.execute(createRequest());

    expect(result.success).toBe(false);
    expect(result.errors[0]?.code).toBe(InvoiceEngineErrorCode.INVALID_OPERATION);
  });

  it("supports handler injection for operation orchestration tests", async () => {
    const mockHandler = {
      operation: InvoiceOperation.ISSUE,
      execute: jest.fn(() =>
        createInvoiceOperationExecution({
          success: true,
          invoice: createInvoice(InvoiceStatus.ISSUED),
        }),
      ),
    };

    const engine = new InvoiceEngine([mockHandler]);
    const result = await engine.execute(createRequest());

    expect(mockHandler.execute).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });

  it("protects result metadata date with defensive copy", () => {
    const metadata = {
      completedAt: new Date("2026-08-09T15:00:00.000Z"),
      version: "1.0.0",
      requestId: "request-id",
      source: "test",
      stages: ["A", "B"],
    };

    const result = createInvoiceEngineResult({
      success: true,
      operation: InvoiceOperation.ISSUE,
      outcome: InvoiceEngineOutcome.EXECUTED,
      invoice: createInvoice(InvoiceStatus.ISSUED),
      validationResult: createValidation(true),
      policyEvaluation: createPolicy(InvoicePolicyOutcome.ALLOW),
      metadata,
    });

    metadata.completedAt.setUTCFullYear(2030);

    expect(result.metadata.completedAt.getUTCFullYear()).toBe(2026);
  });

  it("policy context factory remains consumable by engine contracts", () => {
    const context = createInvoicePolicyContext({
      operation: InvoiceOperation.ISSUE,
      validationResult: createValidation(true),
      invoice: createInvoice(),
    });

    expect(context.operation).toBe(InvoiceOperation.ISSUE);
  });
});
