"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceEngineContext = createInvoiceEngineContext;
exports.withInvoiceEngineStage = withInvoiceEngineStage;
const policies_1 = require("../../policies");
function cloneDate(value) {
    return new Date(value.getTime());
}
function deriveRequestId(request) {
    if (request.requestId && request.requestId.trim().length > 0) {
        return request.requestId.trim();
    }
    if (request.invoice?.identity.id) {
        return request.invoice.identity.id;
    }
    if (request.validationRequest.invoice?.identity.id) {
        return request.validationRequest.invoice.identity.id;
    }
    if (request.operationInput?.operation === policies_1.InvoiceOperation.CREATE) {
        return request.operationInput.composition.identity.id;
    }
    return "invoice-request";
}
function createInvoiceEngineContext(request) {
    return Object.freeze({
        operation: request.operation,
        validationRequest: request.validationRequest,
        validationResult: request.validationResult,
        policyEvaluation: request.policyEvaluation,
        operationInput: request.operationInput,
        invoice: request.invoice ?? request.validationRequest.invoice ?? null,
        metadata: Object.freeze({
            startedAt: new Date(),
            version: "1.0.0",
            requestId: deriveRequestId(request),
            source: request.source ?? "InvoiceEngine",
            stages: Object.freeze(["CONTEXT"]),
        }),
    });
}
function withInvoiceEngineStage(metadata, stage) {
    return Object.freeze({
        startedAt: cloneDate(metadata.startedAt),
        version: metadata.version,
        requestId: metadata.requestId,
        source: metadata.source,
        stages: Object.freeze([...metadata.stages, stage]),
    });
}
//# sourceMappingURL=invoice-engine-context.js.map