"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultHotelbedsGateway = void 0;
const hotelbeds_authentication_1 = require("./hotelbeds-authentication");
const hotelbeds_integration_config_1 = require("./hotelbeds-integration-config");
const hotelbeds_integration_error_1 = require("./hotelbeds-integration-error");
const hotelbeds_integration_result_1 = require("./hotelbeds-integration-result");
const hotelbeds_error_mapper_1 = require("./hotelbeds-error-mapper");
const hotelbeds_transport_1 = require("./hotelbeds-transport");
function payloadType(payload) {
    if (payload === undefined) {
        return "none";
    }
    if (Array.isArray(payload)) {
        return "array";
    }
    if (typeof payload === "object" && payload !== null) {
        return "object";
    }
    return "none";
}
function isUsableSuccessPayload(payload) {
    if (payload === undefined) {
        return true;
    }
    if (Array.isArray(payload)) {
        return true;
    }
    return typeof payload === "object" && payload !== null;
}
function createProviderSummary(response) {
    return {
        status: response.status,
        payloadType: payloadType(response.body),
    };
}
class DefaultHotelbedsGateway {
    constructor(configLoader = () => (0, hotelbeds_integration_config_1.loadHotelbedsIntegrationConfig)(), authentication = new hotelbeds_authentication_1.DefaultHotelbedsAuthentication(), transport = new hotelbeds_transport_1.FetchHotelbedsTransport()) {
        this.configLoader = configLoader;
        this.authentication = authentication;
        this.transport = transport;
    }
    async execute(request) {
        const completedAt = new Date();
        try {
            const config = this.configLoader();
            const headers = this.authentication.prepareHeaders(request, {
                correlationId: request.correlationId,
                requestId: request.requestId,
            });
            const response = await this.transport.execute(config, {
                method: request.method,
                path: request.path,
                query: request.query,
                body: request.body,
                headers,
            });
            if (response.status >= 200 && response.status < 300) {
                if (!isUsableSuccessPayload(response.body)) {
                    return (0, hotelbeds_integration_result_1.createHotelbedsIntegrationResult)({
                        success: false,
                        operation: request.operation,
                        provider: "hotelbeds",
                        retryable: false,
                        data: null,
                        errors: [
                            (0, hotelbeds_integration_error_1.createHotelbedsIntegrationError)({
                                code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.MALFORMED_RESPONSE,
                                retryable: false,
                                httpStatus: response.status,
                                message: "Hotelbeds success response payload is malformed.",
                            }),
                        ],
                        providerResponse: createProviderSummary(response),
                        metadata: {
                            completedAt,
                            requestId: request.requestId,
                            correlationId: request.correlationId,
                            durationMs: response.durationMs,
                        },
                    });
                }
                return (0, hotelbeds_integration_result_1.createHotelbedsIntegrationResult)({
                    success: true,
                    operation: request.operation,
                    provider: "hotelbeds",
                    retryable: false,
                    data: response.body,
                    errors: [],
                    providerResponse: createProviderSummary(response),
                    metadata: {
                        completedAt,
                        requestId: request.requestId,
                        correlationId: request.correlationId,
                        durationMs: response.durationMs,
                    },
                });
            }
            const mappedError = (0, hotelbeds_error_mapper_1.mapHotelbedsHttpError)(response.status, response.body);
            return (0, hotelbeds_integration_result_1.createHotelbedsIntegrationResult)({
                success: false,
                operation: request.operation,
                provider: "hotelbeds",
                retryable: mappedError.retryable,
                data: null,
                errors: [mappedError],
                providerResponse: createProviderSummary(response),
                metadata: {
                    completedAt,
                    requestId: request.requestId,
                    correlationId: request.correlationId,
                    durationMs: response.durationMs,
                },
            });
        }
        catch (error) {
            const mappedError = (0, hotelbeds_error_mapper_1.mapHotelbedsTransportError)(error);
            return (0, hotelbeds_integration_result_1.createHotelbedsIntegrationResult)({
                success: false,
                operation: request.operation,
                provider: "hotelbeds",
                retryable: mappedError.retryable,
                data: null,
                errors: [mappedError],
                metadata: {
                    completedAt,
                    requestId: request.requestId,
                    correlationId: request.correlationId,
                },
            });
        }
    }
}
exports.DefaultHotelbedsGateway = DefaultHotelbedsGateway;
//# sourceMappingURL=hotelbeds-gateway.js.map