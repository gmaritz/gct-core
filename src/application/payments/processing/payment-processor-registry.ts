import { PaymentProcessor } from "./contracts";
import {
  PaymentProcessingContext,
  PaymentProcessorPriority,
  PaymentProcessingStage,
  PaymentStageProcessingResult,
} from "./models";

export interface RegisteredPaymentProcessor {
  readonly name: string;
  readonly stage: PaymentProcessingStage;
  readonly priority: PaymentProcessorPriority;
  readonly processor: PaymentProcessor<PaymentProcessingContext, PaymentStageProcessingResult>;
}

interface InternalRegisteredPaymentProcessor extends RegisteredPaymentProcessor {
  readonly order: number;
}

function priorityWeight(priority: PaymentProcessorPriority): number {
  switch (priority) {
    case PaymentProcessorPriority.CRITICAL:
      return 0;
    case PaymentProcessorPriority.HIGH:
      return 1;
    case PaymentProcessorPriority.NORMAL:
      return 2;
    case PaymentProcessorPriority.LOW:
      return 3;
    default:
      return 4;
  }
}

function toRegisteredProcessor(registration: InternalRegisteredPaymentProcessor): RegisteredPaymentProcessor {
  return Object.freeze({
    name: registration.name,
    stage: registration.stage,
    priority: registration.priority,
    processor: registration.processor,
  });
}

export class PaymentProcessorRegistry {
  private readonly processors = new Map<string, InternalRegisteredPaymentProcessor>();
  private registrationSequence = 0;

  public register(
    name: string,
    stage: PaymentProcessingStage,
    processor: PaymentProcessor<PaymentProcessingContext, PaymentStageProcessingResult>,
    priority: PaymentProcessorPriority = PaymentProcessorPriority.NORMAL,
  ): void {
    if (this.processors.has(name)) {
      throw new Error(`Payment processor '${name}' is already registered.`);
    }

    this.registrationSequence += 1;

    this.processors.set(
      name,
      Object.freeze({
        name,
        stage,
        priority,
        processor,
        order: this.registrationSequence,
      }),
    );
  }

  public unregister(name: string): boolean {
    return this.processors.delete(name);
  }

  public resolve(name: string): RegisteredPaymentProcessor | undefined {
    const registration = this.processors.get(name);

    if (!registration) {
      return undefined;
    }

    return toRegisteredProcessor(registration);
  }

  public resolveAll(): ReadonlyArray<RegisteredPaymentProcessor> {
    const registrations = [...this.processors.values()]
      .sort((left, right) => {
        const leftWeight = priorityWeight(left.priority);
        const rightWeight = priorityWeight(right.priority);

        if (leftWeight === rightWeight) {
          return left.order - right.order;
        }

        return leftWeight - rightWeight;
      })
      .map(toRegisteredProcessor);

    return Object.freeze(registrations);
  }
}
