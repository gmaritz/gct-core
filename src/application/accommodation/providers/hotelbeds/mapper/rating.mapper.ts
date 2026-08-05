import { AccommodationRating } from "@application/accommodation/models";

import { HotelbedsHotel } from "../models";

function parseStars(categoryCode?: string): number {
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

export function mapHotelbedsRating(hotel: HotelbedsHotel): AccommodationRating {
  const review = hotel.reviews?.[0];
  const reviewScore = review?.rate !== undefined ? Number(review.rate) : undefined;

  return {
    stars: parseStars(hotel.categoryCode),
    classification: hotel.categoryName ?? hotel.categoryCode ?? "",
    reviewScore: Number.isFinite(reviewScore ?? Number.NaN) ? reviewScore : undefined,
  };
}