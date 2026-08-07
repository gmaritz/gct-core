import { PricingCalculator } from "./pricing-calculator";
import { PricingCalculatorPriority, PricingCalculatorStage } from "./models";

export interface RegisteredPricingCalculator {
  readonly name: string;
  readonly stage: PricingCalculatorStage;
  readonly priority: PricingCalculatorPriority;
  readonly calculator: PricingCalculator;
}

interface InternalRegisteredPricingCalculator extends RegisteredPricingCalculator {
  readonly order: number;
}

function stageWeight(stage: PricingCalculatorStage): number {
  switch (stage) {
    case PricingCalculatorStage.ACCOMMODATION:
      return 0;
    case PricingCalculatorStage.EXPERIENCE:
      return 1;
    case PricingCalculatorStage.PROMOTION:
      return 2;
    case PricingCalculatorStage.DISCOUNT:
      return 3;
    case PricingCalculatorStage.TAX:
      return 4;
    case PricingCalculatorStage.MARKUP:
      return 5;
    case PricingCalculatorStage.COMMISSION:
      return 6;
    case PricingCalculatorStage.TOTAL:
      return 7;
    default:
      return 8;
  }
}

function priorityWeight(priority: PricingCalculatorPriority): number {
  switch (priority) {
    case PricingCalculatorPriority.HIGHEST:
      return 0;
    case PricingCalculatorPriority.HIGH:
      return 1;
    case PricingCalculatorPriority.NORMAL:
      return 2;
    case PricingCalculatorPriority.LOW:
      return 3;
    case PricingCalculatorPriority.LOWEST:
      return 4;
    default:
      return 5;
  }
}

function toRegisteredCalculator(registration: InternalRegisteredPricingCalculator): RegisteredPricingCalculator {
  return Object.freeze({
    name: registration.name,
    stage: registration.stage,
    priority: registration.priority,
    calculator: registration.calculator,
  });
}

export class PricingCalculatorRegistry {
  private readonly calculators = new Map<string, InternalRegisteredPricingCalculator>();
  private registrationSequence = 0;

  public register(
    name: string,
    calculator: PricingCalculator,
    priority: PricingCalculatorPriority = PricingCalculatorPriority.NORMAL,
  ): void {
    if (this.calculators.has(name)) {
      throw new Error(`Pricing calculator '${name}' is already registered.`);
    }

    this.registrationSequence += 1;

    this.calculators.set(
      name,
      Object.freeze({
        name,
        stage: calculator.stage,
        priority,
        calculator,
        order: this.registrationSequence,
      }),
    );
  }

  public unregister(name: string): boolean {
    return this.calculators.delete(name);
  }

  public resolve(name: string): RegisteredPricingCalculator | undefined {
    const registration = this.calculators.get(name);
    if (!registration) {
      return undefined;
    }

    return toRegisteredCalculator(registration);
  }

  public resolveAll(): ReadonlyArray<RegisteredPricingCalculator> {
    const registrations = [...this.calculators.values()]
      .sort((left, right) => {
        const stageDelta = stageWeight(left.stage) - stageWeight(right.stage);
        if (stageDelta !== 0) {
          return stageDelta;
        }

        const priorityDelta = priorityWeight(left.priority) - priorityWeight(right.priority);
        if (priorityDelta !== 0) {
          return priorityDelta;
        }

        return left.order - right.order;
      })
      .map(toRegisteredCalculator);

    return Object.freeze(registrations);
  }
}
