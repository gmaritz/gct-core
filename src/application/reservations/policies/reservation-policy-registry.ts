import { ReservationPolicy } from "./reservation-policy";
import { ReservationPolicyContext, ReservationPolicyPriority, ReservationPolicyResult } from "./models";

export interface RegisteredReservationPolicy {
  readonly name: string;
  readonly priority: ReservationPolicyPriority;
  readonly policy: ReservationPolicy<ReservationPolicyContext, ReservationPolicyResult>;
}

interface InternalRegisteredReservationPolicy extends RegisteredReservationPolicy {
  readonly order: number;
}

function priorityWeight(priority: ReservationPolicyPriority): number {
  switch (priority) {
    case ReservationPolicyPriority.CRITICAL:
      return 0;
    case ReservationPolicyPriority.HIGH:
      return 1;
    case ReservationPolicyPriority.NORMAL:
      return 2;
    case ReservationPolicyPriority.LOW:
      return 3;
    default:
      return 4;
  }
}

function toRegisteredPolicy(policy: InternalRegisteredReservationPolicy): RegisteredReservationPolicy {
  return Object.freeze({
    name: policy.name,
    priority: policy.priority,
    policy: policy.policy,
  });
}

export class ReservationPolicyRegistry {
  private readonly policies = new Map<string, InternalRegisteredReservationPolicy>();
  private registrationSequence = 0;

  public register(
    name: string,
    policy: ReservationPolicy<ReservationPolicyContext, ReservationPolicyResult>,
    priority: ReservationPolicyPriority = ReservationPolicyPriority.NORMAL,
  ): void {
    if (this.policies.has(name)) {
      throw new Error(`Reservation policy '${name}' is already registered.`);
    }

    this.registrationSequence += 1;

    this.policies.set(
      name,
      Object.freeze({
        name,
        priority,
        policy,
        order: this.registrationSequence,
      }),
    );
  }

  public unregister(name: string): boolean {
    return this.policies.delete(name);
  }

  public resolve(name: string): RegisteredReservationPolicy | undefined {
    const registration = this.policies.get(name);

    if (!registration) {
      return undefined;
    }

    return toRegisteredPolicy(registration);
  }

  public resolveAll(): ReadonlyArray<RegisteredReservationPolicy> {
    const registrations = [...this.policies.values()]
      .sort((left, right) => {
        const leftWeight = priorityWeight(left.priority);
        const rightWeight = priorityWeight(right.priority);

        if (leftWeight === rightWeight) {
          return left.order - right.order;
        }

        return leftWeight - rightWeight;
      })
      .map(toRegisteredPolicy);

    return Object.freeze(registrations);
  }
}
