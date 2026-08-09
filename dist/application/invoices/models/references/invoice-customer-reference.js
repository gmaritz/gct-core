"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceCustomerReference = createInvoiceCustomerReference;
function createInvoiceCustomerReference(reference) {
    return Object.freeze({
        customerId: reference.customerId,
        travellerId: reference.travellerId,
    });
}
//# sourceMappingURL=invoice-customer-reference.js.map