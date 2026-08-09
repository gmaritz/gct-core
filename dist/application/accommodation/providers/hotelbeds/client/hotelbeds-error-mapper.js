"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHotelbedsHttpError = mapHotelbedsHttpError;
exports.mapHotelbedsTransportError = mapHotelbedsTransportError;
const hotelbeds_integration_config_1 = require("./hotelbeds-integration-config");
const hotelbeds_integration_error_1 = require("./hotelbeds-integration-error");
const hotelbeds_transport_1 = require("./hotelbeds-transport");
function mapHttpStatusToCode(status) {
    if (status === 400 || status === 422) {
        return { code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.VALIDATION_ERROR, retryable: false };
    }
    if (status === 401) {
        return { code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.AUTHENTICATION_ERROR, retryable: false };
    }
    if (status === 403) {
        return { code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.AUTHORIZATION_ERROR, retryable: false };
    }
    if (status === 404) {
        return { code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.NOT_FOUND, retryable: false };
    }
    if (status === 429) {
        return { code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.RATE_LIMITED, retryable: true };
    }
    if (status >= 500) {
        return { code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.PROVIDER_ERROR, retryable: true };
    }
    return { code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.UNKNOWN_ERROR, retryable: false };
}
function readProviderError(payload) {
    if (!payload || typeof payload !== "object") {
        return {};
    }
    const providerPayload = payload;
    return {
        code: providerPayload.error?.code ?? providerPayload.code,
        message: providerPayload.error?.message ?? providerPayload.message,
    };
}
function mapHotelbedsHttpError(status, payload) {
    const mapping = mapHttpStatusToCode(status);
    const providerError = readProviderError(payload);
    return (0, hotelbeds_integration_error_1.createHotelbedsIntegrationError)({
        code: mapping.code,
        retryable: mapping.retryable,
        providerCode: providerError.code,
        httpStatus: status,
        message: providerError.message ?? `Hotelbeds request failed with status ${status}.`,
    });
}
function mapHotelbedsTransportError(error) {
    if (error instanceof hotelbeds_integration_config_1.HotelbedsConfigurationError) {
        return (0, hotelbeds_integration_error_1.createHotelbedsIntegrationError)({
            code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.CONFIGURATION_ERROR,
            retryable: false,
            message: error.message,
        });
    }
    if (!(error instanceof hotelbeds_transport_1.HotelbedsTransportError)) {
        const message = error instanceof Error ? error.message : "Unknown Hotelbeds transport failure.";
        return (0, hotelbeds_integration_error_1.createHotelbedsIntegrationError)({
            code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.UNKNOWN_ERROR,
            retryable: false,
            message,
        });
    }
    if (error.kind === hotelbeds_transport_1.HotelbedsTransportErrorKind.TIMEOUT) {
        return (0, hotelbeds_integration_error_1.createHotelbedsIntegrationError)({
            code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.TIMEOUT,
            retryable: true,
            providerCode: error.providerCode,
            message: error.message,
        });
    }
    if (error.kind === hotelbeds_transport_1.HotelbedsTransportErrorKind.NETWORK) {
        return (0, hotelbeds_integration_error_1.createHotelbedsIntegrationError)({
            code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.NETWORK_ERROR,
            retryable: true,
            providerCode: error.providerCode,
            message: error.message,
        });
    }
    if (error.kind === hotelbeds_transport_1.HotelbedsTransportErrorKind.MALFORMED_RESPONSE) {
        return (0, hotelbeds_integration_error_1.createHotelbedsIntegrationError)({
            code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.MALFORMED_RESPONSE,
            retryable: false,
            providerCode: error.providerCode,
            message: error.message,
        });
    }
    return (0, hotelbeds_integration_error_1.createHotelbedsIntegrationError)({
        code: hotelbeds_integration_error_1.HotelbedsIntegrationErrorCode.UNKNOWN_ERROR,
        retryable: false,
        providerCode: error.providerCode,
        message: error.message,
    });
}
//# sourceMappingURL=hotelbeds-error-mapper.js.map