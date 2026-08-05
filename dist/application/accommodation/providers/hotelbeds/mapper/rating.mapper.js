"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHotelbedsRating = mapHotelbedsRating;
function parseStars(categoryCode) {
    if (!categoryCode) {
        return 0;
    }
    const match = categoryCode.match(/\d+/);
    if (!match) {
        return 0;
    }
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : 0;
}
function mapHotelbedsRating(hotel) {
    const review = hotel.reviews?.[0];
    const reviewScore = review?.rate !== undefined ? Number(review.rate) : undefined;
    return {
        stars: parseStars(hotel.categoryCode),
        classification: hotel.categoryName ?? hotel.categoryCode ?? "",
        reviewScore: Number.isFinite(reviewScore ?? Number.NaN) ? reviewScore : undefined,
    };
}
//# sourceMappingURL=rating.mapper.js.map