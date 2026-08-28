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
export declare class DefaultGuestInformationService implements GuestInformationService {
    private readonly resolver;
    constructor(resolver: DynamicHomepageJourneyResolver);
    captureGuestInformation(journeyId: string, information: GuestInformationInput): Promise<GuestInformationResult>;
}
//# sourceMappingURL=guest-information-service.d.ts.map