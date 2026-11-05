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
    try {
        const parsed = new URL(value);
        if (!parsed.protocol || !parsed.hostname) {
            throw new Error("Invalid URL");
        }
        return parsed.toString().replace(/\/$/, "");
    }
    catch {
        throw new PayFastConfigurationError("PayFast URL is invalid.");
    }
}
function normalizePayFastEndpoint(value, fallback, hostname, fieldName) {
    const normalized = normalizeUrl(value, fallback);
    const parsed = new URL(normalized);
    if (parsed.protocol !== "https:" ||
        parsed.hostname !== hostname ||
        parsed.port ||
        parsed.username ||
        parsed.password ||
        parsed.search ||
        parsed.hash) {
        throw new PayFastConfigurationError(`${fieldName} must use HTTPS on ${hostname} without embedded credentials, query parameters, fragments, or a nonstandard port.`);
    }
    return normalized;
}
function normalizeRequiredCallbackUrl(value, fieldName) {
    if (isBlank(value)) {
        throw new PayFastConfigurationError(`${fieldName} is required.`);
    }
    const normalized = normalizeUrl(value, "");
    const parsed = new URL(normalized);
    if ((parsed.protocol !== "https:" && parsed.protocol !== "http:") || parsed.username || parsed.password) {
        throw new PayFastConfigurationError(`${fieldName} must be an absolute HTTP or HTTPS URL without embedded credentials.`);
    }
    return normalized;
}
function parseEnvironment(rawEnvironment, runtimeEnvironment) {
    const runtimeIsProduction = runtimeEnvironment?.trim().toLowerCase() === "production";
    const candidate = rawEnvironment?.trim().toUpperCase();
    if (!candidate && runtimeIsProduction) {
        throw new PayFastConfigurationError("PAYFAST_ENVIRONMENT must be explicitly set to LIVE in production.");
    }
    if (!candidate) {
        return PayFastEnvironment.SANDBOX;
    }
    if (candidate !== PayFastEnvironment.SANDBOX && candidate !== PayFastEnvironment.LIVE) {
        throw new PayFastConfigurationError("PAYFAST_ENVIRONMENT must be SANDBOX or LIVE.");
    }
    if (runtimeIsProduction && candidate !== PayFastEnvironment.LIVE) {
        throw new PayFastConfigurationError("PAYFAST_ENVIRONMENT must be explicitly set to LIVE in production.");
    }
    return candidate;
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
    if (input.environment !== PayFastEnvironment.SANDBOX && input.environment !== PayFastEnvironment.LIVE) {
        throw new PayFastConfigurationError("PayFast environment must be SANDBOX or LIVE.");
    }
    if (isBlank(input.merchantId)) {
        throw new PayFastConfigurationError("PayFast merchant ID is required.");
    }
    if (!/^\d{8}$/.test(input.merchantId.trim())) {
        throw new PayFastConfigurationError("PayFast merchant ID must contain exactly 8 digits.");
    }
    if (isBlank(input.merchantKey)) {
        throw new PayFastConfigurationError("PayFast merchant key is required.");
    }
    if (isBlank(input.passphrase)) {
        throw new PayFastConfigurationError("PayFast passphrase is required.");
    }
    const environment = input.environment;
    const paymentHostname = environment === PayFastEnvironment.LIVE
        ? "www.payfast.co.za"
        : "sandbox.payfast.co.za";
    const paymentProcessUrl = normalizePayFastEndpoint(input.paymentProcessUrl, environment === PayFastEnvironment.LIVE
        ? "https://www.payfast.co.za/eng/process"
        : "https://sandbox.payfast.co.za/eng/process", paymentHostname, "PAYFAST_PAYMENT_URL");
    const apiBaseUrl = normalizePayFastEndpoint(input.apiBaseUrl, "https://api.payfast.co.za", "api.payfast.co.za", "PAYFAST_API_URL");
    const paymentQueryUrl = normalizePayFastEndpoint(input.paymentQueryUrl, `${apiBaseUrl}/process/query`, "api.payfast.co.za", "PAYFAST_PAYMENT_QUERY_URL");
    const refundQueryUrl = normalizePayFastEndpoint(input.refundQueryUrl, `${apiBaseUrl}/refunds/query`, "api.payfast.co.za", "PAYFAST_REFUND_QUERY_URL");
    const refundUrl = normalizePayFastEndpoint(input.refundUrl, `${apiBaseUrl}/refunds`, "api.payfast.co.za", "PAYFAST_REFUND_URL");
    const apiVersion = input.apiVersion ?? "v1";
    if (apiVersion !== "v1") {
        throw new PayFastConfigurationError("PAYFAST_API_VERSION must be v1.");
    }
    return Object.freeze({
        environment,
        merchantId: input.merchantId.trim(),
        merchantKey: input.merchantKey.trim(),
        passphrase: input.passphrase.trim(),
        paymentProcessUrl,
        apiBaseUrl,
        paymentQueryUrl,
        refundQueryUrl,
        refundUrl,
        returnUrl: normalizeRequiredCallbackUrl(input.returnUrl, "PAYFAST_RETURN_URL"),
        cancelUrl: normalizeRequiredCallbackUrl(input.cancelUrl, "PAYFAST_CANCEL_URL"),
        notifyUrl: normalizeRequiredCallbackUrl(input.notifyUrl, "PAYFAST_NOTIFY_URL"),
        timeoutMs: input.timeoutMs > 0 ? input.timeoutMs : 10000,
        apiVersion,
    });
}
function loadPayFastIntegrationConfig(env = process.env) {
    const environment = parseEnvironment(env.PAYFAST_ENVIRONMENT, env.NODE_ENV);
    const merchantId = env.PAYFAST_MERCHANT_ID ?? "";
    const merchantKey = env.PAYFAST_MERCHANT_KEY ?? "";
    const passphrase = env.PAYFAST_PASSPHRASE ?? "";
    const apiBaseUrl = env.PAYFAST_API_URL ?? "https://api.payfast.co.za";
    const paymentProcessUrl = env.PAYFAST_PAYMENT_URL ??
        (environment === PayFastEnvironment.LIVE
            ? "https://www.payfast.co.za/eng/process"
            : "https://sandbox.payfast.co.za/eng/process");
    const paymentQueryUrl = env.PAYFAST_PAYMENT_QUERY_URL ?? `${apiBaseUrl}/process/query`;
    const refundQueryUrl = env.PAYFAST_REFUND_QUERY_URL ?? `${apiBaseUrl}/refunds/query`;
    const refundUrl = env.PAYFAST_REFUND_URL ?? `${apiBaseUrl}/refunds`;
    return createPayFastIntegrationConfig({
        environment,
        merchantId,
        merchantKey,
        passphrase,
        paymentProcessUrl,
        apiBaseUrl,
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
    return Array.from(Buffer.from(value, "utf8"), (byte) => {
        const isAlphaNumeric = (byte >= 0x30 && byte <= 0x39) ||
            (byte >= 0x41 && byte <= 0x5a) ||
            (byte >= 0x61 && byte <= 0x7a);
        if (isAlphaNumeric || byte === 0x2d || byte === 0x2e || byte === 0x5f) {
            return String.fromCharCode(byte);
        }
        if (byte === 0x20) {
            return "+";
        }
        return `%${byte.toString(16).padStart(2, "0").toUpperCase()}`;
    }).join("");
}
function encodePayFastHostedValue(value) {
    return Array.from(Buffer.from(value.trim(), "utf8"), (byte) => {
        const isAlphaNumeric = (byte >= 0x30 && byte <= 0x39) ||
            (byte >= 0x41 && byte <= 0x5a) ||
            (byte >= 0x61 && byte <= 0x7a);
        if (isAlphaNumeric || byte === 0x2d || byte === 0x2e || byte === 0x5f) {
            return String.fromCharCode(byte);
        }
        if (byte === 0x20) {
            return "+";
        }
        return `%${byte.toString(16).padStart(2, "0").toUpperCase()}`;
    }).join("");
}
function defaultPayFastSignature(values, passphrase) {
    const payload = Object.entries(values)
        .filter(([key, value]) => key !== "signature" && value !== undefined && value !== null && String(value).trim().length > 0)
        .map(([key, value]) => `${key}=${encodePayFastHostedValue(String(value))}`)
        .join("&");
    const hashInput = `${payload}&passphrase=${encodePayFastHostedValue(passphrase)}`;
    return (0, crypto_1.createHash)("md5").update(hashInput).digest("hex");
}
function createPayFastApiSignature(values, passphrase) {
    const flattened = Object.entries({ ...values, passphrase })
        .filter(([key, value]) => key !== "signature" && value !== undefined && value !== null && String(value).trim().length > 0)
        .sort(([leftKey], [rightKey]) => leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0)
        .map(([key, value]) => `${key}=${encodePayFastValue(String(value))}`)
        .join("&");
    return (0, crypto_1.createHash)("md5").update(flattened).digest("hex");
}
function createPayFastApiRequestUrl(url, environment) {
    const requestUrl = new URL(url);
    if (environment === PayFastEnvironment.SANDBOX) {
        requestUrl.searchParams.set("testing", "true");
    }
    else {
        requestUrl.searchParams.delete("testing");
    }
    return requestUrl.toString();
}
function createPayFastApiHeaders(merchantId, apiVersion, timestamp, passphrase, requestValues = {}) {
    const signature = createPayFastApiSignature({ ...requestValues, "merchant-id": merchantId, timestamp, version: apiVersion }, passphrase);
    return {
        "merchant-id": merchantId,
        version: apiVersion,
        timestamp,
        signature,
    };
}
function createPayFastApiTimestamp(now = new Date()) {
    return now.toISOString().replace(/\.\d{3}Z$/, "+00:00");
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
function toPayFastRefundAmount(amountInCents) {
    return (amountInCents / 100).toFixed(2);
}
function formatHostedPaymentAmount(amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
        return null;
    }
    const match = /^([0-9]+)(?:\.([0-9]{1,2}))?$/.exec(String(amount));
    if (!match) {
        return null;
    }
    const fraction = (match[2] ?? "").padEnd(2, "0");
    const minorUnits = BigInt(match[1]) * 100n + BigInt(fraction);
    if (minorUnits > BigInt(Number.MAX_SAFE_INTEGER)) {
        return null;
    }
    return `${BigInt(match[1]).toString()}.${fraction}`;
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
    executeCustomPayment(context, providerReference, paymentReference, amount) {
        const currency = context.gatewayRequest.currency;
        if (currency !== "ZAR") {
            return createSafeGatewayFailure(context, providerReference, context.operation, [`PayFast hosted payments only support ZAR; received ${currency || "no currency"}.`], payments_1.PaymentStatus.CREATED);
        }
        const formattedAmount = formatHostedPaymentAmount(amount);
        if (!formattedAmount) {
            return createSafeGatewayFailure(context, providerReference, context.operation, ["PayFast hosted payment amount must be a positive, finite ZAR amount with at most two decimal places."], payments_1.PaymentStatus.CREATED);
        }
        const customPaymentRequest = {
            merchant_id: this.config.merchantId,
            merchant_key: this.config.merchantKey,
            return_url: this.config.returnUrl,
            cancel_url: this.config.cancelUrl,
            notify_url: this.config.notifyUrl,
            m_payment_id: providerReference.reference || paymentReference.paymentId,
            amount: formattedAmount,
            item_name: `Payment ${providerReference.reference || paymentReference.paymentId}`,
            item_description: `Reservation ${context.gatewayRequest.reservationReference}`,
        };
        const signature = defaultPayFastSignature(customPaymentRequest, this.config.passphrase);
        const request = {
            ...customPaymentRequest,
            signature,
        };
        return (0, integration_1.createPaymentGatewayResult)({
            success: true,
            providerReference,
            transactionReference: null,
            authorizationStatus: null,
            captureStatus: context.operation === integration_1.PaymentProviderOperation.CAPTURE ? payments_1.CaptureStatus.CAPTURED : null,
            settlementStatus: context.operation === integration_1.PaymentProviderOperation.SETTLE ? payments_1.SettlementStatus.SETTLED : null,
            paymentStatus: context.operation === integration_1.PaymentProviderOperation.AUTHORIZE
                ? payments_1.PaymentStatus.CREATED
                : mapPaymentStatus(context.operation),
            hostedPaymentAction: context.operation === integration_1.PaymentProviderOperation.AUTHORIZE
                ? {
                    method: "POST",
                    action: this.config.paymentProcessUrl,
                    fields: Object.freeze(Object.fromEntries(Object.entries(request).map(([key, value]) => [key, String(value)]))),
                }
                : undefined,
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
        const requestUrl = createPayFastApiRequestUrl(`${this.config.paymentQueryUrl.replace(/\/$/, "")}/${encodeURIComponent(providerPaymentReference)}`, this.config.environment);
        const timestamp = createPayFastApiTimestamp();
        try {
            const response = await this.httpClient.execute({
                method: "GET",
                url: requestUrl,
                headers: createPayFastApiHeaders(this.config.merchantId, this.config.apiVersion ?? "v1", timestamp, this.config.passphrase),
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
        const queryUrl = createPayFastApiRequestUrl(`${this.config.refundQueryUrl.replace(/\/$/, "")}/${encodeURIComponent(providerReference.reference)}`, this.config.environment);
        const queryTimestamp = createPayFastApiTimestamp();
        try {
            const queryResponse = await this.httpClient.execute({
                method: "GET",
                url: queryUrl,
                headers: createPayFastApiHeaders(this.config.merchantId, this.config.apiVersion ?? "v1", queryTimestamp, this.config.passphrase),
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
                m_payment_id: paymentReference.paymentId,
                pf_payment_id: providerReference.reference,
                amount: toPayFastRefundAmount(amountInCents),
                reason: "GCT refund request",
                notify_buyer: "0",
                notify_merchant: "0",
            };
            const refundTimestamp = createPayFastApiTimestamp();
            const refundResponse = await this.httpClient.execute({
                method: "POST",
                url: createPayFastApiRequestUrl(this.config.refundUrl, this.config.environment),
                headers: {
                    "Content-Type": "application/json",
                    ...createPayFastApiHeaders(this.config.merchantId, this.config.apiVersion ?? "v1", refundTimestamp, this.config.passphrase, refundPayload),
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