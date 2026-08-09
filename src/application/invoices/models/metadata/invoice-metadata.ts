export interface InvoiceMetadata {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: string;
}

export function createInvoiceMetadata(metadata: InvoiceMetadata): InvoiceMetadata {
  return Object.freeze({
    createdAt: new Date(metadata.createdAt.getTime()),
    updatedAt: new Date(metadata.updatedAt.getTime()),
    version: metadata.version,
  });
}