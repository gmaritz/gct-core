import { ApplicationService } from "../../application-service";
import {
  InvoiceAccountingGateway,
  InvoiceAccountingGatewayResponse,
} from "./invoice-accounting-gateway";
import { InvoiceIntegrationMapper } from "./invoice-integration-mapper";
import {
  createInvoiceIntegrationContext,
  createInvoiceIntegrationError,
  createInvoiceIntegrationResult,
  InvoiceIntegrationContext,
  InvoiceIntegrationError,
  InvoiceIntegrationErrorCode,
  InvoiceIntegrationOperation,
  InvoiceIntegrationRequest,
  InvoiceIntegrationResult,
  InvoiceIntegrationStatus,
} from "./models";

interface ProviderErrorLike {
  readonly code?: string;
  readonly message?: string;
  readonly retryable?: boolean;
}

function resolveOperation(
  gateway: InvoiceAccountingGateway,
  context: InvoiceIntegrationContext,
): Promise<InvoiceAccountingGatewayResponse> {
  switch (context.operation) {
    case InvoiceIntegrationOperation.CREATE_SYNC:
      return gateway.createInvoice(context);
    case InvoiceIntegrationOperation.UPDATE_SYNC:
      return gateway.updateInvoice(context);
    case InvoiceIntegrationOperation.CANCEL_SYNC:
      return gateway.cancelInvoice(context);
    case InvoiceIntegrationOperation.VOID_SYNC:
      return gateway.voidInvoice(context);
    default:
      return Promise.resolve({
        success: false,
        providerIdentifier: context.providerSelection.providerId,
        integrationStatus: InvoiceIntegrationStatus.REJECTED,
        errors: [
          createInvoiceIntegrationError({
            code: InvoiceIntegrationErrorCode.VALIDATION_ERROR,
            message: `Unsupported invoice integration operation '${context.operation}'.`,
            retryable: false,
          }),
        ],
      });
  }
}

function asProviderError(error: unknown): ProviderErrorLike {
  if (error instanceof Error) {
    return {
      code: error.name,
      message: error.message,
    };
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as Partial<ProviderErrorLike>;
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

function classifyProviderError(error: unknown): InvoiceIntegrationError {
  const providerError = asProviderError(error);
  const providerCode = providerError.code?.toUpperCase() ?? "UNKNOWN_EXTERNAL_ERROR";

  const byCode: Record<string, { readonly code: InvoiceIntegrationErrorCode; readonly retryable: boolean }> = {
    CONFIGURATION_ERROR: { code: InvoiceIntegrationErrorCode.CONFIGURATION_ERROR, retryable: false },
    AUTHENTICATION_ERROR: { code: InvoiceIntegrationErrorCode.AUTHENTICATION_ERROR, retryable: false },
    VALIDATION_ERROR: { code: InvoiceIntegrationErrorCode.VALIDATION_ERROR, retryable: false },
    PROVIDER_REJECTION: { code: InvoiceIntegrationErrorCode.PROVIDER_REJECTION, retryable: false },
    NETWORK_ERROR: { code: InvoiceIntegrationErrorCode.NETWORK_ERROR, retryable: true },
    TIMEOUT: { code: InvoiceIntegrationErrorCode.TIMEOUT, retryable: true },
    RATE_LIMITED: { code: InvoiceIntegrationErrorCode.RATE_LIMITED, retryable: true },
    DUPLICATE_REQUEST: { code: InvoiceIntegrationErrorCode.DUPLICATE_REQUEST, retryable: false },
    UNKNOWN_EXTERNAL_ERROR: { code: InvoiceIntegrationErrorCode.UNKNOWN_EXTERNAL_ERROR, retryable: false },
    ECONNRESET: { code: InvoiceIntegrationErrorCode.NETWORK_ERROR, retryable: true },
    ETIMEDOUT: { code: InvoiceIntegrationErrorCode.TIMEOUT, retryable: true },
    ENOTFOUND: { code: InvoiceIntegrationErrorCode.NETWORK_ERROR, retryable: true },
    UNAUTHORIZED: { code: InvoiceIntegrationErrorCode.AUTHENTICATION_ERROR, retryable: false },
    RATE_LIMIT: { code: InvoiceIntegrationErrorCode.RATE_LIMITED, retryable: true },
    ALREADY_EXISTS: { code: InvoiceIntegrationErrorCode.DUPLICATE_REQUEST, retryable: false },
  };

  const selected = byCode[providerCode] ?? {
    code: InvoiceIntegrationErrorCode.UNKNOWN_EXTERNAL_ERROR,
    retryable: false,
  };

  return createInvoiceIntegrationError({
    code: selected.code,
    message: providerError.message ?? "External provider call failed.",
    retryable: typeof providerError.retryable === "boolean" ? providerError.retryable : selected.retryable,
    providerCode,
  });
}

function resolveIntegrationStatus(
  success: boolean,
  retryable: boolean,
  responseStatus: InvoiceIntegrationStatus | undefined,
): InvoiceIntegrationStatus {
  if (responseStatus) {
    return responseStatus;
  }

  if (success) {
    return InvoiceIntegrationStatus.SUCCESS;
  }

  return retryable ? InvoiceIntegrationStatus.RETRYABLE_FAILURE : InvoiceIntegrationStatus.FAILED;
}

export class InvoiceIntegrationOrchestrator
  implements ApplicationService<InvoiceIntegrationRequest, InvoiceIntegrationResult>
{
  public constructor(
    private readonly gateway: InvoiceAccountingGateway,
    private readonly mapper: InvoiceIntegrationMapper = new InvoiceIntegrationMapper(),
  ) {}

  public async execute(request: InvoiceIntegrationRequest): Promise<InvoiceIntegrationResult> {
    const externalRequest = this.mapper.mapInvoice(request.invoice, request.operation);
    const context = createInvoiceIntegrationContext(request, externalRequest);

    try {
      const response = await resolveOperation(this.gateway, context);
      const responseErrors = (response.errors ?? []).map(createInvoiceIntegrationError);
      const duplicateError = responseErrors.some((error) => error.code === InvoiceIntegrationErrorCode.DUPLICATE_REQUEST);
      const recoveredExternalReference = response.externalReference ?? context.existingExternalReference;
      const duplicateRecovered = duplicateError && Boolean(recoveredExternalReference);
      const retryable =
        response.retryable ?? responseErrors.some((error) => error.retryable) ?? false;
      const success = duplicateRecovered ? true : response.success;
      const integrationStatus = duplicateRecovered
        ? InvoiceIntegrationStatus.SUCCESS
        : resolveIntegrationStatus(success, retryable, response.integrationStatus);

      return createInvoiceIntegrationResult({
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
    } catch (error) {
      const mappedError = classifyProviderError(error);
      const retryable = mappedError.retryable;

      return createInvoiceIntegrationResult({
        success: false,
        operation: context.operation,
        providerIdentifier: context.providerSelection.providerId,
        integrationStatus: retryable
          ? InvoiceIntegrationStatus.RETRYABLE_FAILURE
          : InvoiceIntegrationStatus.FAILED,
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
