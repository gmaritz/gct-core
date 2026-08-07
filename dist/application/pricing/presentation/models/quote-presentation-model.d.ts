export interface QuotePresentationModel {
    readonly quoteStatus: string;
    readonly validityPeriod: string;
    readonly expiresAt: Date;
    readonly commercialNotes: ReadonlyArray<string>;
    readonly quotationReference: string;
}
export declare function createQuotePresentationModel(model: QuotePresentationModel): QuotePresentationModel;
//# sourceMappingURL=quote-presentation-model.d.ts.map