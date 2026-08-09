import { InvoicePolicy } from "../contracts";
import { InvoiceCommercialPolicy } from "../commercial";
import { InvoiceCancellationPolicy, InvoiceIssuePolicy, InvoiceVoidPolicy } from "../lifecycle";
import {
  InvoicePolicyContext,
  InvoicePolicyPriority,
  InvoicePolicyResult,
} from "../models";
import { InvoicePaymentPolicy } from "../payment";

export interface RegisteredInvoicePolicy {
  readonly name: string;
  readonly priority: InvoicePolicyPriority;
  readonly policy: InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult>;
}

interface InternalRegisteredInvoicePolicy extends RegisteredInvoicePolicy {
  readonly order: number;
}

function priorityWeight(priority: InvoicePolicyPriority): number {
  switch (priority) {
    case InvoicePolicyPriority.CRITICAL:
      return 0;
    case InvoicePolicyPriority.HIGH:
      return 1;
    case InvoicePolicyPriority.NORMAL:
      return 2;
    case InvoicePolicyPriority.LOW:
      return 3;
    default:
      return 4;
  }
}

function toRegisteredPolicy(policy: InternalRegisteredInvoicePolicy): RegisteredInvoicePolicy {
  return Object.freeze({
    name: policy.name,
    priority: policy.priority,
    policy: policy.policy,
  });
}

export class InvoicePolicyRegistry {
  private readonly policies = new Map<string, InternalRegisteredInvoicePolicy>();
  private registrationSequence = 0;

  public constructor(registerDefaults = true) {
    if (registerDefaults) {
      this.registerDefaults();
    }
  }

  public register(
    name: string,
    policy: InvoicePolicy<InvoicePolicyContext, InvoicePolicyResult>,
    priority: InvoicePolicyPriority = InvoicePolicyPriority.NORMAL,
  ): void {
    if (this.policies.has(name)) {
      throw new Error(`Invoice policy '${name}' is already registered.`);
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

  public resolve(name: string): RegisteredInvoicePolicy | undefined {
    const registration = this.policies.get(name);

    if (!registration) {
      return undefined;
    }

    return toRegisteredPolicy(registration);
  }

  public resolveAll(): ReadonlyArray<RegisteredInvoicePolicy> {
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

  private registerDefaults(): void {
    this.register("InvoiceCommercialPolicy", new InvoiceCommercialPolicy(), InvoicePolicyPriority.HIGH);
    this.register("InvoiceIssuePolicy", new InvoiceIssuePolicy(), InvoicePolicyPriority.NORMAL);
    this.register("InvoicePaymentPolicy", new InvoicePaymentPolicy(), InvoicePolicyPriority.NORMAL);
    this.register("InvoiceCancellationPolicy", new InvoiceCancellationPolicy(), InvoicePolicyPriority.NORMAL);
    this.register("InvoiceVoidPolicy", new InvoiceVoidPolicy(), InvoicePolicyPriority.NORMAL);
  }
}