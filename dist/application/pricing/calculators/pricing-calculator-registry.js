"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingCalculatorRegistry = void 0;
const models_1 = require("./models");
function stageWeight(stage) {
    switch (stage) {
        case models_1.PricingCalculatorStage.ACCOMMODATION:
            return 0;
        case models_1.PricingCalculatorStage.EXPERIENCE:
            return 1;
        case models_1.PricingCalculatorStage.PROMOTION:
            return 2;
        case models_1.PricingCalculatorStage.DISCOUNT:
            return 3;
        case models_1.PricingCalculatorStage.TAX:
            return 4;
        case models_1.PricingCalculatorStage.MARKUP:
            return 5;
        case models_1.PricingCalculatorStage.COMMISSION:
            return 6;
        case models_1.PricingCalculatorStage.TOTAL:
            return 7;
        default:
            return 8;
    }
}
function priorityWeight(priority) {
    switch (priority) {
        case models_1.PricingCalculatorPriority.HIGHEST:
            return 0;
        case models_1.PricingCalculatorPriority.HIGH:
            return 1;
        case models_1.PricingCalculatorPriority.NORMAL:
            return 2;
        case models_1.PricingCalculatorPriority.LOW:
            return 3;
        case models_1.PricingCalculatorPriority.LOWEST:
            return 4;
        default:
            return 5;
    }
}
function toRegisteredCalculator(registration) {
    return Object.freeze({
        name: registration.name,
        stage: registration.stage,
        priority: registration.priority,
        calculator: registration.calculator,
    });
}
class PricingCalculatorRegistry {
    constructor() {
        this.calculators = new Map();
        this.registrationSequence = 0;
    }
    register(name, calculator, priority = models_1.PricingCalculatorPriority.NORMAL) {
        if (this.calculators.has(name)) {
            throw new Error(`Pricing calculator '${name}' is already registered.`);
        }
        this.registrationSequence += 1;
        this.calculators.set(name, Object.freeze({
            name,
            stage: calculator.stage,
            priority,
            calculator,
            order: this.registrationSequence,
        }));
    }
    unregister(name) {
        return this.calculators.delete(name);
    }
    resolve(name) {
        const registration = this.calculators.get(name);
        if (!registration) {
            return undefined;
        }
        return toRegisteredCalculator(registration);
    }
    resolveAll() {
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
exports.PricingCalculatorRegistry = PricingCalculatorRegistry;
//# sourceMappingURL=pricing-calculator-registry.js.map