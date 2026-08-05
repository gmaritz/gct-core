"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHotelbedsRate = mapHotelbedsRate;
exports.mapHotelbedsRates = mapHotelbedsRates;
function mapHotelbedsRate(rate) {
    return {
        ...rate,
        cancellationPolicies: rate.cancellationPolicies ? [...rate.cancellationPolicies] : undefined,
        promotions: rate.promotions ? [...rate.promotions] : undefined,
        offers: rate.offers ? [...rate.offers] : undefined,
        shiftRates: rate.shiftRates ? [...rate.shiftRates] : undefined,
        dailyRates: rate.dailyRates ? [...rate.dailyRates] : undefined,
        taxes: rate.taxes
            ? {
                ...rate.taxes,
                taxes: rate.taxes.taxes ? [...rate.taxes.taxes] : undefined,
            }
            : undefined,
    };
}
function mapHotelbedsRates(rates = []) {
    return rates.map(mapHotelbedsRate);
}
//# sourceMappingURL=rate.mapper.js.map