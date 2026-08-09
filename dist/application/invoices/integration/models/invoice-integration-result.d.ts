import { InvoiceExternalReference } from "../../models";
import { InvoiceIntegrationError } from "./invoice-integration-error";
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
export declare function createInvoiceIntegrationResult(input: {
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
}): InvoiceIntegrationResult;
//# sourceMappingURL=invoice-integration-result.d.ts.map