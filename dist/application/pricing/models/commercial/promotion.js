"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromotion = createPromotion;
function createPromotion(promotion) {
    return Object.freeze({
        code: promotion.code,
        label: promotion.label,
        description: promotion.description,
    });
}
//# sourceMappingURL=promotion.js.map