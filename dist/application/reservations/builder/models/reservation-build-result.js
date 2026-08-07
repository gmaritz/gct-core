"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservationBuildResult = createReservationBuildResult;
function createReservationBuildResult(input) {
    return Object.freeze({
        successful: input.successful,
        reservation: input.reservation ?? null,
        errors: Object.freeze([...(input.errors ?? [])]),
        warnings: Object.freeze([...(input.warnings ?? [])]),
        metadata: Object.freeze({
            builtAt: new Date(input.metadata.builtAt.getTime()),
            version: input.metadata.version,
            source: input.metadata.source,
        }),
    });
}
//# sourceMappingURL=reservation-build-result.js.map