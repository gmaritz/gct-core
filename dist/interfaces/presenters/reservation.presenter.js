"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationPresenter = void 0;
class ReservationPresenter {
    static toJSON(dto) {
        return {
            id: dto.id,
            reservationNumber: dto.reservationNumber,
            travelerId: dto.travelerId,
            journeyId: dto.journeyId,
            status: dto.status,
            totalPrice: {
                amount: dto.totalPrice.amount,
                currency: dto.totalPrice.currency,
                formatted: `${dto.totalPrice.currency} ${(dto.totalPrice.amount / 100).toFixed(2)}`,
            },
            createdAt: dto.createdAt.toISOString(),
            confirmedAt: dto.confirmedAt?.toISOString() || null,
            cancelledAt: dto.cancelledAt?.toISOString() || null,
        };
    }
    static toJSONList(dtos) {
        return dtos.map((dto) => this.toJSON(dto));
    }
}
exports.ReservationPresenter = ReservationPresenter;
//# sourceMappingURL=reservation.presenter.js.map