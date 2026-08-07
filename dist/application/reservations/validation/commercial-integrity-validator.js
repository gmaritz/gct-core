"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommercialIntegrityValidator = void 0;
const aggregate_1 = require("../aggregate");
const models_1 = require("./models");
function createFinding(code, message) {
    return Object.freeze({ code, message });
}
class CommercialIntegrityValidator {
    validate(input) {
        const findings = [];
        if (typeof input !== "object" || input === null) {
            findings.push(createFinding("INVALID_INPUT", "Reservation input is required."));
            return (0, models_1.createReservationValidationResult)({
                integrityFindings: findings,
                metadata: {
                    validatedAt: new Date(),
                    version: "1.0.0",
                    source: "CommercialIntegrityValidator",
                },
            });
        }
        const reservation = input.reservation;
        const pricingSnapshot = reservation.pricingSnapshot;
        const paymentSnapshot = reservation.paymentSnapshot;
        if (pricingSnapshot && pricingSnapshot.totalPrice < 0) {
            findings.push(createFinding("INCONSISTENT_PRICING", "Pricing snapshot contains an inconsistent total price."));
        }
        if (paymentSnapshot && reservation.status === aggregate_1.ReservationStatus.CONFIRMED && paymentSnapshot.balanceOutstanding > 0) {
            findings.push(createFinding("PAYMENT_INCOMPATIBLE", "Confirmed reservations should not have an outstanding balance."));
        }
        if (reservation.supplierReferences.length === 0) {
            findings.push(createFinding("MISSING_SUPPLIER_REFERENCE", "Reservation is missing supplier references."));
        }
        if (reservation.travellerSnapshots.length === 0) {
            findings.push(createFinding("TRAVELLER_MISMATCH", "Reservation traveller snapshots are missing."));
        }
        return (0, models_1.createReservationValidationResult)({
            integrityFindings: findings,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "CommercialIntegrityValidator",
            },
        });
    }
}
exports.CommercialIntegrityValidator = CommercialIntegrityValidator;
//# sourceMappingURL=commercial-integrity-validator.js.map