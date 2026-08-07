export interface QuoteMetadata {
    readonly createdAt: Date;
    readonly expiresAt: Date;
    readonly version: string;
    readonly source: string;
}
export declare function createQuoteMetadata(metadata: QuoteMetadata): QuoteMetadata;
//# sourceMappingURL=quote-metadata.d.ts.map