"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservationValidationResult = createReservationValidationResult;
function createReservationValidationResult(input) {
    const errors = Object.freeze([...(input.errors ?? [])]);
    const warnings = Object.freeze([...(input.warnings ?? [])]);
    const integrityFindings = Object.freeze([...(input.integrityFindings ?? [])]);
    return Object.freeze({
        valid: errors.length === 0,
        errors,
        warnings,
        integrityFindings,
        metadata: Object.freeze({
            validatedAt: new Date(input.metadata.validatedAt.getTime()),
            version: input.metadata.version,
            source: input.metadata.source,
        }),
    });
}
//# sourceMappingURL=reservation-validation-result.js.map