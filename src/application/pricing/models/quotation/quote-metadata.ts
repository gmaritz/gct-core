export interface QuoteMetadata {
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly version: string;
  readonly source: string;
}

export function createQuoteMetadata(metadata: QuoteMetadata): QuoteMetadata {
  return Object.freeze({
    createdAt: new Date(metadata.createdAt.getTime()),
    expiresAt: new Date(metadata.expiresAt.getTime()),
    version: metadata.version,
    source: metadata.source,
  });
}
