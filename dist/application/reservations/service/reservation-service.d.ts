import { ApplicationService } from "../../application-service";
import { Reservation } from "../aggregate";
import { ReservationBuilder, ReservationBuildResult } from "../builder";
import { ReservationPolicyPipeline } from "../policies";
import { ReservationValidationPipeline } from "../validation";
import { ReservationServiceRequest } from "./models";
export interface ReservationResultMetadata {
    readonly generatedAt: Date;
    readonly version: string;
    readonly requestId: string;
}
export interface ReservationResult {
    readonly successful: boolean;
    readonly reservation: Reservation | null;
    readonly errors: ReadonlyArray<string>;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: ReservationResultMetadata;
}
export declare class ReservationService implements ApplicationService<ReservationServiceRequest, ReservationResult> {
    private readonly validationPipeline;
    private readonly policyPipeline;
    private readonly builder;
    constructor(validationPipeline: ReservationValidationPipeline, policyPipeline: ReservationPolicyPipeline, builder: ReservationBuilder);
    execute(request: ReservationServiceRequest): Promise<ReservationResult>;
}
export type { ReservationBuildResult };
//# sourceMappingURL=reservation-service.d.ts.map