export interface QuotePresentationModel {
  readonly quoteStatus: string;
  readonly validityPeriod: string;
  readonly expiresAt: Date;
  readonly commercialNotes: ReadonlyArray<string>;
  readonly quotationReference: string;
}

export function createQuotePresentationModel(model: QuotePresentationModel): QuotePresentationModel {
  return Object.freeze({
    quoteStatus: model.quoteStatus,
    validityPeriod: model.validityPeriod,
    expiresAt: new Date(model.expiresAt.getTime()),
    commercialNotes: Object.freeze([...(model.commercialNotes ?? [])]),
    quotationReference: model.quotationReference,
  });
}
