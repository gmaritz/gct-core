import { JourneyDuration, JourneyType, JourneyTravellerRules } from "../../models";
import { JourneyValidationResult } from "../models";
export declare enum JourneyCompositionStrategy {
    STANDARD = "STANDARD",
    CURATED = "CURATED",
    DYNAMIC = "DYNAMIC"
}
export declare enum JourneyCompositionSource {
    HOMEPAGE = "HOMEPAGE",
    PACKAGE_DESIGNER = "PACKAGE_DESIGNER",
    PACKAGE_DETAILS = "PACKAGE_DETAILS",
    ADMIN = "ADMIN",
    API = "API",
    INTERNAL = "INTERNAL"
}
export interface JourneyCompositionContext {
    readonly requestId?: string;
    readonly source?: JourneyCompositionSource | string;
    readonly timestamp?: Date;
}
export interface JourneyDestinationRequirement {
    readonly name?: string;
}
export interface JourneyDestinationRequirements {
    readonly destinations?: ReadonlyArray<JourneyDestinationRequirement>;
}
export interface JourneyStayRequirements {
    readonly duration?: JourneyDuration;
}
export interface JourneyTravellerRequirements extends JourneyTravellerRules {
}
export interface JourneyCompositionQuery {
    readonly journeyType?: JourneyType | string;
    readonly strategy?: JourneyCompositionStrategy | string;
    readonly context?: JourneyCompositionContext;
    readonly travellerRequirements?: JourneyTravellerRequirements;
    readonly destinationRequirements?: JourneyDestinationRequirements;
    readonly stayRequirements?: JourneyStayRequirements;
}
export declare class JourneyQueryValidator {
    validate(query: JourneyCompositionQuery | null | undefined): JourneyValidationResult;
}
//# sourceMappingURL=journey-query-validator.d.ts.map