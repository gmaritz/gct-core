import {
  Invoice,
  InvoiceComposition,
  InvoiceStatus,
} from "@application/invoices/aggregate";

function createComposition(): InvoiceComposition {
  return {
    identity: {
      id: "invoice-001",
    },
    reservationReference: {
      reservationId: "reservation-001",
    },
    customerReference: {
      customerId: "customer-001",
    },
    quoteReference: {
      quoteId: "quote-001",
      quoteVersion: "v1",
    },
    pricingSnapshot: {
      snapshotId: "pricing-snapshot-001",
      pricingId: "pricing-001",
      capturedAt: new Date("2026-08-09T10:00:00.000Z"),
      version: "1.0.0",
      currency: "ZAR",
      totalAmount: 10000,
    },
    status: InvoiceStatus.ISSUED,
    financialObligation: {
      totalAmount: 10000,
      currency: "ZAR",
    },
    depositRequirement: {
      type: "PERCENTAGE",
      value: 30,
    },
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
        type: "DISCOUNT",
        amount: -500,
        reason: "Loyalty",
        appliedAt: new Date("2026-08-09T12:00:00.000Z"),
      },
    ],
    cancellationSnapshot: {
      policyReference: "POL-001",
      policyVersion: "1.0",
      effectiveFrom: new Date("2026-08-01T00:00:00.000Z"),
      effectiveTo: new Date("2026-08-31T23:59:59.000Z"),
      cancellationDate: new Date("2026-08-09T13:00:00.000Z"),
      cancellationCharge: 1000,
      refundableAmount: 1500,
    },
    refundableAmount: 1500,
    externalReferences: [
      {
        system: "QUICKBOOKS",
        reference: "INV-10452",
      },
    ],
    metadata: {
      createdAt: new Date("2026-08-09T09:00:00.000Z"),
      updatedAt: new Date("2026-08-09T14:00:00.000Z"),
      version: "1.0.0",
    },
  };
}

describe("Invoice aggregate", () => {
  it("supports valid invoice creation", () => {
    const invoice = Invoice.create(createComposition());

    expect(invoice.identity.id).toBe("invoice-001");
    expect(invoice.reservationReference.reservationId).toBe("reservation-001");
    expect(invoice.status).toBe(InvoiceStatus.ISSUED);
    expect(invoice.financialObligation.totalAmount).toBe(10000);
  });

  it("supports valid invoice restoration", () => {
    const composition = createComposition();
    const restored = Invoice.restore(composition);

    expect(restored.status).toBe(InvoiceStatus.ISSUED);
    expect(restored.amountPaid).toBe(2500);
    expect(restored.balanceDue).toBe(7500);
    expect(restored.quoteReference.quoteVersion).toBe("v1");
  });

  it("applies financial defaults when optional values are omitted", () => {
    const composition = createComposition();
    const invoice = Invoice.create({
      ...composition,
      amountPaid: undefined,
      balanceDue: undefined,
      refundableAmount: undefined,
      paymentAllocations: undefined,
      adjustments: undefined,
      externalReferences: undefined,
      dueDate: undefined,
      cancellationSnapshot: undefined,
      depositRequirement: undefined,
    });

    expect(invoice.amountPaid).toBe(0);
    expect(invoice.balanceDue).toBe(10000);
    expect(invoice.refundableAmount).toBe(0);
    expect(invoice.paymentAllocations).toEqual([]);
    expect(invoice.adjustments).toEqual([]);
    expect(invoice.externalReferences).toEqual([]);
  });

  it("rejects missing identity", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        identity: undefined as unknown as InvoiceComposition["identity"],
      }),
    ).toThrow("Invoice identity is required.");
  });

  it("rejects blank identity id", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        identity: { id: " " },
      }),
    ).toThrow("Invoice identity is required.");
  });

  it("rejects missing reservation reference", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        reservationReference: undefined as unknown as InvoiceComposition["reservationReference"],
      }),
    ).toThrow("Invoice reservation reference is required.");
  });

  it("rejects blank reservation id", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        reservationReference: { reservationId: "" },
      }),
    ).toThrow("Invoice reservation ID is required.");
  });

  it("rejects missing customer and traveller ids", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        customerReference: {},
      }),
    ).toThrow("At least one of customerId or travellerId is required for invoice customer reference.");
  });

  it("accepts traveller-only customer reference", () => {
    const composition = createComposition();

    const invoice = Invoice.create({
      ...composition,
      customerReference: {
        travellerId: "traveller-001",
      },
    });

    expect(invoice.customerReference.travellerId).toBe("traveller-001");
  });

  it("rejects blank customer identifier", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        customerReference: {
          customerId: " ",
        },
      }),
    ).toThrow("At least one of customerId or travellerId is required for invoice customer reference.");
  });

  it("rejects missing quote reference", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        quoteReference: undefined as unknown as InvoiceComposition["quoteReference"],
      }),
    ).toThrow("Invoice quote reference is required.");
  });

  it("rejects blank quote id", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        quoteReference: {
          quoteId: "",
          quoteVersion: "v1",
        },
      }),
    ).toThrow("Invoice quote ID is required.");
  });

  it("rejects blank quote version", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        quoteReference: {
          quoteId: "quote-001",
          quoteVersion: " ",
        },
      }),
    ).toThrow("Invoice quote version is required.");
  });

  it("rejects missing pricing snapshot", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        pricingSnapshot: undefined as unknown as InvoiceComposition["pricingSnapshot"],
      }),
    ).toThrow("Invoice pricing snapshot is required.");
  });

  it("rejects invalid pricing snapshot amount", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        pricingSnapshot: {
          ...composition.pricingSnapshot,
          totalAmount: Number.NaN,
        },
      }),
    ).toThrow("Invoice pricing total amount must be finite.");
  });

  it("rejects negative pricing snapshot amount", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        pricingSnapshot: {
          ...composition.pricingSnapshot,
          totalAmount: -1,
        },
      }),
    ).toThrow("Invoice pricing total amount cannot be negative.");
  });

  it("rejects invalid pricing capturedAt", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        pricingSnapshot: {
          ...composition.pricingSnapshot,
          capturedAt: new Date("invalid"),
        },
      }),
    ).toThrow("Invoice pricing capturedAt is invalid.");
  });

  it("rejects invalid status", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        status: "UNKNOWN" as InvoiceStatus,
      }),
    ).toThrow("Invoice status is invalid.");
  });

  it("rejects missing financial obligation", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        financialObligation: undefined as unknown as InvoiceComposition["financialObligation"],
      }),
    ).toThrow("Invoice financial obligation is required.");
  });

  it("rejects non-finite financial obligation total", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        financialObligation: {
          ...composition.financialObligation,
          totalAmount: Number.POSITIVE_INFINITY,
        },
      }),
    ).toThrow("Invoice total amount must be finite.");
  });

  it("rejects negative financial obligation total", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        financialObligation: {
          ...composition.financialObligation,
          totalAmount: -1,
        },
      }),
    ).toThrow("Invoice total amount cannot be negative.");
  });

  it("rejects invalid deposit values", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        depositRequirement: {
          type: "PERCENTAGE",
          value: 101,
        },
      }),
    ).toThrow("Invoice deposit percentage cannot exceed 100.");

    expect(() =>
      Invoice.create({
        ...composition,
        depositRequirement: {
          type: "FIXED",
          value: -1,
        },
      }),
    ).toThrow("Invoice deposit value cannot be negative.");
  });

  it("rejects invalid payment allocations", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        paymentAllocations: [
          {
            paymentId: "",
            allocatedAmount: 100,
            allocatedAt: new Date("2026-08-09T11:00:00.000Z"),
          },
        ],
      }),
    ).toThrow("Invoice payment allocation paymentId is required.");

    expect(() =>
      Invoice.create({
        ...composition,
        paymentAllocations: [
          {
            paymentId: "payment-001",
            allocatedAmount: 0,
            allocatedAt: new Date("2026-08-09T11:00:00.000Z"),
          },
        ],
      }),
    ).toThrow("Invoice payment allocation amount must be greater than zero.");
  });

  it("rejects invalid financial state values", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        amountPaid: -1,
      }),
    ).toThrow("Invoice amountPaid cannot be negative.");

    expect(() =>
      Invoice.create({
        ...composition,
        balanceDue: -1,
      }),
    ).toThrow("Invoice balanceDue cannot be negative.");

    expect(() =>
      Invoice.create({
        ...composition,
        refundableAmount: -1,
      }),
    ).toThrow("Invoice refundableAmount cannot be negative.");
  });

  it("rejects invalid due date", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        dueDate: new Date("invalid"),
      }),
    ).toThrow("Invoice dueDate is invalid.");
  });

  it("rejects invalid adjustments", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        adjustments: [
          {
            id: "",
            type: "FEE",
            amount: 100,
            reason: "Manual",
            appliedAt: new Date("2026-08-09T12:00:00.000Z"),
          },
        ],
      }),
    ).toThrow("Invoice adjustment ID is required.");

    expect(() =>
      Invoice.create({
        ...composition,
        adjustments: [
          {
            id: "adj-001",
            type: "FEE",
            amount: 100,
            reason: "",
            appliedAt: new Date("2026-08-09T12:00:00.000Z"),
          },
        ],
      }),
    ).toThrow("Invoice adjustment reason is required.");
  });

  it("rejects invalid cancellation snapshot", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        cancellationSnapshot: {
          ...composition.cancellationSnapshot!,
          policyReference: "",
        },
      }),
    ).toThrow("Invoice cancellation policy reference is required.");

    expect(() =>
      Invoice.create({
        ...composition,
        cancellationSnapshot: {
          ...composition.cancellationSnapshot!,
          cancellationCharge: -1,
        },
      }),
    ).toThrow("Invoice cancellation charge cannot be negative.");
  });

  it("rejects invalid external references", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        externalReferences: [
          {
            system: "",
            reference: "INV-001",
          },
        ],
      }),
    ).toThrow("Invoice external reference system is required.");
  });

  it("rejects invalid metadata", () => {
    const composition = createComposition();

    expect(() =>
      Invoice.create({
        ...composition,
        metadata: undefined as unknown as InvoiceComposition["metadata"],
      }),
    ).toThrow("Invoice metadata is required.");

    expect(() =>
      Invoice.create({
        ...composition,
        metadata: {
          ...composition.metadata,
          createdAt: new Date("invalid"),
        },
      }),
    ).toThrow("Invoice metadata createdAt is invalid.");
  });

  it("enforces aggregate immutability and nested freezing", () => {
    const invoice = Invoice.create(createComposition());

    expect(Object.isFrozen(invoice)).toBe(true);
    expect(Object.isFrozen(invoice.identity)).toBe(true);
    expect(Object.isFrozen(invoice.reservationReference)).toBe(true);
    expect(Object.isFrozen(invoice.customerReference)).toBe(true);
    expect(Object.isFrozen(invoice.quoteReference)).toBe(true);
    expect(Object.isFrozen(invoice.pricingSnapshot)).toBe(true);
    expect(Object.isFrozen(invoice.financialObligation)).toBe(true);
    expect(Object.isFrozen(invoice.paymentAllocations)).toBe(true);
    expect(Object.isFrozen(invoice.adjustments)).toBe(true);
    expect(Object.isFrozen(invoice.externalReferences)).toBe(true);
    expect(Object.isFrozen(invoice.metadata)).toBe(true);
  });

  it("uses defensive copying for source object, array, and date mutation", () => {
    const composition = createComposition();
    const invoice = Invoice.create(composition);
    const mutableComposition = composition as {
      identity: InvoiceComposition["identity"];
    };

    const mutableAllocations = composition.paymentAllocations as Array<
      NonNullable<InvoiceComposition["paymentAllocations"]>[number]
    >;
    const mutableAdjustments = composition.adjustments as Array<
      NonNullable<InvoiceComposition["adjustments"]>[number]
    >;

    mutableComposition.identity = { id: "invoice-mutated" };
    composition.pricingSnapshot.capturedAt.setUTCFullYear(2040);
    composition.metadata.updatedAt.setUTCFullYear(2040);
    composition.dueDate?.setUTCFullYear(2040);
    mutableAllocations[0] = {
      paymentId: "payment-mutated",
      allocatedAmount: 1,
      allocatedAt: new Date("2027-01-01T00:00:00.000Z"),
    };
    mutableAdjustments[0] = {
      id: "adj-mutated",
      type: "FEE",
      amount: 1,
      reason: "Mutated",
      appliedAt: new Date("2027-01-01T00:00:00.000Z"),
    };

    expect(invoice.identity.id).toBe("invoice-001");
    expect(invoice.pricingSnapshot.capturedAt.getUTCFullYear()).toBe(2026);
    expect(invoice.metadata.updatedAt.getUTCFullYear()).toBe(2026);
    expect(invoice.dueDate?.getUTCFullYear()).toBe(2026);
    expect(invoice.paymentAllocations[0]?.paymentId).toBe("payment-001");
    expect(invoice.adjustments[0]?.id).toBe("adj-001");
  });

  it("protects aggregate state from exposed date mutation", () => {
    const invoice = Invoice.create(createComposition());

    const capturedAt = invoice.pricingSnapshot.capturedAt;
    const allocatedAt = invoice.paymentAllocations[0]!.allocatedAt;
    const appliedAt = invoice.adjustments[0]!.appliedAt;
    const cancellationDate = invoice.cancellationSnapshot!.cancellationDate;
    const metadataCreatedAt = invoice.metadata.createdAt;
    const dueDate = invoice.dueDate!;

    capturedAt.setUTCFullYear(2030);
    allocatedAt.setUTCFullYear(2030);
    appliedAt.setUTCFullYear(2030);
    cancellationDate.setUTCFullYear(2030);
    metadataCreatedAt.setUTCFullYear(2030);
    dueDate.setUTCFullYear(2030);

    expect(invoice.pricingSnapshot.capturedAt.getUTCFullYear()).toBe(2026);
    expect(invoice.paymentAllocations[0]!.allocatedAt.getUTCFullYear()).toBe(2026);
    expect(invoice.adjustments[0]!.appliedAt.getUTCFullYear()).toBe(2026);
    expect(invoice.cancellationSnapshot!.cancellationDate.getUTCFullYear()).toBe(2026);
    expect(invoice.metadata.createdAt.getUTCFullYear()).toBe(2026);
    expect(invoice.dueDate!.getUTCFullYear()).toBe(2026);
  });

  it("protects aggregate state from exposed collection mutation", () => {
    const invoice = Invoice.create(createComposition());

    const mutateAllocations = (): void => {
      (invoice.paymentAllocations as Array<unknown>).push({});
    };
    const mutateAdjustments = (): void => {
      (invoice.adjustments as Array<unknown>).push({});
    };
    const mutateExternalReferences = (): void => {
      (invoice.externalReferences as Array<unknown>).push({});
    };

    expect(mutateAllocations).toThrow();
    expect(mutateAdjustments).toThrow();
    expect(mutateExternalReferences).toThrow();
  });

  it("preserves supplied state during restoration without recalculation", () => {
    const composition = createComposition();

    const restored = Invoice.restore({
      ...composition,
      status: InvoiceStatus.PARTIALLY_PAID,
      amountPaid: 4000,
      balanceDue: 6800,
      refundableAmount: 300,
    });

    expect(restored.status).toBe(InvoiceStatus.PARTIALLY_PAID);
    expect(restored.amountPaid).toBe(4000);
    expect(restored.balanceDue).toBe(6800);
    expect(restored.refundableAmount).toBe(300);
  });

  it("exposes readonly aggregate contracts", () => {
    const invoice: Invoice = Invoice.create(createComposition());

    expect(invoice.quoteReference.quoteId).toBe("quote-001");
  });
});
