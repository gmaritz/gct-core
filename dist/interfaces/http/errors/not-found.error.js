"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const api_error_1 = require("./api-error");
class NotFoundError extends api_error_1.ApiError {
    constructor(detail = "The requested resource was not found") {
        super(404, "Not Found", detail, "https://gct-core.dev/errors/not-found");
    }
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=not-found.error.js.map