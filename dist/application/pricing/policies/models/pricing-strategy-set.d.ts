import { PricingStrategy } from "./pricing-strategy";
export interface PricingStrategySet {
    readonly strategies: ReadonlyArray<PricingStrategy>;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: {
        readonly generatedAt: Date;
        readonly version: string;
        readonly source: string;
    };
}
export declare function createPricingStrategySet(input: {
    readonly strategies?: ReadonlyArray<PricingStrategy>;
    readonly warnings?: ReadonlyArray<string>;
    readonly metadata: {
        readonly generatedAt: Date;
        readonly version: string;
        readonly source: string;
    };
}): PricingStrategySet;
//# sourceMappingURL=pricing-strategy-set.d.ts.map