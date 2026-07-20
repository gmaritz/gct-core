"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyPresenter = void 0;
class JourneyPresenter {
    static toJSON(dto) {
        return {
            id: dto.id,
            journeyCode: dto.journeyCode,
            travelerId: dto.travelerId,
            name: dto.name,
            description: dto.description,
            status: dto.status,
            dateRange: {
                startDate: dto.startDate.toISOString(),
                endDate: dto.endDate.toISOString(),
            },
            durationDays: this.calculateDurationDays(dto.startDate, dto.endDate),
            createdAt: dto.createdAt.toISOString(),
            updatedAt: dto.updatedAt.toISOString(),
            finalizedAt: dto.finalizedAt?.toISOString() || null,
        };
    }
    static toJSONList(dtos) {
        return dtos.map((dto) => this.toJSON(dto));
    }
    static calculateDurationDays(startDate, endDate) {
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        return Math.ceil((endDate.getTime() - startDate.getTime()) / millisecondsPerDay);
    }
}
exports.JourneyPresenter = JourneyPresenter;
//# sourceMappingURL=journey.presenter.js.map