"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoicePolicyContext = createInvoicePolicyContext;
function createInvoicePolicyContext(context) {
    return Object.freeze({
        operation: context.operation,
        validationResult: context.validationResult,
        invoice: context.invoice,
        reviewRequirements: context.reviewRequirements
            ? Object.freeze({
                paymentReviewRequired: context.reviewRequirements.paymentReviewRequired,
                cancellationReviewRequired: context.reviewRequirements.cancellationReviewRequired,
                accountingReviewRequired: context.reviewRequirements.accountingReviewRequired,
            })
            : undefined,
    });
}
//# sourceMappingURL=invoice-policy-context.js.map