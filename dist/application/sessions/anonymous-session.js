"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAnonymousSessionId = isAnonymousSessionId;
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{43}$/;
function isAnonymousSessionId(value) {
    return SESSION_ID_PATTERN.test(value);
}
//# sourceMappingURL=anonymous-session.js.map