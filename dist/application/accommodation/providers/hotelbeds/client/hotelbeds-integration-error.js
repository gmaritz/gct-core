"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelbedsIntegrationErrorCode = void 0;
exports.createHotelbedsIntegrationError = createHotelbedsIntegrationError;
var HotelbedsIntegrationErrorCode;
(function (HotelbedsIntegrationErrorCode) {
    HotelbedsIntegrationErrorCode["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
    HotelbedsIntegrationErrorCode["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    HotelbedsIntegrationErrorCode["AUTHORIZATION_ERROR"] = "AUTHORIZATION_ERROR";
    HotelbedsIntegrationErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    HotelbedsIntegrationErrorCode["NOT_FOUND"] = "NOT_FOUND";
    HotelbedsIntegrationErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    HotelbedsIntegrationErrorCode["TIMEOUT"] = "TIMEOUT";
    HotelbedsIntegrationErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    HotelbedsIntegrationErrorCode["PROVIDER_ERROR"] = "PROVIDER_ERROR";
    HotelbedsIntegrationErrorCode["MALFORMED_RESPONSE"] = "MALFORMED_RESPONSE";
    HotelbedsIntegrationErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(HotelbedsIntegrationErrorCode || (exports.HotelbedsIntegrationErrorCode = HotelbedsIntegrationErrorCode = {}));
function createHotelbedsIntegrationError(error) {
    return Object.freeze({
        code: error.code,
        message: error.message,
        retryable: error.retryable,
        providerCode: error.providerCode,
        httpStatus: error.httpStatus,
    });
}
//# sourceMappingURL=hotelbeds-integration-error.js.map