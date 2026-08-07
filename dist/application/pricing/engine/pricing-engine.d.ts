import { ApplicationService } from "../../application-service";
import { PricingCalculatorPipeline } from "../calculators";
import { PricingPolicyPipeline } from "../policies";
import { PricingValidationPipeline } from "../validation";
import { PricingEngineRequest, PricingEngineResult } from "./models";
export declare class PricingEngine implements ApplicationService<PricingEngineRequest, PricingEngineResult> {
    private readonly validationPipeline;
    private readonly policyPipeline;
    private readonly calculatorPipeline;
    constructor(validationPipeline: PricingValidationPipeline, policyPipeline: PricingPolicyPipeline, calculatorPipeline: PricingCalculatorPipeline);
    execute(request: PricingEngineRequest): Promise<PricingEngineResult>;
}
//# sourceMappingURL=pricing-engine.d.ts.map