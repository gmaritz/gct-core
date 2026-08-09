"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceIntegrationContext = createInvoiceIntegrationContext;
const models_1 = require("../../models");
const invoice_external_integration_request_1 = require("./invoice-external-integration-request");
function resolveSystemIdentifiers(selection) {
    const systems = [selection.providerId, selection.system].filter((value) => typeof value === "string" && value.trim().length > 0);
    return Object.freeze(systems.map((value) => value.trim()));
}
function resolveExistingExternalReference(invoice, selection) {
    const systems = resolveSystemIdentifiers(selection);
    const matched = invoice.externalReferences.find((reference) => systems.includes(reference.system));
    return matched ? (0, models_1.createInvoiceExternalReference)(matched) : undefined;
}
function resolveIdempotencyKey(request) {
    if (typeof request.idempotencyKey === "string" && request.idempotencyKey.trim().length > 0) {
        return request.idempotencyKey.trim();
    }
    return [
        request.providerSelection.providerId,
        request.operation,
        request.invoice.identity.id,
        request.invoice.metadata.version,
    ].join(":");
}
function freezeProviderSelection(selection) {
    return Object.freeze({
        providerId: selection.providerId,
        channel: selection.channel,
        system: selection.system,
    });
}
function freezeCorrelation(correlation) {
    return Object.freeze({
        requestId: correlation.requestId,
        correlationId: correlation.correlationId,
        traceId: correlation.traceId,
    });
}
function createInvoiceIntegrationContext(request, externalRequest) {
    return Object.freeze({
        invoice: request.invoice,
        operation: request.operation,
        providerSelection: freezeProviderSelection(request.providerSelection),
        correlation: freezeCorrelation(request.correlation),
        idempotencyKey: resolveIdempotencyKey(request),
        existingExternalReference: resolveExistingExternalReference(request.invoice, request.providerSelection),
        externalRequest: (0, invoice_external_integration_request_1.createInvoiceExternalIntegrationRequest)(externalRequest),
        metadata: Object.freeze({
            createdAt: new Date(),
            version: "1.0.0",
            source: request.metadata?.source ?? "InvoiceIntegrationOrchestrator",
        }),
    });
}
//# sourceMappingURL=invoice-integration-context.js.map