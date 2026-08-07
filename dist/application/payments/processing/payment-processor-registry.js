"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProcessorRegistry = void 0;
const models_1 = require("./models");
function priorityWeight(priority) {
    switch (priority) {
        case models_1.PaymentProcessorPriority.CRITICAL:
            return 0;
        case models_1.PaymentProcessorPriority.HIGH:
            return 1;
        case models_1.PaymentProcessorPriority.NORMAL:
            return 2;
        case models_1.PaymentProcessorPriority.LOW:
            return 3;
        default:
            return 4;
    }
}
function toRegisteredProcessor(registration) {
    return Object.freeze({
        name: registration.name,
        stage: registration.stage,
        priority: registration.priority,
        processor: registration.processor,
    });
}
class PaymentProcessorRegistry {
    constructor() {
        this.processors = new Map();
        this.registrationSequence = 0;
    }
    register(name, stage, processor, priority = models_1.PaymentProcessorPriority.NORMAL) {
        if (this.processors.has(name)) {
            throw new Error(`Payment processor '${name}' is already registered.`);
        }
        this.registrationSequence += 1;
        this.processors.set(name, Object.freeze({
            name,
            stage,
            priority,
            processor,
            order: this.registrationSequence,
        }));
    }
    unregister(name) {
        return this.processors.delete(name);
    }
    resolve(name) {
        const registration = this.processors.get(name);
        if (!registration) {
            return undefined;
        }
        return toRegisteredProcessor(registration);
    }
    resolveAll() {
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
exports.PaymentProcessorRegistry = PaymentProcessorRegistry;
//# sourceMappingURL=payment-processor-registry.js.map