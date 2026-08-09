"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceMetadata = createInvoiceMetadata;
function createInvoiceMetadata(metadata) {
    return Object.freeze({
        createdAt: new Date(metadata.createdAt.getTime()),
        updatedAt: new Date(metadata.updatedAt.getTime()),
        version: metadata.version,
    });
}
//# sourceMappingURL=invoice-metadata.js.map