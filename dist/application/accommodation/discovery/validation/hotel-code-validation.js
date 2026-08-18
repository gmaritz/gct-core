"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidExplicitHotelCode = isValidExplicitHotelCode;
const MAX_SAFE_HOTEL_CODE = BigInt(Number.MAX_SAFE_INTEGER);
function isValidExplicitHotelCode(value) {
    if (typeof value !== "string") {
        return false;
    }
    const code = value.trim();
    if (!/^\d+$/.test(code)) {
        return false;
    }
    const asBigInt = BigInt(code);
    return asBigInt > 0n && asBigInt <= MAX_SAFE_HOTEL_CODE;
}
//# sourceMappingURL=hotel-code-validation.js.map