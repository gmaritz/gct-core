import { Invoice, InvoiceCustomerReference, InvoiceFinancialObligation, InvoicePricingSnapshot, InvoiceQuoteReference, InvoiceReservationReference } from "../../";
import { InvoiceValidationResult } from "../models";
export interface InvoiceReservationContext {
    readonly exists?: boolean;
    readonly status?: string;
    readonly reservationId?: string;
}
export interface InvoiceValidationRequest {
    readonly invoice?: Invoice | null;
    readonly reservationReference?: InvoiceReservationReference | null;
    readonly customerReference?: InvoiceCustomerReference | null;
    readonly quoteReference?: InvoiceQuoteReference | null;
    readonly pricingSnapshot?: InvoicePricingSnapshot | null;
    readonly financialObligation?: InvoiceFinancialObligation | null;
    readonly reservationContext?: InvoiceReservationContext | null;
    readonly requiresExistingInvoice?: boolean;
    readonly requiresMutableState?: boolean;
}
export declare class InvoiceRequestValidator {
    validate(request: InvoiceValidationRequest | null | undefined): InvoiceValidationResult;
}
//# sourceMappingURL=invoice-request-validator.d.ts.map