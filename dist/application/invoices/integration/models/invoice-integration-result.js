"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceIntegrationResult = createInvoiceIntegrationResult;
const models_1 = require("../../models");
const invoice_integration_error_1 = require("./invoice-integration-error");
function createInvoiceIntegrationResult(input) {
    return Object.freeze({
        success: input.success,
        operation: input.operation,
        providerIdentifier: input.providerIdentifier,
        integrationStatus: input.integrationStatus,
        externalReference: input.externalReference ? (0, models_1.createInvoiceExternalReference)(input.externalReference) : null,
        idempotencyKey: input.idempotencyKey,
        retryable: input.retryable,
        errors: Object.freeze([...(input.errors ?? []).map(invoice_integration_error_1.createInvoiceIntegrationError)]),
        warnings: Object.freeze([...(input.warnings ?? [])]),
        metadata: Object.freeze({
            completedAt: new Date(input.metadata.completedAt.getTime()),
            version: input.metadata.version,
            requestId: input.metadata.requestId,
            correlationId: input.metadata.correlationId,
            source: input.metadata.source,
        }),
    });
}
//# sourceMappingURL=invoice-integration-result.js.map