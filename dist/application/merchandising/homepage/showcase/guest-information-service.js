"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultGuestInformationService = void 0;
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function requiredTravellerCount(journey) {
    const occupancy = journey.accommodation[0]?.requestedOccupancy?.rooms ?? [];
    return {
        adults: occupancy.reduce((total, room) => total + room.adults, 0),
        children: occupancy.reduce((total, room) => total + room.children, 0),
    };
}
function validateInformation(journey, information) {
    const errors = [];
    const required = requiredTravellerCount(journey);
    if (!information.contact || !isValidEmail(information.contact.email)) {
        errors.push("A valid contact email is required.");
    }
    if (!Array.isArray(information.travellers)) {
        errors.push("Traveller information is required.");
        return errors;
    }
    if (information.travellers.length !== required.adults + required.children) {
        errors.push(`Exactly ${required.adults + required.children} traveller details are required.`);
    }
    const adults = information.travellers.filter((traveller) => traveller.travellerType === "ADULT").length;
    const children = information.travellers.filter((traveller) => traveller.travellerType === "CHILD").length;
    if (adults !== required.adults || children !== required.children) {
        errors.push("Traveller types do not match the selected accommodation occupancy.");
    }
    if (!Number.isInteger(information.leadTravellerIndex) || information.leadTravellerIndex < 0 || information.leadTravellerIndex >= information.travellers.length) {
        errors.push("A valid lead traveller is required.");
    }
    else if (information.travellers[information.leadTravellerIndex]?.travellerType !== "ADULT") {
        errors.push("The lead traveller must be an adult.");
    }
    information.travellers.forEach((traveller, index) => {
        if (!traveller.firstName?.trim())
            errors.push(`Traveller ${index + 1} first name is required.`);
        if (!traveller.lastName?.trim())
            errors.push(`Traveller ${index + 1} last name is required.`);
        if (!isValidEmail(traveller.email))
            errors.push(`Traveller ${index + 1} email is invalid.`);
        if (traveller.travellerType === "CHILD" && !traveller.dateOfBirth)
            errors.push(`Traveller ${index + 1} date of birth is required.`);
        if (traveller.dateOfBirth && Number.isNaN(Date.parse(traveller.dateOfBirth)))
            errors.push(`Traveller ${index + 1} date of birth is invalid.`);
    });
    return errors;
}
class DefaultGuestInformationService {
    constructor(resolver) {
        this.resolver = resolver;
    }
    async captureGuestInformation(journeyId, information) {
        const resolution = await this.resolver.resolve(journeyId);
        if (resolution.status !== "RESOLVED" || !resolution.journey) {
            return { status: resolution.status === "RESOLVED" ? "UNAVAILABLE" : resolution.status, journeyId, errors: [] };
        }
        const errors = validateInformation(resolution.journey, information);
        return {
            status: errors.length === 0 ? "VALID" : "INVALID",
            journeyId,
            journey: resolution.journey,
            information,
            errors: Object.freeze(errors),
        };
    }
}
exports.DefaultGuestInformationService = DefaultGuestInformationService;
//# sourceMappingURL=guest-information-service.js.map