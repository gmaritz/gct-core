"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationSnapshotValidator = void 0;
const models_1 = require("./models");
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function isValidDate(value) {
    return value instanceof Date && !Number.isNaN(value.getTime());
}
function createError(code, message) {
    return Object.freeze({ code, message });
}
class ReservationSnapshotValidator {
    validate(snapshotSet) {
        const errors = [];
        if (typeof snapshotSet !== "object" || snapshotSet === null) {
            errors.push(createError(models_1.ReservationValidationErrorCode.INVALID_SNAPSHOT, "Reservation snapshot set is required."));
            return (0, models_1.createReservationValidationResult)({
                errors,
                metadata: {
                    validatedAt: new Date(),
                    version: "1.0.0",
                    source: "ReservationSnapshotValidator",
                },
            });
        }
        if (!snapshotSet.journeySnapshot || isBlank(snapshotSet.journeySnapshot.journeyId) || isBlank(snapshotSet.journeySnapshot.snapshotId)) {
            errors.push(createError(models_1.ReservationValidationErrorCode.MISSING_JOURNEY_SNAPSHOT, "Journey snapshot is required."));
        }
        if (!Array.isArray(snapshotSet.travellerSnapshots) || snapshotSet.travellerSnapshots.length === 0) {
            errors.push(createError(models_1.ReservationValidationErrorCode.MISSING_TRAVELLER_SNAPSHOT, "At least one traveller snapshot is required."));
        }
        else if (snapshotSet.travellerSnapshots.some((traveller) => isBlank(traveller.snapshotId) || isBlank(traveller.travellerId))) {
            errors.push(createError(models_1.ReservationValidationErrorCode.INVALID_SNAPSHOT, "Traveller snapshots are invalid."));
        }
        if (snapshotSet.pricingSnapshot && (isBlank(snapshotSet.pricingSnapshot.snapshotId) || isBlank(snapshotSet.pricingSnapshot.currency))) {
            errors.push(createError(models_1.ReservationValidationErrorCode.INVALID_PRICING_SNAPSHOT, "Pricing snapshot is invalid."));
        }
        if (snapshotSet.paymentSnapshot && (isBlank(snapshotSet.paymentSnapshot.snapshotId) || isBlank(snapshotSet.paymentSnapshot.paymentStatus))) {
            errors.push(createError(models_1.ReservationValidationErrorCode.INVALID_PAYMENT_SNAPSHOT, "Payment snapshot is invalid."));
        }
        if (snapshotSet.metadata && (isBlank(snapshotSet.metadata.version) || !isValidDate(snapshotSet.metadata.createdAt) || !isValidDate(snapshotSet.metadata.updatedAt))) {
            errors.push(createError(models_1.ReservationValidationErrorCode.INVALID_METADATA, "Reservation metadata is invalid."));
        }
        return (0, models_1.createReservationValidationResult)({
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "ReservationSnapshotValidator",
            },
        });
    }
}
exports.ReservationSnapshotValidator = ReservationSnapshotValidator;
//# sourceMappingURL=reservation-snapshot-validator.js.map