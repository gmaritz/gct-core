import { Reservation } from "../aggregate";
import { ReservationValidationResult } from "./models";
export interface CommercialIntegrityInput {
    readonly reservation: Reservation;
}
export declare class CommercialIntegrityValidator {
    validate(input: CommercialIntegrityInput | null | undefined): ReservationValidationResult;
}
//# sourceMappingURL=commercial-integrity-validator.d.ts.map