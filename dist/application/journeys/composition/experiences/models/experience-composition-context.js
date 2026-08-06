"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExperienceCompositionContext = createExperienceCompositionContext;
function createExperienceCompositionContext(context) {
    return Object.freeze({
        destination: context.destination,
        journeyType: context.journeyType,
        travellerProfile: Object.freeze({ ...context.travellerProfile }),
        interests: Object.freeze([...context.interests]),
        duration: Object.freeze({ ...context.duration }),
        operatingSeason: context.operatingSeason
            ? Object.freeze({
                seasons: Object.freeze([...context.operatingSeason.seasons]),
                yearRound: context.operatingSeason.yearRound,
            })
            : undefined,
        requestedAt: new Date(context.requestedAt),
    });
}
//# sourceMappingURL=experience-composition-context.js.map