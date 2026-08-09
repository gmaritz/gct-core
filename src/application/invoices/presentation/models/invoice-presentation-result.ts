import {
  createInvoicePresentationError,
  InvoicePresentationError,
} from "./invoice-presentation-error";
import { InvoicePresentationTarget } from "./invoice-presentation-context";
import {
  createInvoiceEnginePresentationModel,
  InvoiceEnginePresentationModel,
} from "./invoice-engine-presentation-model";
import {
  createInvoicePresentationModel,
  InvoicePresentationModel,
} from "./invoice-presentation-model";
import {
  createInvoiceSummaryPresentationModel,
  InvoiceSummaryPresentationModel,
} from "./invoice-summary-presentation-model";

export interface InvoicePresentationResult {
  readonly success: boolean;
  readonly target: InvoicePresentationTarget;
  readonly invoice?: InvoicePresentationModel;
  readonly summary?: InvoiceSummaryPresentationModel;
  readonly engine?: InvoiceEnginePresentationModel;
  readonly errors: ReadonlyArray<InvoicePresentationError>;
  readonly metadata: {
    readonly presentedAt: Date;
    readonly requestId: string;
    readonly source: string;
    readonly version: string;
  };
}

export function createInvoicePresentationResult(input: {
  readonly success: boolean;
  readonly target: InvoicePresentationTarget;
  readonly invoice?: InvoicePresentationModel;
  readonly summary?: InvoiceSummaryPresentationModel;
  readonly engine?: InvoiceEnginePresentationModel;
  readonly errors?: ReadonlyArray<InvoicePresentationError>;
  readonly metadata: {
    readonly presentedAt: Date;
    readonly requestId: string;
    readonly source: string;
    readonly version: string;
  };
}): InvoicePresentationResult {
  return Object.freeze({
    success: input.success,
    target: input.target,
    invoice: input.invoice ? createInvoicePresentationModel(input.invoice) : undefined,
    summary: input.summary ? createInvoiceSummaryPresentationModel(input.summary) : undefined,
    engine: input.engine ? createInvoiceEnginePresentationModel(input.engine) : undefined,
    errors: Object.freeze([...(input.errors ?? []).map(createInvoicePresentationError)]),
    metadata: Object.freeze({
      presentedAt: new Date(input.metadata.presentedAt.getTime()),
      requestId: input.metadata.requestId,
      source: input.metadata.source,
      version: input.metadata.version,
    }),
  });
}
