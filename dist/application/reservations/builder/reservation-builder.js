"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationBuilder = void 0;
const aggregate_1 = require("../aggregate");
const models_1 = require("./models");
function cloneDate(value) {
    return new Date(value.getTime());
}
function cloneTimeline(timeline) {
    return Object.freeze(timeline.map((entry) => Object.freeze({
        snapshotId: entry.snapshotId,
        capturedAt: cloneDate(entry.capturedAt),
        version: entry.version,
        milestone: entry.milestone,
        occurredAt: cloneDate(entry.occurredAt),
        note: entry.note,
    })));
}
function ensurePolicyAllowed(policyResult) {
    return policyResult.permitted && policyResult.outcome !== "DENY";
}
function createComposition(context) {
    return {
        identity: Object.freeze({
            id: context.validatedRequest.requestId,
        }),
        reservationNumber: context.reservationNumber,
        status: aggregate_1.ReservationStatus.CREATED,
        journeySnapshot: context.snapshots.journeySnapshot,
        travellerSnapshots: context.snapshots.travellerSnapshots ?? Object.freeze([]),
        accommodationSnapshots: context.snapshots.accommodationSnapshots,
        pricingSnapshot: context.snapshots.pricingSnapshot,
        paymentSnapshot: context.snapshots.paymentSnapshot,
        supplierReferences: context.snapshots.supplierReferences,
        timeline: cloneTimeline(context.timelineSeed),
        metadata: Object.freeze({
            createdAt: cloneDate(context.metadata.createdAt),
            updatedAt: cloneDate(context.metadata.updatedAt),
            version: context.metadata.version,
        }),
    };
}
class ReservationBuilder {
    constructor(aggregateValidator) {
        this.aggregateValidator = aggregateValidator;
    }
    build(context) {
        if (!ensurePolicyAllowed(context.approvedPolicyResult)) {
            return (0, models_1.createReservationBuildResult)({
                successful: false,
                errors: [...context.approvedPolicyResult.errors],
                warnings: [...context.approvedPolicyResult.warnings],
                metadata: {
                    builtAt: new Date(),
                    version: "1.0.0",
                    source: "ReservationBuilder",
                },
            });
        }
        let reservation;
        try {
            reservation = aggregate_1.Reservation.create(createComposition(context));
        }
        catch (error) {
            return (0, models_1.createReservationBuildResult)({
                successful: false,
                errors: [error instanceof Error ? error.message : "Reservation construction failed."],
                warnings: [...context.approvedPolicyResult.warnings],
                metadata: {
                    builtAt: new Date(),
                    version: "1.0.0",
                    source: "ReservationBuilder",
                },
            });
        }
        const aggregateValidation = this.aggregateValidator.validate(reservation);
        if (!aggregateValidation.valid) {
            return (0, models_1.createReservationBuildResult)({
                successful: false,
                errors: [...aggregateValidation.errors],
                warnings: [...context.approvedPolicyResult.warnings, ...aggregateValidation.warnings],
                metadata: {
                    builtAt: new Date(),
                    version: "1.0.0",
                    source: "ReservationBuilder",
                },
            });
        }
        return (0, models_1.createReservationBuildResult)({
            successful: true,
            reservation,
            warnings: [...context.approvedPolicyResult.warnings, ...aggregateValidation.warnings],
            metadata: {
                builtAt: new Date(),
                version: "1.0.0",
                source: "ReservationBuilder",
            },
        });
    }
}
exports.ReservationBuilder = ReservationBuilder;
//# sourceMappingURL=reservation-builder.js.map