"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationSelectionViewModelProvider = void 0;
class AccommodationSelectionViewModelProvider {
    provide(journey, status) {
        const destinations = journey.destinations.map((destination) => destination.name);
        const stops = journey.accommodation.map((option, index) => {
            const rooms = option.roomOptions?.map((room) => ({
                id: room.reference.opaqueReference,
                name: room.name,
                rates: room.rateOptions.map((rate) => ({
                    id: rate.reference.opaqueReference,
                    name: rate.board?.name,
                    status: rate.status,
                    amount: rate.pricing.amount,
                    currency: rate.pricing.currency,
                })),
            })) ?? [];
            const selection = option.selection;
            const state = selection
                ? "COMPLETE"
                : rooms.length > 0 ? "NOT_SELECTED" : "NOT_SELECTED";
            return Object.freeze({
                id: option.packageStop?.stopId,
                order: option.packageStop?.stopOrder ?? index + 1,
                destination: option.packageStop ? destinations[index] ?? destinations[0] ?? "" : destinations[0] ?? "",
                checkIn: option.packageStop?.checkInDate.toISOString(),
                checkOut: option.packageStop?.checkOutDate.toISOString(),
                nights: option.packageStop ? Math.max(0, Math.round((option.packageStop.checkOutDate.getTime() - option.packageStop.checkInDate.getTime()) / 86400000)) : undefined,
                occupancy: option.requestedOccupancy?.rooms,
                properties: Object.freeze([Object.freeze({
                        id: option.accommodationId,
                        name: option.name,
                        destination: destinations[index] ?? destinations[0] ?? "",
                        category: option.accommodation?.category,
                        rating: option.accommodation?.rating.stars,
                        rooms: Object.freeze(rooms.map((room) => Object.freeze({ ...room, rates: Object.freeze(room.rates.map((rate) => Object.freeze(rate))) }))),
                    })]),
                state,
            });
        });
        const complete = stops.length > 0 && stops.every((stop) => stop.state === "COMPLETE");
        return Object.freeze({
            journeyId: journey.identity.id,
            journeyTitle: `${journey.classification.category} ${destinations[0] ?? "Journey"} Journey`,
            stops: Object.freeze(stops),
            complete,
            status,
            continuation: complete ? Object.freeze({ label: "Continue to pricing", href: "/ui/placeholder#journey-planning", style: "primary" }) : undefined,
        });
    }
}
exports.AccommodationSelectionViewModelProvider = AccommodationSelectionViewModelProvider;
//# sourceMappingURL=accommodation-selection.viewmodel-provider.js.map