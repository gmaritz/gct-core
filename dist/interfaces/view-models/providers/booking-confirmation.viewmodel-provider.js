"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingConfirmationViewModelProvider = void 0;
function messageFor(status) {
    switch (status) {
        case "CONFIRMED": return "Your booking is confirmed.";
        case "PENDING": return "Your payment or booking confirmation is still being processed.";
        case "FAILED": return "Booking confirmation was not completed.";
        case "CANCELLED": return "This booking or payment was cancelled.";
        case "INVALID": return "The booking reference is invalid.";
        case "NOT_FOUND": return "The booking could not be found.";
        default: return "Booking confirmation is currently unavailable.";
    }
}
class BookingConfirmationViewModelProvider {
    provide(result) {
        const reservation = result.reservation;
        const journey = reservation?.journeySnapshot;
        return Object.freeze({
            status: result.status,
            reservationReference: reservation?.reservationNumber,
            journeyTitle: journey?.title,
            destination: journey?.destination,
            duration: journey?.duration,
            startDate: journey?.startDate?.toISOString().slice(0, 10),
            endDate: journey?.endDate?.toISOString().slice(0, 10),
            accommodation: Object.freeze((reservation?.accommodationSnapshots ?? []).map((stay) => Object.freeze({
                property: stay.propertyName,
                room: stay.roomType,
                destination: journey?.destination,
            }))),
            leadTraveller: reservation?.travellerSnapshots[0]?.fullName,
            travellers: Object.freeze((reservation?.travellerSnapshots ?? []).map((traveller) => Object.freeze({
                name: traveller.fullName,
                travellerType: traveller.travellerType,
            }))),
            contactEmail: reservation?.travellerSnapshots[0]?.email,
            amount: reservation?.pricingSnapshot?.totalPrice,
            currency: reservation?.pricingSnapshot?.currency,
            paymentStatus: result.paymentStatus,
            reservationStatus: reservation?.status,
            fulfilmentStatus: result.fulfilmentStatus,
            message: messageFor(result.status),
            recoveryAction: Object.freeze({
                label: result.status === "CONFIRMED" ? "Return to journeys" : "Review payment",
                href: result.status === "CONFIRMED" ? "/ui/placeholder" : `/ui/journeys/${result.journeyId}/payment`,
                style: result.status === "CONFIRMED" ? "neutral" : "primary",
            }),
        });
    }
}
exports.BookingConfirmationViewModelProvider = BookingConfirmationViewModelProvider;
//# sourceMappingURL=booking-confirmation.viewmodel-provider.js.map