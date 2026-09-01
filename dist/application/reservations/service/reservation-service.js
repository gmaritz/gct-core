"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationService = void 0;
const reservation_number_generator_1 = require("./reservation-number.generator");
const models_1 = require("./models");
function createReservationResult(input) {
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
function toValidationWarnings(validation) {
    const warnings = validation.warnings.map((warning) => warning.message);
    const findings = validation.integrityFindings.map((finding) => finding.message);
    return Object.freeze([...warnings, ...findings]);
}
function createPolicyContext(context, validationResult) {
    return Object.freeze({
        validationResult,
        snapshots: context.reservationRequest.snapshots,
        reservation: context.reservationRequest.reservation,
    });
}
class ReservationService {
    constructor(validationPipeline, policyPipeline, builder, repository) {
        this.validationPipeline = validationPipeline;
        this.policyPipeline = policyPipeline;
        this.builder = builder;
        this.repository = repository;
    }
    async execute(request) {
        return this.executeInternal(request, false);
    }
    async executeIfAbsent(request) {
        return this.executeInternal(request, true);
    }
    async executeInternal(request, ifAbsent) {
        const serviceContext = (0, models_1.createReservationServiceContext)(request);
        const validationResult = this.validationPipeline.execute({
            query: serviceContext.reservationRequest.query,
            snapshots: serviceContext.reservationRequest.snapshots,
            reservation: serviceContext.reservationRequest.reservation,
        });
        const validatedContext = (0, models_1.withValidationResult)(serviceContext, validationResult);
        if (!validationResult.valid) {
            return createReservationResult({
                successful: false,
                errors: validationResult.errors.map((error) => error.message),
                warnings: toValidationWarnings(validationResult),
                requestId: validatedContext.metadata.requestId,
            });
        }
        const policyResult = this.policyPipeline.evaluate(createPolicyContext(validatedContext, validationResult));
        const policyContext = (0, models_1.withPolicyResult)(validatedContext, policyResult);
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
            reservationNumber: (0, reservation_number_generator_1.generateReservationNumber)(),
        });
        const builtContext = (0, models_1.withBuilderResult)(policyContext, builderResult);
        if (builderResult.successful && builderResult.reservation) {
            const save = ifAbsent && this.repository.saveIfAbsent
                ? this.repository.saveIfAbsent.bind(this.repository)
                : this.repository.save.bind(this.repository);
            await save(builderResult.reservation, {
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
exports.ReservationService = ReservationService;
//# sourceMappingURL=reservation-service.js.map