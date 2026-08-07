export interface PricingMetadata {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: string;
  readonly source: string;
}

export function createPricingMetadata(metadata: PricingMetadata): PricingMetadata {
  return Object.freeze({
    createdAt: new Date(metadata.createdAt.getTime()),
    updatedAt: new Date(metadata.updatedAt.getTime()),
    version: metadata.version,
    source: metadata.source,
  });
}
