"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperienceCompositionFramework = void 0;
const EMPTY_CANDIDATES = Object.freeze([]);
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function freezeExperience(experience) {
    return Object.freeze({
        experienceId: experience.experienceId,
        name: experience.name,
    });
}
function compareBySequence(left, right) {
    if (left.sequence.day !== right.sequence.day) {
        return left.sequence.day - right.sequence.day;
    }
    return left.sequence.order - right.sequence.order;
}
function toJourneyExperience(candidate) {
    if (isBlank(candidate.experienceId) || isBlank(candidate.name)) {
        return undefined;
    }
    return freezeExperience({
        experienceId: candidate.experienceId,
        name: candidate.name,
    });
}
class ExperienceCompositionFramework {
    constructor(candidateProvider = {
        resolve: () => EMPTY_CANDIDATES,
    }) {
        this.candidateProvider = candidateProvider;
    }
    async compose(context) {
        const candidates = await Promise.resolve(this.candidateProvider.resolve(context));
        const experiences = [...candidates]
            .sort(compareBySequence)
            .map(toJourneyExperience)
            .filter((experience) => typeof experience !== "undefined");
        return Object.freeze(experiences);
    }
}
exports.ExperienceCompositionFramework = ExperienceCompositionFramework;
//# sourceMappingURL=experience-composition-framework.js.map