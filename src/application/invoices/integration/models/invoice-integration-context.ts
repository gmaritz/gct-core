import { Invoice } from "../../aggregate";
import { InvoiceExternalReference, createInvoiceExternalReference } from "../../models";
import { InvoiceExternalIntegrationRequest } from "./invoice-external-integration-request";
import { createInvoiceExternalIntegrationRequest } from "./invoice-external-integration-request";
import { InvoiceIntegrationOperation } from "./invoice-integration-operation";

export interface InvoiceIntegrationProviderSelection {
  readonly providerId: string;
  readonly channel?: string;
  readonly system?: string;
}

export interface InvoiceIntegrationCorrelation {
  readonly requestId: string;
  readonly correlationId: string;
  readonly traceId?: string;
}

export interface InvoiceIntegrationRequest {
  readonly invoice: Invoice;
  readonly operation: InvoiceIntegrationOperation;
  readonly providerSelection: InvoiceIntegrationProviderSelection;
  readonly correlation: InvoiceIntegrationCorrelation;
  readonly idempotencyKey?: string;
  readonly metadata?: {
    readonly source?: string;
  };
}

export interface InvoiceIntegrationContext {
  readonly invoice: Invoice;
  readonly operation: InvoiceIntegrationOperation;
  readonly providerSelection: InvoiceIntegrationProviderSelection;
  readonly correlation: InvoiceIntegrationCorrelation;
  readonly idempotencyKey: string;
  readonly existingExternalReference?: InvoiceExternalReference;
  readonly externalRequest: InvoiceExternalIntegrationRequest;
  readonly metadata: {
    readonly createdAt: Date;
    readonly version: string;
    readonly source: string;
  };
}

function resolveSystemIdentifiers(
  selection: InvoiceIntegrationProviderSelection,
): ReadonlyArray<string> {
  const systems = [selection.providerId, selection.system].filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );

  return Object.freeze(systems.map((value) => value.trim()));
}

function resolveExistingExternalReference(
  invoice: Invoice,
  selection: InvoiceIntegrationProviderSelection,
): InvoiceExternalReference | undefined {
  const systems = resolveSystemIdentifiers(selection);
  const matched = invoice.externalReferences.find((reference) => systems.includes(reference.system));
  return matched ? createInvoiceExternalReference(matched) : undefined;
}

function resolveIdempotencyKey(request: InvoiceIntegrationRequest): string {
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

function freezeProviderSelection(selection: InvoiceIntegrationProviderSelection): InvoiceIntegrationProviderSelection {
  return Object.freeze({
    providerId: selection.providerId,
    channel: selection.channel,
    system: selection.system,
  });
}

function freezeCorrelation(correlation: InvoiceIntegrationCorrelation): InvoiceIntegrationCorrelation {
  return Object.freeze({
    requestId: correlation.requestId,
    correlationId: correlation.correlationId,
    traceId: correlation.traceId,
  });
}

export function createInvoiceIntegrationContext(
  request: InvoiceIntegrationRequest,
  externalRequest: InvoiceExternalIntegrationRequest,
): InvoiceIntegrationContext {
  return Object.freeze({
    invoice: request.invoice,
    operation: request.operation,
    providerSelection: freezeProviderSelection(request.providerSelection),
    correlation: freezeCorrelation(request.correlation),
    idempotencyKey: resolveIdempotencyKey(request),
    existingExternalReference: resolveExistingExternalReference(request.invoice, request.providerSelection),
    externalRequest: createInvoiceExternalIntegrationRequest(externalRequest),
    metadata: Object.freeze({
      createdAt: new Date(),
      version: "1.0.0",
      source: request.metadata?.source ?? "InvoiceIntegrationOrchestrator",
    }),
  });
}
