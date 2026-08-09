"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LifecycleReadinessValidator = void 0;
const models_1 = require("../../models");
const models_2 = require("../models");
const invoiceStatuses = new Set(Object.values(models_1.InvoiceStatus));
class LifecycleReadinessValidator {
    validate(request) {
        const errors = [];
        const status = request.invoice?.status;
        if (request.requiresExistingInvoice && !status) {
            errors.push((0, models_2.createInvoiceValidationError)({
                stage: models_2.InvoiceValidationStage.LIFECYCLE_READINESS,
                code: models_2.InvoiceValidationErrorCode.INVOICE_NOT_READY,
                message: "Invoice is not ready for lifecycle validation.",
                severity: "CRITICAL",
            }));
            return (0, models_2.createInvoiceValidationResult)({
                stage: models_2.InvoiceValidationStage.LIFECYCLE_READINESS,
                errors,
                metadata: {
                    validatedAt: new Date(),
                    version: "1.0.0",
                    source: "LifecycleReadinessValidator",
                },
            });
        }
        if (status && !invoiceStatuses.has(status)) {
            errors.push((0, models_2.createInvoiceValidationError)({
                stage: models_2.InvoiceValidationStage.LIFECYCLE_READINESS,
                code: models_2.InvoiceValidationErrorCode.INVALID_INVOICE_STATUS,
                message: "Invoice status is invalid.",
                severity: "CRITICAL",
            }));
        }
        if (request.requiresMutableState && status === models_1.InvoiceStatus.VOID) {
            errors.push((0, models_2.createInvoiceValidationError)({
                stage: models_2.InvoiceValidationStage.LIFECYCLE_READINESS,
                code: models_2.InvoiceValidationErrorCode.INVOICE_ALREADY_VOID,
                message: "Invoice is already void.",
                severity: "CRITICAL",
            }));
        }
        if (request.requiresMutableState && status === models_1.InvoiceStatus.CANCELLED) {
            errors.push((0, models_2.createInvoiceValidationError)({
                stage: models_2.InvoiceValidationStage.LIFECYCLE_READINESS,
                code: models_2.InvoiceValidationErrorCode.INVOICE_ALREADY_CANCELLED,
                message: "Invoice is already cancelled.",
                severity: "CRITICAL",
            }));
        }
        return (0, models_2.createInvoiceValidationResult)({
            stage: models_2.InvoiceValidationStage.LIFECYCLE_READINESS,
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "LifecycleReadinessValidator",
            },
        });
    }
}
exports.LifecycleReadinessValidator = LifecycleReadinessValidator;
//# sourceMappingURL=lifecycle-readiness-validator.js.map