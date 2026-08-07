import { PricingCalculator } from "./pricing-calculator";
import { PricingCalculatorPriority, PricingCalculatorStage } from "./models";
export interface RegisteredPricingCalculator {
    readonly name: string;
    readonly stage: PricingCalculatorStage;
    readonly priority: PricingCalculatorPriority;
    readonly calculator: PricingCalculator;
}
export declare class PricingCalculatorRegistry {
    private readonly calculators;
    private registrationSequence;
    register(name: string, calculator: PricingCalculator, priority?: PricingCalculatorPriority): void;
    unregister(name: string): boolean;
    resolve(name: string): RegisteredPricingCalculator | undefined;
    resolveAll(): ReadonlyArray<RegisteredPricingCalculator>;
}
//# sourceMappingURL=pricing-calculator-registry.d.ts.map