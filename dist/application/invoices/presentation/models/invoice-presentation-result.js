"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoicePresentationResult = createInvoicePresentationResult;
const invoice_presentation_error_1 = require("./invoice-presentation-error");
const invoice_engine_presentation_model_1 = require("./invoice-engine-presentation-model");
const invoice_presentation_model_1 = require("./invoice-presentation-model");
const invoice_summary_presentation_model_1 = require("./invoice-summary-presentation-model");
function createInvoicePresentationResult(input) {
    return Object.freeze({
        success: input.success,
        target: input.target,
        invoice: input.invoice ? (0, invoice_presentation_model_1.createInvoicePresentationModel)(input.invoice) : undefined,
        summary: input.summary ? (0, invoice_summary_presentation_model_1.createInvoiceSummaryPresentationModel)(input.summary) : undefined,
        engine: input.engine ? (0, invoice_engine_presentation_model_1.createInvoiceEnginePresentationModel)(input.engine) : undefined,
        errors: Object.freeze([...(input.errors ?? []).map(invoice_presentation_error_1.createInvoicePresentationError)]),
        metadata: Object.freeze({
            presentedAt: new Date(input.metadata.presentedAt.getTime()),
            requestId: input.metadata.requestId,
            source: input.metadata.source,
            version: input.metadata.version,
        }),
    });
}
//# sourceMappingURL=invoice-presentation-result.js.map