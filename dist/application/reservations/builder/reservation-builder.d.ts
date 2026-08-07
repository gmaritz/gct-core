import { Reservation } from "../aggregate";
import { ReservationBuilderContext } from "./models";
import { ReservationBuildResult } from "./models";
export interface ReservationAggregateValidationResult {
    readonly valid: boolean;
    readonly errors: ReadonlyArray<string>;
    readonly warnings: ReadonlyArray<string>;
}
export interface ReservationAggregateValidator {
    validate(reservation: Reservation): ReservationAggregateValidationResult;
}
export declare class ReservationBuilder {
    private readonly aggregateValidator;
    constructor(aggregateValidator: ReservationAggregateValidator);
    build(context: ReservationBuilderContext): ReservationBuildResult;
}
//# sourceMappingURL=reservation-builder.d.ts.map