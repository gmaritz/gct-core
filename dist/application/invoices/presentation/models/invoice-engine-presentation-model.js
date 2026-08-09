"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceEnginePresentationModel = createInvoiceEnginePresentationModel;
function freezeFinancialImpact(input) {
    if (!input) {
        return undefined;
    }
    return Object.freeze({
        currency: input.currency,
        totalObligation: input.totalObligation,
        totalObligationDisplay: input.totalObligationDisplay,
        previousAmountPaid: input.previousAmountPaid,
        previousAmountPaidDisplay: input.previousAmountPaidDisplay,
        newAmountPaid: input.newAmountPaid,
        newAmountPaidDisplay: input.newAmountPaidDisplay,
        previousBalanceDue: input.previousBalanceDue,
        previousBalanceDueDisplay: input.previousBalanceDueDisplay,
        newBalanceDue: input.newBalanceDue,
        newBalanceDueDisplay: input.newBalanceDueDisplay,
        previousRefundableAmount: input.previousRefundableAmount,
        previousRefundableAmountDisplay: input.previousRefundableAmountDisplay,
        newRefundableAmount: input.newRefundableAmount,
        newRefundableAmountDisplay: input.newRefundableAmountDisplay,
    });
}
function createInvoiceEnginePresentationModel(model) {
    return Object.freeze({
        operation: model.operation,
        outcome: model.outcome,
        policyOutcome: model.policyOutcome,
        requiredActions: Object.freeze([...(model.requiredActions ?? [])]),
        warnings: Object.freeze([...(model.warnings ?? [])]),
        errors: Object.freeze([...(model.errors ?? [])]),
        financialImpact: freezeFinancialImpact(model.financialImpact),
        metadata: Object.freeze({
            completedAt: new Date(model.metadata.completedAt.getTime()),
            completedAtDisplay: model.metadata.completedAtDisplay,
            requestId: model.metadata.requestId,
            source: model.metadata.source,
            version: model.metadata.version,
            stages: Object.freeze([...(model.metadata.stages ?? [])]),
            target: model.metadata.target,
        }),
    });
}
//# sourceMappingURL=invoice-engine-presentation-model.js.map