"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentTimeline = createPaymentTimeline;
const payment_event_1 = require("./payment-event");
function createPaymentTimeline(timeline) {
    return Object.freeze((timeline ?? []).map(payment_event_1.createPaymentEvent));
}
//# sourceMappingURL=payment-timeline.js.map