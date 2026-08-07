"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationPolicyRegistry = void 0;
const models_1 = require("./models");
function priorityWeight(priority) {
    switch (priority) {
        case models_1.ReservationPolicyPriority.CRITICAL:
            return 0;
        case models_1.ReservationPolicyPriority.HIGH:
            return 1;
        case models_1.ReservationPolicyPriority.NORMAL:
            return 2;
        case models_1.ReservationPolicyPriority.LOW:
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
class ReservationPolicyRegistry {
    constructor() {
        this.policies = new Map();
        this.registrationSequence = 0;
    }
    register(name, policy, priority = models_1.ReservationPolicyPriority.NORMAL) {
        if (this.policies.has(name)) {
            throw new Error(`Reservation policy '${name}' is already registered.`);
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
}
exports.ReservationPolicyRegistry = ReservationPolicyRegistry;
//# sourceMappingURL=reservation-policy-registry.js.map