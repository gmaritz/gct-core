"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAccommodationFulfilmentMode = loadAccommodationFulfilmentMode;
const accommodation_fulfilment_mode_1 = require("../application/reservations/service/accommodation-fulfilment-mode");
function loadAccommodationFulfilmentMode(env = process.env) {
    const configuredMode = env.ACCOMMODATION_FULFILMENT_MODE?.trim().toUpperCase() || accommodation_fulfilment_mode_1.AccommodationFulfilmentMode.LIVE;
    const mode = Object.values(accommodation_fulfilment_mode_1.AccommodationFulfilmentMode)
        .find((candidate) => candidate === configuredMode);
    if (!mode) {
        throw new Error("ACCOMMODATION_FULFILMENT_MODE must be LIVE or SIMULATED.");
    }
    const environment = (env.NODE_ENV ?? "development").trim().toLowerCase();
    if (mode === accommodation_fulfilment_mode_1.AccommodationFulfilmentMode.SIMULATED
        && environment !== "development"
        && environment !== "test") {
        throw new Error("SIMULATED accommodation fulfilment is only permitted in development or test.");
    }
    return mode;
}
//# sourceMappingURL=accommodation-fulfilment.config.js.map