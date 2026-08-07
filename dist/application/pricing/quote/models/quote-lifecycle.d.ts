export interface QuoteLifecycle {
    readonly createdAt: Date;
    readonly expiresAt: Date;
    readonly acceptedAt: Date | null;
    readonly expiredAt: Date | null;
    readonly withdrawnAt: Date | null;
}
export declare function createQuoteLifecycle(input: {
    readonly createdAt: Date;
    readonly expiresAt: Date;
    readonly acceptedAt?: Date | null;
    readonly expiredAt?: Date | null;
    readonly withdrawnAt?: Date | null;
}): QuoteLifecycle;
//# sourceMappingURL=quote-lifecycle.d.ts.map