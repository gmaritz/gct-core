import { JourneyPolicy } from "../contracts";
import {
  JourneyCompositionPolicyContext,
  JourneyPolicyPriority,
  JourneyPolicyResult,
} from "../models";

export interface RegisteredJourneyPolicy {
  readonly name: string;
  readonly priority: JourneyPolicyPriority;
  readonly policy: JourneyPolicy<JourneyCompositionPolicyContext, JourneyPolicyResult>;
}

interface InternalRegisteredJourneyPolicy extends RegisteredJourneyPolicy {
  readonly order: number;
}

function priorityWeight(priority: JourneyPolicyPriority): number {
  switch (priority) {
    case JourneyPolicyPriority.CRITICAL:
      return 0;
    case JourneyPolicyPriority.HIGH:
      return 1;
    case JourneyPolicyPriority.NORMAL:
      return 2;
    case JourneyPolicyPriority.LOW:
      return 3;
    default:
      return 4;
  }
}

function toRegisteredPolicy(policy: InternalRegisteredJourneyPolicy): RegisteredJourneyPolicy {
  return Object.freeze({
    name: policy.name,
    priority: policy.priority,
    policy: policy.policy,
  });
}

export class JourneyPolicyRegistry {
  private readonly policies = new Map<string, InternalRegisteredJourneyPolicy>();

  private registrationSequence = 0;

  public register(
    name: string,
    policy: JourneyPolicy<JourneyCompositionPolicyContext, JourneyPolicyResult>,
    priority: JourneyPolicyPriority = JourneyPolicyPriority.NORMAL,
  ): void {
    if (this.policies.has(name)) {
      throw new Error(`Journey policy '${name}' is already registered.`);
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

  public resolve(name: string): RegisteredJourneyPolicy | undefined {
    const registration = this.policies.get(name);

    if (!registration) {
      return undefined;
    }

    return toRegisteredPolicy(registration);
  }

  public resolveAll(): ReadonlyArray<RegisteredJourneyPolicy> {
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