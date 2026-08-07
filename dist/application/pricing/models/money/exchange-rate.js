"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExchangeRate = createExchangeRate;
function createExchangeRate(rate) {
    return Object.freeze({
        baseCurrency: rate.baseCurrency,
        quoteCurrency: rate.quoteCurrency,
        rate: rate.rate,
        effectiveAt: new Date(rate.effectiveAt.getTime()),
        source: rate.source,
    });
}
//# sourceMappingURL=exchange-rate.js.map