export interface PricingStrategy {
    readonly id: string;
    readonly type: string;
    readonly profile: string;
    readonly metadata?: Readonly<Record<string, string>>;
}
export declare function createPricingStrategy(strategy: PricingStrategy): PricingStrategy;
//# sourceMappingURL=pricing-strategy.d.ts.map