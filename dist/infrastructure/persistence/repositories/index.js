"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyPrismaRepository = exports.ReservationPrismaRepository = exports.TravellerPrismaRepository = void 0;
/**
 * Persistence Repositories Index
 *
 * Exports all persistence repository implementations.
 */
var traveller_prisma_repository_1 = require("./traveller-prisma.repository");
Object.defineProperty(exports, "TravellerPrismaRepository", { enumerable: true, get: function () { return traveller_prisma_repository_1.TravellerPrismaRepository; } });
var journey_prisma_repository_1 = require("./journey-prisma.repository");
Object.defineProperty(exports, "ReservationPrismaRepository", { enumerable: true, get: function () { return journey_prisma_repository_1.ReservationPrismaRepository; } });
var reservation_prisma_repository_1 = require("./reservation-prisma.repository");
Object.defineProperty(exports, "JourneyPrismaRepository", { enumerable: true, get: function () { return reservation_prisma_repository_1.JourneyPrismaRepository; } });
//# sourceMappingURL=index.js.map