import { PaymentMethod, PaymentStatus } from "@application/payments";
import {
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
      PAYFAST_RETURN_URL: "https://example.com/return",
      PAYFAST_CANCEL_URL: "https://example.com/cancel",
      PAYFAST_NOTIFY_URL: "https://example.com/notify",
    });

    expect(config.environment).toBe(PayFastEnvironment.SANDBOX);
    expect(config.paymentProcessUrl).toContain("sandbox.payfast.co.za");
    expect(config.timeoutMs).toBe(5000);
  });

  it("creates a custom payment signature that matches PayFast rules", () => {
    const signature = defaultPayFastSignature(
      {
        merchant_id: "10000100",
        merchant_key: "key",
        amount: "272.00",
        item_name: "GCT booking",
        item_description: "Reservation 123",
        m_payment_id: "pay-123",
        return_url: "https://example.com/return",
        cancel_url: "https://example.com/cancel",
        notify_url: "https://example.com/notify",
      },
      "passphrase",
    );

    expect(typeof signature).toBe("string");
    expect(signature.length).toBeGreaterThan(0);
    expect(signature).not.toContain("passphrase");
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
    const gateway = new DefaultPayFastGateway({
      environment: PayFastEnvironment.SANDBOX,
      merchantId: "10000100",
      merchantKey: "merchant-key",
      passphrase: "passphrase",
      paymentProcessUrl: "https://sandbox.payfast.co.za/eng/process",
      apiBaseUrl: "https://api.payfast.co.za",
      paymentQueryUrl: "https://api.payfast.co.za/process/query",
      refundQueryUrl: "https://api.payfast.co.za/refunds/query",
      refundUrl: "https://api.payfast.co.za/refunds",
      timeoutMs: 5000,
      returnUrl: "https://example.com/return",
      cancelUrl: "https://example.com/cancel",
      notifyUrl: "https://example.com/notify",
      apiVersion: "v1",
    });

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
        providerReference: createPaymentGatewayProviderReference({ providerIdentifier: "payfast", reference: "payfast-ref" }),
        operation: PaymentProviderOperation.AUTHORIZE,
        paymentMethod: payment.paymentMethod,
        currency: payment.currency,
        amount: payment.paymentAmount,
        metadata: {
          requestedAt: new Date("2026-08-01T00:00:00.000Z"),
          version: "1.0.0",
          requestId: "req-123",
          source: "test",
        },
      },
      operation: PaymentProviderOperation.AUTHORIZE,
      metadata: {
        startedAt: new Date("2026-08-01T00:00:00.000Z"),
        version: "1.0.0",
        requestId: "req-123",
        source: "test",
      },
    });

    expect(result.success).toBe(true);
    expect(result.authorizationStatus).toBeDefined();
    expect(result.paymentStatus).toBe(PaymentStatus.AUTHORIZED);
    expect(result.providerReference?.providerIdentifier).toBe("payfast");
    expect(result.metadata.operation).toBe(PaymentProviderOperation.AUTHORIZE);
    expect(result.hostedPaymentAction?.method).toBe("POST");
    expect(result.hostedPaymentAction?.action).toBe("https://sandbox.payfast.co.za/eng/process");
    expect(result.hostedPaymentAction?.fields.amount).toBe("272.00");
    expect(result.hostedPaymentAction?.fields.currency).toBeUndefined();
    expect(result.hostedPaymentAction?.fields.signature).toBeDefined();
    expect(result.hostedPaymentAction?.fields.passphrase).toBeUndefined();
  });

  it("creates PayFast API signatures for transaction queries and refund operations", () => {
    const payload = {
      merchant_id: "10000100",
      merchant_key: "merchant-key",
      version: "v1",
      timestamp: "1720000000",
      m_payment_id: "pay-123",
      pf_payment_id: "pf-123",
    };

    const signature = createPayFastApiSignature(payload, "passphrase");

    expect(typeof signature).toBe("string");
    expect(signature).not.toContain("passphrase");
    expect(signature.length).toBeGreaterThan(0);
  });

  it("maps an unknown PayFast transaction status to a failed canonical result", async () => {
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
        timeoutMs: 5000,
        apiVersion: "v1",
      },
      {
        execute: async (): Promise<{ status: number; ok: boolean; body: string }> => ({ status: 200, ok: true, body: JSON.stringify({ status: "UNKNOWN_STATE" }) }),
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
  });

  it("supports refund eligibility checks and full refund execution", async () => {
    const invocationOrder: string[] = [];
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
        timeoutMs: 5000,
        apiVersion: "v1",
      },
      {
        execute: async (request): Promise<{ status: number; ok: boolean; body: string }> => {
          invocationOrder.push(request.url);
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
  });
});
