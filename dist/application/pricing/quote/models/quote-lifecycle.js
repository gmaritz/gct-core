"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuoteLifecycle = createQuoteLifecycle;
function createQuoteLifecycle(input) {
    return Object.freeze({
        createdAt: new Date(input.createdAt.getTime()),
        expiresAt: new Date(input.expiresAt.getTime()),
        acceptedAt: input.acceptedAt ? new Date(input.acceptedAt.getTime()) : null,
        expiredAt: input.expiredAt ? new Date(input.expiredAt.getTime()) : null,
        withdrawnAt: input.withdrawnAt ? new Date(input.withdrawnAt.getTime()) : null,
    });
}
//# sourceMappingURL=quote-lifecycle.js.map