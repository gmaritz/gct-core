import { ReservationValidationResult } from "./models";
export interface ReservationTravellerRequest {
    readonly travellerId: string;
    readonly fullName: string;
    readonly email?: string;
    readonly dateOfBirth?: Date;
}
export interface ReservationQuery {
    readonly requestId: string;
    readonly journeyId: string;
    readonly checkInDate: Date;
    readonly checkOutDate: Date;
    readonly travellers: ReadonlyArray<ReservationTravellerRequest>;
}
export declare class ReservationQueryValidator {
    validate(query: ReservationQuery | null | undefined): ReservationValidationResult;
}
//# sourceMappingURL=reservation-query-validator.d.ts.map