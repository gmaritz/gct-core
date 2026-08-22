import { ApplicationService } from "../../application-service";
import { Reservation } from "../aggregate";
import { ReservationBuilder, ReservationBuildResult } from "../builder";
import { ReservationPolicyContext, ReservationPolicyPipeline } from "../policies";
import { ReservationRepository } from "../repository";
import { ReservationValidationPipeline, ReservationValidationResult } from "../validation";
import { generateReservationNumber } from "./reservation-number.generator";
import {
  createReservationServiceContext,
  ReservationServiceContext,
  ReservationServiceRequest,
  withBuilderResult,
  withPolicyResult,
  withValidationResult,
} from "./models";

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

function createReservationResult(input: {
  readonly successful: boolean;
  readonly reservation?: Reservation | null;
  readonly errors?: ReadonlyArray<string>;
  readonly warnings?: ReadonlyArray<string>;
  readonly requestId: string;
}): ReservationResult {
  return Object.freeze({
    successful: input.successful,
    reservation: input.reservation ?? null,
    errors: Object.freeze([...(input.errors ?? [])]),
    warnings: Object.freeze([...(input.warnings ?? [])]),
    metadata: Object.freeze({
      generatedAt: new Date(),
      version: "1.0.0",
      requestId: input.requestId,
    }),
  });
}

function toValidationWarnings(validation: ReservationValidationResult): ReadonlyArray<string> {
  const warnings = validation.warnings.map((warning) => warning.message);
  const findings = validation.integrityFindings.map((finding) => finding.message);
  return Object.freeze([...warnings, ...findings]);
}

function createPolicyContext(
  context: ReservationServiceContext,
  validationResult: ReservationValidationResult,
): ReservationPolicyContext {
  return Object.freeze({
    validationResult,
    snapshots: context.reservationRequest.snapshots,
    reservation: context.reservationRequest.reservation,
  });
}

export class ReservationService
  implements ApplicationService<ReservationServiceRequest, ReservationResult>
{
  public constructor(
    private readonly validationPipeline: ReservationValidationPipeline,
    private readonly policyPipeline: ReservationPolicyPipeline,
    private readonly builder: ReservationBuilder,
    private readonly repository: ReservationRepository,
  ) {}

  public async execute(request: ReservationServiceRequest): Promise<ReservationResult> {
    const serviceContext = createReservationServiceContext(request);

    const validationResult = this.validationPipeline.execute({
      query: serviceContext.reservationRequest.query,
      snapshots: serviceContext.reservationRequest.snapshots,
      reservation: serviceContext.reservationRequest.reservation,
    });

    const validatedContext = withValidationResult(serviceContext, validationResult);

    if (!validationResult.valid) {
      return createReservationResult({
        successful: false,
        errors: validationResult.errors.map((error) => error.message),
        warnings: toValidationWarnings(validationResult),
        requestId: validatedContext.metadata.requestId,
      });
    }

    const policyResult = this.policyPipeline.evaluate(createPolicyContext(validatedContext, validationResult));
    const policyContext = withPolicyResult(validatedContext, policyResult);

    if (!policyResult.permitted) {
      return createReservationResult({
        successful: false,
        errors: policyResult.errors,
        warnings: [...policyResult.warnings, ...policyResult.observations],
        requestId: policyContext.metadata.requestId,
      });
    }

    const builderResult = this.builder.build({
      validatedRequest: policyContext.reservationRequest.query,
      snapshots: policyContext.reservationRequest.snapshots,
      approvedPolicyResult: policyResult,
      metadata: policyContext.reservationRequest.metadata,
      timelineSeed: policyContext.reservationRequest.timelineSeed,
      reservation: policyContext.reservationRequest.reservation,
      reservationNumber: generateReservationNumber(),
    });

    const builtContext = withBuilderResult(policyContext, builderResult);

    if (builderResult.successful && builderResult.reservation) {
      await this.repository.save(builderResult.reservation, {
        customerId: policyContext.reservationRequest.query.customerId,
        bookingStartDate: policyContext.reservationRequest.query.checkInDate,
        bookingEndDate: policyContext.reservationRequest.query.checkOutDate,
      });
    }

    return createReservationResult({
      successful: builderResult.successful,
      reservation: builderResult.reservation,
      errors: builderResult.errors,
      warnings: builderResult.warnings,
      requestId: builtContext.metadata.requestId,
    });
  }
}

export type { ReservationBuildResult };
