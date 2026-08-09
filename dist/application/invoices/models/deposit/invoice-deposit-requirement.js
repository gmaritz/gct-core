"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceDepositRequirement = createInvoiceDepositRequirement;
function createInvoiceDepositRequirement(requirement) {
    return Object.freeze({
        type: requirement.type,
        value: requirement.value,
    });
}
//# sourceMappingURL=invoice-deposit-requirement.js.map