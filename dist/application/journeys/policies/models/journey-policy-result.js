"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJourneyPolicyResult = createJourneyPolicyResult;
function createJourneyPolicyResult(outcome, priority, messages) {
    return Object.freeze({
        outcome,
        priority,
        messages: Object.freeze([...messages]),
    });
}
//# sourceMappingURL=journey-policy-result.js.map