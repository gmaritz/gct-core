import * as fs from "node:fs";
import * as path from "node:path";
import {
  createInvoiceAdjustment,
  createInvoiceCancellationSnapshot,
  createInvoiceCustomerReference,
  createInvoiceDepositRequirement,
  createInvoiceExternalReference,
  createInvoiceFinancialObligation,
  createInvoiceIdentity,
  createInvoiceMetadata,
  createInvoicePaymentAllocation,
  createInvoicePricingSnapshot,
  createInvoiceQuoteReference,
  createInvoiceReference,
  createInvoiceReservationReference,
  Invoice,
  InvoiceComposition,
  InvoiceStatus,
} from "@application/invoices";

describe("Invoice model library", () => {
  it("creates immutable identity and invoice reference models", () => {
    const identityInput = { id: "invoice-1001" };
    const referenceInput = { invoiceId: "invoice-1001" };

    const identity = createInvoiceIdentity(identityInput);
    const reference = createInvoiceReference(referenceInput);

    identityInput.id = "invoice-mutated";
    referenceInput.invoiceId = "invoice-mutated";

    expect(identity.id).toBe("invoice-1001");
    expect(reference.invoiceId).toBe("invoice-1001");
    expect(Object.isFrozen(identity)).toBe(true);
    expect(Object.isFrozen(reference)).toBe(true);
  });

  it("preserves blank identity using structural model convention", () => {
    const identity = createInvoiceIdentity({ id: " " });

    expect(identity.id).toBe(" ");
    expect(Object.isFrozen(identity)).toBe(true);
  });

  it("creates immutable reservation, customer, and quote references", () => {
    const reservation = createInvoiceReservationReference({ reservationId: "reservation-1001" });
    const customer = createInvoiceCustomerReference({ customerId: "customer-1001" });
    const traveller = createInvoiceCustomerReference({ travellerId: "traveller-1001" });
    const both = createInvoiceCustomerReference({ customerId: "customer-1001", travellerId: "traveller-1001" });
    const quote = createInvoiceQuoteReference({ quoteId: "quote-1001", quoteVersion: "v2" });

    expect(reservation.reservationId).toBe("reservation-1001");
    expect(customer.customerId).toBe("customer-1001");
    expect(traveller.travellerId).toBe("traveller-1001");
    expect(both.customerId).toBe("customer-1001");
    expect(quote.quoteVersion).toBe("v2");
    expect(Object.isFrozen(reservation)).toBe(true);
    expect(Object.isFrozen(customer)).toBe(true);
    expect(Object.isFrozen(traveller)).toBe(true);
    expect(Object.isFrozen(quote)).toBe(true);
  });

  it("creates immutable pricing snapshot with cloned date", () => {
    const input = {
      snapshotId: "pricing-snapshot-1001",
      pricingId: "pricing-1001",
      capturedAt: new Date("2026-08-09T10:00:00.000Z"),
      version: "1.0.0",
      currency: "ZAR",
      totalAmount: 25000,
    };

    const snapshot = createInvoicePricingSnapshot(input);
    input.capturedAt.setUTCFullYear(2040);

    expect(snapshot.snapshotId).toBe("pricing-snapshot-1001");
    expect(snapshot.totalAmount).toBe(25000);
    expect(snapshot.capturedAt.getUTCFullYear()).toBe(2026);
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it("creates immutable financial obligation and deposit requirement", () => {
    const obligation = createInvoiceFinancialObligation({ totalAmount: 25000, currency: "ZAR" });
    const fixedDeposit = createInvoiceDepositRequirement({ type: "FIXED", value: 5000 });
    const percentageDeposit = createInvoiceDepositRequirement({ type: "PERCENTAGE", value: 20 });

    expect(obligation.currency).toBe("ZAR");
    expect(fixedDeposit.type).toBe("FIXED");
    expect(percentageDeposit.type).toBe("PERCENTAGE");
    expect(percentageDeposit.value).toBe(20);
    expect(Object.isFrozen(obligation)).toBe(true);
    expect(Object.isFrozen(fixedDeposit)).toBe(true);
    expect(Object.isFrozen(percentageDeposit)).toBe(true);
  });

  it("creates immutable payment allocation and adjustment with cloned dates", () => {
    const allocationInput = {
      paymentId: "payment-1001",
      allocatedAmount: 3000,
      allocatedAt: new Date("2026-08-09T11:00:00.000Z"),
      externalReference: "ALLOC-1001",
    };
    const adjustmentInput = {
      id: "adj-1001",
      type: "MANUAL",
      amount: 250,
      reason: "Service recovery",
      appliedAt: new Date("2026-08-09T12:00:00.000Z"),
    };

    const allocation = createInvoicePaymentAllocation(allocationInput);
    const adjustment = createInvoiceAdjustment(adjustmentInput);

    allocationInput.allocatedAt.setUTCFullYear(2040);
    adjustmentInput.appliedAt.setUTCFullYear(2040);

    expect(allocation.externalReference).toBe("ALLOC-1001");
    expect(adjustment.reason).toBe("Service recovery");
    expect(allocation.allocatedAt.getUTCFullYear()).toBe(2026);
    expect(adjustment.appliedAt.getUTCFullYear()).toBe(2026);
    expect(Object.isFrozen(allocation)).toBe(true);
    expect(Object.isFrozen(adjustment)).toBe(true);
  });

  it("creates immutable cancellation snapshot with cloned optional dates", () => {
    const input = {
      policyReference: "POL-1001",
      policyVersion: "1.0",
      effectiveFrom: new Date("2026-08-01T00:00:00.000Z"),
      effectiveTo: new Date("2026-08-31T23:59:59.000Z"),
      cancellationDate: new Date("2026-08-10T10:00:00.000Z"),
      cancellationCharge: 1000,
      refundableAmount: 1500,
    };

    const snapshot = createInvoiceCancellationSnapshot(input);

    input.effectiveFrom?.setUTCFullYear(2040);
    input.effectiveTo?.setUTCFullYear(2040);
    input.cancellationDate.setUTCFullYear(2040);

    expect(snapshot.policyReference).toBe("POL-1001");
    expect(snapshot.policyVersion).toBe("1.0");
    expect(snapshot.effectiveFrom?.getUTCFullYear()).toBe(2026);
    expect(snapshot.effectiveTo?.getUTCFullYear()).toBe(2026);
    expect(snapshot.cancellationDate.getUTCFullYear()).toBe(2026);
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it("creates immutable metadata and external references", () => {
    const metadataInput = {
      createdAt: new Date("2026-08-09T09:00:00.000Z"),
      updatedAt: new Date("2026-08-09T14:00:00.000Z"),
      version: "1.0.0",
    };
    const externalRefInput = {
      system: "EXTERNAL_ACCOUNTING",
      reference: "ACC-1001",
    };

    const metadata = createInvoiceMetadata(metadataInput);
    const externalReference = createInvoiceExternalReference(externalRefInput);

    metadataInput.createdAt.setUTCFullYear(2040);
    metadataInput.updatedAt.setUTCFullYear(2040);
    externalRefInput.system = "MUTATED";

    expect(metadata.createdAt.getUTCFullYear()).toBe(2026);
    expect(metadata.updatedAt.getUTCFullYear()).toBe(2026);
    expect(externalReference.system).toBe("EXTERNAL_ACCOUNTING");
    expect(Object.isFrozen(metadata)).toBe(true);
    expect(Object.isFrozen(externalReference)).toBe(true);
  });

  it("exposes stable lifecycle status enum values", () => {
    expect(InvoiceStatus.DRAFT).toBe("DRAFT");
    expect(InvoiceStatus.ISSUED).toBe("ISSUED");
    expect(InvoiceStatus.PARTIALLY_PAID).toBe("PARTIALLY_PAID");
    expect(InvoiceStatus.PAID).toBe("PAID");
    expect(InvoiceStatus.OVERDUE).toBe("OVERDUE");
    expect(InvoiceStatus.CANCELLED).toBe("CANCELLED");
    expect(InvoiceStatus.VOID).toBe("VOID");
  });

  it("supports aggregate compatibility with canonical model contracts", () => {
    const composition: InvoiceComposition = {
      identity: createInvoiceIdentity({ id: "invoice-2001" }),
      reservationReference: createInvoiceReservationReference({ reservationId: "reservation-2001" }),
      customerReference: createInvoiceCustomerReference({ travellerId: "traveller-2001" }),
      quoteReference: createInvoiceQuoteReference({ quoteId: "quote-2001", quoteVersion: "v1" }),
      pricingSnapshot: createInvoicePricingSnapshot({
        snapshotId: "pricing-snapshot-2001",
        pricingId: "pricing-2001",
        capturedAt: new Date("2026-08-09T10:00:00.000Z"),
        version: "1.0.0",
        currency: "ZAR",
        totalAmount: 20000,
      }),
      status: InvoiceStatus.ISSUED,
      financialObligation: createInvoiceFinancialObligation({ totalAmount: 20000, currency: "ZAR" }),
      depositRequirement: createInvoiceDepositRequirement({ type: "PERCENTAGE", value: 25 }),
      paymentAllocations: [
        createInvoicePaymentAllocation({
          paymentId: "payment-2001",
          allocatedAmount: 5000,
          allocatedAt: new Date("2026-08-10T10:00:00.000Z"),
        }),
      ],
      adjustments: [
        createInvoiceAdjustment({
          id: "adj-2001",
          type: "MANUAL",
          amount: 250,
          reason: "Approved",
          appliedAt: new Date("2026-08-10T10:30:00.000Z"),
        }),
      ],
      cancellationSnapshot: createInvoiceCancellationSnapshot({
        policyReference: "POL-2001",
        cancellationDate: new Date("2026-08-10T11:00:00.000Z"),
        cancellationCharge: 300,
        refundableAmount: 4700,
      }),
      externalReferences: [
        createInvoiceExternalReference({
          system: "QUICKBOOKS",
          reference: "INV-2001",
        }),
      ],
      metadata: createInvoiceMetadata({
        createdAt: new Date("2026-08-09T09:00:00.000Z"),
        updatedAt: new Date("2026-08-10T12:00:00.000Z"),
        version: "1.0.0",
      }),
    };

    const created = Invoice.create(composition);
    const restored = Invoice.restore(composition);

    expect(created.identity.id).toBe("invoice-2001");
    expect(restored.quoteReference.quoteId).toBe("quote-2001");
    expect(created.amountPaid).toBe(0);
    expect(created.balanceDue).toBe(20000);
    expect(created.refundableAmount).toBe(0);
  });

  it("removes duplicate canonical model declarations from aggregate implementation", () => {
    const aggregateFilePath = path.resolve(__dirname, "aggregate", "invoice.ts");
    const aggregateSource = fs.readFileSync(aggregateFilePath, "utf8");

    expect(aggregateSource).not.toContain("export interface InvoiceIdentity");
    expect(aggregateSource).not.toContain("export interface InvoiceReservationReference");
    expect(aggregateSource).not.toContain("export interface InvoiceCustomerReference");
    expect(aggregateSource).not.toContain("export interface InvoiceQuoteReference");
    expect(aggregateSource).not.toContain("export interface InvoicePricingSnapshot");
    expect(aggregateSource).not.toContain("export interface InvoiceFinancialObligation");
    expect(aggregateSource).not.toContain("export interface InvoiceDepositRequirement");
    expect(aggregateSource).not.toContain("export interface InvoicePaymentAllocation");
    expect(aggregateSource).not.toContain("export interface InvoiceAdjustment");
    expect(aggregateSource).not.toContain("export interface InvoiceCancellationSnapshot");
    expect(aggregateSource).not.toContain("export interface InvoiceExternalReference");
    expect(aggregateSource).not.toContain("export interface InvoiceMetadata");
    expect(aggregateSource).not.toContain("export enum InvoiceStatus");
    expect(aggregateSource).toContain("from \"../models\"");
  });
});
