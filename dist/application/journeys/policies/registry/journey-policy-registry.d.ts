import { JourneyPolicy } from "../contracts";
import { JourneyCompositionPolicyContext, JourneyPolicyPriority, JourneyPolicyResult } from "../models";
export interface RegisteredJourneyPolicy {
    readonly name: string;
    readonly priority: JourneyPolicyPriority;
    readonly policy: JourneyPolicy<JourneyCompositionPolicyContext, JourneyPolicyResult>;
}
export declare class JourneyPolicyRegistry {
    private readonly policies;
    private registrationSequence;
    register(name: string, policy: JourneyPolicy<JourneyCompositionPolicyContext, JourneyPolicyResult>, priority?: JourneyPolicyPriority): void;
    unregister(name: string): boolean;
    resolve(name: string): RegisteredJourneyPolicy | undefined;
    resolveAll(): ReadonlyArray<RegisteredJourneyPolicy>;
}
//# sourceMappingURL=journey-policy-registry.d.ts.map