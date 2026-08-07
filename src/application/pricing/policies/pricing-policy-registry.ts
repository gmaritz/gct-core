import { PricingPolicy } from "./pricing-policy";
import { PricingPolicyContext, PricingPolicyPriority, PricingPolicyResult } from "./models";

export interface RegisteredPricingPolicy {
  readonly name: string;
  readonly priority: PricingPolicyPriority;
  readonly policy: PricingPolicy<PricingPolicyContext, PricingPolicyResult>;
}

interface InternalRegisteredPricingPolicy extends RegisteredPricingPolicy {
  readonly order: number;
}

function priorityWeight(priority: PricingPolicyPriority): number {
  switch (priority) {
    case PricingPolicyPriority.CRITICAL:
      return 0;
    case PricingPolicyPriority.HIGH:
      return 1;
    case PricingPolicyPriority.NORMAL:
      return 2;
    case PricingPolicyPriority.LOW:
      return 3;
    default:
      return 4;
  }
}

function toRegisteredPolicy(policy: InternalRegisteredPricingPolicy): RegisteredPricingPolicy {
  return Object.freeze({
    name: policy.name,
    priority: policy.priority,
    policy: policy.policy,
  });
}

export class PricingPolicyRegistry {
  private readonly policies = new Map<string, InternalRegisteredPricingPolicy>();
  private registrationSequence = 0;

  public register(
    name: string,
    policy: PricingPolicy<PricingPolicyContext, PricingPolicyResult>,
    priority: PricingPolicyPriority = PricingPolicyPriority.NORMAL,
  ): void {
    if (this.policies.has(name)) {
      throw new Error(`Pricing policy '${name}' is already registered.`);
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

  public resolve(name: string): RegisteredPricingPolicy | undefined {
    const registration = this.policies.get(name);

    if (!registration) {
      return undefined;
    }

    return toRegisteredPolicy(registration);
  }

  public resolveAll(): ReadonlyArray<RegisteredPricingPolicy> {
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
