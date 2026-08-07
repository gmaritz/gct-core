import { ReservationPolicy } from "./reservation-policy";
import { ReservationPolicyContext, ReservationPolicyPriority, ReservationPolicyResult } from "./models";
export interface RegisteredReservationPolicy {
    readonly name: string;
    readonly priority: ReservationPolicyPriority;
    readonly policy: ReservationPolicy<ReservationPolicyContext, ReservationPolicyResult>;
}
export declare class ReservationPolicyRegistry {
    private readonly policies;
    private registrationSequence;
    register(name: string, policy: ReservationPolicy<ReservationPolicyContext, ReservationPolicyResult>, priority?: ReservationPolicyPriority): void;
    unregister(name: string): boolean;
    resolve(name: string): RegisteredReservationPolicy | undefined;
    resolveAll(): ReadonlyArray<RegisteredReservationPolicy>;
}
//# sourceMappingURL=reservation-policy-registry.d.ts.map