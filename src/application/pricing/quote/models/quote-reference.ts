export interface QuoteReference {
  readonly quotationNumber: string;
  readonly externalReference: string | null;
  readonly customerReference: string | null;
}

export function createQuoteReference(input: {
  readonly quotationNumber: string;
  readonly externalReference?: string | null;
  readonly customerReference?: string | null;
}): QuoteReference {
  return Object.freeze({
    quotationNumber: input.quotationNumber,
    externalReference: input.externalReference ?? null,
    customerReference: input.customerReference ?? null,
  });
}
