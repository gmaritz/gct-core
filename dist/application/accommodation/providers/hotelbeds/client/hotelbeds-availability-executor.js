"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultHotelbedsAvailabilityExecutor = void 0;
const hotelbeds_authentication_1 = require("./hotelbeds-authentication");
const hotelbeds_availability_execution_result_1 = require("./hotelbeds-availability-execution-result");
const hotelbeds_error_mapper_1 = require("./hotelbeds-error-mapper");
const hotelbeds_integration_error_1 = require("./hotelbeds-integration-error");
const hotelbeds_integration_config_1 = require("./hotelbeds-integration-config");
const hotelbeds_transport_1 = require("./hotelbeds-transport");
const DEFAULT_EXECUTOR_OPTIONS = Object.freeze({
    maxAttempts: 3,
    maxQps: 20,
    maxConcurrency: 20,
    now: () => Date.now(),
    sleep: async (delayMs) => {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
    },
});
function readSupplierError(payload) {
    if (!payload || typeof payload !== "object") {
        return undefined;
    }
    const providerPayload = payload;
    const code = providerPayload.error?.code ?? providerPayload.code;
    const message = providerPayload.error?.message ?? providerPayload.message;
    if (!code && !message) {
        return undefined;
    }
    return {
        code,
        message,
        payload,
    };
}
function createTransportFailure(error) {
    if (error instanceof hotelbeds_transport_1.HotelbedsTransportError) {
        return {
            kind: error.kind,
            message: error.message,
            providerCode: error.providerCode,
        };
    }
    return {
        kind: "UNKNOWN",
        message: error instanceof Error ? error.message : "Unknown transport failure.",
    };
}
function createInvalidAvailabilityOperationError(requestOperation) {
    return (0, hotelbeds_integration_error_1.createHotelbedsIntegrationError)({
        code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.VALIDATION_ERROR,
        retryable: false,
        message: `Invalid Hotelbeds availability operation: ${requestOperation}.`,
    });
}
class HotelbedsSupplierRateLimiter {
    constructor(settings) {
        this.lastRequestAt = 0;
        if (!Number.isInteger(settings.maxQps) || settings.maxQps <= 0) {
            throw new Error("Hotelbeds availability max QPS must be a positive integer.");
        }
        this.now = settings.now;
        this.sleep = settings.sleep;
        this.minIntervalMs = 1000 / settings.maxQps;
    }
    async acquire() {
        const elapsedSinceRequest = this.now() - this.lastRequestAt;
        if (this.lastRequestAt > 0 && elapsedSinceRequest < this.minIntervalMs) {
            const delayMs = Math.max(0, Math.ceil(this.minIntervalMs - elapsedSinceRequest));
            await this.sleep(delayMs);
        }
        this.lastRequestAt = this.now();
    }
}
class HotelbedsSupplierConcurrencyGate {
    constructor(settings) {
        this.active = new Set();
        if (!Number.isInteger(settings.maxConcurrency) || settings.maxConcurrency <= 0) {
            throw new Error("Hotelbeds availability max concurrency must be a positive integer.");
        }
        this.maxConcurrency = settings.maxConcurrency;
    }
    async acquire() {
        const ticket = Symbol("hotelbeds-supplier-ticket");
        while (this.active.size >= this.maxConcurrency) {
            await new Promise((resolve) => setTimeout(resolve, 10));
        }
        this.active.add(ticket);
        return () => {
            this.active.delete(ticket);
        };
    }
}
class DefaultHotelbedsAvailabilityExecutor {
    constructor(configLoader = () => (0, hotelbeds_integration_config_1.loadHotelbedsIntegrationConfig)(), authentication = new hotelbeds_authentication_1.DefaultHotelbedsAuthentication(), transport = new hotelbeds_transport_1.FetchHotelbedsTransport(), options) {
        this.configLoader = configLoader;
        this.authentication = authentication;
        this.transport = transport;
        this.options = {
            ...DEFAULT_EXECUTOR_OPTIONS,
            ...(options ?? {}),
        };
    }
    async execute(requests) {
        const responses = [];
        if (requests.length === 0) {
            return (0, hotelbeds_availability_execution_result_1.createHotelbedsAvailabilityExecutionResult)({
                provider: "hotelbeds",
                operation: "availability",
                completedAt: new Date(),
                responses: Object.freeze([]),
            });
        }
        const config = this.configLoader();
        const maxQps = this.options.maxQps ?? config.availabilityMaxQps ?? DEFAULT_EXECUTOR_OPTIONS.maxQps;
        const maxConcurrency = this.options.maxConcurrency ?? config.availabilityMaxConcurrency ?? DEFAULT_EXECUTOR_OPTIONS.maxConcurrency;
        if (!Number.isInteger(maxQps) || maxQps <= 0) {
            throw new Error("Hotelbeds availability max QPS must be a positive integer.");
        }
        if (!Number.isInteger(maxConcurrency) || maxConcurrency <= 0) {
            throw new Error("Hotelbeds availability max concurrency must be a positive integer.");
        }
        const protectionSettings = {
            maxQps,
            maxConcurrency,
            now: this.options.now,
            sleep: this.options.sleep,
        };
        const rateLimiter = new HotelbedsSupplierRateLimiter(protectionSettings);
        const concurrencyGate = new HotelbedsSupplierConcurrencyGate(protectionSettings);
        for (let requestIndex = 0; requestIndex < requests.length; requestIndex += 1) {
            const request = requests[requestIndex];
            if (!request) {
                continue;
            }
            if (request.operation !== "availability") {
                responses.push({
                    requestIndex,
                    request,
                    success: false,
                    retryable: false,
                    attempts: 1,
                    errors: [createInvalidAvailabilityOperationError(request.operation)],
                });
                continue;
            }
            const result = await this.executeRequestWithRetry(requestIndex, request, rateLimiter, concurrencyGate);
            responses.push(result);
        }
        return (0, hotelbeds_availability_execution_result_1.createHotelbedsAvailabilityExecutionResult)({
            provider: "hotelbeds",
            operation: "availability",
            completedAt: new Date(),
            responses: Object.freeze(responses),
        });
    }
    async executeRequestWithRetry(requestIndex, request, rateLimiter, concurrencyGate) {
        let attempts = 0;
        while (attempts < this.options.maxAttempts) {
            attempts += 1;
            try {
                await rateLimiter.acquire();
                const release = await concurrencyGate.acquire();
                try {
                    const config = this.configLoader();
                    const preparedHeaders = this.authentication.prepareHeaders(request, {
                        correlationId: request.correlationId,
                        requestId: request.requestId,
                    });
                    const response = await this.transport.execute(config, {
                        method: request.method,
                        path: request.path,
                        query: request.query,
                        body: request.body,
                        headers: {
                            ...preparedHeaders,
                            "Accept-Encoding": "gzip",
                        },
                    });
                    if (response.status >= 200 && response.status < 300) {
                        return {
                            requestIndex,
                            request,
                            success: true,
                            retryable: false,
                            attempts,
                            httpStatus: response.status,
                            headers: response.headers,
                            body: response.body,
                            errors: [],
                        };
                    }
                    const mappedError = (0, hotelbeds_error_mapper_1.mapHotelbedsHttpError)(response.status, response.body);
                    const failureResponse = {
                        requestIndex,
                        request,
                        success: false,
                        retryable: mappedError.retryable,
                        attempts,
                        httpStatus: response.status,
                        headers: response.headers,
                        body: response.body,
                        supplierError: readSupplierError(response.body),
                        errors: [mappedError],
                    };
                    if (!mappedError.retryable || attempts >= this.options.maxAttempts) {
                        return failureResponse;
                    }
                }
                finally {
                    release();
                }
            }
            catch (error) {
                const mappedError = (0, hotelbeds_error_mapper_1.mapHotelbedsTransportError)(error);
                const failureResponse = {
                    requestIndex,
                    request,
                    success: false,
                    retryable: mappedError.retryable,
                    attempts,
                    transportFailure: createTransportFailure(error),
                    errors: [mappedError],
                };
                if (!mappedError.retryable || attempts >= this.options.maxAttempts) {
                    return failureResponse;
                }
            }
        }
        return {
            requestIndex,
            request,
            success: false,
            retryable: false,
            attempts,
            errors: [
                (0, hotelbeds_integration_error_1.createHotelbedsIntegrationError)({
                    code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.UNKNOWN_ERROR,
                    retryable: false,
                    message: "Availability execution exhausted retries without a terminal response.",
                }),
            ],
        };
    }
}
exports.DefaultHotelbedsAvailabilityExecutor = DefaultHotelbedsAvailabilityExecutor;
//# sourceMappingURL=hotelbeds-availability-executor.js.map