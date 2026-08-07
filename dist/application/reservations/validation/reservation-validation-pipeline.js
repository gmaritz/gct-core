"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationValidationPipeline = void 0;
const models_1 = require("./models");
class ReservationValidationPipeline {
    constructor(dependencies) {
        this.dependencies = dependencies;
    }
    execute(input) {
        const queryResult = this.dependencies.queryValidator.validate(input.query);
        if (!queryResult.valid) {
            return queryResult;
        }
        const snapshotResult = this.dependencies.snapshotValidator.validate(input.snapshots);
        if (!snapshotResult.valid) {
            return snapshotResult;
        }
        if (typeof input.reservation === "undefined" || input.reservation === null) {
            return (0, models_1.createReservationValidationResult)({
                errors: [],
                warnings: [],
                integrityFindings: [],
                metadata: {
                    validatedAt: new Date(),
                    version: "1.0.0",
                    source: "ReservationValidationPipeline",
                },
            });
        }
        const integrityResult = this.dependencies.integrityValidator.validate({ reservation: input.reservation });
        return (0, models_1.createReservationValidationResult)({
            errors: [],
            warnings: [...queryResult.warnings, ...snapshotResult.warnings, ...integrityResult.warnings],
            integrityFindings: [...queryResult.integrityFindings, ...snapshotResult.integrityFindings, ...integrityResult.integrityFindings],
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "ReservationValidationPipeline",
            },
        });
    }
}
exports.ReservationValidationPipeline = ReservationValidationPipeline;
//# sourceMappingURL=reservation-validation-pipeline.js.map