import { Pricing } from "../../aggregate";
export interface PricingEngineResult {
    readonly successful: boolean;
    readonly pricing: Pricing | null;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: {
        readonly completedAt: Date;
        readonly version: string;
        readonly requestId: string;
        readonly stages: ReadonlyArray<string>;
    };
}
export declare function createPricingEngineResult(input: {
    readonly successful: boolean;
    readonly pricing?: Pricing | null;
    readonly warnings?: ReadonlyArray<string>;
    readonly metadata: {
        readonly completedAt: Date;
        readonly version: string;
        readonly requestId: string;
        readonly stages: ReadonlyArray<string>;
    };
}): PricingEngineResult;
//# sourceMappingURL=pricing-engine-result.d.ts.map