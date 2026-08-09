import { Invoice } from "../aggregate";
import { InvoiceExternalIntegrationRequest, InvoiceIntegrationOperation } from "./models";
export declare class InvoiceIntegrationMapper {
    mapInvoice(invoice: Invoice, operation: InvoiceIntegrationOperation): InvoiceExternalIntegrationRequest;
}
//# sourceMappingURL=invoice-integration-mapper.d.ts.map