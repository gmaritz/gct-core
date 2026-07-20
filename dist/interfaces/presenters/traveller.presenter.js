"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravellerPresenter = void 0;
class TravellerPresenter {
    static toJSON(dto) {
        return {
            id: dto.id,
            firstName: dto.firstName,
            lastName: dto.lastName,
            fullName: `${dto.firstName} ${dto.lastName}`,
            email: dto.email,
            preferences: dto.preferences,
            createdAt: dto.createdAt.toISOString(),
            updatedAt: dto.updatedAt.toISOString(),
        };
    }
    static toJSONList(dtos) {
        return dtos.map((dto) => this.toJSON(dto));
    }
}
exports.TravellerPresenter = TravellerPresenter;
//# sourceMappingURL=traveller.presenter.js.map