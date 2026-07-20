"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidJourneyException = exports.JourneyNotFoundException = exports.ReservationCannotBeCancelledException = exports.InvalidReservationException = exports.ReservationNotFoundException = exports.InvalidTravellerException = exports.TravellerNotFoundException = void 0;
/**
 * Domain Exceptions Index
 *
 * Exports all domain exceptions.
 */
var traveller_exception_1 = require("./traveller.exception");
Object.defineProperty(exports, "TravellerNotFoundException", { enumerable: true, get: function () { return traveller_exception_1.TravellerNotFoundException; } });
Object.defineProperty(exports, "InvalidTravellerException", { enumerable: true, get: function () { return traveller_exception_1.InvalidTravellerException; } });
var reservation_exception_1 = require("./reservation.exception");
Object.defineProperty(exports, "ReservationNotFoundException", { enumerable: true, get: function () { return reservation_exception_1.ReservationNotFoundException; } });
Object.defineProperty(exports, "InvalidReservationException", { enumerable: true, get: function () { return reservation_exception_1.InvalidReservationException; } });
Object.defineProperty(exports, "ReservationCannotBeCancelledException", { enumerable: true, get: function () { return reservation_exception_1.ReservationCannotBeCancelledException; } });
var journey_exception_1 = require("./journey.exception");
Object.defineProperty(exports, "JourneyNotFoundException", { enumerable: true, get: function () { return journey_exception_1.JourneyNotFoundException; } });
Object.defineProperty(exports, "InvalidJourneyException", { enumerable: true, get: function () { return journey_exception_1.InvalidJourneyException; } });
//# sourceMappingURL=index.js.map