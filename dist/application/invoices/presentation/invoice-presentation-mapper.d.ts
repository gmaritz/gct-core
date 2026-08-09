import { Invoice } from "../aggregate";
import { InvoiceEngineResult } from "../engine";
import { InvoiceEnginePresentationModel, InvoicePresentationModel, InvoicePresentationTarget, InvoiceSummaryPresentationModel } from "./models";
export interface InvoicePresentationOutput {
    readonly invoice: InvoicePresentationModel;
    readonly summary: InvoiceSummaryPresentationModel;
    readonly engine?: InvoiceEnginePresentationModel;
}
export declare class InvoicePresentationMapper {
    mapInvoice(invoice: Invoice): {
        readonly invoice: InvoicePresentationModel;
        readonly summary: InvoiceSummaryPresentationModel;
    };
    mapEngineResult(engineResult: InvoiceEngineResult, target: InvoicePresentationTarget): InvoiceEnginePresentationModel;
}
//# sourceMappingURL=invoice-presentation-mapper.d.ts.map