"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHotelbedsImage = mapHotelbedsImage;
exports.mapHotelbedsImages = mapHotelbedsImages;
function resolveImageUrl(image) {
    return image.path ?? image.sizes?.[0]?.url ?? "";
}
function resolveImageText(image) {
    return image.description?.[0]?.content ?? image.imageType ?? image.roomType ?? "";
}
function mapHotelbedsImage(image, index = 0) {
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
function mapHotelbedsImages(images = []) {
    return images.map((image, index) => mapHotelbedsImage(image, index));
}
//# sourceMappingURL=image.mapper.js.map