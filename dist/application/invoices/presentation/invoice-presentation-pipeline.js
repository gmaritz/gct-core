"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicePresentationPipeline = void 0;
const models_1 = require("./models");
const invoice_presentation_mapper_1 = require("./invoice-presentation-mapper");
function resolveRequestId(request) {
    if (request.requestId && request.requestId.trim().length > 0) {
        return request.requestId.trim();
    }
    if (request.engineResult?.metadata.requestId) {
        return request.engineResult.metadata.requestId;
    }
    if (request.invoice?.identity.id) {
        return request.invoice.identity.id;
    }
    return "invoice-presentation-request";
}
class InvoicePresentationPipeline {
    constructor(mapper = new invoice_presentation_mapper_1.InvoicePresentationMapper()) {
        this.mapper = mapper;
    }
    execute(request) {
        const target = request.target ?? models_1.InvoicePresentationTarget.INVOICE_DETAIL;
        const source = request.source ?? "InvoicePresentationPipeline";
        const requestId = resolveRequestId(request);
        if (!request.invoice && !request.engineResult) {
            return (0, models_1.createInvoicePresentationResult)({
                success: false,
                target,
                errors: [
                    (0, models_1.createInvoicePresentationError)({
                        code: models_1.InvoicePresentationErrorCode.MISSING_INPUT,
                        message: "Invoice presentation requires an invoice or engine result.",
                    }),
                ],
                metadata: {
                    presentedAt: new Date(),
                    requestId,
                    source,
                    version: "1.0.0",
                },
            });
        }
        const enginePresentation = request.engineResult
            ? this.mapper.mapEngineResult(request.engineResult, target)
            : undefined;
        if (request.engineResult && !request.engineResult.success) {
            return (0, models_1.createInvoicePresentationResult)({
                success: false,
                target,
                engine: enginePresentation,
                errors: [
                    (0, models_1.createInvoicePresentationError)({
                        code: models_1.InvoicePresentationErrorCode.ENGINE_RESULT_FAILED,
                        message: "Invoice engine result is unsuccessful and cannot be presented as a successful invoice view.",
                    }),
                ],
                metadata: {
                    presentedAt: new Date(),
                    requestId,
                    source,
                    version: "1.0.0",
                },
            });
        }
        const invoice = request.invoice ?? request.engineResult?.invoice;
        if (!invoice) {
            return (0, models_1.createInvoicePresentationResult)({
                success: false,
                target,
                engine: enginePresentation,
                errors: [
                    (0, models_1.createInvoicePresentationError)({
                        code: models_1.InvoicePresentationErrorCode.MISSING_INVOICE,
                        message: "Invoice presentation requires an invoice instance.",
                    }),
                ],
                metadata: {
                    presentedAt: new Date(),
                    requestId,
                    source,
                    version: "1.0.0",
                },
            });
        }
        const mapped = this.mapper.mapInvoice(invoice);
        return (0, models_1.createInvoicePresentationResult)({
            success: true,
            target,
            invoice: mapped.invoice,
            summary: mapped.summary,
            engine: enginePresentation,
            metadata: {
                presentedAt: new Date(),
                requestId,
                source,
                version: "1.0.0",
            },
        });
    }
}
exports.InvoicePresentationPipeline = InvoicePresentationPipeline;
//# sourceMappingURL=invoice-presentation-pipeline.js.map