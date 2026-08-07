import { Reservation } from "../../aggregate";
export interface ReservationBuildResultMetadata {
    readonly builtAt: Date;
    readonly version: string;
    readonly source: string;
}
export interface ReservationBuildResult {
    readonly successful: boolean;
    readonly reservation: Reservation | null;
    readonly errors: ReadonlyArray<string>;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: ReservationBuildResultMetadata;
}
export declare function createReservationBuildResult(input: {
    readonly successful: boolean;
    readonly reservation?: Reservation | null;
    readonly errors?: ReadonlyArray<string>;
    readonly warnings?: ReadonlyArray<string>;
    readonly metadata: ReservationBuildResultMetadata;
}): ReservationBuildResult;
//# sourceMappingURL=reservation-build-result.d.ts.map