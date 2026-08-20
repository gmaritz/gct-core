import { AccommodationAvailabilityResult, AccommodationAvailabilityService, AccommodationSearchQuery, HotelbedsTransport } from "../../application/accommodation";
export type LiveVerificationStatus = "DISABLED" | "COMPLETED";
export interface LiveVerificationOutcome {
    readonly status: LiveVerificationStatus;
    readonly result?: AccommodationAvailabilityResult;
    readonly report?: LiveVerificationReport;
}
export interface LiveVerificationConfiguration {
    readonly hotelCodes: ReadonlyArray<string>;
    readonly checkInDate: Date;
    readonly checkOutDate: Date;
    readonly adults: number;
    readonly children: number;
    readonly childAges: ReadonlyArray<number>;
    readonly sourceMarket: string;
}
export interface LiveVerificationReport {
    readonly executionTimestamp: Date;
    readonly configuredHotelCount: number;
    readonly resolvedCandidateCount: number;
    readonly supplierRequestCount: number;
    readonly supplierExecutionStatus: "COMPLETED";
    readonly provider: string;
    readonly available: boolean;
    readonly success: boolean;
}
export interface LiveVerificationObservation {
    resolvedCandidateCount: number;
    supplierRequestCount: number;
}
export interface LiveVerificationDependencies {
    readonly createService?: (hotelCodes: ReadonlyArray<string>, observation: LiveVerificationObservation) => AccommodationAvailabilityService;
    readonly validateSupplierConfiguration?: (environment: NodeJS.ProcessEnv) => void;
}
export declare function loadR8DotEnv(environment?: NodeJS.ProcessEnv): NodeJS.ProcessEnv;
export declare function resolveR8Path(value: string): string;
export declare function createR8EffectiveEnvironment(environment: NodeJS.ProcessEnv): NodeJS.ProcessEnv;
export declare function parseLiveVerificationFlag(value: string | undefined): boolean;
export declare function parseLiveVerificationConfiguration(environment: NodeJS.ProcessEnv): LiveVerificationConfiguration;
export declare function createAvailabilityQuery(configuration: LiveVerificationConfiguration): AccommodationSearchQuery;
export declare function createLiveAvailabilityService(hotelCodes: ReadonlyArray<string>, observation?: LiveVerificationObservation, effectiveEnvironment?: NodeJS.ProcessEnv, transport?: HotelbedsTransport): AccommodationAvailabilityService;
export declare function runLiveVerification(environment?: NodeJS.ProcessEnv, dependencies?: LiveVerificationDependencies): Promise<LiveVerificationOutcome>;
//# sourceMappingURL=availability-live-verification.d.ts.map