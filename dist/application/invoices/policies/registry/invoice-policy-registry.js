"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicePolicyRegistry = void 0;
const commercial_1 = require("../commercial");
const lifecycle_1 = require("../lifecycle");
const models_1 = require("../models");
const payment_1 = require("../payment");
function priorityWeight(priority) {
    switch (priority) {
        case models_1.InvoicePolicyPriority.CRITICAL:
            return 0;
        case models_1.InvoicePolicyPriority.HIGH:
            return 1;
        case models_1.InvoicePolicyPriority.NORMAL:
            return 2;
        case models_1.InvoicePolicyPriority.LOW:
            return 3;
        default:
            return 4;
    }
}
function toRegisteredPolicy(policy) {
    return Object.freeze({
        name: policy.name,
        priority: policy.priority,
        policy: policy.policy,
    });
}
class InvoicePolicyRegistry {
    constructor(registerDefaults = true) {
        this.policies = new Map();
        this.registrationSequence = 0;
        if (registerDefaults) {
            this.registerDefaults();
        }
    }
    register(name, policy, priority = models_1.InvoicePolicyPriority.NORMAL) {
        if (this.policies.has(name)) {
            throw new Error(`Invoice policy '${name}' is already registered.`);
        }
        this.registrationSequence += 1;
        this.policies.set(name, Object.freeze({
            name,
            priority,
            policy,
            order: this.registrationSequence,
        }));
    }
    unregister(name) {
        return this.policies.delete(name);
    }
    resolve(name) {
        const registration = this.policies.get(name);
        if (!registration) {
            return undefined;
        }
        return toRegisteredPolicy(registration);
    }
    resolveAll() {
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
    registerDefaults() {
        this.register("InvoiceCommercialPolicy", new commercial_1.InvoiceCommercialPolicy(), models_1.InvoicePolicyPriority.HIGH);
        this.register("InvoiceIssuePolicy", new lifecycle_1.InvoiceIssuePolicy(), models_1.InvoicePolicyPriority.NORMAL);
        this.register("InvoicePaymentPolicy", new payment_1.InvoicePaymentPolicy(), models_1.InvoicePolicyPriority.NORMAL);
        this.register("InvoiceCancellationPolicy", new lifecycle_1.InvoiceCancellationPolicy(), models_1.InvoicePolicyPriority.NORMAL);
        this.register("InvoiceVoidPolicy", new lifecycle_1.InvoiceVoidPolicy(), models_1.InvoicePolicyPriority.NORMAL);
    }
}
exports.InvoicePolicyRegistry = InvoicePolicyRegistry;
//# sourceMappingURL=invoice-policy-registry.js.map