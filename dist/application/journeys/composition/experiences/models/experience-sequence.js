"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExperienceSequence = createExperienceSequence;
function createExperienceSequence(sequence) {
    return Object.freeze({
        day: sequence.day,
        order: sequence.order,
        itineraryLabel: sequence.itineraryLabel,
    });
}
//# sourceMappingURL=experience-sequence.js.map