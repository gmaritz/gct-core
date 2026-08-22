"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReservationNumber = generateReservationNumber;
function generateReservationNumber(now = Date.now, random = Math.random) {
    const prefix = "RES";
    const timestamp = now().toString().slice(-6);
    const randomToken = random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${randomToken}`;
}
//# sourceMappingURL=reservation-number.generator.js.map