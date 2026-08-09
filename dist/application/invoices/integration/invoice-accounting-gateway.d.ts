import { InvoiceIntegrationContext, InvoiceIntegrationError, InvoiceIntegrationStatus } from "./models";
import { InvoiceExternalReference } from "../models";
export interface InvoiceAccountingGatewayResponse {
    readonly success: boolean;
    readonly providerIdentifier: string;
    readonly integrationStatus?: InvoiceIntegrationStatus;
    readonly externalReference?: InvoiceExternalReference;
    readonly retryable?: boolean;
    readonly errors?: ReadonlyArray<InvoiceIntegrationError>;
    readonly warnings?: ReadonlyArray<string>;
}
export interface InvoiceAccountingGateway {
    createInvoice(context: InvoiceIntegrationContext): Promise<InvoiceAccountingGatewayResponse>;
    updateInvoice(context: InvoiceIntegrationContext): Promise<InvoiceAccountingGatewayResponse>;
    cancelInvoice(context: InvoiceIntegrationContext): Promise<InvoiceAccountingGatewayResponse>;
    voidInvoice(context: InvoiceIntegrationContext): Promise<InvoiceAccountingGatewayResponse>;
}
//# sourceMappingURL=invoice-accounting-gateway.d.ts.map