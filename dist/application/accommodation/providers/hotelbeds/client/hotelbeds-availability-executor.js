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
            const result = await this.executeRequestWithRetry(requestIndex, request);
            responses.push(result);
        }
        return (0, hotelbeds_availability_execution_result_1.createHotelbedsAvailabilityExecutionResult)({
            provider: "hotelbeds",
            operation: "availability",
            completedAt: new Date(),
            responses: Object.freeze(responses),
        });
    }
    async executeRequestWithRetry(requestIndex, request) {
        let attempts = 0;
        while (attempts < this.options.maxAttempts) {
            attempts += 1;
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