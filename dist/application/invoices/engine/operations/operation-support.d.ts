import { Invoice, InvoiceComposition } from "../../aggregate";
import { InvoiceMetadata } from "../../models";
export declare function ensurePresent<T>(value: T | null | undefined, message: string): T;
export declare function resolveMetadata(metadata: InvoiceMetadata): InvoiceMetadata;
export declare function toInvoiceComposition(invoice: Invoice): InvoiceComposition;
//# sourceMappingURL=operation-support.d.ts.map