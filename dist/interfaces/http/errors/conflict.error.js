"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = void 0;
const api_error_1 = require("./api-error");
class ConflictError extends api_error_1.ApiError {
    constructor(detail = "The request could not be completed due to a conflict") {
        super(409, "Conflict", detail, "https://gct-core.dev/errors/conflict");
    }
}
exports.ConflictError = ConflictError;
//# sourceMappingURL=conflict.error.js.map