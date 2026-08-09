import { InvoiceExternalReference, createInvoiceExternalReference } from "../../models";
import {
  createInvoiceIntegrationError,
  InvoiceIntegrationError,
} from "./invoice-integration-error";
import { InvoiceIntegrationOperation } from "./invoice-integration-operation";
import { InvoiceIntegrationStatus } from "./invoice-integration-status";

export interface InvoiceIntegrationResult {
  readonly success: boolean;
  readonly operation: InvoiceIntegrationOperation;
  readonly providerIdentifier: string;
  readonly integrationStatus: InvoiceIntegrationStatus;
  readonly externalReference: InvoiceExternalReference | null;
  readonly idempotencyKey: string;
  readonly retryable: boolean;
  readonly errors: ReadonlyArray<InvoiceIntegrationError>;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: {
    readonly completedAt: Date;
    readonly version: string;
    readonly requestId: string;
    readonly correlationId: string;
    readonly source: string;
  };
}

export function createInvoiceIntegrationResult(input: {
  readonly success: boolean;
  readonly operation: InvoiceIntegrationOperation;
  readonly providerIdentifier: string;
  readonly integrationStatus: InvoiceIntegrationStatus;
  readonly externalReference?: InvoiceExternalReference | null;
  readonly idempotencyKey: string;
  readonly retryable: boolean;
  readonly errors?: ReadonlyArray<InvoiceIntegrationError>;
  readonly warnings?: ReadonlyArray<string>;
  readonly metadata: {
    readonly completedAt: Date;
    readonly version: string;
    readonly requestId: string;
    readonly correlationId: string;
    readonly source: string;
  };
}): InvoiceIntegrationResult {
  return Object.freeze({
    success: input.success,
    operation: input.operation,
    providerIdentifier: input.providerIdentifier,
    integrationStatus: input.integrationStatus,
    externalReference: input.externalReference ? createInvoiceExternalReference(input.externalReference) : null,
    idempotencyKey: input.idempotencyKey,
    retryable: input.retryable,
    errors: Object.freeze([...(input.errors ?? []).map(createInvoiceIntegrationError)]),
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
