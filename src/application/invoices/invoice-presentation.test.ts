import {
  Invoice,
  InvoiceComposition,
  InvoiceEngineErrorCode,
  InvoiceEngineOutcome,
  InvoiceEngineResult as EngineResult,
  InvoiceOperation,
  InvoicePolicyOutcome,
  InvoicePolicyPriority,
  InvoiceRequiredAction,
  InvoiceStatus,
  createInvoiceEngineResult,
  createInvoicePolicyResult,
  createInvoiceValidationResult,
  InvoiceValidationStage,
} from "@application/invoices";
import {
  InvoicePresentationErrorCode,
  InvoicePresentationPipeline,
  InvoicePresentationTarget,
} from "@application/invoices/presentation";

function createComposition(status: InvoiceStatus = InvoiceStatus.DRAFT): InvoiceComposition {
  return {
    identity: { id: "invoice-presentation-001" },
    reservationReference: { reservationId: "reservation-001" },
    customerReference: { customerId: "customer-001", travellerId: "traveller-001" },
    quoteReference: { quoteId: "quote-001", quoteVersion: "v1" },
    pricingSnapshot: {
      snapshotId: "pricing-snapshot-001",
      pricingId: "pricing-001",
      capturedAt: new Date("2026-08-09T15:00:00.000Z"),
      version: "1.0.0",
      currency: "ZAR",
      totalAmount: 10000,
    },
    status,
    financialObligation: { totalAmount: 10000, currency: "ZAR" },
    depositRequirement: { type: "PERCENTAGE", value: 25 },
    paymentAllocations: [
      {
        paymentId: "payment-001",
        allocatedAmount: 3000,
        allocatedAt: new Date("2026-08-09T15:10:00.000Z"),
        externalReference: "PAY-EXT-001",
      },
    ],
    amountPaid: 3000,
    balanceDue: 7000,
    dueDate: new Date("2026-08-30T00:00:00.000Z"),
    adjustments: [
      {
        id: "adj-001",
        type: "MANUAL",
        amount: -500,
        reason: "Commercial goodwill",
        appliedAt: new Date("2026-08-09T15:11:00.000Z"),
      },
    ],
    cancellationSnapshot: {
      policyReference: "POL-001",
      policyVersion: "v2",
      cancellationDate: new Date("2026-08-10T00:00:00.000Z"),
      cancellationCharge: 2000,
      refundableAmount: 1000,
    },
    refundableAmount: 1000,
    externalReferences: [{ system: "ACCOUNTING", reference: "INV-001" }],
    metadata: {
      createdAt: new Date("2026-08-09T15:00:00.000Z"),
      updatedAt: new Date("2026-08-09T16:00:00.000Z"),
      version: "1.0.0",
    },
  };
}

function createInvoice(status: InvoiceStatus = InvoiceStatus.DRAFT): Invoice {
  return Invoice.create(createComposition(status));
}

function createValidation() {
  return createInvoiceValidationResult({
    stage: InvoiceValidationStage.LIFECYCLE_READINESS,
    errors: [],
    warnings: ["validation warning"],
    metadata: {
      validatedAt: new Date("2026-08-09T15:20:00.000Z"),
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
          evaluatedAt: new Date("2026-08-09T15:21:00.000Z"),
          version: "1.0.0",
          source: "test",
        },
      }),
    ]),
    metadata: {
      evaluatedAt: new Date("2026-08-09T15:21:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createEngineResult(success = true, invoice: Invoice | null = createInvoice(InvoiceStatus.ISSUED)): EngineResult {
  return createInvoiceEngineResult({
    success,
    operation: InvoiceOperation.ISSUE,
    outcome: success ? InvoiceEngineOutcome.EXECUTED : InvoiceEngineOutcome.REJECTED,
    invoice,
    validationResult: createValidation(),
    policyEvaluation: createPolicy(success ? InvoicePolicyOutcome.ALLOW : InvoicePolicyOutcome.DENY),
    warnings: success ? ["engine warning"] : [],
    errors: success
      ? []
      : [
          {
            code: InvoiceEngineErrorCode.POLICY_DENIED,
            message: "Engine denied operation.",
          },
        ],
    financialImpact: success
      ? {
          currency: "ZAR",
          totalObligation: 10000,
          previousAmountPaid: 0,
          newAmountPaid: 3000,
          previousBalanceDue: 10000,
          newBalanceDue: 7000,
          previousRefundableAmount: 0,
          newRefundableAmount: 1000,
        }
      : undefined,
    metadata: {
      completedAt: new Date("2026-08-09T15:30:00.000Z"),
      version: "1.0.0",
      requestId: "invoice-engine-request-001",
      source: "test",
      stages: ["CONTEXT", "VALIDATION", "POLICY", "OPERATION"],
    },
  });
}

describe("InvoicePresentationPipeline", () => {
  it("maps invoice aggregate into detailed and summary presentation models", () => {
    const pipeline = new InvoicePresentationPipeline();
    const invoice = createInvoice(InvoiceStatus.ISSUED);

    const result = pipeline.execute({
      invoice,
      target: InvoicePresentationTarget.INVOICE_DETAIL,
      requestId: "presentation-request-001",
      source: "test",
    });

    expect(result.success).toBe(true);
    expect(result.invoice?.invoiceId).toBe("invoice-presentation-001");
    expect(result.invoice?.status).toBe(InvoiceStatus.ISSUED);
    expect(result.invoice?.statusLabel).toBe("Issued");
    expect(result.invoice?.pricing.totalAmountDisplay).toBe("ZAR 10000.00");
    expect(result.invoice?.financial.balanceDueDisplay).toBe("ZAR 7000.00");
    expect(result.invoice?.payments[0]?.allocatedAmountDisplay).toBe("ZAR 3000.00");
    expect(result.invoice?.adjustments[0]?.amountDisplay).toBe("ZAR -500.00");
    expect(result.invoice?.cancellation?.cancellationChargeDisplay).toBe("ZAR 2000.00");
    expect(result.summary?.statusLabel).toBe("Issued");
    expect(result.summary?.customerDisplay).toBe("customer-001");
    expect(result.summary?.currency).toBe("ZAR");
  });

  it("maps successful engine result including operation metadata and financial impact", () => {
    const pipeline = new InvoicePresentationPipeline();
    const result = pipeline.execute({
      engineResult: createEngineResult(true),
      target: InvoicePresentationTarget.DOCUMENT_VIEW,
    });

    expect(result.success).toBe(true);
    expect(result.engine?.operation).toBe(InvoiceOperation.ISSUE);
    expect(result.engine?.metadata.target).toBe(InvoicePresentationTarget.DOCUMENT_VIEW);
    expect(result.engine?.financialImpact?.newBalanceDueDisplay).toBe("ZAR 7000.00");
  });

  it("returns failed presentation result when engine result is unsuccessful", () => {
    const pipeline = new InvoicePresentationPipeline();
    const result = pipeline.execute({
      engineResult: createEngineResult(false, null),
      target: InvoicePresentationTarget.INVOICE_SUMMARY,
    });

    expect(result.success).toBe(false);
    expect(result.invoice).toBeUndefined();
    expect(result.summary).toBeUndefined();
    expect(result.errors[0]?.code).toBe(InvoicePresentationErrorCode.ENGINE_RESULT_FAILED);
    expect(result.engine?.errors).toContain("Engine denied operation.");
  });

  it("returns explicit missing-input error when no invoice or engine result is provided", () => {
    const pipeline = new InvoicePresentationPipeline();
    const result = pipeline.execute({
      target: InvoicePresentationTarget.CUSTOMER_VIEW,
    });

    expect(result.success).toBe(false);
    expect(result.errors[0]?.code).toBe(InvoicePresentationErrorCode.MISSING_INPUT);
  });

  it("preserves optional absence without placeholder injection", () => {
    const pipeline = new InvoicePresentationPipeline();
    const invoice = createInvoice(InvoiceStatus.DRAFT);

    const stripped = Invoice.restore({
      ...createComposition(InvoiceStatus.DRAFT),
      depositRequirement: undefined,
      dueDate: undefined,
      cancellationSnapshot: undefined,
      paymentAllocations: [],
      adjustments: [],
      externalReferences: [],
      refundableAmount: 0,
      amountPaid: 0,
      balanceDue: 10000,
      metadata: invoice.metadata,
    });

    const result = pipeline.execute({ invoice: stripped });

    expect(result.success).toBe(true);
    expect(result.invoice?.dueDate).toBeUndefined();
    expect(result.invoice?.deposit).toBeUndefined();
    expect(result.invoice?.cancellation).toBeUndefined();
    expect(result.invoice?.payments).toHaveLength(0);
    expect(result.invoice?.adjustments).toHaveLength(0);
  });

  it("returns immutable output and does not mutate source invoice", () => {
    const pipeline = new InvoicePresentationPipeline();
    const invoice = createInvoice(InvoiceStatus.ISSUED);
    const originalDueDate = invoice.dueDate?.getTime();
    const originalUpdatedAt = invoice.metadata.updatedAt.getTime();

    const result = pipeline.execute({ invoice });

    expect(result.success).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(Object.isFrozen(result.invoice ?? {})).toBe(true);
    expect(Object.isFrozen(result.summary ?? {})).toBe(true);

    if (!result.invoice || !result.summary || !result.invoice.dueDate) {
      throw new Error("Expected mapped invoice with due date");
    }

    result.invoice.dueDate.setUTCFullYear(2035);
    result.summary.issueDate.setUTCFullYear(2035);

    expect(invoice.dueDate?.getTime()).toBe(originalDueDate);
    expect(invoice.metadata.updatedAt.getTime()).toBe(originalUpdatedAt);
  });

  it("produces deterministic mapping for identical invoice input", () => {
    const pipeline = new InvoicePresentationPipeline();
    const invoice = createInvoice(InvoiceStatus.PARTIALLY_PAID);

    const first = pipeline.execute({ invoice, requestId: "determinism-1" });
    const second = pipeline.execute({ invoice, requestId: "determinism-2" });

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(first.summary?.statusLabel).toBe(second.summary?.statusLabel);
    expect(first.summary?.totalDisplay).toBe(second.summary?.totalDisplay);
    expect(first.invoice?.financial.balanceDueDisplay).toBe(second.invoice?.financial.balanceDueDisplay);
    expect(first.invoice?.payments[0]?.allocatedAtDisplay).toBe(second.invoice?.payments[0]?.allocatedAtDisplay);
  });
});
