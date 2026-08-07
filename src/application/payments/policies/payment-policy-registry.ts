import { PaymentPolicy } from "./contracts";
import { PaymentPolicyContext, PaymentPolicyPriority, PaymentPolicyResult } from "./models";

export interface RegisteredPaymentPolicy {
  readonly name: string;
  readonly priority: PaymentPolicyPriority;
  readonly policy: PaymentPolicy<PaymentPolicyContext, PaymentPolicyResult>;
}

interface InternalRegisteredPaymentPolicy extends RegisteredPaymentPolicy {
  readonly order: number;
}

function priorityWeight(priority: PaymentPolicyPriority): number {
  switch (priority) {
    case PaymentPolicyPriority.CRITICAL:
      return 0;
    case PaymentPolicyPriority.HIGH:
      return 1;
    case PaymentPolicyPriority.NORMAL:
      return 2;
    case PaymentPolicyPriority.LOW:
      return 3;
    default:
      return 4;
  }
}

function toRegisteredPolicy(policy: InternalRegisteredPaymentPolicy): RegisteredPaymentPolicy {
  return Object.freeze({
    name: policy.name,
    priority: policy.priority,
    policy: policy.policy,
  });
}

export class PaymentPolicyRegistry {
  private readonly policies = new Map<string, InternalRegisteredPaymentPolicy>();
  private registrationSequence = 0;

  public register(
    name: string,
    policy: PaymentPolicy<PaymentPolicyContext, PaymentPolicyResult>,
    priority: PaymentPolicyPriority = PaymentPolicyPriority.NORMAL,
  ): void {
    if (this.policies.has(name)) {
      throw new Error(`Payment policy '${name}' is already registered.`);
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

  public resolve(name: string): RegisteredPaymentPolicy | undefined {
    const registration = this.policies.get(name);

    if (!registration) {
      return undefined;
    }

    return toRegisteredPolicy(registration);
  }

  public resolveAll(): ReadonlyArray<RegisteredPaymentPolicy> {
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
