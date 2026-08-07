export interface QuoteReference {
    readonly quotationNumber: string;
    readonly externalReference: string | null;
    readonly customerReference: string | null;
}
export declare function createQuoteReference(input: {
    readonly quotationNumber: string;
    readonly externalReference?: string | null;
    readonly customerReference?: string | null;
}): QuoteReference;
//# sourceMappingURL=quote-reference.d.ts.map