import { Invoice } from "../../aggregate";
import { InvoiceEngineResult } from "../../engine";
import { InvoicePresentationTarget } from "./invoice-presentation-context";
export interface InvoicePresentationRequest {
    readonly invoice?: Invoice | null;
    readonly engineResult?: InvoiceEngineResult | null;
    readonly target?: InvoicePresentationTarget;
    readonly requestId?: string;
    readonly source?: string;
}
//# sourceMappingURL=invoice-presentation-request.d.ts.map