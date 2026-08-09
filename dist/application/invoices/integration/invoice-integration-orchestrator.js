"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceIntegrationOrchestrator = void 0;
const invoice_integration_mapper_1 = require("./invoice-integration-mapper");
const models_1 = require("./models");
function resolveOperation(gateway, context) {
    switch (context.operation) {
        case models_1.InvoiceIntegrationOperation.CREATE_SYNC:
            return gateway.createInvoice(context);
        case models_1.InvoiceIntegrationOperation.UPDATE_SYNC:
            return gateway.updateInvoice(context);
        case models_1.InvoiceIntegrationOperation.CANCEL_SYNC:
            return gateway.cancelInvoice(context);
        case models_1.InvoiceIntegrationOperation.VOID_SYNC:
            return gateway.voidInvoice(context);
        default:
            return Promise.resolve({
                success: false,
                providerIdentifier: context.providerSelection.providerId,
                integrationStatus: models_1.InvoiceIntegrationStatus.REJECTED,
                errors: [
                    (0, models_1.createInvoiceIntegrationError)({
                        code: models_1.InvoiceIntegrationErrorCode.VALIDATION_ERROR,
                        message: `Unsupported invoice integration operation '${context.operation}'.`,
                        retryable: false,
                    }),
                ],
            });
    }
}
function asProviderError(error) {
    if (error instanceof Error) {
        return {
            code: error.name,
            message: error.message,
        };
    }
    if (typeof error === "object" && error !== null) {
        const candidate = error;
        return {
            code: candidate.code,
            message: candidate.message,
            retryable: candidate.retryable,
        };
    }
    return {
        code: "UNKNOWN_EXTERNAL_ERROR",
        message: "Unknown external provider error.",
    };
}
function classifyProviderError(error) {
    const providerError = asProviderError(error);
    const providerCode = providerError.code?.toUpperCase() ?? "UNKNOWN_EXTERNAL_ERROR";
    const byCode = {
        CONFIGURATION_ERROR: { code: models_1.InvoiceIntegrationErrorCode.CONFIGURATION_ERROR, retryable: false },
        AUTHENTICATION_ERROR: { code: models_1.InvoiceIntegrationErrorCode.AUTHENTICATION_ERROR, retryable: false },
        VALIDATION_ERROR: { code: models_1.InvoiceIntegrationErrorCode.VALIDATION_ERROR, retryable: false },
        PROVIDER_REJECTION: { code: models_1.InvoiceIntegrationErrorCode.PROVIDER_REJECTION, retryable: false },
        NETWORK_ERROR: { code: models_1.InvoiceIntegrationErrorCode.NETWORK_ERROR, retryable: true },
        TIMEOUT: { code: models_1.InvoiceIntegrationErrorCode.TIMEOUT, retryable: true },
        RATE_LIMITED: { code: models_1.InvoiceIntegrationErrorCode.RATE_LIMITED, retryable: true },
        DUPLICATE_REQUEST: { code: models_1.InvoiceIntegrationErrorCode.DUPLICATE_REQUEST, retryable: false },
        UNKNOWN_EXTERNAL_ERROR: { code: models_1.InvoiceIntegrationErrorCode.UNKNOWN_EXTERNAL_ERROR, retryable: false },
        ECONNRESET: { code: models_1.InvoiceIntegrationErrorCode.NETWORK_ERROR, retryable: true },
        ETIMEDOUT: { code: models_1.InvoiceIntegrationErrorCode.TIMEOUT, retryable: true },
        ENOTFOUND: { code: models_1.InvoiceIntegrationErrorCode.NETWORK_ERROR, retryable: true },
        UNAUTHORIZED: { code: models_1.InvoiceIntegrationErrorCode.AUTHENTICATION_ERROR, retryable: false },
        RATE_LIMIT: { code: models_1.InvoiceIntegrationErrorCode.RATE_LIMITED, retryable: true },
        ALREADY_EXISTS: { code: models_1.InvoiceIntegrationErrorCode.DUPLICATE_REQUEST, retryable: false },
    };
    const selected = byCode[providerCode] ?? {
        code: models_1.InvoiceIntegrationErrorCode.UNKNOWN_EXTERNAL_ERROR,
        retryable: false,
    };
    return (0, models_1.createInvoiceIntegrationError)({
        code: selected.code,
        message: providerError.message ?? "External provider call failed.",
        retryable: typeof providerError.retryable === "boolean" ? providerError.retryable : selected.retryable,
        providerCode,
    });
}
function resolveIntegrationStatus(success, retryable, responseStatus) {
    if (responseStatus) {
        return responseStatus;
    }
    if (success) {
        return models_1.InvoiceIntegrationStatus.SUCCESS;
    }
    return retryable ? models_1.InvoiceIntegrationStatus.RETRYABLE_FAILURE : models_1.InvoiceIntegrationStatus.FAILED;
}
class InvoiceIntegrationOrchestrator {
    constructor(gateway, mapper = new invoice_integration_mapper_1.InvoiceIntegrationMapper()) {
        this.gateway = gateway;
        this.mapper = mapper;
    }
    async execute(request) {
        const externalRequest = this.mapper.mapInvoice(request.invoice, request.operation);
        const context = (0, models_1.createInvoiceIntegrationContext)(request, externalRequest);
        try {
            const response = await resolveOperation(this.gateway, context);
            const responseErrors = (response.errors ?? []).map(models_1.createInvoiceIntegrationError);
            const duplicateError = responseErrors.some((error) => error.code === models_1.InvoiceIntegrationErrorCode.DUPLICATE_REQUEST);
            const recoveredExternalReference = response.externalReference ?? context.existingExternalReference;
            const duplicateRecovered = duplicateError && Boolean(recoveredExternalReference);
            const retryable = response.retryable ?? responseErrors.some((error) => error.retryable) ?? false;
            const success = duplicateRecovered ? true : response.success;
            const integrationStatus = duplicateRecovered
                ? models_1.InvoiceIntegrationStatus.SUCCESS
                : resolveIntegrationStatus(success, retryable, response.integrationStatus);
            return (0, models_1.createInvoiceIntegrationResult)({
                success,
                operation: context.operation,
                providerIdentifier: response.providerIdentifier || context.providerSelection.providerId,
                integrationStatus,
                externalReference: recoveredExternalReference,
                idempotencyKey: context.idempotencyKey,
                retryable,
                errors: responseErrors,
                warnings: duplicateRecovered
                    ? [...(response.warnings ?? []), "Duplicate request matched existing external reference."]
                    : response.warnings,
                metadata: {
                    completedAt: new Date(),
                    version: "1.0.0",
                    requestId: context.correlation.requestId,
                    correlationId: context.correlation.correlationId,
                    source: context.metadata.source,
                },
            });
        }
        catch (error) {
            const mappedError = classifyProviderError(error);
            const retryable = mappedError.retryable;
            return (0, models_1.createInvoiceIntegrationResult)({
                success: false,
                operation: context.operation,
                providerIdentifier: context.providerSelection.providerId,
                integrationStatus: retryable
                    ? models_1.InvoiceIntegrationStatus.RETRYABLE_FAILURE
                    : models_1.InvoiceIntegrationStatus.FAILED,
                externalReference: context.existingExternalReference,
                idempotencyKey: context.idempotencyKey,
                retryable,
                errors: [mappedError],
                warnings: [],
                metadata: {
                    completedAt: new Date(),
                    version: "1.0.0",
                    requestId: context.correlation.requestId,
                    correlationId: context.correlation.correlationId,
                    source: context.metadata.source,
                },
            });
        }
    }
}
exports.InvoiceIntegrationOrchestrator = InvoiceIntegrationOrchestrator;
//# sourceMappingURL=invoice-integration-orchestrator.js.map