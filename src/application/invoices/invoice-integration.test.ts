import {
  Invoice,
  InvoiceComposition,
  InvoiceIntegrationError,
  InvoiceIntegrationErrorCode,
  InvoiceIntegrationMapper,
  InvoiceIntegrationOperation,
  InvoiceIntegrationOrchestrator,
  InvoiceIntegrationRequest,
  InvoiceIntegrationStatus,
  InvoiceStatus,
  InvoiceAccountingGateway,
} from "@application/invoices";

function createComposition(status: InvoiceStatus = InvoiceStatus.ISSUED): InvoiceComposition {
  return {
    identity: { id: "invoice-integration-001" },
    reservationReference: { reservationId: "reservation-integration-001" },
    customerReference: { customerId: "customer-001", travellerId: "traveller-001" },
    quoteReference: { quoteId: "quote-001", quoteVersion: "v1" },
    pricingSnapshot: {
      snapshotId: "pricing-snapshot-001",
      pricingId: "pricing-001",
      capturedAt: new Date("2026-08-09T17:00:00.000Z"),
      version: "1.0.0",
      currency: "ZAR",
      totalAmount: 12400,
    },
    status,
    financialObligation: { totalAmount: 12400, currency: "ZAR" },
    paymentAllocations: [
      {
        paymentId: "payment-001",
        allocatedAmount: 4000,
        allocatedAt: new Date("2026-08-09T17:10:00.000Z"),
      },
    ],
    amountPaid: 4000,
    balanceDue: 8400,
    dueDate: new Date("2026-09-01T00:00:00.000Z"),
    cancellationSnapshot:
      status === InvoiceStatus.CANCELLED
        ? {
            policyReference: "POL-100",
            cancellationDate: new Date("2026-08-10T00:00:00.000Z"),
            cancellationCharge: 900,
            refundableAmount: 1500,
          }
        : undefined,
    refundableAmount: status === InvoiceStatus.CANCELLED ? 1500 : 0,
    externalReferences: [
      {
        system: "accounting-main",
        reference: "ACC-INV-001",
      },
    ],
    metadata: {
      createdAt: new Date("2026-08-09T17:00:00.000Z"),
      updatedAt: new Date("2026-08-09T17:12:00.000Z"),
      version: "1.0.0",
    },
  };
}

function createInvoice(status: InvoiceStatus = InvoiceStatus.ISSUED): Invoice {
  return Invoice.create(createComposition(status));
}

function createRequest(
  operation: InvoiceIntegrationOperation = InvoiceIntegrationOperation.CREATE_SYNC,
  overrides?: Partial<InvoiceIntegrationRequest>,
): InvoiceIntegrationRequest {
  return Object.freeze({
    invoice: overrides?.invoice ?? createInvoice(),
    operation,
    providerSelection: overrides?.providerSelection ?? {
      providerId: "accounting-main",
      system: "accounting-main",
      channel: "api",
    },
    correlation: overrides?.correlation ?? {
      requestId: "invoice-int-request-001",
      correlationId: "invoice-int-correlation-001",
      traceId: "invoice-int-trace-001",
    },
    idempotencyKey: overrides?.idempotencyKey,
    metadata: overrides?.metadata ?? { source: "test" },
  });
}

function createGatewayError(
  code: InvoiceIntegrationErrorCode,
  retryable = false,
  message = "provider error",
): InvoiceIntegrationError {
  return {
    code,
    retryable,
    message,
    providerCode: code,
  };
}

describe("InvoiceIntegrationMapper", () => {
  it("maps canonical invoice fields for external integration request", () => {
    const mapper = new InvoiceIntegrationMapper();
    const invoice = createInvoice(InvoiceStatus.CANCELLED);
    const mapped = mapper.mapInvoice(invoice, InvoiceIntegrationOperation.UPDATE_SYNC);

    expect(mapped.operation).toBe(InvoiceIntegrationOperation.UPDATE_SYNC);
    expect(mapped.invoiceId).toBe("invoice-integration-001");
    expect(mapped.customer.customerId).toBe("customer-001");
    expect(mapped.reservationReference).toBe("reservation-integration-001");
    expect(mapped.currency).toBe("ZAR");
    expect(mapped.totalAmount).toBe(12400);
    expect(mapped.paymentState.amountPaid).toBe(4000);
    expect(mapped.paymentState.balanceDue).toBe(8400);
    expect(mapped.cancellationState?.cancellationCharge).toBe(900);
    expect(mapped.externalReferences[0]?.reference).toBe("ACC-INV-001");
  });
});

describe("InvoiceAccountingGateway", () => {
  it("supports provider-independent accounting contract", async () => {
    const gateway: InvoiceAccountingGateway = {
      createInvoice: async () => ({ success: true, providerIdentifier: "provider-a" }),
      updateInvoice: async () => ({ success: true, providerIdentifier: "provider-a" }),
      cancelInvoice: async () => ({ success: true, providerIdentifier: "provider-a" }),
      voidInvoice: async () => ({ success: true, providerIdentifier: "provider-a" }),
    };

    const result = await gateway.createInvoice({} as never);
    expect(result.success).toBe(true);
  });
});

describe("InvoiceIntegrationOrchestrator", () => {
  it("routes each operation to the corresponding gateway method", async () => {
    const calls: string[] = [];
    const gateway: InvoiceAccountingGateway = {
      createInvoice: async () => {
        calls.push("create");
        return { success: true, providerIdentifier: "accounting-main" };
      },
      updateInvoice: async () => {
        calls.push("update");
        return { success: true, providerIdentifier: "accounting-main" };
      },
      cancelInvoice: async () => {
        calls.push("cancel");
        return { success: true, providerIdentifier: "accounting-main" };
      },
      voidInvoice: async () => {
        calls.push("void");
        return { success: true, providerIdentifier: "accounting-main" };
      },
    };

    const orchestrator = new InvoiceIntegrationOrchestrator(gateway);
    await orchestrator.execute(createRequest(InvoiceIntegrationOperation.CREATE_SYNC));
    await orchestrator.execute(createRequest(InvoiceIntegrationOperation.UPDATE_SYNC));
    await orchestrator.execute(createRequest(InvoiceIntegrationOperation.CANCEL_SYNC));
    await orchestrator.execute(createRequest(InvoiceIntegrationOperation.VOID_SYNC));

    expect(calls).toEqual(["create", "update", "cancel", "void"]);
  });

  it("returns immutable successful result with external reference", async () => {
    const gateway: InvoiceAccountingGateway = {
      createInvoice: async (context) => {
        expect(Object.isFrozen(context)).toBe(true);
        expect(Object.isFrozen(context.externalRequest)).toBe(true);
        return {
          success: true,
          providerIdentifier: context.providerSelection.providerId,
          externalReference: {
            system: "accounting-main",
            reference: "ACC-INV-9001",
          },
          warnings: ["provider sync accepted"],
        };
      },
      updateInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      cancelInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      voidInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
    };

    const orchestrator = new InvoiceIntegrationOrchestrator(gateway);
    const result = await orchestrator.execute(createRequest(InvoiceIntegrationOperation.CREATE_SYNC));

    expect(result.success).toBe(true);
    expect(result.integrationStatus).toBe(InvoiceIntegrationStatus.SUCCESS);
    expect(result.externalReference?.reference).toBe("ACC-INV-9001");
    expect(result.warnings).toEqual(["provider sync accepted"]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
  });

  it("returns retryable failure and canonical error for provider timeout", async () => {
    const gateway: InvoiceAccountingGateway = {
      createInvoice: async () => {
        throw {
          code: "TIMEOUT",
          message: "provider timed out",
        };
      },
      updateInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      cancelInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      voidInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
    };

    const orchestrator = new InvoiceIntegrationOrchestrator(gateway);
    const result = await orchestrator.execute(createRequest(InvoiceIntegrationOperation.CREATE_SYNC));

    expect(result.success).toBe(false);
    expect(result.retryable).toBe(true);
    expect(result.integrationStatus).toBe(InvoiceIntegrationStatus.RETRYABLE_FAILURE);
    expect(result.errors[0]?.code).toBe(InvoiceIntegrationErrorCode.TIMEOUT);
  });

  it("returns non-retryable failure when provider rejects operation", async () => {
    const gateway: InvoiceAccountingGateway = {
      createInvoice: async () => ({
        success: false,
        providerIdentifier: "accounting-main",
        integrationStatus: InvoiceIntegrationStatus.REJECTED,
        retryable: false,
        errors: [
          createGatewayError(
            InvoiceIntegrationErrorCode.PROVIDER_REJECTION,
            false,
            "provider rejected invoice",
          ),
        ],
      }),
      updateInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      cancelInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      voidInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
    };

    const orchestrator = new InvoiceIntegrationOrchestrator(gateway);
    const result = await orchestrator.execute(createRequest(InvoiceIntegrationOperation.CREATE_SYNC));

    expect(result.success).toBe(false);
    expect(result.retryable).toBe(false);
    expect(result.integrationStatus).toBe(InvoiceIntegrationStatus.REJECTED);
    expect(result.errors[0]?.code).toBe(InvoiceIntegrationErrorCode.PROVIDER_REJECTION);
  });

  it("treats duplicate request as success when existing external reference is present", async () => {
    const gateway: InvoiceAccountingGateway = {
      createInvoice: async () => ({
        success: false,
        providerIdentifier: "accounting-main",
        errors: [createGatewayError(InvoiceIntegrationErrorCode.DUPLICATE_REQUEST, false, "already exists")],
      }),
      updateInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      cancelInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      voidInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
    };

    const orchestrator = new InvoiceIntegrationOrchestrator(gateway);
    const result = await orchestrator.execute(createRequest(InvoiceIntegrationOperation.CREATE_SYNC));

    expect(result.success).toBe(true);
    expect(result.integrationStatus).toBe(InvoiceIntegrationStatus.SUCCESS);
    expect(result.externalReference?.reference).toBe("ACC-INV-001");
    expect(result.warnings).toContain("Duplicate request matched existing external reference.");
  });

  it("produces stable idempotency key for same operation identity", async () => {
    const seenKeys: string[] = [];

    const gateway: InvoiceAccountingGateway = {
      createInvoice: async (context) => {
        seenKeys.push(context.idempotencyKey);
        return { success: true, providerIdentifier: "accounting-main" };
      },
      updateInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      cancelInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      voidInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
    };

    const invoice = createInvoice();
    const orchestrator = new InvoiceIntegrationOrchestrator(gateway);
    await orchestrator.execute(createRequest(InvoiceIntegrationOperation.CREATE_SYNC, { invoice }));
    await orchestrator.execute(createRequest(InvoiceIntegrationOperation.CREATE_SYNC, { invoice }));

    expect(seenKeys).toHaveLength(2);
    expect(seenKeys[0]).toBe(seenKeys[1]);
    expect(seenKeys[0]).toBe("accounting-main:CREATE_SYNC:invoice-integration-001:1.0.0");
  });

  it("uses explicit idempotency key when provided", async () => {
    let receivedKey = "";
    const gateway: InvoiceAccountingGateway = {
      createInvoice: async (context) => {
        receivedKey = context.idempotencyKey;
        return { success: true, providerIdentifier: "accounting-main" };
      },
      updateInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      cancelInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      voidInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
    };

    const orchestrator = new InvoiceIntegrationOrchestrator(gateway);
    await orchestrator.execute(
      createRequest(InvoiceIntegrationOperation.CREATE_SYNC, {
        idempotencyKey: "custom-key-001",
      }),
    );

    expect(receivedKey).toBe("custom-key-001");
  });

  it("does not mutate canonical invoice aggregate", async () => {
    const gateway: InvoiceAccountingGateway = {
      createInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      updateInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      cancelInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
      voidInvoice: async () => ({ success: true, providerIdentifier: "accounting-main" }),
    };

    const invoice = createInvoice();
    const originalUpdatedAt = invoice.metadata.updatedAt.getTime();
    const originalExternalRef = invoice.externalReferences[0]?.reference;

    const orchestrator = new InvoiceIntegrationOrchestrator(gateway);
    await orchestrator.execute(createRequest(InvoiceIntegrationOperation.UPDATE_SYNC, { invoice }));

    expect(invoice.metadata.updatedAt.getTime()).toBe(originalUpdatedAt);
    expect(invoice.externalReferences[0]?.reference).toBe(originalExternalRef);
  });
});
