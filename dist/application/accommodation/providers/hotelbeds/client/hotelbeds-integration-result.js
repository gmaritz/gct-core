"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHotelbedsIntegrationResult = createHotelbedsIntegrationResult;
const hotelbeds_integration_error_1 = require("./hotelbeds-integration-error");
function cloneSummary(summary) {
    if (!summary) {
        return undefined;
    }
    return Object.freeze({
        status: summary.status,
        payloadType: summary.payloadType,
    });
}
function createHotelbedsIntegrationResult(result) {
    return Object.freeze({
        success: result.success,
        operation: result.operation,
        provider: "hotelbeds",
        retryable: result.retryable,
        data: result.data ?? null,
        errors: Object.freeze([...(result.errors ?? []).map(hotelbeds_integration_error_1.createHotelbedsIntegrationError)]),
        providerResponse: cloneSummary(result.providerResponse),
        metadata: Object.freeze({
            completedAt: new Date(result.metadata.completedAt.getTime()),
            requestId: result.metadata.requestId,
            correlationId: result.metadata.correlationId,
            durationMs: result.metadata.durationMs,
        }),
    });
}
//# sourceMappingURL=hotelbeds-integration-result.js.map