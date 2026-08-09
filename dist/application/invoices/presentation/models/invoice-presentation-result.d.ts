import { InvoicePresentationError } from "./invoice-presentation-error";
import { InvoicePresentationTarget } from "./invoice-presentation-context";
import { InvoiceEnginePresentationModel } from "./invoice-engine-presentation-model";
import { InvoicePresentationModel } from "./invoice-presentation-model";
import { InvoiceSummaryPresentationModel } from "./invoice-summary-presentation-model";
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
export declare function createInvoicePresentationResult(input: {
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
}): InvoicePresentationResult;
//# sourceMappingURL=invoice-presentation-result.d.ts.map