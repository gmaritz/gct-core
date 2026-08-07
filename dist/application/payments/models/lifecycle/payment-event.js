"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentEvent = createPaymentEvent;
const identity_1 = require("../identity");
function createPaymentEvent(event) {
    return Object.freeze({
        eventType: event.eventType,
        occurredAt: new Date(event.occurredAt.getTime()),
        note: event.note,
        transactionReference: event.transactionReference
            ? (0, identity_1.createTransactionReference)(event.transactionReference)
            : undefined,
    });
}
//# sourceMappingURL=payment-event.js.map