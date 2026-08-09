import { Invoice } from "../../aggregate";
import { InvoiceExternalReference } from "../../models";
import { InvoiceExternalIntegrationRequest } from "./invoice-external-integration-request";
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
export declare function createInvoiceIntegrationContext(request: InvoiceIntegrationRequest, externalRequest: InvoiceExternalIntegrationRequest): InvoiceIntegrationContext;
//# sourceMappingURL=invoice-integration-context.d.ts.map