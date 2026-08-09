import {
  InvoicePresentationErrorCode,
  InvoicePresentationRequest,
  InvoicePresentationResult,
  InvoicePresentationTarget,
  createInvoicePresentationError,
  createInvoicePresentationResult,
} from "./models";
import { InvoicePresentationMapper } from "./invoice-presentation-mapper";

function resolveRequestId(request: InvoicePresentationRequest): string {
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

export class InvoicePresentationPipeline {
  public constructor(private readonly mapper: InvoicePresentationMapper = new InvoicePresentationMapper()) {}

  public execute(request: InvoicePresentationRequest): InvoicePresentationResult {
    const target = request.target ?? InvoicePresentationTarget.INVOICE_DETAIL;
    const source = request.source ?? "InvoicePresentationPipeline";
    const requestId = resolveRequestId(request);

    if (!request.invoice && !request.engineResult) {
      return createInvoicePresentationResult({
        success: false,
        target,
        errors: [
          createInvoicePresentationError({
            code: InvoicePresentationErrorCode.MISSING_INPUT,
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
      return createInvoicePresentationResult({
        success: false,
        target,
        engine: enginePresentation,
        errors: [
          createInvoicePresentationError({
            code: InvoicePresentationErrorCode.ENGINE_RESULT_FAILED,
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
      return createInvoicePresentationResult({
        success: false,
        target,
        engine: enginePresentation,
        errors: [
          createInvoicePresentationError({
            code: InvoicePresentationErrorCode.MISSING_INVOICE,
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

    return createInvoicePresentationResult({
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
