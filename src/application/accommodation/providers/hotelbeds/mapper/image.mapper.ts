import { AccommodationImage } from "@application/accommodation/models";

import { HotelbedsImage } from "../models";

function resolveImageUrl(image: HotelbedsImage): string {
  return image.path ?? image.sizes?.[0]?.url ?? "";
}

function resolveImageText(image: HotelbedsImage): string {
  return image.description?.[0]?.content ?? image.imageType ?? image.roomType ?? "";
}

export function mapHotelbedsImage(image: HotelbedsImage, index = 0): AccommodationImage {
  const url = resolveImageUrl(image);
  const text = resolveImageText(image);

  return {
    id: url || image.imageTypeCode || String(index),
    url,
    alt: text,
    caption: text || undefined,
    order: image.order ?? image.visualOrder ?? index + 1,
  };
}

export function mapHotelbedsImages(images: ReadonlyArray<HotelbedsImage> = []): ReadonlyArray<AccommodationImage> {
  return images.map((image, index) => mapHotelbedsImage(image, index));
}