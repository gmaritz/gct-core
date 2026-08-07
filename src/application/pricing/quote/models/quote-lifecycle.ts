export interface QuoteLifecycle {
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly acceptedAt: Date | null;
  readonly expiredAt: Date | null;
  readonly withdrawnAt: Date | null;
}

export function createQuoteLifecycle(input: {
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly acceptedAt?: Date | null;
  readonly expiredAt?: Date | null;
  readonly withdrawnAt?: Date | null;
}): QuoteLifecycle {
  return Object.freeze({
    createdAt: new Date(input.createdAt.getTime()),
    expiresAt: new Date(input.expiresAt.getTime()),
    acceptedAt: input.acceptedAt ? new Date(input.acceptedAt.getTime()) : null,
    expiredAt: input.expiredAt ? new Date(input.expiredAt.getTime()) : null,
    withdrawnAt: input.withdrawnAt ? new Date(input.withdrawnAt.getTime()) : null,
  });
}
