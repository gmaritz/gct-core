"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Journey = void 0;
function freezeDate(date) {
    return new Date(date.getTime());
}
function freezeIdentity(identity) {
    return Object.freeze({ ...identity });
}
function freezeClassification(classification) {
    return Object.freeze({ ...classification });
}
function freezeMetadata(metadata) {
    return Object.freeze({
        created: freezeDate(metadata.created),
        modified: freezeDate(metadata.modified),
        version: metadata.version,
        source: metadata.source,
    });
}
function freezeDuration(duration) {
    return Object.freeze({ ...duration });
}
function freezeDestinations(destinations) {
    return Object.freeze(destinations.map((destination) => Object.freeze({ ...destination })));
}
function freezeAccommodation(accommodation) {
    return Object.freeze(accommodation.map((stay) => Object.freeze({ ...stay })));
}
function freezeExperiences(experiences) {
    return Object.freeze(experiences.map((experience) => Object.freeze({ ...experience })));
}
function freezeTravellerRules(rules) {
    return Object.freeze({ ...rules });
}
function freezeTags(tags) {
    return Object.freeze(tags.map((tag) => Object.freeze({ ...tag })));
}
class Journey {
    constructor(composition) {
        this.identity = freezeIdentity(composition.identity);
        this.classification = freezeClassification(composition.classification);
        this.metadata = freezeMetadata(composition.metadata);
        this.status = composition.status;
        this.lifecycle = composition.lifecycle;
        this.duration = freezeDuration(composition.duration);
        this.destinations = freezeDestinations(composition.destinations);
        this.accommodation = freezeAccommodation(composition.accommodation);
        this.experiences = freezeExperiences(composition.experiences);
        this.travellerRules = freezeTravellerRules(composition.travellerRules);
        this.tags = freezeTags(composition.tags);
        Object.freeze(this);
    }
    static create(composition) {
        return new Journey(composition);
    }
    static restore(composition) {
        return new Journey(composition);
    }
}
exports.Journey = Journey;
//# sourceMappingURL=journey.js.map