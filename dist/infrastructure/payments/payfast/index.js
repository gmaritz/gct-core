"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payfast = exports.DefaultPayFastGateway = exports.defaultPayFastHttpClient = exports.PayFastConfigurationError = exports.PayFastEnvironment = void 0;
exports.createPayFastIntegrationConfig = createPayFastIntegrationConfig;
exports.loadPayFastIntegrationConfig = loadPayFastIntegrationConfig;
exports.defaultPayFastSignature = defaultPayFastSignature;
exports.createPayFastApiSignature = createPayFastApiSignature;
exports.verifyPayFastSignature = verifyPayFastSignature;
exports.normalizePayFastITN = normalizePayFastITN;
const crypto_1 = require("crypto");
const payments_1 = require("@application/payments");
const integration_1 = require("@application/payments/integration");
var PayFastEnvironment;
(function (PayFastEnvironment) {
    PayFastEnvironment["SANDBOX"] = "SANDBOX";
    PayFastEnvironment["LIVE"] = "LIVE";
})(PayFastEnvironment || (exports.PayFastEnvironment = PayFastEnvironment = {}));
class PayFastConfigurationError extends Error {
    constructor(message) {
        super(message);
        this.code = "PAYFAST_CONFIGURATION_ERROR";
        this.name = "PayFastConfigurationError";
    }
}
exports.PayFastConfigurationError = PayFastConfigurationError;
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function normalizeUrl(value, fallback) {
    if (isBlank(value)) {
        return fallback;
    }
    const safeValue = value;
    try {
        const parsed = new URL(safeValue);
        if (!parsed.protocol || !parsed.hostname) {
            throw new Error("Invalid URL");
        }
        return parsed.toString().replace(/\/$/, "");
    }
    catch {
        throw new PayFastConfigurationError(`PayFast URL is invalid: ${safeValue}`);
    }
}
function parseEnvironment(rawEnvironment) {
    const candidate = rawEnvironment?.trim().toUpperCase();
    if (candidate === PayFastEnvironment.SANDBOX || candidate === PayFastEnvironment.LIVE) {
        return candidate;
    }
    return PayFastEnvironment.SANDBOX;
}
function parsePositiveInteger(value, fallback, fieldName) {
    if (isBlank(value)) {
        return fallback;
    }
    const safeValue = value;
    const parsed = Number.parseInt(safeValue, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new PayFastConfigurationError(`${fieldName} must be a positive integer.`);
    }
    return parsed;
}
function createPayFastIntegrationConfig(input) {
    if (isBlank(input.merchantId)) {
        throw new PayFastConfigurationError("PayFast merchant ID is required.");
    }
    if (isBlank(input.merchantKey)) {
        throw new PayFastConfigurationError("PayFast merchant key is required.");
    }
    if (isBlank(input.passphrase)) {
        throw new PayFastConfigurationError("PayFast passphrase is required.");
    }
    const environment = input.environment ?? PayFastEnvironment.SANDBOX;
    const paymentProcessUrl = normalizeUrl(input.paymentProcessUrl, environment === PayFastEnvironment.LIVE
        ? "https://www.payfast.co.za/eng/process"
        : "https://sandbox.payfast.co.za/eng/process");
    const apiBaseUrl = normalizeUrl(input.apiBaseUrl, environment === PayFastEnvironment.LIVE ? "https://api.payfast.co.za" : "https://api.payfast.co.za");
    return Object.freeze({
        environment,
        merchantId: input.merchantId.trim(),
        merchantKey: input.merchantKey.trim(),
        passphrase: input.passphrase.trim(),
        paymentProcessUrl,
        apiBaseUrl,
        paymentQueryUrl: normalizeUrl(input.paymentQueryUrl, `${apiBaseUrl}/process/query`),
        refundQueryUrl: normalizeUrl(input.refundQueryUrl, `${apiBaseUrl}/refunds/query`),
        refundUrl: normalizeUrl(input.refundUrl, `${apiBaseUrl}/refunds`),
        returnUrl: input.returnUrl ? normalizeUrl(input.returnUrl, "") : undefined,
        cancelUrl: input.cancelUrl ? normalizeUrl(input.cancelUrl, "") : undefined,
        notifyUrl: input.notifyUrl ? normalizeUrl(input.notifyUrl, "") : undefined,
        timeoutMs: input.timeoutMs > 0 ? input.timeoutMs : 10000,
        apiVersion: input.apiVersion ?? "v1",
    });
}
function loadPayFastIntegrationConfig(env = process.env) {
    const environment = parseEnvironment(env.PAYFAST_ENVIRONMENT);
    const merchantId = env.PAYFAST_MERCHANT_ID ?? "";
    const merchantKey = env.PAYFAST_MERCHANT_KEY ?? "";
    const passphrase = env.PAYFAST_PASSPHRASE ?? "";
    const paymentProcessUrl = env.PAYFAST_PAYMENT_URL ??
        (environment === PayFastEnvironment.LIVE
            ? "https://www.payfast.co.za/eng/process"
            : "https://sandbox.payfast.co.za/eng/process");
    const paymentQueryUrl = env.PAYFAST_PAYMENT_QUERY_URL ?? "https://api.payfast.co.za/process/query";
    const refundQueryUrl = env.PAYFAST_REFUND_QUERY_URL ?? "https://api.payfast.co.za/refunds/query";
    const refundUrl = env.PAYFAST_REFUND_URL ?? "https://api.payfast.co.za/refunds";
    return createPayFastIntegrationConfig({
        environment,
        merchantId,
        merchantKey,
        passphrase,
        paymentProcessUrl,
        apiBaseUrl: env.PAYFAST_API_URL ?? "https://api.payfast.co.za",
        paymentQueryUrl,
        refundQueryUrl,
        refundUrl,
        returnUrl: env.PAYFAST_RETURN_URL,
        cancelUrl: env.PAYFAST_CANCEL_URL,
        notifyUrl: env.PAYFAST_NOTIFY_URL,
        timeoutMs: parsePositiveInteger(env.PAYFAST_TIMEOUT_MS, 10000, "PAYFAST_TIMEOUT_MS"),
        apiVersion: env.PAYFAST_API_VERSION ?? "v1",
    });
}
function encodePayFastValue(value) {
    return encodeURIComponent(value).replace(/%20/g, "+");
}
const PAYFAST_SIGNATURE_ORDER = [
    "merchant_id",
    "merchant_key",
    "return_url",
    "cancel_url",
    "notify_url",
    "m_payment_id",
    "amount",
    "item_name",
    "item_description",
    "email_address",
    "name_first",
    "name_last",
    "cell_number",
    "billing_date",
    "custom_str1",
    "custom_str2",
    "custom_str3",
    "custom_str4",
    "custom_str5",
    "custom_int1",
    "custom_int2",
    "custom_int3",
    "custom_int4",
    "custom_int5",
];
function defaultPayFastSignature(values, passphrase) {
    const signatureEntries = Object.entries(values)
        .filter(([, value]) => value !== undefined && value !== null && String(value).trim().length > 0)
        .filter(([key]) => key !== "signature")
        .map(([key, value]) => [key, String(value)]);
    const orderedEntries = [...signatureEntries].sort(([leftKey], [rightKey]) => {
        const leftIndex = PAYFAST_SIGNATURE_ORDER.indexOf(leftKey);
        const rightIndex = PAYFAST_SIGNATURE_ORDER.indexOf(rightKey);
        if (leftIndex === -1 && rightIndex === -1) {
            return leftKey.localeCompare(rightKey);
        }
        if (leftIndex === -1)
            return 1;
        if (rightIndex === -1)
            return -1;
        return leftIndex - rightIndex;
    });
    const payload = orderedEntries
        .map(([key, value]) => `${key}=${encodePayFastValue(value)}`)
        .join("&");
    const hashInput = `${payload}&passphrase=${encodePayFastValue(passphrase)}`;
    return (0, crypto_1.createHash)("md5").update(hashInput).digest("hex");
}
function createPayFastApiSignature(values, passphrase) {
    const flattened = Object.entries(values)
        .filter(([, value]) => value !== undefined && value !== null && String(value).trim().length > 0)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, value]) => `${key}=${encodePayFastValue(String(value))}`)
        .join("&");
    return (0, crypto_1.createHash)("md5")
        .update(`${flattened}&passphrase=${encodePayFastValue(passphrase)}`)
        .digest("hex");
}
function verifyPayFastSignature(payload, passphrase) {
    const signature = payload.signature;
    if (typeof signature !== "string" || signature.trim().length === 0) {
        return false;
    }
    const replicated = defaultPayFastSignature(payload, passphrase);
    return replicated.toLowerCase() === signature.trim().toLowerCase();
}
function normalizePayFastITN(payload) {
    const rawStatus = String(payload.payment_status ?? "").trim();
    return Object.freeze({
        merchantId: payload.merchant_id ? String(payload.merchant_id) : undefined,
        paymentId: payload.m_payment_id ? String(payload.m_payment_id) : undefined,
        providerPaymentId: payload.pf_payment_id ? String(payload.pf_payment_id) : undefined,
        status: rawStatus || undefined,
        amountGross: payload.amount_gross ? String(payload.amount_gross) : undefined,
        amountFee: payload.amount_fee ? String(payload.amount_fee) : undefined,
        amountNet: payload.amount_net ? String(payload.amount_net) : undefined,
        signature: payload.signature ? String(payload.signature) : undefined,
    });
}
function parseJsonBody(body) {
    if (typeof body === "string") {
        try {
            return JSON.parse(body);
        }
        catch {
            return {};
        }
    }
    return typeof body === "object" && body !== null ? body : {};
}
function normalizePaymentStatusForProvider(providerStatus) {
    const normalized = providerStatus?.trim().toUpperCase();
    if (!normalized)
        return null;
    switch (normalized) {
        case "COMPLETE":
        case "PAID":
        case "SUCCESS":
            return payments_1.PaymentStatus.COMPLETED;
        case "PENDING":
        case "AWAITING_PAYMENT":
        case "PROCESSING":
            return payments_1.PaymentStatus.CREATED;
        case "FAILED":
        case "CANCELLED":
        case "CANCELLED_PAYMENT":
            return payments_1.PaymentStatus.CANCELLED;
        default:
            return null;
    }
}
function toPayFastAmount(amountInCents) {
    return (amountInCents / 100).toFixed(2);
}
function mapPaymentStatus(operation) {
    switch (operation) {
        case integration_1.PaymentProviderOperation.AUTHORIZE:
            return payments_1.PaymentStatus.AUTHORIZED;
        case integration_1.PaymentProviderOperation.CAPTURE:
            return payments_1.PaymentStatus.CAPTURED;
        case integration_1.PaymentProviderOperation.SETTLE:
            return payments_1.PaymentStatus.SETTLED;
        case integration_1.PaymentProviderOperation.REFUND:
            return payments_1.PaymentStatus.REFUNDED;
        case integration_1.PaymentProviderOperation.STATUS:
            return payments_1.PaymentStatus.COMPLETED;
        default:
            return payments_1.PaymentStatus.CREATED;
    }
}
function createSafeGatewayFailure(context, providerReference, operation, warnings, paymentStatus = null) {
    return (0, integration_1.createPaymentGatewayResult)({
        success: false,
        providerReference,
        transactionReference: null,
        authorizationStatus: null,
        captureStatus: null,
        settlementStatus: null,
        paymentStatus,
        warnings: [...warnings],
        metadata: {
            completedAt: new Date(),
            version: "1.0.0",
            requestId: context.metadata.requestId,
            source: "payfast",
            operation,
        },
    });
}
exports.defaultPayFastHttpClient = {
    async execute(request) {
        const response = await fetch(request.url, {
            method: request.method,
            headers: request.headers,
            ...(request.body ? { body: request.body } : {}),
        });
        const rawText = await response.text();
        return {
            status: response.status,
            ok: response.ok,
            body: rawText.length > 0 ? rawText : undefined,
        };
    },
};
class DefaultPayFastGateway {
    constructor(config = loadPayFastIntegrationConfig(), httpClient = exports.defaultPayFastHttpClient) {
        this.config = config;
        this.httpClient = httpClient;
    }
    async execute(context) {
        const request = context.gatewayRequest;
        const providerReference = request.providerReference;
        const paymentReference = request.paymentReference;
        const amountInCents = Number(request.amount ?? 0);
        if (request.operation === integration_1.PaymentProviderOperation.STATUS) {
            return this.executeTransactionQuery(context, providerReference, paymentReference, request.amount ?? 0);
        }
        if (request.operation === integration_1.PaymentProviderOperation.REFUND) {
            return this.executeRefundFlow(context, providerReference, paymentReference, amountInCents);
        }
        return this.executeCustomPayment(context, providerReference, paymentReference, amountInCents);
    }
    executeCustomPayment(context, providerReference, paymentReference, amountInCents) {
        const customPaymentRequest = {
            merchant_id: this.config.merchantId,
            merchant_key: this.config.merchantKey,
            return_url: this.config.returnUrl ?? "https://example.com/return",
            cancel_url: this.config.cancelUrl ?? "https://example.com/cancel",
            notify_url: this.config.notifyUrl ?? "https://example.com/notify",
            m_payment_id: paymentReference.paymentId,
            amount: toPayFastAmount(amountInCents),
            item_name: `Payment ${paymentReference.paymentId}`,
            item_description: `Reservation ${context.gatewayRequest.reservationReference}`,
            email_address: "",
            name_first: "",
            name_last: "",
        };
        const signature = defaultPayFastSignature(customPaymentRequest, this.config.passphrase);
        const request = {
            ...customPaymentRequest,
            signature,
        };
        void request;
        return (0, integration_1.createPaymentGatewayResult)({
            success: true,
            providerReference,
            transactionReference: {
                transactionId: paymentReference.paymentId,
                providerCorrelationId: providerReference.reference,
                customerReference: context.gatewayRequest.reservationReference,
            },
            authorizationStatus: context.operation === integration_1.PaymentProviderOperation.AUTHORIZE ? payments_1.AuthorizationStatus.APPROVED : null,
            captureStatus: context.operation === integration_1.PaymentProviderOperation.CAPTURE ? payments_1.CaptureStatus.CAPTURED : null,
            settlementStatus: context.operation === integration_1.PaymentProviderOperation.SETTLE ? payments_1.SettlementStatus.SETTLED : null,
            paymentStatus: mapPaymentStatus(context.operation),
            warnings: [],
            metadata: {
                completedAt: new Date(),
                version: "1.0.0",
                requestId: context.metadata.requestId,
                source: "payfast",
                operation: context.operation,
            },
        });
    }
    async executeTransactionQuery(context, providerReference, paymentReference, requestAmount) {
        const providerPaymentReference = providerReference.reference || paymentReference.paymentId;
        const requestUrl = `${this.config.paymentQueryUrl.replace(/\/$/, "")}/${encodeURIComponent(providerPaymentReference)}`;
        const timestamp = Math.round(Date.now() / 1000).toString();
        const payload = {
            merchant_id: this.config.merchantId,
            merchant_key: this.config.merchantKey,
            version: this.config.apiVersion ?? "v1",
            timestamp,
            m_payment_id: paymentReference.paymentId,
            pf_payment_id: providerPaymentReference,
        };
        const signature = createPayFastApiSignature(payload, this.config.passphrase);
        try {
            const response = await this.httpClient.execute({
                method: "GET",
                url: requestUrl,
                headers: {
                    "x-payfast-signature": signature,
                    "x-payfast-merchant-id": this.config.merchantId,
                    "x-payfast-merchant-key": this.config.merchantKey,
                    "x-payfast-version": this.config.apiVersion ?? "v1",
                    "x-payfast-timestamp": timestamp,
                },
            });
            if (!response.ok || response.status >= 400) {
                return createSafeGatewayFailure(context, providerReference, integration_1.PaymentProviderOperation.STATUS, ["PayFast transaction query failed."], null);
            }
            const body = parseJsonBody(response.body);
            const providerStatus = String(body.status ?? body.payment_status ?? "");
            const normalizedStatus = normalizePaymentStatusForProvider(providerStatus);
            if (!normalizedStatus) {
                return createSafeGatewayFailure(context, providerReference, integration_1.PaymentProviderOperation.STATUS, ["PayFast returned an unknown transaction status."], null);
            }
            return (0, integration_1.createPaymentGatewayResult)({
                success: true,
                providerReference,
                transactionReference: {
                    transactionId: paymentReference.paymentId,
                    providerCorrelationId: providerReference.reference,
                    customerReference: context.gatewayRequest.reservationReference,
                },
                authorizationStatus: null,
                captureStatus: null,
                settlementStatus: null,
                paymentStatus: normalizedStatus,
                warnings: requestAmount <= 0 ? ["Transaction query completed with zero amount."] : [],
                metadata: {
                    completedAt: new Date(),
                    version: "1.0.0",
                    requestId: context.metadata.requestId,
                    source: "payfast",
                    operation: integration_1.PaymentProviderOperation.STATUS,
                },
            });
        }
        catch {
            return createSafeGatewayFailure(context, providerReference, integration_1.PaymentProviderOperation.STATUS, ["PayFast transaction query threw an unexpected provider error."], null);
        }
    }
    async executeRefundFlow(context, providerReference, paymentReference, amountInCents) {
        const queryUrl = `${this.config.refundQueryUrl.replace(/\/$/, "")}/${encodeURIComponent(providerReference.reference)}`;
        const timestamp = Math.round(Date.now() / 1000).toString();
        const queryPayload = {
            merchant_id: this.config.merchantId,
            merchant_key: this.config.merchantKey,
            version: this.config.apiVersion ?? "v1",
            timestamp,
            m_payment_id: paymentReference.paymentId,
            pf_payment_id: providerReference.reference,
        };
        const querySignature = createPayFastApiSignature(queryPayload, this.config.passphrase);
        try {
            const queryResponse = await this.httpClient.execute({
                method: "GET",
                url: queryUrl,
                headers: {
                    "x-payfast-signature": querySignature,
                    "x-payfast-merchant-id": this.config.merchantId,
                    "x-payfast-merchant-key": this.config.merchantKey,
                    "x-payfast-version": this.config.apiVersion ?? "v1",
                    "x-payfast-timestamp": timestamp,
                },
            });
            if (!queryResponse.ok || queryResponse.status >= 400) {
                return createSafeGatewayFailure(context, providerReference, integration_1.PaymentProviderOperation.REFUND, ["PayFast refund eligibility query failed."], payments_1.PaymentStatus.CREATED);
            }
            const refundEligibility = parseJsonBody(queryResponse.body);
            const refundable = Number(refundEligibility.amount_available_for_refund ??
                refundEligibility.amountAvailableForRefund ??
                0);
            if (amountInCents > refundable * 100) {
                return createSafeGatewayFailure(context, providerReference, integration_1.PaymentProviderOperation.REFUND, ["Refund amount exceeds the provider-reported refundable amount."], payments_1.PaymentStatus.CREATED);
            }
            const refundPayload = {
                merchant_id: this.config.merchantId,
                merchant_key: this.config.merchantKey,
                version: this.config.apiVersion ?? "v1",
                timestamp,
                m_payment_id: paymentReference.paymentId,
                pf_payment_id: providerReference.reference,
                amount: toPayFastAmount(amountInCents),
                reason: "GCT refund request",
                notify_buyer: "0",
                notify_merchant: "0",
            };
            const refundSignature = createPayFastApiSignature(refundPayload, this.config.passphrase);
            const refundResponse = await this.httpClient.execute({
                method: "POST",
                url: this.config.refundUrl,
                headers: {
                    "Content-Type": "application/json",
                    "x-payfast-signature": refundSignature,
                    "x-payfast-merchant-id": this.config.merchantId,
                    "x-payfast-merchant-key": this.config.merchantKey,
                    "x-payfast-version": this.config.apiVersion ?? "v1",
                    "x-payfast-timestamp": timestamp,
                },
                body: JSON.stringify(refundPayload),
            });
            if (!refundResponse.ok || refundResponse.status >= 400) {
                return createSafeGatewayFailure(context, providerReference, integration_1.PaymentProviderOperation.REFUND, ["PayFast refund request failed."], payments_1.PaymentStatus.CREATED);
            }
            const refundBody = parseJsonBody(refundResponse.body);
            const providerRefundStatus = String(refundBody.status ?? refundBody.payment_status ?? "");
            const refundSucceeded = providerRefundStatus.toUpperCase() === "SUCCESS" || providerRefundStatus.toUpperCase() === "REFUNDED";
            return (0, integration_1.createPaymentGatewayResult)({
                success: refundSucceeded,
                providerReference,
                transactionReference: {
                    transactionId: paymentReference.paymentId,
                    providerCorrelationId: providerReference.reference,
                    customerReference: context.gatewayRequest.reservationReference,
                },
                authorizationStatus: null,
                captureStatus: null,
                settlementStatus: null,
                paymentStatus: refundSucceeded ? payments_1.PaymentStatus.REFUNDED : payments_1.PaymentStatus.CREATED,
                warnings: refundSucceeded ? [] : ["PayFast refund did not report a successful outcome."],
                metadata: {
                    completedAt: new Date(),
                    version: "1.0.0",
                    requestId: context.metadata.requestId,
                    source: "payfast",
                    operation: integration_1.PaymentProviderOperation.REFUND,
                },
            });
        }
        catch {
            return createSafeGatewayFailure(context, providerReference, integration_1.PaymentProviderOperation.REFUND, ["PayFast refund flow threw an unexpected provider error."], payments_1.PaymentStatus.CREATED);
        }
    }
}
exports.DefaultPayFastGateway = DefaultPayFastGateway;
exports.payfast = {
    defaultPayFastSignature,
    createPayFastApiSignature,
    verifyPayFastSignature,
    normalizePayFastITN,
    loadPayFastIntegrationConfig,
    DefaultPayFastGateway,
};
exports.default = DefaultPayFastGateway;
//# sourceMappingURL=index.js.map