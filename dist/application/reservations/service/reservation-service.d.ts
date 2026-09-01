import { ApplicationService } from "../../application-service";
import { Reservation } from "../aggregate";
import { ReservationBuilder, ReservationBuildResult } from "../builder";
import { ReservationPolicyPipeline } from "../policies";
import { ReservationRepository } from "../repository";
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
    private readonly repository;
    constructor(validationPipeline: ReservationValidationPipeline, policyPipeline: ReservationPolicyPipeline, builder: ReservationBuilder, repository: ReservationRepository);
    execute(request: ReservationServiceRequest): Promise<ReservationResult>;
    executeIfAbsent(request: ReservationServiceRequest): Promise<ReservationResult>;
    private executeInternal;
}
export type { ReservationBuildResult };
//# sourceMappingURL=reservation-service.d.ts.map