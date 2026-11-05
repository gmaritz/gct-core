import { PaymentMethod, PaymentStatus } from "@application/payments";
import {
  PaymentProviderContext,
  PaymentProviderOperation,
  createPaymentGatewayProviderReference,
} from "@application/payments/integration";
import { Payment } from "@application/payments/aggregate";
import {
  DefaultPayFastGateway,
  defaultPayFastSignature,
  loadPayFastIntegrationConfig,
  normalizePayFastITN,
  verifyPayFastSignature,
  PayFastEnvironment,
  createPayFastApiSignature,
} from "./index";

const payFastTestConfig = {
  environment: PayFastEnvironment.SANDBOX,
  merchantId: "10000100",
  merchantKey: "merchant-key",
  passphrase: "passphrase",
  paymentProcessUrl: "https://sandbox.payfast.co.za/eng/process",
  apiBaseUrl: "https://api.payfast.co.za",
  paymentQueryUrl: "https://api.payfast.co.za/process/query",
  refundQueryUrl: "https://api.payfast.co.za/refunds/query",
  refundUrl: "https://api.payfast.co.za/refunds",
  returnUrl: "https://merchant.example.test/return",
  cancelUrl: "https://merchant.example.test/cancel",
  notifyUrl: "https://merchant.example.test/notify",
  timeoutMs: 5000,
  apiVersion: "v1",
};

function createGatewayContext(amount: number, currency = "ZAR"): PaymentProviderContext {
  const capturedAt = new Date("2026-08-01T00:00:00.000Z");
  const payment = Payment.create({
    reference: { paymentId: "pay-123", reservationId: "res-123" },
    reservationSnapshot: {
      snapshotId: "snap-123",
      capturedAt,
      version: "1.0.0",
      reservationId: "res-123",
      reservationReference: "RES-123",
    },
    pricingSnapshot: {
      snapshotId: "pricing-123",
      capturedAt,
      version: "1.0.0",
      pricingId: "price-123",
      subtotal: amount,
      taxes: 0,
      discounts: 0,
      fees: 0,
      total: amount,
      currency,
    },
    paymentAmount: amount,
    currency,
    paymentMethod: PaymentMethod.CARD,
    status: PaymentStatus.CREATED,
    metadata: {
      createdAt: capturedAt,
      updatedAt: capturedAt,
      version: "1.0.0",
      source: "test",
    },
  });

  return {
    paymentAggregate: payment,
    gatewayRequest: {
      paymentReference: payment.reference,
      reservationReference: payment.reservationSnapshot.reservationReference,
      providerReference: createPaymentGatewayProviderReference({
        providerIdentifier: "payfast",
        reference: "payfast-ref",
      }),
      operation: PaymentProviderOperation.AUTHORIZE,
      paymentMethod: payment.paymentMethod,
      currency,
      amount,
      metadata: {
        requestedAt: capturedAt,
        version: "1.0.0",
        requestId: "req-123",
        source: "test",
      },
    },
    operation: PaymentProviderOperation.AUTHORIZE,
    metadata: {
      startedAt: capturedAt,
      version: "1.0.0",
      requestId: "req-123",
      source: "test",
    },
  };
}

describe("PayFast gateway integration", () => {
  it("loads sandbox configuration from environment", () => {
    const config = loadPayFastIntegrationConfig({
      PAYFAST_MERCHANT_ID: "10000100",
      PAYFAST_MERCHANT_KEY: "xxxx",
      PAYFAST_PASSPHRASE: "passphrase",
      PAYFAST_ENVIRONMENT: "sandbox",
      PAYFAST_TIMEOUT_MS: "5000",
      PAYFAST_PAYMENT_URL: "https://sandbox.payfast.co.za/eng/process",
      PAYFAST_API_URL: "https://api.payfast.co.za",
      PAYFAST_RETURN_URL: "https://merchant.example.test/return",
      PAYFAST_CANCEL_URL: "https://merchant.example.test/cancel",
      PAYFAST_NOTIFY_URL: "https://merchant.example.test/notify",
    });

    expect(config.environment).toBe(PayFastEnvironment.SANDBOX);
    expect(config.paymentProcessUrl).toContain("sandbox.payfast.co.za");
    expect(config.timeoutMs).toBe(5000);
    expect(config.returnUrl).toBe("https://merchant.example.test/return");
    expect(config.cancelUrl).toBe("https://merchant.example.test/cancel");
    expect(config.notifyUrl).toBe("https://merchant.example.test/notify");
  });

  it("applies runtime-aware environment defaults and rejects invalid or unsafe configurations", () => {
    const requiredConfig = {
      PAYFAST_MERCHANT_ID: "10000100",
      PAYFAST_MERCHANT_KEY: "merchant-key",
      PAYFAST_PASSPHRASE: "passphrase",
      PAYFAST_RETURN_URL: "https://merchant.example.test/return",
      PAYFAST_CANCEL_URL: "https://merchant.example.test/cancel",
      PAYFAST_NOTIFY_URL: "https://merchant.example.test/notify",
    };

    for (const runtime of ["development", "test"]) {
      expect(loadPayFastIntegrationConfig({
        ...requiredConfig,
        NODE_ENV: runtime,
      }).environment).toBe(PayFastEnvironment.SANDBOX);
      expect(loadPayFastIntegrationConfig({
        ...requiredConfig,
        NODE_ENV: runtime,
        PAYFAST_ENVIRONMENT: "  ",
      }).environment).toBe(PayFastEnvironment.SANDBOX);
      expect(loadPayFastIntegrationConfig({
        ...requiredConfig,
        NODE_ENV: runtime,
        PAYFAST_ENVIRONMENT: "SANDBOX",
      }).environment).toBe(PayFastEnvironment.SANDBOX);
      expect(loadPayFastIntegrationConfig({
        ...requiredConfig,
        NODE_ENV: runtime,
        PAYFAST_ENVIRONMENT: "LIVE",
      }).environment).toBe(PayFastEnvironment.LIVE);
      expect(() => loadPayFastIntegrationConfig({
        ...requiredConfig,
        NODE_ENV: runtime,
        PAYFAST_ENVIRONMENT: "staging",
      })).toThrow("PAYFAST_ENVIRONMENT must be SANDBOX or LIVE.");
    }

    expect(loadPayFastIntegrationConfig({
      ...requiredConfig,
      NODE_ENV: "production",
      PAYFAST_ENVIRONMENT: "LIVE",
    }).environment).toBe(PayFastEnvironment.LIVE);
    for (const environment of [undefined, "  ", "SANDBOX"]) {
      expect(() => loadPayFastIntegrationConfig({
        ...requiredConfig,
        NODE_ENV: "production",
        PAYFAST_ENVIRONMENT: environment,
      })).toThrow("PAYFAST_ENVIRONMENT must be explicitly set to LIVE in production.");
    }
    expect(() => loadPayFastIntegrationConfig({
      ...requiredConfig,
      NODE_ENV: "production",
      PAYFAST_ENVIRONMENT: "staging",
    })).toThrow("PAYFAST_ENVIRONMENT must be SANDBOX or LIVE.");

    expect(() => loadPayFastIntegrationConfig({
      ...requiredConfig,
      NODE_ENV: "test",
      PAYFAST_ENVIRONMENT: "LIVE",
      PAYFAST_PAYMENT_URL: "https://sandbox.payfast.co.za/eng/process",
    })).toThrow("PAYFAST_PAYMENT_URL must use HTTPS on www.payfast.co.za");
    expect(() => loadPayFastIntegrationConfig({
      ...requiredConfig,
      NODE_ENV: "test",
      PAYFAST_API_URL: "https://api.example.test",
    })).toThrow("PAYFAST_API_URL must use HTTPS on api.payfast.co.za");
    expect(() => loadPayFastIntegrationConfig({
      ...requiredConfig,
      NODE_ENV: "test",
      PAYFAST_API_VERSION: "v2",
    })).toThrow("PAYFAST_API_VERSION must be v1.");
    expect(() => loadPayFastIntegrationConfig({
      ...requiredConfig,
      NODE_ENV: "test",
      PAYFAST_MERCHANT_ID: "not-an-id",
    })).toThrow("PayFast merchant ID must contain exactly 8 digits.");
  });

  it("fails safely when merchant authentication configuration is incomplete", () => {
    const requiredConfig = {
      PAYFAST_MERCHANT_ID: "10000100",
      PAYFAST_MERCHANT_KEY: "merchant-key",
      PAYFAST_PASSPHRASE: "passphrase",
      PAYFAST_RETURN_URL: "https://merchant.example.test/return",
      PAYFAST_CANCEL_URL: "https://merchant.example.test/cancel",
      PAYFAST_NOTIFY_URL: "https://merchant.example.test/notify",
    };

    expect(() => loadPayFastIntegrationConfig({
      ...requiredConfig,
      PAYFAST_MERCHANT_ID: "",
    })).toThrow("PayFast merchant ID is required.");
    expect(() => loadPayFastIntegrationConfig({
      ...requiredConfig,
      PAYFAST_MERCHANT_KEY: "",
    })).toThrow("PayFast merchant key is required.");
    expect(() => loadPayFastIntegrationConfig({
      ...requiredConfig,
      PAYFAST_PASSPHRASE: "",
    })).toThrow("PayFast passphrase is required.");
  });

  it("matches the PayFast documentation signature vector using hosted-form field order", () => {
    const signature = defaultPayFastSignature(
      {
        merchant_id: "10000100",
        merchant_key: "46f0cd694581a",
        return_url: "http://www.yourdomain.co.za/return.php",
        cancel_url: "http://www.yourdomain.co.za/cancel.php",
        notify_url: "http://www.yourdomain.co.za/notify.php",
        name_first: "First Name",
        name_last: "Last Name",
        email_address: "test@test.com",
        m_payment_id: "1234",
        amount: "10.00",
        item_name: "Order#123",
        item_description: "",
        cell_number: undefined,
        signature: "excluded",
      },
      "jt7NOE43FZPn",
    );

    expect(signature).toBe("8317e2bbd1ae2a6f4f36837e83be4ca9");
  });

  it("uses form-url-encoding for special characters and passphrases", () => {
    expect(defaultPayFastSignature(
      { item_description: "!*'()~" },
      "p a",
    )).toBe("65e9fe63ea8248cb8108ebaac70a54cd");
  });

  it("fails closed when any hosted-form callback URL is missing", () => {
    const requiredConfig: Record<string, string> = {
      PAYFAST_MERCHANT_ID: "10000100",
      PAYFAST_MERCHANT_KEY: "merchant-key",
      PAYFAST_PASSPHRASE: "passphrase",
      PAYFAST_RETURN_URL: "https://merchant.example.test/return",
      PAYFAST_CANCEL_URL: "https://merchant.example.test/cancel",
      PAYFAST_NOTIFY_URL: "https://merchant.example.test/notify",
    };

    for (const field of ["PAYFAST_RETURN_URL", "PAYFAST_CANCEL_URL", "PAYFAST_NOTIFY_URL"]) {
      expect(() => loadPayFastIntegrationConfig({ ...requiredConfig, [field]: "" })).toThrow(`${field} is required.`);
    }

    expect(() => loadPayFastIntegrationConfig({
      ...requiredConfig,
      PAYFAST_NOTIFY_URL: "https://merchant:secret@merchant.example.test/notify",
    })).toThrow("PAYFAST_NOTIFY_URL must be an absolute HTTP or HTTPS URL without embedded credentials.");
  });

  it("verifies a valid PayFast ITN signature", () => {
    const payload = {
      merchant_id: "10000100",
      m_payment_id: "pay-123",
      pf_payment_id: "PF-123",
      payment_status: "COMPLETE",
      amount_gross: "272.00",
      amount_fee: "2.72",
      amount_net: "269.28",
      signature: "" as string,
    };

    payload.signature = defaultPayFastSignature(payload, "passphrase");

    expect(verifyPayFastSignature(payload, "passphrase")).toBe(true);
    expect(normalizePayFastITN(payload)).toMatchObject({
      merchantId: "10000100",
      paymentId: "pay-123",
      providerPaymentId: "PF-123",
      status: "COMPLETE",
    });
  });

  it("maps a provider request into a provider result without leaking PayFast data into the app contract", async () => {
    const gateway = new DefaultPayFastGateway(payFastTestConfig);
    const result = await gateway.execute(createGatewayContext(64990.09));

    expect(result.success).toBe(true);
    expect(result.authorizationStatus).toBeDefined();
    expect(result.paymentStatus).toBe(PaymentStatus.CREATED);
    expect(result.authorizationStatus).toBeNull();
    expect(result.transactionReference).toBeNull();
    expect(result.providerReference?.providerIdentifier).toBe("payfast");
    expect(result.metadata.operation).toBe(PaymentProviderOperation.AUTHORIZE);
    expect(result.hostedPaymentAction?.method).toBe("POST");
    expect(result.hostedPaymentAction?.action).toBe("https://sandbox.payfast.co.za/eng/process");
    expect(result.hostedPaymentAction?.fields.amount).toBe("64990.09");
    expect(result.hostedPaymentAction?.fields.m_payment_id).toBe("payfast-ref");
    expect(result.hostedPaymentAction?.fields.merchant_id).toBe("10000100");
    expect(result.hostedPaymentAction?.fields.merchant_key).toBe("merchant-key");
    expect(result.hostedPaymentAction?.fields.return_url).toBe(payFastTestConfig.returnUrl);
    expect(result.hostedPaymentAction?.fields.cancel_url).toBe(payFastTestConfig.cancelUrl);
    expect(result.hostedPaymentAction?.fields.notify_url).toBe(payFastTestConfig.notifyUrl);
    expect(Object.keys(result.hostedPaymentAction?.fields ?? {})).toEqual([
      "merchant_id",
      "merchant_key",
      "return_url",
      "cancel_url",
      "notify_url",
      "m_payment_id",
      "amount",
      "item_name",
      "item_description",
      "signature",
    ]);
    expect(result.hostedPaymentAction?.fields.signature).toBeDefined();
    expect(result.hostedPaymentAction?.fields.passphrase).toBeUndefined();
    expect(result.hostedPaymentAction?.fields.name_first).toBeUndefined();
    expect(result.hostedPaymentAction?.fields.name_last).toBeUndefined();
    expect(result.hostedPaymentAction?.fields.email_address).toBeUndefined();
    expect(result.hostedPaymentAction?.fields.cell_number).toBeUndefined();
  });

  it("rejects unsupported hosted-payment currencies and invalid major-unit amounts", async () => {
    const gateway = new DefaultPayFastGateway(payFastTestConfig);
    const unsupportedCurrency = await gateway.execute(createGatewayContext(64990.09, "EUR"));

    expect(unsupportedCurrency.success).toBe(false);
    expect(unsupportedCurrency.hostedPaymentAction).toBeUndefined();
    expect(unsupportedCurrency.warnings).toContain(
      "PayFast hosted payments only support ZAR; received EUR.",
    );

    for (const amount of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, 64990.091, 0.30000000000000004]) {
      const result = await gateway.execute(createGatewayContext(amount));
      expect(result.success).toBe(false);
      expect(result.hostedPaymentAction).toBeUndefined();
      expect(result.warnings).toContain(
        "PayFast hosted payment amount must be a positive, finite ZAR amount with at most two decimal places.",
      );
    }
  });

  it("matches an independent PayFast API signature vector with alphabetical URL encoding", () => {
    expect(createPayFastApiSignature({
      description: "A & B!",
      "merchant-id": "10000100",
      timestamp: "2020-04-01T12:00:01+02:00",
      version: "v1",
      omitted: undefined,
      blank: "",
    }, "p a")).toBe("f3feba77ae590246901ead761ab0d4e3");
  });

  it("excludes an existing signature property from API signature input", () => {
    const fields = {
      description: "A & B!",
      "merchant-id": "10000100",
      timestamp: "2020-04-01T12:00:01+02:00",
      version: "v1",
    };
    const expected = createPayFastApiSignature(fields, "p a");

    expect(createPayFastApiSignature({
      ...fields,
      signature: "an-existing-signature",
    }, "p a")).toBe(expected);
    expect(expected).toBe("f3feba77ae590246901ead761ab0d4e3");
  });

  it("maps an unknown PayFast transaction status to a failed canonical result", async () => {
    let capturedRequest: { method: string; url: string; headers?: Record<string, string> } | undefined;
    const gateway = new DefaultPayFastGateway(
      {
        environment: PayFastEnvironment.SANDBOX,
        merchantId: "10000100",
        merchantKey: "merchant-key",
        passphrase: "passphrase",
        paymentProcessUrl: "https://sandbox.payfast.co.za/eng/process",
        apiBaseUrl: "https://api.payfast.co.za",
        paymentQueryUrl: "https://api.payfast.co.za/process/query",
        refundQueryUrl: "https://api.payfast.co.za/refunds/query",
        refundUrl: "https://api.payfast.co.za/refunds",
        returnUrl: payFastTestConfig.returnUrl,
        cancelUrl: payFastTestConfig.cancelUrl,
        notifyUrl: payFastTestConfig.notifyUrl,
        timeoutMs: 5000,
        apiVersion: "v1",
      },
      {
        execute: async (request): Promise<{ status: number; ok: boolean; body: string }> => {
          capturedRequest = request;
          return { status: 200, ok: true, body: JSON.stringify({ status: "UNKNOWN_STATE" }) };
        },
      },
    );

    const payment = Payment.create({
      reference: { paymentId: "pay-123", reservationId: "res-123" },
      reservationSnapshot: {
        snapshotId: "snap-123",
        capturedAt: new Date("2026-08-01T00:00:00.000Z"),
        version: "1.0.0",
        reservationId: "res-123",
        reservationReference: "RES-123",
      },
      pricingSnapshot: {
        snapshotId: "pricing-123",
        capturedAt: new Date("2026-08-01T00:00:00.000Z"),
        version: "1.0.0",
        pricingId: "price-123",
        subtotal: 25000,
        taxes: 3000,
        discounts: 1000,
        fees: 200,
        total: 27200,
        currency: "ZAR",
      },
      paymentAmount: 27200,
      currency: "ZAR",
      paymentMethod: PaymentMethod.CARD,
      status: PaymentStatus.CREATED,
      metadata: {
        createdAt: new Date("2026-08-01T00:00:00.000Z"),
        updatedAt: new Date("2026-08-01T00:00:00.000Z"),
        version: "1.0.0",
        source: "test",
      },
    });

    const result = await gateway.execute({
      paymentAggregate: payment,
      gatewayRequest: {
        paymentReference: payment.reference,
        reservationReference: payment.reservationSnapshot.reservationReference,
        providerReference: createPaymentGatewayProviderReference({ providerIdentifier: "payfast", reference: "pf-123" }),
        operation: PaymentProviderOperation.STATUS,
        paymentMethod: payment.paymentMethod,
        currency: payment.currency,
        amount: payment.paymentAmount,
        metadata: {
          requestedAt: new Date("2026-08-01T00:00:00.000Z"),
          version: "1.0.0",
          requestId: "req-status",
          source: "test",
        },
      },
      operation: PaymentProviderOperation.STATUS,
      metadata: {
        startedAt: new Date("2026-08-01T00:00:00.000Z"),
        version: "1.0.0",
        requestId: "req-status",
        source: "test",
      },
    });

    expect(result.success).toBe(false);
    expect(result.paymentStatus).toBeNull();
    expect(result.warnings).toContain("PayFast returned an unknown transaction status.");
    expect(capturedRequest?.url).toBe("https://api.payfast.co.za/process/query/pf-123?testing=true");
    expect(Object.keys(capturedRequest?.headers ?? {}).sort()).toEqual([
      "merchant-id",
      "signature",
      "timestamp",
      "version",
    ]);
    expect(capturedRequest?.headers).toMatchObject({
      "merchant-id": "10000100",
      version: "v1",
    });
    expect(capturedRequest?.headers?.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+00:00$/,
    );
    expect(capturedRequest?.headers?.signature).toBe(createPayFastApiSignature({
      "merchant-id": capturedRequest?.headers?.["merchant-id"],
      timestamp: capturedRequest?.headers?.timestamp,
      version: capturedRequest?.headers?.version,
    }, "passphrase"));
    expect(JSON.stringify(capturedRequest)).not.toContain("merchant-key");
  });

  it("uses the live API endpoint without the sandbox-only testing parameter", async () => {
    let capturedUrl = "";
    const gateway = new DefaultPayFastGateway(
      {
        ...payFastTestConfig,
        environment: PayFastEnvironment.LIVE,
        paymentProcessUrl: "https://www.payfast.co.za/eng/process",
      },
      {
        execute: async (request): Promise<{ status: number; ok: boolean; body: string }> => {
          capturedUrl = request.url;
          return { status: 200, ok: true, body: JSON.stringify({ status: "UNKNOWN_STATE" }) };
        },
      },
    );
    const context = createGatewayContext(1);
    const statusContext = {
      ...context,
      operation: PaymentProviderOperation.STATUS,
      gatewayRequest: {
        ...context.gatewayRequest,
        operation: PaymentProviderOperation.STATUS,
      },
    };

    await gateway.execute(statusContext);

    expect(capturedUrl).toBe("https://api.payfast.co.za/process/query/payfast-ref");
    expect(capturedUrl).not.toContain("testing=");
  });

  it("supports refund eligibility checks and full refund execution", async () => {
    const invocationOrder: string[] = [];
    const requests: Array<{ method: string; url: string; headers?: Record<string, string>; body?: string }> = [];
    const gateway = new DefaultPayFastGateway(
      {
        environment: PayFastEnvironment.SANDBOX,
        merchantId: "10000100",
        merchantKey: "merchant-key",
        passphrase: "passphrase",
        paymentProcessUrl: "https://sandbox.payfast.co.za/eng/process",
        apiBaseUrl: "https://api.payfast.co.za",
        paymentQueryUrl: "https://api.payfast.co.za/process/query",
        refundQueryUrl: "https://api.payfast.co.za/refunds/query",
        refundUrl: "https://api.payfast.co.za/refunds",
        returnUrl: payFastTestConfig.returnUrl,
        cancelUrl: payFastTestConfig.cancelUrl,
        notifyUrl: payFastTestConfig.notifyUrl,
        timeoutMs: 5000,
        apiVersion: "v1",
      },
      {
        execute: async (request): Promise<{ status: number; ok: boolean; body: string }> => {
          invocationOrder.push(request.url);
          requests.push(request);
          if (request.url.includes("/refunds/query/")) {
            return { status: 200, ok: true, body: JSON.stringify({ amount_available_for_refund: "27200" }) };
          }

          return { status: 200, ok: true, body: JSON.stringify({ status: "SUCCESS" }) };
        },
      },
    );

    const payment = Payment.create({
      reference: { paymentId: "pay-123", reservationId: "res-123" },
      reservationSnapshot: {
        snapshotId: "snap-123",
        capturedAt: new Date("2026-08-01T00:00:00.000Z"),
        version: "1.0.0",
        reservationId: "res-123",
        reservationReference: "RES-123",
      },
      pricingSnapshot: {
        snapshotId: "pricing-123",
        capturedAt: new Date("2026-08-01T00:00:00.000Z"),
        version: "1.0.0",
        pricingId: "price-123",
        subtotal: 25000,
        taxes: 3000,
        discounts: 1000,
        fees: 200,
        total: 27200,
        currency: "ZAR",
      },
      paymentAmount: 27200,
      currency: "ZAR",
      paymentMethod: PaymentMethod.CARD,
      status: PaymentStatus.CREATED,
      metadata: {
        createdAt: new Date("2026-08-01T00:00:00.000Z"),
        updatedAt: new Date("2026-08-01T00:00:00.000Z"),
        version: "1.0.0",
        source: "test",
      },
    });

    const result = await gateway.execute({
      paymentAggregate: payment,
      gatewayRequest: {
        paymentReference: payment.reference,
        reservationReference: payment.reservationSnapshot.reservationReference,
        providerReference: createPaymentGatewayProviderReference({ providerIdentifier: "payfast", reference: "pf-123" }),
        operation: PaymentProviderOperation.REFUND,
        paymentMethod: payment.paymentMethod,
        currency: payment.currency,
        amount: 27200,
        metadata: {
          requestedAt: new Date("2026-08-01T00:00:00.000Z"),
          version: "1.0.0",
          requestId: "req-refund",
          source: "test",
        },
      },
      operation: PaymentProviderOperation.REFUND,
      metadata: {
        startedAt: new Date("2026-08-01T00:00:00.000Z"),
        version: "1.0.0",
        requestId: "req-refund",
        source: "test",
      },
    });

    expect(result.success).toBe(true);
    expect(result.paymentStatus).toBe(PaymentStatus.REFUNDED);
    expect(invocationOrder.length).toBeGreaterThan(1);
    expect(requests[0].url).toBe("https://api.payfast.co.za/refunds/query/pf-123?testing=true");
    expect(requests[1].url).toBe("https://api.payfast.co.za/refunds?testing=true");
    expect(Object.keys(requests[1].headers ?? {}).sort()).toEqual([
      "Content-Type",
      "merchant-id",
      "signature",
      "timestamp",
      "version",
    ]);
    const refundPayload = JSON.parse(requests[1].body ?? "{}") as Record<string, string>;
    expect(refundPayload).not.toHaveProperty("merchant_key");
    expect(refundPayload).not.toHaveProperty("merchant-id");
    expect(requests[1].headers?.signature).toBe(createPayFastApiSignature({
      ...refundPayload,
      "merchant-id": requests[1].headers?.["merchant-id"],
      timestamp: requests[1].headers?.timestamp,
      version: requests[1].headers?.version,
    }, "passphrase"));
  });
});
