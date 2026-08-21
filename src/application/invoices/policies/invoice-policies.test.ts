import { Invoice, InvoiceComposition, InvoiceStatus } from "@application/invoices";
import {
  createInvoiceValidationResult,
  InvoiceValidationErrorCode,
  InvoiceValidationStage,
} from "@application/invoices/validation";
import { InvoicePolicy } from "./contracts";
import {
  InvoiceCancellationPolicy,
  InvoiceCommercialPolicy,
  InvoiceIssuePolicy,
  InvoiceOperation,
  InvoicePaymentPolicy,
  InvoicePolicyContext,
  InvoicePolicyOutcome,
  InvoicePolicyPipeline,
  InvoicePolicyPriority,
  InvoicePolicyRegistry,
  InvoicePolicyResult,
  InvoiceRequiredAction,
  InvoiceVoidPolicy,
  createInvoicePolicyContext,
  createInvoicePolicyResult,
} from ".";

function createInvoiceComposition(overrides?: Partial<InvoiceComposition>): InvoiceComposition {
  return {
    identity: { id: "invoice-0074" },
    reservationReference: { reservationId: "reservation-0074" },
    customerReference: { customerId: "customer-0074" },
    quoteReference: { quoteId: "quote-0074", quoteVersion: "v1" },
    pricingSnapshot: {
      snapshotId: "pricing-snapshot-0074",
      pricingId: "pricing-0074",
      capturedAt: new Date("2026-08-09T13:00:00.000Z"),
      version: "1.0.0",
      currency: "ZAR",
      totalAmount: 10000,
    },
    status: InvoiceStatus.DRAFT,
    financialObligation: { totalAmount: 10000, currency: "ZAR" },
    paymentAllocations: [],
    amountPaid: 0,
    balanceDue: 10000,
    adjustments: [],
    refundableAmount: 0,
    externalReferences: [{ system: "ACCOUNTING", reference: "INV-0074" }],
    metadata: {
      createdAt: new Date("2026-08-09T13:00:00.000Z"),
      updatedAt: new Date("2026-08-09T13:00:00.000Z"),
      version: "1.0.0",
    },
    ...(overrides ?? {}),
  };
}

function createInvoice(status: InvoiceStatus = InvoiceStatus.DRAFT, overrides?: Partial<InvoiceComposition>): Invoice {
  return Invoice.create(createInvoiceComposition({ status, ...(overrides ?? {}) }));
}

function createValidationResult(success = true): ReturnType<typeof createInvoiceValidationResult> {
  return createInvoiceValidationResult({
    stage: InvoiceValidationStage.LIFECYCLE_READINESS,
    errors: success
      ? []
      : [
          {
            stage: InvoiceValidationStage.COMMERCIAL,
            code: InvoiceValidationErrorCode.PRICING_CURRENCY_MISMATCH,
            message: "Currency mismatch",
            severity: "CRITICAL",
          },
        ],
    warnings: [],
    metadata: {
      validatedAt: new Date("2026-08-09T13:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createContext(input?: Partial<InvoicePolicyContext>): InvoicePolicyContext {
  return createInvoicePolicyContext({
    operation: InvoiceOperation.ISSUE,
    validationResult: createValidationResult(true),
    invoice: createInvoice(InvoiceStatus.DRAFT),
    ...(input ?? {}),
  });
}

function createPolicyResult(
  policyName: string,
  outcome: InvoicePolicyOutcome,
  priority: InvoicePolicyPriority,
): InvoicePolicyResult {
  return createInvoicePolicyResult({
    policyName,
    outcome,
    priority,
    requiredActions: outcome === InvoicePolicyOutcome.REQUIRE_ACTION ? [InvoiceRequiredAction.MANUAL_APPROVAL] : [],
    errors: outcome === InvoicePolicyOutcome.DENY ? ["Denied"] : [],
    warnings: outcome === InvoicePolicyOutcome.WARNING ? ["Warning"] : [],
    observations: ["observed"],
    metadata: {
      evaluatedAt: new Date("2026-08-09T13:20:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

describe("Invoice policy models", () => {
  it("creates immutable policy contexts", () => {
    const context = createContext();

    expect(Object.isFrozen(context)).toBe(true);
    expect(context.operation).toBe(InvoiceOperation.ISSUE);
  });

  it("creates immutable policy results and clones metadata date", () => {
    const metadata = {
      evaluatedAt: new Date("2026-08-09T13:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    };

    const result = createInvoicePolicyResult({
      policyName: "policy",
      outcome: InvoicePolicyOutcome.ALLOW,
      priority: InvoicePolicyPriority.NORMAL,
      requiredActions: [InvoiceRequiredAction.MANUAL_APPROVAL],
      errors: ["error"],
      warnings: ["warning"],
      observations: ["observation"],
      metadata,
    });

    metadata.evaluatedAt.setUTCFullYear(2040);

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.requiredActions)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.observations)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(result.metadata.evaluatedAt.getUTCFullYear()).toBe(2026);
  });
});

describe("InvoicePolicyRegistry", () => {
  it("registers, resolves, and unregisters policies", () => {
    const registry = new InvoicePolicyRegistry(false);
    const policy: InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult> = {
      evaluate: () => createPolicyResult("one", InvoicePolicyOutcome.ALLOW, InvoicePolicyPriority.NORMAL),
    };

    registry.register("one", policy, InvoicePolicyPriority.HIGH);
    expect(registry.resolve("one")?.name).toBe("one");
    expect(registry.resolve("one")?.priority).toBe(InvoicePolicyPriority.HIGH);
    expect(registry.resolve("missing")).toBeUndefined();
    expect(registry.unregister("one")).toBe(true);
    expect(registry.unregister("one")).toBe(false);
  });

  it("rejects duplicate registrations", () => {
    const registry = new InvoicePolicyRegistry(false);
    const policy: InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult> = {
      evaluate: () => createPolicyResult("dup", InvoicePolicyOutcome.ALLOW, InvoicePolicyPriority.NORMAL),
    };

    registry.register("dup", policy);

    expect(() => registry.register("dup", policy)).toThrow("Invoice policy 'dup' is already registered.");
  });

  it("orders by priority and preserves order within equal priority", () => {
    const registry = new InvoicePolicyRegistry(false);

    registry.register("normal-a", { evaluate: () => createPolicyResult("normal-a", InvoicePolicyOutcome.ALLOW, InvoicePolicyPriority.NORMAL) }, InvoicePolicyPriority.NORMAL);
    registry.register("critical", { evaluate: () => createPolicyResult("critical", InvoicePolicyOutcome.ALLOW, InvoicePolicyPriority.CRITICAL) }, InvoicePolicyPriority.CRITICAL);
    registry.register("normal-b", { evaluate: () => createPolicyResult("normal-b", InvoicePolicyOutcome.ALLOW, InvoicePolicyPriority.NORMAL) }, InvoicePolicyPriority.NORMAL);
    registry.register("high", { evaluate: () => createPolicyResult("high", InvoicePolicyOutcome.ALLOW, InvoicePolicyPriority.HIGH) }, InvoicePolicyPriority.HIGH);

    const all = registry.resolveAll();
    expect(all.map((entry) => entry.name)).toEqual(["critical", "high", "normal-a", "normal-b"]);
    expect(Object.isFrozen(all)).toBe(true);
    expect(Object.isFrozen(all[0])).toBe(true);
  });

  it("registers default invoice policies", () => {
    const registry = new InvoicePolicyRegistry();
    const names = registry.resolveAll().map((entry) => entry.name);

    expect(names).toContain("InvoiceCommercialPolicy");
    expect(names).toContain("InvoiceIssuePolicy");
    expect(names).toContain("InvoicePaymentPolicy");
    expect(names).toContain("InvoiceCancellationPolicy");
    expect(names).toContain("InvoiceVoidPolicy");
  });
});

describe("InvoicePolicyPipeline", () => {
  it("evaluates by registry priority and preserves equal-priority order", () => {
    const registry = new InvoicePolicyRegistry(false);
    const callOrder: string[] = [];

    registry.register("normal-a", {
      evaluate: () => {
        callOrder.push("normal-a");
        return createPolicyResult("normal-a", InvoicePolicyOutcome.ALLOW, InvoicePolicyPriority.NORMAL);
      },
    }, InvoicePolicyPriority.NORMAL);
    registry.register("critical", {
      evaluate: () => {
        callOrder.push("critical");
        return createPolicyResult("critical", InvoicePolicyOutcome.ALLOW, InvoicePolicyPriority.CRITICAL);
      },
    }, InvoicePolicyPriority.CRITICAL);
    registry.register("normal-b", {
      evaluate: () => {
        callOrder.push("normal-b");
        return createPolicyResult("normal-b", InvoicePolicyOutcome.ALLOW, InvoicePolicyPriority.NORMAL);
      },
    }, InvoicePolicyPriority.NORMAL);
    registry.register("high", {
      evaluate: () => {
        callOrder.push("high");
        return createPolicyResult("high", InvoicePolicyOutcome.ALLOW, InvoicePolicyPriority.HIGH);
      },
    }, InvoicePolicyPriority.HIGH);

    const pipeline = new InvoicePolicyPipeline(registry);
    const result = pipeline.evaluate(createContext());

    expect(callOrder).toEqual(["critical", "high", "normal-a", "normal-b"]);
    expect(result.permitted).toBe(true);
    expect(result.outcome).toBe(InvoicePolicyOutcome.ALLOW);
  });

  it("short-circuits on critical deny", () => {
    const registry = new InvoicePolicyRegistry(false);
    const callOrder: string[] = [];

    registry.register("deny-critical", {
      evaluate: () => {
        callOrder.push("deny-critical");
        return createPolicyResult("deny-critical", InvoicePolicyOutcome.DENY, InvoicePolicyPriority.CRITICAL);
      },
    }, InvoicePolicyPriority.CRITICAL);
    registry.register("later", {
      evaluate: () => {
        callOrder.push("later");
        return createPolicyResult("later", InvoicePolicyOutcome.ALLOW, InvoicePolicyPriority.NORMAL);
      },
    }, InvoicePolicyPriority.NORMAL);

    const pipeline = new InvoicePolicyPipeline(registry);
    const result = pipeline.evaluate(createContext());

    expect(callOrder).toEqual(["deny-critical"]);
    expect(result.permitted).toBe(false);
    expect(result.outcome).toBe(InvoicePolicyOutcome.DENY);
  });

  it("continues after non-critical deny and still denies overall", () => {
    const registry = new InvoicePolicyRegistry(false);
    const callOrder: string[] = [];

    registry.register("deny-normal", {
      evaluate: () => {
        callOrder.push("deny-normal");
        return createPolicyResult("deny-normal", InvoicePolicyOutcome.DENY, InvoicePolicyPriority.NORMAL);
      },
    }, InvoicePolicyPriority.NORMAL);
    registry.register("allow-later", {
      evaluate: () => {
        callOrder.push("allow-later");
        return createPolicyResult("allow-later", InvoicePolicyOutcome.ALLOW, InvoicePolicyPriority.LOW);
      },
    }, InvoicePolicyPriority.LOW);

    const pipeline = new InvoicePolicyPipeline(registry);
    const result = pipeline.evaluate(createContext());

    expect(callOrder).toEqual(["deny-normal", "allow-later"]);
    expect(result.permitted).toBe(false);
    expect(result.outcome).toBe(InvoicePolicyOutcome.DENY);
  });

  it("aggregates require-action and denies permission without explicit deny", () => {
    const registry = new InvoicePolicyRegistry(false);

    registry.register("action", {
      evaluate: () =>
        createInvoicePolicyResult({
          policyName: "action",
          outcome: InvoicePolicyOutcome.REQUIRE_ACTION,
          priority: InvoicePolicyPriority.HIGH,
          requiredActions: [InvoiceRequiredAction.CUSTOMER_VERIFICATION],
          observations: ["Action needed"],
          metadata: {
            evaluatedAt: new Date(),
            version: "1.0.0",
            source: "test",
          },
        }),
    }, InvoicePolicyPriority.HIGH);

    const pipeline = new InvoicePolicyPipeline(registry);
    const result = pipeline.evaluate(createContext());

    expect(result.permitted).toBe(false);
    expect(result.outcome).toBe(InvoicePolicyOutcome.REQUIRE_ACTION);
    expect(result.requiredActions).toEqual([InvoiceRequiredAction.CUSTOMER_VERIFICATION]);
  });

  it("allows warning-only outcomes", () => {
    const registry = new InvoicePolicyRegistry(false);

    registry.register("warning", {
      evaluate: () =>
        createInvoicePolicyResult({
          policyName: "warning",
          outcome: InvoicePolicyOutcome.WARNING,
          priority: InvoicePolicyPriority.NORMAL,
          warnings: ["warn"],
          metadata: {
            evaluatedAt: new Date(),
            version: "1.0.0",
            source: "test",
          },
        }),
    }, InvoicePolicyPriority.NORMAL);

    const pipeline = new InvoicePolicyPipeline(registry);
    const result = pipeline.evaluate(createContext());

    expect(result.permitted).toBe(true);
    expect(result.outcome).toBe(InvoicePolicyOutcome.WARNING);
    expect(result.warnings).toEqual(["warn"]);
  });

  it("returns IGNORE and permitted true when all policies ignore", () => {
    const registry = new InvoicePolicyRegistry(false);

    registry.register("ignore-1", { evaluate: () => createPolicyResult("ignore-1", InvoicePolicyOutcome.IGNORE, InvoicePolicyPriority.LOW) }, InvoicePolicyPriority.LOW);
    registry.register("ignore-2", { evaluate: () => createPolicyResult("ignore-2", InvoicePolicyOutcome.IGNORE, InvoicePolicyPriority.LOW) }, InvoicePolicyPriority.LOW);

    const pipeline = new InvoicePolicyPipeline(registry);
    const result = pipeline.evaluate(createContext());

    expect(result.permitted).toBe(true);
    expect(result.outcome).toBe(InvoicePolicyOutcome.IGNORE);
  });

  it("denies immediately when validation fails", () => {
    const registry = new InvoicePolicyRegistry(false);
    registry.register("never", { evaluate: jest.fn(() => createPolicyResult("never", InvoicePolicyOutcome.ALLOW, InvoicePolicyPriority.NORMAL)) }, InvoicePolicyPriority.NORMAL);

    const pipeline = new InvoicePolicyPipeline(registry);
    const result = pipeline.evaluate(
      createContext({
        validationResult: createValidationResult(false),
      }),
    );

    expect(result.permitted).toBe(false);
    expect(result.outcome).toBe(InvoicePolicyOutcome.DENY);
    expect(result.policyResults).toHaveLength(1);
    expect(result.policyResults[0]?.policyName).toBe("InvoiceValidationDependencyPolicy");
  });

  it("returns immutable evaluation", () => {
    const registry = new InvoicePolicyRegistry(false);
    registry.register("allow", { evaluate: () => createPolicyResult("allow", InvoicePolicyOutcome.ALLOW, InvoicePolicyPriority.NORMAL) }, InvoicePolicyPriority.NORMAL);

    const result = new InvoicePolicyPipeline(registry).evaluate(createContext());

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.requiredActions)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.observations)).toBe(true);
    expect(Object.isFrozen(result.policyResults)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
  });
});

describe("InvoiceIssuePolicy", () => {
  const scenarios: Array<[InvoiceStatus, InvoicePolicyOutcome]> = [
    [InvoiceStatus.DRAFT, InvoicePolicyOutcome.ALLOW],
    [InvoiceStatus.ISSUED, InvoicePolicyOutcome.DENY],
    [InvoiceStatus.PARTIALLY_PAID, InvoicePolicyOutcome.DENY],
    [InvoiceStatus.PAID, InvoicePolicyOutcome.DENY],
    [InvoiceStatus.OVERDUE, InvoicePolicyOutcome.DENY],
    [InvoiceStatus.CANCELLED, InvoicePolicyOutcome.DENY],
    [InvoiceStatus.VOID, InvoicePolicyOutcome.DENY],
  ];

  it.each(scenarios)("returns %s -> %s", (status, outcome) => {
    const policy = new InvoiceIssuePolicy();
    const result = policy.evaluate(
      createContext({
        operation: InvoiceOperation.ISSUE,
        invoice: createInvoice(status),
      }),
    );

    expect(result.outcome).toBe(outcome);
  });
});

describe("InvoicePaymentPolicy", () => {
  const scenarios: Array<[InvoiceStatus, InvoicePolicyOutcome]> = [
    [InvoiceStatus.DRAFT, InvoicePolicyOutcome.DENY],
    [InvoiceStatus.ISSUED, InvoicePolicyOutcome.ALLOW],
    [InvoiceStatus.PARTIALLY_PAID, InvoicePolicyOutcome.ALLOW],
    [InvoiceStatus.PAID, InvoicePolicyOutcome.DENY],
    [InvoiceStatus.OVERDUE, InvoicePolicyOutcome.ALLOW],
    [InvoiceStatus.CANCELLED, InvoicePolicyOutcome.DENY],
    [InvoiceStatus.VOID, InvoicePolicyOutcome.DENY],
  ];

  it.each(scenarios)("returns %s -> %s", (status, outcome) => {
    const policy = new InvoicePaymentPolicy();
    const invoice = createInvoice(status);
    const beforeBalance = invoice.balanceDue;

    const result = policy.evaluate(
      createContext({
        operation: InvoiceOperation.ACCEPT_PAYMENT,
        invoice,
      }),
    );

    expect(result.outcome).toBe(outcome);
    expect(invoice.balanceDue).toBe(beforeBalance);
  });

  it("returns payment review when explicitly required", () => {
    const policy = new InvoicePaymentPolicy();
    const result = policy.evaluate(
      createContext({
        operation: InvoiceOperation.ACCEPT_PAYMENT,
        invoice: createInvoice(InvoiceStatus.ISSUED),
        reviewRequirements: { paymentReviewRequired: true },
      }),
    );

    expect(result.outcome).toBe(InvoicePolicyOutcome.REQUIRE_ACTION);
    expect(result.requiredActions).toEqual([InvoiceRequiredAction.PAYMENT_REVIEW]);
  });

  it("includes overdue warning", () => {
    const policy = new InvoicePaymentPolicy();
    const result = policy.evaluate(
      createContext({
        operation: InvoiceOperation.ACCEPT_PAYMENT,
        invoice: createInvoice(InvoiceStatus.OVERDUE),
      }),
    );

    expect(result.warnings).toContain("Invoice is overdue.");
  });
});

describe("InvoiceCancellationPolicy", () => {
  it("supports lifecycle cancellation rules", () => {
    const policy = new InvoiceCancellationPolicy();

    expect(
      policy.evaluate(createContext({ operation: InvoiceOperation.CANCEL, invoice: createInvoice(InvoiceStatus.DRAFT) })).outcome,
    ).toBe(InvoicePolicyOutcome.ALLOW);
    expect(
      policy.evaluate(createContext({ operation: InvoiceOperation.CANCEL, invoice: createInvoice(InvoiceStatus.ISSUED) })).outcome,
    ).toBe(InvoicePolicyOutcome.ALLOW);
    expect(
      policy.evaluate(createContext({ operation: InvoiceOperation.CANCEL, invoice: createInvoice(InvoiceStatus.PARTIALLY_PAID) })).outcome,
    ).toBe(InvoicePolicyOutcome.ALLOW);
    expect(
      policy.evaluate(createContext({ operation: InvoiceOperation.CANCEL, invoice: createInvoice(InvoiceStatus.PAID) })).outcome,
    ).toBe(InvoicePolicyOutcome.REQUIRE_ACTION);
    expect(
      policy.evaluate(createContext({ operation: InvoiceOperation.CANCEL, invoice: createInvoice(InvoiceStatus.OVERDUE) })).outcome,
    ).toBe(InvoicePolicyOutcome.ALLOW);
    expect(
      policy.evaluate(createContext({ operation: InvoiceOperation.CANCEL, invoice: createInvoice(InvoiceStatus.CANCELLED) })).outcome,
    ).toBe(InvoicePolicyOutcome.DENY);
    expect(
      policy.evaluate(createContext({ operation: InvoiceOperation.CANCEL, invoice: createInvoice(InvoiceStatus.VOID) })).outcome,
    ).toBe(InvoicePolicyOutcome.DENY);
  });

  it("requires review when partially paid cancellation indicates review", () => {
    const policy = new InvoiceCancellationPolicy();
    const result = policy.evaluate(
      createContext({
        operation: InvoiceOperation.CANCEL,
        invoice: createInvoice(InvoiceStatus.PARTIALLY_PAID),
        reviewRequirements: { cancellationReviewRequired: true },
      }),
    );

    expect(result.outcome).toBe(InvoicePolicyOutcome.REQUIRE_ACTION);
    expect(result.requiredActions).toEqual([InvoiceRequiredAction.CANCELLATION_REVIEW]);
  });
});

describe("InvoiceVoidPolicy", () => {
  it("supports lifecycle void rules", () => {
    const policy = new InvoiceVoidPolicy();

    expect(policy.evaluate(createContext({ operation: InvoiceOperation.VOID, invoice: createInvoice(InvoiceStatus.DRAFT) })).outcome).toBe(InvoicePolicyOutcome.ALLOW);
    expect(policy.evaluate(createContext({ operation: InvoiceOperation.VOID, invoice: createInvoice(InvoiceStatus.ISSUED) })).outcome).toBe(InvoicePolicyOutcome.ALLOW);
    expect(policy.evaluate(createContext({ operation: InvoiceOperation.VOID, invoice: createInvoice(InvoiceStatus.PARTIALLY_PAID) })).outcome).toBe(InvoicePolicyOutcome.REQUIRE_ACTION);
    expect(policy.evaluate(createContext({ operation: InvoiceOperation.VOID, invoice: createInvoice(InvoiceStatus.PAID) })).outcome).toBe(InvoicePolicyOutcome.DENY);
    expect(policy.evaluate(createContext({ operation: InvoiceOperation.VOID, invoice: createInvoice(InvoiceStatus.OVERDUE) })).outcome).toBe(InvoicePolicyOutcome.REQUIRE_ACTION);
    expect(policy.evaluate(createContext({ operation: InvoiceOperation.VOID, invoice: createInvoice(InvoiceStatus.CANCELLED) })).outcome).toBe(InvoicePolicyOutcome.DENY);
    expect(policy.evaluate(createContext({ operation: InvoiceOperation.VOID, invoice: createInvoice(InvoiceStatus.VOID) })).outcome).toBe(InvoicePolicyOutcome.DENY);
  });

  it("returns financial review for partial and overdue invoices", () => {
    const policy = new InvoiceVoidPolicy();

    const partial = policy.evaluate(createContext({ operation: InvoiceOperation.VOID, invoice: createInvoice(InvoiceStatus.PARTIALLY_PAID) }));
    const overdue = policy.evaluate(createContext({ operation: InvoiceOperation.VOID, invoice: createInvoice(InvoiceStatus.OVERDUE) }));

    expect(partial.requiredActions).toEqual([InvoiceRequiredAction.FINANCIAL_REVIEW]);
    expect(overdue.requiredActions).toEqual([InvoiceRequiredAction.FINANCIAL_REVIEW]);
  });
});

describe("InvoiceCommercialPolicy", () => {
  it("allows valid commercial state", () => {
    const policy = new InvoiceCommercialPolicy();
    const invoice = createInvoice(InvoiceStatus.ISSUED);
    const beforeCurrency = invoice.pricingSnapshot.currency;

    const result = policy.evaluate(
      createContext({
        operation: InvoiceOperation.ACCEPT_PAYMENT,
        invoice,
      }),
    );

    expect(result.outcome).toBe(InvoicePolicyOutcome.ALLOW);
    expect(invoice.pricingSnapshot.currency).toBe(beforeCurrency);
  });

  it("denies when validation has critical commercial failure", () => {
    const policy = new InvoiceCommercialPolicy();

    const result = policy.evaluate(
      createContext({
        operation: InvoiceOperation.ISSUE,
        validationResult: createValidationResult(false),
      }),
    );

    expect(result.outcome).toBe(InvoicePolicyOutcome.DENY);
    expect(result.priority).toBe(InvoicePolicyPriority.CRITICAL);
  });

  it("ignores operations outside commercial scope", () => {
    const policy = new InvoiceCommercialPolicy();
    const result = policy.evaluate(createContext({ operation: InvoiceOperation.CREATE }));

    expect(result.outcome).toBe(InvoicePolicyOutcome.IGNORE);
  });
});