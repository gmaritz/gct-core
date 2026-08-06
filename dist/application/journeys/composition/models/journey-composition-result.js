"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJourneyCompositionResult = createJourneyCompositionResult;
function freezeMetadata(metadata) {
    return Object.freeze({
        generatedAt: new Date(metadata.generatedAt),
        version: metadata.version,
        requestId: metadata.requestId,
    });
}
function createJourneyCompositionResult(input) {
    const warnings = input.warnings && input.warnings.length > 0
        ? Object.freeze([...input.warnings])
        : undefined;
    const errors = input.errors && input.errors.length > 0
        ? Object.freeze([...input.errors])
        : undefined;
    return Object.freeze({
        success: input.success,
        payload: input.payload,
        metadata: freezeMetadata(input.metadata),
        warnings,
        errors,
    });
}
//# sourceMappingURL=journey-composition-result.js.map