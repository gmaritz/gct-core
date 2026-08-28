import { Journey } from "../../../journeys";
import { DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";

export interface GuestContactInput {
  readonly email: string;
  readonly phone?: string;
}

export interface GuestTravellerInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly travellerType: "ADULT" | "CHILD";
  readonly dateOfBirth?: string;
  readonly nationality?: string;
}

export interface GuestInformationInput {
  readonly contact: GuestContactInput;
  readonly leadTravellerIndex: number;
  readonly travellers: ReadonlyArray<GuestTravellerInput>;
}

export type GuestInformationStatus = "VALID" | "INVALID" | "NOT_FOUND" | "UNAVAILABLE";

export interface GuestInformationResult {
  readonly status: GuestInformationStatus;
  readonly journeyId: string;
  readonly journey?: Journey;
  readonly information?: GuestInformationInput;
  readonly errors: ReadonlyArray<string>;
}

export interface GuestInformationService {
  captureGuestInformation(journeyId: string, information: GuestInformationInput): Promise<GuestInformationResult>;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function requiredTravellerCount(journey: Journey): { adults: number; children: number } {
  const occupancy = journey.accommodation[0]?.requestedOccupancy?.rooms ?? [];
  return {
    adults: occupancy.reduce((total, room) => total + room.adults, 0),
    children: occupancy.reduce((total, room) => total + room.children, 0),
  };
}

function validateInformation(journey: Journey, information: GuestInformationInput): string[] {
  const errors: string[] = [];
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
  } else if (information.travellers[information.leadTravellerIndex]?.travellerType !== "ADULT") {
    errors.push("The lead traveller must be an adult.");
  }

  information.travellers.forEach((traveller, index) => {
    if (!traveller.firstName?.trim()) errors.push(`Traveller ${index + 1} first name is required.`);
    if (!traveller.lastName?.trim()) errors.push(`Traveller ${index + 1} last name is required.`);
    if (!isValidEmail(traveller.email)) errors.push(`Traveller ${index + 1} email is invalid.`);
    if (traveller.travellerType === "CHILD" && !traveller.dateOfBirth) errors.push(`Traveller ${index + 1} date of birth is required.`);
    if (traveller.dateOfBirth && Number.isNaN(Date.parse(traveller.dateOfBirth))) errors.push(`Traveller ${index + 1} date of birth is invalid.`);
  });
  return errors;
}

export class DefaultGuestInformationService implements GuestInformationService {
  public constructor(private readonly resolver: DynamicHomepageJourneyResolver) {}

  public async captureGuestInformation(journeyId: string, information: GuestInformationInput): Promise<GuestInformationResult> {
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