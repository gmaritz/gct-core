import { ReservationPolicyResult } from "./models";
import { ReservationPolicyContext } from "./models";
import { ReservationPolicyRegistry } from "./reservation-policy-registry";
export declare class ReservationPolicyPipeline {
    private readonly registry;
    constructor(registry?: ReservationPolicyRegistry);
    evaluate(context: ReservationPolicyContext): ReservationPolicyResult;
}
//# sourceMappingURL=reservation-policy-pipeline.d.ts.map